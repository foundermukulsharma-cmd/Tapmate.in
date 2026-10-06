import React, { useState } from 'react';
import { CardMaterial, CardColor } from '../types';
import { Wifi, Sparkles, RefreshCw, QrCode } from 'lucide-react';

interface CardVisualizerProps {
  material: CardMaterial;
  color: CardColor;
  printedName?: string;
  logoUrl?: string;
  showBack?: boolean;
  onToggleFlip?: () => void;
  interactive?: boolean;
  compact?: boolean;
  className?: string;
}

export const CardVisualizer: React.FC<CardVisualizerProps> = ({
  material,
  color,
  printedName = 'YOUR NAME HERE',
  logoUrl,
  showBack: controlledShowBack,
  onToggleFlip,
  compact = false,
  className = '',
}) => {
  const [internalFlip, setInternalFlip] = useState(false);
  const isBack = controlledShowBack !== undefined ? controlledShowBack : internalFlip;

  const handleFlip = () => {
    if (onToggleFlip) {
      onToggleFlip();
    } else {
      setInternalFlip(!internalFlip);
    }
  };

  // Determine appearance classes & gradients based on material and color
  const getCardTheme = () => {
    if (material === 'METAL') {
      switch (color) {
        case 'Black':
          return {
            bg: 'bg-gradient-to-br from-zinc-900 via-neutral-950 to-zinc-900 text-zinc-100 border border-zinc-700/60 shadow-2xl shadow-black/80',
            finish: 'Brushed Tungsten Metal',
            badge: 'bg-zinc-800 text-zinc-300 border-zinc-700',
            accent: 'text-zinc-200',
            engraveEffect: 'drop-shadow-[0_1px_1px_rgba(255,255,255,0.2)] font-semibold tracking-wider',
            sheen: 'from-white/10 via-transparent to-white/5',
            chip: 'from-amber-200 via-amber-300 to-amber-400 border-amber-600/40 text-amber-950',
          };
        case 'Gold':
          return {
            bg: 'bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-700 text-amber-950 border border-yellow-200/80 shadow-2xl shadow-amber-950/40',
            finish: '24K Brushed Gold Metal',
            badge: 'bg-amber-900/20 text-amber-950 border-amber-800/30',
            accent: 'text-amber-950 font-bold',
            engraveEffect: 'drop-shadow-[0_1px_0_rgba(255,255,255,0.5)] font-bold tracking-wider',
            sheen: 'from-white/30 via-transparent to-amber-200/20',
            chip: 'from-zinc-100 via-zinc-200 to-zinc-400 border-zinc-500/50 text-zinc-900',
          };
        case 'Silver':
        default:
          return {
            bg: 'bg-gradient-to-br from-slate-200 via-gray-300 to-slate-400 text-slate-900 border border-slate-100/90 shadow-2xl shadow-slate-950/40',
            finish: 'Laser-Etched Stainless Steel',
            badge: 'bg-slate-900/10 text-slate-900 border-slate-400/40',
            accent: 'text-slate-900 font-bold',
            engraveEffect: 'drop-shadow-[0_1px_0_rgba(255,255,255,0.8)] font-bold tracking-wider',
            sheen: 'from-white/40 via-transparent to-slate-100/20',
            chip: 'from-amber-200 via-amber-300 to-amber-400 border-amber-600/40 text-amber-950',
          };
      }
    } else {
      // PLASTIC
      switch (color) {
        case 'Black':
          return {
            bg: 'bg-gradient-to-br from-slate-900 via-zinc-900 to-black text-white border border-slate-800 shadow-xl shadow-black/60',
            finish: 'Matte Stealth Plastic',
            badge: 'bg-slate-800 text-slate-300 border-slate-700',
            accent: 'text-white',
            engraveEffect: 'tracking-wide font-medium',
            sheen: 'from-white/10 via-transparent to-transparent',
            chip: 'from-amber-300 via-amber-400 to-amber-500 border-amber-600/40 text-amber-950',
          };
        case 'Blue':
          return {
            bg: 'bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 text-white border border-blue-500/40 shadow-xl shadow-blue-950/60',
            finish: 'Royal Cobalt Satin Plastic',
            badge: 'bg-blue-900/60 text-blue-200 border-blue-600',
            accent: 'text-blue-100',
            engraveEffect: 'tracking-wide font-medium',
            sheen: 'from-cyan-300/20 via-transparent to-blue-300/10',
            chip: 'from-amber-300 via-amber-400 to-amber-500 border-amber-600/40 text-amber-950',
          };
        case 'White':
        default:
          return {
            bg: 'bg-gradient-to-br from-white via-slate-50 to-slate-200 text-slate-900 border border-slate-200 shadow-xl shadow-slate-900/10',
            finish: 'Minimalist Arctic Matte Plastic',
            badge: 'bg-slate-200 text-slate-800 border-slate-300',
            accent: 'text-slate-900 font-semibold',
            engraveEffect: 'tracking-wide font-medium text-slate-900',
            sheen: 'from-white via-white/40 to-transparent',
            chip: 'from-amber-300 via-amber-400 to-amber-500 border-amber-600/40 text-amber-950',
          };
      }
    }
  };

  const theme = getCardTheme();

  return (
    <div className={`relative select-none ${className}`}>
      {/* 3D Container with aspect ratio of standard credit card (85.60 mm × 53.98 mm -> ~1.586) */}
      <div
        className={`relative w-full rounded-2xl overflow-hidden transition-all duration-500 preserve-3d ${
          compact ? 'aspect-[1.586/1] max-w-xs' : 'aspect-[1.586/1] max-w-md'
        } ${theme.bg}`}
        style={{
          boxShadow:
            material === 'METAL'
              ? '0 20px 40px -15px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.1)'
              : '0 15px 35px -10px rgba(0,0,0,0.5)',
        }}
      >
        {/* Subtle holographic sheen overlay */}
        <div
          className={`absolute inset-0 pointer-events-none bg-gradient-to-tr ${theme.sheen} opacity-60 mix-blend-overlay`}
        />

        {/* Micro-texture / brush line subtle simulation */}
        {material === 'METAL' && (
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.08) 2px, rgba(255,255,255,0.08) 4px)',
            }}
          />
        )}

        {!isBack ? (
          /* FRONT SIDE */
          <div className="relative z-10 w-full h-full p-5 sm:p-6 flex flex-col justify-between">
            {/* Top row: Brand & NFC contactless wave */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Custom Logo"
                    className="h-8 max-w-[100px] object-contain rounded"
                  />
                ) : (
                  <div className="flex items-center gap-1.5 font-bold tracking-tight text-lg sm:text-xl font-['Space_Grotesk']">
                    <span>TapMate</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-400/30">
                      .in
                    </span>
                  </div>
                )}
              </div>

              {/* NFC Contactless Wave Indicator */}
              <div className="flex items-center gap-1.5 opacity-80">
                <Wifi className="w-5 h-5 rotate-90 stroke-[2.2]" />
                <span className="text-[10px] uppercase tracking-widest font-mono font-bold">
                  NFC
                </span>
              </div>
            </div>

            {/* Middle row: EMV Smart Chip aesthetic & Material Badge */}
            <div className="flex items-center justify-between my-auto pt-2">
              <div
                className={`w-11 h-8 sm:w-12 sm:h-9 rounded-md bg-gradient-to-br ${theme.chip} border p-1 shadow-inner relative overflow-hidden`}
              >
                {/* Chip lines */}
                <div className="w-full h-full border border-black/20 rounded-[3px] grid grid-cols-3 grid-rows-3 gap-[1px]">
                  <div className="border-r border-b border-black/15"></div>
                  <div className="border-r border-b border-black/15"></div>
                  <div className="border-b border-black/15"></div>
                  <div className="border-r border-b border-black/15"></div>
                  <div className="bg-black/10 border-r border-b border-black/15"></div>
                  <div className="border-b border-black/15"></div>
                  <div className="border-r border-black/15"></div>
                  <div className="border-r border-black/15"></div>
                  <div></div>
                </div>
              </div>

              <div
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${theme.badge} uppercase tracking-wider backdrop-blur-sm`}
              >
                {material} • {color}
              </div>
            </div>

            {/* Bottom row: Cardholder Printed Name & Tap CTA */}
            <div className="pt-2">
              <div className="text-[9px] uppercase tracking-wider font-mono opacity-60">
                CARDHOLDER NAME
              </div>
              <div
                className={`text-base sm:text-lg uppercase font-mono tracking-widest truncate max-w-full ${theme.engraveEffect}`}
              >
                {printedName || 'YOUR NAME HERE'}
              </div>
              <div className="flex items-center justify-between mt-1 text-[9px] opacity-70 font-mono">
                <span>NTAG216 HIGH-SPEED CHIP</span>
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" /> TAP TO CONNECT
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* BACK SIDE */
          <div className="relative z-10 w-full h-full p-4 sm:p-5 flex flex-col justify-between">
            {/* Magnetic stripe simulation */}
            <div className="w-full h-7 bg-neutral-900 -mx-5 sm:-mx-6 mt-1 border-y border-neutral-700/50 shadow-inner flex items-center justify-end px-6">
              <div className="text-[8px] font-mono text-zinc-500 tracking-widest">
                TAPMATE.IN CLOUD DIRECT
              </div>
            </div>

            {/* Center: Dynamic QR code and verification serial */}
            <div className="flex items-center justify-between gap-4 px-2 my-auto">
              <div className="bg-white p-2 rounded-xl shadow-lg border border-slate-300">
                {/* Visual QR Code placeholder */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-900 rounded flex flex-col items-center justify-center p-1 relative text-white">
                  <QrCode className="w-full h-full text-white" />
                </div>
              </div>

              <div className="flex-1 text-left space-y-1">
                <div className="text-[10px] font-bold tracking-wider uppercase font-mono">
                  SCAN FOR BACKUP PROFILE
                </div>
                <p className="text-[9px] opacity-80 leading-snug">
                  Compatible with all iOS and Android devices without requiring an app.
                </p>
                <div className="text-[10px] font-mono text-cyan-400 font-semibold pt-1">
                  tapmate.in/id/preview
                </div>
              </div>
            </div>

            {/* Bottom: Signature strip & support info */}
            <div className="flex items-center justify-between text-[9px] font-mono opacity-70 border-t border-current/20 pt-2">
              <span>POWERED BY TAPMATE.IN</span>
              <span>100% CONTACTLESS</span>
            </div>
          </div>
        )}
      </div>

      {/* Interactive controls: Flip preview button */}
      <div className="mt-3 flex items-center justify-between px-1">
        <span className="text-xs text-slate-400 flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              material === 'METAL' ? 'bg-amber-400' : 'bg-cyan-400'
            }`}
          />
          {theme.finish}
        </span>
        <button
          type="button"
          onClick={handleFlip}
          className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 py-1 px-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          {isBack ? 'View Card Front' : 'View Card Back (QR)'}
        </button>
      </div>
    </div>
  );
};
