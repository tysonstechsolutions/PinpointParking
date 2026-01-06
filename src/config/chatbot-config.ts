// ============================================
// PAVING CHATBOT CONFIGURATION
// ============================================

export const chatbotConfig = {
  // ===========================================
  // BUSINESS INFORMATION
  // ===========================================
  business: {
    name: "Pinpoint Parking",
    phone: "(618) 214-7656",
    phoneRaw: "6182147656",
    email: "pinpointparkingco@gmail.com",
    serviceArea: "Southern Illinois",
    address: "Mount Vernon, IL 62864",
  },

  // ===========================================
  // SERVICE PRICING
  // ===========================================
  services: [
    {
      id: 'sealcoating',
      name: 'Sealcoating',
      description: 'Protect and extend the life of your asphalt',
      pricePerSqFt: 0.20,
      minPrice: 150,
      estimateBuffer: 0.20,
    },
    {
      id: 'paving',
      name: 'Asphalt Paving',
      description: 'New asphalt installation or replacement',
      pricePerSqFt: 4.25,
      minPrice: 2500,
      estimateBuffer: 0.25,
    },
    {
      id: 'linestriping',
      name: 'Line Striping',
      description: 'Parking lot lines and markings',
      pricePerSqFt: 0.15,
      minPrice: 200,
      estimateBuffer: 0.15,
    },
  ],

  // ===========================================
  // PROJECT TYPES
  // ===========================================
  projectTypes: [
    { id: 'residential-driveway', label: 'Driveway', avgSqFt: 600 },
    { id: 'commercial-parking', label: 'Parking Lot', avgSqFt: 10000 },
    { id: 'church-parking', label: 'Church', avgSqFt: 8000 },
    { id: 'apartment-complex', label: 'Apartment', avgSqFt: 15000 },
    { id: 'retail-parking', label: 'Retail', avgSqFt: 20000 },
    { id: 'industrial', label: 'Industrial', avgSqFt: 25000 },
  ],

  // ===========================================
  // SERVICE AREA CENTER (Mount Vernon, IL)
  // ===========================================
  serviceAreaCenter: {
    lat: 38.3170,
    lng: -88.9031,
  },

  // ===========================================
  // GOOGLE MAPS API KEY
  // ===========================================
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',

  // ===========================================
  // CALENDLY URL (optional)
  // ===========================================
  calendlyUrl: process.env.NEXT_PUBLIC_CALENDLY_URL || '',
}
