'use client'

import { useState, useEffect, useRef, Suspense, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { config } from '@/config/config'
import AdminNav from '@/components/AdminNav'

// Favicon SVG component for the preview
const PinpointLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="15" fill="#1a1714" stroke="#1a1714" strokeWidth="2"/>
    <circle cx="16" cy="16" r="12" fill="none" stroke="#F5C518" strokeWidth="2.5"/>
    <circle cx="16" cy="16" r="4" fill="#F5C518"/>
    <line x1="16" y1="2" x2="16" y2="8" stroke="#F5C518" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="16" y1="24" x2="16" y2="30" stroke="#F5C518" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="2" y1="16" x2="8" y2="16" stroke="#F5C518" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="24" y1="16" x2="30" y2="16" stroke="#F5C518" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
)

interface Customer {
  id: number
  name: string
  phone: string
  email: string
  address: string
}

interface Job {
  id: number
  customer_id: number
  customer_name: string
  customer_phone: string
  customer_email: string
  service_address: string
  job_type: string
  square_feet: number
  quote_cents: number
  status: string
}

interface LineItem {
  description: string
  quantity?: number
  unit_price_cents?: number
  amount_cents: number
  _displayAmount?: string
}

// Speech recognition types
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

function CreateInvoiceContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const jobId = searchParams.get('job')
  const editId = searchParams.get('edit')
  const [isEditMode, setIsEditMode] = useState(false)

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [showCustomerSearch, setShowCustomerSearch] = useState(false)
  const [customerSearch, setCustomerSearch] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  // Voice input state
  const [isRecording, setIsRecording] = useState(false)
  const [voiceTranscript, setVoiceTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const [invoice, setInvoice] = useState({
    customer_id: null as number | null,
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    customer_address: '',
    job_id: null as number | null,
    service_address: '',
    service_description: '',
    services: {
      striping: false,
      sealing: false,
      paving: false,
    },
    square_feet: '',
    line_items: [
      { description: '', amount_cents: 0 }
    ] as LineItem[],
    notes: '',
    payment_terms: 15,
    total_amount: '',
  })

  const fetchEstimate = useCallback(async (id: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/invoices?id=${id}`)
      if (response.ok) {
        const data = await response.json()
        const est = Array.isArray(data) ? data[0] : data
        if (est) {
          const lineItems = (est.line_items || []).map((item: LineItem) => ({
            ...item,
            _displayAmount: item.amount_cents ? (item.amount_cents / 100).toFixed(2) : '',
          }))

          // Determine services from job_type or service_description
          const services = { striping: false, sealing: false, paving: false }
          const jobType = (est.job_type || est.service_description || '').toLowerCase()
          if (jobType.includes('strip')) services.striping = true
          if (jobType.includes('seal')) services.sealing = true
          if (jobType.includes('pav')) services.paving = true

          setInvoice(prev => ({
            ...prev,
            customer_id: est.customer_id,
            customer_name: est.customer_name || '',
            customer_phone: est.customer_phone || '',
            customer_email: est.customer_email || '',
            customer_address: est.customer_address || '',
            job_id: est.job_id,
            service_address: est.service_address || '',
            service_description: est.service_description || '',
            services,
            square_feet: est.square_feet?.toString() || '',
            line_items: lineItems.length > 0 ? lineItems : [{ description: '', amount_cents: 0 }],
            notes: est.notes || '',
            payment_terms: est.due_date
              ? Math.round((new Date(est.due_date).getTime() - new Date(est.created_at).getTime()) / (1000 * 60 * 60 * 24))
              : 15,
            total_amount: est.total_cents ? (est.total_cents / 100).toFixed(2) : '',
          }))
          setIsEditMode(true)
        }
      }
    } catch (err) {
      console.error('Error fetching estimate:', err)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchCustomers()
    if (editId) {
      fetchEstimate(editId)
    } else if (jobId) {
      fetchJob(jobId)
    }
  }, [jobId, editId, fetchEstimate])

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognitionAPI) {
        const recognition = new SpeechRecognitionAPI()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US'

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let interim = ''
          let final = ''

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              final += transcript + ' '
            } else {
              interim += transcript
            }
          }

          if (final) {
            setVoiceTranscript(prev => prev + final)
          }
          setInterimTranscript(interim)
        }

        recognition.onerror = (event: { error: string }) => {
          console.error('Speech recognition error:', event.error)
          if (event.error !== 'no-speech') {
            setIsRecording(false)
          }
        }

        recognition.onend = () => {
          // Restart if still recording (for continuous mode)
          if (isRecording && recognitionRef.current) {
            try {
              recognitionRef.current.start()
            } catch {
              // Ignore if already started
            }
          }
        }

        recognitionRef.current = recognition
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [isRecording])

  const startRecording = () => {
    if (recognitionRef.current) {
      setVoiceTranscript('')
      setInterimTranscript('')
      setIsRecording(true)
      try {
        recognitionRef.current.start()
      } catch {
        // Ignore if already started
      }
    } else {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.')
    }
  }

  const stopRecording = () => {
    setIsRecording(false)
    setInterimTranscript('')
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }

  const parseVoiceInput = async () => {
    const transcript = voiceTranscript.trim()
    if (!transcript) {
      alert('No voice input to parse')
      return
    }

    setGenerating(true)

    try {
      const response = await fetch('/api/invoices/parse-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          services: Object.entries(invoice.services)
            .filter(([, selected]) => selected)
            .map(([service]) => service),
        }),
      })

      if (response.ok) {
        const data = await response.json()

        // Update invoice with parsed data
        setInvoice(prev => ({
          ...prev,
          line_items: data.lineItems,
          total_amount: (data.totalCents / 100).toFixed(2),
          services: data.services || prev.services,
        }))

        // Clear the transcript after successful parse
        setVoiceTranscript('')
      } else {
        const err = await response.json()
        alert(err.error || 'Failed to parse voice input')
      }
    } catch (err) {
      console.error('Error parsing voice input:', err)
      alert('Failed to parse voice input')
    }

    setGenerating(false)
  }

  const fetchCustomers = async () => {
    try {
      const response = await fetch(
        `${config.supabase.url}/rest/v1/customers?order=name.asc&limit=100`,
        {
          headers: {
            'apikey': config.supabase.anonKey,
            'Authorization': `Bearer ${config.supabase.anonKey}`,
          },
        }
      )
      if (response.ok) {
        setCustomers(await response.json())
      }
    } catch (err) {
      console.error('Error fetching customers:', err)
    }
  }

  const fetchJob = async (id: string) => {
    setLoading(true)
    try {
      const response = await fetch(
        `${config.supabase.url}/rest/v1/jobs?id=eq.${id}`,
        {
          headers: {
            'apikey': config.supabase.anonKey,
            'Authorization': `Bearer ${config.supabase.anonKey}`,
          },
        }
      )
      if (response.ok) {
        const [job]: Job[] = await response.json()
        if (job) {
          prefillFromJob(job)
        }
      }
    } catch (err) {
      console.error('Error fetching job:', err)
    }
    setLoading(false)
  }

  const prefillFromJob = (job: Job) => {
    const serviceMap: Record<string, keyof typeof invoice.services> = {
      linestriping: 'striping',
      sealcoating: 'sealing',
      paving: 'paving',
    }

    const serviceKey = serviceMap[job.job_type]
    const services = { striping: false, sealing: false, paving: false }
    if (serviceKey) {
      services[serviceKey] = true
    }

    setInvoice(prev => ({
      ...prev,
      job_id: job.id,
      customer_id: job.customer_id,
      customer_name: job.customer_name,
      customer_phone: job.customer_phone,
      customer_email: job.customer_email || '',
      service_address: job.service_address,
      services,
      square_feet: job.square_feet?.toString() || '',
      total_amount: job.quote_cents ? (job.quote_cents / 100).toFixed(2) : '',
    }))
  }

  const selectCustomer = (customer: Customer) => {
    setInvoice(prev => ({
      ...prev,
      customer_id: customer.id,
      customer_name: customer.name,
      customer_phone: customer.phone || '',
      customer_email: customer.email || '',
      customer_address: customer.address || '',
      service_address: prev.service_address || customer.address || '',
    }))
    setShowCustomerSearch(false)
    setCustomerSearch('')
  }

  const addLineItem = () => {
    setInvoice(prev => ({
      ...prev,
      line_items: [...prev.line_items, { description: '', amount_cents: 0 }]
    }))
  }

  const updateLineItem = (index: number, field: keyof LineItem, value: string) => {
    setInvoice(prev => ({
      ...prev,
      line_items: prev.line_items.map((item, i) => {
        if (i !== index) return item
        if (field === 'amount_cents') {
          return { ...item, _displayAmount: value, amount_cents: Math.round(parseFloat(value || '0') * 100) }
        }
        return { ...item, [field]: value }
      })
    }))
  }

  const finalizeLineItemAmount = (index: number) => {
    setInvoice(prev => ({
      ...prev,
      line_items: prev.line_items.map((item, i) => {
        if (i !== index) return item
        const cents = item.amount_cents || 0
        return { ...item, _displayAmount: cents ? (cents / 100).toFixed(2) : '' }
      })
    }))
  }

  const removeLineItem = (index: number) => {
    if (invoice.line_items.length <= 1) return
    setInvoice(prev => ({
      ...prev,
      line_items: prev.line_items.filter((_, i) => i !== index)
    }))
  }

  const generateLineItems = async () => {
    const totalCents = Math.round(parseFloat(invoice.total_amount || '0') * 100)
    if (totalCents <= 0) {
      alert('Please enter a total amount first')
      return
    }

    const selectedServices = Object.entries(invoice.services)
      .filter(([, selected]) => selected)
      .map(([service]) => service)

    if (selectedServices.length === 0) {
      alert('Please select at least one service')
      return
    }

    setGenerating(true)

    try {
      const response = await fetch('/api/invoices/generate-line-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          services: selectedServices,
          totalCents,
          squareFeet: invoice.square_feet ? parseInt(invoice.square_feet) : null,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setInvoice(prev => ({
          ...prev,
          line_items: data.lineItems,
        }))
      } else {
        alert('Failed to generate line items')
      }
    } catch (err) {
      console.error('Error generating line items:', err)
      alert('Failed to generate line items')
    }

    setGenerating(false)
  }

  const subtotal = invoice.line_items.reduce((sum, item) => sum + (item.amount_cents || 0), 0)

  const formatCurrency = useCallback((cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format((cents || 0) / 100)
  }, [])

  const formatDate = useCallback((date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }, [])

  const canPreview = invoice.customer_name && invoice.line_items.some(item => item.description && item.amount_cents > 0)

  const handlePrint = useCallback(() => {
    const printWindow = window.open('', '_blank')
    if (!printWindow || !previewRef.current) return

    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + invoice.payment_terms)
    const depositAmount = Math.round(subtotal * 0.5)
    const balanceAfterDeposit = subtotal - depositAmount

    const selectedServices = Object.entries(invoice.services)
      .filter(([, selected]) => selected)
      .map(([service]) => {
        const labels: Record<string, string> = {
          striping: 'Line Striping',
          sealing: 'Sealcoating',
          paving: 'Asphalt Paving',
        }
        return labels[service] || service
      })
      .join(', ')

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Estimate - ${invoice.customer_name}</title>
        <style>
          @page { margin: 0.5in; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .container { max-width: 800px; margin: 0 auto; }
          .header {
            background: #1a1714;
            color: white;
            padding: 40px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          .logo-section { display: flex; align-items: center; gap: 16px; }
          .logo svg { width: 48px; height: 48px; }
          .business-name { font-size: 28px; font-weight: bold; color: #F5C518; }
          .business-contact { color: #9C9690; font-size: 14px; margin-top: 4px; }
          .estimate-title { font-size: 28px; font-weight: bold; color: #F5C518; text-align: right; }
          .estimate-number { font-size: 18px; color: white; margin-top: 8px; }
          .estimate-date { color: #9C9690; margin-top: 8px; }
          .info-section { padding: 30px 40px; border-bottom: 1px solid #eee; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
          .info-label { font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase; margin-bottom: 8px; }
          .info-value { font-size: 18px; font-weight: 600; }
          .info-secondary { color: #666; margin-top: 4px; }
          .service-section { padding: 20px 40px; background: #f9f9f9; border-bottom: 1px solid #eee; }
          .line-items { padding: 30px 40px; }
          table { width: 100%; border-collapse: collapse; }
          th { text-align: left; padding: 12px 0; font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase; border-bottom: 2px solid #1a1714; }
          th:nth-child(2), th:nth-child(3), th:nth-child(4) { text-align: right; }
          td { padding: 16px 0; border-bottom: 1px solid #eee; }
          td:nth-child(2), td:nth-child(3), td:nth-child(4) { text-align: right; }
          .totals { margin-top: 24px; display: flex; justify-content: flex-end; }
          .totals-box { width: 280px; }
          .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
          .total-row.final { border-top: 2px solid #1a1714; margin-top: 8px; padding-top: 16px; }
          .total-label { color: #666; }
          .total-value { font-weight: 600; }
          .total-value.large { font-size: 24px; font-weight: bold; }
          .payment-terms { padding: 30px 40px; background: #f9f9f9; border-top: 1px solid #eee; }
          .payment-terms h3 { font-size: 14px; font-weight: 600; margin-bottom: 16px; }
          .payment-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .payment-box { background: white; padding: 20px; border-radius: 8px; }
          .payment-box.deposit { border: 2px solid #F5C518; }
          .payment-box.balance { border: 1px solid #ddd; }
          .payment-label { font-size: 12px; color: #666; text-transform: uppercase; margin-bottom: 4px; }
          .payment-amount { font-size: 24px; font-weight: bold; }
          .payment-amount.yellow { color: #F5C518; }
          .payment-note { font-size: 13px; color: #666; margin-top: 8px; }
          .notes-section { padding: 30px 40px; border-top: 1px solid #eee; }
          .notes-section h3 { font-size: 14px; font-weight: 600; margin-bottom: 8px; }
          .notes-text { color: #666; white-space: pre-wrap; }
          .pay-online-section { padding: 30px 40px; background: #f9f9f9; border-top: 1px solid #eee; text-align: center; }
          .pay-online-section h3 { font-size: 14px; font-weight: 600; margin-bottom: 12px; }
          .pay-online-btn { display: inline-block; padding: 16px 40px; background: #F5C518; color: #1a1714; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 18px; }
          .pay-online-url { margin-top: 12px; font-size: 13px; color: #666; word-break: break-all; }
          .footer {
            padding: 30px 40px;
            background: #1a1714;
            color: white;
            text-align: center;
          }
          .footer p { font-size: 14px; margin-bottom: 8px; }
          .footer .secondary { color: #9C9690; font-size: 13px; }
          @media print {
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo-section">
              <div class="logo">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 32 32">
                  <circle cx="16" cy="16" r="15" fill="#1a1714" stroke="#F5C518" stroke-width="2"/>
                  <circle cx="16" cy="16" r="12" fill="none" stroke="#F5C518" stroke-width="2.5"/>
                  <circle cx="16" cy="16" r="4" fill="#F5C518"/>
                  <line x1="16" y1="2" x2="16" y2="8" stroke="#F5C518" stroke-width="2.5" stroke-linecap="round"/>
                  <line x1="16" y1="24" x2="16" y2="30" stroke="#F5C518" stroke-width="2.5" stroke-linecap="round"/>
                  <line x1="2" y1="16" x2="8" y2="16" stroke="#F5C518" stroke-width="2.5" stroke-linecap="round"/>
                  <line x1="24" y1="16" x2="30" y2="16" stroke="#F5C518" stroke-width="2.5" stroke-linecap="round"/>
                </svg>
              </div>
              <div>
                <div class="business-name">${config.businessName}</div>
                <div class="business-contact">${config.phone}</div>
                <div class="business-contact">${config.email}</div>
              </div>
            </div>
            <div>
              <div class="estimate-title">ESTIMATE</div>
              <div class="estimate-date">Date: ${formatDate(new Date())}</div>
              <div class="estimate-date">Valid Until: ${formatDate(dueDate)}</div>
            </div>
          </div>

          <div class="info-section">
            <div>
              <div class="info-label">Prepared For</div>
              <div class="info-value">${invoice.customer_name}</div>
              ${invoice.customer_phone ? `<div class="info-secondary">${invoice.customer_phone}</div>` : ''}
              ${invoice.customer_email ? `<div class="info-secondary">${invoice.customer_email}</div>` : ''}
            </div>
            <div>
              <div class="info-label">Service Location</div>
              <div style="font-size: 16px;">${invoice.service_address || 'TBD'}</div>
            </div>
          </div>

          ${selectedServices || invoice.square_feet ? `
          <div class="service-section">
            <div class="info-label">Service Description</div>
            <div style="font-size: 16px;">${selectedServices || ''}</div>
            ${invoice.square_feet ? `<div class="info-secondary">Estimated Area: ${parseInt(invoice.square_feet).toLocaleString()} sq ft</div>` : ''}
          </div>
          ` : ''}

          <div class="line-items">
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th style="width: 80px;">Qty</th>
                  <th style="width: 100px;">Unit Price</th>
                  <th style="width: 120px;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.line_items
                  .filter(item => item.description && item.amount_cents > 0)
                  .map(item => `
                    <tr>
                      <td>${item.description}</td>
                      <td>${item.quantity || 1}</td>
                      <td>${item.unit_price_cents ? formatCurrency(item.unit_price_cents) : '-'}</td>
                      <td style="font-weight: 500;">${formatCurrency(item.amount_cents)}</td>
                    </tr>
                  `).join('')}
              </tbody>
            </table>

            <div class="totals">
              <div class="totals-box">
                <div class="total-row">
                  <span class="total-label">Subtotal</span>
                  <span class="total-value">${formatCurrency(subtotal)}</span>
                </div>
                <div class="total-row final">
                  <span style="font-size: 18px; font-weight: 600;">Total</span>
                  <span class="total-value large">${formatCurrency(subtotal)}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="payment-terms">
            <h3>Payment Terms</h3>
            <div class="payment-grid">
              <div class="payment-box deposit">
                <div class="payment-label">Deposit Due (50%)</div>
                <div class="payment-amount yellow">${formatCurrency(depositAmount)}</div>
                <div class="payment-note">Due upon acceptance</div>
              </div>
              <div class="payment-box balance">
                <div class="payment-label">Balance Due</div>
                <div class="payment-amount">${formatCurrency(balanceAfterDeposit)}</div>
                <div class="payment-note">Due upon completion</div>
              </div>
            </div>
          </div>

          ${invoice.notes ? `
          <div class="notes-section">
            <h3>Notes</h3>
            <p class="notes-text">${invoice.notes}</p>
          </div>
          ` : ''}

          <div class="pay-online-section">
            <h3>Ready to Get Started?</h3>
            <a href="${config.websiteUrl}/portal" class="pay-online-btn">Pay Online</a>
            <p class="pay-online-url">${config.websiteUrl}/portal</p>
          </div>

          <div class="footer">
            <p>Thank you for considering ${config.businessName}!</p>
            <p class="secondary">This estimate is valid for 30 days from the date of issue.</p>
            <p class="secondary" style="margin-top: 16px;">${config.phone} | ${config.email}</p>
          </div>
        </div>
      </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }, [invoice, subtotal, formatCurrency, formatDate])

  const handleSubmit = async (sendNow = false) => {
    if (!invoice.customer_name) {
      alert('Customer name is required')
      return
    }

    if (invoice.line_items.every(item => !item.description || item.amount_cents <= 0)) {
      alert('Add at least one line item')
      return
    }

    setSaving(true)

    try {
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + invoice.payment_terms)

      const selectedServices = Object.entries(invoice.services)
        .filter(([, selected]) => selected)
        .map(([service]) => {
          const labels: Record<string, string> = {
            striping: 'Line Striping',
            sealing: 'Sealcoating',
            paving: 'Asphalt Paving',
          }
          return labels[service] || service
        })

      const cleanedLineItems = invoice.line_items
        .filter(item => item.description && item.amount_cents > 0)
        .map(({ _displayAmount, ...item }) => item)

      const payload = {
        ...(isEditMode && editId ? { id: parseInt(editId) } : {}),
        customer_id: invoice.customer_id,
        job_id: invoice.job_id,
        customer_name: invoice.customer_name,
        customer_phone: invoice.customer_phone,
        customer_email: invoice.customer_email,
        customer_address: invoice.customer_address,
        service_address: invoice.service_address,
        service_description: selectedServices.join(', ') || invoice.service_description,
        job_type: Object.entries(invoice.services)
          .filter(([, selected]) => selected)
          .map(([service]) => service)
          .join(','),
        square_feet: invoice.square_feet ? parseInt(invoice.square_feet) : null,
        line_items: cleanedLineItems,
        notes: invoice.notes,
        due_date: dueDate.toISOString().split('T')[0],
        subtotal_cents: subtotal,
        total_cents: subtotal,
        status: sendNow ? 'sent' : 'draft',
        sent_at: sendNow ? new Date().toISOString() : null,
      }

      const response = await fetch('/api/invoices', {
        method: isEditMode ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const data = await response.json()

        if (sendNow && data.invoice?.id) {
          await fetch('/api/invoices/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ invoice_id: data.invoice.id }),
          })
        }

        router.push('/admin/invoices')
      } else {
        const err = await response.json()
        alert(err.error || 'Failed to create invoice')
      }
    } catch (err) {
      console.error('Error creating invoice:', err)
      alert('Error creating invoice')
    }
    setSaving(false)
  }

  const filteredCustomers = customers.filter(c =>
    c.name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone?.includes(customerSearch)
  )

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#1a1714', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#9C9690' }}>Loading...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1a1714' }}>
      <AdminNav />

      {/* Header */}
      <div style={{
        backgroundColor: '#252220',
        borderBottom: '1px solid #302d2a',
        padding: '16px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link
            href="/admin/invoices"
            style={{ color: '#9C9690', textDecoration: 'none', fontSize: '20px' }}
          >
            &larr;
          </Link>
          <h1 style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
            {isEditMode ? 'Edit Estimate' : 'Create Estimate'}
          </h1>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px' }}>
        {/* Customer Section */}
        <div style={{
          backgroundColor: '#252220',
          borderRadius: '12px',
          border: '1px solid #302d2a',
          padding: '20px',
          marginBottom: '20px',
        }}>
          <h2 style={{ color: '#F5C518', fontSize: '16px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Customer
          </h2>

          {/* Customer Search */}
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <button
              onClick={() => setShowCustomerSearch(!showCustomerSearch)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '12px 16px',
                border: '1px solid #3A3733',
                borderRadius: '8px',
                backgroundColor: '#302d2a',
                color: invoice.customer_name ? 'white' : '#9C9690',
                cursor: 'pointer',
              }}
            >
              {invoice.customer_name || 'Select or enter customer...'}
            </button>

            {showCustomerSearch && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '4px',
                backgroundColor: '#252220',
                borderRadius: '8px',
                border: '1px solid #3A3733',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                zIndex: 20,
                maxHeight: '256px',
                overflow: 'auto',
              }}>
                <div style={{ padding: '8px', borderBottom: '1px solid #302d2a' }}>
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #3A3733',
                      borderRadius: '6px',
                      backgroundColor: '#302d2a',
                      color: 'white',
                      fontSize: '14px',
                    }}
                    autoFocus
                  />
                </div>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.slice(0, 10).map(customer => (
                    <button
                      key={customer.id}
                      onClick={() => selectCustomer(customer)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '12px 16px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: 'white',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#302d2a'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <p style={{ fontWeight: '500', margin: 0 }}>{customer.name}</p>
                      <p style={{ fontSize: '13px', color: '#9C9690', margin: '4px 0 0 0' }}>{customer.phone}</p>
                    </button>
                  ))
                ) : (
                  <p style={{ padding: '12px 16px', color: '#9C9690', fontSize: '14px' }}>No customers found</p>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', color: '#9C9690', fontSize: '13px', marginBottom: '6px' }}>Name *</label>
              <input
                type="text"
                value={invoice.customer_name}
                onChange={(e) => setInvoice({ ...invoice, customer_name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #3A3733',
                  borderRadius: '8px',
                  backgroundColor: '#302d2a',
                  color: 'white',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: '#9C9690', fontSize: '13px', marginBottom: '6px' }}>Phone</label>
              <input
                type="tel"
                value={invoice.customer_phone}
                onChange={(e) => setInvoice({ ...invoice, customer_phone: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #3A3733',
                  borderRadius: '8px',
                  backgroundColor: '#302d2a',
                  color: 'white',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: '#9C9690', fontSize: '13px', marginBottom: '6px' }}>Email</label>
              <input
                type="email"
                value={invoice.customer_email}
                onChange={(e) => setInvoice({ ...invoice, customer_email: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #3A3733',
                  borderRadius: '8px',
                  backgroundColor: '#302d2a',
                  color: 'white',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: '#9C9690', fontSize: '13px', marginBottom: '6px' }}>Payment Terms</label>
              <select
                value={invoice.payment_terms}
                onChange={(e) => setInvoice({ ...invoice, payment_terms: parseInt(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #3A3733',
                  borderRadius: '8px',
                  backgroundColor: '#302d2a',
                  color: 'white',
                }}
              >
                <option value={0}>Due on Receipt</option>
                <option value={7}>Net 7</option>
                <option value={15}>Net 15</option>
                <option value={30}>Net 30</option>
              </select>
            </div>
          </div>
        </div>

        {/* Service Selection */}
        <div style={{
          backgroundColor: '#252220',
          borderRadius: '12px',
          border: '1px solid #302d2a',
          padding: '20px',
          marginBottom: '20px',
        }}>
          <h2 style={{ color: '#F5C518', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
            Services
          </h2>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            {[
              { id: 'striping', label: 'Line Striping', emoji: '' },
              { id: 'sealing', label: 'Sealcoating', emoji: '' },
              { id: 'paving', label: 'Asphalt Paving', emoji: '' },
            ].map(service => (
              <button
                key={service.id}
                onClick={() => setInvoice(prev => ({
                  ...prev,
                  services: { ...prev.services, [service.id]: !prev.services[service.id as keyof typeof prev.services] }
                }))}
                style={{
                  flex: 1,
                  padding: '16px 12px',
                  border: invoice.services[service.id as keyof typeof invoice.services]
                    ? '2px solid #F5C518'
                    : '2px solid #3A3733',
                  borderRadius: '8px',
                  backgroundColor: invoice.services[service.id as keyof typeof invoice.services]
                    ? '#3d3830'
                    : '#302d2a',
                  color: 'white',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>{service.emoji}</span>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>{service.label}</span>
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', color: '#9C9690', fontSize: '13px', marginBottom: '6px' }}>Service Address</label>
              <input
                type="text"
                value={invoice.service_address}
                onChange={(e) => setInvoice({ ...invoice, service_address: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #3A3733',
                  borderRadius: '8px',
                  backgroundColor: '#302d2a',
                  color: 'white',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: '#9C9690', fontSize: '13px', marginBottom: '6px' }}>Square Feet (optional)</label>
              <input
                type="number"
                value={invoice.square_feet}
                onChange={(e) => setInvoice({ ...invoice, square_feet: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #3A3733',
                  borderRadius: '8px',
                  backgroundColor: '#302d2a',
                  color: 'white',
                }}
              />
            </div>
          </div>
        </div>

        {/* Voice Input - Walk the Job */}
        <div style={{
          backgroundColor: '#252220',
          borderRadius: '12px',
          border: isRecording ? '2px solid #dc2626' : '1px solid #302d2a',
          padding: '20px',
          marginBottom: '20px',
        }}>
          <h2 style={{ color: '#F5C518', fontSize: '16px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Walk the Job
            {isRecording && <span style={{ width: '10px', height: '10px', backgroundColor: '#dc2626', borderRadius: '50%', animation: 'pulse 1s infinite' }} />}
          </h2>

          <p style={{ color: '#9C9690', fontSize: '14px', marginBottom: '16px' }}>
            Tap the microphone and describe what you see as you walk the job site. Include quantities, types of items, and the total price at the end.
          </p>

          {/* Recording Controls */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            {!isRecording ? (
              <button
                onClick={startRecording}
                style={{
                  flex: 1,
                  padding: '16px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <span style={{ fontSize: '20px' }}>🎙</span>
                Start Recording
              </button>
            ) : (
              <button
                onClick={stopRecording}
                style={{
                  flex: 1,
                  padding: '16px',
                  backgroundColor: '#302d2a',
                  color: 'white',
                  border: '2px solid #dc2626',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <span style={{ fontSize: '20px' }}>⏹</span>
                Stop Recording
              </button>
            )}
          </div>

          {/* Transcript Display */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#9C9690', fontSize: '13px', marginBottom: '6px' }}>
              Transcript (you can also type or edit here)
            </label>
            <textarea
              value={voiceTranscript + interimTranscript}
              onChange={(e) => {
                setVoiceTranscript(e.target.value)
                setInterimTranscript('')
              }}
              placeholder="Example: &quot;19 spots, a hash zone the size of a parking spot, 1 handicap, 4 more parking spots, 13 more parking spots, 22 more parking spots, 3 more hash zones the size of parking spots, 3 more handicap spots, 3 more regular parking spots. Total is $1150&quot;"
              rows={5}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #3A3733',
                borderRadius: '8px',
                backgroundColor: '#302d2a',
                color: 'white',
                fontSize: '14px',
                resize: 'vertical',
                lineHeight: '1.5',
              }}
            />
            {interimTranscript && (
              <p style={{ color: '#9C9690', fontSize: '12px', marginTop: '4px', fontStyle: 'italic' }}>
                Listening...
              </p>
            )}
          </div>

          {/* Parse Button */}
          <button
            onClick={parseVoiceInput}
            disabled={generating || !voiceTranscript.trim()}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: generating || !voiceTranscript.trim() ? '#4a4538' : '#F5C518',
              color: generating || !voiceTranscript.trim() ? '#9C9690' : '#1a1714',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: generating || !voiceTranscript.trim() ? 'not-allowed' : 'pointer',
            }}
          >
            {generating ? 'Parsing...' : 'Create Line Items from Description'}
          </button>

          <p style={{ color: '#666', fontSize: '12px', marginTop: '12px', textAlign: 'center' }}>
            AI will parse your description into individual line items with proper pricing
          </p>
        </div>

        {/* Line Items */}
        <div style={{
          backgroundColor: '#252220',
          borderRadius: '12px',
          border: '1px solid #302d2a',
          padding: '20px',
          marginBottom: '20px',
        }}>
          <h2 style={{ color: '#F5C518', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
            Line Items
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {invoice.line_items.map((item, index) => (
              <div key={index} style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                  placeholder="Description"
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    border: '1px solid #3A3733',
                    borderRadius: '8px',
                    backgroundColor: '#302d2a',
                    color: 'white',
                  }}
                />
                <div style={{ position: 'relative', width: '120px' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9C9690' }}>$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={item._displayAmount ?? (item.amount_cents ? (item.amount_cents / 100).toFixed(2) : '')}
                    onChange={(e) => updateLineItem(index, 'amount_cents', e.target.value)}
                    onBlur={() => finalizeLineItemAmount(index)}
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 28px',
                      border: '1px solid #3A3733',
                      borderRadius: '8px',
                      backgroundColor: '#302d2a',
                      color: 'white',
                    }}
                  />
                </div>
                <button
                  onClick={() => removeLineItem(index)}
                  disabled={invoice.line_items.length <= 1}
                  style={{
                    padding: '10px 14px',
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: 'transparent',
                    color: invoice.line_items.length <= 1 ? '#4a4538' : '#dc2626',
                    cursor: invoice.line_items.length <= 1 ? 'not-allowed' : 'pointer',
                    fontSize: '18px',
                  }}
                >
                  x
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addLineItem}
            style={{
              marginTop: '12px',
              padding: '8px 16px',
              backgroundColor: 'transparent',
              color: '#F5C518',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            + Add Line Item
          </button>

          {/* Total */}
          <div style={{
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid #302d2a',
            display: 'flex',
            justifyContent: 'flex-end',
          }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: '#9C9690', fontSize: '14px', margin: 0 }}>Total</p>
              <p style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', margin: '4px 0 0 0' }}>
                ${(subtotal / 100).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div style={{
          backgroundColor: '#252220',
          borderRadius: '12px',
          border: '1px solid #302d2a',
          padding: '20px',
          marginBottom: '20px',
        }}>
          <h2 style={{ color: '#F5C518', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
            Notes
          </h2>
          <textarea
            value={invoice.notes}
            onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })}
            placeholder="Notes to appear on estimate..."
            rows={3}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #3A3733',
              borderRadius: '8px',
              backgroundColor: '#302d2a',
              color: 'white',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowPreview(true)}
            disabled={!canPreview}
            style={{
              padding: '14px 24px',
              backgroundColor: canPreview ? '#1a1714' : '#302d2a',
              color: canPreview ? '#F5C518' : '#666',
              border: canPreview ? '2px solid #F5C518' : '1px solid #3A3733',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: canPreview ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            Preview
          </button>
          <button
            onClick={() => handleSubmit(false)}
            disabled={saving}
            style={{
              padding: '14px 24px',
              backgroundColor: '#302d2a',
              color: 'white',
              border: '1px solid #3A3733',
              borderRadius: '8px',
              fontWeight: '500',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : 1,
            }}
          >
            {isEditMode ? 'Update Draft' : 'Save Draft'}
          </button>
          <button
            onClick={() => handleSubmit(true)}
            disabled={saving}
            style={{
              padding: '14px 24px',
              backgroundColor: saving ? '#166534' : '#16a34a',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Saving...' : isEditMode ? 'Update & Send' : 'Save & Send'}
          </button>
        </div>
      </div>

      {/* Click outside to close customer search */}
      {showCustomerSearch && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 10 }}
          onClick={() => setShowCustomerSearch(false)}
        />
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Modal Header */}
          <div style={{
            backgroundColor: '#1a1714',
            borderBottom: '2px solid #F5C518',
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <PinpointLogo />
              <h2 style={{ color: '#F5C518', fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
                Estimate Preview
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handlePrint}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#F5C518',
                  color: '#1a1714',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                Download PDF
              </button>
              <button
                onClick={() => setShowPreview(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#302d2a',
                  color: 'white',
                  border: '1px solid #3A3733',
                  borderRadius: '8px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>

          {/* Preview Content */}
          <div style={{
            flex: 1,
            overflow: 'auto',
            padding: '40px 20px',
            backgroundColor: '#f5f5f5',
          }}>
            <div
              ref={previewRef}
              style={{
                maxWidth: '800px',
                margin: '0 auto',
                backgroundColor: 'white',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                borderRadius: '8px',
                overflow: 'hidden',
              }}
            >
              {/* Estimate Header */}
              <div style={{
                backgroundColor: '#1a1714',
                color: 'white',
                padding: '40px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <PinpointLogo />
                    <div>
                      <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#F5C518' }}>
                        {config.businessName}
                      </h1>
                      <p style={{ margin: '4px 0 0 0', color: '#9C9690', fontSize: '14px' }}>{config.phone}</p>
                      <p style={{ margin: '4px 0 0 0', color: '#9C9690', fontSize: '14px' }}>{config.email}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <h2 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#F5C518' }}>
                      ESTIMATE
                    </h2>
                    <p style={{ margin: '8px 0 0 0', color: '#9C9690' }}>
                      Date: {formatDate(new Date())}
                    </p>
                    <p style={{ margin: '4px 0 0 0', color: '#9C9690' }}>
                      Valid Until: {formatDate(new Date(Date.now() + invoice.payment_terms * 24 * 60 * 60 * 1000))}
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer & Service Info */}
              <div style={{ padding: '30px 40px', borderBottom: '1px solid #eee' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                  <div>
                    <h3 style={{ fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Prepared For
                    </h3>
                    <p style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>{invoice.customer_name}</p>
                    {invoice.customer_phone && (
                      <p style={{ margin: '4px 0 0 0', color: '#666' }}>{invoice.customer_phone}</p>
                    )}
                    {invoice.customer_email && (
                      <p style={{ margin: '4px 0 0 0', color: '#666' }}>{invoice.customer_email}</p>
                    )}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Service Location
                    </h3>
                    <p style={{ margin: 0, fontSize: '16px' }}>{invoice.service_address || 'TBD'}</p>
                  </div>
                </div>
              </div>

              {/* Service Description */}
              {(invoice.services.striping || invoice.services.sealing || invoice.services.paving || invoice.square_feet) && (
                <div style={{ padding: '20px 40px', backgroundColor: '#f9f9f9', borderBottom: '1px solid #eee' }}>
                  <h3 style={{ fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Service Description
                  </h3>
                  <p style={{ margin: 0, fontSize: '16px' }}>
                    {Object.entries(invoice.services)
                      .filter(([, selected]) => selected)
                      .map(([service]) => {
                        const labels: Record<string, string> = {
                          striping: 'Line Striping',
                          sealing: 'Sealcoating',
                          paving: 'Asphalt Paving',
                        }
                        return labels[service] || service
                      })
                      .join(', ')}
                  </p>
                  {invoice.square_feet && (
                    <p style={{ margin: '4px 0 0 0', color: '#666' }}>
                      Estimated Area: {parseInt(invoice.square_feet).toLocaleString()} sq ft
                    </p>
                  )}
                </div>
              )}

              {/* Line Items */}
              <div style={{ padding: '30px 40px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #1a1714' }}>
                      <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>
                        Description
                      </th>
                      <th style={{ textAlign: 'center', padding: '12px 0', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase', width: '80px' }}>
                        Qty
                      </th>
                      <th style={{ textAlign: 'right', padding: '12px 0', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase', width: '100px' }}>
                        Unit Price
                      </th>
                      <th style={{ textAlign: 'right', padding: '12px 0', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase', width: '120px' }}>
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.line_items
                      .filter(item => item.description && item.amount_cents > 0)
                      .map((item, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '16px 0', fontSize: '15px' }}>{item.description}</td>
                          <td style={{ padding: '16px 0', textAlign: 'center', color: '#666' }}>
                            {item.quantity || 1}
                          </td>
                          <td style={{ padding: '16px 0', textAlign: 'right', color: '#666' }}>
                            {item.unit_price_cents ? formatCurrency(item.unit_price_cents) : '-'}
                          </td>
                          <td style={{ padding: '16px 0', textAlign: 'right', fontWeight: '500' }}>
                            {formatCurrency(item.amount_cents)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>

                {/* Totals */}
                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ width: '280px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                      <span style={{ color: '#666' }}>Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '16px 0',
                      borderTop: '2px solid #1a1714',
                      marginTop: '8px',
                    }}>
                      <span style={{ fontSize: '18px', fontWeight: '600' }}>Total</span>
                      <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{formatCurrency(subtotal)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Terms */}
              <div style={{
                padding: '30px 40px',
                backgroundColor: '#f9f9f9',
                borderTop: '1px solid #eee',
              }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>Payment Terms</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '2px solid #F5C518',
                  }}>
                    <p style={{ fontSize: '12px', color: '#666', margin: '0 0 4px 0', textTransform: 'uppercase' }}>
                      Deposit Due (50%)
                    </p>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#F5C518' }}>
                      {formatCurrency(Math.round(subtotal * 0.5))}
                    </p>
                    <p style={{ fontSize: '13px', color: '#666', margin: '8px 0 0 0' }}>
                      Due upon acceptance
                    </p>
                  </div>
                  <div style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                  }}>
                    <p style={{ fontSize: '12px', color: '#666', margin: '0 0 4px 0', textTransform: 'uppercase' }}>
                      Balance Due
                    </p>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                      {formatCurrency(subtotal - Math.round(subtotal * 0.5))}
                    </p>
                    <p style={{ fontSize: '13px', color: '#666', margin: '8px 0 0 0' }}>
                      Due upon completion
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {invoice.notes && (
                <div style={{ padding: '30px 40px', borderTop: '1px solid #eee' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Notes</h3>
                  <p style={{ margin: 0, color: '#666', whiteSpace: 'pre-wrap' }}>{invoice.notes}</p>
                </div>
              )}

              {/* Pay Online Section */}
              <div style={{
                padding: '30px 40px',
                backgroundColor: '#f9f9f9',
                borderTop: '1px solid #eee',
                textAlign: 'center',
              }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Ready to Get Started?</h3>
                <a
                  href={`${config.websiteUrl}/portal`}
                  style={{
                    display: 'inline-block',
                    padding: '16px 40px',
                    backgroundColor: '#F5C518',
                    color: '#1a1714',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '18px',
                  }}
                >
                  Pay Online
                </a>
                <p style={{ marginTop: '12px', fontSize: '13px', color: '#666' }}>
                  {config.websiteUrl}/portal
                </p>
              </div>

              {/* Footer */}
              <div style={{
                padding: '30px 40px',
                backgroundColor: '#1a1714',
                color: 'white',
                textAlign: 'center',
              }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                  Thank you for considering {config.businessName}!
                </p>
                <p style={{ margin: 0, fontSize: '13px', color: '#9C9690' }}>
                  This estimate is valid for 30 days from the date of issue.
                </p>
                <p style={{ margin: '16px 0 0 0', fontSize: '13px', color: '#9C9690' }}>
                  {config.phone} | {config.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CreateInvoicePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', backgroundColor: '#1a1714', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#9C9690' }}>Loading...</p>
      </div>
    }>
      <CreateInvoiceContent />
    </Suspense>
  )
}
