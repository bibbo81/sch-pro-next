'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ShipmentDetailsView from '@/components/shipment-details/ShipmentDetailsView';
import { getShipmentDetails } from '@/services/shipmentsService';
import { Shipment } from '@/types/shipment';

export default function ShipmentDetailsPage() {
  const searchParams = useSearchParams();
  const shipmentId = searchParams.get('id');
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('🔍 ShipmentDetailsPage - shipmentId from URL:', shipmentId); // ✅ Debug

  useEffect(() => {
    if (shipmentId) {
      loadShipmentDetails();
    } else {
      console.log('❌ No shipmentId found in URL'); // ✅ Debug
      setLoading(false);
    }
  }, [shipmentId]);

  const loadShipmentDetails = async () => {
    try {
      setLoading(true);
      console.log('🚀 Loading shipment details for ID:', shipmentId); // ✅ Debug
      const data = await getShipmentDetails(shipmentId!);
      console.log('🚀 Shipment loaded in page.tsx:', data); // ✅ Debug
      setShipment(data);
    } catch (error) {
      console.error('❌ Error loading shipment:', error);
    } finally {
      setLoading(false);
    }
  };

  console.log('🎯 Current shipment state:', shipment); // ✅ Debug
  console.log('🎯 Loading state:', loading); // ✅ Debug

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Caricamento...</span>
        </div>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Spedizione non trovata
          </h1>
          <p className="text-gray-600">
            La spedizione richiesta non esiste o non è accessibile.
          </p>
        </div>
      </div>
    );
  }

  console.log('🎯 Passing shipment to ShipmentDetailsView:', shipment); // ✅ Debug

  return (
    <div className="container mx-auto px-4 py-8">
      <ShipmentDetailsView 
        shipment={shipment} 
        onUpdate={loadShipmentDetails} 
      />
    </div>
  );
}