import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createSupabaseServer } from '@/lib/auth'

// GET /api/organizations - Get user's organizations
export async function GET(request: NextRequest) {
  try {
    const authData = await requireAuth()
    const supabase = await createSupabaseServer()

    // Get all organizations the user is a member of
    const { data: memberships, error } = await supabase
      .from('organization_members')
      .select(`
        id,
        role,
        organization_id,
        organizations (
          id,
          name,
          created_at
        )
      `)
      .eq('user_id', authData.user.id) as any

    if (error) {
      console.error('Error fetching organizations:', error)
      return NextResponse.json(
        { error: 'Failed to fetch organizations' },
        { status: 500 }
      )
    }

    // Transform the data
    const organizations = memberships?.map((membership: any) => ({
      id: membership.organization_id,
      name: membership.organizations?.name || 'Unknown',
      role: membership.role,
      isCurrent: membership.organization_id === authData.organizationId,
      created_at: membership.organizations?.created_at
    })) || []

    return NextResponse.json({
      organizations,
      currentOrganization: {
        id: authData.organizationId,
        name: authData.organizationName
      }
    })
  } catch (error) {
    console.error('Error in GET /api/organizations:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 401 }
    )
  }
}

// POST /api/organizations - Create a new organization (DISABLED - Only Super Admins can create organizations)
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Organization creation is restricted to system administrators. Please contact support.' },
    { status: 403 }
  )
}

// PATCH /api/organizations - Switch current organization
export async function PATCH(request: NextRequest) {
  try {
    const authData = await requireAuth()
    const body = await request.json()
    const { organizationId } = body

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseServer()

    // Verify user is a member of this organization
    const { data: membership, error } = await supabase
      .from('organization_members')
      .select(`
        id,
        role,
        organization_id,
        organizations (
          id,
          name
        )
      `)
      .eq('user_id', authData.user.id)
      .eq('organization_id', organizationId)
      .single() as any

    if (error || !membership) {
      console.error('Error verifying membership:', error)
      return NextResponse.json(
        { error: 'You are not a member of this organization' },
        { status: 403 }
      )
    }

    // Store the preference (in a real app, you might store this in the database)
    // For now, we'll return success and let the client handle the switch
    return NextResponse.json({
      success: true,
      organization: {
        id: membership.organization_id,
        name: membership.organizations?.name || 'Unknown',
        role: membership.role
      }
    })
  } catch (error) {
    console.error('Error in PATCH /api/organizations:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 401 }
    )
  }
}