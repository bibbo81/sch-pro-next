import { Product, DatabaseProduct, CreateProduct } from '@/types/product'

// ✅ HELPER per convertire null → undefined (FIXED)
const nullToUndefined = <T>(value: T | null): T | undefined => {
  return value === null ? undefined : value
}

// ✅ HELPER per convertire undefined → null
const undefinedToNull = <T>(value: T | undefined): T | null => {
  return value === undefined ? null : value
}

// ✅ DATABASE → PRODUCT (per lettura)
export function adaptDatabaseProduct(dbProduct: DatabaseProduct): Product {
  return {
    id: dbProduct.id,
    user_id: nullToUndefined(dbProduct.organization_id), // ✅ CONVERTI null → undefined
    organization_id: nullToUndefined(dbProduct.organization_id), // ✅ CONVERTI null → undefined
    sku: dbProduct.sku || '',
    description: dbProduct.description || '', // ✅ Usa description del DB
    name: nullToUndefined(dbProduct.description), // ✅ Mappa description → name se necessario
    category: undefined, // ✅ FIX: Usa undefined diretto invece di nullToUndefined(null)
    unit_price: nullToUndefined(dbProduct.unit_price), // ✅ Usa unit_price dal DB
    price: nullToUndefined(dbProduct.unit_price), // ✅ Mappa unit_price → price
    currency: dbProduct.currency || 'EUR', // ✅ Default currency
    active: true, // ✅ DEFAULT se non presente nel DB
    created_at: dbProduct.created_at,
    updated_at: dbProduct.updated_at,
    // ✅ Altri campi con undefined (corretti per Product type)
    weight_kg: undefined,
    dimensions: undefined,
    volume_cbm: undefined,
    quantity: undefined,
    min_stock: undefined,
    max_stock: undefined,
    ean: undefined,
    hs_code: undefined,
    origin_country: undefined,
    country_of_origin: undefined,
    supplier_name: undefined,
    supplier_code: undefined,
    other_description: undefined,
    notes: undefined,
    image_url: undefined,
    metadata: undefined, // ✅ undefined invece di null
  }
}

