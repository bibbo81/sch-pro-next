import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createSupabaseServer } from '@/lib/auth'

/**
 * GET /api/analytics/reports
 * List scheduled reports for organization
 */
export async function GET(request: NextRequest) {
  try {
    const { user, organizationId } = await requireAuth()
    const supabase = await createSupabaseServer()

    const { data: reports, error } = await supabase
      .from('scheduled_reports')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Analytics Reports] Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch reports' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      reports: reports || []
    }, { status: 200 })

  } catch (error: any) {
    console.error('[Analytics Reports] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch reports' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/analytics/reports
 * Create new scheduled report
 */
export async function POST(request: NextRequest) {
  try {
    const { user, organizationId } = await requireAuth()
    const supabase = await createSupabaseServer()
    const body = await request.json()

    const {
      name,
      description,
      report_type,
      frequency,
      schedule_day,
      schedule_time,
      timezone,
      recipients,
      metrics,
      date_range,
      format
    } = body

    if (!name || !report_type || !frequency || !recipients || !metrics) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Calculate next scheduled date
    const now = new Date()
    let nextScheduled = new Date(now)

    if (frequency === 'daily') {
      nextScheduled.setDate(nextScheduled.getDate() + 1)
    } else if (frequency === 'weekly') {
      const daysUntilNext = ((schedule_day || 1) - nextScheduled.getDay() + 7) % 7
      nextScheduled.setDate(nextScheduled.getDate() + (daysUntilNext || 7))
    } else if (frequency === 'monthly') {
      nextScheduled.setMonth(nextScheduled.getMonth() + 1)
      nextScheduled.setDate(schedule_day || 1)
    }

    const { data: report, error } = await supabase
      .from('scheduled_reports')
      .insert({
        organization_id: organizationId,
        name,
        description,
        report_type,
        frequency,
        schedule_day,
        schedule_time: schedule_time || '09:00:00',
        timezone: timezone || 'Europe/Rome',
        recipients,
        metrics,
        date_range: date_range || 'last_month',
        format: format || 'pdf',
        is_active: true,
        next_scheduled_at: nextScheduled.toISOString(),
        created_by: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('[Analytics Reports] Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create report' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      report
    }, { status: 201 })

  } catch (error: any) {
    console.error('[Analytics Reports] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create report' },
      { status: 500 }
    )
  }
}
