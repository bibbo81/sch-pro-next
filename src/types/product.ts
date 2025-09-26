// ✅ INTERFACCIA PRINCIPALE - Compatibile con DB reale E useProducts
export interface Product {
  id: string
  
  // ✅ COMPATIBILITÀ DUAL: Supporta sia user_id che organization_id
  user_id?: string              // ✅ Per compatibilità con codice esistente
  organization_id?: string      // ✅ Per compatibilità con database reale
  
  // ✅ CAMPI CORE - UNIFICATI (string senza null per compatibilità React)
  sku: string                   // ✅ REQUIRED per compatibilità
  name?: string                 // ✅ Campo name dal database
  description: string           // ✅ REQUIRED string senza null
  category?: string
  
  // ✅ PREZZI - Dual compatibility (senza null per React)
  unit_price?: number          // ✅ Per compatibilità codice esistente
  price?: number               // ✅ Campo price dal database
  currency?: string
  
  // ✅ DIMENSIONI E PESO
  weight_kg?: number
  dimensions?: string
  dimensions_cm?: any          // ✅ JSON field per dimensioni dettagliate
  volume_cbm?: number          // ✅ Aggiungo per compatibilità shipments
  
  // ✅ STOCK E INVENTORY - AGGIUNTI per compatibilità dashboard
  quantity?: number            // ✅ Per stats dashboard
  min_stock?: number           // ✅ Per low stock detection
  max_stock?: number
  stock_location?: string
  reorder_point?: number
  
  // ✅ STATUS
  active: boolean              // ✅ REQUIRED boolean senza null
  
  // ✅ CODICI E IDENTIFICATORI
  ean?: string
  hs_code?: string
  barcode?: string             // ✅ AGGIUNTO per compatibilità useProducts
  
  // ✅ ORIGINE E FORNITORI
  origin_country?: string
  country_of_origin?: string   // ✅ Alias per origin_country
  supplier?: string            // ✅ AGGIUNTO per compatibilità useProducts
  supplier_name?: string
  supplier_code?: string
  supplier_sku?: string        // ✅ AGGIUNTO per compatibilità useProducts
  
  // ✅ PREZZI AGGIUNTIVI per useProducts compatibility
  cost_price?: number          // ✅ Prezzo di costo
  sale_price?: number          // ✅ Prezzo di vendita
  tax_rate?: number            // ✅ Aliquota fiscale
  
  // ✅ DESCRIZIONI AGGIUNTIVE
  other_description?: string
  notes?: string
  
  // ✅ MEDIA E METADATI
  image_url?: string
  metadata?: any               // ✅ JSON field
  
  // ✅ CAMPI PER LA GESTIONE MAGAZZINO (da useProducts)
  warehouse_id?: string        // ✅ ID magazzino
  shelf_location?: string      // ✅ Posizione scaffale
  last_inventory_date?: string // ✅ Ultima data inventario
  lead_time_days?: number      // ✅ Tempo di consegna in giorni
  
  // ✅ CAMPI PER E-COMMERCE (da useProducts)
  is_published?: boolean       // ✅ Pubblicato online
  seo_title?: string           // ✅ Titolo SEO
  seo_description?: string     // ✅ Descrizione SEO
  tags?: string[]              // ✅ Tag del prodotto
  
  // ✅ TIMESTAMP - Required dal database
  created_at: string
  updated_at: string
}

// ✅ INTERFACCIA PER DATI RAW DAL DATABASE (può avere null)
export interface DatabaseProduct {
  id: string
  organization_id: string | null
  user_id: string
  description: string | null   // ✅ Può essere null nel DB
  sku: string | null          // ✅ Può essere null nel DB
  unit_price: number | null
  currency: string | null
  category: string | null
  weight_kg: number | null
  dimensions_cm: any | null
  ean: string | null
  hs_code: string | null
  origin_country: string | null
  other_description: string | null
  active: boolean | null
  metadata: any | null
  created_at: string
  updated_at: string
}

// ✅ INTERFACCIA PER CREAZIONE PRODOTTI - CON TUTTI I CAMPI E NULL PERMESSI
export interface CreateProduct {
  // ✅ CAMPI BASE (possono essere null per i form)
  organization_id?: string
  name?: string | null
  sku?: string | null
  description?: string | null
  price?: number | null
  unit_price?: number | null   // ✅ Alias per compatibilità
  currency?: string | null
  category?: string | null
  weight_kg?: number | null
  dimensions?: string | null
  dimensions_cm?: any | null
  volume_cbm?: number | null
  
  // ✅ STOCK FIELDS
  quantity?: number | null
  min_stock?: number | null
  max_stock?: number | null
  stock_location?: string | null
  reorder_point?: number | null
  
