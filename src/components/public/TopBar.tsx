import React from 'react';

// ─── روابط التواصل الاجتماعي — عدّلها هنا فقط ────────────────────────────
const SOCIAL_LINKS = {
  facebook:        '',
  instagram:       '',
  tiktok:          '',
  x:               '',
  whatsappChannel: '',   // رابط قناة الواتساب
  whatsappNumber:  '',   // رقم الواتساب الخاص (مثال: 963912345678) بدون + أو 00
};
// ─────────────────────────────────────────────────────────────────────────────

/* ── أيقونات SVG مدمجة (بدون مكتبة خارجية) ─────────────────────────────── */
const IconFacebook = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.514c-1.491 0-1.956.93-1.956 1.884v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
  </svg>
);

const IconInstagram = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

const IconTiktok = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.78a4.85 4.85 0 01-1.01-.09z"/>
  </svg>
);

const IconX = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.254 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const IconWhatsapp = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const IconPhone = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
  </svg>
);

/* ── مكوّن أيقونة مفردة ─────────────────────────────────────────────────── */
interface SocialIconProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

const SocialIcon: React.FC<SocialIconProps> = ({ href, icon, label }) => {
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className="text-white/70 hover:text-[#D4AF37] transition-colors duration-200 flex items-center justify-center"
      >
        {icon}
      </a>
    );
  }
  return (
    <span
      aria-label={label}
      className="text-white/50 flex items-center justify-center"
    >
      {icon}
    </span>
  );
};

/* ── الشريط العلوي ──────────────────────────────────────────────────────── */
const TopBar: React.FC = () => {
  const whatsappNumberHref = SOCIAL_LINKS.whatsappNumber
    ? `https://wa.me/${SOCIAL_LINKS.whatsappNumber}`
    : '';

  return (
    <div
      className="fixed top-0 left-0 right-0 w-full h-8 bg-[#2E1065] px-4 flex items-center justify-between z-[110]"
      dir="rtl"
    >
      {/* يمين: معلومات النص */}
      <div className="hidden sm:flex items-center gap-2 text-white/50 text-[11px] tracking-wide select-none">
        <span>سوريا — دمشق</span>
        <span className="text-white/25">|</span>
        <span>التأسيس: عام 2024</span>
      </div>

      {/* يسار: أيقونات التواصل */}
      <div className="flex items-center gap-3" style={{ direction: 'ltr' }}>
        <SocialIcon href={SOCIAL_LINKS.facebook}  icon={<IconFacebook />}  label="Facebook" />
        <SocialIcon href={SOCIAL_LINKS.instagram} icon={<IconInstagram />} label="Instagram" />
        <SocialIcon href={SOCIAL_LINKS.tiktok}    icon={<IconTiktok />}    label="TikTok" />
        <SocialIcon href={SOCIAL_LINKS.x}         icon={<IconX />}         label="X / Twitter" />


        <span className="w-px h-3 bg-white/20 mx-0.5" />

        <SocialIcon href={SOCIAL_LINKS.whatsappChannel} icon={<IconWhatsapp />} label="قناة الواتساب" />
        <SocialIcon href={whatsappNumberHref}            icon={<IconPhone />}    label="واتساب مباشر" />
      </div>
    </div>
  );
};

export default TopBar;
