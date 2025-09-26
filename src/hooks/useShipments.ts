'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

// ✅ TIPI corretti per organizzazione
interface ShipmentItem {
  id: string
  shipment_id: string
  product_id?: string | null
  name?: string | null
  quantity: number
  unit_price?: number | null
  currency?: string | null
  weight_kg?: number | null
  hs_code?: string | null
  origin_country?: string | null
  created_at: string
  updated_at: string
  products?: {
    id: string
    name?: string | null
    sku?: string | null
    unit_price?: number | null
    currency?: string | null
  } | null
}

interface Shipment {
  id: string
  organization_id: string | null
  user_id: string | null
  recipient_name?: string | null
  recipient_email?: string | null
  recipient_phone?: string | null
  origin_address?: string | null
  destination_address?: string | null
  tracking_number?: string | null
  carrier?: string | null
  service_type?: string | null
  status: string | null
  weight_kg?: number | null
  dimensions_cm?: any | null
  declared_value?: number | null
  currency?: string | null
  insurance_value?: number | null
  delivery_instructions?: string | null
  pickup_date?: string | null
  estimated_delivery?: string | null
  actual_delivery?: string | null
  notes?: string | null
  metadata?: any | null
  created_at: string
  updated_at: string
  shipment_number?: string | null
  shipment_items?: ShipmentItem[] | null
}

interface ShipmentsApiResponse {
  success: boolean
  data?: Shipment[] | null
  error?: string
  message?: string
  pagination?: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

interface SingleShipmentApiResponse {
  success: boolean
  data?: Shipment | null
  error?: string
  message?: string
}

interface CreateShipment {
  recipient_name?: string | null
  recipient_email?: string | null
  recipient_phone?: string | null
  origin_address?: string | null
  destination_address?: string | null
  tracking_number?: string | null
  carrier?: string | null
  service_type?: string | null
  status?: string | null
  weight_kg?: number | null
  dimensions_cm?: any | null
  declared_value?: number | null
  currency?: string | null
  insurance_value?: number | null
  delivery_instructions?: string | null
  pickup_date?: string | null
  estimated_delivery?: string | null
  actual_delivery?: string | null
  notes?: string | null
  metadata?: any | null
  items?: Array<{
    product_id?: string | null
    name?: string | null
    quantity: number
    unit_price?: number | null
    currency?: string | null
    weight_kg?: number | null
    hs_code?: string | null
    origin_country?: string | null
  }>
}

export function useShipments() {
  const { user } = useAuth()
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

    const fetchShipments = async () => {
    try {
      setLoading(true)
      setError(null)
  
      // ✅ DEBUG MIGLIORATO
      console.log('🔍 AUTH STATE DEBUG:', {
        user: !!user,
        userId: user?.id,
        email: user?.email,
        isAuthenticated: !!user?.id
      })
  
      // ✅ SE NON C'È UTENTE AUTENTICATO, ESCI
      if (!user?.id) {
        console.warn('⚠️ No authenticated user, clearing shipments')
        setShipments([])
        setError('Utente non autenticato. Effettua il login.')
        return
      }
  
      // ✅ TEST CONNESSIONE SUPABASE PRIMA
      console.log('🧪 Testing Supabase connection...')
      const { data: testConnection, error: connectionError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .limit(1)
  
      console.log('🔗 Connection test result:', { 
        success: !connectionError,
        error: connectionError,
        orgFound: !!testConnection?.length 
      })
  
      if (connectionError) {
        console.error('❌ Supabase connection failed:', connectionError)
        throw new Error(`Errore di connessione: ${connectionError.message}`)
      }
  
      if (!testConnection || testConnection.length === 0) {
        console.warn('⚠️ User not in any organization')
        setShipments([])
        setError('Utente non associato a nessuna organizzazione.')
        return
      }
  
      // ✅ PROVA PRIMA LA TUA API ESISTENTE
      try {
        console.log('🌐 Trying API endpoint first...')
        const response = await fetch('/api/shipments', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include' // ✅ IMPORTANTE per i cookies di sessione
        })
  
        console.log('📡 API Response status:', response.status)
  
        if (response.ok) {
          const result: ShipmentsApiResponse = await response.json()
          console.log('📦 API Response:', { 
            success: result.success, 
            dataLength: result.data?.length,
            error: result.error 
          })
  
          if (result.success && result.data && Array.isArray(result.data)) {
            console.log(`✅ Fetched ${result.data.length} shipments from API`)
            setShipments(result.data)
            return
          }
        }
      } catch (apiError) {
        console.warn('⚠️ API shipments failed, trying Supabase fallback:', apiError)
      }
  
      // ✅ FALLBACK A SUPABASE DIRETTO
      console.log('🔄 Trying Supabase direct fallback...')
      
      const { data: supabaseData, error: supabaseError } = await supabase
        .from('shipments')
        .select(`
          *,
          shipment_items (
            id,
            shipment_id,
            product_id,
            name,
            sku,
            quantity,
            unit_price,
            total_price,
            weight_kg,
            volume_cbm,
            hs_code,
            created_at
          )
        `)
        .order('created_at', { ascending: false })
  
      console.log('📊 Supabase query result:', {
        success: !supabaseError,
        error: supabaseError,
        dataLength: supabaseData?.length
      })
  
      if (supabaseError) {
        console.error('❌ Supabase error details:', supabaseError)
        throw new Error(`Database error: ${supabaseError.message}`)
      }
  
      console.log(`✅ Fetched ${supabaseData?.length || 0} shipments from Supabase`)
      setShipments((supabaseData || []) as unknown as Shipment[])
  
    } catch (err) {
      console.error('❌ Error fetching shipments:', err)
      const errorMessage = err instanceof Error ? err.message : 'Errore nel caricamento delle spedizioni'
      setError(errorMessage)
      setShipments([])
    } finally {
      setLoading(false)
    }
  }

  const createShipment = async (shipmentData: CreateShipment): Promise<Shipment> => {
    try {
      console.log('📦 Creating shipment...', { 
        recipient: shipmentData.recipient_name, 
        itemsCount: shipmentData.items?.length || 0 
      })

      const response = await fetch('/api/shipments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shipmentData),
      })

      const result: SingleShipmentApiResponse = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create shipment')
      }

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create shipment - no data returned')
      }

