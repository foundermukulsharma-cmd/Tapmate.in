/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { PhysicalCardsShowcase } from './components/PhysicalCardsShowcase';
import { HowItWorks } from './components/HowItWorks';
import { PricingSection } from './components/PricingSection';
import { Testimonials } from './components/Testimonials';
import { FAQSection } from './components/FAQSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { OrderModal } from './components/OrderModal';
import { AdminPanel } from './components/AdminPanel';
import { DigitalProfilePreviewModal } from './components/DigitalProfilePreviewModal';
import { INITIAL_PLANS, INITIAL_CONFIG } from './data/initialData';
import { PlanTier, PricingPlan, AppConfig, OrderRecord, CustomerDetails } from './types';
import { api } from './services/api';
import { CreditCard, Sparkles } from 'lucide-react';

export default function App() {
  const [plans, setPlans] = useState<PricingPlan[]>(INITIAL_PLANS);
  const [config, setConfig] = useState<AppConfig>(INITIAL_CONFIG);

  // Modal states
  const [isOrderOpen, setIsOrderOpen] = useState<boolean>(false);
  const [selectedPlanForOrder, setSelectedPlanForOrder] = useState<PlanTier>('GOLD');
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isDemoOpen, setIsDemoOpen] = useState<boolean>(false);
  const [demoCustomer, setDemoCustomer] = useState<CustomerDetails | undefined>(undefined);
  const [demoPlan, setDemoPlan] = useState<PlanTier>('GOLD');

  // Load config on mount
  useEffect(() => {
    api.getConfig().then((loaded) => {
      if (loaded) {
        setConfig(loaded);
        // Sync plans with config prices if customized
        setPlans((prev) =>
          prev.map((p) => ({
            ...p,
            monthlyPrice: loaded.plans[p.id]?.monthlyPrice ?? p.monthlyPrice,
          }))
        );
      }
    });
  }, []);

  const handleOpenOrderWithPlan = (planId: PlanTier) => {
    setSelectedPlanForOrder(planId);
    setIsOrderOpen(true);
  };

  const handleConfigUpdated = (newConfig: AppConfig) => {
    setConfig(newConfig);
    setPlans((prev) =>
      prev.map((p) => ({
        ...p,
        monthlyPrice: newConfig.plans[p.id]?.monthlyPrice ?? p.monthlyPrice,
      }))
    );
  };

  const handleOrderSuccess = (order: OrderRecord) => {
    console.log('Order created and verified successfully:', order.orderId);
  };

  const handleOpenProfileDemo = (customer?: CustomerDetails, plan?: PlanTier) => {
    setDemoCustomer(customer);
    setDemoPlan(plan || 'GOLD');
    setIsDemoOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans'] selection:bg-cyan-500 selection:text-slate-950">
      {/* Header */}
      <Navbar
        onOpenOrder={() => handleOpenOrderWithPlan('GOLD')}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenDemo={() => handleOpenProfileDemo()}
      />

      {/* Main Content */}
      <main className="flex-1">
        <Hero
          onGetStarted={() => handleOpenOrderWithPlan('GOLD')}
          onOpenDemo={() => handleOpenProfileDemo()}
        />

        <PhysicalCardsShowcase />

        <HowItWorks />

        <PricingSection
          plans={plans}
          onSelectPlan={handleOpenOrderWithPlan}
        />

        <Testimonials />

        <FAQSection />

        <ContactSection />
      </main>

      {/* Footer */}
      <Footer
        onOpenOrder={() => handleOpenOrderWithPlan('GOLD')}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Sticky Mobile Quick Order Bar */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-30">
        <div className="bg-slate-900/95 backdrop-blur-lg border border-slate-700/80 p-2.5 rounded-2xl shadow-2xl flex items-center justify-between gap-3">
          <div className="pl-2">
            <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
              TapMate NFC Cards
            </div>
            <div className="text-xs font-bold text-white">
              Starting at <span className="text-cyan-400 font-extrabold">₹199</span>/mo
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenProfileDemo()}
              className="py-2 px-3 rounded-xl bg-slate-800 text-cyan-400 text-xs font-semibold border border-slate-700 flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>Demo</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenOrderWithPlan('GOLD')}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-cyan-500/20 cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Order Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* Order & Pre-Booking Modal Wizard */}
      <OrderModal
        isOpen={isOrderOpen}
        onClose={() => setIsOrderOpen(false)}
        initialPlan={selectedPlanForOrder}
        plans={plans}
        config={config}
        onOrderSuccess={handleOrderSuccess}
        onOpenProfileDemo={handleOpenProfileDemo}
      />

      {/* Admin Panel Modal */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        config={config}
        onConfigUpdated={handleConfigUpdated}
      />

      {/* Live Digital Profile Smartphone Simulation Modal */}
      <DigitalProfilePreviewModal
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
        customer={demoCustomer}
        plan={demoPlan}
      />
    </div>
  );
}
