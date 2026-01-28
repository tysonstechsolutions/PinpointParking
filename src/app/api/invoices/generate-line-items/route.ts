import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

// ============================================
// AI LINE ITEM GENERATION API
// Generates realistic line items for invoices
// ============================================

const anthropic = new Anthropic()

// Service-specific line item templates
const serviceTemplates = {
  striping: [
    'Parking Space Striping',
    'Handicap Space Striping & Signage',
    'Fire Lane Marking',
    'Directional Arrows',
    'Stop Bar Striping',
    'Crosswalk Striping',
    'No Parking Zone Marking',
    'Loading Zone Marking',
    'Curb Painting',
    'Number Stenciling',
    'Letter Stenciling',
    'Layout Design',
    'Old Line Removal',
    'Traffic Paint Material',
    'Thermoplastic Striping',
  ],
  sealing: [
    'Sealcoating Application',
    'Surface Preparation & Cleaning',
    'Crack Filling',
    'Oil Spot Treatment',
    'Edge Sealing',
    'Second Coat Application',
    'Sealcoat Material',
    'Power Washing',
    'Debris Removal',
    'Traffic Control Setup',
    'Pothole Patching',
    'Asphalt Repair',
  ],
  paving: [
    'Asphalt Paving',
    'Base Preparation',
    'Grading & Leveling',
    'Asphalt Overlay',
    'Milling & Removal',
    'Compaction',
    'Subgrade Work',
    'Drainage Installation',
    'Curb Installation',
    'Asphalt Material',
    'Equipment & Labor',
    'Traffic Control',
    'Site Cleanup',
    'Edge Work',
    'Pothole Repair',
    'Crack Sealing',
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

    // Get available line item descriptions for selected services
    const availableItems: string[] = []
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

      const prompt = `Generate invoice line items for a parking lot service job.

Services: ${serviceNames}
Total Amount: $${(totalCents / 100).toFixed(2)}
${squareFeet ? `Square Footage: ${squareFeet.toLocaleString()} sq ft` : ''}

Available line item descriptions to choose from:
${availableItems.join('\n')}

Requirements:
1. Create 3-6 line items that add up EXACTLY to $${(totalCents / 100).toFixed(2)}
2. Use realistic descriptions from the list above
3. Distribute amounts logically (main service should be largest)
4. Round amounts to nearest dollar or .50
5. Make sure the total is EXACT - verify your math

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
  availableItems: string[]
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
    striping: 'Parking Space Striping',
    sealing: 'Sealcoating Application',
    paving: 'Asphalt Paving',
  }

  lineItems.push({
    description: primaryDescriptions[primaryService] || availableItems[0],
    amount_cents: mainServiceAmount,
  })
  remaining -= mainServiceAmount

  // Remove used description
  const usedDescriptions = new Set([primaryDescriptions[primaryService] || availableItems[0]])

  // Add remaining items
  for (let i = 1; i < numItems - 1 && remaining > 500; i++) {
    // Get a random unused description
    const availableUnused = availableItems.filter(d => !usedDescriptions.has(d))
    if (availableUnused.length === 0) break

    const description = availableUnused[Math.floor(Math.random() * availableUnused.length)]
    usedDescriptions.add(description)

    // Random percentage of remaining (20-40%)
    const percent = 0.2 + Math.random() * 0.2
    const amount = Math.round(remaining * percent / 100) * 100

    lineItems.push({ description, amount_cents: amount })
    remaining -= amount
  }

  // Last item gets the remainder
  if (remaining > 0) {
    const availableUnused = availableItems.filter(d => !usedDescriptions.has(d))
    const description = availableUnused.length > 0
      ? availableUnused[Math.floor(Math.random() * availableUnused.length)]
      : 'Additional Services'

    lineItems.push({ description, amount_cents: remaining })
  }

  return lineItems
}
