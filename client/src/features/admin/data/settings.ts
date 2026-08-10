import type { CompanySettings } from '@/features/admin/types';

/** Default settings shown in the Settings form — the exact shape a future `GET /api/v1/admin/settings` should return. */
export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  companyName: 'Labib Tour Management',
  logoUrl: '',
  faviconUrl: '',
  supportEmail: 'support@labibtours.com',
  supportPhone: '+8801700000000',
  whatsappNumber: '+8801000000000',
  socialLinks: [
    { platform: 'Facebook', url: 'https://facebook.com/labibtours' },
    { platform: 'Instagram', url: 'https://instagram.com/labibtours' },
    { platform: 'YouTube', url: 'https://youtube.com/@labibtours' },
  ],
  minimumAdvance: {
    day: 500,
    relax: 1000,
    premium: 2000,
    seasonal: 1500,
  },
};
