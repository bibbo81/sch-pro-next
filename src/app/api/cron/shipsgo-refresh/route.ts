import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Starting automatic ShipsGo refresh at:', new Date().toISOString())

    // Verifica che sia una chiamata da Vercel Cron
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createSupabaseServer()

    // Recupera tutte le spedizioni con tracking_number che non sono consegnate
    const { data: shipments, error: shipmentsError } = await supabase
      .from('shipments')
      .select('id, tracking_number, organization_id, status')
      .not('tracking_number', 'is', null)
      .neq('status', 'delivered')
      .neq('status', 'cancelled')

    if (shipmentsError) {
      console.error('❌ Error fetching shipments:', shipmentsError)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch shipments'
      }, { status: 500 })
    }

    if (!shipments || shipments.length === 0) {
      console.log('ℹ️ No shipments to update')
      return NextResponse.json({
        success: true,
        message: 'No shipments to update',
        updated: 0
      })
    }

    console.log(`📦 Found ${shipments.length} shipments to update`)

    // Raggruppa per organization per ottimizzare le chiamate
    const shipmentsByOrg = shipments.reduce((acc, shipment) => {
      const orgId = shipment.organization_id
      if (!acc[orgId]) acc[orgId] = []
      acc[orgId].push(shipment)
      return acc
    }, {} as Record<string, typeof shipments>)

    let totalUpdated = 0
    let totalErrors = 0

    // Processa ogni organizzazione
    for (const [orgId, orgShipments] of Object.entries(shipmentsByOrg)) {
      try {
        const trackingNumbers = orgShipments
          .map(s => s.tracking_number)
          .filter(Boolean) as string[]

        if (trackingNumbers.length === 0) continue

        console.log(`🏢 Processing ${trackingNumbers.length} shipments for org ${orgId}`)

        // Chiama l'API batch di ShipsGo
        const batchResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/shipsgo/batch`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tracking_numbers: trackingNumbers
          })
        })

        if (!batchResponse.ok) {
          console.error(`❌ Batch API failed for org ${orgId}:`, batchResponse.status)
          totalErrors += trackingNumbers.length
          continue
        }

        const batchData = await batchResponse.json()

        if (!batchData.success || !batchData.data) {
          console.error(`❌ Invalid batch response for org ${orgId}:`, batchData.error)
          totalErrors += trackingNumbers.length
          continue
        }

        // Aggiorna le spedizioni nel database
        for (const trackingData of batchData.data) {
          if (!trackingData.success) {
            console.log(`⚠️ Tracking failed for ${trackingData.tracking_number}: ${trackingData.error}`)
            totalErrors++
            continue
          }

          // Trova la spedizione corrispondente
          const shipment = orgShipments.find(s => s.tracking_number === trackingData.tracking_number)
          if (!shipment) continue

          // Aggiorna la spedizione con i nuovi dati
          const { error: updateError } = await supabase
            .from('shipments')
            .update({
              status: mapShipsGoStatusToInternal(trackingData.status),
              carrier_name: trackingData.carrier_name || undefined,
              origin_port: trackingData.origin_port || undefined,
              destination_port: trackingData.destination_port || undefined,
              eta: trackingData.eta || undefined,
              vessel_name: trackingData.vessel_name || undefined,
              container_number: trackingData.container_number || undefined,
              container_type: trackingData.container_type || undefined,
              total_weight_kg: trackingData.weight_kg || undefined,
              total_volume_m3: trackingData.volume_cbm || undefined,
              updated_at: new Date().toISOString()
            })
            .eq('id', shipment.id)

          if (updateError) {
            console.error(`❌ Failed to update shipment ${shipment.id}:`, updateError)
            totalErrors++
          } else {
            console.log(`✅ Updated shipment ${shipment.id} (${trackingData.tracking_number})`)
            totalUpdated++
          }

          // Aggiorna anche la tabella trackings se esiste un record
          if (trackingData.events && trackingData.events.length > 0) {
            const { error: trackingError } = await supabase
              .from('trackings')
              .upsert({
                tracking_number: trackingData.tracking_number,
                organization_id: shipment.organization_id,
                status: trackingData.status,
                carrier_name: trackingData.carrier_name,
                origin_port: trackingData.origin_port,
                destination_port: trackingData.destination_port,
                eta: trackingData.eta,
                vessel_name: trackingData.vessel_name,
                events: trackingData.events,
                last_update: trackingData.last_update || new Date().toISOString(),
                updated_at: new Date().toISOString()
              }, {
                onConflict: 'tracking_number,organization_id'
              })

            if (trackingError) {
              console.error(`❌ Failed to update tracking ${trackingData.tracking_number}:`, trackingError)
            }
          }
        }

        console.log(`✅ Completed org ${orgId}: ${batchData.stats?.success || 0} successful, ${batchData.stats?.errors || 0} errors`)

      } catch (orgError) {
        console.error(`❌ Error processing org ${orgId}:`, orgError)
        totalErrors += orgShipments.length
      }
    }

    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      total_shipments: shipments.length,
      updated: totalUpdated,
      errors: totalErrors,
      organizations_processed: Object.keys(shipmentsByOrg).length
    }

    console.log('✅ Automatic ShipsGo refresh completed:', summary)

    return NextResponse.json(summary)

  } catch (error) {
    console.error('❌ Cron job failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Mappa gli stati di ShipsGo agli stati interni
function mapShipsGoStatusToInternal(shipsGoStatus: string): string {
  const statusMap: { [key: string]: string } = {
    'SAILING': 'in_transit',
    'DELIVERED': 'delivered',
    'PICKED_UP': 'in_transit',
    'DEPARTED': 'in_transit',
    'ARRIVED': 'arrived',
    'EXCEPTION': 'exception',
    'PENDING': 'pending'
  }

  return statusMap[shipsGoStatus?.toUpperCase()] || 'pending'
}

// Solo GET è supportato per i cron jobs
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed. This endpoint is for cron jobs only.' },
    { status: 405 }
  )
}