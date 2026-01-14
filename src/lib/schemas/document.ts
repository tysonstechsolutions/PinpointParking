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

// Allowed file types with their magic bytes signatures
export const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/heic',
  'application/pdf',
] as const

// Magic byte signatures for file type verification
const MAGIC_BYTES: Record<string, number[][]> = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
  'image/gif': [[0x47, 0x49, 0x46, 0x38, 0x37, 0x61], [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]], // GIF87a, GIF89a
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF (WebP starts with RIFF...WEBP)
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
  // HEIC is complex (ISO base media file format), check for ftyp box
  'image/heic': [[0x00, 0x00, 0x00]], // Will check for ftyp signature specially
}

// Max file size: 10MB
export const maxFileSize = 10 * 1024 * 1024

export const documentUploadSchema = z.object({
  category: z.enum(documentCategories, {
    message: 'Invalid document category',
  }),
  title: z.string().max(200).optional(),
})

export type DocumentUploadInput = z.infer<typeof documentUploadSchema>

// Check if buffer matches any of the magic byte signatures
function matchesMagicBytes(buffer: Uint8Array, signatures: number[][]): boolean {
  return signatures.some(sig =>
    sig.every((byte, index) => buffer[index] === byte)
  )
}

// Validate file with magic byte checking
export async function validateFile(file: File): Promise<{ valid: boolean; error?: string }> {
  // Check file size first
  if (file.size > maxFileSize) {
    return { valid: false, error: `File too large. Maximum size is ${maxFileSize / 1024 / 1024}MB` }
  }

  // Check file size minimum (prevent empty/corrupted files)
  if (file.size < 8) {
    return { valid: false, error: 'File is too small or corrupted' }
  }

  // Check declared MIME type
  if (!allowedMimeTypes.includes(file.type as typeof allowedMimeTypes[number])) {
    return { valid: false, error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP, HEIC, PDF' }
  }

  // Verify magic bytes match the declared MIME type
  try {
    const buffer = new Uint8Array(await file.slice(0, 12).arrayBuffer())
    const declaredType = file.type

    // Check magic bytes for the declared type
    const signatures = MAGIC_BYTES[declaredType]
    if (signatures) {
      if (declaredType === 'image/heic') {
        // HEIC check: look for ftyp at bytes 4-7
        const hasFtyp = buffer[4] === 0x66 && buffer[5] === 0x74 && buffer[6] === 0x79 && buffer[7] === 0x70
        if (!hasFtyp) {
          return { valid: false, error: 'File content does not match declared HEIC type' }
        }
      } else if (declaredType === 'image/webp') {
        // WebP check: RIFF at start and WEBP at bytes 8-11
        const hasRiff = matchesMagicBytes(buffer, signatures)
        const hasWebp = buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
        if (!hasRiff || !hasWebp) {
          return { valid: false, error: 'File content does not match declared WebP type' }
        }
      } else if (!matchesMagicBytes(buffer, signatures)) {
        return { valid: false, error: 'File content does not match declared type' }
      }
    }
  } catch {
    return { valid: false, error: 'Could not verify file content' }
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
