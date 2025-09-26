import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/utils/supabase/client'
import { useShipsGO } from './useShipsGO'

const supabase = createClient()

export interface ShipmentProduct {
  id: string
  shipment_id: string | null  // ✅ Può essere null
  product_id?: string | null
  name: string
  sku?: string | null
  quantity: number
  unit_cost?: number | null
  total_cost?: number | null
  unit_weight?: number | null
  total_weight?: number | null
  unit_volume?: number | null
  total_volume?: number | null
  duty_rate?: number | null
  duty_amount?: number | null
  duty_unit_cost?: number | null
  customs_fees?: number | null
  cost_metadata?: any
  // ✅ Campi aggiuntivi che potrebbero arrivare dal DB
  created_at?: string | null
  updated_at?: string | null
  weight_kg?: number | null
  hs_code?: string | null
  organization_id?: string | null
  user_id?: string | null
  product?: {
    id: string
    name?: string | null
    sku?: string | null
    category?: string | null
    specifications?: any
    description?: string | null
    weight_kg?: number | null
    unit_weight?: number | null
    unit_volume?: number | null
    unit_cost?: number | null
    dimensions_cm?: any
    active?: boolean | null
    created_at?: string | null
    currency?: string | null
    ean?: string | null
    hs_code?: string | null
    organization_id?: string
    updated_at?: string | null
    user_id?: string
  } | null
}

export interface ShipmentDocument {
  id: string
  shipment_id: string | null  // ✅ Può essere null
  document_name: string
  document_type?: string | null
  file_path: string
  file_size?: number | null
  file_type?: string | null
  created_at: string
  user_id: string
  organization_id: string
  notes?: string | null
  updated_at?: string | null
}

export interface AdditionalCost {
  id: string
  shipment_id?: string | null
  cost_type: string
  amount: number
  currency: string
  notes?: string | null
  organization_id?: string | null
  created_at?: string | null
  updated_at?: string | null
  user_id?: string | null
}

export interface ShipmentDetails {
  id: string
  shipment_number?: string | null
  tracking_number?: string | null
  status?: string | null
  origin?: string | null
  destination?: string | null
  origin_port?: string | null
  destination_port?: string | null
  carrier_name?: string | null
  vessel_name?: string | null
  container_type?: string | null
  container_number?: string | null
  freight_cost?: number | null
  other_costs?: number | null
  total_weight?: number | null
  total_volume?: number | null
  eta?: string | null
  etd?: string | null
  created_at: string
  updated_at: string
  organization_id: string
  user_id: string
  actual_delivery?: string | null
  arrival_date?: string | null
  ata?: string | null
  auto_created?: boolean | null
  bl_number?: string | null
  booking?: string | null
  booking_number?: string | null
  discarded_at?: string | null
  // Relazioni
  products?: ShipmentProduct[]
  documents?: ShipmentDocument[]
  additional_costs?: AdditionalCost[]
  tracking?: any
  carrier?: any
}

export function useShipmentDetails(shipmentId: string) {
  const { user } = useAuth()
  const { trackSingle } = useShipsGO()
  const [shipment, setShipment] = useState<ShipmentDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editedData, setEditedData] = useState<Partial<ShipmentDetails>>({})
  const [autoUpdating, setAutoUpdating] = useState(false)

  // ✅ FUNZIONE SEPARATA PER CARICARE LE RELAZIONI
