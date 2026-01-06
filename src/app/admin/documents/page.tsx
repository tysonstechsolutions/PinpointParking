'use client'

import { useState, useEffect, useRef } from 'react'
import { config } from '@/config/config'
import AdminNav from '@/components/AdminNav'

interface Document {
  id: number
  file_name: string
  file_type: string
  file_size: number
  storage_path: string
  category: string
  title: string
  document_date: string
  amount_cents: number
  parse_status: string
  parsed_invoice_id: number
  created_at: string
}

interface ParsedInvoice {
  id: number
  document_id: number
  invoice_type: string
  from_name: string
  from_address: string
  to_name: string
  invoice_number: string
  invoice_date: string
  total_cents: number
  expense_category: string
  status: string
  confidence_score: number
  line_items: Array<{ description: string; total_cents: number }>
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [parsedData, setParsedData] = useState<ParsedInvoice | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const response = await fetch(
        `${config.supabase.url}/rest/v1/documents?order=created_at.desc`,
        {
          headers: {
            'apikey': config.supabase.anonKey,
            'Authorization': `Bearer ${config.supabase.anonKey}`,
          },
        }
      )
      if (response.ok) {
        setDocuments(await response.json())
      }
    } catch (err) {
      console.error('Error:', err)
    }
    setLoading(false)
  }

  const handleUpload = async (file: File, category: string) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', category)
      formData.append('title', file.name)

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        setShowUploadModal(false)
        fetchDocuments()
      } else {
        alert('Upload failed')
      }
    } catch (err) {
      console.error('Upload error:', err)
      alert('Upload failed')
    }
    setUploading(false)
  }

  const handleViewParsed = async (doc: Document) => {
    setSelectedDoc(doc)
    if (doc.parsed_invoice_id) {
      try {
        const response = await fetch(`/api/documents/parse?document_id=${doc.id}`)
        if (response.ok) {
          const data = await response.json()
          if (data.length > 0) {
            setParsedData(data[0])
          }
        }
      } catch (err) {
        console.error('Error fetching parsed data:', err)
      }
    }
  }

  const handleRetryParse = async (docId: number) => {
    try {
      const response = await fetch('/api/documents/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_id: docId }),
      })
      if (response.ok) {
        fetchDocuments()
      }
    } catch (err) {
      console.error('Parse error:', err)
    }
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format((cents || 0) / 100)
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getCategoryInfo = (categoryId: string) => {
    return config.documentCategories.find(c => c.id === categoryId) || { icon: '📁', label: categoryId }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; color: string }> = {
      pending: { bg: '#f3f4f6', color: '#374151' },
      parsing: { bg: '#dbeafe', color: '#1d4ed8' },
      parsed: { bg: '#dcfce7', color: '#16a34a' },
      failed: { bg: '#fee2e2', color: '#dc2626' },
    }
    const style = styles[status] || styles.pending
    return (
      <span style={{
        padding: '4px 8px',
        borderRadius: '9999px',
        fontSize: '11px',
        fontWeight: '500',
        backgroundColor: style.bg,
        color: style.color,
      }}>
        {status}
      </span>
    )
  }

  const filteredDocs = documents.filter(d => {
    if (selectedCategory === 'all') return true
    return d.category === selectedCategory
  })

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1a1714' }}>
      <AdminNav />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white' }}>📁 Documents</h1>
            <p style={{ color: '#9C9690' }}>{documents.length} total</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#16a34a',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            + Upload Document
          </button>
        </div>

        {/* Category Filter */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}>
          <button
            onClick={() => setSelectedCategory('all')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: selectedCategory === 'all' ? '#16a34a' : '#252220',
              color: selectedCategory === 'all' ? 'white' : '#9C9690',
            }}
          >
            All
          </button>
          {config.documentCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: selectedCategory === cat.id ? '#16a34a' : '#252220',
                color: selectedCategory === cat.id ? 'white' : '#9C9690',
              }}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* Documents List */}
        <div style={{
          backgroundColor: '#252220',
          borderRadius: '12px',
          border: '1px solid #302d2a',
          overflow: 'hidden',
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#9C9690' }}>Loading...</div>
          ) : filteredDocs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#9C9690' }}>No documents found</div>
          ) : (
            filteredDocs.map((doc, i) => {
              const cat = getCategoryInfo(doc.category)
              return (
                <div
                  key={doc.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    borderBottom: i < filteredDocs.length - 1 ? '1px solid #302d2a' : 'none',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleViewParsed(doc)}
                >
                  <span style={{ fontSize: '32px' }}>{cat.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '600', color: 'white' }}>{doc.title || doc.file_name}</span>
                      {getStatusBadge(doc.parse_status)}
                    </div>
                    <div style={{ color: '#9C9690', fontSize: '14px' }}>
                      {formatDate(doc.created_at)} • {formatFileSize(doc.file_size)}
                    </div>
                  </div>
                  {doc.amount_cents > 0 && (
                    <div style={{ fontWeight: 'bold', color: '#16a34a' }}>
                      {formatCurrency(doc.amount_cents)}
                    </div>
                  )}
                  {doc.parse_status === 'failed' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRetryParse(doc.id); }}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      Retry
                    </button>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={handleUpload}
          uploading={uploading}
          fileInputRef={fileInputRef}
        />
      )}

      {/* Parsed Data Modal */}
      {selectedDoc && (
        <ParsedDataModal
          doc={selectedDoc}
          parsed={parsedData}
          onClose={() => { setSelectedDoc(null); setParsedData(null); }}
        />
      )}
    </div>
  )
}

