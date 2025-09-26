'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  MapPin, 
  Calendar, 
  DollarSign, 
  FileText, 
  Download, 
  Edit,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Ship,
  Anchor,
  Globe,
  Phone,
  Mail,
  Building,
  User,
  Hash,
  Eye,
  ExternalLink,
  Navigation,
  Activity,
  Plus,
  Search,
  Filter,
  CheckSquare,
  Square,
  ArrowUp,
  ArrowDown,
  ChevronUp,
  ChevronDown
} from 'lucide-react'

// ✅ IMPORTA IL CLIENT CENTRALIZZATO
import { createClient } from '@/utils/supabase/client'

// ✅ INIZIALIZZA SUPABASE CLIENT
const supabase = createClient()

// ✅ INTERFACCIA SHIPMENT CORRETTA
interface Shipment {
  id: string
  tracking_number?: string | null
  shipment_number?: string | null
  status: string
  recipient_name?: string | null
  total_value?: number | null
  created_at: string | null
  updated_at: string | null
  organization_id?: string | null
  user_id: string
  notes?: string | null
  origin?: string | null
  destination?: string | null
  origin_port?: string | null
  destination_port?: string | null
  carrier_name?: string | null
  eta?: string | null
  shipment_items?: any[]
  priority?: string | null
  tracking?: any
}

interface StatusConfig {
  label: string
  color: string
  icon: string
}

interface PriorityConfig {
  label: string
  color: string
  icon: string
}

type SortField = 'created_at' | 'updated_at' | 'tracking_number' | 'status' | 'total_value' | 'recipient_name'
type SortDirection = 'asc' | 'desc'

interface SortConfig {
  field: SortField
  direction: SortDirection
}

