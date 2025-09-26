import { NextResponse } from 'next/server'
import { TrackingService } from '@/lib/trackingService'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  try {
    // ✅ AUTENTICA L'UTENTE DINAMICAMENTE
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Autenticazione richiesta'
      }, { status: 401 })
    }

    console.log('🔍 Getting tracking stats for user:', user.id)

    const stats = await TrackingService.getStats(user.id)
    
    return NextResponse.json({
      success: true,
      data: stats,
      user_id: user.id
    })
  } catch (error) {
    console.error('GET /api/trackings/stats error:', error)
    return NextResponse.json({
      success: false,
      error: 'Errore nel recupero delle statistiche'
    }, { status: 500 })
  }
}