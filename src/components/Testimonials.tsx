import React from 'react';
import { TESTIMONIALS } from '../data/initialData';
import { Star, MessageSquare } from 'lucide-react';

export const Testimonials: React.FC = () => {
  return (
    <section id="reviews" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <MessageSquare className="w-3.5 h-3.5" />
          Client Stories
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-['Space_Grotesk']">
          Loved by Indian Founders, Executives &amp; Creators
        </h2>
        <p className="mt-4 text-base text-slate-400">
          See why professionals across Mumbai, Bengaluru, Delhi, and Hyderabad have upgraded from paper cards to TapMate.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {TESTIMONIALS.map((item, idx) => (
          <div
            key={idx}
            className="bg-slate-900/60 p-8 rounded-3xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition"
          >
            <div>
              {/* Star rating */}
              <div className="flex items-center gap-1 text-amber-400 mb-4">
                {[...Array(item.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>

              <p className="text-sm text-slate-300 leading-relaxed italic">
                &ldquo;{item.content}&rdquo;
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800 flex items-center gap-3">
              <img
                src={item.avatar}
                alt={item.name}
                className="w-11 h-11 rounded-full object-cover border border-cyan-500/30"
              />
              <div>
                <div className="text-sm font-bold text-white">{item.name}</div>
                <div className="text-xs text-slate-400">{item.role}</div>
                <div className="text-[10px] text-cyan-400 font-mono mt-0.5">
                  {item.plan} &bull; {item.city}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
