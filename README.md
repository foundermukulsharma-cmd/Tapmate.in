# TapMate.in — Smart NFC Digital Business Cards Platform

TapMate.in is a complete production-ready ordering, pre-booking, and card management platform for NFC Digital Business Cards. It enables professionals and enterprises across India to configure custom physical NFC cards (Matte PVC & Laser-Etched Stainless Steel), manage dynamic cloud digital profiles, pay securely via verified UPI payments, and synchronize customer records into Google Sheets and administrative databases.

---

## 1. Features Overview

- **3 Pricing Plans**:
  - **Silver (₹199/month)**: Basic profile, basic vCard, 2 social links, QR code, email support, TapMate branding.
  - **Gold (₹399/month)**: Detailed profile, vCard, QR download, WhatsApp & email support, custom engraved logo & name printing on physical card, up to 4 social links, 24/7 support, analytics, profile photo, 4 edits/month.
  - **Diamond (₹799/month)**: Detailed profile, vCard, QR download, custom engraved logo & name printing, unlimited social links, custom profile URL, 24/7 AI support widget, advanced profile analytics & insights, custom Excel record sheet (Export Taps & Leads), unlimited edits, 1 free replacement card, webhooks & digital profile integrations, 2 digital profiles linked to 1 card, 100% white label.
- **Dynamic Subscription Durations**:
  - 1 Month, 3 Months (5% discount), 6 Months (10% discount), 1 Year (20% discount).
- **Physical NFC Card Pricing & Customizer**:
  - **Plastic Card**: ₹899 (discounted from MRP ~~₹999~~, Save ₹100). Available in Matte Arctic White, Matte Black, Cobalt Blue.
  - **Metal Card**: ₹1,499 (discounted from MRP ~~₹1,699~~, Save ₹200). Available in 24K Brushed Gold, Brushed Tungsten Black, Laser-Etched Stainless Steel.
  - Optional **Second Card** (+ Add Second Card) with independent material, color, and name selection.
  - Live 3D-card visualizer with front and QR-code back view.
- **BETA10 Promotional Coupon Architecture**:
  - Applying code `BETA10` makes the **Gold Membership Subscription 100% FREE (₹0)**!
  - Physical NFC card charges (Plastic ₹899 or Metal ₹1,499) remain payable so you only pay for the physical card manufacture and delivery.
- **Strict UPI Payment Verification Architecture**:
  - Official VPA: `mukul620352.rzp@rxairtel` (Receiver: Tapmate.in).
  - Dynamic QR code generation for desktop scanning.
  - Deep-link intent for mobile devices (`upi://pay?...`).
  - **Security Guarantee**: Does not mark orders as PAID merely upon link click; requires a valid 12-digit UPI Bank Reference Number / UTR verified against backend gateway records.
- **Admin Portal**:
  - Live dashboard metrics: Total Orders, Paid Orders, Pending Orders, Total Revenue, Active Plans, Total Customers.
  - Full order lifecycle management: *Pending Payment*, *Paid*, *Processing*, *Card Designing*, *Card Printing*, *Dispatched*, *Delivered*, *Cancelled*.
  - Configurable pricing & UPI rates directly from UI without modifying frontend code.
  - One-click **Excel (.xlsx)** and **CSV** export.
- **Google Sheets Integration**:
  - Automated sync of every verified order with all columns:
    `Order ID`, `Date`, `Time`, `Customer Name`, `Profile Photo URL`, `Mobile 1`, `Mobile 2`, `Email`, `Profession`, `Profession Description`, `Instagram`, `Facebook`, `LinkedIn`, `YouTube`, `X/Twitter`, `Website`, `WhatsApp`, `Plan`, `Duration`, `Monthly Price`, `Plan Total`, `Card 1 Material`, `Card 1 Color`, `Card 1 Name`, `Card 2 Material`, `Card 2 Color`, `Card 2 Name`, `Logo URL`, `Subtotal`, `Discount`, `Final Amount`, `Payment Status`, `Payment ID`, `Transaction ID`, `Order Status`, `Created At`.

---

## 2. Environment Variables

Create or configure `.env` based on `.env.example`:

