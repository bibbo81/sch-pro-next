import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // ✅ CORRETTO: Era già giusto!
);

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  console.log('🚀🚀🚀 API Products GET: Called'); // ✅ Log più visibile
  
  try {
    const params = await context.params;
    console.log('🔍 API Products: Fetching products for shipment ID:', params.id);
    
    const { data, error } = await supabase
      .from('product_shipment_links')
      .select(`
        *,
        product:products(*),
        shipment:shipments(currency)
      `)
      .eq('shipment_id', params.id);

    if (error) {
      console.error('❌ Supabase error fetching products:', error);
      throw error;
    }
    
    console.log('🚀 API Products: Raw data from Supabase:', data?.length || 0, 'items');
    
    // Calcola total_price e aggiungi currency
    const enrichedData = data?.map(item => ({
      ...item,
      total_price: item.unit_price ? item.unit_price * item.quantity : null,
      currency: item.shipment?.currency || 'EUR'
    })) || [];
    
    console.log('✅ API Products: Returning enriched products:', enrichedData.length, 'items');
    return NextResponse.json(enrichedData);
    
  } catch (error) {
    console.error('❌ Error fetching shipment products:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch products',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  console.log('🚀🚀🚀 API Products POST: Called'); // ✅ Log più visibile
  
  try {
    const params = await context.params;
    const body = await request.json();
    
    console.log('🔍 API Products: Adding product to shipment:', params.id, 'Product:', body.product_id);
    console.log('🔍 API Products: Body data:', body); // ✅ Debug del body
    
    const { data, error } = await supabase
      .from('product_shipment_links')
      .insert({
        shipment_id: params.id,
        product_id: body.product_id,
        quantity: body.quantity,
        unit_price: body.unit_price
      })
      .select(`
        *,
        product:products(*),
        shipment:shipments(currency)
      `)
      .single();

    if (error) {
      console.error('❌ Supabase error adding product:', error);
      throw error;
    }
    
    // Arricchisci con campi calcolati
    const enrichedData = {
      ...data,
      total_price: data.unit_price ? data.unit_price * data.quantity : null,
      currency: data.shipment?.currency || 'EUR'
    };
    
    console.log('✅ API Products: Product added successfully:', enrichedData.id);
    return NextResponse.json(enrichedData);
    
  } catch (error) {
    console.error('❌ Error adding product to shipment:', error);
    return NextResponse.json({ 
      error: 'Failed to add product',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  console.log('🚀🚀🚀 API Products DELETE: Called'); // ✅ Log più visibile
  
  try {
    const params = await context.params;
    const url = new URL(request.url);
    const productLinkId = url.searchParams.get('productId');
    
    if (!productLinkId) {
      console.error('❌ Missing productId in query params');
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }
    
    console.log('🔍 API Products: Removing product from shipment:', params.id, 'ProductLink:', productLinkId);
    
    const { error } = await supabase
      .from('product_shipment_links')
      .delete()
      .eq('id', productLinkId)
      .eq('shipment_id', params.id); // ✅ Double check per sicurezza

    if (error) {
      console.error('❌ Supabase error removing product:', error);
      throw error;
    }
    
    console.log('✅ API Products: Product removed successfully');
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('❌ Error removing product from shipment:', error);
    return NextResponse.json({ 
      error: 'Failed to remove product',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}