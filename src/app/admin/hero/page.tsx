'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { HeroSlide } from '@/types';
import {
  Plus,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  Upload,
  Check,
  X,
  Monitor,
  Smartphone,
  Image as ImageIcon,
} from 'lucide-react';
import { ConfirmModal } from '@/components/admin/ConfirmModal';
import { optimizeImageForUpload } from '@/lib/imageOptimizer';

export default function AdminHeroPage() {
  const { heroSlides, saveHeroSlide, deleteHeroSlide, uploadMediaFile } = useStore();
  const [activeTab, setActiveTab] = useState<'desktop' | 'mobile'>('desktop');
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [saveSuccessToast, setSaveSuccessToast] = useState('');

  // Delete Confirm Modal State
  const [deleteSlideModal, setDeleteSlideModal] = useState<{ isOpen: boolean; slideId: string; title: string }>({
    isOpen: false,
    slideId: '',
    title: '',
  });

  // Form State
  const [title, setTitle] = useState('');
  const [image, setImage] = useState('');
  const [buttonLink, setButtonLink] = useState('/shop');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState<boolean>(true);

  // Filter slides by active tab
  const filteredSlides = heroSlides.filter(
    (s) => (s.deviceType || 'desktop') === activeTab
  );

  const showToast = (msg: string) => {
    setSaveSuccessToast(msg);
    setTimeout(() => setSaveSuccessToast(''), 3000);
  };

  const handleOpenAddModal = () => {
    setEditingSlide(null);
    setTitle('');
    setImage(activeTab === 'desktop' ? '/slider 1.png' : '/mobile slider 1.png');
    setButtonLink('/shop');
    setDisplayOrder(filteredSlides.length + 1);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setTitle(slide.title || '');
    setImage(slide.desktopImage || slide.mobileImage || '');
    setButtonLink(slide.link || slide.buttonLink || '/shop');
    setDisplayOrder(slide.displayOrder || 1);
    setIsActive(slide.isActive !== false);
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      let fileToUpload = file;
      try {
        fileToUpload = await optimizeImageForUpload(file, { maxWidth: 1920, quality: 0.85 });
      } catch (optErr) {
        console.warn('Hero image optimization fallback:', optErr);
      }
      const url = await uploadMediaFile(fileToUpload, 'hero-slides');
      if (url.startsWith('data:image')) {
        throw new Error('Upload generated Base64 data.');
      }
      setImage(url);
      showToast('Hero image uploaded to Supabase Storage!');
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('Storage limit reached')) {
        showToast('Storage limit reached. Please remove unused media from Supabase Storage or upgrade the storage plan.');
      } else {
        showToast('Failed to upload image. Please try again.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      showToast(`Please upload or specify a ${activeTab} banner image.`);
      return;
    }

    const slideToSave: HeroSlide = {
      id: editingSlide ? editingSlide.id : `hero-${activeTab}-${Date.now()}`,
      title: title.trim() || `${activeTab.toUpperCase()} Hero Slide ${displayOrder}`,
      desktopImage: activeTab === 'desktop' ? image : (editingSlide?.desktopImage || ''),
      mobileImage: activeTab === 'mobile' ? image : (editingSlide?.mobileImage || undefined),
      deviceType: activeTab,
      link: buttonLink.trim() || '/shop',
      buttonLink: buttonLink.trim() || '/shop',
      displayOrder: Number(displayOrder) || 1,
      isActive,
    };

    try {
      await saveHeroSlide(slideToSave);
      setIsModalOpen(false);
      showToast('Hero banner slide saved and published live!');
    } catch (err) {
      showToast('Error saving hero slide.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteSlideModal.slideId) return;
    try {
      await deleteHeroSlide(deleteSlideModal.slideId);
      showToast('Hero banner deleted from store.');
    } catch (err) {
      showToast('Error deleting hero slide.');
    } finally {
      setDeleteSlideModal({ isOpen: false, slideId: '', title: '' });
    }
  };

  const handleToggleActive = async (slide: HeroSlide) => {
    await saveHeroSlide({
      ...slide,
      isActive: !slide.isActive,
    });
    showToast(slide.isActive ? 'Banner slide hidden' : 'Banner slide activated live');
  };

  return (
    <div className="space-y-6 max-w-6xl text-charcoal-900 dark:text-[#F4F1E9]">
      {/* Toast Notification */}
      {saveSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-white dark:bg-[#191917] text-charcoal-900 dark:text-[#F4F1E9] border border-emerald-500/40 rounded-xl shadow-elevation flex items-center gap-2.5 text-xs font-semibold animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{saveSuccessToast}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteSlideModal.isOpen}
        title="Delete Banner Slide"
        message={`Are you sure you want to delete "${deleteSlideModal.title || 'this banner'}"? It will no longer display on the website.`}
        confirmLabel="Delete Banner"
        cancelLabel="Keep Banner"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteSlideModal({ isOpen: false, slideId: '', title: '' })}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#191917] p-6 rounded-2xl border border-light-border dark:border-[#34322D] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-charcoal-900 dark:text-[#F4F1E9]">
              Hero Banners &amp; Slider Architecture
            </h1>
            <span className="text-xs font-bold bg-light-elevated dark:bg-[#22211E] text-[#B89555] dark:text-[#C9A96A] border border-light-border dark:border-[#34322D] px-2.5 py-0.5 rounded-lg">
              {filteredSlides.length} {activeTab === 'desktop' ? 'Desktop' : 'Mobile'} Slides
            </span>
          </div>
          <p className="text-xs text-charcoal-500 dark:text-[#8E8A80] mt-1">
            Separate systems for Desktop (1920&times;800) and Mobile (1080&times;1350) responsive banners.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 bg-champagne-500 hover:bg-champagne-400 text-charcoal-950 text-xs font-bold h-10 px-4 rounded-xl shadow-xs transition-all active:scale-[0.99] self-start sm:self-auto flex-shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add {activeTab === 'desktop' ? 'Desktop' : 'Mobile'} Slide</span>
        </button>
      </div>

      {/* Device Mode Switcher Tabs */}
      <div className="flex gap-2 border-b border-light-border dark:border-[#34322D] pb-1">
        <button
          onClick={() => setActiveTab('desktop')}
          className={`py-3 px-5 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${
            activeTab === 'desktop'
              ? 'bg-champagne-500 text-charcoal-950 shadow-xs'
              : 'text-charcoal-600 dark:text-[#8E8A80] hover:text-charcoal-900 dark:hover:text-[#F4F1E9] bg-white dark:bg-[#191917] border border-light-border dark:border-[#34322D]'
          }`}
        >
          <Monitor className="w-4 h-4" />
          <span>DESKTOP HERO SLIDES ({heroSlides.filter((s) => (s.deviceType || 'desktop') === 'desktop').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('mobile')}
          className={`py-3 px-5 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${
            activeTab === 'mobile'
              ? 'bg-champagne-500 text-charcoal-950 shadow-xs'
              : 'text-charcoal-600 dark:text-[#8E8A80] hover:text-charcoal-900 dark:hover:text-[#F4F1E9] bg-white dark:bg-[#191917] border border-light-border dark:border-[#34322D]'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>MOBILE HERO SLIDES ({heroSlides.filter((s) => s.deviceType === 'mobile').length})</span>
        </button>
      </div>

      {/* Slides List */}
      <div className="space-y-4">
        {filteredSlides.length === 0 ? (
          <div className="bg-white dark:bg-[#191917] p-12 text-center rounded-2xl border border-light-border dark:border-[#34322D] space-y-3 shadow-sm">
            <ImageIcon className="w-10 h-10 text-charcoal-400 dark:text-[#8E8A80] mx-auto" />
            <h3 className="text-sm font-bold text-charcoal-900 dark:text-[#F4F1E9]">No {activeTab} Slides Configured</h3>
            <p className="text-xs text-charcoal-500 dark:text-[#8E8A80]">Click &quot;Add {activeTab === 'desktop' ? 'Desktop' : 'Mobile'} Slide&quot; above to upload your banner image.</p>
          </div>
        ) : (
          filteredSlides.map((slide, index) => (
            <div
              key={slide.id || index}
              className={`bg-white dark:bg-[#191917] rounded-2xl border transition-all p-4 sm:p-5 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between ${
                slide.isActive ? 'border-light-border dark:border-[#34322D] shadow-sm hover:border-[#B89555]/60 dark:hover:border-[#C9A96A]/60' : 'border-light-border dark:border-[#34322D] opacity-60'
              }`}
            >
              {/* Preview Thumbnail */}
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div
                  className={`relative rounded-xl overflow-hidden flex-shrink-0 border border-light-border dark:border-[#34322D] bg-light-elevated dark:bg-[#22211E] p-1 ${
                    activeTab === 'desktop' ? 'w-36 h-20' : 'w-20 h-24'
                  }`}
                >
                  <Image
                    src={slide.desktopImage || slide.mobileImage || (activeTab === 'desktop' ? '/slider 1.png' : '/mobile slider 1.png')}
                    alt={slide.title || 'Hero preview'}
                    fill
                    className="object-contain"
                  />
                </div>

                {/* Details */}
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-light-elevated dark:bg-[#22211E] border border-light-border dark:border-[#34322D] text-charcoal-700 dark:text-[#B8B3A8]">
                      Order #{slide.displayOrder}
                    </span>
                    {slide.isActive ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                        Live on {activeTab}
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-light-elevated dark:bg-[#22211E] text-charcoal-500 dark:text-[#8E8A80] border border-light-border dark:border-[#34322D]">
                        Hidden
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-charcoal-900 dark:text-[#F4F1E9] line-clamp-1">
                    {slide.title || `Campaign Slide #${index + 1}`}
                  </h3>
                  <p className="text-xs text-charcoal-500 dark:text-[#8E8A80] font-mono truncate">
                    Destination: <span className="text-[#B89555] dark:text-[#C9A96A]">{slide.link || slide.buttonLink || '/shop'}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  type="button"
                  onClick={() => handleToggleActive(slide)}
                  className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    slide.isActive
                      ? 'border-light-border dark:border-[#34322D] bg-light-elevated dark:bg-[#22211E] text-charcoal-700 dark:text-[#B8B3A8] hover:text-charcoal-900 dark:hover:text-[#F4F1E9]'
                      : 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                  }`}
                  title={slide.isActive ? 'Hide from store' : 'Show on store'}
                >
                  {slide.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span className="hidden sm:inline">{slide.isActive ? 'Disable' : 'Enable'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenEditModal(slide)}
                  className="p-2 bg-light-elevated dark:bg-[#22211E] hover:bg-light-hover dark:hover:bg-[#2A2925] text-charcoal-900 dark:text-[#F4F1E9] border border-light-border dark:border-[#34322D] hover:border-[#B89555] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-[#B89555] dark:text-[#C9A96A]" />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteSlideModal({ isOpen: true, slideId: slide.id, title: slide.title || '' })}
                  className="p-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#191917] rounded-2xl shadow-elevation w-full max-w-xl overflow-hidden border border-light-border dark:border-[#34322D] my-8">
            <div className="p-4 sm:p-5 border-b border-light-border dark:border-[#34322D] flex items-center justify-between bg-light-elevated dark:bg-[#22211E]">
              <div>
                <h3 className="font-bold text-base text-charcoal-900 dark:text-[#F4F1E9]">
                  {editingSlide ? `Edit ${activeTab.toUpperCase()} Slide` : `Add New ${activeTab.toUpperCase()} Slide`}
                </h3>
                <p className="text-xs text-charcoal-500 dark:text-[#8E8A80]">
                  {activeTab === 'desktop' ? 'Landscape banner: 1920x800 px recommended' : 'Portrait banner: 1080x1350 px recommended'}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-charcoal-400 dark:text-[#8E8A80] hover:text-charcoal-900 dark:hover:text-[#F4F1E9] rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {/* Image Upload Area */}
              <div className="space-y-2">
                <label className="block font-bold text-charcoal-900 dark:text-[#F4F1E9]">
                  Banner Image <span className="text-rose-500">*</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <div
                    className={`relative rounded-xl overflow-hidden border border-light-border dark:border-[#34322D] bg-light-elevated dark:bg-[#22211E] flex items-center justify-center p-1 ${
                      activeTab === 'desktop' ? 'w-36 h-20' : 'w-20 h-24'
                    }`}
                  >
                    {image ? (
                      <Image src={image} alt="Preview" fill className="object-contain" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-charcoal-400 dark:text-[#8E8A80]" />
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <label className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-light-elevated dark:bg-[#22211E] hover:bg-light-hover dark:hover:bg-[#2A2925] text-charcoal-900 dark:text-[#F4F1E9] border border-light-border dark:border-[#34322D] text-xs font-semibold rounded-xl cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5 text-[#B89555] dark:text-[#C9A96A]" />
                      <span>{isUploading ? 'Uploading Image to Supabase...' : 'Choose File from Computer'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[10px] text-charcoal-500 dark:text-[#8E8A80]">Or enter image URL below:</p>
                    <input
                      type="text"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="/slider 1.png or https://..."
                      className="w-full px-3 py-1.5 bg-light-elevated dark:bg-[#22211E] border border-light-border dark:border-[#34322D] text-charcoal-900 dark:text-[#F4F1E9] rounded-lg font-mono text-[11px] focus:border-[#B89555] dark:focus:border-[#C9A96A] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Title & Link */}
              <div>
                <label className="block font-semibold text-charcoal-700 dark:text-[#B8B3A8] mb-1">Slide Label / Campaign Title</label>
                <input
                  type="text"
                  placeholder="e.g. Pure Combed Cotton Vest Campaign"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-light-elevated dark:bg-[#22211E] border border-light-border dark:border-[#34322D] text-charcoal-900 dark:text-[#F4F1E9] rounded-xl focus:border-[#B89555] dark:focus:border-[#C9A96A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal-700 dark:text-[#B8B3A8] mb-1">Click Link / Destination</label>
                <input
                  type="text"
                  placeholder="/shop or /category/men"
                  value={buttonLink}
                  onChange={(e) => setButtonLink(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-light-elevated dark:bg-[#22211E] border border-light-border dark:border-[#34322D] text-charcoal-900 dark:text-[#F4F1E9] rounded-xl focus:border-[#B89555] dark:focus:border-[#C9A96A] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-charcoal-700 dark:text-[#B8B3A8] mb-1">Display Order</label>
                  <input
                    type="number"
                    min={1}
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-light-elevated dark:bg-[#22211E] border border-light-border dark:border-[#34322D] text-charcoal-900 dark:text-[#F4F1E9] rounded-xl focus:border-[#B89555] dark:focus:border-[#C9A96A] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="slideActiveToggle"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#B89555]"
                  />
                  <label htmlFor="slideActiveToggle" className="font-semibold text-charcoal-900 dark:text-[#F4F1E9] cursor-pointer">
                    Active on Store
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-light-border dark:border-[#34322D] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2.5 px-4 bg-light-elevated dark:bg-[#22211E] text-charcoal-600 dark:text-[#8E8A80] hover:bg-light-hover dark:hover:bg-[#2A2925] hover:text-charcoal-900 dark:hover:text-[#F4F1E9] rounded-xl font-semibold border border-light-border dark:border-[#34322D]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="py-2.5 px-5 bg-champagne-500 hover:bg-champagne-400 text-charcoal-950 font-bold rounded-xl shadow-xs"
                >
                  {editingSlide ? 'Save Changes' : 'Create Slide'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
