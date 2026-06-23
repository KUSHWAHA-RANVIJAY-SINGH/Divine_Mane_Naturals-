'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getUserOrders, Order } from '../../lib/api';
import SectionHeading from '../../components/SectionHeading';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      router.push('/login?redirect=/my-orders');
      return;
    }

    async function loadOrders() {
      try {
        const data = await getUserOrders(token!);
        setOrders(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load order history.');
        // If expired token
        if (err.message.includes('expired') || err.message.includes('invalid') || err.message.includes('token')) {
          localStorage.removeItem('userToken');
          localStorage.removeItem('userName');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userPhone');
          localStorage.removeItem('userId');
          router.push('/login?redirect=/my-orders');
        }
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [router]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusStyle = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'contacted':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'confirmed':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'fulfilled':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'cancelled':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SectionHeading
        title="My Order History"
        subtitle="Mane Member Purchases"
      />

      {loading ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-primary/5 shadow-sm mt-8">
          <svg className="animate-spin h-8 w-8 text-primary mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Retrieving your orders...</span>
        </div>
      ) : error ? (
        <div className="p-4 mt-8 bg-red-50 border border-red-200 text-red-800 text-sm font-semibold rounded-xl text-center">
          ⚠️ {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-primary/5 shadow-sm mt-8 space-y-6">
          <svg className="w-16 h-16 text-primary/30 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
          <div>
            <h3 className="font-serif font-bold text-xl text-primary">No Orders Yet</h3>
            <p className="text-dark/60 text-sm mt-1">You haven&apos;t placed any orders with this account yet.</p>
          </div>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white text-sm font-serif font-bold rounded-xl hover:bg-primary-light transition-all duration-300 shadow-md hover:shadow-primary/20"
            >
              Browse Shop Catalog
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6 mt-8">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white p-6 rounded-3xl border border-primary/5 hover:border-primary/10 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
            >
              {/* Product and details */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className={`inline-block px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full border ${getStatusStyle(order.status)}`}>
                    {order.status}
                  </span>
                  <span className="text-xs text-dark/50 font-medium">
                    Placed on {formatDate(order.createdAt)}
                  </span>
                </div>
                
                <h3 className="font-serif font-bold text-xl text-primary">
                  {order.productName}
                </h3>
                
                <div className="flex gap-4 text-xs font-semibold text-dark/70">
                  <span>Quantity: <strong className="text-primary">{order.quantity}</strong></span>
                  {order.couponCode && (
                    <span className="text-secondary uppercase">
                      Coupon: <strong>{order.couponCode}</strong>
                    </span>
                  )}
                </div>

                {order.notes && (
                  <p className="text-xs text-dark/60 italic max-w-xl">
                    &ldquo;{order.notes}&rdquo;
                  </p>
                )}
              </div>

              {/* Price summary */}
              <div className="text-left sm:text-right border-t sm:border-t-0 pt-4 sm:pt-0 w-full sm:w-auto">
                {order.discountApplied && order.discountApplied > 0 ? (
                  <div className="text-xs text-dark/50">
                    Discount: -ZK {order.discountApplied.toFixed(2)}
                  </div>
                ) : null}
                <div className="text-base font-bold text-primary mt-1">
                  Estimated Total: {order.totalPrice ? `ZK ${order.totalPrice.toFixed(2)}` : 'TBD'}
                </div>
                <div className="text-[10px] text-dark/40 mt-1 italic">
                  Cash on Delivery / Manual Mobile Confirmation
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
