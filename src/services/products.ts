import { Local, LocalCreate, PriceCorrection, Product, ProductCreate, ProductSearchResponse, ProductUpdate } from "@/types/products";
import { api } from "./api";

export const productsService = {
  async getProducts(skip = 0, limit = 100): Promise<Product[]> {
    return api.get(`/products?skip=${skip}&limit=${limit}`);
  },

  async getProduct(productId: number): Promise<Product> {
    return api.get(`/products/${productId}`);
  },

  async getProductByBarcode(barcode: string, fallbackName?: string): Promise<Product> {
    const query = fallbackName ? `?fallback_name=${encodeURIComponent(fallbackName)}` : "";
    return api.get(`/products/barcode/${barcode}${query}`);
  },

  async searchProducts(params: { barcode?: string; name?: string }): Promise<ProductSearchResponse> {
    const queryParams = new URLSearchParams();
    if (params.barcode) queryParams.append("barcode", params.barcode);
    if (params.name) queryParams.append("name", params.name);
    return api.get(`/products/search?${queryParams.toString()}`);
  },

  async createProduct(product: ProductCreate): Promise<Product> {
    return api.post("/products", product);
  },

  async updatePrice(productId: number, price: number, localId: number): Promise<Product> {
    const update: ProductUpdate = { precio: price, local_id: localId };
    return api.put(`/products/${productId}/price`, update);
  },

  async getLocals(skip = 0, limit = 100): Promise<Local[]> {
    return api.get(`/locals/?skip=${skip}&limit=${limit}`);
  },

  async getLocal(localId: number): Promise<Local> {
    return api.get(`/locals/${localId}`);
  },

  async createLocal(local: LocalCreate): Promise<Local> {
    return api.post("/locals/", local);
  },

  async getCorrectionsCount(localId: number): Promise<number> {
    return api.get(`/locals/${localId}/corrections/count`);
  },

  async getPendingCorrections(): Promise<PriceCorrection[]> {
    return api.get("/corrections/pending");
  },

  async approveCorrection(correctionId: number): Promise<void> {
    return api.put(`/corrections/${correctionId}/approve`, {});
  },
};
