import { NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth-super-admin'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    await requireSuperAdmin()

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get database table sizes using PostgreSQL system tables
    const { data: tableSizes, error: tableSizesError } = await supabase.rpc('get_table_sizes')

    if (tableSizesError) {
      console.error('Error fetching table sizes:', tableSizesError)

      // Fallback: count records per table
      const tables = [
        'organizations',
        'organization_members',
        'shipments',
        'shipment_items',
        'products',
        'trackings',
        'additional_costs',
        'documents',
        'api_performance_logs',
      ]

      const tableCounts = await Promise.all(
        tables.map(async (table) => {
          const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true })

          return {
            table_name: table,
            row_count: count || 0,
            total_size_bytes: null,
            table_size_bytes: null,
            indexes_size_bytes: null,
            error: error?.message,
          }
        })
      )

      return NextResponse.json({
        storage: {
          totalSizeBytes: null,
          totalSizeMB: null,
          totalSizeGB: null,
          tablesCount: tables.length,
          message: 'Size data unavailable, showing row counts only',
        },
        tables: tableCounts.sort((a, b) => (b.row_count || 0) - (a.row_count || 0)),
        largestTables: tableCounts
          .filter(t => (t.row_count || 0) > 0)
          .sort((a, b) => (b.row_count || 0) - (a.row_count || 0))
          .slice(0, 5),
      })
    }

    // Calculate totals
    const totalBytes = tableSizes.reduce(
      (sum: number, table: any) => sum + parseInt(table.total_size_bytes || 0),
      0
    )

    const totalMB = (totalBytes / (1024 * 1024)).toFixed(2)
    const totalGB = (totalBytes / (1024 * 1024 * 1024)).toFixed(3)

    // Get top 5 largest tables
    const largestTables = [...tableSizes]
      .sort((a: any, b: any) => parseInt(b.total_size_bytes) - parseInt(a.total_size_bytes))
      .slice(0, 5)
      .map((table: any) => ({
        table_name: table.table_name,
        row_count: table.row_count,
        total_size_bytes: parseInt(table.total_size_bytes),
        total_size_mb: (parseInt(table.total_size_bytes) / (1024 * 1024)).toFixed(2),
        table_size_bytes: parseInt(table.table_size_bytes),
        indexes_size_bytes: parseInt(table.indexes_size_bytes),
      }))

    return NextResponse.json({
      storage: {
        totalSizeBytes: totalBytes,
        totalSizeMB: parseFloat(totalMB),
        totalSizeGB: parseFloat(totalGB),
        tablesCount: tableSizes.length,
      },
      tables: tableSizes.map((table: any) => ({
        table_name: table.table_name,
        row_count: table.row_count,
        total_size_bytes: parseInt(table.total_size_bytes),
        total_size_mb: (parseInt(table.total_size_bytes) / (1024 * 1024)).toFixed(2),
        table_size_bytes: parseInt(table.table_size_bytes),
        indexes_size_bytes: parseInt(table.indexes_size_bytes),
      })),
      largestTables,
    })
  } catch (error: any) {
    console.error('Storage metrics error:', error)
    return NextResponse.json({ error: 'Unauthorized or error', details: error.message }, { status: 401 })
  }
}