const loadRelatedData = useCallback(async (shipmentId: string) => {
  try {
    // ✅ CARICA PRODOTTI CON MAPPING CORRETTO
    const { data: rawProducts } = await supabase
      .from('shipment_items')
      .select('*')
      .eq('shipment_id', shipmentId)

    // ✅ MAPPA I CAMPI DAL DB AL FORMATO INTERNO
    const products: ShipmentProduct[] = (rawProducts || []).map((item: any) => ({
      id: item.id,
      shipment_id: item.shipment_id,
      product_id: item.product_id,
      name: item.name,
      sku: item.sku,
      quantity: item.quantity,
      unit_cost: item.unit_cost,
      total_cost: item.total_cost,
      unit_weight: item.weight_kg,
      total_weight: item.total_weight_kg,
      unit_volume: item.volume_cbm,
      total_volume: item.total_volume_cbm,
      duty_rate: item.duty_rate,
      duty_amount: item.duty_amount,
      customs_fees: item.customs_fees,
      hs_code: item.hs_code,
      cost_metadata: item.cost_metadata,
      created_at: item.created_at
    }))

    // Carica documenti
    const { data: documents } = await supabase
      .from('shipment_documents')
      .select('*')
      .eq('shipment_id', shipmentId)

    // Carica costi aggiuntivi
    const { data: costs } = await supabase
      .from('additional_costs')
      .select('*')
      .eq('shipment_id', shipmentId)

    // ✅ AGGIORNA LO STATO CON LE RELAZIONI MAPPATE
    setShipment(prev => prev ? {
      ...prev,
      products: products,
      documents: (documents as ShipmentDocument[]) || [],
      additional_costs: (costs as AdditionalCost[]) || []
    } : null)

  } catch (err) {
    console.error('Error loading related data:', err)
  }
}, [])

  // Auto-popolamento da ShipsGo
  const autoPopulateFromShipsGo = useCallback(async (shipmentData: ShipmentDetails) => {
    if (!shipmentData.tracking_number) return shipmentData

    try {
      setAutoUpdating(true)
      console.log('🚢 Auto-popolamento da ShipsGo per tracking:', shipmentData.tracking_number)

      const result = await trackSingle(shipmentData.tracking_number)

      if (result.found && result.data) {
        const shipsGoData = result.data
        console.log('📡 Dati ricevuti da ShipsGo:', shipsGoData)

        // Mappa i dati ShipsGo ai campi della spedizione
        const updatedData: Partial<ShipmentDetails> = {}

        if (shipsGoData.carrier_name && !shipmentData.carrier_name) {
          updatedData.carrier_name = shipsGoData.carrier_name
        }

        if (shipsGoData.status && !shipmentData.status) {
          updatedData.status = shipsGoData.status
        }

        if (shipsGoData.origin_port && !shipmentData.origin_port) {
          updatedData.origin_port = shipsGoData.origin_port
        }

        if (shipsGoData.destination_port && !shipmentData.destination_port) {
          updatedData.destination_port = shipsGoData.destination_port
        }

        if (shipsGoData.eta && !shipmentData.eta) {
          updatedData.eta = shipsGoData.eta
        }

        if (shipsGoData.vessel_name && !shipmentData.vessel_name) {
          updatedData.vessel_name = shipsGoData.vessel_name
        }

        if (shipsGoData.container_number && !shipmentData.container_number) {
          updatedData.container_number = shipsGoData.container_number
        }

        // Se ci sono dati da aggiornare, salvali nel database
        if (Object.keys(updatedData).length > 0) {
          console.log('💾 Aggiornamento automatico spedizione con dati ShipsGo:', updatedData)

          const { error } = await supabase
            .from('shipments')
            .update({
              ...updatedData,
              updated_at: new Date().toISOString()
            })
            .eq('id', shipmentData.id)

          if (error) {
            console.error('Errore aggiornamento automatico:', error)
          } else {
            // Restituisci i dati aggiornati
            return { ...shipmentData, ...updatedData }
          }
        }
      }

      return shipmentData

    } catch (err) {
      console.error('Errore auto-popolamento ShipsGo:', err)
      return shipmentData
    } finally {
      setAutoUpdating(false)
    }
  }, [trackSingle])

  // Load shipment data
  const loadShipment = useCallback(async () => {
    if (!shipmentId || !user?.id) return

    try {
      setLoading(true)
      setError(null)

      // Get user organizations
      const { data: userOrgs, error: orgError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)

      if (orgError) throw orgError

      const organizationIds = userOrgs.map((org: any) => org.organization_id)

      // ✅ QUERY SEMPLIFICATA - senza relazioni problematiche
      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .eq('id', shipmentId)
        .in('organization_id', organizationIds)
        .single()

      if (error) throw error

      // ✅ CAST SICURO TRAMITE unknown
      let shipmentData = data as unknown as ShipmentDetails

      // ✅ AUTO-POPOLAMENTO DA SHIPSGO
      shipmentData = await autoPopulateFromShipsGo(shipmentData)

      setShipment(shipmentData)

      // ✅ CARICA SEPARATAMENTE LE RELAZIONI
      await loadRelatedData(shipmentId)

    } catch (err: any) {
      console.error('Error loading shipment:', err)
      setError(err.message || 'Errore nel caricamento della spedizione')
    } finally {
      setLoading(false)
    }
  }, [shipmentId, user?.id, loadRelatedData, autoPopulateFromShipsGo])

  // Save changes
  const saveChanges = useCallback(async () => {
    if (!shipment || !user?.id) return

    try {
      setLoading(true)

      const updateData: Record<string, any> = {}
      
      // Map fields for update
      const fieldMapping = {
        status: 'status',
        freight_cost: 'freight_cost',
        other_costs: 'other_costs',
        carrier_name: 'carrier_name',
        vessel_name: 'vessel_name',
        container_type: 'container_type',
        container_number: 'container_number',
        eta: 'eta',
        etd: 'etd',
        tracking_number: 'tracking_number',
        shipment_number: 'shipment_number',
        origin: 'origin',
        destination: 'destination',
        origin_port: 'origin_port',
        destination_port: 'destination_port'
      }
      
      Object.entries(fieldMapping).forEach(([key, dbField]) => {
        if (editedData[key as keyof ShipmentDetails] !== undefined) {
          updateData[dbField] = editedData[key as keyof ShipmentDetails] || null
        }
      })
      
      updateData.updated_at = new Date().toISOString()

      const { error } = await supabase
        .from('shipments')
        .update(updateData)
        .eq('id', shipment.id)

      if (error) throw error

      await loadShipment()
      setEditMode(false)
      setEditedData({})

    } catch (err) {
      console.error('Error saving changes:', err)
      setError('Errore nel salvataggio')
    } finally {
      setLoading(false)
    }
  }, [shipment, editedData, loadShipment, user?.id])

  // Add product
