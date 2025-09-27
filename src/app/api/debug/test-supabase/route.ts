import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [DEBUG] Testing Supabase credentials...')

    // Test environment variables
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    console.log('📊 [DEBUG] Environment check:', {
      hasUrl: !!url,
      hasAnonKey: !!anonKey,
      hasServiceKey: !!serviceKey,
      urlPrefix: url?.slice(0, 30),
      anonKeyPrefix: anonKey?.slice(0, 20),
      serviceKeyPrefix: serviceKey?.slice(0, 20)
    })

    // Test with different approaches
    const results = []

    // 1. Test with anon key
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const anonClient = createClient(url!, anonKey!)

      const { data: anonTest, error: anonError } = await anonClient
        .from('organizations')
        .select('id, name')
        .limit(1)

      results.push({
        test: 'anon_key',
        success: !anonError,
        error: anonError?.message,
        dataCount: anonTest?.length || 0
      })
    } catch (e) {
      results.push({
        test: 'anon_key',
        success: false,
        error: e instanceof Error ? e.message : 'Unknown error'
      })
    }

    // 2. Test with service key
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const serviceClient = createClient(url!, serviceKey!, {
        auth: { autoRefreshToken: false, persistSession: false }
      })

      const { data: serviceTest, error: serviceError } = await serviceClient
        .from('organizations')
        .select('id, name')
        .limit(1)

      results.push({
        test: 'service_key',
        success: !serviceError,
        error: serviceError?.message,
        dataCount: serviceTest?.length || 0
      })
    } catch (e) {
      results.push({
        test: 'service_key',
        success: false,
        error: e instanceof Error ? e.message : 'Unknown error'
      })
    }

    // 3. Test table existence
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const serviceClient = createClient(url!, serviceKey!, {
        auth: { autoRefreshToken: false, persistSession: false }
      })

      const { data: tables, error: tablesError } = await serviceClient
        .rpc('get_table_names') // This might not work, but let's try

      results.push({
        test: 'table_check',
        success: !tablesError,
        error: tablesError?.message,
        tables: tables
      })
    } catch (e) {
      results.push({
        test: 'table_check',
        success: false,
        error: e instanceof Error ? e.message : 'Unknown error'
      })
    }

    return NextResponse.json({
      environment: {
        hasUrl: !!url,
        hasAnonKey: !!anonKey,
        hasServiceKey: !!serviceKey,
        nodeEnv: process.env.NODE_ENV
      },
      tests: results
    })

  } catch (error) {
    console.error('❌ [DEBUG] Test failed:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}