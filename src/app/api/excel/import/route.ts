// src/app/api/excel/import/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Per ora simula l'import Excel
    const mockData = [
      {
        id: Date.now().toString(),
        tracking_number: 'EXCEL001',
        carrier_name: 'MSC',
        origin_port: 'SHANGHAI',
        destination_port: 'CIVITAVECCHIA',
        reference_number: 'EXCEL-REF-001',
        created_at: new Date().toISOString()
      }
    ]
    
    return NextResponse.json({ success: true, data: mockData })
  } catch (error) {
    console.error('Error importing Excel:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to import Excel file' },
      { status: 500 }
    )
  }
}