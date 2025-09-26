import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Ottieni i prodotti associati alla spedizione
    const { data: products, error } = await supabase
      .from('shipment_items')
      .select(`
        *,
        product:products(*)
      `)
      .eq('shipment_id', id)

    if (error) {
      console.error('❌ Error fetching shipment products:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch products' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      data: products || [] 
    })
  } catch (error) {
    console.error('❌ GET /api/shipments/[id]/products error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const supabase = await createClient()

    // Aggiungi un prodotto alla spedizione
    const { data: product, error } = await supabase
      .from('shipment_items')
      .insert({
        shipment_id: id,
        ...body
      })
      .select(`
        *,
        product:products(*)
      `)
      .single()

    if (error) {
      console.error('❌ Error adding product to shipment:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to add product' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ 
      success: true, 
      data: product 
    })
  } catch (error) {
    console.error('❌ POST /api/shipments/[id]/products error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('itemId')
    const supabase = await createClient()
    
    if (!itemId) {
      return NextResponse.json(
        { success: false, error: 'itemId required' },
        { status: 400 }
      )
    }

    // Rimuovi il prodotto dalla spedizione
    const { error } = await supabase
      .from('shipment_items')
      .delete()
      .eq('id', itemId)
      .eq('shipment_id', id)

    if (error) {
      console.error('❌ Error removing product from shipment:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to remove product' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Product removed' 
    })
  } catch (error) {
    console.error('❌ DELETE /api/shipments/[id]/products error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to remove product' },
      { status: 500 }
    )
  }
}