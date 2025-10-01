import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth-super-admin'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Simple encryption (in production, use Supabase Vault or AWS KMS)
const ENCRYPTION_KEY = process.env.API_KEYS_ENCRYPTION_KEY || 'default-encryption-key-change-me-in-production'

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16)
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted
}

function decrypt(text: string): string {
  const parts = text.split(':')
  const iv = Buffer.from(parts[0], 'hex')
  const encryptedText = parts[1]
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

// GET /api/super-admin/api-keys - List all API keys
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const scope = searchParams.get('scope')
    const service = searchParams.get('service')
    const organizationId = searchParams.get('organization_id')
    const showValues = searchParams.get('show_values') === 'true'

    let query = supabase
      .from('api_keys')
      .select('*')
      .order('service_name', { ascending: true })
      .order('key_name', { ascending: true })

    if (scope) {
      query = query.eq('scope', scope)
    }

    if (service) {
      query = query.eq('service_name', service)
    }

    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }

    const { data: keys, error } = await query

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch API keys', details: error.message },
        { status: 500 }
      )
    }

    // Decrypt values if requested (only for super-admin viewing)
    const processedKeys = keys?.map(key => ({
      ...key,
      decrypted_value: showValues ? decrypt(key.encrypted_value) : undefined,
      encrypted_value: undefined // Never send encrypted value to client
    }))

    const stats = {
      total: keys?.length || 0,
      active: keys?.filter(k => k.is_active).length || 0,
      expired: keys?.filter(k => k.expires_at && new Date(k.expires_at) < new Date()).length || 0,
      by_service: {} as Record<string, number>
    }

    keys?.forEach(key => {
      stats.by_service[key.service_name] = (stats.by_service[key.service_name] || 0) + 1
    })

    return NextResponse.json({ keys: processedKeys, stats })

  } catch (error: any) {
    console.error('Error in GET /api/super-admin/api-keys:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.status || 500 }
    )
  }
}

// POST /api/super-admin/api-keys - Create new API key
export async function POST(request: NextRequest) {
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
    const {
      key_name,
      service_name,
      description,
      scope,
      organization_id,
      key_value, // Plain text value to be encrypted
      key_type,
      environment,
      expires_at
    } = body

    if (!key_name || !service_name || !scope || !key_value) {
      return NextResponse.json(
        { error: 'Missing required fields: key_name, service_name, scope, key_value' },
        { status: 400 }
      )
    }

    // Encrypt the key value
    const encrypted_value = encrypt(key_value)

    const { data: apiKey, error } = await supabase
      .from('api_keys')
      .insert({
        key_name,
        service_name,
        description,
        scope,
        organization_id,
        encrypted_value,
        key_type,
        environment: environment || 'production',
        expires_at,
        created_by: superAdmin.user.id
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create API key', details: error.message },
        { status: 500 }
      )
    }

    // Don't return encrypted value
    const { encrypted_value: _, ...safeKey } = apiKey

    return NextResponse.json({ key: safeKey }, { status: 201 })

  } catch (error: any) {
    console.error('Error in POST /api/super-admin/api-keys:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.status || 500 }
    )
  }
}
