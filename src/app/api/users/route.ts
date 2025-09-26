import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createSupabaseServer, getOrganizationMembers } from '@/lib/auth'

// GET /api/users - Get all users in the organization
export async function GET(request: NextRequest) {
  try {
    const authData = await requireAuth()
    const supabase = await createSupabaseServer()

    // Get all members of the organization with user details
    const { data: members, error } = await supabase
      .from('organization_members')
      .select(`
        id,
        role,
        restrict_to_own_records,
        created_at,
        user_id
      `)
      .eq('organization_id', authData.organizationId) as any

    if (error) {
      console.error('Error fetching members:', error)
      return NextResponse.json(
        { error: 'Failed to fetch organization members' },
        { status: 500 }
      )
    }

    // Get user details separately since we can't join with auth.users directly
    const userEmails: Record<string, string> = {}
    if (members && members.length > 0) {
      for (const member of members) {
        try {
          const { data: userData, error: userError } = await supabase.auth.admin.getUserById(member.user_id)
          if (userData && userData.user) {
            userEmails[member.user_id] = userData.user.email || 'Unknown'
          }
        } catch (userFetchError) {
          console.error(`Error fetching user ${member.user_id}:`, userFetchError)
          userEmails[member.user_id] = 'Unknown'
        }
      }
    }

    // Transform the data to include user email directly
    const transformedMembers = members?.map((member: any) => ({
      id: member.id,
      user_id: member.user_id,
      email: userEmails[member.user_id] || 'Unknown',
      role: member.role,
      restrict_to_own_records: member.restrict_to_own_records,
      created_at: member.created_at
    })) || []

    return NextResponse.json({
      users: transformedMembers,
      organization: {
        id: authData.organizationId,
        name: authData.organizationName
      }
    })
  } catch (error) {
    console.error('Error in GET /api/users:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 401 }
    )
  }
}

// POST /api/users - Invite a new user to organization
export async function POST(request: NextRequest) {
  try {
    const authData = await requireAuth()

    // Only admins can invite users
    if (authData.membership.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can invite users' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { email, role = 'member', restrict_to_own_records = false } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseServer()

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single() as any

    if (existingUser) {
      // User exists, add to organization
      const { data: membership, error: memberError } = await supabase
        .from('organization_members')
        .insert({
          user_id: existingUser.id,
          organization_id: authData.organizationId,
          role,
          restrict_to_own_records
        } as any)
        .select()
        .single() as any

      if (memberError) {
        console.error('Error adding user to organization:', memberError)
        return NextResponse.json(
          { error: 'Failed to add user to organization' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        membership
      })
    } else {
      // For now, return an error - in production, you might want to send an invitation email
      return NextResponse.json(
        { error: 'User not found. Please ask them to sign up first.' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Error in POST /api/users:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 401 }
    )
  }
}

// PATCH /api/users - Update user role or permissions
export async function PATCH(request: NextRequest) {
  try {
    const authData = await requireAuth()

    // Only admins can update users
    if (authData.membership.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can update users' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { memberId, role, restrict_to_own_records } = body

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseServer()

    const updateData: any = {}
    if (role !== undefined) updateData.role = role
    if (restrict_to_own_records !== undefined) updateData.restrict_to_own_records = restrict_to_own_records

    const { data, error } = await supabase
      .from('organization_members')
      .update(updateData)
      .eq('id', memberId)
      .eq('organization_id', authData.organizationId)
      .select()
      .single() as any

    if (error) {
      console.error('Error updating user:', error)
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      member: data
    })
  } catch (error) {
    console.error('Error in PATCH /api/users:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 401 }
    )
  }
}

// DELETE /api/users - Remove user from organization
export async function DELETE(request: NextRequest) {
  try {
    const authData = await requireAuth()

    // Only admins can remove users
    if (authData.membership.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can remove users' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      )
    }

    // Prevent self-deletion
    if (memberId === authData.membership.id) {
      return NextResponse.json(
        { error: 'You cannot remove yourself from the organization' },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseServer()

    const { error } = await supabase
      .from('organization_members')
      .delete()
      .eq('id', memberId)
      .eq('organization_id', authData.organizationId) as any

    if (error) {
      console.error('Error removing user:', error)
      return NextResponse.json(
        { error: 'Failed to remove user' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true
    })
  } catch (error) {
    console.error('Error in DELETE /api/users:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 401 }
    )
  }
}