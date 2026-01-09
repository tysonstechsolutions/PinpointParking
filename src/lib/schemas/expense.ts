// ============================================
// EXPENSE VALIDATION SCHEMA
// ============================================

import { z } from 'zod'

export const expenseCategories = [
  'materials',
  'fuel',
  'equipment',
  'labor',
  'insurance',
  'permits',
  'other',
] as const

export const expenseSchema = z.object({
  category: z.enum(expenseCategories, {
    errorMap: () => ({ message: 'Invalid expense category' }),
  }),
  vendor: z.string().max(200).optional().nullable(),
  description: z.string().min(1, 'Description is required').max(500),
  amount_cents: z.number().int().positive().max(100000000),
  expense_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  receipt_url: z.string().url().max(500).optional().nullable(),
  job_id: z.number().int().positive().optional().nullable(),
  is_tax_deductible: z.boolean().optional().default(true),
})

export type ExpenseInput = z.infer<typeof expenseSchema>

export const expenseFilterSchema = z.object({
  category: z.enum(expenseCategories).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  limit: z.number().positive().max(500).optional().default(100),
  offset: z.number().min(0).optional().default(0),
})
