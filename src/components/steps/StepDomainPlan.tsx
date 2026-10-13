import React from 'react';
import { motion } from 'framer-motion';
import { 
  Check, 
  ShieldCheck, 
  Globe, 
  Sparkles, 
  CheckCircle2,
  Lock,
  Star
} from 'lucide-react';
import { DOMAIN_PLANS, type DomainPlanType } from '../../config/domainPlans';

interface StepDomainPlanProps {
  selectedPlan: DomainPlanType;
  onSelectPlan: (plan: DomainPlanType) => void;
}

export const StepDomainPlan: React.FC<StepDomainPlanProps> = ({
  selectedPlan,
  onSelectPlan
}) => {
  const plans: DomainPlanType[] = ['free', 'com_ar', 'com'];

  return (
    <div className="flex flex-col gap-7 py-2">
      {/* ENCABEZADO DEL PASO */}
      <div className="flex flex-col gap-2">
        <span className="text-xs sm:text-sm font-bold text-slate-400 tracking-wider uppercase">
          Paso 12 · Dominio
        </span>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[1.15]">
          Elegí la dirección web para tu empresa
        </h2>
        <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-2xl">
          Seleccioná la modalidad de dominio para tu plataforma. Podés optar por el subdominio gratuito incluido o registrar tu dominio propio oficial para maximizar la autoridad, credibilidad y presencia de tu marca.
        </p>
      </div>

      {/* GRILLA DE LAS 3 CARDS DE SUSCRIPCIÓN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6 items-stretch">
        {plans.map((planKey) => {
          const plan = DOMAIN_PLANS[planKey];
          const isSelected = selectedPlan === planKey;
          const isPopular = plan.popular;

          return (
            <motion.div
              key={planKey}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              onClick={() => onSelectPlan(planKey)}
              className={`relative flex flex-col justify-between rounded-3xl p-6 sm:p-7 cursor-pointer transition-all duration-200 select-none ${
                isSelected
                  ? 'bg-white border-2 border-slate-950 shadow-[0_20px_45px_-10px_rgba(15,23,42,0.16)] ring-4 ring-slate-950/5'
                  : 'bg-white/90 hover:bg-white border border-slate-200/90 hover:border-slate-300 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.05)] hover:shadow-[0_12px_32px_-6px_rgba(15,23,42,0.09)]'
              }`}
            >
              {/* TOP HEADER: BADGE & SELECTION INDICATOR */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full tracking-wide uppercase ${
                      isPopular
                        ? 'bg-slate-950 text-white shadow-2xs'
                        : isSelected
                        ? 'bg-slate-100 text-slate-900 border border-slate-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isPopular && <Star size={11} className="fill-amber-400 text-amber-400" />}
                    <span>{plan.badge}</span>
                  </span>

                  {/* CHECKMARK INDICATOR */}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-slate-950 text-white shadow-2xs scale-100'
                        : 'border-2 border-slate-300 text-transparent scale-95'
                    }`}
                  >
                    <Check size={13} strokeWidth={3} className={isSelected ? 'text-white' : 'opacity-0'} />
                  </div>
                </div>

                {/* TÍTULO & EXTENSIÓN */}
                <div className="flex flex-col gap-1 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Globe size={18} className={isSelected ? 'text-slate-950' : 'text-slate-400'} />
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      {plan.name}
                    </h3>
                  </div>

                  {/* PRECIO & ARANCEL */}
                  <div className="flex flex-col gap-0.5 mt-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl sm:text-5xl font-black text-slate-950 tracking-tight">
                        {plan.priceFormatted}
                      </span>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        {plan.periodText}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {plan.renewalNotice}
                    </span>
                  </div>

                  {/* EJEMPLO DE DIRECCIÓN WEB */}
                  <div className="flex items-center gap-2 mt-3 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-mono">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-slate-400">https://</span>
                    <span className="font-bold text-slate-800 truncate">{plan.exampleUrl}</span>
                  </div>

                  <p className="text-xs text-slate-500 mt-2.5 leading-relaxed min-h-[34px]">
                    {plan.tagline}
                  </p>
                </div>
              </div>

              {/* LISTA DE BENEFICIOS CON TÍTULO EN NEGRITA */}
              <div className="flex flex-col gap-3 py-5 flex-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {planKey === 'free' ? '3 Beneficios Incluidos:' : '5 Ventajas Exclusivas:'}
                </span>

                <ul className="flex flex-col gap-2.5 text-xs text-slate-600">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        <Check size={10} strokeWidth={3} />
                      </div>
                      <div className="text-xs text-slate-600">
                        <strong className="text-slate-900 font-bold mr-1">
                          {feat.label}:
                        </strong>
                        <span>{feat.detail}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* BOTÓN INFERIOR DE ACCIÓN */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPlan(planKey);
                  }}
                  className={`w-full h-12 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-950 text-white shadow-md'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/80'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <CheckCircle2 size={16} className="text-white" />
                      <span>Plan Seleccionado</span>
                    </>
                  ) : (
                    <span>Elegir {plan.name}</span>
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ACLARACIÓN ELEGANTE DE TRANSPARENCIA (ESTILO AGENCIA PREMIUM) */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-2xs">
        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-2xs">
          <ShieldCheck size={20} />
        </div>
        <div className="flex flex-col gap-1 text-xs sm:text-[13px] text-slate-600 leading-relaxed">
          <span className="font-bold text-slate-950 text-sm">
            Transparencia sobre aranceles oficiales de dominio y renovación anual
          </span>
          <p className="text-slate-600 leading-relaxed">
            Este dominio <strong>no lo cobramos nosotros en AG Digital Studio</strong>: se abona íntegramente al ente oficial ajeno a nuestra empresa (organismos oficiales de registro como <strong>NIC Argentina</strong> para dominios <code>.com.ar</code> o registrars acreditados por <strong>ICANN</strong> para dominios <code>.com</code>) y se renueva anualmente de forma independiente. Desde nuestro equipo nos encargamos de toda la configuración técnica, enlace de servidores y delegación de DNS de forma <strong>100% bonificada sin costo adicional de gestión</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StepDomainPlan;
