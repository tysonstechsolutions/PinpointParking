import { NextResponse } from 'next/server'
import { config } from '@/config/config'
import { quoteSchema, sanitizePhone, sanitizeName, sanitizeAddress, formatZodError } from '@/lib/schemas'
import { getSupabaseUrl, getSupabaseKey } from '@/lib/supabase'

// ============================================
// PAVING QUOTE API - Database + SMS
// ============================================

const getSupabaseConfig = () => ({
  url: getSupabaseUrl(),
  key: getSupabaseKey(true), // Use service key for server-side operations
})

// ============================================
// FIND OR CREATE CUSTOMER
// ============================================
async function findOrCreateCustomer({
  name,
  phone,
  email,
  address
}: {
  name: string
  phone: string
  email?: string
  address?: string
}) {
  const { url: supabaseUrl, key: supabaseKey } = getSupabaseConfig()

  if (!name || !phone || !supabaseUrl || !supabaseKey) {
    console.log('Customer creation skipped - missing data or config:', {
      hasName: !!name,
      hasPhone: !!phone,
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey
    })
    return null
  }

  const cleanPhone = phone.replace(/\D/g, '')

  // Try to find existing customer by phone
  const conditions: string[] = []
  if (cleanPhone.length >= 10) {
    conditions.push(`phone.ilike.%${cleanPhone.slice(-10)}%`)
  }
  if (email) {
    conditions.push(`email.ilike.${email}`)
  }

  if (conditions.length > 0) {
    try {
      const searchResponse = await fetch(
        `${supabaseUrl}/rest/v1/customers?or=(${conditions.join(',')})&limit=1`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        }
      )

      if (searchResponse.ok) {
        const existing = await searchResponse.json()
        if (existing.length > 0) {
          // Update existing customer's job count
          await fetch(
            `${supabaseUrl}/rest/v1/customers?id=eq.${existing[0].id}`,
            {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
              },
              body: JSON.stringify({
                total_jobs: (existing[0].total_jobs || 0) + 1,
                last_job_date: new Date().toISOString().split('T')[0],
                updated_at: new Date().toISOString(),
              }),
            }
          )
          return existing[0]
        }
      }
    } catch (e) {
      console.error('Customer search error:', e)
    }
  }

  // Create new customer
  try {
    const createResponse = await fetch(
      `${supabaseUrl}/rest/v1/customers`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          name,
          phone,
          email: email || null,
          address: address || null,
          total_jobs: 1,
          last_job_date: new Date().toISOString().split('T')[0],
          source: 'chatbot',
        }),
      }
    )

    if (createResponse.ok) {
      const [created] = await createResponse.json()
      return created
    }
  } catch (e) {
    console.error('Customer create error:', e)
  }

  return null
}

// ============================================
// SAVE JOB TO DATABASE
// ============================================
async function saveJobToDatabase(jobData: Record<string, unknown>) {
  const { url: supabaseUrl, key: supabaseKey } = getSupabaseConfig()

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase not configured - job not saved. URL:', !!supabaseUrl, 'Key:', !!supabaseKey)
    return null
  }

  console.log('Saving job to database:', { ...jobData, customer_phone: '[REDACTED]' })

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(jobData),
    })

    if (response.ok) {
      const result = await response.json()
      return result[0]
    } else {
      const error = await response.text()
      console.error('Job save error:', error)
    }
  } catch (error) {
    console.error('Job save error:', error)
  }

  return null
}

