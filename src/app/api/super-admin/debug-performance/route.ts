import { NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth-super-admin'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  const debugInfo: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: {}
  }

  try {
    // Check 1: Super admin auth
    try {
      await requireSuperAdmin()
      debugInfo.checks.superAdminAuth = { status: 'OK' }
    } catch (error: any) {
      debugInfo.checks.superAdminAuth = {
        status: 'FAIL',
        error: error.message
      }
      return NextResponse.json(debugInfo, { status: 200 })
    }

    // Check 2: Environment variables
    debugInfo.checks.envVars = {
      SUPABASE_URL: supabaseUrl ? 'SET' : 'MISSING',
      SUPABASE_SERVICE_KEY: supabaseServiceKey ? 'SET' : 'MISSING',
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(debugInfo, { status: 200 })
    }

    // Check 3: Supabase client creation
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      debugInfo.checks.supabaseClient = { status: 'OK' }

      // Check 4: Table exists
      try {
        const { data, error, count } = await supabase
          .from('api_performance_logs')
          .select('*', { count: 'exact', head: true })

        if (error) {
          debugInfo.checks.tableAccess = {
            status: 'FAIL',
            error: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          }
        } else {
          debugInfo.checks.tableAccess = {
            status: 'OK',
            rowCount: count
          }

          // Check 5: Can actually query
          const { data: logs, error: queryError } = await supabase
            .from('api_performance_logs')
            .select('*')
            .limit(1)

          if (queryError) {
            debugInfo.checks.tableQuery = {
              status: 'FAIL',
              error: queryError.message,
              code: queryError.code
            }
          } else {
            debugInfo.checks.tableQuery = {
              status: 'OK',
              sampleData: logs?.length || 0
            }
          }
        }
      } catch (error: any) {
        debugInfo.checks.tableAccess = {
          status: 'ERROR',
          error: error.message
        }
      }
    } catch (error: any) {
      debugInfo.checks.supabaseClient = {
        status: 'FAIL',
        error: error.message
      }
    }

    return NextResponse.json(debugInfo, { status: 200 })

  } catch (error: any) {
    debugInfo.error = {
      message: error.message,
      stack: error.stack
    }
    return NextResponse.json(debugInfo, { status: 200 })
  }
}