import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Phone, 
  Mail, 
  Plus, 
  Trash2, 
  Star, 
  CreditCard, 
  Link as LinkIcon, 
  Loader2, 
  ShieldCheck, 
  CheckCircle2, 
  Globe, 
  Quote,
  Check,
  Palette,
  Type,
  SunMedium,
  ArrowDown,
  MapPin
} from 'lucide-react';

import type { CorporateFormData, ServiceItem, FaqItem, StepDefinition, DomainPlanType } from '../types/wizard';
import ImageUpload from './ImageUpload';
import AddressAutocomplete from './AddressAutocomplete';
import StepWelcome, { DEFAULT_CORPORATE_DEMO_URL } from './steps/StepWelcome';
import StepDomainPlan from './steps/StepDomainPlan';
import StepDomainPreferences from './steps/StepDomainPreferences';
import { DOMAIN_PLANS } from '../config/domainPlans';
import MercadoPagoIcon from './icons/MercadoPagoIcon';
import { parseColorToCss } from '../utils/colorParser';

import { db, FIRESTORE_COLLECTION } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

import FloatingWhatsAppSupport, { WhatsAppIcon } from './FloatingWhatsAppSupport';

const CLOUDINARY_BASE_FOLDER = import.meta.env.VITE_CLOUDINARY_BASE_FOLDER || 'Template Corporativo - Sin dominio';

const InstagramIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const FacebookIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const LinkedinIcon = ({ size = 18, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

// Componente de apoyo visible, elegante y con personalidad de agencia
const AgencyCopyTip = ({
  message
}: {
  message: string;
}) => (
  <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 flex items-start gap-2.5 text-xs sm:text-[13px] text-slate-700 leading-relaxed shadow-2xs">
    <Sparkles size={15} className="text-blue-600 shrink-0 mt-0.5" />
    <div>
      <span className="font-bold text-slate-900 mr-1.5">Tip de redacción:</span>
      <span className="text-slate-700">{message}</span>
    </div>
  </div>
);

const generateEmptyServices = (): ServiceItem[] => [
  { id: 'svc-1', title: '', description: '', iconHint: '' },
  { id: 'svc-2', title: '', description: '', iconHint: '' },
  { id: 'svc-3', title: '', description: '', iconHint: '' },
  { id: 'svc-4', title: '', description: '', iconHint: '' },
  { id: 'svc-5', title: '', description: '', iconHint: '' },
  { id: 'svc-6', title: '', description: '', iconHint: '' }
];

const initialData: CorporateFormData = {
  mercadoLibreUser: '',
  templateSelected: 'T3',

  // 1. Identidad Corporativa
  companyName: '',
  slogan: '',
  logoUrl: '',
  noLogo: false,
  primaryColor: '',
  secondaryColor: '',
  typography: '',
  customTypography: '',
  backgroundTone: '',
  heroTitle: '',
  heroImage: '',
  wantsMobileHero: false,
  heroImageMobile: '',

  // 2. Sobre la Empresa
  aboutText: '',
  aboutImage: '',
  strengths: '',
  stats: [],

  // 3. Servicios & FAQs
  services: generateEmptyServices(),
  faqs: [
    { question: '', answer: '' },
    { question: '', answer: '' }
  ],

  // 4. Testimonios
  useGoogleMapsReviews: false,
  googleMapsLink: '',
  reviewsList: [
    { name: '', company: '', text: '' },
    { name: '', company: '', text: '' },
    { name: '', company: '', text: '' }
  ],

  // 5. Contacto
  whatsapp: '',
  corporateEmail: '',
  linkedin: '',
  instagram: '',
  facebook: '',
  address: '',

  // 6. Dominio y Dirección Web (Plan y 3 opciones)
  domainPlan: 'com_ar',
  domainOption1: '',
  domainOption2: '',
  domainOption3: '',

  // 7. Términos
  acceptedTerms: false
};

const STEPS: StepDefinition[] = [
  { id: 'WELCOME', title: 'Bienvenida & Demo', category: 'Inicio' },
  { id: 'ACCOUNT_SYNC', title: 'Identificador de Compra', category: 'Identidad' },
  { id: 'COMPANY_NAME', title: 'Nombre & Eslogan', category: 'Identidad' },
  { id: 'BRAND_LOGO', title: 'Logotipo Oficial', category: 'Identidad' },
  { id: 'BRAND_STYLE', title: 'Estilo Visual', category: 'Identidad' },
  { id: 'HERO_SECTION', title: 'Portada Principal', category: 'Identidad' },
  { id: 'ABOUT_COMPANY', title: 'Quiénes Somos', category: 'Empresa' },
  { id: 'VALUE_PROPOSITION', title: 'Por Qué Elegirnos', category: 'Empresa' },
  { id: 'SERVICES_PORTFOLIO', title: 'Cartera de Servicios', category: 'Soluciones' },
  { id: 'FAQS_SECTION', title: 'Preguntas Frecuentes', category: 'Soluciones' },
  { id: 'CLIENTS_TESTIMONIALS', title: 'Testimonios & Clientes', category: 'Testimonios' },
  { id: 'CONTACT_CHANNELS', title: 'Canales de Contacto', category: 'Contacto' },
  { id: 'DOMAIN_PLAN', title: 'Tipo de Dominio', category: 'Dominio' },
  { id: 'DOMAIN_PREFERENCES', title: 'Opciones de Dominio', category: 'Dominio' },
  { id: 'FINAL_REVIEW', title: 'Confirmación & Envío', category: 'Finalizar' }
];

export default function Wizard() {
  const [data, setData] = useState<CorporateFormData>(initialData);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedProject, setSubmittedProject] = useState<{
    id: string;
    companyName: string;
    isPaid?: boolean;
    planName?: string;
    priceFormatted?: string;
    redirectUrl?: string;
  } | null>(null);

  // Helper para generar el nombre de carpeta del cliente en Cloudinary
  const getClientFolderName = () => {
    const company = (data.companyName ?? '').trim();
    const user = (data.mercadoLibreUser ?? '').trim();
    if (company && user) return `${company}_(${user})`;
    if (company) return company;
    if (user) return user;
    return 'cliente_general';
  };

  // Sub-paso para que la pantalla interactiva se quede fija arriba y abajo cambien: 0 = Colores, 1 = Tipografía, 2 = Tono
  const [brandSubStep, setBrandSubStep] = useState<0 | 1 | 2>(0);

  // Estado para el indicador animado flotante "Continúa abajo"
  const [showScrollPrompt, setShowScrollPrompt] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStepIndex, brandSubStep]);

  useEffect(() => {
    const checkScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      const scrollY = window.scrollY;
      const scrollRemaining = scrollHeight - (scrollY + clientHeight);

      // Solo mostrar si realmente hay más de 240px de contenido oculto debajo y estamos en la parte superior
      const hasSignificantContentBelow = scrollRemaining > 240;
      const isNearTop = scrollY < 50;

      setShowScrollPrompt(hasSignificantContentBelow && isNearTop);
    };

    const timer = setTimeout(checkScroll, 200);
    window.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [currentStepIndex, brandSubStep, data.services.length]);

  const currentStep = STEPS[currentStepIndex];

  const nextStep = () => {
    // Si estamos en la pantalla interactiva de estilo de marca, avanzamos primero sus sub-pasos
    if (currentStep.id === 'BRAND_STYLE' && brandSubStep < 2) {
      setBrandSubStep((prev) => (prev + 1) as 0 | 1 | 2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (currentStepIndex < STEPS.length - 1) {
      setDirection(1);
      setCurrentStepIndex((prev) => prev + 1);
      // Al entrar a BRAND_STYLE desde BRAND_LOGO, comenzamos en subpaso 0 (Colores)
      if (STEPS[currentStepIndex + 1]?.id === 'BRAND_STYLE') {
        setBrandSubStep(0);
      }
    }
  };

  const prevStep = () => {
    // Si estamos en la pantalla interactiva y en subpaso mayor a 0, retrocedemos de subpaso
    if (currentStep.id === 'BRAND_STYLE' && brandSubStep > 0) {
      setBrandSubStep((prev) => (prev - 1) as 0 | 1 | 2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (currentStepIndex > 0) {
      setDirection(-1);
      setCurrentStepIndex((prev) => prev - 1);
      // Si volvemos hacia BRAND_STYLE desde HERO_SECTION, mostramos el último subpaso (Tonos)
      if (STEPS[currentStepIndex - 1]?.id === 'BRAND_STYLE') {
        setBrandSubStep(2);
      }
    }
  };

  const handleInputChange = <K extends keyof CorporateFormData>(field: K, value: CorporateFormData[K]) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const updateService = (index: number, field: keyof ServiceItem, value: string) => {
    const updated = [...data.services];
    updated[index] = { ...updated[index], [field]: value };
    setData((prev) => ({ ...prev, services: updated }));
  };

  const updateFaq = (index: number, field: keyof FaqItem, value: string) => {
    const updated = [...data.faqs];
    updated[index] = { ...updated[index], [field]: value };
    setData((prev) => ({ ...prev, faqs: updated }));
  };

  const addFaq = () => {
    if (data.faqs.length < 5) {
      setData((prev) => ({
        ...prev,
        faqs: [...prev.faqs, { question: '', answer: '' }]
      }));
    }
  };

  const removeFaq = (index: number) => {
    setData((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index)
    }));
  };

  const updateReview = (index: number, field: 'name' | 'company' | 'text', value: string) => {
    const updated = [...data.reviewsList];
    updated[index] = { ...updated[index], [field]: value };
    setData((prev) => ({ ...prev, reviewsList: updated }));
  };

  const isNextDisabled = (): boolean => {
    const stepId = currentStep.id;

    if (stepId === 'WELCOME') return false;
    if (stepId === 'ACCOUNT_SYNC') return (data.mercadoLibreUser ?? '').trim() === '';
    if (stepId === 'COMPANY_NAME') return (data.companyName ?? '').trim() === '';
    if (stepId === 'BRAND_LOGO') return !data.noLogo && (data.logoUrl ?? '') === '';
    
    // Validación por sub-paso en BRAND_STYLE
    if (stepId === 'BRAND_STYLE') {
      if (brandSubStep === 0) {
        return (data.primaryColor ?? '').trim() === '' || (data.secondaryColor ?? '').trim() === '';
      }
      if (brandSubStep === 1) {
        return data.typography === '' || (data.typography === 'Otra' && (data.customTypography ?? '').trim() === '');
      }
      if (brandSubStep === 2) {
        return data.backgroundTone === '';
      }
      return false;
    }

    if (stepId === 'HERO_SECTION') {
      if ((data.heroTitle ?? '').trim() === '' || (data.heroImage ?? '') === '') return true;
      if (data.wantsMobileHero && (data.heroImageMobile ?? '') === '') return true;
      return false;
    }
    if (stepId === 'ABOUT_COMPANY') {
      return (data.aboutText ?? '').trim() === '' || (data.aboutImage ?? '').trim() === '';
    }
    if (stepId === 'VALUE_PROPOSITION') {
      return (data.strengths ?? '').trim() === '';
    }
    if (stepId === 'SERVICES_PORTFOLIO') {
      const valid = (data.services ?? []).filter((s) => (s.title ?? '').trim() !== '' && (s.description ?? '').trim() !== '');
      return valid.length < 6;
    }
    if (stepId === 'FAQS_SECTION') {
      const valid = (data.faqs ?? []).filter((f) => (f.question ?? '').trim() !== '' && (f.answer ?? '').trim() !== '');
      const hasIncomplete = (data.faqs ?? []).some(
        (f) => ((f.question ?? '').trim() !== '' && (f.answer ?? '').trim() === '') ||
               ((f.question ?? '').trim() === '' && (f.answer ?? '').trim() !== '')
      );
      return valid.length === 0 || hasIncomplete;
    }
    if (stepId === 'CLIENTS_TESTIMONIALS') {
      if (data.useGoogleMapsReviews) return (data.googleMapsLink ?? '').trim() === '';
      return (data.reviewsList ?? []).some((r) => (r.name ?? '').trim() === '' || (r.text ?? '').trim() === '');
    }
    if (stepId === 'CONTACT_CHANNELS') {
      return (data.whatsapp ?? '').trim() === '' || (data.corporateEmail ?? '').trim() === '';
    }
    if (stepId === 'DOMAIN_PLAN') {
      return !data.domainPlan;
    }
    if (stepId === 'DOMAIN_PREFERENCES' || stepId === 'DOMAIN_CHOICE') {
      return (data.domainOption1 ?? '').trim() === '';
    }
    if (stepId === 'FINAL_REVIEW') {
      return !data.acceptedTerms;
    }

    return false;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const clientFolderName = getClientFolderName();
      const safeClientSlug = (data.companyName || data.mercadoLibreUser || 'proyecto')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_');
      const documentId = `${safeClientSlug}_${Date.now().toString().slice(-6)}`;
      const selectedPlanConfig = DOMAIN_PLANS[data.domainPlan] || DOMAIN_PLANS.free;

      const cleanData = {
        // METADATOS DEL REGISTRO
        idProyecto: documentId,
        fechaCreacion: serverTimestamp(),
        fechaRegistroLocal: new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }),
        estadoProyecto: selectedPlanConfig.isPaid ? 'PENDIENTE_PAGO_DOMINIO' : 'PENDIENTE_DIAGRAMACION',
        origenFormulario: 'Template Corporativo - Sin dominio',

        // 1. IDENTIFICACIÓN DEL CLIENTE
        cliente: {
          usuarioMercadoLibre: data.mercadoLibreUser,
          nombreEmpresa: data.companyName,
          eslogan: data.slogan || 'Sin eslogan definido',
          carpetaCloudinary: `${CLOUDINARY_BASE_FOLDER}/${clientFolderName.replace(/[<>:"/\\|?*#]+/g, '_').replace(/\s+/g, '_')}`
        },

        // 2. IDENTIDAD VISUAL Y ESTILO
        identidadVisual: {
          logotipo: {
            tieneLogo: !data.noLogo,
            tipo: data.noLogo ? 'Requiere diseño tipográfico' : 'Logotipo oficial adjuntado',
            url: data.noLogo ? null : (data.logoUrl || null)
          },
          paletaColores: {
            colorPrimario: data.primaryColor || 'A definir por el diseñador',
            colorSecundario: data.secondaryColor || 'A definir por el diseñador'
          },
          tipografia: {
            opcion: data.typography || 'A criterio del diseñador',
            detallePersonalizado: data.typography === 'Otra' ? data.customTypography : null
          },
          tonoVisual: data.backgroundTone || 'A criterio del diseñador'
        },

        // 3. PORTADA Y FOTOGRAFÍA HERO
        portadaHero: {
          tituloPrincipal: data.heroTitle,
          imagenDesktopUrl: data.heroImage,
          tieneImagenMobileDedicada: data.wantsMobileHero,
          imagenMobileUrl: data.wantsMobileHero ? data.heroImageMobile : data.heroImage
        },

        // 4. SOBRE LA EMPRESA & PROPUESTA DE VALOR
        sobreLaEmpresa: {
          presentacionHistoria: data.aboutText,
          fotografiaInstitucionalUrl: data.aboutImage || null,
          porQueElegirnos: data.strengths
        },

        // 5. CARTERA DE SERVICIOS (6 SERVICIOS OBLIGATORIOS)
        servicios: data.services.map((svc, index) => ({
          posicion: index + 1,
          titulo: svc.title,
          descripcion: svc.description,
          iconoSugerido: svc.iconHint || null
        })),

        // 6. PREGUNTAS FRECUENTES (FAQS)
        preguntasFrecuentes: data.faqs
          .filter((f) => (f.question ?? '').trim() !== '' && (f.answer ?? '').trim() !== '')
          .map((faq, index) => ({
            numero: index + 1,
            pregunta: faq.question.trim(),
            respuesta: faq.answer.trim()
          })),

        // 7. PRUEBA SOCIAL Y TESTIMONIOS
        testimonios: {
          modalidad: data.useGoogleMapsReviews ? 'Google Maps Verificado' : 'Carga Manual',
          linkGoogleMaps: data.useGoogleMapsReviews ? data.googleMapsLink : null,
          resenasManuales: data.useGoogleMapsReviews
            ? []
            : data.reviewsList
                .filter((r) => (r.name ?? '').trim() || (r.text ?? '').trim())
                .map((r) => ({
                  autor: r.name,
                  empresaOCargo: r.company || null,
                  testimonio: r.text
                }))
        },

        // 8. CANALES DE CONTACTO Y REDES
        contacto: {
          whatsapp: data.whatsapp,
          emailCorporativo: data.corporateEmail,
          redesSociales: {
            instagram: data.instagram ? `@${data.instagram.replace('@', '')}` : null,
            facebook: data.facebook || null,
            linkedin: data.linkedin || null
          },
          direccionFisica: data.address || 'Oficinas corporativas / Modalidad remota'
        },

        // 9. DIRECCIÓN WEB Y DOMINIO
        direccionWeb: {
          tipoPlan: data.domainPlan,
          nombrePlan: selectedPlanConfig.name,
          extension: selectedPlanConfig.extension,
          arancelOficial: selectedPlanConfig.priceNumber,
          arancelFormateado: selectedPlanConfig.priceFormatted,
          requierePagoMercadoPago: Boolean(selectedPlanConfig.isPaid),
          estadoPagoDominio: selectedPlanConfig.isPaid ? 'PENDIENTE_PAGO_MERCADOPAGO' : 'INCLUIDO_GRATIS',
          linkMercadoPago: selectedPlanConfig.mercadoPagoLink || null,
          dominioPrioridad1: data.domainOption1,
          dominioPrioridad2: data.domainOption2 || null,
          dominioPrioridad3: data.domainOption3 || null,
          politicaRenovacion: selectedPlanConfig.isPaid
            ? 'Arancel oficial de 1 año incluido; credenciales transferidas al cliente para renovar por su cuenta anualmente ante el ente oficial'
            : 'Subdominio permanente en Vercel sin costos de renovación',
          hostingCloud: '100% Gratuito en Vercel Ultra Speed (Jamstack SSL)'
        },

        // 10. CONDICIONES ACEPTADAS POR EL CLIENTE
        terminosYCondiciones: {
          aceptado: data.acceptedTerms,
          fechaAceptacion: new Date().toISOString(),
          clausulasValidadas: [
            '1. Cómputo del Plazo de Entrega (48 hs hábiles): Inicio contra recepción total de datos obligatorios, enlaces y archivos validados.',
            '2. Propiedad Intelectual y Derechos del Contenido: Declaración jurada de titularidad y deslinde total a AG Digital Studio.',
            '3. Estructura Fija, Hosting Cloud y Seguridad SSL: Adaptación fiel sin alteración de secciones; hosting Vercel y SSL bonificado.',
            '4. Deslinde Técnico y Plataformas de Terceros: Deslinde por caídas, políticas o interrupciones de plataformas de terceros.',
            '5. Previsualización, Revisión y Alcance de Cambios: Enlace privado de validación y una (1) instancia única e integral de ajustes menores.',
            '6. Dominio, Gestión y Autonomía: Registro oficial por 1 año, delegación de credenciales y total autonomía sin permanencia.'
          ],
          declaracionLegalCheckbox: 'He leído y acepto los Términos de Contratación, Propiedad de Contenidos y Alcance Técnico. Declaro que los datos y archivos cargados son definitivos y cuento con los derechos de uso del material suministrado. Autorizo a AG Digital Studio a iniciar la producción técnica bajo las condiciones y plazos estipulados.'
        }
      };

            // Función de seguridad: Firestore arroja error fatal si encuentra cualquier valor undefined
      const sanitizeForFirestore = (obj: any): any => {
        if (obj === null || obj === undefined) return null;
        if (typeof obj !== 'object') return obj;
        if (obj instanceof Date) return obj;
        if (obj && typeof obj === 'object' && ('_methodName' in obj || obj.constructor?.name === 'FieldValue')) {
          return obj;
        }
        if (Array.isArray(obj)) {
          return obj.map(item => sanitizeForFirestore(item));
        }
        const clean: Record<string, any> = {};
        for (const [key, val] of Object.entries(obj)) {
          clean[key] = val === undefined ? null : sanitizeForFirestore(val);
        }
        return clean;
      };

      await setDoc(doc(db, FIRESTORE_COLLECTION, documentId), sanitizeForFirestore(cleanData));

      if (selectedPlanConfig.isPaid && selectedPlanConfig.mercadoPagoLink) {
        const mpBase = selectedPlanConfig.mercadoPagoLink;
        const redirectUrl = mpBase.includes('?')
          ? `${mpBase}&external_reference=${encodeURIComponent(documentId)}`
          : `${mpBase}?external_reference=${encodeURIComponent(documentId)}`;

        setSubmittedProject({
          id: documentId,
          companyName: data.companyName || data.mercadoLibreUser || 'Empresa Corporativa',
          isPaid: true,
          planName: selectedPlanConfig.name,
          priceFormatted: selectedPlanConfig.priceFormatted,
          redirectUrl: redirectUrl
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Redirige automáticamente al link de pago de Mercado Pago
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 1200);
      } else {
        setSubmittedProject({
          id: documentId,
          companyName: data.companyName || data.mercadoLibreUser || 'Empresa Corporativa',
          isPaid: false,
          planName: selectedPlanConfig.name,
          priceFormatted: selectedPlanConfig.priceFormatted
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error registrando el formulario en Firestore:', error);
      alert('Hubo un inconveniente al registrar tu formulario. Por favor, verifica tu conexión a internet.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercent = Math.round((currentStepIndex / (STEPS.length - 1)) * 100);

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 25 : -25,
      opacity: 0,
      scale: 0.99
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -25 : 25,
      opacity: 0,
      scale: 0.99
    })
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col items-center pt-20 sm:pt-24 px-3 sm:px-6 relative selection:bg-slate-950 selection:text-white">
      
      {/* HEADER SUPERIOR FIJO REDISEÑADO */}
      <header className="fixed top-0 left-0 w-full flex flex-col items-center z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/70 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.04)]">
        <div className={`w-full ${currentStep.id === 'DOMAIN_PLAN' ? 'max-w-6xl' : 'max-w-4xl'} px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-4 transition-all duration-300`}>
          
          {/* BRANDING ELEGANTE & MINIMALISTA */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 p-1">
              <img 
                src="/assets/Logo.webp" 
                alt="AG Logo" 
                className="h-7 sm:h-8 w-auto object-contain shrink-0" 
              />
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-bold text-slate-950 tracking-tight leading-none">
                  Portal Corporativo
                </span>
                <span className="text-[11px] font-medium text-slate-500 mt-0.5">
                  AG Digital Studio
                </span>
              </div>
            </div>
          </div>

          {/* INDICADOR DE PASO MINIMALISTA */}
          {currentStep.id !== 'WELCOME' && (
            <div className="flex items-center">
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100/90 border border-slate-200/80 text-xs text-slate-600">
                <span className="font-medium">Paso</span>
                <span className="font-bold text-slate-950">{currentStepIndex}</span>
                <span className="text-slate-400">de</span>
                <span className="font-medium text-slate-600">{STEPS.length - 1}</span>
              </div>
            </div>
          )}
        </div>

        {/* LÍNEA DE PROGRESO MINIMALISTA */}
        {currentStep.id !== 'WELCOME' && (
          <div className="w-full h-[2px] bg-slate-100 relative overflow-hidden">
            <motion.div
              className="h-full bg-slate-900"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          </div>
        )}
      </header>

      {/* CONTENEDOR PRINCIPAL */}
      {submittedProject ? (
        <main className="w-full max-w-2xl flex flex-col items-center justify-center py-6 sm:py-10 px-2 sm:px-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-full glass-panel rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200/90 flex flex-col items-center text-center gap-6"
          >
            {/* ÍCONO DE ÉXITO */}
            <div className="relative flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-slate-950 text-white flex items-center justify-center shadow-lg border border-slate-800">
                <CheckCircle2 size={40} className="text-white" />
              </div>
            </div>

            <div className="flex flex-col gap-2 max-w-lg">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Orden #{submittedProject.id.toUpperCase()} · {submittedProject.isPaid ? 'Ficha Recibida & Pago en Proceso' : 'Recibida'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                ¡Ficha Corporativa Registrada con Éxito!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Los datos y archivos de <strong className="text-slate-900 font-bold">{submittedProject.companyName}</strong> fueron sincronizados correctamente en la base de datos de <strong className="text-slate-900 font-bold">AG Digital Studio</strong>.
              </p>
            </div>

            {/* AVISO DE REDIRECCIÓN A MERCADO PAGO SI ES DE PAGO */}
            {submittedProject.isPaid && (
              <div className="w-full rounded-2xl bg-blue-50/80 border border-blue-200/90 p-4 sm:p-4.5 flex items-center justify-between gap-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#009EE3] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <MercadoPagoIcon size={20} />
                  </div>
                  <div className="flex flex-col text-xs text-slate-700 leading-snug">
                    <span className="font-bold text-slate-950 text-sm">
                      Conectando con Checkout de Mercado Pago
                    </span>
                    <span>
                      Se está procesando la redirección para abonar el arancel oficial del dominio ({submittedProject.priceFormatted}). Si tu navegador no redirige automáticamente, haz clic en el botón azul.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ESTADO DE ALMACENAMIENTO */}
            <div className="w-full rounded-2xl bg-slate-50/90 border border-slate-200/80 p-4 sm:p-5 flex flex-col gap-3 text-left text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 font-semibold text-slate-700">
                <span>Estado de Almacenamiento & Despliegue</span>
                <span className="text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Sincronizado
                </span>
              </div>
              <div className="flex flex-col gap-2 text-slate-600">
                <div className="flex items-baseline gap-2">
                  <span className="w-32 shrink-0 font-medium text-slate-500">Base de Datos:</span>
                  <span className="font-semibold text-slate-900 truncate">Firebase Firestore (Colección {FIRESTORE_COLLECTION})</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="w-32 shrink-0 font-medium text-slate-500">Plan de Dominio:</span>
                  <span className="font-semibold text-slate-900 truncate">
                    {submittedProject.planName || 'Configurado'} ({submittedProject.priceFormatted || 'Incluido'})
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="w-32 shrink-0 font-medium text-slate-500">Bóveda de Medios:</span>
                  <span className="font-semibold text-slate-900 truncate">Cloudinary /{CLOUDINARY_BASE_FOLDER}/{getClientFolderName()}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="w-32 shrink-0 font-medium text-slate-500">Hosting Cloud:</span>
                  <span className="font-semibold text-slate-900 truncate">Infraestructura Vercel (Gratuito Jamstack SSL)</span>
                </div>
              </div>
            </div>

            {/* PRÓXIMOS PASOS */}
            <div className="w-full rounded-2xl bg-slate-900 text-white p-5 text-left flex flex-col gap-3 shadow-md">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                ¿Qué sucede a continuación?
              </span>
              <ul className="flex flex-col gap-2.5 text-xs text-slate-300 leading-relaxed">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-white/10 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <span><strong>Optimización SEO & Redacción IA:</strong> Nuestro equipo perfecciona los textos y títulos para posicionar en Google y motores de IA.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-white/10 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <span><strong>Previsualización Privada:</strong> Te enviaremos un link privado para revisar el diseño antes de la publicación final.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-white/10 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <span><strong>Entrega & Autonomía:</strong> Traspaso de credenciales completas para tu total control y libertad técnica.</span>
                </li>
              </ul>
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {submittedProject.isPaid && submittedProject.redirectUrl && (
                <a
                  href={submittedProject.redirectUrl}
                  target="_self"
                  className="w-full sm:w-auto h-13 px-7 rounded-2xl bg-[#009EE3] hover:bg-[#0089C7] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                >
                  <MercadoPagoIcon size={18} />
                  <span>Abonar en Mercado Pago ({submittedProject.priceFormatted})</span>
                </a>
              )}
              <a
                href={`https://wa.me/5491178188323?text=${encodeURIComponent(
                  `¡Hola AG Digital Studio! Acabo de enviar el formulario de onboarding para mi empresa "${submittedProject.companyName}" (Orden #${submittedProject.id.toUpperCase()}).`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto h-13 px-8 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-lg hover:shadow-xl transition-all cursor-pointer border border-slate-800"
              >
                <WhatsAppIcon size={17} className="text-white" />
                <span>Avisar al equipo por WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  setSubmittedProject(null);
                  setCurrentStepIndex(0);
                  setData(initialData);
                }}
                className="w-full sm:w-auto h-13 px-6 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 border border-slate-200 transition-all cursor-pointer"
              >
                <span>Cargar otro formulario</span>
              </button>
            </div>
          </motion.div>
        </main>
      ) : (
        <main className={`w-full ${currentStep.id === 'DOMAIN_PLAN' ? 'max-w-6xl' : 'max-w-3xl'} flex flex-col pb-40 sm:pb-36 mt-2 sm:mt-4 px-2 sm:px-0 transition-all duration-300`}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex flex-col justify-center"
            >

            {/* ============================================================ */}
            {/* STEP 0: WELCOME */}
            {/* ============================================================ */}
            {currentStep.id === 'WELCOME' && (
              <StepWelcome 
                onStart={nextStep} 
                demoUrl={DEFAULT_CORPORATE_DEMO_URL} 
              />
            )}

            {/* ============================================================ */}
            {/* STEP 1: ACCOUNT SYNC */}
            {/* ============================================================ */}
            {currentStep.id === 'ACCOUNT_SYNC' && (
              <div className="flex flex-col gap-6 py-2">
                <div className="flex flex-col gap-2">
                  <span className="text-xs sm:text-sm font-bold text-slate-400 tracking-wider uppercase">
                    Paso 01 · Identidad
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[1.15] ">
                    ¿Cuál es tu usuario de Mercado Libre o email?
                  </h2>
                  <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
                    Lo necesitamos para asociar esta configuración a tu compra de forma inmediata y segura.
                  </p>
                </div>

                <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wide">
                      Identificador de Compra *
                    </label>
                    <input
                      type="text"
                      value={data.mercadoLibreUser}
                      onChange={(e) => handleInputChange('mercadoLibreUser', e.target.value)}
                      placeholder="Ej: JUANPEREZ_VENTAS o contacto@empresa.com"
                      className="w-full h-14 bg-slate-50/70 border border-slate-200 hover:border-slate-300 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5 rounded-2xl px-5 text-base font-bold text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-2xs"
                      autoFocus
                    />
                  </div>

                  <AgencyCopyTip message="Podés ingresar tu usuario de Mercado Libre o el correo con el que efectuaste el pago." />
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* STEP 2: COMPANY NAME & SLOGAN */}
            {/* ============================================================ */}
            {currentStep.id === 'COMPANY_NAME' && (
              <div className="flex flex-col gap-6 py-2">
                <div className="flex flex-col gap-2">
                  <span className="text-xs sm:text-sm font-bold text-slate-400 tracking-wider uppercase">
                    Paso 02 · Identidad
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[1.15] ">
                    ¿Cómo se llama tu empresa o firma comercial?
                  </h2>
                  <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
                    Aparecerá en el encabezado oficial, pie de página y metadatos de posicionamiento en Google.
                  </p>
                </div>

                <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wide">
                      Nombre Comercial / Razón Social *
                    </label>
                    <input
                      type="text"
                      value={data.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      placeholder="Ej: Nexus Consultora S.A."
                      className="w-full h-14 bg-slate-50/70 border border-slate-200 hover:border-slate-300 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5 rounded-2xl px-5 text-base font-bold text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-2xs"
                      autoFocus
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wide">
                      Eslogan Institucional o Propósito (Opcional)
                    </label>
                    <input
                      type="text"
                      value={data.slogan}
                      onChange={(e) => handleInputChange('slogan', e.target.value)}
                      placeholder="Ej: Soluciones estratégicas para el crecimiento corporativo"
                      className="w-full h-14 bg-slate-50/70 border border-slate-200 hover:border-slate-300 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5 rounded-2xl px-5 text-base font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-2xs"
                    />
                  </div>

                  <AgencyCopyTip message="Si no sabés con exactitud qué eslogan poner, dejá una idea simple de lo que buscás transmitir. Nuestro equipo redactará una versión atractiva que podrás validar en la previsualización." />
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* STEP 3: BRAND LOGO */}
            {/* ============================================================ */}
            {currentStep.id === 'BRAND_LOGO' && (
              <div className="flex flex-col gap-6 py-2">
                <div className="flex flex-col gap-2">
                  <span className="text-xs sm:text-sm font-bold text-slate-400 tracking-wider uppercase">
                    Paso 03 · Identidad
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[1.15] ">
                    Subí el logotipo oficial de tu marca
                  </h2>
                  <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
                    Soporta imágenes en PNG, JPG o vector. Nuestro equipo limpiará los fondos si es necesario.
                  </p>
                </div>

                <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-5">
                  {!data.noLogo && (
                    <ImageUpload
                      clientFolder={getClientFolderName()}
                      imageType="logotipo"
                      value={data.logoUrl}
                      onChange={(url) => handleInputChange('logoUrl', url)}
                    />
                  )}

                  <label className="flex items-center gap-3.5 p-4 bg-slate-50/80 border border-slate-200 hover:border-slate-300 rounded-2xl cursor-pointer hover:bg-slate-100/60 transition-all">
                    <input
                      type="checkbox"
                      checked={data.noLogo}
                      onChange={(e) => {
                        handleInputChange('noLogo', e.target.checked);
                        if (e.target.checked) handleInputChange('logoUrl', '');
                      }}
                      className="w-4 h-4 rounded text-slate-900 border-slate-300 focus:ring-0 cursor-pointer shrink-0"
                    />
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 text-sm">No tenemos logotipo oficial todavía</span>
                      <span className="text-xs text-slate-500">Diseñaremos una marca tipográfica sobria y minimalista sin costo adicional.</span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* STEP 4: BRAND STYLE (ESTUDIO INTERACTIVO DINÁMICO POR SUB-PASOS) */}
            {/* ============================================================ */}
            {currentStep.id === 'BRAND_STYLE' && (() => {
              const primaryColorCss = parseColorToCss(data.primaryColor, '#0F172A');
              const secondaryColorCss = parseColorToCss(data.secondaryColor, '#334155');

              return (
              <div className="flex flex-col gap-5 py-2">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs sm:text-sm font-bold text-slate-400 tracking-wider uppercase">
                    Paso 04 · Identidad
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[1.15] ">
                    Estilo visual: Colores, Tipografía y Tono
                  </h2>
                  <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
                    Visualizá cómo toma vida tu sitio en tiempo real a medida que seleccionás cada atributo.
                  </p>
                </div>

                <div className="glass-panel rounded-3xl p-4 sm:p-7 shadow-sm flex flex-col gap-5 sm:gap-6">
                  
                  {/* PANTALLA INTERACTIVA FIJA EN LA PARTE SUPERIOR */}
                  <div className="rounded-2xl p-3 sm:p-4 border border-slate-200/90 bg-slate-100/70 shadow-xs flex flex-col gap-2.5">
                    {/* Barra superior de navegador de maqueta */}
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                        <span className="text-[11px]  font-medium text-slate-400 ml-2 hidden sm:inline">
                          https://tu-empresa.agweb.design
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full font-bold text-[10px] sm:text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Maqueta en Tiempo Real
                      </span>
                    </div>

                    {/* Contenedor del sitio simulado */}
                    <div 
                      className="p-4 sm:p-5 rounded-xl border transition-all duration-300 flex flex-col gap-3.5 shadow-2xs"
                      style={{
                        backgroundColor: data.backgroundTone.includes('Oscuros') ? '#0B1120' : data.backgroundTone.includes('criterio') ? '#F8FAFC' : '#FFFFFF',
                        color: data.backgroundTone.includes('Oscuros') ? '#F8FAFC' : '#0F172A',
                        borderColor: secondaryColorCss,
                        fontFamily: data.typography === 'Serif' 
                          ? "'Playfair Display', Georgia, serif" 
                          : data.typography === 'Otra' && data.customTypography.trim() 
                          ? data.customTypography 
                          : "'Outfit', 'Plus Jakarta Sans', sans-serif"
                      }}
                    >
                      <div className="flex items-center justify-between border-b pb-2.5" style={{ borderColor: data.backgroundTone.includes('Oscuros') ? '#1E293B' : '#F1F5F9' }}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs text-white shadow-xs transition-colors"
                            style={{ backgroundColor: primaryColorCss }}
                          >
                            {data.companyName ? data.companyName.charAt(0).toUpperCase() : 'A'}
                          </div>
                          <span className="font-extrabold text-xs sm:text-sm tracking-tight">
                            {data.companyName || 'Tu Firma Corporativa'}
                          </span>
                        </div>
                        <span className="text-[11px] opacity-60 hidden sm:inline">Inicio · Soluciones · Nosotros · Contacto</span>
                      </div>

                      <div className="flex flex-col gap-1.5 py-0.5">
                        <span 
                          className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded w-fit transition-colors"
                          style={{
                            backgroundColor: `${primaryColorCss}20`,
                            color: primaryColorCss
                          }}
                        >
                          Calidad de Agencia Digital
                        </span>
                        <h4 className="text-base sm:text-lg font-black leading-snug tracking-tight">
                          Lideramos el crecimiento de tu organización
                        </h4>
                        <div className="pt-1.5 flex items-center gap-2.5">
                          <button
                            type="button"
                            className="px-4 py-1.5 rounded-lg text-xs font-bold text-white shadow-2xs transition-all"
                            style={{ backgroundColor: primaryColorCss }}
                          >
                            Botón Principal
                          </button>
                          <button
                            type="button"
                            className="px-4 py-1.5 rounded-lg text-xs font-bold border transition-all"
                            style={{ 
                              borderColor: secondaryColorCss,
                              color: data.backgroundTone.includes('Oscuros') ? '#E2E8F0' : secondaryColorCss
                            }}
                          >
                            Secundario
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SELECTOR DE SUB-PASO (TABS DINÁMICOS) */}
                  <div className="flex items-center p-1 bg-slate-100 rounded-xl w-full">
                    <button
                      type="button"
                      onClick={() => setBrandSubStep(0)}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        brandSubStep === 0
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      1. Colores
                    </button>
                    <button
                      type="button"
                      onClick={() => setBrandSubStep(1)}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        brandSubStep === 1
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      2. Tipografía
                    </button>
                    <button
                      type="button"
                      onClick={() => setBrandSubStep(2)}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        brandSubStep === 2
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      3. Tono Visual
                    </button>
                  </div>

                  {/* PARTE DE ABAJO QUE CAMBIA SEGÚN EL SUB-PASO */}
                  <AnimatePresence mode="wait">
                    {/* SUB-PASO 0: COLORES */}
                    {brandSubStep === 0 && (
                      <motion.div
                        key="substep-colors"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col gap-4"
                      >
                        <div className="flex flex-col gap-2">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                            Paletas sugeridas de 1 clic:
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {[
                              { name: 'Onyx & Acero', primary: '#0F172A', secondary: '#475569' },
                              { name: 'Azul Corporativo', primary: '#1E3A8A', secondary: '#64748B' },
                              { name: 'Esmeralda & Gris', primary: '#064E3B', secondary: '#334155' },
                              { name: 'Vino & Carbón', primary: '#4A044E', secondary: '#1E293B' },
                              { name: 'Azul Marino & Dorado', primary: '#0A192F', secondary: '#D4AF37' },
                              { name: 'Petróleo & Titanio', primary: '#0F766E', secondary: '#475569' }
                            ].map((preset) => (
                              <button
                                key={preset.name}
                                type="button"
                                onClick={() => {
                                  handleInputChange('primaryColor', preset.primary);
                                  handleInputChange('secondaryColor', preset.secondary);
                                }}
                                className="p-2.5 rounded-xl border border-slate-200/90 hover:border-slate-900 text-left transition-all flex flex-col gap-1.5 cursor-pointer hover:bg-slate-50 active:scale-[0.98]"
                              >
                                <div className="flex gap-1.5 items-center">
                                  <span className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs" style={{ backgroundColor: preset.primary }} />
                                  <span className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs" style={{ backgroundColor: preset.secondary }} />
                                </div>
                                <span className="text-xs font-bold text-slate-800 leading-tight">{preset.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center justify-between">
                              <span>Color Principal (Botones y Acentos) *</span>
                              <span 
                                className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs shrink-0 transition-colors" 
                                style={{ backgroundColor: primaryColorCss }} 
                                title={`Muestra visual: ${primaryColorCss}`}
                              />
                            </label>
                            <input
                              type="text"
                              value={data.primaryColor}
                              onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                              placeholder="Ej: Azul Marino o #0F172A"
                              className="w-full h-13 bg-slate-50/70 border border-slate-200 hover:border-slate-300 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5 rounded-xl px-4 text-sm font-bold text-slate-900 outline-none transition-all shadow-2xs"
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center justify-between">
                              <span>Color Secundario (Bordes y Fondos) *</span>
                              <span 
                                className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs shrink-0 transition-colors" 
                                style={{ backgroundColor: secondaryColorCss }} 
                                title={`Muestra visual: ${secondaryColorCss}`}
                              />
                            </label>
                            <input
                              type="text"
                              value={data.secondaryColor}
                              onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                              placeholder="Ej: Gris Grafito o #334155"
                              className="w-full h-13 bg-slate-50/70 border border-slate-200 hover:border-slate-300 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5 rounded-xl px-4 text-sm font-bold text-slate-900 outline-none transition-all shadow-2xs"
                            />
                          </div>
                        </div>

                        <AgencyCopyTip message="Podés escribir palabras como 'Azul oscuro', 'Verde esmeralda', 'Dorado', o un código HEX. La maqueta arriba se adaptará en tiempo real." />
                      </motion.div>
                    )}

                    {/* SUB-PASO 1: TIPOGRAFÍA */}
                    {brandSubStep === 1 && (
                      <motion.div
                        key="substep-typography"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col gap-3.5"
                      >
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                          Elegí la tipografía de tu plataforma:
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          {[
                            { id: 'Sans Serif', title: 'Moderna & Clean', desc: 'Sans-Serif (Inter/Outfit), clara y tecnológica' },
                            { id: 'Serif', title: 'Editorial & Clásica', desc: 'Serif prestigiosa, tradicional y formal' },
                            { id: 'Otra', title: 'Google Font a Medida', desc: 'Fuente específica a tu elección' }
                          ].map((typo) => (
                            <button
                              key={typo.id}
                              type="button"
                              onClick={() => handleInputChange('typography', typo.id as any)}
                              className={`p-4 rounded-xl border text-left transition-all active:scale-[0.98] cursor-pointer flex flex-col justify-between h-24 ${
                                data.typography === typo.id
                                  ? 'border-slate-900 bg-slate-900/[0.04] ring-1 ring-slate-900 shadow-2xs'
                                  : 'border-slate-200 hover:border-slate-300 bg-white'
                              }`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className="font-extrabold text-slate-900 text-sm ">{typo.title}</span>
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${data.typography === typo.id ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300'}`}>
                                  {data.typography === typo.id && <Check size={11} />}
                                </div>
                              </div>
                              <span className="text-xs text-slate-500 leading-snug">{typo.desc}</span>
                            </button>
                          ))}
                        </div>

                        {data.typography === 'Otra' && (
                          <input
                            type="text"
                            value={data.customTypography}
                            onChange={(e) => handleInputChange('customTypography', e.target.value)}
                            placeholder="Escribí el nombre de la tipografía (Ej: Montserrat, Poppins, Outfit)"
                            className="w-full h-13 bg-slate-50/70 border border-slate-200 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5 rounded-xl px-4 text-sm font-bold text-slate-900 outline-none transition-all shadow-2xs mt-1"
                            autoFocus
                          />
                        )}

                        <AgencyCopyTip message="Al hacer clic, la tipografía cambia instantáneamente en la maqueta interactiva arriba." />
                      </motion.div>
                    )}

                    {/* SUB-PASO 2: TONO VISUAL */}
                    {brandSubStep === 2 && (
                      <motion.div
                        key="substep-tone"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col gap-3.5"
                      >
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                          Elegí la atmósfera de fondo del sitio:
                        </span>

                        <div className="grid grid-cols-1 gap-2.5">
                          {[
                            { val: 'Tonos Claros (Luminoso, limpio y clásico)', desc: 'Fondo blanco/marfil, máxima legibilidad y estética diáfana.' },
                            { val: 'Tonos Oscuros (Elegante, premium y moderno)', desc: 'Fondo grafito/carbón, atmósfera contemporánea y prestigiosa.' },
                            { val: 'A criterio del diseñador (Confío en ustedes)', desc: 'Nuestro equipo seleccionará el tono óptimo según tu rubro y logotipo.' }
                          ].map((tone) => (
                            <button
                              key={tone.val}
                              type="button"
                              onClick={() => handleInputChange('backgroundTone', tone.val as any)}
                              className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all active:scale-[0.98] cursor-pointer flex items-center justify-between ${
                                data.backgroundTone === tone.val
                                  ? 'border-slate-900 bg-slate-900/[0.04] ring-1 ring-slate-900 shadow-2xs'
                                  : 'border-slate-200 hover:border-slate-300 bg-white'
                              }`}
                            >
                              <div className="flex flex-col pr-2">
                                <span className="font-extrabold text-slate-900 text-sm ">{tone.val.split(' (')[0]}</span>
                                <span className="text-xs text-slate-500 mt-0.5 leading-snug">{tone.desc}</span>
                              </div>
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${data.backgroundTone === tone.val ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300'}`}>
                                {data.backgroundTone === tone.val && <Check size={11} />}
                              </div>
                            </button>
                          ))}
                        </div>

                        <AgencyCopyTip message="Podés ver cómo cambia el contraste de fondo en la maqueta interactiva arriba." />
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              </div>
              );
            })()}

            {/* ============================================================ */}
            {/* STEP 5: HERO SECTION */}
            {/* ============================================================ */}
            {currentStep.id === 'HERO_SECTION' && (
              <div className="flex flex-col gap-6 py-2">
                <div className="flex flex-col gap-2">
                  <span className="text-xs sm:text-sm font-bold text-slate-400 tracking-wider uppercase">
                    Paso 05 · Identidad
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[1.15] ">
                    La portada: primer impacto visual
                  </h2>
                  <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
                    Un titular contundente y una fotografía de alta calidad que sintetice tu propuesta de valor.
                  </p>
                </div>

                <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wide">
                      Frase o Titular Principal de Portada *
                    </label>
                    <textarea
                      value={data.heroTitle}
                      onChange={(e) => handleInputChange('heroTitle', e.target.value)}
                      placeholder="Ej: Impulsamos el crecimiento y la competitividad de las empresas líderes a través de soluciones estratégicas de clase mundial."
                      className="w-full bg-slate-50/70 border border-slate-200 hover:border-slate-300 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5 rounded-2xl p-4 text-sm sm:text-base font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all min-h-[100px] resize-none leading-relaxed shadow-2xs"
                    />
                  </div>

                  <AgencyCopyTip message="Si no sabés qué titular poner, poné algo sencillo o la idea principal de lo que buscás transmitir con tu negocio. Nuestro equipo redactará un titular atractivo para la web y en la previsualización podrás corregirlo si no te gusta." />

                  <div className="flex flex-col gap-2 pt-1">
                    <label className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wide">
                      Fotografía de Portada Desktop (Horizontal) *
                    </label>
                    <ImageUpload
                      clientFolder={getClientFolderName()}
                      imageType="portada_desktop"
                      value={data.heroImage}
                      onChange={(url) => handleInputChange('heroImage', url)}
                    />
                  </div>

                  <label className="flex items-center gap-3.5 p-4 bg-slate-50/80 border border-slate-200 hover:border-slate-300 rounded-2xl cursor-pointer hover:bg-slate-100/60 transition-all">
                    <input
                      type="checkbox"
                      checked={data.wantsMobileHero}
                      onChange={(e) => handleInputChange('wantsMobileHero', e.target.checked)}
                      className="w-4 h-4 rounded text-slate-900 border-slate-300 focus:ring-0 cursor-pointer shrink-0"
                    />
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 text-sm">Subir foto vertical optimizada para celulares</span>
                      <span className="text-xs text-slate-500">Opcional. Si no, adaptaremos la horizontal automáticamente para móviles.</span>
                    </div>
                  </label>

                  {data.wantsMobileHero && (
                    <div className="flex flex-col gap-2">
                      <label className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wide">
                        Foto Celular Vertical (9:16)
                      </label>
                      <ImageUpload
                        clientFolder={getClientFolderName()}
                        imageType="portada_mobile"
                        value={data.heroImageMobile}
                        onChange={(url) => handleInputChange('heroImageMobile', url)}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* STEP 6: ABOUT COMPANY */}
            {/* ============================================================ */}
            {currentStep.id === 'ABOUT_COMPANY' && (
              <div className="flex flex-col gap-6 py-2">
                <div className="flex flex-col gap-2">
                  <span className="text-xs sm:text-sm font-bold text-slate-400 tracking-wider uppercase">
                    Paso 06 · Empresa
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[1.15] ">
                    Contanos sobre la trayectoria e historia de la firma
                  </h2>
                  <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
                    A los clientes corporativos les interesa conocer quiénes están detrás y qué experiencia los respalda.
                  </p>
                </div>

                <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wide">
                      Historia y Presentación Institucional *
                    </label>
                    <textarea
                      value={data.aboutText}
                      onChange={(e) => handleInputChange('aboutText', e.target.value)}
                      placeholder="Ej: Fundada en 2012, somos una firma integral especializada en consultoría estratégica y servicios corporativos..."
                      className="w-full bg-slate-50/70 border border-slate-200 hover:border-slate-300 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5 rounded-2xl p-4 sm:p-5 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 outline-none transition-all min-h-[140px] resize-none leading-relaxed shadow-2xs"
                    />
                  </div>

                  <AgencyCopyTip message="Contanos en pocas líneas cómo nació tu empresa o a qué se dedican. Nuestro equipo se encargará de redactar una historia institucional atractiva y en la previsualización podrás corregir cualquier detalle." />

                  <div className="flex flex-col gap-2 pt-1">
                    <label className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wide">
                      Fotografía del Equipo o Instalaciones *
                    </label>
                    <ImageUpload
                      clientFolder={getClientFolderName()}
                      imageType="equipo_instalaciones"
                      value={data.aboutImage}
                      onChange={(url) => handleInputChange('aboutImage', url)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* STEP 7: VALUE PROPOSITION & STATS */}
            {/* ============================================================ */}
            {currentStep.id === 'VALUE_PROPOSITION' && (
              <div className="flex flex-col gap-6 py-2">
                <div className="flex flex-col gap-2">
                  <span className="text-xs sm:text-sm font-bold text-slate-400 tracking-wider uppercase">
                    Paso 07 · Empresa
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[1.15] ">
                    Diferenciales: ¿Por qué elegirnos?
                  </h2>
                  <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
                    Explicá las principales ventajas competitivas y motivos que distinguen a tu firma en el mercado.
                  </p>
                </div>

                <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wide">
                      Propuesta de Valor & Razones para Elegirnos *
                    </label>
                    <textarea
                      value={data.strengths}
                      onChange={(e) => handleInputChange('strengths', e.target.value)}
                      placeholder="Ej: Contamos con profesionales certificados con más de una década de experiencia comprobada, atención personalizada 24/7 y confidencialidad estricta..."
                      className="w-full bg-slate-50/70 border border-slate-200 hover:border-slate-300 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5 rounded-2xl p-4 sm:p-5 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 outline-none transition-all min-h-[140px] resize-none leading-relaxed shadow-2xs"
                    />
                  </div>

                  <AgencyCopyTip message="Explicá con tus palabras qué te destaca frente a la competencia (atención rápida, experiencia, compromiso). Nosotros lo convertiremos en una propuesta de valor atractiva para la web." />
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* STEP 8: SERVICES PORTFOLIO */}
            {/* ============================================================ */}
            {currentStep.id === 'SERVICES_PORTFOLIO' && (() => {
              const completedCount = data.services.filter(s => s.title.trim() !== '' && s.description.trim() !== '').length;

              return (
              <div className="flex flex-col gap-5 sm:gap-6 py-2">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs sm:text-sm font-bold text-slate-400 tracking-wider uppercase">
                    Paso 08 · Soluciones
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[1.15] ">
                    Cartera de 6 servicios corporativos
                  </h2>
                  <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
                    Estructurá las 6 soluciones de tu empresa (los 6 campos son obligatorios para tu plataforma).
                  </p>
                </div>

                <div className="glass-panel rounded-3xl p-4 sm:p-7 shadow-sm flex flex-col gap-5">
                  {/* CONTADOR DE PROGRESO */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wide">
                        6 Servicios Requeridos
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        Obligatorios
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="w-20 sm:w-28 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                          style={{ width: `${(completedCount / 6) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900 ">
                        {completedCount} de 6 completados
                      </span>
                    </div>
                  </div>

                  <AgencyCopyTip message="Escribí el nombre y una breve idea de cada servicio. Nuestro equipo le dará redacción profesional y atractiva para la web, y en la previsualización podrás validar o corregir todo." />

                  {/* LISTADO DE 6 TARJETAS DE SERVICIOS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {data.services.map((svc, idx) => {
                      const isComplete = svc.title.trim() !== '' && svc.description.trim() !== '';

                      return (
                        <div
                          key={svc.id}
                          className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/90 hover:border-slate-300 focus-within:border-slate-900 focus-within:bg-white transition-all flex flex-col gap-3 shadow-2xs"
                        >
                          {/* CABECERA DE LA TARJETA */}
                          <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
                            <div className="flex items-center gap-2.5">
                              <span className="w-6 h-6 rounded-lg bg-slate-900 text-white  text-xs font-bold flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <span className="text-xs sm:text-sm font-extrabold text-slate-900 ">
                                Servicio {idx + 1}
                              </span>
                            </div>

                            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                              isComplete 
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                : 'bg-slate-200 text-slate-500'
                            }`}>
                              {isComplete ? (
                                <>
                                  <Check size={11} className="text-emerald-700" />
                                  <span>Completo</span>
                                </>
                              ) : (
                                <span>Pendiente</span>
                              )}
                            </span>
                          </div>

                          {/* NOMBRE DEL SERVICIO */}
                          <div className="flex flex-col gap-1">
                            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                              Nombre del Servicio *
                            </label>
                            <input
                              type="text"
                              value={svc.title}
                              onChange={(e) => updateService(idx, 'title', e.target.value)}
                              placeholder={
                                idx === 0 ? 'Ej: Consultoría Estratégica' :
                                idx === 1 ? 'Ej: Asesoramiento Tributario y Legal' :
                                idx === 2 ? 'Ej: Auditoría y Compliance' :
                                idx === 3 ? 'Ej: Transformación Digital & IT' :
                                idx === 4 ? 'Ej: Gestión de Talento y RRHH' :
                                'Ej: Capacitación Ejecutiva'
                              }
                              className="w-full text-xs sm:text-sm font-bold text-slate-900 bg-white border border-slate-200 hover:border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/5 rounded-xl px-3.5 py-2.5 outline-none  shadow-2xs placeholder:text-slate-400 placeholder:font-normal"
                            />
                          </div>

                          {/* DESCRIPCIÓN */}
                          <div className="flex flex-col gap-1">
                            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                              Descripción breve *
                            </label>
                            <textarea
                              value={svc.description}
                              onChange={(e) => updateService(idx, 'description', e.target.value)}
                              placeholder="Breve idea de lo que incluye, a quién está dirigido y qué resultados brinda..."
                              className="w-full text-xs text-slate-800 bg-white border border-slate-200 hover:border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/5 rounded-xl p-3 outline-none resize-none h-20 placeholder:text-slate-400 leading-relaxed shadow-2xs"
                            />
                          </div>

                          {/* ÍCONO ORIENTATIVO */}
                          <div className="flex flex-col gap-1">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                              Ícono orientativo (Opcional)
                            </label>
                            <input
                              type="text"
                              value={svc.iconHint}
                              onChange={(e) => updateService(idx, 'iconHint', e.target.value)}
                              placeholder="Ej: Gráfico, Balanza, Maletín, Escudo, Cohete"
                              className="w-full text-xs text-slate-700 bg-white border border-slate-200 hover:border-slate-300 focus:border-slate-900 rounded-lg px-3 py-1.5 outline-none shadow-2xs placeholder:text-slate-400"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              );
            })()}

            {/* ============================================================ */}
            {/* STEP 9: FAQS SECTION */}
            {/* ============================================================ */}
            {currentStep.id === 'FAQS_SECTION' && (
              <div className="flex flex-col gap-6 py-2">
                <div className="flex flex-col gap-2">
                  <span className="text-xs sm:text-sm font-bold text-slate-400 tracking-wider uppercase">
                    Paso 09 · Soluciones
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[1.15] ">
                    Preguntas frecuentes de tus clientes
                  </h2>
                  <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
                    Anticípate a las dudas habituales de contratación, modalidades de pago o plazos de entrega.
                  </p>
                </div>

                <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-5">
                  <AgencyCopyTip message="Escribí las dudas y respuestas tal como las conversás en el día a día. Nuestro equipo cuidará la redacción para que luzcan claras y profesionales para tu web." />

                  {data.faqs.map((faq, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 hover:border-slate-300 focus-within:border-slate-900 focus-within:bg-white transition-all flex flex-col gap-2.5 shadow-2xs"
                    >
                      <div className="flex items-center justify-between gap-2.5">
                        <input
                          type="text"
                          value={faq.question}
                          onChange={(e) => updateFaq(idx, 'question', e.target.value)}
                          placeholder="Pregunta frecuente (Ej: ¿Cómo presupuestan?)"
                          className="w-full font-extrabold text-xs sm:text-sm text-slate-900 bg-transparent outline-none "
                        />
                        {data.faqs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeFaq(idx)}
                            className="text-slate-400 hover:text-red-500 p-1 cursor-pointer transition-colors"
                            title="Eliminar pregunta"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>

                      <textarea
                        value={faq.answer}
                        onChange={(e) => updateFaq(idx, 'answer', e.target.value)}
                        placeholder="Respuesta explicada con palabras simples..."
                        className="w-full text-xs text-slate-700 bg-white border border-slate-200/90 rounded-lg p-2.5 outline-none resize-none h-16 placeholder:text-slate-400 leading-relaxed shadow-2xs"
                      />
                    </div>
                  ))}

                  {data.faqs.length < 5 && (
                    <button
                      type="button"
                      onClick={addFaq}
                      className="h-11 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 hover:text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <Plus size={15} /> Añadir otra pregunta
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* STEP 10: CLIENTS & TESTIMONIALS */}
            {/* ============================================================ */}
            {currentStep.id === 'CLIENTS_TESTIMONIALS' && (
              <div className="flex flex-col gap-6 py-2">
                <div className="flex flex-col gap-2">
                  <span className="text-xs sm:text-sm font-bold text-slate-400 tracking-wider uppercase">
                    Paso 10 · Prueba Social
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[1.15] ">
                    Testimonios: quienes confían en tu trabajo
                  </h2>
                  <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
                    Las recomendaciones de directivos y clientes aceleran la toma de decisión en prospectos nuevos.
                  </p>
                </div>

                <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-5">
                  <label className="flex items-center gap-3.5 p-4 bg-slate-50/80 border border-slate-200 hover:border-slate-300 rounded-xl cursor-pointer hover:bg-slate-100/60 transition-all">
                    <input
                      type="checkbox"
                      checked={data.useGoogleMapsReviews}
                      onChange={(e) => handleInputChange('useGoogleMapsReviews', e.target.checked)}
                      className="w-4 h-4 rounded text-slate-900 border-slate-300 focus:ring-0 shrink-0 cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 text-sm">
                        Extraer opiniones directamente de Google Maps
                      </span>
                      <span className="text-xs text-slate-500">
                        Mostraremos las reseñas verificadas de tu ficha comercial.
                      </span>
                    </div>
                  </label>

                  {data.useGoogleMapsReviews ? (
                    <div className="flex flex-col gap-2">
                      <label className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wide">
                        Enlace a tu perfil de Google Maps *
                      </label>
                      <div className="h-13 flex items-center gap-2.5 bg-slate-50/70 border border-slate-200 rounded-xl px-4 focus-within:border-slate-900 focus-within:bg-white transition-all shadow-2xs">
                        <LinkIcon size={16} className="text-slate-400 shrink-0" />
                        <input
                          type="text"
                          value={data.googleMapsLink}
                          onChange={(e) => handleInputChange('googleMapsLink', e.target.value)}
                          placeholder="https://maps.app.goo.gl/..."
                          className="w-full text-xs sm:text-sm text-slate-900 bg-transparent outline-none font-medium"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3.5">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wide">
                          3 Testimonios Corporativos *
                        </span>
                        <div className="flex gap-0.5 text-amber-400">
                          <Star size={13} fill="currentColor" />
                          <Star size={13} fill="currentColor" />
                          <Star size={13} fill="currentColor" />
                          <Star size={13} fill="currentColor" />
                          <Star size={13} fill="currentColor" />
                        </div>
                      </div>

                      {data.reviewsList.map((review, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 hover:border-slate-300 focus-within:border-slate-900 focus-within:bg-white transition-all flex flex-col gap-2.5 shadow-2xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs  font-bold text-slate-400">Testimonio 0{idx + 1}</span>
                            <Quote size={14} className="text-slate-300" />
                          </div>

                          <textarea
                            value={review.text}
                            onChange={(e) => updateReview(idx, 'text', e.target.value)}
                            placeholder="Cita del cliente sobre el impacto o resultados..."
                            className="w-full text-xs text-slate-800 bg-white border border-slate-200/90 rounded-lg p-2.5 outline-none resize-none h-18 placeholder:text-slate-400 leading-relaxed shadow-2xs"
                          />

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={review.name}
                              onChange={(e) => updateReview(idx, 'name', e.target.value)}
                              placeholder="Nombre (Ej: Lic. Martín Gómez)"
                              className="h-10 bg-white border border-slate-200/90 rounded-lg px-3 text-xs text-slate-900 font-bold placeholder:text-slate-400 outline-none shadow-2xs"
                            />
                            <input
                              type="text"
                              value={review.company || ''}
                              onChange={(e) => updateReview(idx, 'company', e.target.value)}
                              placeholder="Cargo / Empresa (Ej: Director en FinGroup)"
                              className="h-10 bg-white border border-slate-200/90 rounded-lg px-3 text-xs text-slate-600 placeholder:text-slate-400 outline-none shadow-2xs"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* STEP 11: CONTACT CHANNELS */}
            {/* ============================================================ */}
            {currentStep.id === 'CONTACT_CHANNELS' && (
              <div className="flex flex-col gap-6 py-2">
                <div className="flex flex-col gap-2">
                  <span className="text-xs sm:text-sm font-bold text-slate-400 tracking-wider uppercase">
                    Paso 11 · Contacto
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[1.15]">
                    Canales de contacto y presencia
                  </h2>
                  <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
                    Vías oficiales donde se derivarán las consultas comerciales y prospectos calificados.
                  </p>
                </div>

                <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-5">
                  {/* CANALES OBLIGATORIOS: WHATSAPP Y EMAIL */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs sm:text-sm font-semibold text-slate-700 tracking-wide flex items-center gap-2">
                        <WhatsAppIcon size={15} className="text-slate-500 shrink-0" />
                        <span>WhatsApp Comercial *</span>
                      </label>
                      <input
                        type="tel"
                        value={data.whatsapp}
                        onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                        placeholder="+54 9 11 0000-0000"
                        className="w-full h-13 bg-slate-50/70 border border-slate-200 hover:border-slate-300 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5 rounded-xl px-4 text-sm font-semibold text-slate-900 outline-none transition-all shadow-2xs"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs sm:text-sm font-semibold text-slate-700 tracking-wide flex items-center gap-2">
                        <Mail size={15} className="text-slate-500 shrink-0" />
                        <span>Email Institucional *</span>
                      </label>
                      <input
                        type="email"
                        value={data.corporateEmail}
                        onChange={(e) => handleInputChange('corporateEmail', e.target.value)}
                        placeholder="contacto@empresa.com o info@estudio.com"
                        className="w-full h-13 bg-slate-50/70 border border-slate-200 hover:border-slate-300 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5 rounded-xl px-4 text-sm font-semibold text-slate-900 outline-none transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  <div className="h-px bg-slate-100 my-1" />

                  {/* REDES SOCIALES: INSTAGRAM Y FACEBOOK (MINIMALISTAS) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs sm:text-sm font-semibold text-slate-700 tracking-wide flex items-center gap-2">
                        <InstagramIcon size={15} className="text-slate-500 shrink-0" />
                        <span>Instagram (Opcional)</span>
                      </label>
                      <input
                        type="text"
                        value={data.instagram}
                        onChange={(e) => handleInputChange('instagram', e.target.value)}
                        placeholder="@tuempresa o instagram.com/tuempresa"
                        className="w-full h-13 bg-slate-50/70 border border-slate-200 hover:border-slate-300 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5 rounded-xl px-4 text-sm text-slate-900 outline-none transition-all shadow-2xs"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs sm:text-sm font-semibold text-slate-700 tracking-wide flex items-center gap-2">
                        <FacebookIcon size={15} className="text-slate-500 shrink-0" />
                        <span>Facebook (Opcional)</span>
                      </label>
                      <input
                        type="text"
                        value={data.facebook}
                        onChange={(e) => handleInputChange('facebook', e.target.value)}
                        placeholder="facebook.com/tuempresa o @tuempresa"
                        className="w-full h-13 bg-slate-50/70 border border-slate-200 hover:border-slate-300 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5 rounded-xl px-4 text-sm text-slate-900 outline-none transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* LINKEDIN */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs sm:text-sm font-semibold text-slate-700 tracking-wide flex items-center gap-2">
                      <LinkedinIcon size={15} className="text-slate-500 shrink-0" />
                      <span>Página de LinkedIn (Opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={data.linkedin}
                      onChange={(e) => handleInputChange('linkedin', e.target.value)}
                      placeholder="https://www.linkedin.com/company/tu-empresa"
                      className="w-full h-13 bg-slate-50/70 border border-slate-200 hover:border-slate-300 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5 rounded-xl px-4 text-sm text-slate-900 outline-none transition-all shadow-2xs"
                    />
                  </div>

                  {/* DIRECCIÓN FÍSICA */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs sm:text-sm font-semibold text-slate-700 tracking-wide flex items-center gap-2">
                      <MapPin size={15} className="text-slate-500 shrink-0" />
                      <span>Dirección de Sede Física u Oficinas (Opcional)</span>
                    </label>
                    <AddressAutocomplete
                      value={data.address}
                      onChange={(url) => handleInputChange('address', url)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* STEP 12: DOMAIN PLAN */}
            {/* ============================================================ */}
            {currentStep.id === 'DOMAIN_PLAN' && (
              <StepDomainPlan
                selectedPlan={data.domainPlan}
                onSelectPlan={(plan) => handleInputChange('domainPlan', plan)}
              />
            )}

            {/* ============================================================ */}
            {/* STEP 13: DOMAIN PREFERENCES */}
            {/* ============================================================ */}
            {currentStep.id === 'DOMAIN_PREFERENCES' && (
              <StepDomainPreferences
                selectedPlan={data.domainPlan}
                domainOption1={data.domainOption1}
                domainOption2={data.domainOption2}
                domainOption3={data.domainOption3}
                onChangeOption={handleInputChange}
                onGoBackToPlans={() => {
                  const planStepIndex = STEPS.findIndex((s) => s.id === 'DOMAIN_PLAN');
                  if (planStepIndex >= 0) {
                    setDirection(-1);
                    setCurrentStepIndex(planStepIndex);
                  }
                }}
              />
            )}

            {/* ============================================================ */}
            {/* STEP 13: FINAL REVIEW & CONFIRMATION */}
            {/* ============================================================ */}
            {currentStep.id === 'FINAL_REVIEW' && (
              <div className="flex flex-col gap-6 py-2">
                <div className="flex flex-col gap-2">
                  <span className="text-xs sm:text-sm font-bold text-slate-400 tracking-wider uppercase">
                    Paso 14 · Confirmación
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[1.15]">
                    Ficha final del proyecto
                  </h2>
                  <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
                    Revisa los datos recopilados antes de enviar la orden definitiva al equipo.
                  </p>
                </div>

                <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">{data.companyName || 'Empresa Corporativa'}</h3>
                      {data.slogan && <p className="text-xs text-slate-500 italic mt-0.5">"{data.slogan}"</p>}
                    </div>
                    <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold">
                      AG Digital Studio
                    </span>
                  </div>

                  {/* RESUMEN DE FICHA DE SERVICIO PERFECTAMENTE ALINEADO */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 items-stretch">
                    {/* CARD 1: IDENTIDAD VISUAL */}
                    <div className="p-4 sm:p-4.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 flex flex-col justify-between h-full">
                      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-200/60">
                        <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          01 · Identidad Visual
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      </div>
                      <div className="flex flex-col gap-2 text-xs">
                        <div className="flex items-baseline gap-2">
                          <span className="w-28 sm:w-32 shrink-0 text-slate-500 font-medium">Logotipo:</span>
                          <span className="font-semibold text-slate-900 truncate min-w-0 flex-1">
                            {data.noLogo ? 'Diseño tipográfico' : 'Logotipo oficial cargado'}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="w-28 sm:w-32 shrink-0 text-slate-500 font-medium">Tipografía:</span>
                          <span className="font-semibold text-slate-800 truncate min-w-0 flex-1">
                            {data.typography || 'A criterio de diseño'}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="w-28 sm:w-32 shrink-0 text-slate-500 font-medium">Tono visual:</span>
                          <span className="text-slate-700 truncate min-w-0 flex-1">
                            {data.backgroundTone ? data.backgroundTone.split(' (')[0] : 'A criterio de diseño'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* CARD 2: ESTRUCTURA & SOLUCIONES */}
                    <div className="p-4 sm:p-4.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 flex flex-col justify-between h-full">
                      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-200/60">
                        <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          02 · Estructura & Contenido
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      </div>
                      <div className="flex flex-col gap-2 text-xs">
                        <div className="flex items-baseline gap-2">
                          <span className="w-28 sm:w-32 shrink-0 text-slate-500 font-medium">Servicios:</span>
                          <span className="font-semibold text-slate-900 truncate min-w-0 flex-1">
                            6 Soluciones corporativas
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="w-28 sm:w-32 shrink-0 text-slate-500 font-medium">Preguntas FAQ:</span>
                          <span className="font-semibold text-slate-800 truncate min-w-0 flex-1">
                            {data.faqs.filter(f => f.question).length} Preguntas cargadas
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="w-28 sm:w-32 shrink-0 text-slate-500 font-medium">Testimonios:</span>
                          <span className="text-slate-700 truncate min-w-0 flex-1">
                            {data.useGoogleMapsReviews ? 'Google Maps verificado' : `${data.reviewsList.filter(r => r.name).length} Testimonios manuales`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* CARD 3: CANALES DE CONTACTO */}
                    <div className="p-4 sm:p-4.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 flex flex-col justify-between h-full">
                      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-200/60">
                        <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          03 · Canales de Contacto
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      </div>
                      <div className="flex flex-col gap-2 text-xs">
                        <div className="flex items-baseline gap-2">
                          <span className="w-28 sm:w-32 shrink-0 text-slate-500 font-medium">WhatsApp:</span>
                          <span className="font-semibold text-slate-900 truncate min-w-0 flex-1">
                            {data.whatsapp || 'Sin registrar'}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="w-28 sm:w-32 shrink-0 text-slate-500 font-medium">Email:</span>
                          <span className="font-semibold text-slate-800 truncate min-w-0 flex-1">
                            {data.corporateEmail || 'Sin registrar'}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="w-28 sm:w-32 shrink-0 text-slate-500 font-medium">Presencia Social:</span>
                          <span className="text-slate-700 truncate min-w-0 flex-1">
                            {data.instagram ? `@${data.instagram.replace('@','')}` : data.facebook ? 'Facebook configurado' : data.linkedin ? 'LinkedIn configurado' : 'Canales listos'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* CARD 4: DIRECCIÓN WEB & HOSPEDAJE */}
                    <div className="p-4 sm:p-4.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 flex flex-col justify-between h-full">
                      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-200/60">
                        <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          04 · Dirección Web & Hosting
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      </div>
                      <div className="flex flex-col gap-2 text-xs">
                        <div className="flex items-baseline gap-2">
                          <span className="w-28 sm:w-32 shrink-0 text-slate-500 font-medium">Plan Dominio:</span>
                          <span className="font-semibold text-slate-900 truncate min-w-0 flex-1">
                            {DOMAIN_PLANS[data.domainPlan]?.name || 'Dominio Web'} ({DOMAIN_PLANS[data.domainPlan]?.priceFormatted})
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="w-28 sm:w-32 shrink-0 text-slate-500 font-medium">1ª Opción:</span>
                          <span className="font-semibold text-slate-800 truncate min-w-0 flex-1">
                            {data.domainOption1 || 'A definir'}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="w-28 sm:w-32 shrink-0 text-slate-500 font-medium">Alternativa:</span>
                          <span className="text-slate-700 truncate min-w-0 flex-1">
                            {data.domainOption2 ? data.domainOption2 : 'No especificada'}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="w-28 sm:w-32 shrink-0 text-slate-500 font-medium">Hosting Cloud:</span>
                          <span className="text-slate-700 truncate min-w-0 flex-1">
                            Alojado en Vercel (Gratuito) + SSL
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ÉNFASIS EN TÉRMINOS Y CONDICIONES (TOTALMENTE SOLVENTADOS Y PERFECTAMENTE ALINEADOS) */}
                <div className="glass-panel rounded-3xl p-5 sm:p-7 shadow-xs flex flex-col gap-4 border border-slate-200/90">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                    <ShieldCheck size={20} className="text-slate-900 shrink-0" />
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                        Condiciones del Servicio y Puesta Online
                      </h4>
                      <p className="text-xs text-slate-500">
                        Bases operativas, alcance técnico y garantía de desarrollo corporativo.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5 text-xs text-slate-600 leading-relaxed">
                    {/* CLÁUSULA 1 */}
                    <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/90 border border-slate-200/70 flex flex-col md:flex-row md:items-start gap-2.5 md:gap-5">
                      <div className="flex items-center gap-2.5 md:w-[250px] md:shrink-0 pt-0.5">
                        <span className="w-5 h-5 rounded-md bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center shrink-0">1</span>
                        <span className="font-bold text-slate-900 text-xs sm:text-[13px] leading-tight">Cómputo del Plazo de Entrega (48 hs hábiles)</span>
                      </div>
                      <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed md:flex-1">
                        El plazo garantizado de entrega de 48 horas hábiles comenzará a computarse única y exclusivamente una vez enviado este formulario con la totalidad de los datos obligatorios, enlaces y archivos requeridos en estado completo y validado. El envío de información incompleta o demoras en la provisión de accesos pausará automáticamente el cómputo de los tiempos de entrega.
                      </p>
                    </div>

                    {/* CLÁUSULA 2 */}
                    <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/90 border border-slate-200/70 flex flex-col md:flex-row md:items-start gap-2.5 md:gap-5">
                      <div className="flex items-center gap-2.5 md:w-[250px] md:shrink-0 pt-0.5">
                        <span className="w-5 h-5 rounded-md bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center shrink-0">2</span>
                        <span className="font-bold text-slate-900 text-xs sm:text-[13px] leading-tight">Propiedad Intelectual y Derechos del Contenido</span>
                      </div>
                      <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed md:flex-1">
                        El cliente declara bajo juramento ser titular legítimo o contar con las autorizaciones comerciales correspondientes para el uso de todas las marcas, fotografías, logotipos, textos e información provista en este formulario. AG Digital Studio queda expresamente liberado de cualquier reclamo judicial o extrajudicial vinculado a derechos de autor, propiedad intelectual o marcas de terceros.
                      </p>
                    </div>

                    {/* CLÁUSULA 3 */}
                    <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/90 border border-slate-200/70 flex flex-col md:flex-row md:items-start gap-2.5 md:gap-5">
                      <div className="flex items-center gap-2.5 md:w-[250px] md:shrink-0 pt-0.5">
                        <span className="w-5 h-5 rounded-md bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center shrink-0">3</span>
                        <span className="font-bold text-slate-900 text-xs sm:text-[13px] leading-tight">Estructura Fija, Hosting Cloud y Seguridad SSL</span>
                      </div>
                      <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed md:flex-1">
                        El desarrollo se adaptará fielmente a la identidad de su marca dentro de la estructura corporativa contratada. No se añadirán ni eliminarán secciones estructurales fuera del alcance del plan. Incluye alojamiento permanente en la infraestructura cloud de ultra velocidad de Vercel con certificado de seguridad SSL HTTPS bonificado, sin costos fijos de servidor.
                      </p>
                    </div>

                    {/* CLÁUSULA 4 */}
                    <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/90 border border-slate-200/70 flex flex-col md:flex-row md:items-start gap-2.5 md:gap-5">
                      <div className="flex items-center gap-2.5 md:w-[250px] md:shrink-0 pt-0.5">
                        <span className="w-5 h-5 rounded-md bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center shrink-0">4</span>
                        <span className="font-bold text-slate-900 text-xs sm:text-[13px] leading-tight">Deslinde Técnico y Plataformas de Terceros</span>
                      </div>
                      <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed md:flex-1">
                        El sitio web integra herramientas y servicios de terceros (infraestructura cloud, servidores de Google Sheets / Drive, API y aplicación de WhatsApp, y entidades registradoras de dominios). AG Digital Studio garantiza la correcta vinculación técnica inicial, pero no asume responsabilidad por interrupciones globales, cambios de políticas, bloqueos o caídas ajenas a nuestro control directo.
                      </p>
                    </div>

                    {/* CLÁUSULA 5 */}
                    <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/90 border border-slate-200/70 flex flex-col md:flex-row md:items-start gap-2.5 md:gap-5">
                      <div className="flex items-center gap-2.5 md:w-[250px] md:shrink-0 pt-0.5">
                        <span className="w-5 h-5 rounded-md bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center shrink-0">5</span>
                        <span className="font-bold text-slate-900 text-xs sm:text-[13px] leading-tight">Previsualización, Revisión y Alcance de Cambios</span>
                      </div>
                      <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed md:flex-1">
                        Finalizado el desarrollo, se entregará un enlace de previsualización privado para su validación. El servicio incluye una (1) instancia única e integral de ajustes menores sobre textos, imágenes o enlaces antes de la publicación definitiva. Cualquier modificación estructural posterior, rediseño o carga adicional de contenido operará bajo cotización de mantenimiento a demanda.
                      </p>
                    </div>

                    {/* CLÁUSULA 6 */}
                    <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/90 border border-slate-200/70 flex flex-col md:flex-row md:items-start gap-2.5 md:gap-5">
                      <div className="flex items-center gap-2.5 md:w-[250px] md:shrink-0 pt-0.5">
                        <span className="w-5 h-5 rounded-md bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center shrink-0">6</span>
                        <span className="font-bold text-slate-900 text-xs sm:text-[13px] leading-tight">Dominio, Gestión y Autonomía</span>
                      </div>
                      <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed md:flex-1">
                        En planes que incluyan gestión de dominio, el registro oficial se realiza por un (1) año calendario. Al finalizar la puesta online, se facilitan o delegan todas las credenciales y accesos administrativos para que el cliente mantenga el control absoluto de su activo digital y su renovación futura, con total autonomía y sin contratos de permanencia.
                      </p>
                    </div>
                  </div>

                  {/* CHECKBOX DE ACEPTACIÓN DESTACADO */}
                  <div className="pt-2">
                    <label className="flex items-start gap-3 p-4 rounded-2xl bg-slate-900/[0.03] border border-slate-300 hover:border-slate-900 transition-all cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={data.acceptedTerms}
                        onChange={(e) => handleInputChange('acceptedTerms', e.target.checked)}
                        className="w-4 h-4 mt-0.5 rounded text-slate-900 border-slate-300 focus:ring-0 shrink-0 cursor-pointer"
                      />
                      <div className="text-xs leading-relaxed">
                        <span className="font-bold text-slate-900 block mb-1">
                          He leído y acepto los Términos de Contratación, Propiedad de Contenidos y Alcance Técnico.
                        </span>
                        <p className="text-slate-500">
                          “Declaro que los datos y archivos cargados son definitivos y cuento con los derechos de uso del material suministrado. Autorizo a AG Digital Studio a iniciar la producción técnica bajo las condiciones y plazos estipulados.”
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* BOTÓN ENVIAR A PRODUCCIÓN / ABONAR Y ENVIAR */}
                <div className="flex flex-col items-center justify-center gap-2.5 pt-1">
                  <AnimatePresence mode="wait">
                    {!data.acceptedTerms ? (
                      <button
                        type="button"
                        disabled
                        className="w-full sm:w-auto h-14 px-10 bg-slate-100 text-slate-400 font-semibold rounded-2xl text-sm sm:text-base flex items-center justify-center gap-3 border border-slate-200/80 cursor-not-allowed select-none transition-all"
                      >
                        <ShieldCheck size={18} className="opacity-40" />
                        <span>Aceptá los términos para enviar</span>
                      </button>
                    ) : (
                      <motion.button
                        key="submit-enabled"
                        type="button"
                        initial={{ scale: 0.96, opacity: 0.8 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="relative overflow-hidden w-full sm:w-auto h-14 px-8 sm:px-10 bg-slate-950 hover:bg-slate-900 text-white font-bold rounded-2xl text-sm sm:text-base flex items-center justify-center gap-3 cursor-pointer select-none group shadow-lg hover:shadow-xl border border-slate-800 transition-all"
                      >
                        {/* HAZ DE LUZ ANIMADO (SHIMMER) */}
                        <span className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                        {isSubmitting ? (
                          <>
                            <Loader2 size={18} className="animate-spin text-white" />
                            <span>
                              {DOMAIN_PLANS[data.domainPlan]?.isPaid
                                ? 'Guardando orden y conectando con Mercado Pago...'
                                : 'Enviando información...'}
                            </span>
                          </>
                        ) : DOMAIN_PLANS[data.domainPlan]?.isPaid ? (
                          <>
                            <MercadoPagoIcon size={22} className="shrink-0" />
                            <span>Abonar {DOMAIN_PLANS[data.domainPlan]?.priceFormatted} y Enviar a Producción</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck size={18} className="text-white" />
                            <span>Confirmar y Enviar Proyecto a Producción 🚀</span>
                          </>
                        )}
                      </motion.button>
                    )}
                  </AnimatePresence>

                  {data.acceptedTerms && DOMAIN_PLANS[data.domainPlan]?.isPaid && (
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-0.5 text-center">
                      <MercadoPagoIcon size={14} className="shrink-0" />
                      <span>Redirección oficial a Mercado Pago · Se abona y envía a producción en el mismo botón</span>
                    </div>
                  )}
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </main>
      )}

      {/* INDICADOR FLOTANTE ANIMADO "CONTINÚA ABAJO" (SIN VERDE) */}
      <AnimatePresence>
        {!submittedProject && showScrollPrompt && currentStep.id !== 'WELCOME' && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            onClick={() => window.scrollBy({ top: 350, behavior: 'smooth' })}
            className="fixed bottom-22 sm:bottom-24 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 hover:bg-slate-950 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-xl border border-slate-700/60 flex items-center gap-2 cursor-pointer backdrop-blur-md active:scale-95 transition-all"
          >
            <span>Continúa abajo</span>
            <motion.span
              animate={{ y: [0, 3, 0] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
            >
              <ArrowDown size={14} className="text-white" />
            </motion.span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* BARRA INFERIOR DE ACCIÓN FLOTANTE (SIN VERDE) */}
      {!submittedProject && currentStep.id !== 'WELCOME' && (
        <div className="fixed bottom-0 sm:bottom-5 inset-x-0 z-40 px-3 py-3 sm:px-4 pointer-events-none flex justify-center">
          <div className={`pointer-events-auto w-full ${currentStep.id === 'DOMAIN_PLAN' ? 'max-w-4xl' : 'max-w-2xl'} bg-white/95 sm:bg-white/90 backdrop-blur-2xl border-t sm:border border-slate-200/90 sm:rounded-2xl shadow-[0_-8px_30px_rgba(15,23,42,0.08)] sm:shadow-[0_20px_50px_-10px_rgba(15,23,42,0.16),0_0_0_1px_rgba(255,255,255,0.8)_inset] p-2 sm:p-2.5 flex items-center justify-between gap-2.5 sm:gap-3 transition-all duration-300`}>
            
            {/* BOTÓN ANTERIOR */}
            <button
              type="button"
              onClick={prevStep}
              className="h-12 sm:h-12.5 px-4 sm:px-5 rounded-xl bg-white sm:bg-transparent border border-slate-200/80 sm:border-transparent hover:border-slate-300 sm:hover:bg-slate-100 text-slate-700 hover:text-slate-950 active:scale-95 transition-all cursor-pointer font-semibold text-xs sm:text-sm flex items-center gap-2 shrink-0 shadow-2xs sm:shadow-none"
              title="Paso anterior"
            >
              <ArrowLeft size={16} />
              <span className="hidden xs:inline">Anterior</span>
            </button>

            {/* INDICADOR CENTRAL DEL PASO (SOLO DESKTOP / TABLET) */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/60 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                Paso {currentStepIndex} de {STEPS.length - 1}
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs font-semibold text-slate-800 max-w-[130px] truncate">
                {currentStep.title}
              </span>
            </div>

            {/* BOTÓN CONTINUAR (SIN VERDE) */}
            {currentStep.id !== 'FINAL_REVIEW' && (() => {
              const disabled = isNextDisabled();
              const nextLabel = 
                currentStep.id === 'BRAND_STYLE' && brandSubStep === 0 ? 'Continuar a Tipografía' :
                currentStep.id === 'BRAND_STYLE' && brandSubStep === 1 ? 'Continuar a Tono Visual' :
                currentStep.id === 'DOMAIN_PLAN' ? 'Continuar a Preferencias' :
                'Continuar';

              return (
                <div className="flex-1 sm:flex-initial">
                  <AnimatePresence mode="wait">
                    {disabled ? (
                      <motion.button
                        key="btn-disabled"
                        type="button"
                        initial={{ opacity: 0.7 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        disabled
                        className="w-full sm:min-w-[210px] h-12 sm:h-12.5 px-5 sm:px-6 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 bg-slate-100 text-slate-400 border border-slate-200/80 cursor-not-allowed select-none transition-all"
                      >
                        <span className="truncate">Completá este paso</span>
                        <ArrowRight size={15} className="shrink-0 opacity-40" />
                      </motion.button>
                    ) : (
                      <motion.button
                        key="btn-enabled"
                        type="button"
                        initial={{ scale: 0.96, opacity: 0.8 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={nextStep}
                        className="relative overflow-hidden w-full sm:min-w-[210px] h-12 sm:h-12.5 px-5 sm:px-7 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 bg-slate-950 hover:bg-slate-900 text-white cursor-pointer select-none group shadow-lg hover:shadow-xl border border-slate-800 transition-all"
                      >
                        {/* HAZ DE LUZ ANIMADO (SHIMMER) */}
                        <span className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                        <span className="truncate">{nextLabel}</span>

                        <ArrowRight 
                          size={16} 
                          className="shrink-0 transition-transform duration-200 group-hover:translate-x-1" 
                        />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              );
            })()}

          </div>
        </div>
      )}

      {/* BOTÓN FLOTANTE DE ASISTENCIA POR WHATSAPP (ACTIVO EN TODO EL PROCESO) */}
      <FloatingWhatsAppSupport
        currentStepTitle={currentStep?.title}
        companyName={data.companyName}
        stepNumber={currentStepIndex}
      />
    </div>
  );
}
