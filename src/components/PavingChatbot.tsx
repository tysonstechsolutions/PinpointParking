/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useRef } from 'react'
import { config } from '@/config/config'

const STEPS = {
  SERVICE: 'service',
  PROJECT_TYPE: 'project_type',
  ADDRESS: 'address',
  MEASURING: 'measuring',
  CONDITION: 'condition',
  DATE: 'date',
  CONTACT: 'contact',
  SUMMARY: 'summary',
  COMPLETE: 'complete'
}

export default function PavingChatbot() {
  // UI State
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState(STEPS.SERVICE)
  const [messages, setMessages] = useState<{type: string, text: string}[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Map State
  const [showMap, setShowMap] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [drawnArea, setDrawnArea] = useState<number | null>(null)
  const [aiPolygonPoints, setAiPolygonPoints] = useState<Array<{lat: number, lng: number}>>([])
  const [mapCoordinates, setMapCoordinates] = useState<{lat: number, lng: number} | null>(null)

  // Calendar State
  const [showCalendar, setShowCalendar] = useState(false)
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

  const getAvailableDates = () => {
    const dates: { label: string; value: string }[] = []
    const today = new Date()
    for (let i = 2; i <= 30 && dates.length < 6; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      if (date.getDay() !== 0) {
        dates.push({
          label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          value: date.toISOString().split('T')[0]
        })
      }
    }
    return dates
  }

  // ==========================================
  // GOOGLE MAPS WITH POLYGON DRAWING
  // ==========================================
  const loadMap = async (presetPolygon?: Array<{lat: number, lng: number}>) => {
    if (!window.google?.maps) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${config.googleMaps.apiKey}&libraries=geometry,drawing`
      script.async = true
      document.head.appendChild(script)
      await new Promise<void>(resolve => {
        const check = setInterval(() => {
          if (window.google?.maps) { clearInterval(check); resolve() }
        }, 100)
        setTimeout(() => { clearInterval(check); resolve() }, 10000)
      })
    }

    if (!window.google?.maps || !mapContainerRef.current) return

    // Use stored coordinates or geocode
    let center = mapCoordinates || config.googleMaps.defaultCenter

    if (!mapCoordinates) {
      const geocoder = new window.google.maps.Geocoder()
      try {
        const result: any = await new Promise((resolve, reject) => {
          geocoder.geocode({ address: bookingData.address }, (results: any, status: string) => {
            if (status === 'OK' && results[0]) resolve(results[0].geometry.location)
            else reject(status)
          })
        })
        center = { lat: result.lat(), lng: result.lng() }
      } catch { /* use default */ }
    }

    // Create map
    const map = new window.google.maps.Map(mapContainerRef.current, {
      center,
      zoom: 20,
      mapTypeId: 'satellite',
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: 'greedy',
    })
    mapRef.current = map

    // Drawing manager for polygon
    const drawingManager = new window.google.maps.drawing.DrawingManager({
      drawingMode: null, // Start with no drawing mode - user clicks "Draw New" if needed
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

    // If we have AI polygon points, draw them
    const polygonToUse = presetPolygon || aiPolygonPoints
    if (polygonToUse && polygonToUse.length >= 3) {
      const polygon = new window.google.maps.Polygon({
        paths: polygonToUse,
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
      setDrawnArea(Math.round(area * 10.7639))

      // Listen for edits
      const updateArea = () => {
        const newArea = window.google.maps.geometry.spherical.computeArea(polygon.getPath())
        setDrawnArea(Math.round(newArea * 10.7639))
      }
      window.google.maps.event.addListener(polygon.getPath(), 'set_at', updateArea)
      window.google.maps.event.addListener(polygon.getPath(), 'insert_at', updateArea)
      window.google.maps.event.addListener(polygon.getPath(), 'remove_at', updateArea)

      // Fit map to polygon bounds
      const bounds = new window.google.maps.LatLngBounds()
      polygon.getPath().forEach((latLng: any) => bounds.extend(latLng))
      map.fitBounds(bounds, 50)
    } else {
      // No preset polygon - enable drawing mode
      drawingManager.setDrawingMode(window.google.maps.drawing.OverlayType.POLYGON)
    }

    // Listen for new polygon complete
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
      window.google.maps.event.addListener(polygon.getPath(), 'remove_at', updateArea)
      drawingManager.setDrawingMode(null)
    })

    setMapLoaded(true)
  }

  useEffect(() => {
    if (showMap && bookingData.address) {
      setMapLoaded(false)
      setDrawnArea(null)
      loadMap()
    }
  }, [showMap])

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

    // Padding for days before month starts
    for (let i = 0; i < startPadding; i++) {
      days.push({ date: null, isAvailable: false })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const minDate = new Date(today)
    minDate.setDate(today.getDate() + 2) // At least 2 days from now

    // Days of the month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d)
      const dayOfWeek = date.getDay()
      const isPast = date < minDate
      const isSunday = dayOfWeek === 0
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

  const handleCalendarDateSelect = async (date: Date) => {
    const label = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    const value = date.toISOString().split('T')[0]
    setShowCalendar(false)
    handleDateSelect(label, value)
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
    const discount = (project as any).discount || 0
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

    // Try AI estimation
    setIsAnalyzing(true)
    await addBotMessage("🛰️ Analyzing satellite imagery...")

    try {
      const response = await fetch('/api/estimate-area', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, projectType: bookingData.projectType })
      })
      const result = await response.json()
      setIsAnalyzing(false)

      // Store coordinates for map centering
      if (result.coordinates) {
        setMapCoordinates(result.coordinates)
      }

      if (result.success && result.squareFootage) {
        const sqft = result.squareFootage
        const estimate = calculateEstimate(sqft, bookingData.service, bookingData.discount)
        setBookingData(prev => ({
          ...prev,
          squareFootage: sqft,
          estimateLow: estimate.low,
          estimateHigh: estimate.high,
          address: result.formattedAddress || address
        }))

        // Store AI polygon points and show map for verification
        if (result.polygonPoints && result.polygonPoints.length >= 3) {
          setAiPolygonPoints(result.polygonPoints)
          await addBotMessage(`🎯 Found it! ${result.description}\n\nPlease verify the outlined area on the map.`)
        } else {
          await addBotMessage(`Found the location! Verify or adjust the area on the map.`)
        }
        setShowMap(true)
        setStep(STEPS.MEASURING)
      } else {
        // Even if analysis fails, we might have coordinates
        await addBotMessage("Draw the area on the map to get your estimate.")
        setShowMap(true)
        setStep(STEPS.MEASURING)
      }
    } catch {
      setIsAnalyzing(false)
      await addBotMessage("Let's measure it. Draw the area on the map.")
      setShowMap(true)
      setStep(STEPS.MEASURING)
    }
  }

  const handleAcceptMeasurement = async () => {
    addUserMessage(`${bookingData.squareFootage.toLocaleString()} sq ft ✓`)
    await addBotMessage("What's the pavement condition?")
    setStep(STEPS.CONDITION)
  }

  const handleOpenMap = () => {
    setShowMap(true)
  }

  const handleMapConfirm = async () => {
    if (!drawnArea) return
    setShowMap(false)

    const estimate = calculateEstimate(drawnArea, bookingData.service, bookingData.discount)
    setBookingData(prev => ({
      ...prev,
      squareFootage: drawnArea,
      estimateLow: estimate.low,
      estimateHigh: estimate.high
    }))

    addUserMessage(`${drawnArea.toLocaleString()} sq ft measured`)
    await addBotMessage(`📐 ${drawnArea.toLocaleString()} sq ft\n💰 $${estimate.low.toLocaleString()} - $${estimate.high.toLocaleString()}\n\nWhat's the pavement condition?`)
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

  const handleDateSelect = async (label: string, value: string) => {
    setBookingData(prev => ({ ...prev, deliveryDate: value, deliveryDateLabel: label }))
    addUserMessage(label)
    await addBotMessage("Last step - your name and phone?")
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
      await addBotMessage("Here's your quote:")
      setStep(STEPS.SUMMARY)
    } else {
      await addBotMessage("Please include name and phone.\nExample: John Smith 555-123-4567")
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
        await addBotMessage(`Booked! 🎉\n\nWe'll call you at ${bookingData.phone} to confirm your ${bookingData.deliveryDateLabel} appointment.\n\nThank you!`)
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

  // ==========================================
  // RENDER
  // ==========================================
  const selectedService = config.services.find(s => s.id === bookingData.service)

  return (
    <div>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#22c55e',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '28px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            zIndex: 1000,
          }}
        >
          💬
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '380px',
          maxWidth: 'calc(100vw - 48px)',
          height: '600px',
          maxHeight: 'calc(100vh - 48px)',
          backgroundColor: '#1a1714',
          borderRadius: '20px',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
        }}>

          {/* Header */}
          <div style={{
            padding: '16px 20px',
            backgroundColor: '#22c55e',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <div style={{ fontWeight: 'bold', color: 'white', fontSize: '16px' }}>{config.businessName}</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>Get an instant estimate</div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '24px', padding: '4px' }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: '12px',
              }}>
                <div style={{
                  maxWidth: '85%',
                  padding: '12px 16px',
                  borderRadius: msg.type === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  backgroundColor: msg.type === 'user' ? '#22c55e' : '#222',
                  color: 'white',
                  whiteSpace: 'pre-line',
                  fontSize: '14px',
                  lineHeight: '1.4',
                }}>
                  {msg.text}
                </div>
              </div>
            ))}

            {(isTyping || isAnalyzing) && (
              <div style={{ color: '#6B665F', padding: '8px', fontSize: '14px' }}>
                {isAnalyzing ? '🛰️ Analyzing...' : 'Typing...'}
              </div>
            )}

            {/* SERVICE SELECTION */}
            {!isTyping && step === STEPS.SERVICE && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {config.services.map(service => (
                  <button
                    key={service.id}
                    onClick={() => handleServiceSelect(service.id)}
                    style={{
                      padding: '16px',
                      backgroundColor: '#252220',
                      border: '1px solid #302d2a',
                      borderRadius: '12px',
                      color: 'white',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'border-color 0.2s',
                    }}
                    onMouseOver={e => (e.currentTarget.style.borderColor = '#22c55e')}
                    onMouseOut={e => (e.currentTarget.style.borderColor = '#302d2a')}
                  >
                    <div style={{ fontSize: '24px', marginBottom: '4px' }}>{service.emoji}</div>
                    <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>{service.name}</div>
                    <div style={{ fontSize: '12px', color: '#9C9690' }}>{service.description}</div>
                  </button>
                ))}
              </div>
            )}

            {/* PROJECT TYPE SELECTION */}
            {!isTyping && step === STEPS.PROJECT_TYPE && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {config.projectTypes.map(project => {
                  const discount = (project as any).discount || 0
                  return (
                    <button
                      key={project.id}
                      onClick={() => handleProjectSelect(project.id)}
                      style={{
                        padding: '16px',
                        backgroundColor: '#252220',
                        border: '1px solid #302d2a',
                        borderRadius: '12px',
                        color: 'white',
                        cursor: 'pointer',
                        textAlign: 'left',
                        position: 'relative',
                      }}
                      onMouseOver={e => (e.currentTarget.style.borderColor = '#22c55e')}
                      onMouseOut={e => (e.currentTarget.style.borderColor = '#302d2a')}
                    >
                      {discount > 0 && (
                        <span style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '12px',
                          backgroundColor: '#22c55e',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                        }}>
                          {Math.round(discount * 100)}% OFF
                        </span>
                      )}
                      <div style={{ fontSize: '24px', marginBottom: '4px' }}>{project.emoji}</div>
                      <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>{project.label}</div>
                      <div style={{ fontSize: '12px', color: '#9C9690' }}>{project.description}</div>
                    </button>
                  )
                })}
              </div>
            )}

            {/* MEASURING - AI Result or Map Button */}
            {!isTyping && !isAnalyzing && step === STEPS.MEASURING && !showMap && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {bookingData.squareFootage > 0 && (
                  <button
                    onClick={handleAcceptMeasurement}
                    style={{
                      padding: '16px',
                      backgroundColor: '#22c55e',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'white',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '15px',
                    }}
                  >
                    ✓ Looks Right
                  </button>
                )}
                <button
                  onClick={handleOpenMap}
                  style={{
                    padding: '16px',
                    backgroundColor: '#252220',
                    border: '1px solid #302d2a',
                    borderRadius: '12px',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  📍 {bookingData.squareFootage > 0 ? 'Adjust on Map' : 'Open Map to Measure'}
                </button>
              </div>
            )}

            {/* CONDITION SELECTION */}
            {!isTyping && step === STEPS.CONDITION && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {config.conditions.map(condition => (
                  <button
                    key={condition.id}
                    onClick={() => handleConditionSelect(condition.id)}
                    style={{
                      padding: '14px 12px',
                      backgroundColor: '#252220',
                      border: '1px solid #302d2a',
                      borderRadius: '12px',
                      color: 'white',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseOver={e => (e.currentTarget.style.borderColor = '#22c55e')}
                    onMouseOut={e => (e.currentTarget.style.borderColor = '#302d2a')}
                  >
                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{condition.label}</div>
                    <div style={{ fontSize: '11px', color: '#9C9690' }}>{condition.description}</div>
                  </button>
                ))}
              </div>
            )}

            {/* DATE SELECTION - Calendar */}
            {!isTyping && step === STEPS.DATE && (
              <div style={{
                backgroundColor: '#252220',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid #302d2a',
              }}>
                {/* Month Navigation */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}>
                  <button
                    onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#9C9690',
                      fontSize: '18px',
                      cursor: 'pointer',
                      padding: '4px 8px',
                    }}
                  >
                    ‹
                  </button>
                  <span style={{ color: 'white', fontWeight: 'bold', fontSize: '15px' }}>
                    {formatMonthYear(calendarMonth)}
                  </span>
                  <button
                    onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#9C9690',
                      fontSize: '18px',
                      cursor: 'pointer',
                      padding: '4px 8px',
                    }}
                  >
                    ›
                  </button>
                </div>

                {/* Day Headers */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '4px',
                  marginBottom: '8px',
                }}>
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} style={{
                      textAlign: 'center',
                      color: '#6B665F',
                      fontSize: '11px',
                      fontWeight: '600',
                      padding: '4px',
                    }}>
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '4px',
                }}>
                  {getCalendarDays().map((day, i) => (
                    <button
                      key={i}
                      onClick={() => day.date && day.isAvailable && handleCalendarDateSelect(day.date)}
                      disabled={!day.date || !day.isAvailable}
                      style={{
                        aspectRatio: '1',
                        backgroundColor: day.isAvailable ? '#302d2a' : 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        color: day.date
                          ? day.isAvailable
                            ? 'white'
                            : '#4a4540'
                          : 'transparent',
                        cursor: day.isAvailable ? 'pointer' : 'default',
                        fontSize: '13px',
                        fontWeight: '500',
                        transition: 'all 0.15s',
                      }}
                      onMouseOver={e => {
                        if (day.isAvailable) {
                          e.currentTarget.style.backgroundColor = '#22c55e'
                        }
                      }}
                      onMouseOut={e => {
                        if (day.isAvailable) {
                          e.currentTarget.style.backgroundColor = '#302d2a'
                        }
                      }}
                    >
                      {day.date?.getDate() || ''}
                    </button>
                  ))}
                </div>

                {/* Legend */}
                <div style={{
                  marginTop: '12px',
                  paddingTop: '12px',
                  borderTop: '1px solid #302d2a',
                  display: 'flex',
                  gap: '16px',
                  justifyContent: 'center',
                  fontSize: '11px',
                  color: '#6B665F',
                }}>
                  <span>🟢 Available</span>
                  <span>⚫ Unavailable</span>
                </div>
              </div>
            )}

            {/* SUMMARY */}
            {!isTyping && step === STEPS.SUMMARY && (
              <div>
                <div style={{ backgroundColor: '#252220', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #302d2a' }}>
                    <span style={{ color: '#9C9690' }}>Service</span>
                    <span style={{ color: 'white', fontWeight: '500' }}>{bookingData.serviceName}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #302d2a' }}>
                    <span style={{ color: '#9C9690' }}>Property</span>
                    <span style={{ color: 'white', fontWeight: '500' }}>{bookingData.projectTypeName}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #302d2a' }}>
                    <span style={{ color: '#9C9690' }}>Area</span>
                    <span style={{ color: 'white', fontWeight: '500' }}>{bookingData.squareFootage.toLocaleString()} sq ft</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #302d2a' }}>
                    <span style={{ color: '#9C9690' }}>Date</span>
                    <span style={{ color: 'white', fontWeight: '500' }}>{bookingData.deliveryDateLabel}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #302d2a' }}>
                    <span style={{ color: '#9C9690' }}>Contact</span>
                    <span style={{ color: 'white', fontWeight: '500', textAlign: 'right' }}>{bookingData.name}<br/><span style={{color:'#888'}}>{bookingData.phone}</span></span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px' }}>
                    <span style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>Estimate</span>
                    <span style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '20px' }}>
                      ${bookingData.estimateLow.toLocaleString()} - ${bookingData.estimateHigh.toLocaleString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleConfirmBooking}
                  style={{
                    width: '100%',
                    padding: '16px',
                    backgroundColor: '#f59e0b',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '16px',
                  }}
                >
                  Confirm Booking →
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Map Overlay */}
          {showMap && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: '#1a1714',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 10,
            }}>
              <div style={{ padding: '16px', borderBottom: '1px solid #302d2a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ color: 'white', fontWeight: 'bold' }}>
                      {aiPolygonPoints.length > 0 ? '🎯 Verify Area' : 'Draw Your Area'}
                    </div>
                    <div style={{ color: '#9C9690', fontSize: '12px' }}>
                      {aiPolygonPoints.length > 0
                        ? 'Drag corners to adjust the boundary'
                        : 'Tap corners to outline the area'}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowMap(false)}
                    style={{ background: 'none', border: 'none', color: '#9C9690', cursor: 'pointer', fontSize: '20px' }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div ref={mapContainerRef} style={{ flex: 1, backgroundColor: '#252220' }} />

              <div style={{ padding: '16px', borderTop: '1px solid #302d2a' }}>
                {drawnArea ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div>
                      <div style={{ color: '#9C9690', fontSize: '12px' }}>
                        {aiPolygonPoints.length > 0 ? '🤖 AI Measured' : 'Measured'}
                      </div>
                      <div style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>{drawnArea.toLocaleString()} sq ft</div>
                    </div>
                    <button
                      onClick={clearDrawing}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#302d2a',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      Redraw
                    </button>
                  </div>
                ) : (
                  <div style={{ color: '#9C9690', textAlign: 'center', marginBottom: '12px', fontSize: '14px' }}>
                    {mapLoaded ? 'Tap corners to draw the area' : 'Loading map...'}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setShowMap(false)}
                    style={{
                      flex: 1,
                      padding: '14px',
                      backgroundColor: '#302d2a',
                      border: 'none',
                      borderRadius: '10px',
                      color: 'white',
                      cursor: 'pointer',
                      fontWeight: '500',
                    }}
                  >
                    Back
                  </button>
                  <button
                    onClick={handleMapConfirm}
                    disabled={!drawnArea}
                    style={{
                      flex: 1,
                      padding: '14px',
                      backgroundColor: drawnArea ? '#22c55e' : '#3A3733',
                      border: 'none',
                      borderRadius: '10px',
                      color: drawnArea ? 'white' : '#888',
                      cursor: drawnArea ? 'pointer' : 'not-allowed',
                      fontWeight: 'bold',
                    }}
                  >
                    ✓ Confirm Area
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Input Area */}
          {(step === STEPS.ADDRESS || step === STEPS.CONTACT) && !showMap && (
            <div style={{ padding: '16px', borderTop: '1px solid #222' }}>
              <form onSubmit={handleInputSubmit}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={step === STEPS.ADDRESS ? "Enter address..." : "Name and phone..."}
                    style={{
                      flex: 1,
                      padding: '14px 16px',
                      backgroundColor: '#252220',
                      border: '1px solid #302d2a',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                    autoFocus
                  />
                  <button
                    type="submit"
                    style={{
                      padding: '14px 20px',
                      backgroundColor: '#22c55e',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '16px',
                    }}
                  >
                    →
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Footer */}
          <div style={{ padding: '10px', textAlign: 'center', borderTop: '1px solid #222' }}>
            <a href={`tel:${config.phoneRaw}`} style={{ color: '#22c55e', textDecoration: 'none', fontSize: '13px' }}>
              📞 {config.phone}
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
