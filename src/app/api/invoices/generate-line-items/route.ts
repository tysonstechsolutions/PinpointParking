import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

// ============================================
// AI LINE ITEM GENERATION API
// Generates realistic line items for invoices
// ============================================

const anthropic = new Anthropic()

// Pricing constraints for different item types
const PRICING_RULES = {
  // Line Striping
  parking_space: { min: 3, max: 20, typical: 8 },
  handicap_space: { min: 25, max: 35, typical: 35 },        // NEVER more than $35
  hash_zone: { min: 15, max: 35, typical: 25 },
  arrow: { min: 15, max: 25, typical: 20 },
  stencil: { min: 15, max: 35, typical: 25 },               // NEVER more than $35
  stop_bar: { min: 15, max: 30, typical: 20 },
  crosswalk: { min: 40, max: 100, typical: 60 },
  curb_paint_per_ft: { min: 1, max: 3, typical: 2 },
  fire_lane_per_ft: { min: 2, max: 5, typical: 3 },

  // Sealcoating
  sealcoat_per_sqft: { min: 0.15, max: 0.30, typical: 0.20 },
  crack_fill_per_ft: { min: 1, max: 1.50, typical: 1.25 },

  // Paving/Repair
  pothole_small: { min: 75, max: 100, typical: 85 },
  pothole_medium: { min: 100, max: 125, typical: 115 },
  pothole_large: { min: 125, max: 150, typical: 140 },
  asphalt_patch_per_sqft: { min: 4, max: 8, typical: 6 },
}

// Service-specific line item templates with pricing
const serviceTemplates = {
  striping: [
    { description: 'Regular Parking Space Striping', unitPrice: PRICING_RULES.parking_space.typical },
    { description: 'Handicap Space Striping & Logo', unitPrice: PRICING_RULES.handicap_space.typical },
    { description: 'Fire Lane Marking', unitPrice: 50 },
    { description: 'Directional Arrows', unitPrice: PRICING_RULES.arrow.typical },
    { description: 'Stop Bar Striping', unitPrice: PRICING_RULES.stop_bar.typical },
    { description: 'Crosswalk Striping', unitPrice: PRICING_RULES.crosswalk.typical },
    { description: 'Loading Zone Marking', unitPrice: PRICING_RULES.hash_zone.typical },
    { description: 'Curb Painting', unitPrice: 30 },
    { description: 'Stencil Work', unitPrice: PRICING_RULES.stencil.typical },
    { description: 'Layout & Design', unitPrice: 75 },
    { description: 'Traffic Paint Material', unitPrice: 50 },
  ],
  sealing: [
    { description: 'Sealcoating Application', unitPrice: 200 },
    { description: 'Surface Preparation & Cleaning', unitPrice: 75 },
    { description: 'Crack Filling', unitPrice: 100 },
    { description: 'Oil Spot Treatment', unitPrice: 50 },
    { description: 'Edge Sealing', unitPrice: 40 },
    { description: 'Second Coat Application', unitPrice: 150 },
    { description: 'Power Washing', unitPrice: 75 },
    { description: 'Debris Removal', unitPrice: 50 },
    { description: 'Sealcoat Material', unitPrice: 100 },
  ],
  paving: [
    { description: 'Asphalt Paving', unitPrice: 500 },
    { description: 'Base Preparation', unitPrice: 200 },
    { description: 'Grading & Leveling', unitPrice: 150 },
    { description: 'Asphalt Overlay', unitPrice: 300 },
    { description: 'Compaction', unitPrice: 100 },
    { description: 'Pothole Repair', unitPrice: PRICING_RULES.pothole_medium.typical },
    { description: 'Crack Sealing', unitPrice: 75 },
    { description: 'Equipment & Labor', unitPrice: 200 },
    { description: 'Site Cleanup', unitPrice: 50 },
    { description: 'Asphalt Material', unitPrice: 150 },
  ],
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { services, totalCents, squareFeet } = body

    if (!services || !Array.isArray(services) || services.length === 0) {
      return NextResponse.json(
        { error: 'At least one service must be selected' },
        { status: 400 }
      )
    }

    if (!totalCents || totalCents <= 0) {
      return NextResponse.json(
        { error: 'Total amount must be greater than 0' },
        { status: 400 }
      )
    }

    // Get available line item templates for selected services
    const availableItems: { description: string; unitPrice: number }[] = []
    for (const service of services) {
      const templates = serviceTemplates[service as keyof typeof serviceTemplates]
      if (templates) {
        availableItems.push(...templates)
      }
    }

    // Try AI generation first, fall back to algorithmic if unavailable
    let lineItems: { description: string; amount_cents: number }[] = []

    try {
      // Use Claude to generate realistic line items
      const serviceNames = services.map((s: string) => {
        const names: Record<string, string> = {
          striping: 'Line Striping',
          sealing: 'Sealcoating',
          paving: 'Asphalt Paving',
        }
        return names[s] || s
      }).join(', ')

      const itemList = availableItems.map(t => `- ${t.description} (typical: $${t.unitPrice})`).join('\n')

      const prompt = `Generate invoice line items for a parking lot service job.

Services: ${serviceNames}
Total Amount: $${(totalCents / 100).toFixed(2)}
${squareFeet ? `Square Footage: ${squareFeet.toLocaleString()} sq ft` : ''}

PRICING RULES (you MUST follow these):
- Handicap spaces: NEVER more than $35 each
- Any stencil work: NEVER more than $35 each
- Crack filling: $1.00-$1.50 per linear foot
- Potholes: $75-$150 depending on size

Available line items and typical prices:
${itemList}

Requirements:
1. Create 3-6 line items that add up EXACTLY to $${(totalCents / 100).toFixed(2)}
2. Use realistic descriptions from the list above
3. Distribute amounts logically (main service should be largest)
4. Round amounts to nearest dollar
5. Make sure the total is EXACT - verify your math
6. NEVER exceed the max pricing rules

Return ONLY a JSON array with objects containing "description" and "amount_cents" (in cents, not dollars).
Example: [{"description": "Sealcoating Application", "amount_cents": 75000}]

IMPORTANT: Return ONLY the JSON array, no explanation or markdown.`

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          { role: 'user', content: prompt }
        ],
      })

      // Extract text from response
      const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

      // Parse the JSON response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Verify the total matches
          const generatedTotal = parsed.reduce((sum: number, item: { amount_cents: number }) => sum + item.amount_cents, 0)

          // If within $1 of target, adjust to be exact
          if (Math.abs(generatedTotal - totalCents) <= 100) {
            // Adjust the largest item to make total exact
            const diff = totalCents - generatedTotal
            const largestIdx = parsed.reduce((maxIdx: number, item: { amount_cents: number }, idx: number, arr: { amount_cents: number }[]) =>
              item.amount_cents > arr[maxIdx].amount_cents ? idx : maxIdx, 0)
            parsed[largestIdx].amount_cents += diff
            lineItems = parsed
          } else {
            // AI total was too far off, use algorithmic fallback
            console.log('AI total mismatch, using fallback')
          }
        }
      }
    } catch (aiError) {
      console.error('AI generation failed, using fallback:', aiError)
    }

    // Fallback: Algorithmic generation if AI failed or was unavailable
    if (lineItems.length === 0) {
      lineItems = generateAlgorithmicLineItems(services, totalCents, availableItems)
    }

    return NextResponse.json({
      success: true,
      lineItems,
    })

  } catch (error) {
    console.error('Generate line items error:', error)
    return NextResponse.json(
      { error: 'Failed to generate line items' },
      { status: 500 }
    )
  }
}

