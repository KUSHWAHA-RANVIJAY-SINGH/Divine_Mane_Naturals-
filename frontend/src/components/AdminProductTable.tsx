'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Search, Filter, Download, Pencil, Trash2, CheckSquare, Square } from 'lucide-react';
import { Product } from '../lib/api';

interface AdminProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export default function AdminProductTable({
  products,
  onEdit,
  onDelete,
}: AdminProductTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filter products based on search and category inputs
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.tagline && product.tagline.toLowerCase().includes(searchQuery.toLowerCase())) ||
      product.benefit.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory =
      categoryFilter === 'all' || product.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Checkbox toggle handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map(p => p._id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  // Bulk actions deletion
  const handleBulkDelete = async () => {
    if (confirm(`Are you sure you want to delete the ${selectedIds.length} selected products?`)) {
      for (const id of selectedIds) {
        try {
          await onDelete(id);
        } catch (err) {
          console.error(`Failed to delete product ${id}:`, err);
        }
      }
      setSelectedIds([]);
    }
  };

  // CSV Export utility
  const handleExportCSV = () => {
    const headers = ['Product ID', 'Name', 'Category', 'Tagline', 'Benefit', 'Price (ZK)'];
    const rows = filteredProducts.map(p => [
      p._id,
      p.name,
      p.category,
      p.tagline || '-',
      p.benefit,
      p.price !== null ? p.price.toString() : 'Contact for price'
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `products_catalog_export_${Date.now()}.csv`);
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
              placeholder="Search products by name, benefit..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-stone-50 rounded-xl border border-primary/10 focus:border-primary focus:outline-none placeholder-dark/40 text-dark"
            />
          </div>

          {/* Filter dropdown */}
          <div className="relative min-w-[160px]">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-primary/45">
              <Filter size={14} />
            </span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-stone-50 rounded-xl border border-primary/10 focus:border-primary focus:outline-none cursor-pointer font-semibold text-primary/80"
            >
              <option value="all">All Categories</option>
              <option value="Cleanse">Cleanse</option>
              <option value="Condition & Repair">Condition &amp; Repair</option>
              <option value="Moisturize">Moisturize</option>
              <option value="Growth & Finish">Growth &amp; Finish</option>
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
              {selectedIds.length} {selectedIds.length === 1 ? 'product' : 'products'} selected
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

      {/* Products Table Card */}
      <div className="bg-white rounded-3xl border border-primary/5 shadow-md overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-dark/50 font-sans text-sm">
              No products match your search or filter criteria.
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
                      {selectedIds.length === filteredProducts.length ? (
                        <CheckSquare size={17} className="text-primary" />
                      ) : (
                        <Square size={17} />
                      )}
                    </button>
                  </th>
                  <th className="py-4 px-6 w-20">Image</th>
                  <th className="py-4 px-6">Product Details</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Price (ZK)</th>
                  <th className="py-4 px-6 text-right w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5 text-sm">
                {filteredProducts.map((product) => {
                  const isChecked = selectedIds.includes(product._id);
                  return (
                    <tr 
                      key={product._id} 
                      className={`hover:bg-stone-50/50 transition-colors duration-150 ${isChecked ? 'bg-primary/2' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="py-4 px-6 text-center select-none">
                        <button
                          onClick={() => handleToggleSelectRow(product._id)}
                          className="text-primary/65 hover:text-primary cursor-pointer transition-colors focus:outline-none"
                        >
                          {isChecked ? (
                            <CheckSquare size={17} className="text-primary" />
                          ) : (
                            <Square size={17} />
                          )}
                        </button>
                      </td>

                      {/* Thumbnail */}
                      <td className="py-4 px-6">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-primary/10 bg-stone-50 flex items-center justify-center">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full text-primary/30 text-[9px] font-bold text-center leading-none uppercase select-none">
                              Pending
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Name & Sub-details */}
                      <td className="py-4 px-6 font-medium text-dark max-w-sm">
                        <div className="space-y-0.5">
                          <span className="block font-serif font-extrabold text-base text-primary">
                            {product.name}
                          </span>
                          {product.tagline && (
                            <span className="inline-block text-[9px] font-extrabold text-secondary tracking-wider uppercase">
                              {product.tagline}
                            </span>
                          )}
                          <p className="text-[11px] text-dark/50 font-normal line-clamp-1 leading-relaxed">
                            {product.benefit}
                          </p>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="py-4 px-6">
                        <span className="inline-block px-2.5 py-1 text-[9px] font-extrabold bg-primary/5 text-primary rounded-full uppercase tracking-wider border border-primary/10">
                          {product.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-6 font-bold text-primary">
                        {product.price !== null && product.price !== undefined ? (
                          `ZK ${product.price.toFixed(2)}`
                        ) : (
                          <span className="text-dark/45 font-semibold italic text-xs">Contact for price</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            onClick={() => onEdit(product)}
                            className="p-2 text-primary hover:text-primary-light hover:bg-primary/5 rounded-xl transition-all duration-200 cursor-pointer shadow-xs border border-primary/10 bg-white"
                            title="Edit Product"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => onDelete(product._id)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 cursor-pointer shadow-xs border border-red-200/55 bg-white"
                            title="Delete Product"
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