  // ✅ STATUS
  active?: boolean | null
  
  // ✅ CODICI
  ean?: string | null
  hs_code?: string | null
  barcode?: string | null
  
  // ✅ FORNITORI
  origin_country?: string | null
  country_of_origin?: string | null
  supplier?: string | null
  supplier_name?: string | null
  supplier_code?: string | null
  supplier_sku?: string | null
  
  // ✅ PREZZI AGGIUNTIVI
  cost_price?: number | null
  sale_price?: number | null
  tax_rate?: number | null
  
  // ✅ DESCRIZIONI
  other_description?: string | null
  notes?: string | null
  
  // ✅ MEDIA
  image_url?: string | null
  metadata?: any | null
  
  // ✅ MAGAZZINO
  warehouse_id?: string | null
  shelf_location?: string | null
  last_inventory_date?: string | null
  lead_time_days?: number | null
  
  // ✅ E-COMMERCE
  is_published?: boolean | null
  seo_title?: string | null
  seo_description?: string | null
  tags?: string[] | null
}

// ✅ INTERFACCIA PER UPDATE PRODOTTI
export interface UpdateProduct extends Partial<CreateProduct> {
  id?: never // ✅ Previene update dell'ID
  updated_at?: never // ✅ Gestito automaticamente
  created_at?: never // ✅ Non modificabile
}

