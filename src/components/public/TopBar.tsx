import React from 'react';
import { SOCIAL_LINKS as officialSocialLinks } from '../../constants/socialLinks';
import {
  IconFacebook,
  IconInstagram,
  IconTelegram,
  IconThreads,
  IconTiktok,
  IconX,
  IconPinterest,
  IconWhatsapp,
  IconPhone
} from '../common/SocialIcons';

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
        className="w-6 h-6 text-white/70 hover:text-[#D4AF37] transition-colors duration-200 flex items-center justify-center"
      >
        {icon}
      </a>
    );
  }
  return (
    <span
      aria-label={label}
      className="w-6 h-6 text-white/50 flex items-center justify-center"
    >
      {icon}
    </span>
  );
};

/* ── الشريط العلوي ──────────────────────────────────────────────────────── */
const TopBar: React.FC = () => {
  const whatsappNumberHref = officialSocialLinks.whatsapp;

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
      <div className="flex items-center gap-1 sm:gap-3" style={{ direction: 'ltr' }}>
        <SocialIcon href={officialSocialLinks.facebook}  icon={<IconFacebook />}  label="Facebook" />
        <SocialIcon href={officialSocialLinks.instagram} icon={<IconInstagram />} label="Instagram" />
        <SocialIcon href={officialSocialLinks.telegram}  icon={<IconTelegram />}  label="تيليغرام" />
        <SocialIcon href={officialSocialLinks.threads}   icon={<IconThreads />}   label="ثريدز" />
        <SocialIcon href={officialSocialLinks.tiktok}    icon={<IconTiktok />}    label="TikTok" />
        <SocialIcon href={officialSocialLinks.x}         icon={<IconX />}         label="X / Twitter" />
        <SocialIcon href={officialSocialLinks.pinterest} icon={<IconPinterest />} label="Pinterest" />


        <span className="w-px h-3 bg-white/20 mx-0.5" />

        <SocialIcon href={officialSocialLinks.whatsappChannel} icon={<IconWhatsapp />} label="قناة الواتساب" />
        <SocialIcon href={whatsappNumberHref}            icon={<IconPhone />}    label="واتساب مباشر" />
      </div>
    </div>
  );
};

export default TopBar;
