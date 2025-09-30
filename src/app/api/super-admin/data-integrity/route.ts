import { NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth-super-admin'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    await requireSuperAdmin()

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Run integrity checks
    const { data, error } = await supabase.rpc('check_data_integrity')

    if (error) {
      console.error('Data integrity check error:', error)
      return NextResponse.json(
        { error: 'Failed to check data integrity', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ...data,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Data integrity API error:', error)
    return NextResponse.json(
      { error: 'Unauthorized or error', details: error.message },
      { status: 401 }
    )
  }
}