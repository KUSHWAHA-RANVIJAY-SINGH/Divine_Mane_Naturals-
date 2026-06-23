'use client';

import React from 'react';
import { Order } from '../lib/api';

interface AdminOrderTableProps {
  orders: Order[];
  onStatusChange: (id: string, newStatus: Order['status']) => void;
  updatingId: string | null;
}

export default function AdminOrderTable({
  orders,
  onStatusChange,
  updatingId,
}: AdminOrderTableProps) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-primary/5">
        <p className="text-dark/60 font-sans text-sm">
          No orders found in the database.
        </p>
      </div>
    );
  }

  // Helper to format date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  // Helper for status badge styling
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
    <div className="bg-white rounded-2xl border border-primary/5 shadow-sm overflow-hidden animate-fade-in">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-primary/5 border-b border-primary/10 text-[11px] font-bold uppercase tracking-wider text-primary">
              <th className="py-4 px-6">Customer</th>
              <th className="py-4 px-6">Contact Phone</th>
              <th className="py-4 px-6">Product Ordered</th>
              <th className="py-4 px-6">Qty</th>
              <th className="py-4 px-6">Order Status</th>
              <th className="py-4 px-6">Date Placed</th>
              <th className="py-4 px-6">Special Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/5 text-sm">
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-primary/5 transition-colors duration-150">
                {/* Customer name */}
                <td className="py-4 px-6 font-serif font-bold text-primary text-base">
                  {order.customerName}
                </td>

                {/* Phone */}
                <td className="py-4 px-6 font-semibold font-sans text-dark/85">
                  {order.phone}
                </td>

                {/* Product Name */}
                <td className="py-4 px-6 font-medium text-dark">
                  {order.productName}
                </td>

                {/* Quantity */}
                <td className="py-4 px-6 font-bold text-center sm:text-left text-primary">
                  {order.quantity}
                </td>

                {/* Status Dropdown selector */}
                <td className="py-4 px-6">
                  {updatingId === order._id ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-primary/70 font-semibold">
                      <svg className="animate-spin h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Updating...
                    </span>
                  ) : (
                    <select
                      value={order.status}
                      onChange={(e) => onStatusChange(order._id, e.target.value as Order['status'])}
                      className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg border focus:outline-none cursor-pointer transition-all duration-200 ${getStatusStyle(
                        order.status
                      )}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="contacted">Contacted</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="fulfilled">Fulfilled</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  )}
                </td>

                {/* Date */}
                <td className="py-4 px-6 text-xs text-dark/70 whitespace-nowrap">
                  {formatDate(order.createdAt)}
                </td>

                {/* Notes */}
                <td className="py-4 px-6 text-xs text-dark/65 max-w-xs truncate" title={order.notes}>
                  {order.notes || <span className="text-dark/30 italic">No notes</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
