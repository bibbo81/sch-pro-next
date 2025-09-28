import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin, logSuperAdminAction } from '@/lib/auth-super-admin'
import { createSupabaseServer, createSupabaseAdmin } from '@/lib/auth'

// PUT /api/super-admin/organizations/[id]/members/[memberId] - Update member role
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    await requireSuperAdmin()
    const supabaseAdmin = await createSupabaseAdmin()
    const { id: orgId, memberId } = await params
    const body = await request.json()
    const { role, restrictToOwnRecords } = body

    if (!role) {
      return NextResponse.json(
        { error: 'Role is required' },
        { status: 400 }
      )
    }

    // Check if member exists
    const { data: existingMember } = await supabaseAdmin
      .from('organization_members')
      .select('user_id')
      .eq('id', memberId)
      .eq('organization_id', orgId)
      .single() as any

    if (!existingMember) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    // Update member
    const updateData: any = { role }
    if (restrictToOwnRecords !== undefined) {
      updateData.restrict_to_own_records = restrictToOwnRecords
    }

    const { data: updatedMember, error } = await supabaseAdmin
      .from('organization_members')
      .update(updateData)
      .eq('id', memberId)
      .eq('organization_id', orgId)
      .select(`
        id,
        role,
        restrict_to_own_records,
        created_at,
        user_id
      `)
      .single() as any

    if (error) {
      console.error('Error updating member:', error)
      return NextResponse.json(
        { error: 'Failed to update member' },
        { status: 500 }
      )
    }

    // Log the action
    await logSuperAdminAction(
      'update_organization_member',
      'organization_member',
      memberId,
      { organizationId: orgId, role, restrictToOwnRecords }
    )

    // Get user details from auth.users
    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(updatedMember.user_id)

    return NextResponse.json({
      success: true,
      member: {
        id: updatedMember.id,
        user_id: updatedMember.user_id,
        role: updatedMember.role,
        restrict_to_own_records: updatedMember.restrict_to_own_records,
        created_at: updatedMember.created_at,
        user: userData?.user ? {
          id: userData.user.id,
          email: userData.user.email,
          full_name: userData.user.user_metadata?.full_name || userData.user.email?.split('@')[0] || ''
        } : null
      }
    })
  } catch (error) {
    console.error('Error in PUT /api/super-admin/organizations/[id]/members/[memberId]:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/super-admin/organizations/[id]/members/[memberId] - Remove member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    await requireSuperAdmin()
    const supabaseAdmin = await createSupabaseAdmin()
    const { id: orgId, memberId } = await params

    // Get member details before deletion for logging
    const { data: member } = await supabaseAdmin
      .from('organization_members')
      .select(`
        user_id,
        role
      `)
      .eq('id', memberId)
      .eq('organization_id', orgId)
      .single() as any

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    // Remove member from organization
    const { error: deleteError } = await supabaseAdmin
      .from('organization_members')
      .delete()
      .eq('id', memberId)
      .eq('organization_id', orgId)

    if (deleteError) {
      console.error('Error removing member:', deleteError)
      return NextResponse.json(
        { error: 'Failed to remove member' },
        { status: 500 }
      )
    }

    // Check if user has other organization memberships
    const { data: otherMemberships } = await supabaseAdmin
      .from('organization_members')
      .select('id')
      .eq('user_id', member.user_id) as any

    // If no other memberships, optionally delete the user account
    if (!otherMemberships || otherMemberships.length === 0) {
      try {
        await supabaseAdmin.auth.admin.deleteUser(member.user_id)
      } catch (userDeleteError) {
        console.error('Error deleting user account:', userDeleteError)
        // Continue even if user deletion fails
      }
    }

    // Get user email for logging
    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(member.user_id)

    // Log the action
    await logSuperAdminAction(
      'remove_organization_member',
      'organization_member',
      memberId,
      {
        organizationId: orgId,
        userId: member.user_id,
        email: userData?.user?.email,
        role: member.role
      }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/super-admin/organizations/[id]/members/[memberId]:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}