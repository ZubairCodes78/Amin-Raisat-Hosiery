'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product, Category, Subcategory, SiteSettings, Order, ProductVariant, ProductMedia, OrderStatus, ProductReview, HeroSlide } from '@/types';
import { DataStore } from '@/lib/store';
import { INITIAL_CATEGORIES, INITIAL_SUBCATEGORIES, INITIAL_PRODUCTS, INITIAL_SITE_SETTINGS, INITIAL_HERO_SLIDES } from '@/data/initialData';

interface StoreContextType {
  products: Product[];
  categories: Category[];
  subcategories: Subcategory[];
  settings: SiteSettings;
  orders: Order[];
  reviews: ProductReview[];
  heroSlides: HeroSlide[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
  updateProductVariants: (productId: string, variants: ProductVariant[]) => Promise<void>;
  updateProductMedia: (productId: string, media: ProductMedia[]) => Promise<void>;
  saveProduct: (product: Product) => Promise<void>;
  duplicateProduct: (productId: string) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  saveCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  saveSubcategory: (subcategory: Subcategory) => Promise<void>;
  deleteSubcategory: (id: string) => Promise<void>;
  saveHeroSlide: (slide: HeroSlide) => Promise<void>;
  deleteHeroSlide: (id: string) => Promise<void>;
  uploadMediaFile: (file: File, folder?: string) => Promise<string>;
  submitReview: (
    review: Omit<ProductReview, 'id' | 'createdAt' | 'isApproved'>,
    token?: string
  ) => Promise<ProductReview>;
  approveReview: (id: string, isApproved: boolean) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
  updateSettings: (newSettings: SiteSettings) => Promise<void>;
  createOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'status'>) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

interface StoreProviderProps {
  children: React.ReactNode;
  initialProducts?: Product[];
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children, initialProducts }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    if (initialProducts && initialProducts.length > 0) {
      return initialProducts;
    }
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('arh_products_v6');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return INITIAL_PRODUCTS;
  });
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [subcategories, setSubcategories] = useState<Subcategory[]>(INITIAL_SUBCATEGORIES);
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SITE_SETTINGS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(INITIAL_HERO_SLIDES);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      setProducts(initialProducts);
    }
  }, [initialProducts]);

  const loadData = async () => {
    try {
      const [prods, cats, subcats, sets, slides] = await Promise.all([
        DataStore.getProducts(),
        DataStore.getCategories(),
        DataStore.getSubcategories(),
        DataStore.getSettings(),
        DataStore.getHeroSlides(),
      ]);

      const activeProducts = prods.filter((p) => p.isPublished);

      const subcatsWithCount = subcats.map((sub) => ({
        ...sub,
        productCount: activeProducts.filter(
          (p) => p.subcategoryId === sub.id || p.subcategoryId === sub.slug
        ).length,
      }));

      const catsWithCount = cats.map((cat) => ({
        ...cat,
        productCount: activeProducts.filter(
          (p) =>
            p.categoryId === cat.id ||
            p.categoryId === cat.slug ||
            (cat.slug === 'men' && (!p.categoryId || p.categoryId === 'cat-men')) ||
            (cat.slug === 'women' && p.categoryId === 'cat-women') ||
            (cat.slug === 'kids' && p.categoryId === 'cat-kids')
        ).length,
        subcategories: subcatsWithCount.filter((sub) => sub.categoryId === cat.id),
      }));

      setProducts(prods);
      setCategories(catsWithCount);
      setSubcategories(subcatsWithCount);
      setSettings(sets);
      setHeroSlides(slides);
      setIsLoading(false);

      // Non-blocking background fetch for secondary/admin data
      DataStore.getOrders().then((ords) => {
        if (ords && ords.length > 0) setOrders(ords);
      }).catch((err) => console.warn('Non-critical orders fetch notice:', err));

      DataStore.getReviews().then((revs) => {
        if (revs && revs.length > 0) setReviews(revs);
      }).catch((err) => console.warn('Non-critical reviews fetch notice:', err));
    } catch (err) {
      console.error('Failed to load store data:', err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateProductVariants = async (productId: string, variants: ProductVariant[]) => {
    await DataStore.updateProductVariants(productId, variants);
    await loadData();
  };

  const updateProductMedia = async (productId: string, media: ProductMedia[]) => {
    await DataStore.updateProductMedia(productId, media);
    await loadData();
  };

  const saveProduct = async (product: Product) => {
    await DataStore.saveProduct(product);
    await loadData();
  };

  const duplicateProduct = async (productId: string) => {
    const duplicated = await DataStore.duplicateProduct(productId);
    await loadData();
    return duplicated;
  };

  const deleteProduct = async (id: string) => {
    await DataStore.deleteProduct(id);
    await loadData();
  };

  const saveCategory = async (category: Category) => {
    await DataStore.saveCategory(category);
    await loadData();
  };

  const deleteCategory = async (id: string) => {
    await DataStore.deleteCategory(id);
    await loadData();
  };

  const saveSubcategory = async (subcategory: Subcategory) => {
    await DataStore.saveSubcategory(subcategory);
    await loadData();
  };

  const deleteSubcategory = async (id: string) => {
    await DataStore.deleteSubcategory(id);
    await loadData();
  };

  const uploadMediaFile = async (file: File, folder = 'products') => {
    return await DataStore.uploadMediaFile(file, folder);
  };

  const submitReview = async (
    reviewData: Omit<ProductReview, 'id' | 'createdAt' | 'isApproved'>,
    token?: string
  ) => {
    const rev = await DataStore.submitReview(reviewData, token);
    await loadData();
    return rev;
  };

  const approveReview = async (id: string, isApproved: boolean) => {
    await DataStore.approveReview(id, isApproved);
    await loadData();
  };

  const deleteReview = async (id: string) => {
    await DataStore.deleteReview(id);
    await loadData();
  };

  const updateSettings = async (newSettings: SiteSettings) => {
    await DataStore.updateSettings(newSettings);
    setSettings(newSettings);
  };

  const createOrder = async (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'status'>) => {
    const order = await DataStore.createOrder(orderData);
    await loadData();
    return order;
  };

  const saveHeroSlide = async (slide: HeroSlide) => {
    await DataStore.saveHeroSlide(slide);
    await loadData();
  };

  const deleteHeroSlide = async (id: string) => {
    await DataStore.deleteHeroSlide(id);
    await loadData();
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    await DataStore.updateOrderStatus(orderId, status);
    await loadData();
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        subcategories,
        settings,
        orders,
        reviews,
        heroSlides,
        isLoading,
        refreshData: loadData,
        updateProductVariants,
        updateProductMedia,
        saveProduct,
        duplicateProduct,
        deleteProduct,
        saveCategory,
        deleteCategory,
        saveSubcategory,
        deleteSubcategory,
        saveHeroSlide,
        deleteHeroSlide,
        uploadMediaFile,
        submitReview,
        approveReview,
        deleteReview,
        updateSettings,
        createOrder,
        updateOrderStatus,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
