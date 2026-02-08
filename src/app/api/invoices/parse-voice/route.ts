import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

// ============================================
// VOICE INPUT PARSER API
// Parses natural language job descriptions into
// professional line items
// ============================================

const anthropic = new Anthropic()

// Pricing constraints for different item types
const PRICING_RULES = {
  // Pavement Marking - Striping
  parking_space: { min: 3, max: 20, typical: 8 },
  handicap_space: { min: 25, max: 35, typical: 35 },
  hash_zone: { min: 15, max: 35, typical: 25 },
  arrow: { min: 15, max: 25, typical: 20 },
  stencil: { min: 15, max: 35, typical: 25 },
  stop_bar: { min: 15, max: 30, typical: 20 },
  crosswalk: { min: 40, max: 100, typical: 60 },
  curb_paint: { min: 1, max: 3, typical: 2 },
  fire_lane: { min: 2, max: 5, typical: 3 },

  // Sealcoating
  sealcoat_sqft: { min: 0.15, max: 0.30, typical: 0.20 },
  crack_fill: { min: 1, max: 1.50, typical: 1.25 },

  // Paving/Repair
  pothole_small: { min: 75, max: 100, typical: 85 },
  pothole_medium: { min: 100, max: 125, typical: 115 },
  pothole_large: { min: 125, max: 150, typical: 140 },
  asphalt_patch: { min: 4, max: 8, typical: 6 },
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

    const prompt = `You are an estimator for a parking lot pavement marking and maintenance company. Parse the following job site description into invoice line items.

EQUIPMENT: Graco LineLazer 3400 line striper, waterborne traffic paint (TTP-1952E).

TRANSCRIPT:
"${transcript}"

PRICING RULES (you MUST follow these exactly):
- Parking stalls: $${PRICING_RULES.parking_space.min}-$${PRICING_RULES.parking_space.max} each (typical: $${PRICING_RULES.parking_space.typical})
- ADA accessible spaces (with ISA symbol & access aisle): $${PRICING_RULES.handicap_space.min}-$${PRICING_RULES.handicap_space.max} each (NEVER more than $35)
- Cross-hatch/loading zones: $${PRICING_RULES.hash_zone.min}-$${PRICING_RULES.hash_zone.max} each
- Directional arrows: $${PRICING_RULES.arrow.min}-$${PRICING_RULES.arrow.max} each
- Stencil markings: MAX $${PRICING_RULES.stencil.max} each (NEVER more than $35)
- Stop bars (24" white): $${PRICING_RULES.stop_bar.min}-$${PRICING_RULES.stop_bar.max} each
- Crosswalks/walkways (white paint): $${PRICING_RULES.crosswalk.min}-$${PRICING_RULES.crosswalk.max} each
- Curb painting: $${PRICING_RULES.curb_paint.min}-$${PRICING_RULES.curb_paint.max} per LF
- Fire lane marking: $${PRICING_RULES.fire_lane.min}-$${PRICING_RULES.fire_lane.max} per LF
- Crack sealing: $${PRICING_RULES.crack_fill.min}-$${PRICING_RULES.crack_fill.max} per LF
- Pothole repair: $${PRICING_RULES.pothole_small.min}-$${PRICING_RULES.pothole_large.max} depending on size

CRITICAL COUNTING RULES:
1. Count ALL items mentioned throughout the ENTIRE transcript. The person adds items as they walk, so you MUST add them all up.
   Example: "76 handicap spots... 9 handicap spots" = 85 handicap spots total
   Example: "19 spots, 4 more parking spots, 13 more parking spots" = 36 parking spots total
2. Go through the transcript line by line and tally every mention of each item type before generating line items.
3. If a total price is mentioned ("$1150" or "eleven fifty" or "total is..."), the line items MUST add up to EXACTLY that amount. Adjust per-item prices within the allowed ranges to hit the total.
4. If NO total price is mentioned, price each item at the typical rate.

LINE ITEM DESCRIPTIONS - Use professional but concise descriptions:
- "4" Parking Stall Striping (waterborne TTP-1952E)" for regular spaces
- "ADA Accessible Space Marking w/ ISA Symbol & Access Aisle" for handicap spots
- "Cross-Hatch Loading Zone Marking" for hash zones
- "Directional Arrow Pavement Marking" for arrows
- "24" Stop Bar Marking (white)" for stop bars
- "Pedestrian Walkway Marking (white)" for walkways/crosswalks
- "Fire Lane Curb & Pavement Marking" for fire lanes
- "Curb Paint Application" for curb painting

DO NOT include any of these - only include what was actually described:
- Do NOT add mobilization/setup fees unless the person mentioned it
- Do NOT add traffic control unless mentioned
- Do NOT add cleanup fees unless mentioned
- Do NOT add labor as a separate line item unless mentioned
- Do NOT add material costs as separate line items
- Do NOT guess quantities for anything not mentioned
- Do NOT add glass beads or reflective materials - we do not use them

RESPOND WITH JSON ONLY in this exact format:
{
  "lineItems": [
    {
      "description": "4\\" Parking Stall Striping (waterborne TTP-1952E)",
      "quantity": 800,
      "unit_price_cents": 800,
      "amount_cents": 640000
    },
    {
      "description": "ADA Accessible Space Marking w/ ISA Symbol & Access Aisle",
      "quantity": 85,
      "unit_price_cents": 3500,
      "amount_cents": 297500
    }
  ],
  "totalCents": 937500,
  "services": {
    "striping": true,
    "sealing": false,
    "paving": false
  },
  "summary": "800 parking stalls, 85 ADA spaces, 81 cross-hatch zones"
}

IMPORTANT:
- All amounts in CENTS (e.g., $11.50 = 1150 cents)
- The sum of all line item amount_cents MUST equal totalCents
- amount_cents = quantity * unit_price_cents (verify this for each item)
- If a total was mentioned, use that exact total and adjust unit prices to match
- Never exceed max pricing rules (ADA spaces and stencils at $35 max)
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
