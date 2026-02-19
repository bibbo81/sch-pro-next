import { NextResponse } from 'next/server'

// SECURITY: Debug endpoints have been disabled.
// They exposed organization data without authentication.

export async function GET() {
  return NextResponse.json(
    { error: 'Debug endpoints have been disabled for security reasons' },
    { status: 403 }
  )
}
