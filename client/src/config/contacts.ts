export interface WhatsAppContactItem {
  id: string;
  name: string;
  number: string;
  raw: string;
  waUrl: string;
  description: string;
  badge?: string;
}

export const LABIB_CONTACTS = {
  primaryPhone: '01602113987',
  supportEmail: 'support@labibtours.com',
  facebookPage: 'https://www.facebook.com/labibtourgroup/',
  messengerUrl: 'https://m.me/labibtourgroup',
  whatsAppList: [
    {
      id: 'wa-1',
      name: 'হোয়াটসঅ্যাপ লাইন ১',
      number: '01602113987',
      raw: '+8801602113987',
      waUrl:
        'https://wa.me/8801602113987?text=Hello%20Labib%20Tours,%20I%20want%20to%20know%20more%20about%20tours',
      description: 'বুকিং ও ট্যুর অনুসন্ধান',
      badge: 'Primary',
    },
    {
      id: 'wa-2',
      name: 'হোয়াটসঅ্যাপ লাইন ২',
      number: '01991009767',
      raw: '+8801991009767',
      waUrl: 'https://wa.me/8801991009767?text=Hello%20Labib%20Tours,%20I%20need%20assistance',
      description: 'কাস্টমার সাপোর্ট ও তথ্য',
      badge: 'Support',
    },
    {
      id: 'wa-3',
      name: 'হোয়াটসঅ্যাপ লাইন ৩',
      number: '01848474663',
      raw: '+8801848474663',
      waUrl: 'https://wa.me/8801848474663?text=Hello%20Labib%20Tours,%20urgent%20support',
      description: 'জরুরি সেবা ও হটলাইন',
      badge: 'Hotline',
    },
  ] as WhatsAppContactItem[],
};
