/* filepath: /Users/fabriziocagnucci/sch-pro-next/src/app/products/page.tsx */
'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Import, Grid3X3, List, Package, AlertTriangle, TrendingUp } from 'lucide-react';
import { StandardPage } from '@/components/templates/StandardPage';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/products/ProductCard';
import ProductForm from '@/components/products/ProductForm';
import ProductFilters from '@/components/products/ProductFilters';
import { ImportWizard } from '@/components/products/ImportWizard/ImportWizard';
import { Product, FilterState } from '@/types/product';
import { cn } from '@/lib/utils';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showImportWizard, setShowImportWizard] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: '',
    priceRange: [0, 10000],
    active: null
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userId = '21766c53-a16b-4019-9a11-845ecea8cf10';
      const response = await fetch(`/api/products?user_id=${userId}`);
      
      if (!response.ok) {
        throw new Error(`Products error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        setProducts(result.data);
        console.log('✅ Products loaded:', result.data.length);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('❌ Errore nel caricamento prodotti:', error);
      setError(error instanceof Error ? error.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSaveProduct = async (productData: Partial<Product>) => {
    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...productData,
          user_id: '21766c53-a16b-4019-9a11-845ecea8cf10'
        })
      });

      if (response.ok) {
        await fetchProducts();
        setIsFormOpen(false);
        setEditingProduct(null);
      } else {
        console.error('Errore nel salvataggio del prodotto');
      }
    } catch (error) {
      console.error('Errore nel salvataggio:', error);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Sei sicuro di voler eliminare questo prodotto?')) {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          await fetchProducts();
        } else {
          console.error('Errore nell\'eliminazione del prodotto');
        }
      } catch (error) {
        console.error('Errore nell\'eliminazione:', error);
      }
    }
  };

  const handleImportComplete = async (results: any) => {
    console.log('Import completed:', results);
    setShowImportWizard(false);
    await fetchProducts();
  };

  // ✅ FILTRI CON SICUREZZA
  const filteredProducts = products.filter(product => {
    const matchesSearch = filters.search === '' || 
      product.description.toLowerCase().includes(filters.search.toLowerCase()) ||
      product.sku.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesCategory = filters.category === '' || 
      product.category === filters.category;
    
    const matchesPrice = !product.unit_price || 
      (product.unit_price >= filters.priceRange[0] && 
       product.unit_price <= filters.priceRange[1]);
    
    const matchesActive = filters.active === null || 
      product.active === filters.active;

    return matchesSearch && matchesCategory && matchesPrice && matchesActive;
  });

  // ✅ CATEGORIE SICURE
  const categories = [...new Set(
    products
      .map(p => p.category)
      .filter((category): category is string => Boolean(category))
  )];

  // ✅ STATISTICHE CON SAFE ACCESS
  const activeProducts = products.filter(p => p.active).length;
  const inactiveProducts = products.filter(p => !p.active).length;
  
  const lowStockProducts = products.filter(p => {
    const qty = p.quantity ?? 0;
    const minStock = p.min_stock ?? 10;
    return qty > 0 && qty < minStock;
  }).length;
  
  const outOfStockProducts = products.filter(p => {
    const qty = p.quantity ?? 0;
    return qty === 0;
  }).length;
  
  const totalValue = products.reduce((acc, p) => {
    const price = p.unit_price ?? 0;
    const qty = p.quantity ?? 0;
    return acc + (price * qty);
  }, 0);

  // ✅ CARDS STATISTICHE
  const statsCards = [
    {
      title: "Prodotti Attivi",
      description: `${activeProducts} prodotti attivi su ${products.length} totali`,
      content: (
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-green-600">{activeProducts}</div>
            <div className="text-sm text-muted-foreground">
              {products.length > 0 ? Math.round((activeProducts/products.length)*100) : 0}% del totale
            </div>
          </div>
          <Package className="w-10 h-10 text-green-500 opacity-70" />
        </div>
      ),
      badge: { text: "Attivi", variant: "success" as const },
      variant: "glass" as const
    },
    {
      title: "Scorte Basse",
      description: "Prodotti sotto la soglia minima di sicurezza",
      content: (
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-yellow-600">{lowStockProducts}</div>
            <div className="text-sm text-muted-foreground">
              Richiede riordino
            </div>
          </div>
          <AlertTriangle className="w-10 h-10 text-yellow-500 opacity-70" />
        </div>
      ),
      badge: { text: "Attenzione", variant: "warning" as const },
      variant: "glass" as const
    },
    {
      title: "Esauriti",
      description: "Prodotti completamente esauriti",
      content: (
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-red-600">{outOfStockProducts}</div>
            <div className="text-sm text-muted-foreground">
              Riordina urgentemente
            </div>
          </div>
          <AlertTriangle className="w-10 h-10 text-red-500 opacity-70" />
        </div>
      ),
      badge: { text: "Urgente", variant: "destructive" as const },
      variant: "glass" as const
    },
    {
      title: "Valore Totale",
      description: "Valore complessivo dell'inventario",
      content: (
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-blue-600">
              €{totalValue.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-muted-foreground">
              Media €{products.length > 0 ? (totalValue/products.length).toFixed(2) : '0.00'}/prodotto
            </div>
          </div>
          <TrendingUp className="w-10 h-10 text-blue-500 opacity-70" />
        </div>
      ),
      badge: { text: "Inventario", variant: "glass" as const },
      variant: "glass" as const
    }
  ];

  // ✅ ACTIONS HEADER RESPONSIVE
  const pageActions = (
    <div className="flex flex-col sm:flex-row gap-3 w-full">
      {/* Search Bar */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <input
          type="text"
          placeholder="Cerca prodotti..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          className="w-full pl-10 pr-4 py-2 glass border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-200 placeholder:text-muted-foreground"
        />
      </div>

      {/* Controls Group */}
      <div className="flex items-center gap-2">
        {/* View Mode Toggle */}
        <div className="flex glass rounded-xl p-1">
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="rounded-lg"
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="rounded-lg"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>

        {/* Filters */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className={cn("glass", showFilters && "bg-primary/10")}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filtri
          {Object.values(filters).some(v => v !== null && v !== '' && JSON.stringify(v) !== JSON.stringify([0, 10000])) && (
            <span className="ml-2 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
              !
            </span>
          )}
        </Button>

        {/* Import */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowImportWizard(true)}
          className="glass text-green-600 border-green-200 hover:bg-green-50"
        >
          <Import className="w-4 h-4 mr-2" />
          Importa
        </Button>

        {/* Add Product */}
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsFormOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuovo
        </Button>
      </div>
    </div>
  );

  // ✅ LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card variant="glass" className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground font-medium">Caricamento prodotti...</p>
          </div>
        </Card>
      </div>
    );
  }

  // ✅ ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card variant="glass" className="p-8 max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-red-600">Errore Caricamento</h2>
            <p className="text-sm text-red-400 mb-4">{error}</p>
            <Button onClick={fetchProducts} variant="destructive">
              Riprova
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <StandardPage
      title="Gestione Prodotti"
      description={`${products.length} prodotti totali • ${activeProducts} attivi • ${categories.length} categorie`}
      actions={pageActions}
      cards={statsCards}
      layout="grid"
      gridCols={4}
    >
      {/* Filters Panel */}
      {showFilters && (
        <Card variant="glass" className="mb-6 animate-slide-in-down">
          <CardContent className="p-6">
            <ProductFilters
              filters={filters}
              onFiltersChange={setFilters}
              categories={categories}
            />
          </CardContent>
        </Card>
      )}

      {/* Products Grid/List */}
      {filteredProducts.length === 0 ? (
        <Card variant="glass" className="text-center p-12">
          <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {filters.search || filters.category || filters.active !== null 
              ? 'Nessun prodotto trovato' 
              : 'Nessun prodotto presente'
            }
          </h3>
          <p className="text-muted-foreground mb-6">
            {filters.search || filters.category || filters.active !== null
              ? 'Prova a modificare i filtri di ricerca'
              : 'Inizia aggiungendo il tuo primo prodotto'
            }
          </p>
          <div className="flex gap-3 justify-center">
            {(filters.search || filters.category || filters.active !== null) && (
              <Button
                variant="outline"
                onClick={() => setFilters({
                  search: '',
                  category: '',
                  priceRange: [0, 10000],
                  active: null
                })}
              >
                Cancella filtri
              </Button>
            )}
            <Button
              variant="primary"
              onClick={() => setIsFormOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi prodotto
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {/* Results Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-muted-foreground">
              {filteredProducts.length === products.length
                ? `${products.length} prodotti totali`
                : `${filteredProducts.length} di ${products.length} prodotti`
              }
            </div>
            <div className="text-xs text-muted-foreground">
              Ordinamento: Nome prodotto
            </div>
          </div>

          {/* Products Display */}
          <div className={cn(
            "animate-fade-in",
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          )}>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                viewMode={viewMode}
              />
            ))}
          </div>
        </>
      )}

      {/* Modals */}
      {isFormOpen && (
        <ProductForm
          product={editingProduct}
          onSave={handleSaveProduct}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingProduct(null);
          }}
          categories={categories}
        />
      )}

      <ImportWizard
        isOpen={showImportWizard}
        onClose={() => setShowImportWizard(false)}
        onImportComplete={handleImportComplete}
      />
    </StandardPage>
  );
}