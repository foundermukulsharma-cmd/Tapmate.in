import React, { useState } from 'react';
import { Mail, Phone, MessageSquare, MapPin, Send, CheckCircle, Sparkles } from 'lucide-react';

export const ContactSection: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '', teamSize: '1-5' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm({ name: '', email: '', message: '', teamSize: '1-5' });
    }, 4000);
  };

  return (
    <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-slate-900/60 p-8 sm:p-12 rounded-3xl border border-slate-800">
        {/* Left Information */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <MessageSquare className="w-3.5 h-3.5" />
            Reach Out to Us
          </div>

          <h2 className="text-3xl font-extrabold text-white font-['Space_Grotesk']">
            Questions, Custom Enterprise Batches or Support?
          </h2>

          <p className="text-sm text-slate-400 leading-relaxed">
            Need custom laser-engraved NFC metal cards for your whole executive team or enterprise company? We offer customized company dashboards and volume pricing.
          </p>

          <div className="space-y-4 pt-2 text-sm text-slate-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500">Email Support</div>
                <a href="mailto:founder.mukulsharma@gmail.com" className="font-semibold text-white hover:text-cyan-400 transition">
                  founder.mukulsharma@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500">WhatsApp &amp; Phone Support</div>
                <div className="font-semibold text-white">+91 98765 43210 &bull; Daily 9 AM - 9 PM IST</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500">Production Hub</div>
                <div className="font-semibold text-white">Bengaluru &bull; Pan-India Express Shipping</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Contact Form */}
        <div className="lg:col-span-7 bg-slate-950 p-6 sm:p-8 rounded-2xl border border-slate-800/80">
          <h3 className="text-lg font-bold text-white font-['Space_Grotesk'] mb-4">
            Send Us a Direct Message
          </h3>

          {submitted ? (
            <div className="p-8 text-center space-y-3 bg-emerald-950/20 border border-emerald-500/40 rounded-2xl">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
              <div className="text-base font-bold text-white">Message Received!</div>
              <p className="text-xs text-slate-300">
                Thank you for contacting TapMate.in. A team member will reply to you within 2 business hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Your Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Mukul Sharma"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Your Email <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Team / Card Quantity Needed
                </label>
                <select
                  value={form.teamSize}
                  onChange={(e) => setForm({ ...form, teamSize: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="1">Individual Card (1)</option>
                  <option value="2-5">Small Team (2 - 5 Cards)</option>
                  <option value="6-20">Growth Team (6 - 20 Cards)</option>
                  <option value="20+">Corporate Enterprise (20+ Cards)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  How can we help?
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell us about your brand engraving or question..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow-lg shadow-cyan-500/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Inquiry</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
