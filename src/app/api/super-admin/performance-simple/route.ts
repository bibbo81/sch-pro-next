import { NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth-super-admin'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    console.log('=== PERFORMANCE SIMPLE TEST START ===')

    // Step 1: Auth check
    console.log('Step 1: Checking super admin auth...')
    await requireSuperAdmin()
    console.log('Step 1: ✅ Super admin auth OK')

    // Step 2: Create client
    console.log('Step 2: Creating Supabase client...')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    console.log('Step 2: ✅ Client created')

    // Step 3: Simple query
    console.log('Step 3: Querying api_performance_logs...')
    const { data: logs, error } = await supabase
      .from('api_performance_logs')
      .select('*')
      .limit(10)

    if (error) {
      console.error('Step 3: ❌ Query error:', error)
      return NextResponse.json({
        success: false,
        step: 3,
        error: error.message,
        code: error.code,
        details: error.details
      }, { status: 500 })
    }

    console.log('Step 3: ✅ Query successful, rows:', logs?.length)

    // Step 4: Return data
    return NextResponse.json({
      success: true,
      rowCount: logs?.length || 0,
      data: logs || []
    })

  } catch (error: any) {
    console.error('=== ERROR ===', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}