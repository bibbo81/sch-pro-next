'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shipment } from '@/types/shipment';
import { DollarSign, Plus, Trash2 } from 'lucide-react';

interface CostsSectionProps {
  shipment: Shipment;
  onUpdate: () => void;
}

interface ShipmentCost {
  id?: string;
  type: string;
  description: string;
  amount: number;
  currency: string;
}

export default function CostsSection({ shipment, onUpdate }: CostsSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [costs, setCosts] = useState<ShipmentCost[]>([
    { type: 'freight', description: 'Costo Nolo', amount: 3500, currency: 'EUR' },
    { type: 'additional', description: 'Altri Costi', amount: 1400, currency: 'EUR' }
  ]);

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const totalCost = costs.reduce((sum, cost) => sum + cost.amount, 0);

  const addCost = () => {
    setCosts([...costs, { type: 'additional', description: '', amount: 0, currency: 'EUR' }]);
  };

  const removeCost = (index: number) => {
    setCosts(costs.filter((_, i) => i !== index));
  };

  const updateCost = (index: number, field: keyof ShipmentCost, value: any) => {
    const updatedCosts = [...costs];
    updatedCosts[index] = { ...updatedCosts[index], [field]: value };
    setCosts(updatedCosts);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Costi Aggiuntivi
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Salva Costi' : 'Modifica'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <div className="space-y-4">
            {costs.map((cost, index) => (
              <div key={index} className="flex items-end gap-2 p-3 border rounded-lg bg-muted/50 dark:bg-slate-800/50">
                <div className="flex-1">
                  <Label htmlFor={`cost-desc-${index}`} className="text-sm">
                    Descrizione
                  </Label>
                  <Input
                    id={`cost-desc-${index}`}
                    value={cost.description}
                    onChange={(e) => updateCost(index, 'description', e.target.value)}
                    placeholder="Descrizione costo"
                    className="mt-1"
                  />
                </div>
                <div className="w-32">
                  <Label htmlFor={`cost-amount-${index}`} className="text-sm">
                    Importo
                  </Label>
                  <Input
                    id={`cost-amount-${index}`}
                    type="number"
                    value={cost.amount}
                    onChange={(e) => updateCost(index, 'amount', parseFloat(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeCost(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={addCost}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi Costo
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {costs.map((cost, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted/30 dark:bg-slate-800/30 rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{cost.description}</h4>
                  <p className="text-sm text-muted-foreground">
                    Aggiunto il {new Date().toLocaleDateString('it-IT')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency(cost.amount, cost.currency)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="border-t pt-4 mt-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Costo Totale:</span>
            <span className="text-xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(totalCost)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}