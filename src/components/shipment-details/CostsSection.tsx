'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shipment } from '@/types/shipment';
import { DollarSign } from 'lucide-react';

interface CostsSectionProps {
  shipment: Shipment;
  onUpdate: () => void;
}

export default function CostsSection({ shipment, onUpdate }: CostsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Costs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Costs section coming soon...</p>
      </CardContent>
    </Card>
  );
}