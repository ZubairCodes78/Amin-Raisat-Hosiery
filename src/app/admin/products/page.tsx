'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { Product, ProductVariant, ProductMedia } from '@/types';
import {
  Package,
  Plus,
  Trash2,
  Edit2,
  Save,
  Check,
  Upload,
  Film,
  X,
  ArrowLeft,
  Boxes,
  Zap,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ConfirmModal } from '@/components/admin/ConfirmModal';

export default function AdminProductsPage() {
  const {
    products,
    categories,
    subcategories,
    saveProduct,
    deleteProduct,
    uploadMediaFile,
    isLoading,
  } = useStore();

  // Mode: 'list' | 'editor'
  const [viewMode, setViewMode] = useState<'list' | 'editor'>('list');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Notification Toast
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const showNotice = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  // Delete Confirmation Modal State
  const [deleteModalState, setDeleteModalState] = useState<{ isOpen: boolean; productId: string; productName: string }>({
    isOpen: false,
    productId: '',
    productName: '',
  });

  // Clear Matrix Modal State
  const [isClearMatrixModalOpen, setIsClearMatrixModalOpen] = useState(false);

  // ------------------ 1. BASIC PRODUCT INFO STATE ------------------
  const [prodName, setProdName] = useState('');
  const [prodQualityGrade, setProdQualityGrade] = useState('High Quality');
  const [prodSlug, setProdSlug] = useState('');
  const [prodSubtitle, setProdSubtitle] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodCategoryId, setProdCategoryId] = useState('');
  const [prodSubcategoryId, setProdSubcategoryId] = useState('');
  const [prodIsPublished, setProdIsPublished] = useState(true);
  const [prodFeaturesText, setProdFeaturesText] = useState('');
  const [prodCareText, setProdCareText] = useState('');
  const [prodShippingText, setProdShippingText] = useState('');

  // ------------------ 2. DYNAMIC VARIANT SYSTEM STATE ------------------
  const [customQualities, setCustomQualities] = useState<string[]>(['High Quality']);
  const [newQualityInput, setNewQualityInput] = useState('');
  const [isAddQualityOpen, setIsAddQualityOpen] = useState(false);

  const [customStyles, setCustomStyles] = useState<string[]>(['Sleeveless', 'Full Sleeve']);
  const [newStyleInput, setNewStyleInput] = useState('');
  const [isAddStyleOpen, setIsAddStyleOpen] = useState(false);

  const [customSizes, setCustomSizes] = useState<string[]>(['S', 'M', 'L', 'XL', 'XXL']);
  const [newSizeInput, setNewSizeInput] = useState('');
  const [isAddSizeOpen, setIsAddSizeOpen] = useState(false);

  // Matrix Generator Settings
  const [genDefaultPrice, setGenDefaultPrice] = useState(480);
  const [genDefaultComparePrice, setGenDefaultComparePrice] = useState<number | undefined>(undefined);
  const [genDefaultStock, setGenDefaultStock] = useState(50);

  // Individual Variant Add State
  const [isAddSingleVarOpen, setIsAddSingleVarOpen] = useState(false);
  const [singleVarQuality, setSingleVarQuality] = useState('');
  const [singleVarStyle, setSingleVarStyle] = useState('');
  const [singleVarSize, setSingleVarSize] = useState('');
  const [singleVarPrice, setSingleVarPrice] = useState(480);
  const [singleVarSalePrice, setSingleVarSalePrice] = useState<number | undefined>(undefined);
  const [singleVarStock, setSingleVarStock] = useState(50);
  const [singleVarSku, setSingleVarSku] = useState('');

  // Master Variants List
  const [variantsList, setVariantsList] = useState<ProductVariant[]>([]);

  // ------------------ 3. MEDIA UPLOAD STATE ------------------
  const [mediaList, setMediaList] = useState<ProductMedia[]>([]);
  const [uploadQualityTarget, setUploadQualityTarget] = useState<string>('All');
  const [uploadSleeveTarget, setUploadSleeveTarget] = useState<string>('All');
  const [uploadMediaTitle, setUploadMediaTitle] = useState('');
  const [uploadProgress, setUploadProgress] = useState<'idle' | 'uploading' | 'uploaded' | 'failed'>('idle');
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Active Editor Tab
  const [editorTab, setEditorTab] = useState<'basic' | 'variants' | 'media'>('basic');

  // Search & Filter
  const [catalogSearch, setCatalogSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Available subcategories for chosen category
  const activeSubcatsForCategory = useMemo(() => {
    if (!prodCategoryId) return subcategories;
    return subcategories.filter((s) => s.categoryId === prodCategoryId);
  }, [prodCategoryId, subcategories]);

  // Available styles extracted from current matrix for media target selector
  const availableVariantStylesForMedia = useMemo(() => {
    const fromVars = Array.from(new Set(variantsList.map((v) => v.sleeve).filter(Boolean)));
    return fromVars.length > 0 ? fromVars : customStyles;
  }, [variantsList, customStyles]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
        (p.subtitle || '').toLowerCase().includes(catalogSearch.toLowerCase()) ||
        p.slug.toLowerCase().includes(catalogSearch.toLowerCase());
      const matchCategory = categoryFilter === 'all' || p.categoryId === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [products, catalogSearch, categoryFilter]);

  // ------------------ OPEN CREATE FORM ------------------
  const handleStartCreate = () => {
    setEditingProductId(null);
    setProdName('');
    setProdQualityGrade('High Quality');
    setProdSlug('');
    setProdSubtitle('');
    setProdDesc('');
    const defaultCat = categories[0]?.id || '';
    setProdCategoryId(defaultCat);
    const defaultSub = subcategories.find((s) => s.categoryId === defaultCat)?.id || '';
    setProdSubcategoryId(defaultSub);
    setProdIsPublished(true);
    setProdFeaturesText('100% Pure Combed Cotton\nAnti-Sag Double Top-Stitched Neck\nBreathable 1x1 Rib Knit Weave\nPre-Shrunk Colorfast Fabric');
    setProdCareText('Machine wash cold\nDo not bleach\nTumble dry low\nWarm iron if needed');
    setProdShippingText('Nationwide Cash on Delivery (COD) across Pakistan. Free delivery on 3+ pieces.');

    const initialQualities = ['High Quality'];
    const initialStyles = ['Sleeveless', 'Full Sleeve'];
    const initialSizes = ['S', 'M', 'L', 'XL', 'XXL'];

    setCustomQualities(initialQualities);
    setCustomStyles(initialStyles);
    setCustomSizes(initialSizes);

    setVariantsList([
      {
        id: `var-new-1`,
        productId: '',
        quality: 'High Quality',
        sleeve: 'Sleeveless',
        size: 'L',
        price: 480,
        stock: 50,
        sku: 'ARH-HQ-SL-L',
        isAvailable: true,
      },
    ]);
    setMediaList([]);
    setEditorTab('basic');
    setViewMode('editor');
  };

  // ------------------ OPEN EDIT FORM ------------------
  const handleStartEdit = (prod: Product) => {
    setEditingProductId(prod.id);
    setProdName(prod.name);
    setProdQualityGrade(prod.variants?.[0]?.quality || 'High Quality');
    setProdSlug(prod.slug);
    setProdSubtitle(prod.subtitle || '');
    setProdDesc(prod.description || '');
    setProdCategoryId(prod.categoryId);
    setProdSubcategoryId(prod.subcategoryId || '');
    setProdIsPublished(prod.isPublished);
    setProdFeaturesText(prod.features ? prod.features.join('\n') : '');
    setProdCareText(prod.careInstructions ? prod.careInstructions.join('\n') : '');
    setProdShippingText(prod.shippingInfo || '');

    const qualitiesFromVars = Array.from(
      new Set(prod.variants.map((v) => v.quality).filter(Boolean))
    );
    const stylesFromVars = Array.from(
      new Set(prod.variants.map((v) => v.sleeve).filter(Boolean))
    );
    const sizesFromVars = Array.from(
      new Set(prod.variants.map((v) => v.size).filter(Boolean))
    );

    setCustomQualities(qualitiesFromVars.length > 0 ? qualitiesFromVars : ['High Quality']);
    setCustomStyles(stylesFromVars.length > 0 ? stylesFromVars : ['Sleeveless', 'Full Sleeve']);
    setCustomSizes(sizesFromVars.length > 0 ? sizesFromVars : ['S', 'M', 'L', 'XL', 'XXL']);

    setVariantsList(prod.variants || []);
    setMediaList(prod.media || []);
    setEditorTab('basic');
    setViewMode('editor');
  };

  // ------------------ SAVE PRODUCT ------------------
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) {
      showNotice('Please enter a Product Name.', 'error');
      setEditorTab('basic');
      return;
    }

    if (variantsList.length === 0) {
      showNotice('Please generate or add at least 1 variant for this product.', 'error');
      setEditorTab('variants');
      return;
    }

    const currentId = editingProductId || `prod-${Date.now()}`;
    const autoSlug = prodSlug.trim()
      ? prodSlug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
      : prodName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const featuresArray = prodFeaturesText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const careArray = prodCareText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const cleanVariants: ProductVariant[] = variantsList.map((v, i) => ({
      ...v,
      id: v.id || `var-${currentId}-${i + 1}`,
      productId: currentId,
      quality: v.quality || prodQualityGrade || 'High Quality',
    }));

    const cleanMedia: ProductMedia[] = mediaList.map((m, i) => ({
      ...m,
      id: m.id || `med-${currentId}-${i + 1}`,
      productId: currentId,
    }));

    const productToSave: Product = {
      id: currentId,
      categoryId: prodCategoryId || categories[0]?.id || '',
      subcategoryId: prodSubcategoryId || undefined,
      name: prodName.trim(),
      slug: autoSlug,
      subtitle: prodSubtitle.trim(),
      description: prodDesc.trim(),
      features: featuresArray,
      qualityComparison: {
        highQuality: {
          neck: 'Ribbed binding with double top-stitch',
          shoulders: 'Clean finished tape',
          stitching: 'Reinforced anti-sag seams',
          feel: '100% fine combed cotton',
        },
        standardQuality: {
          neck: 'Standard rib finish',
          shoulders: 'Single needle stitch',
          stitching: 'Standard durable overlock',
          feel: '100% pure cotton',
        },
      },
      careInstructions: careArray,
      shippingInfo: prodShippingText.trim(),
      isPublished: prodIsPublished,
      createdAt: editingProductId
        ? products.find((p) => p.id === editingProductId)?.createdAt || new Date().toISOString()
        : new Date().toISOString(),
      variants: cleanVariants,
      media: cleanMedia,
    };

    try {
      await saveProduct(productToSave);
      showNotice(editingProductId ? `Updated "${productToSave.name}" successfully!` : `Created new garment "${productToSave.name}" live on store!`);
      setViewMode('list');
    } catch (err) {
      showNotice('Unable to save product to Supabase. Please try again.', 'error');
    }
  };

  // ------------------ DELETE PRODUCT CONFIRMATION ------------------
  const handleConfirmDeleteProduct = async () => {
    if (!deleteModalState.productId) return;
    try {
      await deleteProduct(deleteModalState.productId);
      showNotice(`Garment "${deleteModalState.productName}" deleted from store.`);
    } catch (err) {
      showNotice('Unable to delete product.', 'error');
    } finally {
      setDeleteModalState({ isOpen: false, productId: '', productName: '' });
    }
  };

  // ------------------ QUALITY MANAGEMENT ------------------
  const handleAddQuality = () => {
    const q = newQualityInput.trim();
    if (!q) return;
    if (!customQualities.includes(q)) {
      setCustomQualities([...customQualities, q]);
    }
    setNewQualityInput('');
    setIsAddQualityOpen(false);
  };

  const handleRemoveQuality = (qToRemove: string) => {
    if (customQualities.length <= 1) {
      showNotice('Product listing must have at least 1 quality designation.', 'error');
      return;
    }
    setCustomQualities(customQualities.filter((q) => q !== qToRemove));
  };

  // ------------------ STYLE MANAGEMENT ------------------
  const handleAddStyle = () => {
    const st = newStyleInput.trim();
    if (!st) return;
    if (!customStyles.includes(st)) {
      setCustomStyles([...customStyles, st]);
    }
    setNewStyleInput('');
    setIsAddStyleOpen(false);
  };

  const handleRemoveStyle = (styleToRemove: string) => {
    if (customStyles.length <= 1) {
      showNotice('Product must have at least 1 style option.', 'error');
      return;
    }
    setCustomStyles(customStyles.filter((s) => s !== styleToRemove));
  };

  // ------------------ SIZE MANAGEMENT ------------------
  const handleAddSize = () => {
    const sz = newSizeInput.trim();
    if (!sz) return;
    if (!customSizes.includes(sz)) {
      setCustomSizes([...customSizes, sz]);
    }
    setNewSizeInput('');
    setIsAddSizeOpen(false);
  };

  const handleRemoveSize = (sizeToRemove: string) => {
    if (customSizes.length <= 1) {
      showNotice('Product must have at least 1 size option.', 'error');
      return;
    }
    setCustomSizes(customSizes.filter((s) => s !== sizeToRemove));
  };

  // ------------------ BULK GENERATE ALL COMBINATIONS ------------------
  const handleGenerateCombinations = () => {
    if (customQualities.length === 0 || customStyles.length === 0 || customSizes.length === 0) {
      showNotice('Please define at least 1 quality, 1 style, and 1 size before generating variants.', 'error');
      return;
    }

    const prodPrefix = (prodName.trim() || 'ARH')
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 4);

    const generated: ProductVariant[] = [];
    let count = 1;

    for (const q of customQualities) {
      for (const st of customStyles) {
        for (const sz of customSizes) {
          const qShort = q.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 3);
          const stShort = st.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 3);
          const skuCode = `${prodPrefix}-${qShort}-${stShort}-${sz}`;

          const existing = variantsList.find(
            (v) => v.quality === q && v.sleeve === st && v.size === sz
          );

          generated.push({
            id: existing ? existing.id : `var-gen-${Date.now()}-${count++}`,
            productId: editingProductId || '',
            quality: q,
            sleeve: st,
            size: sz,
            price: existing ? existing.price : genDefaultPrice,
            salePrice: existing ? existing.salePrice : genDefaultComparePrice,
            stock: existing ? existing.stock : genDefaultStock,
            sku: existing?.sku || skuCode,
            isAvailable: existing ? existing.isAvailable : true,
          });
        }
      }
    }

    setVariantsList(generated);
    showNotice(`Generated matrix with ${generated.length} variant combinations!`);
  };

  // ------------------ ADD SINGLE CUSTOM VARIANT ------------------
  const handleAddSingleVariant = () => {
    const q = singleVarQuality || customQualities[0] || 'High Quality';
    const st = singleVarStyle || customStyles[0] || 'Sleeveless';
    const sz = singleVarSize || customSizes[0] || 'L';

    const prodPrefix = (prodName.trim() || 'ARH')
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 4);
    const qShort = q.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 3);
    const stShort = st.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 3);
    const autoSku = singleVarSku.trim() || `${prodPrefix}-${qShort}-${stShort}-${sz}`;

    const newVariant: ProductVariant = {
      id: `var-custom-${Date.now()}`,
      productId: editingProductId || '',
      quality: q,
      sleeve: st,
      size: sz,
      price: Number(singleVarPrice) || 480,
      salePrice: singleVarSalePrice ? Number(singleVarSalePrice) : undefined,
      stock: Number(singleVarStock) || 50,
      sku: autoSku,
      isAvailable: true,
    };

    setVariantsList([...variantsList, newVariant]);
    setIsAddSingleVarOpen(false);
    showNotice(`Added custom variant: ${q} • ${st} • ${sz}`);
  };

  // ------------------ MATRIX ROW UPDATES ------------------
  const handleUpdateVariantField = (
    id: string,
    field: keyof ProductVariant,
    value: any
  ) => {
    setVariantsList((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const handleRemoveVariant = (id: string) => {
    setVariantsList((prev) => prev.filter((v) => v.id !== id));
  };

  // ------------------ MEDIA UPLOADS ------------------
  const handleImageFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadProgress('uploading');
    try {
      const newItems: ProductMedia[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploadedUrl = await uploadMediaFile(file, 'products');

        newItems.push({
          id: `media-upl-${Date.now()}-${i}`,
          productId: editingProductId || '',
          type: 'photo',
          url: uploadedUrl,
          alt: `${prodName || 'Product'} photo`,
          title: uploadMediaTitle || file.name,
          displayOrder: mediaList.length + i + 1,
          variantQuality: uploadQualityTarget === 'All' ? undefined : uploadQualityTarget,
          variantSleeve: uploadSleeveTarget === 'All' ? undefined : uploadSleeveTarget,
        });
      }

      setMediaList((prev) => [...prev, ...newItems]);
      setUploadProgress('uploaded');
      showNotice(`Successfully uploaded ${files.length} photo(s) to Supabase Storage.`);
      setUploadMediaTitle('');
      setTimeout(() => setUploadProgress('idle'), 3000);
    } catch (err) {
      setUploadProgress('failed');
      showNotice('Error uploading image to storage. Please try again.', 'error');
      setTimeout(() => setUploadProgress('idle'), 4000);
    } finally {
      e.target.value = '';
    }
  };

  const handleAddVideo = () => {
    if (!videoUrlInput.trim()) return;
    const newVideo: ProductMedia = {
      id: `media-vid-${Date.now()}`,
      productId: editingProductId || '',
      type: 'video',
      url: videoUrlInput.trim(),
      alt: `${prodName || 'Product'} Video Demo`,
      title: uploadMediaTitle || 'Product Video',
      displayOrder: mediaList.length + 1,
      variantQuality: uploadQualityTarget === 'All' ? undefined : uploadQualityTarget,
      variantSleeve: uploadSleeveTarget === 'All' ? undefined : uploadSleeveTarget,
    };
    setMediaList((prev) => [...prev, newVideo]);
    setVideoUrlInput('');
    setIsVideoModalOpen(false);
    showNotice('Video reference added successfully.');
  };

  const handleRemoveMedia = (id: string) => {
    setMediaList((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-6 max-w-7xl text-[#F1F0EC]">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-elevation flex items-center gap-2.5 text-xs font-semibold animate-in fade-in border ${
            notification.type === 'success'
              ? 'bg-[#17191D] text-[#F1F0EC] border-[#3FB982]/40'
              : 'bg-[#17191D] text-[#D96B6B] border-[#D96B6B]/40'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-[#3FB982]" />
          ) : (
            <AlertCircle className="w-4 h-4 text-[#D96B6B]" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalState.isOpen}
        title="Delete Garment Catalog Listing"
        message={`Are you sure you want to permanently remove "${deleteModalState.productName}" and all associated variant combinations from the store?`}
        confirmLabel="Delete Garment"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={handleConfirmDeleteProduct}
        onCancel={() => setDeleteModalState({ isOpen: false, productId: '', productName: '' })}
      />

      {/* Clear Matrix Confirmation Modal */}
      <ConfirmModal
        isOpen={isClearMatrixModalOpen}
        title="Clear All Combinations"
        message="Are you sure you want to remove all variants from this matrix? You will need to regenerate or add variants before saving."
        confirmLabel="Clear Matrix"
        cancelLabel="Keep Variants"
        isDestructive={true}
        onConfirm={() => {
          setVariantsList([]);
          setIsClearMatrixModalOpen(false);
        }}
        onCancel={() => setIsClearMatrixModalOpen(false)}
      />

      {/* ========================================================================= */}
      {/* 1. MASTER PRODUCTS LIST VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#17191D] p-5 sm:p-6 rounded-2xl border border-[#30343A] shadow-card">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-[#F1F0EC]">
                  Garments &amp; Dynamic Catalog
                </h1>
                <span className="text-xs font-bold bg-[#1D2025] text-[#C9A96A] border border-[#30343A] px-2.5 py-0.5 rounded-lg">
                  {products.length} Products
                </span>
              </div>
              <p className="text-xs text-[#85888E] mt-1">
                Manage high quality and standard quality listings, dynamic sleeve tiers, sizes, real-time pricing, stock, and gallery photos.
              </p>
            </div>
            <button
              type="button"
              onClick={handleStartCreate}
              className="inline-flex items-center justify-center gap-2 bg-[#C9A96A] hover:bg-[#D8BD88] text-[#101114] text-xs font-semibold min-h-[48px] px-5 sm:px-6 rounded-xl shadow-xs transition-all active:scale-[0.99] w-full sm:w-auto flex-shrink-0"
            >
              <Plus className="w-4.5 h-4.5 stroke-[2.2]" />
              <span>Add Garment Listing</span>
            </button>
          </div>

          {/* Filter / Search Strip */}
          <div className="bg-[#17191D] p-4 rounded-2xl border border-[#30343A] shadow-card flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="w-full sm:w-80">
              <input
                type="text"
                placeholder="Search products by name, tagline, slug..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-[#1D2025] border border-[#343840] text-[#F1F0EC] placeholder-[#85888E] rounded-xl focus:border-[#C9A96A] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-[#85888E]">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-[#1D2025] border border-[#343840] text-[#F1F0EC] rounded-xl focus:border-[#C9A96A] focus:outline-none"
              >
                <option value="all">All Categories ({products.length})</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Products List */}
          {filteredProducts.length === 0 ? (
            <div className="bg-[#17191D] p-12 text-center rounded-2xl border border-[#30343A] space-y-3">
              <Package className="w-12 h-12 text-[#85888E] mx-auto" />
              <h3 className="font-bold text-base text-[#F1F0EC]">No Products Found</h3>
              <p className="text-xs text-[#85888E]">
                {catalogSearch || categoryFilter !== 'all'
                  ? 'No garment matched your current search or category filter.'
                  : 'Click "+ Add Garment Listing" above to create your first catalog entry.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredProducts.map((prod) => {
                const category = categories.find((c) => c.id === prod.categoryId);
                const subcategory = subcategories.find((s) => s.id === prod.subcategoryId);
                const primaryImage = prod.media?.[0]?.url || '/images/products/sleevless high.jpeg';

                const prices = prod.variants?.map((v) => v.price) || [480];
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);
                const totalStock = prod.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
                const uniqueQualities = Array.from(new Set(prod.variants?.map((v) => v.quality).filter(Boolean)));
                const uniqueSleeves = Array.from(new Set(prod.variants?.map((v) => v.sleeve).filter(Boolean)));

                return (
                  <div
                    key={prod.id}
                    className="bg-[#17191D] hover:bg-[#1D2025] p-4 sm:p-5 rounded-2xl border border-[#30343A] shadow-card hover:border-[#3E434B] transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    {/* Left Product Info */}
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className="relative w-16 h-20 sm:w-20 sm:h-24 bg-[#202329] rounded-xl overflow-hidden border border-[#30343A] flex-shrink-0 p-1">
                        <Image
                          src={primaryImage}
                          alt={prod.name}
                          fill
                          sizes="80px"
                          className="object-contain p-1"
                        />
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#23262B] text-[#B4B5BA] border border-[#30343A]">
                            {category?.name || 'Category'} {subcategory ? `• ${subcategory.name}` : ''}
                          </span>
                          {prod.isPublished ? (
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-[#3FB982]/15 text-[#3FB982] border border-[#3FB982]/30">
                              Live on Store
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-md bg-[#23262B] text-[#85888E] border border-[#30343A]">
                              Draft / Hidden
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-base sm:text-lg text-[#F1F0EC] leading-tight">
                          {prod.name}
                        </h3>
                        <p className="text-xs text-[#85888E] line-clamp-1">{prod.subtitle}</p>

                        <div className="flex items-center gap-3 text-xs text-[#85888E] pt-1 flex-wrap font-medium">
                          <span>
                            <strong className="text-[#F1F0EC]">Price:</strong>{' '}
                            <span className="text-[#C9A96A] font-bold">
                              {minPrice === maxPrice ? `Rs. ${minPrice}` : `Rs. ${minPrice} – Rs. ${maxPrice}`}
                            </span>
                          </span>
                          <span>•</span>
                          <span>
                            <strong className="text-[#F1F0EC]">Stock:</strong> {totalStock} pcs
                          </span>
                          <span>•</span>
                          <span>
                            <strong className="text-[#F1F0EC]">Quality:</strong> {uniqueQualities.join(', ') || 'High Quality'}
                          </span>
                          <span>•</span>
                          <span>
                            <strong className="text-[#F1F0EC]">Styles:</strong> {uniqueSleeves.join(', ') || 'Standard'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2 self-end md:self-center">
                      <a
                        href={`/product/${prod.slug}`}
                        target="_blank"
                        className="p-2 bg-[#202329] hover:bg-[#272A2F] text-[#85888E] hover:text-[#C9A96A] rounded-xl border border-[#30343A] transition-colors"
                        title="View live product"
                      >
                        <Eye className="w-4 h-4" />
                      </a>

                      <button
                        type="button"
                        onClick={() => handleStartEdit(prod)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#23262B] hover:bg-[#2A2E35] text-[#F1F0EC] border border-[#30343A] hover:border-[#C9A96A] text-xs font-semibold rounded-xl shadow-xs transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-[#C9A96A]" />
                        <span>Edit Listing</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteModalState({ isOpen: true, productId: prod.id, productName: prod.name })}
                        className="p-2 text-[#D96B6B] hover:bg-[#D96B6B]/10 rounded-xl border border-[#D96B6B]/30 transition-colors"
                        title="Delete garment listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. FULL PRODUCT EDIT / CREATE FORM */}
      {/* ========================================================================= */}
      {viewMode === 'editor' && (
        <form onSubmit={handleSaveProduct} className="space-y-6">
          {/* Top Bar Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#17191D] p-5 rounded-2xl border border-[#30343A] shadow-card">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="p-2 text-[#85888E] hover:text-[#F1F0EC] hover:bg-[#202329] rounded-xl transition-colors"
                title="Back to all products"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-[#F1F0EC]">
                  {editingProductId ? `Edit Garment: ${prodName || 'Product'}` : 'Create New Garment Listing'}
                </h1>
                <p className="text-xs text-[#85888E]">
                  Configure single-quality listing details, sleeve styles, sizes, prices, stock, and variant photography.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="px-4 py-2 text-xs font-semibold text-[#B4B5BA] bg-[#202329] border border-[#30343A] hover:bg-[#272A2F] hover:text-[#F1F0EC] rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2 bg-[#C9A96A] hover:bg-[#D8BD88] text-[#101114] text-xs font-bold rounded-xl shadow-xs transition-all active:scale-[0.99]"
              >
                <Save className="w-4 h-4 stroke-[2.2]" />
                <span>Save Garment</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-[#30343A] pb-2 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setEditorTab('basic')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                editorTab === 'basic'
                  ? 'bg-[#1D2025] text-[#F1F0EC] border-b-2 border-[#C9A96A]'
                  : 'bg-[#17191D] text-[#85888E] hover:text-[#F1F0EC] border border-[#30343A]'
              }`}
            >
              1. Basic Info &amp; Taxonomy
            </button>

            <button
              type="button"
              onClick={() => setEditorTab('variants')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                editorTab === 'variants'
                  ? 'bg-[#1D2025] text-[#F1F0EC] border-b-2 border-[#C9A96A]'
                  : 'bg-[#17191D] text-[#85888E] hover:text-[#F1F0EC] border border-[#30343A]'
              }`}
            >
              <span>2. Styles &amp; Variants ({variantsList.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setEditorTab('media')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                editorTab === 'media'
                  ? 'bg-[#1D2025] text-[#F1F0EC] border-b-2 border-[#C9A96A]'
                  : 'bg-[#17191D] text-[#85888E] hover:text-[#F1F0EC] border border-[#30343A]'
              }`}
            >
              <span>3. Photos &amp; Video ({mediaList.length})</span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: BASIC INFORMATION */}
          {/* ========================================================================= */}
          {editorTab === 'basic' && (
            <div className="bg-[#17191D] p-5 sm:p-6 rounded-2xl border border-[#30343A] shadow-card space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-[#30343A] pb-3">
                <h2 className="text-xs font-bold text-[#C9A96A] uppercase tracking-wider">
                  Product Identification &amp; Craftsmanship
                </h2>
                <span className="text-[11px] text-[#85888E]">
                  Rule: Each garment listing represents ONE quality tier.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#D8D8D4] mb-1">
                    Garment Name <span className="text-[#D96B6B]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Men's Pure Cotton Vest — High Quality"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    className="w-full p-2.5 bg-[#1D2025] border border-[#343840] rounded-xl text-xs font-semibold text-[#F1F0EC] placeholder-[#85888E] focus:border-[#C9A96A] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#D8D8D4] mb-1">
                    Quality Level <span className="text-[#D96B6B]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. High Quality, Standard Quality"
                    value={prodQualityGrade}
                    onChange={(e) => {
                      setProdQualityGrade(e.target.value);
                      if (!customQualities.includes(e.target.value) && e.target.value.trim()) {
                        setCustomQualities([e.target.value.trim()]);
                      }
                    }}
                    className="w-full p-2.5 bg-[#1D2025] border border-[#343840] rounded-xl text-xs font-bold text-[#C9A96A] focus:border-[#C9A96A] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#D8D8D4] mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. mens-cotton-vest-high-quality"
                    value={prodSlug}
                    onChange={(e) => setProdSlug(e.target.value)}
                    className="w-full p-2.5 bg-[#1D2025] border border-[#343840] rounded-xl text-xs font-mono text-[#F1F0EC] placeholder-[#85888E] focus:border-[#C9A96A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#D8D8D4] mb-1">
                    Category <span className="text-[#D96B6B]">*</span>
                  </label>
                  <select
                    value={prodCategoryId}
                    onChange={(e) => setProdCategoryId(e.target.value)}
                    className="w-full p-2.5 bg-[#1D2025] border border-[#343840] rounded-xl text-xs font-semibold text-[#F1F0EC] focus:border-[#C9A96A] focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#17191D] text-[#F1F0EC]">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#D8D8D4] mb-1">
                    Subcategory
                  </label>
                  <select
                    value={prodSubcategoryId}
                    onChange={(e) => setProdSubcategoryId(e.target.value)}
                    className="w-full p-2.5 bg-[#1D2025] border border-[#343840] rounded-xl text-xs text-[#F1F0EC] focus:border-[#C9A96A] focus:outline-none"
                  >
                    <option value="" className="bg-[#17191D] text-[#F1F0EC]">-- General / None --</option>
                    {activeSubcatsForCategory.map((s) => (
                      <option key={s.id} value={s.id} className="bg-[#17191D] text-[#F1F0EC]">
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#D8D8D4] mb-1">
                  Tagline / Subtitle
                </label>
                <input
                  type="text"
                  placeholder="e.g. 100% Fine Combed Cotton • Anti-Sag Neck Seams • All-Day Comfort"
                  value={prodSubtitle}
                  onChange={(e) => setProdSubtitle(e.target.value)}
                  className="w-full p-2.5 bg-[#1D2025] border border-[#343840] rounded-xl text-xs text-[#F1F0EC] placeholder-[#85888E] focus:border-[#C9A96A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#D8D8D4] mb-1">
                  Craftsmanship Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Detailed description of yarn quality, weave, softness, and durability..."
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  className="w-full p-2.5 bg-[#1D2025] border border-[#343840] rounded-xl text-xs leading-relaxed text-[#F1F0EC] placeholder-[#85888E] focus:border-[#C9A96A] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#D8D8D4] mb-1">
                    Key Features (One bullet per line)
                  </label>
                  <textarea
                    rows={3}
                    value={prodFeaturesText}
                    onChange={(e) => setProdFeaturesText(e.target.value)}
                    className="w-full p-2.5 bg-[#1D2025] border border-[#343840] rounded-xl text-xs leading-relaxed text-[#F1F0EC] focus:border-[#C9A96A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#D8D8D4] mb-1">
                    Care Instructions (One per line)
                  </label>
                  <textarea
                    rows={3}
                    value={prodCareText}
                    onChange={(e) => setProdCareText(e.target.value)}
                    className="w-full p-2.5 bg-[#1D2025] border border-[#343840] rounded-xl text-xs leading-relaxed text-[#F1F0EC] focus:border-[#C9A96A] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#30343A] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="prodPublishCheck"
                    checked={prodIsPublished}
                    onChange={(e) => setProdIsPublished(e.target.checked)}
                    className="w-4 h-4 rounded border-[#343840] bg-[#1D2025] text-[#C9A96A] focus:ring-[#C9A96A]"
                  />
                  <label htmlFor="prodPublishCheck" className="text-xs font-semibold text-[#F1F0EC] cursor-pointer">
                    Publish this garment live on the store
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: ADVANCED DYNAMIC VARIANT SYSTEM */}
          {/* ========================================================================= */}
          {editorTab === 'variants' && (
            <div className="space-y-6 animate-in fade-in">
              {/* STEP 1: Styles / Sleeves */}
              <div className="bg-[#17191D] p-5 rounded-2xl border border-[#30343A] shadow-card space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-xs text-[#F1F0EC] uppercase tracking-wider flex items-center gap-1.5">
                      <span>Step 1: Style / Sleeve Options</span>
                      <span className="text-[#85888E] font-normal">({customStyles.length})</span>
                    </h3>
                    <p className="text-[11px] text-[#85888E]">
                      Define styles for this garment (e.g. Sleeveless, Full Sleeve, Half Sleeve, Boxer Briefs).
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAddStyleOpen(true)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#23262B] hover:bg-[#2A2E35] border border-[#30343A] hover:border-[#C9A96A] text-[#F1F0EC] rounded-xl text-xs font-semibold transition-colors self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#C9A96A]" />
                    <span>Add Style</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {customStyles.map((st) => (
                    <div
                      key={st}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#202329] border border-[#30343A] rounded-xl text-xs font-semibold text-[#F1F0EC]"
                    >
                      <span>{st}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveStyle(st)}
                        className="text-[#85888E] hover:text-[#D96B6B] transition-colors"
                        title="Delete Style Option"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {isAddStyleOpen && (
                  <div className="p-3 bg-[#1D2025] rounded-xl border border-[#343840] flex items-center gap-2 max-w-md animate-in fade-in">
                    <input
                      type="text"
                      placeholder="e.g. Half Sleeve, Regular Fit..."
                      value={newStyleInput}
                      onChange={(e) => setNewStyleInput(e.target.value)}
                      className="flex-1 p-2 bg-[#202329] border border-[#343840] rounded-lg text-xs text-[#F1F0EC] focus:border-[#C9A96A] focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleAddStyle}
                      className="px-3 py-2 bg-[#C9A96A] text-[#101114] text-xs font-bold rounded-lg"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddStyleOpen(false)}
                      className="p-1.5 text-[#85888E] hover:text-[#F1F0EC]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* STEP 2: Sizes */}
              <div className="bg-[#17191D] p-5 rounded-2xl border border-[#30343A] shadow-card space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-xs text-[#F1F0EC] uppercase tracking-wider flex items-center gap-1.5">
                      <span>Step 2: Size Options</span>
                      <span className="text-[#85888E] font-normal">({customSizes.length})</span>
                    </h3>
                    <p className="text-[11px] text-[#85888E]">
                      Select sizes for this garment (e.g. S, M, L, XL, XXL, Free Size).
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAddSizeOpen(true)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#23262B] hover:bg-[#2A2E35] border border-[#30343A] hover:border-[#C9A96A] text-[#F1F0EC] rounded-xl text-xs font-semibold transition-colors self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#C9A96A]" />
                    <span>Add Size</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {customSizes.map((sz) => (
                    <div
                      key={sz}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#202329] border border-[#30343A] rounded-xl text-xs font-semibold text-[#F1F0EC]"
                    >
                      <span>{sz}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSize(sz)}
                        className="text-[#85888E] hover:text-[#D96B6B] transition-colors"
                        title="Delete Size Option"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {isAddSizeOpen && (
                  <div className="p-3 bg-[#1D2025] rounded-xl border border-[#343840] flex items-center gap-2 max-w-md animate-in fade-in">
                    <input
                      type="text"
                      placeholder="e.g. 28, 30, Free Size..."
                      value={newSizeInput}
                      onChange={(e) => setNewSizeInput(e.target.value)}
                      className="flex-1 p-2 bg-[#202329] border border-[#343840] rounded-lg text-xs text-[#F1F0EC] focus:border-[#C9A96A] focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleAddSize}
                      className="px-3 py-2 bg-[#C9A96A] text-[#101114] text-xs font-bold rounded-lg"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddSizeOpen(false)}
                      className="p-1.5 text-[#85888E] hover:text-[#F1F0EC]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* STEP 3: Matrix Generator Settings & Action */}
              <div className="bg-[#17191D] p-5 rounded-2xl border border-[#30343A] shadow-card space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-xs text-[#F1F0EC] uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-[#C9A96A]" />
                      <span>Step 3: Generate Matrix Combinations</span>
                    </h3>
                    <p className="text-[11px] text-[#85888E]">
                      Auto-generate combination rows for Styles ({customStyles.length}) &times; Sizes ({customSizes.length}).
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setIsAddSingleVarOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#23262B] hover:bg-[#2A2E35] border border-[#30343A] text-[#F1F0EC] text-xs font-semibold rounded-xl transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#C9A96A]" />
                      <span>Custom Combination</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleGenerateCombinations}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#C9A96A] hover:bg-[#D8BD88] text-[#101114] text-xs font-bold rounded-xl shadow-xs transition-all active:scale-[0.99]"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Generate Matrix ({customStyles.length * customSizes.length} items)</span>
                    </button>
                  </div>
                </div>

                {/* Generator Default Preset Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#D8D8D4] mb-1">
                      Default Unit Price (Rs.)
                    </label>
                    <input
                      type="number"
                      value={genDefaultPrice}
                      onChange={(e) => setGenDefaultPrice(Number(e.target.value))}
                      className="w-full p-2 bg-[#1D2025] border border-[#343840] rounded-xl text-xs font-bold text-[#C9A96A] focus:border-[#C9A96A] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#D8D8D4] mb-1">
                      Default Compare Price (Rs.) (Optional)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 580"
                      value={genDefaultComparePrice || ''}
                      onChange={(e) =>
                        setGenDefaultComparePrice(
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      className="w-full p-2 bg-[#1D2025] border border-[#343840] rounded-xl text-xs text-[#F1F0EC] placeholder-[#85888E] focus:border-[#C9A96A] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#D8D8D4] mb-1">
                      Default Stock Units (Pcs)
                    </label>
                    <input
                      type="number"
                      value={genDefaultStock}
                      onChange={(e) => setGenDefaultStock(Number(e.target.value))}
                      className="w-full p-2 bg-[#1D2025] border border-[#343840] rounded-xl text-xs font-bold text-[#F1F0EC] focus:border-[#C9A96A] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Add Individual Single Variant Modal */}
                {isAddSingleVarOpen && (
                  <div className="p-4 bg-[#1D2025] rounded-xl border border-[#30343A] space-y-3 animate-in fade-in">
                    <h4 className="font-bold text-xs text-[#C9A96A] uppercase">
                      Add Specific Variant Combination
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#D8D8D4] mb-1">Quality</label>
                        <input
                          type="text"
                          value={singleVarQuality || prodQualityGrade}
                          onChange={(e) => setSingleVarQuality(e.target.value)}
                          className="w-full p-2 bg-[#202329] border border-[#343840] rounded-xl text-xs font-semibold text-[#F1F0EC]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#D8D8D4] mb-1">Style / Sleeve</label>
                        <select
                          value={singleVarStyle || customStyles[0]}
                          onChange={(e) => setSingleVarStyle(e.target.value)}
                          className="w-full p-2 bg-[#202329] border border-[#343840] rounded-xl text-xs font-semibold text-[#F1F0EC]"
                        >
                          {customStyles.map((st) => (
                            <option key={st} value={st} className="bg-[#17191D] text-[#F1F0EC]">
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#D8D8D4] mb-1">Size</label>
                        <select
                          value={singleVarSize || customSizes[0]}
                          onChange={(e) => setSingleVarSize(e.target.value)}
                          className="w-full p-2 bg-[#202329] border border-[#343840] rounded-xl text-xs font-semibold text-[#F1F0EC]"
                        >
                          {customSizes.map((sz) => (
                            <option key={sz} value={sz} className="bg-[#17191D] text-[#F1F0EC]">
                              {sz}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#D8D8D4] mb-1">Price (Rs.)</label>
                        <input
                          type="number"
                          value={singleVarPrice}
                          onChange={(e) => setSingleVarPrice(Number(e.target.value))}
                          className="w-full p-2 bg-[#202329] border border-[#343840] rounded-xl text-xs font-bold text-[#C9A96A]"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddSingleVarOpen(false)}
                        className="px-3 py-1.5 bg-[#23262B] text-[#B4B5BA] border border-[#30343A] text-xs font-semibold rounded-xl"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddSingleVariant}
                        className="px-4 py-1.5 bg-[#C9A96A] text-[#101114] text-xs font-bold rounded-xl"
                      >
                        Add This Variant
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* STEP 4: Full Variant Matrix Table */}
              <div className="bg-[#17191D] rounded-2xl border border-[#30343A] shadow-card overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-[#30343A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-sm text-[#F1F0EC]">
                      Active Variant Matrix ({variantsList.length} combinations)
                    </h3>
                    <p className="text-xs text-[#85888E]">
                      Live pricing, compare price, and inventory units for each combination.
                    </p>
                  </div>

                  {variantsList.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsClearMatrixModalOpen(true)}
                      className="text-xs text-[#D96B6B] hover:underline font-semibold self-start sm:self-auto"
                    >
                      Clear Matrix
                    </button>
                  )}
                </div>

                {variantsList.length === 0 ? (
                  <div className="p-10 text-center space-y-2">
                    <Boxes className="w-8 h-8 text-[#85888E] mx-auto" />
                    <p className="text-xs font-bold text-[#F1F0EC]">No variants in matrix yet</p>
                    <p className="text-xs text-[#85888E]">
                      Click &quot;Generate Matrix&quot; above to create combinations automatically.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#1D2025] text-[#C9A96A] uppercase font-bold text-[11px] border-b border-[#30343A]">
                        <tr>
                          <th className="p-3">Quality</th>
                          <th className="p-3">Style / Sleeve</th>
                          <th className="p-3 text-center">Size</th>
                          <th className="p-3">SKU</th>
                          <th className="p-3">Unit Price (Rs.)</th>
                          <th className="p-3">Compare Price</th>
                          <th className="p-3">Stock Units</th>
                          <th className="p-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#272A2F] font-medium text-[#F1F0EC]">
                        {variantsList.map((v) => (
                          <tr key={v.id} className="hover:bg-[#1D2025]/60 transition-colors">
                            <td className="p-3">
                              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#23262B] text-[#B4B5BA] border border-[#30343A]">
                                {v.quality}
                              </span>
                            </td>
                            <td className="p-3 font-semibold text-[#F1F0EC]">{v.sleeve}</td>
                            <td className="p-3 text-center">
                              <span className="font-bold bg-[#23262B] text-[#C9A96A] border border-[#30343A] px-2 py-0.5 rounded-md text-xs">
                                {v.size}
                              </span>
                            </td>
                            <td className="p-3 font-mono text-[11px] text-[#85888E]">
                              <input
                                type="text"
                                value={v.sku}
                                onChange={(e) => handleUpdateVariantField(v.id, 'sku', e.target.value)}
                                className="w-32 px-2 py-1 bg-[#202329] border border-[#343840] rounded-lg font-mono text-[11px] text-[#F1F0EC] focus:border-[#C9A96A] focus:outline-none"
                              />
                            </td>
                            <td className="p-3">
                              <input
                                type="number"
                                value={v.price}
                                onChange={(e) =>
                                  handleUpdateVariantField(v.id, 'price', Number(e.target.value))
                                }
                                className="w-24 px-2 py-1 bg-[#202329] border border-[#343840] rounded-lg font-bold text-[#C9A96A] focus:border-[#C9A96A] focus:outline-none"
                              />
                            </td>
                            <td className="p-3">
                              <input
                                type="number"
                                placeholder="Optional"
                                value={v.salePrice || ''}
                                onChange={(e) =>
                                  handleUpdateVariantField(
                                    v.id,
                                    'salePrice',
                                    e.target.value ? Number(e.target.value) : undefined
                                  )
                                }
                                className="w-24 px-2 py-1 bg-[#202329] border border-[#343840] rounded-lg text-[#F1F0EC] focus:border-[#C9A96A] focus:outline-none"
                              />
                            </td>
                            <td className="p-3">
                              <input
                                type="number"
                                value={v.stock}
                                onChange={(e) =>
                                  handleUpdateVariantField(v.id, 'stock', Number(e.target.value))
                                }
                                className="w-20 px-2 py-1 bg-[#202329] border border-[#343840] rounded-lg font-bold text-[#F1F0EC] focus:border-[#C9A96A] focus:outline-none"
                              />
                            </td>
                            <td className="p-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveVariant(v.id)}
                                className="p-1.5 text-[#D96B6B] hover:bg-[#D96B6B]/10 rounded-lg transition-colors"
                                title="Remove this combination"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: PHOTOS & VIDEOS (VARIANT SPECIFIC) */}
          {/* ========================================================================= */}
          {editorTab === 'media' && (
            <div className="bg-[#17191D] p-5 sm:p-6 rounded-2xl border border-[#30343A] shadow-card space-y-6 animate-in fade-in">
              <div>
                <h3 className="font-bold text-sm text-[#F1F0EC]">
                  Variant-Specific Product Photos &amp; Video Demonstration
                </h3>
                <p className="text-xs text-[#85888E] mt-0.5">
                  Attach specific photos to exact sleeve options (e.g. Sleeveless vs Full Sleeve). The public storefront gallery will reactively update as the customer clicks different style options!
                </p>
              </div>

              {/* Upload Box */}
              <div className="p-5 bg-[#1D2025] rounded-2xl border border-dashed border-[#343840] space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#D8D8D4] mb-1">
                      1. Quality Target:
                    </label>
                    <select
                      value={uploadQualityTarget}
                      onChange={(e) => setUploadQualityTarget(e.target.value)}
                      className="w-full p-2.5 bg-[#202329] border border-[#343840] rounded-xl text-xs font-semibold text-[#F1F0EC] focus:border-[#C9A96A] focus:outline-none"
                    >
                      <option value="All" className="bg-[#17191D] text-[#F1F0EC]">All Qualities</option>
                      {customQualities.map((q) => (
                        <option key={q} value={q} className="bg-[#17191D] text-[#F1F0EC]">
                          For &quot;{q}&quot;
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#D8D8D4] mb-1">
                      2. Style / Sleeve Target:
                    </label>
                    <select
                      value={uploadSleeveTarget}
                      onChange={(e) => setUploadSleeveTarget(e.target.value)}
                      className="w-full p-2.5 bg-[#202329] border border-[#343840] rounded-xl text-xs font-semibold text-[#F1F0EC] focus:border-[#C9A96A] focus:outline-none"
                    >
                      <option value="All" className="bg-[#17191D] text-[#F1F0EC]">All Styles</option>
                      {availableVariantStylesForMedia.map((sl) => (
                        <option key={sl} value={sl} className="bg-[#17191D] text-[#F1F0EC]">
                          For &quot;{sl}&quot;
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#D8D8D4] mb-1">
                      3. Photo Label (Optional):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Front View, Stitching Detail"
                      value={uploadMediaTitle}
                      onChange={(e) => setUploadMediaTitle(e.target.value)}
                      className="w-full p-2.5 bg-[#202329] border border-[#343840] rounded-xl text-xs text-[#F1F0EC] placeholder-[#85888E] focus:border-[#C9A96A] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 items-center pt-1">
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C9A96A] hover:bg-[#D8BD88] text-[#101114] text-xs font-bold rounded-xl cursor-pointer transition-all active:scale-[0.99] shadow-xs">
                    <Upload className="w-4 h-4" />
                    <span>
                      {uploadProgress === 'uploading'
                        ? 'Uploading Files to Supabase Storage...'
                        : 'Choose Photos from Computer / Mobile'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageFilesChange}
                      disabled={uploadProgress === 'uploading'}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setIsVideoModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#23262B] hover:bg-[#2A2E35] text-[#F1F0EC] text-xs font-semibold rounded-xl border border-[#30343A] transition-colors"
                  >
                    <Film className="w-4 h-4 text-[#D96B6B]" />
                    <span>Add Video URL</span>
                  </button>

                  {uploadProgress === 'uploaded' && (
                    <span className="text-xs text-[#3FB982] font-semibold flex items-center gap-1">
                      <Check className="w-4 h-4" /> Uploaded!
                    </span>
                  )}
                </div>
              </div>

              {/* Video Modal */}
              {isVideoModalOpen && (
                <div className="p-4 bg-[#1D2025] rounded-xl border border-[#30343A] space-y-3 animate-in fade-in">
                  <h4 className="font-bold text-xs text-[#C9A96A] uppercase">
                    Add Video Clip URL
                  </h4>
                  <input
                    type="text"
                    placeholder="https://example.com/video.mp4"
                    value={videoUrlInput}
                    onChange={(e) => setVideoUrlInput(e.target.value)}
                    className="w-full p-2.5 bg-[#202329] border border-[#343840] rounded-xl text-xs text-[#F1F0EC] focus:border-[#C9A96A] focus:outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsVideoModalOpen(false)}
                      className="px-3 py-1.5 bg-[#23262B] text-[#B4B5BA] text-xs font-semibold rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddVideo}
                      className="px-4 py-1.5 bg-[#C9A96A] text-[#101114] text-xs font-bold rounded-xl"
                    >
                      Add Video
                    </button>
                  </div>
                </div>
              )}

              {/* Gallery Grid */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-[#F1F0EC] uppercase tracking-wider">
                  Gallery Photos &amp; Videos ({mediaList.length})
                </h4>

                {mediaList.length === 0 ? (
                  <p className="text-xs text-[#85888E] py-8 text-center border border-dashed border-[#30343A] rounded-2xl">
                    No photos uploaded yet for this garment listing. Use the file picker above to add photos.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                    {mediaList.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="group relative bg-[#1D2025] rounded-2xl border border-[#30343A] overflow-hidden shadow-card flex flex-col"
                      >
                        <div className="relative aspect-3/4 w-full bg-[#202329] p-1">
                          {item.type === 'video' ? (
                            <div className="w-full h-full flex items-center justify-center bg-[#17191D] text-[#C9A96A] text-xs font-bold">
                              Video Clip
                            </div>
                          ) : (
                            <Image
                              src={item.url}
                              alt={item.alt || 'Product Photo'}
                              fill
                              sizes="120px"
                              className="object-contain p-1"
                            />
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveMedia(item.id)}
                            className="absolute top-2 right-2 p-1.5 bg-[#101114]/80 text-[#D96B6B] hover:text-white hover:bg-[#D96B6B] rounded-full transition-colors"
                            title="Delete photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="p-2.5 bg-[#17191D] border-t border-[#30343A] text-[10px] space-y-0.5">
                          <p className="font-bold text-[#F1F0EC] truncate">
                            {item.title || `Photo #${idx + 1}`}
                          </p>
                          <div className="flex items-center gap-1 text-[#85888E] font-medium">
                            <span>Q: {item.variantQuality || 'All'}</span>
                            <span>•</span>
                            <span>S: {item.variantSleeve || 'All'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
