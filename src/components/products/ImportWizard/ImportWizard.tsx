'use client';

import React, { useState, useRef, useCallback } from 'react';
import { X, Upload, FileSpreadsheet, MapPin, CheckCircle, Eye, AlertCircle, FileText, RefreshCw, Plus, PlusCircle } from 'lucide-react';
import { Product, ImportColumn, ImportPreview } from '@/types/product';
import { useAuth } from '@/contexts/AuthContext';
import * as XLSX from 'xlsx';

interface ImportWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: (results: any) => void;
  existingProducts?: Product[];
}

interface ImportStep {
  id: 'upload' | 'mapping' | 'preview' | 'options' | 'import';
  title: string;
  description: string;
}

type ImportMode = 'replace' | 'new_only' | 'append';

interface EnhancedImportColumn extends ImportColumn {
  csvField: string;
  productField: string;
  index: number;
  required?: boolean;
  suggestions?: string[];
}

interface EnhancedImportPreview {
  valid: Product[];
  invalid: Array<{ row: number; data: any; errors: string[] }>;
  summary: {
    total: number;
    valid: number;
    invalid: number;
  };
}

interface DuplicatesAnalysis {
  total: number;
  duplicates: number;
  newProducts: number;
  toReplace: Product[];
  toAdd: Product[];
}

const IMPORT_STEPS: ImportStep[] = [
  { id: 'upload', title: 'Upload File', description: 'Seleziona il file da importare' },
  { id: 'mapping', title: 'Mappa Colonne', description: 'Associa le colonne ai campi' },
  { id: 'preview', title: 'Preview', description: 'Controlla i dati' },
  { id: 'options', title: 'Opzioni', description: 'Configura l\'import' },
  { id: 'import', title: 'Import', description: 'Importa i prodotti' }
];

