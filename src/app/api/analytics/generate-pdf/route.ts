import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createSupabaseServer } from '@/lib/auth'
import { generateReportPDF } from '@/lib/pdf-generator'

/**
 * POST /api/analytics/generate-pdf
 * Generate PDF report on-demand from analytics page
 */
export async function POST(request: NextRequest) {
  try {
    const { user, organizationId, organizationName } = await requireAuth()
    const supabase = await createSupabaseServer()
    const body = await request.json()

    const { start_date, end_date } = body

    if (!start_date || !end_date) {
      return NextResponse.json(
        { error: 'Missing start_date or end_date' },
        { status: 400 }
      )
    }

    // Fetch metrics for the period
    const { data: metrics, error: metricsError } = await supabase
      .rpc('calculate_organization_metrics', {
        org_id: organizationId,
        start_date: start_date,
        end_date: end_date
      })

    if (metricsError) {
      console.error('[Generate PDF] Error fetching metrics:', metricsError)
      return NextResponse.json(
        { error: 'Failed to fetch metrics' },
        { status: 500 }
      )
    }

    // Generate PDF
    const pdfBuffer = await generateReportPDF({
      organizationName: organizationName || 'Organization',
      reportName: 'Report Analytics',
      period: {
        start: start_date,
        end: end_date
      },
      metrics
    })

    // Return PDF as download
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Analytics_Report_${new Date().toISOString().split('T')[0]}.pdf"`
      }
    })

  } catch (error: any) {
    console.error('[Generate PDF] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
