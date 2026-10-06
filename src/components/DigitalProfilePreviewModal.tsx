import React, { useState } from 'react';
import { CustomerDetails, PlanTier } from '../types';
import {
  X,
  Phone,
  Mail,
  Globe,
  Share2,
  Download,
  Linkedin,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  MessageCircle,
  Sparkles,
  Wifi,
  QrCode,
  Check,
} from 'lucide-react';

interface DigitalProfilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: CustomerDetails;
  plan?: PlanTier;
}

export const DigitalProfilePreviewModal: React.FC<DigitalProfilePreviewModalProps> = ({
  isOpen,
  onClose,
  customer,
  plan = 'GOLD',
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [vCardSaved, setVCardSaved] = useState(false);

  if (!isOpen) return null;

  const profile: CustomerDetails = customer || {
    fullName: 'Aarav Singhania',
    profession: 'Managing Director & Angel Investor',
    professionDescription:
      'Partner at Singhania Capital. Scaling deep-tech & fintech ventures across India and Southeast Asia.',
    profilePhotoUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    mobile1: '+91 98765 43210',
    email: 'aarav@singhaniaventures.in',
    socialLinks: {
      linkedin: 'https://linkedin.com',
      instagram: 'https://instagram.com',
      twitter: 'https://x.com',
      website: 'https://singhaniaventures.in',
      whatsapp: '+919876543210',
    },
  };

  const handleDownloadVCard = () => {
    const vcardContent = `BEGIN:VCARD
VERSION:3.0
FN:${profile.fullName}
TITLE:${profile.profession}
TEL;TYPE=CELL:${profile.mobile1}
EMAIL:${profile.email}
URL:${profile.socialLinks?.website || 'https://tapmate.in'}
NOTE:${profile.professionDescription}
END:VCARD`;

    const blob = new Blob([vcardContent], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${profile.fullName.replace(/\s+/g, '_')}_contact.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setVCardSaved(true);
    setTimeout(() => setVCardSaved(false), 2500);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + '/preview/' + encodeURIComponent(profile.fullName));
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const isWhiteLabel = plan === 'DIAMOND';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-sm sm:max-w-md bg-slate-950 rounded-[40px] border-4 border-slate-800 shadow-2xl overflow-hidden p-2">
        {/* Smartphone Dynamic Island / Notch */}
        <div className="w-full flex items-center justify-between px-6 py-2">
          <span className="text-[11px] font-mono font-bold text-slate-400">9:41</span>
          <div className="w-24 h-4 bg-slate-900 rounded-full border border-slate-800/80 mx-auto" />
          <div className="flex items-center gap-1.5 text-slate-400">
            <Wifi className="w-3.5 h-3.5" />
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Close Preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Smartphone Screen Inner */}
        <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 rounded-[32px] p-5 sm:p-6 text-center space-y-5 border border-slate-800/60 max-h-[82vh] overflow-y-auto">
          {/* NFC Tap Announcement Banner */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold tracking-wide">
            <Wifi className="w-3 h-3 rotate-90" />
            <span>NFC CARD TAPPED &bull; INSTANT CONTACT</span>
          </div>

          {/* Profile Avatar with decorative ring */}
          <div className="relative mx-auto w-24 h-24">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-cyan-400 shadow-xl shadow-cyan-500/20 bg-slate-800">
              <img
                src={
                  profile.profilePhotoUrl ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                }
                alt={profile.fullName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 p-1 rounded-full border-2 border-slate-950">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Name & Headline */}
          <div>
            <h3 className="text-xl font-extrabold text-white font-['Space_Grotesk']">
              {profile.fullName}
            </h3>
            <p className="text-xs font-semibold text-cyan-400 mt-0.5">{profile.profession}</p>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed px-2">
              {profile.professionDescription}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={handleDownloadVCard}
              className="py-3 px-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20 transition cursor-pointer"
            >
              {vCardSaved ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
              <span>{vCardSaved ? 'Contact Saved!' : 'Save Contact'}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="py-3 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? 'Link Copied!' : 'Share Profile'}</span>
            </button>
          </div>

          {/* Quick Contact Icons */}
          <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800/80 flex justify-around items-center">
            {profile.mobile1 && (
              <a
                href={`tel:${profile.mobile1}`}
                className="p-2.5 rounded-full bg-slate-800 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 transition"
                title="Call"
              >
                <Phone className="w-4 h-4" />
              </a>
            )}

            {profile.socialLinks?.whatsapp && (
              <a
                href={`https://wa.me/${profile.socialLinks.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-full bg-slate-800 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 transition"
                title="WhatsApp Chat"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            )}

            {profile.email && (
              <a
                href={`mailto:${profile.email}`}
                className="p-2.5 rounded-full bg-slate-800 text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition"
                title="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            )}

            {profile.socialLinks?.website && (
              <a
                href={profile.socialLinks.website}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-full bg-slate-800 text-indigo-400 hover:bg-indigo-500 hover:text-slate-950 transition"
                title="Website"
              >
                <Globe className="w-4 h-4" />
              </a>
            )}
          </div>

          {/* Social Links List */}
          <div className="space-y-2 pt-1 text-left">
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 px-1">
              Social Links
            </span>

            {profile.socialLinks?.linkedin && (
              <a
                href={profile.socialLinks.linkedin}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 text-xs text-slate-200 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Linkedin className="w-4 h-4 text-blue-400" />
                  <span>Connect on LinkedIn</span>
                </div>
                <span className="text-slate-500 text-[10px]">&rarr;</span>
              </a>
            )}

            {profile.socialLinks?.instagram && (
              <a
                href={profile.socialLinks.instagram}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 text-xs text-slate-200 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Instagram className="w-4 h-4 text-pink-400" />
                  <span>Follow on Instagram</span>
                </div>
                <span className="text-slate-500 text-[10px]">&rarr;</span>
              </a>
            )}

            {profile.socialLinks?.twitter && (
              <a
                href={profile.socialLinks.twitter}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 text-xs text-slate-200 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Twitter className="w-4 h-4 text-sky-400" />
                  <span>Follow on X / Twitter</span>
                </div>
                <span className="text-slate-500 text-[10px]">&rarr;</span>
              </a>
            )}
          </div>

          {/* Plan Branding / Watermark logic according to spec */}
          <div className="pt-4 border-t border-slate-800/80">
            {isWhiteLabel ? (
              <div className="text-[10px] text-slate-600 font-mono">
                100% White Label Profile (Diamond Plan)
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                <span>Powered by</span>
                <span className="font-bold text-cyan-400">TapMate.in</span>
                <span>NFC</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
