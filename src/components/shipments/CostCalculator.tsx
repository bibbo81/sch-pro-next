// src/components/shipments/CostCalculator.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calculator, TrendingUp } from 'lucide-react'

const CONTAINER_COSTS = {
  "20'": { base: 2500, per_kg: 0.5, per_cbm: 25 },
  "40'": { base: 3500, per_kg: 0.4, per_cbm: 20 },
  "40'HC": { base: 3800, per_kg: 0.4, per_cbm: 18 }
}

export function CostCalculator({ onCalculate }: { onCalculate?: (costs: any) => void }) {
  const [formData, setFormData] = useState({
    containerType: "20'",
    weight: 0,
    volume: 0,
    origin: 'Shanghai',
    destination: 'Milano',
    insuranceValue: 0
  })

  const [calculation, setCalculation] = useState<any>(null)

  const calculateCosts = () => {
    const containerCost = CONTAINER_COSTS[formData.containerType as keyof typeof CONTAINER_COSTS]
    if (!containerCost) return

    const freight = containerCost.base + 
                   (formData.weight * containerCost.per_kg) + 
                   (formData.volume * containerCost.per_cbm)

    const insurance = formData.insuranceValue * 0.002 // 0.2%
    const handling = freight * 0.1 // 10% handling
    const documentation = 150
    const customs = formData.insuranceValue * 0.05 // 5% customs

    const total = freight + insurance + handling + documentation + customs

    const result = {
      freight,
      insurance,
      handling,
      documentation,
      customs,
      total,
      breakdown: [
        { label: 'Trasporto', amount: freight, percentage: (freight/total)*100 },
        { label: 'Assicurazione', amount: insurance, percentage: (insurance/total)*100 },
        { label: 'Handling', amount: handling, percentage: (handling/total)*100 },
        { label: 'Documentazione', amount: documentation, percentage: (documentation/total)*100 },
        { label: 'Dogana', amount: customs, percentage: (customs/total)*100 }
      ]
    }

    setCalculation(result)
    onCalculate?.(result)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Calcolatore Costi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tipo Container</label>
            <select
              value={formData.containerType}
              onChange={(e) => setFormData(prev => ({ ...prev, containerType: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="20'">20' Standard</option>
              <option value="40'">40' Standard</option>
              <option value="40'HC">40' High Cube</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Peso (kg)</label>
            <Input
              type="number"
              value={formData.weight}
              onChange={(e) => setFormData(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Volume (m³)</label>
            <Input
              type="number"
              step="0.01"
              value={formData.volume}
              onChange={(e) => setFormData(prev => ({ ...prev, volume: parseFloat(e.target.value) || 0 }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Valore Assicurato (€)</label>
            <Input
              type="number"
              value={formData.insuranceValue}
              onChange={(e) => setFormData(prev => ({ ...prev, insuranceValue: parseFloat(e.target.value) || 0 }))}
            />
          </div>
        </div>

        <Button onClick={calculateCosts} className="w-full">
          <Calculator className="h-4 w-4 mr-2" />
          Calcola Costi
        </Button>

        {calculation && (
          <div className="mt-6 space-y-4">
            <div className="font-medium text-lg">Stima Costi Totali: {formatCurrency(calculation.total)}</div>
            
            <div className="space-y-2">
              {calculation.breakdown.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{formatCurrency(item.amount)}</span>
                    <span className="text-xs text-gray-500">({item.percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <strong>Suggerimento:</strong> Ottimizza il carico per ridurre i costi per kg/m³
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}