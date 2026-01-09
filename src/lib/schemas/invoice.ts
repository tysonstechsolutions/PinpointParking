// ============================================
// INVOICE VALIDATION SCHEMA
// ============================================

import { z } from 'zod'

export const lineItemSchema = z.object({
  description: z.string().min(1).max(500),
  quantity: z.number().positive().max(10000),
  unit: z.string().max(50).optional(),
  unit_price_cents: z.number().int().min(0).max(100000000),
  total_cents: z.number().int().min(0).max(100000000),
})

export const invoiceSchema = z.object({
  customer_id: z.number().int().positive().optional().nullable(),
  job_id: z.number().int().positive().optional().nullable(),
  customer_name: z.string().min(1).max(100),
  customer_phone: z.string().max(20).optional().nullable(),
  customer_email: z.string().email().max(100).optional().nullable(),
  customer_address: z.string().max(300).optional().nullable(),
  service_address: z.string().max(300).optional().nullable(),
  service_description: z.string().max(500).optional().nullable(),
  job_type: z.string().max(50).optional().nullable(),
  square_feet: z.number().positive().max(1000000).optional().nullable(),
  scheduled_date: z.string().optional().nullable(),
  completed_date: z.string().optional().nullable(),
  line_items: z.array(lineItemSchema).min(1).max(100),
  subtotal_cents: z.number().int().min(0).max(100000000),
  tax_cents: z.number().int().min(0).max(100000000).optional().default(0),
  discount_cents: z.number().int().min(0).max(100000000).optional().default(0),
  total_cents: z.number().int().min(0).max(100000000).optional(),
  due_date: z.string().optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  status: z.enum(['draft', 'sent', 'viewed', 'partial', 'paid']).optional().default('draft'),
  sent_at: z.string().optional().nullable(),
})

export type InvoiceInput = z.infer<typeof invoiceSchema>
export type LineItemInput = z.infer<typeof lineItemSchema>

export const invoiceUpdateSchema = z.object({
  status: z.enum(['draft', 'sent', 'viewed', 'partial', 'paid']).optional(),
  amount_paid_cents: z.number().int().min(0).max(100000000).optional(),
  notes: z.string().max(5000).optional(),
})
