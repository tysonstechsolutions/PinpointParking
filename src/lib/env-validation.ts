// ============================================
// ENVIRONMENT VARIABLE VALIDATION
// ============================================
// Validates required environment variables at startup
// ============================================

interface EnvVar {
  name: string
  required: boolean
  description: string
}

const ENV_VARS: EnvVar[] = [
  // Authentication (required)
  { name: 'ADMIN_PASSWORD', required: true, description: 'Admin login password' },

  // Supabase (required for core functionality)
  { name: 'NEXT_PUBLIC_SUPABASE_URL', required: true, description: 'Supabase project URL' },
  { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', required: true, description: 'Supabase anonymous key' },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', required: true, description: 'Supabase service role key' },

  // Optional but recommended
  { name: 'JWT_SECRET', required: false, description: 'JWT signing secret (falls back to ADMIN_PASSWORD)' },
  { name: 'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY', required: false, description: 'Google Maps API key for satellite imagery' },
  { name: 'ANTHROPIC_API_KEY', required: false, description: 'Anthropic API key for AI area estimation' },

  // Stripe (required for payments)
  { name: 'STRIPE_SECRET_KEY', required: false, description: 'Stripe secret key for payments' },
  { name: 'STRIPE_PUBLISHABLE_KEY', required: false, description: 'Stripe publishable key' },
  { name: 'STRIPE_WEBHOOK_SECRET', required: false, description: 'Stripe webhook signing secret' },

  // Twilio (optional for SMS)
  { name: 'TWILIO_ACCOUNT_SID', required: false, description: 'Twilio account SID for SMS' },
  { name: 'TWILIO_AUTH_TOKEN', required: false, description: 'Twilio auth token' },
  { name: 'TWILIO_PHONE_NUMBER', required: false, description: 'Twilio phone number' },
  { name: 'OWNER_PHONE', required: false, description: 'Owner phone number for notifications' },
]

export interface ValidationResult {
  valid: boolean
  missing: string[]
  warnings: string[]
}

/**
 * Validate all required environment variables
 * Call this at application startup
 */
export function validateEnvironment(): ValidationResult {
  const missing: string[] = []
  const warnings: string[] = []

  for (const envVar of ENV_VARS) {
    const value = process.env[envVar.name]

    if (!value || value.trim() === '') {
      if (envVar.required) {
        missing.push(`${envVar.name} - ${envVar.description}`)
      } else {
        warnings.push(`${envVar.name} not set - ${envVar.description}`)
      }
    }
  }

  // Special checks
  if (!process.env.JWT_SECRET && !process.env.ADMIN_PASSWORD) {
    missing.push('Either JWT_SECRET or ADMIN_PASSWORD must be set')
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  }
}

/**
 * Log validation results to console
 */
export function logValidationResult(result: ValidationResult): void {
  if (!result.valid) {
    console.error('='.repeat(60))
    console.error('CRITICAL: Missing required environment variables!')
    console.error('='.repeat(60))
    for (const msg of result.missing) {
      console.error(`  ❌ ${msg}`)
    }
    console.error('='.repeat(60))
    console.error('Application may not function correctly without these variables.')
    console.error('='.repeat(60))
  }

  if (result.warnings.length > 0 && process.env.NODE_ENV !== 'production') {
    console.warn('-'.repeat(60))
    console.warn('Optional environment variables not set:')
    console.warn('-'.repeat(60))
    for (const msg of result.warnings) {
      console.warn(`  ⚠️  ${msg}`)
    }
    console.warn('-'.repeat(60))
  }
}

/**
 * Validate and log at startup
 */
export function validateEnvAtStartup(): void {
  const result = validateEnvironment()
  logValidationResult(result)

  // In production, you might want to throw an error for missing required vars
  if (!result.valid && process.env.NODE_ENV === 'production') {
    throw new Error('Missing required environment variables. Check server logs.')
  }
}
