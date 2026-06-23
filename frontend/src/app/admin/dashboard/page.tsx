'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Product,
  ProductInput,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  Order,
  getOrders,
  updateOrderStatus,
  Coupon,
  CouponInput,
  getCoupons,
  createCoupon,
  deleteCoupon,
} from '../../../lib/api';
import AdminProductTable from '../../../components/AdminProductTable';
import AdminProductForm from '../../../components/AdminProductForm';
import AdminOrderTable from '../../../components/AdminOrderTable';
import AdminCouponTable from '../../../components/AdminCouponTable';
import AdminCouponForm from '../../../components/AdminCouponForm';

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'coupons'>('products');
  
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [couponsLoading, setCouponsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  
  const [token, setToken] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCouponFormOpen, setIsCouponFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const router = useRouter();

  // Authentication check on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('adminToken');
    const savedEmail = localStorage.getItem('adminEmail');

    if (!savedToken) {
      router.push('/admin/login');
      return;
    }

    setToken(savedToken);
    setAdminEmail(savedEmail);
    fetchProducts();
    fetchOrders(savedToken);
    fetchCoupons(savedToken);
  }, [router]);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message || 'Failed to fetch products.');
      } else {
        setError('Failed to fetch products.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async (authToken: string) => {
    setOrdersLoading(true);
    setError('');
    try {
      const data = await getOrders(authToken);
      setOrders(data);
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message || 'Failed to fetch orders.');
        const errMsg = err.message.toLowerCase();
        if (errMsg.includes('invalid') || errMsg.includes('expired') || errMsg.includes('token') || errMsg.includes('denied')) {
          handleLogout();
        }
      } else {
        setError('Failed to fetch orders.');
      }
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchCoupons = async (authToken: string) => {
    setCouponsLoading(true);
    setError('');
    try {
      const data = await getCoupons(authToken);
      setCoupons(data);
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message || 'Failed to fetch coupons.');
        const errMsg = err.message.toLowerCase();
        if (errMsg.includes('invalid') || errMsg.includes('expired') || errMsg.includes('token') || errMsg.includes('denied')) {
          handleLogout();
        }
      } else {
        setError('Failed to fetch coupons.');
      }
    } finally {
      setCouponsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    router.push('/admin/login');
  };

  const handleFormSubmit = async (formData: ProductInput) => {
    if (!token) return;
    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      if (editingProduct) {
        // Edit mode
        const updated = await updateProduct(token, editingProduct._id, formData);
        setProducts((prev) =>
          prev.map((p) => (p._id === editingProduct._id ? updated : p))
        );
        setSuccess(`Product "${formData.name}" updated successfully.`);
      } else {
        // Create mode
        const created = await createProduct(token, formData);
        setProducts((prev) => [...prev, created]);
        setSuccess(`Product "${formData.name}" created successfully.`);
      }
      setIsFormOpen(false);
      setEditingProduct(null);
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message || 'Failed to save product.');
      } else {
        setError('Failed to save product.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleCouponFormSubmit = async (formData: CouponInput) => {
    if (!token) return;
    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const created = await createCoupon(token, formData);
      setCoupons((prev) => [created, ...prev]);
      setSuccess(`Coupon code "${formData.code}" created successfully.`);
      setIsCouponFormOpen(false);
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message || 'Failed to create coupon.');
      } else {
        setError('Failed to create coupon.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (!token) return;
    if (!confirm('Are you sure you want to delete this product?')) return;

    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      await deleteProduct(token, id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      setSuccess('Product deleted successfully.');
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message || 'Failed to delete product.');
      } else {
        setError('Failed to delete product.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleCouponDeleteClick = async (id: string) => {
    if (!token) return;
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      await deleteCoupon(token, id);
      setCoupons((prev) => prev.filter((c) => c._id !== id));
      setSuccess('Coupon deleted successfully.');
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message || 'Failed to delete coupon.');
      } else {
        setError('Failed to delete coupon.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleOrderStatusChange = async (id: string, newStatus: Order['status']) => {
    if (!token) return;
    setUpdatingStatusId(id);
    setError('');
    setSuccess('');
    try {
      const updated = await updateOrderStatus(token, id, newStatus);
      
      // Update local state and sort pending first, keeping newest first
      setOrders((prev) => {
        const updatedList = prev.map((o) => (o._id === id ? updated : o));
        return [...updatedList].sort((a, b) => {
          if (a.status === 'pending' && b.status !== 'pending') return -1;
          if (a.status !== 'pending' && b.status === 'pending') return 1;
          return 0;
        });
      });

      setSuccess(`Order status updated to "${newStatus}" successfully.`);
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message || 'Failed to update order status.');
      } else {
        setError('Failed to update order status.');
      }
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleAddNewClick = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleCancelForm = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-primary/5 pb-6">
        <div>
          <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.25em] block mb-1">
            Authenticated session
          </span>
          <h1 className="text-3xl font-serif font-bold text-primary">
            Dashboard
          </h1>
          {adminEmail && (
            <p className="text-xs text-dark/60 mt-1">
              Logged in as: <span className="font-semibold text-primary">{adminEmail}</span>
            </p>
          )}
        </div>

        <div className="flex gap-4">
          {activeTab === 'products' && (
            <button
              onClick={handleAddNewClick}
              className="px-5 py-2.5 bg-primary text-white text-sm font-serif font-bold rounded-xl hover:bg-primary-light transition-all duration-200 shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add New Product
            </button>
          )}
          {activeTab === 'orders' && (
            <button
              onClick={() => token && fetchOrders(token)}
              className="px-5 py-2.5 bg-primary text-white text-sm font-serif font-bold rounded-xl hover:bg-primary-light transition-all duration-200 shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" />
              </svg>
              Refresh Orders
            </button>
          )}
          {activeTab === 'coupons' && (
            <button
              onClick={() => setIsCouponFormOpen(true)}
              className="px-5 py-2.5 bg-primary text-white text-sm font-serif font-bold rounded-xl hover:bg-primary-light transition-all duration-200 shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add New Coupon
            </button>
          )}
          <button
            onClick={handleLogout}
            className="px-5 py-2.5 border border-red-200 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-50 transition-all duration-200 flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-4 border-b border-primary/10 mb-8">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-4 px-4 text-sm font-semibold tracking-wide border-b-2 transition-all duration-200 cursor-pointer ${
            activeTab === 'products'
              ? 'border-secondary text-primary font-bold'
              : 'border-transparent text-dark/60 hover:text-primary'
          }`}
        >
          Products ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-4 px-4 text-sm font-semibold tracking-wide border-b-2 transition-all duration-200 cursor-pointer ${
            activeTab === 'orders'
              ? 'border-secondary text-primary font-bold'
              : 'border-transparent text-dark/60 hover:text-primary'
          }`}
        >
          Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('coupons')}
          className={`pb-4 px-4 text-sm font-semibold tracking-wide border-b-2 transition-all duration-200 cursor-pointer ${
            activeTab === 'coupons'
              ? 'border-secondary text-primary font-bold'
              : 'border-transparent text-dark/60 hover:text-primary'
          }`}
        >
          Coupons ({coupons.length})
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 text-sm font-semibold rounded-xl animate-fade-in">
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold rounded-xl animate-fade-in">
          ✅ {success}
        </div>
      )}

      {/* Main Grid: Form Modals & Tables */}
      {activeTab === 'products' && isFormOpen && (
        <div className="mb-10 bg-white p-6 sm:p-8 rounded-3xl border border-primary/5 shadow-md animate-slide-down">
          <AdminProductForm
            initialData={editingProduct}
            onSubmit={handleFormSubmit}
            onCancel={handleCancelForm}
            loading={actionLoading}
          />
        </div>
      )}

      {activeTab === 'coupons' && isCouponFormOpen && (
        <div className="mb-10 bg-white p-6 sm:p-8 rounded-3xl border border-primary/5 shadow-md animate-slide-down">
          <AdminCouponForm
            onSubmit={handleCouponFormSubmit}
            onCancel={() => setIsCouponFormOpen(false)}
            loading={actionLoading}
          />
        </div>
      )}

      {activeTab === 'products' ? (
        loading ? (
          <div className="text-center py-20">
            <svg className="animate-spin h-8 w-8 text-primary mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Loading catalog products...</span>
          </div>
        ) : (
          <AdminProductTable
            products={products}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />
        )
      ) : activeTab === 'orders' ? (
        ordersLoading ? (
          <div className="text-center py-20">
            <svg className="animate-spin h-8 w-8 text-primary mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Loading orders...</span>
          </div>
        ) : (
          <AdminOrderTable
            orders={orders}
            onStatusChange={handleOrderStatusChange}
            updatingId={updatingStatusId}
          />
        )
      ) : couponsLoading ? (
        <div className="text-center py-20">
          <svg className="animate-spin h-8 w-8 text-primary mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Loading coupons...</span>
        </div>
      ) : (
        <AdminCouponTable
          coupons={coupons}
          onDelete={handleCouponDeleteClick}
        />
      )}
    </div>
  );
}
