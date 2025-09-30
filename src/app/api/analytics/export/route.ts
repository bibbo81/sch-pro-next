import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createSupabaseServer } from '@/lib/auth'
import * as XLSX from 'xlsx'

/**
 * POST /api/analytics/export
 * Export analytics data in various formats (CSV, Excel)
 */
export async function POST(request: NextRequest) {
  try {
    const { user, organizationId } = await requireAuth()
    const supabase = await createSupabaseServer()
    const body = await request.json()

    const {
      format = 'csv', // 'csv', 'excel'
      data_type, // 'shipments', 'products', 'costs', 'metrics'
      start_date,
      end_date
    } = body

    if (!data_type) {
      return NextResponse.json(
        { error: 'Missing data_type parameter' },
        { status: 400 }
      )
    }

    let data: any[] = []
    let filename = `${data_type}_export_${new Date().toISOString().split('T')[0]}`

    // Fetch data based on type
    switch (data_type) {
      case 'shipments':
        const { data: shipments, error: shipmentsError } = await supabase
          .from('shipments')
          .select('*')
          .eq('organization_id', organizationId)
          .gte('created_at', start_date || '2020-01-01')
          .lte('created_at', end_date || new Date().toISOString())
          .order('created_at', { ascending: false })

        if (shipmentsError) throw shipmentsError
        data = shipments || []
        break

      case 'products':
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('organization_id', organizationId)
          .order('created_at', { ascending: false })

        if (productsError) throw productsError
        data = products || []
        break

      case 'costs':
        const { data: costs, error: costsError } = await supabase
          .from('additional_costs')
          .select('*, shipment:shipments(tracking_number, bl_number)')
          .eq('shipments.organization_id', organizationId)
          .gte('created_at', start_date || '2020-01-01')
          .lte('created_at', end_date || new Date().toISOString())
          .order('created_at', { ascending: false })

        if (costsError) throw costsError
        data = costs || []
        break

      case 'metrics':
        const { data: metrics, error: metricsError } = await supabase
          .from('analytics_metrics')
          .select('*')
          .eq('organization_id', organizationId)
          .gte('metric_date', start_date || '2020-01-01')
          .lte('metric_date', end_date || new Date().toISOString())
          .order('metric_date', { ascending: false })

        if (metricsError) throw metricsError
        data = metrics || []
        break

      default:
        return NextResponse.json(
          { error: 'Invalid data_type' },
          { status: 400 }
        )
    }

    if (data.length === 0) {
      return NextResponse.json(
        { error: 'No data found for export' },
        { status: 404 }
      )
    }

    // Generate file based on format
    if (format === 'csv') {
      // Convert to CSV
      const worksheet = XLSX.utils.json_to_sheet(data)
      const csv = XLSX.utils.sheet_to_csv(worksheet)

      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}.csv"`
        }
      })
    } else if (format === 'excel') {
      // Convert to Excel
      const worksheet = XLSX.utils.json_to_sheet(data)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, data_type)

      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

      return new NextResponse(excelBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}.xlsx"`
        }
      })
    }

    return NextResponse.json(
      { error: 'Invalid format' },
      { status: 400 }
    )

  } catch (error: any) {
    console.error('[Analytics Export] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to export data' },
      { status: 500 }
    )
  }
}
