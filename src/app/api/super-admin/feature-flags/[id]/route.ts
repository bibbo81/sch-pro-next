import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth-super-admin'
import { createClient } from '@supabase/supabase-js'

// GET /api/super-admin/feature-flags/[id] - Get single feature flag
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireSuperAdmin()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { data: flag, error } = await supabase
      .from('feature_flags')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !flag) {
      return NextResponse.json(
        { error: 'Feature flag not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ flag })

  } catch (error: any) {
    console.error('Error in GET /api/super-admin/feature-flags/[id]:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.status || 500 }
    )
  }
}

// PATCH /api/super-admin/feature-flags/[id] - Update feature flag
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const superAdmin = await requireSuperAdmin()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const body = await request.json()
    const updateData: any = {
      ...body,
      updated_at: new Date().toISOString()
    }

    // Track who enabled/disabled the flag
    if ('is_enabled' in body) {
      if (body.is_enabled) {
        updateData.enabled_at = new Date().toISOString()
        updateData.enabled_by = superAdmin.user.id
      } else {
        updateData.enabled_at = null
        updateData.enabled_by = null
      }
    }

    const { data: flag, error } = await supabase
      .from('feature_flags')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update feature flag', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ flag })

  } catch (error: any) {
    console.error('Error in PATCH /api/super-admin/feature-flags/[id]:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.status || 500 }
    )
  }
}

// DELETE /api/super-admin/feature-flags/[id] - Delete feature flag
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireSuperAdmin()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { error } = await supabase
      .from('feature_flags')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete feature flag', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Feature flag deleted successfully' })

  } catch (error: any) {
    console.error('Error in DELETE /api/super-admin/feature-flags/[id]:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.status || 500 }
    )
  }
}
