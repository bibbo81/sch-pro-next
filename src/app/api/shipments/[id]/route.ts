import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createSupabaseServer } from '@/lib/auth'

// GET - Ottieni spedizione per ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { id } = params
    console.log('🔍 GET shipment:', id)
    
    // ✅ DESTRUCTURING CORRETTO
    const { user, organizationId } = await requireAuth()
    const supabase = await createSupabaseServer()

    console.log('✅ User authenticated:', user.email)
    console.log('🏢 Organization ID:', organizationId)

    // ✅ Query con i dettagli completi della spedizione
    const { data: shipment, error } = await supabase
      .from('shipments')
      .select(`
        *,
        shipment_items (
          id,
          product_id,
          description,
          quantity,
          unit_price,
          currency,
          weight_kg,
          hs_code,
          origin_country,
          created_at,
          updated_at,
          products (
            id,
            description,
            sku,
            unit_price,
            currency
          )
        )
      `)
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single() as any

    if (error) {
      console.error('❌ Supabase query error:', error)
      
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: false,
          error: 'Spedizione non trovata o accesso negato'
        }, { status: 404 })
      }

      return NextResponse.json({
        success: false,
        error: 'Database query error',
        details: error.message
      }, { status: 500 })
    }

    console.log('✅ Shipment fetched:', shipment?.id)

    return NextResponse.json({
      success: true,
      data: shipment
    })

  } catch (error) {
    console.error('❌ GET /api/shipments/[id] error:', error)
    
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

// PUT - Aggiorna spedizione specifica
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { id } = params
    const body = await request.json()
    console.log('🔄 PUT shipment:', id)
    
    // ✅ DESTRUCTURING CORRETTO
    const { user, organizationId, membership } = await requireAuth()
    const supabase = await createSupabaseServer()
    
    console.log('✅ User authenticated:', user.email)
    console.log('🏢 Organization ID:', organizationId)

    if (!body) {
      return NextResponse.json({
        success: false,
        error: 'Dati richiesti mancanti'
      }, { status: 400 })
    }

    // ✅ Verifica che la spedizione appartenga all'organizzazione
    const { data: existingShipment, error: fetchError } = await supabase
      .from('shipments')
      .select('id, user_id, organization_id, status, tracking_number')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single() as any

    if (fetchError || !existingShipment) {
      return NextResponse.json({
        success: false,
        error: 'Spedizione non trovata o accesso negato'
      }, { status: 404 })
    }

    // ✅ Verifica permessi
    const canEdit = membership.role === 'admin' || 
                   existingShipment.user_id === user.id

    if (!canEdit) {
      return NextResponse.json({
        success: false,
        error: 'Permesso negato: non puoi modificare questa spedizione'
      }, { status: 403 })
    }

    console.log('🔍 Updating shipment:', existingShipment.tracking_number || id)

    // ✅ PREPARA I DATI DELL'UPDATE CON TIPO PULITO
    const updates = {
      recipient_name: body.recipient_name || undefined,
      recipient_email: body.recipient_email || undefined,
      recipient_phone: body.recipient_phone || undefined,
      origin_address: body.origin_address || undefined,
      destination_address: body.destination_address || undefined,
      tracking_number: body.tracking_number || undefined,
      carrier: body.carrier || undefined,
      forwarder_id: body.forwarder_id || undefined,
      service_type: body.service_type || undefined,
      status: body.status || undefined,
      weight_kg: body.weight_kg || undefined,
      dimensions_cm: body.dimensions_cm || undefined,
      declared_value: body.declared_value || undefined,
      currency: body.currency || undefined,
      insurance_value: body.insurance_value || undefined,
      delivery_instructions: body.delivery_instructions || undefined,
      pickup_date: body.pickup_date || undefined,
      estimated_delivery: body.estimated_delivery || undefined,
      actual_delivery: body.actual_delivery || undefined,
      notes: body.notes || undefined,
      metadata: body.metadata || undefined,
      updated_at: new Date().toISOString()
    }

    // ✅ RIMUOVI LE PROPRIETÀ UNDEFINED
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    )

    // ✅ BYPASS TYPING ISSUES con dati puliti
    const supabaseRaw = supabase as any
    
    const { data: updatedShipment, error } = await supabaseRaw
      .from('shipments')
      .update(cleanUpdates)  // ✅ USA DATI PULITI
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select(`
        *,
        shipment_items (
          id,
          product_id,
          description,
          quantity,
          unit_price,
          currency,
          weight_kg,
          hs_code,
          origin_country,
          products (
            id,
            description,
            sku,
            unit_price,
            currency
          )
        )
      `)
      .single()

    if (error) {
      console.error('❌ Supabase update error:', error)
      
      if (error.code === '23505') {
        return NextResponse.json({
          success: false,
          error: 'Numero di tracking già esistente',
          details: error.message
        }, { status: 409 })
      }

      if (error.code === '23502') {
        return NextResponse.json({
          success: false,
          error: 'Campo obbligatorio mancante',
          details: error.message
        }, { status: 400 })
      }

      return NextResponse.json({
        success: false,
        error: 'Database update error',
        details: error.message
      }, { status: 500 })
    }

    console.log('✅ Shipment updated successfully:', updatedShipment?.id)

    return NextResponse.json({
      success: true,
      data: updatedShipment,
      message: 'Spedizione aggiornata con successo'
    })

  } catch (error) {
    console.error('❌ PUT /api/shipments/[id] error:', error)
    
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

// DELETE - Elimina spedizione
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { id } = params
    console.log('🗑️ DELETE shipment:', id)
    
    // ✅ DESTRUCTURING CORRETTO
    const { user, organizationId, membership } = await requireAuth()
    const supabase = await createSupabaseServer()

    console.log('✅ User authenticated:', user.email)
    console.log('🏢 Organization ID:', organizationId)

    // ✅ Verifica che la spedizione appartenga all'organizzazione
    const { data: existingShipment, error: fetchError } = await supabase
      .from('shipments')
      .select('id, user_id, organization_id, status, tracking_number')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single() as any

    if (fetchError || !existingShipment) {
      return NextResponse.json({
        success: false,
        error: 'Spedizione non trovata o accesso negato'
      }, { status: 404 })
    }

    // ✅ Verifica permessi: solo admin o creatore possono eliminare
    const canDelete = membership.role === 'admin' || 
                     existingShipment.user_id === user.id

    if (!canDelete) {
      return NextResponse.json({
        success: false,
        error: 'Permesso negato: non puoi eliminare questa spedizione'
      }, { status: 403 })
    }

    // ✅ Controllo stato: non eliminare spedizioni in corso
    if (existingShipment.status === 'shipped' || existingShipment.status === 'in_transit') {
      return NextResponse.json({
        success: false,
        error: 'Non puoi eliminare una spedizione già spedita o in transito'
      }, { status: 400 })
    }

    console.log('🔍 Deleting shipment:', existingShipment.tracking_number || id)

    // ✅ Elimina prima gli items (cascade delete dovrebbe funzionare)
    const supabaseRaw = supabase as any
    
    const { error: itemsError } = await supabaseRaw
      .from('shipment_items')
      .delete()
      .eq('shipment_id', id)
      .eq('organization_id', organizationId)

    if (itemsError) {
      console.error('❌ Error deleting shipment items:', itemsError)
      // Non bloccare se gli items non esistono
    }

    // ✅ Elimina la spedizione
    const { error } = await supabaseRaw
      .from('shipments')
      .delete()
      .eq('id', id)
      .eq('organization_id', organizationId)

    if (error) {
      console.error('❌ Supabase delete error:', error)
      return NextResponse.json({
        success: false,
        error: 'Errore nell\'eliminazione della spedizione',
        details: error.message
      }, { status: 500 })
    }

    console.log('✅ Shipment deleted successfully')

    return NextResponse.json({
      success: true,
      message: 'Spedizione eliminata con successo',
      deletedShipment: {
        id: existingShipment.id,
        tracking_number: existingShipment.tracking_number,
        status: existingShipment.status
      }
    })

  } catch (error) {
    console.error('❌ DELETE /api/shipments/[id] error:', error)
    
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