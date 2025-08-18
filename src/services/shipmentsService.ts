import { Shipment, ShipmentProduct, ShipmentDocument, ShipmentCost } from '@/types/shipment';

const API_BASE_URL = '/api/shipments';

export async function getAllShipments(): Promise<Shipment[]> {
  try {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch shipments');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching shipments:', error);
    throw error;
  }
}

export async function getShipmentDetails(id: string): Promise<Shipment> {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch shipment details');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching shipment details:', error);
    throw error;
  }
}

export async function createShipment(shipment: Omit<Shipment, 'id' | 'created_at' | 'updated_at'>): Promise<Shipment> {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(shipment),
    });
    if (!response.ok) {
      throw new Error('Failed to create shipment');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating shipment:', error);
    throw error;
  }
}

export async function updateShipment(id: string, shipment: Partial<Shipment>): Promise<Shipment> {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(shipment),
    });
    if (!response.ok) {
      throw new Error('Failed to update shipment');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating shipment:', error);
    throw error;
  }
}

export async function deleteShipment(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete shipment');
    }
  } catch (error) {
    console.error('Error deleting shipment:', error);
    throw error;
  }
}

// Funzioni per i prodotti della spedizione
export async function getShipmentProducts(shipmentId: string): Promise<ShipmentProduct[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/${shipmentId}/products`);
    if (!response.ok) {
      throw new Error('Failed to fetch shipment products');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching shipment products:', error);
    throw error;
  }
}

export async function addProductToShipment(shipmentId: string, product: Omit<ShipmentProduct, 'id' | 'shipment_id'>): Promise<ShipmentProduct> {
  try {
    const response = await fetch(`${API_BASE_URL}/${shipmentId}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    });
    if (!response.ok) {
      throw new Error('Failed to add product to shipment');
    }
    return await response.json();
  } catch (error) {
    console.error('Error adding product to shipment:', error);
    throw error;
  }
}

export async function removeProductFromShipment(shipmentId: string, linkId: string): Promise<void> {
  try {
    const response = await fetch(`/api/shipments/${shipmentId}/products/${linkId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to remove product from shipment');
    }
  } catch (error) {
    console.error('Error removing product from shipment:', error);
    throw error;
  }
}

// Funzioni per i documenti
export async function getShipmentDocuments(shipmentId: string): Promise<ShipmentDocument[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/${shipmentId}/documents`);
    if (!response.ok) {
      throw new Error('Failed to fetch shipment documents');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching shipment documents:', error);
    throw error;
  }
}

export async function uploadShipmentDocument(shipmentId: string, file: File, documentType: string): Promise<ShipmentDocument> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);

    const response = await fetch(`${API_BASE_URL}/${shipmentId}/documents`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      throw new Error('Failed to upload document');
    }
    return await response.json();
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
}

export async function deleteShipmentDocument(shipmentId: string, documentId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/${shipmentId}/documents/${documentId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete document');
    }
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
}

// Funzioni per i costi
export async function getShipmentCosts(shipmentId: string): Promise<ShipmentCost[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/${shipmentId}/costs`);
    if (!response.ok) {
      throw new Error('Failed to fetch shipment costs');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching shipment costs:', error);
    throw error;
  }
}

export async function addShipmentCost(shipmentId: string, cost: Omit<ShipmentCost, 'id' | 'shipment_id'>): Promise<ShipmentCost> {
  try {
    const response = await fetch(`${API_BASE_URL}/${shipmentId}/costs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cost),
    });
    if (!response.ok) {
      throw new Error('Failed to add shipment cost');
    }
    return await response.json();
  } catch (error) {
    console.error('Error adding shipment cost:', error);
    throw error;
  }
}

export async function updateShipmentCost(shipmentId: string, costId: string, cost: Partial<ShipmentCost>): Promise<ShipmentCost> {
  try {
    const response = await fetch(`${API_BASE_URL}/${shipmentId}/costs/${costId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cost),
    });
    if (!response.ok) {
      throw new Error('Failed to update shipment cost');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating shipment cost:', error);
    throw error;
  }
}

export async function deleteShipmentCost(shipmentId: string, costId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/${shipmentId}/costs/${costId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete shipment cost');
    }
  } catch (error) {
    console.error('Error deleting shipment cost:', error);
    throw error;
  }
}