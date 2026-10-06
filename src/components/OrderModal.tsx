import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  PlanTier,
  PricingPlan,
  DurationOption,
  CardMaterial,
  PlasticColor,
  MetalColor,
  CustomerDetails,
  OrderRecord,
  AppConfig,
} from '../types';
import { DURATION_OPTIONS } from '../data/initialData';
import { CardVisualizer } from './CardVisualizer';
import { api } from '../services/api';
import { generateOrderPDF } from '../utils/pdfGenerator';
import {
  X,
  CheckCircle,
  AlertCircle,
  CreditCard,
  User,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  Upload,
  ExternalLink,
  Plus,
  Trash2,
  Copy,
  Check,
  Lock,
  Download,
  Eye,
  Tag,
  Gift,
  Sparkles,
} from 'lucide-react';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlan?: PlanTier;
  plans: PricingPlan[];
  config: AppConfig;
  onOrderSuccess: (order: OrderRecord) => void;
  onOpenProfileDemo?: (customer: CustomerDetails, plan: PlanTier) => void;
}

type Step = 1 | 2 | 3 | 4 | 5 | 6;

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  initialPlan = 'GOLD',
  plans,
  config,
  onOrderSuccess,
  onOpenProfileDemo,
}) => {
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // Step 1: Plan & Duration State
  const [selectedPlanId, setSelectedPlanId] = useState<PlanTier>(initialPlan);
  const [selectedDuration, setSelectedDuration] = useState<DurationOption>(12); // Default 1 Year

  // Step 2: Customer Information State
  const [customer, setCustomer] = useState<CustomerDetails>({
    fullName: '',
    profilePhotoUrl: '',
    mobile1: '',
    mobile2: '',
    email: '',
    profession: '',
    professionDescription: '',
    socialLinks: {
      linkedin: '',
      instagram: '',
      twitter: '',
      facebook: '',
      youtube: '',
      website: '',
      whatsapp: '',
    },
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step 3: Card Selection State
  const [card1Material, setCard1Material] = useState<CardMaterial>('PLASTIC');
  const [card1Color, setCard1Color] = useState<PlasticColor | MetalColor>('Black');
  const [card1Name, setCard1Name] = useState<string>('');
  const [card1LogoUrl, setCard1LogoUrl] = useState<string>('');
  const [card1LogoNotes, setCard1LogoNotes] = useState<string>('');

  const [addSecondCard, setAddSecondCard] = useState<boolean>(false);
  const [card2Material, setCard2Material] = useState<CardMaterial>('METAL');
  const [card2Color, setCard2Color] = useState<PlasticColor | MetalColor>('Gold');
  const [card2Name, setCard2Name] = useState<string>('');
  const [card2LogoUrl, setCard2LogoUrl] = useState<string>('');
  const [card2LogoNotes, setCard2LogoNotes] = useState<string>('');

  // Step 4 & 5: Created order & payment verification
  const [createdOrder, setCreatedOrder] = useState<OrderRecord | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [utrInput, setUtrInput] = useState<string>('');
  const [verificationLoading, setVerificationLoading] = useState<boolean>(false);
  const [verificationError, setVerificationError] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);

  // Coupon Code State (BETA10 makes Gold Membership Free, card charges apply)
  const [couponInput, setCouponInput] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponFeedback, setCouponFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Sync plan if initialPlan prop changes
  useEffect(() => {
    if (initialPlan) {
      setSelectedPlanId(initialPlan);
    }
  }, [initialPlan]);

  // Update coupon feedback when user toggles between plans
  useEffect(() => {
    if (appliedCoupon === 'BETA10') {
      if (selectedPlanId === 'GOLD') {
        setCouponFeedback({
          type: 'success',
          message:
            '🎉 Coupon BETA10 Applied! Gold Membership Subscription is 100% FREE! You only pay for your physical NFC card.',
        });
      } else {
        setCouponFeedback({
          type: 'info',
          message:
            '🎁 Coupon BETA10 gives 100% FREE Gold Membership! Switch to Gold Plan to activate ₹0 subscription.',
        });
      }
    }
  }, [selectedPlanId, appliedCoupon]);

  // When customer enters full name, automatically set default cardholder name if not edited
  useEffect(() => {
    if (customer.fullName && !card1Name) {
      setCard1Name(customer.fullName);
    }
    if (customer.fullName && !card2Name) {
      setCard2Name(customer.fullName);
    }
  }, [customer.fullName, card1Name, card2Name]);

  // Current selected plan object
  const currentPlan = plans.find((p) => p.id === selectedPlanId) || plans[1];
  const monthlyPrice = config.plans[selectedPlanId]?.monthlyPrice ?? currentPlan.monthlyPrice;

  // Calculation helpers
  const planTotal = monthlyPrice * selectedDuration;
  const discountPercent = config.durationDiscounts[selectedDuration] ?? 0;
  const discount = Math.round((planTotal * discountPercent) / 100);

  // Card pricing: Plastic ₹899 (MRP ₹999), Metal ₹1499 (MRP ₹1699)
  const plasticCardPrice = config.cardPricing.plasticCardPrice || 899;
  const plasticCardMrp = config.cardPricing.plasticCardMrp || 999;
  const metalCardPrice = config.cardPricing.metalCardPrice || 1499;
  const metalCardMrp = config.cardPricing.metalCardMrp || 1699;

  const secondCardPlasticPrice = config.cardPricing.secondCardPlasticPrice || 899;
  const secondCardPlasticMrp = config.cardPricing.secondCardPlasticMrp || 999;
  const secondCardMetalPrice = config.cardPricing.secondCardMetalPrice || 1499;
  const secondCardMetalMrp = config.cardPricing.secondCardMetalMrp || 1699;

  let cardCharges = card1Material === 'METAL' ? metalCardPrice : plasticCardPrice;
  if (addSecondCard) {
    cardCharges += card2Material === 'METAL' ? secondCardMetalPrice : secondCardPlasticPrice;
  }

  const subtotal = planTotal + cardCharges;

  // Coupon Discount Calculation:
  // BETA10 makes Gold Membership FREE (100% discount on subscription plan), card amount is charged!
  let couponDiscount = 0;
  if (appliedCoupon === 'BETA10') {
    if (selectedPlanId === 'GOLD') {
      couponDiscount = Math.max(0, planTotal - discount);
    }
  }

  const finalAmount = Math.max(0, subtotal - discount - couponDiscount);

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) {
      setCouponFeedback({ type: 'error', message: 'Please enter a coupon code.' });
      return;
    }

    if (code === 'BETA10') {
      setAppliedCoupon('BETA10');
      setCouponInput('BETA10');
      if (selectedPlanId === 'GOLD') {
        setCouponFeedback({
          type: 'success',
          message:
            '🎉 Coupon BETA10 Applied! Gold Membership Subscription is 100% FREE! You only pay for your physical NFC card.',
        });
      } else {
        setCouponFeedback({
          type: 'info',
          message:
            '🎁 Coupon BETA10 gives 100% FREE Gold Membership! Switch to Gold Plan to activate ₹0 subscription.',
        });
      }
    } else {
      setCouponFeedback({
        type: 'error',
        message: 'Invalid coupon code. Try using BETA10 to get Gold membership for free!',
      });
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponFeedback(null);
  };

  // Handle Photo Upload (data URL)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCustomer((prev) => ({ ...prev, profilePhotoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCard1LogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCard1LogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCard2LogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCard2LogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Validation for Step 2
  const validateStep2 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!customer.fullName.trim()) errs.fullName = 'Full Name is required';
    if (!customer.profession.trim()) errs.profession = 'Profession is required';
    if (!customer.professionDescription.trim()) errs.professionDescription = 'Bio / description is required';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customer.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!emailRegex.test(customer.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    // Mobile 1 validation (Indian 10-digit or valid international)
    const phoneClean = customer.mobile1.replace(/[\s+-]/g, '');
    if (!customer.mobile1.trim()) {
      errs.mobile1 = 'Primary mobile number is required';
    } else if (phoneClean.length < 10) {
      errs.mobile1 = 'Please enter a valid 10-digit mobile number';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Proceed to Step 4 (Order Summary)
  const handleProceedToSummary = () => {
    // Generate draft order on step 4
    setCurrentStep(4);
  };

  // Initiate Payment / Create Order on Backend
  const handleInitiatePayment = async () => {
    setIsSubmittingOrder(true);
    try {
      const order = await api.createOrder({
        plan: selectedPlanId,
        durationMonths: selectedDuration,
        customer,
        card1: {
          material: card1Material,
          color: card1Color,
          printedName: card1Name || customer.fullName,
          logoUrl: card1LogoUrl,
          logoNotes: card1LogoNotes,
        },
        card2: addSecondCard
          ? {
              material: card2Material,
              color: card2Color,
              printedName: card2Name || customer.fullName,
              logoUrl: card2LogoUrl,
              logoNotes: card2LogoNotes,
            }
          : undefined,
        numberOfCards: addSecondCard ? 2 : 1,
        couponCode: appliedCoupon || undefined,
      });

      setCreatedOrder(order);

      // Generate dynamic UPI QR Code
      const upiUrl = `upi://pay?cu=INR&mc=5817&mode=19&pa=${encodeURIComponent(
        config.upi.vpa
      )}&pn=${encodeURIComponent('Tapmatein')}&tn=${encodeURIComponent(
        `Order ${order.orderId}`
      )}&tr=${order.orderId}&am=${order.finalAmount}`;

      const qr = await QRCode.toDataURL(upiUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#020617',
          light: '#ffffff',
        },
      });
      setQrCodeDataUrl(qr);
      setCurrentStep(5);
    } catch (err: any) {
      alert(err.message || 'Failed to initiate checkout. Please try again.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Verify Payment on Backend
  const handleVerifyPayment = async () => {
    if (!createdOrder) return;
    if (!utrInput.trim()) {
      setVerificationError('Please enter your 12-digit UPI Transaction ID or Bank UTR number.');
      return;
    }

    setVerificationLoading(true);
    setVerificationError('');

    try {
      const res = await api.verifyPayment(createdOrder.orderId, utrInput.trim());
      if (res.success && res.order) {
        setCreatedOrder(res.order);
        onOrderSuccess(res.order);
        setCurrentStep(6);
      }
    } catch (err: any) {
      setVerificationError(
        err.message ||
          'Payment verification failed. Please verify that your UTR number is correct or contact TapMate support.'
      );
    } finally {
      setVerificationLoading(false);
    }
  };

  // Helper for fast test simulation of payment
  const handleSimulateGatewaySuccess = () => {
    const fakeUtr = 'UTR' + Math.floor(100000000000 + Math.random() * 900000000000);
    setUtrInput(fakeUtr);
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(config.upi.vpa);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header with Step Tracker */}
        <div className="px-6 py-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 font-['Space_Grotesk'] font-bold text-lg text-white">
              <span>TapMate</span>
              <span className="text-cyan-400">.in</span>
            </div>
            <span className="text-xs text-slate-500 hidden sm:inline">|</span>
            <span className="text-xs font-semibold text-slate-400 hidden sm:inline uppercase tracking-wider">
              {currentStep === 1 && 'Step 1: Choose Duration'}
              {currentStep === 2 && 'Step 2: Profile & Details'}
              {currentStep === 3 && 'Step 3: Physical NFC Cards'}
              {currentStep === 4 && 'Step 4: Order Summary'}
              {currentStep === 5 && 'Step 5: UPI Payment'}
              {currentStep === 6 && 'Step 6: Order Confirmed'}
            </span>
          </div>

          {/* Progress Indicators */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {[1, 2, 3, 4, 5, 6].map((stepNum) => (
              <div
                key={stepNum}
                className={`w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full transition-all ${
                  stepNum === currentStep
                    ? 'bg-cyan-400 w-5 sm:w-6'
                    : stepNum < currentStep
                    ? 'bg-emerald-400'
                    : 'bg-slate-700'
                }`}
              />
            ))}
            <button
              onClick={onClose}
              className="ml-3 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* ======================================================== */}
          {/* STEP 1: PLAN & DURATION SELECTION */}
          {/* ======================================================== */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-white font-['Space_Grotesk']">
                  Select Subscription Duration
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  Choose how long you want your TapMate dynamic profile and cloud services active.
                </p>
              </div>

              {/* Plan Switcher Pills */}
              <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800">
                {plans.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPlanId(p.id)}
                    className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${
                      selectedPlanId === p.id
                        ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{p.name}</span>
                    <span className="opacity-80 text-[11px]">₹{p.monthlyPrice}/mo</span>
                  </button>
                ))}
              </div>

              {/* Duration Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {DURATION_OPTIONS.map((opt) => {
                  const isSelected = selectedDuration === opt.months;
                  const rawTotal = monthlyPrice * opt.months;
                  const optDiscount = Math.round((rawTotal * (config.durationDiscounts[opt.months] || 0)) / 100);
                  const optNet = rawTotal - optDiscount;

                  return (
                    <div
                      key={opt.months}
                      onClick={() => setSelectedDuration(opt.months)}
                      className={`relative rounded-2xl p-4 sm:p-5 border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-400 shadow-lg shadow-cyan-500/10 ring-2 ring-cyan-400/40'
                          : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {opt.badge && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mb-2 self-start ${
                            opt.months === 12
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-cyan-500/20 text-cyan-300'
                          }`}
                        >
                          {opt.badge}
                        </span>
                      )}

                      <div>
                        <div className="text-lg font-bold text-white font-['Space_Grotesk']">
                          {opt.label}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          ₹{monthlyPrice} &times; {opt.months} month{opt.months > 1 ? 's' : ''}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-baseline justify-between">
                        <div>
                          {optDiscount > 0 && (
                            <span className="text-xs text-slate-500 line-through mr-1.5">
                              ₹{rawTotal}
                            </span>
                          )}
                          <span className="text-xl font-bold text-white font-['Space_Grotesk']">
                            ₹{optNet}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Promo Coupon Section in Step 1 */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-950 to-cyan-950/30 border border-amber-500/30 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                    <Tag className="w-4 h-4 text-amber-400" />
                    <span>Have a Promo Coupon?</span>
                  </div>
                  {!appliedCoupon ? (
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon('BETA10')}
                      className="text-xs font-extrabold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Click to Apply: BETA10 (Gold Free!)</span>
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Coupon &quot;{appliedCoupon}&quot; Active</span>
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Coupon Code (e.g. BETA10)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                  {!appliedCoupon ? (
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon()}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer transition shadow"
                    >
                      Apply
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-semibold cursor-pointer transition"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {couponFeedback && (
                  <div
                    className={`text-xs p-2.5 rounded-xl flex items-center justify-between gap-2 ${
                      couponFeedback.type === 'success'
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                        : couponFeedback.type === 'info'
                        ? 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                        : 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    <span>{couponFeedback.message}</span>
                    {couponFeedback.type === 'info' && selectedPlanId !== 'GOLD' && (
                      <button
                        type="button"
                        onClick={() => setSelectedPlanId('GOLD')}
                        className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-bold text-[11px] whitespace-nowrap cursor-pointer hover:bg-amber-300"
                      >
                        Switch to Gold
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Dynamic Calculation Breakdown */}
              <div className="bg-slate-950/80 rounded-2xl p-5 border border-slate-800 space-y-2.5">
                <div className="flex justify-between text-sm text-slate-300">
                  <span>Selected Plan:</span>
                  <span className="font-semibold text-white">
                    {currentPlan.name} Plan (₹{monthlyPrice} / month)
                  </span>
                </div>
                <div className="flex justify-between text-sm text-slate-300">
                  <span>Selected Duration:</span>
                  <span className="font-semibold text-white">
                    {selectedDuration} Month{selectedDuration > 1 ? 's' : ''}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-400">
                    <span>Duration Discount ({discountPercent}%):</span>
                    <span>- ₹{discount}</span>
                  </div>
                )}
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-400 font-semibold">
                    <span>BETA10 Special Offer (Gold Membership Free):</span>
                    <span>- ₹{couponDiscount} (100% FREE)</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-800 flex justify-between text-base font-bold text-white items-baseline">
                  <span>Subscription Plan Total:</span>
                  <div className="flex items-baseline gap-2">
                    {couponDiscount > 0 && (
                      <span className="text-sm text-slate-500 line-through">
                        ₹{planTotal - discount}
                      </span>
                    )}
                    <span
                      className={`text-lg font-['Space_Grotesk'] ${
                        couponDiscount > 0 ? 'text-emerald-400 font-extrabold' : 'text-cyan-400'
                      }`}
                    >
                      ₹{Math.max(0, planTotal - discount - couponDiscount)}{' '}
                      {couponDiscount > 0 ? '(FREE)' : ''}
                    </span>
                  </div>
                </div>
                {couponDiscount > 0 && (
                  <p className="text-[11px] text-amber-400/90 pt-1">
                    * Note: Gold Membership subscription is 100% free! Physical NFC card charge (Plastic ₹899 / Metal ₹1,499) applies on Step 3.
                  </p>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="py-3.5 px-8 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-2 cursor-pointer transition shadow-lg shadow-cyan-500/20"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 2: CUSTOMER INFORMATION */}
          {/* ======================================================== */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-white font-['Space_Grotesk']">
                  Customer &amp; Profile Details
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  This information will be encoded into your NFC profile and printed on your card.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mukul Sharma"
                    value={customer.fullName}
                    onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl bg-slate-950 border text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                      errors.fullName ? 'border-rose-500' : 'border-slate-800'
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Profession */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Profession / Job Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Chief Executive Officer / Advocate"
                    value={customer.profession}
                    onChange={(e) => setCustomer({ ...customer, profession: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl bg-slate-950 border text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                      errors.profession ? 'border-rose-500' : 'border-slate-800'
                    }`}
                  />
                  {errors.profession && (
                    <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.profession}
                    </p>
                  )}
                </div>

                {/* Mobile 1 */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Primary Mobile Number <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={customer.mobile1}
                    onChange={(e) => setCustomer({ ...customer, mobile1: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl bg-slate-950 border text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                      errors.mobile1 ? 'border-rose-500' : 'border-slate-800'
                    }`}
                  />
                  {errors.mobile1 && (
                    <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.mobile1}
                    </p>
                  )}
                </div>

                {/* Mobile 2 */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Secondary Mobile (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876500000"
                    value={customer.mobile2 || ''}
                    onChange={(e) => setCustomer({ ...customer, mobile2: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                {/* Email Address */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Email Address <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. contact@tapmate.in"
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl bg-slate-950 border text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                      errors.email ? 'border-rose-500' : 'border-slate-800'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.email}
                    </p>
                  )}
                </div>

                {/* Profession Description / Bio */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Profession Description / Bio <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tell your clients and network what you do, your achievements, or your company mission..."
                    value={customer.professionDescription}
                    onChange={(e) =>
                      setCustomer({ ...customer, professionDescription: e.target.value })
                    }
                    className={`w-full px-4 py-3 rounded-xl bg-slate-950 border text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                      errors.professionDescription ? 'border-rose-500' : 'border-slate-800'
                    }`}
                  />
                  {errors.professionDescription && (
                    <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.professionDescription}
                    </p>
                  )}
                </div>

                {/* Profile Photo Upload */}
                <div className="md:col-span-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-cyan-500/40 flex items-center justify-center overflow-hidden shrink-0">
                    {customer.profilePhotoUrl ? (
                      <img
                        src={customer.profilePhotoUrl}
                        alt="Profile Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-slate-500" />
                    )}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <div className="text-sm font-semibold text-white">Profile Photo</div>
                    <div className="text-xs text-slate-400">
                      Upload your headshot or logo to display on your digital vCard webpage.
                    </div>
                  </div>
                  <label className="cursor-pointer py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-bold border border-slate-700 transition flex items-center gap-2">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Social Media Links Section */}
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-bold text-white">Social Media Links</h4>
                    <p className="text-xs text-slate-400">
                      Add only the social links you want on your card. (Allowed on {currentPlan.name}: up to{' '}
                      {currentPlan.maxSocialLinks === 99 ? 'Unlimited' : currentPlan.maxSocialLinks})
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-xs font-medium text-slate-400 block mb-1">
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/username"
                      value={customer.socialLinks.linkedin || ''}
                      onChange={(e) =>
                        setCustomer({
                          ...customer,
                          socialLinks: { ...customer.socialLinks, linkedin: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-400 block mb-1">
                      Instagram Profile
                    </label>
                    <input
                      type="url"
                      placeholder="https://instagram.com/username"
                      value={customer.socialLinks.instagram || ''}
                      onChange={(e) =>
                        setCustomer({
                          ...customer,
                          socialLinks: { ...customer.socialLinks, instagram: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-400 block mb-1">
                      Website URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://yourcompany.com"
                      value={customer.socialLinks.website || ''}
                      onChange={(e) =>
                        setCustomer({
                          ...customer,
                          socialLinks: { ...customer.socialLinks, website: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-400 block mb-1">
                      WhatsApp Number / Link
                    </label>
                    <input
                      type="text"
                      placeholder="+919876543210"
                      value={customer.socialLinks.whatsapp || ''}
                      onChange={(e) =>
                        setCustomer({
                          ...customer,
                          socialLinks: { ...customer.socialLinks, whatsapp: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-400 block mb-1">
                      X / Twitter
                    </label>
                    <input
                      type="url"
                      placeholder="https://x.com/username"
                      value={customer.socialLinks.twitter || ''}
                      onChange={(e) =>
                        setCustomer({
                          ...customer,
                          socialLinks: { ...customer.socialLinks, twitter: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-400 block mb-1">
                      YouTube Channel
                    </label>
                    <input
                      type="url"
                      placeholder="https://youtube.com/@channel"
                      value={customer.socialLinks.youtube || ''}
                      onChange={(e) =>
                        setCustomer({
                          ...customer,
                          socialLinks: { ...customer.socialLinks, youtube: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="py-3 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold flex items-center gap-2 cursor-pointer transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (validateStep2()) {
                      setCurrentStep(3);
                    }
                  }}
                  className="py-3 px-8 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-2 cursor-pointer transition shadow-lg shadow-cyan-500/20"
                >
                  <span>Continue to Card Selection</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 3: CARD SELECTION (CARD 1 & OPTIONAL CARD 2) */}
          {/* ======================================================== */}
          {currentStep === 3 && (
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-white font-['Space_Grotesk']">
                  Customize Physical NFC Cards
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  Choose your card material, finish color, printed name, and optional custom logo.
                </p>
              </div>

              {/* CARD 1 SECTION */}
              <div className="bg-slate-950/60 p-6 rounded-3xl border border-slate-800 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 text-xs font-extrabold flex items-center justify-center">
                      1
                    </span>
                    <h4 className="text-lg font-bold text-white font-['Space_Grotesk']">
                      Card 1 Customization
                    </h4>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    Primary Card
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Left: Card visual preview */}
                  <div className="lg:col-span-6 flex flex-col items-center">
                    <CardVisualizer
                      material={card1Material}
                      color={card1Color}
                      printedName={card1Name || customer.fullName || 'YOUR NAME'}
                      logoUrl={card1LogoUrl}
                    />
                  </div>

                  {/* Right: Controls for Card 1 */}
                  <div className="lg:col-span-6 space-y-4">
                    {/* Material Selection */}
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                        Choose Material:
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setCard1Material('PLASTIC');
                            setCard1Color('Black');
                          }}
                          className={`p-3 rounded-2xl border text-left cursor-pointer transition ${
                            card1Material === 'PLASTIC'
                              ? 'bg-cyan-950/30 border-cyan-400 ring-1 ring-cyan-400 text-white'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm">PLASTIC</span>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-xs text-slate-500 line-through">
                                ₹{plasticCardMrp}
                              </span>
                              <span className="text-sm font-bold text-cyan-400">
                                ₹{plasticCardPrice}
                              </span>
                            </div>
                          </div>
                          <div className="text-[11px] opacity-75 mt-0.5">
                            Matte PVC &bull; Waterproof &bull; Save ₹{plasticCardMrp - plasticCardPrice}
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setCard1Material('METAL');
                            setCard1Color('Black');
                          }}
                          className={`p-3 rounded-2xl border text-left cursor-pointer transition ${
                            card1Material === 'METAL'
                              ? 'bg-amber-950/30 border-amber-400 ring-1 ring-amber-400 text-white'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm">METAL</span>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-xs text-slate-500 line-through">
                                ₹{metalCardMrp}
                              </span>
                              <span className="text-sm font-bold text-amber-400">
                                ₹{metalCardPrice}
                              </span>
                            </div>
                          </div>
                          <div className="text-[11px] opacity-75 mt-0.5">
                            Laser-Etched Stainless Steel &bull; Save ₹{metalCardMrp - metalCardPrice}
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Color Selection */}
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                        Available Colors:
                      </label>
                      <div className="flex flex-wrap gap-2.5">
                        {card1Material === 'PLASTIC'
                          ? (['White', 'Black', 'Blue'] as PlasticColor[]).map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => setCard1Color(c)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer transition flex items-center gap-2 ${
                                  card1Color === c
                                    ? 'bg-slate-800 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400'
                                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                                }`}
                              >
                                <span
                                  className={`w-3 h-3 rounded-full border border-black/40 ${
                                    c === 'White'
                                      ? 'bg-white'
                                      : c === 'Black'
                                      ? 'bg-zinc-900'
                                      : 'bg-blue-600'
                                  }`}
                                />
                                <span>{c}</span>
                              </button>
                            ))
                          : (['Black', 'Gold', 'Silver'] as MetalColor[]).map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => setCard1Color(c)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer transition flex items-center gap-2 ${
                                  card1Color === c
                                    ? 'bg-slate-800 border-amber-400 text-amber-300 ring-1 ring-amber-400'
                                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                                }`}
                              >
                                <span
                                  className={`w-3 h-3 rounded-full border border-black/40 ${
                                    c === 'Gold'
                                      ? 'bg-yellow-500'
                                      : c === 'Black'
                                      ? 'bg-neutral-900'
                                      : 'bg-slate-300'
                                  }`}
                                />
                                <span>{c}</span>
                              </button>
                            ))}
                      </div>
                    </div>

                    {/* Printed Name */}
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                        Printed / Engraved Name on Card:
                      </label>
                      <input
                        type="text"
                        placeholder={customer.fullName || 'Full Name'}
                        value={card1Name}
                        onChange={(e) => setCard1Name(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs uppercase tracking-wider font-mono focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>

                    {/* Logo upload / notes */}
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                        Custom Logo / Engraving Notes:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. Centered company crest / minimalist monogram"
                          value={card1LogoNotes}
                          onChange={(e) => setCard1LogoNotes(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:ring-1 focus:ring-cyan-500"
                        />
                        <label className="cursor-pointer py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 shrink-0">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Logo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleCard1LogoUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 2 SECTION (OPTIONAL) */}
              <div className="bg-slate-950/60 p-6 rounded-3xl border border-slate-800 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center">
                      2
                    </span>
                    <h4 className="text-lg font-bold text-white font-['Space_Grotesk']">
                      Card 2 (Optional)
                    </h4>
                  </div>

                  {!addSecondCard ? (
                    <button
                      type="button"
                      onClick={() => setAddSecondCard(true)}
                      className="py-1.5 px-4 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Second Card</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAddSecondCard(false)}
                      className="py-1.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Second Card</span>
                    </button>
                  )}
                </div>

                {addSecondCard ? (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
                    {/* Visualizer for Card 2 */}
                    <div className="lg:col-span-6 flex flex-col items-center">
                      <CardVisualizer
                        material={card2Material}
                        color={card2Color}
                        printedName={card2Name || customer.fullName || 'CARD 2 NAME'}
                        logoUrl={card2LogoUrl}
                      />
                    </div>

                    {/* Controls for Card 2 */}
                    <div className="lg:col-span-6 space-y-4">
                      {/* Material for Card 2 */}
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                          Card 2 Material:
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setCard2Material('PLASTIC');
                              setCard2Color('White');
                            }}
                            className={`p-3 rounded-2xl border text-left cursor-pointer transition ${
                              card2Material === 'PLASTIC'
                                ? 'bg-cyan-950/30 border-cyan-400 ring-1 ring-cyan-400 text-white'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            <div className="font-bold text-sm flex items-center justify-between">
                              <span>PLASTIC</span>
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-xs text-slate-500 line-through">
                                  ₹{secondCardPlasticMrp}
                                </span>
                                <span className="text-sm font-bold text-cyan-400">
                                  +₹{secondCardPlasticPrice}
                                </span>
                              </div>
                            </div>
                            <div className="text-[11px] opacity-75">
                              Matte White / Black / Blue &bull; Save ₹{secondCardPlasticMrp - secondCardPlasticPrice}
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setCard2Material('METAL');
                              setCard2Color('Gold');
                            }}
                            className={`p-3 rounded-2xl border text-left cursor-pointer transition ${
                              card2Material === 'METAL'
                                ? 'bg-amber-950/30 border-amber-400 ring-1 ring-amber-400 text-white'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            <div className="font-bold text-sm flex items-center justify-between">
                              <span>METAL</span>
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-xs text-slate-500 line-through">
                                  ₹{secondCardMetalMrp}
                                </span>
                                <span className="text-sm font-bold text-amber-400">
                                  +₹{secondCardMetalPrice}
                                </span>
                              </div>
                            </div>
                            <div className="text-[11px] opacity-75">
                              Brushed Stainless Metal &bull; Save ₹{secondCardMetalMrp - secondCardMetalPrice}
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Color for Card 2 */}
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                          Card 2 Color:
                        </label>
                        <div className="flex flex-wrap gap-2.5">
                          {card2Material === 'PLASTIC'
                            ? (['White', 'Black', 'Blue'] as PlasticColor[]).map((c) => (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => setCard2Color(c)}
                                  className={`px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer transition flex items-center gap-2 ${
                                    card2Color === c
                                      ? 'bg-slate-800 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400'
                                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                                  }`}
                                >
                                  <span
                                    className={`w-3 h-3 rounded-full border border-black/40 ${
                                      c === 'White'
                                        ? 'bg-white'
                                        : c === 'Black'
                                        ? 'bg-zinc-900'
                                        : 'bg-blue-600'
                                    }`}
                                  />
                                  <span>{c}</span>
                                </button>
                              ))
                            : (['Black', 'Gold', 'Silver'] as MetalColor[]).map((c) => (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => setCard2Color(c)}
                                  className={`px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer transition flex items-center gap-2 ${
                                    card2Color === c
                                      ? 'bg-slate-800 border-amber-400 text-amber-300 ring-1 ring-amber-400'
                                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                                  }`}
                                >
                                  <span
                                    className={`w-3 h-3 rounded-full border border-black/40 ${
                                      c === 'Gold'
                                        ? 'bg-yellow-500'
                                        : c === 'Black'
                                        ? 'bg-neutral-900'
                                        : 'bg-slate-300'
                                    }`}
                                  />
                                  <span>{c}</span>
                                </button>
                              ))}
                        </div>
                      </div>

                      {/* Printed Name Card 2 */}
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                          Printed Name on Card 2:
                        </label>
                        <input
                          type="text"
                          placeholder={customer.fullName || 'Name'}
                          value={card2Name}
                          onChange={(e) => setCard2Name(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs uppercase tracking-wider font-mono focus:ring-1 focus:ring-cyan-500"
                        />
                      </div>

                      {/* Logo Card 2 */}
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                          Logo / Branding for Card 2:
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. Same logo or custom text"
                            value={card2LogoNotes}
                            onChange={(e) => setCard2LogoNotes(e.target.value)}
                            className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:ring-1 focus:ring-cyan-500"
                          />
                          <label className="cursor-pointer py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 shrink-0">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Logo</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleCard2LogoUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    You can add an extra backup card or secondary color for meetings and events.
                  </p>
                )}
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="py-3 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold flex items-center gap-2 cursor-pointer transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleProceedToSummary}
                  className="py-3 px-8 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-2 cursor-pointer transition shadow-lg shadow-cyan-500/20"
                >
                  <span>Review Order Summary</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 4: COMPLETE ORDER SUMMARY */}
          {/* ======================================================== */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-white font-['Space_Grotesk']">
                  Order Summary &amp; Review
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  Please review your contact information, chosen physical cards, and dynamic billing breakdown.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Customer & Plan Details */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Customer Information Card */}
                  <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      <span>Customer &amp; Profile Details</span>
                    </div>

                    <div className="flex items-start gap-4 pt-1">
                      {customer.profilePhotoUrl ? (
                        <img
                          src={customer.profilePhotoUrl}
                          alt={customer.fullName}
                          className="w-14 h-14 rounded-full object-cover border-2 border-cyan-400/40 shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                          <User className="w-7 h-7 text-slate-500" />
                        </div>
                      )}
                      <div className="space-y-1">
                        <div className="text-base font-bold text-white">{customer.fullName}</div>
                        <div className="text-xs text-cyan-300 font-medium">
                          {customer.profession}
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2">
                          {customer.professionDescription}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                      <div>
                        <span className="text-slate-500 block">Mobile 1:</span>
                        <span className="font-mono">{customer.mobile1}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Mobile 2:</span>
                        <span className="font-mono">{customer.mobile2 || 'None'}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500 block">Email:</span>
                        <span className="font-mono">{customer.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Physical Cards Config Card */}
                  <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Physical NFC Cards Configured ({addSecondCard ? '2 Cards' : '1 Card'})</span>
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <div>
                          <span className="font-bold text-white">Card 1: </span>
                          <span className="text-cyan-300">
                            {card1Material} &bull; {card1Color}
                          </span>
                          <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                            Name: {card1Name || customer.fullName}
                          </div>
                        </div>
                        <span className="text-slate-300 font-semibold font-mono">
                          ₹{card1Material === 'METAL' ? metalCardPrice : plasticCardPrice}
                        </span>
                      </div>

                      {addSecondCard && (
                        <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                          <div>
                            <span className="font-bold text-white">Card 2: </span>
                            <span className="text-amber-300">
                              {card2Material} &bull; {card2Color}
                            </span>
                            <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                              Name: {card2Name || customer.fullName}
                            </div>
                          </div>
                          <span className="text-slate-300 font-semibold font-mono">
                            +₹{card2Material === 'METAL' ? secondCardMetalPrice : secondCardPlasticPrice}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Coupon Code section in Step 4 if not applied yet */}
                  {!appliedCoupon ? (
                    <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-amber-500/30 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-amber-400 shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-white">Use Coupon BETA10</div>
                          <div className="text-[10px] text-slate-400">
                            Get Gold Membership 100% FREE!
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon('BETA10')}
                        className="py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer transition whitespace-nowrap shadow"
                      >
                        Apply BETA10
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs text-emerald-300 font-semibold">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>
                          Coupon &quot;{appliedCoupon}&quot; Applied!{' '}
                          {selectedPlanId === 'GOLD'
                            ? 'Gold Membership Free'
                            : '(Valid on Gold plan)'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-[11px] text-rose-400 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* Right: Dynamic Financial Bill Breakdown */}
                <div className="lg:col-span-5 bg-slate-950 p-6 rounded-2xl border border-cyan-500/30 flex flex-col justify-between space-y-6">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div>
                        <div className="text-xs uppercase font-mono text-slate-400">
                          Checkout Draft
                        </div>
                        <div className="text-lg font-bold text-white font-['Space_Grotesk']">
                          {currentPlan.name} Plan
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-400">Duration</div>
                        <div className="text-sm font-bold text-cyan-400">
                          {selectedDuration} Months
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2.5 text-sm text-slate-300">
                      <div className="flex justify-between">
                        <span>
                          Plan Base (₹{monthlyPrice} &times; {selectedDuration} mo):
                        </span>
                        <span className="font-mono text-white">₹{planTotal}</span>
                      </div>

                      <div className="flex justify-between">
                        <span>Physical Card Charges:</span>
                        <span className="font-mono text-white">₹{cardCharges}</span>
                      </div>

                      <div className="flex justify-between font-medium">
                        <span>Subtotal:</span>
                        <span className="font-mono text-white">₹{subtotal}</span>
                      </div>

                      {discount > 0 && (
                        <div className="flex justify-between text-emerald-400">
                          <span>Duration Savings ({discountPercent}%):</span>
                          <span className="font-mono">- ₹{discount}</span>
                        </div>
                      )}

                      {couponDiscount > 0 && (
                        <div className="flex justify-between text-emerald-400 font-bold bg-emerald-950/30 p-2 rounded-xl border border-emerald-500/20">
                          <span>BETA10 (Gold Membership Free):</span>
                          <span className="font-mono">- ₹{couponDiscount} (100% OFF)</span>
                        </div>
                      )}

                      <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                        <div>
                          <span className="text-base font-bold text-white block">Final Payable:</span>
                          {couponDiscount > 0 && (
                            <span className="text-[10px] text-amber-400 font-medium">
                              (Only Card Charges Applied)
                            </span>
                          )}
                        </div>
                        <span className="text-3xl font-extrabold text-cyan-400 font-['Space_Grotesk']">
                          ₹{finalAmount}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Secure UPI Payment Architecture</span>
                      </div>
                      <p>
                        Payment verification is enforced securely through server-side transaction matching. No false payment statuses.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      type="button"
                      disabled={isSubmittingOrder}
                      onClick={handleInitiatePayment}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-base tracking-wide flex items-center justify-center gap-2 cursor-pointer transition shadow-xl shadow-cyan-500/25"
                    >
                      {isSubmittingOrder ? (
                        <span>Preparing UPI Checkout...</span>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>PROCEED TO PAY ₹{finalAmount}</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="w-full py-2.5 text-xs text-slate-400 hover:text-white transition cursor-pointer"
                    >
                      &larr; Modify Cards or Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 5: UPI PAYMENT & STRICT VERIFICATION */}
          {/* ======================================================== */}
          {currentStep === 5 && createdOrder && (
            <div className="space-y-6">
              <div className="text-center max-w-xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-2">
                  <CreditCard className="w-3.5 h-3.5" />
                  Order ID: {createdOrder.orderId}
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk']">
                  Pay via UPI &bull; ₹{createdOrder.finalAmount}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Scan the UPI QR code below with any UPI App (Google Pay, PhonePe, Paytm, CRED) or tap to pay directly on mobile.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center max-w-3xl mx-auto">
                {/* QR Code Presentation */}
                <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex flex-col items-center text-center shadow-xl">
                  <div className="bg-white p-3.5 rounded-2xl shadow-inner border-2 border-slate-200">
                    {qrCodeDataUrl ? (
                      <img
                        src={qrCodeDataUrl}
                        alt="UPI Payment QR Code"
                        className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                      />
                    ) : (
                      <div className="w-48 h-48 sm:w-56 sm:h-56 bg-slate-100 flex items-center justify-center text-xs text-slate-500">
                        Generating QR...
                      </div>
                    )}
                  </div>

                  {/* UPI VPA Pill */}
                  <div className="mt-4 flex items-center gap-2 bg-slate-900 py-1.5 px-3 rounded-xl border border-slate-800 text-xs font-mono text-slate-300">
                    <span>{config.upi.vpa}</span>
                    <button
                      type="button"
                      onClick={copyUpiId}
                      className="text-cyan-400 hover:text-cyan-300 cursor-pointer"
                      title="Copy UPI ID"
                    >
                      {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="mt-2 text-[11px] text-slate-500">
                    Receiver: <span className="text-slate-300 font-semibold">{config.upi.merchantName}</span>
                  </div>

                  {/* Mobile Deep Link */}
                  <a
                    href={`upi://pay?cu=INR&mc=5817&mode=19&pa=${encodeURIComponent(
                      config.upi.vpa
                    )}&pn=${encodeURIComponent('Tapmatein')}&tn=${encodeURIComponent(
                      `Payment To Tapmatein ${createdOrder.orderId}`
                    )}&tr=${createdOrder.orderId}&am=${createdOrder.finalAmount}`}
                    className="mt-4 w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    <span>Open in Mobile UPI App</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Verification Panel */}
                <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-5">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Security &amp; Payment Verification</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      To prevent fraud and protect your order, our backend verifies every transaction. Please enter the 12-digit UTR or Reference Number from your payment confirmation screen.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-slate-300 block">
                      12-Digit UPI Ref / Bank UTR Number: <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 629104817721"
                      value={utrInput}
                      onChange={(e) => setUtrInput(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-sm tracking-wider focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />

                    {verificationError && (
                      <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                        <span>{verificationError}</span>
                      </div>
                    )}

                    {/* Developer/Testing Simulation helper */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={handleSimulateGatewaySuccess}
                        className="text-[11px] text-cyan-400/80 hover:text-cyan-300 underline cursor-pointer"
                      >
                        [Test Simulation: Fill Valid Gateway UTR]
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      disabled={verificationLoading}
                      onClick={handleVerifyPayment}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition shadow-lg shadow-emerald-500/20"
                    >
                      {verificationLoading ? (
                        <span>Verifying with Banking Network...</span>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>VERIFY PAYMENT &amp; FINALIZE ORDER</span>
                        </>
                      )}
                    </button>

                    <p className="text-[10px] text-center text-slate-500">
                      Payment status is updated only upon cryptographic bank confirmation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 6: PAYMENT SUCCESS & THANK YOU PAGE */}
          {/* ======================================================== */}
          {currentStep === 6 && createdOrder && (
            <div className="text-center py-6 px-4 space-y-6 max-w-2xl mx-auto animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20">
                <Check className="w-10 h-10 stroke-[3]" />
              </div>

              <div>
                <h3 className="text-3xl sm:text-4xl font-extrabold text-white font-['Space_Grotesk']">
                  Thank You! 🎉
                </h3>
                <p className="text-lg text-emerald-400 font-semibold mt-1">
                  Your TapMate order has been successfully placed.
                </p>
                <p className="text-sm text-slate-400 mt-2 max-w-lg mx-auto">
                  Your information has been received successfully. Our team will process your TapMate Digital Business Card shortly.
                </p>
              </div>

              {/* Verified Receipt Card */}
              <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 text-left space-y-3 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-xs text-slate-500 font-mono">ORDER ID</span>
                    <div className="text-base font-bold text-white font-mono">
                      {createdOrder.orderId}
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
                    Payment Status: PAID
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs text-slate-300 pt-1">
                  <div>
                    <span className="text-slate-500 block">Customer Name:</span>
                    <span className="font-semibold text-white">{createdOrder.customer.fullName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Selected Plan:</span>
                    <span className="font-semibold text-white">{createdOrder.plan} Plan</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Duration:</span>
                    <span className="font-semibold text-white">
                      {createdOrder.durationMonths} Months
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Number of Cards:</span>
                    <span className="font-semibold text-white">
                      {createdOrder.numberOfCards} NFC Card{createdOrder.numberOfCards > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Amount Paid:</span>
                    <span className="font-bold text-cyan-400 text-sm">
                      ₹{createdOrder.finalAmount}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Bank Transaction ID / UTR:</span>
                    <span className="font-mono text-slate-300">
                      {createdOrder.transactionId || 'N/A'}
                    </span>
                  </div>
                </div>

                {createdOrder.syncedToGoogleSheet && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-2 text-xs text-emerald-400">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Automatically synchronized to TapMate Google Sheet Database.</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                {onOpenProfileDemo && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenProfileDemo(createdOrder.customer, createdOrder.plan);
                    }}
                    className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition shadow-lg shadow-cyan-500/20"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Preview Your Live Digital Profile</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => generateOrderPDF(createdOrder)}
                  className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition shadow-lg shadow-emerald-500/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Official PDF Dossier</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-sm cursor-pointer transition border border-slate-800"
                >
                  Back to Home
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
