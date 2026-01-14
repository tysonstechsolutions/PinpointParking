'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { config } from '@/config/config'

// Google Maps type declarations
declare global {
  interface Window {
    google: typeof google
  }
}

// Type definitions for Google Maps objects used in this component
interface GoogleMapInstance {
  setCenter: (center: google.maps.LatLngLiteral) => void
  fitBounds: (bounds: google.maps.LatLngBounds, padding?: number) => void
}

interface GooglePolygonInstance {
  setMap: (map: GoogleMapInstance | null) => void
  getPath: () => google.maps.MVCArray<google.maps.LatLng>
}

interface GoogleDrawingManager {
  setMap: (map: GoogleMapInstance | null) => void
  setDrawingMode: (mode: google.maps.drawing.OverlayType | null) => void
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
  SEALCOAT_ADDRESS: 'sealcoat_address',
  ADDRESS: 'address',
  MAP_MEASURING: 'map_measuring',
  CONDITION: 'condition',
  STRIPING_TYPE: 'striping_type',
  STRIPING_SIZE: 'striping_size',
  ADD_STRIPING: 'add_striping',
  BUNDLE_STRIPING_SIZE: 'bundle_striping_size',
  SEALCOAT_CONTACT: 'sealcoat_contact',
  DATE: 'date',
  CONTACT: 'contact',
  SUMMARY: 'summary',
  PAYMENT: 'payment',
  COMPLETE: 'complete'
}

const STRIPING_OPTIONS = [
  { id: 'restripe', label: 'Yes, lines are visible', description: 'Re-stripe existing lines', multiplier: 1 },
  { id: 'new_layout', label: 'No, need new layout', description: 'New layout (+50%)', multiplier: 1.5 },
]

// Line striping per-unit pricing
const STRIPING_PRICING = {
  regularSpace: 15,    // $15 per regular space
  handicapSpace: 35,   // $35 per handicap space (includes logo + loading zone)
  arrow: 20,           // $20 per arrow
  minimum: 500,        // $500 minimum job
}

// Predefined lot sizes for line striping with flat pricing
const STRIPING_LOT_SIZES = [
  { id: 'small', label: 'Small Lot', description: 'Less than 20 spaces', price: 500 },
  { id: 'medium', label: 'Medium Lot', description: '20-100 spaces', price: 1000 },
  { id: 'large', label: 'Large Lot', description: '100-200 spaces', price: 2000 },
  { id: 'xlarge', label: 'Extra Large', description: '200+ spaces', price: 0 },
  { id: 'custom', label: 'Custom Quote', description: 'Complex or unique needs', price: 0 },
]

// Bundle discount when adding striping to sealcoating
const BUNDLE_DISCOUNT = 0.10 // 10% off striping when bundled

interface PavingChatbotProps {
  onClose?: () => void
  embedded?: boolean
}

