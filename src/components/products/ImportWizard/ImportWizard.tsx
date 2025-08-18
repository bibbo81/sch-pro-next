'use client';

import React, { useState, useRef, useCallback } from 'react';
import { X, Upload, FileSpreadsheet, MapPin, CheckCircle, Eye, AlertCircle, FileText, RefreshCw, Plus, PlusCircle } from 'lucide-react';
import styles from './ImportWizard.module.css';
import { Product, ImportColumn, ImportPreview } from '@/types/product';
import * as XLSX from 'xlsx';

interface ImportWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: (results: any) => void;
  existingProducts?: Product[]; // Prodotti esistenti per il controllo duplicati
}

type ImportStep = 'upload' | 'mapping' | 'preview' | 'options' | 'import';

type ImportMode = 'replace' | 'new_only' | 'append';

export function ImportWizard({ isOpen, onClose, onImportComplete, existingProducts = [] }: ImportWizardProps) {
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [columns, setColumns] = useState<ImportColumn[]>([]);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [importMode, setImportMode] = useState<ImportMode>('new_only');
  const [duplicatesAnalysis, setDuplicatesAnalysis] = useState<{
    total: number;
    duplicates: number;
    newProducts: number;
    toReplace: Product[];
    toAdd: Product[];
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Campi disponibili del prodotto
  const productFields: Array<{ key: keyof Product; label: string; required: boolean }> = [
    { key: 'sku', label: 'SKU', required: true },
    { key: 'description', label: 'Descrizione', required: true },
    { key: 'other_description', label: 'Descrizione aggiuntiva', required: false },
    { key: 'category', label: 'Categoria', required: false },
    { key: 'unit_price', label: 'Prezzo unitario', required: false },
    { key: 'currency', label: 'Valuta', required: false },
    { key: 'weight_kg', label: 'Peso (kg)', required: false },
    { key: 'hs_code', label: 'Codice HS', required: false },
    { key: 'origin_country', label: 'Paese origine', required: false },
    { key: 'ean', label: 'EAN', required: false },
  ];

  const steps = [
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'mapping', label: 'Map Columns', icon: MapPin },
    { id: 'preview', label: 'Preview', icon: Eye },
    { id: 'options', label: 'Import Options', icon: RefreshCw },
    { id: 'import', label: 'Import', icon: CheckCircle },
  ];

  const importModeOptions = [
    {
      id: 'replace' as ImportMode,
      title: 'Replace All Data',
      description: 'Replace existing products with the same SKU',
      icon: RefreshCw,
      color: '#f59e0b'
    },
    {
      id: 'new_only' as ImportMode,
      title: 'Add New Only',
      description: 'Only add products with new SKUs, skip duplicates',
      icon: Plus,
      color: '#10b981'
    },
    {
      id: 'append' as ImportMode,
      title: 'Append All',
      description: 'Add all products, even if SKU already exists',
      icon: PlusCircle,
      color: '#3b82f6'
    }
  ];

  const getStepStatus = (stepId: string) => {
    const stepIndex = steps.findIndex(s => s.id === stepId);
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  const parseCSV = (text: string): string[][] => {
    const lines = text.split('\n').filter(line => line.trim());
    return lines.map(line => {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    });
  };

  const handleFileUpload = useCallback(async (uploadedFile: File) => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    try {
      let parsed: string[][] = [];

      if (uploadedFile.name.endsWith('.csv')) {
        const text = await uploadedFile.text();
        parsed = parseCSV(text);
      } else if (
        uploadedFile.name.endsWith('.xlsx') ||
        uploadedFile.name.endsWith('.xls')
      ) {
        const data = await uploadedFile.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        parsed = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
      } else {
        throw new Error('Formato file non supportato');
      }

      if (parsed.length === 0) {
        throw new Error('File vuoto o formato non valido');
      }

      const headers = parsed[0];
      const initialColumns: ImportColumn[] = headers.map(header => ({
        csvColumn: header,
        productField: null,
        required: false,
        sample: parsed[1]?.[headers.indexOf(header)] || ''
      }));

      setFile(uploadedFile);
      setCsvData(parsed);
      setColumns(initialColumns);
      setCurrentStep('mapping');
    } catch (error) {
      alert('Errore nel caricamento del file. Verifica che sia un CSV o Excel valido.');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    const supportedFile = files.find(f =>
      f.type === 'text/csv' ||
      f.name.endsWith('.csv') ||
      f.name.endsWith('.xlsx') ||
      f.name.endsWith('.xls') ||
      f.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      f.type === 'application/vnd.ms-excel'
    );
    if (supportedFile) {
      handleFileUpload(supportedFile);
    }
  }, [handleFileUpload]);

  const handleColumnMapping = (csvColumn: string, productField: keyof Product | null) => {
    setColumns(prev => prev.map(col => 
      col.csvColumn === csvColumn 
        ? { 
            ...col, 
            productField, 
            required: productField ? (productFields.find(f => f.key === productField)?.required ?? false) : false 
          }
        : col
    ));
  };
  
  const generatePreview = () => {
    setIsProcessing(true);
    try {
      const mappedColumns = columns.filter(col => col.productField);
      const valid: Product[] = [];
      const invalid: Array<{ row: number; data: any; errors: string[] }> = [];

      csvData.slice(1).forEach((row, index) => {
        const errors: string[] = [];
        const productData: any = {
          user_id: '21766c53-a16b-4019-9a11-845ecea8cf10',
        };

        mappedColumns.forEach(col => {
          const csvIndex = csvData[0].indexOf(col.csvColumn);
          const cell = row[csvIndex];
          const value = typeof cell === 'string'
            ? cell.trim()
            : cell != null
              ? String(cell).trim()
              : '';
              
          if (col.required && !value) {
            let label = '';
            if (col.productField !== null) {
              label = productFields.find(f => f.key === col.productField)?.label || '';
            }
            errors.push(`${label} è obbligatorio`);
          }

          if (col.productField === 'unit_price' && value) {
            const price = parseFloat(value);
            if (isNaN(price)) {
              errors.push('Prezzo non valido');
            } else {
              productData[col.productField] = price;
            }
          } else if (col.productField === 'weight_kg' && value) {
            const weight = parseFloat(value);
            if (isNaN(weight)) {
              errors.push('Peso non valido');
            } else {
              productData[col.productField] = weight;
            }
          } else if (col.productField === 'active') {
            productData[col.productField] = ['true', '1', 'yes', 'si'].includes(value.toLowerCase());
          } else {
            if (col.productField) {
              productData[col.productField] = value || null;
            }
          }
        });

        if (!productData.sku) {
          errors.push('SKU è obbligatorio');
        }
        if (!productData.description) {
          errors.push('Descrizione è obbligatoria');
        }

        if (errors.length === 0) {
          valid.push({
            ...productData,
            id: `temp_${index}`,
            active: productData.active ?? true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as Product);
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

    setIsProcessing(true);
    try {
      const existingSkus = new Set(existingProducts.map(p => p.sku));
      const toReplace: Product[] = [];
      const toAdd: Product[] = [];

      preview.valid.forEach(product => {
        if (existingSkus.has(product.sku)) {
          toReplace.push(product);
        } else {
          toAdd.push(product);
        }
      });

      setDuplicatesAnalysis({
        total: preview.valid.length,
        duplicates: toReplace.length,
        newProducts: toAdd.length,
        toReplace,
        toAdd
      });

      setCurrentStep('options');
    } catch (error) {
      console.error('Errore nell\'analisi duplicati:', error);
      alert('Errore nell\'analisi duplicati');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    if (!preview || !duplicatesAnalysis) return;
    
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

      // Simula import - sostituisci con chiamata API reale
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (onImportComplete) {
        onImportComplete({
          mode: importMode,
          imported: productsToImport.length,
          replaced: importMode === 'replace' ? duplicatesAnalysis.duplicates : 0,
          skipped: importMode === 'new_only' ? duplicatesAnalysis.duplicates : 0,
          products: productsToImport
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Errore nell\'import:', error);
      alert('Errore durante l\'import');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h2 className={styles.title}>Import Products</h2>
            <p className={styles.subtitle}>Upload and import your product data</p>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        {/* Steps Progress */}
        <div className={styles.stepsContainer}>
          <div className={styles.stepWrapper}>
            {steps.map((step, index) => {
              const status = getStepStatus(step.id);
              const StepIcon = step.icon;
              
              return (
                <React.Fragment key={step.id}>
                  <div className={`${styles.step} ${styles[`step${status.charAt(0).toUpperCase() + status.slice(1)}`]}`}>
                    <div className={styles.stepIcon}>
                      <StepIcon size={18} />
                    </div>
                    <span className={styles.stepLabel}>{step.label}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`${styles.stepConnector} ${status === 'completed' ? styles.stepConnectorCompleted : ''}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Upload Step */}
          {currentStep === 'upload' && (
            <div className={styles.uploadStep}>
              {file ? (
                <div className={styles.filePreview}>
                  <FileSpreadsheet size={24} color="#3b82f6" />
                  <div>
                    <p className={styles.fileName}>{file.name}</p>
                    <p className={styles.fileSize}>{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button 
                    onClick={() => { setFile(null); setCsvData([]); setColumns([]); }}
                    className={styles.backButton}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div 
                  className={`${styles.dropZone} ${isDragOver ? styles.dropZoneActive : ''}`}
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                >
                  <Upload size={48} className={styles.uploadIcon} />
                  <h3>Drop your CSV or Excel file here</h3>
                  <p>Or click to browse files (CSV, XLSX, XLS formats supported)</p>
                  <button className={styles.browseButton} onClick={() => fileInputRef.current?.click()}>
                    Browse Files
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv, .xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                    className={styles.fileInput}
                  />
                </div>
              )}

              <div className={styles.stepActions}>
                <button 
                  onClick={() => setCurrentStep('mapping')} 
                  disabled={!file || isProcessing}
                  className={styles.nextButton}
                >
                  {isProcessing ? 'Processing...' : 'Next: Map Columns'}
                </button>
              </div>
            </div>
          )}

          {/* Mapping Step */}
          {currentStep === 'mapping' && (
            <div className={styles.mappingStep}>
              <div>
                <h3>Map CSV Columns to Product Fields</h3>
                <p>Match your CSV columns with the product fields below</p>
              </div>

              <div style={{ flex: 1, overflowY: 'auto' }}>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {columns.map((col, index) => (
                    <div key={index} style={{
                      background: 'rgba(255, 255, 255, 0.6)',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 200px',
                      gap: '16px',
                      alignItems: 'center'
                    }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: '14px' }}>{col.csvColumn}</p>
                        {col.sample && (
                          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'rgba(0, 0, 0, 0.5)' }}>
                            Sample: {col.sample}
                          </p>
                        )}
                      </div>

                      <div>
                        <select
                          value={col.productField || ''}
                          onChange={(e) => handleColumnMapping(col.csvColumn, e.target.value as keyof Product || null)}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid rgba(0, 0, 0, 0.2)',
                            background: 'rgba(255, 255, 255, 0.8)',
                            fontSize: '14px'
                          }}
                        >
                          <option value="">Select field...</option>
                          {productFields.map(field => (
                            <option key={field.key} value={field.key}>
                              {field.label} {field.required ? '*' : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        {col.required && (
                          <span style={{ 
                            fontSize: '12px', 
                            color: '#dc2626',
                            fontWeight: 500
                          }}>
                            Required
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.stepActions}>
                <button onClick={() => setCurrentStep('upload')} className={styles.backButton}>
                  Back
                </button>
                <button 
                  onClick={generatePreview}
                  disabled={!columns.some(col => col.productField) || isProcessing}
                  className={styles.nextButton}
                >
                  {isProcessing ? 'Generating...' : 'Preview Import'}
                </button>
              </div>
            </div>
          )}

          {/* Preview Step */}
          {currentStep === 'preview' && preview && (
            <div className={styles.mappingStep}>
              <div>
                <h3>Import Preview</h3>
                <p>Review your data before importing</p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px',
                marginBottom: '20px'
              }}>
                <div style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center'
                }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: 600, color: '#22c55e' }}>
                    {preview.summary.valid}
                  </p>
                  <p style={{ margin: 0, fontSize: '14px', color: 'rgba(0, 0, 0, 0.6)' }}>Valid Records</p>
                </div>

                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center'
                }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: 600, color: '#ef4444' }}>
                    {preview.summary.invalid}
                  </p>
                  <p style={{ margin: 0, fontSize: '14px', color: 'rgba(0, 0, 0, 0.6)' }}>Errors</p>
                </div>

                <div style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center'
                }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: 600, color: '#3b82f6' }}>
                    {preview.summary.total}
                  </p>
                  <p style={{ margin: 0, fontSize: '14px', color: 'rgba(0, 0, 0, 0.6)' }}>Total Records</p>
                </div>
              </div>

              {preview.invalid.length > 0 && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.05)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '12px',
                  padding: '16px',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#ef4444', fontSize: '16px' }}>
                    <AlertCircle size={16} style={{ display: 'inline', marginRight: '8px' }} />
                    Errors Found
                  </h4>
                  {preview.invalid.map((item, index) => (
                    <div key={index} style={{ marginBottom: '8px', fontSize: '14px' }}>
                      <strong>Row {item.row}:</strong> {item.errors.join(', ')}
                    </div>
                  ))}
                </div>
              )}

              <div className={styles.stepActions}>
                <button onClick={() => setCurrentStep('mapping')} className={styles.backButton}>
                  Back
                </button>
                <button 
                  onClick={analyzeDuplicates}
                  disabled={preview.summary.valid === 0 || isProcessing}
                  className={styles.nextButton}
                >
                  {isProcessing ? 'Analyzing...' : 'Check for Duplicates'}
                </button>
              </div>
            </div>
          )}

          {/* Options Step */}
          {currentStep === 'options' && duplicatesAnalysis && (
            <div className={styles.mappingStep}>
              <div>
                <h3>Import Options</h3>
                <p>Choose how to handle duplicate products</p>
              </div>

              {/* Duplicates Summary */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px',
                marginBottom: '24px'
              }}>
                <div style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center'
                }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: 600, color: '#3b82f6' }}>
                    {duplicatesAnalysis.total}
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: 'rgba(0, 0, 0, 0.6)' }}>Total Products</p>
                </div>

                <div style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center'
                }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: 600, color: '#22c55e' }}>
                    {duplicatesAnalysis.newProducts}
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: 'rgba(0, 0, 0, 0.6)' }}>New Products</p>
                </div>

                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center'
                }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: 600, color: '#ef4444' }}>
                    {duplicatesAnalysis.duplicates}
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: 'rgba(0, 0, 0, 0.6)' }}>Duplicates Found</p>
                </div>
              </div>

              {/* Import Mode Selection */}
              <div style={{ flex: 1, overflowY: 'auto' }}>
                <div style={{ display: 'grid', gap: '16px' }}>
                  {importModeOptions.map((option) => {
                    const OptionIcon = option.icon;
                    const isSelected = importMode === option.id;
                    
                    return (
                      <div
                        key={option.id}
                        onClick={() => setImportMode(option.id)}
                        style={{
                          background: isSelected ? `rgba(${option.color === '#f59e0b' ? '245, 158, 11' : option.color === '#10b981' ? '16, 185, 129' : '59, 130, 246'}, 0.1)` : 'rgba(255, 255, 255, 0.6)',
                          border: `2px solid ${isSelected ? option.color : 'rgba(0, 0, 0, 0.1)'}`,
                          borderRadius: '16px',
                          padding: '20px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px'
                        }}
                      >
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '12px',
                          background: `rgba(${option.color === '#f59e0b' ? '245, 158, 11' : option.color === '#10b981' ? '16, 185, 129' : '59, 130, 246'}, 0.15)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: option.color
                        }}>
                          <OptionIcon size={24} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 4px 0', color: 'rgba(0, 0, 0, 0.9)', fontSize: '16px' }}>
                            {option.title}
                          </h4>
                          <p style={{ margin: 0, color: 'rgba(0, 0, 0, 0.6)', fontSize: '14px' }}>
                            {option.description}
                          </p>
                        </div>
                        {isSelected && (
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: option.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <CheckCircle size={16} color="white" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={styles.stepActions}>
                <button onClick={() => setCurrentStep('preview')} className={styles.backButton}>
                  Back
                </button>
                <button 
                  onClick={handleImport}
                  disabled={isProcessing}
                  className={styles.nextButton}
                >
                  {isProcessing ? 'Importing...' : `Import Products`}
                </button>
              </div>
            </div>
          )}

          {/* Import Step */}
          {currentStep === 'import' && (
            <div className={styles.uploadStep}>
              <div style={{
                textAlign: 'center',
                padding: '40px',
                background: 'rgba(34, 197, 94, 0.05)',
                borderRadius: '20px',
                border: '1px solid rgba(34, 197, 94, 0.2)'
              }}>
                <CheckCircle size={64} color="#22c55e" style={{ marginBottom: '16px' }} />
                <h3 style={{ color: '#22c55e', margin: '0 0 8px 0' }}>
                  {isProcessing ? 'Importing...' : 'Import Complete!'}
                </h3>
                <p style={{ margin: 0, color: 'rgba(0, 0, 0, 0.6)' }}>
                  {isProcessing ? 'Please wait while we import your products' : 'Products imported successfully'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}