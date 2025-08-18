import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { id } = params

    console.log('🔄 Updating product:', id)

    const { data: updatedProduct, error } = await supabase
      .from('products')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Supabase update error:', error)
      return NextResponse.json({
        success: false,
        error: 'Database update error',
        details: error.message
      }, { status: 500 })
    }

    console.log('✅ Product updated successfully')

    return NextResponse.json({
      success: true,
      data: updatedProduct
    })
  } catch (error) {
    console.error('❌ PUT /api/products/[id] error:', error)
    return NextResponse.json({
      success: false,
      error: 'Errore nell\'aggiornamento del prodotto',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    console.log('🗑️ Deleting product:', id)

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase delete error:', error)
      return NextResponse.json({
        success: false,
        error: 'Database delete error',
        details: error.message
      }, { status: 500 })
    }

    console.log('✅ Product deleted successfully')

    return NextResponse.json({
      success: true,
      message: 'Prodotto eliminato con successo'
    })
  } catch (error) {
    console.error('❌ DELETE /api/products/[id] error:', error)
    return NextResponse.json({
      success: false,
      error: 'Errore nell\'eliminazione del prodotto',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    console.log('🔍 Getting product:', id)

    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Supabase get error:', error)
      return NextResponse.json({
        success: false,
        error: 'Database get error',
        details: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: product
    })
  } catch (error) {
    console.error('❌ GET /api/products/[id] error:', error)
    return NextResponse.json({
      success: false,
      error: 'Errore nel recupero del prodotto',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}