'use client';

import React from 'react';
import Image from 'next/image';
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
  if (products.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-primary/5">
        <p className="text-dark/60 font-sans text-sm">
          No products found in the catalog. Add one to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-primary/5 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-primary/5 border-b border-primary/10 text-[11px] font-bold uppercase tracking-wider text-primary">
              <th className="py-4 px-6">Image</th>
              <th className="py-4 px-6">Product Name</th>
              <th className="py-4 px-6">Category</th>
              <th className="py-4 px-6">Price (ZK)</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/5 text-sm">
            {products.map((product) => (
              <tr key={product._id} className="hover:bg-primary/5 transition-colors duration-150">
                {/* Thumbnail */}
                <td className="py-4 px-6">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-primary/10">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                </td>

                {/* Name & Tagline */}
                <td className="py-4 px-6 font-medium text-dark">
                  <div>
                    <span className="block font-serif font-bold text-base text-primary">
                      {product.name}
                    </span>
                    {product.tagline && (
                      <span className="inline-block text-[9px] font-bold text-secondary tracking-wider uppercase mt-0.5">
                        {product.tagline}
                      </span>
                    )}
                  </div>
                </td>

                {/* Category */}
                <td className="py-4 px-6">
                  <span className="inline-block px-2.5 py-1 text-[10px] font-bold bg-primary/10 text-primary rounded-full uppercase tracking-wider">
                    {product.category}
                  </span>
                </td>

                {/* Price */}
                <td className="py-4 px-6 font-semibold">
                  {product.price !== null && product.price !== undefined ? (
                    `ZK ${product.price.toFixed(2)}`
                  ) : (
                    <span className="text-dark/40 font-normal italic">Contact for price</span>
                  )}
                </td>

                {/* Action Buttons */}
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => onEdit(product)}
                      className="p-1.5 text-primary hover:text-primary-light hover:bg-primary/5 rounded-lg transition-all duration-200"
                      title="Edit Product"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(product._id)}
                      className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                      title="Delete Product"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
