// ============================================
// DOCUMENT VALIDATION SCHEMA
// ============================================

import { z } from 'zod'

export const documentCategories = [
  'invoice',
  'receipt',
  'contract',
  'photo',
  'permit',
  'other',
] as const

// Allowed file types
export const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/heic',
  'application/pdf',
] as const

// Max file size: 10MB
export const maxFileSize = 10 * 1024 * 1024

export const documentUploadSchema = z.object({
  category: z.enum(documentCategories, {
    errorMap: () => ({ message: 'Invalid document category' }),
  }),
  title: z.string().max(200).optional(),
})

export type DocumentUploadInput = z.infer<typeof documentUploadSchema>

// Validate file
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > maxFileSize) {
    return { valid: false, error: `File too large. Maximum size is ${maxFileSize / 1024 / 1024}MB` }
  }

  // Check file type
  if (!allowedMimeTypes.includes(file.type as typeof allowedMimeTypes[number])) {
    return { valid: false, error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP, HEIC, PDF' }
  }

  return { valid: true }
}

// Sanitize filename
export function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts
  const sanitized = filename
    .replace(/\.\./g, '')
    .replace(/[\/\\]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 200)

  return sanitized || 'unnamed_file'
}
