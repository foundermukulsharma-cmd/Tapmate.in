import React, { useState } from 'react';
import { CardVisualizer } from './CardVisualizer';
import { CardMaterial, PlasticColor, MetalColor } from '../types';
import { ShieldCheck, Award, Zap, Layers, Cpu, Sparkles } from 'lucide-react';

export const PhysicalCardsShowcase: React.FC = () => {
  const [selectedMaterial, setSelectedMaterial] = useState<CardMaterial>('METAL');
  const [plasticColor, setPlasticColor] = useState<PlasticColor>('Black');
  const [metalColor, setMetalColor] = useState<MetalColor>('Gold');
  const [demoName, setDemoName] = useState<string>('ALEXANDER WRIGHT');

  return (
    <section id="cards" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Layers className="w-3.5 h-3.5" />
          Master Craftsmanship
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-['Space_Grotesk']">
          Engineered to Make an Unforgettable Impression
        </h2>
        <p className="mt-4 text-base text-slate-400">
          Whether you prefer our lightweight satin-matte PVC or ultra-exclusive weighted stainless steel, every TapMate card contains an advanced NTAG216 high-frequency microchip.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left: Interactive visualizer sandbox */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="w-full max-w-md bg-slate-900/60 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-md">
            <CardVisualizer
              material={selectedMaterial}
              color={selectedMaterial === 'METAL' ? metalColor : plasticColor}
              printedName={demoName}
            />

            {/* Live Name Input to test typography engraving */}
            <div className="mt-6 pt-4 border-t border-slate-800">
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                Type Your Name To Test Engraving:
              </label>
              <input
                type="text"
                value={demoName}
                onChange={(e) => setDemoName(e.target.value)}
                maxLength={24}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Right: Material Switcher & Comparison */}
        <div className="lg:col-span-6 space-y-6">
          {/* Material Toggle Tabs */}
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-950 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setSelectedMaterial('METAL')}
              className={`py-3 px-4 rounded-xl font-bold text-sm transition cursor-pointer flex items-center justify-center gap-2 ${
                selectedMaterial === 'METAL'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Metal Series</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMaterial('PLASTIC')}
              className={`py-3 px-4 rounded-xl font-bold text-sm transition cursor-pointer flex items-center justify-center gap-2 ${
                selectedMaterial === 'PLASTIC'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Matte Plastic Series</span>
            </button>
          </div>

          {/* Details for selected material */}
          {selectedMaterial === 'METAL' ? (
            <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 space-y-5">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-2xl font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                    <span>Ultra-Luxury Stainless Steel</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono">
                      22 GRAMS
                    </span>
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-slate-500 line-through">₹1,699</span>
                    <span className="text-2xl font-extrabold text-amber-400 font-['Space_Grotesk']">
                      ₹1,499
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300">
                      Save ₹200
                    </span>
                  </div>
                </div>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  Precision CNC milled from 304 surgical-grade stainless steel. Featuring laser-engraved typography, ceramic coating, and brushed metallic anisotropic reflections.
                </p>
              </div>

              {/* Special BETA10 Coupon Callout */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/40 to-slate-900 border border-amber-500/30 text-xs flex items-center justify-between">
                <span className="text-amber-200">
                  🎁 Use Code <strong className="text-white font-mono font-bold bg-amber-500/20 px-1.5 py-0.5 rounded">BETA10</strong> for <strong>FREE Gold Membership</strong>!
                </span>
                <span className="text-[11px] text-amber-400 font-semibold">Pay card price only</span>
              </div>

              {/* Color choices */}
              <div>
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
                  Available Metal Finishes:
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {(['Gold', 'Black', 'Silver'] as MetalColor[]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setMetalColor(c)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-2 ${
                        metalColor === c
                          ? 'bg-slate-800 border-amber-400 text-amber-300 ring-1 ring-amber-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span
                        className={`w-3 h-3 rounded-full ${
                          c === 'Gold'
                            ? 'bg-yellow-500'
                            : c === 'Black'
                            ? 'bg-neutral-900 border border-neutral-700'
                            : 'bg-slate-300'
                        }`}
                      />
                      <span>{c} Metal</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-slate-400 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Scratch-Resistant PVD Coating</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-amber-400" />
                  <span>Dual-Shielded NFC Antenna</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 space-y-5">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-2xl font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                    <span>Velvet Matte Recycled PVC</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 font-mono">
                      800 MICRONS
                    </span>
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-slate-500 line-through">₹999</span>
                    <span className="text-2xl font-extrabold text-cyan-400 font-['Space_Grotesk']">
                      ₹899
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300">
                      Save ₹100
                    </span>
                  </div>
                </div>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  Silky smooth tactile finish manufactured from durable, environmentally conscious recycled polymers. 100% waterproof, bend-resistant, and lightweight.
                </p>
              </div>

              {/* Special BETA10 Coupon Callout */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-500/30 text-xs flex items-center justify-between">
                <span className="text-cyan-200">
                  🎁 Use Code <strong className="text-white font-mono font-bold bg-cyan-500/20 px-1.5 py-0.5 rounded">BETA10</strong> for <strong>FREE Gold Membership</strong>!
                </span>
                <span className="text-[11px] text-cyan-400 font-semibold">Pay card price only</span>
              </div>

              {/* Color choices */}
              <div>
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
                  Available Matte Plastic Colors:
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {(['White', 'Black', 'Blue'] as PlasticColor[]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setPlasticColor(c)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-2 ${
                        plasticColor === c
                          ? 'bg-slate-800 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span
                        className={`w-3 h-3 rounded-full ${
                          c === 'White'
                            ? 'bg-white'
                            : c === 'Black'
                            ? 'bg-zinc-900 border border-slate-700'
                            : 'bg-blue-600'
                        }`}
                      />
                      <span>{c}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-slate-400 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>100% Waterproof &amp; Weatherproof</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>Embedded NFC Micro-Inlay</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