const addProduct = useCallback(async (productData: Omit<ShipmentProduct, 'id' | 'shipment_id'>) => {
  if (!shipment?.id) return

  try {
    // ✅ MAPPING CORRETTO DEI CAMPI PER IL DATABASE
    const dbData = {
      shipment_id: shipment.id,
      organization_id: shipment.organization_id,
      product_id: productData.product_id || null,
      name: productData.name,
      sku: productData.sku || null,
      quantity: productData.quantity || 1,
      // ✅ CAMPI CORRETTI PER IL DB:
      unit_cost: productData.unit_cost || 0,           // ✅ unit_cost esiste nel DB
      total_cost: productData.total_cost || 0,         // ✅ total_cost esiste nel DB  
      weight_kg: productData.unit_weight || 0,         // ✅ weight_kg nel DB
      volume_cbm: productData.unit_volume || 0,        // ✅ volume_cbm nel DB
      total_weight_kg: productData.total_weight || 0,  // ✅ total_weight_kg nel DB
      total_volume_cbm: productData.total_volume || 0, // ✅ total_volume_cbm nel DB
      duty_rate: productData.duty_rate || 0,           // ✅ duty_rate esiste nel DB
      duty_amount: productData.duty_amount || 0,       // ✅ duty_amount esiste nel DB
      customs_fees: productData.customs_fees || 0,     // ✅ customs_fees esiste nel DB
      hs_code: productData.hs_code || null,            // ✅ hs_code esiste nel DB
      cost_metadata: productData.cost_metadata || {}   // ✅ cost_metadata esiste nel DB
    }

    const { data, error } = await supabase
      .from('shipment_items')
      .insert(dbData)
      .select()
      .single()

    if (error) throw error

    await loadShipment()
    return data

  } catch (err) {
    console.error('Error adding product:', err)
    throw err
  }
}, [shipment?.id, shipment?.organization_id, user?.id, loadShipment])

  // Update product
