/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { config } from '@/config/config'
import {
  X, MapPin, Calendar, Send, MessageCircle,
  ArrowRight, ArrowLeft, Check, Home, Building2,
  Phone, Plus, Minus, Mic, MicOff, ChevronDown, ChevronUp,
  Loader2, Truck, ParkingSquare, Factory, Store, Church, Building
} from 'lucide-react'

declare global {
  interface Window {
    google: any
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

// ============================================
// STEP DEFINITIONS
// ============================================
const STEPS = {
  WELCOME: 'welcome',
  SERVICE: 'service',
  PROJECT_TYPE: 'project_type',
  ADDRESS: 'address',
  MAP_DRAW: 'map_draw',
  CONDITION: 'condition',
  DATE: 'date',
  CONTACT: 'contact',
  SUMMARY: 'summary',
  COMPLETE: 'complete',
}

// Icon mapping
const projectIcons: Record<string, any> = {
  'driveway': Home,
  'parking-lot': ParkingSquare,
  'church': Church,
  'apartment': Building,
  'retail': Store,
  'industrial': Factory,
}

interface Message {
  id: number
  type: 'bot' | 'user'
  text: string
  component?: string
  data?: any
}

interface BookingData {
  service: string
  serviceName: string
  projectType: string
  projectTypeName: string
  address: string
  squareFootage: number
  condition: string
  estimateLow: number
  estimateHigh: number
  selectedDate: Date | null
  customerName: string
  customerPhone: string
  customerEmail: string
  addOns: Record<string, number>
  notes: string
}

interface PavingChatbotProps {
  onClose?: () => void
}

export default function PavingChatbot({ onClose }: PavingChatbotProps) {
  // ============================================
  // STATE
  // ============================================
  const [step, setStep] = useState(STEPS.WELCOME)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [inputPlaceholder, setInputPlaceholder] = useState('Type a message...')
  const [isTyping, setIsTyping] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [mapReady, setMapReady] = useState(false)
  const [drawnArea, setDrawnArea] = useState<number | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [showAddOns, setShowAddOns] = useState(false)
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)

  const [bookingData, setBookingData] = useState<BookingData>({
    service: '',
    serviceName: '',
    projectType: '',
    projectTypeName: '',
    address: '',
    squareFootage: 0,
    condition: '',
    estimateLow: 0,
    estimateHigh: 0,
    selectedDate: null,
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    addOns: {},
    notes: '',
  })

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const drawingManagerRef = useRef<any>(null)
  const polygonRef = useRef<any>(null)
  const recognitionRef = useRef<any>(null)

  // ============================================
  // HELPERS
  // ============================================
  const scrollToBottom = useCallback(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }, [])

  useEffect(() => { scrollToBottom() }, [messages, scrollToBottom])

  const addBotMessage = useCallback(async (text: string, component?: string, data?: any) => {
    setIsTyping(true)
    await new Promise(resolve => setTimeout(resolve, config.chatbot.typingDelay))
    setIsTyping(false)
    setMessages(prev => [...prev, { id: Date.now(), type: 'bot', text, component, data }])
  }, [])

  const addUserMessage = useCallback((text: string) => {
    setMessages(prev => [...prev, { id: Date.now(), type: 'user', text }])
  }, [])

  // ============================================
  // VOICE INPUT
  // ============================================
  useEffect(() => {
    if (typeof window !== 'undefined' && config.chatbot.enableVoiceInput) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = false
        recognitionRef.current.lang = 'en-US'

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setInputValue(prev => prev + (prev ? ' ' : '') + transcript)
          setIsListening(false)
        }

        recognitionRef.current.onerror = () => setIsListening(false)
        recognitionRef.current.onend = () => setIsListening(false)
      }
    }
  }, [])

  const toggleVoice = () => {
    if (!recognitionRef.current) return
    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  // ============================================
  // INITIALIZE
  // ============================================
  useEffect(() => {
    const timer = setTimeout(() => {
      addBotMessage(
        `Hey! 👋 Need sealcoating or paving? I'll help you get an instant estimate.\n\nWhat service do you need?`,
        'services'
      )
      setStep(STEPS.SERVICE)
    }, 300)
    return () => clearTimeout(timer)
  }, [addBotMessage])

  // ============================================
  // GOOGLE MAPS
  // ============================================
  useEffect(() => {
    if (typeof window === 'undefined' || !config.googleMaps.apiKey) return
    if (window.google?.maps) return

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${config.googleMaps.apiKey}&libraries=places,geometry,drawing`
    script.async = true
    document.head.appendChild(script)
  }, [])

  useEffect(() => {
    if (!showMap || !mapContainerRef.current) return

    const initMap = async () => {
      if (!window.google?.maps) {
        await new Promise<void>(resolve => {
          const check = setInterval(() => {
            if (window.google?.maps) { clearInterval(check); resolve() }
          }, 100)
          setTimeout(() => { clearInterval(check); resolve() }, 10000)
        })
      }
      if (!window.google?.maps || !mapContainerRef.current) return

      let center = config.googleMaps.defaultCenter
      if (bookingData.address) {
        try {
          const geocoder = new window.google.maps.Geocoder()
          const result: any = await new Promise((resolve, reject) => {
            geocoder.geocode({ address: bookingData.address }, (results: any, status: string) => {
              if (status === 'OK' && results[0]) resolve(results[0].geometry.location)
              else reject(status)
            })
          })
          center = { lat: result.lat(), lng: result.lng() }
        } catch { /* use default */ }
      }

      const map = new window.google.maps.Map(mapContainerRef.current, {
        center, zoom: config.googleMaps.defaultZoom, mapTypeId: 'hybrid',
        disableDefaultUI: true, zoomControl: true, gestureHandling: 'greedy',
      })
      mapRef.current = map

      const drawingManager = new window.google.maps.drawing.DrawingManager({
        drawingMode: window.google.maps.drawing.OverlayType.POLYGON,
        drawingControl: false,
        polygonOptions: {
          fillColor: '#22c55e', fillOpacity: 0.35,
          strokeColor: '#22c55e', strokeWeight: 3,
          clickable: true, editable: true, draggable: true,
        },
      })
      drawingManager.setMap(map)
      drawingManagerRef.current = drawingManager

      window.google.maps.event.addListener(drawingManager, 'polygoncomplete', (polygon: any) => {
        if (polygonRef.current) polygonRef.current.setMap(null)
        polygonRef.current = polygon
        const updateArea = () => {
          const area = window.google.maps.geometry.spherical.computeArea(polygon.getPath())
          setDrawnArea(Math.round(area * 10.7639))
        }
        updateArea()
        window.google.maps.event.addListener(polygon.getPath(), 'set_at', updateArea)
        window.google.maps.event.addListener(polygon.getPath(), 'insert_at', updateArea)
        drawingManager.setDrawingMode(null)
      })
      setMapReady(true)
    }
    initMap()

    return () => {
      if (polygonRef.current) { polygonRef.current.setMap(null); polygonRef.current = null }
      if (drawingManagerRef.current) { drawingManagerRef.current.setMap(null); drawingManagerRef.current = null }
      mapRef.current = null
      setMapReady(false)
    }
  }, [showMap, bookingData.address])

  const clearDrawing = () => {
    if (polygonRef.current) { polygonRef.current.setMap(null); polygonRef.current = null }
    setDrawnArea(null)
    if (drawingManagerRef.current && window.google?.maps) {
      drawingManagerRef.current.setDrawingMode(window.google.maps.drawing.OverlayType.POLYGON)
    }
  }

  // ============================================
  // CALCULATIONS
  // ============================================
  const calculateEstimate = (sqft: number, serviceId: string) => {
    const service = config.services.find(s => s.id === serviceId)
    if (!service) return { low: 0, high: 0 }
    let base = sqft * service.pricePerSqFt
    base = Math.max(base, service.minPrice)
    const buffer = service.estimateBuffer || 0.20
    return { low: Math.round(base * (1 - buffer)), high: Math.round(base * (1 + buffer)) }
  }

  const getAvailableDates = () => {
    const dates: Date[] = []
    const today = new Date()
    for (let i = config.booking.minDaysOut; i < config.booking.maxDaysOut && dates.length < 6; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      if (config.booking.skipSundays && date.getDay() === 0) continue
      dates.push(date)
    }
    return dates
  }

  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  const getAddOnTotal = () => {
    let total = 0
    Object.entries(bookingData.addOns).forEach(([id, count]) => {
      const addon = config.addOns.find(a => a.id === id)
      if (addon && count > 0) total += addon.fee * count
    })
    return total
  }

  // ============================================
  // HANDLERS
  // ============================================
  const handleServiceSelect = async (serviceId: string) => {
    const service = config.services.find(s => s.id === serviceId)!
    setBookingData(prev => ({ ...prev, service: serviceId, serviceName: service.name }))
    addUserMessage(`${service.emoji} ${service.name}`)

    await addBotMessage(
      `Great choice! ${service.name} ${service.description.toLowerCase()}.\n\nWhat type of property is this for?`,
      'projectTypes'
    )
    setStep(STEPS.PROJECT_TYPE)
  }

  const handleProjectTypeSelect = async (projectId: string) => {
    const project = config.projectTypes.find(p => p.id === projectId)!
    setBookingData(prev => ({ ...prev, projectType: projectId, projectTypeName: project.label }))
    addUserMessage(`${project.emoji} ${project.label}`)

    await addBotMessage("Perfect! What's the property address?")
    setInputPlaceholder('Enter property address...')
    setStep(STEPS.ADDRESS)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleAddressSubmit = async () => {
    if (!inputValue.trim()) return
    const address = inputValue.trim()
    setBookingData(prev => ({ ...prev, address }))
    addUserMessage(address)
    setInputValue('')

    if (config.googleMaps.apiKey) {
      await addBotMessage(
        `Got it: ${address}\n\nNow let's measure your ${bookingData.projectTypeName.toLowerCase()}. Draw the outline on the satellite map.`,
        'mapButton'
      )
      setStep(STEPS.MAP_DRAW)
    } else {
      await addBotMessage("Enter the approximate square footage:")
      setInputPlaceholder('Square footage (e.g., 1500)...')
      setStep(STEPS.MAP_DRAW)
    }
  }

  const handleMapConfirm = async () => {
    if (!drawnArea) return
    setShowMap(false)
    setBookingData(prev => ({ ...prev, squareFootage: drawnArea }))
    addUserMessage(`${drawnArea.toLocaleString()} sq ft measured`)

    const estimate = calculateEstimate(drawnArea, bookingData.service)
    setBookingData(prev => ({ ...prev, estimateLow: estimate.low, estimateHigh: estimate.high }))

    await addBotMessage(`Based on ${drawnArea.toLocaleString()} sq ft:`, 'estimate', estimate)

    setTimeout(async () => {
      await addBotMessage("What's the current condition of the asphalt?", 'conditions')
      setStep(STEPS.CONDITION)
    }, 800)
  }

  const handleManualSqft = async () => {
    setShowMap(false)
    await addBotMessage("Enter the approximate square footage:")
    setInputPlaceholder('Square footage (e.g., 1500)...')
  }

  const handleSqftSubmit = async () => {
    const sqft = parseInt(inputValue.replace(/,/g, ''))
    if (isNaN(sqft) || sqft <= 0) return
    setBookingData(prev => ({ ...prev, squareFootage: sqft }))
    addUserMessage(`${sqft.toLocaleString()} sq ft`)
    setInputValue('')

    const estimate = calculateEstimate(sqft, bookingData.service)
    setBookingData(prev => ({ ...prev, estimateLow: estimate.low, estimateHigh: estimate.high }))

    await addBotMessage(`Based on ${sqft.toLocaleString()} sq ft:`, 'estimate', estimate)

    setTimeout(async () => {
      await addBotMessage("What's the current condition of the asphalt?", 'conditions')
      setStep(STEPS.CONDITION)
    }, 800)
  }

  const handleConditionSelect = async (conditionId: string) => {
    const condition = config.conditions.find(c => c.id === conditionId)!
    setBookingData(prev => ({ ...prev, condition: conditionId }))
    addUserMessage(condition.label)

    // Adjust estimate if needed
    if (condition.adjustment > 0) {
      const adjustedHigh = Math.round(bookingData.estimateHigh * (1 + condition.adjustment))
      setBookingData(prev => ({ ...prev, estimateHigh: adjustedHigh }))
    }

    await addBotMessage("When would you like us to come out for a free on-site estimate?", 'datePicker')
    setStep(STEPS.DATE)
  }

  const handleDateSelect = async (date: Date) => {
    setBookingData(prev => ({ ...prev, selectedDate: date }))
    addUserMessage(formatDate(date))

    await addBotMessage(`${formatDate(date)} works great!\n\nLast step - what's your name and phone number?`)
    setInputPlaceholder('Your name and phone number...')
    setStep(STEPS.CONTACT)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleContactSubmit = async () => {
    if (!inputValue.trim()) return
    const input = inputValue.trim()
    const phoneMatch = input.match(/[\d\-\(\)\s]{10,}/)
    const phone = phoneMatch ? phoneMatch[0].trim() : ''
    const name = input.replace(phone, '').trim() || input
    setBookingData(prev => ({ ...prev, customerName: name, customerPhone: phone }))
    addUserMessage(input)
    setInputValue('')

    await addBotMessage("Here's your quote summary:", 'summary')
    setStep(STEPS.SUMMARY)
  }

  const handleAddOnChange = (id: string, delta: number) => {
    setBookingData(prev => ({
      ...prev,
      addOns: { ...prev.addOns, [id]: Math.max(0, (prev.addOns[id] || 0) + delta) }
    }))
  }

  const handleConfirmBooking = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/paving-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: bookingData.service,
          projectType: bookingData.projectType,
          squareFootage: bookingData.squareFootage,
          condition: bookingData.condition,
          address: bookingData.address,
          customerName: bookingData.customerName,
          customerPhone: bookingData.customerPhone,
          customerEmail: bookingData.customerEmail,
          estimateLow: bookingData.estimateLow,
          estimateHigh: bookingData.estimateHigh + getAddOnTotal(),
          preferredDate: bookingData.selectedDate?.toISOString(),
          addOns: bookingData.addOns,
          sessionId,
        }),
      })
      const result = await response.json()

      if (result.success) {
        await addBotMessage(
          `Booking confirmed! 🎉\n\n${config.businessName} will contact you at ${bookingData.customerPhone} to confirm your appointment on ${formatDate(bookingData.selectedDate!)}.\n\nThank you!`,
          'confirmation'
        )
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Booking error:', error)
      await addBotMessage(`There was an issue. Please call us at ${config.phone} and we'll help you right away!`)
    } finally {
      setIsSubmitting(false)
      setStep(STEPS.COMPLETE)
    }
  }

  const handleInputSubmit = () => {
    if (!inputValue.trim()) return
    switch (step) {
      case STEPS.ADDRESS: handleAddressSubmit(); break
      case STEPS.MAP_DRAW: handleSqftSubmit(); break
      case STEPS.CONTACT: handleContactSubmit(); break
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleInputSubmit() }
  }

  // ============================================
  // RENDER COMPONENTS
  // ============================================
  const renderServices = () => (
    <div className="mt-3 space-y-2">
      {config.services.map(service => (
        <button key={service.id} onClick={() => handleServiceSelect(service.id)}
          className="w-full bg-[#243447] hover:bg-[#2d4058] border border-gray-600 rounded-xl p-4 flex items-center gap-3 transition-colors">
          <div className="w-10 h-10 bg-[#22c55e] rounded-lg flex items-center justify-center text-lg">{service.emoji}</div>
          <div className="flex-1 text-left">
            <p className="text-white font-medium">{service.name}</p>
            <p className="text-gray-400 text-xs">{service.description}</p>
          </div>
          <span className="text-[#22c55e] font-semibold text-sm">${service.pricePerSqFt}/sqft</span>
        </button>
      ))}
    </div>
  )

  const renderProjectTypes = () => (
    <div className="mt-3 grid grid-cols-2 gap-2">
      {config.projectTypes.map(project => {
        const IconComponent = projectIcons[project.id] || Building2
        return (
          <button key={project.id} onClick={() => handleProjectTypeSelect(project.id)}
            className="bg-[#243447] hover:bg-[#2d4058] border border-gray-600 rounded-xl p-3 text-center transition-colors">
            <IconComponent className="w-5 h-5 text-[#22c55e] mx-auto mb-1" />
            <p className="text-white text-sm font-medium">{project.label}</p>
            <p className="text-gray-400 text-xs">~{project.avgSqFt.toLocaleString()} sq ft</p>
          </button>
        )
      })}
    </div>
  )

  const renderMapButton = () => (
    <div className="mt-3 space-y-2">
      <button onClick={() => setShowMap(true)}
        className="w-full bg-[#22c55e] hover:bg-[#1ea550] text-white rounded-xl py-3 px-4 font-semibold flex items-center justify-center gap-2 transition-colors">
        <MapPin className="w-5 h-5" />Draw Area on Map
      </button>
      <button onClick={handleManualSqft} className="w-full text-gray-400 hover:text-white text-sm py-2 transition-colors">
        Or enter square footage manually
      </button>
    </div>
  )

  const renderEstimate = (data: { low: number; high: number }) => (
    <div className="mt-3 bg-gradient-to-r from-[#22c55e] to-[#16a34a] rounded-xl p-4">
      <p className="text-green-100 text-xs mb-1">Estimated Range</p>
      <p className="text-white text-2xl font-bold">${data.low.toLocaleString()} - ${data.high.toLocaleString()}</p>
      <p className="text-green-100 text-xs mt-1">Final price after on-site inspection</p>
    </div>
  )

  const renderConditions = () => (
    <div className="mt-3 grid grid-cols-2 gap-2">
      {config.conditions.map(condition => (
        <button key={condition.id} onClick={() => handleConditionSelect(condition.id)}
          className="bg-[#243447] hover:bg-[#2d4058] border border-gray-600 rounded-xl p-3 text-left transition-colors">
          <p className="text-white text-sm font-medium">{condition.label}</p>
          <p className="text-gray-400 text-xs">{condition.description}</p>
        </button>
      ))}
    </div>
  )

  const renderDatePicker = () => (
    <div className="mt-3">
      <p className="text-gray-400 text-xs mb-2">Pick a preferred date:</p>
      <div className="grid grid-cols-3 gap-2">
        {getAvailableDates().map((date, idx) => (
          <button key={idx} onClick={() => handleDateSelect(date)}
            className="bg-[#243447] hover:bg-[#22c55e] border border-gray-600 hover:border-[#22c55e] rounded-xl py-3 px-2 text-center transition-colors group">
            <Calendar className="w-4 h-4 text-gray-400 group-hover:text-white mx-auto mb-1" />
            <p className="text-white text-xs font-medium">{formatDate(date)}</p>
          </button>
        ))}
      </div>
    </div>
  )

  const renderSummary = () => {
    const addOnTotal = getAddOnTotal()
    return (
      <div className="mt-3 bg-[#243447] rounded-xl overflow-hidden">
        <div className="divide-y divide-gray-700">
          <div className="flex justify-between px-4 py-3"><span className="text-gray-400 text-sm">Service</span><span className="text-white text-sm font-medium">{bookingData.serviceName}</span></div>
          <div className="flex justify-between px-4 py-3"><span className="text-gray-400 text-sm">Property</span><span className="text-white text-sm font-medium">{bookingData.projectTypeName}</span></div>
          <div className="flex justify-between px-4 py-3"><span className="text-gray-400 text-sm">Area</span><span className="text-white text-sm font-medium">{bookingData.squareFootage.toLocaleString()} sq ft</span></div>
          <div className="flex justify-between px-4 py-3"><span className="text-gray-400 text-sm">Condition</span><span className="text-white text-sm font-medium">{config.conditions.find(c => c.id === bookingData.condition)?.label}</span></div>
          <div className="flex justify-between px-4 py-3"><span className="text-gray-400 text-sm">Appointment</span><span className="text-white text-sm font-medium">{bookingData.selectedDate ? formatDate(bookingData.selectedDate) : 'TBD'}</span></div>
          <div className="flex justify-between px-4 py-3"><span className="text-gray-400 text-sm">Contact</span><span className="text-white text-sm font-medium text-right">{bookingData.customerName}<br /><span className="text-gray-400">{bookingData.customerPhone}</span></span></div>
        </div>

        {bookingData.service === 'sealcoating' && (
          <div className="border-t border-gray-700 px-4 py-3">
            <button onClick={() => setShowAddOns(!showAddOns)} className="w-full flex items-center justify-between text-gray-300 text-sm font-medium">
              Add-on services (optional)
              {showAddOns ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showAddOns && (
              <div className="mt-3 space-y-2">
                {config.addOns.map(addon => (
                  <div key={addon.id} className="flex items-center justify-between bg-[#1a2332] rounded-lg px-3 py-2">
                    <div><p className="text-white text-sm">{addon.item}</p><p className="text-gray-400 text-xs">${addon.fee} {addon.unit}</p></div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleAddOnChange(addon.id, -1)} className="w-7 h-7 bg-[#243447] hover:bg-[#2d4058] text-gray-400 rounded flex items-center justify-center"><Minus className="w-4 h-4" /></button>
                      <span className="text-white w-4 text-center">{bookingData.addOns[addon.id] || 0}</span>
                      <button onClick={() => handleAddOnChange(addon.id, 1)} className="w-7 h-7 bg-[#22c55e] hover:bg-[#1ea550] text-white rounded flex items-center justify-center"><Plus className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="bg-[#1a2332] px-4 py-4 flex justify-between items-center">
          <div><p className="text-white font-bold text-lg">Estimate</p>{addOnTotal > 0 && <p className="text-gray-400 text-xs">Includes ${addOnTotal} in add-ons</p>}</div>
          <p className="text-[#22c55e] font-bold text-xl">${bookingData.estimateLow.toLocaleString()} - ${(bookingData.estimateHigh + addOnTotal).toLocaleString()}</p>
        </div>

        <button onClick={handleConfirmBooking} disabled={isSubmitting}
          className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-white py-4 font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
          {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" />Submitting...</> : <>Confirm Booking<ArrowRight className="w-5 h-5" /></>}
        </button>
      </div>
    )
  }

  const renderConfirmation = () => (
    <div className="mt-3 text-center">
      <div className="w-16 h-16 bg-[#22c55e] rounded-full flex items-center justify-center mx-auto mb-3">
        <Check className="w-8 h-8 text-white" />
      </div>
    </div>
  )

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div className="paving-chatbot flex flex-col h-[600px] max-h-[85vh] bg-[#1a2332] rounded-2xl shadow-2xl overflow-hidden relative">
      {/* Header */}
      <div className="bg-[#1a2332] px-4 py-3 flex items-center gap-3 border-b border-gray-700">
        <div className="w-10 h-10 bg-[#22c55e] rounded-lg flex items-center justify-center">
          <Truck className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-white font-semibold text-base">{config.businessName}</h2>
          <p className="text-gray-400 text-xs">Quick booking assistant</p>
        </div>
        {onClose && <button onClick={onClose} className="text-gray-400 hover:text-white p-1"><X className="w-5 h-5" /></button>}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(message => (
          <div key={message.id}>
            <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.type === 'user' ? 'bg-[#22c55e] text-white rounded-br-md' : 'bg-[#243447] text-gray-100 rounded-bl-md'}`}>
                <p className="whitespace-pre-wrap text-sm">{message.text}</p>
              </div>
            </div>
            {message.component === 'services' && renderServices()}
            {message.component === 'projectTypes' && renderProjectTypes()}
            {message.component === 'mapButton' && renderMapButton()}
            {message.component === 'estimate' && renderEstimate(message.data)}
            {message.component === 'conditions' && renderConditions()}
            {message.component === 'datePicker' && renderDatePicker()}
            {message.component === 'summary' && renderSummary()}
            {message.component === 'confirmation' && renderConfirmation()}
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[#243447] rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Map Overlay */}
      {showMap && (
        <div className="absolute inset-0 bg-[#1a2332] z-20 flex flex-col">
          <div className="bg-[#1a2332] px-4 py-3 border-b border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-semibold">Draw Your Area</h3>
              <button onClick={() => setShowMap(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-gray-400 text-xs">Click corners to draw your {bookingData.projectTypeName.toLowerCase()} outline</p>
          </div>
          <div className="flex-1 relative">
            <div ref={mapContainerRef} className="h-full w-full" />
            {!mapReady && (
              <div className="absolute inset-0 bg-[#1a2332] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#22c55e] animate-spin" />
              </div>
            )}
          </div>
          <div className="bg-[#1a2332] border-t border-gray-700 p-4">
            {drawnArea ? (
              <div className="flex items-center justify-between mb-3">
                <div><p className="text-gray-400 text-xs">Area measured</p><p className="text-white text-xl font-bold">{drawnArea.toLocaleString()} sq ft</p></div>
                <button onClick={clearDrawing} className="text-red-400 hover:text-red-300 text-sm">Clear & Redraw</button>
              </div>
            ) : <p className="text-gray-400 text-sm mb-3 text-center">Draw your area on the map above</p>}
            <div className="flex gap-2">
              <button onClick={() => setShowMap(false)} className="flex-1 bg-[#243447] hover:bg-[#2d4058] text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"><ArrowLeft className="w-4 h-4" />Back</button>
              <button onClick={handleMapConfirm} disabled={!drawnArea} className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 ${drawnArea ? 'bg-[#22c55e] hover:bg-[#1ea550] text-white' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}><Check className="w-4 h-4" />Confirm</button>
            </div>
            <button onClick={handleManualSqft} className="w-full text-gray-400 hover:text-white text-sm py-2 mt-2">Enter square footage manually</button>
          </div>
        </div>
      )}

      {/* Input */}
      {[STEPS.ADDRESS, STEPS.MAP_DRAW, STEPS.CONTACT].includes(step) && !showMap && (
        <div className="border-t border-gray-700 p-3 bg-[#1a2332]">
          <div className="flex gap-2">
            {config.chatbot.enableVoiceInput && recognitionRef.current && (
              <button onClick={toggleVoice} className={`p-3 rounded-xl transition-colors ${isListening ? 'bg-red-500 text-white' : 'bg-[#243447] text-gray-400 hover:text-white'}`}>
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            )}
            <input ref={inputRef} type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={handleKeyDown}
              placeholder={inputPlaceholder} className="flex-1 bg-[#243447] text-white placeholder-gray-500 px-4 py-3 rounded-xl border border-gray-600 focus:border-[#22c55e] focus:outline-none text-sm" />
            <button onClick={handleInputSubmit} disabled={!inputValue.trim()}
              className={`p-3 rounded-xl transition-colors ${inputValue.trim() ? 'bg-[#22c55e] hover:bg-[#1ea550] text-white' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}>
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-[#1a2332] border-t border-gray-700 py-2 px-4 text-center">
        <a href={`tel:${config.phoneRaw}`} className="text-gray-400 hover:text-[#22c55e] text-xs inline-flex items-center gap-1">
          Need help? <Phone className="w-3 h-3" />{config.phone}
        </a>
      </div>
    </div>
  )
}
