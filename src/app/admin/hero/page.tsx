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

export default function AdminHeroPage() {
  const { heroSlides, saveHeroSlide, deleteHeroSlide, uploadMediaFile } = useStore();
  const [activeTab, setActiveTab] = useState<'desktop' | 'mobile'>('desktop');
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
      const url = await uploadMediaFile(file, activeTab === 'desktop' ? 'desktop-hero' : 'mobile-hero');
      setImage(url);
    } catch (err) {
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      alert(`Please upload or specify a ${activeTab} banner image.`);
      return;
    }

    const slideToSave: HeroSlide = {
      id: editingSlide ? editingSlide.id : `hero-${activeTab}-${Date.now()}`,
      title: title.trim() || `${activeTab.toUpperCase()} Hero Slide ${displayOrder}`,
      desktopImage: activeTab === 'desktop' ? image : image,
      mobileImage: activeTab === 'mobile' ? image : undefined,
      deviceType: activeTab,
      link: buttonLink.trim() || '/shop',
      buttonLink: buttonLink.trim() || '/shop',
      displayOrder: Number(displayOrder) || 1,
      isActive,
    };

    await saveHeroSlide(slideToSave);
    setIsModalOpen(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this banner slide?')) {
      await deleteHeroSlide(id);
    }
  };

  const handleToggleActive = async (slide: HeroSlide) => {
    await saveHeroSlide({
      ...slide,
      isActive: !slide.isActive,
    });
  };

  return (
    <div className="space-y-6 max-w-6xl text-gray-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dark-surface p-6 rounded-2xl border border-dark-border shadow-card">
        <div>
          <h1 className="text-xl font-extrabold text-gray-100">
            Hero Banners &amp; Slider Architecture
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Completely separate systems for Desktop (1920&times;800) and Mobile (1080&times;1350) banners.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 text-black text-xs font-bold h-10 px-4 rounded-xl shadow-glow-gold transition-all active:scale-[0.99] self-start sm:self-auto flex-shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add {activeTab === 'desktop' ? 'Desktop' : 'Mobile'} Slide</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-dark-border pb-1">
        <button
          onClick={() => setActiveTab('desktop')}
          className={`py-3 px-5 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${
            activeTab === 'desktop'
              ? 'bg-gold-500 text-black shadow-glow-gold'
              : 'text-gray-400 hover:text-gray-100 hover:bg-dark-surface'
          }`}
        >
          <Monitor className="w-4 h-4" />
          <span>DESKTOP HERO SLIDES ({heroSlides.filter((s) => (s.deviceType || 'desktop') === 'desktop').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('mobile')}
          className={`py-3 px-5 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${
            activeTab === 'mobile'
              ? 'bg-gold-500 text-black shadow-glow-gold'
              : 'text-gray-400 hover:text-gray-100 hover:bg-dark-surface'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>MOBILE HERO SLIDES ({heroSlides.filter((s) => s.deviceType === 'mobile').length})</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Hero Banner slide saved successfully!</span>
        </div>
      )}

      {/* Slides List */}
      <div className="space-y-4">
        {filteredSlides.length === 0 ? (
          <div className="bg-dark-surface p-12 text-center rounded-2xl border border-dark-border space-y-3 shadow-card">
            <ImageIcon className="w-10 h-10 text-gray-500 mx-auto" />
            <p className="text-sm font-bold text-gray-300">No {activeTab} Slides Configured</p>
            <p className="text-xs text-gray-400">Click &quot;Add {activeTab === 'desktop' ? 'Desktop' : 'Mobile'} Slide&quot; above to upload your first banner.</p>
          </div>
        ) : (
          filteredSlides.map((slide, index) => (
            <div
              key={slide.id || index}
              className={`bg-dark-surface rounded-2xl border transition-all p-4 sm:p-5 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between ${
                slide.isActive ? 'border-dark-border shadow-card' : 'border-dark-border bg-dark-bg/60 opacity-60'
              }`}
            >
              {/* Preview Thumbnail */}
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div
                  className={`relative rounded-xl overflow-hidden flex-shrink-0 border border-dark-border bg-black ${
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
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-dark-card border border-dark-border text-gray-300">
                      Order #{slide.displayOrder}
                    </span>
                    {slide.isActive ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                        Live on {activeTab}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-dark-card text-gray-500">
                        Hidden
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-gray-100 line-clamp-1">
                    {slide.title || `Campaign Slide #${index + 1}`}
                  </h3>
                  <p className="text-xs text-gray-400 font-mono truncate">
                    Target Link: {slide.link || slide.buttonLink || '/shop'}
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
                      ? 'border-dark-border text-gray-300 hover:bg-dark-hover'
                      : 'border-emerald-800/60 bg-emerald-950/40 text-emerald-400 hover:bg-emerald-950/60'
                  }`}
                  title={slide.isActive ? 'Hide from store' : 'Show on store'}
                >
                  {slide.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span className="hidden sm:inline">{slide.isActive ? 'Disable' : 'Enable'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenEditModal(slide)}
                  className="p-2 bg-dark-card hover:bg-dark-hover text-gray-200 border border-dark-border rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(slide.id)}
                  className="p-2 bg-rose-950/40 hover:bg-rose-950/60 text-rose-400 border border-rose-800/60 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-dark-surface rounded-2xl shadow-elevation w-full max-w-xl overflow-hidden border border-dark-border my-8">
            <div className="p-4 sm:p-5 border-b border-dark-border flex items-center justify-between bg-dark-card">
              <div>
                <h3 className="font-bold text-base text-gray-100">
                  {editingSlide ? `Edit ${activeTab.toUpperCase()} Slide` : `Add New ${activeTab.toUpperCase()} Slide`}
                </h3>
                <p className="text-xs text-gray-400">
                  {activeTab === 'desktop' ? 'Optimal dimensions: 1920x800 px landscape' : 'Optimal dimensions: 1080x1350 px portrait'}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {/* Image Upload Area */}
              <div className="space-y-2">
                <label className="block font-bold text-gray-200">
                  Banner Image <span className="text-rose-400">*</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <div
                    className={`relative rounded-xl overflow-hidden border border-dark-border bg-black flex items-center justify-center ${
                      activeTab === 'desktop' ? 'w-36 h-20' : 'w-20 h-24'
                    }`}
                  >
                    {image ? (
                      <Image src={image} alt="Preview" fill className="object-contain" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-gray-500" />
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <label className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-dark-card hover:bg-dark-hover text-gray-200 border border-dark-border text-xs font-semibold rounded-xl cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploading ? 'Uploading Image to Supabase...' : 'Choose File from Computer'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[10px] text-gray-400">Or enter image URL below:</p>
                    <input
                      type="text"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="/slider 1.png or https://..."
                      className="w-full px-3 py-1.5 bg-dark-card border border-dark-border text-gray-100 rounded-lg font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* Title & Link */}
              <div>
                <label className="block font-semibold text-gray-300 mb-1">Slide Label / Title</label>
                <input
                  type="text"
                  placeholder="e.g. Pure Combed Cotton Vest Campaign"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-dark-card border border-dark-border text-gray-100 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-300 mb-1">Click Link / Destination</label>
                <input
                  type="text"
                  placeholder="/shop or /product/mens-vest-high-quality"
                  value={buttonLink}
                  onChange={(e) => setButtonLink(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-dark-card border border-dark-border text-gray-100 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-300 mb-1">Display Order</label>
                  <input
                    type="number"
                    min={1}
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-dark-card border border-dark-border text-gray-100 rounded-xl"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="slideActiveToggle"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded accent-gold-500"
                  />
                  <label htmlFor="slideActiveToggle" className="font-bold text-gray-200 cursor-pointer">
                    Active on Store
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-dark-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2.5 px-4 bg-dark-card text-gray-300 hover:bg-dark-hover rounded-xl font-semibold border border-dark-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="py-2.5 px-5 bg-gold-500 hover:bg-gold-400 text-black font-bold rounded-xl shadow-glow-gold"
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
