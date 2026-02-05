// ============================================
// INVOICE API ROUTES
// ============================================

import { NextResponse } from 'next/server'
import { config } from '@/config/config'

const supabaseUrl = config.supabase.url
const getSupabaseKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY || config.supabase.anonKey

// ============================================
// GENERATE INVOICE NUMBER
// ============================================
async function generateInvoiceNumber(): Promise<string> {
  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/rpc/generate_invoice_number`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': getSupabaseKey(),
          'Authorization': `Bearer ${getSupabaseKey()}`,
        },
        body: JSON.stringify({}),
      }
    )

    if (response.ok) {
      return await response.json()
    }
  } catch (e) {
    console.error('Error generating invoice number:', e)
  }

  // Fallback
  const now = new Date()
  const year = now.getFullYear()
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
  return `INV-${year}-${random}`
}

// ============================================
// FIND OR CREATE CUSTOMER
// ============================================
async function findOrCreateCustomer(customerData: {
  name: string
  phone?: string
  email?: string
  address?: string
}): Promise<number | null> {
  const { name, phone, email, address } = customerData

  // First, try to find existing customer by phone or email
  let existingCustomer = null

  if (phone) {
    const phoneResponse = await fetch(
      `${supabaseUrl}/rest/v1/customers?phone=eq.${encodeURIComponent(phone)}&limit=1`,
      {
        headers: {
          'apikey': getSupabaseKey(),
          'Authorization': `Bearer ${getSupabaseKey()}`,
        },
      }
    )
    if (phoneResponse.ok) {
      const data = await phoneResponse.json()
      if (data.length > 0) {
        existingCustomer = data[0]
      }
    }
  }

  if (!existingCustomer && email) {
    const emailResponse = await fetch(
      `${supabaseUrl}/rest/v1/customers?email=eq.${encodeURIComponent(email)}&limit=1`,
      {
        headers: {
          'apikey': getSupabaseKey(),
          'Authorization': `Bearer ${getSupabaseKey()}`,
        },
      }
    )
    if (emailResponse.ok) {
      const data = await emailResponse.json()
      if (data.length > 0) {
        existingCustomer = data[0]
      }
    }
  }

  // If found, return existing customer ID
  if (existingCustomer) {
    console.log(`Found existing customer: ${existingCustomer.name} (ID: ${existingCustomer.id})`)
    return existingCustomer.id
  }

  // Create new customer
  const newCustomerData = {
    name,
    phone: phone || null,
    email: email || null,
    address: address || null,
    total_jobs: 0,
    total_spent_cents: 0,
    outstanding_balance_cents: 0,
  }

  const createResponse = await fetch(
    `${supabaseUrl}/rest/v1/customers`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': getSupabaseKey(),
        'Authorization': `Bearer ${getSupabaseKey()}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(newCustomerData),
    }
  )

  if (createResponse.ok) {
    const [newCustomer] = await createResponse.json()
    console.log(`Created new customer: ${name} (ID: ${newCustomer.id})`)
    return newCustomer.id
  }

  console.error('Failed to create customer:', await createResponse.text())
  return null
}

