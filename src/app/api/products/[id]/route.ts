import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createSupabaseServer } from '@/lib/auth'

// GET - Ottieni singolo prodotto per ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    console.log('🔍 GET product:', id)
    
    // ✅ DESTRUCTURING CORRETTO
    const { user, organizationId, membership } = await requireAuth()
    const supabase = await createSupabaseServer()

    console.log('✅ User authenticated:', user.email)
    console.log('🏢 Organization ID:', organizationId)

    // ✅ Query con cast per evitare errori TypeScript
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single() as any

    if (error) {
      console.error('❌ Supabase get error:', error)
      
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: false,
          error: 'Prodotto non trovato o accesso negato'
        }, { status: 404 })
      }

      return NextResponse.json({
        success: false,
        error: 'Database error',
        details: error.message
      }, { status: 500 })
    }

    console.log('✅ Product fetched:', product?.id)

    return NextResponse.json({
      success: true,
      data: product
    })

  } catch (error) {
    console.error('❌ GET /api/products/[id] error:', error)
    
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

// PUT - Aggiorna prodotto esistente
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    console.log('🔄 PUT product:', id)
    
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

    // ✅ Verifica che il prodotto appartenga all'organizzazione
    const { data: existingProduct, error: fetchError } = await supabase
      .from('products')
      .select('id, user_id, organization_id, description, sku')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single() as any

    if (fetchError || !existingProduct) {
      return NextResponse.json({
        success: false,
        error: 'Prodotto non trovato o accesso negato'
      }, { status: 404 })
    }

    // ✅ Verifica permessi: solo admin o creatore possono modificare
    const canEdit = membership.role === 'admin' || 
                   existingProduct.user_id === user.id

    if (!canEdit) {
      return NextResponse.json({
        success: false,
        error: 'Permesso negato: non puoi modificare questo prodotto'
      }, { status: 403 })
    }

    console.log('🔍 Updating product:', existingProduct.description || existingProduct.sku)

    // ✅ Prepara i dati per l'update
    const updateData = {
      description: body.description || body.name || undefined,
      sku: body.sku || undefined,
      unit_price: body.price || body.unit_price || undefined,
      currency: body.currency || undefined,
      category: body.category || undefined,
      weight_kg: body.weight_kg || undefined,
      dimensions_cm: body.dimensions_cm || undefined,
      ean: body.ean || undefined,
      hs_code: body.hs_code || undefined,
      origin_country: body.origin_country || undefined,
      other_description: body.other_description || undefined,
      active: body.active !== undefined ? body.active : undefined,
      metadata: body.metadata || undefined,
      updated_at: new Date().toISOString()
    }

    // ✅ Rimuovi le proprietà undefined per evitare problemi
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    )

    // ✅ Bypass typing issues
    const supabaseRaw = supabase as any
    
    const { data: updatedProduct, error } = await supabaseRaw
      .from('products')
      .update(cleanUpdateData)
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select()
      .single()

    if (error) {
      console.error('❌ Supabase update error:', error)
      
      if (error.code === '23505') {
        return NextResponse.json({
          success: false,
          error: 'SKU già esistente per questa organizzazione',
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

    console.log('✅ Product updated successfully:', updatedProduct?.id)

    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: 'Prodotto aggiornato con successo'
    })

  } catch (error) {
    console.error('❌ PUT /api/products/[id] error:', error)
    
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

// DELETE - Elimina prodotto
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    console.log('🗑️ DELETE product:', id)
    
    // ✅ DESTRUCTURING CORRETTO
    const { user, organizationId, membership } = await requireAuth()
    const supabase = await createSupabaseServer()

    console.log('✅ User authenticated:', user.email)
    console.log('🏢 Organization ID:', organizationId)

    // ✅ Verifica esistenza e ownership
    const { data: existingProduct, error: fetchError } = await supabase
      .from('products')
      .select('id, user_id, organization_id, description, sku')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single() as any

    if (fetchError || !existingProduct) {
      return NextResponse.json({
        success: false,
        error: 'Prodotto non trovato o accesso negato'
      }, { status: 404 })
    }

    // ✅ Verifica permessi: solo admin o creatore possono eliminare
    const canDelete = membership.role === 'admin' || 
                     existingProduct.user_id === user.id

    if (!canDelete) {
      return NextResponse.json({
        success: false,
        error: 'Permesso negato: non puoi eliminare questo prodotto'
      }, { status: 403 })
    }

    console.log('🔍 Deleting product:', existingProduct.description || existingProduct.sku)

    // ✅ Elimina il prodotto con bypass typing
    const supabaseRaw = supabase as any
    
    const { error } = await supabaseRaw
      .from('products')
      .delete()
      .eq('id', id)
      .eq('organization_id', organizationId)

    if (error) {
      console.error('❌ Supabase delete error:', error)
      return NextResponse.json({
        success: false,
        error: 'Errore nell\'eliminazione del prodotto',
        details: error.message
      }, { status: 500 })
    }

    console.log('✅ Product deleted successfully')

    return NextResponse.json({
      success: true,
      message: 'Prodotto eliminato con successo',
      deletedProduct: {
        id: existingProduct.id,
        description: existingProduct.description,
        sku: existingProduct.sku
      }
    })

  } catch (error) {
    console.error('❌ DELETE /api/products/[id] error:', error)
    
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