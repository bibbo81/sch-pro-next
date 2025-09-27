// src/app/api/forwarders/route.ts
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

export async function GET(request: NextRequest) {
  try {
    const { user, organizationId } = await requireAuth()
    const supabase = await createSupabaseServer()

    const { data: forwarders, error } = await supabase
      .from('carriers')
      .select('*')
      .eq('organization_id', organizationId)
      .order('name') as any

    if (error) {
      throw error
    }

    // Load shipment analytics for each forwarder
    const { data: shipmentsData } = await supabase
      .from('shipments')
      .select('forwarder_id, total_value, created_at')
      .eq('organization_id', organizationId)
      .not('forwarder_id', 'is', null) as any

    // Calculate analytics for each forwarder
    const forwardersWithAnalytics = (forwarders || []).map((forwarder: any) => {
      const shipments = shipmentsData?.filter((s: any) =>
        s.forwarder_id === forwarder.id
      ) || []

      const total_shipments = shipments.length
      const total_spent = shipments.reduce((sum: number, s: any) => sum + (s.total_value || 0), 0)
      const average_cost = total_shipments > 0 ? total_spent / total_shipments : 0
      const last_used = shipments.length > 0
        ? Math.max(...shipments.map((s: any) => new Date(s.created_at).getTime()))
        : null

      return {
        ...forwarder,
        total_shipments,
        total_spent,
        average_cost,
        last_used: last_used ? new Date(last_used).toISOString() : null
      }
    })

    return NextResponse.json({
      success: true,
      data: forwardersWithAnalytics,
      total: forwardersWithAnalytics.length
    })
  } catch (error) {
    console.error('Error fetching forwarders:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch forwarders'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const forwarderData = {
      name: body.name.trim(),
      contact_person: body.contact_person?.trim() || null,
      email: body.email?.trim() || null,
      phone: body.phone?.trim() || null,
      address: body.address?.trim() || null,
      notes: body.notes?.trim() || null,
      active: body.active ?? true,
      organization_id: organizationId
    }

    const { data, error } = await supabase
      .from('carriers')
      .insert(forwarderData as any)
      .select()
      .single() as any

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Spedizioniere creato con successo'
    })
  } catch (error) {
    console.error('Error creating forwarder:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create forwarder'
      },
      { status: 500 }
    )
  }
}