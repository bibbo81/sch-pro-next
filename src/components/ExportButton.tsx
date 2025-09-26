import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

interface ExportButtonProps {
  data: any[]
  filename?: string
}

export default function ExportButton({ data, filename = 'export' }: ExportButtonProps) {
  const exportToCSV = () => {
    if (!data || data.length === 0) return

    const headers = Object.keys(data[0])
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Button 
      variant="outline" 
      onClick={exportToCSV}
      className="gap-2"
      disabled={!data || data.length === 0}
    >
      <Download className="h-4 w-4" />
      Esporta CSV
    </Button>
  )
}