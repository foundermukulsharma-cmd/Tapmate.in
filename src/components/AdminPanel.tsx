import React, { useState, useEffect } from 'react';
import { OrderRecord, AdminStats, AppConfig, OrderStatus, PaymentStatus, PlanTier } from '../types';
import { api } from '../services/api';
import { CardVisualizer } from './CardVisualizer';
import { generateOrderPDF } from '../utils/pdfGenerator';
import {
  Lock,
  Search,
  Download,
  RefreshCw,
  Sliders,
  FileSpreadsheet,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  CreditCard,
  ChevronDown,
  X,
  ExternalLink,
  Shield,
  Eye,
  LogOut,
  Save,
  FileDown,
  Printer,
  User,
} from 'lucide-react';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onConfigUpdated: (newConfig: AppConfig) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  config,
  onConfigUpdated,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'orders' | 'config' | 'sheets'>('orders');

  // Orders and stats state
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');

  // Selected order for detailed modal view
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);

  // Config editor state
  const [editConfig, setEditConfig] = useState<AppConfig>(config);
  const [configSaveSuccess, setConfigSaveSuccess] = useState<boolean>(false);

  // Google Sheets sync state
  const [sheetSyncing, setSheetSyncing] = useState<boolean>(false);
  const [sheetSyncResult, setSheetSyncResult] = useState<string>('');

  useEffect(() => {
    // Check local session
    const token = sessionStorage.getItem('tapmate_admin_token');
    if (token) {
      setIsAuthenticated(true);
      loadAdminData();
    }
  }, [isOpen]);

  useEffect(() => {
    setEditConfig(config);
  }, [config]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [fetchedOrders, fetchedStats] = await Promise.all([
        api.getOrders({
          search: searchQuery,
          status: statusFilter,
          paymentStatus: paymentFilter,
          plan: planFilter,
        }),
        api.getAdminStats(),
      ]);
      setOrders(fetchedOrders);
      setStats(fetchedStats);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAdminData();
    }
  }, [searchQuery, statusFilter, paymentFilter, planFilter, isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await api.adminLogin(passwordInput);
      if (res.success && res.token) {
        sessionStorage.setItem('tapmate_admin_token', res.token);
        setIsAuthenticated(true);
        loadAdminData();
      } else {
        setLoginError(res.error || 'Invalid credentials');
      }
    } catch {
      setLoginError('Authentication service unreachable');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('tapmate_admin_token');
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await api.updateOrderStatus(orderId, { orderStatus: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, orderStatus: newStatus } : o))
      );
      if (selectedOrder && selectedOrder.orderId === orderId) {
        setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
      }
    } catch (err) {
      alert('Failed to update order status');
    }
  };

  const handlePaymentStatusChange = async (orderId: string, newStatus: PaymentStatus) => {
    try {
      await api.updateOrderStatus(orderId, { paymentStatus: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, paymentStatus: newStatus } : o))
      );
      if (selectedOrder && selectedOrder.orderId === orderId) {
        setSelectedOrder({ ...selectedOrder, paymentStatus: newStatus });
      }
      // Refresh stats
      api.getAdminStats().then(setStats);
    } catch (err) {
      alert('Failed to update payment status');
    }
  };

  const handleSaveConfig = async () => {
    try {
      const res = await api.updateConfig(editConfig);
      if (res.success) {
        onConfigUpdated(res.config);
        setConfigSaveSuccess(true);
        setTimeout(() => setConfigSaveSuccess(false), 2500);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save configuration');
    }
  };

  const handleSyncToGoogleSheets = async () => {
    setSheetSyncing(true);
    setSheetSyncResult('');
    try {
      const res = await api.syncToGoogleSheet();
      setSheetSyncResult(res.message);
      loadAdminData();
    } catch (err: any) {
      setSheetSyncResult(err.message || 'Failed to sync with Google Sheet');
    } finally {
      setSheetSyncing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-7xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              <span className="font-['Space_Grotesk'] font-bold text-lg text-white">
                TapMate.in Admin Portal
              </span>
            </div>
            {isAuthenticated && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                Live Console
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-slate-800 border border-slate-700 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Close Admin"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {!isAuthenticated ? (
          /* LOGIN SCREEN */
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center max-w-md mx-auto my-auto text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-lg">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white font-['Space_Grotesk']">
                Administrator Authentication
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter your administrative key to view customer orders, manage card production, and export databases.
              </p>
            </div>

            <form onSubmit={handleLogin} className="w-full space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="Admin Password (tapmate@2026)"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 text-center"
                />
                {loginError && (
                  <p className="text-xs text-rose-400 mt-2">{loginError}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm cursor-pointer transition shadow-lg shadow-cyan-500/20"
              >
                Unlock Admin Console
              </button>

              <p className="text-[11px] text-slate-500">
                Default key: <span className="font-mono text-slate-400">tapmate@2026</span>
              </p>
            </form>
          </div>
        ) : (
          /* AUTHENTICATED ADMIN CONSOLE */
          <div className="flex-1 overflow-y-auto flex flex-col">
            {/* Tabs & Metrics Bar */}
            <div className="p-6 bg-slate-950/40 border-b border-slate-800 space-y-6">
              {/* Tab Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                      activeTab === 'orders'
                        ? 'bg-cyan-500 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Customer Orders ({orders.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('config')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                      activeTab === 'config'
                        ? 'bg-cyan-500 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Pricing &amp; Card Rates</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('sheets')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                      activeTab === 'sheets'
                        ? 'bg-cyan-500 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Google Sheets Sync</span>
                  </button>
                </div>

                {/* Export Buttons */}
                <div className="flex items-center gap-2">
                  <a
                    href={api.getExportXlsxUrl()}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2 px-3.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export .xlsx (Excel)</span>
                  </a>

                  <a
                    href={api.getExportCsvUrl()}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>CSV</span>
                  </a>

                  <button
                    type="button"
                    onClick={loadAdminData}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                    title="Refresh Data"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* High-level stats cards */}
              {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Total Orders
                    </div>
                    <div className="text-2xl font-bold text-white font-['Space_Grotesk'] mt-1">
                      {stats.totalOrders}
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/20">
                    <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                      Paid Orders
                    </div>
                    <div className="text-2xl font-bold text-emerald-400 font-['Space_Grotesk'] mt-1">
                      {stats.paidOrders}
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/20">
                    <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                      Pending Orders
                    </div>
                    <div className="text-2xl font-bold text-amber-400 font-['Space_Grotesk'] mt-1">
                      {stats.pendingOrders}
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-cyan-500/20">
                    <div className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">
                      Total Revenue
                    </div>
                    <div className="text-2xl font-bold text-cyan-400 font-['Space_Grotesk'] mt-1">
                      ₹{stats.totalRevenue.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Active Plans
                    </div>
                    <div className="text-xs text-slate-300 mt-1.5 space-y-0.5">
                      <div>
                        Diamond: <span className="font-bold text-white">{stats.activePlans.DIAMOND}</span>
                      </div>
                      <div>
                        Gold: <span className="font-bold text-white">{stats.activePlans.GOLD}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Total Customers
                    </div>
                    <div className="text-2xl font-bold text-white font-['Space_Grotesk'] mt-1">
                      {stats.totalCustomers}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* TAB 1: ORDERS TABLE */}
            {activeTab === 'orders' && (
              <div className="p-6 space-y-4 flex-1">
                {/* Search & Filters */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                  <div className="relative flex-1 min-w-[220px]">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search Order ID, Name, Email, Phone, UTR..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Status Filter */}
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none"
                    >
                      <option value="all">All Order Statuses</option>
                      <option value="Pending Payment">Pending Payment</option>
                      <option value="Paid">Paid</option>
                      <option value="Processing">Processing</option>
                      <option value="Card Designing">Card Designing</option>
                      <option value="Card Printing">Card Printing</option>
                      <option value="Dispatched">Dispatched</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>

                    {/* Payment Filter */}
                    <select
                      value={paymentFilter}
                      onChange={(e) => setPaymentFilter(e.target.value)}
                      className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none"
                    >
                      <option value="all">All Payment Statuses</option>
                      <option value="PAID">PAID</option>
                      <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
                      <option value="FAILED">FAILED</option>
                    </select>

                    {/* Plan Filter */}
                    <select
                      value={planFilter}
                      onChange={(e) => setPlanFilter(e.target.value)}
                      className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none"
                    >
                      <option value="all">All Plans</option>
                      <option value="SILVER">Silver</option>
                      <option value="GOLD">Gold</option>
                      <option value="DIAMOND">Diamond</option>
                    </select>
                  </div>
                </div>

                {/* Orders Table Container */}
                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/70">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                        <th className="py-3 px-4">Order ID &amp; Date</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Plan &amp; Duration</th>
                        <th className="py-3 px-4">Physical Cards</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Payment</th>
                        <th className="py-3 px-4">Order Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 text-slate-300">
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-500">
                            No orders matching current filter criteria.
                          </td>
                        </tr>
                      ) : (
                        orders.map((order) => (
                          <tr key={order.orderId} className="hover:bg-slate-900/60 transition">
                            <td className="py-3 px-4 font-mono">
                              <span className="font-bold text-white">{order.orderId}</span>
                              <div className="text-[10px] text-slate-500">
                                {order.date} {order.time}
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <div className="font-semibold text-white">{order.customer.fullName}</div>
                              <div className="text-[11px] text-slate-400">{order.customer.profession}</div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                {order.customer.mobile1} &bull; {order.customer.email}
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  order.plan === 'DIAMOND'
                                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                    : order.plan === 'GOLD'
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    : 'bg-slate-800 text-slate-300'
                                }`}
                              >
                                {order.plan}
                              </span>
                              <div className="text-[10px] text-slate-400 mt-1">
                                {order.durationMonths} Mo. @ ₹{order.monthlyPrice}/mo
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <div className="text-[11px]">
                                Card 1: <span className="text-white font-medium">{order.card1.material} ({order.card1.color})</span>
                              </div>
                              {order.card2 && (
                                <div className="text-[11px] text-slate-400">
                                  Card 2: {order.card2.material} ({order.card2.color})
                                </div>
                              )}
                            </td>

                            <td className="py-3 px-4">
                              <span className="font-bold text-white text-sm font-mono">
                                ₹{order.finalAmount}
                              </span>
                              {order.discount > 0 && (
                                <div className="text-[10px] text-emerald-400">
                                  Saved ₹{order.discount}
                                </div>
                              )}
                              {order.couponCode && (
                                <div className="text-[10px] text-amber-400 font-mono font-semibold">
                                  Coupon: {order.couponCode}
                                  {order.couponDiscount ? ` (-₹${order.couponDiscount})` : ''}
                                </div>
                              )}
                            </td>

                            <td className="py-3 px-4">
                              <div className="flex flex-col gap-1">
                                <select
                                  value={order.paymentStatus}
                                  onChange={(e) =>
                                    handlePaymentStatusChange(
                                      order.orderId,
                                      e.target.value as PaymentStatus
                                    )
                                  }
                                  className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer border ${
                                    order.paymentStatus === 'PAID'
                                      ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40'
                                      : 'bg-amber-950/60 text-amber-400 border-amber-500/40'
                                  }`}
                                >
                                  <option value="PAID">PAID</option>
                                  <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
                                  <option value="FAILED">FAILED</option>
                                  <option value="REFUNDED">REFUNDED</option>
                                </select>
                                {order.transactionId && (
                                  <span className="text-[9px] font-mono text-slate-500 truncate max-w-[120px]">
                                    {order.transactionId}
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <select
                                value={order.orderStatus}
                                onChange={(e) =>
                                  handleStatusChange(order.orderId, e.target.value as OrderStatus)
                                }
                                className="px-2 py-1 rounded text-[11px] bg-slate-900 border border-slate-700 text-slate-200 cursor-pointer focus:outline-none"
                              >
                                <option value="Pending Payment">Pending Payment</option>
                                <option value="Paid">Paid</option>
                                <option value="Processing">Processing</option>
                                <option value="Card Designing">Card Designing</option>
                                <option value="Card Printing">Card Printing</option>
                                <option value="Dispatched">Dispatched</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>

                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => generateOrderPDF(order)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
                                  title="Download Complete Customer PDF Dossier (with Photo & Card Details)"
                                >
                                  <FileDown className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSelectedOrder(order)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 transition cursor-pointer"
                                  title="View Complete Order Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: PRICING & CONFIGURATION */}
            {activeTab === 'config' && (
              <div className="p-6 sm:p-8 space-y-6 max-w-4xl">
                <div>
                  <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">
                    Dynamic Price &amp; Service Configuration
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Update monthly plan prices, card add-on charges, and UPI gateway settings dynamically without redeploying code.
                  </p>
                </div>

                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
                  {/* Monthly Plan Prices */}
                  <div>
                    <h4 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-3">
                      Monthly Plan Prices (₹)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Silver Plan (/mo)</label>
                        <input
                          type="number"
                          value={editConfig.plans.SILVER.monthlyPrice}
                          onChange={(e) =>
                            setEditConfig({
                              ...editConfig,
                              plans: {
                                ...editConfig.plans,
                                SILVER: {
                                  ...editConfig.plans.SILVER,
                                  monthlyPrice: Number(e.target.value),
                                },
                              },
                            })
                          }
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-sm"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Gold Plan (/mo)</label>
                        <input
                          type="number"
                          value={editConfig.plans.GOLD.monthlyPrice}
                          onChange={(e) =>
                            setEditConfig({
                              ...editConfig,
                              plans: {
                                ...editConfig.plans,
                                GOLD: {
                                  ...editConfig.plans.GOLD,
                                  monthlyPrice: Number(e.target.value),
                                },
                              },
                            })
                          }
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-sm"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Diamond Plan (/mo)</label>
                        <input
                          type="number"
                          value={editConfig.plans.DIAMOND.monthlyPrice}
                          onChange={(e) =>
                            setEditConfig({
                              ...editConfig,
                              plans: {
                                ...editConfig.plans,
                                DIAMOND: {
                                  ...editConfig.plans.DIAMOND,
                                  monthlyPrice: Number(e.target.value),
                                },
                              },
                            })
                          }
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Physical Card Pricing */}
                  <div className="pt-4 border-t border-slate-800">
                    <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-3">
                      Physical NFC Card Pricing &amp; Strikethrough MRPs (₹)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">
                          Plastic Card Price (₹)
                        </label>
                        <input
                          type="number"
                          value={editConfig.cardPricing.plasticCardPrice}
                          onChange={(e) =>
                            setEditConfig({
                              ...editConfig,
                              cardPricing: {
                                ...editConfig.cardPricing,
                                plasticCardPrice: Number(e.target.value),
                              },
                            })
                          }
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-sm"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-slate-400 block mb-1">
                          Plastic Strikethrough MRP (₹)
                        </label>
                        <input
                          type="number"
                          value={editConfig.cardPricing.plasticCardMrp || 999}
                          onChange={(e) =>
                            setEditConfig({
                              ...editConfig,
                              cardPricing: {
                                ...editConfig.cardPricing,
                                plasticCardMrp: Number(e.target.value),
                              },
                            })
                          }
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-sm"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-slate-400 block mb-1">
                          Metal Card Price (₹)
                        </label>
                        <input
                          type="number"
                          value={editConfig.cardPricing.metalCardPrice}
                          onChange={(e) =>
                            setEditConfig({
                              ...editConfig,
                              cardPricing: {
                                ...editConfig.cardPricing,
                                metalCardPrice: Number(e.target.value),
                              },
                            })
                          }
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-sm"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-slate-400 block mb-1">
                          Metal Strikethrough MRP (₹)
                        </label>
                        <input
                          type="number"
                          value={editConfig.cardPricing.metalCardMrp || 1699}
                          onChange={(e) =>
                            setEditConfig({
                              ...editConfig,
                              cardPricing: {
                                ...editConfig.cardPricing,
                                metalCardMrp: Number(e.target.value),
                              },
                            })
                          }
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* UPI Gateway Settings */}
                  <div className="pt-4 border-t border-slate-800">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                      UPI Receiving Configuration
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">
                          UPI VPA Address
                        </label>
                        <input
                          type="text"
                          value={editConfig.upi.vpa}
                          onChange={(e) =>
                            setEditConfig({
                              ...editConfig,
                              upi: { ...editConfig.upi, vpa: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-slate-400 block mb-1">
                          Merchant / Receiver Name
                        </label>
                        <input
                          type="text"
                          value={editConfig.upi.merchantName}
                          onChange={(e) =>
                            setEditConfig({
                              ...editConfig,
                              upi: { ...editConfig.upi, merchantName: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    {configSaveSuccess && (
                      <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
                        <CheckCircle className="w-4 h-4" /> Configuration saved successfully!
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={handleSaveConfig}
                      className="ml-auto py-3 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer transition shadow-lg shadow-cyan-500/20"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save &amp; Apply Pricing</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: GOOGLE SHEETS INTEGRATION */}
            {activeTab === 'sheets' && (
              <div className="p-6 sm:p-8 space-y-6 max-w-4xl">
                <div>
                  <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">
                    Google Sheets Automatic Database Sync
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Every verified order is automatically synced into your connected Google Sheet. You can also trigger an immediate manual reconciliation.
                  </p>
                </div>

                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-5">
                  <div className="flex items-center justify-between p-4 bg-slate-900/60 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <FileSpreadsheet className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">TapMate Orders Master Sheet</div>
                        <div className="text-xs text-slate-400 font-mono">
                          Sheet ID: {config.googleSheets.sheetId}
                        </div>
                      </div>
                    </div>

                    <a
                      href={config.googleSheets.sheetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <span>Open Google Sheet</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Webhook Endpoint for Apps Script */}
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Google Apps Script Webhook URL (Optional Auto-Sync Endpoint):
                    </label>
                    <input
                      type="url"
                      placeholder="https://script.google.com/macros/s/.../exec"
                      value={editConfig.googleSheets.webhookUrl || ''}
                      onChange={(e) =>
                        setEditConfig({
                          ...editConfig,
                          googleSheets: {
                            ...editConfig.googleSheets,
                            webhookUrl: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-mono"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      If provided, every verified payment immediately posts order records directly into Google Sheets.
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <div>
                      {sheetSyncResult && (
                        <p className="text-xs text-emerald-400 font-medium">{sheetSyncResult}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={sheetSyncing}
                      onClick={handleSyncToGoogleSheets}
                      className="py-3 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer transition shadow-lg shadow-emerald-500/20"
                    >
                      <RefreshCw className={`w-4 h-4 ${sheetSyncing ? 'animate-spin' : ''}`} />
                      <span>{sheetSyncing ? 'Synchronizing Records...' : 'Sync All Orders to Google Sheet'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal: View Single Order Details */}
        {selectedOrder && (
          <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="text-xs font-mono text-cyan-400">ORDER DETAILS</div>
                  <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">
                    {selectedOrder.orderId}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Card visualizer preview */}
              <div className="flex justify-center">
                <CardVisualizer
                  material={selectedOrder.card1.material}
                  color={selectedOrder.card1.color}
                  printedName={selectedOrder.card1.printedName}
                  logoUrl={selectedOrder.card1.logoUrl}
                  compact
                />
              </div>

              {/* Customer details breakdown with Photo */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 text-xs text-slate-300">
                <div className="flex items-center gap-4">
                  {selectedOrder.customer.profilePhotoUrl ? (
                    <img
                      src={selectedOrder.customer.profilePhotoUrl}
                      alt={selectedOrder.customer.fullName}
                      className="w-16 h-16 rounded-full object-cover border-2 border-cyan-400/50 shadow-md shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                      <User className="w-8 h-8 text-slate-500" />
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-white text-base">
                      {selectedOrder.customer.fullName}
                    </div>
                    <div className="text-cyan-400 font-semibold">{selectedOrder.customer.profession}</div>
                    <div className="text-slate-400 text-[11px] mt-0.5 line-clamp-2">
                      {selectedOrder.customer.professionDescription}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 font-mono">
                  <div>
                    <span className="text-slate-500 block">Mobile 1:</span>
                    <span>{selectedOrder.customer.mobile1}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Mobile 2:</span>
                    <span>{selectedOrder.customer.mobile2 || 'None'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block">Email Address:</span>
                    <span>{selectedOrder.customer.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Plan &amp; Duration:</span>
                    <span className="text-white font-semibold">
                      {selectedOrder.plan} ({selectedOrder.durationMonths} Mo.)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Total Amount:</span>
                    <span className="text-cyan-400 font-bold text-sm">
                      ₹{selectedOrder.finalAmount}
                    </span>
                  </div>
                  <div className="col-span-2 text-amber-400">
                    <span className="text-slate-500 block">Payment Reference / UTR:</span>
                    <span className="font-bold">{selectedOrder.transactionId || 'Pending'}</span>
                  </div>
                </div>

                {/* Social profiles */}
                {selectedOrder.customer.socialLinks && Object.values(selectedOrder.customer.socialLinks).some(Boolean) && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
                      Submitted Social Profiles:
                    </span>
                    <div className="flex flex-wrap gap-2 text-[11px]">
                      {Object.entries(selectedOrder.customer.socialLinks).map(([k, v]) =>
                        v ? (
                          <span
                            key={k}
                            className="px-2 py-0.5 bg-slate-900 rounded border border-slate-800 text-slate-300"
                          >
                            <strong className="text-cyan-400 capitalize">{k}:</strong> {v}
                          </span>
                        ) : null
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons: Download PDF, Print, Close */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => generateOrderPDF(selectedOrder)}
                    className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer transition shadow-md shadow-emerald-500/20"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>Download PDF Dossier (with Photo)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition border border-slate-700"
                    title="Print / Save as PDF"
                  >
                    <Printer className="w-4 h-4" />
                    <span className="hidden sm:inline">Print</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="py-2.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