// ============================================
// GENERATE INVOICE NUMBER
// ============================================
async function generateInvoiceNumber(): Promise<string> {
  const { url: supabaseUrl, key: supabaseKey } = getSupabaseConfig()

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/rpc/generate_invoice_number`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
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
// CREATE DRAFT INVOICE
// ============================================
async function createDraftInvoice(job: Record<string, unknown>, customer: Record<string, unknown> | null) {
  const { url: supabaseUrl, key: supabaseKey } = getSupabaseConfig()

  if (!supabaseUrl || !supabaseKey) {
    console.log('Supabase not configured - invoice not created')
    return null
  }

  try {
    const invoiceNumber = await generateInvoiceNumber()
    const serviceName = serviceLabels[job.job_type as string]?.replace(/[^\w\s]/g, '').trim() || job.job_type
    const estimateLow = job.quote_cents as number || 0
    const estimateHigh = job.quote_cents as number || 0

    // Create line item for the service
    const lineItems = [
      {
        description: `${serviceName} - ${job.square_feet?.toLocaleString() || '?'} sq ft`,
        quantity: 1,
        unit: 'job',
        unit_price_cents: estimateLow,
        total_cents: estimateLow,
      }
    ]

    // Calculate due date (15 days from now)
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 15)

    const invoiceData = {
      invoice_number: invoiceNumber,
      job_id: job.id,
      customer_id: customer?.id || null,
      customer_name: job.customer_name,
      customer_phone: job.customer_phone,
      customer_email: job.customer_email || null,
      customer_address: customer?.address || null,
      service_address: job.service_address,
      service_description: `${serviceName} service`,
      job_type: job.job_type,
      square_feet: job.square_feet,
      scheduled_date: job.scheduled_date,
      line_items: JSON.stringify(lineItems),
      subtotal_cents: estimateLow,
      tax_cents: 0,
      discount_cents: 0,
      total_cents: estimateLow,
      amount_paid_cents: 0,
      due_date: dueDate.toISOString().split('T')[0],
      status: 'draft',
      notes: `Estimate range: $${(estimateLow / 100).toLocaleString()} - $${(estimateHigh / 100).toLocaleString()}`,
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(invoiceData),
    })

    if (response.ok) {
      const [invoice] = await response.json()

      // Link invoice to job
      await fetch(`${supabaseUrl}/rest/v1/jobs?id=eq.${job.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          invoice_id: invoice.id,
        }),
      })

      console.log(`Draft invoice created: ${invoiceNumber}`)
      return invoice
    } else {
      const error = await response.text()
      console.error('Invoice creation error:', error)
    }
  } catch (error) {
    console.error('Invoice creation error:', error)
  }

  return null
}

// ============================================
// SEND SMS NOTIFICATION
// ============================================
async function sendTwilioSMS({ to, message }: { to: string; message: string }) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_PHONE_NUMBER

  if (!accountSid || !authToken || !from) {
    console.log('Twilio not configured - SMS not sent')
    return null
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        },
        body: new URLSearchParams({ To: to, From: from, Body: message }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('Twilio error:', error)
      return null
    }

    return response.json()
  } catch (error) {
    console.error('SMS send error:', error)
    return null
  }
}

// ============================================
// SERVICE NAME LOOKUP
// ============================================
const serviceLabels: Record<string, string> = {
  sealcoating: '🛡️ Sealcoating',
  paving: '🚧 Asphalt Paving',
  linestriping: '🅿️ Line Striping',
}

const projectLabels: Record<string, string> = {
  'driveway': '🏠 Driveway',
  'parking-lot': '🅿️ Parking Lot',
  'church': '⛪ Church',
  'apartment': '🏢 Apartment',
  'retail': '🏪 Retail',
  'industrial': '🏭 Industrial',
}

