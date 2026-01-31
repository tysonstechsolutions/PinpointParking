// ============================================
// STANDARDIZED API RESPONSE UTILITIES
// ============================================
// Provides consistent error handling and response
// formats across all API endpoints
// ============================================

import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

// Success response type
export interface ApiSuccess<T = unknown> {
  readonly success: true
  readonly data: T
  readonly timestamp: string
  readonly meta?: {
    readonly page?: number
    readonly limit?: number
    readonly total?: number
  }
}

// Error response type
export interface ApiError {
  readonly success: false
  readonly error: string
  readonly message: string
  readonly statusCode: number
  readonly details?: unknown
  readonly timestamp: string
}

// Discriminated union for type-safe response handling
export type ApiResponse<T> = ApiSuccess<T> | ApiError

/**
 * Create a standardized error response
 */
export function errorResponse(
  error: string | Error | ZodError,
  statusCode: number = 500,
  details?: unknown
): NextResponse<ApiError> {
  let errorMessage: string
  let errorDetails = details

  if (error instanceof ZodError) {
    errorMessage = 'Validation failed'
    errorDetails = error.issues.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message,
      code: issue.code
    }))
    statusCode = 400
  } else if (error instanceof Error) {
    errorMessage = error.message
  } else {
    errorMessage = error
  }

  const response: ApiError = {
    success: false,
    error: errorMessage.split(':')[0].trim(),
    message: errorMessage,
    statusCode,
    details: errorDetails,
    timestamp: new Date().toISOString()
  }

  return NextResponse.json(response, {
    status: statusCode,
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-store',
    },
  })
}

/**
 * Create a standardized success response
 */
export function successResponse<T>(
  data: T,
  statusCode: number = 200,
  meta?: ApiSuccess<T>['meta']
): NextResponse<ApiSuccess<T>> {
  const response: ApiSuccess<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
    ...(meta && { meta })
  }

  return NextResponse.json(response, {
    status: statusCode,
    headers: {
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

/**
 * Common HTTP error responses
 */
export const ApiErrors = {
  badRequest: (message: string, details?: unknown) =>
    errorResponse(message, 400, details),

  unauthorized: (message = 'Unauthorized') =>
    errorResponse(message, 401),

  forbidden: (message = 'Forbidden') =>
    errorResponse(message, 403),

  notFound: (resource: string) =>
    errorResponse(`${resource} not found`, 404),

  conflict: (message: string) =>
    errorResponse(message, 409),

  tooManyRequests: (retryAfter?: number) =>
    errorResponse('Too many requests', 429, { retryAfter }),

  internalError: (message = 'Internal server error') =>
    errorResponse(message, 500),

  serviceUnavailable: (message = 'Service unavailable') =>
    errorResponse(message, 503),

  validationError: (error: ZodError) =>
    errorResponse(error, 400)
}

/**
 * Validate request body against a Zod schema
 */
export async function validateRequest<T>(
  request: Request,
  schema: { safeParse: (data: unknown) => { success: boolean; data?: T; error?: ZodError } }
): Promise<{ data: T } | { error: NextResponse<ApiError> }> {
  try {
    const body = await request.json()
    const result = schema.safeParse(body)

    if (!result.success) {
      return { error: ApiErrors.validationError(result.error!) }
    }

    return { data: result.data! }
  } catch (e) {
    return { error: ApiErrors.badRequest('Invalid JSON body') }
  }
}
