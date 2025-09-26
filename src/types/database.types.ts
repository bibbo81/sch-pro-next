export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      additional_costs: {
        Row: {
          amount: number
          cost_type: string
          created_at: string | null
          currency: string
          id: string
          notes: string | null
          organization_id: string | null
          shipment_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          cost_type: string
          created_at?: string | null
          currency?: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          shipment_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          cost_type?: string
          created_at?: string | null
          currency?: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          shipment_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "additional_costs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "additional_costs_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      api_logs: {
        Row: {
          api_name: string
          created_at: string | null
          credits_used: number | null
          endpoint: string
          error_message: string | null
          id: string
          method: string
          request_data: Json | null
          response_data: Json | null
          status_code: number | null
          user_id: string
        }
        Insert: {
          api_name: string
          created_at?: string | null
          credits_used?: number | null
          endpoint: string
          error_message?: string | null
          id?: string
          method: string
          request_data?: Json | null
          response_data?: Json | null
          status_code?: number | null
          user_id: string
        }
        Update: {
          api_name?: string
          created_at?: string | null
          credits_used?: number | null
          endpoint?: string
          error_message?: string | null
          id?: string
          method?: string
          request_data?: Json | null
          response_data?: Json | null
          status_code?: number | null
          user_id?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      carriers: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          organization_id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          organization_id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          organization_id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carriers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      column_mapping_templates: {
        Row: {
          created_at: string | null
          id: string
          mappings: Json
          organization_id: string | null
          template_name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          mappings: Json
          organization_id?: string | null
          template_name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          mappings?: Json
          organization_id?: string | null
          template_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "column_mapping_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          related_id: string | null
          related_type: string | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          related_id?: string | null
          related_type?: string | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          related_id?: string | null
          related_type?: string | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      organization_api_keys: {
        Row: {
          api_key: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          organization_id: string | null
          provider: string
          updated_at: string | null
        }
        Insert: {
          api_key: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          provider: string
          updated_at?: string | null
        }
        Update: {
          api_key?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          provider?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_api_keys_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string | null
          restrict_to_own_records: boolean | null
          role: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          restrict_to_own_records?: boolean | null
          role?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          restrict_to_own_records?: boolean | null
          role?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          name: string
          settings: Json | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          settings?: Json | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          settings?: Json | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      product_import_mappings: {
        Row: {
          entity: string
          id: string
          mapping: Json
          organization_id: string
          updated_at: string
        }
        Insert: {
          entity: string
          id?: string
          mapping: Json
          organization_id: string
          updated_at: string
        }
        Update: {
          entity?: string
          id?: string
          mapping?: Json
          organization_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_shipment_links: {
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          quantity: number
          shipment_id: string | null
          unit_price: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
          shipment_id?: string | null
          unit_price?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
          shipment_id?: string | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_shipment_links_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_shipment_links_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean | null
          category: string | null
          created_at: string | null
          currency: string | null
          description: string
          dimensions_cm: Json | null
          ean: string | null
          hs_code: string | null
          id: string
          metadata: Json | null
          organization_id: string | null
          origin_country: string | null
          other_description: string | null
          sku: string
          unit_price: number | null
          updated_at: string | null
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          active?: boolean | null
          category?: string | null
          created_at?: string | null
          currency?: string | null
          description: string
          dimensions_cm?: Json | null
          ean?: string | null
          hs_code?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          origin_country?: string | null
          other_description?: string | null
          sku: string
          unit_price?: number | null
          updated_at?: string | null
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          active?: boolean | null
          category?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string
          dimensions_cm?: Json | null
          ean?: string | null
          hs_code?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          origin_country?: string | null
          other_description?: string | null
          sku?: string
          unit_price?: number | null
          updated_at?: string | null
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          created_at: string | null
          details: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      shipment_documents: {
        Row: {
          created_at: string
          document_name: string
          document_type: string | null
          file_path: string
          file_size: number | null
          id: string
          organization_id: string
          shipment_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          document_name: string
          document_type?: string | null
          file_path: string
          file_size?: number | null
          id?: string
          organization_id: string
          shipment_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          document_name?: string
          document_type?: string | null
          file_path?: string
          file_size?: number | null
          id?: string
          organization_id?: string
          shipment_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipment_documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipment_documents_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      shipment_items: {
        Row: {
          cost_metadata: Json | null
          created_at: string | null
          customs_fees: number | null
          duty_amount: number | null
          duty_rate: number | null
          duty_unit_cost: number | null
          hs_code: string | null
          id: string
          name: string | null
          organization_id: string | null
          product_id: string | null
          quantity: number
          shipment_id: string | null
          sku: string | null
          total_cost: number | null
          total_price: number | null
          total_value: number | null
          total_volume_cbm: number | null
          total_weight_kg: number | null
          unit_cost: number | null
          unit_price: number | null
          unit_value: number | null
          volume_cbm: number | null
          weight_kg: number | null
        }
        Insert: {
          cost_metadata?: Json | null
          created_at?: string | null
          customs_fees?: number | null
          duty_amount?: number | null
          duty_rate?: number | null
          duty_unit_cost?: number | null
          hs_code?: string | null
          id?: string
          name?: string | null
          organization_id?: string | null
          product_id?: string | null
          quantity: number
          shipment_id?: string | null
          sku?: string | null
          total_cost?: number | null
          total_price?: number | null
          total_value?: number | null
          total_volume_cbm?: number | null
          total_weight_kg?: number | null
          unit_cost?: number | null
          unit_price?: number | null
          unit_value?: number | null
          volume_cbm?: number | null
          weight_kg?: number | null
        }
        Update: {
          cost_metadata?: Json | null
          created_at?: string | null
          customs_fees?: number | null
          duty_amount?: number | null
          duty_rate?: number | null
          duty_unit_cost?: number | null
          hs_code?: string | null
          id?: string
          name?: string | null
          organization_id?: string | null
          product_id?: string | null
          quantity?: number
          shipment_id?: string | null
          sku?: string | null
          total_cost?: number | null
          total_price?: number | null
          total_value?: number | null
          total_volume_cbm?: number | null
          total_weight_kg?: number | null
          unit_cost?: number | null
          unit_price?: number | null
          unit_value?: number | null
          volume_cbm?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "shipment_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipment_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipment_items_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          actual_delivery: string | null
          arrival_date: string | null
          ata: string | null
          auto_created: boolean | null
          bl_number: string | null
          booking: string | null
          booking_number: string | null
          carrier: string | null
          carrier_code: string | null
          carrier_id: string | null
          carrier_name: string | null
          carrier_service: string | null
          co2_emission: number | null
          commercial: Json | null
          commodity: string | null
          container_count: number | null
          container_number: string | null
          container_size: string | null
          container_type: string | null
          costs: Json | null
          created_at: string | null
          created_by: string | null
          created_from: string | null
          currency: string | null
          current_status: string | null
          data_source: string | null
          date_of_arrival: string | null
          date_of_departure: string | null
          date_of_discharge: string | null
          date_of_loading: string | null
          departure_date: string | null
          destination: string | null
          destination_country: string | null
          destination_port: string | null
          discarded_at: string | null
          documents: Json | null
          estimated_delivery: string | null
          eta: string | null
          etd: string | null
          freight_cost: number | null
          id: string
          import_source: string | null
          incoterm: string | null
          last_event_date: string | null
          last_event_description: string | null
          last_event_location: string | null
          last_tracking_update: string | null
          metadata: Json | null
          organization_id: string | null
          origin: string | null
          origin_country: string | null
          origin_port: string | null
          other_costs: number | null
          pieces: number | null
          products: Json | null
          reference: string | null
          reference_number: string | null
          route: Json | null
          schedule: Json | null
          shipment_number: string
          shipped_date: string | null
          source_tracking_id: string | null
          status: string | null
          supplier_country: string | null
          supplier_name: string | null
          total_cost: number | null
          total_value: number | null
          total_volume_cbm: number | null
          total_weight_kg: number | null
          tracking_id: string | null
          tracking_number: string | null
          tracking_type: string | null
          transit_time: number | null
          transport_company: string | null
          transport_mode: string | null
          transport_mode_id: string | null
          ts_count: number | null
          type: string | null
          updated_at: string | null
          user_id: string
          vehicle_type_id: string | null
          vessel_imo: string | null
          vessel_name: string | null
          volume: number | null
          voyage_number: string | null
          weight: number | null
        }
        Insert: {
          actual_delivery?: string | null
          arrival_date?: string | null
          ata?: string | null
          auto_created?: boolean | null
          bl_number?: string | null
          booking?: string | null
          booking_number?: string | null
          carrier?: string | null
          carrier_code?: string | null
          carrier_id?: string | null
          carrier_name?: string | null
          carrier_service?: string | null
          co2_emission?: number | null
          commercial?: Json | null
          commodity?: string | null
          container_count?: number | null
          container_number?: string | null
          container_size?: string | null
          container_type?: string | null
          costs?: Json | null
          created_at?: string | null
          created_by?: string | null
          created_from?: string | null
          currency?: string | null
          current_status?: string | null
          data_source?: string | null
          date_of_arrival?: string | null
          date_of_departure?: string | null
          date_of_discharge?: string | null
          date_of_loading?: string | null
          departure_date?: string | null
          destination?: string | null
          destination_country?: string | null
          destination_port?: string | null
          discarded_at?: string | null
          documents?: Json | null
          estimated_delivery?: string | null
          eta?: string | null
          etd?: string | null
          freight_cost?: number | null
          id?: string
          import_source?: string | null
          incoterm?: string | null
          last_event_date?: string | null
          last_event_description?: string | null
          last_event_location?: string | null
          last_tracking_update?: string | null
          metadata?: Json | null
          organization_id?: string | null
          origin?: string | null
          origin_country?: string | null
          origin_port?: string | null
          other_costs?: number | null
          pieces?: number | null
          products?: Json | null
          reference?: string | null
          reference_number?: string | null
          route?: Json | null
          schedule?: Json | null
          shipment_number: string
          shipped_date?: string | null
          source_tracking_id?: string | null
          status?: string | null
          supplier_country?: string | null
          supplier_name?: string | null
          total_cost?: number | null
          total_value?: number | null
          total_volume_cbm?: number | null
          total_weight_kg?: number | null
          tracking_id?: string | null
          tracking_number?: string | null
          tracking_type?: string | null
          transit_time?: number | null
          transport_company?: string | null
          transport_mode?: string | null
          transport_mode_id?: string | null
          ts_count?: number | null
          type?: string | null
          updated_at?: string | null
          user_id: string
          vehicle_type_id?: string | null
          vessel_imo?: string | null
          vessel_name?: string | null
          volume?: number | null
          voyage_number?: string | null
          weight?: number | null
        }
        Update: {
          actual_delivery?: string | null
          arrival_date?: string | null
          ata?: string | null
          auto_created?: boolean | null
          bl_number?: string | null
          booking?: string | null
          booking_number?: string | null
          carrier?: string | null
          carrier_code?: string | null
          carrier_id?: string | null
          carrier_name?: string | null
          carrier_service?: string | null
          co2_emission?: number | null
          commercial?: Json | null
          commodity?: string | null
          container_count?: number | null
          container_number?: string | null
          container_size?: string | null
          container_type?: string | null
          costs?: Json | null
          created_at?: string | null
          created_by?: string | null
          created_from?: string | null
          currency?: string | null
          current_status?: string | null
          data_source?: string | null
          date_of_arrival?: string | null
          date_of_departure?: string | null
          date_of_discharge?: string | null
          date_of_loading?: string | null
          departure_date?: string | null
          destination?: string | null
          destination_country?: string | null
          destination_port?: string | null
          discarded_at?: string | null
          documents?: Json | null
          estimated_delivery?: string | null
          eta?: string | null
          etd?: string | null
          freight_cost?: number | null
          id?: string
          import_source?: string | null
          incoterm?: string | null
          last_event_date?: string | null
          last_event_description?: string | null
          last_event_location?: string | null
          last_tracking_update?: string | null
          metadata?: Json | null
          organization_id?: string | null
          origin?: string | null
          origin_country?: string | null
          origin_port?: string | null
          other_costs?: number | null
          pieces?: number | null
          products?: Json | null
          reference?: string | null
          reference_number?: string | null
          route?: Json | null
          schedule?: Json | null
          shipment_number?: string
          shipped_date?: string | null
          source_tracking_id?: string | null
          status?: string | null
          supplier_country?: string | null
          supplier_name?: string | null
          total_cost?: number | null
          total_value?: number | null
          total_volume_cbm?: number | null
          total_weight_kg?: number | null
          tracking_id?: string | null
          tracking_number?: string | null
          tracking_type?: string | null
          transit_time?: number | null
          transport_company?: string | null
          transport_mode?: string | null
          transport_mode_id?: string | null
          ts_count?: number | null
          type?: string | null
          updated_at?: string | null
          user_id?: string
          vehicle_type_id?: string | null
          vessel_imo?: string | null
          vessel_name?: string | null
          volume?: number | null
          voyage_number?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "shipments_carrier_id_fkey"
            columns: ["carrier_id"]
            isOneToOne: false
            referencedRelation: "carriers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_source_tracking_id_fkey"
            columns: ["source_tracking_id"]
            isOneToOne: false
            referencedRelation: "trackings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_tracking_id_fkey"
            columns: ["tracking_id"]
            isOneToOne: false
            referencedRelation: "trackings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_transport_mode_id_fkey"
            columns: ["transport_mode_id"]
            isOneToOne: false
            referencedRelation: "transport_modes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_vehicle_type_id_fkey"
            columns: ["vehicle_type_id"]
            isOneToOne: false
            referencedRelation: "vehicle_types"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments_backup: {
        Row: {
          arrival_date: string | null
          auto_created: boolean | null
          carrier_code: string | null
          carrier_name: string | null
          carrier_service: string | null
          commercial: Json | null
          costs: Json | null
          created_at: string | null
          created_from: string | null
          currency: string | null
          departure_date: string | null
          documents: Json | null
          id: string | null
          incoterm: string | null
          last_tracking_update: string | null
          metadata: Json | null
          organization_id: string | null
          products: Json | null
          reference_number: string | null
          route: Json | null
          schedule: Json | null
          shipment_number: string | null
          source_tracking_id: string | null
          status: string | null
          supplier_country: string | null
          supplier_name: string | null
          total_value: number | null
          total_volume_cbm: number | null
          total_weight_kg: number | null
          tracking_id: string | null
          tracking_number: string | null
          transport_mode: string | null
          type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          arrival_date?: string | null
          auto_created?: boolean | null
          carrier_code?: string | null
          carrier_name?: string | null
          carrier_service?: string | null
          commercial?: Json | null
          costs?: Json | null
          created_at?: string | null
          created_from?: string | null
          currency?: string | null
          departure_date?: string | null
          documents?: Json | null
          id?: string | null
          incoterm?: string | null
          last_tracking_update?: string | null
          metadata?: Json | null
          organization_id?: string | null
          products?: Json | null
          reference_number?: string | null
          route?: Json | null
          schedule?: Json | null
          shipment_number?: string | null
          source_tracking_id?: string | null
          status?: string | null
          supplier_country?: string | null
          supplier_name?: string | null
          total_value?: number | null
          total_volume_cbm?: number | null
          total_weight_kg?: number | null
          tracking_id?: string | null
          tracking_number?: string | null
          transport_mode?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          arrival_date?: string | null
          auto_created?: boolean | null
          carrier_code?: string | null
          carrier_name?: string | null
          carrier_service?: string | null
          commercial?: Json | null
          costs?: Json | null
          created_at?: string | null
          created_from?: string | null
          currency?: string | null
          departure_date?: string | null
          documents?: Json | null
          id?: string | null
          incoterm?: string | null
          last_tracking_update?: string | null
          metadata?: Json | null
          organization_id?: string | null
          products?: Json | null
          reference_number?: string | null
          route?: Json | null
          schedule?: Json | null
          shipment_number?: string | null
          source_tracking_id?: string | null
          status?: string | null
          supplier_country?: string | null
          supplier_name?: string | null
          total_value?: number | null
          total_volume_cbm?: number | null
          total_weight_kg?: number | null
          tracking_id?: string | null
          tracking_number?: string | null
          transport_mode?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      super_admins: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      sync_errors: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          payload: Json | null
          source_id: string | null
          table_name: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          payload?: Json | null
          source_id?: string | null
          table_name: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          payload?: Json | null
          source_id?: string | null
          table_name?: string
        }
        Relationships: []
      }
      sync_logs: {
        Row: {
          id: number
          log_msg: string | null
          log_time: string | null
          new_record: Json | null
        }
        Insert: {
          id?: number
          log_msg?: string | null
          log_time?: string | null
          new_record?: Json | null
        }
        Update: {
          id?: number
          log_msg?: string | null
          log_time?: string | null
          new_record?: Json | null
        }
        Relationships: []
      }
      tracking_audit: {
        Row: {
          changed_at: string | null
          id: string | null
          tracking_id: string | null
          user_id: string | null
        }
        Insert: {
          changed_at?: string | null
          id?: string | null
          tracking_id?: string | null
          user_id?: string | null
        }
        Update: {
          changed_at?: string | null
          id?: string | null
          tracking_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      tracking_events: {
        Row: {
          created_at: string | null
          description: string | null
          details: string | null
          event_date: string
          event_type: string
          id: string
          location_code: string | null
          location_name: string | null
          raw_data: Json | null
          tracking_id: string | null
          vessel_name: string | null
          voyage_number: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          details?: string | null
          event_date: string
          event_type: string
          id?: string
          location_code?: string | null
          location_name?: string | null
          raw_data?: Json | null
          tracking_id?: string | null
          vessel_name?: string | null
          voyage_number?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          details?: string | null
          event_date?: string
          event_type?: string
          id?: string
          location_code?: string | null
          location_name?: string | null
          raw_data?: Json | null
          tracking_id?: string | null
          vessel_name?: string | null
          voyage_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tracking_events_tracking_id_fkey"
            columns: ["tracking_id"]
            isOneToOne: false
            referencedRelation: "trackings"
            referencedColumns: ["id"]
          },
        ]
      }
      trackings: {
        Row: {
          actual_delivery: string | null
          ata: string | null
          bl_number: string | null
          booking_number: string | null
          carrier: string | null
          carrier_code: string | null
          carrier_id: string | null
          carrier_name: string | null
          co2_emission: number | null
          container_count: number | null
          container_size: string | null
          container_type: string | null
          created_at: string | null
          created_by: string | null
          current_status: string | null
          date_of_departure: string | null
          date_of_discharge: string | null
          date_of_loading: string | null
          deleted_at: string | null
          destination: string | null
          destination_country: string | null
          destination_port: string | null
          estimated_delivery: string | null
          eta: string | null
          flight_number: string | null
          id: string
          last_auto_update: string | null
          last_event_date: string | null
          last_event_description: string | null
          last_event_location: string | null
          metadata: Json | null
          organization_id: string | null
          origin: string | null
          origin_country: string | null
          origin_port: string | null
          reference_number: string | null
          shipped_date: string | null
          status: string | null
          total_volume_cbm: number | null
          total_weight_kg: number | null
          tracking_number: string
          tracking_type: string
          transit_time: number | null
          transport_company: string | null
          transport_mode_id: string | null
          ts_count: number | null
          updated_at: string | null
          updated_by_robot: boolean | null
          user_id: string
          vehicle_type_id: string | null
          vessel_imo: string | null
          vessel_name: string | null
          voyage_number: string | null
        }
        Insert: {
          actual_delivery?: string | null
          ata?: string | null
          bl_number?: string | null
          booking_number?: string | null
          carrier?: string | null
          carrier_code?: string | null
          carrier_id?: string | null
          carrier_name?: string | null
          co2_emission?: number | null
          container_count?: number | null
          container_size?: string | null
          container_type?: string | null
          created_at?: string | null
          created_by?: string | null
          current_status?: string | null
          date_of_departure?: string | null
          date_of_discharge?: string | null
          date_of_loading?: string | null
          deleted_at?: string | null
          destination?: string | null
          destination_country?: string | null
          destination_port?: string | null
          estimated_delivery?: string | null
          eta?: string | null
          flight_number?: string | null
          id?: string
          last_auto_update?: string | null
          last_event_date?: string | null
          last_event_description?: string | null
          last_event_location?: string | null
          metadata?: Json | null
          organization_id?: string | null
          origin?: string | null
          origin_country?: string | null
          origin_port?: string | null
          reference_number?: string | null
          shipped_date?: string | null
          status?: string | null
          total_volume_cbm?: number | null
          total_weight_kg?: number | null
          tracking_number: string
          tracking_type?: string
          transit_time?: number | null
          transport_company?: string | null
          transport_mode_id?: string | null
          ts_count?: number | null
          updated_at?: string | null
          updated_by_robot?: boolean | null
          user_id: string
          vehicle_type_id?: string | null
          vessel_imo?: string | null
          vessel_name?: string | null
          voyage_number?: string | null
        }
        Update: {
          actual_delivery?: string | null
          ata?: string | null
          bl_number?: string | null
          booking_number?: string | null
          carrier?: string | null
          carrier_code?: string | null
          carrier_id?: string | null
          carrier_name?: string | null
          co2_emission?: number | null
          container_count?: number | null
          container_size?: string | null
          container_type?: string | null
          created_at?: string | null
          created_by?: string | null
          current_status?: string | null
          date_of_departure?: string | null
          date_of_discharge?: string | null
          date_of_loading?: string | null
          deleted_at?: string | null
          destination?: string | null
          destination_country?: string | null
          destination_port?: string | null
          estimated_delivery?: string | null
          eta?: string | null
          flight_number?: string | null
          id?: string
          last_auto_update?: string | null
          last_event_date?: string | null
          last_event_description?: string | null
          last_event_location?: string | null
          metadata?: Json | null
          organization_id?: string | null
          origin?: string | null
          origin_country?: string | null
          origin_port?: string | null
          reference_number?: string | null
          shipped_date?: string | null
          status?: string | null
          total_volume_cbm?: number | null
          total_weight_kg?: number | null
          tracking_number?: string
          tracking_type?: string
          transit_time?: number | null
          transport_company?: string | null
          transport_mode_id?: string | null
          ts_count?: number | null
          updated_at?: string | null
          updated_by_robot?: boolean | null
          user_id?: string
          vehicle_type_id?: string | null
          vessel_imo?: string | null
          vessel_name?: string | null
          voyage_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trackings_carrier_id_fkey"
            columns: ["carrier_id"]
            isOneToOne: false
            referencedRelation: "carriers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trackings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trackings_transport_mode_id_fkey"
            columns: ["transport_mode_id"]
            isOneToOne: false
            referencedRelation: "transport_modes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trackings_vehicle_type_id_fkey"
            columns: ["vehicle_type_id"]
            isOneToOne: false
            referencedRelation: "vehicle_types"
            referencedColumns: ["id"]
          },
        ]
      }
      transport_modes: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string | null
          id: string
          page: string
          preferences: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          page: string
          preferences?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          page?: string
          preferences?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          api_keys: Json | null
          created_at: string | null
          id: string
          preferences: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          api_keys?: Json | null
          created_at?: string | null
          id?: string
          preferences?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          api_keys?: Json | null
          created_at?: string | null
          id?: string
          preferences?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      vehicle_types: {
        Row: {
          created_at: string | null
          default_cbm: number | null
          default_kg: number | null
          id: string
          name: string
          transport_mode_id: string | null
        }
        Insert: {
          created_at?: string | null
          default_cbm?: number | null
          default_kg?: number | null
          id?: string
          name: string
          transport_mode_id?: string | null
        }
        Update: {
          created_at?: string | null
          default_cbm?: number | null
          default_kg?: number | null
          id?: string
          name?: string
          transport_mode_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_types_transport_mode_id_fkey"
            columns: ["transport_mode_id"]
            isOneToOne: false
            referencedRelation: "transport_modes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      dashboard_stats: {
        Row: {
          arrived: number | null
          delayed: number | null
          delivered: number | null
          exception: number | null
          in_transit: number | null
          registered: number | null
          total_trackings: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      auth_uid_test: {
        Args: Record<PropertyKey, never>
        Returns: {
          current_auth_uid: string
          session_valid: boolean
          user_exists: boolean
        }[]
      }
      create_shipment_from_tracking: {
        Args: { p_tracking_id: string }
        Returns: string
      }
      create_tracking_with_shipment: {
        Args: {
          p_carrier_code: string
          p_destination_country: string
          p_destination_port: string
          p_eta?: string
          p_origin_country: string
          p_origin_port: string
          p_tracking_number: string
        }
        Returns: {
          shipment_id: string
          tracking_id: string
        }[]
      }
      get_user_organizations: {
        Args: Record<PropertyKey, never>
        Returns: {
          auth_uid: string
          organization_id: string
          role: string
          user_id: string
        }[]
      }
      reattiva_tracking: {
        Args: {
          carrier: string
          nuova_descrizione: string
          nuovo_status: string
          tracking: string
          uid: string
        }
        Returns: undefined
      }
    }
    Enums: {
      document_type:
        | "commercial_invoice"
        | "packing_list"
        | "bill_of_lading"
        | "customs_clearance"
        | "transport_invoice"
        | "other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      document_type: [
        "commercial_invoice",
        "packing_list",
        "bill_of_lading",
        "customs_clearance",
        "transport_invoice",
        "other",
      ],
    },
  },
} as const
