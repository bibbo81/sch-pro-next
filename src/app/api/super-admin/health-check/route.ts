import { NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth-super-admin'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'down'
  responseTime: number
  message?: string
}

async function checkDatabase(): Promise<HealthStatus> {
  const startTime = Date.now()
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Simple query to test database connection
    const { data, error } = await supabase
      .from('organizations')
      .select('id')
      .limit(1)

    const responseTime = Date.now() - startTime

    if (error) {
      return {
        status: 'down',
        responseTime,
        message: `Database error: ${error.message}`,
      }
    }

    // Check response time thresholds
    if (responseTime > 1000) {
      return {
        status: 'degraded',
        responseTime,
        message: 'Database response time is slow',
      }
    }

    return {
      status: 'healthy',
      responseTime,
      message: 'Database connection successful',
    }
  } catch (error: any) {
    return {
      status: 'down',
      responseTime: Date.now() - startTime,
      message: `Database connection failed: ${error.message}`,
    }
  }
}

async function checkSMTP(): Promise<HealthStatus> {
  const startTime = Date.now()
  try {
    // Check if SMTP environment variables are configured
    const smtpHost = process.env.SMTP_HOST
    const smtpPort = process.env.SMTP_PORT
    const smtpUser = process.env.SMTP_USER
    const smtpPassword = process.env.SMTP_PASSWORD

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword) {
      return {
        status: 'degraded',
        responseTime: Date.now() - startTime,
        message: 'SMTP credentials not fully configured',
      }
    }

    // For now, just verify configuration exists
    // In production, you might want to use nodemailer to actually test the connection
    const responseTime = Date.now() - startTime

    return {
      status: 'healthy',
      responseTime,
      message: 'SMTP configuration present',
    }
  } catch (error: any) {
    return {
      status: 'down',
      responseTime: Date.now() - startTime,
      message: `SMTP check failed: ${error.message}`,
    }
  }
}

async function checkShipsGo(): Promise<HealthStatus> {
  const startTime = Date.now()
  try {
    const apiKey = process.env.SHIPSGO_API_KEY

    if (!apiKey) {
      return {
        status: 'degraded',
        responseTime: Date.now() - startTime,
        message: 'ShipsGo API key not configured',
      }
    }

    // Make a simple API call to check if ShipsGo is responding
    const response = await fetch('https://api.shipsgo.com/tracking/v2/containers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({
        containerNumbers: ['TEST123'], // Test with dummy container
      }),
    })

    const responseTime = Date.now() - startTime

    // Even if the container doesn't exist, a 200 or 404 means the API is working
    if (response.ok || response.status === 404 || response.status === 400) {
      if (responseTime > 3000) {
        return {
          status: 'degraded',
          responseTime,
          message: 'ShipsGo API response time is slow',
        }
      }

      return {
        status: 'healthy',
        responseTime,
        message: 'ShipsGo API is responding',
      }
    }

    return {
      status: 'degraded',
      responseTime,
      message: `ShipsGo API returned status ${response.status}`,
    }
  } catch (error: any) {
    return {
      status: 'down',
      responseTime: Date.now() - startTime,
      message: `ShipsGo API unreachable: ${error.message}`,
    }
  }
}

export async function GET() {
  try {
    // Verify super admin access
    await requireSuperAdmin()

    // Run all health checks in parallel
    const [database, smtp, shipsGo] = await Promise.all([
      checkDatabase(),
      checkSMTP(),
      checkShipsGo(),
    ])

    return NextResponse.json({
      database,
      smtp,
      shipsGo,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Health check error:', error)
    return NextResponse.json(
      { error: 'Unauthorized or health check failed' },
      { status: 401 }
    )
  }
}