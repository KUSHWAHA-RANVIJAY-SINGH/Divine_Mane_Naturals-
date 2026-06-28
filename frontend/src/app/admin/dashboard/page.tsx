'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Package,
  ShoppingBag,
  Tag,
  BarChart3,
  LogOut,
  Plus,
  RefreshCw,
  User,
  LayoutDashboard
} from 'lucide-react';
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
import AdminAnalyticsTab from '../../../components/AdminAnalyticsTab';

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'coupons' | 'analytics'>('analytics');
  
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [couponsLoading, setCouponsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  
  const [token, setToken] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  // Sidebar collapse and mobile open states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCouponFormOpen, setIsCouponFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const router = useRouter();

  // Authentication check and load data on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('adminToken');
    const savedEmail = localStorage.getItem('adminEmail');

    if (!savedToken) {
      router.push('/admin/login');
      return;
    }

    setToken(savedToken);
    setAdminEmail(savedEmail);

    const loadDashboardData = async () => {
      setLoading(true);
      setOrdersLoading(true);
      setCouponsLoading(true);
      setError('');

      try {
        // Load products
        const productsData = await getProducts();
        setProducts(productsData);
        setLoading(false);

        // Load orders
        const ordersData = await getOrders(savedToken);
        setOrders(ordersData);
        setOrdersLoading(false);

        // Load coupons
        const couponsData = await getCoupons(savedToken);
        setCoupons(couponsData);
        setCouponsLoading(false);
      } catch (err: any) {
        console.warn('Dashboard initialization warning:', err.message || err);
        const errMsg = (err.message || '').toLowerCase();
        if (errMsg.includes('invalid') || errMsg.includes('expired') || errMsg.includes('token') || errMsg.includes('denied')) {
          // Clear localStorage and redirect to login page immediately
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminEmail');
          router.push('/admin/login');
        } else {
          setError(err.message || 'Failed to load dashboard data.');
        }
        setLoading(false);
        setOrdersLoading(false);
        setCouponsLoading(false);
      }
    };

    loadDashboardData();
  }, [router]);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err: any) {
      console.warn('Failed to fetch products:', err.message || err);
      setError(err.message || 'Failed to fetch products.');
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
    } catch (err: any) {
      console.warn('Failed to fetch orders:', err.message || err);
      setError(err.message || 'Failed to fetch orders.');
      const errMsg = (err.message || '').toLowerCase();
      if (errMsg.includes('invalid') || errMsg.includes('expired') || errMsg.includes('token') || errMsg.includes('denied')) {
        handleLogout();
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
    } catch (err: any) {
      console.warn('Failed to fetch coupons:', err.message || err);
      setError(err.message || 'Failed to fetch coupons.');
      const errMsg = (err.message || '').toLowerCase();
      if (errMsg.includes('invalid') || errMsg.includes('expired') || errMsg.includes('token') || errMsg.includes('denied')) {
        handleLogout();
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

  const handleFormSubmit = async (formData: ProductInput, imageFile: File | null) => {
    if (!token) return;
    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      if (editingProduct) {
        // Edit mode
        const updated = await updateProduct(token, editingProduct._id, formData, imageFile);
        setProducts((prev) =>
          prev.map((p) => (p._id === editingProduct._id ? updated : p))
        );
        setSuccess(`Product "${formData.name}" updated successfully.`);
      } else {
        // Create mode
        const created = await createProduct(token, formData, imageFile);
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

  // Nav Items definition for Sidebar
  const navigationItems = [
    { id: 'analytics', name: 'Sales Analytics', icon: BarChart3, count: null },
    { id: 'products', name: 'Products Catalog', icon: Package, count: products.length },
    { id: 'orders', name: 'Customer Orders', icon: ShoppingBag, count: orders.length },
    { id: 'coupons', name: 'Promotion Coupons', icon: Tag, count: coupons.length },
  ] as const;

  // Active section metadata helper
  const getActiveTabTitle = () => {
    switch (activeTab) {
      case 'products': return 'Products Catalog';
      case 'orders': return 'Customer Orders';
      case 'coupons': return 'Promotion Coupons';
      case 'analytics': return 'Sales Analytics';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="min-h-screen flex bg-stone-50 font-sans text-dark relative">
      {/* 1. SIDEBAR (Collapsible Desktop / Popover Drawer Mobile) */}
      <aside
        className={`fixed md:sticky top-0 h-screen bg-white border-r border-primary/5 shadow-sm transition-all duration-300 ease-in-out z-40 flex flex-col justify-between ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } ${
          mobileSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top: Branding Logo Block */}
        <div>
          <div className="h-20 flex items-center justify-between px-6 border-b border-primary/5 relative">
            <div className="flex items-center gap-3 overflow-hidden select-none">
              <div className="w-10 h-10 flex-shrink-0 relative">
                <Image
                  src="/logo_icon.png"
                  alt="Divine Mane Naturals Logo"
                  fill
                  sizes="40px"
                  className="object-contain"
                  priority
                />
              </div>
              <div className={`transition-opacity duration-300 ${sidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
                <h2 className="font-serif font-extrabold text-sm tracking-wide text-primary leading-tight uppercase whitespace-nowrap">
                  Divine Mane
                </h2>
                <span className="text-[9px] font-bold tracking-widest text-secondary uppercase block mt-0.5">
                  Naturals Admin
                </span>
              </div>
            </div>

            {/* Collapse Icon Button (Desktop Only) */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6.5 h-6.5 rounded-full border border-primary/10 bg-white items-center justify-center text-primary/65 hover:text-primary shadow-sm hover:shadow hover:scale-105 cursor-pointer transition-all duration-200 z-50"
            >
              {sidebarCollapsed ? <ChevronRight size={13} strokeWidth={2.5} /> : <ChevronLeft size={13} strokeWidth={2.5} />}
            </button>
            
            {/* Close Button (Mobile Only) */}
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden text-primary/75 hover:text-primary p-1 rounded-lg hover:bg-primary/5 cursor-pointer transition-colors duration-200"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links List */}
          <nav className="p-4 space-y-1">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isSelected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer select-none group text-left ${
                    isSelected
                      ? 'bg-primary text-white font-bold shadow-md shadow-primary/15'
                      : 'text-dark/65 hover:text-primary hover:bg-primary/5 font-semibold'
                  }`}
                >
                  <IconComponent
                    size={20}
                    className={`transition-colors duration-200 ${
                      isSelected ? 'text-white' : 'text-primary/70 group-hover:text-primary'
                    }`}
                  />
                  <div className={`flex justify-between items-center flex-grow transition-opacity duration-300 ${
                    sidebarCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'
                  }`}>
                    <span className="text-sm tracking-wide">{item.name}</span>
                    {item.count !== null && (
                      <span className={`text-[10px] px-2 py-0.5 font-bold rounded-full ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-primary/5 text-primary'
                      }`}>
                        {item.count}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Profile & Logout Foot */}
        <div className="p-4 border-t border-primary/5 bg-white">
          <div className={`flex items-center gap-3 p-2 rounded-xl mb-3 overflow-hidden ${
            sidebarCollapsed ? 'justify-center' : ''
          }`}>
            <div className="w-10 h-10 rounded-full bg-secondary/15 flex items-center justify-center text-secondary font-bold flex-shrink-0">
              <User size={18} />
            </div>
            <div className={`min-w-0 transition-opacity duration-300 ${sidebarCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
              <span className="block text-xs font-bold text-primary tracking-wide leading-tight truncate">Administrator</span>
              <span className="block text-[10px] text-dark/50 truncate mt-0.5" title={adminEmail || ''}>
                {adminEmail}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl border border-red-200/50 hover:bg-red-50 text-red-600 hover:text-red-700 transition-all duration-200 font-bold select-none cursor-pointer ${
              sidebarCollapsed ? 'justify-center px-0' : ''
            }`}
            title="Log Out"
          >
            <LogOut size={18} />
            <span className={`text-sm tracking-wide transition-opacity duration-300 ${
              sidebarCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'
            }`}>
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Overlay Backdrop */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 md:hidden animate-fade-in"
        />
      )}

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-grow min-h-screen flex flex-col transition-all duration-300 relative overflow-y-auto">
        {/* Dashboard Top Header Bar */}
        <header className="h-20 bg-white border-b border-primary/5 flex items-center justify-between px-6 sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-3.5">
            {/* Hamburger Button for Mobile */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 text-primary/75 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors cursor-pointer"
            >
              <Menu size={22} />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-serif font-extrabold text-primary leading-tight">
                {getActiveTabTitle()}
              </h1>
              <p className="hidden sm:block text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mt-0.5">
                Divine Mane Naturals Control Board
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            {activeTab === 'products' && (
              <button
                onClick={handleAddNewClick}
                className="px-4 py-2 bg-primary hover:bg-primary-light text-white text-xs font-serif font-bold rounded-xl transition-all duration-200 shadow-sm hover:shadow flex items-center gap-1.5 cursor-pointer scale-95 sm:scale-100"
              >
                <Plus size={15} strokeWidth={2.5} />
                Add Product
              </button>
            )}
            {activeTab === 'orders' && (
              <button
                onClick={() => token && fetchOrders(token)}
                className="px-4 py-2 bg-primary hover:bg-primary-light text-white text-xs font-serif font-bold rounded-xl transition-all duration-200 shadow-sm hover:shadow flex items-center gap-1.5 cursor-pointer scale-95 sm:scale-100"
              >
                <RefreshCw size={14} className={ordersLoading ? 'animate-spin' : ''} />
                Refresh List
              </button>
            )}
            {activeTab === 'coupons' && (
              <button
                onClick={() => setIsCouponFormOpen(true)}
                className="px-4 py-2 bg-primary hover:bg-primary-light text-white text-xs font-serif font-bold rounded-xl transition-all duration-200 shadow-sm hover:shadow flex items-center gap-1.5 cursor-pointer scale-95 sm:scale-100"
              >
                <Plus size={15} strokeWidth={2.5} />
                Add Coupon
              </button>
            )}
          </div>
        </header>

        {/* Inner Content Grid */}
        <div className="p-6 md:p-10 space-y-8 flex-grow">
          {/* Notifications Alerts */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-sm font-semibold rounded-2xl shadow-xs flex items-center gap-2 animate-fade-in">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold rounded-2xl shadow-xs flex items-center gap-2 animate-fade-in">
              <span>✅</span>
              <span>{success}</span>
            </div>
          )}

          {/* Form Expansion Section (Product Add/Edit, Coupon Add) */}
          {activeTab === 'products' && isFormOpen && !editingProduct && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-primary/5 shadow-md animate-slide-down">
              <AdminProductForm
                initialData={null}
                onSubmit={handleFormSubmit}
                onCancel={handleCancelForm}
                loading={actionLoading}
              />
            </div>
          )}

          {activeTab === 'coupons' && isCouponFormOpen && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-primary/5 shadow-md animate-slide-down">
              <AdminCouponForm
                onSubmit={handleCouponFormSubmit}
                onCancel={() => setIsCouponFormOpen(false)}
                loading={actionLoading}
              />
            </div>
          )}

          {/* Tables and Render Containers */}
          <div className="relative">
            {activeTab === 'products' ? (
              loading ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-primary/5 shadow-sm">
                  <svg className="animate-spin h-8 w-8 text-primary mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-sm font-semibold text-primary uppercase tracking-wider">Syncing Products Catalog...</span>
                </div>
              ) : (
                <AdminProductTable
                  products={products}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  editingProduct={editingProduct}
                  isFormOpen={isFormOpen}
                  onSubmitForm={handleFormSubmit}
                  onCancelForm={handleCancelForm}
                  actionLoading={actionLoading}
                />
              )
            ) : activeTab === 'orders' ? (
              ordersLoading ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-primary/5 shadow-sm">
                  <svg className="animate-spin h-8 w-8 text-primary mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-sm font-semibold text-primary uppercase tracking-wider">Loading Orders Registry...</span>
                </div>
              ) : (
                <AdminOrderTable
                  orders={orders}
                  onStatusChange={handleOrderStatusChange}
                  updatingId={updatingStatusId}
                />
              )
            ) : activeTab === 'coupons' ? (
              couponsLoading ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-primary/5 shadow-sm">
                  <svg className="animate-spin h-8 w-8 text-primary mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-sm font-semibold text-primary uppercase tracking-wider">Loading Coupon Lists...</span>
                </div>
              ) : (
                <AdminCouponTable
                  coupons={coupons}
                  onDelete={handleCouponDeleteClick}
                />
              )
            ) : (
              token && <AdminAnalyticsTab token={token} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
