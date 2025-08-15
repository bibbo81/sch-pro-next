// src/app/api/carriers/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // ✅ Dati completi dal vecchio progetto
    const carriers = [
      // Marittimi
      { id: '1', name: 'MSC', type: 'maritime', code: 'MSCU' },
      { id: '2', name: 'MAERSK', type: 'maritime', code: 'MAEU' },
      { id: '3', name: 'COSCO', type: 'maritime', code: 'COSU' },
      { id: '4', name: 'CMA CGM', type: 'maritime', code: 'CMAU' },
      { id: '5', name: 'HAPAG LLOYD', type: 'maritime', code: 'HLCU' },
      { id: '6', name: 'ONE', type: 'maritime', code: 'ONEY' },
      { id: '7', name: 'EVERGREEN', type: 'maritime', code: 'EGLV' },
      { id: '8', name: 'YANG MING', type: 'maritime', code: 'YMLU' },
      
      // Aerei
      { id: '9', name: 'DHL', type: 'air', code: 'DHL' },
      { id: '10', name: 'FEDEX', type: 'air', code: 'FDX' },
      { id: '11', name: 'UPS', type: 'air', code: 'UPS' },
      { id: '12', name: 'TNT', type: 'air', code: 'TNT' },
      { id: '13', name: 'LUFTHANSA CARGO', type: 'air', code: 'LH' },
      { id: '14', name: 'CATHAY PACIFIC CARGO', type: 'air', code: 'CX' },
      { id: '15', name: 'SINGAPORE AIRLINES CARGO', type: 'air', code: 'SQ' },
      
      // Terrestri
      { id: '16', name: 'DB SCHENKER', type: 'road', code: 'DBS' },
      { id: '17', name: 'KUEHNE + NAGEL', type: 'road', code: 'KN' },
      { id: '18', name: 'DSV', type: 'road', code: 'DSV' },
      { id: '19', name: 'GEODIS', type: 'road', code: 'GEO' },
      { id: '20', name: 'EXPEDITORS', type: 'road', code: 'EXP' },
      
      // Ferroviari
      { id: '21', name: 'TRENITALIA CARGO', type: 'rail', code: 'TRC' },
      { id: '22', name: 'DB CARGO', type: 'rail', code: 'DBC' },
      { id: '23', name: 'SBB CARGO', type: 'rail', code: 'SBB' }
    ]

    return NextResponse.json({ success: true, data: carriers })
  } catch (error) {
    console.error('Error fetching carriers:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch carriers' },
      { status: 500 }
    )
  }
}