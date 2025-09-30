import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createSupabaseServer } from '@/lib/auth'
import { generateReportPDF } from '@/lib/pdf-generator'

/**
 * POST /api/analytics/reports/generate
 * Generate and send report immediately (for testing)
 */
export async function POST(request: NextRequest) {
  try {
    const { user, organizationId, organizationName } = await requireAuth()
    const supabase = await createSupabaseServer()
    const body = await request.json()

    const { report_id } = body

    if (!report_id) {
      return NextResponse.json(
        { error: 'Missing report_id' },
        { status: 400 }
      )
    }

    // Get report configuration
    const { data: report, error: reportError } = await supabase
      .from('scheduled_reports')
      .select('*')
      .eq('id', report_id)
      .eq('organization_id', organizationId)
      .single()

    if (reportError || !report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }

    // Calculate date range based on report configuration
    const endDate = new Date()
    let startDate = new Date()

    switch (report.date_range) {
      case 'last_week':
        startDate.setDate(startDate.getDate() - 7)
        break
      case 'last_month':
        startDate.setMonth(startDate.getMonth() - 1)
        break
      case 'last_quarter':
        startDate.setMonth(startDate.getMonth() - 3)
        break
      case 'last_year':
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
    }

    // Fetch metrics for the period
    const { data: metrics, error: metricsError } = await supabase
      .rpc('calculate_organization_metrics', {
        org_id: organizationId,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      })

    if (metricsError) {
      console.error('[Generate Report] Error fetching metrics:', metricsError)
      return NextResponse.json(
        { error: 'Failed to fetch metrics' },
        { status: 500 }
      )
    }

    // Generate PDF
    if (report.format === 'pdf') {
      const pdfBuffer = await generateReportPDF({
        organizationName: organizationName || 'Organization',
        reportName: report.name,
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        metrics
      })

      // Create report history entry
      const { data: historyEntry, error: historyError } = await supabase
        .from('report_history')
        .insert({
          organization_id: organizationId,
          scheduled_report_id: report.id,
          report_name: report.name,
          report_type: report.report_type,
          period_start: startDate.toISOString().split('T')[0],
          period_end: endDate.toISOString().split('T')[0],
          format: report.format,
          status: 'completed',
          metrics_included: report.metrics,
          generated_by: user.id,
          completed_at: new Date().toISOString()
        })
        .select()
        .single()

      if (historyError) {
        console.error('[Generate Report] Error creating history:', historyError)
      }

      // Return PDF as download
      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${report.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf"`
        }
      })
    } else if (report.format === 'excel' || report.format === 'csv') {
      // For Excel/CSV, redirect to export endpoint
      return NextResponse.json({
        message: 'Use /api/analytics/export for Excel/CSV formats',
        redirect: '/api/analytics/export'
      }, { status: 200 })
    }

    return NextResponse.json(
      { error: 'Invalid format' },
      { status: 400 }
    )

  } catch (error: any) {
    console.error('[Generate Report] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate report' },
      { status: 500 }
    )
  }
}
