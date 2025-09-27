import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createSupabaseServer } from '@/lib/auth'

// PUT - Aggiorna tracking esistente
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { id } = params
    const body = await request.json()
    console.log('🔄 PUT tracking:', id)
    
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

    // ✅ Verifica che il tracking appartenga all'organizzazione
    const { data: existingTracking, error: fetchError } = await supabase
      .from('trackings')
      .select('id, user_id, organization_id, tracking_number, carrier')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single() as any

    if (fetchError || !existingTracking) {
      return NextResponse.json({
        success: false,
        error: 'Tracking non trovato o accesso negato'
      }, { status: 404 })
    }

    // ✅ Verifica permessi: solo admin o creatore possono modificare
    const canEdit = membership.role === 'admin' || 
                   existingTracking.user_id === user.id

    if (!canEdit) {
      return NextResponse.json({
        success: false,
        error: 'Permesso negato: non puoi modificare questo tracking'
      }, { status: 403 })
    }

    console.log('🔍 Updating tracking:', existingTracking.tracking_number)

    // ✅ PREPARA I DATI CON TIPO ESPLICITO
    const updateData = {
      tracking_number: body.tracking_number || undefined,
      carrier: body.carrier || undefined,
      status: body.status || undefined,
      estimated_delivery: body.estimated_delivery || undefined,
      actual_delivery: body.actual_delivery || undefined,
      current_location: body.current_location || undefined,
      notes: body.notes || undefined,
      metadata: body.metadata || undefined,
      updated_at: new Date().toISOString()
    }

    // ✅ RIMUOVI LE PROPRIETÀ UNDEFINED
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    )

    // ✅ BYPASS TYPING ISSUES con cast esplicito
    const supabaseRaw = supabase as any
    
    const { data: updatedTracking, error } = await supabaseRaw
      .from('trackings')
      .update(cleanUpdateData)  // ✅ ORA PULITO e TIPATO
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select()
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

    console.log('✅ Tracking updated successfully:', updatedTracking?.id)

    return NextResponse.json({
      success: true,
      data: updatedTracking,
      message: 'Tracking aggiornato con successo'
    })

  } catch (error) {
    console.error('❌ PUT /api/trackings/[id] error:', error)
    
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
          error: 'Formato dati non valido',
          message: 'Il body della richiesta deve essere un JSON valido'
        }, { status: 400 })
      }
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// GET - Ottieni singolo tracking per ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { id } = params
    console.log('🔍 GET tracking:', id)
    
    // ✅ DESTRUCTURING CORRETTO
    const { user, organizationId, membership } = await requireAuth()
    const supabase = await createSupabaseServer()

    console.log('✅ User authenticated:', user.email)
    console.log('🏢 Organization ID:', organizationId)

    // ✅ Query con cast per evitare errori TypeScript
    const { data: tracking, error } = await supabase
      .from('trackings')
      .select('*')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single() as any

    if (error) {
      console.error('❌ Supabase get error:', error)
      
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: false,
          error: 'Tracking non trovato o accesso negato'
        }, { status: 404 })
      }

      return NextResponse.json({
        success: false,
        error: 'Database error',
        details: error.message
      }, { status: 500 })
    }

    console.log('✅ Tracking fetched:', tracking?.id)

    return NextResponse.json({
      success: true,
      data: tracking
    })

  } catch (error) {
    console.error('❌ GET /api/trackings/[id] error:', error)
    
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

// DELETE - Elimina tracking
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { id } = params
    console.log('🗑️ DELETE tracking:', id)
    
    // ✅ DESTRUCTURING CORRETTO
    const { user, organizationId, membership } = await requireAuth()
    const supabase = await createSupabaseServer()

    console.log('✅ User authenticated:', user.email)
    console.log('🏢 Organization ID:', organizationId)

    // ✅ Verifica esistenza e ownership
    const { data: existingTracking, error: fetchError } = await supabase
      .from('trackings')
      .select('id, user_id, organization_id, tracking_number, carrier')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single() as any

    if (fetchError || !existingTracking) {
      return NextResponse.json({
        success: false,
        error: 'Tracking non trovato o accesso negato'
      }, { status: 404 })
    }

    // ✅ Verifica permessi: solo admin o creatore possono eliminare
    const canDelete = membership.role === 'admin' || 
                     existingTracking.user_id === user.id

    if (!canDelete) {
      return NextResponse.json({
        success: false,
        error: 'Permesso negato: non puoi eliminare questo tracking'
      }, { status: 403 })
    }

    console.log('🔍 Deleting tracking:', existingTracking.tracking_number)

    // ✅ Elimina il tracking con bypass typing
    const supabaseRaw = supabase as any
    
    const { error } = await supabaseRaw
      .from('trackings')
      .delete()
      .eq('id', id)
      .eq('organization_id', organizationId)

    if (error) {
      console.error('❌ Supabase delete error:', error)
      return NextResponse.json({
        success: false,
        error: 'Errore nell\'eliminazione del tracking',
        details: error.message
      }, { status: 500 })
    }

    console.log('✅ Tracking deleted successfully')

    return NextResponse.json({
      success: true,
      message: 'Tracking eliminato con successo',
      deletedTracking: {
        id: existingTracking.id,
        tracking_number: existingTracking.tracking_number,
        carrier: existingTracking.carrier
      }
    })

  } catch (error) {
    console.error('❌ DELETE /api/trackings/[id] error:', error)
    
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