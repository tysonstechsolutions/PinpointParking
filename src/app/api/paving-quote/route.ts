import { NextResponse } from 'next/server'
import { config } from '@/config/config'

// ============================================
// PAVING QUOTE API - Database + SMS
// ============================================

const supabaseUrl = config.supabase.url
const getSupabaseKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY || config.supabase.anonKey

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
  if (!name || !phone || !supabaseUrl || !getSupabaseKey()) return null

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
            'apikey': getSupabaseKey(),
            'Authorization': `Bearer ${getSupabaseKey()}`,
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
                'apikey': getSupabaseKey(),
                'Authorization': `Bearer ${getSupabaseKey()}`,
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
          'apikey': getSupabaseKey(),
          'Authorization': `Bearer ${getSupabaseKey()}`,
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
// SAVE QUOTE TO DATABASE
// ============================================
async function saveQuoteToDatabase(quoteData: Record<string, unknown>) {
  if (!supabaseUrl || !getSupabaseKey()) {
    console.log('Supabase not configured - quote not saved')
    return null
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/quotes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': getSupabaseKey(),
        'Authorization': `Bearer ${getSupabaseKey()}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(quoteData),
    })

    if (response.ok) {
      const result = await response.json()
      return result[0]
    } else {
      const error = await response.text()
      console.error('Database save error:', error)
    }
  } catch (error) {
    console.error('Database save error:', error)
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

    const {
      serviceType,
      projectType,
      squareFootage,
      condition,
      address,
      customerName,
      customerPhone,
      customerEmail,
      estimateLow,
      estimateHigh,
      preferredDate,
      addOns,
      notes,
      sessionId,
    } = body

    // Validate required fields
    if (!serviceType || !customerName || !customerPhone) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 1. Find or create customer
    const customer = await findOrCreateCustomer({
      name: customerName,
      phone: customerPhone,
      email: customerEmail,
      address: address,
    })

    // 2. Save quote to database
    const quoteRecord = {
      customer_id: customer?.id || null,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail || null,
      address: address || null,
      service_type: serviceType,
      project_type: projectType || null,
      square_footage: squareFootage || null,
      condition: condition || null,
      estimate_low: estimateLow || null,
      estimate_high: estimateHigh || null,
      preferred_date: preferredDate ? new Date(preferredDate).toISOString().split('T')[0] : null,
      add_ons: addOns || {},
      notes: notes || null,
      session_id: sessionId || null,
      status: 'new',
      source: 'chatbot',
    }

    const savedQuote = await saveQuoteToDatabase(quoteRecord)

    // 3. Build SMS message
    const serviceName = serviceLabels[serviceType] || serviceType
    const projectName = projectLabels[projectType] || projectType || ''

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
    if (savedQuote?.id) smsMessage += ` #${savedQuote.id}`

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
      quoteId: savedQuote?.id || null,
      customerId: customer?.id || null,
    })

  } catch (error) {
    console.error('Quote API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process quote' },
      { status: 500 }
    )
  }
}