export default function PavingChatbot({ onClose, embedded = false }: PavingChatbotProps) {
  const [isOpen, setIsOpen] = useState(embedded)
  const [step, setStep] = useState(STEPS.SERVICE)
  const [messages, setMessages] = useState<{type: string, text: string}[]>([])
  const [inputValue, setInputValue] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [isChurch, setIsChurch] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const [mapLoaded, setMapLoaded] = useState(false)
  const [drawnArea, setDrawnArea] = useState<number | null>(null)
  const [aiPolygonPoints, setAiPolygonPoints] = useState<Array<{lat: number, lng: number}>>([])
  const [mapCoordinates, setMapCoordinates] = useState<{lat: number, lng: number} | null>(null)
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const [showManualInput, setShowManualInput] = useState(false)
  const [manualSqFt, setManualSqFt] = useState('')

  // Line striping specific state
  const [stripingRegularSpaces, setStripingRegularSpaces] = useState(0)
  const [stripingHandicapSpaces, setStripingHandicapSpaces] = useState(0)
  const [stripingArrows, setStripingArrows] = useState(0)
  const [stripingMultiplier, setStripingMultiplier] = useState(1)

  // Sealcoating + bundle state
  const [sealcoatingPrice, setSealcoatingPrice] = useState(0)
  const [bundleStripingPrice, setBundleStripingPrice] = useState(0)
  const [includeStriping, setIncludeStriping] = useState(false)

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
    email: '',
    phone: '',
    jobId: 0,
    invoiceId: 0,
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<google.maps.Map | null>(null)
  const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(null)
  const polygonRef = useRef<google.maps.Polygon | null>(null)
  const hasInitialized = useRef(false)
  const mapLoadCheckIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const mapEventListenersRef = useRef<google.maps.MapsEventListener[]>([])

  const scrollToBottom = () => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  // Force scroll to bottom when entering map step or when map loads
  useEffect(() => {
    if (step === STEPS.MAP_MEASURING && messagesContainerRef.current) {
      // Scroll container to the very bottom to show buttons
      const scrollToEnd = () => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
        }
      }
      // Scroll immediately and after a delay (for map render)
      scrollToEnd()
      setTimeout(scrollToEnd, 150)
      setTimeout(scrollToEnd, 500)
    }
  }, [step, mapLoaded])

  useEffect(() => { scrollToBottom() }, [messages])

  // Cleanup effect for Google Maps resources
  useEffect(() => {
    return () => {
      // Clear any pending intervals
      if (mapLoadCheckIntervalRef.current) {
        clearInterval(mapLoadCheckIntervalRef.current)
        mapLoadCheckIntervalRef.current = null
      }

      // Remove all event listeners
      mapEventListenersRef.current.forEach(listener => {
        if (listener) {
          google.maps.event.removeListener(listener)
        }
      })
      mapEventListenersRef.current = []

      // Clean up polygon
      if (polygonRef.current) {
        polygonRef.current.setMap(null)
        polygonRef.current = null
      }

      // Clean up drawing manager
      if (drawingManagerRef.current) {
        drawingManagerRef.current.setMap(null)
        drawingManagerRef.current = null
      }

      // Clean up map
      mapRef.current = null
    }
  }, [])

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
    if (isOpen && messages.length === 0 && !hasInitialized.current) {
      hasInitialized.current = true
      addBotMessage("Hey! I can give you an instant quote. What service do you need?", 300)
    }
  }, [isOpen, messages.length])

  const MINIMUM_JOB_COST = 500 // $500 minimum for all jobs

  const calculateEstimate = (sqft: number, serviceId: string, discount = 0) => {
    const service = config.services.find(s => s.id === serviceId)
    if (!service) return { low: MINIMUM_JOB_COST, high: MINIMUM_JOB_COST }
    let base = sqft * service.pricePerSqFt
    base = Math.max(base, service.minPrice)
    if (discount > 0) base = base * (1 - discount)
    const buffer = service.estimateBuffer || 0.20
    let low = Math.round(base * (1 - buffer))
    let high = Math.round(base * (1 + buffer))
    // Enforce $500 minimum
    low = Math.max(low, MINIMUM_JOB_COST)
    high = Math.max(high, MINIMUM_JOB_COST)
    return { low, high }
  }

  // Google Maps
  const loadMap = async (polygonPoints?: Array<{lat: number, lng: number}>, addressOverride?: string, coordsOverride?: {lat: number, lng: number}) => {
    // Debug: Log API key status
    console.log('Loading map, API key present:', !!config.googleMaps.apiKey, 'Key starts with:', config.googleMaps.apiKey?.substring(0, 10))

    // Check if API key is configured
    if (!config.googleMaps.apiKey) {
      console.error('Google Maps API key not configured - config.googleMaps.apiKey is empty')
      setShowManualInput(true)
      addBotMessage('Map loading failed (no API key). Please enter your area size manually below.')
      return
    }

    if (!window.google?.maps) {
      console.log('Google Maps not loaded yet, loading script...')
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
      if (!existingScript) {
        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${config.googleMaps.apiKey}&libraries=geometry,drawing`
        script.async = true
        script.onerror = (e) => {
          console.error('Failed to load Google Maps script:', e)
          setShowManualInput(true)
          addBotMessage('Map loading failed (script error). Please enter your area size manually below.')
        }
        document.head.appendChild(script)
        console.log('Google Maps script added to page')
      } else {
        console.log('Google Maps script already exists on page')
      }
      await new Promise<void>(resolve => {
        const check = setInterval(() => {
          if (window.google?.maps?.drawing) {
            console.log('Google Maps loaded successfully')
            clearInterval(check)
            mapLoadCheckIntervalRef.current = null
            resolve()
          }
        }, 100)
        mapLoadCheckIntervalRef.current = check
        setTimeout(() => {
          console.log('Google Maps load timeout reached, google.maps exists:', !!window.google?.maps, 'drawing:', !!window.google?.maps?.drawing)
          clearInterval(check)
          mapLoadCheckIntervalRef.current = null
          resolve()
        }, 10000)
      })
    }

    if (!window.google?.maps || !mapContainerRef.current) {
      console.error('Google Maps check failed - maps:', !!window.google?.maps, 'container:', !!mapContainerRef.current)
      setShowManualInput(true)
      addBotMessage('Map loading failed (timeout). Please enter your area size manually below.')
      return
    }

    console.log('Map initialization starting...')

    // Use passed coordinates first, then state, then default
    let center = coordsOverride || mapCoordinates || config.googleMaps.defaultCenter
    const addressToGeocode = addressOverride || bookingData.address

    // Only geocode if we don't have coordinates from any source
    if (!coordsOverride && !mapCoordinates && addressToGeocode) {
      const geocoder = new window.google.maps.Geocoder()
      try {
        const result: any = await new Promise((resolve, reject) => {
          geocoder.geocode({ address: addressToGeocode }, (results: any, status: string) => {
            console.log('Geocode status:', status, 'Address:', addressToGeocode)
            if (status === 'OK' && results[0]) {
              console.log('Geocode results:', results[0])
              resolve(results[0].geometry.location)
            } else {
              reject(status)
            }
          })
        })
        center = { lat: result.lat(), lng: result.lng() }
        setMapCoordinates(center)
      } catch (err) {
        console.error('Geocoding failed:', err, 'for address:', addressToGeocode)
      }
    }

    const map = new window.google.maps.Map(mapContainerRef.current, {
      center, zoom: 20, mapTypeId: 'hybrid',
      disableDefaultUI: true, zoomControl: true,
      gestureHandling: 'greedy',
      scrollwheel: true,
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
      // Track event listeners for cleanup
      mapEventListenersRef.current.push(
        window.google.maps.event.addListener(polygon.getPath(), 'set_at', updateArea),
        window.google.maps.event.addListener(polygon.getPath(), 'insert_at', updateArea),
        window.google.maps.event.addListener(polygon.getPath(), 'remove_at', updateArea)
      )

      const bounds = new window.google.maps.LatLngBounds()
      polygon.getPath().forEach((latLng: google.maps.LatLng) => bounds.extend(latLng))
      map.fitBounds(bounds, 50)
    } else {
      drawingManager.setDrawingMode(window.google.maps.drawing.OverlayType.POLYGON)
    }

    // Track polygoncomplete listener for cleanup
    mapEventListenersRef.current.push(
      window.google.maps.event.addListener(drawingManager, 'polygoncomplete', (polygon: google.maps.Polygon) => {
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
        // Track these listeners too
        mapEventListenersRef.current.push(
          window.google.maps.event.addListener(polygon.getPath(), 'set_at', updateArea),
          window.google.maps.event.addListener(polygon.getPath(), 'insert_at', updateArea),
          window.google.maps.event.addListener(polygon.getPath(), 'remove_at', updateArea)
        )
        drawingManager.setDrawingMode(null)
      })
    )

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
    const maxDate = new Date(today); maxDate.setDate(today.getDate() + config.booking.maxDaysOut)
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d)
      const isPast = date < minDate
      const isTooFar = date > maxDate
      const isSunday = date.getDay() === 0
      const shouldSkipSunday = config.booking.skipSundays && isSunday

      // Check if date should be unavailable
      if (isPast || isTooFar) {
        days.push({ date: null, isAvailable: false })
      } else if (shouldSkipSunday) {
        // Show Sunday but mark as unavailable
        days.push({ date, isAvailable: false })
      } else {
        days.push({ date, isAvailable: true })
      }
    }
    return days
  }

  // Handlers
  const handleServiceSelect = async (serviceId: string) => {
    const service = config.services.find(s => s.id === serviceId)!
    setBookingData(prev => ({ ...prev, service: serviceId, serviceName: service.name }))
    addUserMessage(service.name)

    // Line striping skips project type - go straight to layout question
    if (serviceId === 'linestriping') {
      await addBotMessage("Are the existing lines clearly visible?")
      setStep(STEPS.STRIPING_TYPE)
    } else if (serviceId === 'sealcoating') {
      // Sealcoating - go to address input for map, then ask about striping
      await addBotMessage("What's the property address? We'll measure the area on the map.")
      setStep(STEPS.SEALCOAT_ADDRESS)
    } else {
      await addBotMessage("What type of property is this?")
      setStep(STEPS.PROJECT_TYPE)
    }
  }

  const handleProjectSelect = async (projectId: string) => {
    const project = config.projectTypes.find(p => p.id === projectId)!
    setBookingData(prev => ({ ...prev, projectType: projectId, projectTypeName: project.label, discount: project.discount || 0 }))
    addUserMessage(project.label)
    await addBotMessage("Great! Enter your contact info and address below:")
    setStep(STEPS.ADDRESS)
  }

  // Sealcoat address - just address, goes to map first
  const handleSealcoatAddressSubmit = async () => {
    const address = inputValue.trim()
    if (!address) {
      await addBotMessage("Please enter the property address.")
      return
    }

    // Set default project type for sealcoating (will be updated if church is checked later)
    setBookingData(prev => ({ ...prev, address, projectType: 'commercial', projectTypeName: 'Commercial' }))
    addUserMessage(address)
    setInputValue('')

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/estimate-area', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, projectType: 'commercial' })
      })
      const result = await response.json()
      setIsAnalyzing(false)
      if (result.coordinates) setMapCoordinates(result.coordinates)

      if (result.success && result.polygonPoints?.length >= 3) {
        setAiPolygonPoints(result.polygonPoints)
        const sqft = result.squareFootage
        setBookingData(prev => ({ ...prev, squareFootage: sqft, address: result.formattedAddress || address }))
        await addBotMessage(`Found it! Draw or adjust the area to be sealed.`)
        setStep(STEPS.MAP_MEASURING)
        setTimeout(() => { loadMap(result.polygonPoints, address, result.coordinates); scrollToBottom() }, 100)
      } else if (result.coordinates) {
        await addBotMessage("Found the location! Draw the area to be sealed.")
        setStep(STEPS.MAP_MEASURING)
        setTimeout(() => { loadMap(undefined, address, result.coordinates); scrollToBottom() }, 100)
      } else {
        await addBotMessage("Draw the area to be sealed on the map.")
        setStep(STEPS.MAP_MEASURING)
        setTimeout(() => { loadMap(undefined, address, undefined); scrollToBottom() }, 100)
      }
    } catch {
      setIsAnalyzing(false)
      await addBotMessage("Let's find that location...")
      setStep(STEPS.MAP_MEASURING)
      setTimeout(() => { loadMap(undefined, address, undefined); scrollToBottom() }, 100)
    }
  }

  const handleAddressSubmit = async () => {
    const name = contactName.trim()
    const email = contactEmail.trim().toLowerCase()
    const phone = contactPhone.trim().replace(/\D/g, '')
    const address = inputValue.trim()

    // Basic validation - email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!name || phone.length < 10 || !address) {
      await addBotMessage("Please fill in your name, phone number, and address.")
      return
    }
    // If email is provided, validate it
    if (email && !emailRegex.test(email)) {
      await addBotMessage("Please enter a valid email address or leave it blank.")
      return
    }

    setBookingData(prev => ({ ...prev, address, name, email, phone }))
    addUserMessage(`${name}${email ? '\n' + email : ''}\n${phone}\n${address}${isChurch ? '\n⛪ House of Worship' : ''}`)
    setInputValue('')
    setContactName('')
    setContactEmail('')
    setContactPhone('')

    // For line striping only, skip map measuring - we already have the estimate from space counts
    if (bookingData.service === 'linestriping') {
      const estimate = bookingData.estimateLow
      const deposit = Math.round(estimate * 0.5)

      await addBotMessage(`Thanks ${name}!\n\nLine Striping: $${estimate.toLocaleString()}\nDeposit: $${deposit.toLocaleString()}\n\nWhen would you like us to come out?`)
      setStep(STEPS.DATE)
      return
    }

    // Regular paving flow - just geocode address and let user draw manually (no auto-polygon)
    setIsAnalyzing(true)

    try {
      // Use Google Geocoding to get coordinates without auto-polygon
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      const response = await fetch(geocodeUrl)
      const result = await response.json()
      setIsAnalyzing(false)

      if (result.results?.[0]?.geometry?.location) {
        const coords = result.results[0].geometry.location
        setMapCoordinates(coords)
        await addBotMessage("Found it! Draw the area you'd like paved.")
        setStep(STEPS.MAP_MEASURING)
        setTimeout(() => { loadMap(undefined, address, coords); scrollToBottom() }, 100)
      } else {
        await addBotMessage("Found it! Draw the area you'd like paved.")
        setStep(STEPS.MAP_MEASURING)
        setTimeout(() => { loadMap(undefined, address, undefined); scrollToBottom() }, 100)
      }
    } catch {
      setIsAnalyzing(false)
      await addBotMessage("Let me find that location...")
      setStep(STEPS.MAP_MEASURING)
      setTimeout(() => { loadMap(undefined, address, undefined); scrollToBottom() }, 100)
    }
  }

  const handleMapConfirm = async () => {
    if (!drawnArea) return

    // For sealcoating, calculate price and ask about adding striping
    if (bookingData.service === 'sealcoating') {
      const sealPrice = calculateSealcoatingPrice(drawnArea)
      setSealcoatingPrice(sealPrice)

      setBookingData(prev => ({ ...prev, squareFootage: drawnArea, estimateLow: sealPrice, estimateHigh: sealPrice }))
      addUserMessage(`Area confirmed: ${drawnArea.toLocaleString()} sq ft`)

      const deposit = Math.round(sealPrice * 0.5)
      await addBotMessage(`Area: ${drawnArea.toLocaleString()} sq ft\nSealcoating: $${sealPrice.toLocaleString()} (Deposit: $${deposit.toLocaleString()})\n\nWould you like to add line striping? (10% bundle discount)`)
      setStep(STEPS.ADD_STRIPING)
      return
    }

    // For paving, use the original estimate calculation
    const estimate = calculateEstimate(drawnArea, bookingData.service, bookingData.discount)

    // Apply condition adjustment
    const condition = config.conditions.find(c => c.id === bookingData.condition)
    if (condition && condition.adjustment > 0) {
      estimate.high = Math.round(estimate.high * (1 + condition.adjustment))
    }

    setBookingData(prev => ({ ...prev, squareFootage: drawnArea, estimateLow: estimate.low, estimateHigh: estimate.high }))
    addUserMessage(`Area confirmed: ${drawnArea.toLocaleString()} sq ft`)
    await addBotMessage(`Thanks ${bookingData.name}! Your estimated price is:\n\n$${estimate.low.toLocaleString()} - $${estimate.high.toLocaleString()}\n\nWhen would you like us to come out?`)
    setStep(STEPS.DATE)
  }

  const INSPECTION_FEE = 50 // $50 for in-person inspection

  const handleRequestInspection = async () => {
    addUserMessage("Request In-Person Inspection ($50)")
    setBookingData(prev => ({ ...prev, squareFootage: 0, estimateLow: INSPECTION_FEE, estimateHigh: INSPECTION_FEE }))
    await addBotMessage(`Got it! We'll send someone out to measure and provide an exact quote.\n\nThe inspection fee is $50, which will be credited toward your project if you decide to proceed.\n\nWhen would you like us to come out?`)
    setStep(STEPS.DATE)
  }

  const handleStripingTypeSelect = async (typeId: string) => {
    const stripingType = STRIPING_OPTIONS.find(s => s.id === typeId)!
    setBookingData(prev => ({ ...prev, condition: typeId }))
    setStripingMultiplier(stripingType.multiplier)
    addUserMessage(stripingType.label)
    await addBotMessage("What size is the parking lot?")
    setStep(STEPS.STRIPING_SIZE)
  }

  // Calculate estimate for a given lot size
  const calculateStripingEstimateForLot = (spaces: number, handicap: number, arrows: number, multiplier: number) => {
    // Calculate base cost for regular spaces (subject to minimum)
    let regularSpacesCost = spaces * STRIPING_PRICING.regularSpace
    regularSpacesCost = Math.max(regularSpacesCost, STRIPING_PRICING.minimum)

    // Add handicap spaces and arrows on top
    const handicapCost = handicap * STRIPING_PRICING.handicapSpace
    const arrowsCost = arrows * STRIPING_PRICING.arrow

    let total = regularSpacesCost + handicapCost + arrowsCost

    // Apply new layout multiplier if applicable (+50%)
    if (multiplier > 1) {
      total = Math.round(total * multiplier)
    }

    return total
  }

  const handleStripingSizeSelect = async (sizeId: string) => {
    const lotSize = STRIPING_LOT_SIZES.find(s => s.id === sizeId)!
    addUserMessage(lotSize.label)

    // Custom quote or extra large - redirect to call
    if (sizeId === 'custom' || sizeId === 'xlarge') {
      await addBotMessage(`For ${sizeId === 'xlarge' ? 'lots with 200+ spaces' : 'custom or complex jobs'}, please call us at ${config.phone} for a personalized quote.`)
      setStep(STEPS.COMPLETE)
      return
    }

    // Apply multiplier for new layout (+50%)
    const basePrice = lotSize.price
    const estimate = stripingMultiplier > 1 ? Math.round(basePrice * stripingMultiplier) : basePrice
    const deposit = Math.round(estimate * 0.5)

    setBookingData(prev => ({
      ...prev,
      squareFootage: 0,
      estimateLow: estimate,
      estimateHigh: estimate,
    }))

    await addBotMessage(`${lotSize.description}\nTotal: $${estimate.toLocaleString()} (Deposit: $${deposit.toLocaleString()})${stripingMultiplier > 1 ? '\nIncludes +50% for new layout' : ''}\n\nEnter your contact info and address below:`)
    setStep(STEPS.ADDRESS)
  }

  const handleAddStripingChoice = async (addStriping: boolean) => {
    if (addStriping) {
      addUserMessage("Yes, add striping")
      setIncludeStriping(true)
      await addBotMessage("What size lot for striping?")
      setStep(STEPS.BUNDLE_STRIPING_SIZE)
    } else {
      addUserMessage("No, just sealcoating")
      setIncludeStriping(false)
      const deposit = Math.round(sealcoatingPrice * 0.5)
      await addBotMessage(`Sealcoating Total: $${sealcoatingPrice.toLocaleString()}\nDeposit: $${deposit.toLocaleString()}\n\nEnter your contact info below:`)
      setStep(STEPS.SEALCOAT_CONTACT)
    }
  }

  // Calculate sealcoating price based on square footage - guarantees 40% profit margin
  const calculateSealcoatingPrice = (sqft: number): number => {
    // Cost calculation:
    // - Materials: $0.12/sqft (sealcoat + crack filler + sand)
    // - Labor: Base 2 hrs + 1 hr per 5,000 sqft, × 3 workers × $22/hr
    // - Overhead: $150 base + $50 per 10,000 sqft

    const materialCost = sqft * 0.12
    const laborHours = 2 + (sqft / 5000)
    const laborCost = laborHours * 3 * 22 // 3 workers at $22/hr
    const overheadCost = 150 + (sqft / 10000) * 50

    const totalCost = materialCost + laborCost + overheadCost

    // Price for 40% margin: cost / (1 - 0.40) = cost / 0.60
    const price = totalCost / 0.60

    // Minimum $750
    return Math.max(750, Math.round(price / 50) * 50) // Round to nearest $50
  }

  const handleBundleStripingSizeSelect = async (sizeId: string) => {
    const lotSize = STRIPING_LOT_SIZES.find(s => s.id === sizeId)!
    addUserMessage(lotSize.label)

    // Custom quote or extra large - redirect to call
    if (sizeId === 'custom' || sizeId === 'xlarge') {
      await addBotMessage(`For ${sizeId === 'xlarge' ? 'lots with 200+ spaces' : 'custom striping needs'}, please call us at ${config.phone} for a personalized quote.`)
      setStep(STEPS.COMPLETE)
      return
    }

    // Calculate bundle total
    const stripingBase = lotSize.price
    const stripingDiscounted = Math.round(stripingBase * (1 - BUNDLE_DISCOUNT))
    setBundleStripingPrice(stripingDiscounted)

    const totalPrice = sealcoatingPrice + stripingDiscounted
    const savings = stripingBase - stripingDiscounted
    const deposit = Math.round(totalPrice * 0.5)

    setBookingData(prev => ({ ...prev, estimateLow: totalPrice, estimateHigh: totalPrice }))

    await addBotMessage(`Bundle Summary:\n• Sealcoating: $${sealcoatingPrice.toLocaleString()}\n• Striping: $${stripingDiscounted.toLocaleString()} (was $${stripingBase.toLocaleString()})\n• You save: $${savings.toLocaleString()}\n\nTotal: $${totalPrice.toLocaleString()} (Deposit: $${deposit.toLocaleString()})\n\nEnter your contact info below:`)
    setStep(STEPS.SEALCOAT_CONTACT)
  }

  // Sealcoat contact submission - just name/phone/email, address already collected
  const handleSealcoatContactSubmit = async () => {
    const name = contactName.trim()
    const email = contactEmail.trim().toLowerCase()
    const phone = contactPhone.trim().replace(/\D/g, '')

    // Basic validation - email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!name || phone.length < 10) {
      await addBotMessage("Please fill in your name and phone number.")
      return
    }
    if (email && !emailRegex.test(email)) {
      await addBotMessage("Please enter a valid email address or leave it blank.")
      return
    }

    // Update project type if church is checked
    const projectTypeName = isChurch ? 'House of Worship' : 'Commercial'
    setBookingData(prev => ({
      ...prev,
      name,
      email,
      phone,
      projectType: isChurch ? 'house-of-worship' : 'commercial',
      projectTypeName
    }))
    addUserMessage(`${name}${email ? '\n' + email : ''}\n${phone}${isChurch ? '\n⛪ House of Worship' : ''}`)
    setContactName('')
    setContactEmail('')
    setContactPhone('')

    await addBotMessage(`Thanks ${name}! When would you like us to come out?`)
    setStep(STEPS.DATE)
  }

  const handleDateSelect = async (date: Date) => {
    const label = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    setBookingData(prev => ({ ...prev, deliveryDate: date.toISOString().split('T')[0], deliveryDateLabel: label }))
    addUserMessage(label)
    await addBotMessage("Here's your quote summary:")
    setStep(STEPS.SUMMARY)
  }

  const handleContactSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const name = contactName.trim()
    const phone = contactPhone.trim().replace(/\D/g, '')

    if (!name || phone.length < 10) {
      await addBotMessage("Please enter your full name and a valid phone number.")
      return
    }

    // Calculate estimate now with condition adjustment
    const condition = config.conditions.find(c => c.id === bookingData.condition)
    const estimate = calculateEstimate(bookingData.squareFootage, bookingData.service, bookingData.discount)
    if (condition && condition.adjustment > 0) {
      estimate.high = Math.round(estimate.high * (1 + condition.adjustment))
    }

    setBookingData(prev => ({ ...prev, name, phone, estimateLow: estimate.low, estimateHigh: estimate.high }))
    addUserMessage(`${name}, ${phone}`)
    setContactName('')
    setContactPhone('')
    await addBotMessage(`Thanks ${name}! Your estimated price is:\n\n$${estimate.low.toLocaleString()} - $${estimate.high.toLocaleString()}\n\nWhen would you like us to come out?`)
    setStep(STEPS.DATE)
  }

  const handleConfirmBooking = async () => {
    addUserMessage("Confirm")
    setIsTyping(true)
    try {
      const isLineStriping = bookingData.service === 'linestriping'
      const isSealcoating = bookingData.service === 'sealcoating'

      // Build notes for special services
      let notes = undefined
      if (isLineStriping) {
        notes = `Striping type: ${bookingData.condition === 'new_layout' ? 'New layout' : 'Re-stripe existing'}`
      } else if (isSealcoating && includeStriping) {
        notes = `Bundle: Sealcoating + Striping (10% discount applied)`
      }

      // Determine project type
      // - Line striping & sealcoating default to commercial (or house-of-worship if checked)
      // - Other services use the selected project type
      let projectType = bookingData.projectType
      if (isLineStriping || isSealcoating) {
        projectType = isChurch ? 'house-of-worship' : 'commercial'
      } else if (isChurch && projectType === 'commercial') {
        projectType = 'house-of-worship'
      }

      // Determine condition - only send for paving, not striping/sealcoating
      let condition = undefined
      if (!isLineStriping && !isSealcoating && bookingData.condition) {
        // Validate it's a valid condition value
        const validConditions = ['good', 'fair', 'poor', 'unknown']
        if (validConditions.includes(bookingData.condition)) {
          condition = bookingData.condition
        }
      }

      const response = await fetch('/api/paving-quote', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: bookingData.service,
          projectType: projectType,
          squareFootage: bookingData.squareFootage || undefined,
          condition: condition,
          address: bookingData.address,
          customerName: bookingData.name,
          customerEmail: bookingData.email || undefined,
          customerPhone: bookingData.phone,
          estimateLow: bookingData.estimateLow,
          estimateHigh: bookingData.estimateHigh,
          preferredDate: bookingData.deliveryDate,
          notes: notes,
        }),
      })
      const result = await response.json()
      setIsTyping(false)
      if (result.success) {
        // Store the job/invoice ID for payment
        setBookingData(prev => ({ ...prev, jobId: result.jobId, invoiceId: result.invoiceId }))
        await addBotMessage(`Booking confirmed!\n\nWould you like to pay now or pay later?`)
        setStep(STEPS.PAYMENT)
      } else {
        console.error('Quote API error:', result)
        await addBotMessage(`Something went wrong: ${result.error || 'Unknown error'}. Please call us at ${config.phone}`)
        setStep(STEPS.COMPLETE)
      }
    } catch (err) {
      setIsTyping(false)
      console.error('Quote submit error:', err)
      await addBotMessage(`Couldn't submit. Please call ${config.phone}`)
      setStep(STEPS.COMPLETE)
    }
  }

  const handlePayNow = async () => {
    addUserMessage("Pay Now")
    setIsTyping(true)
    try {
      // Create a Stripe checkout session
      const depositAmount = Math.round(bookingData.estimateLow * 0.50) // 50% deposit
      const response = await fetch('/api/payments/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: bookingData.invoiceId || bookingData.jobId,
          amountCents: depositAmount * 100,
          description: `Deposit for ${bookingData.serviceName} - ${config.businessName}`,
          customerEmail: bookingData.email,
          customerName: bookingData.name,
          customerPhone: bookingData.phone,
        }),
      })
      const result = await response.json()
      setIsTyping(false)
      if (result.checkoutUrl) {
        await addBotMessage(`Redirecting to secure payment...`)
        window.location.href = result.checkoutUrl
      } else {
        await addBotMessage(`Payment setup failed. We'll send you a payment link via text to ${bookingData.phone}.\n\nQuestions? Call ${config.phone}`)
        setStep(STEPS.COMPLETE)
      }
    } catch {
      setIsTyping(false)
      await addBotMessage(`Payment setup failed. We'll send you a payment link via text to ${bookingData.phone}.\n\nQuestions? Call ${config.phone}`)
      setStep(STEPS.COMPLETE)
    }
  }

  const handlePayLater = async () => {
    addUserMessage("Pay Later")
    await addBotMessage(`No problem! We'll contact you at ${bookingData.phone} to confirm your ${bookingData.deliveryDateLabel} appointment and send you a payment link.\n\nQuestions? Call ${config.phone}`)
    setStep(STEPS.COMPLETE)
  }

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (step === STEPS.ADDRESS) handleAddressSubmit()
    if (step === STEPS.SEALCOAT_ADDRESS) handleSealcoatAddressSubmit()
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
        className={`${embedded ? 'h-full' : 'fixed bottom-6 right-6 w-[420px] max-w-[calc(100vw-48px)] h-[600px] max-h-[calc(100vh-48px)]'} rounded-2xl flex flex-col z-50 overflow-hidden shadow-2xl`}
        style={{ backgroundColor: COLORS.black, border: `3px solid ${COLORS.yellow}` }}
      >
        {/* Header */}
        <div className="px-4 py-5 relative" style={{ backgroundColor: COLORS.yellow, borderBottom: `3px solid ${COLORS.black}` }}>
          <div className="text-center">
            <h2 className="font-black text-xl tracking-tight" style={{ color: COLORS.black }}>{config.businessName}</h2>
            <p className="text-sm font-medium mt-0.5" style={{ color: COLORS.black, opacity: 0.7 }}>Get Your Free Quote</p>
          </div>
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-all hover:scale-110"
            style={{ backgroundColor: COLORS.black, color: COLORS.yellow }}
          >
            <span className="text-xl font-bold">&times;</span>
          </button>
        </div>

        {/* Messages */}
        <div
          ref={messagesContainerRef}
          className="flex-1"
          style={{
            padding: '20px',
            overflowY: step === STEPS.MAP_MEASURING ? 'hidden' : 'auto',
            overflowX: 'hidden'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
                paddingLeft: msg.type === 'user' ? '40px' : '0',
                paddingRight: msg.type === 'user' ? '0' : '40px',
              }}>
                <div
                  style={{
                    padding: '12px 16px',
                    whiteSpace: 'pre-line',
                    fontSize: '15px',
                    lineHeight: '1.5',
                    borderRadius: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    maxWidth: '85%',
                    ...(msg.type === 'user'
                      ? { backgroundColor: COLORS.yellow, color: COLORS.black, borderBottomRightRadius: '4px' }
                      : { backgroundColor: COLORS.blackLight, color: '#fff', borderBottomLeftRadius: '4px', border: `2px solid ${COLORS.yellow}` }
                    )
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {(isTyping || isAnalyzing) && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', paddingRight: '40px' }}>
                <div
                  style={{
                    padding: '12px 16px',
                    fontSize: '15px',
                    borderRadius: '16px',
                    borderBottomLeftRadius: '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    backgroundColor: COLORS.blackLight,
                    color: '#fff',
                    border: `2px solid ${COLORS.yellow}`,
                  }}
                >
                  {isAnalyzing ? 'Analyzing satellite imagery...' : '...'}
                </div>
              </div>
            )}

            {/* SERVICE SELECTION */}
            {!isTyping && step === STEPS.SERVICE && messages.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
                {config.services.map(service => (
                  <button
                    key={service.id}
                    onClick={() => handleServiceSelect(service.id)}
                    style={{
                      width: '100%',
                      borderRadius: '12px',
                      padding: '16px',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      border: `2px solid ${COLORS.yellow}`,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                      backgroundColor: COLORS.blackLight,
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = COLORS.yellow; e.currentTarget.style.color = COLORS.black }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = COLORS.blackLight; e.currentTarget.style.color = '#fff' }}
                  >
                    <p style={{ fontWeight: 'bold', color: 'white', fontSize: '15px', margin: 0 }}>{service.name}</p>
                    <p style={{ fontSize: '13px', marginTop: '4px', color: COLORS.gray, margin: '4px 0 0 0' }}>{service.description}</p>
                  </button>
                ))}
              </div>
            )}

            {/* PROJECT TYPE */}
            {!isTyping && step === STEPS.PROJECT_TYPE && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
                {config.projectTypes.map(project => (
                  <button
                    key={project.id}
                    onClick={() => handleProjectSelect(project.id)}
                    style={{
                      width: '100%',
                      borderRadius: '12px',
                      padding: '16px',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      border: `2px solid ${COLORS.yellow}`,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                      backgroundColor: COLORS.blackLight,
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = COLORS.yellow; e.currentTarget.style.color = COLORS.black }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = COLORS.blackLight; e.currentTarget.style.color = '#fff' }}
                  >
                    {project.discount > 0 && (
                      <span style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        padding: '4px 8px',
                        borderRadius: '999px',
                        backgroundColor: COLORS.yellow,
                        color: COLORS.black,
                      }}>
                        {Math.round(project.discount * 100)}% OFF
                      </span>
                    )}
                    <p style={{ fontWeight: 'bold', color: 'white', fontSize: '15px', margin: 0 }}>{project.label}</p>
                    <p style={{ fontSize: '13px', marginTop: '4px', color: COLORS.gray, margin: '4px 0 0 0' }}>{project.description}</p>
                  </button>
                ))}
              </div>
            )}

            {/* MAP */}
            {!isTyping && !isAnalyzing && step === STEPS.MAP_MEASURING && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                {/* Manual input fallback when map fails */}
                {showManualInput ? (
                  <>
                    <div style={{
                      padding: '10px 12px',
                      backgroundColor: COLORS.blackMedium,
                      borderRadius: '8px',
                      borderLeft: `3px solid ${COLORS.yellow}`,
                    }}>
                      <p style={{ color: COLORS.yellow, fontWeight: 'bold', fontSize: '13px', margin: '0 0 4px 0' }}>
                        📐 Enter your area size
                      </p>
                      <p style={{ color: COLORS.gray, fontSize: '12px', margin: 0 }}>
                        Estimate the total square footage of your driveway or parking lot
                      </p>
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      padding: '16px',
                      borderRadius: '12px',
                      border: `2px solid ${COLORS.yellow}`,
                      backgroundColor: COLORS.blackLight,
                    }}>
                      <input
                        type="number"
                        value={manualSqFt}
                        onChange={(e) => setManualSqFt(e.target.value)}
                        placeholder="e.g., 500"
                        style={{
                          flex: 1,
                          padding: '12px 16px',
                          borderRadius: '10px',
                          fontSize: '16px',
                          backgroundColor: COLORS.blackMedium,
                          color: '#fff',
                          border: `2px solid ${COLORS.blackMedium}`,
                          outline: 'none',
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = COLORS.yellow}
                        onBlur={(e) => e.currentTarget.style.borderColor = COLORS.blackMedium}
                        autoFocus
                      />
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        color: COLORS.gray,
                        fontSize: '14px',
                        fontWeight: 'bold',
                      }}>
                        sq ft
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        const sqft = parseInt(manualSqFt)
                        if (sqft && sqft > 0) {
                          setDrawnArea(sqft)
                          // Calculate estimate with condition adjustment
                          const estimate = calculateEstimate(sqft, bookingData.service, bookingData.discount)

                          // Apply condition adjustment (for paving/sealcoating only)
                          const condition = config.conditions.find(c => c.id === bookingData.condition)
                          if (condition && condition.adjustment > 0) {
                            estimate.high = Math.round(estimate.high * (1 + condition.adjustment))
                          }

                          setBookingData(prev => ({ ...prev, squareFootage: sqft, estimateLow: estimate.low, estimateHigh: estimate.high }))
                          addUserMessage(`${sqft.toLocaleString()} sq ft`)
                          addBotMessage(`Thanks ${bookingData.name}! Your estimated price is:\n\n$${estimate.low.toLocaleString()} - $${estimate.high.toLocaleString()}\n\nWhen would you like us to come out?`)
                          setStep(STEPS.DATE)
                        } else {
                          addBotMessage('Please enter a valid square footage.')
                        }
                      }}
                      disabled={!manualSqFt || parseInt(manualSqFt) <= 0}
                      style={{
                        width: '100%',
                        borderRadius: '12px',
                        padding: '14px',
                        fontWeight: 'bold',
                        cursor: manualSqFt && parseInt(manualSqFt) > 0 ? 'pointer' : 'not-allowed',
                        backgroundColor: manualSqFt && parseInt(manualSqFt) > 0 ? COLORS.yellow : COLORS.blackMedium,
                        color: manualSqFt && parseInt(manualSqFt) > 0 ? COLORS.black : COLORS.gray,
                        border: `2px solid ${manualSqFt && parseInt(manualSqFt) > 0 ? COLORS.yellow : COLORS.gray}`,
                      }}
                    >
                      Continue
                    </button>
                    <p style={{ color: COLORS.gray, fontSize: '12px', textAlign: 'center', margin: 0 }}>
                      Tip: A typical 2-car driveway is 400-600 sq ft
                    </p>

                    {/* In-Person Inspection Option */}
                    <div style={{
                      marginTop: '8px',
                      padding: '12px',
                      borderRadius: '10px',
                      backgroundColor: COLORS.blackMedium,
                      border: `1px solid ${COLORS.gray}`,
                    }}>
                      <p style={{ color: COLORS.gray, fontSize: '12px', margin: '0 0 8px 0', textAlign: 'center' }}>
                        Not sure of the size? We can come measure for you!
                      </p>
                      <button
                        onClick={handleRequestInspection}
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: '8px',
                          fontWeight: 'bold',
                          fontSize: '13px',
                          backgroundColor: 'transparent',
                          color: COLORS.yellow,
                          border: `2px solid ${COLORS.yellow}`,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = COLORS.yellow; e.currentTarget.style.color = COLORS.black }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = COLORS.yellow }}
                      >
                        Request In-Person Inspection - $50
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Instructions */}
                    <div style={{
                      padding: '10px 12px',
                      backgroundColor: COLORS.blackMedium,
                      borderRadius: '8px',
                      borderLeft: `3px solid ${COLORS.yellow}`,
                    }}>
                      <p style={{ color: COLORS.yellow, fontWeight: 'bold', fontSize: '13px', margin: '0 0 4px 0' }}>
                        {drawnArea ? '✓ Area outlined - drag corners to adjust' : '📍 Outline your asphalt area'}
                      </p>
                      <p style={{ color: COLORS.gray, fontSize: '12px', margin: 0 }}>
                        {drawnArea ? 'Click Redraw to start over, then Confirm & Continue' : 'Click to outline, connect back to start, then Confirm & Continue'}
                      </p>
                    </div>

                    {/* Map - Much bigger */}
                    <div style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', border: `2px solid ${COLORS.yellow}` }}>
                      <div ref={mapContainerRef} style={{ height: '320px', backgroundColor: COLORS.black }} />
                      {drawnArea && (
                        <div style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.blackLight }}>
                          <span style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>{drawnArea.toLocaleString()} sq ft</span>
                        </div>
                      )}
                    </div>

                    {/* Buttons */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={clearDrawing}
                        style={{
                          flex: 1,
                          borderRadius: '12px',
                          padding: '14px',
                          fontWeight: 'bold',
                          color: 'white',
                          backgroundColor: COLORS.blackLight,
                          border: `2px solid ${COLORS.gray}`,
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = COLORS.yellow}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = COLORS.gray}
                      >
                        Redraw
                      </button>
                      <button
                        onClick={handleMapConfirm}
                        disabled={!drawnArea}
                        style={{
                          flex: 2,
                          borderRadius: '12px',
                          padding: '14px',
                          fontWeight: 'bold',
                          cursor: drawnArea ? 'pointer' : 'not-allowed',
                          backgroundColor: drawnArea ? COLORS.yellow : COLORS.blackMedium,
                          color: drawnArea ? COLORS.black : COLORS.gray,
                          border: `2px solid ${drawnArea ? COLORS.yellow : COLORS.gray}`,
                        }}
                      >
                        Confirm & Continue
                      </button>
                    </div>

                    {/* Manual entry link */}
                    <button
                      onClick={() => setShowManualInput(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: COLORS.gray,
                        fontSize: '12px',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        padding: '4px',
                      }}
                    >
                      Having trouble? Enter size manually
                    </button>

                    {/* In-Person Inspection Option */}
                    <div style={{
                      marginTop: '8px',
                      padding: '12px',
                      borderRadius: '10px',
                      backgroundColor: COLORS.blackMedium,
                      border: `1px solid ${COLORS.gray}`,
                    }}>
                      <p style={{ color: COLORS.gray, fontSize: '12px', margin: '0 0 8px 0', textAlign: 'center' }}>
                        Need help measuring? We can come to you!
                      </p>
                      <button
                        onClick={handleRequestInspection}
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: '8px',
                          fontWeight: 'bold',
                          fontSize: '13px',
                          backgroundColor: 'transparent',
                          color: COLORS.yellow,
                          border: `2px solid ${COLORS.yellow}`,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = COLORS.yellow; e.currentTarget.style.color = COLORS.black }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = COLORS.yellow }}
                      >
                        Request In-Person Inspection - $50
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* STRIPING TYPE (for line striping only) */}
            {!isTyping && step === STEPS.STRIPING_TYPE && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
                <p style={{ color: COLORS.gray, fontSize: '14px', margin: 0, textAlign: 'center' }}>
                  Are existing lines clearly visible?
                </p>
                {STRIPING_OPTIONS.map(option => (
                  <button
                    key={option.id}
                    onClick={() => handleStripingTypeSelect(option.id)}
                    style={{
                      width: '100%',
                      borderRadius: '12px',
                      padding: '16px',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      border: `2px solid ${COLORS.yellow}`,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                      backgroundColor: COLORS.blackLight,
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = COLORS.yellow; e.currentTarget.style.color = COLORS.black }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = COLORS.blackLight; e.currentTarget.style.color = '#fff' }}
                  >
                    <p style={{ fontWeight: 'bold', color: 'white', fontSize: '15px', margin: 0 }}>{option.label}</p>
                    <p style={{ fontSize: '13px', marginTop: '4px', color: COLORS.gray, margin: '4px 0 0 0' }}>{option.description}</p>
                  </button>
                ))}
              </div>
            )}

            {/* STRIPING SIZE - Lot size selection */}
            {!isTyping && step === STEPS.STRIPING_SIZE && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
                {STRIPING_LOT_SIZES.map(size => {
                  const hasPrice = size.price > 0
                  const estimate = hasPrice ? (stripingMultiplier > 1 ? Math.round(size.price * stripingMultiplier) : size.price) : 0
                  const deposit = Math.round(estimate * 0.5)

                  return (
                    <button
                      key={size.id}
                      onClick={() => handleStripingSizeSelect(size.id)}
                      style={{
                        width: '100%',
                        borderRadius: '12px',
                        padding: '16px',
                        textAlign: 'left',
                        border: `2px solid ${COLORS.blackMedium}`,
                        backgroundColor: COLORS.blackLight,
                        color: 'white',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = COLORS.yellow
                        e.currentTarget.style.transform = 'scale(1.02)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = COLORS.blackMedium
                        e.currentTarget.style.transform = 'scale(1)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{size.label}</div>
                          <div style={{ color: COLORS.gray, fontSize: '13px', marginTop: '4px' }}>{size.description}</div>
                        </div>
                        {hasPrice ? (
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ color: COLORS.yellow, fontWeight: 'bold', fontSize: '18px' }}>
                              ${estimate.toLocaleString()}
                            </div>
                            <div style={{ color: COLORS.gray, fontSize: '12px' }}>
                              Deposit: ${deposit.toLocaleString()}
                            </div>
                          </div>
                        ) : (
                          <div style={{ color: COLORS.yellow, fontWeight: 'bold', fontSize: '14px' }}>
                            Call for Quote
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
                {stripingMultiplier > 1 && (
                  <p style={{ color: COLORS.gray, fontSize: '12px', textAlign: 'center', marginTop: '4px' }}>
                    Prices include +50% for new layout
                  </p>
                )}
              </div>
            )}

            {/* ADD STRIPING UPSELL */}
            {!isTyping && step === STEPS.ADD_STRIPING && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
                <button
                  onClick={() => handleAddStripingChoice(true)}
                  style={{
                    width: '100%',
                    borderRadius: '12px',
                    padding: '16px',
                    textAlign: 'left',
                    border: `2px solid ${COLORS.yellow}`,
                    backgroundColor: COLORS.blackLight,
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = COLORS.yellow
                    e.currentTarget.style.color = COLORS.black
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = COLORS.blackLight
                    e.currentTarget.style.color = 'white'
                  }}
                >
                  <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Yes, add line striping</div>
                  <div style={{ color: COLORS.gray, fontSize: '13px', marginTop: '4px' }}>Get 10% off striping when bundled!</div>
                </button>
                <button
                  onClick={() => handleAddStripingChoice(false)}
                  style={{
                    width: '100%',
                    borderRadius: '12px',
                    padding: '16px',
                    textAlign: 'left',
                    border: `2px solid ${COLORS.blackMedium}`,
                    backgroundColor: COLORS.blackLight,
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = COLORS.yellow
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = COLORS.blackMedium
                  }}
                >
                  <div style={{ fontWeight: 'bold', fontSize: '16px' }}>No, just sealcoating</div>
                  <div style={{ color: COLORS.gray, fontSize: '13px', marginTop: '4px' }}>Continue with sealcoating only</div>
                </button>
              </div>
            )}

            {/* BUNDLE STRIPING SIZE */}
            {!isTyping && step === STEPS.BUNDLE_STRIPING_SIZE && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
                <div style={{
                  padding: '10px 12px',
                  backgroundColor: COLORS.blackMedium,
                  borderRadius: '8px',
                  borderLeft: `3px solid ${COLORS.yellow}`,
                  marginBottom: '8px'
                }}>
                  <p style={{ color: COLORS.yellow, fontWeight: 'bold', fontSize: '13px', margin: 0 }}>
                    🎉 10% bundle discount will be applied!
                  </p>
                </div>
                {STRIPING_LOT_SIZES.filter(s => s.id !== 'custom').map(size => {
                  const hasPrice = size.price > 0
                  const discountedPrice = hasPrice ? Math.round(size.price * (1 - BUNDLE_DISCOUNT)) : 0
                  const totalWithSeal = sealcoatingPrice + discountedPrice

                  return (
                    <button
                      key={size.id}
                      onClick={() => handleBundleStripingSizeSelect(size.id)}
                      style={{
                        width: '100%',
                        borderRadius: '12px',
                        padding: '16px',
                        textAlign: 'left',
                        border: `2px solid ${COLORS.blackMedium}`,
                        backgroundColor: COLORS.blackLight,
                        color: 'white',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = COLORS.yellow
                        e.currentTarget.style.transform = 'scale(1.02)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = COLORS.blackMedium
                        e.currentTarget.style.transform = 'scale(1)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{size.label}</div>
                          <div style={{ color: COLORS.gray, fontSize: '13px', marginTop: '4px' }}>{size.description}</div>
                        </div>
                        {hasPrice ? (
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ color: COLORS.yellow, fontWeight: 'bold', fontSize: '18px' }}>
                              ${totalWithSeal.toLocaleString()}
                            </div>
                            <div style={{ color: COLORS.gray, fontSize: '12px', textDecoration: 'line-through' }}>
                              ${(sealcoatingPrice + size.price).toLocaleString()}
                            </div>
                          </div>
                        ) : (
                          <div style={{ color: COLORS.yellow, fontWeight: 'bold', fontSize: '14px' }}>
                            Call for Quote
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {/* CONTACT FORM */}
            {!isTyping && step === STEPS.CONTACT && (
              <div style={{ marginTop: '20px' }}>
                <form onSubmit={handleContactSubmit} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  padding: '16px',
                  borderRadius: '12px',
                  border: `2px solid ${COLORS.yellow}`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  backgroundColor: COLORS.blackLight,
                }}>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Your full name"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      fontSize: '15px',
                      backgroundColor: COLORS.blackMedium,
                      color: '#fff',
                      border: `2px solid ${COLORS.blackMedium}`,
                      outline: 'none',
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = COLORS.yellow}
                    onBlur={(e) => e.currentTarget.style.borderColor = COLORS.blackMedium}
                    autoFocus
                  />
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="Phone number"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      fontSize: '15px',
                      backgroundColor: COLORS.blackMedium,
                      color: '#fff',
                      border: `2px solid ${COLORS.blackMedium}`,
                      outline: 'none',
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = COLORS.yellow}
                    onBlur={(e) => e.currentTarget.style.borderColor = COLORS.blackMedium}
                  />
                  <button
                    type="submit"
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: '10px',
                      fontWeight: 'bold',
                      fontSize: '15px',
                      backgroundColor: COLORS.yellow,
                      color: COLORS.black,
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    Get My Estimate
                  </button>
                </form>
              </div>
            )}

            {/* DATE */}
            {!isTyping && step === STEPS.DATE && (
              <div style={{ borderRadius: '12px', padding: '16px', border: `2px solid ${COLORS.yellow}`, boxShadow: '0 2px 8px rgba(0,0,0,0.3)', marginTop: '20px', backgroundColor: COLORS.blackLight }}>
                <div className="flex justify-between items-center mb-3">
                  <button
                    onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))}
                    className="w-8 h-8 flex items-center justify-center rounded-full font-bold hover:opacity-80"
                    style={{ backgroundColor: COLORS.blackMedium, color: COLORS.yellow }}
                  >&lt;</button>
                  <span className="text-white font-bold">{calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                  <button
                    onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))}
                    className="w-8 h-8 flex items-center justify-center rounded-full font-bold hover:opacity-80"
                    style={{ backgroundColor: COLORS.blackMedium, color: COLORS.yellow }}
                  >&gt;</button>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                    <div key={d} className="text-center text-xs font-bold py-1" style={{ color: COLORS.gray }}>{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {getCalendarDays().map((day, i) => (
                    <button
                      key={i}
                      onClick={() => day.date && day.isAvailable && handleDateSelect(day.date)}
                      disabled={!day.date || !day.isAvailable}
                      className="aspect-square rounded-lg text-sm font-bold transition-all"
                      style={
                        day.date
                          ? day.isAvailable
                            ? { backgroundColor: COLORS.blackMedium, color: '#fff' }
                            : { color: '#4a4540' }
                          : {}
                      }
                      onMouseEnter={(e) => { if (day.date && day.isAvailable) { e.currentTarget.style.backgroundColor = COLORS.yellow; e.currentTarget.style.color = COLORS.black }}}
                      onMouseLeave={(e) => { if (day.date && day.isAvailable) { e.currentTarget.style.backgroundColor = COLORS.blackMedium; e.currentTarget.style.color = '#fff' }}}
                    >
                      {day.date?.getDate() || ''}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SUMMARY */}
            {!isTyping && step === STEPS.SUMMARY && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
                <div style={{ borderRadius: '12px', padding: '16px', border: `2px solid ${COLORS.yellow}`, boxShadow: '0 2px 8px rgba(0,0,0,0.3)', backgroundColor: COLORS.blackLight }}>
                  <div className="flex justify-between"><span className="font-medium" style={{ color: COLORS.gray }}>Service</span><span className="text-white font-bold">{bookingData.serviceName}</span></div>
                  <div className="flex justify-between"><span className="font-medium" style={{ color: COLORS.gray }}>Property</span><span className="text-white font-bold">{bookingData.projectTypeName}</span></div>
                  <div className="flex justify-between"><span className="font-medium" style={{ color: COLORS.gray }}>Area</span><span className="text-white font-bold">{bookingData.squareFootage.toLocaleString()} sq ft</span></div>
                  <div className="flex justify-between"><span className="font-medium" style={{ color: COLORS.gray }}>Date</span><span className="text-white font-bold">{bookingData.deliveryDateLabel}</span></div>
                  <div className="flex justify-between"><span className="font-medium" style={{ color: COLORS.gray }}>Contact</span><span className="text-white font-bold text-right">{bookingData.name}<br/>{bookingData.phone}</span></div>
                  <div className="pt-3 flex justify-between items-center" style={{ borderTop: `2px solid ${COLORS.blackMedium}` }}>
                    <span className="text-white font-bold">Estimate</span>
                    <span className="font-black text-xl" style={{ color: COLORS.yellow }}>
                      {bookingData.estimateLow === bookingData.estimateHigh
                        ? `$${bookingData.estimateLow.toLocaleString()}`
                        : `$${bookingData.estimateLow.toLocaleString()} - $${bookingData.estimateHigh.toLocaleString()}`
                      }
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleConfirmBooking}
                  className="w-full rounded-xl py-4 font-black text-lg transition-all border-2 shadow-lg hover:scale-[1.02]"
                  style={{ backgroundColor: COLORS.yellow, color: COLORS.black, borderColor: COLORS.yellow }}
                >
                  Confirm Booking
                </button>
              </div>
            )}

            {/* PAYMENT */}
            {!isTyping && step === STEPS.PAYMENT && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
                <div style={{ borderRadius: '12px', padding: '16px', backgroundColor: COLORS.blackLight, border: `2px solid ${COLORS.blackMedium}` }}>
                  <div className="text-center mb-3">
                    <span className="text-white font-bold">50% Deposit</span>
                  </div>
                  <div className="text-center">
                    <span className="font-black text-2xl" style={{ color: COLORS.yellow }}>
                      ${Math.round(bookingData.estimateLow * 0.50).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-center mt-2">
                    <span style={{ color: COLORS.gray, fontSize: '13px' }}>
                      Remaining balance due upon completion
                    </span>
                  </div>
                </div>
                <button
                  onClick={handlePayNow}
                  className="w-full rounded-xl py-4 font-black text-lg transition-all border-2 shadow-lg hover:scale-[1.02]"
                  style={{ backgroundColor: COLORS.yellow, color: COLORS.black, borderColor: COLORS.yellow }}
                >
                  Pay Now - Secure Checkout
                </button>
                <button
                  onClick={handlePayLater}
                  className="w-full rounded-xl py-3 font-bold transition-all border-2 hover:opacity-80"
                  style={{ backgroundColor: 'transparent', color: COLORS.gray, borderColor: COLORS.blackMedium }}
                >
                  Pay Later
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Address Input with Name and Phone */}
        {step === STEPS.ADDRESS && (
          <div className="px-5 py-4" style={{ borderTop: `2px solid ${COLORS.blackMedium}` }}>
            <form onSubmit={handleInputSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Name field */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: COLORS.gray, marginBottom: '4px', textTransform: 'uppercase' }}>
                  Your Name <span style={{ color: COLORS.yellow }}>*</span>
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="John Smith"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    fontSize: '15px',
                    backgroundColor: COLORS.blackLight,
                    color: '#fff',
                    border: `2px solid ${COLORS.blackMedium}`,
                    outline: 'none',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = COLORS.yellow}
                  onBlur={(e) => e.currentTarget.style.borderColor = COLORS.blackMedium}
                  autoFocus
                />
              </div>
              {/* Email field (optional) */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: COLORS.gray, marginBottom: '4px', textTransform: 'uppercase' }}>
                  Email Address <span style={{ color: COLORS.gray, fontWeight: 'normal' }}>(optional)</span>
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="john@example.com"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    fontSize: '15px',
                    backgroundColor: COLORS.blackLight,
                    color: '#fff',
                    border: `2px solid ${COLORS.blackMedium}`,
                    outline: 'none',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = COLORS.yellow}
                  onBlur={(e) => e.currentTarget.style.borderColor = COLORS.blackMedium}
                />
              </div>
              {/* Phone field */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: COLORS.gray, marginBottom: '4px', textTransform: 'uppercase' }}>
                  Phone Number <span style={{ color: COLORS.yellow }}>*</span>
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="(618) 555-1234"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    fontSize: '15px',
                    backgroundColor: COLORS.blackLight,
                    color: '#fff',
                    border: `2px solid ${COLORS.blackMedium}`,
                    outline: 'none',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = COLORS.yellow}
                  onBlur={(e) => e.currentTarget.style.borderColor = COLORS.blackMedium}
                />
              </div>
              {/* Address field */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: COLORS.gray, marginBottom: '4px', textTransform: 'uppercase' }}>
                  Property Address <span style={{ color: COLORS.yellow }}>*</span>
                </label>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="123 Main St, Mount Vernon, IL 62864"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    fontSize: '15px',
                    backgroundColor: COLORS.blackLight,
                    color: '#fff',
                    border: `2px solid ${COLORS.blackMedium}`,
                    outline: 'none',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = COLORS.yellow}
                  onBlur={(e) => e.currentTarget.style.borderColor = COLORS.blackMedium}
                />
              </div>
              {/* Church/House of Worship toggle */}
              <div
                onClick={() => setIsChurch(!isChurch)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  backgroundColor: isChurch ? COLORS.blackMedium : 'transparent',
                  border: `2px solid ${isChurch ? COLORS.yellow : COLORS.blackMedium}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '4px',
                    border: `2px solid ${isChurch ? COLORS.yellow : COLORS.gray}`,
                    backgroundColor: isChurch ? COLORS.yellow : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                >
                  {isChurch && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={COLORS.black} strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <span style={{ color: isChurch ? COLORS.yellow : COLORS.gray, fontSize: '14px', fontWeight: '500' }}>
                  ⛪ This is for a church or house of worship
                </span>
              </div>
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  fontSize: '15px',
                  backgroundColor: COLORS.yellow,
                  color: COLORS.black,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Find My Property
              </button>
            </form>
          </div>
        )}

        {/* Sealcoat Address Input (address only - for map first) */}
        {step === STEPS.SEALCOAT_ADDRESS && (
          <div className="px-5 py-4" style={{ borderTop: `2px solid ${COLORS.blackMedium}` }}>
            <form onSubmit={handleInputSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: COLORS.gray, marginBottom: '4px', textTransform: 'uppercase' }}>
                  Property Address <span style={{ color: COLORS.yellow }}>*</span>
                </label>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="123 Main St, Mount Vernon, IL 62864"
                  required
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    fontSize: '15px',
                    backgroundColor: COLORS.blackLight,
                    color: '#fff',
                    border: `2px solid ${COLORS.blackMedium}`,
                    outline: 'none',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = COLORS.yellow}
                  onBlur={(e) => e.currentTarget.style.borderColor = COLORS.blackMedium}
                />
              </div>
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  fontSize: '15px',
                  backgroundColor: COLORS.yellow,
                  color: COLORS.black,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Find Property
              </button>
            </form>
          </div>
        )}

        {/* Sealcoat Contact Input (name/phone/email - address already collected) */}
        {step === STEPS.SEALCOAT_CONTACT && (
          <div className="px-5 py-4" style={{ borderTop: `2px solid ${COLORS.blackMedium}` }}>
            <form onSubmit={(e) => { e.preventDefault(); handleSealcoatContactSubmit() }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: COLORS.gray, marginBottom: '4px', textTransform: 'uppercase' }}>
                  Your Name <span style={{ color: COLORS.yellow }}>*</span>
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="John Smith"
                  required
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    fontSize: '15px',
                    backgroundColor: COLORS.blackLight,
                    color: '#fff',
                    border: `2px solid ${COLORS.blackMedium}`,
                    outline: 'none',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = COLORS.yellow}
                  onBlur={(e) => e.currentTarget.style.borderColor = COLORS.blackMedium}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: COLORS.gray, marginBottom: '4px', textTransform: 'uppercase' }}>
                  Email Address <span style={{ color: COLORS.gray, fontWeight: 'normal' }}>(optional)</span>
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="john@example.com"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    fontSize: '15px',
                    backgroundColor: COLORS.blackLight,
                    color: '#fff',
                    border: `2px solid ${COLORS.blackMedium}`,
                    outline: 'none',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = COLORS.yellow}
                  onBlur={(e) => e.currentTarget.style.borderColor = COLORS.blackMedium}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: COLORS.gray, marginBottom: '4px', textTransform: 'uppercase' }}>
                  Phone Number <span style={{ color: COLORS.yellow }}>*</span>
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="(618) 555-1234"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    fontSize: '15px',
                    backgroundColor: COLORS.blackLight,
                    color: '#fff',
                    border: `2px solid ${COLORS.blackMedium}`,
                    outline: 'none',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = COLORS.yellow}
                  onBlur={(e) => e.currentTarget.style.borderColor = COLORS.blackMedium}
                />
              </div>
              {/* Church/House of Worship toggle */}
              <div
                onClick={() => setIsChurch(!isChurch)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  backgroundColor: isChurch ? COLORS.blackMedium : 'transparent',
                  border: `2px solid ${isChurch ? COLORS.yellow : COLORS.blackMedium}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '4px',
                    border: `2px solid ${isChurch ? COLORS.yellow : COLORS.gray}`,
                    backgroundColor: isChurch ? COLORS.yellow : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                >
                  {isChurch && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={COLORS.black} strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <span style={{ color: isChurch ? COLORS.yellow : COLORS.gray, fontSize: '14px', fontWeight: '500' }}>
                  ⛪ This is for a church or house of worship
                </span>
              </div>
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  fontSize: '15px',
                  backgroundColor: COLORS.yellow,
                  color: COLORS.black,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Continue
              </button>
            </form>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 text-center" style={{ backgroundColor: COLORS.blackLight }}>
          <a
            href={`tel:${config.phoneRaw}`}
            className="text-sm font-medium transition-colors"
            style={{ color: COLORS.gray }}
            onMouseEnter={(e) => e.currentTarget.style.color = COLORS.yellow}
            onMouseLeave={(e) => e.currentTarget.style.color = COLORS.gray}
          >
            Questions? Call {config.phone}
          </a>
        </div>
      </div>
    )
  }
}
