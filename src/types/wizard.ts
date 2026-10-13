export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  iconHint: string;
}

export interface MetricItem {
  label: string;
  value: string;
}

export interface TestimonialItem {
  name: string;
  company?: string;
  text: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface CorporateFormData {
  // Vinculación con compra
  mercadoLibreUser: string;
  templateSelected: 'T3';

  // 1. Identidad Corporativa
  companyName: string;
  slogan: string;
  logoUrl: string;
  noLogo: boolean;
  primaryColor: string;
  secondaryColor: string;
  typography: 'Sans Serif' | 'Serif' | 'Otra' | '';
  customTypography: string;
  backgroundTone: 'Tonos Claros (Luminoso, limpio y clásico)' | 'Tonos Oscuros (Elegante, premium y moderno)' | 'A criterio del diseñador (Confío en ustedes)' | '';
  heroTitle: string;
  heroImage: string;
  wantsMobileHero: boolean;
  heroImageMobile: string;

  // 2. Sobre la Empresa y Métricas
  aboutText: string;
  aboutImage: string;
  strengths: string; // Misión / Propuesta de valor / Por qué elegirnos
  stats: MetricItem[];

  // 3. Cartera de Servicios y Soluciones
  services: ServiceItem[];
  faqs: FaqItem[];

  // 4. Clientes y Testimonios
  useGoogleMapsReviews: boolean;
  googleMapsLink: string;
  reviewsList: TestimonialItem[];

  // 5. Contacto Corporativo
  whatsapp: string;
  corporateEmail: string;
  linkedin: string;
  instagram: string;
  facebook: string;
  socialLinks?: string; // Redes adicionales opcionales
  address: string;

  // 6. Plan de Dominio y Preferencias (3 opciones)
  domainPlan: DomainPlanType;
  domainOption1: string;
  domainOption2: string;
  domainOption3: string;

  // 7. Términos y Condiciones
  acceptedTerms: boolean;
}

export type DomainPlanType = 'free' | 'com_ar' | 'com';

export type StepId =
  | 'WELCOME'
  | 'ACCOUNT_SYNC'
  | 'COMPANY_NAME'
  | 'BRAND_LOGO'
  | 'BRAND_STYLE'
  | 'BRAND_COLORS'
  | 'BRAND_TYPOGRAPHY'
  | 'BACKGROUND_TONE'
  | 'HERO_SECTION'
  | 'ABOUT_COMPANY'
  | 'VALUE_PROPOSITION'
  | 'SERVICES_PORTFOLIO'
  | 'FAQS_SECTION'
  | 'CLIENTS_TESTIMONIALS'
  | 'CONTACT_CHANNELS'
  | 'DOMAIN_PLAN'
  | 'DOMAIN_PREFERENCES'
  | 'DOMAIN_CHOICE'
  | 'FINAL_REVIEW';

export interface StepDefinition {
  id: StepId;
  title: string;
  category: string;
  description?: string;
}
