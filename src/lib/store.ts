import {
  Category,
  Subcategory,
  Product,
  Order,
  SiteSettings,
  ProductVariant,
  ProductMedia,
  OrderStatus,
  ProductReview,
  HeroSlide,
  CustomerProfile,
  CustomerAddress,
  CustomerRecord,
} from '@/types';
import {
  INITIAL_CATEGORIES,
  INITIAL_SUBCATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_SITE_SETTINGS,
  INITIAL_HERO_SLIDES,
} from '@/data/initialData';
import { supabase, isSupabaseConfigured } from './supabase';

const LOCAL_STORAGE_KEYS = {
  PRODUCTS: 'arh_products_v6',
  CATEGORIES: 'arh_categories_v3',
  SUBCATEGORIES: 'arh_subcategories_v3',
  SETTINGS: 'arh_settings_v3',
  ORDERS: 'arh_orders_v3',
  REVIEWS: 'arh_reviews_v3',
  HERO_SLIDES: 'arh_hero_slides_v4',
};

export class DataStore {
  private static isClient(): boolean {
    return typeof window !== 'undefined';
  }

  // ============================================================================
  // 1. FILE UPLOADER (SUPABASE STORAGE BUCKET -> PUBLIC CDN URL)
  // ============================================================================
  static async uploadMediaFile(file: File, bucket = 'product-media'): Promise<string> {
    if (isSupabaseConfigured()) {
      try {
        const fileExt = file.name.split('.').pop() || 'jpg';
        const cleanName = file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[^a-zA-Z0-9_-]/g, '_')
          .toLowerCase();
        const fileName = `${Date.now()}_${cleanName}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true,
          });

        if (!error && data) {
          const { data: publicUrlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(fileName);
          if (publicUrlData?.publicUrl) {
            return publicUrlData.publicUrl;
          }
        } else if (error) {
          console.warn('Supabase storage upload error:', error.message);
        }
      } catch (err) {
        console.warn('Supabase storage upload exception, falling back to local reader:', err);
      }
    }

    // Offline / Local fallback: Convert file to Base64 Data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  }

  // ============================================================================
  // 2. CATEGORIES & SUBCATEGORIES CRUD
  // ============================================================================
  static async getSubcategories(): Promise<Subcategory[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('subcategories')
          .select('*')
          .order('display_order', { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map((s: any) => ({
            id: s.id,
            categoryId: s.category_id,
            name: s.name,
            slug: s.slug,
            description: s.description || '',
            image: s.image_url,
            isActive: s.is_active ?? true,
            displayOrder: s.display_order || 0,
          }));
        }
      } catch (err) {
        console.warn('Supabase subcategories fetch error', err);
      }
    }

    if (this.isClient()) {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.SUBCATEGORIES);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {}
      }
      localStorage.setItem(LOCAL_STORAGE_KEYS.SUBCATEGORIES, JSON.stringify(INITIAL_SUBCATEGORIES));
    }

    return INITIAL_SUBCATEGORIES;
  }

  static async saveSubcategory(subcat: Subcategory): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(subcat.id);
        const payload: any = {
          category_id: subcat.categoryId,
          name: subcat.name,
          slug: subcat.slug,
          description: subcat.description || '',
          image_url: subcat.image,
          is_active: subcat.isActive,
          display_order: subcat.displayOrder,
          updated_at: new Date().toISOString(),
        };
        if (isUuid) {
          payload.id = subcat.id;
        }

        await supabase.from('subcategories').upsert(payload);
      } catch (err) {
        console.warn('Supabase saveSubcategory error', err);
      }
    }

    const subcategories = await this.getSubcategories();
    const index = subcategories.findIndex((s) => s.id === subcat.id);
    if (index !== -1) {
      subcategories[index] = subcat;
    } else {
      subcategories.push(subcat);
    }
    if (this.isClient()) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.SUBCATEGORIES, JSON.stringify(subcategories));
    }
  }

  static async deleteSubcategory(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('subcategories').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteSubcategory error', err);
      }
    }

    const subcategories = await this.getSubcategories();
    const filtered = subcategories.filter((s) => s.id !== id);
    if (this.isClient()) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.SUBCATEGORIES, JSON.stringify(filtered));
    }
  }

  static async getCategories(): Promise<Category[]> {
    let categories: Category[] = INITIAL_CATEGORIES;
    const subcategories = await this.getSubcategories();
    const products = await this.getProducts();

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('display_order', { ascending: true });

        if (!error && data && data.length > 0) {
          categories = data.map((c: any) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: c.description || '',
            image: c.image_url,
            isActive: c.is_active ?? true,
            displayOrder: c.display_order || 0,
          }));
        }
      } catch (err) {
        console.warn('Supabase categories fetch error', err);
      }
    } else if (this.isClient()) {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.CATEGORIES);
      if (stored) {
        try {
          categories = JSON.parse(stored);
        } catch {}
      } else {
        localStorage.setItem(LOCAL_STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
      }
    }

    return categories.map((cat) => {
      const catProducts = products.filter((p) => (p.categoryId === cat.id || p.categoryId === cat.slug) && p.isPublished);
      return {
        ...cat,
        productCount: catProducts.length,
        subcategories: subcategories
          .filter((sub) => sub.categoryId === cat.id)
          .map((sub) => ({
            ...sub,
            productCount: catProducts.filter((p) => p.subcategoryId === sub.id || p.subcategoryId === sub.slug).length,
          })),
      };
    });
  }

  static async saveCategory(category: Category): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category.id);
        const payload: any = {
          name: category.name,
          slug: category.slug,
          description: category.description || '',
          image_url: category.image,
          is_active: category.isActive,
          display_order: category.displayOrder,
          updated_at: new Date().toISOString(),
        };
        if (isUuid) {
          payload.id = category.id;
        }

        await supabase.from('categories').upsert(payload);
      } catch (err) {
        console.warn('Supabase saveCategory error', err);
      }
    }

    const categories = await this.getCategories();
    const index = categories.findIndex((c) => c.id === category.id);
    if (index !== -1) {
      categories[index] = category;
    } else {
      categories.push(category);
    }
    if (this.isClient()) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    }
  }

  static async deleteCategory(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('categories').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteCategory error', err);
      }
    }

    const categories = await this.getCategories();
    const filtered = categories.filter((c) => c.id !== id);
    if (this.isClient()) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.CATEGORIES, JSON.stringify(filtered));
    }
  }

  // ============================================================================
  // 3. PRODUCTS CRUD (MULTI-PRODUCT CATALOG WITH VARIANTS & MEDIA)
  // ============================================================================
  static async getProducts(): Promise<Product[]> {
    let products: Product[] = INITIAL_PRODUCTS;

    if (isSupabaseConfigured()) {
      try {
        const { data: prods, error } = await supabase
          .from('products')
          .select('*, product_variants(*), product_media(*)')
          .order('created_at', { ascending: false });

        if (!error && prods && prods.length > 0) {
          products = prods.map((p: any) => ({
            id: p.id,
            categoryId: p.category_id,
            subcategoryId: p.subcategory_id,
            name: p.name,
            slug: p.slug,
            subtitle: p.subtitle || '',
            description: p.description || '',
            features: Array.isArray(p.features) ? p.features : [],
            qualityComparison: p.quality_comparison || {},
            careInstructions: Array.isArray(p.care_instructions) ? p.care_instructions : INITIAL_PRODUCTS[0].careInstructions,
            shippingInfo: p.shipping_info || INITIAL_PRODUCTS[0].shippingInfo,
            returnPolicy: 'We offer hassle-free exchange within 7 days of delivery in case of sizing or defect issues. Product must be unwashed and in original condition.',
            isPublished: p.is_published ?? true,
            createdAt: p.created_at,
            variants: Array.isArray(p.product_variants)
              ? p.product_variants.map((v: any) => ({
                  id: v.id,
                  productId: v.product_id,
                  quality: v.quality,
                  sleeve: v.sleeve,
                  size: v.size,
                  price: Number(v.price) || 0,
                  salePrice: v.sale_price ? Number(v.sale_price) : undefined,
                  stock: Number(v.stock) || 0,
                  sku: v.sku || '',
                  isAvailable: v.is_available ?? true,
                }))
              : [],
            media: Array.isArray(p.product_media)
              ? p.product_media
                  .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
                  .map((m: any) => ({
                    id: m.id,
                    productId: m.product_id,
                    type: m.media_type || 'photo',
                    url: m.url,
                    alt: m.alt_text || '',
                    title: m.title || '',
                    displayOrder: m.display_order || 0,
                    variantQuality: m.variant_quality || undefined,
                    variantSleeve: m.variant_sleeve || undefined,
                  }))
              : [],
          }));
        }
      } catch (err) {
        console.warn('Supabase fetch failed, fallback to local store', err);
      }
    } else if (this.isClient()) {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.PRODUCTS);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            products = parsed;
          }
        } catch {}
      } else {
        localStorage.setItem(LOCAL_STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      }
    }

    // Attach approved customer reviews
    const allReviews = await this.getReviews();
    return products.map((prod) => ({
      ...prod,
      reviews: allReviews.filter((r) => r.productId === prod.id && r.isApproved),
    }));
  }

  static async getProductBySlug(slug: string): Promise<Product | null> {
    const products = await this.getProducts();
    return products.find((p) => p.slug === slug || p.id === slug) || null;
  }

  static async saveProduct(product: Product): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(product.id);
        const productPayload: any = {
          category_id: product.categoryId || null,
          subcategory_id: product.subcategoryId || null,
          name: product.name,
          slug: product.slug,
          subtitle: product.subtitle || '',
          description: product.description || '',
          features: product.features || [],
          quality_comparison: product.qualityComparison || {},
          care_instructions: product.careInstructions || [],
          shipping_info: product.shippingInfo || '',
          is_published: product.isPublished,
          updated_at: new Date().toISOString(),
        };
        if (isUuid) {
          productPayload.id = product.id;
        }

        const { data: savedProd, error: prodErr } = await supabase
          .from('products')
          .upsert(productPayload)
          .select()
          .single();

        if (!prodErr && savedProd) {
          const targetProdId = savedProd.id;

          // Delete existing variants and insert fresh
          await supabase.from('product_variants').delete().eq('product_id', targetProdId);
          if (product.variants && product.variants.length > 0) {
            const variantsPayload = product.variants.map((v) => ({
              product_id: targetProdId,
              quality: v.quality,
              sleeve: v.sleeve,
              size: v.size,
              price: Number(v.price) || 0,
              sale_price: v.salePrice ? Number(v.salePrice) : null,
              stock: Number(v.stock) || 0,
              sku: v.sku || '',
              is_available: v.isAvailable,
            }));
            await supabase.from('product_variants').insert(variantsPayload);
          }

          // Delete existing media and insert fresh
          await supabase.from('product_media').delete().eq('product_id', targetProdId);
          if (product.media && product.media.length > 0) {
            const mediaPayload = product.media.map((m, idx) => ({
              product_id: targetProdId,
              media_type: m.type || 'photo',
              url: m.url,
              alt_text: m.alt || `${product.name} photo`,
              title: m.title || '',
              display_order: m.displayOrder ?? idx + 1,
              variant_quality: m.variantQuality || null,
              variant_sleeve: m.variantSleeve || null,
            }));
            await supabase.from('product_media').insert(mediaPayload);
          }
        }
      } catch (err) {
        console.warn('Supabase saveProduct error', err);
      }
    }

    const products = await this.getProducts();
    const index = products.findIndex((p) => p.id === product.id);
    if (index !== -1) {
      products[index] = product;
    } else {
      products.push(product);
    }
    if (this.isClient()) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    }
  }

  static async deleteProduct(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('products').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteProduct error', err);
      }
    }

    const products = await this.getProducts();
    const filtered = products.filter((p) => p.id !== id);
    if (this.isClient()) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
    }
  }

  // ============================================================================
  // 4. ORDERS & GUEST CHECKOUT MANAGEMENT
  // ============================================================================
  static async getOrders(): Promise<Order[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((o: any) => ({
            id: o.id,
            orderNumber: o.order_number,
            customerName: o.customer_name,
            customerPhone: o.customer_phone,
            customerEmail: o.customer_email || undefined,
            address: o.address,
            city: o.city,
            province: o.province,
            orderNotes: o.order_notes || undefined,
            subtotal: Number(o.subtotal) || 0,
            deliveryFee: Number(o.delivery_fee) || 0,
            totalAmount: Number(o.total_amount) || 0,
            paymentMethod: o.payment_method || 'cod',
            paymentReference: o.payment_reference || undefined,
            status: (o.status || 'Pending') as OrderStatus,
            createdAt: o.created_at,
            items: Array.isArray(o.order_items)
              ? o.order_items.map((it: any) => ({
                  id: it.id,
                  orderId: it.order_id,
                  productId: it.product_id,
                  variantId: it.variant_id,
                  productName: it.product_name,
                  quality: it.quality,
                  sleeve: it.sleeve,
                  size: it.size,
                  unitPrice: Number(it.unit_price) || 0,
                  quantity: Number(it.quantity) || 1,
                  totalPrice: Number(it.total_price) || 0,
                  image: it.image_url,
                }))
              : [],
          }));
        }
      } catch (err) {
        console.warn('Supabase getOrders error', err);
      }
    }

    if (this.isClient()) {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.ORDERS);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {}
      }
    }
    return [];
  }

  static async createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'status'>): Promise<Order> {
    if (this.isClient()) {
      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.order) {
            const existing = await this.getOrders();
            const updated = [json.order, ...existing.filter((o) => o.id !== json.order.id)];
            localStorage.setItem(LOCAL_STORAGE_KEYS.ORDERS, JSON.stringify(updated));
            return json.order;
          }
        }
      } catch (err) {
        console.warn('API /api/orders error, falling back to direct persistence:', err);
      }
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ARH-${new Date().getFullYear()}-${randomSuffix}`;
    const id = `ord-${Date.now()}-${randomSuffix}`;

    const newOrder: Order = {
      ...orderData,
      id,
      orderNumber,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const { data: insertedOrder, error: orderErr } = await supabase
          .from('orders')
          .insert({
            order_number: orderNumber,
            customer_name: orderData.customerName,
            customer_phone: orderData.customerPhone,
            customer_email: orderData.customerEmail || null,
            address: orderData.address,
            city: orderData.city,
            province: orderData.province || 'Punjab',
            order_notes: orderData.orderNotes || null,
            subtotal: orderData.subtotal,
            delivery_fee: orderData.deliveryFee,
            total_amount: orderData.totalAmount,
            payment_method: orderData.paymentMethod || 'cod',
            payment_reference: orderData.paymentReference || null,
            status: 'Pending',
          })
          .select()
          .single();

        if (!orderErr && insertedOrder) {
          newOrder.id = insertedOrder.id;

          // Insert line items
          if (orderData.items && orderData.items.length > 0) {
            const itemsPayload = orderData.items.map((it) => ({
              order_id: insertedOrder.id,
              product_id: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(it.productId)
                ? it.productId
                : null,
              variant_id: it.variantId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(it.variantId)
                ? it.variantId
                : null,
              product_name: it.productName,
              quality: it.quality,
              sleeve: it.sleeve,
              size: it.size,
              unit_price: it.unitPrice,
              quantity: it.quantity,
              total_price: it.totalPrice,
              image_url: it.image,
            }));
            await supabase.from('order_items').insert(itemsPayload);
          }
        }
      } catch (err) {
        console.warn('Supabase createOrder error', err);
      }
    }

    if (this.isClient()) {
      const existing = await this.getOrders();
      const updated = [newOrder, ...existing];
      localStorage.setItem(LOCAL_STORAGE_KEYS.ORDERS, JSON.stringify(updated));
    }

    return newOrder;
  }

