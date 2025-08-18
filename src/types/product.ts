/* filepath: /Users/fabriziocagnucci/sch-pro-next/src/types/product.ts */
export interface Product {
  id: string;
  sku: string;
  description: string;
  other_description?: string | null;
  unit_price?: number | null;
  category?: string | null;
  weight?: number | null;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  } | null;
  active: boolean;
  user_id: string;
  created_at?: string;
  updated_at?: string;
  // ✅ CAMPI AGGIUNTIVI PER INVENTORY
  quantity?: number | null;
  min_stock?: number | null;
  max_stock?: number | null;
  supplier?: string | null;
  barcode?: string | null;
}

export interface FilterState {
  search: string;
  category: string;
  priceRange: [number, number];
  active: boolean | null;
  // ✅ FILTRI AGGIUNTIVI
  lowStock?: boolean;
  outOfStock?: boolean;
}

export interface ProductFormData {
  sku: string;
  description: string;
  other_description?: string;
  unit_price?: number;
  category?: string;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  active: boolean;
  quantity?: number;
  min_stock?: number;
  max_stock?: number;
  supplier?: string;
  barcode?: string;
}