import { siteConfig } from '../data/siteConfig';

export interface Product {
  _id: string;
  name: string;
  category: 'Cleanse' | 'Condition & Repair' | 'Moisturize' | 'Growth & Finish';
  tagline?: string;
  benefit: string;
  price: number | null;
  image: string;
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
}

// Get dynamic API URL mapping localhost to window.location.hostname on the browser
function getApiUrl(): string {
  if (typeof window !== 'undefined') {
    return '/api';
  }
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
    next: { revalidate: 60 }, // Cache for 60s
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
export async function createProduct(token: string, product: ProductInput): Promise<Product> {
  const url = `${getApiUrl()}/products`;
  return fetchJson<Product>(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(product),
  });
}

export async function updateProduct(token: string, id: string, product: Partial<ProductInput>): Promise<Product> {
  const url = `${getApiUrl()}/products/${id}`;
  return fetchJson<Product>(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(product),
  });
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
  productId: string;
  productName: string;
  quantity: number;
  notes?: string;
  status: 'pending' | 'contacted' | 'confirmed' | 'fulfilled' | 'cancelled';
  couponCode?: string;
  discountApplied?: number;
  totalPrice?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderInput {
  customerName: string;
  phone: string;
  productId: string;
  productName: string;
  quantity: number;
  notes?: string;
  couponCode?: string;
  discountApplied?: number;
  totalPrice?: number | null;
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

