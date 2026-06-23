'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Product, createOrder, applyCoupon } from '../lib/api';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  
  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountType: 'percent' | 'fixed'; discountValue: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const formattedPrice =
    product.price !== null && product.price !== undefined
      ? `ZK ${product.price.toFixed(2)}`
      : 'Contact for price';

  // Calculate prices
  const basePrice = product.price ? product.price * quantity : 0;
  let discountAmount = 0;
  if (appliedCoupon && product.price) {
    if (appliedCoupon.discountType === 'percent') {
      discountAmount = (basePrice * appliedCoupon.discountValue) / 100;
    } else {
      discountAmount = Math.min(basePrice, appliedCoupon.discountValue);
    }
  }
  const finalPrice = Math.max(0, basePrice - discountAmount);

  const handleApplyCoupon = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    setCouponSuccess('');
    try {
      const result = await applyCoupon(couponCode.trim());
      setAppliedCoupon(result);
      setCouponSuccess(`Coupon "${result.code}" applied successfully!`);
    } catch (err: any) {
      console.error(err);
      setCouponError(err.message || 'Invalid or inactive coupon code.');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !phone || !quantity) {
      setError('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await createOrder({
        customerName,
        phone,
        productId: product._id,
        productName: product.name,
        quantity,
        notes,
        couponCode: appliedCoupon ? appliedCoupon.code : '',
        discountApplied: discountAmount,
        totalPrice: product.price ? finalPrice : null,
      });
      setSuccess(true);
      // Reset form fields
      setCustomerName('');
      setPhone('');
      setQuantity(1);
      setNotes('');
      setCouponCode('');
      setAppliedCoupon(null);
      setCouponSuccess('');
      setCouponError('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSuccess(false);
    setError('');
    setCouponCode('');
    setAppliedCoupon(null);
    setCouponSuccess('');
    setCouponError('');
  };

  return (
    <>
      <div className="group bg-white rounded-2xl overflow-hidden border border-primary/5 hover:border-primary/10 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full">
        {/* Product Image Wrapper */}
        <div className="relative aspect-square w-full bg-brand-bg overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            priority={false}
          />
          {/* Category Tag */}
          <span className="absolute top-4 left-4 text-[10px] font-bold tracking-widest uppercase bg-primary text-white px-2.5 py-1 rounded-full shadow-sm">
            {product.category}
          </span>
        </div>

        {/* Product Details */}
        <div className="p-6 flex flex-col justify-between flex-grow">
          <div>
            {product.tagline && (
              <span className="text-[11px] font-bold text-secondary tracking-wider uppercase block mb-1">
                {product.tagline}
              </span>
            )}
            <h3 className="font-serif font-bold text-lg sm:text-xl text-primary mb-2 line-clamp-1 group-hover:text-primary-light transition-colors duration-200">
              {product.name}
            </h3>
            <p className="text-dark/70 text-xs sm:text-sm leading-relaxed mb-4 line-clamp-2">
              {product.benefit}
            </p>
          </div>

          {/* Price & Action */}
          <div className="mt-auto pt-4 border-t border-primary/5">
            <div className="flex items-center justify-between gap-4 mb-4">
              <span className="text-xs font-bold text-dark/50 uppercase tracking-wider">
                Price
              </span>
              <span className="font-sans font-bold text-sm sm:text-base text-primary">
                {formattedPrice}
              </span>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 transform hover:-translate-y-0.5 select-none text-xs sm:text-sm cursor-pointer"
            >
              Order Now
            </button>
          </div>
        </div>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={handleClose}>
          <div
            className="relative bg-white w-full max-w-md p-6 sm:p-8 rounded-3xl border border-primary/5 shadow-2xl animate-scale-up overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-dark/40 hover:text-dark transition-colors duration-200 rounded-full hover:bg-primary/5 cursor-pointer"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {success ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center text-emerald-600 mx-auto">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-serif font-bold text-2xl text-primary">Order Placed!</h3>
                <p className="text-sm text-dark/75 leading-relaxed">
                  We&apos;ve received your order! We&apos;ll contact you shortly to confirm.
                </p>
                <div className="pt-4">
                  <button
                    onClick={handleClose}
                    className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-light transition-all duration-200 cursor-pointer"
                  >
                    Back to Shop
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] block mb-1">
                    Direct Order Form
                  </span>
                  <h3 className="font-serif font-bold text-2xl text-primary">
                    Order {product.name}
                  </h3>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl font-medium">
                    ⚠️ {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label htmlFor="customerName" className="block text-xs font-bold text-dark/70 uppercase tracking-wider">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="customerName"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Mwape Muloboko"
                      className="w-full px-4 py-2.5 bg-brand-bg rounded-xl border border-primary/10 focus:border-primary focus:outline-none text-sm text-dark"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="phone" className="block text-xs font-bold text-dark/70 uppercase tracking-wider">
                      Phone Number (WhatsApp or Call) *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +260974572834"
                      className="w-full px-4 py-2.5 bg-brand-bg rounded-xl border border-primary/10 focus:border-primary focus:outline-none text-sm text-dark"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="quantity" className="block text-xs font-bold text-dark/70 uppercase tracking-wider">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        id="quantity"
                        required
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-4 py-2.5 bg-brand-bg rounded-xl border border-primary/10 focus:border-primary focus:outline-none text-sm text-dark"
                      />
                    </div>
                    <div className="space-y-1 flex flex-col justify-end">
                      <div className="text-right">
                        <span className="text-[10px] text-dark/50 block font-semibold">
                          Subtotal: ZK {basePrice.toFixed(2)}
                        </span>
                        {discountAmount > 0 && (
                          <span className="text-[10px] text-emerald-600 block font-semibold">
                            Discount: -ZK {discountAmount.toFixed(2)}
                          </span>
                        )}
                        <span className="text-xs text-primary font-bold block pt-0.5">
                          Total Est: {product.price ? `ZK ${finalPrice.toFixed(2)}` : 'TBD'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Coupon Section */}
                  <div className="space-y-1 pt-2 border-t border-primary/5">
                    <label htmlFor="couponCode" className="block text-xs font-bold text-dark/70 uppercase tracking-wider">
                      Have a Coupon Code?
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="couponCode"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="e.g. WELCOME10"
                        className="flex-grow px-3 py-2 bg-brand-bg rounded-xl border border-primary/10 focus:border-primary focus:outline-none text-sm text-dark uppercase"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading}
                        className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-light transition-all duration-200 disabled:opacity-50 cursor-pointer"
                      >
                        {couponLoading ? 'Applying...' : 'Apply'}
                      </button>
                    </div>
                    {couponError && (
                      <span className="text-[10px] text-red-600 font-semibold block mt-1">
                        ⚠️ {couponError}
                      </span>
                    )}
                    {couponSuccess && (
                      <span className="text-[10px] text-emerald-600 font-semibold block mt-1">
                        ✓ {couponSuccess}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="notes" className="block text-xs font-bold text-dark/70 uppercase tracking-wider">
                      Special Notes (Optional)
                    </label>
                    <textarea
                      id="notes"
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Preferred delivery time, skin sensitivity notes..."
                      className="w-full px-4 py-2.5 bg-brand-bg rounded-xl border border-primary/10 focus:border-primary focus:outline-none text-sm text-dark resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-4"
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Placing Order...
                      </>
                    ) : (
                      'Confirm Order'
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
