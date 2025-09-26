import { NextRequest, NextResponse } from 'next/server'
import { TrackingService } from '@/lib/trackingService'
import { createClient } from '@/utils/supabase/server'

// ✅ FALLBACK SOLO PER DEVELOPMENT
const DEVELOPMENT_USER_ID = 'demo-user-123'

async function getUserId(): Promise<string | null> {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      // ✅ FALLBACK SOLO IN DEVELOPMENT
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ Using development fallback user ID')
        return DEVELOPMENT_USER_ID
      }
      return null
    }
    
    return user.id
  } catch (error) {
    console.error('❌ Auth error:', error)
    // ✅ FALLBACK SOLO IN DEVELOPMENT
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Using development fallback user ID due to auth error')
      return DEVELOPMENT_USER_ID
    }
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId()
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Autenticazione richiesta'
      }, { status: 401 })
    }

    const { tracking_numbers } = await request.json()

    if (!tracking_numbers || !Array.isArray(tracking_numbers)) {
      return NextResponse.json({
        success: false,
        error: 'Array di numeri tracking richiesto'
      }, { status: 400 })
    }

    console.log('🔍 Checking tracking numbers for user:', userId, 'count:', tracking_numbers.length)

    const existingTrackings = await TrackingService.getBulkByTrackingNumbers(tracking_numbers, userId)
        
    // Mappa i risultati
    const results = tracking_numbers.map(trackingNumber => {
      const existingTracking = existingTrackings.find(t => t.tracking_number === trackingNumber)
      
      if (existingTracking) {
        return {
          tracking_number: trackingNumber,
          exists: true,
          data: {
            id: existingTracking.id,
            tracking_number: existingTracking.tracking_number,
            status: existingTracking.status,
            carrier_name: existingTracking.carrier_name,
            carrier_code: existingTracking.carrier_code,
            reference_number: existingTracking.reference_number,
            origin: existingTracking.origin,
            destination: existingTracking.destination,
            origin_port: existingTracking.origin_port,
            destination_port: existingTracking.destination_port,
            eta: existingTracking.eta,
            tracking_type: existingTracking.tracking_type,
            vessel_name: existingTracking.vessel_name,
            voyage_number: existingTracking.voyage_number,
            events: existingTracking.metadata?.events || [],
            last_update: existingTracking.updated_at,
            created_at: existingTracking.created_at,
            source: 'database'
          }
        }
      }

      return {
        tracking_number: trackingNumber,
        exists: false,
        data: null
      }
    })

    const existing = results.filter(r => r.exists)
    const missing = results.filter(r => !r.exists)

    console.log('✅ Check results:', {
      total: tracking_numbers.length,
      found: existing.length,
      missing: missing.length
    })

    return NextResponse.json({
      success: true,
      results: results,
      existing: existing,
      missing: missing.map(m => m.tracking_number),
      stats: {
        total: tracking_numbers.length,
        found: existing.length,
        notFound: missing.length,
        foundPercentage: Math.round((existing.length / tracking_numbers.length) * 100)
      }
    })

  } catch (error) {
    console.error('❌ Database Check API Error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore nella verifica tracking',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 })
  }
}

// ✅ CORRETTO: Usa la stessa funzione getUserId() per consistenza
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const trackingNumber = searchParams.get('tracking_number')

    if (!trackingNumber) {
      return NextResponse.json({
        success: false,
        error: 'Parametro tracking_number richiesto'
      }, { status: 400 })
    }

    console.log('🔍 Single tracking check:', trackingNumber)

    // ✅ USA LA STESSA FUNZIONE getUserId() per consistenza e fallback
    const userId = await getUserId()
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Autenticazione richiesta'
      }, { status: 401 })
    }

    const existingTracking = await TrackingService.getByTrackingNumber(trackingNumber, userId)
    
    if (existingTracking) {
      return NextResponse.json({
        success: true,
        exists: true,
        data: {
          id: existingTracking.id,
          tracking_number: existingTracking.tracking_number,
          status: existingTracking.status,
          carrier_name: existingTracking.carrier_name,
          carrier_code: existingTracking.carrier_code,
          reference_number: existingTracking.reference_number,
          origin: existingTracking.origin,
          destination: existingTracking.destination,
          origin_port: existingTracking.origin_port,
          destination_port: existingTracking.destination_port,
          eta: existingTracking.eta,
          tracking_type: existingTracking.tracking_type,
          vessel_name: existingTracking.vessel_name,
          voyage_number: existingTracking.voyage_number,
          events: existingTracking.metadata?.events || [],
          last_update: existingTracking.updated_at,
          created_at: existingTracking.created_at,
          source: 'database'
        }
      })
    }

    return NextResponse.json({
      success: true,
      exists: false,
      message: 'Tracking non trovato nel database'
    })

  } catch (error) {
    console.error('❌ Single tracking check error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore nella verifica tracking'
    }, { status: 500 })
  }
}