import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth-super-admin'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

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

// GET /api/super-admin/api-keys/[id] - Get single API key
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

    const { searchParams } = new URL(request.url)
    const showValue = searchParams.get('show_value') === 'true'

    const { data: apiKey, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !apiKey) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      )
    }

    // Optionally decrypt the value
    const { encrypted_value, ...safeKey } = apiKey
    const responseKey = {
      ...safeKey,
      decrypted_value: showValue ? decrypt(encrypted_value) : undefined
    }

    return NextResponse.json({ key: responseKey })

  } catch (error: any) {
    console.error('Error in GET /api/super-admin/api-keys/[id]:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.status || 500 }
    )
  }
}

// PATCH /api/super-admin/api-keys/[id] - Update API key
export async function PATCH(
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

    const body = await request.json()
    const { key_value, ...otherUpdates } = body

    const updateData: any = {
      ...otherUpdates,
      updated_at: new Date().toISOString()
    }

    // If updating the key value, encrypt it
    if (key_value) {
      updateData.encrypted_value = encrypt(key_value)
      updateData.last_rotated_at = new Date().toISOString()
    }

    const { data: apiKey, error } = await supabase
      .from('api_keys')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update API key', details: error.message },
        { status: 500 }
      )
    }

    const { encrypted_value, ...safeKey } = apiKey

    return NextResponse.json({ key: safeKey })

  } catch (error: any) {
    console.error('Error in PATCH /api/super-admin/api-keys/[id]:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.status || 500 }
    )
  }
}

// DELETE /api/super-admin/api-keys/[id] - Delete API key
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
      .from('api_keys')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete API key', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'API key deleted successfully' })

  } catch (error: any) {
    console.error('Error in DELETE /api/super-admin/api-keys/[id]:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.status || 500 }
    )
  }
}
