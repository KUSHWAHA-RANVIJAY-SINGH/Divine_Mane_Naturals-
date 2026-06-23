'use client';

import React, { useState } from 'react';
import { CouponInput } from '../lib/api';

interface AdminCouponFormProps {
  onSubmit: (data: CouponInput) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

export default function AdminCouponForm({ onSubmit, onCancel, loading }: AdminCouponFormProps) {
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [discountValue, setDiscountValue] = useState<number>(10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || discountValue === undefined || discountValue < 0) return;
    onSubmit({
      code: code.trim().toUpperCase(),
      discountType,
      discountValue,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-xl font-serif font-bold text-primary border-b border-primary/5 pb-3">
        Create New Coupon
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Code */}
        <div>
          <label htmlFor="coupon_code" className="block text-xs font-bold uppercase tracking-wider text-dark/70 mb-2">
            Coupon Code (Uppercase)
          </label>
          <input
            type="text"
            id="coupon_code"
            required
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. MORINGA15"
            className="w-full px-4 py-2.5 rounded-xl border border-primary/10 bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200 text-dark text-sm uppercase"
          />
        </div>

        {/* Discount Type */}
        <div>
          <label htmlFor="discount_type" className="block text-xs font-bold uppercase tracking-wider text-dark/70 mb-2">
            Discount Type
          </label>
          <select
            id="discount_type"
            required
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value as 'percent' | 'fixed')}
            className="w-full px-4 py-2.5 rounded-xl border border-primary/10 bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200 text-dark text-sm cursor-pointer"
          >
            <option value="percent">Percentage Off (%)</option>
            <option value="fixed">Fixed ZK Discount (ZK)</option>
          </select>
        </div>

        {/* Discount Value */}
        <div>
          <label htmlFor="discount_value" className="block text-xs font-bold uppercase tracking-wider text-dark/70 mb-2">
            Discount Value ({discountType === 'percent' ? '%' : 'ZK'})
          </label>
          <input
            type="number"
            id="discount_value"
            required
            min="0"
            max={discountType === 'percent' ? 100 : undefined}
            value={discountValue}
            onChange={(e) => setDiscountValue(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-4 py-2.5 rounded-xl border border-primary/10 bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200 text-dark text-sm"
          />
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
          {loading ? 'Creating...' : 'Create Coupon'}
        </button>
      </div>
    </form>
  );
}
