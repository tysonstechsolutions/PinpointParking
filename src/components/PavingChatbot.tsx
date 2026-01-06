/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { config } from '@/config/config'
import {
  X, MapPin, Calendar, Send, Phone, Check, Home, Building2,
  Plus, Minus, Mic, MicOff, Loader2, Heart, ChevronRight
} from 'lucide-react'

declare global {
  interface Window {
    google: any
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

// ============================================
// TYPES
// ============================================
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
  projectDiscount: number
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

// ============================================
// MAIN COMPONENT
// ============================================
export default function PavingChatbot({ onClose }: PavingChatbotProps) {
  const [step, setStep] = useState('service')
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [inputPlaceholder, setInputPlaceholder] = useState('Type here...')
  const [isTyping, setIsTyping] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [mapReady, setMapReady] = useState(false)
  const [drawnArea, setDrawnArea] = useState<number | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [sessionId] = useState(() => `s_${Date.now()}`)

  const [bookingData, setBookingData] = useState<BookingData>({
    service: '', serviceName: '', projectType: '', projectTypeName: '',
    projectDiscount: 0, address: '', squareFootage: 0, condition: '',
    estimateLow: 0, estimateHigh: 0, selectedDate: null,
    customerName: '', customerPhone: '', customerEmail: '',
    addOns: {}, notes: '',
  })

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

  const addMessage = useCallback(async (type: 'bot' | 'user', text: string, component?: string, data?: any) => {
    if (type === 'bot') {
      setIsTyping(true)
      await new Promise(r => setTimeout(r, 400))
      setIsTyping(false)
    }
    setMessages(prev => [...prev, { id: Date.now(), type, text, component, data }])
  }, [])

  // ============================================
  // VOICE INPUT
  // ============================================
  useEffect(() => {
    if (typeof window !== 'undefined' && config.chatbot.enableVoiceInput) {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SR) {
        const recognition = new SR()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'en-US'
        recognition.onresult = (e: any) => {
          setInputValue(prev => prev + (prev ? ' ' : '') + e.results[0][0].transcript)
          setIsListening(false)
        }
        recognition.onerror = () => setIsListening(false)
        recognition.onend = () => setIsListening(false)
        recognitionRef.current = recognition
      }
    }
  }, [])

  const toggleVoice = () => {
    if (!recognitionRef.current) return
    if (isListening) { recognitionRef.current.stop(); setIsListening(false) }
    else { recognitionRef.current.start(); setIsListening(true) }
  }

  // ============================================
  // INITIALIZE
  // ============================================
  useEffect(() => {
    setTimeout(() => {
      addMessage('bot', `Hey there! 👋\n\nI'll help you get a quick estimate. What service do you need?`, 'services')
    }, 300)
  }, [addMessage])

  // ============================================
  // GOOGLE MAPS
  // ============================================
  useEffect(() => {
    if (typeof window === 'undefined' || !config.googleMaps.apiKey || window.google?.maps) return
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${config.googleMaps.apiKey}&libraries=places,geometry,drawing`
    script.async = true
    document.head.appendChild(script)
  }, [])

  const initializeMap = useCallback(async () => {
    if (!mapContainerRef.current) return

    // Wait for Google Maps to load
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

    // Geocode address if available
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
      center,
      zoom: 20,
      mapTypeId: 'satellite',
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: 'greedy',
    })
    mapRef.current = map

    const drawingManager = new window.google.maps.drawing.DrawingManager({
      drawingMode: window.google.maps.drawing.OverlayType.POLYGON,
      drawingControl: false,
      polygonOptions: {
        fillColor: '#22c55e',
        fillOpacity: 0.4,
        strokeColor: '#22c55e',
        strokeWeight: 3,
        clickable: true,
        editable: true,
        draggable: true,
      },
    })
    drawingManager.setMap(map)
    drawingManagerRef.current = drawingManager

    window.google.maps.event.addListener(drawingManager, 'polygoncomplete', (polygon: any) => {
      if (polygonRef.current) polygonRef.current.setMap(null)
      polygonRef.current = polygon

      const updateArea = () => {
        const area = window.google.maps.geometry.spherical.computeArea(polygon.getPath())
        setDrawnArea(Math.round(area * 10.7639)) // Convert to sq ft
      }
      updateArea()
      window.google.maps.event.addListener(polygon.getPath(), 'set_at', updateArea)
      window.google.maps.event.addListener(polygon.getPath(), 'insert_at', updateArea)
      drawingManager.setDrawingMode(null)
    })

    setMapReady(true)
  }, [bookingData.address])

  useEffect(() => {
    if (showMap) {
      setMapReady(false)
      initializeMap()
    }
    return () => {
      if (polygonRef.current) { polygonRef.current.setMap(null); polygonRef.current = null }
      if (drawingManagerRef.current) { drawingManagerRef.current.setMap(null); drawingManagerRef.current = null }
      mapRef.current = null
    }
  }, [showMap, initializeMap])

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
  const calculateEstimate = (sqft: number, serviceId: string, discount: number = 0) => {
    const service = config.services.find(s => s.id === serviceId)
    if (!service) return { low: 0, high: 0 }
    let base = sqft * service.pricePerSqFt
    base = Math.max(base, service.minPrice)

    // Apply discount
    if (discount > 0) base = base * (1 - discount)

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
    return Object.entries(bookingData.addOns).reduce((total, [id, count]) => {
      const addon = config.addOns.find(a => a.id === id)
      return addon && count > 0 ? total + addon.fee * count : total
    }, 0)
  }

  // ============================================
  // STEP HANDLERS
  // ============================================
  const handleServiceSelect = async (serviceId: string) => {
    const service = config.services.find(s => s.id === serviceId)!
    setBookingData(prev => ({ ...prev, service: serviceId, serviceName: service.name }))
    addMessage('user', service.name)
    await addMessage('bot', `Great choice!\n\nWhat type of property is this for?`, 'projectTypes')
    setStep('project')
  }

  const handleProjectSelect = async (projectId: string) => {
    const project = config.projectTypes.find(p => p.id === projectId)!
    const discount = (project as any).discount || 0
    setBookingData(prev => ({
      ...prev,
      projectType: projectId,
      projectTypeName: project.label,
      projectDiscount: discount
    }))

    let response = project.label
    if (discount > 0) response += ` (${Math.round(discount * 100)}% discount!)`
    addMessage('user', response)

    await addMessage('bot', `What's the property address?`)
    setInputPlaceholder('Enter address...')
    setStep('address')
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleAddressSubmit = async () => {
    if (!inputValue.trim()) return
    const address = inputValue.trim()
    setBookingData(prev => ({ ...prev, address }))
    addMessage('user', address)
    setInputValue('')

    // Try AI estimation first
    setIsAnalyzing(true)
    await addMessage('bot', `🛰️ Analyzing satellite imagery...`)

    try {
      const response = await fetch('/api/estimate-area', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, projectType: bookingData.projectType })
      })
      const result = await response.json()
      setIsAnalyzing(false)

      if (result.success && result.squareFootage) {
        if (result.formattedAddress) {
          setBookingData(prev => ({ ...prev, address: result.formattedAddress }))
        }
        const estimate = calculateEstimate(result.squareFootage, bookingData.service, bookingData.projectDiscount)

        await addMessage('bot', `Found it!`, 'aiResult', {
          sqft: result.squareFootage,
          confidence: result.confidence,
          description: result.description,
          low: estimate.low,
          high: estimate.high,
          discount: bookingData.projectDiscount
        })
        setStep('confirm-area')
      } else {
        await addMessage('bot', `Let's measure it manually.\n\nDraw the outline on the satellite map:`, 'mapButton')
        setStep('draw')
      }
    } catch {
      setIsAnalyzing(false)
      await addMessage('bot', `Let's measure it.\n\nDraw the outline on the satellite map:`, 'mapButton')
      setStep('draw')
    }
  }

  const handleAcceptArea = async (sqft: number, low: number, high: number) => {
    setBookingData(prev => ({ ...prev, squareFootage: sqft, estimateLow: low, estimateHigh: high }))
    addMessage('user', `${sqft.toLocaleString()} sq ft ✓`)
    await addMessage('bot', `What's the current condition?`, 'conditions')
    setStep('condition')
  }

  const handleAdjustArea = async () => {
    await addMessage('bot', `Draw the exact area on the map:`, 'mapButton')
    setStep('draw')
  }

  const handleMapConfirm = async () => {
    if (!drawnArea) return
    setShowMap(false)

    const estimate = calculateEstimate(drawnArea, bookingData.service, bookingData.projectDiscount)
    setBookingData(prev => ({
      ...prev,
      squareFootage: drawnArea,
      estimateLow: estimate.low,
      estimateHigh: estimate.high
    }))
    addMessage('user', `${drawnArea.toLocaleString()} sq ft measured`)

    await addMessage('bot', `Based on ${drawnArea.toLocaleString()} sq ft:`, 'estimate', { low: estimate.low, high: estimate.high })
    setTimeout(async () => {
      await addMessage('bot', `What's the current condition?`, 'conditions')
      setStep('condition')
    }, 600)
  }

  const handleConditionSelect = async (conditionId: string) => {
    const condition = config.conditions.find(c => c.id === conditionId)!
    setBookingData(prev => ({ ...prev, condition: conditionId }))
    addMessage('user', condition.label)

    if (condition.adjustment > 0) {
      const adjustedHigh = Math.round(bookingData.estimateHigh * (1 + condition.adjustment))
      setBookingData(prev => ({ ...prev, estimateHigh: adjustedHigh }))
    }

    await addMessage('bot', `When works best for a free on-site estimate?`, 'dates')
    setStep('date')
  }

  const handleDateSelect = async (date: Date) => {
    setBookingData(prev => ({ ...prev, selectedDate: date }))
    addMessage('user', formatDate(date))
    await addMessage('bot', `Last step - your name and phone number?`)
    setInputPlaceholder('Name and phone...')
    setStep('contact')
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleContactSubmit = async () => {
    if (!inputValue.trim()) return
    const input = inputValue.trim()
    const phoneMatch = input.match(/[\d\-\(\)\s]{10,}/)
    const phone = phoneMatch ? phoneMatch[0].trim() : ''
    const name = input.replace(phone, '').replace(/[,\-]/g, '').trim() || input

    setBookingData(prev => ({ ...prev, customerName: name, customerPhone: phone }))
    addMessage('user', input)
    setInputValue('')
    await addMessage('bot', `Here's your quote:`, 'summary')
    setStep('summary')
  }

  const handleAddOnChange = (id: string, delta: number) => {
    setBookingData(prev => ({
      ...prev,
      addOns: { ...prev.addOns, [id]: Math.max(0, (prev.addOns[id] || 0) + delta) }
    }))
  }

  const handleConfirm = async () => {
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
        await addMessage('bot', `Booked! 🎉\n\nWe'll call you at ${bookingData.customerPhone} to confirm your ${formatDate(bookingData.selectedDate!)} appointment.\n\nThank you!`, 'done')
      } else {
        throw new Error(result.error)
      }
    } catch {
      await addMessage('bot', `Something went wrong. Please call us at ${config.phone}`)
    } finally {
      setIsSubmitting(false)
      setStep('done')
    }
  }

  const handleInput = () => {
    if (!inputValue.trim()) return
    if (step === 'address') handleAddressSubmit()
    else if (step === 'contact') handleContactSubmit()
  }

  // ============================================
  // RENDER COMPONENTS
  // ============================================
  const ServiceButton = ({ service }: { service: typeof config.services[0] }) => (
    <button
      onClick={() => handleServiceSelect(service.id)}
      className="w-full bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 hover:border-green-500/50 rounded-xl p-4 text-left transition-all group"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{service.emoji}</span>
        <div className="flex-1">
          <p className="text-white font-medium">{service.name}</p>
          <p className="text-gray-400 text-sm">{service.description}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-green-500 transition-colors" />
      </div>
    </button>
  )

  const ProjectButton = ({ project }: { project: typeof config.projectTypes[0] }) => {
    const icons: Record<string, any> = {
      'residential': Home,
      'commercial': Building2,
      'house-of-worship': Heart,
    }
    const Icon = icons[project.id] || Building2
    const discount = (project as any).discount || 0

    return (
      <button
        onClick={() => handleProjectSelect(project.id)}
        className="bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 hover:border-green-500/50 rounded-xl p-4 text-center transition-all relative"
      >
        {discount > 0 && (
          <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
            {Math.round(discount * 100)}% OFF
          </span>
        )}
        <Icon className="w-8 h-8 text-green-500 mx-auto mb-2" />
        <p className="text-white font-medium">{project.label}</p>
        <p className="text-gray-500 text-xs mt-1">{project.description}</p>
      </button>
    )
  }

  const renderComponent = (component: string, data: any) => {
    switch (component) {
      case 'services':
        return (
          <div className="mt-3 space-y-2">
            {config.services.map(s => <ServiceButton key={s.id} service={s} />)}
          </div>
        )

      case 'projectTypes':
        return (
          <div className="mt-3 grid grid-cols-1 gap-2">
            {config.projectTypes.map(p => <ProjectButton key={p.id} project={p} />)}
          </div>
        )

      case 'mapButton':
        return (
          <div className="mt-3">
            <button
              onClick={() => setShowMap(true)}
              className="w-full bg-green-500 hover:bg-green-600 text-white rounded-xl py-3 px-4 font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <MapPin className="w-5 h-5" />
              Open Satellite Map
            </button>
          </div>
        )

      case 'aiResult':
        return (
          <div className="mt-3 space-y-3">
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-green-500" />
                  </div>
                  <span className="text-white font-medium">AI Measurement</span>
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                    data.confidence === 'high' ? 'bg-green-500/20 text-green-400' :
                    data.confidence === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-orange-500/20 text-orange-400'
                  }`}>
                    {data.confidence} confidence
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-3">{data.description}</p>
                <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                  <p className="text-gray-500 text-xs">Measured Area</p>
                  <p className="text-white text-2xl font-bold">{data.sqft.toLocaleString()} sq ft</p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-600 to-green-500 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-xs">Estimated Price</p>
                    {data.discount > 0 && (
                      <p className="text-green-200 text-xs">Includes {Math.round(data.discount * 100)}% discount</p>
                    )}
                  </div>
                  <p className="text-white text-xl font-bold">${data.low.toLocaleString()} - ${data.high.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleAcceptArea(data.sqft, data.low, data.high)}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-xl py-3 font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Check className="w-5 h-5" />
                Looks Right
              </button>
              <button
                onClick={handleAdjustArea}
                className="flex-1 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 text-white rounded-xl py-3 font-medium transition-colors"
              >
                Adjust
              </button>
            </div>
          </div>
        )

      case 'estimate':
        return (
          <div className="mt-3 bg-gradient-to-r from-green-600 to-green-500 rounded-xl p-4">
            <p className="text-green-100 text-xs">Estimated Price</p>
            <p className="text-white text-2xl font-bold">${data.low.toLocaleString()} - ${data.high.toLocaleString()}</p>
          </div>
        )

      case 'conditions':
        return (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {config.conditions.map(c => (
              <button
                key={c.id}
                onClick={() => handleConditionSelect(c.id)}
                className="bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 hover:border-green-500/50 rounded-xl p-3 text-left transition-all"
              >
                <p className="text-white font-medium text-sm">{c.label}</p>
                <p className="text-gray-500 text-xs">{c.description}</p>
              </button>
            ))}
          </div>
        )

      case 'dates':
        return (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {getAvailableDates().map((d, i) => (
              <button
                key={i}
                onClick={() => handleDateSelect(d)}
                className="bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 hover:border-green-500/50 rounded-xl p-3 text-center transition-all"
              >
                <Calendar className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                <p className="text-white text-sm font-medium">{formatDate(d)}</p>
              </button>
            ))}
          </div>
        )

      case 'summary':
        const addOnTotal = getAddOnTotal()
        return (
          <div className="mt-3 bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
            <div className="divide-y divide-gray-700/50">
              <Row label="Service" value={bookingData.serviceName} />
              <Row label="Property" value={bookingData.projectTypeName} />
              <Row label="Area" value={`${bookingData.squareFootage.toLocaleString()} sq ft`} />
              <Row label="Condition" value={config.conditions.find(c => c.id === bookingData.condition)?.label || ''} />
              <Row label="Date" value={bookingData.selectedDate ? formatDate(bookingData.selectedDate) : ''} />
              <Row label="Contact" value={`${bookingData.customerName}\n${bookingData.customerPhone}`} />
            </div>

            {bookingData.service === 'sealcoating' && (
              <div className="border-t border-gray-700/50 p-4">
                <p className="text-gray-400 text-sm mb-3">Add-ons (optional)</p>
                <div className="space-y-2">
                  {config.addOns.map(addon => (
                    <div key={addon.id} className="flex items-center justify-between bg-gray-900/50 rounded-lg px-3 py-2">
                      <div>
                        <p className="text-white text-sm">{addon.item}</p>
                        <p className="text-gray-500 text-xs">${addon.fee}/{addon.unit}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleAddOnChange(addon.id, -1)} className="w-7 h-7 bg-gray-700 hover:bg-gray-600 text-white rounded flex items-center justify-center">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-white w-5 text-center text-sm">{bookingData.addOns[addon.id] || 0}</span>
                        <button onClick={() => handleAddOnChange(addon.id, 1)} className="w-7 h-7 bg-green-500 hover:bg-green-600 text-white rounded flex items-center justify-center">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gray-900/50 p-4 flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Total Estimate</p>
                {addOnTotal > 0 && <p className="text-gray-500 text-xs">+${addOnTotal} in add-ons</p>}
              </div>
              <p className="text-green-500 font-bold text-xl">
                ${bookingData.estimateLow.toLocaleString()} - ${(bookingData.estimateHigh + addOnTotal).toLocaleString()}
              </p>
            </div>

            <button
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 text-white py-4 font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              {isSubmitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" />Submitting...</>
              ) : (
                <>Confirm Booking<ChevronRight className="w-5 h-5" /></>
              )}
            </button>
          </div>
        )

      case 'done':
        return (
          <div className="mt-3 flex justify-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-white" />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between px-4 py-3">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className="text-white text-sm text-right whitespace-pre-line">{value}</span>
    </div>
  )

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div className="flex flex-col h-[550px] max-h-[80vh] bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-gray-900 px-4 py-3 flex items-center gap-3 border-b border-gray-800">
        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
          <span className="text-lg">🚧</span>
        </div>
        <div className="flex-1">
          <h2 className="text-white font-semibold">{config.businessName}</h2>
          <p className="text-gray-500 text-xs">Get an instant estimate</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-500 hover:text-white p-1 transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(msg => (
          <div key={msg.id}>
            <div className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                msg.type === 'user'
                  ? 'bg-green-500 text-white rounded-br-sm'
                  : 'bg-gray-800 text-gray-100 rounded-bl-sm'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
            {msg.component && renderComponent(msg.component, msg.data)}
          </div>
        ))}

        {(isTyping || isAnalyzing) && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-green-500 animate-spin" />
                <span className="text-gray-400 text-sm">
                  {isAnalyzing ? 'Analyzing...' : 'Typing...'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Map Overlay */}
      {showMap && (
        <div className="absolute inset-0 bg-gray-900 z-20 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Draw Your Area</h3>
              <button onClick={() => setShowMap(false)} className="text-gray-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-500 text-xs mt-1">Tap corners to draw the outline</p>
          </div>

          <div className="flex-1 relative">
            <div ref={mapContainerRef} className="h-full w-full" />
            {!mapReady && (
              <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-800">
            {drawnArea ? (
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-gray-500 text-xs">Measured</p>
                  <p className="text-white text-xl font-bold">{drawnArea.toLocaleString()} sq ft</p>
                </div>
                <button onClick={clearDrawing} className="text-red-400 hover:text-red-300 text-sm">
                  Clear
                </button>
              </div>
            ) : (
              <p className="text-gray-500 text-sm mb-3 text-center">Draw on the map above</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setShowMap(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl font-medium transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleMapConfirm}
                disabled={!drawnArea}
                className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                  drawnArea
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      {['address', 'contact'].includes(step) && !showMap && (
        <div className="border-t border-gray-800 p-3">
          <div className="flex gap-2">
            {config.chatbot.enableVoiceInput && recognitionRef.current && (
              <button
                onClick={toggleVoice}
                className={`p-3 rounded-xl transition-colors ${
                  isListening ? 'bg-red-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            )}
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleInput()}
              placeholder={inputPlaceholder}
              className="flex-1 bg-gray-800 text-white placeholder-gray-500 px-4 py-3 rounded-xl border border-gray-700 focus:border-green-500 focus:outline-none text-sm"
            />
            <button
              onClick={handleInput}
              disabled={!inputValue.trim()}
              className={`p-3 rounded-xl transition-colors ${
                inputValue.trim()
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-gray-800 py-2 px-4 text-center">
        <a href={`tel:${config.phoneRaw}`} className="text-gray-500 hover:text-green-500 text-xs inline-flex items-center gap-1 transition-colors">
          <Phone className="w-3 h-3" />
          {config.phone}
        </a>
      </div>
    </div>
  )
}
