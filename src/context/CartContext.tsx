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
  regularSubtotal: number;
  wholesaleSubtotal: number;
  totalSavings: number;
  deliveryFee: number;
  totalAmount: number;
  isFreeDeliveryUnlocked: boolean;
  piecesNeededForFreeDelivery: number;
  hasWholesaleItems: boolean;
  wholesaleQuantity: number;
  isWholesaleMinimumMet: boolean;
  wholesalePiecesNeeded: number;
  wholesaleMinQty: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'arh_cart_items_v2';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useStore();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const wholesaleMinQty = settings.wholesale?.defaultMinQty || 12;

  // Load from local storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY) || localStorage.getItem('arh_cart_items_v1');
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
    const isWholesale = Boolean(newItem.isWholesale);
    const id = `${newItem.productId}_${newItem.quality}_${newItem.sleeve}_${newItem.size}${isWholesale ? '_wholesale' : ''}`;
    
    // For wholesale items, permit higher order volume (up to 5,000)
    const maxQty = isWholesale ? 5000 : (settings.shipping.maxOrderQty || 12);

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === id);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        const newQty = Math.min(maxQty, updated[existingIndex].quantity + newItem.quantity);
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          unitPrice: newItem.unitPrice,
          regularPrice: newItem.regularPrice || updated[existingIndex].regularPrice,
          wholesalePrice: newItem.wholesalePrice || updated[existingIndex].wholesalePrice,
          isWholesale,
        };
        return updated;
      } else {
        return [...prevItems, { ...newItem, id, isWholesale }];
      }
    });
    setIsDrawerOpen(true);
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    const item = items.find((it) => it.id === id);
    const maxQty = item?.isWholesale ? 5000 : (settings.shipping.maxOrderQty || 12);
    const safeQty = Math.min(maxQty, quantity);

    setItems((prevItems) =>
      prevItems.map((it) => (it.id === id ? { ...it, quantity: safeQty } : it))
    );
  };

  const removeItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  const wholesaleItems = items.filter((item) => item.isWholesale);
  const wholesaleQuantity = wholesaleItems.reduce((sum, item) => sum + item.quantity, 0);
  const hasWholesaleItems = wholesaleItems.length > 0;
  const isWholesaleMinimumMet = !hasWholesaleItems || wholesaleQuantity >= wholesaleMinQty;
  const wholesalePiecesNeeded = Math.max(0, wholesaleMinQty - wholesaleQuantity);

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const regularSubtotal = items.reduce((sum, item) => {
    const regPrice = item.regularPrice || item.unitPrice;
    return sum + regPrice * item.quantity;
  }, 0);

  const wholesaleSubtotal = wholesaleItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const totalSavings = Math.max(0, regularSubtotal - subtotal);

  // Delivery fee rules:
  // Wholesale orders get Free Delivery
  // Retail totalQuantity >= 3 -> Free Delivery (Rs. 0)
  // Retail totalQuantity > 0 & < 3 -> Base Delivery Charge (Rs. 200)
  const freeThreshold = settings.shipping.freeDeliveryThreshold; // 3
  const isFreeDeliveryUnlocked = totalQuantity >= freeThreshold || hasWholesaleItems;
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
        regularSubtotal,
        wholesaleSubtotal,
        totalSavings,
        deliveryFee,
        totalAmount,
        isFreeDeliveryUnlocked,
        piecesNeededForFreeDelivery,
        hasWholesaleItems,
        wholesaleQuantity,
        isWholesaleMinimumMet,
        wholesalePiecesNeeded,
        wholesaleMinQty,
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
