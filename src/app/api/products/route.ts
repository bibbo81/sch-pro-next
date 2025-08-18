import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 API GET /products iniziata')
    console.log('🔑 Service Role Key presente:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
    console.log('🔑 Service Role Key lunghezza:', process.env.SUPABASE_SERVICE_ROLE_KEY?.length)

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'user_id è obbligatorio'
      }, { status: 400 })
    }

    console.log('🔍 Fetching products for user:', userId)
    console.log('🔧 Creando client Supabase...')

    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      
console.log('✅ Query Supabase completata')
    console.log('📦 Prodotti trovati:', products?.length || 0)
    console.log('❌ Errore Supabase:', error)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({
        success: false,
        error: 'Database error',
        details: error.message
      }, { status: 500 })
    }

    console.log(`✅ Products loaded: ${products?.length || 0}`)

    return NextResponse.json({
      success: true,
      data: products || [],
      count: products?.length || 0
    })
  } catch (error) {
    console.error('💥 ERRORE GENERALE:', error)
    return NextResponse.json({
      success: false,
      error: 'Errore nel recupero dei prodotti',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.user_id) {
      return NextResponse.json({
        success: false,
        error: 'user_id è obbligatorio'
      }, { status: 400 })
    }

    if (!body.sku || !body.description) {
      return NextResponse.json({
        success: false,
        error: 'SKU e descrizione sono obbligatori'
      }, { status: 400 })
    }

    const { data: newProduct, error } = await supabase
      .from('products')
      .insert(body)
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({
        success: false,
        error: 'Database insert error',
        details: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: newProduct
    })
  } catch (error) {
    console.error('❌ POST /api/products error:', error)
    return NextResponse.json({
      success: false,
      error: 'Errore nella creazione del prodotto',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}