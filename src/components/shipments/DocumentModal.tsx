'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Upload, AlertCircle, CheckCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface DocumentModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (file: File, documentType: string, notes?: string) => Promise<void>
  loading?: boolean
}

const DOCUMENT_TYPES = [
  { value: 'invoice', label: 'Fattura' },
  { value: 'packing_list', label: 'Packing List' },
  { value: 'bill_of_lading', label: 'Bill of Lading' },
  { value: 'certificate_origin', label: 'Certificato di Origine' },
  { value: 'customs_declaration', label: 'Dichiarazione Doganale' },
  { value: 'insurance_certificate', label: 'Certificato Assicurazione' },
  { value: 'shipping_instruction', label: 'Istruzioni di Spedizione' },
  { value: 'delivery_receipt', label: 'Ricevuta di Consegna' },
  { value: 'inspection_certificate', label: 'Certificato di Ispezione' },
  { value: 'other', label: 'Altro' }
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
]

export default function DocumentModal({ 
  isOpen, 
  onClose, 
  onUpload,
  loading = false 
}: DocumentModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState('')
  const [notes, setNotes] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resetForm = () => {
    setSelectedFile(null)
    setDocumentType('')
    setNotes('')
    setError(null)
  }

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Tipo di file non supportato. Usa PDF, immagini o documenti Office.'
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File troppo grande. Dimensione massima: 10MB.'
    }
    return null
  }

  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      setSelectedFile(null)
      return
    }

    setError(null)
    setSelectedFile(file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFile) {
      setError('Seleziona un file da caricare')
      return
    }

    if (!documentType) {
      setError('Seleziona il tipo di documento')
      return
    }

    try {
      await onUpload(selectedFile, documentType, notes.trim() || undefined)
      resetForm()
      onClose()
    } catch (err) {
      setError('Errore durante il caricamento del documento')
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄'
    if (type.includes('image')) return '🖼️'
    if (type.includes('word')) return '📝'
    if (type.includes('excel') || type.includes('sheet')) return '📊'
    return '📎'
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { resetForm(); onClose() } }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Carica Documento
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload Area */}
          <div className="space-y-4">
            <Label>File Documento *</Label>
            
            {/* Drag & Drop Area */}
            <div
              className={`
                border-2 border-dashed rounded-lg p-6 text-center transition-colors
                ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                ${selectedFile ? 'border-green-500 bg-green-50' : ''}
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div className="space-y-2">
                  <div className="text-2xl">{getFileIcon(selectedFile.type)}</div>
                  <div className="font-medium text-green-800">{selectedFile.name}</div>
                  <div className="text-sm text-green-600">{formatFileSize(selectedFile.size)}</div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                    className="mt-2"
                  >
                    Rimuovi
                  </Button>
                </div>
              ) : (
                                <div className="space-y-2">
                  <Upload className="h-8 w-8 mx-auto text-gray-400" />
                  <div className="text-sm text-gray-600">
                    Trascina qui il file oppure
                  </div>
                  <Input
                    type="file"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx"
                    className="hidden"
                    id="file-input"
                  />
                  <Label htmlFor="file-input" className="cursor-pointer">
                    <Button type="button" variant="outline" size="sm">
                      Seleziona File
                    </Button>
                  </Label>
                </div>
              )}
            </div>

            {/* File Format Info */}
            <div className="text-xs text-gray-500 space-y-1">
              <div>Formati supportati: PDF, JPG, PNG, DOC, XLS</div>
              <div>Dimensione massima: 10MB</div>
            </div>
          </div>

          {/* Document Type */}
          <div className="space-y-2">
            <Label htmlFor="document-type">Tipo Documento *</Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona tipo documento" />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Note (opzionale)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Note aggiuntive sul documento..."
              rows={3}
            />
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => { resetForm(); onClose() }}
              disabled={loading}
            >
              Annulla
            </Button>
            <Button type="submit" disabled={loading || !selectedFile || !documentType}>
              {loading ? 'Caricamento...' : 'Carica Documento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}