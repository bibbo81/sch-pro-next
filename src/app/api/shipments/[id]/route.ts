import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! 
);

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  console.log('🚀🚀🚀 API ROUTE CALLED - GET /api/shipments/[id]'); // ✅ Log molto visibile
  
  try {
    const params = await context.params;
    console.log('🔍 API Shipment: Fetching shipment with ID:', params.id); // ✅ Debug
    
    // ✅ Prima prova con query semplificata (senza relazioni)
    const { data: shipment, error } = await supabase
      .from('shipments')
      .select('*')
      .eq('id', params.id)
      .single(); // ✅ Importante: .single() per ottenere un oggetto, non un array

    if (error) {
      console.error('❌ Supabase error:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
      }
      throw error;
    }

    console.log('🚀 API Shipment: Found shipment:', shipment); // ✅ Debug

    if (!shipment) {
      console.log('❌ API Shipment: Shipment not found'); // ✅ Debug
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    }

    // ✅ Ora prova a ottenere le companies separatamente
    let sender = null;
    let recipient = null;

    if (shipment.sender_id) {
      const { data: senderData } = await supabase
        .from('companies')
        .select('*')
        .eq('id', shipment.sender_id)
        .single();
      sender = senderData;
    }

    if (shipment.recipient_id) {
      const { data: recipientData } = await supabase
        .from('companies')
        .select('*')
        .eq('id', shipment.recipient_id)
        .single();
      recipient = recipientData;
    }

    // ✅ Combina i dati
    const enrichedShipment = {
      ...shipment,
      sender,
      recipient
    };

    console.log('✅ API Shipment: Returning enriched shipment object'); // ✅ Debug
    return NextResponse.json(enrichedShipment);
    
  } catch (error) {
    console.error('❌ API Shipment Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch shipment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const updates = await request.json();
    
    const { data, error } = await supabase
      .from('shipments')
      .update(updates)
      .eq('id', params.id)
      .select('*')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating shipment:', error);
    return NextResponse.json({ 
      error: 'Failed to update shipment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    
    const { error } = await supabase
      .from('shipments')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting shipment:', error);
    return NextResponse.json({ 
      error: 'Failed to delete shipment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}