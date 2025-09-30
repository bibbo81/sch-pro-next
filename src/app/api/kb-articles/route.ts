import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createSupabaseServer } from '@/lib/auth'

// GET /api/kb-articles - List articles (public or authenticated)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer()
    const { searchParams } = new URL(request.url)

    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured')

    let query = supabase
      .from('kb_articles')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })

    // Public articles only (or add auth check for authenticated)
    query = query.eq('visibility', 'public')

    if (category) query = query.eq('category', category)
    if (featured === 'true') query = query.eq('is_featured', true)

    // Full-text search
    if (search) {
      query = query.textSearch('search_vector', search)
    }

    const { data: articles, error } = await query

    if (error) throw error

    return NextResponse.json({ articles })
  } catch (error: any) {
    console.error('[KB Articles GET] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/kb-articles - Create new article (authenticated only)
export async function POST(request: NextRequest) {
  try {
    const { user } = await requireAuth()
    const supabase = await createSupabaseServer()
    const body = await request.json()

    const {
      title,
      content,
      excerpt,
      category,
      tags,
      meta_description,
      is_published,
      is_featured,
      visibility
    } = body

    if (!title || !content || !category) {
      return NextResponse.json(
        { error: 'title, content, and category are required' },
        { status: 400 }
      )
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Date.now()

    const { data: article, error } = await supabase
      .from('kb_articles')
      .insert({
        title,
        slug,
        content,
        excerpt,
        category,
        tags: tags || [],
        meta_description,
        is_published: is_published || false,
        is_featured: is_featured || false,
        visibility: visibility || 'public',
        author_id: user.id,
        published_at: is_published ? new Date().toISOString() : null
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ article }, { status: 201 })
  } catch (error: any) {
    console.error('[KB Articles POST] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
