'use client';

import React, { useState } from 'react';
import { Search, Filter, Download, Phone, Mail, Clock, RefreshCw, CheckSquare, Square } from 'lucide-react';
import { Order } from '../lib/api';

interface AdminOrderTableProps {
  orders: Order[];
  onStatusChange: (id: string, newStatus: Order['status']) => void;
  updatingId: string | null;
}

const STATUS_BADGES: { [key in Order['status']]: { label: string; bg: string; text: string; border: string } } = {
  pending: { label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  contacted: { label: 'Contacted', bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
  confirmed: { label: 'Confirmed', bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200' },
  fulfilled: { label: 'Fulfilled', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
  cancelled: { label: 'Cancelled', bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200' },
};

export default function AdminOrderTable({
  orders,
  onStatusChange,
  updatingId,
}: AdminOrderTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filter orders based on search and status inputs
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.phone.includes(searchQuery) ||
      order.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.couponCode && order.couponCode.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Toggle selection handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredOrders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredOrders.map(o => o._id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  // Bulk status update operations
  const handleBulkStatusChange = async (newStatus: Order['status']) => {
    if (confirm(`Are you sure you want to change status of ${selectedIds.length} selected orders to "${newStatus.toUpperCase()}"?`)) {
      for (const id of selectedIds) {
        try {
          await onStatusChange(id, newStatus);
        } catch (err) {
          console.error(`Failed to bulk update status for ${id}:`, err);
        }
      }
      setSelectedIds([]);
    }
  };

  // CSV Export utility
  const handleExportCSV = () => {
    const headers = ['Order ID', 'Customer Name', 'Phone', 'Email', 'Product', 'Quantity', 'Coupon Applied', 'Discount (ZK)', 'Total Price (ZK)', 'Status', 'Date Placed'];
    const rows = filteredOrders.map(o => [
      o._id,
      o.customerName,
      o.phone,
      o.email,
      o.productName,
      o.quantity.toString(),
      o.couponCode || '-',
      o.discountApplied ? o.discountApplied.toFixed(2) : '0.00',
      o.totalPrice ? o.totalPrice.toFixed(2) : '0.00',
      o.status,
      o.createdAt || ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `orders_registry_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format date utility
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

  return (
    <div className="space-y-6">
      {/* Search/Filter/Export Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center bg-white p-4 rounded-2xl border border-primary/5 shadow-xs">
        {/* Left Side: Search & Filter inputs */}
        <div className="flex flex-col sm:flex-row gap-3 flex-grow max-w-3xl">
          {/* Search bar */}
          <div className="relative flex-grow">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-primary/45">
              <Search size={16} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer name, email, phone, product..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-stone-50 rounded-xl border border-primary/10 focus:border-primary focus:outline-none placeholder-dark/40 text-dark"
            />
          </div>

          {/* Filter dropdown */}
          <div className="relative min-w-[160px]">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-primary/45">
              <Filter size={14} />
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-stone-50 rounded-xl border border-primary/10 focus:border-primary focus:outline-none cursor-pointer font-semibold text-primary/80"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="contacted">Contacted</option>
              <option value="confirmed">Confirmed</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Right Side: CSV Export Button */}
        <div className="flex-shrink-0 flex items-stretch gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 border border-primary/15 text-primary hover:bg-primary/5 text-sm font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs hover:shadow transition-all duration-200"
          >
            <Download size={15} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Bulk Status Update Banner */}
      {selectedIds.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-primary/5 border border-primary/15 p-4 rounded-xl animate-fade-in">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs font-bold text-primary">
              {selectedIds.length} {selectedIds.length === 1 ? 'order' : 'orders'} selected
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-primary/70">Update Status:</span>
            {['pending', 'contacted', 'confirmed', 'fulfilled', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => handleBulkStatusChange(status as Order['status'])}
                className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-primary/10 bg-white hover:bg-primary hover:text-white transition-colors duration-200 cursor-pointer shadow-xs uppercase tracking-wide"
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Orders Table Container */}
      <div className="bg-white rounded-3xl border border-primary/5 shadow-md overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-dark/50 font-sans text-sm">
              No orders found matching your search.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50/80 border-b border-primary/5 text-[10px] font-bold uppercase tracking-wider text-primary">
                  {/* Select Checkbox Column */}
                  <th className="py-4 px-6 w-12 text-center">
                    <button
                      onClick={handleToggleSelectAll}
                      className="text-primary/75 hover:text-primary cursor-pointer transition-colors focus:outline-none"
                    >
                      {selectedIds.length === filteredOrders.length ? (
                        <CheckSquare size={17} className="text-primary" />
                      ) : (
                        <Square size={17} />
                      )}
                    </button>
                  </th>
                  <th className="py-4 px-6">Customer &amp; Contact</th>
                  <th className="py-4 px-6">Product Ordered</th>
                  <th className="py-4 px-6 text-center">Qty</th>
                  <th className="py-4 px-6">Pricing</th>
                  <th className="py-4 px-6">Order Status</th>
                  <th className="py-4 px-6">Date Placed</th>
                  <th className="py-4 px-6 max-w-xs">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5 text-sm">
                {filteredOrders.map((order) => {
                  const isChecked = selectedIds.includes(order._id);
                  const isUpdating = updatingId === order._id;
                  const badge = STATUS_BADGES[order.status] || STATUS_BADGES.pending;

                  return (
                    <tr 
                      key={order._id} 
                      className={`hover:bg-stone-50/50 transition-colors duration-150 ${isChecked ? 'bg-primary/2' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="py-4 px-6 text-center select-none">
                        <button
                          onClick={() => handleToggleSelectRow(order._id)}
                          className="text-primary/65 hover:text-primary cursor-pointer transition-colors focus:outline-none"
                        >
                          {isChecked ? (
                            <CheckSquare size={17} className="text-primary" />
                          ) : (
                            <Square size={17} />
                          )}
                        </button>
                      </td>

                      {/* Stacked Customer Details */}
                      <td className="py-4 px-6">
                        <div className="space-y-0.5">
                          <span className="block font-serif font-extrabold text-base text-primary leading-tight">
                            {order.customerName}
                          </span>
                          <div className="flex items-center gap-3 text-[11px] text-dark/50 font-normal">
                            <span className="flex items-center gap-1"><Phone size={11} className="text-primary/45" /> {order.phone}</span>
                            <span className="flex items-center gap-1"><Mail size={11} className="text-primary/45 animate-pulse" /> {order.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Stacked Product Details */}
                      <td className="py-4 px-6 font-medium text-dark">
                        <div className="space-y-0.5">
                          <span className="block font-serif font-bold text-sm text-primary leading-tight">
                            {order.productName}
                          </span>
                          <span className="text-[10px] text-dark/45 font-bold uppercase tracking-wider">
                            Item ID: {order.productId ? order.productId.slice(-6) : '-'}
                          </span>
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="py-4 px-6 font-extrabold text-center text-primary text-base">
                        {order.quantity}
                      </td>

                      {/* Stacked pricing, total, discount, coupons */}
                      <td className="py-4 px-6">
                        <div className="space-y-0.5">
                          <span className="block font-sans font-extrabold text-sm text-primary leading-tight">
                            {order.totalPrice !== undefined && order.totalPrice !== null ? (
                              `ZK ${order.totalPrice.toFixed(2)}`
                            ) : (
                              <span className="text-dark/40 font-normal italic">TBD</span>
                            )}
                          </span>
                          {order.couponCode && (
                            <div className="flex items-center gap-1.5 text-[9px] font-bold">
                              <span className="text-secondary font-mono uppercase bg-secondary/5 px-1 py-0.25 rounded border border-secondary/15">{order.couponCode}</span>
                              <span className="text-emerald-600">-ZK {order.discountApplied ? order.discountApplied.toFixed(2) : '0'}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-4 px-6">
                        {isUpdating ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-primary/70 font-semibold">
                            <RefreshCw size={13} className="animate-spin text-primary" />
                            Updating...
                          </span>
                        ) : (
                          <select
                            value={order.status}
                            onChange={(e) => onStatusChange(order._id, e.target.value as Order['status'])}
                            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full border focus:outline-none cursor-pointer transition-all duration-200 select-none shadow-xs ${badge.bg} ${badge.text} ${badge.border}`}
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
                      <td className="py-4 px-6 text-xs text-dark/65 whitespace-nowrap">
                        <span className="flex items-center gap-1 font-semibold text-dark/75"><Clock size={11} className="text-primary/45" /> {formatDate(order.createdAt)}</span>
                      </td>

                      {/* Notes (truncated) */}
                      <td className="py-4 px-6 text-xs text-dark/60 max-w-xs truncate" title={order.notes}>
                        {order.notes || <span className="text-dark/30 italic">No notes</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

