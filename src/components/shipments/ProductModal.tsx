'use client'

import { calculateContainerUsage } from '@/utils/transportCalculations'  // ✅ Rimuovi calculateAirTransportCost
import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Search, Package, Plus, Check, X, Loader2, ShoppingCart, CheckSquare, Calculator } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

const supabase = createClient()

interface Product {
  id: string
  user_id: string
  sku?: string | null
  description?: string | null        
  other_description?: string | null  
  category?: string | null
  unit_price?: number | null         
  currency?: string | null
  weight_kg?: number | null
  dimensions_cm?: any
  hs_code?: string | null
  origin_country?: string | null
  metadata?: any
  active?: boolean | null
  created_at: string | null
  updated_at?: string | null
  organization_id: string
  ean?: string | null
}

interface ProductWithDetails {
  product: Product
  quantity: number | string
  totalWeight: number | string
  totalVolume: number | string
  unitCost: number | string
  dutyRate: number | string
  customsFees: number | string
  transportUnitCost: number | string
  transportTotalCost: number | string
}

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (productData: any) => Promise<void>
  onBulkSave?: (productsData: any[]) => Promise<void>
  editingProduct?: any | null
  shipmentId: string
}

export default function ProductModal({
  isOpen,
  onClose,
  onSave,
  onBulkSave,
  editingProduct,
  shipmentId
}: ProductModalProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showNewProductForm, setShowNewProductForm] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)

  // Stati per bulk mode
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [bulkMode, setBulkMode] = useState(false)
  const [productDetails, setProductDetails] = useState<Record<string, ProductWithDetails>>({})

  // 🔧 Form data MIGLIORATO per modalità singola - IDENTICO AI CAMPI BULK
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    quantity: 1,
    totalWeight: 0,        // ✅ Cambiato da unit_weight + total_weight
    totalVolume: 0,        // ✅ Cambiato da unit_volume + total_volume
    unitCost: 0,          // ✅ Cambiato da unit_cost
    totalCost: 0,         // ✅ Calcolato automaticamente
    dutyRate: 0,          // ✅ Cambiato da duty_rate
    dutyAmount: 0,        // ✅ Calcolato automaticamente
    customsFees: 0,       // ✅ Cambiato da customs_fees
    transportUnitCost: 0, // ✅ NUOVO
    transportTotalCost: 0, // ✅ NUOVO
    product_id: null as string | null
  })

  // Helper functions
  const normalizeValue = (value: string | number): number => {
    if (value === '' || value === null || value === undefined) return 0
    return Number(value) || 0
  }

  const displayValue = (value: number | string): string => {
    const num = normalizeValue(value)
    return num === 0 ? '' : String(num)
  }

  // Debug function
  const debugProductsTable = useCallback(async () => {
    try {
      console.log('🔍 Debug: Starting products table inspection...')
      
      const { data: userOrgs, error: orgError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user?.id || '')

      if (orgError) {
        console.error('🚨 Debug: Error getting organizations:', orgError)
        return
      }

      console.log('🏢 Debug: User organizations found:', userOrgs)
      const organizationIds = userOrgs.map((org: any) => org.organization_id)

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('organization_id', organizationIds)
        .limit(1)

      if (error) {
        console.error('🚨 Debug: Error querying products:', error)
        console.error('🚨 Debug: Error message:', error.message)
      } else {
        console.log('🔍 Debug: Products query successful!')
        console.log('🔍 Debug: Sample product data:', data?.[0])
        console.log('🔍 Debug: Available columns:', data?.[0] ? Object.keys(data[0]) : 'No data found')
        
        if (data?.[0]) {
          console.log('🔍 Debug: Full column details:', 
            Object.keys(data[0]).map(col => ({ 
              column: col, 
              value: (data[0] as any)[col],
              type: typeof (data[0] as any)[col]
            }))
          )
        }
      }
    } catch (err: any) {
      console.error('🚨 Debug: Exception occurred:', err)
      console.error('🚨 Debug: Exception message:', err.message)
    }
  }, [user?.id])

  // Search products
  // Funzione per caricare tutti i prodotti
  const loadAllProducts = async () => {
    setSearchLoading(true)
    try {
      // Prova prima user_metadata, poi id come fallback
      const organizationId = user?.user_metadata?.organization_id || user?.id
      if (!organizationId) {
        console.error('❌ Organization ID not found')
        return
      }

      console.log('🏢 Loading products for organization:', organizationId)

      // Usa lo stesso approccio di searchProducts per trovare le organizzazioni
      const { data: userOrgs, error: orgError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user?.id || '')

      if (orgError) {
        console.error('Error fetching organizations:', orgError)
        return
      }

      const organizationIds = userOrgs.map((org: any) => org.organization_id)

      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .in('organization_id', organizationIds)
        .eq('active', true)
        .order('description', { ascending: true })
        .limit(100)

      if (error) {
        console.error('❌ Error loading all products:', error)
        throw error
      }

      console.log('✅ Loaded all products:', products?.length || 0)
      // Filtra solo i prodotti con organization_id valido
      const validProducts = (products || []).filter(p => p.organization_id) as Product[]
      setSearchResults(validProducts)
    } catch (err) {
      console.error('Error loading all products:', err)
    } finally {
      setSearchLoading(false)
    }
  }

  const searchProducts = useCallback(async (query: string) => {
    if (!query.trim() || !user?.id) {
      setSearchResults([])
      return
    }

    try {
      setSearchLoading(true)
      
      const { data: userOrgs, error: orgError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user?.id || '')

      if (orgError) {
        console.error('Error fetching organizations:', orgError)
        return
      }

      const organizationIds = userOrgs.map((org: any) => org.organization_id)

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('organization_id', organizationIds)
        .eq('active', true)
        .or(`description.ilike.%${query}%,sku.ilike.%${query}%,ean.ilike.%${query}%`)
        .limit(20)

      if (error) {
        console.error('Error searching products:', error)
        throw error
      }

      console.log('✅ Search results:', data)
      setSearchResults((data as unknown as Product[]) || [])

    } catch (err: any) {
      console.error('Error searching products:', err)
      console.error('Error details:', err.message)
    } finally {
      setSearchLoading(false)
    }
  }, [user?.id])

  // Bulk mode functions
  const toggleProductSelection = (productId: string) => {
    const newSelected = new Set(selectedProducts)
    const product = searchResults.find(p => p.id === productId)
    
    console.log('🎯 Toggle product:', productId, 'Found product:', product)
    
    if (newSelected.has(productId)) {
      newSelected.delete(productId)
      setProductDetails(prev => {
        const newDetails = { ...prev }
        delete newDetails[productId]
        return newDetails
      })
      console.log('🗑️ Removed product from selection')
    } else {
      newSelected.add(productId)
      if (product) {
        const newProductData = {
          product,
          quantity: 1,
          totalWeight: product.weight_kg || 0,
          totalVolume: 0,
          unitCost: product.unit_price || 0,
          dutyRate: 0,
          customsFees: 0,
          transportUnitCost: 0,
          transportTotalCost: 0
        }
        setProductDetails(prev => ({
          ...prev,
          [productId]: newProductData
        }))
        console.log('✅ Added product to selection:', newProductData)
      }
    }
    
    setSelectedProducts(newSelected)
    console.log('📊 Current selection:', newSelected.size, 'products')
  }

  const updateProductDetail = (productId: string, field: keyof Omit<ProductWithDetails, 'product'>, value: string | number) => {
    setProductDetails(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value
      }
    }))
  }

  const toggleSelectAll = () => {
    if (selectedProducts.size === searchResults.length) {
      setSelectedProducts(new Set())
      setProductDetails({})
    } else {
      const allIds = new Set(searchResults.map(p => p.id))
      setSelectedProducts(allIds)
      const newDetails: Record<string, ProductWithDetails> = {}
      searchResults.forEach(product => {
        newDetails[product.id] = {
          product,
          quantity: 1,
          totalWeight: product.weight_kg || 0,
          totalVolume: 0,
          unitCost: product.unit_price || 0,
          dutyRate: 0,
          customsFees: 0,
          transportUnitCost: 0,
          transportTotalCost: 0
        }
      })
      setProductDetails(newDetails)
    }
  }

  const handleBulkSave = async () => {
    if (selectedProducts.size === 0) {
      alert('Seleziona almeno un prodotto')
      return
    }

    if (!onBulkSave) {
      alert('Funzione bulk save non disponibile')
      return
    }

    try {
      setLoading(true)

      const productsToSave = Array.from(selectedProducts).map(productId => {
        const details = productDetails[productId]
        const quantity = normalizeValue(details.quantity)
        const unitCost = normalizeValue(details.unitCost)
        const totalWeight = normalizeValue(details.totalWeight)
        const totalVolume = normalizeValue(details.totalVolume)
        const dutyRate = normalizeValue(details.dutyRate)
        const customsFees = normalizeValue(details.customsFees)
        
        const totalCost = quantity * unitCost
        const dutyAmount = totalCost * (dutyRate / 100)

        return {
          name: details.product.description || '',
          sku: details.product.sku || '',
          quantity: Math.max(1, quantity),
          unit_cost: unitCost,
          total_cost: totalCost,
          weight_kg: totalWeight, // ✅ Peso (nel DB è comunque peso per il prodotto)
          total_weight_kg: totalWeight, // ✅ Peso totale
          volume_cbm: totalVolume, // ✅ Volume (nel DB è comunque volume per il prodotto)
          total_volume_cbm: totalVolume, // ✅ Volume totale
          duty_rate: dutyRate,
          duty_amount: dutyAmount,
          customs_fees: customsFees,
          transport_unit_cost: normalizeValue(details.transportUnitCost),
          transport_total_cost: normalizeValue(details.transportTotalCost),
          product_id: details.product.id
        }
      })

      console.log('🚀 Bulk saving products:', productsToSave)
      await onBulkSave(productsToSave)
      handleClose()
    } catch (err) {
      console.error('Error bulk saving products:', err)
      alert('Errore nel salvataggio dei prodotti')
    } finally {
      setLoading(false)
    }
  }

  const bulkCalculations = () => {
    let totalCost = 0
    let totalDutyAmount = 0
    let totalCustomsFees = 0
    let totalWeight = 0
    let totalVolume = 0
    let totalTransportCost = 0

    Object.values(productDetails).forEach(details => {
      const quantity = normalizeValue(details.quantity)
      const unitCost = normalizeValue(details.unitCost)
      const dutyRate = normalizeValue(details.dutyRate)
      const customsFees = normalizeValue(details.customsFees)
      const weight = normalizeValue(details.totalWeight)
      const volume = normalizeValue(details.totalVolume)
      const transportCost = normalizeValue(details.transportTotalCost)
      
      const cost = quantity * unitCost
      const duty = cost * (dutyRate / 100)
      
      totalCost += cost
      totalDutyAmount += duty
      totalCustomsFees += customsFees
      totalWeight += weight
      totalVolume += volume
      totalTransportCost += transportCost
    })

    return {
      totalCost,
      dutyAmount: totalDutyAmount,
      finalTotal: totalCost + totalDutyAmount + totalCustomsFees + totalTransportCost,
      totalWeight,
      totalVolume,
      totalTransportCost,
      productsCount: selectedProducts.size
    }
  }

  // Effects
  useEffect(() => {
    if (isOpen && user?.id) {
      console.log('🎯 Debug: Modal opened, running debug...')
      debugProductsTable()

      // Carica automaticamente tutti i prodotti quando si apre il modal
      if (!editingProduct) {
        setBulkMode(true) // Attiva automaticamente la modalità bulk
        loadAllProducts()  // Carica tutti i prodotti
      }
    }
  }, [isOpen, user?.id, debugProductsTable])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchProducts(searchQuery)
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, searchProducts])

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name || '',
        sku: editingProduct.sku || '',
        quantity: editingProduct.quantity || 1,
        unitCost: editingProduct.unit_cost || 0,
        totalCost: editingProduct.total_cost || 0,
        totalWeight: editingProduct.total_weight_kg || 0,
        totalVolume: editingProduct.total_volume_cbm || 0,
        dutyRate: editingProduct.duty_rate || 0,
        dutyAmount: editingProduct.duty_amount || 0,
        customsFees: editingProduct.customs_fees || 0,
        transportUnitCost: editingProduct.transport_unit_cost || 0,
        transportTotalCost: editingProduct.transport_total_cost || 0,
        product_id: editingProduct.product_id || null
      })
      setSelectedProduct(editingProduct.product || null)
      setShowNewProductForm(false)
      setBulkMode(false)
    } else {
      setFormData({
        name: '',
        sku: '',
        quantity: 1,
        unitCost: 0,
        totalCost: 0,
        totalWeight: 0,
        totalVolume: 0,
        dutyRate: 0,
        dutyAmount: 0,
        customsFees: 0,
        transportUnitCost: 0,
        transportTotalCost: 0,
        product_id: null
      })
      setSelectedProduct(null)
      setShowNewProductForm(false)
    }
  }, [editingProduct, isOpen])

  // 🔧 CALCOLI AUTOMATICI PER MODALITÀ SINGOLA - IDENTICI A BULK
  useEffect(() => {
    const quantity = normalizeValue(formData.quantity)
    const unitCost = normalizeValue(formData.unitCost)
    const dutyRate = normalizeValue(formData.dutyRate)

    const totalCost = quantity * unitCost
    const dutyAmount = totalCost * (dutyRate / 100)

    setFormData(prev => ({
      ...prev,
      totalCost: totalCost,
      dutyAmount: dutyAmount
    }))
  }, [formData.quantity, formData.unitCost, formData.dutyRate])

  const handleSelectProduct = (product: Product) => {
    if (bulkMode) return

    setSelectedProduct(product)
    setFormData(prev => ({
      ...prev,
      name: product?.description || '',
      sku: product?.sku || '',
      unitCost: product?.unit_price || 0,
      totalWeight: product?.weight_kg || 0,
      totalVolume: 0,
      product_id: product?.id || null
    }))
    setSearchQuery('')
    setSearchResults([])
  }

  // 🔧 GESTIONE INPUT MIGLIORATA PER CAMPI IDENTICI
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert('Il nome del prodotto è obbligatorio')
      return
    }

    if (formData.quantity <= 0) {
      alert('La quantità deve essere maggiore di 0')
      return
    }

    try {
      setLoading(true)
      
      // 🔧 FORMATO DATI CORRETTO: peso/volume unitario e totale
      const quantity = Math.max(1, normalizeValue(formData.quantity))
      const totalWeight = normalizeValue(formData.totalWeight)
      const totalVolume = normalizeValue(formData.totalVolume)

      const productData = {
        name: formData.name,
        sku: formData.sku,
        quantity: quantity,
        unit_cost: normalizeValue(formData.unitCost),
        total_cost: normalizeValue(formData.totalCost),
        weight_kg: totalWeight, // ✅ Peso (nel DB è comunque peso per il prodotto)
        total_weight_kg: totalWeight, // ✅ Peso totale
        volume_cbm: totalVolume, // ✅ Volume (nel DB è comunque volume per il prodotto)
        total_volume_cbm: totalVolume, // ✅ Volume totale
        duty_rate: normalizeValue(formData.dutyRate),
        duty_amount: normalizeValue(formData.dutyAmount),
        customs_fees: normalizeValue(formData.customsFees),
        transport_unit_cost: normalizeValue(formData.transportUnitCost),
        transport_total_cost: normalizeValue(formData.transportTotalCost),
        product_id: formData.product_id
      }

      await onSave(productData)
      handleClose()
    } catch (err) {
      console.error('Error saving product:', err)
      alert('Errore nel salvataggio del prodotto')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setSearchQuery('')
    setSearchResults([])
    setSelectedProduct(null)
    setShowNewProductForm(false)
    setBulkMode(false)
    setSelectedProducts(new Set())
    setProductDetails({})
    onClose()
  }

  const clearSelectedProduct = () => {
    setSelectedProduct(null)
    setFormData(prev => ({ ...prev, product_id: null, name: '', sku: '', unitCost: 0, totalWeight: 0 }))
  }

  if (!isOpen) return null

  const calculations = bulkCalculations()

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {editingProduct
              ? 'Modifica Prodotto'
              : bulkMode
                ? 'Seleziona Prodotti per la Spedizione'
                : 'Aggiungi Prodotto alla Spedizione'}
          </DialogTitle>
          <DialogDescription>
            {editingProduct
              ? 'Modifica i dettagli del prodotto nella spedizione'
              : bulkMode
                ? `Seleziona uno o più prodotti e configura quantità, peso, volume e costi per ciascuno`
                : 'Cerca un prodotto esistente o creane uno nuovo per questa spedizione'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search & Bulk Mode Toggle */}
          {!editingProduct && !selectedProduct && !showNewProductForm && (
            <div className="space-y-4">
              <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Cerca prodotto per descrizione, SKU o EAN..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12"
                  />
                  {searchLoading && (
                    <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-gray-400" />
                  )}
                </div>
                
                <Button
                  variant={bulkMode ? "default" : "outline"}
                  onClick={() => {
                    setBulkMode(!bulkMode)
                    if (!bulkMode) {
                      // Se attiva bulk mode, carica tutti i prodotti
                      loadAllProducts()
                    } else {
                      // Se disattiva bulk mode, pulisci la selezione
                      setSelectedProducts(new Set())
                      setProductDetails({})
                      setSearchResults([])
                    }
                  }}
                  className="flex items-center gap-2 min-w-[140px]"
                >
                  <CheckSquare className="h-4 w-4" />
                  {bulkMode ? 'Modalità Singola' : 'Selezione Multipla'}
                </Button>
              </div>

              {/* Bulk Mode Controls */}
              {bulkMode && searchResults.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedProducts.size === searchResults.length && searchResults.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                    <span className="text-sm font-medium">
                      {selectedProducts.size > 0 
                        ? `${selectedProducts.size} prodotto${selectedProducts.size > 1 ? 'i' : ''} selezionato${selectedProducts.size > 1 ? 'i' : ''}`
                        : 'Seleziona tutti'
                      }
                    </span>
                  </div>
                  
                  {selectedProducts.size > 0 && (
                    <Button
                      onClick={handleBulkSave}
                      disabled={loading}
                      className="flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Aggiunta in corso...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4" />
                          Aggiungi {selectedProducts.size} prodotto{selectedProducts.size > 1 ? 'i' : ''}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}

              {/* Loading State */}
              {searchLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Ricerca in corso...</p>
                  </div>
                </div>
              )}

              {/* No Results */}
              {!searchLoading && searchQuery && searchResults.length === 0 && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-medium text-gray-900 mb-2">Nessun prodotto trovato</h3>
                    <p className="text-gray-600 mb-4">Non è stato trovato nessun prodotto con questi criteri</p>
                    <Button
                      variant="outline"
                      onClick={() => setShowNewProductForm(true)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Crea nuovo prodotto
                    </Button>
                  </div>
                </div>
              )}

              {/* Empty State - mostra sempre i prodotti se in bulk mode */}
              {!searchLoading && !searchQuery && !bulkMode && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-medium text-gray-900 mb-2">Inizia a digitare per cercare</h3>
                    <p className="text-gray-600">Cerca prodotti per descrizione, SKU o codice EAN</p>
                  </div>
                </div>
              )}

              {/* Search Results con campi editabili per bulk mode */}
              {searchResults.length > 0 && (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {searchResults.map((product) => (
                    <Card 
                      key={product.id} 
                      className={`cursor-pointer transition-all duration-200 ${
                        selectedProducts.has(product.id) 
                          ? 'border-blue-300 bg-blue-50' 
                          : 'hover:bg-gray-50 hover:border-blue-300'
                      }`}
                      onClick={() => bulkMode ? toggleProductSelection(product.id) : handleSelectProduct(product)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {/* Checkbox in bulk mode */}
                          {bulkMode && (
                            <div className="mt-1">
                              <Checkbox
                                checked={selectedProducts.has(product.id)}
                                onCheckedChange={() => toggleProductSelection(product.id)}
                                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                              />
                            </div>
                          )}

                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">
                                  {product.description || 'Prodotto senza descrizione'}
                                </h4>
                                <div className="flex items-center gap-2 mt-2">
                                  {product.sku && (
                                    <Badge variant="secondary">SKU: {product.sku}</Badge>
                                  )}
                                  {product.category && (
                                    <Badge variant="outline">{product.category}</Badge>
                                  )}
                                  {product.ean && (
                                    <Badge variant="outline">EAN: {product.ean}</Badge>
                                  )}
                                </div>
                                {product.other_description && (
                                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{product.other_description}</p>
                                )}
                              </div>
                              <div className="text-right ml-4">
                                {product.unit_price && (
                                  <p className="font-semibold text-lg text-gray-900">€{product.unit_price.toFixed(2)}</p>
                                )}
                                {product.weight_kg && (
                                  <p className="text-sm text-gray-600">{product.weight_kg} kg</p>
                                )}
                              </div>
                            </div>

                            {/* Campi editabili per prodotti selezionati in bulk mode */}
                            {bulkMode && selectedProducts.has(product.id) && productDetails[product.id] && (
                              <div className="mt-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                                <div className="flex items-center gap-2 mb-3">
                                  <Package className="h-4 w-4 text-blue-600" />
                                  <span className="font-medium text-blue-900">Configura Prodotto</span>
                                </div>
                                
                                {/* Prima riga: Quantità, Peso, Volume */}
                                <div className="grid grid-cols-3 gap-3 mb-4">
                                  <div>
                                    <Label className="text-sm font-medium text-blue-800">Quantità *</Label>
                                    <Input
                                      type="number"
                                      min="1"
                                      value={displayValue(productDetails[product.id].quantity)}
                                      onChange={(e) => {
                                        const val = e.target.value
                                        updateProductDetail(product.id, 'quantity', val === '' ? '' : Math.max(1, parseInt(val) || 1))
                                      }}
                                      onBlur={(e) => {
                                        if (!e.target.value || parseInt(e.target.value) < 1) {
                                          updateProductDetail(product.id, 'quantity', 1)
                                        }
                                      }}
                                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                      className="h-9 bg-white border-blue-300 focus:border-blue-500"
                                      placeholder="1"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium text-blue-800">Peso Tot. (kg)</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={displayValue(productDetails[product.id].totalWeight)}
                                      onChange={(e) => {
                                        const val = e.target.value
                                        updateProductDetail(product.id, 'totalWeight', val === '' ? '' : parseFloat(val) || 0)
                                      }}
                                      onBlur={(e) => {
                                        if (!e.target.value) {
                                          updateProductDetail(product.id, 'totalWeight', 0)
                                        }
                                      }}
                                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                      className="h-9 bg-white border-blue-300 focus:border-blue-500"
                                      placeholder="0.00"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium text-blue-800">Volume Tot. (m³)</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="0.001"
                                      value={displayValue(productDetails[product.id].totalVolume)}
                                      onChange={(e) => {
                                        const val = e.target.value
                                        updateProductDetail(product.id, 'totalVolume', val === '' ? '' : parseFloat(val) || 0)
                                      }}
                                      onBlur={(e) => {
                                        if (!e.target.value) {
                                          updateProductDetail(product.id, 'totalVolume', 0)
                                        }
                                      }}
                                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                      className="h-9 bg-white border-blue-300 focus:border-blue-500"
                                      placeholder="0.000"
                                    />
                                  </div>
                                </div>
                                
                                {/* Seconda riga: Costi e Dazi */}
                                <div className="grid grid-cols-3 gap-3 mb-3">
                                  <div>
                                    <Label className="text-sm font-medium text-blue-800">Costo Unitario (€)</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={displayValue(productDetails[product.id].unitCost)}
                                      onChange={(e) => {
                                        const val = e.target.value
                                        updateProductDetail(product.id, 'unitCost', val === '' ? '' : parseFloat(val) || 0)
                                      }}
                                      onBlur={(e) => {
                                        if (!e.target.value) {
                                          updateProductDetail(product.id, 'unitCost', 0)
                                        }
                                      }}
                                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                      className="h-9 bg-white border-blue-300 focus:border-blue-500"
                                      placeholder="0.00"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium text-blue-800">Aliquota Dazio (%)</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      max="100"
                                      step="0.1"
                                      value={displayValue(productDetails[product.id].dutyRate)}
                                      onChange={(e) => {
                                        const val = e.target.value
                                        updateProductDetail(product.id, 'dutyRate', val === '' ? '' : Math.min(100, Math.max(0, parseFloat(val) || 0)))
                                      }}
                                      onBlur={(e) => {
                                        if (!e.target.value) {
                                          updateProductDetail(product.id, 'dutyRate', 0)
                                        }
                                      }}
                                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                      className="h-9 bg-white border-blue-300 focus:border-blue-500"
                                      placeholder="0.0"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium text-blue-800">Altri Oneri (€)</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={displayValue(productDetails[product.id].customsFees)}
                                      onChange={(e) => {
                                        const val = e.target.value
                                        updateProductDetail(product.id, 'customsFees', val === '' ? '' : parseFloat(val) || 0)
                                      }}
                                      onBlur={(e) => {
                                        if (!e.target.value) {
                                          updateProductDetail(product.id, 'customsFees', 0)
                                        }
                                      }}
                                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                      className="h-9 bg-white border-blue-300 focus:border-blue-500"
                                      placeholder="0.00"
                                    />
                                  </div>
                                </div>

                                {/* Terza riga: Costi Trasporto */}
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                  <div>
                                    <Label className="text-sm font-medium text-blue-800">🚛 Trasporto Unit. (€)</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={displayValue(productDetails[product.id].transportUnitCost)}
                                      onChange={(e) => {
                                        const val = e.target.value
                                        updateProductDetail(product.id, 'transportUnitCost', val === '' ? '' : parseFloat(val) || 0)
                                      }}
                                      onBlur={(e) => {
                                        if (!e.target.value) {
                                          updateProductDetail(product.id, 'transportUnitCost', 0)
                                        }
                                      }}
                                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                      className="h-9 bg-white border-blue-300 focus:border-blue-500"
                                      placeholder="0.00"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium text-blue-800">🚛 Trasporto Tot. (€)</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={displayValue(productDetails[product.id].transportTotalCost)}
                                      onChange={(e) => {
                                        const val = e.target.value
                                        updateProductDetail(product.id, 'transportTotalCost', val === '' ? '' : parseFloat(val) || 0)
                                      }}
                                      onBlur={(e) => {
                                        if (!e.target.value) {
                                          updateProductDetail(product.id, 'transportTotalCost', 0)
                                        }
                                      }}
                                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                      className="h-9 bg-white border-blue-300 focus:border-blue-500"
                                      placeholder="0.00"
                                    />
                                  </div>
                                </div>

                                {/* Calcoli live per questo prodotto */}
                                <div className="bg-white p-3 rounded border border-blue-200">
                                  <div className="grid grid-cols-4 gap-2 text-xs">
                                    <div>
                                      <span className="text-gray-600">Costo Tot.:</span>
                                      <span className="font-bold text-green-600 ml-1">
                                        €{(normalizeValue(productDetails[product.id].quantity) * normalizeValue(productDetails[product.id].unitCost)).toFixed(2)}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">Dazio:</span>
                                      <span className="font-bold text-orange-600 ml-1">
                                        €{((normalizeValue(productDetails[product.id].quantity) * normalizeValue(productDetails[product.id].unitCost)) * (normalizeValue(productDetails[product.id].dutyRate) / 100)).toFixed(2)}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">Trasporto:</span>
                                      <span className="font-bold text-blue-600 ml-1">
                                        €{(normalizeValue(productDetails[product.id].transportTotalCost)).toFixed(2)}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">Tot. Finale:</span>
                                      <span className="font-bold text-purple-600 ml-1">
                                        €{(
                                          (normalizeValue(productDetails[product.id].quantity) * normalizeValue(productDetails[product.id].unitCost)) + 
                                          ((normalizeValue(productDetails[product.id].quantity) * normalizeValue(productDetails[product.id].unitCost)) * (normalizeValue(productDetails[product.id].dutyRate) / 100)) + 
                                          normalizeValue(productDetails[product.id].customsFees) +
                                          normalizeValue(productDetails[product.id].transportTotalCost)
                                        ).toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Bulk Summary */}
              {bulkMode && selectedProducts.size > 0 && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Calculator className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-900">
                        Riepilogo Totale ({calculations.productsCount} prodotti)
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-green-700">Peso Totale</p>
                        <p className="font-bold text-green-900">{calculations.totalWeight.toFixed(2)} kg</p>
                      </div>
                      <div>
                        <p className="text-green-700">Volume Totale</p>
                        <p className="font-bold text-green-900">{calculations.totalVolume.toFixed(3)} m³</p>
                      </div>
                      <div>
                        <p className="text-green-700">Costo Prodotti</p>
                        <p className="font-bold text-green-900">€{calculations.totalCost.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-green-700">Totale Dazi</p>
                        <p className="font-bold text-orange-600">€{calculations.dutyAmount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-green-700">Totale Trasporto</p>
                        <p className="font-bold text-blue-600">€{calculations.totalTransportCost.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-green-700">TOTALE FINALE</p>
                        <p className="font-bold text-green-600 text-lg">€{calculations.finalTotal.toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {!bulkMode && (
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowNewProductForm(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Crea nuovo prodotto
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Selected Product Info */}
          {selectedProduct && !bulkMode && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-green-900">
                        {selectedProduct.description || 'Prodotto selezionato'}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        {selectedProduct.sku && (
                          <Badge variant="secondary">SKU: {selectedProduct.sku}</Badge>
                        )}
                        {selectedProduct.category && (
                          <Badge variant="outline">{selectedProduct.category}</Badge>
                        )}
                      </div>
                      {selectedProduct.other_description && (
                        <p className="text-sm text-green-700 mt-1">{selectedProduct.other_description}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSelectedProduct}
                    className="text-green-700 hover:text-green-900"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 🔧 FORM PRODOTTO SINGOLO MIGLIORATO - IDENTICO A BULK MODE */}
          {(selectedProduct || showNewProductForm || editingProduct) && !bulkMode && (
            <div className="space-y-6">
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Configura Prodotto per la Spedizione</h3>
                
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <div className="space-y-4">
                    
                    {/* Nome e SKU */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-sm font-medium text-blue-800">Nome Prodotto *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Nome del prodotto"
                          disabled={!!selectedProduct}
                          className="mt-1 bg-white border-blue-300 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="sku" className="text-sm font-medium text-blue-800">SKU</Label>
                        <Input
                          id="sku"
                          value={formData.sku}
                          onChange={(e) => handleInputChange('sku', e.target.value)}
                          placeholder="Codice SKU"
                          disabled={!!selectedProduct}
                          className="mt-1 bg-white border-blue-300 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* 🔧 PRIMA RIGA: IDENTICA A BULK - Quantità, Peso, Volume */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="quantity" className="text-sm font-medium text-blue-800">Quantità *</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          value={displayValue(formData.quantity)}
                          onChange={(e) => {
                            const val = e.target.value
                            handleInputChange('quantity', val === '' ? '' : Math.max(1, parseInt(val) || 1))
                          }}
                          onBlur={(e) => {
                            if (!e.target.value || parseInt(e.target.value) < 1) {
                              handleInputChange('quantity', 1)
                            }
                          }}
                          className="mt-1 bg-white border-blue-300 focus:border-blue-500"
                          placeholder="1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="totalWeight" className="text-sm font-medium text-blue-800">Peso Tot. (kg)</Label>
                        <Input
                          id="totalWeight"
                          type="number"
                          min="0"
                          step="0.01"
                          value={displayValue(formData.totalWeight)}
                          onChange={(e) => {
                            const val = e.target.value
                            handleInputChange('totalWeight', val === '' ? '' : parseFloat(val) || 0)
                          }}
                          onBlur={(e) => {
                            if (!e.target.value) {
                              handleInputChange('totalWeight', 0)
                            }
                          }}
                          disabled={!!selectedProduct}
                          className="mt-1 bg-white border-blue-300 focus:border-blue-500"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="totalVolume" className="text-sm font-medium text-blue-800">Volume Tot. (m³)</Label>
                        <Input
                          id="totalVolume"
                          type="number"
                          min="0"
                          step="0.001"
                          value={displayValue(formData.totalVolume)}
                          onChange={(e) => {
                            const val = e.target.value
                            handleInputChange('totalVolume', val === '' ? '' : parseFloat(val) || 0)
                          }}
                          onBlur={(e) => {
                            if (!e.target.value) {
                              handleInputChange('totalVolume', 0)
                            }
                          }}
                          className="mt-1 bg-white border-blue-300 focus:border-blue-500"
                          placeholder="0.000"
                        />
                      </div>
                    </div>

                    {/* 🔧 SECONDA RIGA: IDENTICA A BULK - Costi e Dazi */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="unitCost" className="text-sm font-medium text-blue-800">Costo Unitario (€)</Label>
                        <Input
                          id="unitCost"
                          type="number"
                          min="0"
                          step="0.01"
                          value={displayValue(formData.unitCost)}
                          onChange={(e) => {
                            const val = e.target.value
                            handleInputChange('unitCost', val === '' ? '' : parseFloat(val) || 0)
                          }}
                          onBlur={(e) => {
                            if (!e.target.value) {
                              handleInputChange('unitCost', 0)
                            }
                          }}
                          disabled={!!selectedProduct}
                          className="mt-1 bg-white border-blue-300 focus:border-blue-500"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="dutyRate" className="text-sm font-medium text-blue-800">Aliquota Dazio (%)</Label>
                        <Input
                          id="dutyRate"
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={displayValue(formData.dutyRate)}
                          onChange={(e) => {
                            const val = e.target.value
                            handleInputChange('dutyRate', val === '' ? '' : Math.min(100, Math.max(0, parseFloat(val) || 0)))
                          }}
                          onBlur={(e) => {
                            if (!e.target.value) {
                              handleInputChange('dutyRate', 0)
                            }
                          }}
                          className="mt-1 bg-white border-blue-300 focus:border-blue-500"
                          placeholder="0.0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="customsFees" className="text-sm font-medium text-blue-800">Altri Oneri (€)</Label>
                        <Input
                          id="customsFees"
                          type="number"
                          min="0"
                          step="0.01"
                          value={displayValue(formData.customsFees)}
                          onChange={(e) => {
                            const val = e.target.value
                            handleInputChange('customsFees', val === '' ? '' : parseFloat(val) || 0)
                          }}
                          onBlur={(e) => {
                            if (!e.target.value) {
                              handleInputChange('customsFees', 0)
                            }
                          }}
                          className="mt-1 bg-white border-blue-300 focus:border-blue-500"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    {/* 🔧 TERZA RIGA: IDENTICA A BULK - Costi Trasporto */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="transportUnitCost" className="text-sm font-medium text-blue-800">🚛 Trasporto Unit. (€)</Label>
                        <Input
                          id="transportUnitCost"
                          type="number"
                          min="0"
                          step="0.01"
                          value={displayValue(formData.transportUnitCost)}
                          onChange={(e) => {
                            const val = e.target.value
                            handleInputChange('transportUnitCost', val === '' ? '' : parseFloat(val) || 0)
                          }}
                          onBlur={(e) => {
                            if (!e.target.value) {
                              handleInputChange('transportUnitCost', 0)
                            }
                          }}
                          className="mt-1 bg-white border-blue-300 focus:border-blue-500"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="transportTotalCost" className="text-sm font-medium text-blue-800">🚛 Trasporto Tot. (€)</Label>
                        <Input
                          id="transportTotalCost"
                          type="number"
                          min="0"
                          step="0.01"
                          value={displayValue(formData.transportTotalCost)}
                          onChange={(e) => {
                            const val = e.target.value
                            handleInputChange('transportTotalCost', val === '' ? '' : parseFloat(val) || 0)
                          }}
                          onBlur={(e) => {
                            if (!e.target.value) {
                              handleInputChange('transportTotalCost', 0)
                            }
                          }}
                          className="mt-1 bg-white border-blue-300 focus:border-blue-500"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    {/* 🔧 CALCOLI LIVE IDENTICI A BULK MODE */}
                    <div className="bg-white p-4 rounded border border-blue-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Calculator className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-900">Calcoli Automatici</span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Costo Totale:</span>
                          <span className="font-bold text-green-600 ml-1 block text-lg">
                            €{normalizeValue(formData.totalCost).toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Dazio:</span>
                          <span className="font-bold text-orange-600 ml-1 block text-lg">
                            €{normalizeValue(formData.dutyAmount).toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Altri Oneri:</span>
                          <span className="font-bold text-purple-600 ml-1 block text-lg">
                            €{normalizeValue(formData.customsFees).toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Trasporto:</span>
                          <span className="font-bold text-blue-600 ml-1 block text-lg">
                            €{normalizeValue(formData.transportTotalCost).toFixed(2)}
                          </span>
                        </div>
                        <div className="border-l-2 border-green-300 pl-4">
                          <span className="text-gray-600 font-medium">TOTALE FINALE:</span>
                          <span className="font-bold text-green-600 ml-1 block text-xl">
                            €{(
                              normalizeValue(formData.totalCost) + 
                              normalizeValue(formData.dutyAmount) + 
                              normalizeValue(formData.customsFees) + 
                              normalizeValue(formData.transportTotalCost)
                            ).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-6 border-t">
          <div className="text-sm text-gray-600">
            {!bulkMode && formData.quantity > 0 && formData.totalCost > 0 && (
              <span>Totale: <strong>€{(
                normalizeValue(formData.totalCost) + 
                normalizeValue(formData.dutyAmount) + 
                normalizeValue(formData.customsFees) + 
                normalizeValue(formData.transportTotalCost)
              ).toFixed(2)}</strong></span>
            )}
            {bulkMode && selectedProducts.size > 0 && (
              <span>
                {selectedProducts.size} prodotto{selectedProducts.size > 1 ? 'i' : ''} selezionato{selectedProducts.size > 1 ? 'i' : ''} • 
                <strong> Totale: €{calculations.finalTotal.toFixed(2)}</strong>
              </span>
            )}
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Annulla
            </Button>
            
            {!bulkMode && (
              <Button 
                onClick={handleSubmit} 
                disabled={loading || !formData.name.trim() || formData.quantity <= 0}
                className="min-w-[120px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Salvataggio...
                  </>
                ) : (
                  editingProduct ? 'Aggiorna Prodotto' : 'Aggiungi Prodotto'
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}