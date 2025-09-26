// Sistema di allocazione costi automatica basato sul vecchio progetto
// Implementa la logica di allocazione costi per trasporto in base al tipo

export interface ShipmentProduct {
  id: string;
  quantity: number;
  total_weight_kg?: number | null;
  total_volume_cbm?: number | null;
  unit_cost?: number | null;
  total_cost?: number | null;
}

export interface CostAllocationResult {
  unitCost: number;
  allocatedCosts: Record<string, number>;
  method: string;
  totalBasis: number;
}

export interface Shipment {
  freight_cost?: number;
  other_costs?: number;
  transport_mode?: string;
  carrier_name?: string;
  carrier?: string;
  tracking?: {
    transport_modes?: {
      name?: string;
    };
  };
}

/**
 * Rileva automaticamente il tipo di trasporto dal tracking, carrier o dal campo transport_mode
 */
export function detectTransportMode(shipment: Shipment): string {
  // Prima controlla il transport_mode dal tracking
  let transportMode = shipment.tracking?.transport_modes?.name || shipment.transport_mode || '';

  // Se non trovato, prova a dedurlo dal carrier_name
  const carrier = (shipment.carrier_name || shipment.carrier || '').toLowerCase();

  // Lista di carrier aerei conosciuti
  const airCarriers = ['air', 'airlines', 'cargo', 'fedex', 'ups', 'dhl express', 'tnt', 'emirates', 'lufthansa', 'cathay', 'singapore airlines', 'qatar'];
  const seaCarriers = ['maersk', 'msc', 'cma cgm', 'cosco', 'hapag', 'evergreen', 'one', 'yang ming', 'zim', 'pil'];

  if (!transportMode || transportMode === 'manual') {
    // Determina dal nome del carrier
    if (airCarriers.some(ac => carrier.includes(ac))) {
      transportMode = 'air';
    } else if (seaCarriers.some(sc => carrier.includes(sc))) {
      transportMode = 'sea';
    } else if (carrier) {
      // Se c'è un carrier ma non riconosciuto, cerca indizi nel nome
      if (carrier.includes('air') || carrier.includes('cargo') || carrier.includes('express')) {
        transportMode = 'air';
      } else if (carrier.includes('line') || carrier.includes('shipping') || carrier.includes('maritime')) {
        transportMode = 'sea';
      }
    }
  }

  // Se ancora non determinato, usa 'manual'
  transportMode = transportMode || 'manual';

  console.log('🚛 Transport mode detected:', transportMode, 'from carrier:', shipment.carrier_name);
  return transportMode;
}

/**
 * Calcola l'allocazione dei costi di trasporto ai prodotti
 * Basato sulla logica del vecchio progetto
 */