```bash
# Server Port
PORT=3000

# Admin Portal Password (default if not set: tapmate@2026)
ADMIN_PASSWORD="your_secure_admin_password"

# UPI Receiving VPA
UPI_VPA="mukul620352.rzp@rxairtel"
UPI_MERCHANT_NAME="Tapmate.in"
UPI_MERCHANT_CODE="5817"

# Google Sheets Integration
GOOGLE_SHEET_ID="your_google_sheet_id_here"
GOOGLE_SHEET_WEBHOOK_URL="https://script.google.com/macros/s/AKfycb.../exec"
```

---

## 3. How to Run Locally

### Prerequisites
- Node.js (v18 or v20+)
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Run full-stack dev server (Express backend + Vite frontend on port 3000)
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Production Build
```bash
# Build frontend assets into /dist
npm run build

# Start production server
npm run start
```

---

## 4. Payment / UPI Verification Setup

1. The customer selects their plan, duration, details, and cards.
2. The server creates an initial order record with `paymentStatus: "PENDING_PAYMENT"` and generates a unique Order ID (`TM-YYYY-XXXX`).
3. The frontend displays:
   - Dynamic scannable UPI QR code.
   - Mobile deep-link button targeting `mukul620352.rzp@rxairtel`.
4. The customer completes payment via their UPI app (GPay / PhonePe / Paytm / CRED / BHIM) and inputs the resulting 12-digit Bank UTR / Reference number into the verification form.
5. The `/api/orders/:orderId/verify-payment` endpoint cryptographically verifies and registers the transaction ID, checks for duplicates, updates `paymentStatus = "PAID"`, and triggers Google Sheets sync.

---

## 5. Google Sheets Setup

To automatically append customer orders to a Google Sheet:

### Option A: Google Apps Script Webhook (Recommended & Instant)
1. Open Google Sheets and create a new sheet with the designated column headers.
2. Go to **Extensions > Apps Script** and paste:
   ```javascript
   function doPost(e) {
     var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
     var data = JSON.parse(e.postData.contents);
     if (data.action === 'appendRow') {
       var o = data.order;
       sheet.appendRow([
         o['Order ID'], o['Date'], o['Time'], o['Customer Name'], o['Profile Photo URL'],
         o['Mobile 1'], o['Mobile 2'], o['Email'], o['Profession'], o['Profession Description'],
         o['Instagram'], o['Facebook'], o['LinkedIn'], o['YouTube'], o['X/Twitter'],
         o['Website'], o['WhatsApp'], o['Plan'], o['Duration'], o['Monthly Price'],
         o['Plan Total'], o['Card 1 Material'], o['Card 1 Color'], o['Card 1 Name'],
         o['Card 2 Material'], o['Card 2 Color'], o['Card 2 Name'], o['Logo URL'],
         o['Subtotal'], o['Discount'], o['Final Amount'], o['Payment Status'],
         o['Payment ID'], o['Transaction ID'], o['Order Status'], o['Created At']
       ]);
       return ContentService.createTextOutput(JSON.stringify({ status: 'success' })).setMimeType(ContentService.MimeType.JSON);
     }
   }
   ```
3. Click **Deploy > New Deployment**, select type **Web App**, set *Execute as: Me*, and *Who has access: Anyone*.
4. Copy the Webhook URL and paste it into the **Admin Console > Google Sheets Sync** tab or into `GOOGLE_SHEET_WEBHOOK_URL`.

---

## 6. Admin Login Setup

- Default Password: `tapmate@2026`
- Set `ADMIN_PASSWORD` in environment variables to customize.
- Access via the **Admin Portal** button in the header navigation or the footer link.
- Features in Admin:
  - Filter orders by status (Paid, Pending Payment, Delivered, etc.).
  - Inspect individual customer card engraving mockups.
  - Export the full database as `.xlsx` (Excel) or `.csv`.
  - Adjust monthly plan prices, duration discounts, and card rates dynamically.

---

## 7. Deployment

This full-stack application is optimized for containerized environments (Cloud Run, Docker, AWS, Render, Vercel/Railway):

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
```
