// ============================================
// CUSTOMER VALIDATION SCHEMA
// ============================================

import { z } from 'zod'

const phoneRegex = /^[\d\s\-\(\)\.+]+$/

export const customerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(20)
    .regex(phoneRegex, 'Invalid phone number'),
  email: z.string().email().max(100).optional().nullable(),
  company_name: z.string().max(100).optional().nullable(),
  is_business: z.boolean().optional().default(false),
  address: z.string().max(200).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(50).optional().nullable(),
  zip: z.string().max(20).optional().nullable(),
  billing_address: z.string().max(200).optional().nullable(),
  billing_city: z.string().max(100).optional().nullable(),
  billing_state: z.string().max(50).optional().nullable(),
  billing_zip: z.string().max(20).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  is_vip: z.boolean().optional().default(false),
})

export type CustomerInput = z.infer<typeof customerSchema>

export const customerSearchSchema = z.object({
  query: z.string().max(100).optional(),
  limit: z.number().positive().max(100).optional().default(50),
  offset: z.number().min(0).optional().default(0),
})