// ============================================
// UPDATE CUSTOMER STATS
// ============================================
async function updateCustomerStats(customerId: number, invoiceTotalCents: number): Promise<void> {
  // Get current customer data
  const customerResponse = await fetch(
    `${supabaseUrl}/rest/v1/customers?id=eq.${customerId}`,
    {
      headers: {
        'apikey': getSupabaseKey(),
        'Authorization': `Bearer ${getSupabaseKey()}`,
      },
    }
  )

  if (!customerResponse.ok) return

  const [customer] = await customerResponse.json()
  if (!customer) return

  // Update customer stats
  const updatedData = {
    total_jobs: (customer.total_jobs || 0) + 1,
    outstanding_balance_cents: (customer.outstanding_balance_cents || 0) + invoiceTotalCents,
  }

  await fetch(
    `${supabaseUrl}/rest/v1/customers?id=eq.${customerId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': getSupabaseKey(),
        'Authorization': `Bearer ${getSupabaseKey()}`,
      },
      body: JSON.stringify(updatedData),
    }
  )

  console.log(`Updated customer ${customerId} stats: jobs=${updatedData.total_jobs}, outstanding=${updatedData.outstanding_balance_cents}`)
}

// ============================================
// CREATE INVOICE
// ============================================
export async function POST(request: Request) {
  try {
    const body = await request.json()

    let {
      customer_id,
      job_id,
      customer_name,
      customer_phone,
      customer_email,
      customer_address,
      service_address,
      service_description,
      job_type,
      square_feet,
      scheduled_date,
      completed_date,
      line_items,
      subtotal_cents,
      tax_cents = 0,
      discount_cents = 0,
      total_cents,
      due_date,
      notes,
      status = 'draft',
      sent_at,
    } = body

    if (!customer_name || !line_items || line_items.length === 0) {
      return NextResponse.json(
        { error: 'Customer name and line items are required' },
        { status: 400 }
      )
    }

    // If no customer_id provided, find or create customer
    if (!customer_id) {
      customer_id = await findOrCreateCustomer({
        name: customer_name,
        phone: customer_phone,
        email: customer_email,
        address: service_address || customer_address,
      })
    }

    // Generate invoice number
    const invoice_number = await generateInvoiceNumber()

    const finalTotalCents = total_cents || subtotal_cents

    const invoiceData = {
      invoice_number,
      customer_id,
      job_id,
      customer_name,
      customer_phone,
      customer_email,
      customer_address,
      service_address,
      service_description,
      job_type,
      square_feet,
      scheduled_date,
      completed_date,
      line_items: JSON.stringify(line_items),
      subtotal_cents,
      tax_cents,
      discount_cents,
      total_cents: finalTotalCents,
      amount_paid_cents: 0,
      due_date,
      notes,
      status,
      sent_at,
    }

    const response = await fetch(
      `${supabaseUrl}/rest/v1/invoices`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': getSupabaseKey(),
          'Authorization': `Bearer ${getSupabaseKey()}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(invoiceData),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Invoice creation error:', errorText)
      return NextResponse.json(
        { error: 'Failed to create invoice' },
        { status: 500 }
      )
    }

    const [invoice] = await response.json()

    // Update customer stats (add to outstanding balance)
    if (customer_id) {
      await updateCustomerStats(customer_id, finalTotalCents)
    }

    // If linked to a job, update the job
    if (job_id) {
      await fetch(
        `${supabaseUrl}/rest/v1/jobs?id=eq.${job_id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': getSupabaseKey(),
            'Authorization': `Bearer ${getSupabaseKey()}`,
          },
          body: JSON.stringify({
            invoice_id: invoice.id,
            invoiced_at: new Date().toISOString(),
          }),
        }
      )
    }

    console.log(`Invoice created: ${invoice_number} for customer ${customer_id}`)

    return NextResponse.json({
      success: true,
      invoice,
      invoice_number,
      customer_id,
    })

  } catch (error) {
    console.error('Invoice error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// ============================================
// GET INVOICES
// ============================================
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const invoiceNumber = searchParams.get('invoice_number')
  const customerId = searchParams.get('customer_id')
  const status = searchParams.get('status')

  try {
    let query = 'order=created_at.desc'

    if (id) {
      query = `id=eq.${id}`
    } else if (invoiceNumber) {
      query = `invoice_number=eq.${invoiceNumber}`
    } else {
      if (customerId) {
        query += `&customer_id=eq.${customerId}`
      }
      if (status) {
        query += `&status=eq.${status}`
      }
    }

    const response = await fetch(
      `${supabaseUrl}/rest/v1/invoices?${query}`,
      {
        headers: {
          'apikey': getSupabaseKey(),
          'Authorization': `Bearer ${getSupabaseKey()}`,
        },
      }
    )

    if (response.ok) {
      const data = await response.json()
      // Parse line_items JSON safely
      const invoices = data.map((inv: Record<string, unknown>) => {
        let parsedLineItems = inv.line_items
        if (typeof inv.line_items === 'string') {
          try {
            parsedLineItems = JSON.parse(inv.line_items)
          } catch {
            console.error('Failed to parse line_items for invoice:', inv.id)
            parsedLineItems = []
          }
        }
        return {
          ...inv,
          line_items: parsedLineItems || []
        }
      })
      return NextResponse.json(invoices)
    }

    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })

  } catch (error) {
    console.error('Get invoices error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
