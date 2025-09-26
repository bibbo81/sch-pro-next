'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/utils/supabase/client'
import type { Product } from '@/types/product'


// ✅ TIPO per i dati che arrivano da Supabase
interface SupabaseProduct {
  id: string
  organization_id: string | null
  user_id: string | null
  description: string
  sku: string | null
  name?: string | null
  category?: string | null
  unit_price?: number | null
  currency?: string | null
  quantity?: number | null
  min_stock?: number | null
  active?: boolean | null
  weight_kg?: number | null
  dimensions?: any
  supplier_name?: string | null
  created_at?: string | null
  updated_at?: string | null
  barcode?: string | null
  tags?: string[] | null
  price?: number | null
  // Altri campi che potrebbero esistere in Supabase
  [key: string]: any
}

export function useProducts() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // ✅ FUNZIONE per convertire da Supabase a Product con FALLBACK per campi obbligatori
  const mapSupabaseToProduct = (supabaseProduct: SupabaseProduct): Product => {
    return {
      id: supabaseProduct.id,
      organization_id: supabaseProduct.organization_id || undefined,
      user_id: supabaseProduct.user_id || undefined,
      name: supabaseProduct.name || supabaseProduct.description || 'Prodotto senza nome',
      description: supabaseProduct.description || 'Nessuna descrizione',
      sku: supabaseProduct.sku || `SKU-${supabaseProduct.id.slice(0, 8)}`, // ✅ FALLBACK obbligatorio
      category: supabaseProduct.category || undefined,
      price: supabaseProduct.unit_price || supabaseProduct.price || 0,
      unit_price: supabaseProduct.unit_price || supabaseProduct.price || 0,
      currency: supabaseProduct.currency || 'EUR',
      quantity: supabaseProduct.quantity || 0,
      min_stock: supabaseProduct.min_stock || 0,
      active: supabaseProduct.active ?? true,
      weight_kg: supabaseProduct.weight_kg || undefined,
      dimensions: supabaseProduct.dimensions || undefined,
      supplier_name: supabaseProduct.supplier_name || undefined,
      created_at: supabaseProduct.created_at || new Date().toISOString(),
      updated_at: supabaseProduct.updated_at || new Date().toISOString(),
      barcode: supabaseProduct.barcode || undefined,
      tags: supabaseProduct.tags || undefined
    }
  }

  // ✅ CARICA PRODOTTI per organizzazione
  const loadProducts = useCallback(async () => {
    if (!user?.id) {
      setLoading(false)
      setProducts([])
      return
    }

    try {
      setLoading(true)
      setError(null)

      console.log('🚀 Loading organization products for user:', user.email)
      
      // ✅ QUERY DIRETTA A SUPABASE - RLS gestisce l'accesso per organizzazione
      const { data: productsData, error: supabaseError } = await supabase
        .from('products')
        .select('*')
        // ✅ NESSUN FILTRO - RLS policy gestisce tutto
        .order('created_at', { ascending: false })

      if (supabaseError) {
        throw supabaseError
      }

      console.log('✅ Products loaded from Supabase (organization level):', productsData?.length || 0)
      
      // ✅ CONVERTI i dati da Supabase al tipo Product
      const mappedProducts = (productsData || []).map(mapSupabaseToProduct)
      setProducts(mappedProducts)

    } catch (err: any) {
      console.error('❌ Error loading products:', err)
      setError(err.message || 'Errore nel caricamento dei prodotti')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  // ✅ AGGIUNGI PRODOTTO
  const addProduct = useCallback(async (productData: Partial<Product>) => {
    if (!user?.id) {
      throw new Error('User non autenticato')
    }

    try {
      console.log('✅ Adding product to organization')

      // ✅ OTTIENI ORGANIZATION_ID dell'utente
      const { data: membershipData, error: membershipError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single()

      if (membershipError || !membershipData) {
        throw new Error('Utente non appartiene a nessuna organizzazione')
      }

      // ✅ GENERA SKU se mancante
      const generatedSku = productData.sku || `SKU-${Date.now()}`

      // ✅ PREPARA DATI per Supabase con campi richiesti
      const supabaseData = {
        user_id: user.id,
        organization_id: membershipData.organization_id,
        description: productData.description || productData.name || 'Prodotto senza descrizione',
        sku: generatedSku, // ✅ SEMPRE presente
        name: productData.name || null,
        category: productData.category || null,
        unit_price: productData.unit_price || productData.price || null,
        currency: productData.currency || 'EUR',
        quantity: productData.quantity || null,
        min_stock: productData.min_stock || null,
        active: productData.active ?? true,
        weight_kg: productData.weight_kg || null,
        dimensions_cm: productData.dimensions || null,
        supplier_name: productData.supplier_name || null,
        barcode: productData.barcode || null,
        tags: productData.tags || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('products')
        .insert([supabaseData])
        .select()
        .single()

      if (error) {
        throw error
      }

      console.log('✅ Product added to organization:', data.id)
      await loadProducts()
      return mapSupabaseToProduct(data)
    } catch (err: any) {
      console.error('❌ Error adding product:', err)
      throw err
    }
  }, [user, supabase, loadProducts])

  // ✅ AGGIORNA PRODOTTO
  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    try {
      // ✅ CONVERTI gli update al formato Supabase
      const supabaseUpdates: any = {
        updated_at: new Date().toISOString()
      }

      // ✅ AGGIUNGI solo i campi definiti
      if (updates.description !== undefined) supabaseUpdates.description = updates.description
      if (updates.sku !== undefined) supabaseUpdates.sku = updates.sku
      if (updates.name !== undefined) supabaseUpdates.name = updates.name
      if (updates.category !== undefined) supabaseUpdates.category = updates.category
      if (updates.unit_price !== undefined) supabaseUpdates.unit_price = updates.unit_price
      if (updates.price !== undefined && updates.unit_price === undefined) supabaseUpdates.unit_price = updates.price
      if (updates.currency !== undefined) supabaseUpdates.currency = updates.currency
      if (updates.quantity !== undefined) supabaseUpdates.quantity = updates.quantity
      if (updates.min_stock !== undefined) supabaseUpdates.min_stock = updates.min_stock
      if (updates.active !== undefined) supabaseUpdates.active = updates.active
      if (updates.weight_kg !== undefined) supabaseUpdates.weight_kg = updates.weight_kg
      if (updates.dimensions !== undefined) supabaseUpdates.dimensions_cm = updates.dimensions
      if (updates.supplier_name !== undefined) supabaseUpdates.supplier_name = updates.supplier_name
      if (updates.barcode !== undefined) supabaseUpdates.barcode = updates.barcode
      if (updates.tags !== undefined) supabaseUpdates.tags = updates.tags

      const { data, error } = await supabase
        .from('products')
        .update(supabaseUpdates)
        .eq('id', id)
        // ✅ RLS policy gestisce l'accesso
        .select()
        .single()

      if (error) {
        throw error
      }

      console.log('✅ Product updated:', id)
      await loadProducts()
      return mapSupabaseToProduct(data)
    } catch (err: any) {
      console.error('❌ Error updating product:', err)
      throw err
    }
  }, [supabase, loadProducts])

  // ✅ ELIMINA PRODOTTO
  const deleteProduct = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        // ✅ RLS policy gestisce l'accesso

      if (error) {
        throw error
      }

      console.log('✅ Product deleted:', id)
      await loadProducts()
    } catch (err: any) {
      console.error('❌ Error deleting product:', err)
      throw err
    }
  }, [supabase, loadProducts])

  // ✅ CARICA AL MOUNT
  useEffect(() => {
    if (user) {
      loadProducts()
    }
  }, [user, loadProducts])

  return {
    products,
    loading,
    error,
    loadProducts,
    addProduct,
    updateProduct,
    deleteProduct
  }
}

export type { Product }