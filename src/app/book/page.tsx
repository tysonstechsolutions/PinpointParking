'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { config } from '@/config/config'

// Steps
const STEPS = {
  SERVICE: 1,
  PROJECT_TYPE: 2,
  CONTACT: 3,
  MAP: 4,
  SCHEDULE: 5,
  CONFIRM: 6,
}

// Sealcoating steps
const SEALCOAT_STEPS = {
  ADDRESS: 1,
  MAP: 2,
  STRIPING: 3,
  STRIPING_SPACES: 4,
  CONTACT: 5,
  SCHEDULE: 6,
  CONFIRM: 7,
}

// Line striping steps
const STRIPING_STEPS = {
  ADDRESS: 1,
  SPACES: 2,
  CONTACT: 3,
  SCHEDULE: 4,
  CONFIRM: 5,
}

const COLORS = {
  bg: '#1a1714',
  card: '#252220',
  border: '#3d3a37',
  yellow: '#F5C518',
  yellowHover: '#e3b416',
  gray: '#9C9690',
  lightGray: '#d4d0cc',
  white: '#ffffff',
  green: '#22c55e',
  red: '#ef4444',
}

declare global {
  interface Window {
    google: typeof google
    initMap: () => void
  }
}

export default function BookingPage() {
  // Common state
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [projectType, setProjectType] = useState<string | null>(null)
  const [isChurch, setIsChurch] = useState(false)

  // Contact info
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')

  // Map/area
  const [squareFootage, setSquareFootage] = useState<number | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [isLoadingMap, setIsLoadingMap] = useState(false)
  const [drawnArea, setDrawnArea] = useState<number | null>(null)
  const [mapCoordinates, setMapCoordinates] = useState<{lat: number, lng: number} | null>(null)

  // Line striping specific
  const [regularSpaces, setRegularSpaces] = useState('')
  const [handicapSpaces, setHandicapSpaces] = useState('')

  // Sealcoat + striping bundle
  const [addStriping, setAddStriping] = useState(false)

  // Scheduling
  const [selectedDate, setSelectedDate] = useState('')
  const [notes, setNotes] = useState('')

  // Pricing
  const [estimate, setEstimate] = useState<number | null>(null)
  const [sealcoatingPrice, setSealcoatingPrice] = useState<number | null>(null)
  const [stripingPrice, setStripingPrice] = useState<number | null>(null)

  // Submission
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Refs
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const polygonRef = useRef<google.maps.Polygon | null>(null)
  const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(null)

  // Calculate prices
  const calculateSealcoatingPrice = (sqft: number): number => {
    const service = config.services.find(s => s.id === 'sealcoating')!
    const basePrice = sqft * service.pricePerSqFt
    return Math.max(Math.round(basePrice), service.minPrice)
  }

  const calculateStripingPrice = (regular: number, handicap: number): number => {
    const service = config.services.find(s => s.id === 'linestriping')!
    const regularPrice = regular * service.pricePerStall
    const handicapPrice = handicap * (service.pricePerStall * 2 + service.pricePerSymbol)
    return Math.max(Math.round(regularPrice + handicapPrice), service.minPrice)
  }

  const calculatePavingEstimate = (sqft: number, discount: number = 0): { low: number, high: number } => {
    const service = config.services.find(s => s.id === 'paving')!
    const basePrice = sqft * service.pricePerSqFt
    const discountedPrice = basePrice * (1 - discount)
    const buffer = service.estimateBuffer
    return {
      low: Math.max(Math.round(discountedPrice * (1 - buffer)), service.minPrice),
      high: Math.round(discountedPrice * (1 + buffer))
    }
  }

  // Load Google Maps
  const loadMap = useCallback(async (addr: string) => {
    if (mapLoaded || isLoadingMap) return
    setIsLoadingMap(true)

    try {
      // Geocode address
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addr)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      const response = await fetch(geocodeUrl)
      const result = await response.json()

      let coords = config.googleMaps.defaultCenter
      if (result.results?.[0]?.geometry?.location) {
        coords = result.results[0].geometry.location
      }
      setMapCoordinates(coords)

      // Load Google Maps script if not already loaded
      if (!window.google?.maps) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script')
          script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=drawing,geometry`
          script.async = true
          script.defer = true
          script.onload = () => resolve()
          script.onerror = reject
          document.head.appendChild(script)
        })
      }

      // Wait for map container
      await new Promise(resolve => setTimeout(resolve, 100))

      if (!mapRef.current) {
        setIsLoadingMap(false)
        return
      }

      // Initialize map
      const map = new window.google.maps.Map(mapRef.current, {
        center: coords,
        zoom: 19,
        mapTypeId: 'satellite',
        disableDefaultUI: true,
        zoomControl: true,
        scrollwheel: true,
      })
      mapInstanceRef.current = map

      // Drawing manager
      const drawingManager = new window.google.maps.drawing.DrawingManager({
        drawingMode: window.google.maps.drawing.OverlayType.POLYGON,
        drawingControl: false,
        polygonOptions: {
          fillColor: '#F5C518',
          fillOpacity: 0.3,
          strokeColor: '#F5C518',
          strokeWeight: 2,
          editable: true,
          draggable: false,
        },
      })
      drawingManager.setMap(map)
      drawingManagerRef.current = drawingManager

      // Handle polygon complete
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
          setSquareFootage(sqft)
        }
        updateArea()

        // Listen for edits
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

  // Format phone
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
  }

  // Get available dates
  const getAvailableDates = () => {
    const dates: string[] = []
    const today = new Date()
    for (let i = config.booking.minDaysOut; i <= config.booking.maxDaysOut; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() + i)
      if (config.booking.skipSundays && date.getDay() === 0) continue
      dates.push(date.toISOString().split('T')[0])
    }
    return dates
  }

  // Submit booking
  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const jobData = {
        customer_name: name,
        customer_phone: phone.replace(/\D/g, ''),
        customer_email: email || null,
        service_address: address,
        job_type: selectedService,
        project_type: projectType || (isChurch ? 'house-of-worship' : 'commercial'),
        square_feet: squareFootage,
        quote_cents: (estimate || sealcoatingPrice || stripingPrice || 0) * 100,
        scheduled_date: selectedDate,
        status: 'quote',
        notes: notes || null,
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

      // Send notification
      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'new_booking',
          data: jobData,
        }),
      }).catch(() => {}) // Ignore notification errors

      setSubmitSuccess(true)
    } catch (err) {
      setSubmitError('Something went wrong. Please call us instead.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get total price for display
  const getTotalPrice = () => {
    if (selectedService === 'sealcoating') {
      if (addStriping && sealcoatingPrice && stripingPrice) {
        const bundleDiscount = Math.round((sealcoatingPrice + stripingPrice) * 0.1)
        return sealcoatingPrice + stripingPrice - bundleDiscount
      }
      return sealcoatingPrice
    }
    if (selectedService === 'linestriping') {
      return stripingPrice
    }
    return estimate
  }

  // Service selection step
  const renderServiceStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">What can we help you with?</h2>
        <p className="text-gray-400">Select the service you need</p>
      </div>

      <div className="grid gap-4">
        {config.services.map(service => (
          <button
            key={service.id}
            onClick={() => {
              setSelectedService(service.id)
              if (service.id === 'sealcoating') {
                setCurrentStep(SEALCOAT_STEPS.ADDRESS)
              } else if (service.id === 'linestriping') {
                setCurrentStep(STRIPING_STEPS.ADDRESS)
              } else {
                setCurrentStep(STEPS.PROJECT_TYPE)
              }
            }}
            className="w-full p-6 rounded-xl text-left transition-all duration-200 hover:scale-[1.02] group"
            style={{
              backgroundColor: COLORS.card,
              border: `2px solid ${COLORS.border}`,
            }}
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl">{service.emoji}</span>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white group-hover:text-yellow-400 transition-colors">
                  {service.name}
                </h3>
                <p className="text-gray-400 mt-1">{service.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {service.bestFor.slice(0, 2).map((item, i) => (
                    <span key={i} className="text-xs px-2 py-1 rounded-full bg-gray-700 text-gray-300">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <svg className="w-6 h-6 text-gray-500 group-hover:text-yellow-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  )

  // Project type step (for paving)
  const renderProjectTypeStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">What type of property?</h2>
        <p className="text-gray-400">This helps us provide an accurate estimate</p>
      </div>

      <div className="grid gap-4">
        {config.projectTypes.map(type => (
          <button
            key={type.id}
            onClick={() => {
              setProjectType(type.id)
              setIsChurch(type.id === 'house-of-worship')
              setCurrentStep(STEPS.CONTACT)
            }}
            className="w-full p-5 rounded-xl text-left transition-all duration-200 hover:scale-[1.02] group"
            style={{
              backgroundColor: COLORS.card,
              border: `2px solid ${COLORS.border}`,
            }}
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">{type.emoji}</span>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white group-hover:text-yellow-400 transition-colors">
                  {type.label}
                </h3>
                <p className="text-gray-400 text-sm">{type.description}</p>
                {type.discount > 0 && (
                  <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-green-900 text-green-400">
                    {Math.round(type.discount * 100)}% Discount
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )

  // Contact info step
  const renderContactStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Contact Information</h2>
        <p className="text-gray-400">We&apos;ll use this to send your quote</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="John Smith"
            className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number *</label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(formatPhone(e.target.value))}
            placeholder="(618) 555-1234"
            className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Email (optional)</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="john@example.com"
            className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Property Address *</label>
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="123 Main St, Mount Vernon, IL"
            className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
          />
        </div>

        {selectedService === 'sealcoating' && (
          <label className="flex items-center gap-3 mt-4 cursor-pointer">
            <input
              type="checkbox"
              checked={isChurch}
              onChange={e => setIsChurch(e.target.checked)}
              className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-yellow-500 focus:ring-yellow-500"
            />
            <span className="text-gray-300">This is a House of Worship (10% discount)</span>
          </label>
        )}
      </div>

      <button
        onClick={() => {
          if (!name || phone.replace(/\D/g, '').length < 10 || !address) return
          if (selectedService === 'paving') {
            setCurrentStep(STEPS.MAP)
            setTimeout(() => loadMap(address), 100)
          } else if (selectedService === 'sealcoating') {
            setCurrentStep(SEALCOAT_STEPS.SCHEDULE)
          } else if (selectedService === 'linestriping') {
            setCurrentStep(STRIPING_STEPS.SCHEDULE)
          }
        }}
        disabled={!name || phone.replace(/\D/g, '').length < 10 || !address}
        className="w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: COLORS.yellow, color: COLORS.bg }}
      >
        Continue
      </button>
    </div>
  )

  // Map step
  const renderMapStep = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-white mb-2">Outline Your Area</h2>
        <p className="text-gray-400 text-sm">Click the map to draw your {selectedService === 'sealcoating' ? 'sealcoating' : 'paving'} area</p>
      </div>

      <div className="rounded-xl overflow-hidden border-2" style={{ borderColor: COLORS.border }}>
        <div ref={mapRef} className="w-full h-[350px] bg-gray-800">
          {isLoadingMap && (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-yellow-400 border-t-transparent"></div>
            </div>
          )}
        </div>
      </div>

      {drawnArea && (
        <div className="p-4 rounded-xl" style={{ backgroundColor: COLORS.card }}>
          <div className="text-center">
            <span className="text-gray-400">Area:</span>
            <span className="text-2xl font-bold text-white ml-2">{drawnArea.toLocaleString()} sq ft</span>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={redrawPolygon}
          className="flex-1 py-3 rounded-xl font-medium transition-colors"
          style={{ backgroundColor: COLORS.card, color: COLORS.gray, border: `1px solid ${COLORS.border}` }}
        >
          Redraw
        </button>
        <button
          onClick={() => {
            if (!drawnArea) return
            if (selectedService === 'paving') {
              const discount = isChurch ? 0.10 : 0
              const est = calculatePavingEstimate(drawnArea, discount)
              setEstimate(Math.round((est.low + est.high) / 2))
              setCurrentStep(STEPS.SCHEDULE)
            } else if (selectedService === 'sealcoating') {
              const price = calculateSealcoatingPrice(drawnArea)
              setSealcoatingPrice(price)
              setCurrentStep(SEALCOAT_STEPS.STRIPING)
            }
          }}
          disabled={!drawnArea}
          className="flex-[2] py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
          style={{ backgroundColor: COLORS.yellow, color: COLORS.bg }}
        >
          Confirm Area
        </button>
      </div>

      <p className="text-center text-gray-500 text-sm">
        Prefer we come look? <a href={`tel:${config.phoneRaw}`} className="text-yellow-400 underline">Call us</a> for a $50 on-site estimate.
      </p>
    </div>
  )

  // Sealcoat address step
  const renderSealcoatAddressStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Property Address</h2>
        <p className="text-gray-400">Where do you need sealcoating?</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Address *</label>
        <input
          type="text"
          value={address}
          onChange={e => setAddress(e.target.value)}
          placeholder="123 Main St, Mount Vernon, IL"
          className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
        />
      </div>

      <button
        onClick={() => {
          if (!address) return
          setCurrentStep(SEALCOAT_STEPS.MAP)
          setTimeout(() => loadMap(address), 100)
        }}
        disabled={!address}
        className="w-full py-4 rounded-xl font-semibold text-lg disabled:opacity-50"
        style={{ backgroundColor: COLORS.yellow, color: COLORS.bg }}
      >
        Find Location
      </button>
    </div>
  )

  // Sealcoat striping add-on step
  const renderStripingAddOnStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <div className="p-4 rounded-xl mb-6" style={{ backgroundColor: COLORS.card }}>
          <p className="text-gray-400 text-sm">Sealcoating Estimate</p>
          <p className="text-3xl font-bold text-white">${sealcoatingPrice?.toLocaleString()}</p>
          <p className="text-gray-500 text-sm">{squareFootage?.toLocaleString()} sq ft</p>
        </div>

        <h2 className="text-xl font-bold text-white mb-2">Add Line Striping?</h2>
        <p className="text-gray-400 text-sm">Bundle and save 10% on striping</p>
      </div>

      <div className="grid gap-4">
        <button
          onClick={() => {
            setAddStriping(true)
            setCurrentStep(SEALCOAT_STEPS.STRIPING_SPACES)
          }}
          className="w-full p-5 rounded-xl text-left transition-all hover:scale-[1.02]"
          style={{ backgroundColor: COLORS.card, border: `2px solid ${COLORS.yellow}` }}
        >
          <div className="flex items-center gap-4">
            <span className="text-2xl">🅿️</span>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-400">Yes, add striping</h3>
              <p className="text-gray-400 text-sm">Save 10% on striping when bundled</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => {
            setAddStriping(false)
            setCurrentStep(SEALCOAT_STEPS.CONTACT)
          }}
          className="w-full p-5 rounded-xl text-left transition-all hover:scale-[1.02]"
          style={{ backgroundColor: COLORS.card, border: `2px solid ${COLORS.border}` }}
        >
          <div className="flex items-center gap-4">
            <span className="text-2xl">✓</span>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">No, just sealcoating</h3>
              <p className="text-gray-400 text-sm">Continue with sealcoating only</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  )

  // Striping spaces step
  const renderSpacesStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Parking Spaces</h2>
        <p className="text-gray-400">How many spaces need striping?</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Regular Spaces</label>
          <input
            type="number"
            value={regularSpaces}
            onChange={e => setRegularSpaces(e.target.value)}
            placeholder="0"
            min="0"
            className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
          />
          <p className="text-gray-500 text-sm mt-1">$4 per space</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Handicap Spaces</label>
          <input
            type="number"
            value={handicapSpaces}
            onChange={e => setHandicapSpaces(e.target.value)}
            placeholder="0"
            min="0"
            className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
          />
          <p className="text-gray-500 text-sm mt-1">$43 per space (includes symbol)</p>
        </div>

        {(parseInt(regularSpaces) > 0 || parseInt(handicapSpaces) > 0) && (
          <div className="p-4 rounded-xl" style={{ backgroundColor: COLORS.card }}>
            <p className="text-gray-400 text-sm">Striping Estimate</p>
            <p className="text-2xl font-bold text-white">
              ${calculateStripingPrice(parseInt(regularSpaces) || 0, parseInt(handicapSpaces) || 0).toLocaleString()}
            </p>
            {addStriping && <p className="text-green-400 text-sm">10% bundle discount will apply</p>}
          </div>
        )}
      </div>

      <button
        onClick={() => {
          const price = calculateStripingPrice(parseInt(regularSpaces) || 0, parseInt(handicapSpaces) || 0)
          setStripingPrice(price)
          if (selectedService === 'sealcoating') {
            setCurrentStep(SEALCOAT_STEPS.CONTACT)
          } else {
            setCurrentStep(STRIPING_STEPS.CONTACT)
          }
        }}
        disabled={!regularSpaces && !handicapSpaces}
        className="w-full py-4 rounded-xl font-semibold text-lg disabled:opacity-50"
        style={{ backgroundColor: COLORS.yellow, color: COLORS.bg }}
      >
        Continue
      </button>
    </div>
  )

  // Line striping address step
  const renderStripingAddressStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Property Address</h2>
        <p className="text-gray-400">Where do you need line striping?</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Address *</label>
        <input
          type="text"
          value={address}
          onChange={e => setAddress(e.target.value)}
          placeholder="123 Main St, Mount Vernon, IL"
          className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
        />
      </div>

      <button
        onClick={() => {
          if (!address) return
          setCurrentStep(STRIPING_STEPS.SPACES)
        }}
        disabled={!address}
        className="w-full py-4 rounded-xl font-semibold text-lg disabled:opacity-50"
        style={{ backgroundColor: COLORS.yellow, color: COLORS.bg }}
      >
        Continue
      </button>
    </div>
  )

  // Schedule step
  const renderScheduleStep = () => {
    const dates = getAvailableDates()

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Preferred Date</h2>
          <p className="text-gray-400">When would you like us to come?</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Select Date *</label>
          <select
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:border-yellow-500"
          >
            <option value="">Choose a date...</option>
            {dates.slice(0, 30).map(date => (
              <option key={date} value={date}>
                {new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Gate codes, special instructions, etc."
            rows={3}
            className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 resize-none"
          />
        </div>

        <button
          onClick={() => {
            if (!selectedDate) return
            if (selectedService === 'paving') {
              setCurrentStep(STEPS.CONFIRM)
            } else if (selectedService === 'sealcoating') {
              setCurrentStep(SEALCOAT_STEPS.CONFIRM)
            } else {
              setCurrentStep(STRIPING_STEPS.CONFIRM)
            }
          }}
          disabled={!selectedDate}
          className="w-full py-4 rounded-xl font-semibold text-lg disabled:opacity-50"
          style={{ backgroundColor: COLORS.yellow, color: COLORS.bg }}
        >
          Review Quote
        </button>
      </div>
    )
  }

  // Confirmation step
  const renderConfirmStep = () => {
    const totalPrice = getTotalPrice()
    const deposit = totalPrice ? Math.round(totalPrice * 0.5) : 0

    return (
      <div className="space-y-6">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-white mb-2">Review Your Quote</h2>
        </div>

        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: COLORS.card }}>
          {/* Service */}
          <div className="p-4 border-b" style={{ borderColor: COLORS.border }}>
            <p className="text-gray-400 text-sm">Service</p>
            <p className="text-white font-semibold">
              {config.services.find(s => s.id === selectedService)?.name}
              {addStriping && ' + Line Striping'}
            </p>
          </div>

          {/* Contact */}
          <div className="p-4 border-b" style={{ borderColor: COLORS.border }}>
            <p className="text-gray-400 text-sm">Contact</p>
            <p className="text-white">{name}</p>
            <p className="text-gray-400 text-sm">{phone}</p>
            {email && <p className="text-gray-400 text-sm">{email}</p>}
          </div>

          {/* Address */}
          <div className="p-4 border-b" style={{ borderColor: COLORS.border }}>
            <p className="text-gray-400 text-sm">Address</p>
            <p className="text-white">{address}</p>
            {isChurch && <span className="text-yellow-400 text-sm">House of Worship (10% off)</span>}
          </div>

          {/* Date */}
          <div className="p-4 border-b" style={{ borderColor: COLORS.border }}>
            <p className="text-gray-400 text-sm">Preferred Date</p>
            <p className="text-white">
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Pricing */}
          <div className="p-4">
            {selectedService === 'paving' ? (
              <>
                <p className="text-gray-400 text-sm">Estimated Price</p>
                <p className="text-3xl font-bold text-white">${estimate?.toLocaleString()}</p>
                <p className="text-gray-500 text-sm">{squareFootage?.toLocaleString()} sq ft</p>
              </>
            ) : (
              <>
                {sealcoatingPrice && (
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Sealcoating</span>
                    <span className="text-white">${sealcoatingPrice.toLocaleString()}</span>
                  </div>
                )}
                {stripingPrice && addStriping && (
                  <>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Line Striping</span>
                      <span className="text-white">${stripingPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between mb-2 text-green-400">
                      <span>Bundle Discount (10%)</span>
                      <span>-${Math.round((sealcoatingPrice! + stripingPrice) * 0.1).toLocaleString()}</span>
                    </div>
                  </>
                )}
                {stripingPrice && !sealcoatingPrice && (
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Line Striping</span>
                    <span className="text-white">${stripingPrice.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t pt-2 mt-2" style={{ borderColor: COLORS.border }}>
                  <div className="flex justify-between">
                    <span className="text-white font-semibold">Total</span>
                    <span className="text-2xl font-bold text-white">${totalPrice?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-400">Deposit (50%)</span>
                    <span className="text-yellow-400">${deposit.toLocaleString()}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {submitError && (
          <div className="p-4 rounded-xl bg-red-900/30 border border-red-500">
            <p className="text-red-400 text-center">{submitError}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-4 rounded-xl font-semibold text-lg disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ backgroundColor: COLORS.yellow, color: COLORS.bg }}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-800 border-t-transparent"></div>
              Submitting...
            </>
          ) : (
            'Submit Quote Request'
          )}
        </button>

        <p className="text-center text-gray-500 text-sm">
          By submitting, you agree to be contacted about your quote
        </p>
      </div>
    )
  }

  // Success screen
  const renderSuccess = () => (
    <div className="text-center py-12">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-900/30 flex items-center justify-center">
        <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-white mb-4">Quote Request Sent!</h2>
      <p className="text-gray-400 mb-8">
        We&apos;ll review your request and get back to you within 24 hours.
      </p>
      <div className="space-y-4">
        <Link
          href="/"
          className="block w-full py-4 rounded-xl font-semibold text-lg"
          style={{ backgroundColor: COLORS.yellow, color: COLORS.bg }}
        >
          Back to Home
        </Link>
        <a
          href={`tel:${config.phoneRaw}`}
          className="block w-full py-4 rounded-xl font-semibold text-lg"
          style={{ backgroundColor: COLORS.card, color: COLORS.white, border: `1px solid ${COLORS.border}` }}
        >
          Call {config.phone}
        </a>
      </div>
    </div>
  )

  // Render current step based on service
  const renderCurrentStep = () => {
    if (submitSuccess) return renderSuccess()

    // If no service selected, show service selection
    if (!selectedService) return renderServiceStep()

    // Paving flow
    if (selectedService === 'paving') {
      switch (currentStep) {
        case STEPS.PROJECT_TYPE: return renderProjectTypeStep()
        case STEPS.CONTACT: return renderContactStep()
        case STEPS.MAP: return renderMapStep()
        case STEPS.SCHEDULE: return renderScheduleStep()
        case STEPS.CONFIRM: return renderConfirmStep()
        default: return renderServiceStep()
      }
    }

    // Sealcoating flow
    if (selectedService === 'sealcoating') {
      switch (currentStep) {
        case SEALCOAT_STEPS.ADDRESS: return renderSealcoatAddressStep()
        case SEALCOAT_STEPS.MAP: return renderMapStep()
        case SEALCOAT_STEPS.STRIPING: return renderStripingAddOnStep()
        case SEALCOAT_STEPS.STRIPING_SPACES: return renderSpacesStep()
        case SEALCOAT_STEPS.CONTACT: return renderContactStep()
        case SEALCOAT_STEPS.SCHEDULE: return renderScheduleStep()
        case SEALCOAT_STEPS.CONFIRM: return renderConfirmStep()
        default: return renderSealcoatAddressStep()
      }
    }

    // Line striping flow
    if (selectedService === 'linestriping') {
      switch (currentStep) {
        case STRIPING_STEPS.ADDRESS: return renderStripingAddressStep()
        case STRIPING_STEPS.SPACES: return renderSpacesStep()
        case STRIPING_STEPS.CONTACT: return renderContactStep()
        case STRIPING_STEPS.SCHEDULE: return renderScheduleStep()
        case STRIPING_STEPS.CONFIRM: return renderConfirmStep()
        default: return renderStripingAddressStep()
      }
    }

    return renderServiceStep()
  }

  // Get step count for progress bar
  const getStepInfo = () => {
    if (!selectedService) return { current: 1, total: 1 }
    if (selectedService === 'paving') return { current: currentStep, total: 6 }
    if (selectedService === 'sealcoating') return { current: currentStep, total: 7 }
    if (selectedService === 'linestriping') return { current: currentStep, total: 5 }
    return { current: 1, total: 1 }
  }

  const stepInfo = getStepInfo()

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.bg }}>
      {/* Header */}
      <header className="sticky top-0 z-50" style={{ backgroundColor: COLORS.card, borderBottom: `1px solid ${COLORS.border}` }}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-yellow-400 font-bold text-xl">
            {config.businessName}
          </Link>
          <a href={`tel:${config.phoneRaw}`} className="text-gray-400 hover:text-white transition-colors">
            {config.phone}
          </a>
        </div>

        {/* Progress bar */}
        {selectedService && !submitSuccess && (
          <div className="max-w-2xl mx-auto px-4 pb-4">
            <div className="h-1 rounded-full bg-gray-700 overflow-hidden">
              <div
                className="h-full transition-all duration-500 ease-out rounded-full"
                style={{
                  width: `${(stepInfo.current / stepInfo.total) * 100}%`,
                  backgroundColor: COLORS.yellow
                }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Step {stepInfo.current} of {stepInfo.total}</span>
              <span>{config.services.find(s => s.id === selectedService)?.name}</span>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Back button */}
        {selectedService && currentStep > 1 && !submitSuccess && (
          <button
            onClick={() => {
              if (selectedService === 'paving') {
                if (currentStep === STEPS.PROJECT_TYPE) {
                  setSelectedService(null)
                } else {
                  setCurrentStep(currentStep - 1)
                }
              } else if (selectedService === 'sealcoating') {
                if (currentStep === SEALCOAT_STEPS.ADDRESS) {
                  setSelectedService(null)
                } else if (currentStep === SEALCOAT_STEPS.STRIPING_SPACES) {
                  setCurrentStep(SEALCOAT_STEPS.STRIPING)
                } else {
                  setCurrentStep(currentStep - 1)
                }
              } else if (selectedService === 'linestriping') {
                if (currentStep === STRIPING_STEPS.ADDRESS) {
                  setSelectedService(null)
                } else {
                  setCurrentStep(currentStep - 1)
                }
              }
            }}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        )}

        {renderCurrentStep()}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} {config.businessName}. All rights reserved.</p>
      </footer>
    </div>
  )
}