// ============================================
// MAIN API HANDLER
// ============================================
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate input with Zod schema
    const parseResult = quoteSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: formatZodError(parseResult.error) },
        { status: 400 }
      )
    }

    const validatedData = parseResult.data

    // Sanitize inputs
    const serviceType = validatedData.serviceType
    const projectType = validatedData.projectType
    const squareFootage = validatedData.squareFootage
    const condition = validatedData.condition
    const address = validatedData.address ? sanitizeAddress(validatedData.address) : null
    const customerName = sanitizeName(validatedData.customerName)
    const customerPhone = sanitizePhone(validatedData.customerPhone)
    const customerEmail = validatedData.customerEmail
    const estimateLow = validatedData.estimateLow
    const estimateHigh = validatedData.estimateHigh
    const preferredDate = validatedData.preferredDate
    const addOns = validatedData.addOns
    const notes = validatedData.notes

    // 1. Find or create customer
    const customer = await findOrCreateCustomer({
      name: customerName,
      phone: customerPhone,
      email: customerEmail || undefined,
      address: address || undefined,
    })

    // 2. Save job to database
    const jobRecord = {
      customer_id: customer?.id || null,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail || null,
      service_address: address || null,
      job_type: serviceType,
      project_type: projectType || null,
      square_feet: squareFootage || null,
      condition: condition || null,
      quote_cents: estimateLow ? Math.round(estimateLow * 100) : null,
      scheduled_date: preferredDate ? new Date(preferredDate).toISOString().split('T')[0] : null,
      notes: notes || null,
      internal_notes: `Chatbot estimate: $${estimateLow?.toLocaleString() || '?'} - $${estimateHigh?.toLocaleString() || '?'}`,
      status: 'quote',
      payment_status: 'pending',
    }

    const savedJob = await saveJobToDatabase(jobRecord)

    // 3. Create draft invoice
    let savedInvoice = null
    if (savedJob) {
      savedInvoice = await createDraftInvoice(savedJob, customer)
    }

    // 3. Build SMS message
    const serviceName = serviceLabels[serviceType] || serviceType
    const projectName = projectType ? (projectLabels[projectType] || projectType) : ''

    let smsMessage = `🚧 NEW PAVING LEAD!\n\n`
    smsMessage += `${serviceName}\n`
    if (projectName) smsMessage += `${projectName}\n`
    smsMessage += `📐 ${squareFootage?.toLocaleString() || '?'} sq ft\n`
    if (condition) smsMessage += `Condition: ${condition}\n`
    smsMessage += `\n📍 ${address || 'No address'}\n`

    if (estimateLow && estimateHigh) {
      smsMessage += `\n💰 Est: $${estimateLow.toLocaleString()}-$${estimateHigh.toLocaleString()}\n`
    }

    if (preferredDate) {
      const date = new Date(preferredDate)
      smsMessage += `📅 ${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}\n`
    }

    smsMessage += `\n👤 ${customerName}\n`
    smsMessage += `📞 ${customerPhone}\n`
    if (customerEmail) smsMessage += `✉️ ${customerEmail}\n`

    // Add-ons
    if (addOns && typeof addOns === 'object') {
      const addonList: string[] = []
      Object.entries(addOns).forEach(([key, count]) => {
        if (typeof count === 'number' && count > 0) {
          const addon = config.addOns.find(a => a.id === key)
          if (addon) addonList.push(`${addon.item} x${count}`)
        }
      })
      if (addonList.length > 0) {
        smsMessage += `\n🔧 Add-ons: ${addonList.join(', ')}\n`
      }
    }

    if (notes) smsMessage += `\n📝 ${notes}\n`
    smsMessage += `\n🤖 Via Chatbot`
    if (savedJob?.id) smsMessage += ` - Job #${savedJob.id}`
    if (savedInvoice?.invoice_number) smsMessage += `\n📄 Invoice: ${savedInvoice.invoice_number} (Draft)`

    // 4. Send SMS to owner
    const ownerPhone = process.env.OWNER_PHONE
    if (ownerPhone && config.notifications.twilio.enabled) {
      await sendTwilioSMS({ to: ownerPhone, message: smsMessage })
      console.log('SMS notification sent')
    }

    // 5. Return success
    return NextResponse.json({
      success: true,
      message: 'Quote submitted successfully',
      jobId: savedJob?.id || null,
      invoiceId: savedInvoice?.id || null,
      invoiceNumber: savedInvoice?.invoice_number || null,
      customerId: customer?.id || null,
    })

  } catch (error) {
    console.error('Quote API error:', error)
    // Return more details in development
    const errorMessage = error instanceof Error ? error.message : 'Failed to process quote'
    return NextResponse.json(
      { success: false, error: errorMessage, details: String(error) },
      { status: 500 }
    )
  }
}