// ✅ PRODUCT → DATABASE (per scrittura)
export function productToDatabaseProduct(product: Partial<Product>, userId: string, organizationId?: string): Partial<DatabaseProduct> {
  return {
    id: product.id,
    user_id: userId,
    organization_id: organizationId || undefinedToNull(product.organization_id),
    sku: product.sku || '',
    description: product.description || product.name || '',
    unit_price: product.unit_price || product.price || undefined,
    currency: product.currency || 'EUR',
    created_at: product.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
}

// ✅ CREATE PRODUCT → PRODUCT (per form handling)
export function createProductToProduct(createProduct: CreateProduct): Partial<Product> {
  return {
    name: nullToUndefined(createProduct.name),
    description: createProduct.description || '', // ✅ description è required
    sku: createProduct.sku || '', // ✅ sku è required
    unit_price: nullToUndefined(createProduct.unit_price || createProduct.price),
    price: nullToUndefined(createProduct.price || createProduct.unit_price),
    currency: nullToUndefined(createProduct.currency),
    category: nullToUndefined(createProduct.category),
    weight_kg: nullToUndefined(createProduct.weight_kg),
    dimensions: nullToUndefined(createProduct.dimensions),
    volume_cbm: nullToUndefined(createProduct.volume_cbm),
    quantity: nullToUndefined(createProduct.quantity),
    min_stock: nullToUndefined(createProduct.min_stock),
    max_stock: nullToUndefined(createProduct.max_stock),
    active: createProduct.active ?? true,
    ean: nullToUndefined(createProduct.ean),
    hs_code: nullToUndefined(createProduct.hs_code),
    origin_country: nullToUndefined(createProduct.origin_country || createProduct.country_of_origin),
    country_of_origin: nullToUndefined(createProduct.country_of_origin || createProduct.origin_country),
    supplier_name: nullToUndefined(createProduct.supplier_name || createProduct.supplier),
    supplier_code: nullToUndefined(createProduct.supplier_code),
    other_description: nullToUndefined(createProduct.other_description),
    notes: nullToUndefined(createProduct.notes),
    image_url: nullToUndefined(createProduct.image_url),
    metadata: nullToUndefined(createProduct.metadata)
  }
}

// ✅ PRODUCT → CREATE PRODUCT (per editing)
export function productToCreateProduct(product: Product): CreateProduct {
  return {
    name: undefinedToNull(product.name),
    description: product.description || null, // ✅ CreateProduct usa null
    sku: product.sku || null, // ✅ CreateProduct usa null
    unit_price: undefinedToNull(product.unit_price || product.price),
    price: undefinedToNull(product.price || product.unit_price),
    currency: undefinedToNull(product.currency),
    category: undefinedToNull(product.category),
    weight_kg: undefinedToNull(product.weight_kg),
    dimensions: undefinedToNull(product.dimensions),
    volume_cbm: undefinedToNull(product.volume_cbm),
    quantity: undefinedToNull(product.quantity),
    min_stock: undefinedToNull(product.min_stock),
    max_stock: undefinedToNull(product.max_stock),
    active: product.active ?? true,
    ean: undefinedToNull(product.ean),
    hs_code: undefinedToNull(product.hs_code),
    origin_country: undefinedToNull(product.origin_country || product.country_of_origin),
    country_of_origin: undefinedToNull(product.country_of_origin || product.origin_country),
    supplier: undefinedToNull(product.supplier_name),
    supplier_name: undefinedToNull(product.supplier_name),
    supplier_code: undefinedToNull(product.supplier_code),
    other_description: undefinedToNull(product.other_description),
    notes: undefinedToNull(product.notes),
    image_url: undefinedToNull(product.image_url),
    metadata: undefinedToNull(product.metadata)
  }
}

// ✅ Adapter per lista di prodotti
export function adaptDatabaseProducts(dbProducts: DatabaseProduct[]): Product[] {
  return dbProducts.map(adaptDatabaseProduct)
}

// ✅ VALIDATION HELPERS
export function validateCreateProduct(createProduct: CreateProduct): string[] {
  const errors: string[] = []

  if (!createProduct.description?.trim()) {
    errors.push('La descrizione è obbligatoria')
  }

  if (!createProduct.sku?.trim()) {
    errors.push('Il codice SKU è obbligatorio')
  }

  if (createProduct.unit_price !== null && createProduct.unit_price !== undefined && createProduct.unit_price < 0) {
    errors.push('Il prezzo unitario non può essere negativo')
  }

  if (createProduct.quantity !== null && createProduct.quantity !== undefined && createProduct.quantity < 0) {
    errors.push('La quantità non può essere negativa')
  }

  if (createProduct.weight_kg !== null && createProduct.weight_kg !== undefined && createProduct.weight_kg < 0) {
    errors.push('Il peso non può essere negativo')
  }

  return errors
}

// ✅ UTILITY per pulire campi undefined da oggetti (per API calls)
export function cleanUndefinedFields<T extends Record<string, any>>(obj: T): Partial<T> {
  const cleaned = {} as Partial<T>
  
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key as keyof T] = value
    }
  }
  
  return cleaned
}

// ✅ UTILITY per convertire tutti i null in undefined in un oggetto
export function nullsToUndefined<T extends Record<string, any>>(obj: T): T {
  const result = {} as T
  
  for (const [key, value] of Object.entries(obj)) {
    result[key as keyof T] = value === null ? undefined : value
  }
  
  return result
}

// ✅ UTILITY per convertire tutti gli undefined in null in un oggetto
export function undefinedsToNull<T extends Record<string, any>>(obj: T): T {
  const result = {} as T
  
  for (const [key, value] of Object.entries(obj)) {
    result[key as keyof T] = value === undefined ? null : value
  }
  
  return result
}