// src/app/api/transport-modes/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const transportModes = [
      { 
        id: '1', 
        name: 'Marittimo', 
        code: 'SEA',
        description: 'Trasporto via mare con container o bulk',
        icon: '🚢'
      },
      { 
        id: '2', 
        name: 'Aereo', 
        code: 'AIR',
        description: 'Trasporto aereo con AWB',
        icon: '✈️'
      },
      { 
        id: '3', 
        name: 'Stradale', 
        code: 'ROAD',
        description: 'Trasporto su strada con veicoli commerciali',
        icon: '🚛'
      },
      { 
        id: '4', 
        name: 'Ferroviario', 
        code: 'RAIL',
        description: 'Trasporto su rotaia',
        icon: '🚂'
      },
      { 
        id: '5', 
        name: 'Multimodale', 
        code: 'MULTI',
        description: 'Combinazione di più modalità',
        icon: '🔄'
      }
    ]

    return NextResponse.json({ success: true, data: transportModes })
  } catch (error) {
    console.error('Error fetching transport modes:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transport modes' },
      { status: 500 }
    )
  }
}