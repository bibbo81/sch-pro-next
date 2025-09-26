'use client'

import './shipment-details.css'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft, Plus, Edit, Trash2, Package, Ship, Truck, Plane, AlertTriangle,
  Calendar, MapPin, User, Building, Phone, Mail, FileText, Calculator, Info,
  Download, Upload, Eye, DollarSign, X, Save, Loader2, RefreshCw
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useShipsGO } from '@/hooks/useShipsGO'
import ProductModal from '@/components/shipments/ProductModal'
import {
  calculateContainerUsage,
  CONTAINER_SPECS,
  TRANSPORT_MODES
} from '@/utils/transportCalculations'
import {
  calculateTransportCosts,
  updateProductsWithTransportCosts,
  detectTransportMode
} from '@/lib/costAllocation'

const supabase = createClient()

// Design system constants from the old project
const CONTAINER_CBM_CAPACITY = {
  "20'": 33.2,
  "40'": 67.7,
  "40'HC": 76.4,
  "45'HC": 86.0,
}

// Status colors matching the old project with dark mode support
const STATUS_COLORS = {
  pending: 'bg-gray-500 text-white dark:bg-gray-600',
  registered: 'bg-gray-500 text-white dark:bg-gray-600',
  in_transit: 'bg-cyan-50 dark:bg-cyan-9500 text-white dark:bg-cyan-600',
  delivered: 'bg-green-50 dark:bg-green-9500 text-white dark:bg-green-600',
  exception: 'bg-red-500 text-white dark:bg-red-600',
  delayed: 'bg-red-500 text-white dark:bg-red-600',
  arrived: 'bg-blue-50 dark:bg-blue-9500 text-white dark:bg-blue-600',
  out_for_delivery: 'bg-orange-50 dark:bg-orange-9500 text-white dark:bg-orange-600',
  customs_hold: 'bg-yellow-50 dark:bg-yellow-9500 text-black dark:bg-yellow-600 dark:text-white',
  customs_cleared: 'bg-green-50 dark:bg-green-9500 text-white dark:bg-green-600'
}

// Utility functions matching the old project
const formatCurrencyIT = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return '€ 0,00'
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR'
  }).format(parseFloat(String(value)))
}

const formatNumberIT = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return '0'
  return new Intl.NumberFormat('it-IT', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(parseFloat(String(value)))
}

const formatPercentageIT = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return '0,0%'
  return new Intl.NumberFormat('it-IT', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(parseFloat(String(value)) / 100)
}

const formatStatus = (status: string): string => {
  const statusLabels: { [key: string]: string } = {
    pending: 'In attesa',
    registered: 'Registrato',
    in_transit: 'In transito',
    delivered: 'Consegnato',
    exception: 'Eccezione',
    delayed: 'Ritardato',
    arrived: 'Arrivato',
    out_for_delivery: 'In consegna',
    customs_hold: 'Fermo dogana',
    customs_cleared: 'Sdoganato'
  }
  return statusLabels[status] || status
}

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-'
  try {
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateString
  }
}

interface ShipmentProduct {
  id: string
  name?: string | null
  sku?: string | null
  category?: string | null
  hs_code?: string | null
  origin_country?: string | null
  ean?: string | null
  other_description?: string | null
  quantity: number
  unit_cost?: number | null
  total_cost?: number | null
  unit_price?: number | null
  total_price?: number | null
  unit_value?: number | null
  total_value?: number | null
  weight_kg?: number | null
  total_weight_kg?: number | null
  volume_cbm?: number | null
  total_volume_cbm?: number | null
  duty_rate?: number | null
  duty_amount?: number | null
  duty_unit_cost?: number | null
  customs_fees?: number | null
  transport_unit_cost?: number | null
  transport_total_cost?: number | null
  product_id?: string | null
  shipment_id?: string | null
  organization_id?: string | null
  created_at?: string | null
  cost_metadata?: any
  [key: string]: any
}

interface AdditionalCost {
  id: string
  cost_type: string
  amount: number
  currency: string
  notes?: string
  created_at: string
}

interface ShipmentDocument {
  id: string
  document_name: string
  file_path: string
  file_size: number
  document_type: string
  uploaded_at: string
}

interface Shipment {
  id: string
  reference_number?: string
  shipment_number?: string
  status: string
  transport_mode: string
  container_type?: string
  container_size?: string
  container_count?: number
  freight_cost?: number
  total_cost?: number
  departure_date?: string
  arrival_date?: string
  etd?: string
  eta?: string
  estimated_delivery?: string
  actual_delivery?: string
  origin?: string
  origin_country?: string
  origin_port?: string
  destination?: string
  destination_country?: string
  destination_port?: string
  supplier_name?: string
  supplier_country?: string
  carrier?: string
  carrier_name?: string
  carrier_code?: string
  tracking_number?: string
  bl_number?: string
  booking_number?: string
  vessel_name?: string
  vessel_imo?: string
  voyage_number?: string
  total_weight_kg?: number
  total_volume_cbm?: number
  total_value?: number
  currency?: string
  incoterm?: string
  products?: ShipmentProduct[]
  additional_costs?: AdditionalCost[]
  documents?: ShipmentDocument[]
  organization_id?: string
  user_id?: string
  created_at: string
  updated_at?: string
  [key: string]: any
}

