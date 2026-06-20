'use client';

import React, { useState, useEffect } from 'react';
import { ProductInput, Product } from '../lib/api';

interface AdminProductFormProps {
  initialData?: Product | null;
  onSubmit: (data: ProductInput) => Promise<void>;
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
    image: '/products/shampoo.jpg', // Default initial image
  });

  const [priceInput, setPriceInput] = useState<string>('');

  // Hydrate form when initialData changes (edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        category: initialData.category,
        tagline: initialData.tagline || '',
        benefit: initialData.benefit,
        price: initialData.price,
        image: initialData.image,
      });
      setPriceInput(initialData.price !== null ? initialData.price.toString() : '');
    } else {
      setFormData({
        name: '',
        category: 'Cleanse',
        tagline: '',
        benefit: '',
        price: null,
        image: '/products/shampoo.jpg',
      });
      setPriceInput('');
    }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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
            className="w-full px-4 py-2.5 rounded-xl border border-primary/10 bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200 text-dark text-sm"
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

        {/* Image Path */}
        <div className="sm:col-span-2">
          <label htmlFor="image" className="block text-xs font-bold uppercase tracking-wider text-dark/70 mb-2">
            Product Image Path
          </label>
          <select
            name="image"
            id="image"
            required
            value={formData.image}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border border-primary/10 bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200 text-dark text-sm"
          >
            <option value="/products/shampoo.jpg">Shampoo Bottle Image (/products/shampoo.jpg)</option>
            <option value="/products/protein-conditioner.jpg">Deep Conditioner Jar Image (/products/protein-conditioner.jpg)</option>
            <option value="/products/leave-in.jpg">Leave-In Conditioner Image (/products/leave-in.jpg)</option>
            <option value="/products/butter-cream.jpg">Butter Cream Image (/products/butter-cream.jpg)</option>
            <option value="/products/castor-oil.jpg">Castor Oil Dropper Image (/products/castor-oil.jpg)</option>
            <option value="/products/growth-oil.jpg">Growth Oil Dropper Image (/products/growth-oil.jpg)</option>
            <option value="/products/herbal-mist.jpg">Herbal Mist Spray Image (/products/herbal-mist.jpg)</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 border-t border-primary/5 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 border border-primary/15 text-primary text-sm font-semibold rounded-xl hover:bg-primary/5 transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className={`px-5 py-2.5 bg-primary text-white text-sm font-serif font-bold rounded-xl hover:bg-primary-light transition-colors duration-200 ${
            loading ? 'opacity-80 cursor-wait' : ''
          }`}
        >
          {loading ? 'Saving...' : 'Save Product'}
        </button>
      </div>
    </form>
  );
}
