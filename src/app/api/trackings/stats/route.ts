import { NextResponse } from 'next/server'
import { TrackingService } from '@/lib/trackingService'

// Mock user ID per ora
const MOCK_USER_ID = '21766c53-a16b-4019-9a11-845ecea8cf10'

export async function GET() {
  try {
    const stats = await TrackingService.getStats(MOCK_USER_ID)
    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('GET /api/trackings/stats error:', error)
    return NextResponse.json({
      success: false,
      error: 'Errore nel recupero delle statistiche'
    }, { status: 500 })
  }
}