'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabaseClient } from '@/lib/auth-client'
import type { Product, CreateProduct } from '@/types/product'

// ✅ DEFINE EXPLICIT SUPABASE ROW TYPES
interface DatabaseProduct {
  id: string
  organization_id: string
  user_id: string
  name?: string | null
  description: string | null
  sku: string | null
  unit_price?: number | null
  price?: number | null
  currency?: string | null
  category?: string | null
  weight_kg?: number | null
  dimensions?: string | null
  dimensions_cm?: any | null
  volume_cbm?: number | null
  quantity?: number | null
  min_stock?: number | null
  max_stock?: number | null
  stock_location?: string | null
  reorder_point?: number | null
  active: boolean
  ean?: string | null
  hs_code?: string | null
  barcode?: string | null
  origin_country?: string | null
  country_of_origin?: string | null
  supplier?: string | null
  supplier_name?: string | null
  supplier_code?: string | null
  supplier_sku?: string | null
  cost_price?: number | null
  sale_price?: number | null
  tax_rate?: number | null
  other_description?: string | null
  notes?: string | null
  image_url?: string | null
  metadata?: any | null
  warehouse_id?: string | null
  shelf_location?: string | null
  last_inventory_date?: string | null
  lead_time_days?: number | null
  is_published?: boolean | null
  seo_title?: string | null
  seo_description?: string | null
  tags?: string[] | null
  created_at: string
  updated_at: string
}

// ✅ EXPLICIT API RESPONSE TYPES
interface SupabaseResponse<T> {
  data: T | null
  error: any | null
}

interface SupabaseArrayResponse<T> {
  data: T[] | null
  error: any | null
}

