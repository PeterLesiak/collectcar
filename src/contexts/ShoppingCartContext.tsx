'use client';

import { createContext, useContext, type PropsWithChildren } from 'react';

import type { CarReference } from '@/cars';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export type ShoppingCartContextType = {
  cart: CarReference[];
  addToCart: (item: CarReference) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
};

const ShoppingCartContext = createContext<ShoppingCartContextType | null>(null);

export function ShoppingCartProvider({ children }: PropsWithChildren) {
  const [cart, setCart] = useLocalStorage<CarReference[]>('shopping-cart', []);

  const addToCart = (item: CarReference) => {
    setCart([...cart, item]);
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((p, i) => i !== index));
  };

  const clearCart = () => setCart([]);

  return (
    <ShoppingCartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </ShoppingCartContext.Provider>
  );
}

export function useShoppingCart() {
  const context = useContext(ShoppingCartContext);

  if (!context) {
    throw new Error('useShoppingCart has to be used within <ShoppingCartProvider>');
  }

  return context;
}