// ✅ HELPER per convertire CreateProduct → Partial<Product> (PULISCE NULL)
export function createProductToProduct(createProduct: CreateProduct): Partial<Product> {
  const product: Partial<Product> = {}
  
  // ✅ CAMPI STRINGA - converte null → undefined
  if (createProduct.name !== null && createProduct.name !== undefined && createProduct.name.trim()) {
    product.name = createProduct.name.trim()
  }
  if (createProduct.description !== null && createProduct.description !== undefined && createProduct.description.trim()) {
    product.description = createProduct.description.trim()
  }
  if (createProduct.sku !== null && createProduct.sku !== undefined && createProduct.sku.trim()) {
    product.sku = createProduct.sku.trim()
  }
  if (createProduct.category !== null && createProduct.category !== undefined && createProduct.category.trim()) {
    product.category = createProduct.category.trim()
  }
  if (createProduct.currency !== null && createProduct.currency !== undefined && createProduct.currency.trim()) {
    product.currency = createProduct.currency.trim()
  }
  
  // ✅ CAMPI NUMERICI - converte null → undefined
  if (createProduct.price !== null && createProduct.price !== undefined) {
    product.unit_price = createProduct.price
  }
  if (createProduct.unit_price !== null && createProduct.unit_price !== undefined) {
    product.unit_price = createProduct.unit_price
  }
  if (createProduct.weight_kg !== null && createProduct.weight_kg !== undefined) {
    product.weight_kg = createProduct.weight_kg
  }
  if (createProduct.quantity !== null && createProduct.quantity !== undefined) {
    product.quantity = createProduct.quantity
  }
  if (createProduct.min_stock !== null && createProduct.min_stock !== undefined) {
    product.min_stock = createProduct.min_stock
  }
  if (createProduct.max_stock !== null && createProduct.max_stock !== undefined) {
    product.max_stock = createProduct.max_stock
  }
  if (createProduct.cost_price !== null && createProduct.cost_price !== undefined) {
    product.cost_price = createProduct.cost_price
  }
  if (createProduct.sale_price !== null && createProduct.sale_price !== undefined) {
    product.sale_price = createProduct.sale_price
  }
  if (createProduct.tax_rate !== null && createProduct.tax_rate !== undefined) {
    product.tax_rate = createProduct.tax_rate
  }
  if (createProduct.reorder_point !== null && createProduct.reorder_point !== undefined) {
    product.reorder_point = createProduct.reorder_point
  }
  if (createProduct.lead_time_days !== null && createProduct.lead_time_days !== undefined) {
    product.lead_time_days = createProduct.lead_time_days
  }
  
  // ✅ CAMPI STRINGA OPZIONALI
  if (createProduct.ean !== null && createProduct.ean !== undefined && createProduct.ean.trim()) {
    product.ean = createProduct.ean.trim()
  }
  if (createProduct.hs_code !== null && createProduct.hs_code !== undefined && createProduct.hs_code.trim()) {
    product.hs_code = createProduct.hs_code.trim()
  }
  if (createProduct.barcode !== null && createProduct.barcode !== undefined && createProduct.barcode.trim()) {
    product.barcode = createProduct.barcode.trim()
  }
  if (createProduct.origin_country !== null && createProduct.origin_country !== undefined && createProduct.origin_country.trim()) {
    product.origin_country = createProduct.origin_country.trim()
  }
  if (createProduct.supplier !== null && createProduct.supplier !== undefined && createProduct.supplier.trim()) {
    product.supplier = createProduct.supplier.trim()
  }
  if (createProduct.supplier_name !== null && createProduct.supplier_name !== undefined && createProduct.supplier_name.trim()) {
    product.supplier_name = createProduct.supplier_name.trim()
  }
  if (createProduct.supplier_code !== null && createProduct.supplier_code !== undefined && createProduct.supplier_code.trim()) {
    product.supplier_code = createProduct.supplier_code.trim()
  }
  if (createProduct.supplier_sku !== null && createProduct.supplier_sku !== undefined && createProduct.supplier_sku.trim()) {
    product.supplier_sku = createProduct.supplier_sku.trim()
  }
  if (createProduct.other_description !== null && createProduct.other_description !== undefined && createProduct.other_description.trim()) {
    product.other_description = createProduct.other_description.trim()
  }
  if (createProduct.notes !== null && createProduct.notes !== undefined && createProduct.notes.trim()) {
    product.notes = createProduct.notes.trim()
  }
  if (createProduct.image_url !== null && createProduct.image_url !== undefined && createProduct.image_url.trim()) {
    product.image_url = createProduct.image_url.trim()
  }
  if (createProduct.stock_location !== null && createProduct.stock_location !== undefined && createProduct.stock_location.trim()) {
    product.stock_location = createProduct.stock_location.trim()
  }
  if (createProduct.warehouse_id !== null && createProduct.warehouse_id !== undefined && createProduct.warehouse_id.trim()) {
    product.warehouse_id = createProduct.warehouse_id.trim()
  }
  if (createProduct.shelf_location !== null && createProduct.shelf_location !== undefined && createProduct.shelf_location.trim()) {
    product.shelf_location = createProduct.shelf_location.trim()
  }
  if (createProduct.seo_title !== null && createProduct.seo_title !== undefined && createProduct.seo_title.trim()) {
    product.seo_title = createProduct.seo_title.trim()
  }
  if (createProduct.seo_description !== null && createProduct.seo_description !== undefined && createProduct.seo_description.trim()) {
    product.seo_description = createProduct.seo_description.trim()
  }
  
  // ✅ CAMPI BOOLEAN - gestione speciale
  if (createProduct.active !== null && createProduct.active !== undefined) {
    product.active = createProduct.active
  } else {
    product.active = true // ✅ DEFAULT true se non specificato
  }
  if (createProduct.is_published !== null && createProduct.is_published !== undefined) {
    product.is_published = createProduct.is_published
  }
  
  // ✅ CAMPI ARRAY E OGGETTI
  if (createProduct.tags && Array.isArray(createProduct.tags) && createProduct.tags.length > 0) {
    product.tags = createProduct.tags.filter(tag => tag && tag.trim()).map(tag => tag.trim())
  }
  if (createProduct.metadata !== null && createProduct.metadata !== undefined) {
    product.metadata = createProduct.metadata
  }
  if (createProduct.dimensions_cm !== null && createProduct.dimensions_cm !== undefined) {
    product.dimensions_cm = createProduct.dimensions_cm
  }
  
  // ✅ CAMPI DATA
  if (createProduct.last_inventory_date !== null && createProduct.last_inventory_date !== undefined && createProduct.last_inventory_date.trim()) {
    product.last_inventory_date = createProduct.last_inventory_date.trim()
  }
  
  return product
}

// ✅ HELPER per convertire DatabaseProduct → Product (per uso frontend)
export function databaseProductToProduct(dbProduct: DatabaseProduct): Product {
  return {
    id: dbProduct.id,
    organization_id: dbProduct.organization_id || undefined,
    user_id: dbProduct.user_id,
    description: dbProduct.description || '', // ✅ DEFAULT empty string
    sku: dbProduct.sku || '',                 // ✅ DEFAULT empty string
    unit_price: dbProduct.unit_price || undefined,
    currency: dbProduct.currency || undefined,
    category: dbProduct.category || undefined,
    weight_kg: dbProduct.weight_kg || undefined,
    dimensions_cm: dbProduct.dimensions_cm || undefined,
    ean: dbProduct.ean || undefined,
    hs_code: dbProduct.hs_code || undefined,
    origin_country: dbProduct.origin_country || undefined,
    other_description: dbProduct.other_description || undefined,
    active: dbProduct.active ?? true, // ✅ DEFAULT true
    metadata: dbProduct.metadata || undefined,
    created_at: dbProduct.created_at,
    updated_at: dbProduct.updated_at,
  }
}

