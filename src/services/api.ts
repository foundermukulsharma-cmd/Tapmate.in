import { OrderRecord, AppConfig, AdminStats, OrderStatus, PaymentStatus } from '../types';
import { INITIAL_CONFIG, INITIAL_ORDERS } from '../data/initialData';

const BASE_URL = '/api';

export const api = {
  async getConfig(): Promise<AppConfig> {
    try {
      const res = await fetch(`${BASE_URL}/config`);
      if (!res.ok) throw new Error('Failed to load config');
      return await res.json();
    } catch {
      return INITIAL_CONFIG;
    }
  },

  async updateConfig(config: Partial<AppConfig>): Promise<{ success: boolean; config: AppConfig }> {
    const res = await fetch(`${BASE_URL}/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update config');
    }
    return await res.json();
  },

  async getAdminStats(): Promise<AdminStats> {
    try {
      const res = await fetch(`${BASE_URL}/admin/stats`);
      if (!res.ok) throw new Error('Failed to fetch stats');
      return await res.json();
    } catch {
      // Fallback compute locally
      return {
        totalOrders: INITIAL_ORDERS.length,
        paidOrders: INITIAL_ORDERS.filter(o => o.paymentStatus === 'PAID').length,
        pendingOrders: INITIAL_ORDERS.filter(o => o.paymentStatus === 'PENDING_PAYMENT').length,
        totalRevenue: INITIAL_ORDERS.filter(o => o.paymentStatus === 'PAID').reduce((s, o) => s + o.finalAmount, 0),
        activePlans: {
          SILVER: 0,
          GOLD: 1,
          DIAMOND: 1,
        },
        totalCustomers: INITIAL_ORDERS.length,
      };
    }
  },

  async adminLogin(password: string): Promise<{ success: boolean; token?: string; error?: string }> {
    const res = await fetch(`${BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    return await res.json();
  },

  async getOrders(params?: { search?: string; status?: string; paymentStatus?: string; plan?: string }): Promise<OrderRecord[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    if (params?.paymentStatus) query.append('paymentStatus', params.paymentStatus);
    if (params?.plan) query.append('plan', params.plan);

    try {
      const res = await fetch(`${BASE_URL}/orders?${query.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch orders');
      return await res.json();
    } catch {
      return INITIAL_ORDERS;
    }
  },

  async getOrder(orderId: string): Promise<OrderRecord> {
    const res = await fetch(`${BASE_URL}/orders/${orderId}`);
    if (!res.ok) throw new Error('Order not found');
    return await res.json();
  },

  async createOrder(data: {
    plan: string;
    durationMonths: number;
    customer: any;
    card1: any;
    card2?: any;
    numberOfCards: number;
    couponCode?: string;
  }): Promise<OrderRecord> {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to place order');
    }
    return await res.json();
  },

  async verifyPayment(orderId: string, utrNumber: string): Promise<{ success: boolean; order: OrderRecord; message: string }> {
    const res = await fetch(`${BASE_URL}/orders/${orderId}/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ utrNumber }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Payment verification failed');
    }
    return await res.json();
  },

  async updateOrderStatus(orderId: string, updates: { orderStatus?: OrderStatus; paymentStatus?: PaymentStatus; adminNotes?: string }): Promise<{ success: boolean; order: OrderRecord }> {
    const res = await fetch(`${BASE_URL}/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update order');
    }
    return await res.json();
  },

  async syncToGoogleSheet(): Promise<{ success: boolean; message: string; syncedCount: number; lastSyncedAt: string }> {
    const res = await fetch(`${BASE_URL}/sync-sheets`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to sync with Google Sheet');
    }
    return await res.json();
  },

  getExportXlsxUrl(): string {
    return `${BASE_URL}/export/xlsx`;
  },

  getExportCsvUrl(): string {
    return `${BASE_URL}/export/csv`;
  },
};
