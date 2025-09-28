import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin, logSuperAdminAction } from '@/lib/auth-super-admin'
import { createSupabaseAdmin } from '@/lib/auth'

// PUT /api/super-admin/organizations/[id]/members/[memberId]/name - Update member name
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    await requireSuperAdmin()
    const supabaseAdmin = await createSupabaseAdmin()
    const { id: orgId, memberId } = await params
    const body = await request.json()
    const { fullName } = body

    if (!fullName || !fullName.trim()) {
      return NextResponse.json(
        { error: 'Full name is required' },
        { status: 400 }
      )
    }

    // Get member details
    const { data: member, error: memberError } = await supabaseAdmin
      .from('organization_members')
      .select('user_id')
      .eq('id', memberId)
      .eq('organization_id', orgId)
      .single() as any

    if (memberError || !member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    // Update user metadata with new full name
    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      member.user_id,
      {
        user_metadata: {
          full_name: fullName.trim()
        }
      }
    )

    if (updateError) {
      console.error('Error updating user metadata:', updateError)
      return NextResponse.json(
        { error: 'Failed to update member name' },
        { status: 500 }
      )
    }

    // Log the action
    await logSuperAdminAction(
      'update_member_name',
      'organization_member',
      memberId,
      { organizationId: orgId, fullName: fullName.trim() }
    )

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.user?.id,
        email: updatedUser.user?.email,
        full_name: fullName.trim()
      }
    })
  } catch (error) {
    console.error('Error in PUT /api/super-admin/organizations/[id]/members/[memberId]/name:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}