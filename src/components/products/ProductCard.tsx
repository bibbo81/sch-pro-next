'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Product } from '@/types/product'
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Package, 
  Euro,
  Weight,
  Hash,
  Tag,
  Globe,
  Calendar
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ProductCardProps {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (productId: string) => void
  viewMode?: 'grid' | 'list'
}

export default function ProductCard({ product, onEdit, onDelete, viewMode = 'grid' }: ProductCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  const handleDelete = () => {
    if (confirm(`Sei sicuro di voler eliminare il prodotto "${product.description}"?`)) {
      onDelete(product.id)
    }
  }

  const formatPrice = (price?: number | null, currency?: string | null) => {
    if (!price && price !== 0) return 'N/A'
    
    // Gestisci currency null/undefined
    const currencyCode = currency || 'EUR'
    
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: currencyCode
    }).format(price)
  }

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const truncateText = (text: string, maxLength = 60) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="font-mono text-sm font-semibold text-primary">
                {product.sku}
              </span>
              <Badge 
                variant={product.active ? 'default' : 'secondary'}
                className="text-xs"
              >
                {product.active ? 'Attivo' : 'Inattivo'}
              </Badge>
            </div>
            
            <h3 className="font-semibold text-sm leading-tight mb-2">
              {truncateText(product.description, 50)}
            </h3>
            
            {product.category && (
              <div className="flex items-center gap-1 mb-2">
                <Tag className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                  {product.category}
                </span>
              </div>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setShowDetails(!showDetails)}>
                <Eye className="h-4 w-4 mr-2" />
                {showDetails ? 'Nascondi' : 'Dettagli'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(product)}>
                <Edit className="h-4 w-4 mr-2" />
                Modifica
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Elimina
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Prezzo Principale */}
        <div className="flex items-center justify-between mb-3 p-3 bg-secondary/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Euro className="h-4 w-4 text-green-600" />
            <span className="text-sm text-muted-foreground">Prezzo unitario</span>
          </div>
          <span className="font-bold text-lg text-green-600">
            {formatPrice(product.unit_price, product.currency)}
          </span>
        </div>

        {/* Informazioni Base */}
        <div className="space-y-2 text-xs">
          {product.ean && (
            <div className="flex items-center gap-2">
              <Hash className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">EAN:</span>
              <span className="font-mono">{product.ean}</span>
            </div>
          )}
          
          {product.weight_kg && (
            <div className="flex items-center gap-2">
              <Weight className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Peso:</span>
              <span>{product.weight_kg} kg</span>
            </div>
          )}
          
          {product.origin_country && (
            <div className="flex items-center gap-2">
              <Globe className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Origine:</span>
              <span>{product.origin_country}</span>
            </div>
          )}
          
          {product.created_at && (
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Creato:</span>
              <span>{formatDate(product.created_at)}</span>
            </div>
          )}
        </div>

        {/* Dettagli Espandibili */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-border space-y-3">
            {product.other_description && (
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-1">
                  Descrizione aggiuntiva:
                </h4>
                <p className="text-xs text-foreground">{product.other_description}</p>
              </div>
            )}
            
            {product.hs_code && (
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-1">
                  Codice HS:
                </h4>
                <p className="text-xs font-mono text-foreground">{product.hs_code}</p>
              </div>
            )}
            
            {product.dimensions_cm && (
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-1">
                  Dimensioni:
                </h4>
                <p className="text-xs text-foreground">
                  {JSON.stringify(product.dimensions_cm)}
                </p>
              </div>
            )}
            
            {product.updated_at && (
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-1">
                  Ultima modifica:
                </h4>
                <p className="text-xs text-foreground">{formatDate(product.updated_at)}</p>
              </div>
            )}
            
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-1">
                ID Prodotto:
              </h4>
              <p className="text-xs font-mono text-foreground">{product.id}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}