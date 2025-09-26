'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DollarSign, Calculator } from 'lucide-react'
import { AdditionalCost } from '@/hooks/useShipmentDetails'

interface CostModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (cost: Omit<AdditionalCost, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  editingCost?: AdditionalCost | null
  loading?: boolean
}

const COST_TYPES = [
  { value: 'handling', label: 'Handling' },
  { value: 'storage', label: 'Magazzinaggio' },
  { value: 'customs_clearance', label: 'Sdoganamento' },
  { value: 'documentation', label: 'Documentazione' },
  { value: 'inspection', label: 'Ispezione' },
  { value: 'insurance', label: 'Assicurazione' },
  { value: 'demurrage', label: 'Demurrage' },
  { value: 'detention', label: 'Detention' },
  { value: 'terminal_handling', label: 'Terminal Handling' },
  { value: 'fuel_surcharge', label: 'Fuel Surcharge' },
  { value: 'security_fee', label: 'Security Fee' },
  { value: 'administrative', label: 'Spese Amministrative' },
  { value: 'transport', label: 'Trasporto Aggiuntivo' },
  { value: 'other', label: 'Altro' }
]

const CURRENCIES = [
  { value: 'EUR', label: 'Euro (€)', symbol: '€' },
  { value: 'USD', label: 'Dollaro USA ($)', symbol: '$' },
  { value: 'GBP', label: 'Sterlina (£)', symbol: '£' },
  { value: 'CHF', label: 'Franco Svizzero (CHF)', symbol: 'CHF' },
  { value: 'JPY', label: 'Yen (¥)', symbol: '¥' }
]

export default function CostModal({ 
  isOpen, 
  onClose, 
  onSave,
  editingCost,
  loading = false 
}: CostModalProps) {
  const [formData, setFormData] = useState({
    cost_type: '',
    amount: '',
    currency: 'EUR',
    notes: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initialize form when editing
  useEffect(() => {
    if (editingCost) {
      setFormData({
        cost_type: editingCost.cost_type || '',
        amount: editingCost.amount?.toString() || '',
        currency: editingCost.currency || 'EUR',
        notes: editingCost.notes || ''
      })
    } else {
      setFormData({
        cost_type: '',
        amount: '',
        currency: 'EUR',
        notes: ''
      })
    }
    setErrors({})
  }, [editingCost, isOpen])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.cost_type.trim()) {
      newErrors.cost_type = 'Il tipo di costo è obbligatorio'
    }

    const amount = parseFloat(formData.amount)
    if (!formData.amount.trim()) {
      newErrors.amount = 'L\'importo è obbligatorio'
    } else if (isNaN(amount) || amount <= 0) {
      newErrors.amount = 'Inserisci un importo valido maggiore di zero'
    }

    if (!formData.currency) {
      newErrors.currency = 'La valuta è obbligatoria'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      const costData: Omit<AdditionalCost, 'id' | 'created_at' | 'updated_at'> = {
        cost_type: formData.cost_type.trim(),
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        notes: formData.notes.trim() || null,
        shipment_id: null, // Will be set by the hook
        organization_id: null // Will be set by the hook
      }

      await onSave(costData)
      onClose()

    } catch (err) {
      console.error('Error saving cost:', err)
    }
  }

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const getCurrencySymbol = (currency: string): string => {
    return CURRENCIES.find(c => c.value === currency)?.symbol || currency
  }

  const selectedCurrency = CURRENCIES.find(c => c.value === formData.currency)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {editingCost ? 'Modifica Costo' : 'Aggiungi Costo Aggiuntivo'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cost Type */}
          <div className="space-y-2">
            <Label htmlFor="cost_type">Tipo di Costo *</Label>
            <Select 
              value={formData.cost_type} 
              onValueChange={(value) => updateFormData('cost_type', value)}
            >
              <SelectTrigger className={errors.cost_type ? 'border-red-500' : ''}>
                <SelectValue placeholder="Seleziona tipo di costo" />
              </SelectTrigger>
              <SelectContent>
                {COST_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.cost_type && (
              <p className="text-sm text-red-600">{errors.cost_type}</p>
            )}
          </div>

          {/* Amount and Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="amount">Importo *</Label>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => updateFormData('amount', e.target.value)}
                  placeholder="0.00"
                  className={`pr-12 ${errors.amount ? 'border-red-500' : ''}`}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                  {getCurrencySymbol(formData.currency)}
                </div>
              </div>
              {errors.amount && (
                <p className="text-sm text-red-600">{errors.amount}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Valuta *</Label>
              <Select 
                value={formData.currency} 
                onValueChange={(value) => updateFormData('currency', value)}
              >
                <SelectTrigger className={errors.currency ? 'border-red-500' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      <div className="flex items-center gap-2">
                        <span>{currency.symbol}</span>
                        <span>{currency.value}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.currency && (
                <p className="text-sm text-red-600">{errors.currency}</p>
              )}
            </div>
          </div>

          {/* Amount Preview */}
          {formData.amount && !isNaN(parseFloat(formData.amount)) && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm">
                <Calculator className="h-4 w-4 text-gray-600" />
                <span className="text-gray-600">Importo:</span>
                <span className="font-medium">
                  {selectedCurrency?.symbol} {parseFloat(formData.amount).toLocaleString('it-IT', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </span>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Note</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => updateFormData('notes', e.target.value)}
              placeholder="Descrizione dettagliata del costo..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Annulla
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvataggio...' : editingCost ? 'Aggiorna' : 'Aggiungi'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}