// ✅ RESTO DEL CODICE - FILTRI, IMPORT, ETC (rimane uguale)
export interface FilterState {
  search: string
  category: string
  priceRange: [number, number]
  active: boolean | null
  lowStock?: boolean
  outOfStock?: boolean
  supplier?: string
  country?: string
}

export interface ImportColumn {
  key: keyof Product | 'ignore'
  label: string
  required?: boolean
  type?: 'string' | 'number' | 'boolean'
  example?: string
  description?: string
}

export interface ImportPreview {
  valid: boolean
  errors: string[]
  warnings: string[]
  data: Partial<Product>
  rowNumber?: number
}

export interface ImportResult {
  success: boolean
  totalRows: number
  successfulRows: number
  failedRows: number
  errors: Array<{
    row: number
    error: string
    data?: Partial<Product>
  }>
  warnings: Array<{
    row: number
    warning: string
    data?: Partial<Product>
  }>
}

// ✅ CONFIGURAZIONI DEFAULT
export const defaultFilters: FilterState = {
  search: '',
  category: '',
  priceRange: [0, 10000],
  active: null,
  lowStock: false,
  outOfStock: false,
  supplier: '',
  country: ''
}

export const defaultProduct: Partial<CreateProduct> = {
  name: '',
  sku: '',
  description: '',
  category: '',
  price: null,
  currency: 'EUR',
  weight_kg: null,
  quantity: null,
  min_stock: null,
  max_stock: null,
  active: true,
  ean: '',
  hs_code: '',
  origin_country: '',
  supplier_name: '',
  supplier_code: '',
  notes: '',
  image_url: ''
}

// ✅ UTILITIES - AGGIORNATE per compatibilità
export const formatPrice = (price: number | null | undefined, currency = 'EUR'): string => {
  if (price === null || price === undefined || isNaN(price)) return '-'
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: currency.toUpperCase()
  }).format(price)
}

export const formatWeight = (weight: number | null | undefined): string => {
  if (weight === null || weight === undefined || isNaN(weight)) return '-'
  return `${weight} kg`
}

export const getStockStatus = (product: Product): 'in_stock' | 'low_stock' | 'out_of_stock' => {
  const qty = product.quantity || 0
  const minStock = product.min_stock || 10 // ✅ DEFAULT 10 se non specificato
  
  if (qty === 0) return 'out_of_stock'
  if (qty <= minStock) return 'low_stock'
  return 'in_stock'
}

export const getStockStatusLabel = (status: string): string => {
  const labels = {
    'in_stock': 'Disponibile',
    'low_stock': 'Scorte basse',
    'out_of_stock': 'Esaurito'
  }
  return labels[status as keyof typeof labels] || 'Sconosciuto'
}

export const getStockStatusColor = (status: string): string => {
  const colors = {
    'in_stock': 'text-green-600 bg-green-50 border-green-200',
    'low_stock': 'text-yellow-600 bg-yellow-50 border-yellow-200',
    'out_of_stock': 'text-red-600 bg-red-50 border-red-200'
  }
  return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-50 border-gray-200'
}

// ✅ VALIDATORI - AGGIORNATI
export const validateProduct = (product: Partial<Product>): ImportPreview => {
  const errors: string[] = []
  const warnings: string[] = []

  // Validazioni required
  if (!product.name && !product.description) {
    errors.push('Nome o Descrizione è obbligatorio')
  }

  if (!product.sku || product.sku.trim() === '') {
    errors.push('SKU è obbligatorio')
  }

  // Validazioni formato
  if (product.unit_price !== undefined && (product.unit_price < 0 || product.unit_price > 999999)) {
    errors.push('Prezzo deve essere tra 0 e 999,999')
  }

  if (product.weight_kg !== undefined && (product.weight_kg < 0 || product.weight_kg > 9999)) {
    errors.push('Peso deve essere tra 0 e 9,999 kg')
  }

  if (product.ean && !/^\d{8,14}$/.test(product.ean)) {
    warnings.push('EAN dovrebbe essere un codice numerico di 8-14 cifre')
  }

  if (product.hs_code && !/^\d{4,10}(\.\d{2,4})*$/.test(product.hs_code)) {
    warnings.push('Codice HS formato non standard')
  }

  // Validazioni stock
  if (product.min_stock !== undefined && product.max_stock !== undefined && product.min_stock > product.max_stock) {
    errors.push('Stock minimo non può essere maggiore di stock massimo')
  }

  if (product.quantity !== undefined && product.min_stock !== undefined && product.quantity < product.min_stock) {
    warnings.push('Quantità corrente è sotto il livello minimo')
  }

  // Validazioni URL
  if (product.image_url && !/^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(product.image_url)) {
    warnings.push('URL immagine non sembra valido')
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    data: product
  }
}

