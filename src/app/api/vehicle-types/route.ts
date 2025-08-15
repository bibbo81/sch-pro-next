// src/app/api/vehicle-types/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const transportModeId = searchParams.get('transport_mode_id')

    // ✅ Tipi di veicolo completi dal vecchio progetto
    const allVehicleTypes = {
      '1': [ // Marittimo
        { 
          id: '1', 
          name: "Container 20' DV", 
          code: '20DV',
          default_kg: '21600',
          default_cbm: '33.2',
          max_kg: '28200',
          max_cbm: '33.2',
          description: "Container secco 20 piedi"
        },
        { 
          id: '2', 
          name: "Container 40' DV", 
          code: '40DV',
          default_kg: '26680',
          default_cbm: '67.7',
          max_kg: '30400',
          max_cbm: '67.7',
          description: "Container secco 40 piedi"
        },
        { 
          id: '3', 
          name: "Container 40' HC", 
          code: '40HC',
          default_kg: '26580',
          default_cbm: '76.4',
          max_kg: '30480',
          max_cbm: '76.4',
          description: "Container High Cube 40 piedi"
        },
        { 
          id: '4', 
          name: "Container 45' HC", 
          code: '45HC',
          default_kg: '26000',
          default_cbm: '86.0',
          max_kg: '30000',
          max_cbm: '86.0',
          description: "Container High Cube 45 piedi"
        },
        { 
          id: '5', 
          name: "Container 20' RF", 
          code: '20RF',
          default_kg: '18000',
          default_cbm: '28.3',
          max_kg: '25400',
          max_cbm: '28.3',
          description: "Container refrigerato 20 piedi"
        },
        { 
          id: '6', 
          name: "Container 40' RF", 
          code: '40RF',
          default_kg: '22000',
          default_cbm: '59.3',
          max_kg: '27700',
          max_cbm: '59.3',
          description: "Container refrigerato 40 piedi"
        },
        {
          id: '7',
          name: 'Bulk Carrier',
          code: 'BULK',
          default_kg: '50000',
          default_cbm: '100',
          max_kg: '180000',
          max_cbm: '500',
          description: "Nave per carichi sfusi"
        }
      ],
      '2': [ // Aereo
        {
          id: '8',
          name: 'Cargo Boeing 747F',
          code: 'B747F',
          default_kg: '5000',
          default_cbm: '25',
          max_kg: '124000',
          max_cbm: '858',
          description: "Boeing 747 Freighter"
        },
        {
          id: '9',
          name: 'Cargo Airbus A330F',
          code: 'A330F',
          default_kg: '3000',
          default_cbm: '15',
          max_kg: '70000',
          max_cbm: '475',
          description: "Airbus A330 Freighter"
        },
        {
          id: '10',
          name: 'Express Package',
          code: 'EXPRESS',
          default_kg: '25',
          default_cbm: '0.1',
          max_kg: '70',
          max_cbm: '0.3',
          description: "Pacco espresso aereo"
        },
        {
          id: '11',
          name: 'Air Cargo Pallet',
          code: 'ULD',
          default_kg: '1500',
          default_cbm: '10',
          max_kg: '6800',
          max_cbm: '20',
          description: "Pallet aereo standard"
        }
      ],
      '3': [ // Stradale
        {
          id: '12',
          name: 'Camion 7.5t',
          code: 'TRUCK75',
          default_kg: '3500',
          default_cbm: '35',
          max_kg: '7500',
          max_cbm: '42',
          description: "Camion medio 7.5 tonnellate"
        },
        {
          id: '13',
          name: 'TIR 19t',
          code: 'TIR19',
          default_kg: '12000',
          default_cbm: '76',
          max_kg: '19000',
          max_cbm: '90',
          description: "TIR standard 19 tonnellate"
        },
        {
          id: '14',
          name: 'Bilico 44t',
          code: 'BILICO44',
          default_kg: '24000',
          default_cbm: '100',
          max_kg: '44000',
          max_cbm: '120',
          description: "Bilico completo 44 tonnellate"
        },
        {
          id: '15',
          name: 'Furgone 3.5t',
          code: 'VAN35',
          default_kg: '1500',
          default_cbm: '17',
          max_kg: '3500',
          max_cbm: '20',
          description: "Furgone commerciale 3.5t"
        },
        {
          id: '16',
          name: 'Megatrailer',
          code: 'MEGA',
          default_kg: '25000',
          default_cbm: '110',
          max_kg: '44000',
          max_cbm: '125',
          description: "Megatrailer volume maggiorato"
        }
      ],
      '4': [ // Ferroviario
        {
          id: '17',
          name: 'Vagone Container',
          code: 'RAILCONT',
          default_kg: '20000',
          default_cbm: '67',
          max_kg: '60000',
          max_cbm: '80',
          description: "Vagone per container intermodali"
        },
        {
          id: '18',
          name: 'Vagone Merci Chiuso',
          code: 'RAILBOX',
          default_kg: '15000',
          default_cbm: '80',
          max_kg: '50000',
          max_cbm: '100',
          description: "Vagone chiuso per merci varie"
        },
        {
          id: '19',
          name: 'Vagone Cisterna',
          code: 'RAILTANK',
          default_kg: '30000',
          default_cbm: '60',
          max_kg: '60000',
          max_cbm: '80',
          description: "Vagone cisterna per liquidi"
        }
      ],
      '5': [ // Multimodale
        {
          id: '20',
          name: 'Intermodale Mare-Strada',
          code: 'SEAROAD',
          default_kg: '20000',
          default_cbm: '67',
          max_kg: '44000',
          max_cbm: '120',
          description: "Trasporto combinato marittimo-stradale"
        },
        {
          id: '21',
          name: 'Intermodale Ferro-Strada',
          code: 'RAILROAD',
          default_kg: '20000',
          default_cbm: '80',
          max_kg: '44000',
          max_cbm: '120',
          description: "Trasporto combinato ferroviario-stradale"
        }
      ]
    }

    const vehicleTypes = transportModeId ? allVehicleTypes[transportModeId] || [] : []

    return NextResponse.json({ success: true, data: vehicleTypes })
  } catch (error) {
    console.error('Error fetching vehicle types:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vehicle types' },
      { status: 500 }
    )
  }
}