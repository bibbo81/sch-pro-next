import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin, logSuperAdminAction } from '@/lib/auth-super-admin'
import { createSuperAdminClient } from '@/lib/auth-super-admin-bypass'

// GET /api/super-admin/organizations/[id] - Get organization details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🔍 [DEBUG] Organization detail API called')
    await requireSuperAdmin()
    console.log('✅ [DEBUG] Super admin auth passed')

    const supabase = await createSuperAdminClient()
    const { id: orgId } = await params

    console.log('🔍 [DEBUG] Organization ID:', orgId)

    // Get organization with basic information first
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select(`
        id,
        name,
        description,
        created_at
      `)
      .eq('id', orgId)
      .single() as any

    console.log('📊 [DEBUG] Organization query result:', { org, orgError })

    if (orgError || !org) {
      console.log('❌ [DEBUG] Organization not found:', { orgId, orgError })
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Get members separately to avoid complex joins
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

    // Get shipment count
    const { count: shipmentsCount } = await supabase
      .from('shipments')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId) as any

    // Get products count
    const { count: productsCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId) as any

    const processedOrg = {
      id: org.id,
      name: org.name,
      description: org.description,
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
      { status: 401 }
    )
  }
}

// PATCH /api/super-admin/organizations/[id] - Update organization
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdmin()
    const supabase = await createSupabaseServer()
    const { id: orgId } = await params
    const body = await request.json()

    const { name, description } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Organization name is required' },
        { status: 400 }
      )
    }

    // Update organization
    const { data, error } = await supabase
      .from('organizations')
      .update({ name, description } as any)
      .eq('id', orgId)
      .select()
      .single() as any

    if (error) {
      console.error('Error updating organization:', error)
      return NextResponse.json(
        { error: 'Failed to update organization' },
        { status: 500 }
      )
    }

    // Log the action
    await logSuperAdminAction(
      'update_organization',
      'organization',
      orgId,
      { name, description }
    )

    return NextResponse.json({
      success: true,
      organization: data
    })
  } catch (error) {
    console.error('Error in PATCH /api/super-admin/organizations/[id]:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 401 }
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