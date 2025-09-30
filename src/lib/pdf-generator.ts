import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface ReportData {
  organizationName: string
  reportName: string
  period: {
    start: string
    end: string
  }
  metrics: {
    shipments?: {
      total_shipments: number
      pending: number
      in_transit: number
      delivered: number
      avg_delivery_days: number
    }
    products?: {
      total_products: number
      active_products: number
      total_quantity: number
    }
    costs?: {
      total_cost: number
      avg_cost_per_shipment: number
      cost_by_type?: Record<string, number>
    }
  }
}

export async function generateReportPDF(data: ReportData): Promise<Buffer> {
  const doc = new jsPDF()

  // Header
  doc.setFontSize(20)
  doc.text(data.reportName, 20, 20)

  doc.setFontSize(12)
  doc.text(data.organizationName, 20, 30)

  doc.setFontSize(10)
  doc.text(`Periodo: ${formatDate(data.period.start)} - ${formatDate(data.period.end)}`, 20, 40)
  doc.text(`Generato il: ${formatDate(new Date().toISOString())}`, 20, 46)

  let yPosition = 60

  // Shipments Section
  if (data.metrics.shipments) {
    doc.setFontSize(14)
    doc.setFont(undefined, 'bold')
    doc.text('SPEDIZIONI', 20, yPosition)
    doc.setFont(undefined, 'normal')
    yPosition += 10

    const shipmentsData = [
      ['Totale Spedizioni', data.metrics.shipments.total_shipments.toString()],
      ['In Attesa', data.metrics.shipments.pending.toString()],
      ['In Transito', data.metrics.shipments.in_transit.toString()],
      ['Consegnate', data.metrics.shipments.delivered.toString()],
      ['Giorni Medi di Consegna', data.metrics.shipments.avg_delivery_days.toFixed(1)]
    ]

    autoTable(doc, {
      startY: yPosition,
      head: [['Metrica', 'Valore']],
      body: shipmentsData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] }
    })

    yPosition = (doc as any).lastAutoTable.finalY + 15
  }

  // Products Section
  if (data.metrics.products) {
    doc.setFontSize(14)
    doc.setFont(undefined, 'bold')
    doc.text('PRODOTTI', 20, yPosition)
    doc.setFont(undefined, 'normal')
    yPosition += 10

    const productsData = [
      ['Totale Prodotti', data.metrics.products.total_products.toString()],
      ['Prodotti Attivi', data.metrics.products.active_products.toString()],
      ['Quantità Totale', data.metrics.products.total_quantity.toString()]
    ]

    autoTable(doc, {
      startY: yPosition,
      head: [['Metrica', 'Valore']],
      body: productsData,
      theme: 'striped',
      headStyles: { fillColor: [34, 197, 94] }
    })

    yPosition = (doc as any).lastAutoTable.finalY + 15
  }

  // Costs Section
  if (data.metrics.costs) {
    doc.setFontSize(14)
    doc.setFont(undefined, 'bold')
    doc.text('COSTI', 20, yPosition)
    doc.setFont(undefined, 'normal')
    yPosition += 10

    const costsData = [
      ['Costo Totale', `€${data.metrics.costs.total_cost.toLocaleString('it-IT')}`],
      ['Costo Medio per Spedizione', `€${data.metrics.costs.avg_cost_per_shipment.toLocaleString('it-IT')}`]
    ]

    autoTable(doc, {
      startY: yPosition,
      head: [['Metrica', 'Valore']],
      body: costsData,
      theme: 'striped',
      headStyles: { fillColor: [234, 88, 12] }
    })

    yPosition = (doc as any).lastAutoTable.finalY + 15

    // Cost by type breakdown
    if (data.metrics.costs.cost_by_type && Object.keys(data.metrics.costs.cost_by_type).length > 0) {
      doc.setFontSize(12)
      doc.text('Costi per Tipologia', 20, yPosition)
      yPosition += 8

      const costsByTypeData = Object.entries(data.metrics.costs.cost_by_type).map(([type, amount]) => [
        type.charAt(0).toUpperCase() + type.slice(1),
        `€${amount.toLocaleString('it-IT')}`
      ])

      autoTable(doc, {
        startY: yPosition,
        head: [['Tipo', 'Importo']],
        body: costsByTypeData,
        theme: 'plain',
        headStyles: { fillColor: [249, 115, 22] }
      })
    }
  }

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.text(
      `Pagina ${i} di ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    )
    doc.text(
      'Generato con SCH Pro Analytics',
      doc.internal.pageSize.getWidth() - 20,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'right' }
    )
  }

  // Return as buffer
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
  return pdfBuffer
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}
