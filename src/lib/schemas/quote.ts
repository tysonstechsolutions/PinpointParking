// ============================================
// QUOTE VALIDATION SCHEMA
// ============================================

import { z } from 'zod'

// Phone number validation regex (US format)
const phoneRegex = /^[\d\s\-\(\)\.+]+$/

export const quoteSchema = z.object({
  serviceType: z.enum(['sealcoating', 'paving', 'linestriping'], {
    message: 'Invalid service type',
  }),
  projectType: z.enum(['residential', 'commercial', 'house-of-worship']).optional(),
  squareFootage: z.number().positive().max(1000000).optional(),
  condition: z.enum(['good', 'fair', 'poor', 'unknown']).optional(),
  address: z.string().min(5).max(500).optional(),
  customerName: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s\-'.]+$/, 'Name contains invalid characters'),
  customerPhone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number must be less than 20 characters')
    .regex(phoneRegex, 'Invalid phone number format'),
  customerEmail: z.string().email().max(100).optional().nullable(),
  estimateLow: z.number().positive().max(10000000).optional(),
  estimateHigh: z.number().positive().max(10000000).optional(),
  preferredDate: z.string().optional(),
  notes: z.string().max(2000).optional(),
  addOns: z.record(z.string(), z.number()).optional(),
  sessionId: z.string().optional(),
  // Counter-offer fields
  counterOfferCents: z.number().min(50000).max(10000000).optional(), // Min $500
  counterOfferMessage: z.string().max(500).optional(),
})

export type QuoteInput = z.infer<typeof quoteSchema>

// Sanitize phone number to just digits
export function sanitizePhone(phone: string): string {
  return phone.replace(/\D/g, '')
}

// Sanitize name
export function sanitizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ')
}

// Sanitize address
export function sanitizeAddress(address: string): string {
  return address.trim().replace(/\s+/g, ' ')
}
