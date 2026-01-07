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
  embedded?: boolean // When true, don't show floating button
}

export default function PavingChatbot({ onClose, embedded = false }: PavingChatbotProps) {
  // UI State
  const [isOpen, setIsOpen] = useState(embedded) // Auto-open if embedded
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
      addBotMessage("Hey! 👋 What service do you need?", 300)
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
    // Load Google Maps script if not present
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

    // Use stored coordinates or geocode
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

    // Create map with satellite view
    const map = new window.google.maps.Map(mapContainerRef.current, {
      center,
      zoom: 20,
      mapTypeId: 'satellite',
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
        scale: 8,
        fillColor: '#ffffff',
        fillOpacity: 1,
        strokeColor: '#22c55e',
        strokeWeight: 3,
      },
      title: 'Address'
    })

    // Drawing manager for polygon
    const drawingManager = new window.google.maps.drawing.DrawingManager({
      drawingMode: null,
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

    // If we have polygon points (from AI or previous), draw them
    const pointsToUse = polygonPoints || aiPolygonPoints
    if (pointsToUse && pointsToUse.length >= 3) {
      const polygon = new window.google.maps.Polygon({
        paths: pointsToUse,
        fillColor: '#22c55e',
        fillOpacity: 0.4,
        strokeColor: '#22c55e',
        strokeWeight: 3,
        clickable: true,
        editable: true,
        draggable: true,
      })
      polygon.setMap(map)
      polygonRef.current = polygon

      // Calculate and set initial area
      const area = window.google.maps.geometry.spherical.computeArea(polygon.getPath())
      const sqft = Math.round(area * 10.7639)
      setDrawnArea(sqft)

      // Update estimate based on area
      const estimate = calculateEstimate(sqft, bookingData.service, bookingData.discount)
      setBookingData(prev => ({
        ...prev,
        squareFootage: sqft,
        estimateLow: estimate.low,
        estimateHigh: estimate.high
      }))

      // Listen for polygon edits
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

      // Fit map to polygon bounds
      const bounds = new window.google.maps.LatLngBounds()
      polygon.getPath().forEach((latLng: any) => bounds.extend(latLng))
      map.fitBounds(bounds, 50)
    } else {
      // No polygon - enable drawing mode
      drawingManager.setDrawingMode(window.google.maps.drawing.OverlayType.POLYGON)
    }

    // Listen for new polygon drawn by user
    window.google.maps.event.addListener(drawingManager, 'polygoncomplete', (polygon: any) => {
      // Remove old polygon
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
    await addBotMessage("What type of property?")
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
    if (discount > 0) msg += ` (${Math.round(discount * 100)}% off!)`
    addUserMessage(msg)

    await addBotMessage("What's the address?")
    setStep(STEPS.ADDRESS)
  }

  const handleAddressSubmit = async () => {
    if (!inputValue.trim()) return
    const address = inputValue.trim()
    setBookingData(prev => ({ ...prev, address }))
    addUserMessage(address)
    setInputValue('')

    // Analyze with AI
    setIsAnalyzing(true)
    await addBotMessage("🛰️ Analyzing satellite imagery to outline your area...")

    try {
      const response = await fetch('/api/estimate-area', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, projectType: bookingData.projectType })
      })
      const result = await response.json()
      setIsAnalyzing(false)

      // Store coordinates
      if (result.coordinates) {
        setMapCoordinates(result.coordinates)
      }

      if (result.success && result.polygonPoints && result.polygonPoints.length >= 3) {
        // AI found and traced the area
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

        await addBotMessage(`🎯 Found it! ${result.description}\n\n📐 ~${sqft.toLocaleString()} sq ft\n💰 $${estimate.low.toLocaleString()} - $${estimate.high.toLocaleString()}\n\nI've outlined the area on the map. Please verify it's correct - you can drag the corners to adjust.`)
        setStep(STEPS.MAP_MEASURING)
        // Load map with AI polygon after step change
        setTimeout(() => loadMap(result.polygonPoints), 100)
      } else if (result.coordinates) {
        // Have coordinates but no polygon
        await addBotMessage("📍 Found the location! Draw the area you need serviced on the map.")
        setStep(STEPS.MAP_MEASURING)
        setTimeout(() => loadMap(), 100)
      } else {
        await addBotMessage("Couldn't find that address. Please try again with a full address.")
      }
    } catch {
      setIsAnalyzing(false)
      await addBotMessage("Let's find it on the map. Draw the area you need serviced.")
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

    addUserMessage(`${drawnArea.toLocaleString()} sq ft confirmed`)
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

    await addBotMessage("When do you want us to come out?")
    setStep(STEPS.DATE)
  }

  const handleDateSelect = async (date: Date) => {
    const label = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    const value = date.toISOString().split('T')[0]
    setBookingData(prev => ({ ...prev, deliveryDate: value, deliveryDateLabel: label }))
    addUserMessage(label)
    await addBotMessage("Last step - your name and phone number?")
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
      await addBotMessage("Here's your quote summary:")
      setStep(STEPS.SUMMARY)
    } else {
      await addBotMessage("Please include both name and phone.\nExample: John Smith 555-123-4567")
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
        await addBotMessage(`Booked! 🎉\n\nWe'll call you at ${bookingData.phone} to confirm your ${bookingData.deliveryDateLabel} appointment.\n\nThank you for choosing ${config.businessName}!`)
      } else {
        await addBotMessage(`Something went wrong. Please call us at ${config.phone}`)
      }
    } catch {
      setIsTyping(false)
      await addBotMessage(`Couldn't submit online. Please call ${config.phone}`)
    }

    setStep(STEPS.COMPLETE)
  }

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (step === STEPS.ADDRESS) handleAddressSubmit()
    else if (step === STEPS.CONTACT) handleContactSubmit()
  }

  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      setIsOpen(false)
    }
  }

  // ==========================================
  // RENDER
  // ==========================================

  // If embedded (in ChatWidget), don't show floating button
  if (embedded) {
    return renderChatWindow()
  }

  return (
    <div>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-[#22c55e] hover:bg-[#1ea550] rounded-full shadow-lg flex items-center justify-center z-50 transition-all duration-200 hover:scale-110"
          aria-label="Open chat"
        >
          <span className="text-2xl">💬</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && renderChatWindow()}
    </div>
  )

  function renderChatWindow() {
    return (
      <div className={`${embedded ? 'h-full' : 'fixed bottom-6 right-6 w-[380px] max-w-[calc(100vw-48px)] h-[600px] max-h-[calc(100vh-48px)]'} bg-[#1a1714] rounded-2xl flex flex-col z-50 overflow-hidden shadow-2xl`}>
        {/* Header */}
        <div className="p-4 bg-[#22c55e] flex justify-between items-center flex-shrink-0">
          <div>
            <div className="font-bold text-white text-base">{config.businessName}</div>
            <div className="text-sm text-white/80">Get an instant estimate</div>
          </div>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white text-2xl p-1"
            aria-label="Close chat"
          >
            ✕
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} mb-3`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 whitespace-pre-line text-sm leading-relaxed ${
                  msg.type === 'user'
                    ? 'bg-[#22c55e] text-white rounded-[18px] rounded-br-[4px]'
                    : 'bg-[#252220] text-white rounded-[18px] rounded-bl-[4px]'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {(isTyping || isAnalyzing) && (
            <div className="text-[#6B665F] py-2 text-sm">
              {isAnalyzing ? '🛰️ Analyzing satellite image...' : (
                <span className="flex gap-1">
                  <span className="w-2 h-2 bg-[#6B665F] rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                  <span className="w-2 h-2 bg-[#6B665F] rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                  <span className="w-2 h-2 bg-[#6B665F] rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
                </span>
              )}
            </div>
          )}

          {/* SERVICE SELECTION */}
          {!isTyping && step === STEPS.SERVICE && messages.length > 0 && (
            <div className="space-y-2">
              {config.services.map(service => (
                <button
                  key={service.id}
                  onClick={() => handleServiceSelect(service.id)}
                  className="w-full p-4 bg-[#252220] border border-[#302d2a] rounded-xl text-left transition-colors hover:border-[#22c55e]"
                >
                  <div className="text-2xl mb-1">{service.emoji}</div>
                  <div className="font-bold text-white mb-1">{service.name}</div>
                  <div className="text-xs text-[#9C9690]">{service.description}</div>
                </button>
              ))}
            </div>
          )}

          {/* PROJECT TYPE SELECTION */}
          {!isTyping && step === STEPS.PROJECT_TYPE && (
            <div className="space-y-2">
              {config.projectTypes.map(project => (
                <button
                  key={project.id}
                  onClick={() => handleProjectSelect(project.id)}
                  className="w-full p-4 bg-[#252220] border border-[#302d2a] rounded-xl text-left transition-colors hover:border-[#22c55e] relative"
                >
                  {project.discount > 0 && (
                    <span className="absolute -top-2 right-3 bg-[#22c55e] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {Math.round(project.discount * 100)}% OFF
                    </span>
                  )}
                  <div className="text-2xl mb-1">{project.emoji}</div>
                  <div className="font-bold text-white mb-1">{project.label}</div>
                  <div className="text-xs text-[#9C9690]">{project.description}</div>
                </button>
              ))}
            </div>
          )}

          {/* MAP MEASURING STEP */}
          {!isTyping && !isAnalyzing && step === STEPS.MAP_MEASURING && (
            <div className="space-y-3">
              {/* Map Container */}
              <div className="bg-[#252220] rounded-xl overflow-hidden">
                <div className="p-3 border-b border-[#302d2a]">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-white font-medium text-sm">
                        {aiPolygonPoints.length > 0 ? '🎯 AI Outlined Area' : 'Draw Your Area'}
                      </div>
                      <div className="text-[#9C9690] text-xs">
                        {aiPolygonPoints.length > 0
                          ? 'Drag corners to adjust the boundary'
                          : 'Tap to place corners, double-tap to finish'}
                      </div>
                    </div>
                  </div>
                </div>

                <div ref={mapContainerRef} className="h-[200px] bg-[#1a1714]" />

                <div className="p-3 border-t border-[#302d2a]">
                  {drawnArea ? (
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-[#9C9690] text-xs">
                          {aiPolygonPoints.length > 0 ? '🤖 AI Measured' : '📐 Measured'}
                        </div>
                        <div className="text-white text-xl font-bold">
                          {drawnArea.toLocaleString()} sq ft
                        </div>
                        <div className="text-[#22c55e] text-sm font-medium">
                          ${bookingData.estimateLow.toLocaleString()} - ${bookingData.estimateHigh.toLocaleString()}
                        </div>
                      </div>
                      <button
                        onClick={clearDrawing}
                        className="px-3 py-2 bg-[#302d2a] text-[#ef4444] rounded-lg text-sm hover:bg-[#3a3733]"
                      >
                        Redraw
                      </button>
                    </div>
                  ) : (
                    <div className="text-[#9C9690] text-center text-sm">
                      {mapLoaded ? 'Tap corners to outline the area' : 'Loading map...'}
                    </div>
                  )}
                </div>
              </div>

              {/* Confirm Button */}
              <button
                onClick={handleMapConfirm}
                disabled={!drawnArea}
                className={`w-full py-3 rounded-xl font-bold text-base flex items-center justify-center gap-2 ${
                  drawnArea
                    ? 'bg-[#22c55e] text-white hover:bg-[#1ea550]'
                    : 'bg-[#3a3733] text-[#6B665F] cursor-not-allowed'
                }`}
              >
                ✓ Confirm Area
              </button>
            </div>
          )}

          {/* CONDITION SELECTION */}
          {!isTyping && step === STEPS.CONDITION && (
            <div className="grid grid-cols-2 gap-2">
              {config.conditions.map(condition => (
                <button
                  key={condition.id}
                  onClick={() => handleConditionSelect(condition.id)}
                  className="p-3 bg-[#252220] border border-[#302d2a] rounded-xl text-left transition-colors hover:border-[#22c55e]"
                >
                  <div className="font-bold text-white text-sm">{condition.label}</div>
                  <div className="text-xs text-[#9C9690]">{condition.description}</div>
                </button>
              ))}
            </div>
          )}

          {/* DATE SELECTION - Calendar */}
          {!isTyping && step === STEPS.DATE && (
            <div className="bg-[#252220] rounded-xl p-4 border border-[#302d2a]">
              {/* Month Navigation */}
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))}
                  className="text-[#9C9690] hover:text-white text-lg px-2"
                >
                  ‹
                </button>
                <span className="text-white font-bold">
                  {formatMonthYear(calendarMonth)}
                </span>
                <button
                  onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))}
                  className="text-[#9C9690] hover:text-white text-lg px-2"
                >
                  ›
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} className="text-center text-[#6B665F] text-xs font-semibold py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {getCalendarDays().map((day, i) => (
                  <button
                    key={i}
                    onClick={() => day.date && day.isAvailable && handleDateSelect(day.date)}
                    disabled={!day.date || !day.isAvailable}
                    className={`aspect-square rounded-lg text-sm font-medium transition-colors ${
                      day.date
                        ? day.isAvailable
                          ? 'bg-[#302d2a] text-white hover:bg-[#22c55e]'
                          : 'text-[#4a4540] cursor-default'
                        : ''
                    }`}
                  >
                    {day.date?.getDate() || ''}
                  </button>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-[#302d2a] flex gap-4 justify-center text-xs text-[#6B665F]">
                <span>🟢 Available</span>
                <span>⚫ Unavailable</span>
              </div>
            </div>
          )}

          {/* SUMMARY */}
          {!isTyping && step === STEPS.SUMMARY && (
            <div>
              <div className="bg-[#252220] rounded-xl p-4 mb-3">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-[#302d2a]">
                    <span className="text-[#9C9690]">Service</span>
                    <span className="text-white font-medium">{bookingData.serviceName}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#302d2a]">
                    <span className="text-[#9C9690]">Property</span>
                    <span className="text-white font-medium">{bookingData.projectTypeName}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#302d2a]">
                    <span className="text-[#9C9690]">Area</span>
                    <span className="text-white font-medium">{bookingData.squareFootage.toLocaleString()} sq ft</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#302d2a]">
                    <span className="text-[#9C9690]">Date</span>
                    <span className="text-white font-medium">{bookingData.deliveryDateLabel}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#302d2a]">
                    <span className="text-[#9C9690]">Contact</span>
                    <span className="text-white font-medium text-right">
                      {bookingData.name}<br/>
                      <span className="text-[#888]">{bookingData.phone}</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-white font-bold text-base">Estimate</span>
                    <span className="text-[#22c55e] font-bold text-xl">
                      ${bookingData.estimateLow.toLocaleString()} - ${bookingData.estimateHigh.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleConfirmBooking}
                className="w-full py-4 bg-[#f59e0b] hover:bg-[#d97706] text-white rounded-xl font-bold text-base"
              >
                Confirm Booking →
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {(step === STEPS.ADDRESS || step === STEPS.CONTACT) && (
          <div className="p-4 border-t border-[#222] flex-shrink-0">
            <form onSubmit={handleInputSubmit} className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={step === STEPS.ADDRESS ? "Enter full address..." : "Name and phone..."}
                className="flex-1 px-4 py-3 bg-[#252220] border border-[#302d2a] rounded-xl text-white text-sm placeholder-[#6B665F] outline-none focus:border-[#22c55e]"
                autoFocus
              />
              <button
                type="submit"
                className="px-5 py-3 bg-[#22c55e] hover:bg-[#1ea550] rounded-xl text-white font-bold text-lg"
              >
                →
              </button>
            </form>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 text-center border-t border-[#222] flex-shrink-0">
          <a href={`tel:${config.phoneRaw}`} className="text-[#22c55e] text-sm">
            📞 {config.phone}
          </a>
        </div>
      </div>
    )
  }
}
