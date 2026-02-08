import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

// ============================================
// AI LINE ITEM GENERATION API
// Generates professional federal-project-grade
// line items for asphalt/pavement services
// ============================================

const anthropic = new Anthropic()

// Pricing constraints for different item types
const PRICING_RULES = {
  // Pavement Marking - Striping
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

// Equipment & Material Specs
const EQUIPMENT_SPECS = {
  striper: 'Graco LineLazer 3400',
  paintType: 'waterborne acrylic traffic paint (TTP-1952E Type I)',
  paintApplication: '15 wet mils DFT',
  beadType: 'Type I retroreflective glass beads (AASHTO M247)',
  beadRate: '6 lbs per gallon',
  crackSealant: 'hot-applied rubberized asphalt (ASTM D6690 Type II)',
  sealcoatMaterial: 'coal tar emulsion sealer (ASTM D5727)',
  sealcoatRate: '0.10-0.15 gal/sq yd',
}

// Service-specific line item templates with professional descriptions
const serviceTemplates = {
  striping: [
    { description: 'Mobilization & Equipment Setup - Graco LineLazer 3400, Traffic Paint & Glass Beads', unitPrice: 150 },
    { description: 'Traffic Control & Safety Setup (cones, barricades, signage per MUTCD)', unitPrice: 75 },
    { description: 'Surface Preparation - Power Sweeping & Debris Removal', unitPrice: 75 },
    { description: 'Layout & Staking - Chalk Line Layout, Measurement & Alignment per Plan', unitPrice: 100 },
    { description: '4" Waterborne Pavement Marking - Parking Stall Delineation (TTP-1952E, 15 mil DFT, w/ Type I Glass Beads)', unitPrice: PRICING_RULES.parking_space.typical },
    { description: 'ADA-Compliant Accessible Space Marking w/ ISA Symbol & Access Aisle (per MUTCD/ADA Standards)', unitPrice: PRICING_RULES.handicap_space.typical },
    { description: 'Fire Lane Curb & Pavement Marking (red curb paint, white stencil per IFC 503.3)', unitPrice: 50 },
    { description: 'Directional Arrow Pavement Legend (per MUTCD Fig. 3B-21, 8\' standard)', unitPrice: PRICING_RULES.arrow.typical },
    { description: '24" Transverse Stop Bar Marking (retroreflective white, MUTCD 3B.16)', unitPrice: PRICING_RULES.stop_bar.typical },
    { description: 'Continental Crosswalk Marking (24" bars, 12" spacing, retroreflective white)', unitPrice: PRICING_RULES.crosswalk.typical },
    { description: 'Cross-Hatch/Loading Zone Marking (diagonal 4" lines, 36" O.C.)', unitPrice: PRICING_RULES.hash_zone.typical },
    { description: 'Curb Paint Application (safety yellow/red per code)', unitPrice: 30 },
    { description: 'Pavement Legend/Stencil Marking (per MUTCD standards)', unitPrice: PRICING_RULES.stencil.typical },
    { description: 'Type I Retroreflective Glass Bead Application (AASHTO M247, 6 lbs/gal)', unitPrice: 50 },
    { description: 'Waterborne Traffic Paint Material (TTP-1952E, white & yellow)', unitPrice: 50 },
    { description: 'Labor - 2-Man Crew, Pavement Marking Operations', unitPrice: 85 },
    { description: 'Cleanup & Demobilization', unitPrice: 50 },
  ],
  sealing: [
    { description: 'Mobilization & Equipment Setup - Sealcoat Sprayer, Squeegee Crew', unitPrice: 200 },
    { description: 'Traffic Control & Safety Setup (cones, barricades, signage per MUTCD)', unitPrice: 75 },
    { description: 'Surface Preparation - Power Sweeping, Oil Spot Treatment & Debris Removal', unitPrice: 100 },
    { description: 'Hot-Applied Rubberized Crack Sealant (ASTM D6690 Type II, routed & sealed)', unitPrice: 125 },
    { description: 'Coal Tar Emulsion Sealcoat Application - 1st Coat (ASTM D5727, 0.12 gal/SY)', unitPrice: 200 },
    { description: 'Coal Tar Emulsion Sealcoat Application - 2nd Coat (ASTM D5727, 0.10 gal/SY)', unitPrice: 175 },
    { description: 'Edge Sealing & Detail Work (curbs, catch basins, utility covers)', unitPrice: 50 },
    { description: 'Sealcoat Material - Coal Tar Emulsion (ASTM D5727)', unitPrice: 100 },
    { description: 'Silica Sand Aggregate Additive (3-5 lbs/gal for traction)', unitPrice: 40 },
    { description: 'Barricade & Cure Time Management (24-48 hr cure)', unitPrice: 50 },
    { description: 'Labor - Sealcoat Application Crew', unitPrice: 85 },
    { description: 'Cleanup & Demobilization', unitPrice: 50 },
  ],
  paving: [
    { description: 'Mobilization & Equipment Setup - Paving Crew & Equipment', unitPrice: 500 },
    { description: 'Traffic Control & Safety Setup (cones, barricades, signage per MUTCD)', unitPrice: 150 },
    { description: 'Existing Pavement Sawcutting & Removal (full-depth)', unitPrice: 200 },
    { description: 'Subgrade Preparation & Compaction (95% Proctor density)', unitPrice: 200 },
    { description: 'Aggregate Base Course Installation (6" compacted, AASHTO #57)', unitPrice: 175 },
    { description: 'Tack Coat Application (SS-1h emulsified asphalt, 0.05 gal/SY)', unitPrice: 75 },
    { description: 'Hot-Mix Asphalt Overlay (2" compacted depth, Superpave PG 64-22)', unitPrice: 400 },
    { description: 'Asphalt Compaction (steel drum & pneumatic rollers, 92-96% density)', unitPrice: 125 },
    { description: 'Cold-Mix Pothole Repair (saw-cut, clean, fill & compact)', unitPrice: PRICING_RULES.pothole_medium.typical },
    { description: 'Asphalt Patch Repair (full-depth, 2" HMA, compacted)', unitPrice: 150 },
    { description: 'Hot-Mix Asphalt Material (Superpave PG 64-22)', unitPrice: 200 },
    { description: 'Labor - Paving Crew Operations', unitPrice: 200 },
    { description: 'Site Cleanup, Grading & Demobilization', unitPrice: 75 },
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
      const serviceNames = services.map((s: string) => {
        const names: Record<string, string> = {
          striping: 'Pavement Marking / Line Striping',
          sealing: 'Sealcoating & Crack Sealing',
          paving: 'Asphalt Paving & Repair',
        }
        return names[s] || s
      }).join(', ')

      const itemList = availableItems.map(t => `- ${t.description} (typical: $${t.unitPrice})`).join('\n')

      const prompt = `You are an expert estimator for a professional asphalt pavement marking and maintenance contractor. Generate detailed, federal-project-grade invoice line items.

COMPANY EQUIPMENT:
- Line Striper: ${EQUIPMENT_SPECS.striper}
- Paint: ${EQUIPMENT_SPECS.paintType}
- Application Rate: ${EQUIPMENT_SPECS.paintApplication}
- Glass Beads: ${EQUIPMENT_SPECS.beadType} at ${EQUIPMENT_SPECS.beadRate}
- Crack Sealant: ${EQUIPMENT_SPECS.crackSealant}
- Sealcoat Material: ${EQUIPMENT_SPECS.sealcoatMaterial} at ${EQUIPMENT_SPECS.sealcoatRate}

Services: ${serviceNames}
Total Amount: $${(totalCents / 100).toFixed(2)}
${squareFeet ? `Square Footage: ${squareFeet.toLocaleString()} sq ft` : ''}

PRICING RULES (you MUST follow these):
- ADA-compliant accessible spaces: NEVER more than $35 each
- Pavement legend/stencil markings: NEVER more than $35 each
- Crack sealing: $1.00-$1.50 per LF
- Pothole repair: $75-$150 depending on size

Available line items and typical prices:
${itemList}

Requirements:
1. Create 5-10 line items that add up EXACTLY to $${(totalCents / 100).toFixed(2)}
2. ALWAYS include these federal-standard items:
   - Mobilization & Equipment Setup (with specific equipment named)
   - Traffic Control & Safety Setup
   - Surface Preparation
   - Layout & Staking (for striping jobs)
   - The primary service work items with FULL material specifications (paint type, application rate, bead type, etc.)
   - Material line items (paint, beads, sealcoat, asphalt, etc.)
   - Labor hours as a separate item (e.g., "Labor - 2-Man Crew, X hours @ $Y/hr")
   - Cleanup & Demobilization
3. Use PROFESSIONAL descriptions with specs - reference MUTCD, ASTM, AASHTO, ADA standards where applicable
4. The main service line item should be the largest dollar amount
5. Round amounts to nearest dollar
6. Make sure the total is EXACT - verify your math
7. NEVER exceed the max pricing rules
8. Include quantities and material specs in descriptions where relevant (e.g., "approx. 5 gal paint", "Type I glass beads")

Return ONLY a JSON array with objects containing "description" and "amount_cents" (in cents, not dollars).
Example: [{"description": "Mobilization & Equipment Setup - Graco LineLazer 3400, Traffic Paint & Glass Beads", "amount_cents": 15000}]

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
          const generatedTotal = parsed.reduce((sum: number, item: { amount_cents: number }) => sum + item.amount_cents, 0)

          // If within $1 of target, adjust to be exact
          if (Math.abs(generatedTotal - totalCents) <= 100) {
            const diff = totalCents - generatedTotal
            const largestIdx = parsed.reduce((maxIdx: number, item: { amount_cents: number }, idx: number, arr: { amount_cents: number }[]) =>
              item.amount_cents > arr[maxIdx].amount_cents ? idx : maxIdx, 0)
            parsed[largestIdx].amount_cents += diff
            lineItems = parsed
          } else {
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

// Fallback algorithmic line item generation with professional descriptions
function generateAlgorithmicLineItems(
  services: string[],
  totalCents: number,
  availableItems: { description: string; unitPrice: number }[]
): { description: string; amount_cents: number }[] {
  const lineItems: { description: string; amount_cents: number }[] = []
  let remaining = totalCents

  // Always include mobilization (8-12% of total)
  const mobilizationPercent = 0.08 + Math.random() * 0.04
  const mobilizationAmount = Math.round(totalCents * mobilizationPercent / 100) * 100
  const primaryService = services[0]

  const mobilizationDescriptions: Record<string, string> = {
    striping: 'Mobilization & Equipment Setup - Graco LineLazer 3400, Traffic Paint & Glass Beads',
    sealing: 'Mobilization & Equipment Setup - Sealcoat Sprayer, Squeegee Crew',
    paving: 'Mobilization & Equipment Setup - Paving Crew & Equipment',
  }
  lineItems.push({
    description: mobilizationDescriptions[primaryService] || mobilizationDescriptions.striping,
    amount_cents: mobilizationAmount,
  })
  remaining -= mobilizationAmount

  // Traffic control (5-8%)
  const trafficControlAmount = Math.round(totalCents * (0.05 + Math.random() * 0.03) / 100) * 100
  lineItems.push({
    description: 'Traffic Control & Safety Setup (cones, barricades, signage per MUTCD)',
    amount_cents: trafficControlAmount,
  })
  remaining -= trafficControlAmount

  // Surface preparation (5-8%)
  const surfacePrepAmount = Math.round(totalCents * (0.05 + Math.random() * 0.03) / 100) * 100
  const surfacePrepDescriptions: Record<string, string> = {
    striping: 'Surface Preparation - Power Sweeping & Debris Removal',
    sealing: 'Surface Preparation - Power Sweeping, Oil Spot Treatment & Debris Removal',
    paving: 'Existing Pavement Sawcutting & Removal (full-depth)',
  }
  lineItems.push({
    description: surfacePrepDescriptions[primaryService] || surfacePrepDescriptions.striping,
    amount_cents: surfacePrepAmount,
  })
  remaining -= surfacePrepAmount

  // Main service (40-50% of total)
  const mainServicePercent = 0.40 + Math.random() * 0.10
  const mainServiceAmount = Math.round(totalCents * mainServicePercent / 100) * 100

  const primaryDescriptions: Record<string, string> = {
    striping: '4" Waterborne Pavement Marking - Parking Stall Delineation (TTP-1952E, 15 mil DFT, w/ Type I Glass Beads)',
    sealing: 'Coal Tar Emulsion Sealcoat Application (ASTM D5727, 0.12 gal/SY, 2-coat system)',
    paving: 'Hot-Mix Asphalt Overlay (2" compacted depth, Superpave PG 64-22)',
  }
  lineItems.push({
    description: primaryDescriptions[primaryService] || availableItems[0]?.description || 'Service',
    amount_cents: mainServiceAmount,
  })
  remaining -= mainServiceAmount

  // Material line item (10-15%)
  const materialAmount = Math.round(totalCents * (0.10 + Math.random() * 0.05) / 100) * 100
  const materialDescriptions: Record<string, string> = {
    striping: 'Waterborne Traffic Paint Material (TTP-1952E, white & yellow) & Type I Glass Beads (AASHTO M247)',
    sealing: 'Sealcoat Material - Coal Tar Emulsion (ASTM D5727) & Silica Sand Aggregate',
    paving: 'Hot-Mix Asphalt Material (Superpave PG 64-22)',
  }
  lineItems.push({
    description: materialDescriptions[primaryService] || materialDescriptions.striping,
    amount_cents: materialAmount,
  })
  remaining -= materialAmount

  // Labor (remaining minus cleanup)
  const cleanupAmount = Math.round(totalCents * 0.04 / 100) * 100
  const laborAmount = remaining - cleanupAmount

  const laborDescriptions: Record<string, string> = {
    striping: 'Labor - 2-Man Crew, Pavement Marking Operations',
    sealing: 'Labor - Sealcoat Application Crew',
    paving: 'Labor - Paving Crew Operations',
  }

  if (laborAmount > 0) {
    lineItems.push({
      description: laborDescriptions[primaryService] || laborDescriptions.striping,
      amount_cents: laborAmount,
    })
  }

  // Cleanup & demobilization (remainder)
  if (cleanupAmount > 0) {
    lineItems.push({
      description: 'Cleanup & Demobilization',
      amount_cents: cleanupAmount,
    })
  }

  // Verify total and adjust if needed
  const currentTotal = lineItems.reduce((sum, item) => sum + item.amount_cents, 0)
  if (currentTotal !== totalCents) {
    const diff = totalCents - currentTotal
    // Adjust the main service item (index 3)
    lineItems[3].amount_cents += diff
  }

  return lineItems
}
