'use client'

// ============================================
// SHARED CONSTANTS
// ============================================

import {
  Camera,
  FileText,
  File,
  Truck,
  Fuel,
  Wrench,
  Package,
  HelpCircle,
  Receipt,
  LucideIcon,
} from 'lucide-react'

interface DocumentCategory {
  id: string
  label: string
  icon: LucideIcon
  color: string
}

interface ExpenseCategory {
  id: string
  label: string
  icon: LucideIcon
  color: string
}

// Document categories (for uploads)
export const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  { id: 'photo', label: 'Job Photo', icon: Camera, color: 'green' },
  { id: 'invoice', label: 'Invoice', icon: FileText, color: 'purple' },
  { id: 'receipt', label: 'Receipt', icon: Receipt, color: 'amber' },
  { id: 'contract', label: 'Contract', icon: FileText, color: 'indigo' },
  { id: 'permit', label: 'Permit', icon: FileText, color: 'blue' },
  { id: 'other', label: 'Other', icon: File, color: 'neutral' },
]

// Expense categories (for parsed invoices)
export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { id: 'all', label: 'All Categories', icon: Receipt, color: 'neutral' },
  { id: 'materials', label: 'Materials', icon: Package, color: 'blue' },
  { id: 'fuel', label: 'Fuel', icon: Fuel, color: 'amber' },
  { id: 'equipment', label: 'Equipment', icon: Truck, color: 'green' },
  { id: 'labor', label: 'Labor', icon: Wrench, color: 'red' },
  { id: 'insurance', label: 'Insurance', icon: FileText, color: 'purple' },
  { id: 'permits', label: 'Permits', icon: FileText, color: 'indigo' },
  { id: 'other', label: 'Other', icon: HelpCircle, color: 'neutral' },
]

// Category icons lookup
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  materials: Package,
  fuel: Fuel,
  equipment: Truck,
  labor: Wrench,
  insurance: FileText,
  permits: FileText,
  other: HelpCircle,
}

// Category labels lookup
export const CATEGORY_LABELS: Record<string, string> = {
  materials: 'Materials',
  fuel: 'Fuel',
  equipment: 'Equipment',
  labor: 'Labor',
  insurance: 'Insurance',
  permits: 'Permits',
  other: 'Other',
}

// Helper functions
export function getDocumentCategory(categoryId: string): DocumentCategory {
  return DOCUMENT_CATEGORIES.find(c => c.id === categoryId) || DOCUMENT_CATEGORIES[DOCUMENT_CATEGORIES.length - 1]
}

export function getExpenseCategory(categoryId: string): ExpenseCategory {
  return EXPENSE_CATEGORIES.find(c => c.id === categoryId) || EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1]
}

// Format currency from cents
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format((cents || 0) / 100)
}

// Format date
export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
