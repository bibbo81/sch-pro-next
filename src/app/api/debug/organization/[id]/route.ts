import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/auth-super-admin-bypass'

// DEBUG endpoint to test database connectivity without auth
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🔍 [DEBUG] Debug organization API called')

    const supabase = createServiceClient()
    const { id: orgId } = await params

    console.log('🔍 [DEBUG] Organization ID:', orgId)

    // Test simple query
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select(`
        id,
        name,
        description,
        created_at
      `)
      .eq('id', orgId)
      .single() as any

    console.log('📊 [DEBUG] Organization query result:', { org, orgError })

    // Also get all organizations to see what exists
    const { data: allOrgs, error: allOrgsError } = await supabase
      .from('organizations')
      .select('id, name')
      .limit(10) as any

    console.log('📊 [DEBUG] All organizations:', { allOrgs, allOrgsError })

    return NextResponse.json({
      requestedId: orgId,
      organization: org,
      error: orgError,
      allOrganizations: allOrgs,
      success: true
    })
  } catch (error) {
    console.error('❌ [DEBUG] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}