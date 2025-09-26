// src/app/api/forwarders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createSupabaseServer } from '@/lib/auth'

interface ForwarderData {
  name: string
  contact_person?: string
  email?: string
  phone?: string
  address?: string
  notes?: string
  active?: boolean
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, organizationId } = await requireAuth()
    const supabase = await createSupabaseServer()

    const { data: forwarder, error } = await supabase
      .from('carriers')
      .select('*')
      .eq('id', params.id)
      .eq('organization_id', organizationId)
      .single() as any

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Spedizioniere non trovato' },
          { status: 404 }
        )
      }
      throw error
    }

    return NextResponse.json({
      success: true,
      data: forwarder
    })
  } catch (error) {
    console.error('Error fetching forwarder:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch forwarder'
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, organizationId } = await requireAuth()
    const body = await request.json() as ForwarderData
    const supabase = await createSupabaseServer()

    // Validate required fields
    if (!body.name?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Nome spedizioniere è richiesto' },
        { status: 400 }
      )
    }

    const updateData = {
      name: body.name.trim(),
      contact_person: body.contact_person?.trim() || null,
      email: body.email?.trim() || null,
      phone: body.phone?.trim() || null,
      address: body.address?.trim() || null,
      notes: body.notes?.trim() || null,
      active: body.active ?? true
    }

    const { data, error } = await supabase
      .from('carriers')
      .update(updateData as any)
      .eq('id', params.id)
      .eq('organization_id', organizationId)
      .select()
      .single() as any

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Spedizioniere non trovato' },
          { status: 404 }
        )
      }
      throw error
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Spedizioniere aggiornato con successo'
    })
  } catch (error) {
    console.error('Error updating forwarder:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update forwarder'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, organizationId } = await requireAuth()
    const supabase = await createSupabaseServer()

    // For now, skip shipment usage check
    // TODO: Add shipment usage check when the relationship is defined

    const { error } = await supabase
      .from('carriers')
      .delete()
      .eq('id', params.id)
      .eq('organization_id', organizationId)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Spedizioniere eliminato con successo'
    })
  } catch (error) {
    console.error('Error deleting forwarder:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete forwarder'
      },
      { status: 500 }
    )
  }
}