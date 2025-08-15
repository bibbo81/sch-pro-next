import { NextRequest, NextResponse } from 'next/server'

const SHIPSGO_API_BASE = 'https://api.shipsgo.com/v2'
const SHIPSGO_API_KEY = process.env.SHIPSGO_API_KEY

export async function POST(request: NextRequest) {
  try {
    const { tracking_number } = await request.json()

    if (!tracking_number) {
      return NextResponse.json({
        success: false,
        error: 'Numero tracking richiesto'
      }, { status: 400 })
    }

    const response = await fetch(`${SHIPSGO_API_BASE}/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SHIPSGO_API_KEY}`
      },
      body: JSON.stringify({
        tracking_number: tracking_number,
        carrier_code: 'auto'
      })
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: data.message || 'Errore nella chiamata ShipsGO'
      }, { status: response.status })
    }

    const mappedData = {
      id: data.data?.tracking_number || tracking_number,
      tracking_number: data.data?.tracking_number,
      status: mapShipsGoStatus(data.data?.status),
      carrier_name: data.data?.carrier_name,
      origin_port: data.data?.origin?.name,
      destination_port: data.data?.destination?.name,
      eta: data.data?.estimated_arrival_time,
      tracking_type: detectTrackingType(tracking_number),
      awb_number: data.data?.awb_number,
      container_number: data.data?.container_number,
      vessel_name: data.data?.vessel?.name,
      events: data.data?.events || [],
      last_update: data.data?.last_update
    }

    return NextResponse.json({
      success: true,
      data: mappedData
    })

  } catch (error) {
    console.error('ShipsGO API Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Errore nella connessione a ShipsGO'
    }, { status: 500 })
  }
}

function mapShipsGoStatus(status: string): string {
  const statusMap: { [key: string]: string } = {
    'in_transit': 'SAILING',
    'delivered': 'DELIVERED',
    'picked_up': 'PICKED_UP',
    'departed': 'DEPARTED',
    'arrived': 'ARRIVED',
    'exception': 'EXCEPTION',
    'pending': 'PENDING'
  }
  return statusMap[status?.toLowerCase()] || status?.toUpperCase() || 'UNKNOWN'
}

function detectTrackingType(trackingNumber: string): string {
  if (/^[A-Z]{4}\d{7}$/.test(trackingNumber)) return 'container'
  if (/^AWB/i.test(trackingNumber)) return 'awb'  
  if (/^\d{10,}$/.test(trackingNumber)) return 'parcel'
  return 'container'
}