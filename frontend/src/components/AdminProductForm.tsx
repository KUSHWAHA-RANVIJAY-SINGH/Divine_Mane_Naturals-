'use client';

import React, { useState, useEffect } from 'react';
import { ProductInput, Product } from '../lib/api';

interface AdminProductFormProps {
  initialData?: Product | null;
  onSubmit: (data: ProductInput, imageFile: File | null) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

export default function AdminProductForm({
  initialData,
  onSubmit,
  onCancel,
  loading,
}: AdminProductFormProps) {
  const [formData, setFormData] = useState<ProductInput>({
    name: '',
    category: 'Cleanse',
    tagline: '',
    benefit: '',
    price: null,
    image: '',
  });

  const [priceInput, setPriceInput] = useState<string>('');
  
  // Drag & drop upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Clean up object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Hydrate form when initialData changes (edit mode)
  useEffect(() => {
    setSelectedFile(null);
    setPreviewUrl('');
    if (initialData) {
      setFormData({
        name: initialData.name,
        category: initialData.category,
        tagline: initialData.tagline || '',
        benefit: initialData.benefit,
        price: initialData.price,
        image: initialData.image,
        imagePublicId: initialData.imagePublicId,
      });
      setPriceInput(initialData.price !== null ? initialData.price.toString() : '');
    } else {
      setFormData({
        name: '',
        category: 'Cleanse',
        tagline: '',
        benefit: '',
        price: null,
        image: '',
      });
      setPriceInput('');
    }
    setUploadError('');
    setDragActive(false);
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPriceInput(value);

    // If blank set to null, else parse Float
    if (value.trim() === '') {
      setFormData((prev) => ({ ...prev, price: null }));
    } else {
      const parsed = parseFloat(value);
      setFormData((prev) => ({ ...prev, price: isNaN(parsed) ? null : parsed }));
    }
  };

  // Drag and Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSelectFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleSelectFile(e.target.files[0]);
    }
  };

  const handleSelectFile = (file: File) => {
    // Basic client validation
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, JPEG, WEBP, GIF).');
      return;
    }

    setUploadError('');
    setSelectedFile(file);

    // Create a local URL preview
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialData && !selectedFile) {
      setUploadError('Please upload a product image.');
      return;
    }
    onSubmit(formData, selectedFile);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-xl font-serif font-bold text-primary border-b border-primary/5 pb-3">
        {initialData ? 'Edit Product Details' : 'Add New Product'}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-dark/70 mb-2">
            Product Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Gentle Cleansing Shampoo"
            className="w-full px-4 py-2.5 rounded-xl border border-primary/10 bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200 text-dark text-sm"
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-xs font-bold uppercase tracking-wider text-dark/70 mb-2">
            Category Group
          </label>
          <select
            name="category"
            id="category"
            required
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border border-primary/10 bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200 text-dark text-sm cursor-pointer"
          >
            <option value="Cleanse">Cleanse</option>
            <option value="Condition & Repair">Condition & Repair</option>
            <option value="Moisturize">Moisturize</option>
            <option value="Growth & Finish">Growth & Finish</option>
          </select>
        </div>

        {/* Tagline */}
        <div>
          <label htmlFor="tagline" className="block text-xs font-bold uppercase tracking-wider text-dark/70 mb-2">
            Tagline / Badge (Optional)
          </label>
          <input
            type="text"
            name="tagline"
            id="tagline"
            value={formData.tagline}
            onChange={handleChange}
            placeholder="e.g. Sulphate-Free, With Moringa"
            className="w-full px-4 py-2.5 rounded-xl border border-primary/10 bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200 text-dark text-sm"
          />
        </div>

        {/* Price */}
        <div>
          <label htmlFor="price" className="block text-xs font-bold uppercase tracking-wider text-dark/70 mb-2">
            Price (ZK) - Leave blank for &quot;Contact for price&quot;
          </label>
          <input
            type="number"
            step="0.01"
            name="price"
            id="price"
            value={priceInput}
            onChange={handlePriceChange}
            placeholder="e.g. 150.00"
            className="w-full px-4 py-2.5 rounded-xl border border-primary/10 bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200 text-dark text-sm"
          />
        </div>

        {/* Benefit (Full width) */}
        <div className="sm:col-span-2">
          <label htmlFor="benefit" className="block text-xs font-bold uppercase tracking-wider text-dark/70 mb-2">
            Key Benefit Copy
          </label>
          <textarea
            name="benefit"
            id="benefit"
            required
            rows={3}
            value={formData.benefit}
            onChange={handleChange}
            placeholder="e.g. Gently cleanses without stripping natural moisture from the coils."
            className="w-full px-4 py-2.5 rounded-xl border border-primary/10 bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200 text-dark text-sm resize-none"
          />
        </div>

        {/* Image Upload Zone */}
        <div className="sm:col-span-2 pt-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-dark/70 mb-2">
            Product Image *
          </label>
          
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 items-center">
            {/* Image Preview Box */}
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-primary/10 bg-brand-bg flex items-center justify-center">
              {previewUrl || formData.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl || formData.image}
                  alt="Preview"
                  className="w-full h-full object-cover animate-fade-in"
                />
              ) : (
                <span className="text-xs text-dark/40 font-medium">No Image</span>
              )}
            </div>

            {/* Drop Zone Box */}
            <div className="sm:col-span-3">
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl transition-all duration-300 min-h-[120px] text-center cursor-pointer ${
                  dragActive 
                    ? 'border-secondary bg-secondary/5' 
                    : 'border-primary/20 hover:border-primary/40 bg-white hover:bg-brand-bg/30'
                }`}
              >
                <input
                  type="file"
                  id="image-file-input"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                
                <label 
                  htmlFor="image-file-input" 
                  className="w-full h-full flex flex-col items-center justify-center cursor-pointer space-y-2"
                >
                  <svg className="w-8 h-8 text-primary/45" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                  </svg>
                  <div>
                    <span className="text-xs font-bold text-primary block">
                      Drag &amp; drop product image here, or <span className="text-secondary hover:underline font-extrabold">browse</span>
                    </span>
                    <span className="text-[10px] text-dark/45 block mt-1">
                      Supports PNG, JPG, JPEG, WEBP, GIF up to 5MB
                    </span>
                  </div>
                </label>
              </div>

              {uploadError && (
                <span className="text-xs text-red-600 font-semibold block mt-2">
                  ⚠️ {uploadError}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 border-t border-primary/5 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 border border-primary/15 text-primary text-sm font-semibold rounded-xl hover:bg-primary/5 transition-colors duration-200 cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className={`px-5 py-2.5 bg-primary text-white text-sm font-serif font-bold rounded-xl hover:bg-primary-light transition-colors duration-200 cursor-pointer ${
            loading ? 'opacity-80 cursor-wait' : ''
          }`}
        >
          {loading ? 'Saving...' : 'Save Product'}
        </button>
      </div>
    </form>
  );
}
