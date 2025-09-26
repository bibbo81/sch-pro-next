import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Verifica autenticazione per test manuali
    const authHeader = request.headers.get('authorization')
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('🧪 Testing cron job manually at:', new Date().toISOString())

    // Chiama l'endpoint del cron job
    const cronResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/cron/shipsgo-refresh`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET}`
      }
    })

    const cronData = await cronResponse.json()

    return NextResponse.json({
      success: true,
      test_timestamp: new Date().toISOString(),
      cron_response: cronData,
      cron_status: cronResponse.status
    })

  } catch (error) {
    console.error('❌ Cron test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}