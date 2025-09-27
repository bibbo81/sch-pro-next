import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/auth'

// Secret activation codes (in production, store these in environment variables)
const ACTIVATION_CODES = [
  'SUPER_ADMIN_2024_ACTIVATE_XYZ789',
  'EMERGENCY_ACCESS_ADMIN_2024',
  'OWNER_MASTER_KEY_2024'
]

// POST /api/super-admin/activate - Activate super admin for current user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, activationCode } = body

    if (!email || !activationCode) {
      return NextResponse.json(
        { error: 'Email and activation code are required' },
        { status: 400 }
      )
    }

    // Verify activation code
    if (!ACTIVATION_CODES.includes(activationCode)) {
      // Log failed attempt for security
      console.warn(`Failed super admin activation attempt: ${email} with code: ${activationCode}`)

      return NextResponse.json(
        { error: 'Invalid activation code' },
        { status: 401 }
      )
    }

    const supabase = await createSupabaseServer()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify email matches current user
    if (user.email !== email) {
      return NextResponse.json(
        { error: 'Email does not match current user' },
        { status: 401 }
      )
    }

    // Check if user is already super admin
    const { data: existingSuperAdmin } = await supabase
      .from('super_admins')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existingSuperAdmin) {
      return NextResponse.json(
        { success: true, message: 'Already activated as super admin' }
      )
    }

    // Add user to super_admins table
    const { error: insertError } = await (supabase as any)
      .from('super_admins')
      .insert({
        user_id: user.id,
        created_by: user.id, // Self-activation
        notes: `Activated via portal with code ending in ${activationCode.slice(-4)}`
      })

    if (insertError) {
      console.error('Error creating super admin:', insertError)
      return NextResponse.json(
        { error: 'Failed to activate super admin' },
        { status: 500 }
      )
    }

    // Log successful activation
    console.log(`Super admin activated: ${email} (${user.id})`)

    // Log the action in audit log
    await (supabase as any).rpc('log_super_admin_action', {
      p_action: 'super_admin_activated',
      p_target_type: 'user',
      p_target_id: user.id,
      p_details: { email, activationMethod: 'portal' }
    })

    return NextResponse.json({
      success: true,
      message: 'Super admin access activated successfully'
    })
  } catch (error) {
    console.error('Error in POST /api/super-admin/activate:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}