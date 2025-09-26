// ✅ UNIFIED SERVICE - SOLO CLIENT-SIDE CON API CALLS

import { Shipment, ShipmentProduct, ShipmentDocument, ShipmentCost } from '@/types/shipment'
import { createClient } from '@/utils/supabase/client'

const API_BASE_URL = '/api/shipments'

// ✅ AUTHENTICATED API SERVICE - DINAMICO E SICURO
class AuthenticatedApiService {
  private supabase = createClient()

  // Ottieni il token di autenticazione corrente
  private async getAuthToken(): Promise<string | null> {
    const { data: { session } } = await this.supabase.auth.getSession()
    return session?.access_token || null
  }

  // Ottieni l'utente autenticato
  async getCurrentUser() {
    const { data: { user }, error } = await this.supabase.auth.getUser()
    
    if (error || !user) {
      throw new Error('User not authenticated')
    }

    return user
  }

  // Headers dinamici con autenticazione
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getAuthToken()
    
    if (!token) {
      throw new Error('No authentication token available')
    }

    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  // GET con autenticazione
  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = await this.getAuthHeaders()
    
    return fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {})
      }
    })
  }

  // POST/PUT con autenticazione
  async authenticatedFetchWithBody(url: string, method: string, body: any): Promise<Response> {
    const headers = await this.getAuthHeaders()
    
    return fetch(url, {
      method,
      headers,
      body: JSON.stringify(body)
    })
  }
}

// Istanza singleton del servizio autenticato
const authService = new AuthenticatedApiService()

// ✅ SHIPMENTS CRUD - COMPLETAMENTE DINAMICO

export async function getAllShipments(): Promise<Shipment[]> {
  try {
    console.log('🚀 getAllShipments - Dynamic auth')
    
    const response = await authService.authenticatedFetch(API_BASE_URL)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch shipments`)
    }
    
    const result = await response.json()
    console.log('✅ Shipments fetched dynamically:', result.count || result.data?.length || 0)
    
    return result.success ? result.data : []
  } catch (error) {
    console.error('❌ Error fetching shipments:', error)
    throw error
  }
}

export async function getShipmentById(id: string): Promise<Shipment | null> {
  try {
    console.log('🚀 getShipmentById - Dynamic auth for ID:', id)
    
    const response = await authService.authenticatedFetch(`${API_BASE_URL}/${id}`)
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log('⚠️ Shipment not found:', id)
        return null
      }
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch shipment details`)
    }
    
    const result = await response.json()
    console.log('✅ Shipment details fetched dynamically')
    
    return result.success ? result.data : null
  } catch (error) {
    console.error('❌ Error fetching shipment details:', error)
    throw error
  }
}

export async function createShipment(shipment: Omit<Shipment, 'id' | 'created_at' | 'updated_at'>): Promise<Shipment | null> {
  try {
    console.log('🚀 createShipment - Dynamic auth')
    
    const response = await authService.authenticatedFetchWithBody(API_BASE_URL, 'POST', shipment)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${response.status}: Failed to create shipment`)
    }
    
    const result = await response.json()
    console.log('✅ Shipment created dynamically:', result.data?.id)
    
    return result.success ? result.data : null
  } catch (error) {
    console.error('❌ Error creating shipment:', error)
    throw error
  }
}

export async function updateShipment(id: string, shipment: Partial<Shipment>): Promise<Shipment | null> {
  try {
    console.log('🚀 updateShipment - Dynamic auth for ID:', id)
    
    const response = await authService.authenticatedFetchWithBody(`${API_BASE_URL}/${id}`, 'PUT', shipment)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${response.status}: Failed to update shipment`)
    }
    
    const result = await response.json()
    console.log('✅ Shipment updated dynamically:', result.data?.id)
    
    return result.success ? result.data : null
  } catch (error) {
    console.error('❌ Error updating shipment:', error)
    throw error
  }
}

