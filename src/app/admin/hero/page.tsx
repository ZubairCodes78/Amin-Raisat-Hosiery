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
  ArrowUp,
  ArrowDown,
  Sparkles,
  Layers,
  Check,
  X,
  ExternalLink,
  Image as ImageIcon,
} from 'lucide-react';

export default function AdminHeroPage() {
  const { heroSlides, saveHeroSlide, deleteHeroSlide, uploadMediaFile } = useStore();
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadingDesktop, setIsUploadingDesktop] = useState(false);
  const [isUploadingMobile, setIsUploadingMobile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [badge, setBadge] = useState('');
  const [desktopImage, setDesktopImage] = useState('/images/slider 1.png');
  const [mobileImage, setMobileImage] = useState('');
  const [buttonText, setButtonText] = useState('Explore Collection');
  const [buttonLink, setButtonLink] = useState('/shop');
  const [textColor, setTextColor] = useState<'light' | 'dark'>('light');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState<boolean>(true);

  const handleOpenAddModal = () => {
    setEditingSlide(null);
    setTitle('');
    setSubtitle('');
    setBadge('NEW COLLECTION');
    setDesktopImage('/images/slider 1.png');
    setMobileImage('');
    setButtonText('Explore Collection');
    setButtonLink('/shop');
    setTextColor('light');
    setDisplayOrder(heroSlides.length + 1);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setTitle(slide.title || '');
    setSubtitle(slide.subtitle || '');
    setBadge(slide.badge || '');
    setDesktopImage(slide.desktopImage || '/images/slider 1.png');
    setMobileImage(slide.mobileImage || '');
    setButtonText(slide.buttonText || '');
    setButtonLink(slide.buttonLink || '/shop');
    setTextColor(slide.textColor || 'light');
    setDisplayOrder(slide.displayOrder || 1);
    setIsActive(slide.isActive !== false);
    setIsModalOpen(true);
  };

  const handleDesktopFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingDesktop(true);
    try {
      const url = await uploadMediaFile(file, 'hero-banners');
      setDesktopImage(url);
    } catch (err) {
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploadingDesktop(false);
    }
  };

  const handleMobileFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingMobile(true);
    try {
      const url = await uploadMediaFile(file, 'hero-banners');
      setMobileImage(url);
    } catch (err) {
      alert('Failed to upload mobile image. Please try again.');
    } finally {
      setIsUploadingMobile(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desktopImage) {
      alert('Please upload or select a desktop banner image.');
      return;
    }

    const slideToSave: HeroSlide = {
      id: editingSlide ? editingSlide.id : `hero-slide-${Date.now()}`,
      title: title.trim() || undefined,
      subtitle: subtitle.trim() || undefined,
      badge: badge.trim() || undefined,
      desktopImage,
      mobileImage: mobileImage.trim() || undefined,
      buttonText: buttonText.trim() || undefined,
      buttonLink: buttonLink.trim() || undefined,
      textColor,
      displayOrder: Number(displayOrder) || 1,
      isActive,
    };

    await saveHeroSlide(slideToSave);
    setIsModalOpen(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this hero banner slide?')) {
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
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-950">Homepage Hero Banners &amp; Slider</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage full-width promotional campaign banners shown on your store homepage. Upload separate desktop and mobile images.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 bg-gray-950 hover:bg-black text-white text-xs font-semibold h-10 px-4 rounded-lg shadow-xs transition-all active:scale-[0.99] self-start sm:self-auto flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Hero Slide</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Hero Banner slide saved successfully!</span>
        </div>
      )}

      {/* Hero Slides List */}
      <div className="space-y-4">
        {heroSlides.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-gray-200 space-y-3">
            <ImageIcon className="w-10 h-10 text-gray-400 mx-auto" />
            <p className="text-sm font-semibold text-gray-700">No Hero Slides Yet</p>
            <p className="text-xs text-gray-500">Click &quot;Add New Hero Slide&quot; above to create your first promotional banner.</p>
          </div>
        ) : (
          heroSlides.map((slide, index) => (
            <div
              key={slide.id || index}
              className={`bg-white rounded-xl border transition-all p-4 sm:p-5 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between ${
                slide.isActive ? 'border-gray-200 shadow-sm' : 'border-gray-200 bg-gray-50/70 opacity-75'
              }`}
            >
              {/* Preview Thumbnail */}
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative w-28 h-18 sm:w-36 sm:h-20 bg-gray-950 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 shadow-xs">
                  <Image
                    src={slide.desktopImage || '/images/hero/hero-banner-1.svg'}
                    alt={slide.title || 'Hero preview'}
                    fill
                    className="object-cover"
                  />
                  {slide.mobileImage && (
                    <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                      +Mobile
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-800">
                      Order #{slide.displayOrder}
                    </span>
                    {slide.isActive ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        Active on Homepage
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-200 text-gray-600">
                        Hidden (Disabled)
                      </span>
                    )}
                    {slide.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                        {slide.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-gray-950 line-clamp-1">
                    {slide.title || '(Image Only Banner)'}
                  </h3>
                  {slide.subtitle && (
                    <p className="text-xs text-gray-500 line-clamp-1">{slide.subtitle}</p>
                  )}
                  {slide.buttonText && (
                    <p className="text-[11px] text-gray-600 font-medium">
                      Button: &quot;{slide.buttonText}&quot; &rarr; {slide.buttonLink || '/shop'}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  type="button"
                  onClick={() => handleToggleActive(slide)}
                  className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    slide.isActive
                      ? 'border-gray-300 text-gray-700 hover:bg-gray-100'
                      : 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                  title={slide.isActive ? 'Hide from homepage' : 'Show on homepage'}
                >
                  {slide.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span className="hidden sm:inline">{slide.isActive ? 'Disable' : 'Enable'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenEditModal(slide)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(slide.id)}
                  className="p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 my-8">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div>
                <h3 className="font-bold text-base text-gray-950">
                  {editingSlide ? 'Edit Hero Banner Slide' : 'Add New Hero Banner Slide'}
                </h3>
                <p className="text-xs text-gray-500">
                  Fill in slide imagery and optional text headlines.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* 1. Desktop Image Upload (Required) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-900">
                  1. Desktop Banner Image <span className="text-red-500">*</span>
                </label>
                <p className="text-[11px] text-gray-500">
                  Recommended size: 1920 &times; 700 px (or wide landscape format).
                </p>
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <div className="relative w-36 h-20 bg-gray-100 rounded-lg overflow-hidden border border-gray-300 flex-shrink-0 flex items-center justify-center">
                    {desktopImage ? (
                      <Image src={desktopImage} alt="Desktop Preview" fill className="object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <label className="inline-flex items-center gap-2 px-3 py-2 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingDesktop ? 'Uploading Image...' : 'Choose Image File from Computer'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleDesktopFileChange}
                        disabled={isUploadingDesktop}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[10px] text-gray-500">Accepts PNG, JPG, WEBP, SVG.</p>
                  </div>
                </div>
              </div>

              {/* 2. Mobile Image Upload (Optional) */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <label className="block text-xs font-bold text-gray-900">
                  2. Mobile Banner Image (Optional)
                </label>
                <p className="text-[11px] text-gray-500">
                  Optimized vertical/square crop for phone screens (e.g. 800 &times; 800 px). If omitted, desktop banner will scale naturally.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden border border-gray-300 flex-shrink-0 flex items-center justify-center">
                    {mobileImage ? (
                      <Image src={mobileImage} alt="Mobile Preview" fill className="object-cover" />
                    ) : (
                      <span className="text-[10px] text-gray-400 font-medium text-center px-1">Same as Desktop</span>
                    )}
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <label className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg cursor-pointer transition-colors border border-gray-300">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingMobile ? 'Uploading Mobile...' : 'Choose Mobile Image File'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleMobileFileChange}
                        disabled={isUploadingMobile}
                        className="hidden"
                      />
                    </label>
                    {mobileImage && (
                      <button
                        type="button"
                        onClick={() => setMobileImage('')}
                        className="block text-[11px] text-red-600 hover:underline"
                      >
                        Remove separate mobile image
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. Optional Overlay Text */}
              <div className="pt-2 border-t border-gray-100 space-y-3">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  3. Promotional Text Overlay (Optional)
                </h4>
                <p className="text-[11px] text-gray-500">
                  Leave blank if your banner image already contains all text graphics.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Badge Tagline</label>
                    <input
                      type="text"
                      placeholder="e.g. NEW ARRIVALS, 100% COMBED COTTON"
                      value={badge}
                      onChange={(e) => setBadge(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Main Heading</label>
                    <input
                      type="text"
                      placeholder="e.g. Pure Combed Cotton Essentials"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Supporting Text / Benefit Highlights</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Experience unmatched breathability with anti-sag seams across Pakistan."
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Button Text</label>
                    <input
                      type="text"
                      placeholder="e.g. Explore Collection, Shop Now"
                      value={buttonText}
                      onChange={(e) => setButtonText(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Button Link</label>
                    <input
                      type="text"
                      placeholder="e.g. /shop, /category/men"
                      value={buttonLink}
                      onChange={(e) => setButtonLink(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Text Color Mode</label>
                    <select
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value as 'light' | 'dark')}
                      className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs"
                    >
                      <option value="light">Light (White text on dark banner)</option>
                      <option value="dark">Dark (Black text on light banner)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Display Order</label>
                    <input
                      type="number"
                      min={1}
                      value={displayOrder}
                      onChange={(e) => setDisplayOrder(Number(e.target.value))}
                      className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="slideActiveToggle"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-gray-900"
                    />
                    <label htmlFor="slideActiveToggle" className="text-xs font-bold text-gray-800 cursor-pointer">
                      Active (Show on Site)
                    </label>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingDesktop || isUploadingMobile}
                  className="btn-primary"
                >
                  {editingSlide ? 'Save Changes' : 'Create Hero Slide'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
