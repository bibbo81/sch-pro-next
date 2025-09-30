/**
 * Performance Logger Utility
 * Automatically logs API performance metrics to the database
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface LogEntry {
  endpoint: string
  method: string
  statusCode: number
  responseTime: number
  userId?: string
  organizationId?: string
  errorMessage?: string
}

/**
 * Log API performance metrics directly to database
 * This runs asynchronously and doesn't block the API response
 */
export async function logPerformance(entry: LogEntry): Promise<void> {
  // Don't block the response - fire and forget
  try {
    // Skip logging for the performance endpoints themselves to avoid recursion
    if (entry.endpoint.includes('/api/super-admin/performance')) {
      return
    }

    // Skip logging for health checks and monitoring
    if (entry.endpoint.includes('/api/super-admin/health-check')) {
      return
    }

    if (entry.endpoint.includes('/api/super-admin/debug-performance')) {
      return
    }

    // Check if we have required env vars
    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn('Performance logging disabled: missing Supabase credentials')
      return
    }

    // Log directly to database (async, non-blocking)
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Don't await - fire and forget
    supabase
      .from('api_performance_logs')
      .insert({
        endpoint: entry.endpoint,
        method: entry.method,
        status_code: entry.statusCode,
        response_time_ms: entry.responseTime,
        user_id: entry.userId || null,
        organization_id: entry.organizationId || null,
        error_message: entry.errorMessage || null,
      })
      .then(({ error }: any) => {
        if (error) {
          console.error('Performance log error:', error.message)
        }
      })
      .catch((error: any) => {
        // Silently fail - don't impact the main API
        console.error('Performance logging error:', error)
      })
  } catch (error) {
    // Silently fail - don't impact the main API
    console.error('Performance logging error:', error)
  }
}

/**
 * Create a performance logger wrapper for API routes
 * Usage:
 *
 * export const GET = withPerformanceLogging(async (request) => {
 *   // Your API logic
 *   return NextResponse.json({ data })
 * })
 */
export function withPerformanceLogging(
  handler: (request: Request, context?: any) => Promise<Response>
) {
  return async (request: Request, context?: any): Promise<Response> => {
    const startTime = Date.now()
    const url = new URL(request.url)

    let response: Response
    let error: Error | null = null

    try {
      response = await handler(request, context)
    } catch (e: any) {
      error = e
      // Re-throw to maintain error behavior
      throw e
    } finally {
      const endTime = Date.now()
      const responseTime = endTime - startTime

      // Log after response (async)
      if (!error && response!) {
        logPerformance({
          endpoint: url.pathname,
          method: request.method,
          statusCode: response.status,
          responseTime,
        })
      } else if (error) {
        logPerformance({
          endpoint: url.pathname,
          method: request.method,
          statusCode: 500,
          responseTime,
          errorMessage: error.message,
        })
      }
    }

    return response!
  }
}