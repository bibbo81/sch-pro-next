'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package } from 'lucide-react'
import Link from 'next/link'

interface WidgetProductsProps {
  title: string
  metric_type: string
  data_config: any
}

interface Product {
  id: string
  name: string
  sku: string
  active: boolean
  created_at: string
}

export default function WidgetProducts({ title, metric_type, data_config }: WidgetProductsProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const limit = data_config?.limit || 5

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/products?limit=${limit}&sort=created_at:desc`)
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!products || products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-2" />
            <p>Nessun prodotto trovato</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="p-3 rounded-lg border hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium text-sm mb-1">
                    {product.name}
                  </div>
                  <div className="text-xs text-gray-600">
                    SKU: {product.sku}
                  </div>
                </div>
                <Badge variant={product.active ? 'default' : 'secondary'}>
                  {product.active ? 'Attivo' : 'Inattivo'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        <Link
          href="/dashboard/products"
          className="block mt-4 text-sm text-blue-600 hover:text-blue-800 text-center"
        >
          Vedi tutti i prodotti →
        </Link>
      </CardContent>
    </Card>
  )
}
