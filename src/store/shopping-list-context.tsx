import { Price, Product } from "@/types/products";
import { storage } from "@/utils/storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

interface ShoppingItem {
  product: Product;
  selectedPrice: Price;
  quantity: number;
}

interface ShoppingListContextType {
  items: ShoppingItem[];
  addItem: (product: Product, price: Price) => void;
  removeItem: (productId: number, localId: number) => void;
  updateQuantity: (productId: number, localId: number, quantity: number) => void;
  clearList: () => void;
  isInList: (productId: number, localId: number) => boolean;
}

const ShoppingListContext = createContext<ShoppingListContextType | undefined>(undefined);

const STORAGE_KEY = "shopping_list_items";

export function ShoppingListProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadList = useCallback(async () => {
    try {
      const stored = await storage.getItem(STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading shopping list:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveList = useCallback(async () => {
    try {
      await storage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Error saving shopping list:", error);
    }
  }, [items]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    if (isLoaded) {
      saveList();
    }
  }, [saveList, isLoaded]);

  const addItem = (product: Product, price: Price) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.product.id === product.id && i.selectedPrice.local_id === price.local_id
      );
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id && i.selectedPrice.local_id === price.local_id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { product, selectedPrice: price, quantity: 1 }];
    });
  };

  const removeItem = (productId: number, localId: number) => {
    setItems((prev) =>
      prev.filter(
        (i) => !(i.product.id === productId && i.selectedPrice.local_id === localId)
      )
    );
  };

  const updateQuantity = (productId: number, localId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, localId);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.product.id === productId && i.selectedPrice.local_id === localId
          ? { ...i, quantity }
          : i
      )
    );
  };

  const clearList = () => {
    setItems([]);
  };

  const isInList = (productId: number, localId: number) => {
    return items.some(
      (i) => i.product.id === productId && i.selectedPrice.local_id === localId
    );
  };

  return (
    <ShoppingListContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearList, isInList }}
    >
      {children}
    </ShoppingListContext.Provider>
  );
}

export function useShoppingList() {
  const context = useContext(ShoppingListContext);
  if (context === undefined) {
    throw new Error("useShoppingList must be used within a ShoppingListProvider");
  }
  return context;
}
