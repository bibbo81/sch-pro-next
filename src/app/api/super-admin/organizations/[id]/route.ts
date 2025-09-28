import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin, logSuperAdminAction } from '@/lib/auth-super-admin'
import { createSupabaseServer } from '@/lib/auth'

// GET /api/super-admin/organizations/[id] - Get organization details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🔄 GET organization details request received')
    await requireSuperAdmin()
    console.log('✅ Super admin authenticated')

    const supabase = await createSupabaseServer()
    const { id: orgId } = await params
    console.log('🎯 Organization ID:', orgId)

    // Get organization with basic information first
    console.log('🔄 Fetching organization details...')
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select(`
        id,
        name,
        created_at
      `)
      .eq('id', orgId)
      .single() as any

    if (orgError) {
      console.error('❌ Error fetching organization:', orgError)
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    if (!org) {
      console.warn('⚠️ Organization not found for ID:', orgId)
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    console.log('✅ Organization found:', org.name)

    // Get members separately to avoid complex joins
    console.log('🔄 Fetching organization members...')
    const { data: members, error: membersError } = await supabase
      .from('organization_members')
      .select(`
        id,
        role,
        restrict_to_own_records,
        created_at,
        user_id
      `)
      .eq('organization_id', orgId) as any

    if (membersError) {
      console.error('❌ Error fetching members:', membersError)
    } else {
      console.log('✅ Members fetched:', members?.length || 0)
    }

    // Get shipment count
    console.log('🔄 Fetching shipments count...')
    const { count: shipmentsCount, error: shipmentsError } = await supabase
      .from('shipments')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId) as any

    if (shipmentsError) {
      console.error('❌ Error fetching shipments count:', shipmentsError)
    } else {
      console.log('✅ Shipments count:', shipmentsCount || 0)
    }

    // Get products count
    console.log('🔄 Fetching products count...')
    const { count: productsCount, error: productsError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId) as any

    if (productsError) {
      console.error('❌ Error fetching products count:', productsError)
    } else {
      console.log('✅ Products count:', productsCount || 0)
    }

    const processedOrg = {
      id: org.id,
      name: org.name,
      created_at: org.created_at,
      members: members || [],
      stats: {
        membersCount: members?.length || 0,
        shipmentsCount: shipmentsCount || 0,
        productsCount: productsCount || 0
      }
    }

    return NextResponse.json({ organization: processedOrg })
  } catch (error) {
    console.error('Error in GET /api/super-admin/organizations/[id]:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: error instanceof Error && error.message.includes('Super admin required') ? 401 : 500 }
    )
  }
}

// PATCH /api/super-admin/organizations/[id] - Update organization
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🔄 PATCH request received')
    await requireSuperAdmin()
    console.log('✅ Super admin authenticated')

    const supabase = await createSupabaseServer()
    const { id: orgId } = await params
    const body = await request.json()

    console.log('📝 Request body:', body)
    console.log('🎯 Organization ID:', orgId)

    const { name } = body

    if (!name) {
      console.warn('❌ Name is required but not provided')
      return NextResponse.json(
        { error: 'Organization name is required' },
        { status: 400 }
      )
    }

    console.log('🔄 Attempting to update organization with name:', name)

    // First, check if organization exists
    const { data: existingOrg, error: checkError } = await supabase
      .from('organizations')
      .select('id, name')
      .eq('id', orgId)
      .single() as any

    if (checkError || !existingOrg) {
      console.error('❌ Organization not found for update:', checkError)
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    console.log('✅ Found organization:', existingOrg)

    // Update organization - only update the name field
    console.log('🔄 Executing UPDATE query...')
    const { data, error, count } = await supabase
      .from('organizations')
      .update({ name: name.trim() })
      .eq('id', orgId)
      .select()
      .single() as any

    console.log('📊 Update result - data:', data, 'error:', error, 'count:', count)

    if (error) {
      console.error('❌ Error updating organization:', error)

      // Handle specific PGRST116 error (no rows updated)
      if (error.code === 'PGRST116') {
        console.error('❌ PGRST116: No rows were updated. This could be due to RLS policies or the organization not existing.')
        return NextResponse.json(
          { error: 'Organization not found or cannot be updated' },
          { status: 404 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to update organization: ' + error.message },
        { status: 500 }
      )
    }

    if (!data) {
      console.warn('⚠️ Update completed but no data returned')
      return NextResponse.json(
        { error: 'Organization update failed - no data returned' },
        { status: 500 }
      )
    }

    console.log('✅ Update successful:', data)

    // Log the action
    await logSuperAdminAction(
      'update_organization',
      'organization',
      orgId,
      { name }
    )

    return NextResponse.json({
      success: true,
      organization: data
    })
  } catch (error) {
    console.error('❌ Error in PATCH /api/super-admin/organizations/[id]:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/super-admin/organizations/[id] - Update organization (alias for PATCH)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return PATCH(request, { params })
}

// DELETE /api/super-admin/organizations/[id] - Delete organization
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdmin()
    const supabase = await createSupabaseServer()
    const { id: orgId } = await params

    // Get organization details for logging
    const { data: org } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', orgId)
      .single() as any

    if (!org) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Get all users in this organization to delete their accounts
    const { data: members } = await supabase
      .from('organization_members')
      .select('user_id')
      .eq('organization_id', orgId) as any

    // Delete the organization (this will cascade delete related data)
    const { error: deleteError } = await supabase
      .from('organizations')
      .delete()
      .eq('id', orgId) as any

    if (deleteError) {
      console.error('Error deleting organization:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete organization' },
        { status: 500 }
      )
    }

    // Delete user accounts that were only members of this organization
    if (members && members.length > 0) {
      for (const member of members) {
        try {
          // Check if user has other organization memberships
          const { data: otherMemberships } = await supabase
            .from('organization_members')
            .select('id')
            .eq('user_id', member.user_id) as any

          // If no other memberships, delete the user account
          if (!otherMemberships || otherMemberships.length === 0) {
            await supabase.auth.admin.deleteUser(member.user_id)
          }
        } catch (userDeleteError) {
          console.error('Error deleting user:', userDeleteError)
          // Continue with other users even if one fails
        }
      }
    }

    // Log the action
    await logSuperAdminAction(
      'delete_organization',
      'organization',
      orgId,
      { organizationName: org.name, memberCount: members?.length || 0 }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/super-admin/organizations/[id]:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 401 }
    )
  }
}