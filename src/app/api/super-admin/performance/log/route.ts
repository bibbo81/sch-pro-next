import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { endpoint, method, statusCode, responseTime, userId, organizationId, errorMessage } = body

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { error } = await supabase.from('api_performance_logs').insert({
      endpoint,
      method,
      status_code: statusCode,
      response_time_ms: responseTime,
      user_id: userId || null,
      organization_id: organizationId || null,
      error_message: errorMessage || null,
    })

    if (error) {
      console.error('Error logging performance:', error)
      return NextResponse.json({ error: 'Failed to log performance' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Performance log error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}