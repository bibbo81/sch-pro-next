import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin, logSuperAdminAction } from '@/lib/auth-super-admin'
import { createSupabaseServer } from '@/lib/auth'

// GET /api/super-admin/organizations/[id]/members - Get organization members
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdmin()
    const supabase = await createSupabaseServer()
    const { id: orgId } = await params

    const { data: members, error } = await supabase
      .from('organization_members')
      .select(`
        id,
        role,
        restrict_to_own_records,
        created_at,
        user_id,
        users:user_id (
          id,
          email,
          full_name,
          created_at,
          last_sign_in_at
        )
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch members' },
        { status: 500 }
      )
    }

    // Process members data
    const processedMembers = members?.map(member => ({
      id: member.id,
      user_id: member.user_id,
      role: member.role,
      restrict_to_own_records: member.restrict_to_own_records,
      created_at: member.created_at,
      user: member.users ? {
        id: member.users.id,
        email: member.users.email,
        full_name: member.users.full_name,
        created_at: member.users.created_at,
        last_sign_in_at: member.users.last_sign_in_at
      } : null
    })) || []

    return NextResponse.json(processedMembers)
  } catch (error) {
    console.error('Error in GET /api/super-admin/organizations/[id]/members:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 401 }
    )
  }
}

// POST /api/super-admin/organizations/[id]/members - Add new member
export async function POST(
  request: NextRequest,
  context: any
) {
  try {
    await requireSuperAdmin()
    const supabase = await createSupabaseServer()
    const { id: orgId } = await context.params
    const body = await request.json()
    const { email, role = 'member', restrictToOwnRecords = false } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // First, check if user exists
    let userId: string
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      userId = existingUser.id
      
      // Check if user is already a member of this organization
      const { data: existingMember } = await supabase
        .from('organization_members')
        .select('id')
        .eq('organization_id', orgId)
        .eq('user_id', userId)
        .single()

      if (existingMember) {
        return NextResponse.json(
          { error: 'User is already a member of this organization' },
          { status: 400 }
        )
      }
    } else {
      // Create a new user account
      const { data: newUser, error: userError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true
      })

      if (userError || !newUser.user) {
        console.error('Error creating user:', userError)
        return NextResponse.json(
          { error: 'Failed to create user account' },
          { status: 500 }
        )
      }

      userId = newUser.user.id
    }

    // Add user to organization
    const { data: newMember, error: memberError } = await supabase
      .from('organization_members')
      .insert({
        organization_id: orgId,
        user_id: userId,
        role,
        restrict_to_own_records: restrictToOwnRecords
      })
      .select(`
        id,
        role,
        restrict_to_own_records,
        created_at,
        user_id,
        users:user_id (
          id,
          email,
          full_name
        )
      `)
      .single()

    if (memberError) {
      console.error('Error adding member:', memberError)
      return NextResponse.json(
        { error: 'Failed to add member to organization' },
        { status: 500 }
      )
    }

    // Log the action
    await logSuperAdminAction(
      'add_organization_member',
      'organization_member',
      newMember.id,
      { organizationId: orgId, email, role }
    )

    return NextResponse.json({
      success: true,
      member: {
        id: newMember.id,
        user_id: newMember.user_id,
        role: newMember.role,
        restrict_to_own_records: newMember.restrict_to_own_records,
        created_at: newMember.created_at,
        user: newMember.users
      }
    })
  } catch (error) {
    console.error('Error in POST /api/super-admin/organizations/[id]/members:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}