import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/auth'

// GET /api/kb-articles/[slug] - Get single article by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = await createSupabaseServer()

    const { data: article, error } = await supabase
      .from('kb_articles')
      .select('*')
      .eq('slug', params.slug)
      .eq('is_published', true)
      .single()

    if (error) throw error

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Increment view count
    await supabase
      .from('kb_articles')
      .update({ view_count: article.view_count + 1 })
      .eq('id', article.id)

    return NextResponse.json({ article })
  } catch (error: any) {
    console.error('[KB Article GET] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
