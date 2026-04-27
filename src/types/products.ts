export interface Price {
  id: number;
  product_id: number;
  local_id: number;
  precio: number;
}

export interface Barcode {
  id: number;
  product_id: number;
  codigo_barra: string;
}

export interface Product {
  id: number;
  nombre: string;
  barcodes: Barcode[] | null;
  prices: Price[] | null;
}

export function getPrimaryBarcode(product: Product): string | null {
  const code = product.barcodes?.[0]?.codigo_barra;
  return code && code.trim() ? code : null;
}

export interface ProductCreate {
  nombre: string;
  codigo_barra: string;
  precio: number;
  local_id: number;
}

export interface ProductUpdate {
  precio: number;
  local_id: number;
}

export interface ProductSearchResponse {
  status: string;
  message: string;
  product?: Product | null;
  products?: Product[] | null;
}

export interface Local {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string | null;
  is_active: boolean | null;
}

export interface LocalProduct {
  id: number;
  nombre: string;
  precio: number;
}

export interface LocalWithProducts extends Local {
  productos: LocalProduct[];
}

export interface LocalCreate {
  nombre: string;
  direccion: string;
  telefono?: string | null;
}

export interface PriceCorrection {
  id: number;
  product_id: number;
  old_price: number;
  new_price: number;
  local_id: number;
  user_id: number;
  status: string;
  timestamp: string;
}
