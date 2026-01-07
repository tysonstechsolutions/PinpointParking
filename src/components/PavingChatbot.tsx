/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useRef } from 'react'
import { config } from '@/config/config'

// Google Maps type declarations
declare global {
  interface Window {
    google: any
  }
}

// Website colors
const COLORS = {
  yellow: '#F5C518',
  yellowDark: '#D4A814',
  yellowLight: '#FFD54F',
  black: '#1a1714',
  blackLight: '#252220',
  blackMedium: '#302d2a',
  gray: '#9C9690',
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

interface PavingChatbotProps {
  onClose?: () => void
  embedded?: boolean
}

export default function PavingChatbot({ onClose, embedded = false }: PavingChatbotProps) {
  const [isOpen, setIsOpen] = useState(embedded)
  const [step, setStep] = useState(STEPS.SERVICE)
  const [messages, setMessages] = useState<{type: string, text: string}[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const [mapLoaded, setMapLoaded] = useState(false)
  const [drawnArea, setDrawnArea] = useState<number | null>(null)
  const [aiPolygonPoints, setAiPolygonPoints] = useState<Array<{lat: number, lng: number}>>([])
  const [mapCoordinates, setMapCoordinates] = useState<{lat: number, lng: number} | null>(null)
  const [calendarMonth, setCalendarMonth] = useState(new Date())

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

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const drawingManagerRef = useRef<any>(null)
  const polygonRef = useRef<any>(null)

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

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addBotMessage("Hey! Need paving work? Tell me about your project and I'll give you an instant estimate.", 300)
    }
  }, [isOpen, messages.length])

  const calculateEstimate = (sqft: number, serviceId: string, discount = 0) => {
    const service = config.services.find(s => s.id === serviceId)
    if (!service) return { low: 0, high: 0 }
    let base = sqft * service.pricePerSqFt
    base = Math.max(base, service.minPrice)
    if (discount > 0) base = base * (1 - discount)
    const buffer = service.estimateBuffer || 0.20
    return { low: Math.round(base * (1 - buffer)), high: Math.round(base * (1 + buffer)) }
  }

  // Google Maps
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
          if (window.google?.maps?.drawing) { clearInterval(check); resolve() }
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
      center, zoom: 20, mapTypeId: 'hybrid',
      disableDefaultUI: true, zoomControl: true, gestureHandling: 'greedy',
    })
    mapRef.current = map

    new window.google.maps.Marker({
      position: center, map,
      icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: COLORS.yellow, fillOpacity: 1, strokeColor: COLORS.black, strokeWeight: 3 },
    })

    const drawingManager = new window.google.maps.drawing.DrawingManager({
      drawingMode: null, drawingControl: false,
      polygonOptions: { fillColor: COLORS.yellow, fillOpacity: 0.5, strokeColor: COLORS.yellow, strokeWeight: 3, editable: true, draggable: true },
    })
    drawingManager.setMap(map)
    drawingManagerRef.current = drawingManager

    const pointsToUse = polygonPoints || aiPolygonPoints
    if (pointsToUse && pointsToUse.length >= 3) {
      const polygon = new window.google.maps.Polygon({
        paths: pointsToUse, fillColor: COLORS.yellow, fillOpacity: 0.5, strokeColor: COLORS.yellow, strokeWeight: 3, editable: true, draggable: true,
      })
      polygon.setMap(map)
      polygonRef.current = polygon

      const area = window.google.maps.geometry.spherical.computeArea(polygon.getPath())
      const sqft = Math.round(area * 10.7639)
      setDrawnArea(sqft)
      const estimate = calculateEstimate(sqft, bookingData.service, bookingData.discount)
      setBookingData(prev => ({ ...prev, squareFootage: sqft, estimateLow: estimate.low, estimateHigh: estimate.high }))

      const updateArea = () => {
        const newArea = window.google.maps.geometry.spherical.computeArea(polygon.getPath())
        const newSqft = Math.round(newArea * 10.7639)
        setDrawnArea(newSqft)
        const newEstimate = calculateEstimate(newSqft, bookingData.service, bookingData.discount)
        setBookingData(prev => ({ ...prev, squareFootage: newSqft, estimateLow: newEstimate.low, estimateHigh: newEstimate.high }))
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
        setBookingData(prev => ({ ...prev, squareFootage: sqft, estimateLow: estimate.low, estimateHigh: estimate.high }))
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
    if (polygonRef.current) { polygonRef.current.setMap(null); polygonRef.current = null }
    setDrawnArea(null)
    setAiPolygonPoints([])
    if (drawingManagerRef.current && window.google?.maps) {
      drawingManagerRef.current.setDrawingMode(window.google.maps.drawing.OverlayType.POLYGON)
    }
  }

  // Calendar
  const getCalendarDays = () => {
    const year = calendarMonth.getFullYear()
    const month = calendarMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startPadding = firstDay.getDay()
    const days: Array<{ date: Date | null; isAvailable: boolean }> = []
    for (let i = 0; i < startPadding; i++) days.push({ date: null, isAvailable: false })
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const minDate = new Date(today); minDate.setDate(today.getDate() + config.booking.minDaysOut)
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d)
      const isPast = date < minDate
      const isSunday = date.getDay() === 0 && config.booking.skipSundays
      days.push({ date, isAvailable: !isPast && !isSunday })
    }
    return days
  }

  // Handlers
  const handleServiceSelect = async (serviceId: string) => {
    const service = config.services.find(s => s.id === serviceId)!
    setBookingData(prev => ({ ...prev, service: serviceId, serviceName: service.name }))
    addUserMessage(service.name)
    await addBotMessage("What type of property is this?")
    setStep(STEPS.PROJECT_TYPE)
  }

  const handleProjectSelect = async (projectId: string) => {
    const project = config.projectTypes.find(p => p.id === projectId)!
    setBookingData(prev => ({ ...prev, projectType: projectId, projectTypeName: project.label, discount: project.discount || 0 }))
    addUserMessage(project.label)
    await addBotMessage("What's the address?")
    setStep(STEPS.ADDRESS)
  }

  const handleAddressSubmit = async () => {
    if (!inputValue.trim()) return
    const address = inputValue.trim()
    setBookingData(prev => ({ ...prev, address }))
    addUserMessage(address)
    setInputValue('')
    setIsAnalyzing(true)
    await addBotMessage("Analyzing satellite imagery...")

    try {
      const response = await fetch('/api/estimate-area', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, projectType: bookingData.projectType })
      })
      const result = await response.json()
      setIsAnalyzing(false)
      if (result.coordinates) setMapCoordinates(result.coordinates)

      if (result.success && result.polygonPoints?.length >= 3) {
        setAiPolygonPoints(result.polygonPoints)
        const sqft = result.squareFootage
        const estimate = calculateEstimate(sqft, bookingData.service, bookingData.discount)
        setBookingData(prev => ({ ...prev, squareFootage: sqft, estimateLow: estimate.low, estimateHigh: estimate.high, address: result.formattedAddress || address }))
        await addBotMessage(`Found it! Estimated area: ${sqft.toLocaleString()} sq ft\n\nEstimate: $${estimate.low.toLocaleString()} - $${estimate.high.toLocaleString()}\n\nVerify the outlined area below. Drag corners to adjust.`)
        setStep(STEPS.MAP_MEASURING)
        setTimeout(() => loadMap(result.polygonPoints), 100)
      } else if (result.coordinates) {
        await addBotMessage("Found the location. Draw the area you need serviced on the map below.")
        setStep(STEPS.MAP_MEASURING)
        setTimeout(() => loadMap(), 100)
      } else {
        await addBotMessage("Couldn't find that address. Please enter the full address including city and state.")
      }
    } catch {
      setIsAnalyzing(false)
      await addBotMessage("Draw the area you need serviced on the map below.")
      setStep(STEPS.MAP_MEASURING)
      setTimeout(() => loadMap(), 100)
    }
  }

  const handleMapConfirm = async () => {
    if (!drawnArea) return
    const estimate = calculateEstimate(drawnArea, bookingData.service, bookingData.discount)
    setBookingData(prev => ({ ...prev, squareFootage: drawnArea, estimateLow: estimate.low, estimateHigh: estimate.high }))
    addUserMessage(`${drawnArea.toLocaleString()} sq ft`)
    await addBotMessage("What's the current condition of the pavement?")
    setStep(STEPS.CONDITION)
  }

  const handleConditionSelect = async (conditionId: string) => {
    const condition = config.conditions.find(c => c.id === conditionId)!
    setBookingData(prev => ({ ...prev, condition: conditionId }))
    addUserMessage(condition.label)
    if (condition.adjustment > 0) {
      setBookingData(prev => ({ ...prev, estimateHigh: Math.round(prev.estimateHigh * (1 + condition.adjustment)) }))
    }
    await addBotMessage("When would you like us to come out?")
    setStep(STEPS.DATE)
  }

  const handleDateSelect = async (date: Date) => {
    const label = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    setBookingData(prev => ({ ...prev, deliveryDate: date.toISOString().split('T')[0], deliveryDateLabel: label }))
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
      await addBotMessage(`Thanks ${name}! Here's your quote:`)
      setStep(STEPS.SUMMARY)
    } else {
      await addBotMessage("Please include both your name and phone number.\n\nExample: John Smith 618-555-1234")
    }
  }

  const handleConfirmBooking = async () => {
    addUserMessage("Confirm")
    setIsTyping(true)
    try {
      const response = await fetch('/api/paving-quote', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: bookingData.service, projectType: bookingData.projectType,
          squareFootage: bookingData.squareFootage, condition: bookingData.condition,
          address: bookingData.address, customerName: bookingData.name, customerPhone: bookingData.phone,
          estimateLow: bookingData.estimateLow, estimateHigh: bookingData.estimateHigh, preferredDate: bookingData.deliveryDate,
        }),
      })
      const result = await response.json()
      setIsTyping(false)
      if (result.success) {
        await addBotMessage(`Booking confirmed!\n\nWe'll contact you at ${bookingData.phone} to confirm your ${bookingData.deliveryDateLabel} appointment.\n\nQuestions? Call ${config.phone}`)
      } else {
        await addBotMessage(`Something went wrong. Please call us at ${config.phone}`)
      }
    } catch {
      setIsTyping(false)
      await addBotMessage(`Couldn't submit. Please call ${config.phone}`)
    }
    setStep(STEPS.COMPLETE)
  }

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (step === STEPS.ADDRESS) handleAddressSubmit()
    else if (step === STEPS.CONTACT) handleContactSubmit()
  }

  const handleClose = () => { if (onClose) onClose(); else setIsOpen(false) }

  if (embedded) return renderChatWindow()

  return (
    <div>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-lg flex items-center justify-center z-50 transition-transform hover:scale-105"
          style={{ backgroundColor: COLORS.yellow }}
        >
          <svg className="w-8 h-8" style={{ color: COLORS.black }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      )}
      {isOpen && renderChatWindow()}
    </div>
  )

  function renderChatWindow() {
    return (
      <div
        className={`${embedded ? 'h-full' : 'fixed bottom-6 right-6 w-[500px] max-w-[calc(100vw-48px)] h-[680px] max-h-[calc(100vh-48px)]'} rounded-xl flex flex-col z-50 overflow-hidden shadow-2xl`}
        style={{ backgroundColor: COLORS.black }}
      >
        {/* Header - Yellow */}
        <div className="px-5 py-4 flex items-center justify-between" style={{ backgroundColor: COLORS.yellow }}>
          <div>
            <h2 className="font-bold text-lg" style={{ color: COLORS.black }}>{config.businessName}</h2>
            <p className="text-sm opacity-80" style={{ color: COLORS.black }}>Quick booking assistant</p>
          </div>
          <button onClick={handleClose} className="text-2xl font-light opacity-70 hover:opacity-100" style={{ color: COLORS.black }}>&times;</button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className="max-w-[85%] px-4 py-3 whitespace-pre-line text-base leading-relaxed rounded-2xl"
                style={msg.type === 'user'
                  ? { backgroundColor: COLORS.yellow, color: COLORS.black, borderBottomRightRadius: '4px' }
                  : { backgroundColor: COLORS.blackLight, color: '#fff', borderBottomLeftRadius: '4px' }
                }
              >
                {msg.text}
              </div>
            </div>
          ))}

          {(isTyping || isAnalyzing) && (
            <div className="flex justify-start">
              <div className="rounded-2xl px-4 py-3 text-base" style={{ backgroundColor: COLORS.blackLight, color: '#fff', borderBottomLeftRadius: '4px' }}>
                {isAnalyzing ? 'Analyzing satellite imagery...' : '...'}
              </div>
            </div>
          )}

          {/* SERVICE SELECTION */}
          {!isTyping && step === STEPS.SERVICE && messages.length > 0 && (
            <div className="space-y-3">
              <p className="text-base" style={{ color: COLORS.gray }}>What kind of service do you need?</p>
              <div className="grid grid-cols-2 gap-3">
                {config.services.map(service => (
                  <button
                    key={service.id}
                    onClick={() => handleServiceSelect(service.id)}
                    className="rounded-lg p-4 text-left transition-all border-2"
                    style={{
                      backgroundColor: COLORS.blackLight,
                      borderColor: 'transparent',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = COLORS.yellow}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                  >
                    <p className="font-semibold text-white text-base">{service.name}</p>
                    <p className="text-sm mt-1" style={{ color: COLORS.gray }}>{service.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PROJECT TYPE */}
          {!isTyping && step === STEPS.PROJECT_TYPE && (
            <div className="space-y-3">
              <p className="text-base" style={{ color: COLORS.gray }}>What type of property?</p>
              <div className="grid grid-cols-2 gap-3">
                {config.projectTypes.map(project => (
                  <button
                    key={project.id}
                    onClick={() => handleProjectSelect(project.id)}
                    className="rounded-lg p-4 text-left transition-all border-2 relative"
                    style={{ backgroundColor: COLORS.blackLight, borderColor: 'transparent' }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = COLORS.yellow}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                  >
                    {project.discount > 0 && (
                      <span
                        className="absolute -top-2 -right-2 text-xs font-bold px-2 py-1 rounded-full"
                        style={{ backgroundColor: COLORS.yellow, color: COLORS.black }}
                      >
                        {Math.round(project.discount * 100)}% OFF
                      </span>
                    )}
                    <p className="font-semibold text-white text-base">{project.label}</p>
                    <p className="text-sm mt-1" style={{ color: COLORS.gray }}>{project.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* MAP */}
          {!isTyping && !isAnalyzing && step === STEPS.MAP_MEASURING && (
            <div className="space-y-3">
              <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${COLORS.blackMedium}` }}>
                <div ref={mapContainerRef} className="h-[220px]" style={{ backgroundColor: COLORS.black }} />
                {drawnArea && (
                  <div className="p-3 flex items-center justify-between" style={{ backgroundColor: COLORS.blackLight }}>
                    <div>
                      <span className="text-white font-bold text-lg">{drawnArea.toLocaleString()} sq ft</span>
                      <span className="ml-3 text-base" style={{ color: COLORS.yellow }}>
                        ${bookingData.estimateLow.toLocaleString()} - ${bookingData.estimateHigh.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={clearDrawing}
                  className="flex-1 rounded-lg py-3 text-base font-medium text-white transition-colors"
                  style={{ backgroundColor: COLORS.blackLight }}
                >
                  Redraw
                </button>
                <button
                  onClick={handleMapConfirm}
                  disabled={!drawnArea}
                  className="flex-[2] rounded-lg py-3 text-base font-semibold transition-colors"
                  style={drawnArea
                    ? { backgroundColor: COLORS.yellow, color: COLORS.black }
                    : { backgroundColor: COLORS.blackMedium, color: COLORS.gray, cursor: 'not-allowed' }
                  }
                >
                  Confirm Area
                </button>
              </div>
            </div>
          )}

          {/* CONDITION */}
          {!isTyping && step === STEPS.CONDITION && (
            <div className="space-y-3">
              <p className="text-base" style={{ color: COLORS.gray }}>Current pavement condition:</p>
              <div className="grid grid-cols-2 gap-3">
                {config.conditions.map(condition => (
                  <button
                    key={condition.id}
                    onClick={() => handleConditionSelect(condition.id)}
                    className="rounded-lg p-4 text-left transition-all border-2"
                    style={{ backgroundColor: COLORS.blackLight, borderColor: 'transparent' }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = COLORS.yellow}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                  >
                    <p className="font-semibold text-white text-base">{condition.label}</p>
                    <p className="text-sm mt-1" style={{ color: COLORS.gray }}>{condition.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* DATE */}
          {!isTyping && step === STEPS.DATE && (
            <div className="rounded-lg p-4" style={{ backgroundColor: COLORS.blackLight }}>
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))}
                  className="text-xl px-2 hover:opacity-100"
                  style={{ color: COLORS.gray }}
                >&lt;</button>
                <span className="text-white font-semibold text-base">{calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                <button
                  onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))}
                  className="text-xl px-2"
                  style={{ color: COLORS.gray }}
                >&gt;</button>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                  <div key={d} className="text-center text-sm py-1" style={{ color: COLORS.gray }}>{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {getCalendarDays().map((day, i) => (
                  <button
                    key={i}
                    onClick={() => day.date && day.isAvailable && handleDateSelect(day.date)}
                    disabled={!day.date || !day.isAvailable}
                    className="aspect-square rounded text-sm font-medium transition-colors"
                    style={
                      day.date
                        ? day.isAvailable
                          ? { backgroundColor: COLORS.blackMedium, color: '#fff' }
                          : { color: '#4a4540' }
                        : {}
                    }
                    onMouseEnter={(e) => { if (day.date && day.isAvailable) e.currentTarget.style.backgroundColor = COLORS.yellow; e.currentTarget.style.color = COLORS.black }}
                    onMouseLeave={(e) => { if (day.date && day.isAvailable) e.currentTarget.style.backgroundColor = COLORS.blackMedium; e.currentTarget.style.color = '#fff' }}
                  >
                    {day.date?.getDate() || ''}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SUMMARY */}
          {!isTyping && step === STEPS.SUMMARY && (
            <div className="space-y-4">
              <div className="rounded-lg p-4 space-y-3" style={{ backgroundColor: COLORS.blackLight }}>
                <div className="flex justify-between text-base"><span style={{ color: COLORS.gray }}>Service</span><span className="text-white">{bookingData.serviceName}</span></div>
                <div className="flex justify-between text-base"><span style={{ color: COLORS.gray }}>Property</span><span className="text-white">{bookingData.projectTypeName}</span></div>
                <div className="flex justify-between text-base"><span style={{ color: COLORS.gray }}>Area</span><span className="text-white">{bookingData.squareFootage.toLocaleString()} sq ft</span></div>
                <div className="flex justify-between text-base"><span style={{ color: COLORS.gray }}>Date</span><span className="text-white">{bookingData.deliveryDateLabel}</span></div>
                <div className="flex justify-between text-base"><span style={{ color: COLORS.gray }}>Contact</span><span className="text-white text-right">{bookingData.name}<br/>{bookingData.phone}</span></div>
                <div className="pt-3 flex justify-between items-center" style={{ borderTop: `1px solid ${COLORS.blackMedium}` }}>
                  <span className="text-white font-semibold text-base">Estimate</span>
                  <span className="font-bold text-xl" style={{ color: COLORS.yellow }}>${bookingData.estimateLow.toLocaleString()} - ${bookingData.estimateHigh.toLocaleString()}</span>
                </div>
              </div>
              <button
                onClick={handleConfirmBooking}
                className="w-full rounded-lg py-4 font-semibold text-lg transition-colors"
                style={{ backgroundColor: COLORS.yellow, color: COLORS.black }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.yellowDark}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.yellow}
              >
                Confirm Booking
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {(step === STEPS.ADDRESS || step === STEPS.CONTACT) && (
          <div className="p-4" style={{ borderTop: `1px solid ${COLORS.blackMedium}` }}>
            <form onSubmit={handleInputSubmit} className="flex gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={step === STEPS.ADDRESS ? "Enter full address..." : "Name and phone number..."}
                className="flex-1 px-4 py-3 rounded-lg text-base outline-none"
                style={{
                  backgroundColor: COLORS.blackLight,
                  color: '#fff',
                  border: `2px solid transparent`,
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = COLORS.yellow}
                onBlur={(e) => e.currentTarget.style.borderColor = 'transparent'}
                autoFocus
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-lg font-semibold text-base transition-colors"
                style={{ backgroundColor: COLORS.yellow, color: COLORS.black }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.yellowDark}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.yellow}
              >
                Send
              </button>
            </form>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 text-center" style={{ borderTop: `1px solid ${COLORS.blackMedium}` }}>
          <a
            href={`tel:${config.phoneRaw}`}
            className="text-sm transition-colors"
            style={{ color: COLORS.gray }}
            onMouseEnter={(e) => e.currentTarget.style.color = COLORS.yellow}
            onMouseLeave={(e) => e.currentTarget.style.color = COLORS.gray}
          >
            Need help? Call {config.phone}
          </a>
        </div>
      </div>
    )
  }
}
