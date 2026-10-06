export type PlanTier = 'SILVER' | 'GOLD' | 'DIAMOND';

export interface PlanFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

export interface PricingPlan {
  id: PlanTier;
  name: string;
  monthlyPrice: number; // e.g. 199, 399, 799
  tagline: string;
  popular?: boolean;
  maxSocialLinks: number; // Silver: 2, Gold: 4, Diamond: 99
  watermark: boolean; // Silver: true, Gold: true, Diamond: false
  features: string[];
}

export type DurationOption = 1 | 3 | 6 | 12;

export interface DurationDiscount {
  months: DurationOption;
  label: string;
  discountPercentage: number; // e.g., 0, 10, 15, 20
  badge?: string;
}

export type CardMaterial = 'PLASTIC' | 'METAL';
export type PlasticColor = 'White' | 'Black' | 'Blue';
export type MetalColor = 'Black' | 'Gold' | 'Silver';
export type CardColor = PlasticColor | MetalColor;

export interface PhysicalCardConfig {
  material: CardMaterial;
  color: CardColor;
  printedName: string;
  logoUrl?: string;
  logoNotes?: string;
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  youtube?: string;
  twitter?: string;
  website?: string;
  whatsapp?: string;
}

export interface CustomerDetails {
  fullName: string;
  profilePhotoUrl?: string;
  mobile1: string;
  mobile2?: string;
  email: string;
  profession: string;
  professionDescription: string;
  socialLinks: SocialLinks;
}

export type PaymentStatus = 'PENDING_PAYMENT' | 'PAID' | 'FAILED' | 'REFUNDED';

export type OrderStatus =
  | 'Pending Payment'
  | 'Paid'
  | 'Processing'
  | 'Card Designing'
  | 'Card Printing'
  | 'Dispatched'
  | 'Delivered'
  | 'Cancelled';

export interface OrderRecord {
  orderId: string;
  createdAt: string; // ISO date string
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  
  // Customer info
  customer: CustomerDetails;

  // Plan info
  plan: PlanTier;
  durationMonths: DurationOption;
  monthlyPrice: number;
  planTotal: number;

  // Cards
  numberOfCards: number; // 1 or 2
  card1: PhysicalCardConfig;
  card2?: PhysicalCardConfig;

  // Pricing breakdown
  subtotal: number;
  cardCharges: number;
  discount: number;
  couponCode?: string;
  couponDiscount?: number;
  finalAmount: number;

  // Payment
  paymentStatus: PaymentStatus;
  paymentId?: string;
  transactionId?: string; // UTR or gateway ref
  paymentVerifiedAt?: string;

  // Order Fulfillment
  orderStatus: OrderStatus;
  adminNotes?: string;
  
  // Google Sheets integration state
  syncedToGoogleSheet?: boolean;
  googleSheetSyncedAt?: string;
}

export interface AppConfig {
  plans: Record<PlanTier, { monthlyPrice: number; features: string[] }>;
  durationDiscounts: Record<DurationOption, number>; // discount percent
  cardPricing: {
    firstCardIncluded: boolean;
    plasticCardPrice: number; // 899
    plasticCardMrp: number;   // 999
    metalCardPrice: number;   // 1499
    metalCardMrp: number;     // 1699
    secondCardPlasticPrice: number;
    secondCardPlasticMrp: number;
    secondCardMetalPrice: number;
    secondCardMetalMrp: number;
  };
  upi: {
    vpa: string;
    merchantName: string;
    merchantCode: string;
  };
  googleSheets: {
    enabled: boolean;
    sheetUrl?: string;
    sheetId?: string;
    webhookUrl?: string;
    lastSyncedAt?: string;
  };
}

export interface AdminStats {
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  activePlans: Record<PlanTier, number>;
  totalCustomers: number;
}
