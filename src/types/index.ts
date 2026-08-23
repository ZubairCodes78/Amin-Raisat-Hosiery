export type QualityType = string;
export type SleeveType = string;
export type ProductSize = string;

export interface QualityBreakdown {
  neck: string;
  shoulders: string;
  stitching: string;
  feel: string;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  displayOrder: number;
  productCount?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  displayOrder: number;
  subcategories?: Subcategory[];
  productCount?: number;
}

export interface ProductVariant {
  id: string;
  productId?: string;
  quality: QualityType;
  sleeve: SleeveType;
  size: ProductSize;
  price: number;
  salePrice?: number;
  stock: number;
  sku?: string;
  isAvailable: boolean;
}

export interface ProductMedia {
  id: string;
  productId?: string;
  type: 'photo' | 'video';
  url: string;
  alt?: string;
  title?: string;
  displayOrder?: number;
  variantQuality?: QualityType;
  variantSleeve?: SleeveType;
}

export interface ProductReview {
  id: string;
  productId: string;
  customerName: string;
  customerCity?: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  categoryId: string;
  subcategoryId?: string;
  name: string;
  slug: string;
  subtitle: string;
  description: string;
  features: string[];
  qualityComparison?: {
    highQuality?: QualityBreakdown;
    standardQuality?: QualityBreakdown;
  };
  careInstructions: string[];
  shippingInfo: string;
  returnPolicy?: string;
  isPublished: boolean;
  createdAt: string;
  variants: ProductVariant[];
  media: ProductMedia[];
  reviews?: ProductReview[];
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  quality: QualityType;
  sleeve: SleeveType;
  size: ProductSize;
  unitPrice: number;
  quantity: number;
  image: string;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Packed'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'
  | 'Returned';

export type PaymentMethodType = 'cod' | 'bank_transfer';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string;
  productName: string;
  quality: QualityType;
  sleeve: SleeveType;
  size: ProductSize;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  image?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  address: string;
  billingAddress?: string;
  city: string;
  province: string;
  orderNotes?: string;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: PaymentMethodType;
  paymentReference?: string;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: string;
}

export interface ShippingSettings {
  minOrderQty: number;
  maxOrderQty: number;
  baseDeliveryCharge: number;
  freeDeliveryThreshold: number;
}

export interface BankAccountDetails {
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban?: string;
  instructions?: string;
}

export interface SiteSettings {
  brandName: string;
  ownerName: string;
  phone: string;
  whatsapp: string;
  email: string;
  address?: string;
  businessHours?: string;
  market: string;
  currency: string;
  shipping: ShippingSettings;
  bankDetails: BankAccountDetails;
  isStoreOpen: boolean;
  isCodEnabled: boolean;
  isBankTransferEnabled: boolean;
  isAnnouncementEnabled: boolean;
  announcementText?: string;
  isWhatsAppFloatingEnabled: boolean;
  exchangeReturnDays: number;
}

export interface HeroSlide {
  id: string;
  deviceType?: 'desktop' | 'mobile';
  title?: string;
  subtitle?: string;
  badge?: string;
  desktopImage: string;
  mobileImage?: string;
  buttonText?: string;
  buttonLink?: string;
  link?: string;
  textColor?: 'light' | 'dark';
  displayOrder: number;
  isActive: boolean;
}

export interface CustomerProfile {
  id: string;
  fullName: string;
  phone?: string;
  whatsappNumber?: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerAddress {
  id: string;
  userId: string;
  addressType: 'shipping' | 'billing';
  fullName?: string;
  phone?: string;
  address?: string;
  streetAddress?: string;
  city: string;
  province: string;
  postalCode?: string;
  country?: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerRecord {
  id: string; // Auth User UUID
  fullName: string;
  email?: string;
  phone?: string;
  createdAt: string;
  updatedAt?: string;
  addresses: CustomerAddress[];
  orders: Order[];
  totalSpent: number;
  totalOrders: number;
}
