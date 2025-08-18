export interface Shipment {
  id: string;
  user_id: string;
  tracking_number?: string;
  reference_number?: string;
  origin_port?: string;
  destination_port?: string;
  departure_date?: string;
  estimated_arrival?: string;
  actual_arrival?: string;
  status?: 'pending' | 'in_transit' | 'delivered' | 'delayed' | 'cancelled';
  carrier?: string;
  vessel_name?: string;
  voyage_number?: string;
  container_number?: string;
  container_type?: string;
  seal_number?: string;
  booking_reference?: string;
  bill_of_lading?: string;
  shipper_name?: string;
  shipper_address?: string;
  consignee_name?: string;
  consignee_address?: string;
  notify_party?: string;
  port_of_loading?: string;
  port_of_discharge?: string;
  place_of_delivery?: string;
  place_of_receipt?: string;
  incoterms?: string;
  total_value?: number;
  currency?: string;
  total_weight?: number;
  total_volume?: number;
  number_of_packages?: number;
  package_type?: string;
  description_of_goods?: string;
  hs_code?: string;
  freight_terms?: string;
  payment_terms?: string;
  created_at: string;
  updated_at: string;
  active: boolean;
}

export interface ShipmentProduct {
  id: string;
  shipment_id: string;
  product_id: string;
  quantity: number;
  unit_price?: number;
  created_at?: string;
  // Campi calcolati
  total_price?: number;
  currency?: string;
  // Relazione con prodotto
  product?: {
    id: string;
    sku: string;
    description: string;
    category?: string;
    weight_kg?: number;
    hs_code?: string;
    unit_price?: number;
    currency?: string;
  };
}

export interface ShipmentDocument {
  id: string;
  shipment_id: string;
  document_type: string;
  document_name: string;
  file_url: string;
  uploaded_at: string;
  file_size?: number;
  mime_type?: string;
}

export interface ShipmentCost {
  id: string;
  shipment_id: string;
  cost_type: string;
  description: string;
  amount: number;
  currency: string;
  supplier?: string;
  invoice_reference?: string;
  payment_status?: 'pending' | 'paid' | 'overdue';
  due_date?: string;
}