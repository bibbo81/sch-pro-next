import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/auth'

// Emergency endpoint to reset user password when email links fail
export async function POST(request: NextRequest) {
  try {
    const { email, newPassword } = await request.json()

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: 'Email and newPassword are required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const supabaseAdmin = await createSupabaseAdmin()

    // Find the user by email
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers()

    if (listError) {
      console.error('Error listing users:', listError)
      return NextResponse.json(
        { error: 'Failed to find user' },
        { status: 500 }
      )
    }

    const user = users.users.find(u => u.email === email)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update the user's password directly
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      {
        password: newPassword,
        email_confirm: true // Ensure email is confirmed
      }
    )

    if (updateError) {
      console.error('Error updating password:', updateError)
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Password updated successfully for ${email}`,
      userId: user.id
    })

  } catch (error) {
    console.error('Emergency reset error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint for easy browser testing
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const email = searchParams.get('email')
  const password = searchParams.get('password')

  if (!email || !password) {
    return NextResponse.json({
      message: 'Emergency Password Reset Endpoint',
      usage: 'POST with { "email": "user@example.com", "newPassword": "newpass123" }',
      exampleUrl: '/api/emergency-reset?email=f.cagnucci@gmail.com&password=Prova123$'
    })
  }

  // Use POST logic for GET convenience
  return await POST(new NextRequest(request.url, {
    method: 'POST',
    body: JSON.stringify({ email, newPassword: password }),
    headers: { 'content-type': 'application/json' }
  }))
}