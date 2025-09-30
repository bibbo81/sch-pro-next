import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createSupabaseServer } from '@/lib/auth'
import { logPerformance } from '@/lib/performanceLogger'

// GET - Lista spedizioni dell'organizzazione
export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    console.log('🔍 GET shipments')

    // ✅ DESTRUCTURING CORRETTO
    const { user, organizationId } = await requireAuth()
    const supabase = await createSupabaseServer()
    
    console.log('✅ User authenticated:', user.email)
    console.log('🏢 Organization ID:', organizationId)

    // ✅ Query con parametri URL
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    let query = supabase
      .from('shipments')
      .select(`
        *,
        shipment_items (
          id,
          quantity,
          unit_price,
          products (
            id,
            description,
            sku
          )
        )
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // ✅ Filtri opzionali
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (search && search.trim()) {
      query = query.or(`
        tracking_number.ilike.%${search}%,
        recipient_name.ilike.%${search}%,
        recipient_email.ilike.%${search}%,
        origin_address.ilike.%${search}%,
        destination_address.ilike.%${search}%
      `)
    }

    const { data: shipments, error, count } = await (query as any)

    if (error) {
      console.error('❌ Supabase query error:', error)
      return NextResponse.json({
        success: false,
        error: 'Database query error',
        details: error.message
      }, { status: 500 })
    }

    console.log(`✅ Fetched ${shipments?.length || 0} shipments`)

    // Log performance
    logPerformance({
      endpoint: '/api/shipments',
      method: 'GET',
      statusCode: 200,
      responseTime: Date.now() - startTime,
      userId: user.id,
      organizationId
    })

    return NextResponse.json({
      success: true,
      data: shipments || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    })

  } catch (error) {
    console.error('❌ GET /api/shipments error:', error)

    const statusCode = error instanceof Error && error.message.includes('Authentication') ? 401 : 500

    // Log error performance
    logPerformance({
      endpoint: '/api/shipments',
      method: 'GET',
      statusCode,
      responseTime: Date.now() - startTime,
      errorMessage: error instanceof Error ? error.message : 'Internal server error'
    })

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

// POST - Crea nuova spedizione
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await request.json()
    console.log('📦 POST create shipment')

    // ✅ DESTRUCTURING CORRETTO
    const { user, organizationId } = await requireAuth()
    const supabase = await createSupabaseServer()
    
    console.log('✅ User authenticated:', user.email)
    console.log('🏢 Organization ID:', organizationId)

    if (!body) {
      return NextResponse.json({
        success: false,
        error: 'Dati richiesti mancanti'
      }, { status: 400 })
    }

    // ✅ VALIDAZIONE DATI RICHIESTI
    const requiredFields = ['recipient_name', 'destination_address']
    const missingFields = requiredFields.filter(field => !body[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Campi obbligatori mancanti: ${missingFields.join(', ')}`
      }, { status: 400 })
    }

    // ✅ PREPARA I DATI DELLA SPEDIZIONE CON TIPO PULITO
    const shipmentData = {
      organization_id: organizationId,
      user_id: user.id,
      recipient_name: body.recipient_name || null,
      recipient_email: body.recipient_email || null,
      recipient_phone: body.recipient_phone || null,
      origin_address: body.origin_address || null,
      destination_address: body.destination_address || null,
      tracking_number: body.tracking_number || null,
      carrier: body.carrier || null,
      forwarder_id: body.forwarder_id || null,
      service_type: body.service_type || null,
      status: body.status || 'draft',
      weight_kg: body.weight_kg || null,
      dimensions_cm: body.dimensions_cm || null,
      declared_value: body.declared_value || null,
      currency: body.currency || 'EUR',
      insurance_value: body.insurance_value || null,
      delivery_instructions: body.delivery_instructions || null,
      pickup_date: body.pickup_date || null,
      estimated_delivery: body.estimated_delivery || null,
      actual_delivery: body.actual_delivery || null,
      notes: body.notes || null,
      metadata: body.metadata || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // ✅ RIMUOVI I CAMPI NULL se necessario
    const cleanShipmentData = Object.fromEntries(
      Object.entries(shipmentData).filter(([_, value]) => value !== null)
    )

    // ✅ Crea la spedizione con bypass typing
    const supabaseRaw = supabase as any
    
    const { data: shipment, error: shipmentError } = await supabaseRaw
      .from('shipments')
      .insert(cleanShipmentData)
      .select()
      .single()

    if (shipmentError) {
      console.error('❌ Supabase insert error:', shipmentError)
      
      if (shipmentError.code === '23505') {
        return NextResponse.json({
          success: false,
          error: 'Numero di tracking già esistente',
          details: shipmentError.message
        }, { status: 409 })
      }

      return NextResponse.json({
        success: false,
        error: 'Database insert error',
        details: shipmentError.message
      }, { status: 500 })
    }

    console.log('✅ Shipment created:', shipment?.id)

    // Log performance
    logPerformance({
      endpoint: '/api/shipments',
      method: 'POST',
      statusCode: 201,
      responseTime: Date.now() - startTime,
      userId: user.id,
      organizationId
    })

    // ✅ Se ci sono prodotti, aggiungili come items
    if (body.items && Array.isArray(body.items) && body.items.length > 0) {
      const itemsData = body.items.map((item: any) => ({
        shipment_id: shipment.id,
        organization_id: organizationId,
        product_id: item.product_id || null,
        description: item.description || item.name || null,
        quantity: item.quantity || 1,
        unit_price: item.unit_price || item.price || null,
        currency: item.currency || 'EUR',
        weight_kg: item.weight_kg || null,
        hs_code: item.hs_code || null,
        origin_country: item.origin_country || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))

      const { error: itemsError } = await supabaseRaw
        .from('shipment_items')
        .insert(itemsData)

      if (itemsError) {
        console.error('❌ Error inserting shipment items:', itemsError)
        // Non bloccare la creazione della spedizione per errori negli items
        console.warn('⚠️ Spedizione creata ma errore negli items:', itemsError.message)
      } else {
        console.log(`✅ Added ${itemsData.length} items to shipment`)
      }
    }

    return NextResponse.json({
      success: true,
      data: shipment,
      message: 'Spedizione creata con successo'
    }, { status: 201 })

  } catch (error) {
    console.error('❌ POST /api/shipments error:', error)

    let statusCode = 500
    if (error instanceof Error) {
      if (error.message.includes('Authentication')) statusCode = 401
      if (error.message.includes('JSON')) statusCode = 400
    }

    // Log error performance
    logPerformance({
      endpoint: '/api/shipments',
      method: 'POST',
      statusCode,
      responseTime: Date.now() - startTime,
      errorMessage: error instanceof Error ? error.message : 'Internal server error'
    })

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

// PUT - Aggiorna spedizione esistente (bulk update)
export async function PUT(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await request.json()
    console.log('🔄 PUT update shipment')

    // ✅ DESTRUCTURING CORRETTO
    const { user, organizationId, membership } = await requireAuth()
    const supabase = await createSupabaseServer()
    
    console.log('✅ User authenticated:', user.email)
    console.log('🏢 Organization ID:', organizationId)

    if (!body || !body.id) {
      return NextResponse.json({
        success: false,
        error: 'ID spedizione richiesto'
      }, { status: 400 })
    }

    // ✅ Verifica che la spedizione appartenga all'organizzazione
    const { data: existingShipment, error: fetchError } = await supabase
      .from('shipments')
      .select('id, user_id, organization_id, status, tracking_number')
      .eq('id', body.id)
      .eq('organization_id', organizationId)
      .single() as any

    if (fetchError || !existingShipment) {
      return NextResponse.json({
        success: false,
        error: 'Spedizione non trovata o accesso negato'
      }, { status: 404 })
    }

    // ✅ Verifica permessi: solo admin o creatore possono modificare
    const canEdit = membership.role === 'admin' || 
                   existingShipment.user_id === user.id

    if (!canEdit) {
      return NextResponse.json({
        success: false,
        error: 'Permesso negato: non puoi modificare questa spedizione'
      }, { status: 403 })
    }

    // ✅ PREPARA I DATI DELL'UPDATE CON TIPO PULITO
    const shipmentUpdate = {
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
    const cleanShipmentUpdate = Object.fromEntries(
      Object.entries(shipmentUpdate).filter(([_, value]) => value !== undefined)
    )

    console.log('🔍 Updating shipment:', existingShipment.tracking_number || existingShipment.id)

    // ✅ BYPASS TYPING ISSUES con dati puliti
    const supabaseRaw = supabase as any
    
    const { data: updatedShipment, error } = await supabaseRaw
      .from('shipments')
      .update(cleanShipmentUpdate)  // ✅ USA DATI PULITI
      .eq('id', body.id)
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

      return NextResponse.json({
        success: false,
        error: 'Database update error',
        details: error.message
      }, { status: 500 })
    }

    console.log('✅ Shipment updated successfully:', updatedShipment?.id)

    // Log performance
    logPerformance({
      endpoint: '/api/shipments',
      method: 'PUT',
      statusCode: 200,
      responseTime: Date.now() - startTime,
      userId: user.id,
      organizationId
    })

    return NextResponse.json({
      success: true,
      data: updatedShipment,
      message: 'Spedizione aggiornata con successo'
    })

  } catch (error) {
    console.error('❌ PUT /api/shipments error:', error)

    let statusCode = 500
    if (error instanceof Error) {
      if (error.message.includes('Authentication')) statusCode = 401
      if (error.message.includes('JSON')) statusCode = 400
    }

    // Log error performance
    logPerformance({
      endpoint: '/api/shipments',
      method: 'PUT',
      statusCode,
      responseTime: Date.now() - startTime,
      errorMessage: error instanceof Error ? error.message : 'Internal server error'
    })

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