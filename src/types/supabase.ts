export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          organization_id: string | null
          user_id: string
          description: string
          sku: string
          unit_price: number | null
          currency: string | null
          category: string | null
          weight_kg: number | null
          dimensions_cm: Json | null
          ean: string | null
          hs_code: string | null
          origin_country: string | null
          other_description: string | null
          active: boolean | null
          metadata: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          organization_id?: string | null
          user_id: string
          description: string
          sku: string
          unit_price?: number | null
          currency?: string | null
          category?: string | null
          weight_kg?: number | null
          dimensions_cm?: Json | null
          ean?: string | null
          hs_code?: string | null
          origin_country?: string | null
          other_description?: string | null
          active?: boolean | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string | null
          user_id?: string
          description?: string
          sku?: string
          unit_price?: number | null
          currency?: string | null
          category?: string | null
          weight_kg?: number | null
          dimensions_cm?: Json | null
          ean?: string | null
          hs_code?: string | null
          origin_country?: string | null
          other_description?: string | null
          active?: boolean | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          updated_at?: string
        }
      }
      organization_members: {
        Row: {
          id: string
          user_id: string
          organization_id: string
          role: string
          restrict_to_own_records: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          organization_id: string
          role?: string
          restrict_to_own_records?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string
          role?: string
          restrict_to_own_records?: boolean
          updated_at?: string
        }
      }
      additional_costs: {
        Row: {
          id: string
          amount: number
          cost_type: string
          created_at: string | null
          currency: string
          notes: string | null
          organization_id: string | null
          shipment_id: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          amount: number
          cost_type: string
          created_at?: string | null
          currency: string
          notes?: string | null
          organization_id?: string | null
          shipment_id?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          amount?: number
          cost_type?: string
          created_at?: string | null
          currency?: string
          notes?: string | null
          organization_id?: string | null
          shipment_id?: string | null
          updated_at?: string | null
        }
      }
      shipment_items: {
        Row: {
          id: string
          shipment_id: string | null
          product_id: string | null
          quantity: number
          unit_price: number | null
          total_price: number | null
          weight_kg: number | null
          volume_cbm: number | null
          hs_code: string | null
          created_at: string | null
          name: string | null
          sku: string | null
          organization_id: string | null
          total_value: number | null
          total_weight_kg: number | null
          total_volume_cbm: number | null
          unit_value: number | null
          cost_metadata: Json | null
          unit_cost: number | null
          total_cost: number | null
          duty_rate: number | null
          duty_amount: number | null
          duty_unit_cost: number | null
          customs_fees: number | null
        }
        Insert: {
          id?: string
          shipment_id?: string | null
          product_id?: string | null
          quantity: number
          unit_price?: number | null
          total_price?: number | null
          weight_kg?: number | null
          volume_cbm?: number | null
          hs_code?: string | null
          created_at?: string | null
          name?: string | null
          sku?: string | null
          organization_id?: string | null
          total_value?: number | null
          total_weight_kg?: number | null
          total_volume_cbm?: number | null
          unit_value?: number | null
          cost_metadata?: Json | null
          unit_cost?: number | null
          total_cost?: number | null
          duty_rate?: number | null
          duty_amount?: number | null
          duty_unit_cost?: number | null
          customs_fees?: number | null
        }
        Update: {
          id?: string
          shipment_id?: string | null
          product_id?: string | null
          quantity?: number
          unit_price?: number | null
          total_price?: number | null
          weight_kg?: number | null
          volume_cbm?: number | null
          hs_code?: string | null
          created_at?: string | null
          name?: string | null
          sku?: string | null
          organization_id?: string | null
          total_value?: number | null
          total_weight_kg?: number | null
          total_volume_cbm?: number | null
          unit_value?: number | null
          cost_metadata?: Json | null
          unit_cost?: number | null
          total_cost?: number | null
          duty_rate?: number | null
          duty_amount?: number | null
          duty_unit_cost?: number | null
          customs_fees?: number | null
        }
      }
      shipments: {
        Row: {
          id: string
          organization_id: string | null
          shipment_number: string
          status: string | null
          tracking_number: string | null
          tracking_id: string | null
          reference_number: string | null
          transport_mode: string | null
          transport_company: string | null
          origin: string | null
          destination: string | null
          origin_port: string | null
          destination_port: string | null
          departure_date: string | null
          arrival_date: string | null
          shipped_date: string | null
          estimated_arrival: string | null
          actual_arrival: string | null
          incoterm: string | null
          supplier_name: string | null
          supplier_country: string | null
          consignee_name: string | null
          consignee_country: string | null
          total_weight_kg: number | null
          total_volume_cbm: number | null
          total_value: number | null
          currency: string | null
          exchange_rate: number | null
          total_cost: number | null
          freight_cost: number | null
          insurance_cost: number | null
          customs_value: number | null
          duty_amount: number | null
          vat_amount: number | null
          other_costs: number | null
          route: Json | null
          schedule: Json | null
          products: Json | null
          metadata: Json | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
          user_id: string | null
          tracking_type: string | null
          source_tracking_id: string | null
          last_tracking_update: string | null
          pieces: number | null
          container_number: string | null
          container_type: string | null
          bill_of_lading: string | null
          commercial_invoice: string | null
          packing_list: string | null
          certificate_origin: string | null
          insurance_certificate: string | null
          customs_declaration: string | null
          transit_time: number | null
          delays: Json | null
          milestones: Json | null
          alerts: Json | null
          origin_country: string | null
          destination_country: string | null
          customs_status: string | null
          customs_clearance_date: string | null
          delivery_status: string | null
          delivery_date: string | null
          carrier: string | null
          vessel_voyage: string | null
          eta_destination: string | null
          etd_origin: string | null
          port_of_loading: string | null
          port_of_discharge: string | null
          place_of_receipt: string | null
          place_of_delivery: string | null
        }
        Insert: {
          id?: string
          organization_id?: string | null
          shipment_number: string
          status?: string | null
          tracking_number?: string | null
          tracking_id?: string | null
          reference_number?: string | null
          transport_mode?: string | null
          transport_company?: string | null
          origin?: string | null
          destination?: string | null
          origin_port?: string | null
          destination_port?: string | null
          departure_date?: string | null
          arrival_date?: string | null
          shipped_date?: string | null
          estimated_arrival?: string | null
          actual_arrival?: string | null
          incoterm?: string | null
          supplier_name?: string | null
          supplier_country?: string | null
          consignee_name?: string | null
          consignee_country?: string | null
          total_weight_kg?: number | null
          total_volume_cbm?: number | null
          total_value?: number | null
          currency?: string | null
          exchange_rate?: number | null
          total_cost?: number | null
          freight_cost?: number | null
          insurance_cost?: number | null
          customs_value?: number | null
          duty_amount?: number | null
          vat_amount?: number | null
          other_costs?: number | null
          route?: Json | null
          schedule?: Json | null
          products?: Json | null
          metadata?: Json | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          tracking_type?: string | null
          source_tracking_id?: string | null
          last_tracking_update?: string | null
          pieces?: number | null
          container_number?: string | null
          container_type?: string | null
          bill_of_lading?: string | null
          commercial_invoice?: string | null
          packing_list?: string | null
          certificate_origin?: string | null
          insurance_certificate?: string | null
          customs_declaration?: string | null
          transit_time?: number | null
          delays?: Json | null
          milestones?: Json | null
          alerts?: Json | null
          origin_country?: string | null
          destination_country?: string | null
          customs_status?: string | null
          customs_clearance_date?: string | null
          delivery_status?: string | null
          delivery_date?: string | null
          carrier?: string | null
          vessel_voyage?: string | null
          eta_destination?: string | null
          etd_origin?: string | null
          port_of_loading?: string | null
          port_of_discharge?: string | null
          place_of_receipt?: string | null
          place_of_delivery?: string | null
        }
        Update: {
          id?: string
          organization_id?: string | null
          shipment_number?: string
          status?: string | null
          tracking_number?: string | null
          tracking_id?: string | null
          reference_number?: string | null
          transport_mode?: string | null
          transport_company?: string | null
          origin?: string | null
          destination?: string | null
          origin_port?: string | null
          destination_port?: string | null
          departure_date?: string | null
          arrival_date?: string | null
          shipped_date?: string | null
          estimated_arrival?: string | null
          actual_arrival?: string | null
          incoterm?: string | null
          supplier_name?: string | null
          supplier_country?: string | null
          consignee_name?: string | null
          consignee_country?: string | null
          total_weight_kg?: number | null
          total_volume_cbm?: number | null
          total_value?: number | null
          currency?: string | null
          exchange_rate?: number | null
          total_cost?: number | null
          freight_cost?: number | null
          insurance_cost?: number | null
          customs_value?: number | null
          duty_amount?: number | null
          vat_amount?: number | null
          other_costs?: number | null
          route?: Json | null
          schedule?: Json | null
          products?: Json | null
          metadata?: Json | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          tracking_type?: string | null
          source_tracking_id?: string | null
          last_tracking_update?: string | null
          pieces?: number | null
          container_number?: string | null
          container_type?: string | null
          bill_of_lading?: string | null
          commercial_invoice?: string | null
          packing_list?: string | null
          certificate_origin?: string | null
          insurance_certificate?: string | null
          customs_declaration?: string | null
          transit_time?: number | null
          delays?: Json | null
          milestones?: Json | null
          alerts?: Json | null
          origin_country?: string | null
          destination_country?: string | null
          customs_status?: string | null
          customs_clearance_date?: string | null
          delivery_status?: string | null
          delivery_date?: string | null
          carrier?: string | null
          vessel_voyage?: string | null
          eta_destination?: string | null
          etd_origin?: string | null
          port_of_loading?: string | null
          port_of_discharge?: string | null
          place_of_receipt?: string | null
          place_of_delivery?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// ✅ HELPER TYPES SEMPLIFICATI (solo quelli che servono)
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']