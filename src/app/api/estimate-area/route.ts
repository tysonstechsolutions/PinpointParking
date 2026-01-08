import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

// ============================================
// AI AREA ESTIMATION API
// Uses Claude Vision to analyze satellite imagery
// and estimate driveway/parking lot square footage
// ============================================

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

interface GeocodeResult {
  lat: number
  lng: number
  formattedAddress: string
}

// Geocode address to coordinates
async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  if (!GOOGLE_MAPS_API_KEY) return null

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`
    )
    const data = await response.json()

    if (data.status === 'OK' && data.results[0]) {
      const location = data.results[0].geometry.location
      return {
        lat: location.lat,
        lng: location.lng,
        formattedAddress: data.results[0].formatted_address
      }
    }
  } catch (error) {
    console.error('Geocoding error:', error)
  }
  return null
}

// Get satellite image URL from Google Maps Static API
function getSatelliteImageUrl(lat: number, lng: number, zoom: number = 20): string {
  // Higher zoom = more detail. 20 is good for driveways, 19 for parking lots
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=640x640&maptype=satellite&key=${GOOGLE_MAPS_API_KEY}`
}

// Fetch image and convert to base64
async function getImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    return base64
  } catch (error) {
    console.error('Image fetch error:', error)
    return null
  }
}

// Use Claude Vision to analyze satellite image and return polygon coordinates
async function analyzeWithClaude(
  imageBase64: string,
  projectType: string,
  address: string,
  centerLat: number,
  centerLng: number,
  zoom: number
): Promise<{
  squareFootage: number
  confidence: string
  description: string
  polygonPoints: Array<{lat: number, lng: number}>
} | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY not configured')
    return null
  }

  const client = new Anthropic({ apiKey })

  const projectDescriptions: Record<string, string> = {
    'driveway': 'residential DRIVEWAY - the private paved path that goes PERPENDICULAR to the street, connecting FROM the street/road TO the house/garage. NOT the street itself.',
    'parking-lot': 'commercial parking lot (the entire paved parking area with spaces)',
    'church': 'church parking lot',
    'apartment': 'apartment complex parking area',
    'retail': 'retail/business parking lot',
    'industrial': 'industrial facility paved area',
  }

  const targetDescription = projectDescriptions[projectType] || 'paved asphalt area'

  const isDriveway = projectType === 'driveway'

  // Calculate meters per pixel based on zoom level
  // At zoom 20: ~0.15m/pixel, at zoom 19: ~0.30m/pixel
  const metersPerPixel = 156543.03392 * Math.cos(centerLat * Math.PI / 180) / Math.pow(2, zoom)
  const imageSize = 640 // pixels
  const halfImageMeters = (imageSize / 2) * metersPerPixel

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/png',
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: `You are an expert at analyzing satellite imagery to identify and trace paved surface areas for asphalt paving quotes.

Address: ${address}
Looking for: ${targetDescription}
Image center coordinates: ${centerLat}, ${centerLng}
Zoom level: ${zoom}
Scale: ${metersPerPixel.toFixed(4)} meters per pixel
Image size: 640x640 pixels (center is at pixel 320, 320)

IMPORTANT TASK: Analyze this satellite image and:
1. Identify the ${targetDescription}
2. Trace the OUTLINE/BOUNDARY of the paved area
3. Return polygon coordinates as pixel positions (x, y from 0-640)

${isDriveway ? `CRITICAL FOR DRIVEWAYS:
- A driveway is the PRIVATE paved surface connecting the street TO the house/garage
- Driveways are typically PERPENDICULAR or at an angle to the street (not parallel)
- DO NOT trace the street/road - that's public, not the driveway
- Look for the rectangular area that goes FROM the road edge TOWARD the house
- Typical residential driveways are 10-20 feet wide and 20-50 feet long
- The driveway usually connects to a garage or ends near the front of the house
- Driveways often have a different color/texture than the street
- Look for where cars would park at a residential property` : `Guidelines for parking lots:
- Trace the entire paved parking area boundary, including driving lanes
- Include all connected paved surfaces`}

General Guidelines:
- Be precise with the corners and edges of the paved surface.
- Use 4-6 points for simple rectangular shapes, maximum 12-15 points for complex shapes.
- NEVER use more than 15 points total - simplify the shape if needed.
- Points should trace the boundary clockwise starting from the corner closest to the street.
- DO NOT include public roads or streets in your polygon.

Respond in this exact JSON format only, no other text:
{
  "squareFootage": <estimated square feet as number>,
  "confidence": "<low|medium|high>",
  "description": "<brief description, e.g., 'Two-car driveway approximately 20ft x 35ft'>",
  "polygonPixels": [
    {"x": <0-640>, "y": <0-640>},
    {"x": <0-640>, "y": <0-640>},
    ...more points tracing the boundary
  ]
}

If you can see a paved area, trace it even if confidence is low. The customer will verify and adjust.`
            }
          ],
        }
      ],
    })

    // Extract the text response
    const textContent = response.content.find(c => c.type === 'text')
    if (!textContent || textContent.type !== 'text') return null

    // Parse JSON from response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null

    const result = JSON.parse(jsonMatch[0])

    // Convert pixel coordinates to lat/lng
    const polygonPoints: Array<{lat: number, lng: number}> = []
    if (result.polygonPixels && Array.isArray(result.polygonPixels)) {
      for (const pixel of result.polygonPixels) {
        // Convert pixel offset from center to meters, then to lat/lng
        const xOffset = (pixel.x - 320) * metersPerPixel
        const yOffset = (320 - pixel.y) * metersPerPixel // Y is inverted in image coords

        // Convert meters to degrees (approximate for small distances)
        const latOffset = yOffset / 111320 // meters per degree latitude
        const lngOffset = xOffset / (111320 * Math.cos(centerLat * Math.PI / 180))

        polygonPoints.push({
          lat: centerLat + latOffset,
          lng: centerLng + lngOffset
        })
      }
    }

    // Limit to maximum 15 points to avoid overly complex polygons
    const limitedPoints = polygonPoints.length > 15 ? polygonPoints.slice(0, 15) : polygonPoints

    return {
      squareFootage: Math.round(result.squareFootage),
      confidence: result.confidence,
      description: result.description,
      polygonPoints: limitedPoints.length >= 3 ? limitedPoints : []
    }
  } catch (error) {
    console.error('Claude API error:', error)
    return null
  }
}