const updateProduct = useCallback(async (productId: string, updates: Partial<ShipmentProduct>) => {
  try {
    // ✅ MAPPING CORRETTO PER L'UPDATE
    const { id, shipment_id, created_at, ...rawUpdates } = updates as any
    
    const dbUpdates: any = {}
    
    // ✅ MAPPA I CAMPI CORRETTAMENTE
    if (rawUpdates.name !== undefined) dbUpdates.name = rawUpdates.name
    if (rawUpdates.sku !== undefined) dbUpdates.sku = rawUpdates.sku
    if (rawUpdates.quantity !== undefined) dbUpdates.quantity = rawUpdates.quantity
    if (rawUpdates.unit_cost !== undefined) dbUpdates.unit_cost = rawUpdates.unit_cost
    if (rawUpdates.total_cost !== undefined) dbUpdates.total_cost = rawUpdates.total_cost
    if (rawUpdates.unit_weight !== undefined) dbUpdates.weight_kg = rawUpdates.unit_weight
    if (rawUpdates.total_weight !== undefined) dbUpdates.total_weight_kg = rawUpdates.total_weight
    if (rawUpdates.unit_volume !== undefined) dbUpdates.volume_cbm = rawUpdates.unit_volume
    if (rawUpdates.total_volume !== undefined) dbUpdates.total_volume_cbm = rawUpdates.total_volume
    if (rawUpdates.duty_rate !== undefined) dbUpdates.duty_rate = rawUpdates.duty_rate
    if (rawUpdates.duty_amount !== undefined) dbUpdates.duty_amount = rawUpdates.duty_amount
    if (rawUpdates.customs_fees !== undefined) dbUpdates.customs_fees = rawUpdates.customs_fees
    if (rawUpdates.product_id !== undefined) dbUpdates.product_id = rawUpdates.product_id
    if (rawUpdates.hs_code !== undefined) dbUpdates.hs_code = rawUpdates.hs_code

    const { error } = await supabase
      .from('shipment_items')
      .update(dbUpdates)
      .eq('id', productId)

    if (error) throw error

    await loadShipment()

  } catch (err) {
    console.error('Error updating product:', err)
    throw err
  }
}, [loadShipment])

  // Delete product
  const deleteProduct = useCallback(async (productId: string) => {
    try {
      const { error } = await supabase
        .from('shipment_items')
        .delete()
        .eq('id', productId)

      if (error) throw error

      await loadShipment()

    } catch (err) {
      console.error('Error deleting product:', err)
      throw err
    }
  }, [loadShipment])

  // Upload document
  const uploadDocument = useCallback(async (file: File, documentType: string, notes?: string) => {
    if (!shipment?.id || !user?.id) return

    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${shipment.id}/${Date.now()}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('shipment-documents')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Create document record
      const { data, error } = await supabase
        .from('shipment_documents')
        .insert({
          shipment_id: shipment.id,
          document_name: file.name,
          document_type: documentType,
          file_path: uploadData.path,
          file_size: file.size,
          user_id: user.id,
          organization_id: shipment.organization_id,
          notes: notes || null
        })
        .select()
        .single()

      if (error) throw error

      await loadShipment()
      return data

    } catch (err) {
      console.error('Error uploading document:', err)
      throw err
    }
  }, [shipment?.id, shipment?.organization_id, loadShipment, user?.id])

  // Delete document
  const deleteDocument = useCallback(async (documentId: string) => {
    try {
      // Get document info first
      const { data: doc, error: docError } = await supabase
        .from('shipment_documents')
        .select('file_path')
        .eq('id', documentId)
        .single()

      if (docError) throw docError

      // Delete from storage
      if (doc?.file_path) {
        const { error: storageError } = await supabase.storage
          .from('shipment-documents')
          .remove([doc.file_path])
        
        if (storageError) {
          console.warn('Could not delete file from storage:', storageError)
        }
      }

      // Delete record
      const { error } = await supabase
        .from('shipment_documents')
        .delete()
        .eq('id', documentId)

      if (error) throw error

      await loadShipment()

    } catch (err) {
      console.error('Error deleting document:', err)
      throw err
    }
  }, [loadShipment])

  // Add additional cost
  const addAdditionalCost = useCallback(async (costData: Omit<AdditionalCost, 'id' | 'created_at' | 'updated_at'>) => {
    if (!shipment?.id) return

    try {
      const { data, error } = await supabase
        .from('additional_costs')
        .insert({
          shipment_id: shipment.id,
          organization_id: shipment.organization_id,
          user_id: user?.id,
          ...costData
        })
        .select()
        .single()

      if (error) throw error

      await loadShipment()
      return data

    } catch (err) {
      console.error('Error adding additional cost:', err)
      throw err
    }
  }, [shipment?.id, shipment?.organization_id, user?.id, loadShipment])

  // Delete additional cost
  const deleteAdditionalCost = useCallback(async (costId: string) => {
    try {
      const { error } = await supabase
        .from('additional_costs')
        .delete()
        .eq('id', costId)

      if (error) throw error

      await loadShipment()

    } catch (err) {
      console.error('Error deleting additional cost:', err)
      throw err
    }
  }, [loadShipment])

  // Funzione per recupero manuale dati ShipsGo
  const refreshShipsGoData = useCallback(async () => {
    if (!shipment?.tracking_number) return

    try {
      setAutoUpdating(true)
      const updatedData = await autoPopulateFromShipsGo(shipment)
      setShipment(updatedData)
    } catch (err) {
      console.error('Errore refresh ShipsGo:', err)
      setError('Errore nel recupero dati ShipsGo')
    }
  }, [shipment, autoPopulateFromShipsGo])

  useEffect(() => {
    if (user?.id && shipmentId) {
      loadShipment()
    }
  }, [user?.id, shipmentId, loadShipment])

  return {
    shipment,
    loading,
    error,
    editMode,
    editedData,
    autoUpdating,
    setEditMode,
    setEditedData,
    loadShipment,
    saveChanges,
    addProduct,
    updateProduct,
    deleteProduct,
    uploadDocument,
    deleteDocument,
    addAdditionalCost,
    deleteAdditionalCost,
    refreshShipsGoData
  }
}