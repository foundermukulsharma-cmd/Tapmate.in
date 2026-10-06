import React from 'react';
import { Wifi, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onOpenOrder: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenOrder, onOpenAdmin }) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 pt-16 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800/80">
        {/* Brand column */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950">
              <Wifi className="w-4 h-4 rotate-90 stroke-[2.5]" />
            </div>
            <div className="font-['Space_Grotesk'] text-xl font-extrabold text-white">
              <span>TapMate</span>
              <span className="text-cyan-400">.in</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Smart NFC Digital Business Cards and cloud profile platform for ambitious entrepreneurs, executives, and organizations across India.
          </p>
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted Payments &bull; Fast Delivery</span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-3">
            Quick Navigation
          </h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>
              <a href="#" className="hover:text-cyan-400 transition">
                Home
              </a>
            </li>
            <li>
              <a href="#cards" className="hover:text-cyan-400 transition">
                Physical Cards (Metal &amp; Plastic)
              </a>
            </li>
            <li>
              <a href="#how-it-works" className="hover:text-cyan-400 transition">
                How It Works
              </a>
            </li>
            <li>
              <a href="#pricing" className="hover:text-cyan-400 transition">
                Pricing Plans
              </a>
            </li>
            <li>
              <a href="#faq" className="hover:text-cyan-400 transition">
                FAQs
              </a>
            </li>
          </ul>
        </div>

        {/* Legal & Policies */}
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-3">
            Policies &amp; Trust
          </h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>
              <span className="text-slate-400">100% Replacement Warranty (Diamond)</span>
            </li>
            <li>
              <span className="text-slate-400">Privacy Policy (No Telemetry)</span>
            </li>
            <li>
              <span className="text-slate-400">Terms of Service</span>
            </li>
            <li>
              <span className="text-slate-400">Shipping &amp; Delivery Timeline (2-4 Days)</span>
            </li>
            <li>
              <span className="text-slate-400">UPI Payment Security Architecture</span>
            </li>
          </ul>
        </div>

        {/* Actions & Portal */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-3">
            Get Started
          </h4>
          <button
            type="button"
            onClick={onOpenOrder}
            className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition cursor-pointer"
          >
            Order Your Card Now
          </button>
          <button
            type="button"
            onClick={onOpenAdmin}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium transition cursor-pointer"
          >
            Admin Console
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <div>
          &copy; {new Date().getFullYear()} TapMate.in &bull; All Rights Reserved. Crafted with NFC precision.
        </div>
        <div className="flex items-center gap-1">
          <span>Official Payment VPA:</span>
          <span className="font-mono text-slate-400">mukul620352.rzp@rxairtel</span>
        </div>
      </div>
    </footer>
  );
};
