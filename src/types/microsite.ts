export interface Microsite {
  id: string;
  title: string;
  description: string;
  status: 'online' | 'offline';
  hasAccess: boolean;
  icon: string;
  gradient: string;
  country: string;
}

export interface Country {
  value: string;
  label: string;
}

export type MicrositeStatus = 'online' | 'offline';
export type CountryCode = 'MY' | 'GLOBAL' | 'BR' | 'BN' | 'GA' | 'ID' | 'IQ' | 'SS' | 'SR' | 'TM';