export function ImportWizard({ isOpen, onClose, onImportComplete, existingProducts = [] }: ImportWizardProps) {
  const { userId } = useAuth();
  
  const [currentStep, setCurrentStep] = useState<'upload' | 'mapping' | 'preview' | 'options' | 'import'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [columns, setColumns] = useState<EnhancedImportColumn[]>([]);
  const [preview, setPreview] = useState<EnhancedImportPreview | null>(null);
  const [importMode, setImportMode] = useState<ImportMode>('new_only');
  const [duplicatesAnalysis, setDuplicatesAnalysis] = useState<DuplicatesAnalysis | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [importResults, setImportResults] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    setIsProcessing(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        let parsedData: string[][] = [];
        
        if (selectedFile.name.endsWith('.csv')) {
          // Parse CSV
          const text = data as string;
          parsedData = text.split('\n').map(row => 
            row.split(',').map(cell => cell.replace(/^"|"$/g, '').trim())
          ).filter(row => row.some(cell => cell.length > 0));
        } else if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
          // Parse Excel
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' });
          parsedData = jsonData as string[][];
        }

        if (parsedData.length === 0) {
          throw new Error('File vuoto o formato non valido');
        }

        setCsvData(parsedData);
        
        // Initialize columns from first row
        const headers = parsedData[0] || [];
        const initialColumns: EnhancedImportColumn[] = headers.map((header, index) => ({
          key: 'ignore' as keyof Product | 'ignore',
          label: header,
          csvField: header,
          productField: '',
          index,
          required: false,
          suggestions: getSuggestions(header)
        }));
        
        setColumns(initialColumns);
        setCurrentStep('mapping');
      } catch (error) {
        console.error('Errore nel parsing del file:', error);
        alert('Errore nel parsing del file. Controlla il formato.');
      } finally {
        setIsProcessing(false);
      }
    };

    if (selectedFile.name.endsWith('.csv')) {
      reader.readAsText(selectedFile);
    } else {
      reader.readAsBinaryString(selectedFile);
    }
  }, []);

  const getSuggestions = (header: string): string[] => {
    const headerLower = header.toLowerCase();
    const suggestions: string[] = [];
    
    const mappings = {
      'sku': ['sku', 'codice', 'code', 'articolo', 'article'],
      'description': ['description', 'descrizione', 'nome', 'name', 'prodotto', 'product'],
      'category': ['category', 'categoria', 'tipo', 'type'],
      'unit_price': ['price', 'prezzo', 'costo', 'cost', 'unit_price', 'unitprice'],
      'currency': ['currency', 'valuta', 'moneta'],
      'weight_kg': ['weight', 'peso', 'kg', 'weight_kg', 'weightkg'],
      'quantity': ['quantity', 'quantità', 'qty', 'stock', 'magazzino'],
      'min_stock': ['min_stock', 'min', 'minimo', 'soglia', 'minimum'],
      'max_stock': ['max_stock', 'max', 'massimo', 'maximum'],
      'active': ['active', 'attivo', 'status', 'stato'],
      'ean': ['ean', 'barcode', 'codice_barre'],
      'hs_code': ['hs_code', 'hs', 'codice_hs', 'harmonized'],
      'origin_country': ['origin', 'origine', 'country', 'paese'],
      'other_description': ['other_description', 'note', 'notes', 'dettagli']
    };

    for (const [field, keywords] of Object.entries(mappings)) {
      if (keywords.some(keyword => headerLower.includes(keyword))) {
        suggestions.push(field);
      }
    }

    return suggestions;
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const validFile = files.find(file => 
      file.name.endsWith('.csv') || 
      file.name.endsWith('.xlsx') || 
      file.name.endsWith('.xls')
    );

    if (validFile) {
      handleFileSelect(validFile);
    } else {
      alert('Formato file non supportato. Usa CSV o Excel (.xlsx, .xls).');
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const updateColumnMapping = (index: number, productField: string) => {
    setColumns(prev => prev.map((col, i) => 
      i === index ? { ...col, productField, key: productField as keyof Product | 'ignore' } : col
    ));
  };

  const generatePreview = () => {
    if (!userId) {
      alert('Utente non autenticato');
      return;
    }

    setIsProcessing(true);
    try {
      const mappedColumns = columns.filter(col => col.productField && col.productField !== 'ignore');
      const valid: Product[] = [];
      const invalid: Array<{ row: number; data: any; errors: string[] }> = [];

      csvData.slice(1).forEach((row, index) => {
        const errors: string[] = [];
        const productData: any = {
          user_id: userId,
          id: `temp_${index}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        mappedColumns.forEach(col => {
          const value = row[col.index];
          const field = col.productField;
          
          if (!value || value.trim() === '') return;

          try {
            if (field === 'unit_price' || field === 'weight_kg') {
              const numValue = parseFloat(value.replace(',', '.'));
              if (!isNaN(numValue)) {
                productData[field] = numValue;
              }
            } else if (field === 'quantity' || field === 'min_stock' || field === 'max_stock') {
              const intValue = parseInt(value);
              if (!isNaN(intValue)) {
                productData[field] = intValue;
              }
            } else if (field === 'active') {
              const boolValue = ['true', '1', 'yes', 'si', 'attivo', 'active'].includes(value.toLowerCase());
              productData[field] = boolValue;
            } else {
              productData[field] = value.trim();
            }
          } catch (err) {
            errors.push(`Errore nel campo ${field}: ${err}`);
          }
        });

        // Validation
        if (!productData.sku) {
          errors.push('SKU obbligatorio');
        }
        if (!productData.description) {
          errors.push('Descrizione obbligatoria');
        }

        // Set defaults
        if (productData.active === undefined) {
          productData.active = true;
        }
        if (!productData.currency) {
          productData.currency = 'EUR';
        }

        if (errors.length === 0) {
          valid.push(productData as Product);
        } else {
          invalid.push({
            row: index + 2,
            data: productData,
            errors
          });
        }
      });

      setPreview({
        valid,
        invalid,
        summary: {
          total: csvData.length - 1,
          valid: valid.length,
          invalid: invalid.length
        }
      });
      
      setCurrentStep('preview');
    } catch (error) {
      console.error('Errore nella generazione preview:', error);
      alert('Errore nella generazione del preview');
    } finally {
      setIsProcessing(false);
    }
  };

  const analyzeDuplicates = () => {
    if (!preview) return;

    const duplicates: Product[] = [];
    const newProducts: Product[] = [];

    preview.valid.forEach(product => {
      const existing = existingProducts.find(p => 
        p.sku.toLowerCase() === product.sku.toLowerCase()
      );
      
      if (existing) {
        duplicates.push({ ...product, id: existing.id });
      } else {
        newProducts.push(product);
      }
    });

    setDuplicatesAnalysis({
      total: preview.valid.length,
      duplicates: duplicates.length,
      newProducts: newProducts.length,
      toReplace: duplicates,
      toAdd: newProducts
    });

    setCurrentStep('options');
  };

  const handleImport = async () => {
    if (!preview || !duplicatesAnalysis || !userId) return;
    
    setIsProcessing(true);
    setCurrentStep('import');
    
    try {
      let productsToImport: Product[] = [];

      switch (importMode) {
        case 'replace':
          productsToImport = [...duplicatesAnalysis.toReplace, ...duplicatesAnalysis.toAdd];
          break;
        case 'new_only':
          productsToImport = duplicatesAnalysis.toAdd;
          break;
        case 'append':
          productsToImport = preview.valid;
          break;
      }

      const response = await fetch('/api/products/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          products: productsToImport,
          mode: importMode
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore nell\'import');
      }

      const result = await response.json();
      
      setImportResults({
        success: true,
        mode: importMode,
        imported: result.imported || productsToImport.length,
        replaced: importMode === 'replace' ? duplicatesAnalysis.duplicates : 0,
        skipped: importMode === 'new_only' ? duplicatesAnalysis.duplicates : 0,
        products: productsToImport
      });

      if (onImportComplete) {
        onImportComplete(result);
      }
      
    } catch (error) {
      console.error('Errore nell\'import:', error);
      setImportResults({
        success: false,
        error: error instanceof Error ? error.message : 'Errore sconosciuto'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetWizard = () => {
    setCurrentStep('upload');
    setFile(null);
    setCsvData([]);
    setColumns([]);
    setPreview(null);
    setImportMode('new_only');
    setDuplicatesAnalysis(null);
    setImportResults(null);
    setIsProcessing(false);
  };

  const getCurrentStepIndex = () => {
    const steps = ['upload', 'mapping', 'preview', 'options', 'import'];
    return steps.indexOf(currentStep);
  };

  if (!isOpen || !userId) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Import Prodotti</h2>
            <p className="text-gray-600 text-sm">
              Importa prodotti da file CSV o Excel
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps Indicator */}
        <div className="flex items-center justify-center p-4 bg-gray-50 border-b">
          {IMPORT_STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                ${currentStep === step.id 
                  ? 'bg-blue-600 text-white' 
                  : index < getCurrentStepIndex()
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-600'
                }
              `}>
                {index < getCurrentStepIndex() ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              {index < IMPORT_STEPS.length - 1 && (
                <div className={`w-12 h-0.5 mx-2 ${
                  index < getCurrentStepIndex()
                    ? 'bg-green-500'
                    : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* UPLOAD STEP */}
          {currentStep === 'upload' && (
            <div className="text-center">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`
                  border-2 border-dashed rounded-xl p-12 transition-all cursor-pointer
                  ${isDragOver 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                  }
                `}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <Upload className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      Trascina qui il tuo file o clicca per selezionare
                    </p>
                    <p className="text-gray-600 text-sm mt-2">
                      Formati supportati: CSV, Excel (.xlsx, .xls)
                    </p>
                    <p className="text-gray-500 text-xs mt-2">
                      Dimensione massima: 10MB
                    </p>
                  </div>
                </div>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
                className="hidden"
              />

              {/* Template Download */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Non hai un file?</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Scarica il template per iniziare
                </p>
                <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm">
                  <FileSpreadsheet className="w-4 h-4 mr-2 inline" />
                  Scarica Template
                </button>
              </div>
            </div>
          )}

          {/* MAPPING STEP */}
          {currentStep === 'mapping' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Mappa le Colonne</h3>
              <p className="text-gray-600 mb-6">
                Associa le colonne del tuo file ai campi prodotto. I campi SKU e Descrizione sono obbligatori.
              </p>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {columns.map((col, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border rounded-lg bg-white">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{col.csvField}</div>
                      <div className="text-sm text-gray-500">
                        Esempio: {csvData[1]?.[col.index] || 'N/A'}
                      </div>
                      {col.suggestions && col.suggestions.length > 0 && (
                        <div className="text-xs text-blue-600 mt-1">
                          Suggerito: {col.suggestions[0]}
                        </div>
                      )}
                    </div>
                    <div className="w-px h-12 bg-gray-200" />
                    <div className="flex-1">
                      <select
                        value={col.productField}
                        onChange={(e) => updateColumnMapping(index, e.target.value)}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">-- Non mappare --</option>
                        <option value="sku">SKU *</option>
                        <option value="description">Descrizione *</option>
                        <option value="category">Categoria</option>
                        <option value="unit_price">Prezzo Unitario</option>
                        <option value="currency">Valuta</option>
                        <option value="weight_kg">Peso (kg)</option>
                        <option value="quantity">Quantità</option>
                        <option value="min_stock">Stock Minimo</option>
                        <option value="max_stock">Stock Massimo</option>
                        <option value="active">Attivo</option>
                        <option value="ean">EAN</option>
                        <option value="hs_code">Codice HS</option>
                        <option value="origin_country">Paese di Origine</option>
                        <option value="other_description">Altra Descrizione</option>
                      </select>
                      
                      {/* Auto-suggest buttons */}
                      {col.suggestions && col.suggestions.length > 0 && !col.productField && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {col.suggestions.slice(0, 2).map(suggestion => (
                            <button
                              key={suggestion}
                              onClick={() => updateColumnMapping(index, suggestion)}
                              className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Mapping Summary */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">Colonne mappate: </span>
                    <span className="text-blue-600">
                      {columns.filter(col => col.productField && col.productField !== 'ignore').length}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Campi obbligatori: </span>
                    <span className={
                      columns.some(col => col.productField === 'sku') && 
                      columns.some(col => col.productField === 'description')
                        ? 'text-green-600'
                        : 'text-red-600'
                    }>
                      {columns.some(col => col.productField === 'sku') ? '✓ SKU' : '✗ SKU'} | {' '}
                      {columns.some(col => col.productField === 'description') ? '✓ Descrizione' : '✗ Descrizione'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PREVIEW STEP */}
          {currentStep === 'preview' && preview && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Anteprima Dati</h3>
              
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{preview.summary.total}</div>
                    <div className="text-sm text-blue-400">Righe totali</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{preview.summary.valid}</div>
                    <div className="text-sm text-green-400">Prodotti validi</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-600">{preview.summary.invalid}</div>
                    <div className="text-sm text-red-400">Con errori</div>
                  </div>
                </div>

                {/* Valid Products */}
                {preview.valid.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-green-600 mb-3 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Prodotti Validi ({preview.valid.length})
                    </h4>
                    <div className="border rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="text-left p-3 font-medium">SKU</th>
                              <th className="text-left p-3 font-medium">Descrizione</th>
                              <th className="text-left p-3 font-medium">Categoria</th>
                              <th className="text-left p-3 font-medium">Prezzo</th>
                              <th className="text-left p-3 font-medium">Stock</th>
                            </tr>
                          </thead>
                          <tbody>
                            {preview.valid.slice(0, 10).map((product: Product, index: number) => (
                              <tr key={index} className="border-t hover:bg-gray-50">
                                <td className="p-3 font-mono text-blue-600">{product.sku}</td>
                                <td className="p-3">{product.description}</td>
                                <td className="p-3">{product.category || '-'}</td>
                                <td className="p-3">
                                  {product.unit_price 
                                    ? `${product.unit_price.toFixed(2)} ${product.currency || 'EUR'}` 
                                    : '-'
                                  }
                                </td>
                                <td className="p-3">{product.quantity || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {preview.valid.length > 10 && (
                        <div className="p-3 bg-gray-50 text-center text-sm text-gray-600">
                          ... e altri {preview.valid.length - 10} prodotti
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Invalid Products */}
                {preview.invalid.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-red-600 mb-3 flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2" />
                      Prodotti con Errori ({preview.invalid.length})
                    </h4>
                    <div className="border rounded-lg overflow-hidden">
                      <div className="max-h-64 overflow-y-auto">
                        {preview.invalid.map((item, index) => (
                          <div key={index} className="p-3 border-b last:border-b-0 bg-red-50">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-medium">Riga {item.row}</span>
                                <div className="text-sm text-gray-600 mt-1">
                                  SKU: {item.data.sku || 'N/A'} - {item.data.description || 'N/A'}
                                </div>
                              </div>
                              <div className="text-xs text-red-600">
                                {item.errors.join(', ')}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* OPTIONS STEP */}
          {currentStep === 'options' && duplicatesAnalysis && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Opzioni di Import</h3>
              
              <div className="space-y-6">
                {/* Duplicates Analysis */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">Analisi Duplicati</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Prodotti Nuovi</div>
                      <div className="text-green-600 text-lg font-bold">{duplicatesAnalysis.newProducts}</div>
                    </div>
                    <div>
                      <div className="font-medium">Duplicati (stesso SKU)</div>
                      <div className="text-yellow-600 text-lg font-bold">{duplicatesAnalysis.duplicates}</div>
                    </div>
                    <div>
                      <div className="font-medium">Totale</div>
                      <div className="text-blue-600 text-lg font-bold">{duplicatesAnalysis.total}</div>
                    </div>
                  </div>
                </div>

                {/* Import Mode Selection */}
                <div>
                  <h4 className="font-medium mb-3">Modalità di Import</h4>
                  <div className="space-y-3">
                    <label className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="importMode"
                        value="new_only"
                        checked={importMode === 'new_only'}
                        onChange={(e) => setImportMode(e.target.value as ImportMode)}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium">Solo Nuovi Prodotti</div>
                        <div className="text-sm text-gray-600">
                          Importa solo prodotti con SKU non esistenti ({duplicatesAnalysis.newProducts} prodotti)
                        </div>
                      </div>
                    </label>
                    
                    <label className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="importMode"
                        value="replace"
                        checked={importMode === 'replace'}
                        onChange={(e) => setImportMode(e.target.value as ImportMode)}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium">Sostituisci Esistenti</div>
                        <div className="text-sm text-gray-600">
                          Importa tutti i prodotti, sostituendo quelli esistenti ({duplicatesAnalysis.total} prodotti)
                        </div>
                      </div>
                    </label>
                    
                    <label className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="importMode"
                        value="append"
                        checked={importMode === 'append'}
                        onChange={(e) => setImportMode(e.target.value as ImportMode)}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium">Aggiungi Tutto</div>
                        <div className="text-sm text-gray-600">
                          Importa tutti i prodotti creando duplicati per SKU esistenti
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* IMPORT STEP */}
          {currentStep === 'import' && (
            <div className="text-center">
              {isProcessing ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Import in corso...</h3>
                    <p className="text-gray-600">Sto importando i tuoi prodotti, attendere prego.</p>
                  </div>
                </div>
              ) : importResults ? (
                <div className="space-y-4">
                  {importResults.success ? (
                    <>
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-green-600">Import Completato!</h3>
                        <p className="text-gray-600">I prodotti sono stati importati con successo.</p>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="bg-green-50 p-3 rounded-lg">
                          <div className="text-lg font-bold text-green-600">{importResults.imported}</div>
                          <div className="text-sm text-green-400">Importati</div>
                        </div>
                        {importResults.replaced > 0 && (
                          <div className="bg-yellow-50 p-3 rounded-lg">
                            <div className="text-lg font-bold text-yellow-600">{importResults.replaced}</div>
                            <div className="text-sm text-yellow-400">Sostituiti</div>
                          </div>
                        )}
                        {importResults.skipped > 0 && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-lg font-bold text-gray-600">{importResults.skipped}</div>
                            <div className="text-sm text-gray-400">Saltati</div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-red-600">Errore nell'Import</h3>
                        <p className="text-gray-600">{importResults.error}</p>
                      </div>
                    </>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {file && (
              <span>File: {file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
            )}
          </div>
          
          <div className="flex gap-3">
            {currentStep === 'import' && importResults ? (
              <>
                <button
                  onClick={resetWizard}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Nuovo Import
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Chiudi
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Annulla
                </button>
                
                {currentStep === 'mapping' && (
                  <button
                    onClick={generatePreview}
                    disabled={
                      isProcessing || 
                      !columns.some(col => col.productField === 'sku') ||
                      !columns.some(col => col.productField === 'description')
                    }
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? 'Elaborazione...' : 'Genera Preview'}
                  </button>
                )}

                {currentStep === 'preview' && preview && preview.valid.length > 0 && (
                  <button
                    onClick={analyzeDuplicates}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Continua
                  </button>
                )}

                {currentStep === 'options' && (
                  <button
                    onClick={handleImport}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Inizia Import
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}