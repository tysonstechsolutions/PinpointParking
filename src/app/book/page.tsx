'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { config } from '@/config/config'

// ============================================
// TYPES & CONSTANTS
// ============================================

type Step = 'service' | 'location' | 'contact' | 'schedule' | 'review'

interface FormData {
  service: string
  serviceName: string
  isChurch: boolean
  address: string
  squareFootage: number | null
  name: string
  phone: string
  email: string
  date: string
  notes: string
  regularSpaces: number
  handicapSpaces: number
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
  // NAVIGATION
  // ============================================

  const steps: Step[] = ['service', 'location', 'contact', 'schedule', 'review']
  const currentIdx = steps.indexOf(currentStep)

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 'service':
        return !!formData.service
      case 'location':
        if (formData.service === 'linestriping') {
          const hasSpaces = formData.regularSpaces > 0 || formData.handicapSpaces > 0
          const notTooMany = !stripingNeedsCall() // Block if 250+ spaces
          return !!formData.address && hasSpaces && notTooMany
        }
        return !!formData.address && (drawnArea !== null && drawnArea > 0)
      case 'contact':
        return !!formData.name && formData.phone.replace(/\D/g, '').length >= 10
      case 'schedule':
        return !!formData.date
      case 'review':
        return true
      default:
        return false
    }
  }

  const nextStep = () => {
    if (currentIdx < steps.length - 1 && canProceed()) {
      setCurrentStep(steps[currentIdx + 1])
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const prevStep = () => {
    if (currentIdx > 0) {
      setCurrentStep(steps[currentIdx - 1])
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // ============================================
  // PRICING
  // ============================================

  // Striping tier minimums based on total spaces
  const getStripingMinimum = (totalSpaces: number): number => {
    if (totalSpaces < 20) return 500
    if (totalSpaces <= 50) return 750
    if (totalSpaces <= 100) return 1150
    if (totalSpaces <= 250) return 2000
    return 0 // 250+ is call for pricing
  }

  // Calculate striping price separately (with tiered minimums)
  const calculateStripingPrice = (): number => {
    const stripingService = config.services.find(s => s.id === 'linestriping')!
    const pricePerStall = stripingService.pricePerStall || 4
    const pricePerSymbol = stripingService.pricePerSymbol || 35
    const regularPrice = formData.regularSpaces * pricePerStall
    const handicapPrice = formData.handicapSpaces * (pricePerStall * 2 + pricePerSymbol)
    const basePrice = Math.round(regularPrice + handicapPrice)

    const totalSpaces = formData.regularSpaces + formData.handicapSpaces
    const tierMinimum = getStripingMinimum(totalSpaces)

    return Math.max(basePrice, tierMinimum)
  }

  // Check if striping needs call for pricing (250+ spaces)
  const stripingNeedsCall = (): boolean => {
    const totalSpaces = formData.regularSpaces + formData.handicapSpaces
    return totalSpaces > 250
  }

  // Calculate sealcoating price separately (without striping)
  const calculateSealcoatingPrice = (): number => {
    const service = config.services.find(s => s.id === 'sealcoating')!
    const sqft = drawnArea || formData.squareFootage || 0
    let price = Math.max(Math.round(sqft * service.pricePerSqFt), service.minPrice)
    if (formData.isChurch) price = Math.round(price * 0.9)
    return price
  }

  const calculatePrice = (): number => {
    if (formData.service === 'linestriping') {
      return calculateStripingPrice()
    }

    if (formData.service === 'sealcoating') {
      let price = calculateSealcoatingPrice()
      // Add striping with 10% bundle discount, but still enforce striping minimum
      if (formData.addStriping && (formData.regularSpaces > 0 || formData.handicapSpaces > 0)) {
        const stripingPrice = calculateStripingPrice()
        price += Math.round(stripingPrice * 0.9) // 10% discount on striping when bundled
      }
      return price
    }

    if (formData.service === 'paving') {
      const service = config.services.find(s => s.id === 'paving')!
      const sqft = drawnArea || formData.squareFootage || 0
      const basePrice = sqft * service.pricePerSqFt
      const discount = formData.isChurch ? 0.10 : 0
      return Math.max(Math.round(basePrice * (1 - discount)), service.minPrice)
    }

    return 0
  }

  // ============================================
  // MAP
  // ============================================

  const loadMap = useCallback(async (address: string) => {
    if (mapLoaded || isLoadingMap || !address) return
    setIsLoadingMap(true)

    try {
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      const response = await fetch(geocodeUrl)
      const result = await response.json()

      let coords = config.googleMaps.defaultCenter
      if (result.results?.[0]?.geometry?.location) {
        coords = result.results[0].geometry.location
      }

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
        },
      })
      drawingManager.setMap(map)
      drawingManagerRef.current = drawingManager

      window.google.maps.event.addListener(drawingManager, 'polygoncomplete', (polygon: google.maps.Polygon) => {
        if (polygonRef.current) polygonRef.current.setMap(null)
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
  // HELPERS
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
        project_type: formData.isChurch ? 'house-of-worship' : 'commercial',
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
  // PROGRESS BAR
  // ============================================

  const ProgressBar = () => (
    <div className="w-full max-w-4xl mx-auto mb-12 px-4">
      {/* Progress line */}
      <div className="relative">
        <div className="absolute top-6 left-0 right-0 h-1 bg-zinc-800 rounded-full" />
        <div
          className="absolute top-6 left-0 h-1 bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full transition-all duration-500"
          style={{ width: `${(currentIdx / (steps.length - 1)) * 100}%` }}
        />

        {/* Step circles */}
        <div className="relative flex justify-between">
          {steps.map((step, idx) => {
            const stepInfo = STEPS.find(s => s.id === step)!
            const isActive = currentIdx === idx
            const isComplete = currentIdx > idx

            return (
              <div key={step} className="flex flex-col items-center">
                <div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold
                    transition-all duration-300 border-4
                    ${isActive
                      ? 'bg-yellow-500 border-yellow-500 text-black scale-110 shadow-lg shadow-yellow-500/30'
                      : isComplete
                        ? 'bg-yellow-500 border-yellow-500 text-black'
                        : 'bg-zinc-900 border-zinc-700 text-zinc-500'
                    }
                  `}
                >
                  {isComplete ? '✓' : stepInfo.icon}
                </div>
                <span className={`
                  mt-3 text-sm font-medium hidden sm:block
                  ${isActive ? 'text-yellow-500' : isComplete ? 'text-zinc-400' : 'text-zinc-600'}
                `}>
                  {stepInfo.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )

  // ============================================
  // STEP 1: SERVICE SELECTION
  // ============================================

  const ServiceStep = () => (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
          What do you need done?
        </h1>
        <p className="text-xl text-zinc-400">
          Choose the service that best fits your project
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {config.services.map((service) => {
          const isSelected = formData.service === service.id
          return (
            <button
              key={service.id}
              onClick={() => setFormData(prev => ({ ...prev, service: service.id, serviceName: service.name }))}
              className={`
                relative p-8 rounded-2xl text-left transition-all duration-300
                ${isSelected
                  ? 'bg-yellow-500/10 border-2 border-yellow-500 shadow-xl shadow-yellow-500/10 scale-[1.02]'
                  : 'bg-zinc-900/80 border-2 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                }
              `}
            >
              {isSelected && (
                <div className="absolute top-4 right-4 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              <div className="text-5xl mb-4">{service.emoji}</div>
              <h3 className={`text-2xl font-bold mb-2 ${isSelected ? 'text-yellow-500' : 'text-white'}`}>
                {service.name}
              </h3>
              <p className="text-zinc-400 mb-4">{service.description}</p>

              <div className="flex flex-wrap gap-2">
                {service.bestFor.slice(0, 2).map((item, i) => (
                  <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-zinc-800 text-zinc-400">
                    {item}
                  </span>
                ))}
              </div>
            </button>
          )
        })}
      </div>

      {/* Trust badges */}
      <div className="flex flex-wrap justify-center gap-8 text-zinc-500">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <span>Licensed & Insured</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <span>Free Estimates</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <span>Satisfaction Guaranteed</span>
        </div>
      </div>
    </div>
  )

  // ============================================
  // STEP 2: LOCATION
  // ============================================

  const LocationStep = () => (
    <div className="w-full max-w-3xl mx-auto px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
          Where&apos;s the property?
        </h1>
        <p className="text-xl text-zinc-400">
          {formData.service === 'linestriping'
            ? 'Enter the address and tell us about your parking lot'
            : 'Enter the address and outline your area on the map'
          }
        </p>
      </div>

      <div className="space-y-6">
        {/* Address */}
        <div>
          <label className="block text-sm font-semibold text-zinc-300 mb-3 uppercase tracking-wide">
            Property Address
          </label>
          <div className="relative">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl">📍</div>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              onBlur={() => {
                if (formData.address && formData.service !== 'linestriping' && !mapLoaded) {
                  loadMap(formData.address)
                }
              }}
              placeholder="123 Main Street, Mount Vernon, IL 62864"
              className="w-full pl-16 pr-6 py-5 text-lg bg-zinc-900 border-2 border-zinc-700 rounded-xl text-white placeholder-zinc-600 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/20 outline-none transition-all"
            />
          </div>
        </div>

        {/* Church discount */}
        {(formData.service === 'sealcoating' || formData.service === 'paving') && (
          <label className="flex items-center gap-4 p-5 bg-zinc-900 rounded-xl cursor-pointer hover:bg-zinc-800/80 transition-colors border-2 border-zinc-800">
            <input
              type="checkbox"
              checked={formData.isChurch}
              onChange={(e) => setFormData(prev => ({ ...prev, isChurch: e.target.checked }))}
              className="w-6 h-6 rounded-lg border-2 border-zinc-600 bg-zinc-800 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-0 cursor-pointer"
            />
            <div className="flex-1">
              <span className="text-lg text-white font-medium">House of Worship</span>
              <span className="ml-3 px-3 py-1 bg-green-500/20 text-green-400 text-sm font-semibold rounded-full">
                10% OFF
              </span>
            </div>
          </label>
        )}

        {/* Line striping inputs */}
        {formData.service === 'linestriping' && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-3 uppercase tracking-wide">
                  Regular Parking Spaces
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.regularSpaces || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, regularSpaces: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  className="w-full px-6 py-5 text-lg bg-zinc-900 border-2 border-zinc-700 rounded-xl text-white placeholder-zinc-600 focus:border-yellow-500 outline-none transition-all"
                />
                <p className="mt-2 text-zinc-500">$4 per space</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-3 uppercase tracking-wide">
                  Handicap Spaces
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.handicapSpaces || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, handicapSpaces: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  className="w-full px-6 py-5 text-lg bg-zinc-900 border-2 border-zinc-700 rounded-xl text-white placeholder-zinc-600 focus:border-yellow-500 outline-none transition-all"
                />
                <p className="mt-2 text-zinc-500">$43 per space (includes symbol)</p>
              </div>
            </div>

            {/* Pricing tiers info */}
            <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
              <p className="text-sm font-semibold text-zinc-400 mb-2">Pricing Tiers (minimum prices):</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                <div className="text-zinc-500">Under 20: <span className="text-white">$500</span></div>
                <div className="text-zinc-500">20-50: <span className="text-white">$750</span></div>
                <div className="text-zinc-500">51-100: <span className="text-white">$1,150</span></div>
                <div className="text-zinc-500">101-250: <span className="text-white">$2,000</span></div>
              </div>
              <p className="text-xs text-zinc-600 mt-2">250+ spaces: Call for custom pricing</p>
            </div>

            {(formData.regularSpaces > 0 || formData.handicapSpaces > 0) && (
              <div className="p-6 bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 border-2 border-yellow-500/30 rounded-xl">
                {stripingNeedsCall() ? (
                  <div className="text-center">
                    <p className="text-xl text-white font-semibold mb-2">250+ Spaces</p>
                    <p className="text-zinc-400">Please call for custom pricing</p>
                    <a href={`tel:${config.phoneRaw}`} className="inline-block mt-3 px-6 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors">
                      Call {config.phone}
                    </a>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-zinc-400 text-lg">Estimated Price</span>
                      <p className="text-sm text-zinc-500">
                        {formData.regularSpaces + formData.handicapSpaces} spaces (min ${getStripingMinimum(formData.regularSpaces + formData.handicapSpaces).toLocaleString()})
                      </p>
                    </div>
                    <span className="text-4xl font-bold text-white">${calculatePrice().toLocaleString()}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Map for sealcoating/paving */}
        {formData.service !== 'linestriping' && formData.address && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">
                Draw Your Area
              </label>
              {drawnArea && (
                <button onClick={redrawPolygon} className="text-yellow-500 hover:text-yellow-400 font-medium">
                  Redraw Area
                </button>
              )}
            </div>

            <div className="relative rounded-2xl overflow-hidden border-2 border-zinc-700">
              <div ref={mapRef} className="w-full h-[400px] bg-zinc-900">
                {isLoadingMap && (
                  <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                    <div className="w-10 h-10 border-3 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {!drawnArea && mapLoaded && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
                  <p className="text-yellow-500 font-semibold text-lg text-center">
                    Click to outline your {formData.service === 'sealcoating' ? 'sealcoating' : 'paving'} area
                  </p>
                  <p className="text-zinc-400 text-center mt-1">
                    Click points around the perimeter, then connect back to start
                  </p>
                </div>
              )}
            </div>

            {drawnArea && (
              <div className="p-6 bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 border-2 border-yellow-500/30 rounded-xl">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-zinc-400 mb-1">Area Measured</p>
                    <p className="text-3xl font-bold text-white">{drawnArea.toLocaleString()} sq ft</p>
                  </div>
                  <div className="text-right">
                    <p className="text-zinc-400 mb-1">Estimated Price</p>
                    <p className="text-3xl font-bold text-yellow-500">${calculatePrice().toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Striping bundle for sealcoating */}
            {formData.service === 'sealcoating' && drawnArea && (
              <div className="p-6 bg-zinc-900 rounded-xl border-2 border-zinc-800">
                <label className="flex items-center gap-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.addStriping}
                    onChange={(e) => setFormData(prev => ({ ...prev, addStriping: e.target.checked }))}
                    className="w-6 h-6 rounded-lg border-2 border-zinc-600 bg-zinc-800 text-yellow-500 focus:ring-yellow-500"
                  />
                  <div className="flex-1">
                    <span className="text-lg text-white font-medium">Add Line Striping</span>
                    <span className="ml-3 px-3 py-1 bg-green-500/20 text-green-400 text-sm font-semibold rounded-full">
                      Save 10%
                    </span>
                  </div>
                </label>

                {formData.addStriping && (
                  <div className="grid sm:grid-cols-2 gap-4 mt-5 pt-5 border-t border-zinc-800">
                    <input
                      type="number"
                      min="0"
                      value={formData.regularSpaces || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, regularSpaces: parseInt(e.target.value) || 0 }))}
                      placeholder="Regular spaces"
                      className="px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-yellow-500 outline-none"
                    />
                    <input
                      type="number"
                      min="0"
                      value={formData.handicapSpaces || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, handicapSpaces: parseInt(e.target.value) || 0 }))}
                      placeholder="Handicap spaces"
                      className="px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-yellow-500 outline-none"
                    />
                  </div>
                )}
              </div>
            )}

            <p className="text-center text-zinc-500">
              Prefer an on-site estimate? <a href={`tel:${config.phoneRaw}`} className="text-yellow-500 hover:underline font-medium">Call us</a> — $50 visit fee
            </p>
          </div>
        )}
      </div>
    </div>
  )

  // ============================================
  // STEP 3: CONTACT
  // ============================================

  const ContactStep = () => (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
          How can we reach you?
        </h1>
        <p className="text-xl text-zinc-400">
          We&apos;ll send your quote and schedule confirmation
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-zinc-300 mb-3 uppercase tracking-wide">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl">👤</div>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="John Smith"
              className="w-full pl-16 pr-6 py-5 text-lg bg-zinc-900 border-2 border-zinc-700 rounded-xl text-white placeholder-zinc-600 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/20 outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-zinc-300 mb-3 uppercase tracking-wide">
            Phone Number
          </label>
          <div className="relative">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl">📱</div>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: formatPhone(e.target.value) }))}
              placeholder="(618) 555-1234"
              className="w-full pl-16 pr-6 py-5 text-lg bg-zinc-900 border-2 border-zinc-700 rounded-xl text-white placeholder-zinc-600 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/20 outline-none transition-all"
            />
          </div>
          <p className="mt-2 text-zinc-500">We&apos;ll text you updates about your project</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-zinc-300 mb-3 uppercase tracking-wide">
            Email <span className="text-zinc-500 font-normal normal-case">(optional)</span>
          </label>
          <div className="relative">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl">✉️</div>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="john@example.com"
              className="w-full pl-16 pr-6 py-5 text-lg bg-zinc-900 border-2 border-zinc-700 rounded-xl text-white placeholder-zinc-600 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/20 outline-none transition-all"
            />
          </div>
        </div>

        {/* Security */}
        <div className="flex items-center justify-center gap-3 pt-4 text-zinc-500">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span>Your information is secure and never shared</span>
        </div>
      </div>
    </div>
  )

  // ============================================
  // STEP 4: SCHEDULE
  // ============================================

  const ScheduleStep = () => {
    const dates = getAvailableDates()

    return (
      <div className="w-full max-w-2xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            When works best?
          </h1>
          <p className="text-xl text-zinc-400">
            Select your preferred service date
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-3 uppercase tracking-wide">
              Preferred Date
            </label>
            <div className="relative">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl">📅</div>
              <select
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full pl-16 pr-12 py-5 text-lg bg-zinc-900 border-2 border-zinc-700 rounded-xl text-white focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/20 outline-none transition-all appearance-none cursor-pointer"
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
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-3 uppercase tracking-wide">
              Special Instructions <span className="text-zinc-500 font-normal normal-case">(optional)</span>
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Gate codes, best time to call, special requests..."
              rows={4}
              className="w-full px-6 py-4 text-lg bg-zinc-900 border-2 border-zinc-700 rounded-xl text-white placeholder-zinc-600 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/20 outline-none transition-all resize-none"
            />
          </div>

          {/* Info box */}
          <div className="p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
            <div className="flex gap-4">
              <div className="text-3xl">💡</div>
              <div>
                <p className="text-white font-semibold text-lg">Weather Dependent</p>
                <p className="text-zinc-400 mt-1">
                  Asphalt work requires dry conditions. We&apos;ll contact you if we need to reschedule due to weather.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ============================================
  // STEP 5: REVIEW
  // ============================================

  const ReviewStep = () => {
    const totalPrice = calculatePrice()
    const deposit = Math.round(totalPrice * 0.5)
    const serviceName = config.services.find(s => s.id === formData.service)?.name || ''

    // Calculate individual prices for breakdown
    const sealcoatingPrice = formData.service === 'sealcoating' ? calculateSealcoatingPrice() : 0
    const stripingPrice = (formData.service === 'linestriping' || (formData.addStriping && (formData.regularSpaces > 0 || formData.handicapSpaces > 0)))
      ? calculateStripingPrice()
      : 0
    const stripingDiscount = formData.service === 'sealcoating' && formData.addStriping && stripingPrice > 0
      ? Math.round(stripingPrice * 0.1) // 10% discount
      : 0

    return (
      <div className="w-full max-w-2xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Review Your Quote
          </h1>
          <p className="text-xl text-zinc-400">
            Make sure everything looks good
          </p>
        </div>

        {/* Summary card */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden mb-8">
          <div className="p-6 border-b border-zinc-800">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Service</p>
            <p className="text-2xl font-bold text-white">
              {serviceName}
              {formData.addStriping && ' + Line Striping'}
            </p>
          </div>

          <div className="p-6 border-b border-zinc-800">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Location</p>
            <p className="text-lg text-white">{formData.address}</p>
            {formData.squareFootage && (
              <p className="text-zinc-400 mt-1">{formData.squareFootage.toLocaleString()} sq ft</p>
            )}
            {formData.isChurch && (
              <span className="inline-block mt-2 px-3 py-1 bg-green-500/20 text-green-400 text-sm font-semibold rounded-full">
                House of Worship - 10% Off
              </span>
            )}
          </div>

          {/* Line striping details */}
          {(formData.service === 'linestriping' || formData.addStriping) && (formData.regularSpaces > 0 || formData.handicapSpaces > 0) && (
            <div className="p-6 border-b border-zinc-800">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Striping Details</p>
              {formData.regularSpaces > 0 && (
                <p className="text-zinc-400">{formData.regularSpaces} regular spaces</p>
              )}
              {formData.handicapSpaces > 0 && (
                <p className="text-zinc-400">{formData.handicapSpaces} handicap spaces (w/ symbols)</p>
              )}
            </div>
          )}

          <div className="p-6 border-b border-zinc-800">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Contact</p>
            <p className="text-lg font-medium text-white">{formData.name}</p>
            <p className="text-zinc-400">{formData.phone}</p>
            {formData.email && <p className="text-zinc-400">{formData.email}</p>}
          </div>

          <div className="p-6 border-b border-zinc-800">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Date</p>
            <p className="text-lg text-white">
              {new Date(formData.date + 'T12:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          {/* Pricing breakdown */}
          <div className="p-6 bg-zinc-800/50">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Pricing</p>

            {/* Show sealcoating price if sealcoating service */}
            {formData.service === 'sealcoating' && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-zinc-400">Sealcoating ({formData.squareFootage?.toLocaleString()} sq ft)</span>
                <span className="text-lg text-white">${sealcoatingPrice.toLocaleString()}</span>
              </div>
            )}

            {/* Show striping price */}
            {stripingPrice > 0 && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-zinc-400">
                  Line Striping ({formData.regularSpaces + formData.handicapSpaces} spaces)
                </span>
                <span className="text-lg text-white">${stripingPrice.toLocaleString()}</span>
              </div>
            )}

            {/* Show bundle discount if applicable */}
            {stripingDiscount > 0 && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-green-400">Bundle Discount (10% off striping)</span>
                <span className="text-lg text-green-400">-${stripingDiscount.toLocaleString()}</span>
              </div>
            )}

            {/* Paving price */}
            {formData.service === 'paving' && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-zinc-400">Paving ({formData.squareFootage?.toLocaleString()} sq ft)</span>
                <span className="text-lg text-white">${totalPrice.toLocaleString()}</span>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-zinc-700 my-4" />

            {/* Total */}
            <div className="flex justify-between items-center mb-3">
              <span className="text-zinc-300 text-lg font-semibold">Estimated Total</span>
              <span className="text-4xl font-bold text-white">${totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500">Deposit (50%)</span>
              <span className="text-xl font-semibold text-yellow-500">${deposit.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Trust signals */}
        <div className="space-y-4 mb-8">
          {[
            'Free on-site inspection included',
            'Licensed, bonded & insured',
            'Satisfaction guaranteed',
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 text-zinc-400">
              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-lg">{item}</span>
            </div>
          ))}
        </div>

        {submitError && (
          <div className="p-5 bg-red-500/10 border border-red-500/30 rounded-xl mb-6">
            <p className="text-red-400 text-center text-lg">{submitError}</p>
          </div>
        )}
      </div>
    )
  }

  // ============================================
  // SUCCESS
  // ============================================

  const SuccessStep = () => (
    <div className="w-full max-w-2xl mx-auto px-4 text-center py-12">
      <div className="w-28 h-28 mx-auto mb-8 bg-green-500/20 rounded-full flex items-center justify-center">
        <svg className="w-14 h-14 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Quote Request Sent!</h1>
      <p className="text-xl text-zinc-400 mb-10 max-w-md mx-auto">
        Thank you! We&apos;ll review your request and get back to you within 24 hours.
      </p>

      <div className="space-y-4 max-w-sm mx-auto">
        <Link
          href="/"
          className="block w-full py-5 bg-yellow-500 hover:bg-yellow-400 text-black text-lg font-bold rounded-xl transition-colors"
        >
          Back to Home
        </Link>
        <a
          href={`tel:${config.phoneRaw}`}
          className="block w-full py-5 bg-zinc-800 hover:bg-zinc-700 text-white text-lg font-semibold rounded-xl transition-colors"
        >
          Call Us: {config.phone}
        </a>
      </div>
    </div>
  )

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="text-yellow-500 font-bold text-2xl hover:text-yellow-400 transition-colors">
            {config.businessName}
          </Link>
          <a href={`tel:${config.phoneRaw}`} className="text-zinc-400 hover:text-white transition-colors text-lg">
            <span className="hidden sm:inline">{config.phone}</span>
            <span className="sm:hidden text-2xl">📞</span>
          </a>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 py-12 pb-36">
        {!submitSuccess && <ProgressBar />}

        <div className="animate-fadeIn">
          {submitSuccess ? <SuccessStep /> :
           currentStep === 'service' ? <ServiceStep /> :
           currentStep === 'location' ? <LocationStep /> :
           currentStep === 'contact' ? <ContactStep /> :
           currentStep === 'schedule' ? <ScheduleStep /> :
           currentStep === 'review' ? <ReviewStep /> : null}
        </div>
      </main>

      {/* Fixed bottom nav */}
      {!submitSuccess && (
        <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-md border-t border-zinc-800 p-5 z-50">
          <div className="max-w-3xl mx-auto flex gap-4">
            {currentStep !== 'service' && (
              <button
                onClick={prevStep}
                className="flex-shrink-0 py-5 px-8 bg-zinc-800 hover:bg-zinc-700 text-white text-lg font-semibold rounded-xl transition-all flex items-center gap-3"
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
                className={`flex-1 py-5 px-8 text-lg font-bold rounded-xl transition-all flex items-center justify-center gap-3 ${
                  canProceed()
                    ? 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-lg shadow-yellow-500/30'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
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
                className="flex-1 py-5 px-8 bg-yellow-500 hover:bg-yellow-400 text-black text-lg font-bold rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-yellow-500/30 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}
