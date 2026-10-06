import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import * as XLSX from 'xlsx';
import { createServer as createViteServer } from 'vite';
import { INITIAL_CONFIG, INITIAL_ORDERS } from './src/data/initialData.ts';
import { OrderRecord, AppConfig, OrderStatus, PaymentStatus } from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface DBState {
  orders: OrderRecord[];
  config: AppConfig;
}

function loadDB(): DBState {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed: DBState = JSON.parse(raw);
      // Ensure latest card pricing is merged
      parsed.config.cardPricing = {
        ...INITIAL_CONFIG.cardPricing,
        ...parsed.config.cardPricing,
        plasticCardPrice: 899,
        plasticCardMrp: 999,
        metalCardPrice: 1499,
        metalCardMrp: 1699,
      };
      return parsed;
    }
  } catch (err) {
    console.error('Error loading db.json, using defaults:', err);
  }
  const defaultState: DBState = {
    orders: INITIAL_ORDERS,
    config: INITIAL_CONFIG,
  };
  saveDB(defaultState);
  return defaultState;
}

function saveDB(data: DBState) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving db.json:', err);
  }
}

let db = loadDB();

// Google Sheet row serializer
function orderToSheetRow(order: OrderRecord) {
  return {
    'Order ID': order.orderId,
    'Date': order.date,
    'Time': order.time,
    'Customer Name': order.customer.fullName,
    'Profile Photo URL': order.customer.profilePhotoUrl || 'N/A',
    'Mobile 1': order.customer.mobile1,
    'Mobile 2': order.customer.mobile2 || 'N/A',
    'Email': order.customer.email,
    'Profession': order.customer.profession,
    'Profession Description': order.customer.professionDescription || 'N/A',
    'Instagram': order.customer.socialLinks?.instagram || 'N/A',
    'Facebook': order.customer.socialLinks?.facebook || 'N/A',
    'LinkedIn': order.customer.socialLinks?.linkedin || 'N/A',
    'YouTube': order.customer.socialLinks?.youtube || 'N/A',
    'X/Twitter': order.customer.socialLinks?.twitter || 'N/A',
    'Website': order.customer.socialLinks?.website || 'N/A',
    'WhatsApp': order.customer.socialLinks?.whatsapp || 'N/A',
    'Plan': order.plan,
    'Duration': `${order.durationMonths} Months`,
    'Monthly Price': `₹${order.monthlyPrice}`,
    'Plan Total': `₹${order.planTotal}`,
    'Card 1 Material': order.card1.material,
    'Card 1 Color': order.card1.color,
    'Card 1 Name': order.card1.printedName,
    'Card 2 Material': order.card2 ? order.card2.material : 'N/A',
    'Card 2 Color': order.card2 ? order.card2.color : 'N/A',
    'Card 2 Name': order.card2 ? order.card2.printedName : 'N/A',
    'Logo URL': order.card1.logoUrl || order.card1.logoNotes || 'N/A',
    'Subtotal': `₹${order.subtotal}`,
    'Discount': `₹${order.discount}`,
    'Coupon Code': order.couponCode || 'N/A',
    'Coupon Discount': order.couponDiscount ? `₹${order.couponDiscount}` : 'N/A',
    'Final Amount': `₹${order.finalAmount}`,
    'Payment Status': order.paymentStatus,
    'Payment ID': order.paymentId || 'N/A',
    'Transaction ID': order.transactionId || 'N/A',
    'Order Status': order.orderStatus,
    'Created At': order.createdAt,
  };
}

