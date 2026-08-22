'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Category, Subcategory } from '@/types';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Check,
  FolderPlus,
  X,
  Save,
} from 'lucide-react';

export default function AdminCategoriesPage() {
  const {
    categories,
    subcategories,
    saveCategory,
    deleteCategory,
    saveSubcategory,
    deleteSubcategory,
  } = useStore();

  const [selectedCatId, setSelectedCatId] = useState<string>(categories[0]?.id || '');
  const [saveToast, setSaveToast] = useState('');

  React.useEffect(() => {
    if ((!selectedCatId || selectedCatId === '') && categories.length > 0) {
      setSelectedCatId(categories[0].id);
    }
  }, [categories, selectedCatId]);

  // Modal States
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);

  // Edit / Form states
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Partial<Subcategory> | null>(null);

  const selectedCategory = categories.find((c) => c.id === selectedCatId) || categories[0];
  const activeSubcategories = subcategories.filter((s) => s.categoryId === selectedCategory?.id);

  const showToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(''), 3000);
  };

  // Open Add Category Modal
  const handleOpenAddCategory = () => {
    setEditingCategory({
      id: `cat-${Date.now()}`,
      name: '',
      slug: '',
      description: '',
      isActive: true,
      displayOrder: categories.length + 1,
    });
    setIsCategoryModalOpen(true);
  };

  // Open Add Subcategory Modal
  const handleOpenAddSubcategory = () => {
    setEditingSubcategory({
      id: `sub-${Date.now()}`,
      categoryId: selectedCategory?.id || categories[0]?.id,
      name: '',
      slug: '',
      description: '',
      isActive: true,
      displayOrder: activeSubcategories.length + 1,
    });
    setIsSubcategoryModalOpen(true);
  };

  // Save Category Form
  const handleSaveCategoryForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name || !editingCategory.slug) return;

    await saveCategory(editingCategory as Category);
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
    showToast('Category saved successfully!');
  };

  // Save Subcategory Form
  const handleSaveSubcategoryForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubcategory?.name || !editingSubcategory.slug || !editingSubcategory.categoryId) return;

    await saveSubcategory(editingSubcategory as Subcategory);
    setIsSubcategoryModalOpen(false);
    setEditingSubcategory(null);
    showToast('Subcategory saved successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-950">
            Categories &amp; Subcategories
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Manage your store hierarchy (Men, Women, Kids and subcategories like Vests, Boxers, Briefs).
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleOpenAddCategory}
            className="inline-flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 text-xs font-semibold h-10 px-4 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Main Category</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddSubcategory}
            className="inline-flex items-center justify-center gap-2 bg-gray-950 hover:bg-black text-white text-xs font-semibold h-10 px-4 rounded-lg shadow-sm transition-colors"
          >
            <FolderPlus className="w-4 h-4" />
            <span>+ Add Subcategory</span>
          </button>
        </div>
      </div>

      {saveToast && (
        <div className="p-3.5 bg-gray-900 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Main Categories List */}
        <div className="lg:col-span-5 bg-white rounded-xl p-5 border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-xs font-bold text-gray-950 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Main Categories ({categories.length})
            </h2>
          </div>

          <div className="space-y-2">
            {categories.map((cat) => {
              const isSelected = selectedCategory?.id === cat.id;
              const catSubCount = subcategories.filter((s) => s.categoryId === cat.id).length;

              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCatId(cat.id)}
                  className={`cursor-pointer p-3.5 rounded-lg border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-gray-950 bg-gray-50 shadow-2xs'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-gray-950">{cat.name}</h3>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          cat.isActive
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {cat.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 font-normal">
                      Slug: <span className="font-mono">{cat.slug}</span> • {catSubCount} subcategories
                    </p>
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategory(cat);
                        setIsCategoryModalOpen(true);
                      }}
                      className="p-1.5 text-gray-600 hover:text-gray-950 hover:bg-gray-100 rounded transition-colors"
                      title="Edit Category"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {categories.length > 1 && (
                      <button
                        type="button"
                        onClick={async () => {
                          if (confirm(`Delete category "${cat.name}"?`)) {
                            await deleteCategory(cat.id);
                            showToast('Category deleted');
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Subcategories under Selected Category */}
        <div className="lg:col-span-7 bg-white rounded-xl p-5 sm:p-6 border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 flex-wrap gap-2">
            <div>
              <h2 className="text-sm font-bold text-gray-950">
                Subcategories under &quot;{selectedCategory?.name}&quot;
              </h2>
              <p className="text-xs text-gray-500">
                Products can be assigned to these subcategories (e.g. Vests, Boxers, Briefs)
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddSubcategory}
              className="text-xs font-semibold bg-gray-950 hover:bg-black text-white h-8 px-3 rounded-lg shadow-2xs transition-colors"
            >
              + Add Subcategory
            </button>
          </div>

          {activeSubcategories.length === 0 ? (
            <div className="text-center py-12 space-y-2 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs font-bold text-gray-800">No subcategories found for {selectedCategory?.name}.</p>
              <p className="text-[11px] text-gray-500">Click &quot;+ Add Subcategory&quot; to create one.</p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 overflow-hidden">
              {activeSubcategories.map((sub) => (
                <div key={sub.id} className="p-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs sm:text-sm text-gray-950">{sub.name}</h4>
                      <span className="text-[10px] text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                        /{sub.slug}
                      </span>
                      {sub.productCount && sub.productCount > 0 ? (
                        <span className="text-[9px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded">
                          {sub.productCount} Product
                        </span>
                      ) : null}
                    </div>
                    {sub.description && (
                      <p className="text-xs text-gray-500 mt-0.5 font-normal">{sub.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSubcategory(sub);
                        setIsSubcategoryModalOpen(true);
                      }}
                      className="p-1.5 text-gray-600 hover:text-gray-950 hover:bg-gray-100 rounded transition-colors"
                      title="Edit Subcategory"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (confirm(`Delete subcategory "${sub.name}"?`)) {
                          await deleteSubcategory(sub.id);
                          showToast('Subcategory removed');
                        }
                      }}
                      className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      title="Delete Subcategory"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: Add / Edit Main Category */}
      {isCategoryModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-gray-950">
                {editingCategory.name ? `Edit Category` : `Add Main Category`}
              </h3>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-gray-400 hover:text-gray-950 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategoryForm} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Men, Women, Kids, Accessories"
                  value={editingCategory.name || ''}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                    setEditingCategory({ ...editingCategory, name, slug });
                  }}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">URL Slug *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. men, women, kids"
                  value={editingCategory.slug || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Short description of this category..."
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="cat-active"
                  checked={editingCategory.isActive ?? true}
                  onChange={(e) => setEditingCategory({ ...editingCategory, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-gray-950 focus:ring-black"
                />
                <label htmlFor="cat-active" className="font-semibold text-gray-800 cursor-pointer">
                  Visible &amp; Active in Navigation
                </label>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="h-9 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 bg-gray-950 hover:bg-black text-white font-semibold rounded-lg shadow-sm"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add / Edit Subcategory */}
      {isSubcategoryModalOpen && editingSubcategory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-gray-950">
                {editingSubcategory.name ? `Edit Subcategory` : `Add Subcategory`}
              </h3>
              <button
                type="button"
                onClick={() => setIsSubcategoryModalOpen(false)}
                className="text-gray-400 hover:text-gray-950 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubcategoryForm} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Parent Category *</label>
                <select
                  value={editingSubcategory.categoryId || selectedCategory?.id}
                  onChange={(e) => setEditingSubcategory({ ...editingSubcategory, categoryId: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg font-semibold"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Subcategory Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vests, Boxers, Briefs, Camisoles"
                  value={editingSubcategory.name || ''}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                    setEditingSubcategory({ ...editingSubcategory, name, slug });
                  }}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">URL Slug *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. vests, boxers, briefs"
                  value={editingSubcategory.slug || ''}
                  onChange={(e) => setEditingSubcategory({ ...editingSubcategory, slug: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Short summary of this subcategory..."
                  value={editingSubcategory.description || ''}
                  onChange={(e) => setEditingSubcategory({ ...editingSubcategory, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSubcategoryModalOpen(false)}
                  className="h-9 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 bg-gray-950 hover:bg-black text-white font-semibold rounded-lg shadow-sm"
                >
                  Save Subcategory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
