import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY

export const dynamic = 'force-dynamic'

const INVOICE_PROMPT = `CAREFULLY analyze this invoice/receipt data and extract ALL information with high accuracy. Read every number, word, and detail precisely.

Return a JSON object with this exact structure:

{
  "invoice_type": "vendor_expense" or "customer_record",
  "from": {
    "name": "Company/person sending the invoice",
    "address": "Full address if visible",
    "phone": "Phone number if visible",
    "email": "Email if visible"
  },
  "to": {
    "name": "Company/person receiving the invoice (being billed)",
    "address": "Full address if visible",
    "phone": "Phone number if visible",
    "email": "Email if visible"
  },
  "invoice_number": "Invoice number/ID",
  "invoice_date": "YYYY-MM-DD format",
  "due_date": "Due date as shown on invoice",
  "payment_terms": "Payment terms (Net 30, Due on Receipt, etc.)",
  "line_items": [
    {
      "description": "Full item/service description including quantities and units",
      "quantity": 1,
      "unit": "tons/gallons/each/sqft",
      "unit_price_cents": 10000,
      "total_cents": 10000
    }
  ],
  "subtotal_cents": 10000,
  "tax_cents": 0,
  "fees_cents": 0,
  "discount_cents": 0,
  "total_cents": 10000,
  "expense_category": "materials" or "fuel" or "equipment" or "labor" or "insurance" or "permits" or "other",
  "notes": "Any additional notes, weight info, reference numbers, or important details",
  "confidence": 0.95
}

CRITICAL INSTRUCTIONS - READ CAREFULLY:
- ACCURACY IS PARAMOUNT: Double-check ALL numbers including phone numbers, quantities, and dollar amounts
- READ EVERY DIGIT EXACTLY: Do not confuse similar digits (1/7, 4/8, 5/6, 3/8). Read each digit carefully!
- PHONE NUMBERS: Read each digit precisely. Verify every digit!
- READ DOLLAR AMOUNTS EXACTLY: $525.00 = 52500 cents, $83.36 = 8336 cents. NEVER drop digits!
- VERIFY TOTALS: The total should match what's shown on the invoice.
- All monetary amounts must be in cents (multiply dollars by 100). Example: $525.00 = 52500 cents
- DATE FORMAT: Convert dates to YYYY-MM-DD. Example: 1/4/2026 becomes 2026-01-04

INVOICE TYPE DETECTION:
- If "Pinpoint Parking" appears in the FROM/sender section, this is a "customer_record" (invoice TO a customer)
- If "Pinpoint Parking" appears in the TO/recipient/billing section, this is a "vendor_expense" (bill FROM a vendor)
- Default to "vendor_expense" if unclear

EXPENSE CATEGORY DETECTION (for vendor_expense):
- "materials": Asphalt, sealcoat material, aggregate, crack filler, paint, supplies from hardware stores
- "fuel": Gas stations, diesel, fleet fueling
- "equipment": Equipment purchases, rentals, parts, repairs, maintenance
- "labor": Subcontractor invoices, temp workers
- "insurance": Insurance premiums, bonds
- "permits": City/county permits, licenses
- "other": Anything else

Set confidence between 0 and 1 based on data clarity and your certainty.
If a field is not visible or unclear, use null.

Return ONLY the JSON object, no other text.`

async function updateStatus(id: number, status: string) {
  await fetch(`${SUPABASE_URL}/rest/v1/documents?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY!,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    },
    body: JSON.stringify({ parse_status: status }),
  })
}

interface CustomerData {
  name?: string
  address?: string
  phone?: string
  email?: string
}

async function findOrCreateCustomer(data: CustomerData, isVendor = false) {
  if (!data.name) return null

  const phone = data.phone?.replace(/\D/g, '') || ''
  const conditions = []
  if (phone.length >= 10) conditions.push(`phone.ilike.%${phone.slice(-10)}%`)
  if (data.email) conditions.push(`email.ilike.${data.email}`)
  conditions.push(`name.ilike.${encodeURIComponent(data.name)}`)

  const searchRes = await fetch(`${SUPABASE_URL}/rest/v1/customers?or=(${conditions.join(',')})&limit=1`, {
    headers: { 'apikey': SUPABASE_KEY!, 'Authorization': `Bearer ${SUPABASE_KEY}` },
  })

  const existing = await searchRes.json()
  if (existing.length > 0) return existing[0]

  const createRes = await fetch(`${SUPABASE_URL}/rest/v1/customers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY!,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({
      name: data.name,
      phone: data.phone,
      email: data.email,
      address: data.address,
      is_business: true,
      notes: isVendor ? 'Vendor - auto-created from AI' : 'Auto-created from AI parsing',
    }),
  })

  const created = await createRes.json()
  return created[0]
}

