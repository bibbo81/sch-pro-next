import { NextRequest, NextResponse } from 'next/server'
import { TrackingService } from '@/lib/trackingService'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  try {
    // ✅ AUTENTICA L'UTENTE DAL SERVER
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Autenticazione richiesta'
      }, { status: 401 })
    }

    console.log('🔍 Getting tracking stats for user:', user.id)

    // ✅ USA L'USER ID REALE
    const stats = await TrackingService.getStats(user.id)
    
    return NextResponse.json({
      success: true,
      data: stats,
      user_id: user.id
    })
  } catch (error) {
    console.error('GET /api/trackings error:', error)
    return NextResponse.json({
      success: false,
      error: 'Errore nel recupero delle statistiche'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // ✅ AUTENTICA L'UTENTE DAL SERVER
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Autenticazione richiesta'
      }, { status: 401 })
    }

    const body = await request.json()
    console.log('🔄 Creating tracking for user:', user.id)

    // ✅ USA L'USER ID REALE
    const newTracking = await TrackingService.create(body, user.id)
    
    return NextResponse.json({
      success: true,
      data: newTracking,
      user_id: user.id
    })
  } catch (error) {
    console.error('POST /api/trackings error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore nella creazione del tracking'
    }, { status: 500 })
  }
}