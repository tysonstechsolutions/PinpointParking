'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { config } from '@/config/config'
import AdminNav from '@/components/AdminNav'

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

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [showCustomerSearch, setShowCustomerSearch] = useState(false)
  const [customerSearch, setCustomerSearch] = useState('')

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

  useEffect(() => {
    fetchCustomers()
    if (jobId) {
      fetchJob(jobId)
    }
  }, [jobId])

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
      line_items: prev.line_items.map((item, i) =>
        i === index
          ? { ...item, [field]: field === 'amount_cents' ? Math.round(parseFloat(value || '0') * 100) : value }
          : item
      )
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

      const payload = {
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
        line_items: invoice.line_items.filter(item => item.description && item.amount_cents > 0),
        notes: invoice.notes,
        due_date: dueDate.toISOString().split('T')[0],
        subtotal_cents: subtotal,
        total_cents: subtotal,
        status: sendNow ? 'sent' : 'draft',
        sent_at: sendNow ? new Date().toISOString() : null,
      }

      const response = await fetch('/api/invoices', {
        method: 'POST',
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
            Create Invoice
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

        {/* Manual Total Entry (Alternative) */}
        <div style={{
          backgroundColor: '#252220',
          borderRadius: '12px',
          border: '1px solid #302d2a',
          padding: '20px',
          marginBottom: '20px',
        }}>
          <h2 style={{ color: '#F5C518', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
            Or Enter Total Manually
          </h2>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', color: '#9C9690', fontSize: '13px', marginBottom: '6px' }}>
                Total invoice amount
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9C9690' }}>$</span>
                <input
                  type="number"
                  step="0.01"
                  value={invoice.total_amount}
                  onChange={(e) => setInvoice({ ...invoice, total_amount: e.target.value })}
                  placeholder="0.00"
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 28px',
                    border: '1px solid #3A3733',
                    borderRadius: '8px',
                    backgroundColor: '#302d2a',
                    color: 'white',
                    fontSize: '18px',
                  }}
                />
              </div>
            </div>
            <button
              onClick={generateLineItems}
              disabled={generating}
              style={{
                padding: '12px 20px',
                backgroundColor: generating ? '#4a4538' : '#F5C518',
                color: generating ? '#9C9690' : '#1a1714',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: generating ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {generating ? 'Generating...' : 'Generate Line Items'}
            </button>
          </div>

          <p style={{ color: '#9C9690', fontSize: '13px', marginTop: '8px' }}>
            AI will automatically create line items that add up to your total based on the selected services.
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
                    value={item.amount_cents ? (item.amount_cents / 100).toFixed(2) : ''}
                    onChange={(e) => updateLineItem(index, 'amount_cents', e.target.value)}
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
            placeholder="Notes to appear on invoice..."
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
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
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
            Save Draft
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
            {saving ? 'Saving...' : 'Save & Send'}
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