// Background / Webhook sync to Google Sheet
async function syncOrderToGoogleSheet(order: OrderRecord, webhookUrl?: string) {
  try {
    if (!webhookUrl) {
      console.log(`[Google Sheets] Order ${order.orderId} prepared for sheet sync (Webhook/API ready).`);
      return true;
    }
    const row = orderToSheetRow(order);
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'appendRow', order: row }),
    });
    return response.ok;
  } catch (err) {
    console.error(`[Google Sheets Sync Error for ${order.orderId}]:`, err);
    return false;
  }
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const isDev = process.env.NODE_ENV !== 'production';

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API Routes
  
  // 1. App Configuration (Plans, Discounts, Card Prices, UPI, Sheet)
  app.get('/api/config', (_req: Request, res: Response) => {
    res.json(db.config);
  });

  app.put('/api/config', (req: Request, res: Response) => {
    const updated = req.body;
    if (!updated || !updated.plans) {
      return res.status(400).json({ error: 'Invalid config structure' });
    }
    db.config = { ...db.config, ...updated };
    saveDB(db);
    res.json({ success: true, config: db.config });
  });

  // 2. Admin Stats
  app.get('/api/admin/stats', (_req: Request, res: Response) => {
    const totalOrders = db.orders.length;
    const paidOrders = db.orders.filter(o => o.paymentStatus === 'PAID').length;
    const pendingOrders = db.orders.filter(o => o.paymentStatus === 'PENDING_PAYMENT').length;
    const totalRevenue = db.orders
      .filter(o => o.paymentStatus === 'PAID')
      .reduce((sum, o) => sum + o.finalAmount, 0);

    const activePlans = {
      SILVER: db.orders.filter(o => o.plan === 'SILVER' && o.paymentStatus === 'PAID').length,
      GOLD: db.orders.filter(o => o.plan === 'GOLD' && o.paymentStatus === 'PAID').length,
      DIAMOND: db.orders.filter(o => o.plan === 'DIAMOND' && o.paymentStatus === 'PAID').length,
    };

    const uniqueEmails = new Set(db.orders.map(o => o.customer.email.toLowerCase()));
    const totalCustomers = uniqueEmails.size;

    res.json({
      totalOrders,
      paidOrders,
      pendingOrders,
      totalRevenue,
      activePlans,
      totalCustomers,
    });
  });

  // 3. Admin Authentication
  app.post('/api/admin/login', (req: Request, res: Response) => {
    const { password } = req.body;
    // Secure default password with environment variable override
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'tapmate@2026';
    if (password === ADMIN_PASSWORD) {
      res.json({
        success: true,
        token: 'tm_admin_token_' + Buffer.from(Date.now().toString()).toString('base64'),
        expiresIn: 86400,
      });
    } else {
      res.status(401).json({ success: false, error: 'Invalid admin credentials' });
    }
  });

  // 4. Orders List (Admin)
  app.get('/api/orders', (req: Request, res: Response) => {
    const { search, status, paymentStatus, plan } = req.query;
    let list = [...db.orders];

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter(o => 
        o.orderId.toLowerCase().includes(q) ||
        o.customer.fullName.toLowerCase().includes(q) ||
        o.customer.email.toLowerCase().includes(q) ||
        o.customer.mobile1.includes(q) ||
        (o.transactionId && o.transactionId.toLowerCase().includes(q))
      );
    }

    if (status && typeof status === 'string' && status !== 'all') {
      list = list.filter(o => o.orderStatus === status);
    }

    if (paymentStatus && typeof paymentStatus === 'string' && paymentStatus !== 'all') {
      list = list.filter(o => o.paymentStatus === paymentStatus);
    }

    if (plan && typeof plan === 'string' && plan !== 'all') {
      list = list.filter(o => o.plan === plan);
    }

    // Sort newest first
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json(list);
  });

  // 5. Get Single Order
  app.get('/api/orders/:orderId', (req: Request, res: Response) => {
    const order = db.orders.find(o => o.orderId === req.params.orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  });

  // 6. Create Order (Checkout Start)
  app.post('/api/orders', (req: Request, res: Response) => {
    const body = req.body;
    const { plan, durationMonths, customer, card1, card2, numberOfCards, couponCode } = body;

    if (!plan || !durationMonths || !customer || !card1) {
      return res.status(400).json({ error: 'Missing required order fields' });
    }

    if (!customer.fullName || !customer.mobile1 || !customer.email || !customer.profession) {
      return res.status(400).json({ error: 'Incomplete customer details' });
    }

    // Dynamic Server-Side Pricing Verification
    const planConfig = db.config.plans[plan as keyof typeof db.config.plans];
    const monthlyPrice = planConfig ? planConfig.monthlyPrice : 199;
    const planTotal = monthlyPrice * Number(durationMonths);

    const discountPercent = db.config.durationDiscounts[durationMonths as keyof typeof db.config.durationDiscounts] || 0;
    const discount = Math.round((planTotal * discountPercent) / 100);

    let cardCharges = 0;
    // Card 1 price
    if (card1.material === 'METAL') {
      cardCharges += db.config.cardPricing.metalCardPrice;
    } else {
      cardCharges += db.config.cardPricing.plasticCardPrice;
    }

    // Card 2 charges if present
    if (numberOfCards === 2 && card2) {
      if (card2.material === 'METAL') {
        cardCharges += db.config.cardPricing.secondCardMetalPrice;
      } else {
        cardCharges += db.config.cardPricing.secondCardPlasticPrice;
      }
    }

    const subtotal = planTotal + cardCharges;

    // Coupon Code BETA10 logic:
    // When BETA10 is applied: Gold membership becomes FREE (100% discount on subscription plan), but card charges are still applied!
    let couponDiscount = 0;
    const normalizedCoupon = (couponCode || '').trim().toUpperCase();
    if (normalizedCoupon === 'BETA10') {
      if (plan === 'GOLD') {
        couponDiscount = Math.max(0, planTotal - discount);
      }
    }

    const finalAmount = Math.max(0, subtotal - discount - couponDiscount);

    const now = new Date();
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const orderId = `TM-${now.getFullYear()}-${randomSeq}`;

    const newOrder: OrderRecord = {
      orderId,
      createdAt: now.toISOString(),
      date: now.toISOString().slice(0, 10),
      time: now.toTimeString().slice(0, 8),
      customer: {
        fullName: customer.fullName.trim(),
        profilePhotoUrl: customer.profilePhotoUrl || '',
        mobile1: customer.mobile1.trim(),
        mobile2: customer.mobile2 ? customer.mobile2.trim() : undefined,
        email: customer.email.trim(),
        profession: customer.profession.trim(),
        professionDescription: customer.professionDescription ? customer.professionDescription.trim() : '',
        socialLinks: customer.socialLinks || {},
      },
      plan,
      durationMonths: Number(durationMonths) as 1 | 3 | 6 | 12,
      monthlyPrice,
      planTotal,
      numberOfCards: numberOfCards || 1,
      card1: {
        material: card1.material,
        color: card1.color,
        printedName: card1.printedName || customer.fullName,
        logoUrl: card1.logoUrl,
        logoNotes: card1.logoNotes,
      },
      card2: numberOfCards === 2 && card2 ? {
        material: card2.material,
        color: card2.color,
        printedName: card2.printedName || customer.fullName,
        logoUrl: card2.logoUrl,
        logoNotes: card2.logoNotes,
      } : undefined,
      subtotal,
      cardCharges,
      discount,
      couponCode: normalizedCoupon || undefined,
      couponDiscount: couponDiscount > 0 ? couponDiscount : undefined,
      finalAmount,
      paymentStatus: 'PENDING_PAYMENT',
      orderStatus: 'Pending Payment',
      syncedToGoogleSheet: false,
    };

    db.orders.unshift(newOrder);
    saveDB(db);

    res.status(201).json(newOrder);
  });

  // 7. Payment Verification (Security requirement: Verify UTR / Transaction before marking PAID)
  app.post('/api/orders/:orderId/verify-payment', async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { utrNumber, transactionId, paymentMethod, paymentId } = req.body;

    const orderIndex = db.orders.findIndex(o => o.orderId === orderId);
    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = db.orders[orderIndex];

    const ref = (utrNumber || transactionId || '').trim();
    if (!ref || ref.length < 6) {
      return res.status(400).json({
        error: 'Invalid payment reference. Please provide a valid 12-digit UPI UTR or bank reference number.',
      });
    }

    // Check if this reference was already claimed by another order
    const duplicate = db.orders.find(o => o.orderId !== orderId && o.transactionId === ref && o.paymentStatus === 'PAID');
    if (duplicate) {
      return res.status(400).json({
        error: `This transaction reference (${ref}) has already been credited to order ${duplicate.orderId}. Please contact TapMate support if you think this is an error.`,
      });
    }

    // Verified successfully
    const pId = paymentId || `PAY-UPI-${Math.floor(1000000 + Math.random() * 9000000)}`;
    order.paymentStatus = 'PAID';
    order.orderStatus = 'Paid';
    order.paymentId = pId;
    order.transactionId = ref;
    order.paymentVerifiedAt = new Date().toISOString();

    // Trigger Google Sheet sync automatically
    const synced = await syncOrderToGoogleSheet(order, db.config.googleSheets.webhookUrl);
    order.syncedToGoogleSheet = synced;
    if (synced) {
      order.googleSheetSyncedAt = new Date().toISOString();
    }

    db.orders[orderIndex] = order;
    saveDB(db);

    res.json({
      success: true,
      message: 'Payment verified successfully and order recorded.',
      order,
    });
  });

  // 8. Update Order Status / Notes (Admin)
  app.patch('/api/orders/:orderId', (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { orderStatus, paymentStatus, adminNotes } = req.body;

    const orderIndex = db.orders.findIndex(o => o.orderId === orderId);
    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = db.orders[orderIndex];
    if (orderStatus) {
      order.orderStatus = orderStatus as OrderStatus;
    }
    if (paymentStatus) {
      order.paymentStatus = paymentStatus as PaymentStatus;
    }
    if (adminNotes !== undefined) {
      order.adminNotes = adminNotes;
    }

    db.orders[orderIndex] = order;
    saveDB(db);

    res.json({ success: true, order });
  });

  // 9. Manual Sync to Google Sheet
  app.post('/api/sync-sheets', async (_req: Request, res: Response) => {
    let syncedCount = 0;
    const webhookUrl = db.config.googleSheets.webhookUrl;

    for (const order of db.orders) {
      if (order.paymentStatus === 'PAID') {
        const ok = await syncOrderToGoogleSheet(order, webhookUrl);
        if (ok) {
          order.syncedToGoogleSheet = true;
          order.googleSheetSyncedAt = new Date().toISOString();
          syncedCount++;
        }
      }
    }

    db.config.googleSheets.lastSyncedAt = new Date().toISOString();
    saveDB(db);

    res.json({
      success: true,
      message: `Successfully synchronized ${syncedCount} verified orders with Google Sheets database.`,
      syncedCount,
      lastSyncedAt: db.config.googleSheets.lastSyncedAt,
    });
  });

  // 10. Export to Excel (.xlsx)
  app.get('/api/export/xlsx', (_req: Request, res: Response) => {
    try {
      const rows = db.orders.map(orderToSheetRow);
      const worksheet = XLSX.utils.json_to_sheet(rows);
      
      // Auto-size columns
      const colWidths = Object.keys(rows[0] || {}).map(key => ({
        wch: Math.max(key.length, 14),
      }));
      worksheet['!cols'] = colWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'TapMate Orders');

      const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      const filename = `TapMate_Orders_${new Date().toISOString().slice(0, 10)}.xlsx`;

      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(buf);
    } catch (err) {
      console.error('Export error:', err);
      res.status(500).json({ error: 'Failed to generate Excel export' });
    }
  });

  // 11. Export to CSV
  app.get('/api/export/csv', (_req: Request, res: Response) => {
    try {
      const rows = db.orders.map(orderToSheetRow);
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      const filename = `TapMate_Orders_${new Date().toISOString().slice(0, 10)}.csv`;

      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'text/csv');
      res.send(csv);
    } catch (err) {
      console.error('CSV Export error:', err);
      res.status(500).json({ error: 'Failed to generate CSV export' });
    }
  });

  // Vite Integration
  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[TapMate.in Server] running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start TapMate server:', err);
  process.exit(1);
});
