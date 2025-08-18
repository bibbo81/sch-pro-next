import { NextRequest, NextResponse } from 'next/server'
import { TrackingService } from '@/lib/trackingService'

// Mock user ID per ora
const MOCK_USER_ID = '21766c53-a16b-4019-9a11-845ecea8cf10'

// GET - Lista tutti i trackings
export async function GET() {
  console.log('🔍 GET /api/trackings chiamata')

  try {
    const trackings = await TrackingService.getAll(MOCK_USER_ID)
    
    console.log('✅ Trackings caricati:', trackings?.length || 0)
    
    return NextResponse.json({
      success: true,
      data: trackings || [],
      count: trackings?.length || 0
    })
  } catch (error) {
    console.error('❌ GET /api/trackings error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Errore nel recupero dei tracking',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

// POST - Crea nuovo tracking
export async function POST(request: NextRequest) {
  console.log('🔍 POST /api/trackings chiamata')

  try {
    const trackingData = await request.json()
    console.log('🔍 Dati ricevuti:', trackingData)
    
    // Validazione
    if (!trackingData.tracking_number) {
      return NextResponse.json({
        success: false,
        error: 'Numero di tracking obbligatorio'
      }, { status: 400 })
    }

    // Aggiungi metadata
    const dataWithUser = {
      ...trackingData,
      user_id: MOCK_USER_ID,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: trackingData.status || 'active',
      is_manual: true
    }

    const newTracking = await TrackingService.create(dataWithUser)
    
    console.log('✅ Nuovo tracking creato:', newTracking.id)
    
    return NextResponse.json({
      success: true,
      data: newTracking,
      message: 'Tracking creato con successo'
    })
  } catch (error) {
    console.error('❌ POST /api/trackings error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Errore nella creazione del tracking',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

// DELETE - Elimina tracking
export async function DELETE(request: NextRequest) {
  console.log('🔍 DELETE /api/trackings chiamata')

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
    
    console.log('✅ Tracking eliminato:', id)
    
    return NextResponse.json({
      success: true,
      message: 'Tracking eliminato'
    })
  } catch (error) {
    console.error('❌ DELETE /api/trackings error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Errore nell\'eliminazione del tracking',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}