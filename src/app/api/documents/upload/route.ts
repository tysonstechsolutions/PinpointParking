import { NextResponse } from 'next/server'
import {
  documentUploadSchema,
  validateFile,
  sanitizeFilename,
  documentCategories,
  createValidationError
} from '@/lib/schemas'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const file = form.get('file') as File | null
    const categoryRaw = (form.get('category') as string) || 'other'
    const titleRaw = (form.get('title') as string) || file?.name || 'Document'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type and size
    const fileValidation = validateFile(file)
    if (!fileValidation.valid) {
      return NextResponse.json({ error: fileValidation.error }, { status: 400 })
    }

    // Validate category
    const parseResult = documentUploadSchema.safeParse({
      category: categoryRaw,
      title: titleRaw
    })

    if (!parseResult.success) {
      return NextResponse.json(createValidationError(parseResult.error), { status: 400 })
    }

    const { category, title } = parseResult.data

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    // Generate safe filename
    const safeName = sanitizeFilename(file.name)
    const path = `${category}/${Date.now()}_${safeName}`
    const buffer = await file.arrayBuffer()

    // Upload to Supabase Storage
    const uploadRes = await fetch(`${SUPABASE_URL}/storage/v1/object/documents/${path}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': file.type,
        'x-upsert': 'true',
      },
      body: buffer,
    })

    if (!uploadRes.ok) {
      const error = await uploadRes.text()
      console.error('Upload error:', error)
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }

    // Create document record in database
    const docRes = await fetch(`${SUPABASE_URL}/rest/v1/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        category,
        file_name: safeName,
        file_type: file.type,
        file_size: file.size,
        storage_path: path,
        title: title || safeName,
        document_date: new Date().toISOString().split('T')[0],
        parse_status: 'pending',
      }),
    })

    if (!docRes.ok) {
      const error = await docRes.text()
      console.error('DB error:', error)
      return NextResponse.json({ error: 'Failed to save document' }, { status: 500 })
    }

    const docs = await docRes.json()
    const doc = docs[0]

    // Auto-parse invoices and receipts
    if (['invoice', 'receipt'].includes(category) && process.env.ANTHROPIC_API_KEY) {
      // Trigger parsing in background
      const baseUrl = request.url.split('/api/')[0]
      fetch(`${baseUrl}/api/documents/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_id: doc.id, category }),
      }).catch(err => console.error('Parse trigger error:', err))
    }

    return NextResponse.json({ success: true, document: doc })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
