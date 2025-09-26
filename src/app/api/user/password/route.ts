import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createSupabaseServer } from '@/lib/auth'

// POST /api/user/password - Change user password
export async function POST(request: NextRequest) {
  try {
    const authData = await requireAuth()
    const supabase = await createSupabaseServer()
    const body = await request.json()

    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Verify current password by trying to sign in
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: authData.user.email!,
      password: currentPassword
    })

    if (verifyError) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      )
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (updateError) {
      console.error('Error updating password:', updateError)
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      )
    }

    // Log the password change
    await supabase
      .from('audit_log')
      .insert({
        user_id: authData.user.id,
        action: 'password_changed',
        table_name: 'auth.users',
        record_id: authData.user.id,
        new_data: { password_changed: true, changed_at: new Date().toISOString() }
      })

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully'
    })
  } catch (error) {
    console.error('Error in POST /api/user/password:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 401 }
    )
  }
}