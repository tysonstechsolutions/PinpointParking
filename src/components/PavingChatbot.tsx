/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useRef } from 'react'
import { config } from '@/config/config'
import { Truck, Phone, Check, ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react'

// Google Maps type declarations
declare global {
  interface Window {
    google: any
  }
}

const STEPS = {
  SERVICE: 'service',
  PROJECT_TYPE: 'project_type',
  ADDRESS: 'address',
  MAP_MEASURING: 'map_measuring',
  CONDITION: 'condition',
  DATE: 'date',
  CONTACT: 'contact',
  SUMMARY: 'summary',
  COMPLETE: 'complete'
}

// Icon components for services
const ServiceIcons: Record<string, string> = {
  sealcoating: '🛡️',
  paving: '🚧',
  linestriping: '🅿️',
}

// Icon components for project types
const ProjectIcons: Record<string, string> = {
  residential: '🏠',
  commercial: '🏢',
  'house-of-worship': '⛪',
}

interface PavingChatbotProps {
  onClose?: () => void
  embedded?: boolean
}

export default function PavingChatbot({ onClose, embedded = false }: PavingChatbotProps) {
  // UI State
  const [isOpen, setIsOpen] = useState(embedded)
  const [step, setStep] = useState(STEPS.SERVICE)
  const [messages, setMessages] = useState<{type: string, text: string}[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Map State
  const [mapLoaded, setMapLoaded] = useState(false)
  const [drawnArea, setDrawnArea] = useState<number | null>(null)
  const [aiPolygonPoints, setAiPolygonPoints] = useState<Array<{lat: number, lng: number}>>([])
  const [mapCoordinates, setMapCoordinates] = useState<{lat: number, lng: number} | null>(null)

  // Calendar State
  const [calendarMonth, setCalendarMonth] = useState(new Date())

  // Booking Data
  const [bookingData, setBookingData] = useState({
    service: '',
    serviceName: '',
    projectType: '',
    projectTypeName: '',
    discount: 0,
    address: '',
    squareFootage: 0,
    condition: '',
    estimateLow: 0,
    estimateHigh: 0,
    deliveryDate: '',
    deliveryDateLabel: '',
    name: '',
    phone: '',
  })

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const drawingManagerRef = useRef<any>(null)
  const polygonRef = useRef<any>(null)

  // ==========================================
  // HELPERS
  // ==========================================
  const scrollToBottom = () => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  useEffect(() => { scrollToBottom() }, [messages])

  const addBotMessage = async (text: string, delay = 400) => {
    setIsTyping(true)
    await new Promise(r => setTimeout(r, delay))
    setIsTyping(false)
    setMessages(prev => [...prev, { type: 'bot', text }])
  }

  const addUserMessage = (text: string) => {
    setMessages(prev => [...prev, { type: 'user', text }])
  }

  // ==========================================
  // INITIAL MESSAGE
  // ==========================================
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addBotMessage("Hey! Need paving work? Tell me about your project and I'll give you an instant estimate.", 300)
    }
  }, [isOpen, messages.length])

  // ==========================================
  // CALCULATIONS
  // ==========================================
  const calculateEstimate = (sqft: number, serviceId: string, discount = 0) => {
    const service = config.services.find(s => s.id === serviceId)
    if (!service) return { low: 0, high: 0 }
    let base = sqft * service.pricePerSqFt
    base = Math.max(base, service.minPrice)
    if (discount > 0) base = base * (1 - discount)
    const buffer = service.estimateBuffer || 0.20
    return { low: Math.round(base * (1 - buffer)), high: Math.round(base * (1 + buffer)) }
  }

  // ==========================================
  // GOOGLE MAPS WITH EDITABLE POLYGON
  // ==========================================
  const loadMap = async (polygonPoints?: Array<{lat: number, lng: number}>) => {
    if (!window.google?.maps) {
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
      if (!existingScript) {
        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${config.googleMaps.apiKey}&libraries=geometry,drawing`
        script.async = true
        document.head.appendChild(script)
      }

      await new Promise<void>(resolve => {
        const check = setInterval(() => {
          if (window.google?.maps?.drawing) {
            clearInterval(check)
            resolve()
          }
        }, 100)
        setTimeout(() => { clearInterval(check); resolve() }, 10000)
      })
    }

    if (!window.google?.maps || !mapContainerRef.current) return

    let center = mapCoordinates || config.googleMaps.defaultCenter

    if (!mapCoordinates && bookingData.address) {
      const geocoder = new window.google.maps.Geocoder()
      try {
        const result: any = await new Promise((resolve, reject) => {
          geocoder.geocode({ address: bookingData.address }, (results: any, status: string) => {
            if (status === 'OK' && results[0]) resolve(results[0].geometry.location)
            else reject(status)
          })
        })
        center = { lat: result.lat(), lng: result.lng() }
        setMapCoordinates(center)
      } catch { /* use default */ }
    }

    const map = new window.google.maps.Map(mapContainerRef.current, {
      center,
      zoom: 20,
      mapTypeId: 'hybrid',
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: 'greedy',
    })
    mapRef.current = map

    // Address marker
    new window.google.maps.Marker({
      position: center,
      map: map,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#ffffff',
        fillOpacity: 1,
        strokeColor: '#22c55e',
        strokeWeight: 3,
      },
      title: 'Address'
    })

    const drawingManager = new window.google.maps.drawing.DrawingManager({
      drawingMode: null,
      drawingControl: false,
      polygonOptions: {
        fillColor: '#22c55e',
        fillOpacity: 0.5,
        strokeColor: '#22c55e',
        strokeWeight: 3,
        clickable: true,
        editable: true,
        draggable: true,
      },
    })
    drawingManager.setMap(map)
    drawingManagerRef.current = drawingManager

    const pointsToUse = polygonPoints || aiPolygonPoints
    if (pointsToUse && pointsToUse.length >= 3) {
      const polygon = new window.google.maps.Polygon({
        paths: pointsToUse,
        fillColor: '#22c55e',
        fillOpacity: 0.5,
        strokeColor: '#22c55e',
        strokeWeight: 3,
        clickable: true,
        editable: true,
        draggable: true,
      })
      polygon.setMap(map)
      polygonRef.current = polygon

      const area = window.google.maps.geometry.spherical.computeArea(polygon.getPath())
      const sqft = Math.round(area * 10.7639)
      setDrawnArea(sqft)

      const estimate = calculateEstimate(sqft, bookingData.service, bookingData.discount)
      setBookingData(prev => ({
        ...prev,
        squareFootage: sqft,
        estimateLow: estimate.low,
        estimateHigh: estimate.high
      }))

      const updateArea = () => {
        const newArea = window.google.maps.geometry.spherical.computeArea(polygon.getPath())
        const newSqft = Math.round(newArea * 10.7639)
        setDrawnArea(newSqft)
        const newEstimate = calculateEstimate(newSqft, bookingData.service, bookingData.discount)
        setBookingData(prev => ({
          ...prev,
          squareFootage: newSqft,
          estimateLow: newEstimate.low,
          estimateHigh: newEstimate.high
        }))
      }
      window.google.maps.event.addListener(polygon.getPath(), 'set_at', updateArea)
      window.google.maps.event.addListener(polygon.getPath(), 'insert_at', updateArea)
      window.google.maps.event.addListener(polygon.getPath(), 'remove_at', updateArea)

      const bounds = new window.google.maps.LatLngBounds()
      polygon.getPath().forEach((latLng: any) => bounds.extend(latLng))
      map.fitBounds(bounds, 50)
    } else {
      drawingManager.setDrawingMode(window.google.maps.drawing.OverlayType.POLYGON)
    }

    window.google.maps.event.addListener(drawingManager, 'polygoncomplete', (polygon: any) => {
      if (polygonRef.current) polygonRef.current.setMap(null)
      polygonRef.current = polygon

      const updateArea = () => {
        const area = window.google.maps.geometry.spherical.computeArea(polygon.getPath())
        const sqft = Math.round(area * 10.7639)
        setDrawnArea(sqft)
        const estimate = calculateEstimate(sqft, bookingData.service, bookingData.discount)
        setBookingData(prev => ({
          ...prev,
          squareFootage: sqft,
          estimateLow: estimate.low,
          estimateHigh: estimate.high
        }))
      }
      updateArea()

      window.google.maps.event.addListener(polygon.getPath(), 'set_at', updateArea)
      window.google.maps.event.addListener(polygon.getPath(), 'insert_at', updateArea)
      window.google.maps.event.addListener(polygon.getPath(), 'remove_at', updateArea)
      drawingManager.setDrawingMode(null)
    })

    setMapLoaded(true)
  }

  const clearDrawing = () => {
    if (polygonRef.current) {
      polygonRef.current.setMap(null)
      polygonRef.current = null
    }
    setDrawnArea(null)
    setAiPolygonPoints([])
    if (drawingManagerRef.current && window.google?.maps) {
      drawingManagerRef.current.setDrawingMode(window.google.maps.drawing.OverlayType.POLYGON)
    }
  }

  // ==========================================
  // CALENDAR HELPERS
  // ==========================================
  const getCalendarDays = () => {
    const year = calendarMonth.getFullYear()
    const month = calendarMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startPadding = firstDay.getDay()
    const days: Array<{ date: Date | null; isAvailable: boolean }> = []

    for (let i = 0; i < startPadding; i++) {
      days.push({ date: null, isAvailable: false })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const minDate = new Date(today)
    minDate.setDate(today.getDate() + config.booking.minDaysOut)

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d)
      const dayOfWeek = date.getDay()
      const isPast = date < minDate
      const isSunday = dayOfWeek === 0 && config.booking.skipSundays
      days.push({
        date,
        isAvailable: !isPast && !isSunday
      })
    }

    return days
  }

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  // ==========================================
  // STEP HANDLERS
  // ==========================================
  const handleServiceSelect = async (serviceId: string) => {
    const service = config.services.find(s => s.id === serviceId)!
    setBookingData(prev => ({ ...prev, service: serviceId, serviceName: service.name }))
    addUserMessage(`${service.emoji} ${service.name}`)
    await addBotMessage("What type of property is this?")
    setStep(STEPS.PROJECT_TYPE)
  }

  const handleProjectSelect = async (projectId: string) => {
    const project = config.projectTypes.find(p => p.id === projectId)!
    const discount = project.discount || 0
    setBookingData(prev => ({
      ...prev,
      projectType: projectId,
      projectTypeName: project.label,
      discount
    }))

    let msg = `${project.emoji} ${project.label}`
    if (discount > 0) msg += ` (${Math.round(discount * 100)}% discount!)`
    addUserMessage(msg)

    await addBotMessage("Great! What's the delivery address?")
    setStep(STEPS.ADDRESS)
  }

  const handleAddressSubmit = async () => {
    if (!inputValue.trim()) return
    const address = inputValue.trim()
    setBookingData(prev => ({ ...prev, address }))
    addUserMessage(address)
    setInputValue('')

    setIsAnalyzing(true)
    await addBotMessage("🛰️ Analyzing satellite imagery to find your area...")

    try {
      const response = await fetch('/api/estimate-area', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, projectType: bookingData.projectType })
      })
      const result = await response.json()
      setIsAnalyzing(false)

      if (result.coordinates) {
        setMapCoordinates(result.coordinates)
      }

      if (result.success && result.polygonPoints && result.polygonPoints.length >= 3) {
        setAiPolygonPoints(result.polygonPoints)
        const sqft = result.squareFootage
        const estimate = calculateEstimate(sqft, bookingData.service, bookingData.discount)
        setBookingData(prev => ({
          ...prev,
          squareFootage: sqft,
          estimateLow: estimate.low,
          estimateHigh: estimate.high,
          address: result.formattedAddress || address
        }))

        await addBotMessage(`🎯 Found it! I've outlined the paved area on the map.\n\n📐 ${sqft.toLocaleString()} sq ft\n💰 $${estimate.low.toLocaleString()} - $${estimate.high.toLocaleString()}\n\nDrag the corners to adjust if needed.`)
        setStep(STEPS.MAP_MEASURING)
        setTimeout(() => loadMap(result.polygonPoints), 100)
      } else if (result.coordinates) {
        await addBotMessage("📍 Found the location! Now tap on the map to outline the area you need serviced.")
        setStep(STEPS.MAP_MEASURING)
        setTimeout(() => loadMap(), 100)
      } else {
        await addBotMessage("Couldn't find that address. Please try again with a full address including city and state.")
      }
    } catch {
      setIsAnalyzing(false)
      await addBotMessage("Let's find it manually. Tap on the map to outline your area.")
      setStep(STEPS.MAP_MEASURING)
      setTimeout(() => loadMap(), 100)
    }
  }

  const handleMapConfirm = async () => {
    if (!drawnArea) return

    const estimate = calculateEstimate(drawnArea, bookingData.service, bookingData.discount)
    setBookingData(prev => ({
      ...prev,
      squareFootage: drawnArea,
      estimateLow: estimate.low,
      estimateHigh: estimate.high
    }))

    addUserMessage(`📐 ${drawnArea.toLocaleString()} sq ft`)
    await addBotMessage("What's the current pavement condition?")
    setStep(STEPS.CONDITION)
  }

  const handleConditionSelect = async (conditionId: string) => {
    const condition = config.conditions.find(c => c.id === conditionId)!
    setBookingData(prev => ({ ...prev, condition: conditionId }))
    addUserMessage(condition.label)

    if (condition.adjustment > 0) {
      const newHigh = Math.round(bookingData.estimateHigh * (1 + condition.adjustment))
      setBookingData(prev => ({ ...prev, estimateHigh: newHigh }))
    }

    await addBotMessage("When would you like us to come out?")
    setStep(STEPS.DATE)
  }

  const handleDateSelect = async (date: Date) => {
    const label = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    const value = date.toISOString().split('T')[0]
    setBookingData(prev => ({ ...prev, deliveryDate: value, deliveryDateLabel: label }))
    addUserMessage(label)
    await addBotMessage("Last step - what's your name and phone number?")
    setStep(STEPS.CONTACT)
  }

  const handleContactSubmit = async () => {
    const value = inputValue.trim()
    if (!value) return
    setInputValue('')

    const phoneMatch = value.match(/[\d\-\(\)\s]{10,}/)
    const phone = phoneMatch ? phoneMatch[0].replace(/\D/g, '') : ''
    const name = value.replace(phoneMatch?.[0] || '', '').replace(/[,]/g, '').trim()

    if (name && phone) {
      setBookingData(prev => ({ ...prev, name, phone }))
      addUserMessage(`${name}, ${phone}`)
      await addBotMessage(`Thanks ${name}! Here's your estimate:`)
      setStep(STEPS.SUMMARY)
    } else {
      await addBotMessage("Please include both your name and phone number.\n\nExample: John Smith 618-555-1234")
    }
  }

  const handleConfirmBooking = async () => {
    addUserMessage("Confirm booking")
    setIsTyping(true)

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
          customerName: bookingData.name,
          customerPhone: bookingData.phone,
          estimateLow: bookingData.estimateLow,
          estimateHigh: bookingData.estimateHigh,
          preferredDate: bookingData.deliveryDate,
        }),
      })

      const result = await response.json()
      setIsTyping(false)

      if (result.success) {
        await addBotMessage(`Booking confirmed! 🎉\n\n${config.businessName} will call or text you at ${bookingData.phone} to confirm your ${bookingData.deliveryDateLabel} appointment.\n\nTotal estimate: $${bookingData.estimateLow.toLocaleString()} - $${bookingData.estimateHigh.toLocaleString()}\n\nQuestions? Call ${config.phone}`)
      } else {
        await addBotMessage(`Something went wrong, but don't worry!\n\nCall us at ${config.phone} and we'll get you set up.`)
      }
    } catch {
      setIsTyping(false)
      await addBotMessage(`Couldn't submit online.\n\nCall us at ${config.phone} - we'll book it for you!`)
    }

    setStep(STEPS.COMPLETE)
  }

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (step === STEPS.ADDRESS) handleAddressSubmit()
    else if (step === STEPS.CONTACT) handleContactSubmit()
  }

  const handleClose = () => {
    if (onClose) onClose()
    else setIsOpen(false)
  }

  // ==========================================
  // RENDER
  // ==========================================
  if (embedded) {
    return renderChatWindow()
  }

  return (
    <div>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-[#22c55e] hover:bg-[#1ea550] rounded-full shadow-lg flex items-center justify-center z-50 transition-all duration-200 hover:scale-110"
        >
          <span className="text-2xl">💬</span>
        </button>
      )}
      {isOpen && renderChatWindow()}
    </div>
  )

  function renderChatWindow() {
    return (
      <div className={`${embedded ? 'h-full' : 'fixed bottom-6 right-6 w-[600px] max-w-[calc(100vw-48px)] h-[700px] max-h-[calc(100vh-48px)]'} bg-[#0f172a] rounded-2xl flex flex-col z-50 overflow-hidden shadow-2xl border border-[#334155]`}>

        {/* Header - Navy with icon like King City */}
        <div className="px-4 py-3 bg-[#1e293b] flex items-center justify-between flex-shrink-0 border-b border-[#334155]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#22c55e]/20 rounded-full flex items-center justify-center">
              <Truck className="w-5 h-5 text-[#22c55e]" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">{config.businessName}</div>
              <div className="text-xs text-slate-400">Quick booking assistant</div>
            </div>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-white text-xl p-1">✕</button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-4 py-3 whitespace-pre-line text-sm leading-relaxed ${
                msg.type === 'user'
                  ? 'bg-[#22c55e] text-white rounded-2xl rounded-br-sm'
                  : 'bg-[#1e293b] text-white rounded-2xl rounded-bl-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}

          {(isTyping || isAnalyzing) && (
            <div className="flex justify-start">
              <div className="bg-[#1e293b] rounded-2xl rounded-bl-sm px-4 py-3">
                {isAnalyzing ? (
                  <span className="text-slate-300 text-sm">🛰️ Analyzing satellite imagery...</span>
                ) : (
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SERVICE SELECTION - 2 column grid like King City */}
          {!isTyping && step === STEPS.SERVICE && messages.length > 0 && (
            <div className="space-y-3">
              <p className="text-slate-400 text-sm">What kind of service?</p>
              <div className="grid grid-cols-2 gap-2">
                {config.services.map(service => (
                  <button
                    key={service.id}
                    onClick={() => handleServiceSelect(service.id)}
                    className="bg-[#1e293b] hover:bg-[#334155] rounded-xl p-3 flex items-center gap-3 transition-colors text-left border border-[#334155] hover:border-[#22c55e]"
                  >
                    <div className="w-9 h-9 bg-[#22c55e]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">{ServiceIcons[service.id] || service.emoji}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-white text-sm">{service.name}</p>
                      <p className="text-xs text-slate-400 truncate">{service.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PROJECT TYPE SELECTION - 2 column grid */}
          {!isTyping && step === STEPS.PROJECT_TYPE && (
            <div className="space-y-3">
              <p className="text-slate-400 text-sm">What type of property?</p>
              <div className="grid grid-cols-2 gap-2">
                {config.projectTypes.map(project => (
                  <button
                    key={project.id}
                    onClick={() => handleProjectSelect(project.id)}
                    className="bg-[#1e293b] hover:bg-[#334155] rounded-xl p-3 flex items-center gap-3 transition-colors text-left border border-[#334155] hover:border-[#22c55e] relative"
                  >
                    {project.discount > 0 && (
                      <span className="absolute -top-2 right-2 bg-[#22c55e] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {Math.round(project.discount * 100)}% OFF
                      </span>
                    )}
                    <div className="w-9 h-9 bg-[#22c55e]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">{ProjectIcons[project.id] || project.emoji}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-white text-sm">{project.label}</p>
                      <p className="text-xs text-slate-400 truncate">{project.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* MAP MEASURING STEP */}
          {!isTyping && !isAnalyzing && step === STEPS.MAP_MEASURING && (
            <div className="space-y-3">
              <div className="bg-[#1e293b] rounded-xl overflow-hidden border border-[#334155]">
                <div className="relative" style={{ height: '240px' }}>
                  <div ref={mapContainerRef} className="h-full w-full bg-[#0f172a]" />

                  {!mapLoaded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-[#0f172a]">
                      <div className="w-14 h-14 bg-[#22c55e]/20 rounded-xl flex items-center justify-center mb-3 animate-pulse">
                        <Truck className="w-7 h-7 text-[#22c55e]" />
                      </div>
                      <p className="text-white font-medium">Loading satellite view...</p>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-[#0f172a] border-t border-[#334155]">
                  {drawnArea ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-3 bg-[#22c55e]/60 border-2 border-[#22c55e] rounded-sm"></div>
                        <div>
                          <span className="text-white font-bold">{drawnArea.toLocaleString()} sq ft</span>
                          <span className="text-slate-400 text-sm ml-2">
                            ${bookingData.estimateLow.toLocaleString()} - ${bookingData.estimateHigh.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <span className="text-[#22c55e] text-xs">Drag corners to adjust</span>
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm text-center">
                      {mapLoaded ? 'Tap corners to outline the area' : 'Loading...'}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setMessages(prev => prev.slice(0, -2))
                    setBookingData(prev => ({ ...prev, address: '' }))
                    setStep(STEPS.ADDRESS)
                  }}
                  className="flex-1 bg-[#1e293b] hover:bg-[#334155] text-white rounded-xl py-3 flex items-center justify-center gap-2 border border-[#334155]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                {drawnArea && (
                  <button
                    onClick={clearDrawing}
                    className="bg-[#1e293b] hover:bg-[#334155] text-slate-300 rounded-xl px-4 py-3 flex items-center justify-center gap-2 border border-[#334155]"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Redraw
                  </button>
                )}
                <button
                  onClick={handleMapConfirm}
                  disabled={!drawnArea}
                  className={`flex-[2] flex items-center justify-center gap-2 py-3 rounded-xl font-semibold ${
                    drawnArea
                      ? 'bg-[#22c55e] hover:bg-[#1ea550] text-white'
                      : 'bg-[#334155] text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Check className="w-5 h-5" />
                  Confirm Area
                </button>
              </div>
            </div>
          )}

          {/* CONDITION SELECTION - 2 column grid */}
          {!isTyping && step === STEPS.CONDITION && (
            <div className="space-y-3">
              <p className="text-slate-400 text-sm">Current pavement condition:</p>
              <div className="grid grid-cols-2 gap-2">
                {config.conditions.map(condition => (
                  <button
                    key={condition.id}
                    onClick={() => handleConditionSelect(condition.id)}
                    className="bg-[#1e293b] hover:bg-[#334155] rounded-xl p-3 text-left transition-colors border border-[#334155] hover:border-[#22c55e]"
                  >
                    <p className="font-semibold text-white text-sm">{condition.label}</p>
                    <p className="text-xs text-slate-400">{condition.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* DATE SELECTION - Calendar */}
          {!isTyping && step === STEPS.DATE && (
            <div className="bg-[#1e293b] rounded-xl p-4 border border-[#334155]">
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))}
                  className="text-slate-400 hover:text-white text-lg px-2"
                >‹</button>
                <span className="text-white font-bold">{formatMonthYear(calendarMonth)}</span>
                <button
                  onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))}
                  className="text-slate-400 hover:text-white text-lg px-2"
                >›</button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} className="text-center text-slate-500 text-xs font-semibold py-1">{day}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {getCalendarDays().map((day, i) => (
                  <button
                    key={i}
                    onClick={() => day.date && day.isAvailable && handleDateSelect(day.date)}
                    disabled={!day.date || !day.isAvailable}
                    className={`aspect-square rounded-lg text-sm font-medium transition-colors ${
                      day.date
                        ? day.isAvailable
                          ? 'bg-[#334155] text-white hover:bg-[#22c55e]'
                          : 'text-slate-600 cursor-default'
                        : ''
                    }`}
                  >
                    {day.date?.getDate() || ''}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SUMMARY */}
          {!isTyping && step === STEPS.SUMMARY && (
            <div className="space-y-3">
              <div className="bg-[#1e293b] rounded-xl p-4 border border-[#334155]">
                <h4 className="font-semibold text-white mb-3">Order Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-[#334155]">
                    <span className="text-slate-400">Service</span>
                    <span className="text-white">{bookingData.serviceName}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#334155]">
                    <span className="text-slate-400">Property</span>
                    <span className="text-white">{bookingData.projectTypeName}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#334155]">
                    <span className="text-slate-400">Area</span>
                    <span className="text-white">{bookingData.squareFootage.toLocaleString()} sq ft</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#334155]">
                    <span className="text-slate-400">Date</span>
                    <span className="text-white">{bookingData.deliveryDateLabel}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#334155]">
                    <span className="text-slate-400">Contact</span>
                    <span className="text-white text-right">{bookingData.name}<br/><span className="text-slate-400">{bookingData.phone}</span></span>
                  </div>
                </div>
              </div>

              <div className="bg-[#22c55e]/10 border border-[#22c55e]/30 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold">Estimate</span>
                  <span className="text-[#22c55e] font-bold text-xl">
                    ${bookingData.estimateLow.toLocaleString()} - ${bookingData.estimateHigh.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={handleConfirmBooking}
                className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-white rounded-xl py-4 font-bold flex items-center justify-center gap-2"
              >
                Confirm Booking
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {(step === STEPS.ADDRESS || step === STEPS.CONTACT) && (
          <div className="p-4 border-t border-[#334155] flex-shrink-0 bg-[#0f172a]">
            <form onSubmit={handleInputSubmit} className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={step === STEPS.ADDRESS ? "Enter delivery address..." : "Your name and phone (e.g. John Smith, 618-555-1234)"}
                className="flex-1 px-4 py-3 bg-[#1e293b] border border-[#334155] rounded-xl text-white text-sm placeholder-slate-500 outline-none focus:border-[#22c55e]"
                autoFocus
              />
              <button
                type="submit"
                className="bg-[#22c55e] hover:bg-[#1ea550] text-white px-5 py-3 rounded-xl"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 text-center border-t border-[#334155] flex-shrink-0 bg-[#0f172a]">
          <a href={`tel:${config.phoneRaw}`} className="text-slate-400 hover:text-[#22c55e] text-sm inline-flex items-center gap-1">
            Need help? <Phone className="w-3 h-3" /> {config.phone}
          </a>
        </div>
      </div>
    )
  }
}
