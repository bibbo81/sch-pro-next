'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  X, 
  Save, 
  Package, 
  Euro, 
  Weight, 
  Hash, 
  Globe,
  Loader2,
  Plus
} from 'lucide-react'
import { Product, CreateProduct } from '@/types/product'
import { useAuth } from '@/contexts/AuthContext' // ✅ AGGIUNGI QUESTO

interface ProductFormProps {
  product?: Product | null
  categories?: string[]  // ✅ Rimane opzionale
  onSave: (product: CreateProduct) => Promise<void>
  onCancel: () => void
}

export default function ProductForm({ product, categories, onSave, onCancel }: ProductFormProps) {
  // ✅ USA IL CONTEXT INVECE DI HARDCODE
  const { userId } = useAuth()
  
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    sku: '',
    description: '',
    category: '',
    unit_price: '',
    currency: 'EUR',
    weight_kg: '',
    dimensions: '',
    hs_code: '',
    country_of_origin: '',
    supplier_name: '',
    supplier_code: '',
    notes: '',
    min_stock: '',
    max_stock: '',
    quantity: '',
    active: true,
    image_url: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [newCategory, setNewCategory] = useState('')
  const [showNewCategory, setShowNewCategory] = useState(false)

  useEffect(() => {
    if (product) {
      setFormData({
        sku: product.sku || '',
        description: product.description || '',
        category: product.category || '',
        unit_price: product.unit_price?.toString() || '',
        currency: product.currency || 'EUR',
        weight_kg: product.weight_kg?.toString() || '',
        dimensions: product.dimensions || '',
        hs_code: product.hs_code || '',
        country_of_origin: product.country_of_origin || '',
        supplier_name: product.supplier_name || '',
        supplier_code: product.supplier_code || '',
        notes: product.notes || '',
        min_stock: product.min_stock?.toString() || '',
        max_stock: product.max_stock?.toString() || '',
        quantity: product.quantity?.toString() || '',
        active: product.active ?? true,
        image_url: product.image_url || ''
      })
    }
  }, [product])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU è obbligatorio'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Descrizione è obbligatoria'
    }

    if (formData.unit_price && isNaN(parseFloat(formData.unit_price))) {
      newErrors.unit_price = 'Prezzo deve essere un numero valido'
    }

    if (formData.weight_kg && isNaN(parseFloat(formData.weight_kg))) {
      newErrors.weight_kg = 'Peso deve essere un numero valido'
    }

    if (formData.quantity && isNaN(parseInt(formData.quantity))) {
      newErrors.quantity = 'Quantità deve essere un numero intero'
    }

    if (formData.min_stock && isNaN(parseInt(formData.min_stock))) {
      newErrors.min_stock = 'Stock minimo deve essere un numero intero'
    }

    if (formData.max_stock && isNaN(parseInt(formData.max_stock))) {
      newErrors.max_stock = 'Stock massimo deve essere un numero intero'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // ✅ CONTROLLA CHE L'UTENTE SIA AUTENTICATO
    if (!userId) {
      setErrors({ general: 'Utente non autenticato' })
      return
    }

    setLoading(true)

    try {
      const productData = {
        user_id: userId, // ✅ DINAMICO INVECE DI HARDCODED
        sku: formData.sku.trim(),
        description: formData.description.trim(),
        category: formData.category === "__none__" ? null : formData.category || null,
        unit_price: formData.unit_price ? parseFloat(formData.unit_price) : null,
        currency: formData.currency,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        dimensions: formData.dimensions.trim() || null,
        hs_code: formData.hs_code.trim() || null,
        country_of_origin: formData.country_of_origin.trim() || null,
        supplier_name: formData.supplier_name.trim() || null,
        supplier_code: formData.supplier_code.trim() || null,
        notes: formData.notes.trim() || null,
        min_stock: formData.min_stock ? parseInt(formData.min_stock) : null,
        max_stock: formData.max_stock ? parseInt(formData.max_stock) : null,
        quantity: formData.quantity ? parseInt(formData.quantity) : null,
        active: formData.active,
        image_url: formData.image_url.trim() || null,
        metadata: {},
        updated_at: new Date().toISOString()
      }

      let response
      
      if (product) {
        // Update existing product
        response = await fetch(`/api/products/${product.id}?user_id=${userId}`, { // ✅ AGGIUNGI user_id
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        })
      } else {
        // Create new product
        response = await fetch(`/api/products?user_id=${userId}`, { // ✅ AGGIUNGI user_id
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        })
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        onSave(result.data)
      } else {
        throw new Error(result.error || 'Errore nel salvataggio')
      }

    } catch (error) {
      console.error('Error saving product:', error)
      setErrors({ general: 'Errore nel salvataggio del prodotto' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (name: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleAddNewCategory = () => {
    if (newCategory.trim()) {
      setFormData(prev => ({ ...prev, category: newCategory.trim() }))
      setNewCategory('')
      setShowNewCategory(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {product ? 'Modifica Prodotto' : 'Nuovo Prodotto'}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            {/* Informazioni Base */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informazioni Base</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('sku', e.target.value)}
                    placeholder="es. PROD-001"
                    className={errors.sku ? 'border-red-500' : ''}
                  />
                  {errors.sku && <p className="text-xs text-red-500">{errors.sku}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supplier_code">Codice Fornitore</Label>
                  <Input
                    id="supplier_code"
                    value={formData.supplier_code}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('supplier_code', e.target.value)}
                    placeholder="Codice prodotto del fornitore"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrizione *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('description', e.target.value)}
                  placeholder="Descrizione del prodotto..."
                  rows={3}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
              </div>
            </div>

            {/* Categoria */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Categoria</h3>
              
              <div className="space-y-2">
                <Label>Categoria Prodotto</Label>
                <div className="flex gap-2">
                  <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Seleziona categoria..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Nessuna categoria</SelectItem>
                      {(categories || []).sort().map(category => (  // ✅ AGGIUNTO (categories || [])
  <SelectItem key={category} value={category}>
    {category}
  </SelectItem>
))}
                    </SelectContent>
                  </Select>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewCategory(!showNewCategory)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {showNewCategory && (
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newCategory}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCategory(e.target.value)}
                      placeholder="Nome nuova categoria..."
                    />
                    <Button type="button" size="sm" onClick={handleAddNewCategory}>
                      Aggiungi
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => setShowNewCategory(false)}>
                      Annulla
                    </Button>
                  </div>
                )}

                {formData.category && (
                  <Badge variant="outline" className="w-fit">
                    {formData.category}
                  </Badge>
                )}
              </div>
            </div>

            {/* Prezzi e Misure */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Prezzi e Misure</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unit_price">Prezzo Unitario</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
                      <Euro className="h-4 w-4" />
                    </span>
                    <Input
                      id="unit_price"
                      type="number"
                      step="0.01"
                      value={formData.unit_price}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('unit_price', e.target.value)}
                      placeholder="0.00"
                      className={`rounded-l-none ${errors.unit_price ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.unit_price && <p className="text-xs text-red-500">{errors.unit_price}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Valuta</Label>
                  <Select value={formData.currency} onValueChange={(value) => handleChange('currency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="USD">USD - Dollaro</SelectItem>
                      <SelectItem value="GBP">GBP - Sterlina</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight_kg">Peso (kg)</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
                      <Weight className="h-4 w-4" />
                    </span>
                    <Input
                      id="weight_kg"
                      type="number"
                      step="0.001"
                      value={formData.weight_kg}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('weight_kg', e.target.value)}
                      placeholder="0.000"
                      className={`rounded-l-none ${errors.weight_kg ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.weight_kg && <p className="text-xs text-red-500">{errors.weight_kg}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dimensions">Dimensioni</Label>
                <Input
                  id="dimensions"
                  value={formData.dimensions}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('dimensions', e.target.value)}
                  placeholder="es. 30x20x10 cm"
                />
              </div>
            </div>

            {/* Stock */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Inventario</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantità Attuale</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('quantity', e.target.value)}
                    placeholder="0"
                    className={errors.quantity ? 'border-red-500' : ''}
                  />
                  {errors.quantity && <p className="text-xs text-red-500">{errors.quantity}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min_stock">Stock Minimo</Label>
                  <Input
                    id="min_stock"
                    type="number"
                    value={formData.min_stock}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('min_stock', e.target.value)}
                    placeholder="0"
                    className={errors.min_stock ? 'border-red-500' : ''}
                  />
                  {errors.min_stock && <p className="text-xs text-red-500">{errors.min_stock}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_stock">Stock Massimo</Label>
                  <Input
                    id="max_stock"
                    type="number"
                    value={formData.max_stock}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('max_stock', e.target.value)}
                    placeholder="0"
                    className={errors.max_stock ? 'border-red-500' : ''}
                  />
                  {errors.max_stock && <p className="text-xs text-red-500">{errors.max_stock}</p>}
                </div>
              </div>
            </div>

            {/* Informazioni Commerciali */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informazioni Commerciali</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hs_code">Codice HS</Label>
                  <Input
                    id="hs_code"
                    value={formData.hs_code}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('hs_code', e.target.value)}
                    placeholder="es. 3926.90.97"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country_of_origin">Paese di Origine</Label>
                  <Input
                    id="country_of_origin"
                    value={formData.country_of_origin}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('country_of_origin', e.target.value)}
                    placeholder="es. CN, IT, DE"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier_name">Nome Fornitore</Label>
                <Input
                  id="supplier_name"
                  value={formData.supplier_name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('supplier_name', e.target.value)}
                  placeholder="Nome del fornitore principale"
                />
              </div>
            </div>

            {/* Altre Informazioni */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Altre Informazioni</h3>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Note</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('notes', e.target.value)}
                  placeholder="Note aggiuntive sul prodotto..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">URL Immagine</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('image_url', e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => handleChange('active', checked)}
                />
                <Label htmlFor="active">Prodotto attivo</Label>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                Annulla
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Save className="h-4 w-4 mr-2" />
                {product ? 'Aggiorna' : 'Crea'} Prodotto
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}