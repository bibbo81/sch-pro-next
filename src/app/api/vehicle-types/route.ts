// src/app/api/vehicle-types/route.ts
import { NextRequest, NextResponse } from 'next/server'

// 🎯 Definisci i tipi TypeScript
interface VehicleType {
  id: string
  name: string
  code: string
  default_kg: string
  default_cbm: string
  max_kg: string
  max_cbm: string
}

type VehicleTypesByMode = {
  [key: string]: VehicleType[]
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const transportModeId = searchParams.get('transport_mode_id')

    const allVehicleTypes: VehicleTypesByMode = {
      '1': [ // Marittimo - TERMINOLOGIA TECNICA CONTAINER
        { 
          id: '1', 
          name: "TEU 20' Dry Van (DV)", 
          code: '20DV',
          default_kg: '21600',
          default_cbm: '33.2',
          max_kg: '24000',
          max_cbm: '33.2'
        },
        { 
          id: '2', 
          name: "FEU 40' Dry Van (DV)", 
          code: '40DV',
          default_kg: '26680',
          default_cbm: '67.7',
          max_kg: '30480',
          max_cbm: '67.7'
        },
        { 
          id: '3', 
          name: "FEU 40' High Cube (HC)", 
          code: '40HC',
          default_kg: '26580',
          default_cbm: '76.4',
          max_kg: '30480',
          max_cbm: '76.4'
        },
        { 
          id: '4', 
          name: "TEU 20' Reefer (RF)", 
          code: '20RF',
          default_kg: '18000',
          default_cbm: '28.3',
          max_kg: '21600',
          max_cbm: '28.3'
        },
        { 
          id: '5', 
          name: "FEU 40' Reefer (RF)", 
          code: '40RF',
          default_kg: '22000',
          default_cbm: '59.3',
          max_kg: '26000',
          max_cbm: '59.3'
        },
        {
          id: '6',
          name: "Open Top 20' (OT)",
          code: '20OT',
          default_kg: '20000',
          default_cbm: '32.0',
          max_kg: '24000',
          max_cbm: '32.0'
        },
        {
          id: '7',
          name: "Flat Rack 40' (FR)",
          code: '40FR',
          default_kg: '28000',
          default_cbm: '50.0',
          max_kg: '45000',
          max_cbm: '50.0'
        },
        {
          id: '8',
          name: "Tank Container 20' (TK)",
          code: '20TK',
          default_kg: '24000',
          default_cbm: '26.0',
          max_kg: '30480',
          max_cbm: '26.0'
        }
      ],
      '2': [ // Aereo - TERMINOLOGIA TECNICA CARGO AEREO
        {
          id: '9',
          name: 'AWB Express Document',
          code: 'DOC',
          default_kg: '0.5',
          default_cbm: '0.001',
          max_kg: '2',
          max_cbm: '0.005'
        },
        {
          id: '10',
          name: 'AWB Express Package',
          code: 'PKG',
          default_kg: '5',
          default_cbm: '0.05',
          max_kg: '70',
          max_cbm: '0.3'
        },
        {
          id: '11',
          name: 'ULD (Unit Load Device)',
          code: 'ULD',
          default_kg: '1500',
          default_cbm: '10',
          max_kg: '6800',
          max_cbm: '20'
        },
        {
          id: '12',
          name: 'PMC (Prebuilt Metal Container)',
          code: 'PMC',
          default_kg: '3000',
          default_cbm: '15',
          max_kg: '6800',
          max_cbm: '20'
        },
        {
          id: '13',
          name: 'AKE Container',
          code: 'AKE',
          default_kg: '1500',
          default_cbm: '4.2',
          max_kg: '1588',
          max_cbm: '4.2'
        },
        {
          id: '14',
          name: 'Main Deck Cargo',
          code: 'MDC',
          default_kg: '5000',
          default_cbm: '25',
          max_kg: '20000',
          max_cbm: '100'
        }
      ],
      '3': [ // Stradale - TERMINOLOGIA TECNICA AUTOTRASPORTO
        {
          id: '15',
          name: 'Veicolo Commerciale Leggero (N1)',
          code: 'VCL_N1',
          default_kg: '800',
          default_cbm: '10',
          max_kg: '3500',
          max_cbm: '15'
        },
        {
          id: '16',
          name: 'Autocarro Medio (N2)',
          code: 'N2',
          default_kg: '3000',
          default_cbm: '35',
          max_kg: '12000',
          max_cbm: '45'
        },
        {
          id: '17',
          name: 'Autocarro Pesante (N3)',
          code: 'N3',
          default_kg: '8000',
          default_cbm: '55',
          max_kg: '26000',
          max_cbm: '70'
        },
        {
          id: '18',
          name: 'Autotreno (Motrice + Rimorchio)',
          code: 'AUTOTRENO',
          default_kg: '24000',
          default_cbm: '100',
          max_kg: '44000',
          max_cbm: '120'
        },
        {
          id: '19',
          name: 'Autoarticolato (Motrice + Semirimorchio)',
          code: 'AUTOARTICOLATO',
          default_kg: '20000',
          default_cbm: '85',
          max_kg: '40000',
          max_cbm: '100'
        },
        {
          id: '20',
          name: 'Semirimorchio Standard',
          code: 'SEMI_STD',
          default_kg: '20000',
          default_cbm: '85',
          max_kg: '33000',
          max_cbm: '90'
        },
        {
          id: '21',
          name: 'Semirimorchio Centinato',
          code: 'SEMI_TENT',
          default_kg: '20000',
          default_cbm: '90',
          max_kg: '33000',
          max_cbm: '100'
        },
        {
          id: '22',
          name: 'Semirimorchio Frigo',
          code: 'SEMI_FRIGO',
          default_kg: '18000',
          default_cbm: '80',
          max_kg: '30000',
          max_cbm: '85'
        },
        {
          id: '23',
          name: 'Megatrailer (Volume Maggiorato)',
          code: 'MEGA',
          default_kg: '25000',
          default_cbm: '110',
          max_kg: '40000',
          max_cbm: '125'
        },
        {
          id: '24',
          name: 'Semirimorchio Ribassato',
          code: 'LOWBED',
          default_kg: '30000',
          default_cbm: '60',
          max_kg: '48000',
          max_cbm: '80'
        }
      ],
      '4': [ // Ferroviario - TERMINOLOGIA TECNICA FERROVIARIA
        {
          id: '25',
          name: 'Vagone Merci Aperto (E)',
          code: 'VAG_E',
          default_kg: '20000',
          default_cbm: '60',
          max_kg: '63000',
          max_cbm: '80'
        },
        {
          id: '26',
          name: 'Vagone Merci Chiuso (G)',
          code: 'VAG_G',
          default_kg: '15000',
          default_cbm: '80',
          max_kg: '60000',
          max_cbm: '100'
        },
        {
          id: '27',
          name: 'Vagone Pianale (R)',
          code: 'VAG_R',
          default_kg: '25000',
          default_cbm: '70',
          max_kg: '63000',
          max_cbm: '90'
        },
        {
          id: '28',
          name: 'Vagone Container (S)',
          code: 'VAG_S',
          default_kg: '20000',
          default_cbm: '67',
          max_kg: '63000',
          max_cbm: '80'
        },
        {
          id: '29',
          name: 'Vagone Cisterna (Z)',
          code: 'VAG_Z',
          default_kg: '30000',
          default_cbm: '60',
          max_kg: '63000',
          max_cbm: '80'
        },
        {
          id: '30',
          name: 'Vagone Frigo (I)',
          code: 'VAG_I',
          default_kg: '18000',
          default_cbm: '75',
          max_kg: '55000',
          max_cbm: '85'
        }
      ],
      '5': [ // Multimodale - TERMINOLOGIA TECNICA INTERMODALE
        {
          id: '31',
          name: 'RoRo (Roll-on/Roll-off)',
          code: 'RORO',
          default_kg: '20000',
          default_cbm: '85',
          max_kg: '44000',
          max_cbm: '120'
        },
        {
          id: '32',
          name: 'Trasporto Combinato Non Accompagnato',
          code: 'TCNA',
          default_kg: '20000',
          default_cbm: '80',
          max_kg: '40000',
          max_cbm: '100'
        },
        {
          id: '33',
          name: 'Intermodale Mare-Ferro',
          code: 'SEA_RAIL',
          default_kg: '20000',
          default_cbm: '67',
          max_kg: '63000',
          max_cbm: '80'
        },
        {
          id: '34',
          name: 'Intermodale Ferro-Strada',
          code: 'RAIL_ROAD',
          default_kg: '20000',
          default_cbm: '80',
          max_kg: '44000',
          max_cbm: '120'
        }
      ]
    }

    // ✅ Fix TypeScript: controlla che transportModeId esista e sia una chiave valida
    const vehicleTypes = transportModeId && allVehicleTypes[transportModeId] 
      ? allVehicleTypes[transportModeId] 
      : []

    return NextResponse.json({ success: true, data: vehicleTypes })
  } catch (error) {
    console.error('Error fetching vehicle types:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vehicle types' },
      { status: 500 }
    )
  }
}