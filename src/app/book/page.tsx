'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { config } from '@/config/config'

// ============================================
// TYPES & CONSTANTS
// ============================================

type Step = 'service' | 'project' | 'location' | 'contact' | 'schedule' | 'review'

interface FormData {
  service: string
  serviceName: string
  projectType: string
  projectTypeName: string
  isChurch: boolean
  address: string
  squareFootage: number | null
  name: string
  phone: string
  email: string
  date: string
  notes: string
  // Line striping specific
  regularSpaces: number
  handicapSpaces: number
  // Sealcoating bundle
  addStriping: boolean
}

const STEPS: { id: Step; label: string; icon: string }[] = [
  { id: 'service', label: 'Service', icon: '🎯' },
  { id: 'location', label: 'Location', icon: '📍' },
  { id: 'contact', label: 'Contact', icon: '👤' },
  { id: 'schedule', label: 'Schedule', icon: '📅' },
  { id: 'review', label: 'Review', icon: '✓' },
]

const INITIAL_FORM: FormData = {
  service: '',
  serviceName: '',
  projectType: '',
  projectTypeName: '',
  isChurch: false,
  address: '',
  squareFootage: null,
  name: '',
  phone: '',
  email: '',
  date: '',
  notes: '',
  regularSpaces: 0,
  handicapSpaces: 0,
  addStriping: false,
}

