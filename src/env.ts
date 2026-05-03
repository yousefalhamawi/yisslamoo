/**
 * Secure Environment Variables Configuration
 * هذا الملف مسؤول عن التحقق من متغيرات البيئة قبل تشغيل التطبيق.
 */

const getEnvVar = (name: string): string => {
  // Try to get from Vite's import.meta.env
  // @ts-ignore
  const value = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env[name] : undefined;
  
  if (!value || value.includes('YOUR_') || value === 'placeholder') {
    console.error(`[Security Warning]: المتغير البيئي ${name} مفقود أو غير صالح.`);
    return '';
  }
  
  return value;
};

export const env = {
  get supabaseUrl() {
    return getEnvVar('VITE_SUPABASE_URL');
  },
  get supabaseAnonKey() {
    return getEnvVar('VITE_SUPABASE_ANON_KEY');
  },
  
  get isConfigured() {
    return !!(this.supabaseUrl && this.supabaseAnonKey && this.supabaseUrl.startsWith('http'));
  }
};
