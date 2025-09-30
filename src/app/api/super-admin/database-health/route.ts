import { NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth-super-admin'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    await requireSuperAdmin()

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Run all health checks in parallel
    const [
      connectionStats,
      cacheHitRatio,
      tableStats,
      indexUsage,
      longQueries,
      deadlocks,
      vacuumStats,
    ] = await Promise.all([
      getConnectionStats(supabase),
      getCacheHitRatio(supabase),
      getTableStats(supabase),
      getIndexUsage(supabase),
      getLongRunningQueries(supabase),
      getDeadlocks(supabase),
      getVacuumStats(supabase),
    ])

    return NextResponse.json({
      connectionStats,
      cacheHitRatio,
      tableStats,
      indexUsage,
      longQueries,
      deadlocks,
      vacuumStats,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Database health check error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch database health metrics', details: error.message },
      { status: 500 }
    )
  }
}

// Get connection statistics
async function getConnectionStats(supabase: any) {
  try {
    const { data, error } = await supabase.rpc('get_connection_stats')

    if (error) {
      // Fallback: basic connection count
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('pg_stat_activity')
        .select('*', { count: 'exact', head: true })

      return {
        total: fallbackData || 0,
        active: null,
        idle: null,
        max_connections: null,
        usage_percentage: null,
        available: 'Query pg_stat_activity for details',
        error: error.message,
      }
    }

    return data
  } catch (error: any) {
    return {
      error: error.message,
      status: 'unavailable',
    }
  }
}

// Get cache hit ratio (target: > 99%)
async function getCacheHitRatio(supabase: any) {
  try {
    const { data, error } = await supabase.rpc('get_cache_hit_ratio')

    if (error) {
      return {
        cache_hit_ratio: null,
        status: 'unavailable',
        error: error.message,
      }
    }

    return data
  } catch (error: any) {
    return {
      error: error.message,
      status: 'unavailable',
    }
  }
}

// Get table statistics (most accessed, sequential scans)
async function getTableStats(supabase: any) {
  try {
    const { data, error } = await supabase.rpc('get_table_statistics')

    if (error) {
      return []
    }

    return Array.isArray(data) ? data : []
  } catch (error: any) {
    return []
  }
}

// Get index usage efficiency
async function getIndexUsage(supabase: any) {
  try {
    const { data, error } = await supabase.rpc('get_index_usage')

    if (error) {
      return []
    }

    return Array.isArray(data) ? data : []
  } catch (error: any) {
    return []
  }
}

// Get long running queries (> 30 seconds)
async function getLongRunningQueries(supabase: any) {
  try {
    const { data, error } = await supabase.rpc('get_long_running_queries')

    if (error) {
      return {
        queries: [],
        count: 0,
        error: error.message,
      }
    }

    return data
  } catch (error: any) {
    return {
      error: error.message,
      status: 'unavailable',
    }
  }
}

// Get deadlock information
async function getDeadlocks(supabase: any) {
  try {
    const { data, error } = await supabase.rpc('get_deadlock_info')

    if (error) {
      return {
        deadlocks: 0,
        recent: [],
        error: error.message,
      }
    }

    return data
  } catch (error: any) {
    return {
      error: error.message,
      status: 'unavailable',
    }
  }
}

// Get vacuum and analyze statistics
async function getVacuumStats(supabase: any) {
  try {
    const { data, error } = await supabase.rpc('get_vacuum_stats')

    if (error) {
      return []
    }

    return Array.isArray(data) ? data : []
  } catch (error: any) {
    return []
  }
}