/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { config } from '@/config/config'

const STEPS = {
  SERVICE: 1,
  PROJECT_TYPE: 2,
  ADDRESS: 3,
  MEASURING: 4,
  CONDITION: 5,
  DATE: 6,
  CONTACT: 7,
  SUMMARY: 8,
  COMPLETE: 9
}

const STEP_LABELS = [
  'Service',
  'Type',
  'Address',
  'Measure',
  'Condition',
  'Date',
  'Contact',
  'Review'
]

export default function BookingPage() {
  const [step, setStep] = useState(STEPS.SERVICE)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Map State
  const [showMap, setShowMap] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [drawnArea, setDrawnArea] = useState<number | null>(null)

  // Booking Data
  const [bookingData, setBookingData] = useState({
    service: '',
    serviceName: '',
    projectType: '',
    projectTypeName: '',
    discount: 0,
    address: '',
    squareFootage: 0,
    aiConfidence: '',
    aiDescription: '',
    condition: '',
    conditionLabel: '',
    estimateLow: 0,
    estimateHigh: 0,
    deliveryDate: '',
    deliveryDateLabel: '',
    name: '',
    phone: '',
    email: '',
  })

  // Refs
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const drawingManagerRef = useRef<any>(null)
  const polygonRef = useRef<any>(null)

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
    const dates = []
    const today = new Date()
    let daysAdded = 0
    let currentDate = new Date(today)
    currentDate.setDate(currentDate.getDate() + config.booking.minDaysOut)

    while (daysAdded < 10) {
      const dayOfWeek = currentDate.getDay()
      if (dayOfWeek !== 0) { // Skip Sundays
        dates.push({
          date: currentDate.toISOString().split('T')[0],
          label: currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
        })
        daysAdded++
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }
    return dates
  }

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleServiceSelect = (serviceId: string) => {
    const service = config.services.find(s => s.id === serviceId)
    if (service) {
      setBookingData(prev => ({
        ...prev,
        service: serviceId,
        serviceName: service.name,
      }))
      setStep(STEPS.PROJECT_TYPE)
    }
  }

  const handleProjectSelect = (projectId: string) => {
    const project = config.projectTypes.find(p => p.id === projectId)
    if (project) {
      const discount = (project as any).discount || 0
      setBookingData(prev => ({
        ...prev,
        projectType: projectId,
        projectTypeName: project.label,
        discount,
      }))
      setStep(STEPS.ADDRESS)
    }
  }

  const handleAddressSubmit = async () => {
    if (!bookingData.address.trim()) return

    setIsAnalyzing(true)
    setStep(STEPS.MEASURING)

    try {
      const response = await fetch('/api/estimate-area', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: bookingData.address,
          projectType: bookingData.projectType === 'residential' ? 'driveway' : 'parking-lot'
        })
      })

      const data = await response.json()

      if (data.success && data.squareFootage) {
        const estimate = calculateEstimate(data.squareFootage, bookingData.service, bookingData.discount)
        setBookingData(prev => ({
          ...prev,
          squareFootage: data.squareFootage,
          aiConfidence: data.confidence,
          aiDescription: data.description,
          estimateLow: estimate.low,
          estimateHigh: estimate.high,
        }))
      }
    } catch (error) {
      console.error('AI estimation error:', error)
    }

    setIsAnalyzing(false)
  }

  const handleAcceptMeasurement = () => {
    setStep(STEPS.CONDITION)
  }

  const handleOpenMap = () => {
    setShowMap(true)
  }

  const handleConditionSelect = (conditionId: string) => {
    const cond = config.conditions.find(c => c.id === conditionId)
    if (cond) {
      const adjustment = cond.adjustment || 0
      let newLow = bookingData.estimateLow
      let newHigh = bookingData.estimateHigh

      if (adjustment > 0) {
        newLow = Math.round(newLow * (1 + adjustment))
        newHigh = Math.round(newHigh * (1 + adjustment))
      }

      setBookingData(prev => ({
        ...prev,
        condition: conditionId,
        conditionLabel: cond.label,
        estimateLow: newLow,
        estimateHigh: newHigh,
      }))
      setStep(STEPS.DATE)
    }
  }

  const handleDateSelect = (date: string, label: string) => {
    setBookingData(prev => ({
      ...prev,
      deliveryDate: date,
      deliveryDateLabel: label,
    }))
    setStep(STEPS.CONTACT)
  }

  const handleContactSubmit = () => {
    if (bookingData.name && bookingData.phone) {
      setStep(STEPS.SUMMARY)
    }
  }

  const handleFinalSubmit = async () => {
    setIsSubmitting(true)

    try {
      // Send SMS notification
      await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: process.env.NEXT_PUBLIC_OWNER_PHONE || config.notifications.twilio.enabled ? undefined : null,
          message: `🎉 New ${bookingData.serviceName} Quote!\n\n` +
            `👤 ${bookingData.name}\n📞 ${bookingData.phone}\n` +
            `📍 ${bookingData.address}\n📐 ${bookingData.squareFootage.toLocaleString()} sq ft\n` +
            `💰 $${bookingData.estimateLow.toLocaleString()} - $${bookingData.estimateHigh.toLocaleString()}\n` +
            `📅 Requested: ${bookingData.deliveryDateLabel}`
        })
      })

      setStep(STEPS.COMPLETE)
    } catch (error) {
      console.error('Submit error:', error)
      setStep(STEPS.COMPLETE)
    }

    setIsSubmitting(false)
  }

  // ==========================================
  // MAP FUNCTIONS
  // ==========================================
  useEffect(() => {
    if (!showMap || mapLoaded) return

    const loadGoogleMaps = () => {
      if ((window as any).google?.maps) {
        initializeMap()
        return
      }

      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${config.googleMaps.apiKey}&libraries=drawing,geometry`
      script.async = true
      script.onload = initializeMap
      document.head.appendChild(script)
    }

    const initializeMap = async () => {
      if (!mapContainerRef.current || !(window as any).google) return

      // Geocode address
      const geocoder = new (window as any).google.maps.Geocoder()
      let center = config.googleMaps.defaultCenter

      try {
        const results = await new Promise<any>((resolve, reject) => {
          geocoder.geocode({ address: bookingData.address }, (results: any, status: any) => {
            if (status === 'OK') resolve(results)
            else reject(status)
          })
        })
        center = {
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng()
        }
      } catch (e) {
        console.log('Using default center')
      }

      mapRef.current = new (window as any).google.maps.Map(mapContainerRef.current, {
        center,
        zoom: config.googleMaps.defaultZoom,
        mapTypeId: 'satellite',
        tilt: 0,
        disableDefaultUI: true,
        zoomControl: true,
      })

      drawingManagerRef.current = new (window as any).google.maps.drawing.DrawingManager({
        drawingMode: (window as any).google.maps.drawing.OverlayType.POLYGON,
        drawingControl: false,
        polygonOptions: {
          fillColor: '#22c55e',
          fillOpacity: 0.4,
          strokeColor: '#22c55e',
          strokeWeight: 3,
          editable: true,
        }
      })

      drawingManagerRef.current.setMap(mapRef.current)

      ;(window as any).google.maps.event.addListener(
        drawingManagerRef.current,
        'polygoncomplete',
        (polygon: any) => {
          if (polygonRef.current) polygonRef.current.setMap(null)
          polygonRef.current = polygon

          const updateArea = () => {
            const area = (window as any).google.maps.geometry.spherical.computeArea(polygon.getPath())
            const sqft = Math.round(area * 10.764)
            setDrawnArea(sqft)
          }

          updateArea()
          polygon.getPath().addListener('set_at', updateArea)
          polygon.getPath().addListener('insert_at', updateArea)

          drawingManagerRef.current.setDrawingMode(null)
        }
      )

      setMapLoaded(true)
    }

    loadGoogleMaps()
  }, [showMap, mapLoaded, bookingData.address])

  const handleConfirmDrawnArea = () => {
    if (drawnArea) {
      const estimate = calculateEstimate(drawnArea, bookingData.service, bookingData.discount)
      setBookingData(prev => ({
        ...prev,
        squareFootage: drawnArea,
        estimateLow: estimate.low,
        estimateHigh: estimate.high,
      }))
      setShowMap(false)
      setStep(STEPS.CONDITION)
    }
  }

  const handleClearPolygon = () => {
    if (polygonRef.current) {
      polygonRef.current.setMap(null)
      polygonRef.current = null
    }
    setDrawnArea(null)
    if (drawingManagerRef.current) {
      drawingManagerRef.current.setDrawingMode((window as any).google.maps.drawing.OverlayType.POLYGON)
    }
  }

  // ==========================================
  // RENDER
  // ==========================================
  const selectedService = config.services.find(s => s.id === bookingData.service)
  const availableDates = getAvailableDates()

  // Progress calculation
  const progressPercent = Math.min(((step - 1) / 7) * 100, 100)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1a1714' }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#252220',
        borderBottom: '1px solid #302d2a',
        padding: '16px 24px',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ color: '#F5C518', fontWeight: 'bold', fontSize: '20px', textDecoration: 'none' }}>
            {config.businessName}
          </Link>
          <a href={`tel:${config.phoneRaw}`} style={{ color: '#9C9690', fontSize: '14px', textDecoration: 'none' }}>
            📞 {config.phone}
          </a>
        </div>
      </div>

      {/* Progress Bar */}
      {step < STEPS.COMPLETE && (
        <div style={{ backgroundColor: '#252220', padding: '16px 24px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              {STEP_LABELS.map((label, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: '11px',
                    color: i < step ? '#22c55e' : '#6B665F',
                    fontWeight: i === step - 1 ? 'bold' : 'normal',
                  }}
                >
                  {label}
                </span>
              ))}
            </div>
            <div style={{ height: '4px', backgroundColor: '#302d2a', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${progressPercent}%`,
                backgroundColor: '#22c55e',
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>

        {/* STEP 1: SERVICE SELECTION */}
        {step === STEPS.SERVICE && (
          <div>
            <h1 style={{ color: '#FAF8F5', fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
              What service do you need?
            </h1>
            <p style={{ color: '#9C9690', marginBottom: '32px' }}>
              Select the type of work you&apos;re looking for
            </p>

            <div style={{ display: 'grid', gap: '16px' }}>
              {config.services.map(service => (
                <button
                  key={service.id}
                  onClick={() => handleServiceSelect(service.id)}
                  style={{
                    padding: '24px',
                    backgroundColor: '#252220',
                    border: '2px solid #302d2a',
                    borderRadius: '16px',
                    color: '#FAF8F5',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.borderColor = '#22c55e'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.borderColor = '#302d2a'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <span style={{ fontSize: '48px' }}>{service.emoji}</span>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '20px', marginBottom: '4px' }}>{service.name}</div>
                    <div style={{ color: '#9C9690' }}>{service.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: PROJECT TYPE */}
        {step === STEPS.PROJECT_TYPE && (
          <div>
            <h1 style={{ color: '#FAF8F5', fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
              What type of property?
            </h1>
            <p style={{ color: '#9C9690', marginBottom: '32px' }}>
              This helps us provide an accurate estimate
            </p>

            <div style={{ display: 'grid', gap: '16px' }}>
              {config.projectTypes.map(project => {
                const discount = (project as any).discount || 0
                return (
                  <button
                    key={project.id}
                    onClick={() => handleProjectSelect(project.id)}
                    style={{
                      padding: '24px',
                      backgroundColor: '#252220',
                      border: '2px solid #302d2a',
                      borderRadius: '16px',
                      color: '#FAF8F5',
                      cursor: 'pointer',
                      textAlign: 'left',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '20px',
                    }}
                    onMouseOver={e => (e.currentTarget.style.borderColor = '#22c55e')}
                    onMouseOut={e => (e.currentTarget.style.borderColor = '#302d2a')}
                  >
                    {discount > 0 && (
                      <span style={{
                        position: 'absolute',
                        top: '-10px',
                        right: '16px',
                        backgroundColor: '#22c55e',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                      }}>
                        {Math.round(discount * 100)}% OFF
                      </span>
                    )}
                    <span style={{ fontSize: '48px' }}>{project.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '20px', marginBottom: '4px' }}>{project.label}</div>
                      <div style={{ color: '#9C9690' }}>{project.description}</div>
                    </div>
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => setStep(STEPS.SERVICE)}
              style={{
                marginTop: '24px',
                padding: '12px 24px',
                backgroundColor: 'transparent',
                border: '1px solid #302d2a',
                borderRadius: '8px',
                color: '#9C9690',
                cursor: 'pointer',
              }}
            >
              ← Back
            </button>
          </div>
        )}

        {/* STEP 3: ADDRESS */}
        {step === STEPS.ADDRESS && (
          <div>
            <h1 style={{ color: '#FAF8F5', fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
              Where is the property?
            </h1>
            <p style={{ color: '#9C9690', marginBottom: '32px' }}>
              We&apos;ll use satellite imagery to estimate the area
            </p>

            <div style={{ marginBottom: '24px' }}>
              <input
                type="text"
                value={bookingData.address}
                onChange={(e) => setBookingData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter full address (e.g., 123 Main St, Mount Vernon, IL)"
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  backgroundColor: '#252220',
                  border: '2px solid #302d2a',
                  borderRadius: '12px',
                  color: '#FAF8F5',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleAddressSubmit()}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setStep(STEPS.PROJECT_TYPE)}
                style={{
                  padding: '14px 28px',
                  backgroundColor: 'transparent',
                  border: '1px solid #302d2a',
                  borderRadius: '8px',
                  color: '#9C9690',
                  cursor: 'pointer',
                }}
              >
                ← Back
              </button>
              <button
                onClick={handleAddressSubmit}
                disabled={!bookingData.address.trim()}
                style={{
                  flex: 1,
                  padding: '14px 28px',
                  backgroundColor: bookingData.address.trim() ? '#22c55e' : '#302d2a',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontWeight: 'bold',
                  cursor: bookingData.address.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                Analyze Property →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: MEASURING */}
        {step === STEPS.MEASURING && !showMap && (
          <div>
            <h1 style={{ color: '#FAF8F5', fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
              {isAnalyzing ? 'Analyzing your property...' : 'Area Measurement'}
            </h1>

            {isAnalyzing ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>🛰️</div>
                <p style={{ color: '#9C9690' }}>Using satellite imagery to measure your {bookingData.projectTypeName.toLowerCase()} area...</p>
              </div>
            ) : (
              <>
                {bookingData.squareFootage > 0 && (
                  <div style={{
                    backgroundColor: '#252220',
                    border: '2px solid #22c55e',
                    borderRadius: '16px',
                    padding: '24px',
                    marginBottom: '24px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <span style={{ color: '#9C9690' }}>Estimated Area</span>
                      <span style={{
                        backgroundColor: bookingData.aiConfidence === 'high' ? '#22c55e' : '#f59e0b',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                      }}>
                        {bookingData.aiConfidence} confidence
                      </span>
                    </div>
                    <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#FAF8F5', marginBottom: '8px' }}>
                      {bookingData.squareFootage.toLocaleString()} sq ft
                    </div>
                    <p style={{ color: '#9C9690', fontSize: '14px', marginBottom: '16px' }}>
                      {bookingData.aiDescription}
                    </p>
                    <div style={{
                      backgroundColor: '#1a1714',
                      borderRadius: '12px',
                      padding: '16px',
                    }}>
                      <div style={{ color: '#9C9690', fontSize: '14px', marginBottom: '4px' }}>Estimated Price Range</div>
                      <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#22c55e' }}>
                        ${bookingData.estimateLow.toLocaleString()} - ${bookingData.estimateHigh.toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gap: '12px' }}>
                  {bookingData.squareFootage > 0 && (
                    <button
                      onClick={handleAcceptMeasurement}
                      style={{
                        padding: '16px',
                        backgroundColor: '#22c55e',
                        border: 'none',
                        borderRadius: '12px',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '16px',
                        cursor: 'pointer',
                      }}
                    >
                      ✓ This looks right - Continue
                    </button>
                  )}
                  <button
                    onClick={handleOpenMap}
                    style={{
                      padding: '16px',
                      backgroundColor: '#252220',
                      border: '2px solid #302d2a',
                      borderRadius: '12px',
                      color: '#FAF8F5',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                    }}
                  >
                    🗺️ {bookingData.squareFootage > 0 ? 'Draw it myself instead' : 'Measure manually on map'}
                  </button>
                </div>

                <button
                  onClick={() => setStep(STEPS.ADDRESS)}
                  style={{
                    marginTop: '24px',
                    padding: '12px 24px',
                    backgroundColor: 'transparent',
                    border: '1px solid #302d2a',
                    borderRadius: '8px',
                    color: '#9C9690',
                    cursor: 'pointer',
                  }}
                >
                  ← Back
                </button>
              </>
            )}
          </div>
        )}

        {/* MAP VIEW */}
        {showMap && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: '#1a1714',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{
              padding: '16px 24px',
              backgroundColor: '#252220',
              borderBottom: '1px solid #302d2a',
            }}>
              <h2 style={{ color: '#FAF8F5', fontSize: '18px', margin: 0 }}>
                Draw around the area to measure
              </h2>
              <p style={{ color: '#9C9690', fontSize: '14px', margin: '4px 0 0' }}>
                Click to add points, close the shape to finish
              </p>
            </div>

            <div ref={mapContainerRef} style={{ flex: 1, backgroundColor: '#252220' }} />

            <div style={{
              padding: '16px 24px',
              backgroundColor: '#252220',
              borderTop: '1px solid #302d2a',
            }}>
              {drawnArea && (
                <div style={{
                  backgroundColor: '#1a1714',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '16px',
                  textAlign: 'center',
                }}>
                  <div style={{ color: '#9C9690', fontSize: '14px' }}>Measured Area</div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#22c55e' }}>
                    {drawnArea.toLocaleString()} sq ft
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowMap(false)}
                  style={{
                    padding: '14px 24px',
                    backgroundColor: 'transparent',
                    border: '1px solid #302d2a',
                    borderRadius: '8px',
                    color: '#9C9690',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearPolygon}
                  style={{
                    padding: '14px 24px',
                    backgroundColor: '#302d2a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#FAF8F5',
                    cursor: 'pointer',
                  }}
                >
                  Clear & Redraw
                </button>
                <button
                  onClick={handleConfirmDrawnArea}
                  disabled={!drawnArea}
                  style={{
                    flex: 1,
                    padding: '14px 24px',
                    backgroundColor: drawnArea ? '#22c55e' : '#3A3733',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontWeight: 'bold',
                    cursor: drawnArea ? 'pointer' : 'not-allowed',
                  }}
                >
                  Use This Measurement →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: CONDITION */}
        {step === STEPS.CONDITION && (
          <div>
            <h1 style={{ color: '#FAF8F5', fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
              Current pavement condition?
            </h1>
            <p style={{ color: '#9C9690', marginBottom: '32px' }}>
              This affects prep work and final pricing
            </p>

            <div style={{ display: 'grid', gap: '12px' }}>
              {config.conditions.map(cond => (
                <button
                  key={cond.id}
                  onClick={() => handleConditionSelect(cond.id)}
                  style={{
                    padding: '20px 24px',
                    backgroundColor: '#252220',
                    border: '2px solid #302d2a',
                    borderRadius: '12px',
                    color: '#FAF8F5',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                  onMouseOver={e => (e.currentTarget.style.borderColor = '#22c55e')}
                  onMouseOut={e => (e.currentTarget.style.borderColor = '#302d2a')}
                >
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '4px' }}>{cond.label}</div>
                    <div style={{ color: '#9C9690', fontSize: '14px' }}>{cond.description}</div>
                  </div>
                  {cond.adjustment > 0 && (
                    <span style={{ color: '#f59e0b', fontSize: '14px' }}>
                      +{Math.round(cond.adjustment * 100)}%
                    </span>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(STEPS.MEASURING)}
              style={{
                marginTop: '24px',
                padding: '12px 24px',
                backgroundColor: 'transparent',
                border: '1px solid #302d2a',
                borderRadius: '8px',
                color: '#9C9690',
                cursor: 'pointer',
              }}
            >
              ← Back
            </button>
          </div>
        )}

        {/* STEP 6: DATE */}
        {step === STEPS.DATE && (
          <div>
            <h1 style={{ color: '#FAF8F5', fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
              When would you like service?
            </h1>
            <p style={{ color: '#9C9690', marginBottom: '32px' }}>
              Select your preferred date
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {availableDates.map(d => (
                <button
                  key={d.date}
                  onClick={() => handleDateSelect(d.date, d.label)}
                  style={{
                    padding: '20px',
                    backgroundColor: '#252220',
                    border: '2px solid #302d2a',
                    borderRadius: '12px',
                    color: '#FAF8F5',
                    cursor: 'pointer',
                    textAlign: 'center',
                    fontWeight: 'bold',
                  }}
                  onMouseOver={e => (e.currentTarget.style.borderColor = '#22c55e')}
                  onMouseOut={e => (e.currentTarget.style.borderColor = '#302d2a')}
                >
                  {d.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(STEPS.CONDITION)}
              style={{
                marginTop: '24px',
                padding: '12px 24px',
                backgroundColor: 'transparent',
                border: '1px solid #302d2a',
                borderRadius: '8px',
                color: '#9C9690',
                cursor: 'pointer',
              }}
            >
              ← Back
            </button>
          </div>
        )}

        {/* STEP 7: CONTACT */}
        {step === STEPS.CONTACT && (
          <div>
            <h1 style={{ color: '#FAF8F5', fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
              Your contact information
            </h1>
            <p style={{ color: '#9C9690', marginBottom: '32px' }}>
              We&apos;ll send your estimate and schedule confirmation
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <input
                type="text"
                value={bookingData.name}
                onChange={(e) => setBookingData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Your name"
                style={{
                  padding: '16px 20px',
                  backgroundColor: '#252220',
                  border: '2px solid #302d2a',
                  borderRadius: '12px',
                  color: '#FAF8F5',
                  fontSize: '16px',
                }}
              />
              <input
                type="tel"
                value={bookingData.phone}
                onChange={(e) => setBookingData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Phone number"
                style={{
                  padding: '16px 20px',
                  backgroundColor: '#252220',
                  border: '2px solid #302d2a',
                  borderRadius: '12px',
                  color: '#FAF8F5',
                  fontSize: '16px',
                }}
              />
              <input
                type="email"
                value={bookingData.email}
                onChange={(e) => setBookingData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Email (optional)"
                style={{
                  padding: '16px 20px',
                  backgroundColor: '#252220',
                  border: '2px solid #302d2a',
                  borderRadius: '12px',
                  color: '#FAF8F5',
                  fontSize: '16px',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setStep(STEPS.DATE)}
                style={{
                  padding: '14px 28px',
                  backgroundColor: 'transparent',
                  border: '1px solid #302d2a',
                  borderRadius: '8px',
                  color: '#9C9690',
                  cursor: 'pointer',
                }}
              >
                ← Back
              </button>
              <button
                onClick={handleContactSubmit}
                disabled={!bookingData.name || !bookingData.phone}
                style={{
                  flex: 1,
                  padding: '14px 28px',
                  backgroundColor: (bookingData.name && bookingData.phone) ? '#22c55e' : '#302d2a',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontWeight: 'bold',
                  cursor: (bookingData.name && bookingData.phone) ? 'pointer' : 'not-allowed',
                }}
              >
                Review Estimate →
              </button>
            </div>
          </div>
        )}

        {/* STEP 8: SUMMARY */}
        {step === STEPS.SUMMARY && (
          <div>
            <h1 style={{ color: '#FAF8F5', fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
              Review your estimate
            </h1>
            <p style={{ color: '#9C9690', marginBottom: '32px' }}>
              Confirm the details below
            </p>

            <div style={{
              backgroundColor: '#252220',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
            }}>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid #302d2a' }}>
                  <span style={{ color: '#9C9690' }}>Service</span>
                  <span style={{ color: '#FAF8F5', fontWeight: 'bold' }}>{selectedService?.emoji} {bookingData.serviceName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid #302d2a' }}>
                  <span style={{ color: '#9C9690' }}>Property Type</span>
                  <span style={{ color: '#FAF8F5' }}>{bookingData.projectTypeName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid #302d2a' }}>
                  <span style={{ color: '#9C9690' }}>Address</span>
                  <span style={{ color: '#FAF8F5', textAlign: 'right', maxWidth: '60%' }}>{bookingData.address}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid #302d2a' }}>
                  <span style={{ color: '#9C9690' }}>Area</span>
                  <span style={{ color: '#FAF8F5' }}>{bookingData.squareFootage.toLocaleString()} sq ft</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid #302d2a' }}>
                  <span style={{ color: '#9C9690' }}>Condition</span>
                  <span style={{ color: '#FAF8F5' }}>{bookingData.conditionLabel}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid #302d2a' }}>
                  <span style={{ color: '#9C9690' }}>Requested Date</span>
                  <span style={{ color: '#FAF8F5' }}>{bookingData.deliveryDateLabel}</span>
                </div>
                {bookingData.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid #302d2a' }}>
                    <span style={{ color: '#9C9690' }}>Discount</span>
                    <span style={{ color: '#22c55e', fontWeight: 'bold' }}>-{Math.round(bookingData.discount * 100)}% (House of Worship)</span>
                  </div>
                )}
              </div>

              <div style={{
                backgroundColor: '#1a1714',
                borderRadius: '12px',
                padding: '20px',
                marginTop: '16px',
                textAlign: 'center',
              }}>
                <div style={{ color: '#9C9690', marginBottom: '8px' }}>Estimated Price Range</div>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#22c55e' }}>
                  ${bookingData.estimateLow.toLocaleString()} - ${bookingData.estimateHigh.toLocaleString()}
                </div>
                <div style={{ color: '#6B665F', fontSize: '12px', marginTop: '8px' }}>
                  Final price confirmed after on-site inspection
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: '#252220',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
            }}>
              <div style={{ color: '#9C9690', fontSize: '14px', marginBottom: '8px' }}>Contact</div>
              <div style={{ color: '#FAF8F5', fontWeight: 'bold' }}>{bookingData.name}</div>
              <div style={{ color: '#9C9690' }}>{bookingData.phone}</div>
              {bookingData.email && <div style={{ color: '#9C9690' }}>{bookingData.email}</div>}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setStep(STEPS.CONTACT)}
                style={{
                  padding: '14px 28px',
                  backgroundColor: 'transparent',
                  border: '1px solid #302d2a',
                  borderRadius: '8px',
                  color: '#9C9690',
                  cursor: 'pointer',
                }}
              >
                ← Back
              </button>
              <button
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  padding: '16px 28px',
                  backgroundColor: '#22c55e',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1,
                }}
              >
                {isSubmitting ? 'Submitting...' : '✓ Submit Request'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 9: COMPLETE */}
        {step === STEPS.COMPLETE && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: '80px', marginBottom: '24px' }}>🎉</div>
            <h1 style={{ color: '#FAF8F5', fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>
              Request Submitted!
            </h1>
            <p style={{ color: '#9C9690', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>
              We&apos;ve received your estimate request for {bookingData.serviceName.toLowerCase()}.
              We&apos;ll call you shortly to confirm the details.
            </p>

            <div style={{
              backgroundColor: '#252220',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '400px',
              margin: '0 auto 32px',
            }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#22c55e', marginBottom: '8px' }}>
                ${bookingData.estimateLow.toLocaleString()} - ${bookingData.estimateHigh.toLocaleString()}
              </div>
              <div style={{ color: '#9C9690' }}>{bookingData.squareFootage.toLocaleString()} sq ft</div>
              <div style={{ color: '#9C9690' }}>{bookingData.deliveryDateLabel}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '300px', margin: '0 auto' }}>
              <a
                href={`tel:${config.phoneRaw}`}
                style={{
                  padding: '14px 28px',
                  backgroundColor: '#22c55e',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  textAlign: 'center',
                }}
              >
                📞 Call Us Now: {config.phone}
              </a>
              <Link
                href="/"
                style={{
                  padding: '14px 28px',
                  backgroundColor: 'transparent',
                  border: '1px solid #302d2a',
                  borderRadius: '8px',
                  color: '#9C9690',
                  textDecoration: 'none',
                  textAlign: 'center',
                }}
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