export async function POST(request: Request) {
  try {
    const { document_id } = await request.json()

    if (!document_id || !ANTHROPIC_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
      return NextResponse.json({ error: 'Missing required configuration' }, { status: 400 })
    }

    // 1. Get document
    const docRes = await fetch(`${SUPABASE_URL}/rest/v1/documents?id=eq.${document_id}`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
    })
    const docs = await docRes.json()
    if (!docs.length) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const doc = docs[0]

    // Update status to parsing
    await updateStatus(document_id, 'parsing')

    // 2. Get file from storage
    const fileRes = await fetch(`${SUPABASE_URL}/storage/v1/object/documents/${doc.storage_path}`, {
      headers: { 'Authorization': `Bearer ${SUPABASE_KEY}` },
    })

    if (!fileRes.ok) {
      await updateStatus(document_id, 'failed')
      return NextResponse.json({ error: 'File not found in storage' }, { status: 500 })
    }

    const buffer = await fileRes.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')

    // 3. Call Claude Vision API
    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: doc.file_type || 'image/jpeg',
                data: base64,
              },
            },
            { type: 'text', text: INVOICE_PROMPT },
          ],
        }],
      }),
    })

    if (!aiRes.ok) {
      await updateStatus(document_id, 'failed')
      const error = await aiRes.text()
      console.error('Claude API error:', error)
      return NextResponse.json({ error: 'AI analysis failed' }, { status: 500 })
    }

    const aiResult = await aiRes.json()
    let text = aiResult.content[0]?.text || ''

    // 4. Parse JSON response
    let data
    try {
      // Extract JSON from markdown code blocks if present
      if (text.includes('```json')) {
        text = text.split('```json')[1].split('```')[0]
      } else if (text.includes('```')) {
        text = text.split('```')[1].split('```')[0]
      }
      data = JSON.parse(text.trim())
    } catch {
      await updateStatus(document_id, 'failed')
      console.error('JSON parse error:', text)
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
    }

    // 5. Find or create customer/vendor
    let customer = null
    if (data.invoice_type === 'customer_record' && data.to?.name) {
      customer = await findOrCreateCustomer(data.to, false)
    } else if (data.from?.name) {
      customer = await findOrCreateCustomer(data.from, true)
    }

    // 6. Save parsed invoice data
    const parsed = {
      document_id: parseInt(document_id),
      customer_id: customer?.id || null,
      invoice_type: data.invoice_type || 'vendor_expense',
      from_name: data.from?.name,
      from_address: data.from?.address,
      from_phone: data.from?.phone,
      from_email: data.from?.email,
      to_name: data.to?.name,
      to_address: data.to?.address,
      to_phone: data.to?.phone,
      to_email: data.to?.email,
      invoice_number: data.invoice_number,
      invoice_date: data.invoice_date,
      due_date: data.due_date,
      payment_terms: data.payment_terms,
      line_items: JSON.stringify(data.line_items || []),
      subtotal_cents: data.subtotal_cents,
      tax_cents: data.tax_cents || 0,
      total_cents: data.total_cents,
      expense_category: data.expense_category || 'other',
      tax_year: data.invoice_date ? new Date(data.invoice_date).getFullYear() : new Date().getFullYear(),
      status: data.confidence >= 0.95 ? 'confirmed' : 'pending_review',
      confidence_score: data.confidence || 0.8,
      raw_text: data.notes,
      confirmed_at: data.confidence >= 0.95 ? new Date().toISOString() : null,
    }

    const saveRes = await fetch(`${SUPABASE_URL}/rest/v1/parsed_invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(parsed),
    })

    const savedParsed = await saveRes.json()

    // 7. Update document with parsed data and smart title
    const smartTitle = data.invoice_number
      ? `${data.from?.name || 'Invoice'} #${data.invoice_number}`
      : data.from?.name && data.invoice_date
        ? `${data.from.name} - ${data.invoice_date}`
        : data.from?.name
          ? `${data.from.name}`
          : doc.title

    await fetch(`${SUPABASE_URL}/rest/v1/documents?id=eq.${document_id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify({
        parse_status: 'parsed',
        parsed_invoice_id: savedParsed[0]?.id,
        customer_id: customer?.id,
        amount_cents: data.total_cents,
        title: smartTitle,
        vendor: data.from?.name || null,
        document_date: data.invoice_date || null,
        description: data.notes || data.line_items?.[0]?.description || null,
      }),
    })

    // 8. Auto-create expense if vendor invoice with high confidence
    if (data.invoice_type === 'vendor_expense' && data.confidence >= 0.95 && data.total_cents) {
      await fetch(`${SUPABASE_URL}/rest/v1/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({
          category: data.expense_category || 'other',
          vendor: data.from?.name,
          description: data.line_items?.[0]?.description || data.from?.name || 'Expense from invoice',
          amount_cents: data.total_cents,
          expense_date: data.invoice_date || new Date().toISOString().split('T')[0],
          document_id: parseInt(document_id),
          is_tax_deductible: true,
        }),
      })
    }

    return NextResponse.json({
      success: true,
      auto_confirmed: data.confidence >= 0.95,
      parsed_invoice: { ...savedParsed[0], line_items: data.line_items },
      customer: customer ? { id: customer.id, name: customer.name } : null,
    })

  } catch (error) {
    console.error('Parse error:', error)
    return NextResponse.json({ error: 'Parse failed' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const docId = searchParams.get('document_id')

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const query = docId ? `document_id=eq.${docId}` : 'order=parsed_at.desc&limit=50'

  const res = await fetch(`${SUPABASE_URL}/rest/v1/parsed_invoices?${query}`, {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
  })

  const data = await res.json()
  return NextResponse.json(data.map((d: { line_items: string | unknown[] }) => ({
    ...d,
    line_items: typeof d.line_items === 'string' ? JSON.parse(d.line_items) : d.line_items,
  })))
}