// ============================================
// MAIN API HANDLER
// ============================================
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { address, projectType } = body

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Address is required' },
        { status: 400 }
      )
    }

    // 1. Geocode the address
    const geocodeResult = await geocodeAddress(address)
    if (!geocodeResult) {
      return NextResponse.json({
        success: false,
        error: 'Could not locate address',
        fallback: true
      })
    }

    // 2. Determine zoom level based on project type
    const zoom = projectType === 'driveway' ? 20 : 19

    // 3. Get satellite image
    const imageUrl = getSatelliteImageUrl(geocodeResult.lat, geocodeResult.lng, zoom)
    const imageBase64 = await getImageAsBase64(imageUrl)

    if (!imageBase64) {
      return NextResponse.json({
        success: false,
        error: 'Could not fetch satellite image',
        fallback: true
      })
    }

    // 4. Analyze with Claude Vision
    const analysis = await analyzeWithClaude(
      imageBase64,
      projectType || 'driveway',
      geocodeResult.formattedAddress,
      geocodeResult.lat,
      geocodeResult.lng,
      zoom
    )

    if (!analysis) {
      return NextResponse.json({
        success: false,
        error: 'Could not analyze image',
        fallback: true,
        coordinates: {
          lat: geocodeResult.lat,
          lng: geocodeResult.lng
        },
        formattedAddress: geocodeResult.formattedAddress
      })
    }

    // 5. Return results with polygon points for map display
    return NextResponse.json({
      success: true,
      squareFootage: analysis.squareFootage,
      confidence: analysis.confidence,
      description: analysis.description,
      polygonPoints: analysis.polygonPoints,
      formattedAddress: geocodeResult.formattedAddress,
      coordinates: {
        lat: geocodeResult.lat,
        lng: geocodeResult.lng
      },
      satelliteImageUrl: imageUrl
    })

  } catch (error) {
    console.error('Area estimation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to estimate area', fallback: true },
      { status: 500 }
    )
  }
}
