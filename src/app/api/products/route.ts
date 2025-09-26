import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createSupabaseServer } from '@/lib/auth'  // ✅ IMPORT CORRETTO!
import { Database } from '@/types/supabase'

// ✅ TIPI ESPLICITI
type Product = Database['public']['Tables']['products']['Row']
type ProductInsert = Database['public']['Tables']['products']['Insert']

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 API GET /api/products started')
    
    const { organizationId, user } = await requireAuth()
    const supabase = await createSupabaseServer()

    console.log('✅ User authenticated:', user.email)
    console.log('🏢 Organization ID:', organizationId)

    // ✅ CAST LA QUERY SELECT COME ANY
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false }) as any

    if (error) {
      console.error('❌ Supabase error:', error)
      return NextResponse.json({
        success: false,
        error: 'Database error',
        details: error.message
      }, { status: 500 })
    }

    console.log('✅ Products fetched:', products?.length || 0)

    return NextResponse.json({
      success: true,
      data: products || [],
      count: products?.length || 0
    })
  } catch (error) {
    console.error('❌ GET /api/products error:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('organization') || error.message.includes('Authentication')) {
        return NextResponse.json({
          success: false,
          error: 'Authentication required',
          message: error.message
        }, { status: 401 })
      }
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API POST /api/products started')
    
    const { organizationId, user } = await requireAuth()
    const supabase = await createSupabaseServer()
    
    console.log('✅ User authenticated:', user.email)
    console.log('🏢 Organization ID:', organizationId)

    const body = await request.json()
    
    if (!body.description && !body.name) {
      return NextResponse.json({
        success: false,
        error: 'Nome o Descrizione è obbligatorio'
      }, { status: 400 })
    }

    if (!body.sku) {
      return NextResponse.json({
        success: false,
        error: 'SKU è obbligatorio'
      }, { status: 400 })
    }

    // ✅ CREA L'OGGETTO SENZA TIPIZZAZIONE PRIMA
    const productData = {
      organization_id: organizationId,
      user_id: user.id,
      description: body.description || body.name || '',
      sku: body.sku || '',
      unit_price: body.price || body.unit_price || null,
      currency: body.currency || 'EUR',
      category: body.category || null,
      weight_kg: body.weight_kg || null,
      dimensions_cm: body.dimensions_cm || null,
      ean: body.ean || null,
      hs_code: body.hs_code || null,
      origin_country: body.origin_country || null,
      other_description: body.other_description || null,
      active: body.active !== undefined ? body.active : true,
      metadata: body.metadata || null,
    }

    console.log('🔄 Creating product for organization:', organizationId)

    // ✅ CAST ESPLICITO PER FORZARE IL TIPO
    const { data: newProduct, error } = await supabase
      .from('products')
      .insert(productData as any)
      .select()
      .single() as any

    if (error) {
      console.error('❌ Supabase insert error:', error)
      
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

      if (error.code === '23503') {
        return NextResponse.json({
          success: false,
          error: 'Riferimento non valido (organizzazione o utente)',
          details: error.message
        }, { status: 400 })
      }

      return NextResponse.json({
        success: false,
        error: 'Database insert error',
        details: error.message
      }, { status: 500 })
    }

    console.log('✅ Product created successfully:', newProduct?.id)

    return NextResponse.json({
      success: true,
      data: newProduct,
      message: 'Prodotto creato con successo'
    })
  } catch (error) {
    console.error('❌ POST /api/products error:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('organization') || error.message.includes('Authentication')) {
        return NextResponse.json({
          success: false,
          error: 'Authentication required',
          message: error.message
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