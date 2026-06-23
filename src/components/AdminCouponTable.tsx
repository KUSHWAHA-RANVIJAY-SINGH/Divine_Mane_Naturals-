'use client';

import React from 'react';
import { Coupon } from '../lib/api';

interface AdminCouponTableProps {
  coupons: Coupon[];
  onDelete: (id: string) => void;
}

export default function AdminCouponTable({ coupons, onDelete }: AdminCouponTableProps) {
  if (coupons.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-primary/5">
        <p className="text-dark/60 font-sans text-sm">
          No coupons found. Create one to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-primary/5 shadow-sm overflow-hidden animate-fade-in">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-primary/5 border-b border-primary/10 text-[11px] font-bold uppercase tracking-wider text-primary">
              <th className="py-4 px-6">Coupon Code</th>
              <th className="py-4 px-6">Discount Type</th>
              <th className="py-4 px-6">Discount Value</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/5 text-sm">
            {coupons.map((coupon) => (
              <tr key={coupon._id} className="hover:bg-primary/5 transition-colors duration-150">
                <td className="py-4 px-6 font-mono font-bold text-base text-primary uppercase">
                  {coupon.code}
                </td>
                <td className="py-4 px-6 capitalize font-semibold text-dark/85">
                  {coupon.discountType === 'percent' ? 'Percentage Off (%)' : 'Fixed Amount (ZK)'}
                </td>
                <td className="py-4 px-6 font-bold text-dark">
                  {coupon.discountType === 'percent' ? `${coupon.discountValue}%` : `ZK ${coupon.discountValue.toFixed(2)}`}
                </td>
                <td className="py-4 px-6">
                  <span className={`inline-block px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                    coupon.isActive ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {coupon.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <button
                    onClick={() => onDelete(coupon._id)}
                    className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 cursor-pointer"
                    title="Delete Coupon"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
