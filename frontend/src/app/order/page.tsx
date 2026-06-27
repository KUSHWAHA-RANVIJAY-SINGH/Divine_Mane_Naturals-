'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getProducts, createOrder, applyCoupon, Product } from '../../lib/api';
import SectionHeading from '../../components/SectionHeading';
import { useCustomerAuth } from '../../context/AuthContext';

export default function OrderPage() {
  const { customer } = useCustomerAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  
  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountType: 'percent' | 'fixed'; discountValue: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const [loadingProducts, setLoadingProducts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Fetch products on mount
  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();
        setProducts(data);
        if (data.length > 0) {
          setSelectedProductId(data[0]._id);
        }
      } catch (err: any) {
        console.error('Error loading products:', err);
        setError(err.message || 'Failed to load products. Please check if the backend API is running.');
      } finally {
        setLoadingProducts(false);
      }
    }
    
    loadProducts();
  }, []);

  // Autofill customer profile
  useEffect(() => {
    if (customer) {
      setCustomerName(customer.name || '');
      setEmail(customer.email || '');
    }
  }, [customer]);

  const selectedProduct = products.find((p) => p._id === selectedProductId);

  // Price calculations
  const basePrice = selectedProduct && selectedProduct.price ? selectedProduct.price * quantity : 0;
  let discountAmount = 0;
  if (appliedCoupon && selectedProduct && selectedProduct.price) {
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
    if (!selectedProductId || !customerName || !phone || !email || !quantity) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!selectedProduct) {
      setError('Selected product is invalid.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const userId = localStorage.getItem('userId') || '';
      const customerId = customer ? (customer.id || customer._id) : undefined;
      
      await createOrder({
        customerName,
        phone,
        email,
        productId: selectedProduct._id,
        productName: selectedProduct.name,
        quantity,
        notes,
        couponCode: appliedCoupon ? appliedCoupon.code : '',
        discountApplied: discountAmount,
        totalPrice: selectedProduct.price ? finalPrice : null,
        userId,
        customerId,
      });
      setSuccess(true);
      // Reset form
      setCustomerName(customer ? customer.name : '');
      setPhone('');
      setEmail(customer ? customer.email : '');
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

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SectionHeading
        title="Place an Order"
        subtitle="Direct Ordering Form"
      />

      <div className="mt-8 bg-white p-6 sm:p-10 rounded-3xl border border-primary/5 shadow-lg">
        {success ? (
          <div className="text-center py-10 space-y-6">
            <div className="w-20 h-20 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center text-emerald-600 mx-auto animate-scale-up">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-serif font-bold text-3xl text-primary">Order Received!</h3>
            <p className="text-base text-dark/75 max-w-md mx-auto leading-relaxed">
              We&apos;ve received your order! A confirmation invoice has been sent to <span className="font-semibold text-primary">{email || 'your email'}</span>. We&apos;ll contact you shortly at <span className="font-semibold text-primary">{phone || 'your phone number'}</span> to confirm delivery details.
            </p>
            <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/shop"
                className="px-6 py-3 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-light transition-all duration-200 text-center"
              >
                Back to Shop Catalog
              </Link>
              <button
                onClick={() => setSuccess(false)}
                className="px-6 py-3 border border-primary/10 text-primary text-sm font-semibold rounded-xl hover:bg-primary/5 transition-all duration-200"
              >
                Order Another Item
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-dark/75 text-sm sm:text-base leading-relaxed text-center max-w-xl mx-auto">
              Ready to purchase? Select your product, enter your contact information, apply any coupon codes, and we&apos;ll reach out via call or WhatsApp to confirm your order.
            </p>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-sm rounded-xl font-medium">
                ⚠️ {error}
              </div>
            )}

            {loadingProducts ? (
              <div className="text-center py-12">
                <svg className="animate-spin h-8 w-8 text-primary mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-sm font-semibold text-primary uppercase tracking-wider">Loading product list...</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1">
                  <label htmlFor="product" className="block text-xs font-bold text-dark/70 uppercase tracking-wider">
                    Select Product *
                  </label>
                  <select
                    id="product"
                    required
                    value={selectedProductId}
                    onChange={(e) => {
                      setSelectedProductId(e.target.value);
                      setAppliedCoupon(null);
                      setCouponCode('');
                      setCouponSuccess('');
                      setCouponError('');
                    }}
                    className="w-full px-4 py-3 bg-brand-bg rounded-xl border border-primary/10 focus:border-primary focus:outline-none text-sm text-dark cursor-pointer"
                  >
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} {p.price !== null ? `— ZK ${p.price.toFixed(2)}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-1">
                    <label htmlFor="customerName" className="block text-xs font-bold text-dark/70 uppercase tracking-wider">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      id="customerName"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Mwape Muloboko"
                      className="w-full px-4 py-3 bg-brand-bg rounded-xl border border-primary/10 focus:border-primary focus:outline-none text-sm text-dark"
                    />
                  </div>

                  {/* Phone */}
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
                      className="w-full px-4 py-3 bg-brand-bg rounded-xl border border-primary/10 focus:border-primary focus:outline-none text-sm text-dark"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label htmlFor="email" className="block text-xs font-bold text-dark/70 uppercase tracking-wider">
                    Email Address * (For order confirmation invoice)
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. customer@gmail.com"
                    className="w-full px-4 py-3 bg-brand-bg rounded-xl border border-primary/10 focus:border-primary focus:outline-none text-sm text-dark"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                      className="w-full px-4 py-3 bg-brand-bg rounded-xl border border-primary/10 focus:border-primary focus:outline-none text-sm text-dark"
                    />
                  </div>
                  <div className="space-y-1 flex flex-col justify-end">
                    <div className="bg-brand-bg/50 px-4 py-3 rounded-xl border border-dashed border-primary/10 text-sm">
                      <div className="flex justify-between text-dark/70">
                        <span>Subtotal:</span>
                        <span>ZK {basePrice.toFixed(2)}</span>
                      </div>
                      {discountAmount > 0 && (
                        <div className="flex justify-between text-emerald-600 font-semibold mt-1">
                          <span>Discount:</span>
                          <span>-ZK {discountAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-primary font-bold mt-2 pt-2 border-t border-primary/10">
                        <span>Total Estimate:</span>
                        <span>{selectedProduct && selectedProduct.price ? `ZK ${finalPrice.toFixed(2)}` : 'TBD'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coupon Section */}
                <div className="space-y-1 pt-3 border-t border-primary/5">
                  <label htmlFor="couponCode" className="block text-xs font-bold text-dark/70 uppercase tracking-wider">
                    Apply Coupon Code
                  </label>
                  <div className="flex gap-2 max-w-md">
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
                      className="px-5 py-2.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-light transition-all duration-200 disabled:opacity-50 cursor-pointer"
                    >
                      {couponLoading ? 'Applying...' : 'Apply Coupon'}
                    </button>
                  </div>
                  {couponError && (
                    <span className="text-xs text-red-600 font-semibold block mt-1">
                      ⚠️ {couponError}
                    </span>
                  )}
                  {couponSuccess && (
                    <span className="text-xs text-emerald-600 font-semibold block mt-1">
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
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Preferred delivery day, specific packaging requests, hair concerns..."
                    className="w-full px-4 py-3 bg-brand-bg rounded-xl border border-primary/10 focus:border-primary focus:outline-none text-sm text-dark resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-base"
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
                    'Place Order Now'
                  )}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
