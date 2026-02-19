import { NextResponse } from 'next/server'

// SECURITY: This endpoint has been disabled.
// It previously allowed unauthenticated password resets for any user.
// Use Supabase Auth password reset flow instead.

export async function POST() {
  return NextResponse.json(
    { error: 'This endpoint has been disabled for security reasons' },
    { status: 403 }
  )
}

export async function GET() {
  return NextResponse.json(
    { error: 'This endpoint has been disabled for security reasons' },
    { status: 403 }
  )
}
