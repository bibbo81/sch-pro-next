import { NextRequest, NextResponse } from 'next/server'

const SHIPSGO_API_BASE = 'https://api.shipsgo.com/v2'
const SHIPSGO_API_KEY = process.env.SHIPSGO_API_KEY

export async function POST(request: NextRequest) {
  try {
    const { tracking_numbers } = await request.json()

    if (!tracking_numbers || !Array.isArray(tracking_numbers)) {
      return NextResponse.json({
        success: false,
        error: 'Array di numeri tracking richiesto'
      }, { status: 400 })
    }

    // Processa in batch di massimo 10 per volta per evitare timeout
    const batchSize = 10
    const results = []

    for (let i = 0; i < tracking_numbers.length; i += batchSize) {
      const batch = tracking_numbers.slice(i, i + batchSize)
      
      const batchPromises = batch.map(async (trackingNumber) => {
        try {
          const response = await fetch(`${SHIPSGO_API_BASE}/track`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${SHIPSGO_API_KEY}`
            },
            body: JSON.stringify({
              tracking_number: trackingNumber,
              carrier_code: 'auto'
            })
          })

          const data = await response.json()

          if (response.ok && data.data) {
            return {
              id: data.data?.tracking_number || trackingNumber,
              tracking_number: data.data?.tracking_number,
              status: mapShipsGoStatus(data.data?.status),
              carrier_name: data.data?.carrier_name,
              origin_port: data.data?.origin?.name,
              destination_port: data.data?.destination?.name,
              eta: data.data?.estimated_arrival_time,
              tracking_type: detectTrackingType(trackingNumber),
              awb_number: data.data?.awb_number,
              container_number: data.data?.container_number,
              vessel_name: data.data?.vessel?.name,
              events: data.data?.events || [],
              last_update: data.data?.last_update,
              success: true
            }
          } else {
            return {
              id: trackingNumber,
              tracking_number: trackingNumber,
              status: 'ERROR',
              error: data.message || 'Errore nel tracking',
              success: false
            }
          }
        } catch (err) {
          return {
            id: trackingNumber,
            tracking_number: trackingNumber,
            status: 'ERROR',
            error: 'Errore di connessione',
            success: false
          }
        }
      })

      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)
    }

    const successCount = results.filter(r => r.success).length
    const errorCount = results.filter(r => !r.success).length

    return NextResponse.json({
      success: true,
      data: results,
      total: results.length,
      stats: {
        success: successCount,
        errors: errorCount
      }
    })

  } catch (error) {
    console.error('ShipsGO Batch API Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Errore nella connessione batch a ShipsGO'
    }, { status: 500 })
  }
}

// Funzioni helper mancanti
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