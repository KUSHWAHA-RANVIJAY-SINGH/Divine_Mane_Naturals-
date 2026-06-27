'use client';

import React, { useState } from 'react';
import { Search, Filter, Download, Trash2, CheckSquare, Square, Tag } from 'lucide-react';
import { Coupon } from '../lib/api';

interface AdminCouponTableProps {
  coupons: Coupon[];
  onDelete: (id: string) => void;
}

export default function AdminCouponTable({ coupons, onDelete }: AdminCouponTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, inactive
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filter coupons based on search and status inputs
  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && coupon.isActive) ||
      (statusFilter === 'inactive' && !coupon.isActive);

    return matchesSearch && matchesStatus;
  });

  // Toggle selection handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredCoupons.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCoupons.map(c => c._id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  // Bulk actions deletion
  const handleBulkDelete = async () => {
    if (confirm(`Are you sure you want to delete the ${selectedIds.length} selected coupons?`)) {
      for (const id of selectedIds) {
        try {
          await onDelete(id);
        } catch (err) {
          console.error(`Failed to delete coupon ${id}:`, err);
        }
      }
      setSelectedIds([]);
    }
  };

  // CSV Export utility
  const handleExportCSV = () => {
    const headers = ['Coupon ID', 'Coupon Code', 'Discount Type', 'Discount Value', 'Status'];
    const rows = filteredCoupons.map(c => [
      c._id,
      c.code,
      c.discountType,
      c.discountValue.toString(),
      c.isActive ? 'Active' : 'Inactive'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `coupons_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Search/Filter/Export Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-white p-4 rounded-2xl border border-primary/5 shadow-xs">
        {/* Left Side: Search & Filter inputs */}
        <div className="flex flex-col sm:flex-row gap-3 flex-grow max-w-2xl">
          {/* Search bar */}
          <div className="relative flex-grow">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-primary/45">
              <Search size={16} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search coupons by code..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-stone-50 rounded-xl border border-primary/10 focus:border-primary focus:outline-none placeholder-dark/40 text-dark font-mono uppercase font-bold"
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
              <option value="all">All Coupons</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
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

      {/* Bulk Action Indicator Banner */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between bg-primary/5 border border-primary/15 p-4 rounded-xl animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary">
              {selectedIds.length} {selectedIds.length === 1 ? 'coupon' : 'coupons'} selected
            </span>
          </div>
          <button
            onClick={handleBulkDelete}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow transition-all duration-200"
          >
            <Trash2 size={13} />
            Delete Selected
          </button>
        </div>
      )}

      {/* Coupons Table Card */}
      <div className="bg-white rounded-3xl border border-primary/5 shadow-md overflow-hidden">
        {filteredCoupons.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-dark/50 font-sans text-sm">
              No coupons found matching your search.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50/80 border-b border-primary/5 text-[10px] font-bold uppercase tracking-wider text-primary">
                  {/* Bulk Select Checkbox Column */}
                  <th className="py-4 px-6 w-12 text-center">
                    <button
                      onClick={handleToggleSelectAll}
                      className="text-primary/75 hover:text-primary cursor-pointer transition-colors focus:outline-none"
                    >
                      {selectedIds.length === filteredCoupons.length ? (
                        <CheckSquare size={17} className="text-primary" />
                      ) : (
                        <Square size={17} />
                      )}
                    </button>
                  </th>
                  <th className="py-4 px-6">Coupon Code</th>
                  <th className="py-4 px-6">Discount Type</th>
                  <th className="py-4 px-6">Discount Value</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5 text-sm">
                {filteredCoupons.map((coupon) => {
                  const isChecked = selectedIds.includes(coupon._id);
                  return (
                    <tr 
                      key={coupon._id} 
                      className={`hover:bg-stone-50/50 transition-colors duration-150 ${isChecked ? 'bg-primary/2' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="py-4 px-6 text-center select-none">
                        <button
                          onClick={() => handleToggleSelectRow(coupon._id)}
                          className="text-primary/65 hover:text-primary cursor-pointer transition-colors focus:outline-none"
                        >
                          {isChecked ? (
                            <CheckSquare size={17} className="text-primary" />
                          ) : (
                            <Square size={17} />
                          )}
                        </button>
                      </td>

                      {/* Coupon Code */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-primary/5 text-primary rounded-lg border border-primary/10">
                            <Tag size={14} />
                          </div>
                          <span className="font-mono font-extrabold text-base text-primary uppercase tracking-wide">
                            {coupon.code}
                          </span>
                        </div>
                      </td>

                      {/* Discount Type */}
                      <td className="py-4 px-6 capitalize font-semibold text-dark/75">
                        {coupon.discountType === 'percent' ? 'Percentage Off (%)' : 'Fixed Amount (ZK)'}
                      </td>

                      {/* Discount Value */}
                      <td className="py-4 px-6 font-extrabold text-primary">
                        {coupon.discountType === 'percent' ? (
                          `${coupon.discountValue}%`
                        ) : (
                          `ZK ${coupon.discountValue.toFixed(2)}`
                        )}
                      </td>

                      {/* Status badge */}
                      <td className="py-4 px-6">
                        <span className={`inline-block px-2.5 py-1 text-[9px] font-extrabold rounded-full uppercase tracking-wider ${
                          coupon.isActive 
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                            : 'bg-red-50 text-red-800 border border-red-200'
                        }`}>
                          {coupon.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            onClick={() => onDelete(coupon._id)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 cursor-pointer shadow-xs border border-red-200/55 bg-white"
                            title="Delete Coupon"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
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

