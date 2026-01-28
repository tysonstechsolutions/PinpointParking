import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

// ============================================
// VOICE INPUT PARSER API
// Parses natural language job descriptions into line items
// ============================================

const anthropic = new Anthropic()

// Pricing constraints for different item types
const PRICING_RULES = {
  // Line Striping
  parking_space: { min: 3, max: 20, typical: 8 },           // Regular parking space striping
  handicap_space: { min: 25, max: 35, typical: 35 },        // Handicap space with logo
  hash_zone: { min: 15, max: 35, typical: 25 },             // Hash/loading zones
  arrow: { min: 15, max: 25, typical: 20 },                 // Directional arrows
  stencil: { min: 15, max: 35, typical: 25 },               // Any stencil work (max $35)
  stop_bar: { min: 15, max: 30, typical: 20 },              // Stop bars
  crosswalk: { min: 40, max: 100, typical: 60 },            // Crosswalk striping
  curb_paint: { min: 1, max: 3, typical: 2 },               // Per linear foot
  fire_lane: { min: 2, max: 5, typical: 3 },                // Per linear foot

  // Sealcoating
  sealcoat_sqft: { min: 0.15, max: 0.30, typical: 0.20 },   // Per square foot
  crack_fill: { min: 1, max: 1.50, typical: 1.25 },         // Per linear foot

  // Paving/Repair
  pothole_small: { min: 75, max: 100, typical: 85 },        // Small pothole
  pothole_medium: { min: 100, max: 125, typical: 115 },     // Medium pothole
  pothole_large: { min: 125, max: 150, typical: 140 },      // Large pothole
  asphalt_patch: { min: 4, max: 8, typical: 6 },            // Per square foot
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { transcript, services } = body

    if (!transcript || typeof transcript !== 'string') {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      )
    }

    // Build the prompt for Claude
    const prompt = `You are an AI assistant that parses natural language job site descriptions into invoice line items for a parking lot services company.

TRANSCRIPT FROM JOB SITE WALK:
"${transcript}"

PRICING RULES (you MUST follow these):
- Regular parking spaces: $${PRICING_RULES.parking_space.min}-$${PRICING_RULES.parking_space.max} each (typical: $${PRICING_RULES.parking_space.typical})
- Handicap spaces (with logo/loading zone): $${PRICING_RULES.handicap_space.min}-$${PRICING_RULES.handicap_space.max} each (NEVER more than $35)
- Hash zones / loading zones: $${PRICING_RULES.hash_zone.min}-$${PRICING_RULES.hash_zone.max} each
- Directional arrows: $${PRICING_RULES.arrow.min}-$${PRICING_RULES.arrow.max} each
- Any stencil work: MAX $${PRICING_RULES.stencil.max} each (NEVER more than $35)
- Stop bars: $${PRICING_RULES.stop_bar.min}-$${PRICING_RULES.stop_bar.max} each
- Crosswalks: $${PRICING_RULES.crosswalk.min}-$${PRICING_RULES.crosswalk.max} each
- Curb painting: $${PRICING_RULES.curb_paint.min}-$${PRICING_RULES.curb_paint.max} per linear foot
- Fire lane marking: $${PRICING_RULES.fire_lane.min}-$${PRICING_RULES.fire_lane.max} per linear foot
- Crack filling: $${PRICING_RULES.crack_fill.min}-$${PRICING_RULES.crack_fill.max} per linear foot (for sealcoating jobs)
- Potholes: $${PRICING_RULES.pothole_small.min}-$${PRICING_RULES.pothole_small.max} small, $${PRICING_RULES.pothole_medium.min}-$${PRICING_RULES.pothole_medium.max} medium, $${PRICING_RULES.pothole_large.min}-$${PRICING_RULES.pothole_large.max} large

INSTRUCTIONS:
1. Parse the transcript to identify all items mentioned (parking spaces, handicap spots, hash zones, arrows, etc.)
2. Count quantities carefully - the person may add items incrementally ("19 spots... 4 more spots... 13 more spots")
3. If a total price is mentioned (like "$1150" or "eleven fifty" or "total is..."), the line items MUST add up to EXACTLY that amount
4. Adjust per-item prices within the allowed ranges to match the total exactly
5. Group similar items together (e.g., all regular parking spaces as one line item)
6. Use clear, professional descriptions

RESPOND WITH JSON ONLY in this exact format:
{
  "lineItems": [
    {
      "description": "Regular Parking Space Striping",
      "quantity": 45,
      "unit_price_cents": 1500,
      "amount_cents": 67500
    }
  ],
  "totalCents": 115000,
  "services": {
    "striping": true,
    "sealing": false,
    "paving": false
  },
  "summary": "45 regular spaces, 4 handicap spaces, 4 hash zones"
}

IMPORTANT:
- All amounts must be in CENTS (e.g., $11.50 = 1150 cents)
- The sum of all line item amount_cents MUST equal totalCents
- If a total was mentioned, use that exact total
- Never exceed the max pricing rules (especially handicap and stencils at $35 max)
- Return ONLY valid JSON, no markdown or explanation`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [
        { role: 'user', content: prompt }
      ],
    })

    // Extract text from response
    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

    // Parse the JSON response
    let parsed
    try {
      // Try to find JSON in the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText)
      return NextResponse.json(
        { error: 'Failed to parse the job description. Please try again with clearer descriptions.' },
        { status: 500 }
      )
    }

    // Validate the response
    if (!parsed.lineItems || !Array.isArray(parsed.lineItems) || parsed.lineItems.length === 0) {
      return NextResponse.json(
        { error: 'Could not identify any items from the description. Please include specific items like "parking spaces", "handicap spots", etc.' },
        { status: 400 }
      )
    }

    // Verify the math
    const calculatedTotal = parsed.lineItems.reduce(
      (sum: number, item: { amount_cents: number }) => sum + (item.amount_cents || 0),
      0
    )

    // If there's a discrepancy, adjust the largest item
    if (parsed.totalCents && Math.abs(calculatedTotal - parsed.totalCents) > 0) {
      const diff = parsed.totalCents - calculatedTotal
      // Find the largest item and adjust it
      let largestIdx = 0
      let largestAmount = 0
      parsed.lineItems.forEach((item: { amount_cents: number }, idx: number) => {
        if (item.amount_cents > largestAmount) {
          largestAmount = item.amount_cents
          largestIdx = idx
        }
      })
      parsed.lineItems[largestIdx].amount_cents += diff
    }

    return NextResponse.json({
      success: true,
      lineItems: parsed.lineItems,
      totalCents: parsed.totalCents || calculatedTotal,
      services: parsed.services || { striping: true, sealing: false, paving: false },
      summary: parsed.summary || '',
    })

  } catch (error) {
    console.error('Parse voice error:', error)
    return NextResponse.json(
      { error: 'Failed to process the job description. Please try again.' },
      { status: 500 }
    )
  }
}
