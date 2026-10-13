export type DomainPlanType = 'free' | 'com_ar' | 'com';

export interface DomainPlanFeature {
  label: string;
  detail: string;
}

export interface DomainPlanConfig {
  id: DomainPlanType;
  name: string;
  badge: string;
  popular?: boolean;
  extension: string;
  exampleUrl: string;
  priceFormatted: string;
  priceNumber: number;
  isPaid: boolean;
  periodText: string;
  renewalNotice: string;
  tagline: string;
  features: DomainPlanFeature[];
  items: string[];
  mercadoPagoLink?: string;
}

export const DOMAIN_PLANS: Record<DomainPlanType, DomainPlanConfig> = {
  free: {
    id: 'free',
    name: 'Subdominio Vercel',
    badge: '100% Bonificado',
    popular: false,
    extension: '.vercel.app',
    exampleUrl: 'tuempresa.vercel.app',
    priceFormatted: '$0',
    priceNumber: 0,
    isPaid: false,
    periodText: 'Gratis de por vida',
    renewalNotice: 'Sin costos de renovación ni mantenimiento',
    tagline: 'Dirección web básica incluida sobre la infraestructura global de Vercel.',
    features: [
      {
        label: 'Hosting Cloud Vercel',
        detail: 'Infraestructura global de ultra velocidad con CDN mundial y 99.99% de uptime.'
      },
      {
        label: 'Certificado SSL HTTPS',
        detail: 'Cifrado de seguridad activo de por vida sin ningún costo extra.'
      },
      {
        label: 'Activación Inmediata',
        detail: 'Tu portal online al instante sin trámites ante organismos de registro.'
      }
    ],
    items: [
      'Hosting Cloud Vercel: Infraestructura global de ultra velocidad y 99.99% uptime.',
      'Certificado SSL HTTPS: Cifrado de seguridad activo de por vida sin costo extra.',
      'Activación Inmediata: Tu portal online al instante sin trámites ante entes.'
    ]
  },
  com_ar: {
    id: 'com_ar',
    name: 'Dominio Oficial .com.ar',
    badge: 'Más Elegido en Argentina',
    popular: true,
    extension: '.com.ar',
    exampleUrl: 'tuempresa.com.ar',
    priceFormatted: '$20.000',
    priceNumber: 20000,
    isPaid: true,
    periodText: 'ARS / año',
    renewalNotice: 'Arancel oficial de registro anual NIC Argentina',
    tagline: 'Identidad corporativa nacional para consolidar la confianza de tus clientes en el país.',
    mercadoPagoLink: import.meta.env.VITE_MP_LINK_COM_AR || 'https://mpago.la/1iLbwZF',
    features: [
      {
        label: 'Identidad y Confianza Local',
        detail: 'Máxima credibilidad formal frente a clientes, empresas y bancos en Argentina.'
      },
      {
        label: 'Prioridad SEO Regional',
        detail: 'Mejor posicionamiento orgánico en Google Argentina y búsquedas locales.'
      },
      {
        label: 'Registro Oficial NIC Argentina',
        detail: 'Titularidad legal registrada formalmente a nombre y personería de tu empresa.'
      },
      {
        label: 'Correos Corporativos con Tu Marca',
        detail: 'Habilitado para configurar casillas oficiales como contacto@tuempresa.com.ar.'
      },
      {
        label: 'Configuración DNS Llave en Mano',
        detail: 'Delegación técnica y vinculación completa a Vercel 100% bonificada.'
      }
    ],
    items: [
      'Identidad y Confianza Local: Máxima credibilidad frente a clientes de Argentina.',
      'Prioridad SEO Regional: Mejor posicionamiento en Google Argentina y búsquedas locales.',
      'Registro Oficial NIC Argentina: Titularidad formal a nombre de tu empresa.',
      'Correos Corporativos con Tu Marca: Habilitado para casillas oficiales propias.',
      'Configuración DNS Llave en Mano: Vinculación técnica a Vercel 100% bonificada.'
    ]
  },
  com: {
    id: 'com',
    name: 'Dominio Global .com',
    badge: 'Máxima Autoridad Mundial',
    popular: false,
    extension: '.com',
    exampleUrl: 'tuempresa.com',
    priceFormatted: '$30.000',
    priceNumber: 30000,
    isPaid: true,
    periodText: 'ARS / año',
    renewalNotice: 'Arancel oficial de registro anual ICANN / Registrar',
    tagline: 'El estándar comercial internacional más prestigioso y recordado del planeta.',
    mercadoPagoLink: import.meta.env.VITE_MP_LINK_COM || 'https://mpago.la/1WttGMk',
    features: [
      {
        label: 'El Estándar Dorado Internacional',
        detail: 'La extensión más prestigiosa que cualquier usuario recuerda instintivamente.'
      },
      {
        label: 'Proyección y Ventas Sin Fronteras',
        detail: 'Ideal para expandir tu negocio al exterior y captar clientes globales.'
      },
      {
        label: 'Protección Blindada de Tu Marca',
        detail: 'Protege tu nombre comercial evitando que competidores adquieran tu dominio.'
      },
      {
        label: 'Máxima Autoridad en Buscadores & IA',
        detail: 'Preferencia algorítmica global en Google y asistentes de Inteligencia Artificial.'
      },
      {
        label: 'Autonomía y Traspaso de Panel',
        detail: 'Credenciales oficiales transferidas para renovación independiente sin ataduras.'
      }
    ],
    items: [
      'El Estándar Dorado Internacional: La extensión más prestigiosa y recordada del mundo.',
      'Proyección y Ventas Sin Fronteras: Ideal para expandir tu negocio y vender al exterior.',
      'Protección Blindada de Marca: Evita que competidores registren tu nombre comercial.',
      'Máxima Autoridad en Buscadores & IA: Preferencia algorítmica en Google e IA.',
      'Autonomía y Traspaso de Panel: Credenciales transferidas para renovar por tu cuenta.'
    ]
  }
};