declare global {
  interface Window {
    google: typeof google
  }
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState<Step>('service')
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Map state
  const [mapLoaded, setMapLoaded] = useState(false)
  const [isLoadingMap, setIsLoadingMap] = useState(false)
  const [drawnArea, setDrawnArea] = useState<number | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const polygonRef = useRef<google.maps.Polygon | null>(null)
  const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(null)

  // ============================================
  // STEP NAVIGATION
  // ============================================

  const getStepIndex = (step: Step) => STEPS.findIndex(s => s.id === step)
  const currentStepIndex = getStepIndex(currentStep)

  const getStepsForService = (): Step[] => {
    if (formData.service === 'linestriping') {
      return ['service', 'location', 'contact', 'schedule', 'review']
    }
    return ['service', 'location', 'contact', 'schedule', 'review']
  }

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 'service':
        return !!formData.service
      case 'project':
        return !!formData.projectType
      case 'location':
        if (formData.service === 'linestriping') {
          return !!formData.address && (formData.regularSpaces > 0 || formData.handicapSpaces > 0)
        }
        return !!formData.address && (drawnArea !== null && drawnArea > 0)
      case 'contact':
        return !!formData.name && formData.phone.replace(/\D/g, '').length >= 10 && !!formData.address
      case 'schedule':
        return !!formData.date
      case 'review':
        return true
      default:
        return false
    }
  }

  const nextStep = () => {
    const steps = getStepsForService()
    const currentIdx = steps.indexOf(currentStep)
    if (currentIdx < steps.length - 1 && canProceed()) {
      setCurrentStep(steps[currentIdx + 1])
    }
  }

  const prevStep = () => {
    const steps = getStepsForService()
    const currentIdx = steps.indexOf(currentStep)
    if (currentIdx > 0) {
      setCurrentStep(steps[currentIdx - 1])
    }
  }

  // ============================================
  // PRICING CALCULATIONS
  // ============================================

  const calculatePrice = (): number => {
    if (formData.service === 'linestriping') {
      const service = config.services.find(s => s.id === 'linestriping')!
      const pricePerStall = service.pricePerStall || 4
      const pricePerSymbol = service.pricePerSymbol || 35
      const regularPrice = formData.regularSpaces * pricePerStall
      const handicapPrice = formData.handicapSpaces * (pricePerStall * 2 + pricePerSymbol)
      return Math.max(Math.round(regularPrice + handicapPrice), service.minPrice)
    }

    if (formData.service === 'sealcoating') {
      const service = config.services.find(s => s.id === 'sealcoating')!
      const sqft = drawnArea || formData.squareFootage || 0
      let price = Math.max(Math.round(sqft * service.pricePerSqFt), service.minPrice)

      // Apply church discount
      if (formData.isChurch) {
        price = Math.round(price * 0.9)
      }

      // Add striping if bundled
      if (formData.addStriping && (formData.regularSpaces > 0 || formData.handicapSpaces > 0)) {
        const stripingService = config.services.find(s => s.id === 'linestriping')!
        const pricePerStall = stripingService.pricePerStall || 4
        const pricePerSymbol = stripingService.pricePerSymbol || 35
        const stripingPrice = (formData.regularSpaces * pricePerStall) +
          (formData.handicapSpaces * (pricePerStall * 2 + pricePerSymbol))
        // 10% bundle discount on striping
        price += Math.round(stripingPrice * 0.9)
      }

      return price
    }

    if (formData.service === 'paving') {
      const service = config.services.find(s => s.id === 'paving')!
      const sqft = drawnArea || formData.squareFootage || 0
      const basePrice = sqft * service.pricePerSqFt
      let discount = 0
      if (formData.isChurch) discount = 0.10
      const discountedPrice = basePrice * (1 - discount)
      return Math.max(Math.round(discountedPrice), service.minPrice)
    }

    return 0
  }

  // ============================================
  // MAP FUNCTIONALITY
  // ============================================

  const loadMap = useCallback(async (address: string) => {
    if (mapLoaded || isLoadingMap || !address) return
    setIsLoadingMap(true)

    try {
      // Geocode
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      const response = await fetch(geocodeUrl)
      const result = await response.json()

      let coords = config.googleMaps.defaultCenter
      if (result.results?.[0]?.geometry?.location) {
        coords = result.results[0].geometry.location
      }

      // Load Google Maps if needed
      if (!window.google?.maps) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script')
          script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=drawing,geometry`
          script.async = true
          script.onload = () => resolve()
          script.onerror = reject
          document.head.appendChild(script)
        })
      }

      await new Promise(resolve => setTimeout(resolve, 100))
      if (!mapRef.current) return

      const map = new window.google.maps.Map(mapRef.current, {
        center: coords,
        zoom: 19,
        mapTypeId: 'satellite',
        disableDefaultUI: true,
        zoomControl: true,
        scrollwheel: true,
        gestureHandling: 'greedy',
      })
      mapInstanceRef.current = map

      const drawingManager = new window.google.maps.drawing.DrawingManager({
        drawingMode: window.google.maps.drawing.OverlayType.POLYGON,
        drawingControl: false,
        polygonOptions: {
          fillColor: '#F5C518',
          fillOpacity: 0.35,
          strokeColor: '#F5C518',
          strokeWeight: 3,
          editable: true,
          draggable: false,
        },
      })
      drawingManager.setMap(map)
      drawingManagerRef.current = drawingManager

      window.google.maps.event.addListener(drawingManager, 'polygoncomplete', (polygon: google.maps.Polygon) => {
        if (polygonRef.current) {
          polygonRef.current.setMap(null)
        }
        polygonRef.current = polygon
        drawingManager.setDrawingMode(null)

        const updateArea = () => {
          const area = window.google.maps.geometry.spherical.computeArea(polygon.getPath())
          const sqft = Math.round(area * 10.764)
          setDrawnArea(sqft)
          setFormData(prev => ({ ...prev, squareFootage: sqft }))
        }
        updateArea()

        polygon.getPath().addListener('set_at', updateArea)
        polygon.getPath().addListener('insert_at', updateArea)
      })

      setMapLoaded(true)
    } catch (err) {
      console.error('Map error:', err)
    } finally {
      setIsLoadingMap(false)
    }
  }, [mapLoaded, isLoadingMap])

  const redrawPolygon = () => {
    if (polygonRef.current) {
      polygonRef.current.setMap(null)
      polygonRef.current = null
    }
    setDrawnArea(null)
    if (drawingManagerRef.current) {
      drawingManagerRef.current.setDrawingMode(window.google.maps.drawing.OverlayType.POLYGON)
    }
  }

  // ============================================
  // FORM HANDLERS
  // ============================================

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
  }

  const getAvailableDates = () => {
    const dates: string[] = []
    const today = new Date()
    for (let i = config.booking.minDaysOut; i <= Math.min(config.booking.maxDaysOut, 45); i++) {
      const date = new Date(today)
      date.setDate(date.getDate() + i)
      if (config.booking.skipSundays && date.getDay() === 0) continue
      dates.push(date.toISOString().split('T')[0])
    }
    return dates
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const jobData = {
        customer_name: formData.name,
        customer_phone: formData.phone.replace(/\D/g, ''),
        customer_email: formData.email || null,
        service_address: formData.address,
        job_type: formData.service,
        project_type: formData.projectType || (formData.isChurch ? 'house-of-worship' : 'commercial'),
        square_feet: formData.squareFootage,
        quote_cents: calculatePrice() * 100,
        scheduled_date: formData.date,
        status: 'quote',
        notes: formData.notes || null,
      }

      const response = await fetch(`${config.supabase.url}/rest/v1/jobs`, {
        method: 'POST',
        headers: {
          'apikey': config.supabase.anonKey,
          'Authorization': `Bearer ${config.supabase.anonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(jobData),
      })

      if (!response.ok) throw new Error('Failed to submit')

      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'new_booking', data: jobData }),
      }).catch(() => {})

      setSubmitSuccess(true)
    } catch {
      setSubmitError('Something went wrong. Please call us instead.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ============================================
  // RENDER HELPERS
  // ============================================

  const renderProgressBar = () => {
    const steps = getStepsForService()
    const currentIdx = steps.indexOf(currentStep)
    const progress = ((currentIdx) / (steps.length - 1)) * 100

    return (
      <div className="mb-8">
        {/* Progress line */}
        <div className="relative h-1 bg-gray-800 rounded-full overflow-hidden mb-6">
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step indicators */}
        <div className="flex justify-between">
          {steps.map((step, idx) => {
            const stepData = STEPS.find(s => s.id === step)!
            const isActive = currentStep === step
            const isCompleted = currentIdx > idx

            return (
              <div key={step} className="flex flex-col items-center flex-1">
                <div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center text-xl
                    transition-all duration-300 mb-2
                    ${isActive
                      ? 'bg-yellow-500 text-gray-900 ring-4 ring-yellow-500/30 scale-110'
                      : isCompleted
                        ? 'bg-yellow-500 text-gray-900'
                        : 'bg-gray-800 text-gray-500'
                    }
                  `}
                >
                  {isCompleted ? '✓' : stepData.icon}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${
                  isActive ? 'text-yellow-500' : isCompleted ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {stepData.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ============================================
  // STEP RENDERS
  // ============================================

  const renderServiceStep = () => (
    <div className="animate-fadeIn">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          What can we help you with?
        </h1>
        <p className="text-gray-400 text-lg">
          Select the service you need for your property
        </p>
      </div>

      <div className="grid gap-4 max-w-xl mx-auto">
        {config.services.map((service) => {
          const isSelected = formData.service === service.id
          return (
            <button
              key={service.id}
              onClick={() => setFormData(prev => ({
                ...prev,
                service: service.id,
                serviceName: service.name
              }))}
              className={`
                relative p-6 rounded-2xl text-left transition-all duration-300
                transform hover:scale-[1.02] active:scale-[0.98]
                ${isSelected
                  ? 'bg-yellow-500/10 border-2 border-yellow-500 shadow-lg shadow-yellow-500/20'
                  : 'bg-gray-900/50 border-2 border-gray-800 hover:border-gray-700'
                }
              `}
            >
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              <div className="flex items-start gap-4">
                <span className="text-4xl">{service.emoji}</span>
                <div className="flex-1">
                  <h3 className={`text-xl font-semibold mb-1 ${isSelected ? 'text-yellow-500' : 'text-white'}`}>
                    {service.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-3">{service.description}</p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2">
                    {service.bestFor.slice(0, 2).map((item, i) => (
                      <span
                        key={i}
                        className="text-xs px-3 py-1 rounded-full bg-gray-800 text-gray-400"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Trust signals */}
      <div className="flex justify-center gap-6 mt-10 text-sm text-gray-500">
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Licensed & Insured
        </span>
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Free Estimates
        </span>
      </div>
    </div>
  )

  const renderLocationStep = () => (
    <div className="animate-fadeIn">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Where&apos;s the property?
        </h1>
        <p className="text-gray-400 text-lg">
          Enter the address and {formData.service === 'linestriping' ? 'tell us about your parking spaces' : 'outline your area'}
        </p>
      </div>

      <div className="max-w-xl mx-auto space-y-6">
        {/* Address input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Property Address
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">📍</span>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              onBlur={() => {
                if (formData.address && formData.service !== 'linestriping' && !mapLoaded) {
                  loadMap(formData.address)
                }
              }}
              placeholder="123 Main St, Mount Vernon, IL"
              className="w-full pl-12 pr-4 py-4 bg-gray-900 border-2 border-gray-800 rounded-xl text-white placeholder-gray-600 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 outline-none transition-all"
            />
          </div>
        </div>

        {/* Church discount checkbox */}
        {(formData.service === 'sealcoating' || formData.service === 'paving') && (
          <label className="flex items-center gap-3 p-4 bg-gray-900/50 rounded-xl cursor-pointer hover:bg-gray-900 transition-colors">
            <input
              type="checkbox"
              checked={formData.isChurch}
              onChange={(e) => setFormData(prev => ({ ...prev, isChurch: e.target.checked }))}
              className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-0"
            />
            <div>
              <span className="text-white font-medium">House of Worship</span>
              <span className="text-green-500 text-sm ml-2">10% Discount</span>
            </div>
          </label>
        )}

        {/* Line striping: parking spaces */}
        {formData.service === 'linestriping' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Regular Spaces
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.regularSpaces || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, regularSpaces: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  className="w-full px-4 py-4 bg-gray-900 border-2 border-gray-800 rounded-xl text-white placeholder-gray-600 focus:border-yellow-500 outline-none transition-all"
                />
                <p className="text-gray-500 text-xs mt-1">$4/space</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Handicap Spaces
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.handicapSpaces || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, handicapSpaces: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  className="w-full px-4 py-4 bg-gray-900 border-2 border-gray-800 rounded-xl text-white placeholder-gray-600 focus:border-yellow-500 outline-none transition-all"
                />
                <p className="text-gray-500 text-xs mt-1">$43/space (incl. symbol)</p>
              </div>
            </div>

            {(formData.regularSpaces > 0 || formData.handicapSpaces > 0) && (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                <p className="text-gray-400 text-sm">Estimated Price</p>
                <p className="text-2xl font-bold text-white">${calculatePrice().toLocaleString()}</p>
              </div>
            )}
          </div>
        )}

        {/* Map for sealcoating/paving */}
        {formData.service !== 'linestriping' && formData.address && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">
                Outline Your Area
              </label>
              {drawnArea && (
                <button
                  onClick={redrawPolygon}
                  className="text-sm text-yellow-500 hover:text-yellow-400 transition-colors"
                >
                  Redraw
                </button>
              )}
            </div>

            <div className="relative rounded-xl overflow-hidden border-2 border-gray-800">
              <div ref={mapRef} className="w-full h-[300px] sm:h-[350px] bg-gray-900">
                {isLoadingMap && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Instructions overlay */}
              {!drawnArea && mapLoaded && (
                <div className="absolute bottom-4 left-4 right-4 bg-gray-900/90 backdrop-blur-sm rounded-lg p-3 text-center">
                  <p className="text-yellow-500 font-medium text-sm">
                    Click to draw your {formData.service === 'sealcoating' ? 'sealcoating' : 'paving'} area
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Tap points to outline, connect back to start
                  </p>
                </div>
              )}
            </div>

            {/* Area result */}
            {drawnArea && (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Area Measured</p>
                  <p className="text-2xl font-bold text-white">{drawnArea.toLocaleString()} sq ft</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm">Estimated Price</p>
                  <p className="text-2xl font-bold text-yellow-500">${calculatePrice().toLocaleString()}</p>
                </div>
              </div>
            )}

            {/* Add striping bundle for sealcoating */}
            {formData.service === 'sealcoating' && drawnArea && (
              <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.addStriping}
                    onChange={(e) => setFormData(prev => ({ ...prev, addStriping: e.target.checked }))}
                    className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-yellow-500 focus:ring-yellow-500"
                  />
                  <div className="flex-1">
                    <span className="text-white font-medium">Add Line Striping</span>
                    <span className="text-green-500 text-sm ml-2">Save 10%</span>
                  </div>
                </label>

                {formData.addStriping && (
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <input
                      type="number"
                      min="0"
                      value={formData.regularSpaces || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, regularSpaces: parseInt(e.target.value) || 0 }))}
                      placeholder="Regular spaces"
                      className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:border-yellow-500 outline-none"
                    />
                    <input
                      type="number"
                      min="0"
                      value={formData.handicapSpaces || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, handicapSpaces: parseInt(e.target.value) || 0 }))}
                      placeholder="Handicap spaces"
                      className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:border-yellow-500 outline-none"
                    />
                  </div>
                )}
              </div>
            )}

            <p className="text-center text-gray-500 text-sm">
              Prefer an on-site estimate? <a href={`tel:${config.phoneRaw}`} className="text-yellow-500 hover:underline">Call us</a> — $50 visit fee
            </p>
          </div>
        )}
      </div>
    </div>
  )

  const renderContactStep = () => (
    <div className="animate-fadeIn">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          How can we reach you?
        </h1>
        <p className="text-gray-400 text-lg">
          We&apos;ll send your quote and schedule confirmation
        </p>
      </div>

      <div className="max-w-md mx-auto space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">👤</span>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="John Smith"
              className="w-full pl-12 pr-4 py-4 bg-gray-900 border-2 border-gray-800 rounded-xl text-white placeholder-gray-600 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">📱</span>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: formatPhone(e.target.value) }))}
              placeholder="(618) 555-1234"
              className="w-full pl-12 pr-4 py-4 bg-gray-900 border-2 border-gray-800 rounded-xl text-white placeholder-gray-600 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 outline-none transition-all"
            />
          </div>
          <p className="text-gray-500 text-xs mt-1">We&apos;ll text you updates about your project</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email <span className="text-gray-500">(optional)</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">✉️</span>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="john@example.com"
              className="w-full pl-12 pr-4 py-4 bg-gray-900 border-2 border-gray-800 rounded-xl text-white placeholder-gray-600 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 outline-none transition-all"
            />
          </div>
        </div>

        {/* Security note */}
        <div className="flex items-center justify-center gap-2 text-gray-500 text-sm pt-4">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Your information is secure and never shared
        </div>
      </div>
    </div>
  )

  const renderScheduleStep = () => {
    const dates = getAvailableDates()

    return (
      <div className="animate-fadeIn">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            When works best?
          </h1>
          <p className="text-gray-400 text-lg">
            Select your preferred service date
          </p>
        </div>

        <div className="max-w-md mx-auto space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Preferred Date</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">📅</span>
              <select
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full pl-12 pr-4 py-4 bg-gray-900 border-2 border-gray-800 rounded-xl text-white focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="">Select a date...</option>
                {dates.map(date => (
                  <option key={date} value={date}>
                    {new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </option>
                ))}
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">▼</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes <span className="text-gray-500">(optional)</span>
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Gate codes, special instructions, etc."
              rows={3}
              className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-800 rounded-xl text-white placeholder-gray-600 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 outline-none transition-all resize-none"
            />
          </div>

          {/* Quick info */}
          <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <p className="text-white font-medium">Weather Dependent</p>
                <p className="text-gray-400 text-sm">
                  Asphalt work requires dry conditions. We&apos;ll contact you if we need to reschedule.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderReviewStep = () => {
    const price = calculatePrice()
    const deposit = Math.round(price * 0.5)
    const serviceName = config.services.find(s => s.id === formData.service)?.name || formData.service

    return (
      <div className="animate-fadeIn">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Review Your Quote
          </h1>
          <p className="text-gray-400 text-lg">
            Confirm your details and submit
          </p>
        </div>

        <div className="max-w-md mx-auto">
          {/* Summary card */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden mb-6">
            {/* Service */}
            <div className="p-4 border-b border-gray-800">
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Service</p>
              <p className="text-white font-semibold text-lg">
                {serviceName}
                {formData.addStriping && ' + Line Striping'}
              </p>
            </div>

            {/* Location */}
            <div className="p-4 border-b border-gray-800">
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Location</p>
              <p className="text-white">{formData.address}</p>
              {formData.squareFootage && (
                <p className="text-gray-400 text-sm">{formData.squareFootage.toLocaleString()} sq ft</p>
              )}
              {formData.isChurch && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                  House of Worship - 10% Off
                </span>
              )}
            </div>

            {/* Contact */}
            <div className="p-4 border-b border-gray-800">
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Contact</p>
              <p className="text-white font-medium">{formData.name}</p>
              <p className="text-gray-400 text-sm">{formData.phone}</p>
              {formData.email && <p className="text-gray-400 text-sm">{formData.email}</p>}
            </div>

            {/* Date */}
            <div className="p-4 border-b border-gray-800">
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Preferred Date</p>
              <p className="text-white">
                {new Date(formData.date + 'T12:00:00').toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            {/* Pricing */}
            <div className="p-4 bg-gray-800/50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Estimated Total</span>
                <span className="text-3xl font-bold text-white">${price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Deposit (50%)</span>
                <span className="text-yellow-500 font-semibold">${deposit.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Trust signals */}
          <div className="space-y-3 mb-6">
            {[
              { icon: '✓', text: 'Free on-site inspection included' },
              { icon: '✓', text: 'Licensed, bonded & insured' },
              { icon: '✓', text: 'Satisfaction guaranteed' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-gray-400">
                <span className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 text-xs">
                  {item.icon}
                </span>
                {item.text}
              </div>
            ))}
          </div>

          {submitError && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl mb-6">
              <p className="text-red-400 text-center">{submitError}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderSuccess = () => (
    <div className="animate-fadeIn text-center py-12">
      <div className="w-24 h-24 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center">
        <svg className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-3xl font-bold text-white mb-3">Quote Request Sent!</h1>
      <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
        Thank you! We&apos;ll review your request and get back to you within 24 hours.
      </p>

      <div className="space-y-4 max-w-sm mx-auto">
        <Link
          href="/"
          className="block w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold rounded-xl transition-colors"
        >
          Back to Home
        </Link>
        <a
          href={`tel:${config.phoneRaw}`}
          className="block w-full py-4 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl transition-colors"
        >
          Call Us: {config.phone}
        </a>
      </div>
    </div>
  )

  // ============================================
  // MAIN RENDER
  // ============================================

  const renderCurrentStep = () => {
    if (submitSuccess) return renderSuccess()

    switch (currentStep) {
      case 'service': return renderServiceStep()
      case 'project': return renderServiceStep() // fallback
      case 'location': return renderLocationStep()
      case 'contact': return renderContactStep()
      case 'schedule': return renderScheduleStep()
      case 'review': return renderReviewStep()
      default: return renderServiceStep()
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0908] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0908]/95 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-yellow-500 font-bold text-xl hover:text-yellow-400 transition-colors">
            {config.businessName}
          </Link>
          <a
            href={`tel:${config.phoneRaw}`}
            className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
          >
            <span className="hidden sm:inline">{config.phone}</span>
            <span className="sm:hidden">📞</span>
          </a>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 py-8 pb-32">
        <div className="max-w-3xl mx-auto">
          {!submitSuccess && renderProgressBar()}
          {renderCurrentStep()}
        </div>
      </main>

      {/* Fixed bottom navigation */}
      {!submitSuccess && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#0a0908] border-t border-gray-800 p-4 z-50">
          <div className="max-w-3xl mx-auto flex gap-4">
            {currentStep !== 'service' && (
              <button
                onClick={prevStep}
                className="flex-1 sm:flex-initial py-4 px-6 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Back</span>
              </button>
            )}

            {currentStep !== 'review' ? (
              <button
                onClick={nextStep}
                disabled={!canProceed()}
                className={`flex-1 py-4 px-6 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  canProceed()
                    ? 'bg-yellow-500 hover:bg-yellow-400 text-gray-900 shadow-lg shadow-yellow-500/25'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                Continue
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 py-4 px-6 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/25 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Submit Quote Request
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Animation styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  )
}
