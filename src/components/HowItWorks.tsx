import React from 'react';
import { Smartphone, QrCode, UserCheck, ArrowRight, Wifi } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Tap on Any Smartphone',
      desc: 'Gently hold your TapMate card against the top of an iPhone or center-back of an Android. No Bluetooth pairing or special software needed.',
      icon: Smartphone,
      badge: 'Near-Field Communication',
    },
    {
      num: '02',
      title: 'Profile Opens Instantly in Browser',
      desc: 'Your custom web profile pops up in Safari or Chrome in under 0.5 seconds, showcasing your contact info, social handles, portfolio, and company bio.',
      icon: Wifi,
      badge: 'Zero App Required',
    },
    {
      num: '03',
      title: '1-Click Save to Phone Contacts',
      desc: 'The recipient taps "Save Contact", downloading your complete vCard directly into their address book with phone, email, and social profiles.',
      icon: UserCheck,
      badge: 'Instant Lead Capture',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
          Seamless Workflow
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-['Space_Grotesk']">
          How TapMate Works in 3 Simple Steps
        </h2>
        <p className="mt-4 text-base text-slate-400">
          From first impression to address book in under three seconds. No paper waste, no friction, no lost opportunities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={step.num}
              className="relative bg-slate-900/60 p-8 rounded-3xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-3xl font-extrabold text-slate-800 group-hover:text-cyan-400/30 transition-colors font-mono">
                    {step.num}
                  </span>
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                </div>

                <div className="inline-block text-[11px] font-mono text-cyan-400 font-semibold mb-2">
                  {step.badge}
                </div>

                <h3 className="text-xl font-bold text-white font-['Space_Grotesk'] mb-3">
                  {step.title}
                </h3>

                <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center text-xs text-slate-500">
                <span>Step {idx + 1} of 3</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
