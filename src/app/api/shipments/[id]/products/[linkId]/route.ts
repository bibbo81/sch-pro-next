import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createSupabaseServer } from '@/lib/auth'
import { Database } from '@/types/supabase'

// ✅ TIPI PER SHIPMENT_ITEMS
type ShipmentItem = Database['public']['Tables']['shipment_items']['Row']
type ShipmentItemUpdate = Database['public']['Tables']['shipment_items']['Update']

// PUT - Aggiorna item nella spedizione
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string; linkId: string }> }
) {
  try {
    const params = await context.params
    const { id, linkId } = params
    console.log('🔄 PUT shipment item:', { shipmentId: id, itemId: linkId })
    
    // ✅ DESTRUCTURING CORRETTO
    const { user, organizationId, membership } = await requireAuth()
    const supabase = await createSupabaseServer()
    
    const body = await request.json()
    
    console.log('✅ User authenticated:', user.email)
    console.log('🏢 Organization ID:', organizationId)

    if (!body) {
      return NextResponse.json({
        success: false,
        error: 'Dati richiesti mancanti'
      }, { status: 400 })
    }

    // ✅ Verifica che la spedizione appartenga all'organizzazione
    const { data: shipment, error: shipmentError } = await supabase
      .from('shipments')
      .select('id, organization_id, user_id')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single() as any

    if (shipmentError || !shipment) {
      return NextResponse.json({
        success: false,
        error: 'Spedizione non trovata o accesso negato'
      }, { status: 404 })
    }

    // ✅ Verifica permessi sulla spedizione
    const canEditShipment = membership.role === 'admin' || 
                           shipment.user_id === user.id

    if (!canEditShipment) {
      return NextResponse.json({
        success: false,
        error: 'Permesso negato: non puoi modificare questa spedizione'
      }, { status: 403 })
    }

    // ✅ Verifica che l'item appartenga alla spedizione e organizzazione
    const { data: existingItem, error: itemError } = await supabase
      .from('shipment_items')
      .select('id, shipment_id, organization_id')
      .eq('id', linkId)
      .eq('shipment_id', id)
      .eq('organization_id', organizationId)
      .single() as any

    if (itemError || !existingItem) {
      return NextResponse.json({
        success: false,
        error: 'Item non trovato nella spedizione'
      }, { status: 404 })
    }

    // ✅ Prepara i dati per l'update
    const updateData = {
      ...body,
      updated_at: new Date().toISOString()
    }

    // ✅ Bypass typing issues
    const supabaseRaw = supabase as any
    
    const { data, error } = await supabaseRaw
      .from('shipment_items')
      .update(updateData)
      .eq('id', linkId)
      .eq('shipment_id', id)
      .eq('organization_id', organizationId)
      .select()
      .single()

    if (error) {
      console.error('❌ Supabase update error:', error)
      
      if (error.code === '23503') {
        return NextResponse.json({
          success: false,
          error: 'Riferimento non valido (prodotto non trovato)',
          details: error.message
        }, { status: 400 })
      }

      return NextResponse.json({
        success: false,
        error: 'Database update error',
        details: error.message
      }, { status: 500 })
    }

    console.log('✅ Shipment item updated:', data?.id)

    return NextResponse.json({
      success: true,
      data: data,
      message: 'Item spedizione aggiornato con successo'
    })

  } catch (error) {
    console.error('❌ PUT /api/shipments/[id]/products/[linkId] error:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('Authentication')) {
        return NextResponse.json({
          success: false,
          error: 'Authentication required'
        }, { status: 401 })
      }

      if (error.message.includes('JSON')) {
        return NextResponse.json({
          success: false,
          error: 'Formato dati non valido'
        }, { status: 400 })
      }
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// GET - Ottieni singolo item della spedizione
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string; linkId: string }> }
) {
  try {
    const params = await context.params
    const { id, linkId } = params
    console.log('🔍 GET shipment item:', { shipmentId: id, itemId: linkId })
    
    // ✅ DESTRUCTURING CORRETTO
    const { user, organizationId, membership } = await requireAuth()
    const supabase = await createSupabaseServer()

    console.log('✅ User authenticated:', user.email)
    console.log('🏢 Organization ID:', organizationId)

    // ✅ Verifica accesso alla spedizione
    const { data: shipment, error: shipmentError } = await supabase
      .from('shipments')
      .select('id, organization_id')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single() as any

    if (shipmentError || !shipment) {
      return NextResponse.json({
        success: false,
        error: 'Spedizione non trovata o accesso negato'
      }, { status: 404 })
    }

    // ✅ Ottieni l'item con i dettagli del prodotto
    const { data: item, error } = await supabase
      .from('shipment_items')
      .select(`
        *,
        products (
          id,
          description,
          sku,
          unit_price,
          currency
        )
      `)
      .eq('id', linkId)
      .eq('shipment_id', id)
      .eq('organization_id', organizationId)
      .single() as any

    if (error) {
      console.error('❌ Supabase get error:', error)
      
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: false,
          error: 'Item non trovato nella spedizione'
        }, { status: 404 })
      }

      return NextResponse.json({
        success: false,
        error: 'Database error',
        details: error.message
      }, { status: 500 })
    }

    console.log('✅ Shipment item fetched:', item?.id)

    return NextResponse.json({
      success: true,
      data: item
    })

  } catch (error) {
    console.error('❌ GET /api/shipments/[id]/products/[linkId] error:', error)
    
    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// DELETE - Rimuovi item dalla spedizione
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; linkId: string }> }
) {
  try {
    const params = await context.params
    const { id, linkId } = params
    console.log('🗑️ DELETE shipment item:', { shipmentId: id, itemId: linkId })
    
    // ✅ DESTRUCTURING CORRETTO
    const { user, organizationId, membership } = await requireAuth()
    const supabase = await createSupabaseServer()

    console.log('✅ User authenticated:', user.email)
    console.log('🏢 Organization ID:', organizationId)

    // ✅ Verifica che la spedizione appartenga all'organizzazione
    const { data: shipment, error: shipmentError } = await supabase
      .from('shipments')
      .select('id, organization_id, user_id')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single() as any

    if (shipmentError || !shipment) {
      return NextResponse.json({
        success: false,
        error: 'Spedizione non trovata o accesso negato'
      }, { status: 404 })
    }

    // ✅ Verifica permessi
    const canEdit = membership.role === 'admin' || 
                   shipment.user_id === user.id

    if (!canEdit) {
      return NextResponse.json({
        success: false,
        error: 'Permesso negato: non puoi modificare questa spedizione'
      }, { status: 403 })
    }

    // ✅ Verifica che l'item esista
    const { data: existingItem, error: itemError } = await supabase
      .from('shipment_items')
      .select('id, shipment_id, organization_id')
      .eq('id', linkId)
      .eq('shipment_id', id)
      .eq('organization_id', organizationId)
      .single() as any

    if (itemError || !existingItem) {
      return NextResponse.json({
        success: false,
        error: 'Item non trovato nella spedizione'
      }, { status: 404 })
    }

    // ✅ Elimina l'item
    const supabaseRaw = supabase as any
    
    const { data, error } = await supabaseRaw
      .from('shipment_items')
      .delete()
      .eq('id', linkId)
      .eq('shipment_id', id)
      .eq('organization_id', organizationId)
      .select()

    if (error) {
      console.error('❌ Supabase delete error:', error)
      return NextResponse.json({
        success: false,
        error: 'Errore nell\'eliminazione dell\'item',
        details: error.message
      }, { status: 500 })
    }

    console.log('✅ Shipment item deleted successfully')

    return NextResponse.json({
      success: true,
      data: data?.[0] || null,
      message: 'Item rimosso dalla spedizione con successo'
    })

  } catch (error) {
    console.error('❌ DELETE /api/shipments/[id]/products/[linkId] error:', error)
    
    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}