export async function deleteShipment(id: string): Promise<void> {
  try {
    console.log('🚀 deleteShipment - Dynamic auth for ID:', id)
    
    const response = await authService.authenticatedFetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${response.status}: Failed to delete shipment`)
    }
    
    console.log('✅ Shipment deleted dynamically:', id)
  } catch (error) {
    console.error('❌ Error deleting shipment:', error)
    throw error
  }
}

// ✅ SHIPMENT PRODUCTS - GESTIONE ITEMS

export async function getShipmentProducts(shipmentId: string): Promise<ShipmentProduct[]> {
  try {
    console.log('🚀 getShipmentProducts for shipment:', shipmentId)
    
    const response = await authService.authenticatedFetch(`${API_BASE_URL}/${shipmentId}/products`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch shipment products')
    }
    
    const result = await response.json()
    return result.success ? result.data : []
  } catch (error) {
    console.error('❌ Error fetching shipment products:', error)
    throw error
  }
}

export async function addProductToShipment(shipmentId: string, product: Omit<ShipmentProduct, 'id' | 'shipment_id'>): Promise<ShipmentProduct | null> {
  try {
    console.log('🚀 addProductToShipment:', shipmentId, product)
    
    const response = await authService.authenticatedFetchWithBody(`${API_BASE_URL}/${shipmentId}/products`, 'POST', product)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Failed to add product to shipment')
    }
    
    const result = await response.json()
    console.log('✅ Product added to shipment:', result.data?.id)
    return result.success ? result.data : null
  } catch (error) {
    console.error('❌ Error adding product to shipment:', error)
    throw error
  }
}

export async function updateShipmentProduct(shipmentId: string, productId: string, product: Partial<ShipmentProduct>): Promise<ShipmentProduct | null> {
  try {
    console.log('🚀 updateShipmentProduct:', shipmentId, productId)
    
    const response = await authService.authenticatedFetchWithBody(`${API_BASE_URL}/${shipmentId}/products/${productId}`, 'PUT', product)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Failed to update shipment product')
    }
    
    const result = await response.json()
    console.log('✅ Shipment product updated:', result.data?.id)
    return result.success ? result.data : null
  } catch (error) {
    console.error('❌ Error updating shipment product:', error)
    throw error
  }
}

export async function removeProductFromShipment(shipmentId: string, productId: string): Promise<void> {
  try {
    console.log('🚀 removeProductFromShipment:', shipmentId, productId)
    
    const response = await authService.authenticatedFetch(`${API_BASE_URL}/${shipmentId}/products/${productId}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Failed to remove product from shipment')
    }
    
    console.log('✅ Product removed from shipment:', productId)
  } catch (error) {
    console.error('❌ Error removing product from shipment:', error)
    throw error
  }
}

// ✅ SHIPMENT DOCUMENTS - GESTIONE DOCUMENTI

export async function getShipmentDocuments(shipmentId: string): Promise<ShipmentDocument[]> {
  try {
    console.log('🚀 getShipmentDocuments for shipment:', shipmentId)
    
    const response = await authService.authenticatedFetch(`${API_BASE_URL}/${shipmentId}/documents`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch shipment documents')
    }
    
    const result = await response.json()
    return result.success ? result.data : []
  } catch (error) {
    console.error('❌ Error fetching shipment documents:', error)
    throw error
  }
}

export async function uploadShipmentDocument(shipmentId: string, file: File, documentType: string): Promise<ShipmentDocument | null> {
  try {
    console.log('🚀 uploadShipmentDocument:', shipmentId, file.name, documentType)
    
    // Per i file, usiamo FormData e token separato
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.access_token) {
      throw new Error('No authentication token available')
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('document_type', documentType)

    const response = await fetch(`${API_BASE_URL}/${shipmentId}/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
        // NON includere Content-Type per FormData
      },
      body: formData,
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Failed to upload document')
    }
    
    const result = await response.json()
    console.log('✅ Document uploaded:', result.data?.id)
    return result.success ? result.data : null
  } catch (error) {
    console.error('❌ Error uploading document:', error)
    throw error
  }
}

export async function deleteShipmentDocument(shipmentId: string, documentId: string): Promise<void> {
  try {
    console.log('🚀 deleteShipmentDocument:', shipmentId, documentId)
    
    const response = await authService.authenticatedFetch(`${API_BASE_URL}/${shipmentId}/documents/${documentId}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Failed to delete document')
    }
    
    console.log('✅ Document deleted:', documentId)
  } catch (error) {
    console.error('❌ Error deleting document:', error)
    throw error
  }
}

// ✅ SHIPMENT COSTS - GESTIONE COSTI

export async function getShipmentCosts(shipmentId: string): Promise<ShipmentCost[]> {
  try {
    console.log('🚀 getShipmentCosts for shipment:', shipmentId)
    
    const response = await authService.authenticatedFetch(`${API_BASE_URL}/${shipmentId}/costs`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch shipment costs')
    }
    
    const result = await response.json()
    return result.success ? result.data : []
  } catch (error) {
    console.error('❌ Error fetching shipment costs:', error)
    throw error
  }
}