      console.log('✅ Shipment created:', result.data.id)
      await fetchShipments()
      return result.data

    } catch (err) {
      console.error('❌ Error creating shipment:', err)
      throw err
    }
  }

  const updateShipment = async (id: string, shipmentData: Partial<CreateShipment>): Promise<Shipment> => {
    try {
      console.log('🔄 Updating shipment:', id)

      const response = await fetch(`/api/shipments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shipmentData),
      })

      const result: SingleShipmentApiResponse = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update shipment')
      }

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to update shipment - no data returned')
      }

      console.log('✅ Shipment updated:', result.data.id)
      await fetchShipments()
      return result.data

    } catch (err) {
      console.error('❌ Error updating shipment:', err)
      throw err
    }
  }

  const deleteShipment = async (id: string): Promise<void> => {
    try {
      console.log('🗑️ Deleting shipment:', id)

      const response = await fetch(`/api/shipments/${id}`, {
        method: 'DELETE',
      })

      const result: { success: boolean; error?: string; message?: string } = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete shipment')
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete shipment')
      }

      console.log('✅ Shipment deleted successfully')
      await fetchShipments()

    } catch (err) {
      console.error('❌ Error deleting shipment:', err)
      throw err
    }
  }

  const getShipmentById = async (id: string): Promise<Shipment | null> => {
    try {
      console.log('🔍 Fetching shipment by ID:', id)

      const response = await fetch(`/api/shipments/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result: SingleShipmentApiResponse = await response.json()

      if (!response.ok) {
        if (response.status === 404) {
          console.warn('⚠️ Shipment not found:', id)
          return null
        }
        throw new Error(result.error || 'Failed to fetch shipment')
      }

      if (!result.success || !result.data) {
        console.warn('⚠️ No shipment data returned for ID:', id)
        return null
      }

      console.log('✅ Shipment fetched by ID:', result.data.id)
      return result.data

    } catch (err) {
      console.error('❌ Error fetching shipment by ID:', err)
      throw err
    }
  }

  const refetch = fetchShipments

  useEffect(() => {
    fetchShipments()
  }, [user])

  return {
    shipments,
    loading,
    error,
    fetchShipments,
    createShipment,
    updateShipment,
    deleteShipment,
    getShipmentById,
    refetch: fetchShipments
  }
}

export type { Shipment, ShipmentItem, CreateShipment }