export function useSupabaseData() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ✅ HELPER per convertire Product → DatabaseProduct per insert
  const productToDatabaseProduct = useCallback((product: Partial<Product>, userId: string): Partial<DatabaseProduct> => {
    return {
      user_id: userId,
      organization_id: product.organization_id || undefined,
      name: product.name || undefined,
      description: product.description || null,
      sku: product.sku || null,
      unit_price: product.unit_price || undefined,
      price: product.price || undefined,
      currency: product.currency || undefined,
      category: product.category || undefined,
      weight_kg: product.weight_kg || undefined,
      dimensions: product.dimensions || undefined,
      dimensions_cm: product.dimensions_cm || undefined,
      volume_cbm: product.volume_cbm || undefined,
      quantity: product.quantity || undefined,
      min_stock: product.min_stock || undefined,
      max_stock: product.max_stock || undefined,
      stock_location: product.stock_location || undefined,
      reorder_point: product.reorder_point || undefined,
      active: product.active ?? true,
      ean: product.ean || undefined,
      hs_code: product.hs_code || undefined,
      barcode: product.barcode || undefined,
      origin_country: product.origin_country || undefined,
      country_of_origin: product.country_of_origin || undefined,
      supplier: product.supplier || undefined,
      supplier_name: product.supplier_name || undefined,
      supplier_code: product.supplier_code || undefined,
      supplier_sku: product.supplier_sku || undefined,
      cost_price: product.cost_price || undefined,
      sale_price: product.sale_price || undefined,
      tax_rate: product.tax_rate || undefined,
      other_description: product.other_description || undefined,
      notes: product.notes || undefined,
      image_url: product.image_url || undefined,
      metadata: product.metadata || undefined,
      warehouse_id: product.warehouse_id || undefined,
      shelf_location: product.shelf_location || undefined,
      last_inventory_date: product.last_inventory_date || undefined,
      lead_time_days: product.lead_time_days || undefined,
      is_published: product.is_published || undefined,
      seo_title: product.seo_title || undefined,
      seo_description: product.seo_description || undefined,
      tags: product.tags || undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }, [])

  // ✅ HELPER per convertire DatabaseProduct → Product
  const databaseProductToProduct = useCallback((dbProduct: DatabaseProduct): Product => {
    return {
      id: dbProduct.id,
      organization_id: dbProduct.organization_id,
      user_id: dbProduct.user_id,
      name: dbProduct.name || undefined,
      description: dbProduct.description || '',
      sku: dbProduct.sku || '',
      unit_price: dbProduct.unit_price || dbProduct.price || undefined,
      price: dbProduct.price || dbProduct.unit_price || undefined,
      currency: dbProduct.currency || undefined,
      category: dbProduct.category || undefined,
      weight_kg: dbProduct.weight_kg || undefined,
      dimensions: dbProduct.dimensions || undefined,
      dimensions_cm: dbProduct.dimensions_cm || undefined,
      volume_cbm: dbProduct.volume_cbm || undefined,
      quantity: dbProduct.quantity || undefined,
      min_stock: dbProduct.min_stock || undefined,
      max_stock: dbProduct.max_stock || undefined,
      stock_location: dbProduct.stock_location || undefined,
      reorder_point: dbProduct.reorder_point || undefined,
      active: dbProduct.active ?? true,
      ean: dbProduct.ean || undefined,
      hs_code: dbProduct.hs_code || undefined,
      barcode: dbProduct.barcode || undefined,
      origin_country: dbProduct.origin_country || dbProduct.country_of_origin || undefined,
      country_of_origin: dbProduct.country_of_origin || dbProduct.origin_country || undefined,
      supplier: dbProduct.supplier || dbProduct.supplier_name || undefined,
      supplier_name: dbProduct.supplier_name || dbProduct.supplier || undefined,
      supplier_code: dbProduct.supplier_code || undefined,
      supplier_sku: dbProduct.supplier_sku || undefined,
      cost_price: dbProduct.cost_price || undefined,
      sale_price: dbProduct.sale_price || undefined,
      tax_rate: dbProduct.tax_rate || undefined,
      other_description: dbProduct.other_description || undefined,
      notes: dbProduct.notes || undefined,
      image_url: dbProduct.image_url || undefined,
      metadata: dbProduct.metadata || undefined,
      warehouse_id: dbProduct.warehouse_id || undefined,
      shelf_location: dbProduct.shelf_location || undefined,
      last_inventory_date: dbProduct.last_inventory_date || undefined,
      lead_time_days: dbProduct.lead_time_days || undefined,
      is_published: dbProduct.is_published || undefined,
      seo_title: dbProduct.seo_title || undefined,
      seo_description: dbProduct.seo_description || undefined,
      tags: dbProduct.tags || undefined,
      created_at: dbProduct.created_at,
      updated_at: dbProduct.updated_at
    }
  }, [])

  const createProduct = useCallback(async (product: Partial<Product>, userId: string): Promise<Product> => {
    try {
      setLoading(true)
      setError(null)

      console.log('📦 Creating product via Supabase:', { 
        name: product.name, 
        sku: product.sku,
        userId 
      })

      const supabase = getSupabaseClient()
      
      // ✅ CONVERTI AL FORMATO DATABASE
      const dbProductData = productToDatabaseProduct(product, userId)
      
      // ✅ BYPASS TYPING ISSUES con cast esplicito
      const supabaseRaw = supabase as any
      
      const { data, error }: SupabaseResponse<DatabaseProduct> = await supabaseRaw
        .from('products')
        .insert([dbProductData])  // ✅ USA DATI CONVERTITI
        .select()
        .single()

      if (error) {
        console.error('❌ Supabase insert error:', error)
        throw new Error(error.message || 'Failed to create product')
      }

      if (!data) {
        throw new Error('No data returned from product creation')
      }

      console.log('✅ Product created via Supabase:', data.id)
      
      // ✅ CONVERTI BACK AL NOSTRO FORMATO
      const createdProduct = databaseProductToProduct(data)
      return createdProduct

    } catch (err) {
      console.error('❌ Error creating product:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    } finally {
      setLoading(false)
    }
  }, [productToDatabaseProduct, databaseProductToProduct])

  const updateProduct = useCallback(async (id: string, product: Partial<Product>, userId: string): Promise<Product> => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔄 Updating product via Supabase:', { id, userId })

      const supabase = getSupabaseClient()
      
      // ✅ CONVERTI AL FORMATO DATABASE (senza created_at)
      const dbProductData = productToDatabaseProduct(product, userId)
      delete (dbProductData as any).created_at // Non aggiornare created_at
      
      // ✅ BYPASS TYPING ISSUES con cast esplicito
      const supabaseRaw = supabase as any
      
      const { data, error }: SupabaseResponse<DatabaseProduct> = await supabaseRaw
        .from('products')
        .update(dbProductData)  // ✅ USA DATI CONVERTITI
        .eq('id', id)
        .eq('user_id', userId)  // ✅ SECURITY: Solo prodotti dell'utente
        .select()
        .single()

      if (error) {
        console.error('❌ Supabase update error:', error)
        throw new Error(error.message || 'Failed to update product')
      }

      if (!data) {
        throw new Error('No data returned from product update')
      }

      console.log('✅ Product updated via Supabase:', data.id)
      
      // ✅ CONVERTI BACK AL NOSTRO FORMATO
      const updatedProduct = databaseProductToProduct(data)
      return updatedProduct

    } catch (err) {
      console.error('❌ Error updating product:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    } finally {
      setLoading(false)
    }
  }, [productToDatabaseProduct, databaseProductToProduct])

  const deleteProduct = useCallback(async (id: string, userId: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      console.log('🗑️ Deleting product via Supabase:', { id, userId })

      const supabase = getSupabaseClient()
      
      // ✅ BYPASS TYPING ISSUES con cast esplicito
      const supabaseRaw = supabase as any
      
      const { error } = await supabaseRaw
        .from('products')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)  // ✅ SECURITY: Solo prodotti dell'utente

      if (error) {
        console.error('❌ Supabase delete error:', error)
        throw new Error(error.message || 'Failed to delete product')
      }

      console.log('✅ Product deleted via Supabase:', id)

    } catch (err) {
      console.error('❌ Error deleting product:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getProducts = useCallback(async (userId: string, organizationId?: string): Promise<Product[]> => {
    try {
      setLoading(true)
      setError(null)

      console.log('📋 Fetching products via Supabase:', { userId, organizationId })

      const supabase = getSupabaseClient()
      
      // ✅ BYPASS TYPING ISSUES con cast esplicito
      const supabaseRaw = supabase as any
      
      let query = supabaseRaw
        .from('products')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      // ✅ FILTRO ORGANIZATION se fornito
      if (organizationId) {
        query = query.eq('organization_id', organizationId)
      }

      const { data, error }: SupabaseArrayResponse<DatabaseProduct> = await query

      if (error) {
        console.error('❌ Supabase fetch error:', error)
        throw new Error(error.message || 'Failed to fetch products')
      }

      if (!data) {
        console.log('⚠️ No products found')
        return []
      }

      console.log(`✅ Fetched ${data.length} products via Supabase`)
      
      // ✅ CONVERTI TUTTI AL NOSTRO FORMATO
      const products = data.map(databaseProductToProduct)
      return products

    } catch (err) {
      console.error('❌ Error fetching products:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      return []
    } finally {
      setLoading(false)
    }
  }, [databaseProductToProduct])

  const getProductById = useCallback(async (id: string, userId: string): Promise<Product | null> => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔍 Fetching product by ID via Supabase:', { id, userId })

      const supabase = getSupabaseClient()
      
      // ✅ BYPASS TYPING ISSUES con cast esplicito
      const supabaseRaw = supabase as any
      
      const { data, error }: SupabaseResponse<DatabaseProduct> = await supabaseRaw
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)  // ✅ SECURITY: Solo prodotti dell'utente
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('⚠️ Product not found:', id)
          return null
        }
        console.error('❌ Supabase fetch error:', error)
        throw new Error(error.message || 'Failed to fetch product')
      }

      if (!data) {
        console.log('⚠️ Product not found:', id)
        return null
      }

      console.log('✅ Product fetched by ID via Supabase:', data.id)
      
      // ✅ CONVERTI AL NOSTRO FORMATO
      const product = databaseProductToProduct(data)
      return product

    } catch (err) {
      console.error('❌ Error fetching product by ID:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    } finally {
      setLoading(false)
    }
  }, [databaseProductToProduct])

  // ✅ BULK OPERATIONS
  const bulkCreateProducts = useCallback(async (products: Partial<Product>[], userId: string): Promise<Product[]> => {
    try {
      setLoading(true)
      setError(null)

      console.log(`📦 Bulk creating ${products.length} products via Supabase`)

      const supabase = getSupabaseClient()
      
      // ✅ CONVERTI TUTTI AL FORMATO DATABASE
      const dbProductsData = products.map(product => productToDatabaseProduct(product, userId))
      
      // ✅ BYPASS TYPING ISSUES con cast esplicito
      const supabaseRaw = supabase as any
      
      const { data, error }: SupabaseArrayResponse<DatabaseProduct> = await supabaseRaw
        .from('products')
        .insert(dbProductsData)  // ✅ USA DATI CONVERTITI
        .select()

      if (error) {
        console.error('❌ Supabase bulk insert error:', error)
        throw new Error(error.message || 'Failed to bulk create products')
      }

      if (!data || data.length === 0) {
        throw new Error('No data returned from bulk product creation')
      }

      console.log(`✅ Bulk created ${data.length} products via Supabase`)
      
      // ✅ CONVERTI BACK AL NOSTRO FORMATO
      const createdProducts = data.map(databaseProductToProduct)
      return createdProducts

    } catch (err) {
      console.error('❌ Error bulk creating products:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    } finally {
      setLoading(false)
    }
  }, [productToDatabaseProduct, databaseProductToProduct])

  return {
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    getProducts,
    getProductById,
    bulkCreateProducts
  }
}

// ✅ EXPORT TYPES per uso esterno
export type { DatabaseProduct }