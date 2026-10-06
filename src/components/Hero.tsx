import React, { useState } from 'react';
import { CardVisualizer } from './CardVisualizer';
import { CardMaterial, CardColor } from '../types';
import { Wifi, Sparkles, ArrowRight, CheckCircle, ShieldCheck, Zap } from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
  onOpenDemo: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onGetStarted, onOpenDemo }) => {
  const [heroMaterial, setHeroMaterial] = useState<CardMaterial>('METAL');
  const [heroColor, setHeroColor] = useState<CardColor>('Gold');

  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-cyan-500/10 via-blue-500/10 to-amber-500/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Left Column: Headline & Value Proposition */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          {/* Badge & Promo Pill */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="font-semibold text-white">Next-Gen Networking</span>
              <span className="text-slate-500">&bull;</span>
              <span className="text-cyan-400">NFC Business Cards</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Use Code <strong className="font-mono text-white bg-amber-500/20 px-1 py-0.5 rounded">BETA10</strong>: Gold Free!</span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.1] font-['Space_Grotesk']">
            The Last Business Card You&apos;ll Ever Need.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
              Tap. Connect. Close.
            </span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            Elevate your personal brand. Handing over printed paper cards is a thing of the past.
            With <strong className="text-white font-semibold">TapMate.in</strong>, one tap on any smartphone transfers your full profile, social media, portfolio, and vCard directly into their contacts—with zero apps required.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
            <button
              type="button"
              onClick={onGetStarted}
              className="w-full sm:w-auto py-4 px-8 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-base flex items-center justify-center gap-2 cursor-pointer transition shadow-xl shadow-cyan-500/25"
            >
              <span>Choose Your Plan &amp; Card</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onOpenDemo}
              className="w-full sm:w-auto py-4 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 border border-slate-800 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Experience Phone Tap Demo</span>
            </button>
          </div>

          {/* Bullet proofs */}
          <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>iOS &amp; Android Compatible</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>Laser-Etched Stainless Steel or Matte PVC</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>Real-Time Cloud Profile Updates</span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Card Showcase Preview */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="relative w-full max-w-md p-6 bg-slate-900/40 rounded-3xl border border-slate-800/80 backdrop-blur-md shadow-2xl flex flex-col items-center">
            {/* Live Card Mockup */}
            <CardVisualizer
              material={heroMaterial}
              color={heroColor}
              printedName="MUKUL SHARMA"
            />

            {/* Quick interactive switcher */}
            <div className="mt-6 w-full pt-4 border-t border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-[10px]">
                  Interactive Material Preview:
                </span>
                <span className="text-cyan-400 font-mono">
                  {heroMaterial} &bull; {heroColor}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setHeroMaterial('METAL');
                    setHeroColor('Gold');
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                    heroMaterial === 'METAL' && heroColor === 'Gold'
                      ? 'bg-amber-950/60 text-amber-300 border-amber-400'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  <span>24K Gold Metal</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setHeroMaterial('METAL');
                    setHeroColor('Black');
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                    heroMaterial === 'METAL' && heroColor === 'Black'
                      ? 'bg-zinc-800 text-zinc-100 border-zinc-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-800 border border-zinc-600" />
                  <span>Tungsten Metal</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setHeroMaterial('PLASTIC');
                    setHeroColor('Black');
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                    heroMaterial === 'PLASTIC' && heroColor === 'Black'
                      ? 'bg-slate-800 text-white border-cyan-400'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-black border border-slate-700" />
                  <span>Matte Black PVC</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setHeroMaterial('PLASTIC');
                    setHeroColor('White');
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                    heroMaterial === 'PLASTIC' && heroColor === 'White'
                      ? 'bg-slate-800 text-white border-cyan-400'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-white" />
                  <span>Arctic White PVC</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