export default function ShipmentDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { trackSingle } = useShipsGO()
  const [shipment, setShipment] = useState<Shipment | null>(null)
  const [loading, setLoading] = useState(true)
  const [showProductModal, setShowProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ShipmentProduct | null>(null)
  const [uploadingDocument, setUploadingDocument] = useState(false)
  const [autoUpdating, setAutoUpdating] = useState(false)
  const [statusEditing, setStatusEditing] = useState(false)
  const [editStatus, setEditStatus] = useState('')
  const [showAddCostDialog, setShowAddCostDialog] = useState(false)
  const [newCostDescription, setNewCostDescription] = useState('')
  const [newCostAmount, setNewCostAmount] = useState('')
  const [newCostCategory, setNewCostCategory] = useState('')
  
  // 🆕 Stati per i modals
  const [showCostModal, setShowCostModal] = useState(false)
  const [costForm, setCostForm] = useState({
    cost_type: '',
    amount: '',
    currency: 'EUR',
    notes: ''
  })
  const [savingCost, setSavingCost] = useState(false)

  const shipmentId = params.id as string

  // Track the last processed tracking number to prevent duplicate auto-populate calls
  const lastProcessedTrackingNumber = useRef<string | null>(null)

  // Auto-populate from ShipsGo function
  const autoPopulateFromShipsGo = useCallback(async (currentShipment?: Shipment | null) => {
    const targetShipment = currentShipment || shipment
    if (!targetShipment?.tracking_number) return

    try {
      setAutoUpdating(true)
      console.log('🚢 Auto-popolamento da ShipsGo per tracking:', targetShipment.tracking_number)

      const result = await trackSingle(targetShipment.tracking_number)

      if (result.found && result.data) {
        const shipsGoData = result.data
        console.log('📡 Dati ricevuti da ShipsGo:', shipsGoData)

        // Map ShipsGo data to shipment fields
        const updatedData: Partial<Shipment> = {}

        if (shipsGoData.carrier_name && !targetShipment.carrier_name) {
          updatedData.carrier_name = shipsGoData.carrier_name
        }
        if (shipsGoData.status && !targetShipment.status) {
          updatedData.status = shipsGoData.status
        }
        if (shipsGoData.origin_port && !targetShipment.origin_port) {
          updatedData.origin_port = shipsGoData.origin_port
        }
        if (shipsGoData.destination_port && !targetShipment.destination_port) {
          updatedData.destination_port = shipsGoData.destination_port
        }
        if (shipsGoData.eta && !targetShipment.eta) {
          updatedData.eta = shipsGoData.eta
        }
        if (shipsGoData.vessel_name && !targetShipment.vessel_name) {
          updatedData.vessel_name = shipsGoData.vessel_name
        }
        if (shipsGoData.container_number && !targetShipment.container_number) {
          updatedData.container_number = shipsGoData.container_number
        }

        // If there's data to update, save it to database
        if (Object.keys(updatedData).length > 0) {
          console.log('💾 Aggiornamento automatico spedizione con dati ShipsGo:', updatedData)

          // Exclude relation properties that are not database columns
          const { documents, shipment_items, costs, ...dbData } = updatedData

          const { error } = await supabase
            .from('shipments')
            .update({
              ...dbData,
              updated_at: new Date().toISOString()
            })
            .eq('id', targetShipment.id)

          if (error) {
            console.error('Errore aggiornamento automatico:', error)
          } else {
            // Update local shipment state
            setShipment(prev => prev ? { ...prev, ...updatedData } : null)
          }
        }
      }
    } catch (err) {
      console.error('Errore auto-popolamento ShipsGo:', err)
    } finally {
      setAutoUpdating(false)
    }
  }, [trackSingle])

  // 🆕 FUNZIONE DI AGGIORNAMENTO COMPLETO: FETCH + RICALCOLO COSTI
  const fetchAndRecalculateCosts = async () => {
    try {
      // Prima ricarica i dati dal database
      await fetchShipment()

      // Poi ottieni i dati freschi dal database per il calcolo
      const { data: freshShipmentData } = await supabase
        .from('shipments')
        .select(`
          *,
          tracking:tracking_id (
            *,
            transport_modes:transport_mode_id (id, name),
            vehicle_types:vehicle_type_id (id, name)
          )
        `)
        .eq('id', shipmentId)
        .single()

      const { data: freshProducts } = await supabase
        .from('shipment_items')
        .select('*')
        .eq('shipment_id', shipmentId)

      const { data: freshAdditionalCosts } = await supabase
        .from('additional_costs')
        .select('*')
        .eq('shipment_id', shipmentId)

      if (!freshShipmentData || !freshProducts || freshProducts.length === 0) return

      const freshShipment = {
        ...freshShipmentData,
        products: freshProducts,
        additional_costs: freshAdditionalCosts || []
      }

      // Ora esegui il calcolo con i dati freschi
      await autoAllocateTransportCostsWithData(freshShipment)

      // Infine ricarica una seconda volta per mostrare i risultati
      await fetchShipment()
    } catch (error) {
      console.error('Error in fetchAndRecalculateCosts:', error)
    }
  }

  // 🆕 FUNZIONE DI ALLOCAZIONE COSTI CON DATI SPECIFICI
  const autoAllocateTransportCostsWithData = async (shipmentData: any) => {
    if (!shipmentData?.products || shipmentData.products.length === 0) return

    try {
      // 💰 CALCOLA TUTTI I COSTI: Trasporto + Costi Extra
      const freightCost = shipmentData.freight_cost || 0
      const otherCosts = shipmentData.other_costs || 0
      const additionalCosts = shipmentData.additional_costs?.reduce((sum: number, cost: any) => sum + (cost.amount || 0), 0) || 0

      const totalTransportCosts = freightCost + otherCosts + additionalCosts

      console.log('💰 Total transport costs calculation:', {
        freightCost,
        otherCosts,
        additionalCosts,
        totalTransportCosts
      })

      if (totalTransportCosts === 0) {
        console.log('💰 No transport costs to allocate')
        return
      }

      // Crea un oggetto shipment temporaneo con i costi totali per il calcolo
      const shipmentForCalculation = {
        ...shipmentData,
        freight_cost: totalTransportCosts,
        other_costs: 0
      }

      // Calcola l'allocazione dei costi
      const allocation = calculateTransportCosts(shipmentForCalculation, shipmentData.products)

      console.log('💰 Allocating transport costs:', allocation)

      // ✅ SALVA I COSTI CALCOLATI NEL DATABASE
      for (const product of shipmentData.products) {
        const allocatedCost = allocation.allocatedCosts[product.id] || 0
        const transportUnitCost = allocation.unitCost


        // Aggiorna il prodotto nel database con i costi di trasporto usando cost_metadata
        const currentCostMetadata = product.cost_metadata || {}

        const { error: updateError } = await supabase
          .from('shipment_items')
          .update({
            cost_metadata: {
              ...currentCostMetadata,
              transport_unit_cost: transportUnitCost,
              transport_total_cost: allocatedCost
            }
          })
          .eq('id', product.id)

        if (updateError) {
          console.error(`❌ Errore salvataggio costi per prodotto ${product.id}:`, updateError)
        }
      }

      // Ricarica i dati della spedizione per mostrare i nuovi costi
      await fetchShipment()

    } catch (error) {
      console.error('Error allocating transport costs:', error)
    }
  }

  // Funzione originale per useEffect
  const autoAllocateTransportCosts = async () => {
    if (!shipment?.products || shipment.products.length === 0) return
    await autoAllocateTransportCostsWithData(shipment)
  }

  // Collegamento automatico tracking
  const linkTrackingToShipment = async () => {
    if (!shipment?.tracking_number) {
      alert('Nessun numero di tracking trovato nella spedizione')
      return
    }

    try {
      // Cerca il tracking nel database
      const { data: trackingData, error: trackingError } = await supabase
        .from('trackings')
        .select('*')
        .eq('tracking_number', shipment.tracking_number)
        .maybeSingle()

      if (trackingError) {
        console.error('❌ Error searching tracking:', trackingError)
        alert('Errore nella ricerca del tracking')
        return
      }

      if (!trackingData) {
        alert(`Tracking ${shipment.tracking_number} non trovato nel database. Crealo prima dalla sezione Tracking.`)
        return
      }

      // Collega il tracking alla spedizione
      const { error: updateError } = await supabase
        .from('shipments')
        .update({ tracking_id: trackingData.id })
        .eq('id', shipment.id)

      if (updateError) {
        console.error('❌ Error linking tracking:', updateError)
        alert('Errore nel collegamento del tracking')
        return
      }

      alert(`Tracking ${shipment.tracking_number} collegato con successo!`)
      await fetchShipment()
    } catch (error) {
      console.error('❌ Error in tracking link:', error)
      alert('Errore nel collegamento: ' + (error instanceof Error ? error.message : 'Errore sconosciuto'))
    }
  }

  // Calcolo automatico peso da dati tracking
  const autoCalculateWeightFromTracking = async () => {
    if (!shipment?.tracking?.total_weight_kg || !shipment.products || shipment.products.length === 0) {
      alert('Dati di tracking non disponibili o nessun prodotto trovato')
      return
    }

    try {
      const trackingWeight = shipment.tracking.total_weight_kg
      const totalProductVolume = shipment.products.reduce((sum, p) => sum + (p.total_volume_cbm || 0), 0)

      if (totalProductVolume === 0) {
        alert('Nessun volume disponibile nei prodotti per calcolare la distribuzione del peso')
        return
      }

      // Calcola il peso per CBM in base ai dati di tracking
      const weightPerCbm = trackingWeight / totalProductVolume

      for (const product of shipment.products) {
        if (!product.total_weight_kg && product.total_volume_cbm) {
          const calculatedWeight = product.total_volume_cbm * weightPerCbm
          const weightPerUnit = product.quantity > 0 ? calculatedWeight / product.quantity : 0

          await supabase
            .from('shipment_items')
            .update({
              total_weight_kg: calculatedWeight,
              weight_kg: weightPerUnit,
              updated_at: new Date().toISOString()
            })
            .eq('id', product.id)
        }
      }

      alert(`Peso calcolato automaticamente dai dati di tracking (${trackingWeight} kg totali)`)
      await fetchShipment()
    } catch (error) {
      console.error('❌ Error in weight calculation:', error)
      alert('Errore nel calcolo del peso: ' + (error instanceof Error ? error.message : 'Errore sconosciuto'))
    }
  }

  // Effect per calcolo automatico al caricamento iniziale
  useEffect(() => {
    // Questo useEffect è stato rimosso per prevenire un ciclo di ricalcolo infinito.
    // Il ricalcolo ora viene chiamato esplicitamente dopo ogni azione che modifica i costi.
  }, []) // Eseguito solo una volta al mount

  // Auto-populate when shipment is loaded
  useEffect(() => {
    if (shipment?.tracking_number && !autoUpdating && lastProcessedTrackingNumber.current !== shipment.tracking_number) {
      lastProcessedTrackingNumber.current = shipment.tracking_number
      autoPopulateFromShipsGo(shipment)
    }
  }, [shipment?.tracking_number, autoUpdating, autoPopulateFromShipsGo])

  const calculateShipmentTotals = () => {
    if (!shipment?.products) return null

    let totalWeight = 0
    let totalVolume = 0
    let totalProductCost = 0
    let totalDutyAmount = 0
    let totalCustomsFees = 0
    let totalTransportCost = 0

    shipment.products.forEach(product => {
      totalWeight += product.total_weight_kg || 0
      totalVolume += product.total_volume_cbm || 0
      totalProductCost += product.total_cost || product.total_price || product.total_value || 0
      totalDutyAmount += product.duty_amount || 0
      totalCustomsFees += product.customs_fees || 0
      totalTransportCost += product.transport_total_cost || 0
    })

    let totalAdditionalCosts = 0
    if (shipment.additional_costs) {
      shipment.additional_costs.forEach(cost => {
        totalAdditionalCosts += cost.amount || 0
      })
    }

    const freightCost = shipment.freight_cost || 0
    const finalTotal = totalProductCost + totalDutyAmount + totalCustomsFees + totalTransportCost + freightCost + totalAdditionalCosts

    const containerType = shipment.container_type || '40ft'
    const containerUsage = calculateContainerUsage(containerType, totalWeight, totalVolume)

    // 🆕 Rileva automaticamente il tipo di trasporto
    const transportMode = detectTransportMode(shipment)

    return {
      totalWeight,
      totalVolume,
      totalProductCost,
      totalDutyAmount,
      totalCustomsFees,
      totalTransportCost,
      totalAdditionalCosts,
      freightCost,
      finalTotal,
      containerUsage,
      containerType,
      transportMode,
      productsCount: shipment.products.length
    }
  }

  const totals = calculateShipmentTotals()

  const fetchShipment = async () => {
    try {
      setLoading(true)
      
      const { data: shipmentData, error: shipmentError } = await supabase
        .from('shipments')
        .select(`
          *,
          tracking:tracking_id (
            *,
            transport_modes:transport_mode_id (id, name),
            vehicle_types:vehicle_type_id (id, name)
          )
        `)
        .eq('id', shipmentId)
        .single()

      if (shipmentError) {
        console.error('❌ Shipment error:', shipmentError)
        throw shipmentError
      }

      const { data: itemsData, error: itemsError } = await supabase
        .from('shipment_items')
        .select('*')
        .eq('shipment_id', shipmentId)

      if (itemsError) {
        console.error('⚠️ Items error:', itemsError)
      }

      const { data: costsData, error: costsError } = await supabase
        .from('additional_costs')
        .select('*')
        .eq('shipment_id', shipmentId)

      if (costsError) {
        console.error('⚠️ Additional costs error:', costsError)
      }

      const { data: documentsData, error: documentsError } = await supabase
        .from('shipment_documents')
        .select('*')
        .eq('shipment_id', shipmentId)

      if (documentsError) {
        console.error('⚠️ Documents error:', documentsError)
      }

      const normalizedProducts = (itemsData || []).map(item => {
        const safeItem = item as any
        
        // Estrai i costi di trasporto da cost_metadata
        const costMetadata = safeItem.cost_metadata || {}
        const transportUnitCost = typeof costMetadata === 'object' && costMetadata !== null
          ? (costMetadata as any).transport_unit_cost || 0
          : 0
        const transportTotalCost = typeof costMetadata === 'object' && costMetadata !== null
          ? (costMetadata as any).transport_total_cost || 0
          : 0


        return {
          ...safeItem,
          unit_cost: safeItem.unit_cost || safeItem.unit_price || 0,
          total_cost: safeItem.total_cost || safeItem.total_price || safeItem.total_value || 0,
          transport_unit_cost: transportUnitCost,
          transport_total_cost: transportTotalCost,
          duty_rate: safeItem.duty_rate || 0,
          duty_amount: safeItem.duty_amount || 0,
          duty_unit_cost: safeItem.duty_unit_cost || 0,
          customs_fees: safeItem.customs_fees || 0,
          weight_kg: safeItem.weight_kg || 0,
          total_weight_kg: safeItem.total_weight_kg || 0,
          volume_cbm: safeItem.volume_cbm || 0,
          total_volume_cbm: safeItem.total_volume_cbm || 0,
          quantity: safeItem.quantity || 1,
          category: safeItem.category || null,
          origin_country: safeItem.origin_country || null,
          ean: safeItem.ean || null,
          other_description: safeItem.other_description || null
        }
      })

      const completeShipment = {
        ...shipmentData,
        products: normalizedProducts,
        additional_costs: costsData || [],
        documents: documentsData || []
      }

      setShipment(completeShipment as unknown as Shipment)
      
    } catch (err) {
      console.error('❌ Error fetching shipment:', err)
      alert('Errore nel caricamento della spedizione: ' + (err as any)?.message)
    } finally {
      setLoading(false)
    }
  }

  // 🆕 GESTIONE COSTI AGGIUNTIVI CON MODAL
  const handleSaveCost = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!costForm.cost_type || !costForm.amount) {
      alert('Compila tutti i campi obbligatori')
      return
    }

    try {
      setSavingCost(true)
      
      const { error } = await supabase
        .from('additional_costs')
        .insert({
          shipment_id: shipmentId,
          organization_id: shipment?.organization_id || user?.user_metadata?.organization_id || '',
          cost_type: costForm.cost_type,
          amount: parseFloat(costForm.amount),
          currency: costForm.currency,
          notes: costForm.notes || null
        })

      if (error) throw error

      // Ricalcola automaticamente i costi dopo l'aggiunta
      await fetchAndRecalculateCosts()
      setShowCostModal(false)
      setCostForm({ cost_type: '', amount: '', currency: 'EUR', notes: '' })
    } catch (err) {
      console.error('Error adding cost:', err)
      alert('Errore nell\'aggiunta del costo')
    } finally {
      setSavingCost(false)
    }
  }

  const handleDeleteAdditionalCost = async (costId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo costo aggiuntivo?')) return

    try {
      const { error } = await supabase
        .from('additional_costs')
        .delete()
        .eq('id', costId)

      if (error) throw error

      // Ricalcola automaticamente i costi dopo l'eliminazione
      await fetchAndRecalculateCosts()
    } catch (err) {
      console.error('Error deleting additional cost:', err)
      alert('Errore nell\'eliminazione del costo aggiuntivo')
    }
  }

  // Handler for additional cost dialog
  const handleAddAdditionalCost = async () => {
    if (!newCostDescription || !newCostAmount) {
      alert('Inserisci descrizione e importo')
      return
    }

    try {
      const { error } = await supabase
        .from('additional_costs')
        .insert({
          shipment_id: shipmentId,
          cost_type: newCostDescription,
          amount: parseFloat(newCostAmount),
          notes: newCostCategory || null,
          currency: 'EUR',
          organization_id: user?.user_metadata?.organization_id || ''
        })

      if (error) throw error

      setNewCostDescription('')
      setNewCostAmount('')
      setNewCostCategory('')
      setShowAddCostDialog(false)
      await fetchAndRecalculateCosts()
    } catch (error) {
      console.error('Error adding additional cost:', error)
      alert('Errore nell\'aggiunta del costo aggiuntivo')
    }
  }

  // Document handlers
  const documentInputRef = React.useRef<HTMLInputElement>(null)

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !shipment) return

    setUploadingDocument(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${file.name}`
      const filePath = `${shipment.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath)

      const { error: dbError } = await supabase
        .from('shipment_documents')
        .insert({
          shipment_id: shipmentId,
          document_name: file.name,
          file_path: filePath,
          file_size: file.size,
          document_type: fileExt?.toLowerCase() || 'unknown',
          organization_id: user?.user_metadata?.organization_id || '',
          user_id: user?.id || ''
        })

      if (dbError) throw dbError

      await fetchAndRecalculateCosts()
    } catch (error) {
      console.error('Error uploading document:', error)
      alert('Errore nel caricamento del documento')
    } finally {
      setUploadingDocument(false)
      if (e.target) e.target.value = ''
    }
  }

  const handleDocumentDownload = async (doc: any) => {
    try {
      const { data } = supabase.storage.from('documents').getPublicUrl(doc.file_path)
      const response = await fetch(data.publicUrl)
      if (!response.ok) throw new Error('Download failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = doc.document_name || 'document'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading document:', error)
      alert('Errore nel download del documento')
    }
  }

  const handleDocumentDelete = async (docId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo documento?')) return

    try {
      const { error } = await supabase
        .from('shipment_documents')
        .delete()
        .eq('id', docId)

      if (error) throw error

      await fetchAndRecalculateCosts()
    } catch (error) {
      console.error('Error deleting document:', error)
      alert('Errore nell\'eliminazione del documento')
    }
  }

  const handleSaveProduct = async (productData: any) => {
    try {
      console.log('💾 Saving product data:', productData)
      let savedProduct

      if (editingProduct) {
        console.log('✏️ Updating existing product:', editingProduct.id)
        const { data, error } = await supabase
          .from('shipment_items')
          .update({
            name: productData.name,
            sku: productData.sku,
            category: productData.category,
            hs_code: productData.hs_code,
            origin_country: productData.origin_country,
            ean: productData.ean,
            other_description: productData.other_description,
            quantity: productData.quantity,
            unit_cost: productData.unit_cost,
            total_cost: productData.total_cost,
            weight_kg: productData.weight_kg, // ✅ Corretto
            total_weight_kg: productData.total_weight_kg, // ✅ Corretto
            volume_cbm: productData.volume_cbm, // ✅ Corretto
            total_volume_cbm: productData.total_volume_cbm, // ✅ Corretto
            duty_rate: productData.duty_rate,
            duty_amount: productData.duty_amount,
            duty_unit_cost: productData.duty_unit_cost || 0,
            customs_fees: productData.customs_fees,
            cost_metadata: {
              transport_unit_cost: productData.transport_unit_cost || 0,
              transport_total_cost: productData.transport_total_cost || 0
            },
            product_id: productData.product_id
          })
          .eq('id', editingProduct.id)
          .select()
          .single()

        if (error) throw error
        savedProduct = data
      } else {
        const { data, error } = await supabase
          .from('shipment_items')
          .insert({
            shipment_id: shipmentId,
            name: productData.name,
            sku: productData.sku,
            category: productData.category,
            hs_code: productData.hs_code,
            origin_country: productData.origin_country,
            ean: productData.ean,
            other_description: productData.other_description,
            quantity: productData.quantity,
            unit_cost: productData.unit_cost,
            total_cost: productData.total_cost,
            weight_kg: productData.unit_weight,
            total_weight_kg: productData.total_weight,
            volume_cbm: productData.unit_volume,
            total_volume_cbm: productData.total_volume,
            duty_rate: productData.duty_rate,
            duty_amount: productData.duty_amount,
            duty_unit_cost: productData.duty_unit_cost || 0,
            customs_fees: productData.customs_fees,
            cost_metadata: {
              transport_unit_cost: productData.transport_unit_cost || 0,
              transport_total_cost: productData.transport_total_cost || 0
            },
            product_id: productData.product_id
          })
          .select()
          .single()

        if (error) throw error
        savedProduct = data
      }

      setEditingProduct(null)
      // Ricalcola automaticamente i costi dopo il salvataggio
      await fetchAndRecalculateCosts()
    } catch (err) {
      console.error('Error saving product:', err)
      throw err
    }
  }

  const handleBulkSaveProducts = async (productsData: any[]) => {
    try {
      const productsToInsert = productsData.map(productData => ({
        shipment_id: shipmentId,
        name: productData.name,
        sku: productData.sku,
        category: productData.category,
        hs_code: productData.hs_code,
        origin_country: productData.origin_country,
        ean: productData.ean,
        other_description: productData.other_description,
        quantity: productData.quantity,
        unit_cost: productData.unit_cost,
        total_cost: productData.total_cost,
        weight_kg: productData.weight_kg / Math.max(1, productData.quantity),
        total_weight_kg: productData.weight_kg,
        volume_cbm: productData.volume_cbm / Math.max(1, productData.quantity),
        total_volume_cbm: productData.volume_cbm,
        duty_rate: productData.duty_rate,
        duty_amount: productData.duty_amount,
        duty_unit_cost: productData.duty_unit_cost || 0,
        customs_fees: productData.customs_fees,
        cost_metadata: {
          transport_unit_cost: productData.transport_unit_cost || 0,
          transport_total_cost: productData.transport_total_cost || 0
        },
        product_id: productData.product_id
      }))

      const { error } = await supabase
        .from('shipment_items')
        .insert(productsToInsert)

      if (error) throw error

      // Ricalcola automaticamente i costi dopo il salvataggio bulk
      await fetchAndRecalculateCosts()
    } catch (err) {
      console.error('Error bulk saving products:', err)
      throw err
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo prodotto?')) return

    try {
      const { error } = await supabase
        .from('shipment_items')
        .delete()
        .eq('id', productId)

      if (error) throw error

      // Ricalcola automaticamente i costi dopo l'eliminazione
      await fetchAndRecalculateCosts()
    } catch (err) {
      console.error('Error deleting product:', err)
      alert('Errore nell\'eliminazione del prodotto')
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploadingDocument(true)

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `shipments/${shipmentId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { error: dbError } = await supabase
        .from('shipment_documents')
        .insert({
          shipment_id: shipmentId,
          organization_id: shipment?.organization_id || user?.user_metadata?.organization_id || '',
          user_id: user?.id || '',
          document_name: file.name,
          file_path: filePath,
          file_size: file.size,
          document_type: file.type
        })

      if (dbError) throw dbError

      await fetchShipment()
    } catch (err) {
      console.error('Error uploading document:', err)
      alert('Errore nel caricamento del documento')
    } finally {
      setUploadingDocument(false)
    }
  }

  const handleDeleteDocument = async (documentId: string, filePath: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo documento?')) return

    try {
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([filePath])

      if (storageError) console.error('Storage deletion error:', storageError)

      const { error: dbError } = await supabase
        .from('shipment_documents')
        .delete()
        .eq('id', documentId)

      if (dbError) throw dbError

      await fetchShipment()
    } catch (err) {
      console.error('Error deleting document:', err)
      alert('Errore nell\'eliminazione del documento')
    }
  }

  const handleDownloadDocument = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(filePath)

      if (error) throw error

      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error downloading document:', err)
      alert('Errore nel download del documento')
    }
  }

  useEffect(() => {
    if (shipmentId) {
      fetchShipment()
    }
  }, [shipmentId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Caricamento spedizione...</p>
        </div>
      </div>
    )
  }

  if (!shipment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium text-foreground mb-2">Spedizione non trovata</h3>
          <p className="text-muted-foreground">La spedizione richiesta non esiste o non hai i permessi per visualizzarla</p>
        </div>
      </div>
    )
  }

  const statusColors = {
    draft: 'bg-muted text-foreground',
    confirmed: 'bg-blue-100 text-blue-800',
    shipped: 'bg-yellow-100 text-yellow-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }

  const transportIcons = {
    sea: Ship,
    road: Truck,
    air: Plane,
    rail: Package
  }

  const TransportIcon = transportIcons[shipment.transport_mode as keyof typeof transportIcons] || Package

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Torna a Spedizioni
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Dettaglio Spedizione {shipment.reference_number || shipment.shipment_number || ''}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              {!statusEditing ? (
                <div className="flex items-center gap-2">
                  <Badge className={`${STATUS_COLORS[shipment.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.pending}`}>
                    {formatStatus(shipment.status || 'pending')}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setStatusEditing(true)
                      setEditStatus(shipment.status || 'pending')
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Select value={editStatus} onValueChange={setEditStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">In attesa</SelectItem>
                      <SelectItem value="in_transit">In transito</SelectItem>
                      <SelectItem value="delivered">Consegnato</SelectItem>
                      <SelectItem value="exception">Eccezione</SelectItem>
                      <SelectItem value="registered">Registrato</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      try {
                        const { error } = await supabase
                          .from('shipments')
                          .update({ status: editStatus })
                          .eq('id', shipmentId)

                        if (error) throw error

                        setShipment(prev => prev ? { ...prev, status: editStatus } : null)
                        setStatusEditing(false)
                      } catch (err) {
                        console.error('Error updating status:', err)
                        alert('Errore nel salvataggio dello stato')
                      }
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {shipment.tracking_number && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => autoPopulateFromShipsGo(shipment)}
                  disabled={autoUpdating}
                  className="flex items-center gap-2"
                >
                  {autoUpdating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  {autoUpdating ? 'Aggiornando...' : 'Aggiorna da ShipsGo'}
                </Button>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TransportIcon className="h-4 w-4" />
                {TRANSPORT_MODES[shipment.transport_mode as keyof typeof TRANSPORT_MODES] || shipment.transport_mode || '-'}
              </div>
              <div className="text-sm text-muted-foreground">
                Data: {formatDate(shipment.created_at)}
              </div>
              {shipment.supplier_name && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building className="h-4 w-4" />
                  {shipment.supplier_name}
                  {shipment.supplier_country && ` (${shipment.supplier_country})`}
                </div>
              )}
              {shipment.carrier_name && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Truck className="h-4 w-4" />
                  {shipment.carrier_name}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>


      {/* DETTAGLI TRACKING SHIPSGO */}

      {shipment.tracking && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ship className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Dettagli Tracking ShipsGO
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Tracking Number */}
              {shipment.tracking.tracking_number && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Numero Tracking</label>
                  <div className="text-base font-semibold text-foreground">
                    {shipment.tracking.tracking_number}
                  </div>
                </div>
              )}

              {/* AWB Number */}
              {shipment.tracking.metadata?.shipsgo_awb_number && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">AWB Number</label>
                  <div className="text-base font-semibold text-foreground">
                    {shipment.tracking.metadata.shipsgo_awb_number}
                  </div>
                </div>
              )}

              {/* Container Number */}
              {shipment.tracking.metadata?.shipsgo_container_number && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Container Number</label>
                  <div className="text-base font-semibold text-foreground">
                    {shipment.tracking.metadata.shipsgo_container_number}
                  </div>
                </div>
              )}

              {/* Pieces/Colli */}
              {shipment.tracking.metadata?.shipsgo_pieces && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Pieces (Colli)</label>
                  <div className="text-base font-semibold text-foreground flex items-center gap-1">
                    📦 {shipment.tracking.metadata.shipsgo_pieces}
                  </div>
                </div>
              )}

              {/* Peso Totale */}
              {shipment.tracking.total_weight_kg && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Peso Totale</label>
                  <div className="text-base font-semibold text-foreground flex items-center gap-1">
                    ⚖️ {shipment.tracking.total_weight_kg.toLocaleString()} kg
                  </div>
                </div>
              )}

              {/* Volume Totale */}
              {shipment.tracking.total_volume_cbm && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Volume Totale</label>
                  <div className="text-base font-semibold text-foreground flex items-center gap-1">
                    📐 {shipment.tracking.total_volume_cbm.toFixed(3)} m³
                  </div>
                </div>
              )}

              {/* Carrier */}
              {shipment.tracking.carrier_name && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Vettore</label>
                  <div className="text-base font-semibold text-foreground">
                    {shipment.tracking.carrier_name}
                  </div>
                </div>
              )}

              {/* Status */}
              {shipment.tracking.status && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Status Tracking</label>
                  <div className="text-base font-semibold text-foreground">
                    {shipment.tracking.status}
                  </div>
                </div>
              )}

              {/* Ultimo Aggiornamento */}
              {shipment.tracking.metadata?.shipsgo_last_update && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Ultimo Aggiornamento</label>
                  <div className="text-sm text-muted-foreground">
                    {new Date(shipment.tracking.metadata.shipsgo_last_update).toLocaleString('it-IT')}
                  </div>
                </div>
              )}
            </div>

            {/* Alert calcolo automatico peso da volume */}
            {shipment.tracking.total_volume_cbm && !shipment.tracking.total_weight_kg && (
              <Alert className="mt-4 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950">
                <Info className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <AlertDescription className="text-yellow-800">
                  <strong>📊 Calcolo Automatico Peso:</strong>
                  <div className="text-sm mt-1">
                    Volume disponibile: {shipment.tracking.total_volume_cbm.toFixed(3)} m³
                    {totals?.transportMode.toLowerCase().includes('air') && (
                      ` → Peso volumetrico stimato: ${(shipment.tracking.total_volume_cbm * 167).toFixed(2)} kg`
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Pulsante calcolo automatico peso */}
            {shipment.tracking.total_weight_kg && (
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={autoCalculateWeightFromTracking}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <span>⚖️</span>
                  Calcola Peso Articoli da Tracking
                </button>
                <div className="text-xs text-muted-foreground flex items-center">
                  Distribuzione automatica del peso totale ({shipment.tracking.total_weight_kg} kg) sui prodotti in base al volume
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* CONTROLLO PESO/VOLUME CONTAINER E TIPO TRASPORTO */}
      {totals && (
        <div className="mb-6 space-y-4">
          {/* Alert tipo trasporto rilevato */}
          <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
            <Ship className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-blue-800 flex items-center justify-between">
              <div>
                <strong>🚛 Tipo Trasporto Rilevato:</strong> {totals.transportMode}
                <div className="text-sm mt-1">
                  Allocazione costi basata su: {
                    totals.transportMode.toLowerCase().includes('mare') ? 'Volume (CBM)' :
                    totals.transportMode.toLowerCase().includes('air') ? 'Peso vs Volume Max (167kg/CBM)' :
                    'Flessibile (Peso/Volume disponibile)'
                  }
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Alert peso/volume container - SOLO PER SPEDIZIONI MARITTIME */}
          {totals.transportMode.toLowerCase().includes('sea') || totals.transportMode.toLowerCase().includes('mare') || totals.transportMode.toLowerCase().includes('ocean') ? (
            totals.containerUsage.isOverweight || totals.containerUsage.isOvervolume ? (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>⚠️ ATTENZIONE {CONTAINER_SPECS[totals.containerType]?.type || totals.containerType}:</strong>
                <div className="mt-1">
                  {totals.containerUsage.isOverweight && (
                    <div>• Peso eccedente: {totals.totalWeight.toFixed(2)} kg {`>`} {totals.containerUsage.maxWeight.toLocaleString()} kg</div>
                  )}
                  {totals.containerUsage.isOvervolume && (
                    <div>• Volume eccedente: {totals.totalVolume.toFixed(3)} m³ {`>`} {totals.containerUsage.maxVolume} m³</div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
              <Info className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800">
                <strong>✅ {CONTAINER_SPECS[totals.containerType]?.type || totals.containerType} OK:</strong>
                Utilizzo {Math.max(totals.containerUsage.weightPercentage, totals.containerUsage.volumePercentage).toFixed(1)}%
                ({totals.containerUsage.weightPercentage.toFixed(1)}% peso, {totals.containerUsage.volumePercentage.toFixed(1)}% volume)
              </AlertDescription>
            </Alert>
          )
          ) : totals.transportMode.toLowerCase().includes('air') ? (
            // Per spedizioni aeree mostra informazioni diverse
            <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-800">
                <strong>✈️ Spedizione Aerea - {shipment.carrier_name || 'Carrier'}</strong>
                <div className="mt-1">
                  <div>• Peso Totale: {totals.totalWeight.toFixed(2)} kg</div>
                  <div>• Volume Totale: {totals.totalVolume.toFixed(3)} m³</div>
                  <div>• Peso Volumetrico (1:167): {(totals.totalVolume * 167).toFixed(2)} kg</div>
                  <div>• Peso Tassabile: {Math.max(totals.totalWeight, totals.totalVolume * 167).toFixed(2)} kg</div>
                </div>
              </AlertDescription>
            </Alert>
          ) : null}
        </div>
      )}

      {/* RIEPILOGO TOTALI */}
      {totals && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Riepilogo Spedizione ({totals.productsCount} prodotti)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Peso Totale</p>
                <p className="text-xl font-bold text-blue-900">{totals.totalWeight.toFixed(2)} kg</p>
                {(totals.transportMode.toLowerCase().includes('sea') || totals.transportMode.toLowerCase().includes('mare')) && (
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    {totals.containerUsage.weightPercentage.toFixed(1)}% container
                  </p>
                )}
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">Volume Totale</p>
                <p className="text-xl font-bold text-purple-900">{totals.totalVolume.toFixed(3)} m³</p>
                {(totals.transportMode.toLowerCase().includes('sea') || totals.transportMode.toLowerCase().includes('mare')) && (
                  <p className="text-xs text-purple-600">
                    {totals.containerUsage.volumePercentage.toFixed(1)}% container
                  </p>
                )}
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">💰 Costo Prodotti</p>
                <p className="text-xl font-bold text-green-900">€{totals.totalProductCost.toFixed(2)}</p>
              </div>
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">🚢 Dazi</p>
                <p className="text-xl font-bold text-orange-900">€{totals.totalDutyAmount.toFixed(2)}</p>
              </div>
              <div className="text-center p-4 bg-cyan-50 dark:bg-cyan-950 rounded-lg">
                <p className="text-sm text-cyan-600 dark:text-cyan-400 font-medium">🚛 Trasporto Prodotti</p>
                <p className="text-xl font-bold text-cyan-900">€{totals.totalTransportCost.toFixed(2)}</p>
              </div>
              <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-950 rounded-lg">
                <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">🚢 Nolo/Freight</p>
                <p className="text-xl font-bold text-indigo-900">€{totals.freightCost.toFixed(2)}</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">💼 Costi Extra</p>
                <p className="text-xl font-bold text-yellow-900">€{totals.totalAdditionalCosts.toFixed(2)}</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-200 dark:border-green-800">
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">TOTALE FINALE</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">€{totals.finalTotal.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 🆕 TABS MODERNE PER COSTI, DOCUMENTI E INFO */}
      <Card className="mb-6">
        <Tabs defaultValue="costs" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="costs" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Tutti i Costi ({(shipment.additional_costs?.length || 0) + 2})
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documenti ({shipment.documents?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="info" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Info Spedizione
            </TabsTrigger>
          </TabsList>

          {/* TAB TUTTI I COSTI UNIFICATA */}
          <TabsContent value="costs" className="space-y-6">
            {/* SEZIONE COSTI BASE TRASPORTO */}
            <div>
              <h3 className="text-lg font-semibold mb-4">💰 Costi Base Trasporto</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="freight_cost">Nolo/Freight (€)</Label>
                  <Input
                    id="freight_cost"
                    type="number"
                    step="0.01"
                    value={shipment?.freight_cost?.toString() || '0'}
                    onChange={(e) => {
                      if (shipment) {
                        setShipment({ ...shipment, freight_cost: parseFloat(e.target.value) || 0 })
                      }
                    }}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="other_costs">Altri Costi Base (€)</Label>
                  <Input
                    id="other_costs"
                    type="number"
                    step="0.01"
                    value={shipment?.other_costs?.toString() || '0'}
                    onChange={(e) => {
                      if (shipment) {
                        setShipment({ ...shipment, other_costs: parseFloat(e.target.value) || 0 })
                      }
                    }}
                    placeholder="0.00"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={async () => {
                      if (!shipment) return
                      try {
                        await supabase
                          .from('shipments')
                          .update({
                            freight_cost: shipment.freight_cost || 0,
                            other_costs: shipment.other_costs || 0
                          })
                          .eq('id', shipmentId)

                        // Ricalcola automaticamente i costi dopo l'aggiornamento
                        await fetchAndRecalculateCosts()
                      } catch (error) {
                        console.error('Error saving transport costs:', error)
                        alert('Errore nel salvataggio dei costi di trasporto')
                      }
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salva Costi Base
                  </Button>
                </div>
              </div>
            </div>

            {/* SEZIONE COSTI AGGIUNTIVI */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">🏷️ Costi Aggiuntivi</h3>
              
              {/* 🆕 MODAL MODERNO PER AGGIUNGERE COSTO */}
              <Dialog open={showCostModal} onOpenChange={setShowCostModal}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Aggiungi Costo
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Aggiungi Costo Aggiuntivo</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSaveCost} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cost_type">Tipo Costo *</Label>
                      <Select value={costForm.cost_type} onValueChange={(value) => setCostForm({...costForm, cost_type: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona tipo costo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="insurance">Assicurazione</SelectItem>
                          <SelectItem value="customs_brokerage">Spedizioniere</SelectItem>
                          <SelectItem value="storage">Magazzinaggio</SelectItem>
                          <SelectItem value="handling">Handling</SelectItem>
                          <SelectItem value="inspection">Ispezione</SelectItem>
                          <SelectItem value="documentation">Documentazione</SelectItem>
                          <SelectItem value="other">Altro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="amount">Importo *</Label>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          value={costForm.amount}
                          onChange={(e) => setCostForm({...costForm, amount: e.target.value})}
                          placeholder="0.00"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="currency">Valuta</Label>
                        <Select value={costForm.currency} onValueChange={(value) => setCostForm({...costForm, currency: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                            <SelectItem value="CNY">CNY</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="notes">Note</Label>
                      <Textarea
                        id="notes"
                        value={costForm.notes}
                        onChange={(e) => setCostForm({...costForm, notes: e.target.value})}
                        placeholder="Note aggiuntive..."
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setShowCostModal(false)}>
                        Annulla
                      </Button>
                      <Button type="submit" disabled={savingCost}>
                        {savingCost ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Salva
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {!shipment.additional_costs || shipment.additional_costs.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-foreground mb-2">Nessun costo aggiuntivo</h3>
                <p className="text-muted-foreground mb-4">Aggiungi costi extra come assicurazione, handling, ecc.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {shipment.additional_costs.map((cost) => (
                  <div key={cost.id} className="flex items-center justify-between p-4 bg-muted rounded-lg border">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <Badge variant="secondary">{cost.cost_type}</Badge>
                        <span className="text-xl font-bold text-green-600 dark:text-green-400">
                          €{cost.amount.toFixed(2)}
                        </span>
                        {cost.currency !== 'EUR' && (
                          <Badge variant="outline">{cost.currency}</Badge>
                        )}
                      </div>
                      {cost.notes && (
                        <p className="text-sm text-muted-foreground">{cost.notes}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(cost.created_at).toLocaleDateString('it-IT')}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteAdditionalCost(cost.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            </div>

            {/* SEZIONE RIEPILOGO E CALCOLO AUTOMATICO */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">📊 Riepilogo Totale e Allocazione</h3>

              {/* Riepilogo tutti i costi */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg mb-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-blue-700 dark:text-blue-300">Nolo/Freight:</p>
                    <p className="font-bold text-lg">€{(shipment?.freight_cost || 0).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-blue-700 dark:text-blue-300">Altri Costi Base:</p>
                    <p className="font-bold text-lg">€{(shipment?.other_costs || 0).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-blue-700 dark:text-blue-300">Costi Aggiuntivi:</p>
                    <p className="font-bold text-lg">€{(shipment?.additional_costs?.reduce((sum, cost) => sum + (cost.amount || 0), 0) || 0).toFixed(2)}</p>
                  </div>
                  <div className="border-l-2 border-green-400 pl-4">
                    <p className="text-green-700 dark:text-green-300 font-medium">TOTALE TRASPORTO:</p>
                    <p className="font-bold text-2xl text-green-800">
                      €{((shipment?.freight_cost || 0) + (shipment?.other_costs || 0) + (shipment?.additional_costs?.reduce((sum, cost) => sum + (cost.amount || 0), 0) || 0)).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Calcolo automatico abilitato - I costi vengono allocati automaticamente */}
              <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-300">
                  <Calculator className="h-5 w-5" />
                  <span className="font-medium">Calcolo Automatico Attivo</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                  I costi di trasporto vengono allocati automaticamente ai prodotti<br/>
                  basandosi su {totals?.transportMode} ({totals?.transportMode?.toLowerCase().includes('air') ? 'Peso vs Volume Max (167kg/CBM)' : totals?.transportMode?.toLowerCase().includes('mare') ? 'Volume (CBM)' : 'Flessibile (Peso/Volume disponibile)'})
                </p>
              </div>
            </div>
          </TabsContent>

          {/* TAB DOCUMENTI */}
          <TabsContent value="documents" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Documenti</h3>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="document-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploadingDocument}
                />
                <Button
                  onClick={() => document.getElementById('document-upload')?.click()}
                  disabled={uploadingDocument}
                  className="flex items-center gap-2"
                >
                  {uploadingDocument ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {uploadingDocument ? 'Caricamento...' : 'Carica Documento'}
                </Button>
              </div>
            </div>

            {!shipment.documents || shipment.documents.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-foreground mb-2">Nessun documento</h3>
                <p className="text-muted-foreground mb-4">Carica documenti come fatture, B/L, certificati</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {shipment.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 bg-muted rounded-lg border">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-medium">{doc.document_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {(doc.file_size / 1024 / 1024).toFixed(2)} MB • 
                          {new Date(doc.uploaded_at).toLocaleDateString('it-IT')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadDocument(doc.file_path, doc.document_name)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteDocument(doc.id, doc.file_path)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TAB INFO SPEDIZIONE */}
          <TabsContent value="info" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Date e Status */}
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground border-b pb-2">📅 Date e Status</h4>
                
                {shipment.departure_date && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Partenza</p>
                      <p className="font-semibold">{new Date(shipment.departure_date).toLocaleDateString('it-IT')}</p>
                    </div>
                  </div>
                )}
                
                {shipment.arrival_date && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium">Arrivo</p>
                      <p className="font-semibold">{new Date(shipment.arrival_date).toLocaleDateString('it-IT')}</p>
                    </div>
                  </div>
                )}
                
                {shipment.eta && (
                  <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    <div>
                      <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">ETA</p>
                      <p className="font-semibold">{new Date(shipment.eta).toLocaleDateString('it-IT')}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Rotta */}
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground border-b pb-2">🗺️ Rotta</h4>
                
                {shipment.origin_port && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Porto partenza</p>
                      <p className="font-semibold">{shipment.origin_port}</p>
                    </div>
                  </div>
                )}
                
                {shipment.destination_port && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium">Porto arrivo</p>
                      <p className="font-semibold">{shipment.destination_port}</p>
                    </div>
                  </div>
                )}
                
                {(shipment.origin_country || shipment.destination_country) && (
                  <div className="p-3 bg-muted rounded-lg">
                    {shipment.origin_country && (
                      <p className="text-sm"><span className="font-medium">Da:</span> {shipment.origin_country}</p>
                    )}
                    {shipment.destination_country && (
                      <p className="text-sm"><span className="font-medium">A:</span> {shipment.destination_country}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Documenti e Tracking */}
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground border-b pb-2">📋 Tracking & Documenti</h4>
                
                {shipment.tracking_number && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Tracking</p>
                    <p className="font-mono font-semibold text-blue-600 dark:text-blue-400">{shipment.tracking_number}</p>
                  </div>
                )}
                
                {shipment.bl_number && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">B/L Number</p>
                    <p className="font-mono font-semibold text-green-600 dark:text-green-400">{shipment.bl_number}</p>
                  </div>
                )}
                
                {shipment.booking_number && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Booking</p>
                    <p className="font-mono font-semibold text-orange-600 dark:text-orange-400">{shipment.booking_number}</p>
                  </div>
                )}
                
                {shipment.vessel_name && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <Ship className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Nave</p>
                      <p className="font-semibold">{shipment.vessel_name}</p>
                      {shipment.voyage_number && (
                        <p className="text-sm text-muted-foreground">Viaggio: {shipment.voyage_number}</p>
                      )}
                    </div>
                  </div>
                )}
                
                {shipment.container_type && (
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <Package className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Container</p>
                      <p className="font-semibold">{shipment.container_type}</p>
                      {shipment.container_count && (
                        <p className="text-sm text-muted-foreground">Quantità: {shipment.container_count}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Advanced Products Table Section - Matching old project design */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Prodotti ({shipment.products?.length || 0})
            </CardTitle>
            <Button
              onClick={() => setShowProductModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Aggiungi Prodotto
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!shipment.products || shipment.products.length === 0 ? (
            <div className="text-center py-8 px-6">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-foreground mb-2">Nessun prodotto aggiunto</h3>
              <p className="text-muted-foreground mb-4">Inizia aggiungendo prodotti a questa spedizione</p>
              <Button
                onClick={() => setShowProductModal(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Aggiungi primo prodotto
              </Button>
            </div>
          ) : (
            <div className="table-container overflow-x-auto border border-border rounded-lg">
              <table className="data-table min-w-full border-collapse bg-card">
                <thead>
                  <tr className="bg-muted">
                    <th className="px-3 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border" style={{width: '250px', maxWidth: '250px', minWidth: '200px'}}>Prodotto</th>
                    <th className="px-3 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border" style={{minWidth: '80px'}}>Quantità</th>
                    <th className="px-3 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border" style={{minWidth: '100px'}}>Peso Totale</th>
                    <th className="px-3 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border" style={{minWidth: '100px'}}>Volume Totale</th>
                    <th className="px-3 py-4 text-left text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider border-b border-border bg-blue-50 dark:bg-blue-950" style={{minWidth: '120px'}}>💰 Costo Unitario</th>
                    <th className="px-3 py-4 text-left text-xs font-semibold text-green-700 dark:text-green-300 uppercase tracking-wider border-b border-border bg-green-50 dark:bg-green-950" style={{minWidth: '120px'}}>💰 Costo Totale</th>
                    <th className="px-3 py-4 text-center text-xs font-semibold text-orange-700 dark:text-orange-300 uppercase tracking-wider border-b border-border bg-orange-50 dark:bg-orange-950" style={{minWidth: '100px'}}>📊 % Dazio</th>
                    <th className="px-3 py-4 text-left text-xs font-semibold text-yellow-700 dark:text-yellow-300 uppercase tracking-wider border-b border-border bg-yellow-50 dark:bg-yellow-950" style={{minWidth: '100px'}}>🚢 Dazio Unitario</th>
                    <th className="px-3 py-4 text-left text-xs font-semibold text-pink-700 dark:text-pink-300 uppercase tracking-wider border-b border-border bg-pink-50 dark:bg-pink-950" style={{minWidth: '120px'}}>🚢 Dazio Totale</th>
                    <th className="px-3 py-4 text-left text-xs font-semibold text-cyan-700 dark:text-cyan-300 uppercase tracking-wider border-b border-border bg-cyan-50 dark:bg-cyan-950" style={{minWidth: '100px'}}>🚛 Trasporto Un.</th>
                    <th className="px-3 py-4 text-left text-xs font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider border-b border-border bg-indigo-50 dark:bg-indigo-950" style={{minWidth: '120px'}}>🚛 Trasporto Tot.</th>
                    <th className="px-3 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border bg-muted sticky right-0" style={{minWidth: '150px'}}>Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {shipment.products.map((product, index) => {
                    const dutyUnitCost = product.quantity > 0 ? (product.duty_amount || 0) / product.quantity : 0
                    // Calculate final total cost (commented to avoid unused variable warning)
                    // const finalTotalCost = (
                    //   (product.total_cost || 0) +
                    //   (product.duty_amount || 0) +
                    //   (product.customs_fees || 0) +
                    //   (product.transport_total_cost || 0)
                    // )

                    return (
                      <tr key={product.id} className={`${index % 2 === 0 ? 'bg-card' : 'bg-muted'} hover:bg-blue-50 hover:dark:bg-blue-950 transition-colors product-row`}>
                        <td className="px-3 py-4 border-b border-border align-top" style={{width: '250px', maxWidth: '250px', minWidth: '200px'}}>
                          <div className="product-info">
                            <div className="product-name font-semibold text-foreground text-sm leading-tight mb-1" title={product.name || ''}>
                              {product.name}
                            </div>
                            {product.sku && (
                              <div className="product-sku text-xs text-muted-foreground truncate" title={product.sku}>
                                SKU: {product.sku}
                              </div>
                            )}
                            {product.category && (
                              <Badge variant="outline" className="mt-1">{product.category}</Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-4 border-b border-border text-sm font-medium text-foreground">
                          {formatNumberIT(product.quantity)}
                        </td>
                        <td className="px-3 py-4 border-b border-border text-sm text-foreground">
                          {formatNumberIT(product.total_weight_kg)} kg
                        </td>
                        <td className="px-3 py-4 border-b border-border text-sm text-foreground">
                          {formatNumberIT(product.total_volume_cbm)} m³
                        </td>
                        <td className="px-3 py-4 border-b border-border text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 border-l-3 border-l-blue-500">
                          {formatCurrencyIT(product.unit_cost)}
                        </td>
                        <td className="px-3 py-4 border-b border-border text-sm font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 border-l-3 border-l-green-500">
                          {formatCurrencyIT(product.total_cost)}
                        </td>
                        <td className="px-3 py-4 border-b border-border text-sm font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950 border-l-3 border-l-orange-500 text-center">
                          {formatPercentageIT(product.duty_rate)}
                        </td>
                        <td className="px-3 py-4 border-b border-border text-sm font-semibold text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950 border-l-3 border-l-yellow-500">
                          {formatCurrencyIT(dutyUnitCost)}
                        </td>
                        <td className="px-3 py-4 border-b border-border text-sm font-semibold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950 border-l-3 border-l-pink-500">
                          {formatCurrencyIT(product.duty_amount)}
                        </td>
                        <td className="px-3 py-4 border-b border-border text-sm font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950 border-l-3 border-l-cyan-500">
                          {formatCurrencyIT(product.transport_unit_cost)}
                        </td>
                        <td className="px-3 py-4 border-b border-border text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 border-l-3 border-l-indigo-500">
                          {formatCurrencyIT(product.transport_total_cost)}
                        </td>
                        <td className="px-3 py-4 border-b border-border text-center bg-card sticky right-0 border-l-2 border-l-border">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingProduct(product)
                                setShowProductModal(true)
                              }}
                              className="h-8 w-8 p-0 bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
                              title="Modifica Prodotto"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteProduct(product.id)}
                              className="h-8 w-8 p-0 bg-red-600 text-white hover:bg-red-700 border-red-600"
                              title="Elimina Prodotto"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-muted border-t-2 border-border">
                    <th className="px-3 py-4 text-left text-sm font-bold text-foreground">Totali</th>
                    <th className="px-3 py-4 text-left text-sm font-bold text-foreground">
                      {formatNumberIT(shipment.products.reduce((sum, p) => sum + (p.quantity || 0), 0))}
                    </th>
                    <th className="px-3 py-4 text-left text-sm font-bold text-foreground">
                      {formatNumberIT(shipment.products.reduce((sum, p) => sum + (p.total_weight_kg || 0), 0))} kg
                    </th>
                    <th className="px-3 py-4 text-left text-sm font-bold text-foreground">
                      {formatNumberIT(shipment.products.reduce((sum, p) => sum + (p.total_volume_cbm || 0), 0))} m³
                    </th>
                    <th className="px-3 py-4 text-left text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950">
                      {formatCurrencyIT(shipment.products.reduce((sum, p) => sum + ((p.unit_cost || 0) * (p.quantity || 0)), 0) / Math.max(1, shipment.products.reduce((sum, p) => sum + (p.quantity || 0), 0)))}
                    </th>
                    <th className="px-3 py-4 text-left text-sm font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950">
                      {formatCurrencyIT(shipment.products.reduce((sum, p) => sum + (p.total_cost || 0), 0))}
                    </th>
                    <th className="px-3 py-4 text-center text-sm font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950">
                      {formatPercentageIT(shipment.products.reduce((sum, p) => sum + ((p.duty_rate || 0) * (p.total_cost || 0)), 0) / Math.max(1, shipment.products.reduce((sum, p) => sum + (p.total_cost || 0), 0)))}
                    </th>
                    <th className="px-3 py-4 text-left text-sm font-bold text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950">
                      {formatCurrencyIT(shipment.products.reduce((sum, p) => sum + (p.duty_amount || 0), 0) / Math.max(1, shipment.products.reduce((sum, p) => sum + (p.quantity || 0), 0)))}
                    </th>
                    <th className="px-3 py-4 text-left text-sm font-bold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950">
                      {formatCurrencyIT(shipment.products.reduce((sum, p) => sum + (p.duty_amount || 0), 0))}
                    </th>
                    <th className="px-3 py-4 text-left text-sm font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950">
                      {formatCurrencyIT(shipment.products.reduce((sum, p) => sum + ((p.transport_unit_cost || 0) * (p.quantity || 0)), 0) / Math.max(1, shipment.products.reduce((sum, p) => sum + (p.quantity || 0), 0)))}
                    </th>
                    <th className="px-3 py-4 text-left text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950">
                      {formatCurrencyIT(shipment.products.reduce((sum, p) => sum + (p.transport_total_cost || 0), 0))}
                    </th>
                    <th className="px-3 py-4 bg-muted sticky right-0"></th>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>



      {/* Product Modal */}
      <ProductModal
        isOpen={showProductModal}
        onClose={() => {
          setShowProductModal(false)
          setEditingProduct(null)
        }}
        onSave={handleSaveProduct}
        onBulkSave={handleBulkSaveProducts}
        editingProduct={editingProduct}
        shipmentId={shipmentId}
      />

      {/* Add Additional Cost Dialog */}
      <Dialog open={showAddCostDialog} onOpenChange={setShowAddCostDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aggiungi Costo Aggiuntivo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="costDescription">Descrizione</Label>
              <Input
                id="costDescription"
                value={newCostDescription}
                onChange={(e) => setNewCostDescription(e.target.value)}
                placeholder="Descrizione del costo"
              />
            </div>
            <div>
              <Label htmlFor="costAmount">Importo (€)</Label>
              <Input
                id="costAmount"
                type="number"
                step="0.01"
                value={newCostAmount}
                onChange={(e) => setNewCostAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="costCategory">Categoria (opzionale)</Label>
              <Input
                id="costCategory"
                value={newCostCategory}
                onChange={(e) => setNewCostCategory(e.target.value)}
                placeholder="Generale"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddCostDialog(false)
                  setNewCostDescription('')
                  setNewCostAmount('')
                  setNewCostCategory('')
                }}
              >
                Annulla
              </Button>
              <Button onClick={handleAddAdditionalCost}>
                Aggiungi
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}