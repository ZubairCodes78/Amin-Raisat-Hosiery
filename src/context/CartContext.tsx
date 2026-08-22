'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem } from '@/types';
import { useStore } from './StoreContext';

interface CartContextType {
  items: CartItem[];
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  totalQuantity: number;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  isFreeDeliveryUnlocked: boolean;
  piecesNeededForFreeDelivery: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'arh_cart_items_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useStore();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from local storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage:', e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isInitialized]);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);
  const toggleDrawer = () => setIsDrawerOpen((prev) => !prev);

  const addItem = (newItem: Omit<CartItem, 'id'>) => {
    const id = `${newItem.productId}_${newItem.quality}_${newItem.sleeve}_${newItem.size}`;
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === id);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        const newQty = Math.min(settings.shipping.maxOrderQty, updated[existingIndex].quantity + newItem.quantity);
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          unitPrice: newItem.unitPrice,
        };
        return updated;
      } else {
        return [...prevItems, { ...newItem, id }];
      }
    });
    setIsDrawerOpen(true);
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    const safeQty = Math.min(settings.shipping.maxOrderQty, quantity);
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, quantity: safeQty } : item))
    );
  };

  const removeItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  // Delivery fee rules:
  // totalQuantity >= 3 -> Free Delivery (Rs. 0)
  // totalQuantity > 0 & < 3 -> Base Delivery Charge (Rs. 200)
  // totalQuantity === 0 -> Rs. 0
  const freeThreshold = settings.shipping.freeDeliveryThreshold; // 3
  const isFreeDeliveryUnlocked = totalQuantity >= freeThreshold;
  const deliveryFee =
    totalQuantity === 0 ? 0 : isFreeDeliveryUnlocked ? 0 : settings.shipping.baseDeliveryCharge;
  const totalAmount = subtotal + deliveryFee;
  const piecesNeededForFreeDelivery = Math.max(0, freeThreshold - totalQuantity);

  return (
    <CartContext.Provider
      value={{
        items,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        toggleDrawer,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        totalQuantity,
        subtotal,
        deliveryFee,
        totalAmount,
        isFreeDeliveryUnlocked,
        piecesNeededForFreeDelivery,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
