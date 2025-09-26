import { NextRequest, NextResponse } from 'next/server'
import { isSuperAdmin } from '@/lib/auth-super-admin'

// GET /api/super-admin/check - Check if current user is super admin
export async function GET(request: NextRequest) {
  try {
    const isAdmin = await isSuperAdmin()

    return NextResponse.json({
      isSuperAdmin: isAdmin
    })
  } catch (error) {
    console.error('Error checking super admin status:', error)
    return NextResponse.json({
      isSuperAdmin: false
    })
  }
}