// Upload Modal Component
function UploadModal({
  onClose,
  onUpload,
  uploading,
  fileInputRef,
}: {
  onClose: () => void
  onUpload: (file: File, category: string) => void
  uploading: boolean
  fileInputRef: React.RefObject<HTMLInputElement | null>
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [category, setCategory] = useState('receipt')

  const handleSubmit = () => {
    if (selectedFile) {
      onUpload(selectedFile, category)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '16px',
    }}>
      <div style={{
        backgroundColor: '#252220',
        borderRadius: '16px',
        maxWidth: '500px',
        width: '100%',
        border: '1px solid #302d2a',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px',
          borderBottom: '1px solid #302d2a',
        }}>
          <h2 style={{ fontWeight: 'bold', fontSize: '18px', color: 'white' }}>Upload Document</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#9C9690' }}>✕</button>
        </div>

        <div style={{ padding: '16px' }}>
          {/* Category Selection */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#9C9690' }}>
              Document Type
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {config.documentCategories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: category === cat.id ? '2px solid #16a34a' : '1px solid #302d2a',
                    backgroundColor: category === cat.id ? '#16a34a20' : '#302d2a',
                    cursor: 'pointer',
                    textAlign: 'center',
                    color: 'white',
                  }}
                >
                  <div style={{ fontSize: '24px' }}>{cat.icon}</div>
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>{cat.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* File Input */}
          <div style={{ marginBottom: '16px' }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '100%',
                padding: '32px',
                border: '2px dashed #3A3733',
                borderRadius: '12px',
                backgroundColor: '#302d2a',
                cursor: 'pointer',
                textAlign: 'center',
                color: 'white',
              }}
            >
              {selectedFile ? (
                <div>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>📎</div>
                  <div style={{ fontWeight: '500' }}>{selectedFile.name}</div>
                  <div style={{ fontSize: '12px', color: '#9C9690' }}>Click to change</div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📤</div>
                  <div>Click to select file</div>
                  <div style={{ fontSize: '12px', color: '#9C9690' }}>Images or PDF</div>
                </div>
              )}
            </button>
          </div>

          {['invoice', 'receipt'].includes(category) && (
            <div style={{
              backgroundColor: '#1d4ed820',
              color: '#60a5fa',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '14px',
              marginBottom: '16px',
              border: '1px solid #1d4ed840',
            }}>
              🤖 AI will automatically extract invoice/receipt data
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!selectedFile || uploading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: selectedFile ? '#16a34a' : '#3A3733',
              color: selectedFile ? 'white' : '#666',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: selectedFile ? 'pointer' : 'not-allowed',
            }}
          >
            {uploading ? 'Uploading...' : 'Upload Document'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Parsed Data Modal Component
function ParsedDataModal({
  doc,
  parsed,
  onClose,
}: {
  doc: Document
  parsed: ParsedInvoice | null
  onClose: () => void
}) {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format((cents || 0) / 100)
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '16px',
    }}>
      <div style={{
        backgroundColor: '#252220',
        borderRadius: '16px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid #302d2a',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px',
          borderBottom: '1px solid #302d2a',
          position: 'sticky',
          top: 0,
          backgroundColor: '#252220',
        }}>
          <h2 style={{ fontWeight: 'bold', fontSize: '18px', color: 'white' }}>Document Details</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#9C9690' }}>✕</button>
        </div>

        <div style={{ padding: '16px' }}>
          {/* File Info */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontWeight: '600', marginBottom: '8px', color: 'white' }}>File</h3>
            <div style={{ backgroundColor: '#302d2a', padding: '12px', borderRadius: '8px' }}>
              <div style={{ fontWeight: '500', color: 'white' }}>{doc.file_name}</div>
              <div style={{ fontSize: '14px', color: '#9C9690' }}>
                {doc.category} • {doc.parse_status}
              </div>
            </div>
          </div>

          {/* Parsed Data */}
          {parsed ? (
            <>
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h3 style={{ fontWeight: '600', color: 'white' }}>AI Extracted Data</h3>
                  <span style={{
                    backgroundColor: parsed.confidence_score >= 0.95 ? '#16a34a20' : '#d9770620',
                    color: parsed.confidence_score >= 0.95 ? '#4ade80' : '#fbbf24',
                    padding: '4px 8px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                  }}>
                    {Math.round(parsed.confidence_score * 100)}% confidence
                  </span>
                </div>

                <div style={{ backgroundColor: '#302d2a', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#9C9690', marginBottom: '4px' }}>From</div>
                      <div style={{ fontWeight: '500', color: 'white' }}>{parsed.from_name || '-'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#9C9690', marginBottom: '4px' }}>Invoice #</div>
                      <div style={{ color: 'white' }}>{parsed.invoice_number || '-'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#9C9690', marginBottom: '4px' }}>Date</div>
                      <div style={{ color: 'white' }}>{parsed.invoice_date || '-'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#9C9690', marginBottom: '4px' }}>Category</div>
                      <div style={{ color: 'white' }}>{parsed.expense_category}</div>
                    </div>
                  </div>

                  {parsed.line_items?.length > 0 && (
                    <div style={{ marginTop: '16px', borderTop: '1px solid #3A3733', paddingTop: '16px' }}>
                      <div style={{ fontSize: '12px', color: '#9C9690', marginBottom: '8px' }}>Line Items</div>
                      {parsed.line_items.map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: 'white' }}>
                          <span>{item.description}</span>
                          <span>{formatCurrency(item.total_cents)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{
                    marginTop: '16px',
                    borderTop: '1px solid #3A3733',
                    paddingTop: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: 'bold',
                    fontSize: '18px',
                  }}>
                    <span style={{ color: 'white' }}>Total</span>
                    <span style={{ color: '#4ade80' }}>{formatCurrency(parsed.total_cents)}</span>
                  </div>
                </div>
              </div>

              <div style={{
                backgroundColor: parsed.invoice_type === 'vendor_expense' ? '#dc262620' : '#16a34a20',
                color: parsed.invoice_type === 'vendor_expense' ? '#f87171' : '#4ade80',
                padding: '12px',
                borderRadius: '8px',
                textAlign: 'center',
                fontWeight: '500',
                border: `1px solid ${parsed.invoice_type === 'vendor_expense' ? '#dc262640' : '#16a34a40'}`,
              }}>
                {parsed.invoice_type === 'vendor_expense' ? '📤 Expense (Money Out)' : '📥 Income (Money In)'}
              </div>
            </>
          ) : doc.parse_status === 'parsing' ? (
            <div style={{ textAlign: 'center', padding: '32px', color: '#9C9690' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔄</div>
              AI is analyzing this document...
            </div>
          ) : doc.parse_status === 'pending' ? (
            <div style={{ textAlign: 'center', padding: '32px', color: '#9C9690' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>⏳</div>
              Waiting for AI analysis
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px', color: '#9C9690' }}>
              No parsed data available
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
