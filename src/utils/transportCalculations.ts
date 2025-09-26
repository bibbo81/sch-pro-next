export interface ContainerSpecs {
  type: string
  maxWeight: number // kg
  maxVolume: number // m³
}

export const CONTAINER_SPECS: Record<string, ContainerSpecs> = {
  // Container Marittimi
  '20ft': { type: '20ft Container', maxWeight: 28230, maxVolume: 33.2 },
  '40ft': { type: '40ft Container', maxWeight: 26700, maxVolume: 67.7 },
  '40ft_hc': { type: '40ft HC Container', maxWeight: 26700, maxVolume: 76.3 },
  '45ft_hc': { type: '45ft HC Container', maxWeight: 29000, maxVolume: 86.0 },
  
  // Truck
  'truck_standard': { type: 'Truck Standard', maxWeight: 24000, maxVolume: 100.0 },
  'truck_mega': { type: 'Truck Mega', maxWeight: 24000, maxVolume: 120.0 },
  
  // Aereo
  'air_cargo': { type: 'Cargo Aereo', maxWeight: 50000, maxVolume: 200.0 },
  'air_express': { type: 'Express Aereo', maxWeight: 10000, maxVolume: 50.0 }
}

export const TRANSPORT_MODES = {
  sea: 'Marittimo',
  road: 'Stradale', 
  air: 'Aereo',
  rail: 'Ferroviario'
}

export interface UsageCalculation {
  weightUsage: number
  volumeUsage: number
  weightPercentage: number
  volumePercentage: number
  isOverweight: boolean
  isOvervolume: boolean
  maxWeight: number
  maxVolume: number
}

export function calculateContainerUsage(
  containerType: string,
  totalWeight: number,
  totalVolume: number
): UsageCalculation {
  const specs = CONTAINER_SPECS[containerType]
  
  if (!specs) {
    return {
      weightUsage: totalWeight,
      volumeUsage: totalVolume,
      weightPercentage: 0,
      volumePercentage: 0,
      isOverweight: false,
      isOvervolume: false,
      maxWeight: 0,
      maxVolume: 0
    }
  }

  const weightPercentage = (totalWeight / specs.maxWeight) * 100
  const volumePercentage = (totalVolume / specs.maxVolume) * 100

  return {
    weightUsage: totalWeight,
    volumeUsage: totalVolume,
    weightPercentage,
    volumePercentage,
    isOverweight: totalWeight > specs.maxWeight,
    isOvervolume: totalVolume > specs.maxVolume,
    maxWeight: specs.maxWeight,
    maxVolume: specs.maxVolume
  }
}