export function calculateTransportCosts(
  shipment: Shipment,
  products: ShipmentProduct[]
): CostAllocationResult {
  const freightCost = shipment.freight_cost || 0;
  const otherCosts = shipment.other_costs || 0;
  const totalShipmentCosts = freightCost + otherCosts;

  if (totalShipmentCosts === 0 || products.length === 0) {
    return { unitCost: 0, allocatedCosts: {}, method: 'none', totalBasis: 0 };
  }

  // Determina il tipo di trasporto
  const transportMode = detectTransportMode(shipment);

  let totalBasis = 0;
  let allocationMethod = 'equal'; // Default fallback

  // Logica specifica per tipo di trasporto
  if (transportMode.toLowerCase().includes('mare') ||
      transportMode.toLowerCase().includes('sea') ||
      transportMode.toLowerCase().includes('ocean')) {

    // 🚢 SPEDIZIONI MARITTIME: Solo CBM
    allocationMethod = 'volume';
    totalBasis = products.reduce((sum, p) => sum + (p.total_volume_cbm || 0), 0);
    console.log('🚢 Maritime shipping: using CBM only, total:', totalBasis);

  } else if (transportMode.toLowerCase().includes('aer') ||
             transportMode.toLowerCase().includes('air') ||
             transportMode.toLowerCase().includes('cargo') ||
             transportMode.toLowerCase().includes('china')) {

    // ✈️ SPEDIZIONI AEREE: Peso vs Volume con coefficiente 1:167
    allocationMethod = 'weight_volume_max';
    const totalWeight = products.reduce((sum, p) => sum + (p.total_weight_kg || 0), 0);
    const totalVolume = products.reduce((sum, p) => sum + (p.total_volume_cbm || 0), 0);
    const volumetricWeight = totalVolume * 167; // Coefficiente 1:167kg per CBM

    totalBasis = Math.max(totalWeight, volumetricWeight);
    console.log('✈️ Air shipping:', {
      totalWeight,
      totalVolume,
      volumetricWeight,
      selectedBasis: totalBasis,
      method: totalWeight > volumetricWeight ? 'actual_weight' : 'volumetric_weight'
    });

  } else {

    // 🚛 SPEDIZIONI MANUALI/STRADALI: Usa il campo disponibile
    allocationMethod = 'flexible';
    const totalWeight = products.reduce((sum, p) => sum + (p.total_weight_kg || 0), 0);
    const totalVolume = products.reduce((sum, p) => sum + (p.total_volume_cbm || 0), 0);

    if (totalVolume > 0 && totalWeight > 0) {
      // Entrambi disponibili: usa il volume (preferenza arbitraria)
      totalBasis = totalVolume;
      allocationMethod = 'volume';
    } else if (totalVolume > 0) {
      // Solo volume disponibile
      totalBasis = totalVolume;
      allocationMethod = 'volume';
    } else if (totalWeight > 0) {
      // Solo peso disponibile
      totalBasis = totalWeight;
      allocationMethod = 'weight';
    } else {
      // Nessun dato: distribuzione equa
      totalBasis = products.length;
      allocationMethod = 'equal';
    }

    console.log('🚛 Manual/Road shipping:', {
      totalWeight,
      totalVolume,
      selectedBasis: totalBasis,
      method: allocationMethod
    });
  }

  // Fallback: Se non c'è base per il calcolo, distribuisci equamente
  if (totalBasis === 0) {
    console.warn('⚠️ No basis for cost allocation, using equal distribution');
    const unitCost = totalShipmentCosts / products.length;
    const allocatedCosts: Record<string, number> = {};
    products.forEach(p => {
      allocatedCosts[p.id] = unitCost;
    });
    return { unitCost, allocatedCosts, method: 'equal_fallback', totalBasis: products.length };
  }

  // Calcola il costo unitario e alloca ai prodotti
  const costPerUnit = totalShipmentCosts / totalBasis;
  const allocatedCosts: Record<string, number> = {};

  products.forEach(product => {
    let productBasis = 0;

    switch (allocationMethod) {
      case 'volume':
        productBasis = product.total_volume_cbm || 0;
        break;

      case 'weight':
        productBasis = product.total_weight_kg || 0;
        break;

      case 'weight_volume_max':
        const productWeight = product.total_weight_kg || 0;
        const productVolume = product.total_volume_cbm || 0;
        const productVolumetricWeight = productVolume * 167;
        productBasis = Math.max(productWeight, productVolumetricWeight);
        break;

      case 'flexible':
        // Per spedizioni manuali, usa quello che è disponibile
        if ((product.total_volume_cbm || 0) > 0 && (product.total_weight_kg || 0) > 0) {
          productBasis = product.total_volume_cbm; // Preferenza volume
        } else if ((product.total_volume_cbm || 0) > 0) {
          productBasis = product.total_volume_cbm;
        } else if ((product.total_weight_kg || 0) > 0) {
          productBasis = product.total_weight_kg;
        } else {
          productBasis = 1; // Fallback per distribuzione equa
        }
        break;

      default:
        productBasis = 1;
        break;
    }

    allocatedCosts[product.id] = costPerUnit * productBasis;
  });

  console.log('💰 Transport cost allocation completed:', {
    method: allocationMethod,
    totalBasis,
    costPerUnit: costPerUnit.toFixed(4),
    totalAllocated: Object.values(allocatedCosts).reduce((sum, cost) => sum + cost, 0).toFixed(2)
  });

  return {
    unitCost: costPerUnit,
    allocatedCosts,
    method: allocationMethod,
    totalBasis
  };
}

/**
 * Aggiorna i prodotti con i costi di trasporto allocati
 */
export function updateProductsWithTransportCosts(
  products: ShipmentProduct[],
  allocation: CostAllocationResult
): ShipmentProduct[] {
  return products.map(product => {
    const allocatedCost = allocation.allocatedCosts[product.id] || 0;
    const transportUnitCost = product.quantity > 0 ? allocatedCost / product.quantity : 0;

    return {
      ...product,
      transport_unit_cost: transportUnitCost,
      transport_total_cost: allocatedCost
    };
  });
}