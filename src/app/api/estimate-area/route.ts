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

// Use Claude Vision to analyze satellite image
async function analyzeWithClaude(
  imageBase64: string,
  projectType: string,
  address: string
): Promise<{ squareFootage: number; confidence: string; description: string } | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY not configured')
    return null
  }

  const client = new Anthropic({ apiKey })

  const projectDescriptions: Record<string, string> = {
    'driveway': 'residential driveway (the paved area from the street to the garage/house)',
    'parking-lot': 'commercial parking lot (the entire paved parking area with spaces)',
    'church': 'church parking lot',
    'apartment': 'apartment complex parking area',
    'retail': 'retail/business parking lot',
    'industrial': 'industrial facility paved area',
  }

  const targetDescription = projectDescriptions[projectType] || 'paved asphalt area'

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
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
              text: `You are an expert at analyzing satellite imagery to estimate paved surface areas for asphalt paving quotes.

Address: ${address}
Looking for: ${targetDescription}

Analyze this satellite image and estimate the square footage of the ${targetDescription}.

Guidelines:
- For driveways: Look for the paved path from street to house/garage. Typical residential driveways are 300-800 sq ft.
- For parking lots: Include all paved parking areas and driving lanes. Can range from 5,000 to 100,000+ sq ft.
- Consider the scale: At zoom level 20, each pixel is roughly 0.15 meters.
- The image is 640x640 pixels, covering approximately 96x96 meters (10,000 sq meters total visible area).

Respond in this exact JSON format only, no other text:
{
  "squareFootage": <number>,
  "confidence": "<low|medium|high>",
  "description": "<brief description of what you identified, e.g., 'Two-car driveway approximately 20ft x 35ft'>"
}

If you cannot identify the target area clearly, estimate based on typical sizes for that project type and set confidence to "low".`
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
    return {
      squareFootage: Math.round(result.squareFootage),
      confidence: result.confidence,
      description: result.description
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
      geocodeResult.formattedAddress
    )

    if (!analysis) {
      return NextResponse.json({
        success: false,
        error: 'Could not analyze image',
        fallback: true
      })
    }

    // 5. Return results
    return NextResponse.json({
      success: true,
      squareFootage: analysis.squareFootage,
      confidence: analysis.confidence,
      description: analysis.description,
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