export async function addShipmentCost(shipmentId: string, cost: Omit<ShipmentCost, 'id' | 'shipment_id'>): Promise<ShipmentCost | null> {
  try {
    console.log('🚀 addShipmentCost:', shipmentId, cost)
    
    const response = await authService.authenticatedFetchWithBody(`${API_BASE_URL}/${shipmentId}/costs`, 'POST', cost)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Failed to add shipment cost')
    }
    
    const result = await response.json()
    console.log('✅ Shipment cost added:', result.data?.id)
    return result.success ? result.data : null
  } catch (error) {
    console.error('❌ Error adding shipment cost:', error)
    throw error
  }
}

export async function updateShipmentCost(shipmentId: string, costId: string, cost: Partial<ShipmentCost>): Promise<ShipmentCost | null> {
  try {
    console.log('🚀 updateShipmentCost:', shipmentId, costId)
    
    const response = await authService.authenticatedFetchWithBody(`${API_BASE_URL}/${shipmentId}/costs/${costId}`, 'PUT', cost)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Failed to update shipment cost')
    }
    
    const result = await response.json()
    console.log('✅ Shipment cost updated:', result.data?.id)
    return result.success ? result.data : null
  } catch (error) {
    console.error('❌ Error updating shipment cost:', error)
    throw error
  }
}

export async function deleteShipmentCost(shipmentId: string, costId: string): Promise<void> {
  try {
    console.log('🚀 deleteShipmentCost:', shipmentId, costId)
    
    const response = await authService.authenticatedFetch(`${API_BASE_URL}/${shipmentId}/costs/${costId}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Failed to delete shipment cost')
    }
    
    console.log('✅ Shipment cost deleted:', costId)
  } catch (error) {
    console.error('❌ Error deleting shipment cost:', error)
    throw error
  }
}

// ✅ UTILITY FUNCTIONS - STATUS E HELPER

export function normalizeStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'delivered': 'delivered',
    'in_transit': 'in_transit', 
    'IN_TRANSIT': 'in_transit',
    'SAILING': 'in_transit',
    'DISCHARGED': 'delivered',
    'planned': 'pending',
    'pending': 'pending',
    'draft': 'draft',
    'confirmed': 'confirmed',
    'shipped': 'shipped',
    'cancelled': 'cancelled',
    'returned': 'returned'
  }
  
  return statusMap[status] || status.toLowerCase()
}

export function getStatusConfig(status?: string) {
  if (!status) {
    return { 
      label: 'Sconosciuto', 
      color: 'bg-gray-100 text-gray-800', 
      icon: '❓' 
    }
  }
  
  const normalizedStatus = normalizeStatus(status)
  
  switch (normalizedStatus) {
    case 'delivered': return { 
      label: 'Consegnato', 
      color: 'bg-green-100 text-green-800', 
      icon: '✅' 
    }
    case 'in_transit': return { 
      label: 'In Transito', 
      color: 'bg-blue-100 text-blue-800', 
      icon: '🚢' 
    }
    case 'delayed': return { 
      label: 'In Ritardo', 
      color: 'bg-red-100 text-red-800', 
      icon: '⚠️' 
    }
    case 'pending': return { 
      label: 'In Attesa', 
      color: 'bg-yellow-100 text-yellow-800', 
      icon: '⏳' 
    }
    case 'cancelled': return { 
      label: 'Annullato', 
      color: 'bg-gray-100 text-gray-800', 
      icon: '❌' 
    }
    default: return { 
      label: status, 
      color: 'bg-gray-100 text-gray-800', 
      icon: '❓' 
    }
  }
}

// ✅ COMPATIBILITY EXPORTS - Per retrocompatibilità

// Alias per i nomi vecchi
export const getShipmentDetails = getShipmentById

// Legacy service object
export const shipmentsService = {
  getShipments: getAllShipments,
  getShipment: getShipmentById,
  createShipment,
  updateShipment,
  deleteShipment
}

// Legacy class-style exports per compatibilità con codice esistente
export class ShipmentService {
  static async getAll() {
    return getAllShipments()
  }
  
  static async getById(id: string) {
    return getShipmentById(id)
  }
  
  static async create(data: any) {
    return createShipment(data)
  }
  
  static async update(id: string, data: any) {
    return updateShipment(id, data)
  }
  
  static async delete(id: string) {
    return deleteShipment(id)
  }
  
  static async addProduct(shipmentId: string, product: any) {
    return addProductToShipment(shipmentId, product)
  }
  
  static async removeProduct(shipmentId: string, productId: string) {
    return removeProductFromShipment(shipmentId, productId)
  }
}

// Default export
export default ShipmentService

// Export dell'auth service per uso avanzato
export { authService as AuthService }