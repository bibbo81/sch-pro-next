import { NextRequest, NextResponse } from 'next/server'
import { TrackingService } from '@/lib/trackingService'

// Mock user ID per ora
const MOCK_USER_ID = '21766c53-a16b-4019-9a11-845ecea8cf10'

export async function POST(request: NextRequest) {
  try {
    const { tracking_numbers } = await request.json()

    if (!tracking_numbers || !Array.isArray(tracking_numbers)) {
      return NextResponse.json({
        success: false,
        error: 'Array di numeri tracking richiesto'
      }, { status: 400 })
    }

    // Controlla quali tracking esistono già nel database
    const results = await Promise.all(
      tracking_numbers.map(async (trackingNumber) => {
        try {
          const existingTracking = await TrackingService.getByTrackingNumber(trackingNumber, MOCK_USER_ID)
          
          if (existingTracking) {
            return {
              tracking_number: trackingNumber,
              exists: true,
              data: {
                id: existingTracking.id,
                tracking_number: existingTracking.tracking_number,
                status: existingTracking.status,
                carrier_name: existingTracking.carrier_name,
                origin_port: existingTracking.origin_port,
                destination_port: existingTracking.destination_port,
                eta: existingTracking.eta,
                tracking_type: existingTracking.tracking_type,
                vessel_name: existingTracking.vessel_name,
                events: existingTracking.metadata?.events || [],
                last_update: existingTracking.updated_at,
                source: 'database'
              }
            }
          } else {
            return {
              tracking_number: trackingNumber,
              exists: false,
              data: null
            }
          }
        } catch (err) {
          return {
            tracking_number: trackingNumber,
            exists: false,
            error: 'Errore di connessione database'
          }
        }
      })
    )

    const existing = results.filter(r => r.exists)
    const missing = results.filter(r => !r.exists)

    return NextResponse.json({
      success: true,
      existing: existing,
      missing: missing.map(m => m.tracking_number),
      stats: {
        total: tracking_numbers.length,
        found: existing.length,
        notFound: missing.length
      }
    })

  } catch (error) {
    console.error('Database Check API Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Errore nella verifica tracking'
    }, { status: 500 })
  }
}