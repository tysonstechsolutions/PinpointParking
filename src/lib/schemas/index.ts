// ============================================
// VALIDATION SCHEMAS INDEX
// ============================================

export * from './quote'
export * from './customer'
export * from './invoice'
export * from './expense'
export * from './document'

// Common validation utilities
import { ZodError } from 'zod'

// Format Zod errors into a user-friendly message
export function formatZodError(error: ZodError): string {
  const messages = error.errors.map(e => {
    const path = e.path.join('.')
    return path ? `${path}: ${e.message}` : e.message
  })
  return messages.join(', ')
}

// Create a standard API error response
export function createValidationError(error: ZodError) {
  return {
    error: 'Validation failed',
    details: error.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
    })),
  }
}
