// src/components/shipment-details/ShipmentDetailsView.tsx
'use client';

import React from 'react';
import ShipmentInfo from './ShipmentInfo';
import ProductsSection from './ProductsSection';
import DocumentsSection from './DocumentsSection';
import { Shipment } from '@/types/shipment';

interface ShipmentDetailsViewProps {
  shipment: Shipment;
  onUpdate: () => void;
}

export default function ShipmentDetailsView({ shipment, onUpdate }: ShipmentDetailsViewProps) {
    console.log('📦 ShipmentDetailsView received:', shipment); // ✅ Debug
  return (
    <div className="shipment-details">
      <ShipmentInfo shipment={shipment} />
      <ProductsSection shipment={shipment} onUpdate={onUpdate} />
      <DocumentsSection shipment={shipment} onUpdate={onUpdate} />
    </div>
  );
}