import { siteConfig } from '../data/siteConfig';

export interface Product {
  _id: string;
  name: string;
  category: 'Cleanse' | 'Condition & Repair' | 'Moisturize' | 'Growth & Finish';
  tagline?: string;
  benefit: string;
  price: number | null;
  image: string;
  imagePublicId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductInput {
  name: string;
  category: 'Cleanse' | 'Condition & Repair' | 'Moisturize' | 'Growth & Finish';
  tagline?: string;
  benefit: string;
  price: number | null;
  image: string;
  imagePublicId?: string;
}

// Get API URL (returns absolute API URL directly to bypass Vercel Serverless Function timeouts during Render cold starts)
function getApiUrl(): string {
  return siteConfig.apiUrl;
}

// Fetch helper with error handling
async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    let message = 'An error occurred while fetching data.';
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {
      // Ignore JSON parse errors
    }
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

// Public API
export async function getProducts(): Promise<Product[]> {
  const url = `${getApiUrl()}/products`;
  return fetchJson<Product[]>(url, {
    cache: 'no-store',
  });
}

export async function getProductById(id: string): Promise<Product> {
  const url = `${getApiUrl()}/products/${id}`;
  return fetchJson<Product>(url);
}

// Auth API
export async function loginAdmin(email: string, password: string): Promise<{ token: string; admin: { id: string; email: string } }> {
  const url = `${getApiUrl()}/auth/login`;
  return fetchJson<{ token: string; admin: { id: string; email: string } }>(url, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

// Protected CRUD API
export async function createProduct(token: string, product: ProductInput, imageFile?: File | null): Promise<Product> {
  const url = `${getApiUrl()}/products`;
  const formData = new FormData();
  formData.append('name', product.name);
  formData.append('category', product.category);
  if (product.tagline) formData.append('tagline', product.tagline);
  formData.append('benefit', product.benefit);
  formData.append('price', product.price !== null ? product.price.toString() : '');
  
  if (imageFile) {
    formData.append('image', imageFile);
  } else {
    formData.append('image', product.image);
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    let message = 'An error occurred while creating product.';
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {}
    throw new Error(message);
  }

  return res.json() as Promise<Product>;
}

export async function updateProduct(token: string, id: string, product: Partial<ProductInput>, imageFile?: File | null): Promise<Product> {
  const url = `${getApiUrl()}/products/${id}`;
  const formData = new FormData();
  if (product.name !== undefined) formData.append('name', product.name);
  if (product.category !== undefined) formData.append('category', product.category);
  if (product.tagline !== undefined) formData.append('tagline', product.tagline);
  if (product.benefit !== undefined) formData.append('benefit', product.benefit);
  if (product.price !== undefined) {
    formData.append('price', product.price !== null ? product.price.toString() : '');
  }
  
  if (imageFile) {
    formData.append('image', imageFile);
  } else if (product.image !== undefined) {
    formData.append('image', product.image);
  }

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    let message = 'An error occurred while updating product.';
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {}
    throw new Error(message);
  }

  return res.json() as Promise<Product>;
}

export async function deleteProduct(token: string, id: string): Promise<{ message: string }> {
  const url = `${getApiUrl()}/products/${id}`;
  return fetchJson<{ message: string }>(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export interface Order {
  _id: string;
  customerName: string;
  phone: string;
  email: string;
  productId: string;
  productName: string;
  quantity: number;
  notes?: string;
  status: 'pending' | 'contacted' | 'confirmed' | 'fulfilled' | 'cancelled';
  couponCode?: string;
  discountApplied?: number;
  totalPrice?: number | null;
  userId?: string;
  customerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderInput {
  customerName: string;
  phone: string;
  email: string;
  productId: string;
  productName: string;
  quantity: number;
  notes?: string;
  couponCode?: string;
  discountApplied?: number;
  totalPrice?: number | null;
  userId?: string;
  customerId?: string;
}

export interface Coupon {
  _id: string;
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CouponInput {
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
}

export interface Customer {
  id: string;
  _id?: string;
  firebaseUid: string;
  name: string;
  email: string;
  photoURL: string;
}

export async function googleLogin(idToken: string): Promise<{ customer: Customer }> {
  const url = `${getApiUrl()}/auth/google-login`;
  return fetchJson<{ customer: Customer }>(url, {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  });
}

export async function getCustomerOrders(token: string): Promise<Order[]> {
  const url = `${getApiUrl()}/my-orders`;
  return fetchJson<Order[]>(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function createOrder(order: OrderInput): Promise<Order> {
  const url = `${getApiUrl()}/orders`;
  return fetchJson<Order>(url, {
    method: 'POST',
    body: JSON.stringify(order),
  });
}

export async function getOrders(token: string): Promise<Order[]> {
  const url = `${getApiUrl()}/orders`;
  return fetchJson<Order[]>(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function updateOrderStatus(token: string, id: string, status: string): Promise<Order> {
  const url = `${getApiUrl()}/orders/${id}`;
  return fetchJson<Order>(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
}

// Signup Admin
export async function signupAdmin(email: string, password: string): Promise<{ token: string; admin: { id: string; email: string } }> {
  const url = `${getApiUrl()}/auth/signup`;
  return fetchJson<{ token: string; admin: { id: string; email: string } }>(url, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

// Coupon APIs
export async function applyCoupon(code: string): Promise<Coupon> {
  const url = `${getApiUrl()}/coupons/apply`;
  return fetchJson<Coupon>(url, {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

export async function getCoupons(token: string): Promise<Coupon[]> {
  const url = `${getApiUrl()}/coupons`;
  return fetchJson<Coupon[]>(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function createCoupon(token: string, coupon: CouponInput): Promise<Coupon> {
  const url = `${getApiUrl()}/coupons`;
  return fetchJson<Coupon>(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(coupon),
  });
}

export async function deleteCoupon(token: string, id: string): Promise<{ message: string }> {
  const url = `${getApiUrl()}/coupons/${id}`;
  return fetchJson<{ message: string }>(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function uploadProductImage(token: string, file: File): Promise<{ url: string }> {
  const url = `${getApiUrl()}/upload`;
  const formData = new FormData();
  formData.append('image', file);
  
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    let message = 'An error occurred while uploading image.';
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {}
    throw new Error(message);
  }

  return res.json();
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface UserAuthResponse {
  token: string;
  user: User;
}

export async function signupUser(input: any): Promise<UserAuthResponse> {
  const url = `${getApiUrl()}/users/signup`;
  return fetchJson<UserAuthResponse>(url, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function loginUser(input: any): Promise<UserAuthResponse> {
  const url = `${getApiUrl()}/users/login`;
  return fetchJson<UserAuthResponse>(url, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function getUserOrders(token: string): Promise<Order[]> {
  const url = `${getApiUrl()}/users/orders`;
  return fetchJson<Order[]>(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export interface DailyRevenue {
  date: string;
  revenue: number;
}

export interface DailyOrderCount {
  date: string;
  orderCount: number;
}

export interface OrderStatusDistribution {
  status: string;
  count: number;
}

export interface TopProduct {
  productName: string;
  unitsSold: number;
  revenue: number;
}

export interface CouponPerformance {
  code: string;
  timesUsed: number;
  totalDiscountGiven: number;
}

export interface AnalyticsData {
  revenueOverTime: DailyRevenue[];
  orderTrend: DailyOrderCount[];
  ordersByStatus: OrderStatusDistribution[];
  topProducts: TopProduct[];
  couponUsage: CouponPerformance[];
}

export async function getAnalytics(token: string, range: string = '30d'): Promise<AnalyticsData> {
  const url = `${getApiUrl()}/admin/analytics?range=${range}`;
  return fetchJson<AnalyticsData>(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

