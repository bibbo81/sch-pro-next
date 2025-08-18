import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // ← Cambiato anche qui
);

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; linkId: string }> }
) {
  try {
    const params = await context.params;
    
    const { error } = await supabase
      .from('product_shipment_links')
      .delete()
      .eq('id', params.linkId)
      .eq('shipment_id', params.id);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product link:', error);
    return NextResponse.json({ 
      error: 'Failed to delete product link',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}