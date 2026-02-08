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
    const { transcript, services, totalCents: formTotalCents } = body

    if (!transcript || typeof transcript !== 'string') {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      )
    }

    // If a total was entered in the form field, tell the AI about it
    const formTotalNote = formTotalCents && formTotalCents > 0
      ? `\n\nNOTE: The user entered a total of $${(formTotalCents / 100).toFixed(2)} in the form. If no total is found in the transcript, use this as the total.`
      : ''

    const prompt = `You are an estimator for a parking lot pavement marking company. Parse this job site walk description into invoice line items.

EQUIPMENT: Graco LineLazer 3400, waterborne traffic paint (TTP-1952E).

TRANSCRIPT:
"${transcript}"${formTotalNote}

===== STEP 1: FIND THE TOTAL PRICE =====
Search the transcript for any dollar amount mentioned as the total/price for the job. Look for patterns like:
- "$9500" or "$10,000" or "ten thousand"
- "total is..." or "price it at..." or "I want to charge..." or "total" followed by a number
- "eleven fifty" = $1,150 (NOT $11.50)
- Any dollar figure stated as the job price

If a total price IS found: That is the FINAL total. All line items MUST add up to EXACTLY that amount. You will distribute that total across the items by adjusting unit prices. This is the #1 rule - the stated total is SACRED and cannot be ignored or overridden.

If NO total price is found: Use typical pricing rates to calculate the total.

===== STEP 2: COUNT ALL ITEMS =====
Go through the ENTIRE transcript and tally every item mentioned. The person adds items as they walk:
- "76 handicap spots" then later "9 handicap spots" = 85 total handicap spots
- "19 spots, 4 more spots, 13 more spots" = 36 total parking spots
- "2 arrows, 2 arrows, 2 arrows, 4 arrows, 2 arrows" = 12 total arrows
- "stop bar, stop bar, stop bar" = 3 stop bars
Count EVERY mention. Do not miss any.

===== STEP 3: PRICE THE ITEMS =====
Price items using this EXACT method. Do it in order:

FIXED-PRICE ITEMS (these have hard caps - price them FIRST):
- ADA/handicap spaces: $${PRICING_RULES.handicap_space.typical} each (NEVER more than $35)
- Cross-hatch/access zones: $${PRICING_RULES.hash_zone.typical} each (NEVER more than $35)
- Directional arrows: $${PRICING_RULES.arrow.typical} each
- Stop bars: $${PRICING_RULES.stop_bar.typical} each
- Walkways/crosswalks: $${PRICING_RULES.crosswalk.typical} each
- Stencil markings: $${PRICING_RULES.stencil.typical} each (NEVER more than $35)
- Curb painting: $${PRICING_RULES.curb_paint.typical}/LF
- Fire lane: $${PRICING_RULES.fire_lane.typical}/LF

THEN calculate the remainder:
  remainder = totalPrice - (sum of all fixed-price items above)

ABSORB THE REMAINDER into parking stalls:
  parking_stall_unit_price = remainder / number_of_parking_stalls

If parking stalls end up at a reasonable price ($3-$20 each), put it all there.
If parking stalls would be more than $20 each, cap them at $${PRICING_RULES.parking_space.typical} each and put the excess into ONE additional line item:
  "Fuel, Labor & Equipment Operating Costs (Graco LineLazer 3400)"

If NO total price was stated, use $${PRICING_RULES.parking_space.typical}/stall and add up all items for the total.

===== STEP 4: GENERATE LINE ITEMS =====
Descriptions to use:
- "4\\" Parking Stall Striping (waterborne TTP-1952E)" for regular spaces
- "ADA Accessible Space Marking w/ ISA Symbol & Access Aisle" for handicap spots
- "Cross-Hatch Access Zone Marking" for hash/access zones
- "Directional Arrow Pavement Marking" for arrows
- "24\\" Stop Bar Marking (white)" for stop bars
- "Pedestrian Walkway Marking (white)" for walkways/crosswalks
- "Fire Lane Curb & Pavement Marking" for fire lanes
- "Curb Paint Application" for curb painting
- "Fuel, Labor & Equipment Operating Costs (Graco LineLazer 3400)" ONLY if needed to absorb excess

DO NOT add items that were NOT mentioned in the transcript.

===== RESPOND WITH JSON ONLY =====
Example: user said "total is $9500" with 800 spots, 85 ADA, 81 hash, 24 walkways, 4 stop bars, 12 arrows:

Fixed items first:
  85 ADA × $35 = $2,975
  81 hash × $25 = $2,025
  12 arrows × $20 = $240
  4 stop bars × $20 = $80
  24 walkways × $50 = $1,200
  Fixed total = $6,520
  Remainder = $9,500 - $6,520 = $2,980
  Per stall = $2,980 / 800 = $3.73 (reasonable, under $20, so absorb it all)

{
  "lineItems": [
    {"description": "4\\" Parking Stall Striping (waterborne TTP-1952E)", "quantity": 800, "unit_price_cents": 373, "amount_cents": 298000},
    {"description": "ADA Accessible Space Marking w/ ISA Symbol & Access Aisle", "quantity": 85, "unit_price_cents": 3500, "amount_cents": 297500},
    {"description": "Cross-Hatch Access Zone Marking", "quantity": 81, "unit_price_cents": 2500, "amount_cents": 202500},
    {"description": "Pedestrian Walkway Marking (white)", "quantity": 24, "unit_price_cents": 5000, "amount_cents": 120000},
    {"description": "Directional Arrow Pavement Marking", "quantity": 12, "unit_price_cents": 2000, "amount_cents": 24000},
    {"description": "24\\" Stop Bar Marking (white)", "quantity": 4, "unit_price_cents": 2000, "amount_cents": 8000}
  ],
  "totalCents": 950000,
  "services": {"striping": true, "sealing": false, "paving": false},
  "summary": "800 stalls, 85 ADA, 81 hash zones, 24 walkways, 4 stop bars, 12 arrows - Total: $9,500"
}

RULES:
- All amounts in CENTS ($9,500 = 950000 cents)
- amount_cents = quantity × unit_price_cents (verify each row)
- Sum of all amount_cents MUST equal totalCents EXACTLY
- If a total was stated, totalCents MUST equal that stated amount
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
