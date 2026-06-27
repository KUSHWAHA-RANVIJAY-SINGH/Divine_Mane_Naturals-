'use client';

import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { getAnalytics, AnalyticsData } from '../lib/api';

interface AdminAnalyticsTabProps {
  token: string;
}

const STATUS_COLORS: { [key: string]: string } = {
  pending: '#d97706',   // Amber
  contacted: '#2563eb', // Blue
  confirmed: '#4f46e5', // Indigo
  fulfilled: '#059669', // Emerald
  cancelled: '#dc2626', // Red
};

// Custom Tooltip component for Recharts
const CustomTooltip = ({ active, payload, label, formatter }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md px-3.5 py-2.5 border border-primary/10 rounded-xl shadow-lg leading-none animate-fade-in select-none">
        <p className="text-[9px] font-extrabold text-secondary uppercase tracking-widest mb-2 border-b border-primary/5 pb-1">
          {label}
        </p>
        {payload.map((item: any, index: number) => (
          <p key={index} className="text-xs font-extrabold text-primary flex justify-between items-center gap-4">
            <span className="font-medium text-dark/70">{item.name}:</span>
            <span className="font-mono text-primary font-bold">
              {formatter ? formatter(item.value) : item.value}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminAnalyticsTab({ token }: AdminAnalyticsTabProps) {
  const [range, setRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchAnalyticsData = async (selectedRange: typeof range) => {
    setLoading(true);
    setError('');
    try {
      const analytics = await getAnalytics(token, selectedRange);
      setData(analytics);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAnalyticsData(range);
    }
  }, [token, range]);

  if (!mounted) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-primary/5 shadow-sm">
        <svg className="animate-spin h-8 w-8 text-primary mx-auto mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-sm font-semibold text-primary uppercase tracking-wider">Initializing analytics panel...</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Controls Skeleton */}
        <div className="h-14 bg-primary/5 rounded-2xl w-full border border-primary/5"></div>
        {/* Charts Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-80 bg-primary/5 rounded-3xl border border-primary/5"></div>
          <div className="h-80 bg-primary/5 rounded-3xl border border-primary/5"></div>
          <div className="h-80 bg-primary/5 rounded-3xl border border-primary/5"></div>
          <div className="h-80 bg-primary/5 rounded-3xl border border-primary/5"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 bg-red-50 border border-red-200 text-red-800 text-sm font-semibold rounded-2xl text-center shadow-xs">
        <span>⚠️ {error}</span>
        <button
          onClick={() => fetchAnalyticsData(range)}
          className="ml-4 underline text-xs font-bold hover:text-red-950 block sm:inline-block mt-2 sm:mt-0 cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  const hasOrders = data && (data.orderTrend.length > 0 || data.revenueOverTime.length > 0);

  if (!hasOrders || !data) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-primary/5 shadow-sm">
          <label htmlFor="range-select" className="text-xs font-bold uppercase tracking-wider text-dark/70">
            Analytics Period:
          </label>
          <select
            id="range-select"
            value={range}
            onChange={(e) => setRange(e.target.value as any)}
            className="px-4 py-2 text-sm bg-stone-50 rounded-xl border border-primary/10 focus:border-primary focus:outline-none cursor-pointer font-semibold text-primary"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
        <div className="text-center py-20 bg-white rounded-3xl border border-primary/5">
          <svg className="w-12 h-12 text-primary/15 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
          </svg>
          <p className="text-dark/65 font-sans font-medium text-sm">
            No orders found matching the selected range ({range === 'all' ? 'All time' : `Last ${range.slice(0, -1)} days`}).
          </p>
        </div>
      </div>
    );
  }

  // Pre-process pie chart data
  const pieData = data.ordersByStatus.map((item) => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    value: item.count,
    color: STATUS_COLORS[item.status] || '#6b7280',
  }));

  const totalOrdersCount = data.ordersByStatus.reduce((sum, item) => sum + item.count, 0);

  // Format currency helper
  const formatZK = (val: number) => `ZK ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Selector Control Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-primary/5 shadow-sm">
        <div>
          <h2 className="font-serif font-extrabold text-lg text-primary">Sales &amp; Business Metrics</h2>
          <p className="text-xs text-dark/50 mt-0.5">Overview of business performance and transaction timeline analysis</p>
        </div>
        <div>
          <select
            id="range-select"
            value={range}
            onChange={(e) => setRange(e.target.value as any)}
            className="px-4 py-2 text-sm bg-stone-50 rounded-xl border border-primary/10 focus:border-primary focus:outline-none cursor-pointer font-semibold text-primary"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Row 1: Smooth Area Charts with Gradients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Sales Revenue Chart */}
        <div className="bg-white p-6 rounded-3xl border border-primary/5 shadow-md flex flex-col">
          <div className="mb-4">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block mb-0.5">Earnings</span>
            <h3 className="font-serif font-extrabold text-lg text-primary">Daily Sales Revenue</h3>
          </div>
          <div className="h-72 w-full flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueOverTime} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1b4d3e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#1b4d3e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'semibold' }} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'semibold' }} tickLine={false} width={80} />
                <Tooltip content={<CustomTooltip formatter={formatZK} />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1b4d3e"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  activeDot={{ r: 6 }}
                  dot={{ r: 3, fill: '#c5a059', stroke: '#ffffff', strokeWidth: 1.5 }}
                  name="Revenue"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Order Volume Trend Chart */}
        <div className="bg-white p-6 rounded-3xl border border-primary/5 shadow-md flex flex-col">
          <div className="mb-4">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block mb-0.5">Volume</span>
            <h3 className="font-serif font-extrabold text-lg text-primary">Daily Order Trend</h3>
          </div>
          <div className="h-72 w-full flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.orderTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c5a059" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#c5a059" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'semibold' }} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'semibold' }} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="orderCount"
                  stroke="#c5a059"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorOrders)"
                  activeDot={{ r: 6 }}
                  dot={{ r: 3, fill: '#1b4d3e', stroke: '#ffffff', strokeWidth: 1.5 }}
                  name="Orders"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Distribution & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Distribution Donut Chart with Centered Overlay */}
        <div className="bg-white p-6 rounded-3xl border border-primary/5 shadow-md flex flex-col">
          <div className="mb-4">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-0.5">Fulfillment</span>
            <h3 className="font-serif font-extrabold text-lg text-primary">Orders by Status</h3>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 flex-grow">
            {/* The Donut Wrapper with absolute centered overlay */}
            <div className="relative w-52 h-52 flex-shrink-0 flex items-center justify-center">
              <div className="absolute flex flex-col items-center justify-center pointer-events-none select-none">
                <span className="text-[9px] font-extrabold text-dark/45 uppercase tracking-widest leading-none">Total Orders</span>
                <span className="text-3xl font-serif font-black text-primary mt-1">
                  {totalOrdersCount}
                </span>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={64}
                    outerRadius={80}
                    paddingAngle={3.5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Structured custom legend */}
            <div className="flex-grow w-full grid grid-cols-2 sm:grid-cols-1 gap-2.5">
              {pieData.map((entry, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-stone-50 rounded-xl border border-primary/5 transition-all duration-200 hover:scale-102">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                  <div className="min-w-0">
                    <span className="block text-[9px] font-extrabold uppercase tracking-widest text-dark/65 truncate">{entry.name}</span>
                    <span className="block font-bold text-xs text-primary">{entry.value} {entry.value === 1 ? 'order' : 'orders'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white p-6 rounded-3xl border border-primary/5 shadow-md flex flex-col">
          <div className="mb-4">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-0.5">Popularity</span>
            <h3 className="font-serif font-extrabold text-lg text-primary">Top Products by Revenue</h3>
          </div>
          <div className="h-64 w-full flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.topProducts}
                layout="vertical"
                margin={{ top: 10, right: 10, left: 20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'semibold' }} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="productName"
                  tick={{ fontSize: 9, fill: '#1b4d3e', fontWeight: 'bold' }}
                  tickLine={false}
                  width={110}
                />
                <Tooltip
                  content={
                    <CustomTooltip
                      formatter={(val: any) => formatZK(Number(val))}
                    />
                  }
                />
                <Bar dataKey="revenue" fill="#1b4d3e" radius={[0, 6, 6, 0]}>
                  {data.topProducts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#1b4d3e' : '#c5a059'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Coupon usage statistics */}
      <div className="bg-white p-6 rounded-3xl border border-primary/5 shadow-md">
        <div className="mb-6">
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-0.5">Promo Campaigns</span>
          <h3 className="font-serif font-extrabold text-lg text-primary">Coupon Performance Statistics</h3>
        </div>

        {data.couponUsage.length === 0 ? (
          <div className="text-center py-10 bg-stone-50 rounded-2xl border border-dashed border-primary/10">
            <p className="text-xs text-dark/50">No coupons applied within the selected timeframe.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-primary/5 text-[10px] font-bold uppercase tracking-wider text-primary">
                  <th className="py-3.5 px-5">Coupon Code</th>
                  <th className="py-3.5 px-5 text-center">Times Used</th>
                  <th className="py-3.5 px-5 text-right">Total Discount Given</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5 text-xs">
                {data.couponUsage.map((c, idx) => (
                  <tr key={idx} className="hover:bg-stone-50/50 transition-colors duration-150">
                    <td className="py-3.5 px-5 font-mono font-bold uppercase text-secondary text-sm">
                      {c.code}
                    </td>
                    <td className="py-3.5 px-5 text-center font-bold text-dark/85">
                      {c.timesUsed}
                    </td>
                    <td className="py-3.5 px-5 text-right font-extrabold text-primary">
                      {formatZK(c.totalDiscountGiven)}
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
