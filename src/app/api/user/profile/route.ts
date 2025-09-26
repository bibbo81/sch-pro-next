import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createSupabaseServer } from '@/lib/auth'

// GET /api/user/profile - Get user profile
export async function GET(request: NextRequest) {
  try {
    const authData = await requireAuth()
    const supabase = await createSupabaseServer()

    // Get user profile data
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user profile:', error)
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      )
    }

    // Return profile or default values
    const userProfile = profile || {
      name: authData.user.email?.split('@')[0] || '',
      phone: '',
      company: '',
      bio: ''
    }

    return NextResponse.json({
      profile: userProfile,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        created_at: authData.user.created_at
      }
    })
  } catch (error) {
    console.error('Error in GET /api/user/profile:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 401 }
    )
  }
}

// PATCH /api/user/profile - Update user profile
export async function PATCH(request: NextRequest) {
  try {
    const authData = await requireAuth()
    const supabase = await createSupabaseServer()
    const body = await request.json()

    const { name, phone, company, bio } = body

    // Upsert user profile
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: authData.user.id,
        name,
        phone,
        company,
        bio,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error updating user profile:', error)
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      profile: data
    })
  } catch (error) {
    console.error('Error in PATCH /api/user/profile:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 401 }
    )
  }
}