  static async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('orders')
          .update({ status, updated_at: new Date().toISOString() })
          .or(`id.eq.${orderId},order_number.eq.${orderId}`);
      } catch (err) {
        console.warn('Supabase updateOrderStatus error', err);
      }
    }

    if (this.isClient()) {
      const orders = await this.getOrders();
      const index = orders.findIndex((o) => o.id === orderId || o.orderNumber === orderId);
      if (index !== -1) {
        orders[index].status = status;
        localStorage.setItem(LOCAL_STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      }
    }
  }

  // ============================================================================
  // 5. HERO SLIDES CRUD (SEPARATE DESKTOP & MOBILE SLIDES)
  // ============================================================================
  static async getHeroSlides(deviceType?: 'desktop' | 'mobile'): Promise<HeroSlide[]> {
    if (isSupabaseConfigured()) {
      try {
        let query = supabase.from('hero_slides').select('*').order('display_order', { ascending: true });
        if (deviceType) {
          query = query.eq('device_type', deviceType);
        }
        const { data, error } = await query;

        if (!error && data && data.length > 0) {
          return data.map((s: any) => ({
            id: s.id,
            deviceType: s.device_type || 'desktop',
            desktopImage: s.desktop_image,
            mobileImage: s.mobile_image || s.desktop_image,
            title: s.title || undefined,
            subtitle: s.subtitle || undefined,
            link: s.link || '/shop',
            buttonText: s.button_text || 'Shop Now',
            displayOrder: s.display_order || 0,
            isActive: s.is_active ?? true,
          }));
        }
      } catch (err) {
        console.warn('Supabase getHeroSlides error', err);
      }
    }

    if (this.isClient()) {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.HERO_SLIDES);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const sorted = parsed.sort((a: HeroSlide, b: HeroSlide) => a.displayOrder - b.displayOrder);
            if (deviceType) {
              return sorted.filter((s: HeroSlide) => (s.deviceType || 'desktop') === deviceType);
            }
            return sorted;
          }
        } catch {}
      }
      localStorage.setItem(LOCAL_STORAGE_KEYS.HERO_SLIDES, JSON.stringify(INITIAL_HERO_SLIDES));
    }

    if (deviceType) {
      return INITIAL_HERO_SLIDES.filter((s) => (s.deviceType || 'desktop') === deviceType);
    }
    return INITIAL_HERO_SLIDES;
  }

  static async saveHeroSlide(slide: HeroSlide): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slide.id);
        const payload: any = {
          device_type: slide.deviceType || 'desktop',
          desktop_image: slide.desktopImage,
          mobile_image: slide.mobileImage || slide.desktopImage,
          title: slide.title || null,
          subtitle: slide.subtitle || null,
          link: slide.link || slide.buttonLink || '/shop',
          button_text: slide.buttonText || 'Shop Now',
          display_order: slide.displayOrder || 0,
          is_active: slide.isActive ?? true,
          updated_at: new Date().toISOString(),
        };
        if (isUuid) {
          payload.id = slide.id;
        }
        await supabase.from('hero_slides').upsert(payload);
      } catch (err) {
        console.warn('Supabase saveHeroSlide error', err);
      }
    }

    const slides = await this.getHeroSlides();
    const index = slides.findIndex((s) => s.id === slide.id);
    if (index !== -1) {
      slides[index] = slide;
    } else {
      slides.push(slide);
    }
    if (this.isClient()) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.HERO_SLIDES, JSON.stringify(slides));
    }
  }

  static async deleteHeroSlide(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('hero_slides').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteHeroSlide error', err);
      }
    }

    const slides = await this.getHeroSlides();
    const filtered = slides.filter((s) => s.id !== id);
    if (this.isClient()) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.HERO_SLIDES, JSON.stringify(filtered));
    }
  }

  // ============================================================================
  // 6. SITE SETTINGS & SHIPPING BUSINESS RULES
  // ============================================================================
  static async getSettings(): Promise<SiteSettings> {
    let settings: SiteSettings = INITIAL_SITE_SETTINGS;

    if (isSupabaseConfigured()) {
      try {
        const { data: siteData } = await supabase.from('site_settings').select('*').limit(1).single();
        const { data: shipData } = await supabase.from('shipping_settings').select('*').limit(1).single();

        if (siteData || shipData) {
          settings = {
            ...INITIAL_SITE_SETTINGS,
            brandName: siteData?.brand_name || INITIAL_SITE_SETTINGS.brandName,
            ownerName: siteData?.owner_name || INITIAL_SITE_SETTINGS.ownerName,
            phone: siteData?.phone || INITIAL_SITE_SETTINGS.phone,
            whatsapp: siteData?.whatsapp || INITIAL_SITE_SETTINGS.whatsapp,
            email: siteData?.email || INITIAL_SITE_SETTINGS.email,
            market: siteData?.market || INITIAL_SITE_SETTINGS.market,
            currency: siteData?.currency || INITIAL_SITE_SETTINGS.currency,
            shipping: {
              minOrderQty: shipData?.min_order_qty ?? INITIAL_SITE_SETTINGS.shipping.minOrderQty,
              maxOrderQty: shipData?.max_order_qty ?? INITIAL_SITE_SETTINGS.shipping.maxOrderQty,
              baseDeliveryCharge: shipData ? Number(shipData.base_delivery_charge) : INITIAL_SITE_SETTINGS.shipping.baseDeliveryCharge,
              freeDeliveryThreshold: shipData?.free_delivery_threshold ?? INITIAL_SITE_SETTINGS.shipping.freeDeliveryThreshold,
            },
            bankDetails: {
              bankName: siteData?.bank_name || INITIAL_SITE_SETTINGS.bankDetails.bankName,
              accountTitle: siteData?.account_title || INITIAL_SITE_SETTINGS.bankDetails.accountTitle,
              accountNumber: siteData?.account_number || INITIAL_SITE_SETTINGS.bankDetails.accountNumber,
              iban: siteData?.iban || INITIAL_SITE_SETTINGS.bankDetails.iban,
            },
            isStoreOpen: siteData?.is_store_open ?? true,
            announcementText: siteData?.announcement_text || INITIAL_SITE_SETTINGS.announcementText,
          };
        }
      } catch (err) {
        console.warn('Supabase settings fetch error', err);
      }
    } else if (this.isClient()) {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.SETTINGS);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {}
      }
      localStorage.setItem(LOCAL_STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SITE_SETTINGS));
    }

    return settings;
  }

  static async updateSettings(settings: SiteSettings): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('site_settings')
          .update({
            brand_name: settings.brandName,
            owner_name: settings.ownerName,
            phone: settings.phone,
            whatsapp: settings.whatsapp,
            email: settings.email,
            market: settings.market,
            currency: settings.currency,
            bank_name: settings.bankDetails.bankName,
            account_title: settings.bankDetails.accountTitle,
            account_number: settings.bankDetails.accountNumber,
            iban: settings.bankDetails.iban,
            is_store_open: settings.isStoreOpen,
            announcement_text: settings.announcementText,
            updated_at: new Date().toISOString(),
          })
          .eq('id', 'b0000000-0000-0000-0000-000000000001');

        await supabase
          .from('shipping_settings')
          .update({
            min_order_qty: settings.shipping.minOrderQty,
            max_order_qty: settings.shipping.maxOrderQty,
            base_delivery_charge: settings.shipping.baseDeliveryCharge,
            free_delivery_threshold: settings.shipping.freeDeliveryThreshold,
            updated_at: new Date().toISOString(),
          })
          .eq('id', 'a0000000-0000-0000-0000-000000000001');
      } catch (err) {
        console.warn('Supabase updateSettings error', err);
      }
    }

    if (this.isClient()) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    }
  }

  // ============================================================================
  // 7. CUSTOMER REVIEWS CRUD
  // ============================================================================
  static async getReviews(): Promise<ProductReview[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data.map((r: any) => ({
            id: r.id,
            productId: r.product_id,
            customerName: r.customer_name,
            customerCity: r.customer_city || '',
            rating: r.rating,
            comment: r.comment,
            createdAt: r.created_at,
            isApproved: r.is_approved ?? true,
          }));
        }
      } catch (err) {
        console.warn('Supabase getReviews error', err);
      }
    }

    if (this.isClient()) {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.REVIEWS);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {}
      }
    }
    return [];
  }

  static async submitReview(review: Omit<ProductReview, 'id' | 'createdAt' | 'isApproved'>): Promise<ProductReview> {
    if (this.isClient()) {
      try {
        const res = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(review),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.review) {
            const existing = await this.getReviews();
            const updated = [json.review, ...existing.filter((r) => r.id !== json.review.id)];
            localStorage.setItem(LOCAL_STORAGE_KEYS.REVIEWS, JSON.stringify(updated));
            return json.review;
          }
        }
      } catch (err) {
        console.warn('API /api/reviews error, falling back to direct persistence:', err);
      }
    }

    const newReview: ProductReview = {
      ...review,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isApproved: true,
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .insert({
            product_id: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(review.productId)
              ? review.productId
              : null,
            customer_name: review.customerName,
            customer_city: review.customerCity || null,
            rating: review.rating,
            comment: review.comment,
            is_approved: true,
          })
          .select()
          .single();

        if (!error && data) {
          newReview.id = data.id;
        }
      } catch (err) {
        console.warn('Supabase submitReview error', err);
      }
    }

    if (this.isClient()) {
      const existing = await this.getReviews();
      const updated = [newReview, ...existing];
      localStorage.setItem(LOCAL_STORAGE_KEYS.REVIEWS, JSON.stringify(updated));
    }

    return newReview;
  }

  static async updateReviewApproval(reviewId: string, isApproved: boolean): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('reviews')
          .update({ is_approved: isApproved })
          .eq('id', reviewId);
      } catch (err) {
        console.warn('Supabase updateReviewApproval error', err);
      }
    }

    if (this.isClient()) {
      const reviews = await this.getReviews();
      const index = reviews.findIndex((r) => r.id === reviewId);
      if (index !== -1) {
        reviews[index].isApproved = isApproved;
        localStorage.setItem(LOCAL_STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
      }
    }
  }

  static async approveReview(reviewId: string, isApproved: boolean): Promise<void> {
    return this.updateReviewApproval(reviewId, isApproved);
  }

  static async updateProductVariants(productId: string, variants: ProductVariant[]): Promise<void> {
    const products = await this.getProducts();
    const product = products.find((p) => p.id === productId);
    if (product) {
      product.variants = variants;
      await this.saveProduct(product);
    }
  }

  static async updateProductMedia(productId: string, media: ProductMedia[]): Promise<void> {
    const products = await this.getProducts();
    const product = products.find((p) => p.id === productId);
    if (product) {
      product.media = media;
      await this.saveProduct(product);
    }
  }

  static async deleteReview(reviewId: string): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('reviews').delete().eq('id', reviewId);
      } catch (err) {
        console.warn('Supabase deleteReview error', err);
      }
    }

    if (this.isClient()) {
      const reviews = await this.getReviews();
      const filtered = reviews.filter((r) => r.id !== reviewId);
      localStorage.setItem(LOCAL_STORAGE_KEYS.REVIEWS, JSON.stringify(filtered));
    }
  }

  // ============================================================================
  // 8. CUSTOMER MANAGEMENT FOR ADMIN
  // ============================================================================
  static async getCustomers(): Promise<CustomerRecord[]> {
    let profiles: CustomerProfile[] = [];
    let addresses: CustomerAddress[] = [];
    const orders = await this.getOrders();

    if (this.isClient()) {
      try {
        const res = await fetch('/api/admin/customers');
        if (res.ok) {
          const json = await res.json();
          if (json.profiles) profiles = json.profiles;
          if (json.addresses) addresses = json.addresses;
        }
      } catch (err) {
        console.warn('API /api/admin/customers fetch warning:', err);
      }
    }

    if (profiles.length === 0 && isSupabaseConfigured()) {
      try {
        const { data: profData, error: profErr } = await supabase
          .from('customer_profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (profErr) {
          console.error('[DataStore.getCustomers] Supabase customer_profiles error:', {
            message: profErr.message,
            code: profErr.code,
            details: profErr.details,
            hint: profErr.hint,
          });
        }

        if (!profErr && profData) {
          profiles = profData.map((p: any) => ({
            id: p.id,
            fullName: p.full_name,
            phone: p.phone || undefined,
            email: p.email || undefined,
            createdAt: p.created_at,
            updatedAt: p.updated_at,
          }));
        }

        const { data: addrData, error: addrErr } = await supabase
          .from('customer_addresses')
          .select('*');

        if (!addrErr && addrData) {
          addresses = addrData.map((a: any) => ({
            id: a.id,
            userId: a.user_id,
            addressType: a.address_type || 'shipping',
            fullName: a.full_name,
            phone: a.phone,
            address: a.address,
            city: a.city,
            province: a.province || 'Punjab',
            postalCode: a.postal_code || undefined,
            isDefault: a.is_default || false,
            createdAt: a.created_at,
            updatedAt: a.updated_at,
          }));
        }
      } catch (err: any) {
        console.error('[DataStore.getCustomers] Exception loading customers:', err);
      }
    }

    if (this.isClient() && profiles.length === 0) {
      const localProf = localStorage.getItem('arh_customer_profile');
      if (localProf) {
        try {
          const p = JSON.parse(localProf);
          profiles = [p];
        } catch {}
      }
      const localAddrs = localStorage.getItem('arh_customer_addresses');
      if (localAddrs) {
        try {
          addresses = JSON.parse(localAddrs);
        } catch {}
      }
    }

    // Map existing profiles
    const customerMap = new Map<string, CustomerRecord>();

    profiles.forEach((p) => {
      const custOrders = orders.filter(
        (o) =>
          (o.userId && o.userId === p.id) ||
          (p.email && o.customerEmail && o.customerEmail.toLowerCase() === p.email.toLowerCase()) ||
          (p.phone && o.customerPhone && o.customerPhone.replace(/\D/g, '') === p.phone.replace(/\D/g, ''))
      );
      const custAddrs = addresses.filter((a) => a.userId === p.id);
      const totalSpent = custOrders.reduce((sum, o) => (o.status !== 'Cancelled' ? sum + o.totalAmount : sum), 0);

      const effectiveName =
        p.fullName && p.fullName !== 'Customer' && p.fullName.trim().length > 0
          ? p.fullName
          : custOrders[0]?.customerName || custAddrs[0]?.fullName || p.fullName || 'Valued Customer';

      customerMap.set(p.id, {
        id: p.id,
        fullName: effectiveName,
        email: p.email,
        phone: p.phone || custOrders[0]?.customerPhone || custAddrs[0]?.phone,
        createdAt: p.createdAt || new Date().toISOString(),
        updatedAt: p.updatedAt,
        addresses: custAddrs,
        orders: custOrders,
        totalSpent,
        totalOrders: custOrders.length,
      });
    });

    // Also synthesize customer profiles from orders if not already in customer_profiles
    orders.forEach((o) => {
      const key = o.userId || o.customerEmail?.toLowerCase() || o.customerPhone;
      if (!key) return;

      const alreadyExists = Array.from(customerMap.values()).some(
        (c) =>
          (o.userId && c.id === o.userId) ||
          (o.customerEmail && c.email?.toLowerCase() === o.customerEmail.toLowerCase()) ||
          (o.customerPhone && c.phone?.replace(/\D/g, '') === o.customerPhone.replace(/\D/g, ''))
      );

      if (!alreadyExists) {
        const matchingOrders = orders.filter(
          (m) =>
            (o.userId && m.userId === o.userId) ||
            (o.customerEmail && m.customerEmail?.toLowerCase() === o.customerEmail.toLowerCase()) ||
            (o.customerPhone && m.customerPhone?.replace(/\D/g, '') === o.customerPhone.replace(/\D/g, ''))
        );
        const totalSpent = matchingOrders.reduce((sum, m) => (m.status !== 'Cancelled' ? sum + m.totalAmount : sum), 0);

        customerMap.set(o.userId || `cust-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, {
          id: o.userId || `guest-${Date.now()}`,
          fullName: o.customerName || 'Customer',
          email: o.customerEmail || undefined,
          phone: o.customerPhone || undefined,
          createdAt: o.createdAt,
          addresses: [
            {
              id: `addr-${o.id}`,
              userId: o.userId || '',
              addressType: 'shipping',
              fullName: o.customerName,
              phone: o.customerPhone,
              address: o.address,
              city: o.city,
              province: o.province,
              isDefault: true,
              createdAt: o.createdAt,
            },
          ],
          orders: matchingOrders,
          totalSpent,
          totalOrders: matchingOrders.length,
        });
      }
    });

    return Array.from(customerMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
}
