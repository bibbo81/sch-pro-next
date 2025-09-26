'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shipment, ShipmentProduct } from '@/types/shipment';
import { Package, Plus, Trash2 } from 'lucide-react';
// ✅ FIX: Import corretto dal servizio consolidato
import { getShipmentProducts, removeProductFromShipment } from '@/services/shipmentService';

interface ProductsSectionProps {
  shipment: Shipment;
  onUpdate: () => void;
}

export default function ProductsSection({ shipment, onUpdate }: ProductsSectionProps) {
  const [products, setProducts] = useState<ShipmentProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ✅ Controlla che shipment.id esista prima di chiamare l'API
    if (shipment?.id) {
      loadProducts();
    } else {
      console.log('Shipment ID is missing:', shipment);
      setLoading(false);
    }
  }, [shipment?.id]); // ✅ Dipendenza aggiornata

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading products for shipment:', shipment.id); // ✅ Debug log
      const data = await getShipmentProducts(shipment.id);
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      setError(error instanceof Error ? error.message : 'Errore nel caricamento prodotti');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveProduct = async (productId: string) => {
    if (!confirm('Sei sicuro di voler rimuovere questo prodotto?')) return;
    
    try {
      await removeProductFromShipment(shipment.id, productId);
      setProducts(products.filter(p => p.id !== productId));
      onUpdate(); // Ricarica i dati della spedizione
    } catch (error) {
      console.error('Error removing product:', error);
      setError(error instanceof Error ? error.message : 'Errore nella rimozione del prodotto');
    }
  };

  const formatCurrency = (amount?: number, currency?: string) => {
    if (!amount && amount !== 0) return 'N/A';
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: currency || 'EUR'
    }).format(amount);
  };

  // ✅ Mostra loading se shipment non è ancora caricato
  if (!shipment?.id) {
    return (
      <Card className="bg-card text-card-foreground border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card text-card-foreground border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Products ({products.length})
        </CardTitle>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </CardHeader>
      <CardContent>
        {/* Error state */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    loadProducts();
                  }}
                  className="mt-2 text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded transition-colors"
                >
                  Riprova
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <span className="mt-2 text-sm text-muted-foreground">Caricamento prodotti...</span>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Nessun prodotto collegato a questa spedizione</p>
            <Button className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi Primo Prodotto
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((shipmentProduct) => (
              <div 
                key={shipmentProduct.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <h4 className="font-medium text-card-foreground">
                        {shipmentProduct.name || shipmentProduct.description || 'Prodotto non specificato'}
                      </h4>
                      {shipmentProduct.sku && (
                        <p className="text-sm text-muted-foreground">
                          SKU: {shipmentProduct.sku}
                        </p>
                      )}
                      {shipmentProduct.description && shipmentProduct.name !== shipmentProduct.description && (
                        <p className="text-sm text-muted-foreground">
                          {shipmentProduct.description}
                        </p>
                      )}
                      {shipmentProduct.hs_code && (
                        <p className="text-xs text-muted-foreground">
                          HS Code: {shipmentProduct.hs_code}
                        </p>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-6">
                        <div>
                          <p className="text-sm text-muted-foreground">Quantità</p>
                          <p className="font-medium text-card-foreground">{shipmentProduct.quantity}</p>
                        </div>
                        
                        {shipmentProduct.weight_kg && (
                          <div>
                            <p className="text-sm text-muted-foreground">Peso</p>
                            <p className="font-medium text-card-foreground">{shipmentProduct.weight_kg} kg</p>
                          </div>
                        )}
                        
                        {shipmentProduct.unit_price && (
                          <div>
                            <p className="text-sm text-muted-foreground">Prezzo Unit.</p>
                            <p className="font-medium text-card-foreground">
                              {formatCurrency(shipmentProduct.unit_price, shipmentProduct.currency)}
                            </p>
                          </div>
                        )}
                        
                        {shipmentProduct.total_price && (
                          <div>
                            <p className="text-sm text-muted-foreground">Totale</p>
                            <p className="font-medium text-green-600 dark:text-green-400">
                              {formatCurrency(shipmentProduct.total_price, shipmentProduct.currency)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveProduct(shipmentProduct.id)}
                  className="ml-4 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            {/* Totale generale */}
            <div className="border-t border-border pt-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-card-foreground">Valore Totale Prodotti:</span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(
                    products.reduce((sum, p) => sum + (p.total_price || 0), 0),
                    products[0]?.currency
                  )}
                </span>
              </div>
              
              {/* Peso totale */}
              {products.some(p => p.weight_kg) && (
                <div className="flex justify-between items-center mt-2">
                  <span className="font-medium text-card-foreground">Peso Totale:</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {products.reduce((sum, p) => sum + (p.weight_kg || 0), 0).toFixed(2)} kg
                  </span>
                </div>
              )}
              
              {/* Volume totale */}
              {products.some(p => p.volume_m3) && (
                <div className="flex justify-between items-center mt-2">
                  <span className="font-medium text-card-foreground">Volume Totale:</span>
                  <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {products.reduce((sum, p) => sum + (p.volume_m3 || 0), 0).toFixed(3)} m³
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}