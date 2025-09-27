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
    console.log('🔥 Super Admin activation endpoint called')

    const body = await request.json()
    const { email, activationCode } = body

    console.log('🔥 Activation data:', { email, activationCode: activationCode ? 'PROVIDED' : 'MISSING' })

    if (!email || !activationCode) {
      console.log('🔥 Missing email or activation code')
      return NextResponse.json(
        { error: 'Email and activation code are required' },
        { status: 400 }
      )
    }

    // Verify activation code
    if (!ACTIVATION_CODES.includes(activationCode)) {
      // Log failed attempt for security
      console.warn(`🔥 Failed super admin activation attempt: ${email} with code: ${activationCode}`)

      return NextResponse.json(
        { error: 'Invalid activation code' },
        { status: 401 }
      )
    }

    console.log('🔥 Activation code is valid')

    const supabase = await createSupabaseServer()

    console.log('🔥 Getting user from Supabase')
    // Get current user - allow unauthenticated users to activate with valid codes
    const { data: { user } } = await supabase.auth.getUser()

    console.log('🔥 User from Supabase:', user ? { id: user.id, email: user.email } : 'NULL')

    if (!user) {
      console.log('🔥 No user found - returning 401')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify email matches current user
    if (user.email !== email) {
      console.log('🔥 Email mismatch:', { userEmail: user.email, providedEmail: email })
      return NextResponse.json(
        { error: 'Email does not match current user' },
        { status: 401 }
      )
    }

    console.log('🔥 User authentication successful')

    // For now, we'll just validate the activation code and allow access
    // In a real implementation, you'd want to store this in the database
    console.log(`Super admin access granted to: ${email} (${user.id})`)

    // Log successful activation
    console.log(`Super admin activated: ${email} (${user.id})`)

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