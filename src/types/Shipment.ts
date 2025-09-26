export type ShipmentStatus = 
  | 'planned' 
  | 'booked' 
  | 'shipped' 
  | 'in_transit' 
  | 'arrived' 
  | 'delivered' 
  | 'cancelled'

export interface Shipment {
  id: string
  shipment_number: string
  user_id: string
  organization_id?: string
  
  // Status
  status?: ShipmentStatus
  
  // Basic info
  type?: string
  incoterm?: string
  reference_number?: string
  booking_number?: string
  tracking_number?: string
  
  // Commercial parties
  supplier_name?: string
  supplier_address?: string
  supplier_contact?: string
  recipient_name?: string
  recipient_address?: string
  recipient_contact?: string
  
  // Transport details
  transport_mode?: string
  carrier_name?: string
  forwarder_id?: string  // Link to carriers table for cost allocation
  forwarder_name?: string  // Nome dello spedizioniere (for display)
  vessel_name?: string
  voyage_number?: string
  
  // Ports and locations
  origin?: string
  origin_port?: string
  destination?: string
  destination_port?: string
  
  // Dates
  departure_date?: string
  eta?: string
  ata?: string
  
  // Container details
  container_number?: string
  container_type?: string
  container_count?: number
  seal_number?: string
  
  // Cargo details
  total_value?: number
  currency?: string
  total_weight_kg?: number
  total_volume_m3?: number
  
  // Tracking details
  last_event_date?: string
  last_event_location?: string
  last_event_description?: string
  
  // Additional fields
  dangerous_goods?: boolean
  temperature_controlled?: boolean
  customs_cleared?: boolean
  
  // Metadata
  created_at: string
  updated_at: string
  created_by?: string
  notes?: string
  
  // Relations (optional, for joins)
  shipment_items?: ShipmentItem[]
  documents?: ShipmentDocument[]
  costs?: ShipmentCost[]
}

export interface ShipmentItem {
  id: string
  shipment_id: string
  product_id?: string
  name: string
  sku?: string
  description?: string
  quantity: number
  unit_price?: number
  total_price?: number
  currency?: string
  weight_kg?: number
  volume_m3?: number
  hs_code?: string
  country_of_origin?: string
  created_at: string
  updated_at: string
}

export interface ShipmentProduct {
  id: string
  shipment_id: string
  product_id?: string
  name: string
  sku?: string
  description?: string
  quantity: number
  unit_price?: number
  total_price?: number
  currency?: string
  weight_kg?: number
  volume_m3?: number
  hs_code?: string
  country_of_origin?: string
  created_at: string
  updated_at: string
}

export interface ShipmentDocument {
  id: string
  shipment_id: string
  name: string
  type: string
  url?: string
  file_path?: string
  size_bytes?: number
  uploaded_by?: string
  created_at: string
}

export interface ShipmentCost {
  id: string
  shipment_id: string
  type: string
  description: string
  amount: number
  currency: string
  supplier?: string
  invoice_number?: string
  created_at: string
}

export interface CreateShipmentData {
  shipment_number?: string
  status?: ShipmentStatus
  type?: string
  origin?: string
  destination?: string
  departure_date?: string
  eta?: string
  carrier_name?: string
  tracking_number?: string
  supplier_name?: string
  recipient_name?: string
  total_value?: number
  currency?: string
  notes?: string
}

export interface CreateShipmentItemData {
  name: string
  quantity: number
  unit_price?: number
  currency?: string
  weight_kg?: number
  sku?: string
  description?: string
}