// ✅ CONSTANTS
export const SUPPORTED_CURRENCIES = [
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' }
]

export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Clothing & Accessories',
  'Home & Garden',
  'Sports & Outdoors',
  'Books & Media',
  'Health & Beauty',
  'Food & Beverages',
  'Automotive',
  'Industrial',
  'Office Supplies',
  'Toys & Games',
  'Other'
]

export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const SUPPORTED_IMPORT_TYPES = ['.csv', '.xlsx', '.xls']

// ✅ COLONNE DISPONIBILI PER IMPORT - AGGIORNATE e complete
export const availableColumns: ImportColumn[] = [
  { 
    key: 'name', 
    label: 'Nome Prodotto', 
    required: true, 
    type: 'string',
    example: 'iPhone 15 Pro',
    description: 'Nome principale del prodotto'
  },
  { 
    key: 'sku', 
    label: 'SKU', 
    required: true, 
    type: 'string',
    example: 'PROD-001',
    description: 'Codice univoco prodotto'
  },
  { 
    key: 'description', 
    label: 'Descrizione', 
    type: 'string',
    example: 'Smartphone Apple con fotocamera Pro',
    description: 'Descrizione dettagliata del prodotto'
  },
  { 
    key: 'category', 
    label: 'Categoria', 
    type: 'string',
    example: 'Electronics',
    description: 'Categoria merceologica'
  },
  { 
    key: 'unit_price', 
    label: 'Prezzo', 
    type: 'number', 
    example: '1199.99',
    description: 'Prezzo unitario del prodotto'
  },
  { 
    key: 'currency', 
    label: 'Valuta', 
    type: 'string',
    example: 'EUR',
    description: 'Codice valuta (EUR, USD, GBP, etc.)'
  },
  { 
    key: 'weight_kg', 
    label: 'Peso (kg)', 
    type: 'number', 
    example: '0.201',
    description: 'Peso del prodotto in chilogrammi'
  },
  { 
    key: 'quantity', 
    label: 'Quantità in Stock', 
    type: 'number', 
    example: '50',
    description: 'Quantità disponibile in magazzino'
  },
  { 
    key: 'min_stock', 
    label: 'Stock Minimo', 
    type: 'number', 
    example: '10',
    description: 'Quantità minima prima del riordino'
  },
  { 
    key: 'max_stock', 
    label: 'Stock Massimo', 
    type: 'number', 
    example: '1000',
    description: 'Quantità massima in magazzino'
  },
  { 
    key: 'active', 
    label: 'Attivo', 
    type: 'boolean', 
    example: 'true',
    description: 'Se il prodotto è attivo nel catalogo'
  },
  { 
    key: 'ean', 
    label: 'Codice EAN/Barcode', 
    type: 'string',
    example: '1234567890123',
    description: 'Codice a barre EAN-13'
  },
  { 
    key: 'hs_code', 
    label: 'Codice HS/Doganale', 
    type: 'string',
    example: '8517.12.00',
    description: 'Codice doganale per import/export'
  },
  { 
    key: 'origin_country', 
    label: 'Paese di Origine', 
    type: 'string',
    example: 'IT',
    description: 'Codice ISO paese di origine (IT, US, CN, etc.)'
  },
  { 
    key: 'supplier', 
    label: 'Nome Fornitore', 
    type: 'string',
    example: 'Apple Inc.',
    description: 'Nome del fornitore principale'
  },
  { 
    key: 'supplier_sku', 
    label: 'SKU Fornitore', 
    type: 'string',
    example: 'APPLE-IPHONE15P-256',
    description: 'Codice prodotto del fornitore'
  },
  { 
    key: 'other_description', 
    label: 'Descrizione Aggiuntiva', 
    type: 'string',
    example: 'Modello Pro Max con storage 256GB',
    description: 'Descrizione secondaria o dettagli extra'
  },
  { 
    key: 'notes', 
    label: 'Note Interne', 
    type: 'string',
    example: 'Controllare disponibilità prima spedizione',
    description: 'Note interne non visibili al cliente'
  },
  { 
    key: 'image_url', 
    label: 'URL Immagine', 
    type: 'string',
    example: 'https://example.com/images/product.jpg',
    description: 'Link all\'immagine principale del prodotto'
  },
  { 
    key: 'ignore', 
    label: '🚫 Ignora Colonna',
    description: 'Non importare questa colonna'
  }
]