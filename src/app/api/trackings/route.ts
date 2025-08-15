import { NextRequest, NextResponse } from 'next/server'
import { TrackingService } from '@/lib/trackingService'

// Mock user ID per ora
const MOCK_USER_ID = '21766c53-a16b-4019-9a11-845ecea8cf10'

// GET - Ottieni tutti i tracking
export async function GET() {
  try {
    const trackings = await TrackingService.getAll(MOCK_USER_ID)
    return NextResponse.json({
      success: true,
      data: trackings,
      count: trackings.length
    })
  } catch (error) {
    console.error('GET /api/trackings error:', error)
    return NextResponse.json({
      success: false,
      error: 'Errore nel recupero dei tracking'
    }, { status: 500 })
  }
}

// POST - Crea nuovo tracking
export async function POST(request: NextRequest) {
  try {
    const trackingData = await request.json()
    
    // Controlla se esiste già
    const exists = await TrackingService.exists(trackingData.tracking_number, MOCK_USER_ID)
    if (exists) {
      return NextResponse.json({
        success: false,
        error: 'Tracking già esistente'
      }, { status: 409 })
    }

    // Aggiungi user_id se mancante
    const dataWithUser = {
      ...trackingData,
      user_id: MOCK_USER_ID
    }

    const newTracking = await TrackingService.create(dataWithUser)
    return NextResponse.json({
      success: true,
      data: newTracking
    })
  } catch (error) {
    console.error('POST /api/trackings error:', error)
    return NextResponse.json({
      success: false,
      error: 'Errore nella creazione del tracking'
    }, { status: 500 })
  }
}

// DELETE - Elimina tracking
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID tracking richiesto'
      }, { status: 400 })
    }

    await TrackingService.delete(id)
    return NextResponse.json({
      success: true,
      message: 'Tracking eliminato'
    })
  } catch (error) {
    console.error('DELETE /api/trackings error:', error)
    return NextResponse.json({
      success: false,
      error: 'Errore nell\'eliminazione del tracking'
    }, { status: 500 })
  }
}