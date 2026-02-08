import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

// ============================================
// VOICE INPUT PARSER API
// Parses natural language job descriptions into
// professional federal-project-level line items
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

// Equipment & Material Specs
const EQUIPMENT_SPECS = {
  striper: 'Graco LineLazer 3400',
  paintType: 'waterborne acrylic traffic paint (TTP-1952E Type I)',
  paintApplication: '15 wet mils DFT',
  beadType: 'Type I retroreflective glass beads (AASHTO M247)',
  beadRate: '6 lbs per gallon',
  lineWidth4: '4-inch width',
  lineWidth24: '24-inch width',
  crackSealant: 'hot-applied rubberized asphalt (ASTM D6690 Type II)',
  sealcoatMaterial: 'coal tar emulsion sealer (ASTM D5727)',
  sealcoatRate: '0.10-0.15 gal/sq yd',
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

    const prompt = `You are an expert estimator for a professional asphalt pavement marking and maintenance contractor. You parse natural language job site walk descriptions into detailed, federal-project-grade invoice line items.

COMPANY EQUIPMENT:
- Line Striper: ${EQUIPMENT_SPECS.striper}
- Paint: ${EQUIPMENT_SPECS.paintType}
- Application Rate: ${EQUIPMENT_SPECS.paintApplication}
- Glass Beads: ${EQUIPMENT_SPECS.beadType} at ${EQUIPMENT_SPECS.beadRate}
- Crack Sealant: ${EQUIPMENT_SPECS.crackSealant}
- Sealcoat Material: ${EQUIPMENT_SPECS.sealcoatMaterial}

TRANSCRIPT FROM JOB SITE WALK:
"${transcript}"

PRICING RULES (you MUST follow these):
- Regular parking stalls: $${PRICING_RULES.parking_space.min}-$${PRICING_RULES.parking_space.max} each (typical: $${PRICING_RULES.parking_space.typical})
- ADA-compliant accessible spaces (with ISA symbol & access aisle): $${PRICING_RULES.handicap_space.min}-$${PRICING_RULES.handicap_space.max} each (NEVER more than $35)
- Cross-hatch/loading zones: $${PRICING_RULES.hash_zone.min}-$${PRICING_RULES.hash_zone.max} each
- Directional arrows (per MUTCD Fig. 3B-21): $${PRICING_RULES.arrow.min}-$${PRICING_RULES.arrow.max} each
- Pavement legend/stencil markings: MAX $${PRICING_RULES.stencil.max} each (NEVER more than $35)
- Stop bars (24" width): $${PRICING_RULES.stop_bar.min}-$${PRICING_RULES.stop_bar.max} each
- Crosswalks (continental/standard): $${PRICING_RULES.crosswalk.min}-$${PRICING_RULES.crosswalk.max} each
- Curb painting: $${PRICING_RULES.curb_paint.min}-$${PRICING_RULES.curb_paint.max} per LF
- Fire lane marking: $${PRICING_RULES.fire_lane.min}-$${PRICING_RULES.fire_lane.max} per LF
- Crack sealing: $${PRICING_RULES.crack_fill.min}-$${PRICING_RULES.crack_fill.max} per LF
- Pothole repair: $${PRICING_RULES.pothole_small.min}-$${PRICING_RULES.pothole_large.max} depending on size

INSTRUCTIONS:
1. Parse the transcript to identify all items mentioned (parking stalls, ADA spaces, cross-hatch zones, arrows, etc.)
2. Count quantities carefully - the person may add items incrementally ("19 spots... 4 more spots... 13 more spots" = 36 total)
3. If a total price is mentioned (like "$1150" or "eleven fifty" or "total is..."), the line items MUST add up to EXACTLY that amount
4. Adjust per-item prices within the allowed ranges to match the total exactly
5. Group similar items together
6. For EVERY project, include these federal-standard line items as applicable:
   - Mobilization & Equipment Setup (${EQUIPMENT_SPECS.striper})
   - Traffic Control & Safety Setup (cones, barricades, signage per MUTCD)
   - Surface Preparation (cleaning, sweeping, debris removal)
   - Layout & Staking (chalk line layout, measurement per plan)
   - The actual marking/service items with material specs
   - Glass Bead Application (Type I retroreflective per AASHTO M247)
   - Cleanup & Demobilization
   - Labor (crew hours)

7. Use PROFESSIONAL asphalt industry descriptions. Examples:
   - NOT "Regular Parking Space Striping" → USE "4" Waterborne Pavement Marking - Parking Stall Delineation (TTP-1952E, 15 mil DFT)"
   - NOT "Handicap Space Striping" → USE "ADA-Compliant Accessible Space Marking w/ ISA Symbol & Access Aisle (per MUTCD/ADA Standards)"
   - NOT "Arrow" → USE "Directional Arrow Pavement Legend (per MUTCD Fig. 3B-21, 8' standard)"
   - NOT "Stop Bar" → USE "24\" Transverse Stop Bar Marking (retroreflective white, MUTCD 3B.16)"
   - NOT "Crosswalk" → USE "Continental Crosswalk Marking (24\" bars, 12\" spacing, retroreflective white)"
   - NOT "Fire Lane" → USE "Fire Lane Curb & Pavement Marking (red curb paint, white stencil per IFC 503.3)"
   - NOT "Sealcoating" → USE "Coal Tar Emulsion Sealcoat Application (ASTM D5727, 0.12 gal/SY, 2-coat system)"
   - NOT "Crack Filling" → USE "Hot-Applied Rubberized Crack Sealant (ASTM D6690 Type II, routed & sealed)"

RESPOND WITH JSON ONLY in this exact format:
{
  "lineItems": [
    {
      "description": "Mobilization & Equipment Setup - Graco LineLazer 3400 Striper, Traffic Paint, Glass Beads",
      "quantity": 1,
      "unit_price_cents": 15000,
      "amount_cents": 15000
    },
    {
      "description": "4\\" Waterborne Pavement Marking - Parking Stall Delineation (TTP-1952E, 15 mil DFT, w/ Type I Glass Beads)",
      "quantity": 45,
      "unit_price_cents": 800,
      "amount_cents": 36000
    },
    {
      "description": "ADA-Compliant Accessible Space Marking w/ ISA Symbol & Access Aisle (per MUTCD/ADA Standards)",
      "quantity": 4,
      "unit_price_cents": 3500,
      "amount_cents": 14000
    }
  ],
  "totalCents": 115000,
  "services": {
    "striping": true,
    "sealing": false,
    "paving": false
  },
  "summary": "45 parking stalls, 4 ADA spaces, 4 cross-hatch zones - Graco 3400 application"
}

IMPORTANT:
- All amounts must be in CENTS (e.g., $11.50 = 1150 cents)
- The sum of all line item amount_cents MUST equal totalCents
- If a total was mentioned, use that exact total
- Never exceed the max pricing rules (especially ADA spaces and stencils at $35 max)
- Include labor hours as a separate line item (e.g., "Labor - 2-Man Crew (X hours @ $Y/hr)")
- Include material line items when significant (paint gallons, glass beads, etc.)
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
