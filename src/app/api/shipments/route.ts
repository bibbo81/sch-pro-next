import { NextRequest, NextResponse } from 'next/server'
import { ShipmentService } from '@/lib/shipmentService'

// GET - Lista Shipments
export async function GET(request: NextRequest) {
  try {
    // Estrai userId dai query parameters
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'user_id è obbligatorio'
      }, { status: 400 })
    }

    // Passa userId al service
    const shipments = await ShipmentService.getAll(userId)
    return NextResponse.json({
      success: true,
      data: shipments,
      count: shipments.length
    })
  } catch (error) {
    console.error('❌ GET /api/shipments error:', error)
    return NextResponse.json({
      success: false,
      error: 'Errore nel recupero delle spedizioni',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

// POST - Crea nuovo shipment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Assicurati che userId sia nel body
    if (!body.user_id) {
      return NextResponse.json({
        success: false,
        error: 'user_id è obbligatorio'
      }, { status: 400 })
    }

    const newShipment = await ShipmentService.create(body)
    return NextResponse.json({
      success: true,
      data: newShipment
    })
  } catch (error) {
    console.error('❌ POST /api/shipments error:', error)
    return NextResponse.json({
      success: false,
      error: 'Errore nella creazione della spedizione',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}