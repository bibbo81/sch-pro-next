import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin, logSuperAdminAction } from '@/lib/auth-super-admin'
import { createSupabaseServer } from '@/lib/auth'

// GET /api/super-admin/organizations/[id] - Get organization details
export async function GET(
  request: NextRequest,
  context: any
) {
  try {
    await requireSuperAdmin()
    const supabase = await createSupabaseServer()
    const { id: orgId } = await context.params

    // Get organization with detailed information
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select(`
        id,
        name,
        description,
        created_at,
        organization_members (
          id,
          role,
          restrict_to_own_records,
          created_at,
          users:user_id (
            id,
            email,
            created_at,
            last_sign_in_at
          )
        ),
        shipments (count),
        products (count)
      `)
      .eq('id', orgId)
      .single()

    if (orgError || !org) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Process members data
    const members = Array.isArray(org.organization_members)
      ? org.organization_members.map(member => ({
          id: member.id,
          role: member.role,
          restrict_to_own_records: member.restrict_to_own_records,
          created_at: member.created_at,
          user: {
            id: member.users?.id,
            email: member.users?.email,
            created_at: member.users?.created_at,
            last_sign_in_at: member.users?.last_sign_in_at
          }
        }))
      : []

    const processedOrg = {
      id: org.id,
      name: org.name,
      description: org.description,
      created_at: org.created_at,
      members,
      stats: {
        membersCount: members.length,
        shipmentsCount: Array.isArray(org.shipments) ? org.shipments.length : 0,
        productsCount: Array.isArray(org.products) ? org.products.length : 0
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
  context: any
) {
  try {
    await requireSuperAdmin()
    const supabase = await createSupabaseServer()
    const { id: orgId } = await context.params
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
      .update({ name, description })
      .eq('id', orgId)
      .select()
      .single()

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
  context: any
) {
  return PATCH(request, context)
}

// DELETE /api/super-admin/organizations/[id] - Delete organization
export async function DELETE(
  request: NextRequest,
  context: any
) {
  try {
    await requireSuperAdmin()
    const supabase = await createSupabaseServer()
    const { id: orgId } = await context.params

    // Get organization details for logging
    const { data: org } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', orgId)
      .single()

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
      .eq('organization_id', orgId)

    // Delete the organization (this will cascade delete related data)
    const { error: deleteError } = await supabase
      .from('organizations')
      .delete()
      .eq('id', orgId)

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
            .eq('user_id', member.user_id)

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