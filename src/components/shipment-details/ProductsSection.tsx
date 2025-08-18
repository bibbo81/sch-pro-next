'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shipment, ShipmentProduct } from '@/types/shipment';
import { Package, Plus, Trash2 } from 'lucide-react';
import { getShipmentProducts, removeProductFromShipment } from '@/services/shipmentsService';

interface ProductsSectionProps {
  shipment: Shipment;
  onUpdate: () => void;
}

export default function ProductsSection({ shipment, onUpdate }: ProductsSectionProps) {
  const [products, setProducts] = useState<ShipmentProduct[]>([]);
  const [loading, setLoading] = useState(true);

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
      console.log('Loading products for shipment:', shipment.id); // ✅ Debug log
      const data = await getShipmentProducts(shipment.id);
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveProduct = async (productId: string) => {
    try {
      await removeProductFromShipment(shipment.id, productId);
      setProducts(products.filter(p => p.id !== productId));
      onUpdate(); // Ricarica i dati della spedizione
    } catch (error) {
      console.error('Error removing product:', error);
      alert('Errore nella rimozione del prodotto');
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
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
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-muted-foreground">Nessun prodotto collegato a questa spedizione</p>
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
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <h4 className="font-medium">
                        {shipmentProduct.product?.description || 'Prodotto non specificato'}
                      </h4>
                      {shipmentProduct.product?.sku && (
                        <p className="text-sm text-muted-foreground">
                          SKU: {shipmentProduct.product.sku}
                        </p>
                      )}
                      {shipmentProduct.product?.category && (
                        <p className="text-sm text-muted-foreground">
                          Categoria: {shipmentProduct.product.category}
                        </p>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-6">
                        <div>
                          <p className="text-sm text-muted-foreground">Quantità</p>
                          <p className="font-medium">{shipmentProduct.quantity}</p>
                        </div>
                        
                        {shipmentProduct.unit_price && (
                          <div>
                            <p className="text-sm text-muted-foreground">Prezzo Unit.</p>
                            <p className="font-medium">
                              {formatCurrency(shipmentProduct.unit_price, shipmentProduct.currency)}
                            </p>
                          </div>
                        )}
                        
                        {shipmentProduct.total_price && (
                          <div>
                            <p className="text-sm text-muted-foreground">Totale</p>
                            <p className="font-medium text-green-600">
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
                  className="ml-4 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            {/* Totale generale */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Valore Totale Prodotti:</span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(
                    products.reduce((sum, p) => sum + (p.total_price || 0), 0),
                    products[0]?.currency
                  )}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}