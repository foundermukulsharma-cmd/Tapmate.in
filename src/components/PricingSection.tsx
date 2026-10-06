import React from 'react';
import { PlanTier, PricingPlan } from '../types';
import { Check, Zap, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';

interface PricingSectionProps {
  plans: PricingPlan[];
  onSelectPlan: (plan: PlanTier) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  plans,
  onSelectPlan,
}) => {
  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Transparent Pricing Plans
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-['Space_Grotesk']">
          Choose the Perfect Card &amp; Plan
        </h2>
        <p className="mt-4 text-base sm:text-lg text-slate-400">
          Transform your networking experience with one smart tap. Every plan includes instant contactless sharing, custom digital profile, and optional high-grade physical NFC card.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan) => {
          const isGold = plan.id === 'GOLD';
          const isDiamond = plan.id === 'DIAMOND';

          return (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                isGold
                  ? 'bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border-2 border-amber-400/80 shadow-2xl shadow-amber-500/10 md:-translate-y-3'
                  : isDiamond
                  ? 'bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-500/50 shadow-xl shadow-cyan-500/10'
                  : 'bg-slate-900/70 border border-slate-800 shadow-lg hover:border-slate-700'
              }`}
            >
              {/* Popular Badge */}
              {isGold && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md">
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    MOST POPULAR
                  </span>
                </div>
              )}

              {isDiamond && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md">
                    <Sparkles className="w-3.5 h-3.5" />
                    ULTIMATE VIP
                  </span>
                </div>
              )}

              <div>
                {/* Plan Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold tracking-tight text-white font-['Space_Grotesk']">
                    {plan.name}
                  </h3>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-mono font-medium ${
                      isGold
                        ? 'bg-amber-400/10 text-amber-300 border border-amber-400/20'
                        : isDiamond
                        ? 'bg-cyan-400/10 text-cyan-300 border border-cyan-400/20'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    NFC ENABLED
                  </span>
                </div>

                <p className="mt-2 text-sm text-slate-400 min-h-[40px] leading-relaxed">
                  {plan.tagline}
                </p>

                {/* Price Display */}
                <div className="mt-6 pb-6 border-b border-slate-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-extrabold text-white font-['Space_Grotesk']">
                      ₹{plan.monthlyPrice}
                    </span>
                    <span className="text-slate-400 text-sm font-medium">/ month</span>
                  </div>
                  {isGold ? (
                    <div className="mt-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-center justify-between">
                      <span>Use code <strong className="font-mono bg-amber-400 text-slate-950 px-1 py-0.5 rounded font-bold">BETA10</strong>:</span>
                      <strong className="text-emerald-400">100% FREE!</strong>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 mt-1">
                      Multi-month discounts up to 20% on next step
                    </div>
                  )}
                </div>

                {/* Features List */}
                <div className="mt-6 space-y-3">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    What&apos;s included:
                  </div>
                  <ul className="space-y-2.5">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-slate-300">
                        <div
                          className={`mt-0.5 rounded-full p-0.5 shrink-0 ${
                            isGold
                              ? 'bg-amber-400/20 text-amber-400'
                              : isDiamond
                              ? 'bg-cyan-400/20 text-cyan-400'
                              : 'bg-emerald-400/20 text-emerald-400'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span className="leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-4">
                <button
                  type="button"
                  onClick={() => onSelectPlan(plan.id)}
                  className={`w-full py-3.5 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                    isGold
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 hover:shadow-amber-500/25'
                      : isDiamond
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 hover:shadow-cyan-500/25'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <span>Select {plan.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <div className="text-center mt-2.5 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Instant Activation &bull; Fast Pan-India Delivery
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
