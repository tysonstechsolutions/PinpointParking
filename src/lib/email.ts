// ============================================
// EMAIL AUTOMATION UTILITIES
// ============================================

import { Resend } from 'resend'
import { config } from '@/config/config'

const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

const FROM_EMAIL = process.env.FROM_EMAIL || `${config.businessName} <noreply@pinpointparking.net>`

export function isEmailConfigured(): boolean {
  return !!resendApiKey
}

// Email templates
interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
}

// Send a generic email
export async function sendEmail(data: EmailData): Promise<boolean> {
  if (!resend) {
    console.warn('Email not configured (RESEND_API_KEY missing)')
    return false
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.to,
      subject: data.subject,
      html: data.html,
      text: data.text,
    })
    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}

// Send quote confirmation email
export async function sendQuoteConfirmation(
  customerEmail: string,
  customerName: string,
  service: string,
  estimateLow: number,
  estimateHigh: number,
  scheduledDate?: string
): Promise<boolean> {
  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1a1714; color: #F5C518; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f5f5f5; }
        .estimate { background: #16a34a; color: white; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${config.businessName}</h1>
        </div>
        <div class="content">
          <h2>Thank you for your quote request, ${customerName}!</h2>
          <p>We've received your request for <strong>${service}</strong> services.</p>

          <div class="estimate">
            <p style="margin: 0; font-size: 14px;">Estimated Price Range</p>
            <p style="margin: 10px 0; font-size: 28px; font-weight: bold;">
              ${formatCurrency(estimateLow)} - ${formatCurrency(estimateHigh)}
            </p>
          </div>

          ${scheduledDate ? `<p><strong>Preferred Date:</strong> ${new Date(scheduledDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>` : ''}

          <p>We'll contact you shortly to confirm your appointment and provide a final quote.</p>

          <p>Questions? Call us at <a href="tel:${config.phoneRaw}">${config.phone}</a></p>
        </div>
        <div class="footer">
          <p>${config.businessName}</p>
          <p>${config.phone} | ${config.email}</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: customerEmail,
    subject: `Your ${service} Quote Request - ${config.businessName}`,
    html,
  })
}

// Send invoice email
export async function sendInvoiceEmail(
  customerEmail: string,
  customerName: string,
  invoiceNumber: string,
  invoiceId: number,
  totalCents: number,
  dueDate?: string
): Promise<boolean> {
  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pinpointparking.net'

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1a1714; color: #F5C518; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f5f5f5; }
        .amount { background: #252220; color: white; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
        .button { display: inline-block; padding: 15px 30px; background: #16a34a; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${config.businessName}</h1>
        </div>
        <div class="content">
          <h2>Invoice #${invoiceNumber}</h2>
          <p>Hello ${customerName},</p>
          <p>Please find your invoice attached below.</p>

          <div class="amount">
            <p style="margin: 0; font-size: 14px; color: #9C9690;">Amount Due</p>
            <p style="margin: 10px 0; font-size: 32px; font-weight: bold; color: #F5C518;">
              ${formatCurrency(totalCents)}
            </p>
            ${dueDate ? `<p style="margin: 0; font-size: 14px; color: #9C9690;">Due by ${new Date(dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>` : ''}
          </div>

          <p style="text-align: center;">
            <a href="${baseUrl}/pay/${invoiceId}" class="button">Pay Now</a>
          </p>

          <p style="margin-top: 30px;">Thank you for your business!</p>
        </div>
        <div class="footer">
          <p>${config.businessName}</p>
          <p>${config.phone} | ${config.email}</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: customerEmail,
    subject: `Invoice #${invoiceNumber} from ${config.businessName}`,
    html,
  })
}

// Send payment confirmation email
export async function sendPaymentConfirmation(
  customerEmail: string,
  customerName: string,
  invoiceNumber: string,
  amountPaid: number
): Promise<boolean> {
  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #16a34a; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f5f5f5; }
        .checkmark { font-size: 48px; text-align: center; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payment Received</h1>
        </div>
        <div class="content">
          <div class="checkmark">Payment Received</div>
          <h2 style="text-align: center;">Thank you, ${customerName}!</h2>
          <p style="text-align: center;">We've received your payment of <strong>${formatCurrency(amountPaid)}</strong> for Invoice #${invoiceNumber}.</p>
          <p style="text-align: center; color: #666; margin-top: 30px;">A receipt has been saved to your account.</p>
        </div>
        <div class="footer">
          <p>${config.businessName}</p>
          <p>${config.phone} | ${config.email}</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: customerEmail,
    subject: `Payment Received - Invoice #${invoiceNumber}`,
    html,
  })
}

// Send appointment reminder email
export async function sendAppointmentReminder(
  customerEmail: string,
  customerName: string,
  service: string,
  scheduledDate: string,
  address: string
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1a1714; color: #F5C518; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f5f5f5; }
        .reminder { background: #F5C518; color: #1a1714; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${config.businessName}</h1>
        </div>
        <div class="content">
          <h2>Appointment Reminder</h2>
          <p>Hello ${customerName},</p>
          <p>This is a friendly reminder about your upcoming appointment:</p>

          <div class="reminder">
            <p style="margin: 0; font-size: 14px;">Scheduled Service</p>
            <p style="margin: 10px 0; font-size: 20px; font-weight: bold;">${service}</p>
            <p style="margin: 0; font-size: 16px;">
              ${new Date(scheduledDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            <p style="margin: 10px 0 0 0; font-size: 14px;">${address}</p>
          </div>

          <p>Please ensure the area is accessible and clear of vehicles.</p>

          <p>Need to reschedule? Call us at <a href="tel:${config.phoneRaw}">${config.phone}</a></p>
        </div>
        <div class="footer">
          <p>${config.businessName}</p>
          <p>${config.phone} | ${config.email}</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: customerEmail,
    subject: `Appointment Reminder - ${service} - ${config.businessName}`,
    html,
  })
}
