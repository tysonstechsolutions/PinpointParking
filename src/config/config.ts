// ============================================
// PINPOINT PARKING - MASTER CONFIGURATION
// ============================================
// All business-specific settings in one file
// ============================================

export const config = {
  // ============================================
  // BUSINESS INFO
  // ============================================
  businessName: "Pinpoint Parking",
  tagline: "Professional Asphalt & Paving Services",
  phone: "(618) 214-7656",
  phoneRaw: "6182147656",
  email: "pinpointparkingco@gmail.com",
  websiteUrl: "https://pinpointparking.net",

  address: {
    street: "",
    city: "Mount Vernon",
    state: "IL",
    zip: "62864",
  },

  // ============================================
  // NOTIFICATIONS
  // ============================================
  notifications: {
    bookingAlertEmail: "pinpointparkingco@gmail.com",
    twilio: {
      enabled: true,
      // Credentials in environment variables:
      // TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN
      // TWILIO_PHONE_NUMBER, OWNER_PHONE
    },
  },

  // ============================================
  // DATABASE (Supabase) - Optional
  // ============================================
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  },

  // ============================================
  // GOOGLE MAPS
  // ============================================
  googleMaps: {
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    defaultCenter: { lat: 38.3170, lng: -88.9031 }, // Mount Vernon, IL
    defaultZoom: 19,
  },

  // ============================================
  // CHATBOT SETTINGS
  // ============================================
  chatbot: {
    autoOpenDelay: 2000, // ms before auto-opening (0 to disable)
    autoOpenOnHomepageOnly: true,
    enableVoiceInput: true,
    typingDelay: 500, // ms delay for typing animation
  },

  // ============================================
  // SERVICES (Products)
  // ============================================
  services: [
    {
      id: "sealcoating",
      name: "Sealcoating",
      shortName: "Sealcoat",
      description: "Protect and extend asphalt life",
      emoji: "🛡️",
      // Replace with your real work photos:
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
      pricePerSqFt: 0.20,
      minPrice: 150,
      estimateBuffer: 0.20, // +/- 20%
      bestFor: [
        "Driveways 2+ years old",
        "Parking lots needing protection",
        "Faded or gray asphalt",
      ],
      benefits: [
        "Extends pavement life 2-3x",
        "UV and water protection",
        "Rich black appearance",
      ],
    },
    {
      id: "paving",
      name: "Asphalt Paving",
      shortName: "Paving",
      description: "New installation or replacement",
      emoji: "🚧",
      // Replace with your real work photos:
      image: "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=600&h=400&fit=crop",
      pricePerSqFt: 4.25,
      minPrice: 2500,
      estimateBuffer: 0.25, // +/- 25%
      bestFor: [
        "New driveways",
        "Parking lot replacement",
        "Severely damaged surfaces",
      ],
      benefits: [
        "Brand new smooth surface",
        "15-20+ year lifespan",
        "Proper drainage grading",
      ],
    },
    {
      id: "linestriping",
      name: "Line Striping",
      shortName: "Striping",
      description: "Parking lot lines and markings",
      emoji: "🅿️",
      // Replace with your real work photos:
      image: "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=600&h=400&fit=crop",
      pricePerSqFt: 0.15,
      pricePerStall: 4.00,
      pricePerSymbol: 35,
      pricePerLinearFt: 0.25,
      minPrice: 200,
      estimateBuffer: 0.15,
      bestFor: [
        "Parking lots",
        "Commercial properties",
        "ADA compliance",
      ],
      benefits: [
        "Maximize parking capacity",
        "ADA compliant markings",
        "Professional appearance",
      ],
    },
  ],

  // ============================================
  // PROJECT TYPES
  // ============================================
  projectTypes: [
    {
      id: "residential",
      label: "Residential",
      emoji: "🏠",
      description: "Driveways & home properties",
      discount: 0,
    },
    {
      id: "commercial",
      label: "Commercial",
      emoji: "🏢",
      description: "Businesses & parking lots",
      discount: 0,
    },
    {
      id: "house-of-worship",
      label: "House of Worship",
      emoji: "🙏",
      description: "Churches, mosques, temples & more",
      discount: 0.10, // 10% discount
    },
  ],

  // ============================================
  // PAVEMENT CONDITIONS
  // ============================================
  conditions: [
    { id: "good", label: "Good", description: "Minor wear only", adjustment: 0 },
    { id: "fair", label: "Fair", description: "Some cracks", adjustment: 0.10 },
    { id: "poor", label: "Poor", description: "Major damage", adjustment: 0.25 },
    { id: "unknown", label: "Not Sure", description: "Need assessment", adjustment: 0 },
  ],

  // ============================================
  // ADD-ON SERVICES (Surcharges)
  // ============================================
  addOns: [
    { id: "crack-filling", item: "Crack Filling", fee: 50, unit: "area", description: "Fill cracks before sealcoating" },
    { id: "pothole-repair", item: "Pothole Repair", fee: 75, unit: "each", description: "Patch potholes" },
    { id: "oil-primer", item: "Oil Spot Primer", fee: 25, unit: "each", description: "Treat oil stains" },
    { id: "edging", item: "Edge Trimming", fee: 35, unit: "area", description: "Clean grass edges" },
  ],

  // ============================================
  // SERVICE AREA
  // ============================================
  serviceArea: {
    radius: 45, // miles from center
    cities: [
      "Mount Vernon", "Carbondale", "Marion", "Centralia", "Herrin",
      "Salem", "Benton", "West Frankfort", "Du Quoin", "Effingham",
      "Harrisburg", "Murphysboro", "Carterville", "Nashville", "Fairfield"
    ],
  },

  // ============================================
  // BUSINESS HOURS
  // ============================================
  hours: {
    monday: "7:00 AM - 6:00 PM",
    tuesday: "7:00 AM - 6:00 PM",
    wednesday: "7:00 AM - 6:00 PM",
    thursday: "7:00 AM - 6:00 PM",
    friday: "7:00 AM - 6:00 PM",
    saturday: "8:00 AM - 2:00 PM",
    sunday: "Closed",
  },

  // ============================================
  // BOOKING SETTINGS
  // ============================================
  booking: {
    minDaysOut: 2, // Can't book sooner than 2 days
    maxDaysOut: 60, // Can't book more than 60 days out
    skipSundays: true,
    skipHolidays: true,
  },

  // ============================================
  // ADMIN SETTINGS
  // ============================================
  admin: {
    password: process.env.ADMIN_PASSWORD || "pinpointparking",
  },

  // ============================================
  // JOB STATUSES
  // ============================================
  jobStatuses: [
    { id: "quote", label: "Quote Sent", color: "#f3f4f6", textColor: "#374151" },
    { id: "approved", label: "Approved", color: "#dbeafe", textColor: "#1d4ed8" },
    { id: "scheduled", label: "Scheduled", color: "#f3e8ff", textColor: "#7c3aed" },
    { id: "in_progress", label: "In Progress", color: "#fef3c7", textColor: "#d97706" },
    { id: "completed", label: "Completed", color: "#dcfce7", textColor: "#16a34a" },
    { id: "cancelled", label: "Cancelled", color: "#fee2e2", textColor: "#dc2626" },
  ],

  // ============================================
  // EXPENSE CATEGORIES
  // ============================================
  expenseCategories: [
    { id: "materials", label: "Materials", icon: "📦" },
    { id: "fuel", label: "Fuel", icon: "⛽" },
    { id: "equipment", label: "Equipment", icon: "🚜" },
    { id: "labor", label: "Labor", icon: "👷" },
    { id: "insurance", label: "Insurance", icon: "🛡️" },
    { id: "permits", label: "Permits", icon: "📄" },
    { id: "other", label: "Other", icon: "📁" },
  ],

  // ============================================
  // DOCUMENT CATEGORIES
  // ============================================
  documentCategories: [
    { id: "invoice", label: "Invoice", icon: "📄" },
    { id: "receipt", label: "Receipt", icon: "🧾" },
    { id: "contract", label: "Contract", icon: "📝" },
    { id: "photo", label: "Photo", icon: "📷" },
    { id: "permit", label: "Permit", icon: "📋" },
    { id: "other", label: "Other", icon: "📁" },
  ],
}

export default config
