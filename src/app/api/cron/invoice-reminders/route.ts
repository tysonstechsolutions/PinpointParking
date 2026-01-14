// ============================================
// CRON: INVOICE PAYMENT REMINDERS
// ============================================
// Run daily to send payment reminders
// Vercel cron: "0 15 * * *" (9am CST / 3pm UTC)

import { NextResponse } from 'next/server'
import { config } from '@/config/config'

const supabaseUrl = config.supabase.url
const getSupabaseKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY || config.supabase.anonKey

// Verify cron secret
function verifyCronSecret(request: Request): boolean {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.log('CRON_SECRET not set, allowing request in development')
    return true
  }

  return authHeader === `Bearer ${cronSecret}`
}

export async function GET(request: Request) {
  // Verify cron secret
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const stats = { checked: 0, upcoming: 0, due: 0, overdue: 0, sent: 0, errors: 0 }

    // Fetch all unpaid invoices
    const response = await fetch(
      `${supabaseUrl}/rest/v1/invoices?status=neq.paid&status=neq.void&status=neq.draft`,
      {
        headers: {
          'apikey': getSupabaseKey(),
          'Authorization': `Bearer ${getSupabaseKey()}`,
        },
      }
    )

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
    }

    const invoices = await response.json()
    stats.checked = invoices.length

    for (const invoice of invoices) {
      if (!invoice.due_date || !invoice.customer_phone) continue

      const dueDate = new Date(invoice.due_date)
      const daysToDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      const lastReminder = invoice.last_reminder_sent_at ? new Date(invoice.last_reminder_sent_at) : null
      const daysSinceReminder = lastReminder
        ? Math.ceil((now.getTime() - lastReminder.getTime()) / (1000 * 60 * 60 * 24))
        : Infinity

      let shouldSend = false
      let messageType = ''

      // Upcoming reminder (3 days before due)
      if (daysToDue === 3 && daysSinceReminder >= 1) {
        shouldSend = true
        messageType = 'upcoming'
        stats.upcoming++
      }
      // Due today
      else if (daysToDue === 0 && daysSinceReminder >= 1) {
        shouldSend = true
        messageType = 'due_today'
        stats.due++
      }
      // Overdue reminders
      else if (daysToDue < 0) {
        const daysOverdue = Math.abs(daysToDue)
        stats.overdue++

        // Send at 1, 3, 7, 14 days overdue, then weekly
        if (
          (daysOverdue === 1 && daysSinceReminder >= 1) ||
          (daysOverdue === 3 && daysSinceReminder >= 2) ||
          (daysOverdue === 7 && daysSinceReminder >= 3) ||
          (daysOverdue === 14 && daysSinceReminder >= 5) ||
          (daysOverdue > 14 && daysSinceReminder >= 7)
        ) {
          shouldSend = true
          messageType = 'overdue'
        }
      }

      if (shouldSend) {
        try {
          // Send reminder via our API
          const sendResponse = await fetch(`${config.websiteUrl}/api/invoices/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ invoice_id: invoice.id, reminder: true }),
          })

          if (sendResponse.ok) {
            stats.sent++
            console.log(`Sent ${messageType} reminder for invoice ${invoice.invoice_number}`)
          } else {
            stats.errors++
          }
        } catch {
          stats.errors++
        }
      }
    }

    // Notify owner if there are overdue invoices
    const ownerPhone = process.env.OWNER_PHONE
    const twilioSid = process.env.TWILIO_ACCOUNT_SID
    const twilioAuth = process.env.TWILIO_AUTH_TOKEN
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER

    if (stats.overdue > 0 && ownerPhone && twilioSid && twilioAuth && twilioPhone) {
      // Get top 5 overdue invoices
      const overdueResponse = await fetch(
        `${supabaseUrl}/rest/v1/invoices?status=eq.overdue&order=due_date.asc&limit=5`,
        {
          headers: {
            'apikey': getSupabaseKey(),
            'Authorization': `Bearer ${getSupabaseKey()}`,
          },
        }
      )

      if (overdueResponse.ok) {
        const overdueInvoices = await overdueResponse.json()
        const totalOwed = overdueInvoices.reduce((sum: number, inv: { balance_due_cents: number }) => sum + (inv.balance_due_cents || 0), 0)

        const ownerMessage = `📋 INVOICE REMINDER SUMMARY

${stats.overdue} overdue invoices
${stats.due} due today
${stats.upcoming} coming due

Top overdue: $${(totalOwed / 100).toLocaleString()}

${overdueInvoices.slice(0, 3).map((inv: { customer_name: string, balance_due_cents: number, due_date: string }) =>
  `• ${inv.customer_name}: $${((inv.balance_due_cents || 0) / 100).toLocaleString()}`
).join('\n')}

View all: ${config.websiteUrl}/admin/invoices`

        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`
        const formData = new URLSearchParams()
        formData.append('To', ownerPhone)
        formData.append('From', twilioPhone)
        formData.append('Body', ownerMessage)

        await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString(),
        }).catch(() => {})
      }
    }

    console.log(`Invoice reminder cron completed:`, stats)

    return NextResponse.json({
      success: true,
      date: today,
      stats,
    })

  } catch (error) {
    console.error('Invoice reminder cron error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
