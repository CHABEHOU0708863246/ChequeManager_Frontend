export interface Bank {
  id: string;
  code: string;
  name: string;
  fullName: string;
  group?: string;
  logoType: 'mountains' | 'square' | 'circle' | 'text' | 'emblem';
  primaryColor: string;
  secondaryColor: string;
  hasWatermark: boolean;
  watermarkText?: string;
}
