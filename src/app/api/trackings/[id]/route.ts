import { NextRequest, NextResponse } from 'next/server'
import { TrackingService } from '@/lib/trackingService'

// PUT - Update tracking
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('🔍 PUT /api/trackings/[id] chiamata per ID:', params.id)

  try {
    const body = await request.json()
    console.log('🔍 Dati per update:', body)

    const updatedTracking = await TrackingService.update(params.id, body)
    
    console.log('✅ Tracking aggiornato:', updatedTracking.id)
    
    return NextResponse.json({
      success: true,
      data: updatedTracking,
      message: 'Tracking aggiornato con successo'
    })
  } catch (error) {
    console.error('❌ PUT /api/trackings/[id] error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Errore nell\'aggiornamento del tracking',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

// GET - Singolo tracking by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('🔍 GET /api/trackings/[id] chiamata per ID:', params.id)

  try {
    const tracking = await TrackingService.getById(params.id)
    
    if (!tracking) {
      return NextResponse.json({
        success: false,
        error: 'Tracking non trovato'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: tracking
    })
  } catch (error) {
    console.error('❌ GET /api/trackings/[id] error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Errore nel recupero del tracking',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

// DELETE - Elimina singolo tracking by ID  
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('🔍 DELETE /api/trackings/[id] chiamata per ID:', params.id)

  try {
    await TrackingService.delete(params.id)
    
    console.log('✅ Tracking eliminato:', params.id)
    
    return NextResponse.json({
      success: true,
      message: 'Tracking eliminato'
    })
  } catch (error) {
    console.error('❌ DELETE /api/trackings/[id] error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Errore nell\'eliminazione del tracking',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}