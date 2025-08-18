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

interface Product {
  id: string
  user_id: string
  sku: string
  description: string
  other_description?: string
  category?: string
  unit_price?: number
  currency?: string
  weight_kg?: number
  dimensions_cm?: any
  hs_code?: string
  origin_country?: string
  metadata: any
  active: boolean
  created_at: string
  updated_at: string
  organization_id?: string
  ean?: string
}

interface ProductFormProps {
  product?: Product | null
  categories: string[]
  onSave: (product: Product) => void
  onCancel: () => void
}

export default function ProductForm({ product, categories, onSave, onCancel }: ProductFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    sku: '',
    description: '',
    other_description: '',
    category: '',
    unit_price: '',
    currency: 'EUR',
    weight_kg: '',
    hs_code: '',
    origin_country: '',
    active: true,
    ean: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [newCategory, setNewCategory] = useState('')
  const [showNewCategory, setShowNewCategory] = useState(false)

  useEffect(() => {
    if (product) {
      setFormData({
        sku: product.sku || '',
        description: product.description || '',
        other_description: product.other_description || '',
        category: product.category || '',
        unit_price: product.unit_price?.toString() || '',
        currency: product.currency || 'EUR',
        weight_kg: product.weight_kg?.toString() || '',
        hs_code: product.hs_code || '',
        origin_country: product.origin_country || '',
        active: product.active ?? true,
        ean: product.ean || ''
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

    if (formData.ean && (formData.ean.length < 8 || formData.ean.length > 13)) {
      newErrors.ean = 'EAN deve essere tra 8 e 13 caratteri'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const userId = "21766c53-a16b-4019-9a11-845ecea8cf10"
      
      const productData = {
        user_id: userId,
        sku: formData.sku.trim(),
        description: formData.description.trim(),
        other_description: formData.other_description.trim() || null,
        category: formData.category === "__none__" ? null : formData.category || null,        unit_price: formData.unit_price ? parseFloat(formData.unit_price) : null,
        currency: formData.currency,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        hs_code: formData.hs_code.trim() || null,
        origin_country: formData.origin_country.trim() || null,
        active: formData.active,
        ean: formData.ean.trim() || null,
        metadata: {},
        updated_at: new Date().toISOString()
      }

      let response
      
      if (product) {
        // Update existing product
        response = await fetch(`/api/products/${product.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        })
      } else {
        // Create new product
        response = await fetch('/api/products', {
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
                  <Label htmlFor="ean">Codice EAN</Label>
                  <Input
                    id="ean"
                    value={formData.ean}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('ean', e.target.value)}
                    placeholder="8057500164222"
                    className={errors.ean ? 'border-red-500' : ''}
                  />
                  {errors.ean && <p className="text-xs text-red-500">{errors.ean}</p>}
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

              <div className="space-y-2">
                <Label htmlFor="other_description">Descrizione Aggiuntiva</Label>
                <Textarea
                  id="other_description"
                  value={formData.other_description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('other_description', e.target.value)}
                  placeholder="Informazioni aggiuntive..."
                  rows={2}
                />
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
                      {categories.sort().map(category => (
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
                  <Label htmlFor="origin_country">Paese di Origine</Label>
                  <Input
                    id="origin_country"
                    value={formData.origin_country}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('origin_country', e.target.value)}
                    placeholder="es. CN, IT, DE"
                  />
                </div>
              </div>
            </div>

            {/* Stato */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Stato Prodotto</h3>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked: boolean) => handleChange('active', checked)}
                />
                <Label htmlFor="active">
                  Prodotto attivo
                </Label>
                <Badge variant={formData.active ? 'default' : 'secondary'}>
                  {formData.active ? 'Attivo' : 'Inattivo'}
                </Badge>
              </div>
            </div>

            {/* Azioni */}
            <div className="flex items-center justify-end space-x-2 pt-6">
              <Button type="button" variant="outline" onClick={onCancel}>
                Annulla
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {product ? 'Aggiorna' : 'Crea'} Prodotto
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}