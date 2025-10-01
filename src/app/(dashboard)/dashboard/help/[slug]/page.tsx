'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Eye, ThumbsUp, ThumbsDown, Calendar, User } from 'lucide-react'
import Link from 'next/link'

interface Article {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  category: string
  tags: string[]
  view_count: number
  helpful_count: number
  not_helpful_count: number
  is_featured: boolean
  created_at: string
  updated_at: string
}

export default function ArticleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [feedbackGiven, setFeedbackGiven] = useState(false)

  useEffect(() => {
    fetchArticle()
  }, [slug])

  const fetchArticle = async () => {
    try {
      const response = await fetch(`/api/kb-articles/${slug}`)
      const data = await response.json()

      if (!response.ok) {
        router.push('/dashboard/help')
        return
      }

      setArticle(data.article)
    } catch (error) {
      console.error('Error fetching article:', error)
      router.push('/dashboard/help')
    } finally {
      setLoading(false)
    }
  }

  const handleFeedback = async (helpful: boolean) => {
    // TODO: Implement feedback API
    setFeedbackGiven(true)
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!article) {
    return null
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard/help">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna alla Knowledge Base
          </Button>
        </Link>

        <div className="flex items-center gap-2 mb-4">
          <Badge>{article.category}</Badge>
          {article.tags && article.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>

        <h1 className="text-4xl font-bold mb-4">{article.title}</h1>

        <div className="flex items-center gap-6 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {article.view_count} visualizzazioni
          </span>
          <span className="flex items-center gap-1">
            <ThumbsUp className="w-4 h-4" />
            {article.helpful_count} utili
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(article.created_at).toLocaleDateString('it-IT')}
          </span>
        </div>
      </div>

      {/* Article Content */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div
            className="prose prose-lg dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </CardContent>
      </Card>

      {/* Feedback Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Questo articolo è stato utile?</CardTitle>
        </CardHeader>
        <CardContent>
          {!feedbackGiven ? (
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => handleFeedback(true)}
                className="flex-1"
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                Sì, utile
              </Button>
              <Button
                variant="outline"
                onClick={() => handleFeedback(false)}
                className="flex-1"
              >
                <ThumbsDown className="w-4 h-4 mr-2" />
                No, non utile
              </Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-green-600 font-medium mb-2">
                Grazie per il tuo feedback!
              </p>
              <p className="text-sm text-gray-600">
                Ci aiuta a migliorare i nostri contenuti.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Need More Help */}
      <Card className="mt-6 bg-blue-50 dark:bg-blue-900/20">
        <CardContent className="py-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">
              Non hai trovato quello che cercavi?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Apri un ticket di supporto e ti aiuteremo personalmente
            </p>
            <Link href="/dashboard/support">
              <Button>Apri Ticket di Supporto</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
