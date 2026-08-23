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
  CheckCircle,
} from 'lucide-react';
import { ConfirmModal } from '@/components/admin/ConfirmModal';

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

  // Delete Confirm Modal State
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    type: 'category' | 'subcategory';
    id: string;
    name: string;
  }>({
    isOpen: false,
    type: 'category',
    id: '',
    name: '',
  });

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

    try {
      await saveCategory(editingCategory as Category);
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
      showToast('Category saved successfully!');
    } catch (err) {
      showToast('Error saving category.');
    }
  };

  // Save Subcategory Form
  const handleSaveSubcategoryForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubcategory?.name || !editingSubcategory.slug || !editingSubcategory.categoryId) return;

    try {
      await saveSubcategory(editingSubcategory as Subcategory);
      setIsSubcategoryModalOpen(false);
      setEditingSubcategory(null);
      showToast('Subcategory saved successfully!');
    } catch (err) {
      showToast('Error saving subcategory.');
    }
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = async () => {
    if (!deleteModalState.id) return;
    try {
      if (deleteModalState.type === 'category') {
        await deleteCategory(deleteModalState.id);
        showToast(`Category "${deleteModalState.name}" removed.`);
      } else {
        await deleteSubcategory(deleteModalState.id);
        showToast(`Subcategory "${deleteModalState.name}" removed.`);
      }
    } catch (err) {
      showToast('Error deleting item.');
    } finally {
      setDeleteModalState({ isOpen: false, type: 'category', id: '', name: '' });
    }
  };

  return (
    <div className="space-y-6 text-[#F1F0EC] max-w-7xl">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-[#17191D] text-[#F1F0EC] border border-[#3FB982]/40 rounded-xl shadow-elevation flex items-center gap-2.5 text-xs font-semibold animate-in fade-in">
          <Check className="w-4 h-4 text-[#3FB982]" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalState.isOpen}
        title={`Delete ${deleteModalState.type === 'category' ? 'Category' : 'Subcategory'}`}
        message={`Are you sure you want to permanently delete "${deleteModalState.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalState({ isOpen: false, type: 'category', id: '', name: '' })}
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#17191D] p-6 rounded-2xl border border-[#30343A] shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#F1F0EC]">
              Categories &amp; Taxonomy
            </h1>
            <span className="text-xs font-bold bg-[#1D2025] text-[#C9A96A] border border-[#30343A] px-2.5 py-0.5 rounded-lg">
              {categories.length} Categories
            </span>
          </div>
          <p className="text-xs text-[#85888E] mt-1">
            Organize catalog hierarchy (Men, Women, Kids and garment subcategories like Vests, Boxers, Briefs).
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleOpenAddCategory}
            className="inline-flex items-center justify-center gap-2 bg-[#202329] border border-[#30343A] hover:bg-[#272A2F] text-[#F1F0EC] text-xs font-bold h-10 px-4 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 text-[#C9A96A]" />
            <span>+ Add Main Category</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddSubcategory}
            className="inline-flex items-center justify-center gap-2 bg-[#C9A96A] hover:bg-[#D8BD88] text-[#101114] text-xs font-bold h-10 px-4 rounded-xl shadow-xs transition-colors"
          >
            <FolderPlus className="w-4 h-4" />
            <span>+ Add Subcategory</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Main Categories List */}
        <div className="lg:col-span-5 bg-[#17191D] rounded-2xl p-5 border border-[#30343A] shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-[#30343A] pb-3">
            <h2 className="text-xs font-bold text-[#C9A96A] uppercase tracking-wider flex items-center gap-2">
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
                  className={`cursor-pointer p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-[#C9A96A] bg-[#1D2025] shadow-xs'
                      : 'border-[#30343A] bg-[#17191D] hover:bg-[#1D2025]'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-[#F1F0EC]">{cat.name}</h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          cat.isActive
                            ? 'bg-[#3FB982]/15 text-[#3FB982] border border-[#3FB982]/30'
                            : 'bg-[#D96B6B]/15 text-[#D96B6B] border border-[#D96B6B]/30'
                        }`}
                      >
                        {cat.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </div>
                    <p className="text-xs text-[#85888E] mt-0.5 font-normal">
                      Slug: <span className="font-mono text-[#C9A96A]">/{cat.slug}</span> &bull; {catSubCount} subcategories
                    </p>
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategory(cat);
                        setIsCategoryModalOpen(true);
                      }}
                      className="p-1.5 text-[#85888E] hover:text-[#C9A96A] hover:bg-[#202329] rounded-lg transition-colors"
                      title="Edit Category"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {categories.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteModalState({
                            isOpen: true,
                            type: 'category',
                            id: cat.id,
                            name: cat.name,
                          });
                        }}
                        className="p-1.5 text-[#D96B6B] hover:bg-[#D96B6B]/10 rounded-lg transition-colors"
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
        <div className="lg:col-span-7 bg-[#17191D] rounded-2xl p-5 sm:p-6 border border-[#30343A] shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-[#30343A] pb-3 flex-wrap gap-2">
            <div>
              <h2 className="text-sm font-bold text-[#F1F0EC]">
                Subcategories under &quot;{selectedCategory?.name}&quot;
              </h2>
              <p className="text-xs text-[#85888E]">
                Products can be assigned to these subcategories (e.g. Vests, Boxers, Briefs)
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddSubcategory}
              className="text-xs font-bold bg-[#C9A96A] hover:bg-[#D8BD88] text-[#101114] h-8 px-3 rounded-xl shadow-xs transition-colors"
            >
              + Add Subcategory
            </button>
          </div>

          {activeSubcategories.length === 0 ? (
            <div className="text-center py-12 space-y-2 bg-[#1D2025] rounded-xl border border-[#30343A]">
              <p className="text-xs font-bold text-[#F1F0EC]">No subcategories found for {selectedCategory?.name}.</p>
              <p className="text-[11px] text-[#85888E]">Click &quot;+ Add Subcategory&quot; to create one.</p>
            </div>
          ) : (
            <div className="border border-[#30343A] rounded-xl divide-y divide-[#30343A] overflow-hidden">
              {activeSubcategories.map((sub) => (
                <div key={sub.id} className="p-3.5 flex items-center justify-between hover:bg-[#1D2025] transition-colors bg-[#17191D]">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs sm:text-sm text-[#F1F0EC]">{sub.name}</h4>
                      <span className="text-[10px] text-[#85888E] font-mono bg-[#1D2025] px-1.5 py-0.5 rounded border border-[#30343A]">
                        /{sub.slug}
                      </span>
                      {sub.productCount && sub.productCount > 0 ? (
                        <span className="text-[9px] font-bold bg-[#3FB982]/15 text-[#3FB982] border border-[#3FB982]/30 px-1.5 py-0.5 rounded">
                          {sub.productCount} Garments
                        </span>
                      ) : null}
                    </div>
                    {sub.description && (
                      <p className="text-xs text-[#85888E] mt-0.5 font-normal">{sub.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSubcategory(sub);
                        setIsSubcategoryModalOpen(true);
                      }}
                      className="p-1.5 text-[#85888E] hover:text-[#C9A96A] hover:bg-[#202329] rounded-lg transition-colors"
                      title="Edit Subcategory"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteModalState({
                          isOpen: true,
                          type: 'subcategory',
                          id: sub.id,
                          name: sub.name,
                        });
                      }}
                      className="p-1.5 text-[#D96B6B] hover:bg-[#D96B6B]/10 rounded-lg transition-colors"
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
        <div className="fixed inset-0 z-50 bg-[#101114]/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#17191D] rounded-2xl p-6 max-w-md w-full shadow-elevation border border-[#30343A] space-y-4 text-[#F1F0EC]">
            <div className="flex items-center justify-between border-b border-[#30343A] pb-3">
              <h3 className="font-bold text-base text-[#F1F0EC]">
                {editingCategory.name ? `Edit Category` : `Add Main Category`}
              </h3>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-[#85888E] hover:text-[#F1F0EC] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategoryForm} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#D8D8D4] mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Men, Women, Kids"
                  value={editingCategory.name || ''}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                    setEditingCategory({ ...editingCategory, name, slug });
                  }}
                  className="w-full px-3 py-2 bg-[#1D2025] border border-[#343840] rounded-xl font-semibold text-[#F1F0EC] focus:border-[#C9A96A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#D8D8D4] mb-1">URL Slug *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. men, women, kids"
                  value={editingCategory.slug || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1D2025] border border-[#343840] rounded-xl font-mono text-[#C9A96A] focus:border-[#C9A96A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#D8D8D4] mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Short description of this category..."
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1D2025] border border-[#343840] rounded-xl text-[#F1F0EC] focus:border-[#C9A96A] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="cat-active"
                  checked={editingCategory.isActive ?? true}
                  onChange={(e) => setEditingCategory({ ...editingCategory, isActive: e.target.checked })}
                  className="rounded accent-[#C9A96A] w-4 h-4"
                />
                <label htmlFor="cat-active" className="font-semibold text-[#F1F0EC] cursor-pointer">
                  Visible &amp; Active in Navigation
                </label>
              </div>

              <div className="pt-3 border-t border-[#30343A] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="h-9 px-4 bg-[#202329] hover:bg-[#272A2F] text-[#B4B5BA] font-semibold rounded-xl border border-[#30343A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 bg-[#C9A96A] hover:bg-[#D8BD88] text-[#101114] font-bold rounded-xl shadow-xs"
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
        <div className="fixed inset-0 z-50 bg-[#101114]/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#17191D] rounded-2xl p-6 max-w-md w-full shadow-elevation border border-[#30343A] space-y-4 text-[#F1F0EC]">
            <div className="flex items-center justify-between border-b border-[#30343A] pb-3">
              <h3 className="font-bold text-base text-[#F1F0EC]">
                {editingSubcategory.name ? `Edit Subcategory` : `Add Subcategory`}
              </h3>
              <button
                type="button"
                onClick={() => setIsSubcategoryModalOpen(false)}
                className="text-[#85888E] hover:text-[#F1F0EC] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubcategoryForm} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#D8D8D4] mb-1">Parent Category *</label>
                <select
                  value={editingSubcategory.categoryId || selectedCategory?.id}
                  onChange={(e) => setEditingSubcategory({ ...editingSubcategory, categoryId: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1D2025] border border-[#343840] rounded-xl font-semibold text-[#F1F0EC] focus:border-[#C9A96A] focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#17191D] text-[#F1F0EC]">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#D8D8D4] mb-1">Subcategory Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vests, Boxers, Briefs"
                  value={editingSubcategory.name || ''}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                    setEditingSubcategory({ ...editingSubcategory, name, slug });
                  }}
                  className="w-full px-3 py-2 bg-[#1D2025] border border-[#343840] rounded-xl font-semibold text-[#F1F0EC] focus:border-[#C9A96A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#D8D8D4] mb-1">URL Slug *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. vests, boxers, briefs"
                  value={editingSubcategory.slug || ''}
                  onChange={(e) => setEditingSubcategory({ ...editingSubcategory, slug: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1D2025] border border-[#343840] rounded-xl font-mono text-[#C9A96A] focus:border-[#C9A96A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#D8D8D4] mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Short summary of this subcategory..."
                  value={editingSubcategory.description || ''}
                  onChange={(e) => setEditingSubcategory({ ...editingSubcategory, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1D2025] border border-[#343840] rounded-xl text-[#F1F0EC] focus:border-[#C9A96A] focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#30343A] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSubcategoryModalOpen(false)}
                  className="h-9 px-4 bg-[#202329] hover:bg-[#272A2F] text-[#B4B5BA] font-semibold rounded-xl border border-[#30343A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 bg-[#C9A96A] hover:bg-[#D8BD88] text-[#101114] font-bold rounded-xl shadow-xs"
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