// Fallback algorithmic line item generation
function generateAlgorithmicLineItems(
  services: string[],
  totalCents: number,
  availableItems: { description: string; unitPrice: number }[]
): { description: string; amount_cents: number }[] {
  const lineItems: { description: string; amount_cents: number }[] = []
  let remaining = totalCents

  // Determine number of line items (3-5)
  const numItems = Math.min(5, Math.max(3, Math.floor(totalCents / 10000) + 2))

  // Main service gets 40-60% of total
  const mainServicePercent = 0.4 + Math.random() * 0.2
  const mainServiceAmount = Math.round(totalCents * mainServicePercent / 100) * 100

  // Get primary service description
  const primaryService = services[0]
  const primaryDescriptions: Record<string, string> = {
    striping: 'Regular Parking Space Striping',
    sealing: 'Sealcoating Application',
    paving: 'Asphalt Paving',
  }

  lineItems.push({
    description: primaryDescriptions[primaryService] || availableItems[0]?.description || 'Service',
    amount_cents: mainServiceAmount,
  })
  remaining -= mainServiceAmount

  // Remove used description
  const usedDescriptions = new Set([primaryDescriptions[primaryService] || availableItems[0]?.description])

  // Add remaining items
  for (let i = 1; i < numItems - 1 && remaining > 500; i++) {
    // Get a random unused template
    const availableUnused = availableItems.filter(t => !usedDescriptions.has(t.description))
    if (availableUnused.length === 0) break

    const template = availableUnused[Math.floor(Math.random() * availableUnused.length)]
    usedDescriptions.add(template.description)

    // Random percentage of remaining (20-40%)
    const percent = 0.2 + Math.random() * 0.2
    const amount = Math.round(remaining * percent / 100) * 100

    lineItems.push({ description: template.description, amount_cents: amount })
    remaining -= amount
  }

  // Last item gets the remainder
  if (remaining > 0) {
    const availableUnused = availableItems.filter(t => !usedDescriptions.has(t.description))
    const description = availableUnused.length > 0
      ? availableUnused[Math.floor(Math.random() * availableUnused.length)].description
      : 'Additional Services'

    lineItems.push({ description, amount_cents: remaining })
  }

  return lineItems
}