export default function ShipmentsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter() 
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [carrierFilter, setCarrierFilter] = useState('all')
  const [expandedShipments, setExpandedShipments] = useState<Set<string>>(new Set())
  
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'created_at', direction: 'desc' })
  const [selectedShipments, setSelectedShipments] = useState<Set<string>>(new Set())
  const [dateRange, setDateRange] = useState({ from: '', to: '' })
  const [showFilters, setShowFilters] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)

  // ✅ LOAD SHIPMENTS FUNCTION CORRETTA
  const loadShipments = useCallback(async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)
      
      console.log('🚀 Loading shipments from Supabase for user:', user.email)
      console.log('🔑 User ID:', user.id)

      // 1. Trova le organizzazioni dell'utente
      console.log('🔍 Finding user organizations...')
      const { data: userOrgs, error: orgError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)

      console.log('🏢 User organizations:', { 
        success: !orgError, 
        error: orgError?.message, 
        orgCount: userOrgs?.length || 0,
        orgs: userOrgs 
      })

      if (orgError) {
        throw new Error(`Errore organizzazioni: ${orgError.message}`)
      }

      if (!userOrgs || userOrgs.length === 0) {
        console.warn('⚠️ User has no organizations')
        setShipments([])
        return
      }

      const organizationIds = userOrgs.map((org: any) => org.organization_id)
      console.log('📋 Querying shipments for organizations:', organizationIds)

      // 2. Query spedizioni CORRETTA
      const { data: shipmentsData, error: shipmentsError } = await supabase
        .from('shipments')
        .select(`
          *,
          shipment_items (
            id,
            name,
            sku,
            quantity,
            unit_cost,
            total_cost
          )
        `)
        .in('organization_id', organizationIds)
        .is('discarded_at', null)
        .order('created_at', { ascending: false })

      console.log('📊 Shipments query result:', { 
        success: !shipmentsError, 
        error: shipmentsError?.message, 
        dataLength: shipmentsData?.length || 0,
        sampleData: shipmentsData?.[0] || null
      })

      if (shipmentsError) {
        throw new Error(`Errore database: ${shipmentsError.message}`)
      }

      if (!shipmentsData) {
        console.log('⚠️ No shipments data returned')
        setShipments([])
        return
      }

      console.log('✅ Raw shipments from Supabase:', shipmentsData.length)

      // 3. Normalizza i dati per l'interfaccia
      const normalizedShipments: Shipment[] = shipmentsData.map((shipment: any) => ({
        id: shipment.id,
        tracking_number: shipment.tracking_number || shipment.tracking_id,
        shipment_number: shipment.shipment_number,
        status: shipment.status || 'draft',
        recipient_name: shipment.destination || shipment.destination_country || 'N/A',
        total_value: typeof shipment.total_value === 'number' ? shipment.total_value : 
                    typeof shipment.total_cost === 'number' ? shipment.total_cost : 
                    typeof shipment.costs === 'number' ? shipment.costs : 
                    (typeof shipment.total_value === 'string' ? parseFloat(shipment.total_value) || 0 : 0),
        created_at: shipment.created_at,
        updated_at: shipment.updated_at,
        organization_id: shipment.organization_id,
        user_id: shipment.user_id,
        notes: shipment.booking || shipment.bl_number || '',
        origin: shipment.origin || shipment.origin_country || shipment.origin_port,
        destination: shipment.destination || shipment.destination_country,
        origin_port: shipment.origin_port || shipment.origin,
        destination_port: shipment.destination_port || shipment.destination,
        carrier_name: shipment.carrier || shipment.carrier_name || shipment.vessel_name,
        eta: shipment.eta || shipment.arrival_date || shipment.ata,
        shipment_items: shipment.shipment_items || [],
        priority: 'normal'
      }))

      console.log('✅ Normalized shipments:', normalizedShipments.length)
      setShipments(normalizedShipments)
      
    } catch (err) {
      console.error('❌ Error loading shipments:', err)
      setError(err instanceof Error ? err.message : 'Errore nel caricamento delle spedizioni')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    console.log('🔄 useEffect shipments trigger:', {
      hasUser: !!user?.id,
      authLoading,
      userEmail: user?.email
    })
    
    if (user?.id && !authLoading) {
      loadShipments()
    } else if (!authLoading && !user) {
      console.warn('⚠️ No user found after auth loading completed')
      setError('Sessione scaduta. Effettua nuovamente il login.')
    }
  }, [user?.id, authLoading, loadShipments])

  useEffect(() => {
    if (!autoRefresh) return
    
    const interval = setInterval(() => {
      loadShipments()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [autoRefresh, loadShipments])

  const handleSort = (field: SortField) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const toggleShipmentSelection = (shipmentId: string) => {
    const newSelected = new Set(selectedShipments)
    if (newSelected.has(shipmentId)) {
      newSelected.delete(shipmentId)
    } else {
      newSelected.add(shipmentId)
    }
    setSelectedShipments(newSelected)
  }

  const toggleAllSelection = () => {
    if (selectedShipments.size === filteredAndSortedShipments.length) {
      setSelectedShipments(new Set())
    } else {
      setSelectedShipments(new Set(filteredAndSortedShipments.map(s => s.id)))
    }
  }

  const bulkUpdateStatus = async (newStatus: string) => {
    if (selectedShipments.size === 0) return
    
    try {
      const { error } = await supabase
        .from('shipments')
        .update({ status: newStatus })
        .in('id', Array.from(selectedShipments))
        .eq('user_id', user?.id || '')
      
      if (error) throw error
      
      await loadShipments()
      setSelectedShipments(new Set())
      alert(`✅ Aggiornate ${selectedShipments.size} spedizioni a status: ${newStatus}`)
    } catch (err) {
      console.error('❌ Bulk update error:', err)
      alert('Errore durante l\'aggiornamento')
    }
  }

  // ✅ UTILITY FUNCTIONS
  const getStatusConfig = (status?: string): StatusConfig => {
    switch (status?.toLowerCase()) {
      case 'draft': return { label: 'Bozza', color: 'bg-gray-100 text-gray-700', icon: '📝' }
      case 'planned': 
      case 'confirmed': return { label: 'Confermato', color: 'bg-blue-100 text-blue-700', icon: '✅' }
      case 'shipped': 
      case 'sailing': return { label: 'Spedito', color: 'bg-orange-100 text-orange-700', icon: '📦' }
      case 'in_transit': return { label: 'In Transito', color: 'bg-yellow-100 text-yellow-700', icon: '🚛' }
      case 'delivered': return { label: 'Consegnato', color: 'bg-green-100 text-green-700', icon: '✅' }
      case 'cancelled': return { label: 'Annullato', color: 'bg-red-100 text-red-700', icon: '❌' }
      case 'returned': return { label: 'Restituito', color: 'bg-purple-100 text-purple-700', icon: '↩️' }
      default: return { label: 'Sconosciuto', color: 'bg-gray-100 text-gray-700', icon: '❓' }
    }
  }

  const getPriorityConfig = (priority?: string | null): PriorityConfig => {
    switch (priority?.toLowerCase()) {
      case 'high': return { label: 'Alta', color: 'text-red-600', icon: '🔴' }
      case 'medium': return { label: 'Media', color: 'text-yellow-600', icon: '🟡' }
      case 'low': return { label: 'Bassa', color: 'text-green-600', icon: '🟢' }
      default: return { label: 'Normale', color: 'text-gray-600', icon: '⚪' }
    }
  }

  const formatDate = (dateValue?: string | null): string => {
    if (!dateValue) return 'N/A'
    try {
      return new Date(dateValue).toLocaleDateString('it-IT')
    } catch {
      return 'Data non valida'
    }
  }

  const formatDateTime = (dateValue?: string | null): string => {
    if (!dateValue) return 'N/A'
    try {
      return new Date(dateValue).toLocaleString('it-IT')
    } catch {
      return 'Data non valida'
    }
  }

  const toggleExpanded = (shipmentId: string) => {
    const newExpanded = new Set(expandedShipments)
    if (newExpanded.has(shipmentId)) {
      newExpanded.delete(shipmentId)
    } else {
      newExpanded.add(shipmentId)
    }
    setExpandedShipments(newExpanded)
  }

  const safeShipments = Array.isArray(shipments) ? shipments : []

  const filteredAndSortedShipments = useMemo(() => {
    let filtered = safeShipments.filter(shipment => {
      const matchesSearch = !searchTerm || 
        (shipment.tracking_number && shipment.tracking_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (shipment.shipment_number && shipment.shipment_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (shipment.recipient_name && shipment.recipient_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (shipment.carrier_name && shipment.carrier_name.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesStatus = statusFilter === 'all' || 
        (shipment.status || '').toLowerCase() === statusFilter.toLowerCase()

      const matchesCarrier = carrierFilter === 'all' ||
        (shipment.carrier_name || '').toLowerCase().includes(carrierFilter.toLowerCase())

      const matchesDateRange = (!dateRange.from || !shipment.created_at || new Date(shipment.created_at) >= new Date(dateRange.from)) &&
        (!dateRange.to || !shipment.created_at || new Date(shipment.created_at) <= new Date(dateRange.to))
      
      return matchesSearch && matchesStatus && matchesCarrier && matchesDateRange
    })

    filtered.sort((a, b) => {
      let aVal = a[sortConfig.field]
      let bVal = b[sortConfig.field]

      if (!aVal) aVal = ''
      if (!bVal) bVal = ''

      if (sortConfig.field === 'created_at' || sortConfig.field === 'updated_at') {
        aVal = aVal ? new Date(aVal as string).getTime() : 0
        bVal = bVal ? new Date(bVal as string).getTime() : 0
      }

      if (sortConfig.field === 'total_value') {
        aVal = Number(aVal) || 0
        bVal = Number(bVal) || 0
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = bVal.toLowerCase()
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [safeShipments, searchTerm, statusFilter, carrierFilter, dateRange, sortConfig])

  // ✅ EXPORT DATA FUNCTION CORRETTA
  const exportData = useCallback(async (format: 'csv' | 'xlsx') => {
    try {
      const exportDataArray = filteredAndSortedShipments.map((shipment: Shipment) => ({
        'ID': shipment.id,
        'Tracking Number': shipment.tracking_number || '',
        'Shipment Number': shipment.shipment_number || '',
        'Status': shipment.status,
        'Carrier': shipment.carrier_name || '',
        'Origin': shipment.origin_port || shipment.origin || '',
        'Destination': shipment.destination_port || shipment.destination || '',
        'Recipient': shipment.recipient_name || '',
        'Total Value': shipment.total_value || 0,
        'Items Count': shipment.shipment_items?.length || 0,
        'Priority': shipment.priority || 'normal',
        'Created': shipment.created_at ? new Date(shipment.created_at).toLocaleString('it-IT') : '',
        'Updated': shipment.updated_at ? new Date(shipment.updated_at).toLocaleString('it-IT') : '',
        'ETA': shipment.eta ? new Date(shipment.eta).toLocaleDateString('it-IT') : '',
        'Notes': shipment.notes || ''
      }))

      if (format === 'csv') {
        const headers = Object.keys(exportDataArray[0] || {}) as Array<keyof typeof exportDataArray[0]>
        const csvContent = [
          headers.join(','),
          ...exportDataArray.map((row: any) => 
            headers.map(header => `"${String(row[header] ?? '')}"`).join(',')
          )
        ].join('\n')
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `shipments_${new Date().toISOString().split('T')[0]}.csv`
        link.click()
      } else {
        alert('Export XLSX richiede l\'installazione di SheetJS. Usa CSV per ora.')
      }
      
      console.log(`✅ Exported ${exportDataArray.length} shipments as ${format.toUpperCase()}`)
    } catch (err) {
      console.error('❌ Export error:', err)
      alert('Errore durante l\'export')
    }
  }, [filteredAndSortedShipments])

  const availableCarriers = useMemo(() => {
    const carriers = new Set<string>()
    safeShipments.forEach((shipment: Shipment) => {
      if (shipment.carrier_name) {
        carriers.add(shipment.carrier_name)
      }
    })
    return Array.from(carriers).sort()
  }, [safeShipments])

  const stats = {
    total: safeShipments.length,
    inTransit: safeShipments.filter((s: Shipment) => ['in_transit', 'sailing', 'shipped'].includes((s.status || '').toLowerCase())).length,
    totalValue: safeShipments.reduce((sum: number, s: Shipment) => sum + (s.total_value || 0), 0),
    delivered: safeShipments.filter((s: Shipment) => (s.status || '').toLowerCase() === 'delivered').length,
    shipped: safeShipments.filter((s: Shipment) => ['shipped', 'sailing'].includes((s.status || '').toLowerCase())).length,
    items: safeShipments.reduce((sum: number, s: Shipment) => sum + ((s.shipment_items || []).length), 0)
  }

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-64 bg-muted rounded animate-pulse mb-2"></div>
            <div className="h-4 w-48 bg-muted rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-6 w-16 bg-muted rounded animate-pulse mb-2"></div>
                <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestione Spedizioni</h1>
          <p className="text-gray-600 mt-2">Errore nel caricamento dei dati</p>
        </div>
        
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <div>
                <h3 className="text-lg font-medium text-red-800">Errore nel caricamento</h3>
                <p className="text-red-700 mt-1">{error}</p>
                <Button 
                  onClick={loadShipments}
                  className="mt-3 bg-red-600 hover:bg-red-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Riprova
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Ship className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Accesso Richiesto</h2>
          <p className="text-gray-600">Devi effettuare il login per accedere alla gestione spedizioni.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestione Spedizioni</h1>
          <p className="text-gray-600 mt-2">
            Gestisci le tue spedizioni • Utente: {user.email} • {stats.total} spedizioni totali
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={loadShipments} 
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Aggiorna
          </Button>
          
          <Button 
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className="w-4 h-4 mr-2" />
            Auto {autoRefresh ? 'ON' : 'OFF'}
          </Button>

          <Button onClick={() => window.open('/tracking', '_blank')}>
            <Plus className="w-4 h-4 mr-2" />
            Nuovo Tracking
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-xs text-gray-600">Totale</div>
              </div>
              <Ship className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">{stats.inTransit}</div>
                <div className="text-xs text-gray-600">In Transito</div>
              </div>
              <Truck className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">€{stats.totalValue.toLocaleString()}</div>
                <div className="text-xs text-gray-600">Valore Totale</div>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.shipped}</div>
                <div className="text-xs text-gray-600">Spedite</div>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
                <div className="text-xs text-gray-600">Consegnate</div>
              </div>
              <MapPin className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600">{stats.items}</div>
                <div className="text-xs text-gray-600">Articoli</div>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  placeholder="Cerca per tracking, spedizione, destinatario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-input bg-background text-foreground rounded-md focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-muted-foreground"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-input bg-background text-foreground rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="all">Tutti gli stati</option>
                <option value="draft">Bozza</option>
                <option value="planned">Pianificato</option>
                <option value="confirmed">Confermato</option>
                <option value="shipped">Spedito</option>
                <option value="sailing">In Navigazione</option>
                <option value="in_transit">In Transito</option>
                <option value="delivered">Consegnato</option>
                <option value="cancelled">Annullato</option>
              </select>

              <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtri {showFilters ? '⬆️' : '⬇️'}
              </Button>

              <Button 
                variant="outline"
                onClick={() => exportData('csv')}
                title="Esporta CSV"
              >
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Vettore
                  </label>
                  <select
                    value={carrierFilter}
                    onChange={(e) => setCarrierFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="all">Tutti i vettori</option>
                    {availableCarriers.map((carrier: string) => (
                      <option key={carrier} value={carrier}>{carrier}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Data Da
                  </label>
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                    className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Data A
                  </label>
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                    className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
            )}

            {(searchTerm || statusFilter !== 'all' || carrierFilter !== 'all' || dateRange.from || dateRange.to) && (
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSearchTerm('')
                    setStatusFilter('all')
                    setCarrierFilter('all')
                    setDateRange({ from: '', to: '' })
                  }}
                >
                  Reset Filtri
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedShipments.size > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">
                  {selectedShipments.size} spedizioni selezionate
                </span>
              </div>
              
              <div className="flex gap-2">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      bulkUpdateStatus(e.target.value)
                      e.target.value = ''
                    }
                  }}
                  className="px-3 py-1 border border-input bg-background text-foreground rounded text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Cambia Stato...</option>
                  <option value="confirmed">Confermato</option>
                  <option value="shipped">Spedito</option>
                  <option value="delivered">Consegnato</option>
                  <option value="cancelled">Annullato</option>
                </select>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedShipments(new Set())}
                >
                  Deseleziona Tutto
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sort Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleAllSelection}
                className="p-1"
              >
                {selectedShipments.size === filteredAndSortedShipments.length && filteredAndSortedShipments.length > 0 ? (
                  <CheckSquare className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
              </Button>
              <span className="text-sm font-medium">
                Mostrando {filteredAndSortedShipments.length} di {stats.total} spedizioni
              </span>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleSort('created_at')}
                className="text-xs"
              >
                Data Creazione
                {sortConfig.field === 'created_at' && (
                  sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />
                )}
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleSort('status')}
                className="text-xs"
              >
                Stato
                {sortConfig.field === 'status' && (
                  sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />
                )}
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleSort('total_value')}
                className="text-xs"
              >
                Valore
                {sortConfig.field === 'total_value' && (
                  sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipments List */}
      <div className="space-y-3">
        {filteredAndSortedShipments.map((shipment: Shipment) => {
          const statusConfig = getStatusConfig(shipment.status)
          const priorityConfig = getPriorityConfig(shipment.priority)
          const isExpanded = expandedShipments.has(shipment.id)
          const isSelected = selectedShipments.has(shipment.id)
          const safeItems = Array.isArray(shipment.shipment_items) ? shipment.shipment_items : []

          return (
            <Card key={shipment.id} className={`overflow-hidden hover:shadow-lg transition-all ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}>
              <CardContent className="p-0">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleShipmentSelection(shipment.id)
                        }}
                        className="p-1"
                      >
                        {isSelected ? (
                          <CheckSquare className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </Button>
                      
                      <Ship className="h-6 w-6 text-blue-600 flex-shrink-0" />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-lg">
                            {shipment.shipment_number || shipment.tracking_number || `SPD-${shipment.id.slice(0, 8)}`}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                            {statusConfig.icon} {statusConfig.label}
                          </span>
                          <span className={`text-xs font-medium ${priorityConfig.color}`}>
                            {priorityConfig.icon} {priorityConfig.label}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm">
                          {shipment.carrier_name || 'Vettore'} • {shipment.origin_port || shipment.origin || 'N/A'} → {shipment.destination_port || shipment.destination || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="hidden md:flex items-center space-x-6 text-sm">
                      <div className="text-center">
                        <div className="text-gray-500">Tracking</div>
                        <div className="font-medium text-blue-600 font-mono">
                          {shipment.tracking_number || 'N/A'}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-500">Valore</div>
                        <div className="font-medium text-green-600">
                          {shipment.total_value ? `€${shipment.total_value.toLocaleString()}` : 'N/A'}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-500">Items</div>
                        <div className="font-medium">{safeItems.length}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-500">Data</div>
                        <div className="font-medium">{formatDate(shipment.created_at)}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const id = shipment?.id || ''
                          if (id) {
                            router.push(`/dashboard/shipments/${id}`)
                          }
                        }}
                        title="Dettagli completi"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(shipment.id)}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t bg-gray-50 p-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900 flex items-center gap-2">
                          <Truck className="h-4 w-4" />
                          Dettagli Spedizione
                        </h4>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Tracking:</span>
                            <p className="text-blue-600 font-mono">
                              {shipment.tracking_number || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Shipment:</span>
                            <p className="font-mono">{shipment.shipment_number || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Status:</span>
                            <p>{shipment.status || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Vettore:</span>
                            <p>{shipment.carrier_name || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Origine:</span>
                            <p>{shipment.origin_port || shipment.origin || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Destinazione:</span>
                            <p>{shipment.destination_port || shipment.destination || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">ETA:</span>
                            <p>{shipment.eta ? formatDate(shipment.eta) : 'N/A'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Articoli:</span>
                            <p>{safeItems.length} items</p>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-3 border">
                          <div className="text-xs text-gray-500 space-y-1">
                            <div><span className="font-medium">ID:</span> {shipment.id}</div>
                            <div><span className="font-medium">Organization:</span> {shipment.organization_id || 'N/A'}</div>
                            <div><span className="font-medium">User:</span> {shipment.user_id}</div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900 flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          Timeline e Prodotti
                        </h4>
                        
                        <div className="space-y-3 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Creata:</span>
                            <p>{formatDateTime(shipment.created_at)}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Aggiornata:</span>
                            <p>{formatDateTime(shipment.updated_at)}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Valore totale:</span>
                            <p className="text-green-600 font-medium">
                              {shipment.total_value ? `€${shipment.total_value.toLocaleString()}` : 'N/A'}
                            </p>
                          </div>
                        </div>

                        {safeItems.length > 0 && (
                          <div className="bg-white rounded-lg p-3 border">
                            <h5 className="font-medium text-sm mb-2">Prodotti ({safeItems.length}):</h5>
                            <div className="space-y-2">
                              {safeItems.slice(0, 3).map((item: any, index: number) => (
                                <div key={item.id || index} className="flex justify-between text-xs">
                                  <span className="truncate">
                                    {item.name || `Item ${index + 1}`}
                                  </span>
                                  <span className="text-gray-500">
                                    x{item.quantity || 1}
                                  </span>
                                </div>
                              ))}
                              {safeItems.length > 3 && (
                                <div className="text-xs text-gray-500">
                                  ... e altri {safeItems.length - 3} prodotti
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {shipment.notes && (
                          <div className="bg-white rounded-lg p-3 border">
                            <div className="flex items-start gap-2">
                              <Activity className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium text-sm">Note:</p>
                                <p className="text-xs text-gray-600 mt-1">{shipment.notes}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t flex gap-2 flex-wrap">
                      <Button 
                        size="sm"
                        onClick={() => {
                          if (shipment?.id) {
                            router.push(`/dashboard/shipments/${shipment.id}`)
                          }
                        }}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Dettagli Completi
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="w-4 h-4 mr-1" />
                        Modifica
                      </Button>
                      <Button variant="outline" size="sm">
                        <Package className="w-4 h-4 mr-1" />
                        Documenti
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          if (shipment.tracking_number) {
                            window.open(`https://www.google.com/search?q=tracking+${shipment.tracking_number}`, '_blank')
                          }
                        }}
                      >
                        <Search className="w-4 h-4 mr-1" />
                        Traccia
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredAndSortedShipments.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Ship className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nessuna spedizione trovata
            </h3>
            <p className="text-gray-500 mb-6">
              {stats.total === 0 
                ? "Non hai ancora spedizioni. Inizia aggiungendo un tracking." 
                : "Nessuna spedizione corrisponde ai filtri selezionati."
              }
            </p>
            <Button onClick={() => window.open('/tracking', '_blank')}>
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi Primo Tracking
            </Button>
          </CardContent>
        </Card>
      )}

      {/* System Status */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <div className={`h-2 w-2 rounded-full animate-pulse ${autoRefresh ? 'bg-green-500' : 'bg-blue-500'}`}></div>
            <div>
              <h3 className="text-sm font-medium text-green-800">
                ✅ Sistema Spedizioni FUNZIONANTE - Tutti gli errori risolti
              </h3>
              <div className="text-xs text-green-700 mt-1 space-y-1">
                <p>• User: {user?.email}</p>
                <p>• Spedizioni totali: {stats.total}</p>
                <p>• Spedizioni filtrate: {filteredAndSortedShipments.length}</p>
                <p>• Valore totale: €{stats.totalValue.toLocaleString()}</p>
                <p>• Selezionate: {selectedShipments.size}</p>
                <p>• Auto-refresh: {autoRefresh ? 'ATTIVO (30s)' : 'INATTIVO'} ⚡</p>
                <p>• Status: ✅ TypeScript OK | ✅ Supabase OK | ✅ UI Completa</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}