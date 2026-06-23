'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getProducts, createOrder, Product } from '../../lib/api';
import localProducts from '../../data/products.json';
import SectionHeading from '../../components/SectionHeading';

export default function OrderPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  
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
      } catch (err) {
        console.warn('⚠️ Product API offline, falling back to local JSON data:', err);
        // Format local JSON structure to match Product interface
        const fallbackList: Product[] = localProducts.map((p, idx) => ({
          _id: `fallback-${idx}`,
          name: p.name,
          category: p.category as 'Cleanse' | 'Condition & Repair' | 'Moisturize' | 'Growth & Finish',
          tagline: p.tagline || '',
          benefit: p.benefit,
          price: p.price,
          image: p.image,
        }));
        setProducts(fallbackList);
        if (fallbackList.length > 0) {
          setSelectedProductId(fallbackList[0]._id);
        }
      } finally {
        setLoadingProducts(false);
      }
    }
    loadProducts();
  }, []);

  const selectedProduct = products.find((p) => p._id === selectedProductId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !customerName || !phone || !quantity) {
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
      await createOrder({
        customerName,
        phone,
        productId: selectedProduct._id,
        productName: selectedProduct.name,
        quantity,
        notes,
      });
      setSuccess(true);
      // Reset form
      setCustomerName('');
      setPhone('');
      setQuantity(1);
      setNotes('');
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
              We&apos;ve received your order! We&apos;ll contact you shortly at <span className="font-semibold text-primary">{phone || 'your phone number'}</span> to confirm and arrange payment &amp; delivery.
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
              Ready to purchase? Select your product, enter your contact information, and we&apos;ll reach out via call or WhatsApp to confirm your order.
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
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full px-4 py-3 bg-brand-bg rounded-xl border border-primary/10 focus:border-primary focus:outline-none text-sm text-dark cursor-pointer"
                  >
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} {p.price !== null ? `— ZK ${p.price.toFixed(2)}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

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
                    <span className="text-sm text-dark/70 font-semibold pb-3 bg-brand-bg/50 px-4 py-3 rounded-xl border border-dashed border-primary/10">
                      Total Estimate: <span className="text-primary font-bold">{selectedProduct && selectedProduct.price ? `ZK ${(selectedProduct.price * quantity).toFixed(2)}` : 'TBD'}</span>
                    </span>
                  </div>
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
