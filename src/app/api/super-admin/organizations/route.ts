import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin, logSuperAdminAction } from '@/lib/auth-super-admin'
import { createSupabaseServer } from '@/lib/auth'

// GET /api/super-admin/organizations - Get all organizations
export async function GET(request: NextRequest) {
  try {
    await requireSuperAdmin()
    const supabase = await createSupabaseServer()

    // Get all organizations with member counts and recent activity
    const { data: organizations, error } = await supabase
      .from('organizations')
      .select(`
        id,
        name,
        created_at,
        organization_members (count),
        shipments (count, created_at)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching organizations:', error)
      return NextResponse.json(
        { error: 'Failed to fetch organizations' },
        { status: 500 }
      )
    }

    // Process the data to add computed fields
    const processedOrgs = organizations?.map(org => {
      const shipments = Array.isArray(org.shipments) ? org.shipments : []
      const lastShipment = shipments
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]

      return {
        id: org.id,
        name: org.name,
        created_at: org.created_at,
        membersCount: Array.isArray(org.organization_members) ? org.organization_members.length : 0,
        shipmentsCount: shipments.length,
        lastActive: lastShipment?.created_at || null
      }
    }) || []

    return NextResponse.json({
      organizations: processedOrgs
    })
  } catch (error) {
    console.error('Error in GET /api/super-admin/organizations:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 401 }
    )
  }
}

// POST /api/super-admin/organizations - Create new organization with admin user
export async function POST(request: NextRequest) {
  try {
    const { user } = await requireSuperAdmin()
    const body = await request.json()
    const {
      organizationName,
      organizationDescription,
      adminEmail,
      adminPassword,
      adminName
    } = body

    if (!organizationName || !adminEmail || !adminPassword) {
      return NextResponse.json(
        { error: 'Organization name, admin email, and password are required' },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseServer()

    // 1. Create the organization
    const { data: newOrg, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: organizationName,
        description: organizationDescription
      })
      .select()
      .single()

    if (orgError || !newOrg) {
      console.error('Error creating organization:', orgError)
      return NextResponse.json(
        { error: 'Failed to create organization' },
        { status: 500 }
      )
    }

    // 2. Create the admin user account
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name: adminName || adminEmail.split('@')[0]
      }
    })

    if (authError || !authData.user) {
      console.error('Error creating admin user:', authError)

      // Cleanup - delete the organization if user creation failed
      await supabase.from('organizations').delete().eq('id', newOrg.id)

      return NextResponse.json(
        { error: authError?.message || 'Failed to create admin user' },
        { status: 500 }
      )
    }

    // 3. Add user as admin member of the organization
    const { error: memberError } = await supabase
      .from('organization_members')
      .insert({
        user_id: authData.user.id,
        organization_id: newOrg.id,
        role: 'admin',
        restrict_to_own_records: false
      })

    if (memberError) {
      console.error('Error adding user to organization:', memberError)

      // Cleanup - delete user and organization
      await supabase.auth.admin.deleteUser(authData.user.id)
      await supabase.from('organizations').delete().eq('id', newOrg.id)

      return NextResponse.json(
        { error: 'Failed to add user to organization' },
        { status: 500 }
      )
    }

    // Log the action
    await logSuperAdminAction(
      'create_organization',
      'organization',
      newOrg.id,
      {
        organizationName,
        adminEmail,
        adminUserId: authData.user.id
      }
    )

    return NextResponse.json({
      success: true,
      organization: newOrg,
      adminUser: {
        id: authData.user.id,
        email: authData.user.email
      }
    })
  } catch (error) {
    console.error('Error in POST /api/super-admin/organizations:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 401 }
    )
  }
}