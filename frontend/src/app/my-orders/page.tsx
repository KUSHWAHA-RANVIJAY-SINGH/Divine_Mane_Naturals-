'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCustomerOrders, Order } from '../../lib/api';
import { useCustomerAuth } from '../../context/AuthContext';
import SectionHeading from '../../components/SectionHeading';

export default function MyOrdersPage() {
  const { customer, customerToken, loading: authLoading } = useCustomerAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState('');
  
  const router = useRouter();

  useEffect(() => {
    // Wait for auth loading to finish
    if (authLoading) return;

    if (!customer || !customerToken) {
      // Redirect to home if not logged in
      alert('Please sign in to view your order history.');
      router.push('/');
      return;
    }

    async function loadOrders() {
      setLoadingOrders(true);
      setError('');
      try {
        if (customerToken) {
          const data = await getCustomerOrders(customerToken);
          setOrders(data);
        }
      } catch (err: any) {
        console.error('Error fetching customer orders:', err);
        setError(err.message || 'Failed to load your orders.');
      } finally {
        setLoadingOrders(false);
      }
    }

    loadOrders();
  }, [customer, customerToken, authLoading, router]);

  if (authLoading || (!customer && loadingOrders)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-primary mx-auto mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  // Format date helper
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Status Badge Component
  const StatusBadge = ({ status }: { status: Order['status'] }) => {
    const styles: Record<string, string> = {
      pending: 'bg-amber-50 text-amber-800 border-amber-200/50',
      contacted: 'bg-blue-50 text-blue-800 border-blue-200/50',
      confirmed: 'bg-emerald-50 text-emerald-800 border-emerald-200/50',
      fulfilled: 'bg-indigo-50 text-indigo-800 border-indigo-200/50',
      cancelled: 'bg-red-50 text-red-800 border-red-200/50',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${styles[status] || styles.pending}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SectionHeading
        title="My Orders"
        subtitle="Order history and tracking"
      />

      <div className="mt-8 bg-white p-6 sm:p-10 rounded-3xl border border-primary/5 shadow-lg">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 text-sm font-semibold rounded-xl text-center">
            ⚠️ {error}
          </div>
        )}

        {loadingOrders ? (
          <div className="text-center py-20">
            <svg className="animate-spin h-8 w-8 text-primary mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Fetching your order history...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div className="w-16 h-16 bg-primary/5 border border-primary/10 rounded-full flex items-center justify-center text-primary/50 mx-auto">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-75 0v4.5m11.356-2A8.001 8.001 0 1121.21 8H17" />
              </svg>
            </div>
            <h3 className="font-serif font-bold text-2xl text-primary">No Orders Yet</h3>
            <p className="text-sm text-dark/65 max-w-sm mx-auto leading-relaxed">
              It looks like you haven&apos;t placed any orders with us yet. Visit the catalog to get started!
            </p>
            <div className="pt-4">
              <a
                href="/shop"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-light transition-all duration-200"
              >
                Shop Our Products
              </a>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-primary/5">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-bg/50 border-b border-primary/10">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-dark/70">Order Date</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-dark/70">Product Name</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-dark/70 text-center">Qty</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-dark/70">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-dark/70 text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-brand-bg/25 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-dark/80 whitespace-nowrap">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-primary">
                      {order.productName}
                    </td>
                    <td className="px-6 py-4 text-sm text-dark/80 text-center font-bold">
                      {order.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-serif font-bold text-primary whitespace-nowrap">
                      {order.totalPrice !== null && order.totalPrice !== undefined ? `ZK ${order.totalPrice.toFixed(2)}` : 'TBD'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
