'use client'

import { useState, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useProducts } from '@/hooks/useProducts'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Product } from '@/types/product' // ✅ IMPORTA il tipo globale
import { 
  Plus, 
  RefreshCw, 
  Package, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  AlertTriangle,
  XCircle,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Eye
} from 'lucide-react'

interface ProductStats {
  total: number
  active: number
  lowStock: number
  outOfStock: number
  totalValue: number
  categories: number
}

export default function ProductsPage() {
  const { user, loading: authLoading } = useAuth()
  
  // ✅ USA IL HOOK useProducts
  const { 
    products, 
    loading, 
    error, 
    loadProducts, 
    addProduct, 
    updateProduct, 
    deleteProduct 
  } = useProducts()

  // ✅ State solo per UI
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [stockFilter, setStockFilter] = useState('all')

  // Utility functions
  const getStockStatus = (product: Product): 'in_stock' | 'low_stock' | 'out_of_stock' => {
    const quantity = product.quantity || 0
    const minStock = product.min_stock || 10
    
    if (quantity === 0) return 'out_of_stock'
    if (quantity <= minStock) return 'low_stock'
    return 'in_stock'
  }

  const getStockStatusConfig = (status: string) => {
    switch (status) {
      case 'in_stock':
        return { label: 'Disponibile', color: 'bg-green-500/10 text-green-500 dark:text-green-400', icon: CheckCircle }
      case 'low_stock':
        return { label: 'Scorte basse', color: 'bg-yellow-500/10 text-yellow-500 dark:text-yellow-400', icon: AlertTriangle }
      case 'out_of_stock':
        return { label: 'Esaurito', color: 'bg-red-500/10 text-red-500 dark:text-red-400', icon: XCircle }
      default:
        return { label: 'N/A', color: 'bg-muted text-muted-foreground', icon: Package }
    }
  }

  const formatPrice = (price?: number, currency: string = 'EUR'): string => {
    if (!price) return 'N/A'
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: currency
    }).format(price)
  }

  const formatDate = (dateValue?: string): string => {
    if (!dateValue) return 'N/A'
    try {
      return new Date(dateValue).toLocaleDateString('it-IT')
    } catch {
      return 'Data non valida'
    }
  }

  // ✅ Usa products dal hook
  const safeProducts = Array.isArray(products) ? products : []

  // Filtered products
  const filteredProducts = useMemo(() => {
    return safeProducts.filter(product => {
      const matchesSearch = !searchTerm || 
        (product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesCategory = selectedCategory === 'all' || 
        (product.category || '').toLowerCase() === selectedCategory.toLowerCase()
        
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && product.active) ||
        (statusFilter === 'inactive' && !product.active)
        
      const stockStatus = getStockStatus(product)
      const matchesStock = stockFilter === 'all' || stockStatus === stockFilter
      
      return matchesSearch && matchesCategory && matchesStatus && matchesStock
    })
  }, [safeProducts, searchTerm, selectedCategory, statusFilter, stockFilter])

  // Available categories
  const availableCategories = useMemo(() => {
    const uniqueCategories = new Set(
      safeProducts
        .map(p => p.category)
        .filter((cat): cat is string => Boolean(cat && cat.trim()))
    )
    return Array.from(uniqueCategories).sort()
  }, [safeProducts])

  // Statistics
  const stats = useMemo((): ProductStats => {
    const total = safeProducts.length
    const active = safeProducts.filter(p => p.active).length
    const lowStock = safeProducts.filter(p => getStockStatus(p) === 'low_stock').length
    const outOfStock = safeProducts.filter(p => getStockStatus(p) === 'out_of_stock').length
    const totalValue = safeProducts.reduce((sum, p) => sum + ((p.price || p.unit_price || 0) * (p.quantity || 0)), 0)
    const categories = availableCategories.length
    
    return { total, active, lowStock, outOfStock, totalValue, categories }
  }, [safeProducts, availableCategories])

  // Event handlers
  const handleNewProduct = () => {
    setEditingProduct(null)
    setShowForm(true)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  // ✅ USA deleteProduct dal hook
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo prodotto?')) return
    
    try {
      await deleteProduct(productId)
      console.log('Product deleted:', productId)
    } catch (err) {
      console.error('Error deleting product:', err)
      alert('Errore nell\'eliminazione del prodotto')
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
    setStatusFilter('all')
    setStockFilter('all')
  }

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-64 bg-muted rounded animate-pulse mb-2"></div>
            <div className="h-4 w-48 bg-muted rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-8 w-16 bg-muted rounded animate-pulse mb-2"></div>
                <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestione Prodotti</h1>
          <p className="text-muted-foreground mt-2">Errore nel caricamento dei dati</p>
        </div>
        
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <div>
                <h3 className="text-lg font-medium text-red-800">Errore nel caricamento</h3>
                <p className="text-red-700 mt-1">{error}</p>
                <Button 
                  onClick={() => loadProducts()}
                  className="mt-3 bg-red-600 hover:bg-red-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Riprova
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-4">Accesso Richiesto</h2>
          <p className="text-muted-foreground">Devi effettuare il login per gestire i prodotti.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestione Prodotti</h1>
          <p className="text-muted-foreground mt-2">
            Gestisci il catalogo dei tuoi prodotti • Utente: {user.email} • {stats.total} prodotti totali
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => loadProducts()} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Aggiorna
          </Button>
          <Button onClick={handleNewProduct}>
            <Plus className="w-4 h-4 mr-2" />
            Nuovo Prodotto
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-card border border-border hover:shadow-lg hover:shadow-primary/5 transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-blue-500/10">
                <Package className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Totale</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border border-border hover:shadow-lg hover:shadow-primary/5 transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Attivi</p>
              <p className="text-2xl font-bold text-foreground">{stats.active}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border border-border hover:shadow-lg hover:shadow-primary/5 transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-yellow-500/10">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Scorte Basse</p>
              <p className="text-2xl font-bold text-foreground">{stats.lowStock}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border border-border hover:shadow-lg hover:shadow-primary/5 transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-red-500/10">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Esauriti</p>
              <p className="text-2xl font-bold text-foreground">{stats.outOfStock}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border border-border hover:shadow-lg hover:shadow-primary/5 transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600">€{Math.round(stats.totalValue).toLocaleString()}</div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Valore Totale</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border border-border hover:shadow-lg hover:shadow-primary/5 transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-indigo-600">{stats.categories}</div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Categorie</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                placeholder="Cerca prodotti..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-input bg-background text-foreground rounded-md focus:ring-2 focus:ring-primary focus:border-primary min-w-[150px]"
            >
              <option value="all">Tutte le categorie</option>
              {availableCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background text-foreground rounded-md focus:ring-2 focus:ring-primary focus:border-primary min-w-[120px]"
            >
              <option value="all">Tutti gli stati</option>
              <option value="active">Attivi</option>
              <option value="inactive">Inattivi</option>
            </select>
            
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background text-foreground rounded-md focus:ring-2 focus:ring-primary focus:border-primary min-w-[140px]"
            >
              <option value="all">Tutte le scorte</option>
              <option value="in_stock">Disponibili</option>
              <option value="low_stock">Scorte basse</option>
              <option value="out_of_stock">Esauriti</option>
            </select>
            
            {(searchTerm || selectedCategory !== 'all' || statusFilter !== 'all' || stockFilter !== 'all') && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Products List */}
      <div className="space-y-3">
        {filteredProducts.map((product) => {
          const stockStatus = getStockStatus(product)
          const stockConfig = getStockStatusConfig(stockStatus)
          const IconComponent = stockConfig.icon

          return (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg text-foreground">
                        {product.name || 'Prodotto senza nome'}
                      </h3>
                      
                      <Badge variant={product.active ? "default" : "secondary"}>
                        {product.active ? 'Attivo' : 'Inattivo'}
                      </Badge>
                      
                      {product.category && (
                        <Badge variant="outline">{product.category}</Badge>
                      )}
                      
                      <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${stockConfig.color}`}>
                        <IconComponent className="w-3 h-3" />
                        {stockConfig.label}
                      </div>
                    </div>
                    
                    {product.description && (
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground block">SKU:</span>
                        <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                          {product.sku || 'N/A'}
                        </code>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground block">Prezzo:</span>
                        <span className="font-semibold text-green-500">
                          {formatPrice(product.price || product.unit_price, product.currency)}
                        </span>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground block">Scorta:</span>
                        <span className={`font-semibold ${
                          stockStatus === 'out_of_stock' ? 'text-red-500' :
                          stockStatus === 'low_stock' ? 'text-yellow-500' :
                          'text-green-500'
                        }`}>
                          {product.quantity ?? 'N/A'}
                          {product.min_stock && (
                            <span className="text-muted-foreground text-xs"> / {product.min_stock}</span>
                          )}
                        </span>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground block">Peso:</span>
                        <span className="font-medium">
                          {product.weight_kg ? `${product.weight_kg} kg` : 'N/A'}
                        </span>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground block">Fornitore:</span>
                        <span className="font-medium text-xs">
                          {product.supplier_name || 'N/A'}
                        </span>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground block">Aggiornato:</span>
                        <span className="font-medium text-xs">
                          {formatDate(product.updated_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditProduct(product)}
                      title="Modifica prodotto"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      title="Visualizza dettagli"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-500 hover:text-destructive hover:bg-destructive/10"
                      title="Elimina prodotto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Nessun prodotto trovato
            </h3>
            <p className="text-muted-foreground mb-6">
              {stats.total === 0 
                ? "Non hai ancora prodotti nel catalogo. Inizia aggiungendo il tuo primo prodotto." 
                : "Nessun prodotto corrisponde ai filtri selezionati."
              }
            </p>
            {stats.total === 0 ? (
              <Button onClick={handleNewProduct}>
                <Plus className="w-4 h-4 mr-2" />
                Aggiungi Primo Prodotto
              </Button>
            ) : (
              <Button variant="outline" onClick={clearFilters}>
                Reset Filtri
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {editingProduct ? 'Modifica Prodotto' : 'Nuovo Prodotto'}
                </h2>
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setShowForm(false)
                    setEditingProduct(null)
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Nome Prodotto
                  </label>
                  <input
                    type="text"
                    defaultValue={editingProduct?.name || ''}
                    placeholder="Nome del prodotto..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Descrizione
                  </label>
                  <textarea
                    defaultValue={editingProduct?.description || ''}
                    placeholder="Descrizione del prodotto..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      SKU
                    </label>
                    <input
                      type="text"
                      defaultValue={editingProduct?.sku || ''}
                      placeholder="SKU..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Categoria
                    </label>
                    <select
                      defaultValue={editingProduct?.category || ''}
                      className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      <option value="">Seleziona categoria</option>
                      {availableCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Prezzo (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      defaultValue={editingProduct?.price || editingProduct?.unit_price || ''}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Quantità
                    </label>
                    <input
                      type="number"
                      defaultValue={editingProduct?.quantity || ''}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="active"
                    defaultChecked={editingProduct?.active ?? true}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="active" className="text-sm text-muted-foreground">
                    Prodotto attivo
                  </label>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={async () => {
                      try {
                        if (editingProduct) {
                          await new Promise(resolve => setTimeout(resolve, 1000))
                          alert('Prodotto aggiornato! (funzionalità da implementare)')
                        } else {
                          await new Promise(resolve => setTimeout(resolve, 1000))
                          alert('Prodotto creato! (funzionalità da implementare)')
                        }
                        setShowForm(false)
                        setEditingProduct(null)
                        loadProducts()
                      } catch (err) {
                        alert('Errore nel salvare il prodotto')
                      }
                    }}
                    className="flex-1"
                  >
                    {editingProduct ? 'Aggiorna' : 'Crea'} Prodotto
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setShowForm(false)
                      setEditingProduct(null)
                    }}
                  >
                    Annulla
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Status */}
      <Card className="bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <div>
              <h3 className="text-sm font-medium text-emerald-900 dark:text-emerald-100">✅ Sistema Prodotti Connesso a Supabase</h3>
              <div className="text-xs text-emerald-800 dark:text-emerald-200 mt-1 space-y-1">
                <p>• User: {user.email}</p>
                <p>• Prodotti da Supabase: {stats.total}</p>
                <p>• Prodotti filtrati: {filteredProducts.length}</p>
                <p>• Valore inventario: €{Math.round(stats.totalValue).toLocaleString()}</p>
                <p>• Categorie disponibili: {stats.categories}</p>
                <p>• Hook useProducts: ✅ Attivo</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}