import React from 'react';
import { 
  Globe, 
  Sparkles, 
  Check, 
  ArrowLeft,
  Search,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { DOMAIN_PLANS, type DomainPlanType } from '../../config/domainPlans';

interface StepDomainPreferencesProps {
  selectedPlan: DomainPlanType;
  domainOption1: string;
  domainOption2: string;
  domainOption3: string;
  onChangeOption: (field: 'domainOption1' | 'domainOption2' | 'domainOption3', value: string) => void;
  onGoBackToPlans: () => void;
}

export const StepDomainPreferences: React.FC<StepDomainPreferencesProps> = ({
  selectedPlan,
  domainOption1,
  domainOption2,
  domainOption3,
  onChangeOption,
  onGoBackToPlans
}) => {
  const planConfig = DOMAIN_PLANS[selectedPlan] || DOMAIN_PLANS.free;

  // Limpiador visual para previsualizar URL limpia
  const formatPreviewUrl = (raw: string) => {
    if (!raw.trim()) return '';
    const clean = raw.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
    // Si ya incluye la extensión, no duplicarla
    if (clean.endsWith(planConfig.extension)) {
      return clean;
    }
    // Si tiene otra extensión la dejamos o añadimos la del plan
    if (clean.includes('.')) {
      return clean;
    }
    return `${clean}${planConfig.extension}`;
  };

  const previewUrl = formatPreviewUrl(domainOption1) || `tuempresa${planConfig.extension}`;

  return (
    <div className="flex flex-col gap-6 py-2">
      {/* ENCABEZADO */}
      <div className="flex flex-col gap-2">
        <span className="text-xs sm:text-sm font-bold text-slate-400 tracking-wider uppercase">
          Paso 13 · Dominio
        </span>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[1.15]">
          Tus 3 opciones de nombres de dominio
        </h2>
        <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
          Indicá hasta 3 alternativas en orden de preferencia. Si tu primera opción no estuviese libre ante el ente de registro oficial, avanzaremos con tu opción siguiente de respaldo.
        </p>
      </div>

      <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-5 border border-slate-200/90">
        
        {/* RESUMEN DEL PLAN SELECCIONADO CON BOTÓN CAMBIAR */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center shrink-0">
              <Globe size={18} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">{planConfig.name}</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {planConfig.priceFormatted}
                </span>
              </div>
              <span className="text-xs text-slate-500">
                Extensión que se registrará: <strong className="text-slate-800 font-mono">{planConfig.extension}</strong>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onGoBackToPlans}
            className="text-xs font-semibold text-slate-600 hover:text-slate-950 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-white transition-all cursor-pointer self-start sm:self-auto shrink-0"
          >
            <ArrowLeft size={13} />
            <span>Cambiar tipo de dominio</span>
          </button>
        </div>

        {/* PREVISUALIZACIÓN EN VIVO DE URL */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-3.5 flex items-center gap-2.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-mono font-medium truncate flex-1">
            <Lock size={13} className="shrink-0 text-emerald-600" />
            <span className="text-slate-400">https://</span>
            <span className="font-bold text-slate-900">{previewUrl}</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
            Previsualización
          </span>
        </div>

        {/* 3 CAMPOS DE ENTRADA EN ORDEN DE PRIORIDAD */}
        <div className="flex flex-col gap-4">
          {/* OPCIÓN 1 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs sm:text-sm font-semibold text-slate-700 tracking-wide flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center">1</span>
                <span>Opción 1 (Prioritaria) *</span>
              </span>
              <span className="text-[11px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded">
                Requerida
              </span>
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={domainOption1}
                onChange={(e) => onChangeOption('domainOption1', e.target.value)}
                placeholder={`Ej: tuempresa${planConfig.extension}`}
                className="w-full h-13 bg-slate-50/70 border border-slate-200 hover:border-slate-300 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5 rounded-xl px-4 text-sm font-semibold text-slate-900 outline-none transition-all shadow-2xs pr-24"
              />
              <span className="absolute right-3.5 text-xs font-mono font-bold text-slate-400 pointer-events-none bg-slate-200/60 px-2 py-1 rounded">
                {planConfig.extension}
              </span>
            </div>
          </div>

          {/* OPCIÓN 2 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs sm:text-sm font-semibold text-slate-700 tracking-wide flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center">2</span>
                <span>Opción 2 (Alternativa)</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">Opcional</span>
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={domainOption2}
                onChange={(e) => onChangeOption('domainOption2', e.target.value)}
                placeholder={`Ej: grupotuempresa${planConfig.extension}`}
                className="w-full h-13 bg-slate-50/70 border border-slate-200 hover:border-slate-300 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5 rounded-xl px-4 text-sm text-slate-900 outline-none transition-all shadow-2xs pr-24"
              />
              <span className="absolute right-3.5 text-xs font-mono font-semibold text-slate-400 pointer-events-none bg-slate-200/60 px-2 py-1 rounded">
                {planConfig.extension}
              </span>
            </div>
          </div>

          {/* OPCIÓN 3 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs sm:text-sm font-semibold text-slate-700 tracking-wide flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center">3</span>
                <span>Opción 3 (Alternativa de respaldo)</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">Opcional</span>
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={domainOption3}
                onChange={(e) => onChangeOption('domainOption3', e.target.value)}
                placeholder={`Ej: tuempresa-servicios${planConfig.extension}`}
                className="w-full h-13 bg-slate-50/70 border border-slate-200 hover:border-slate-300 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5 rounded-xl px-4 text-sm text-slate-900 outline-none transition-all shadow-2xs pr-24"
              />
              <span className="absolute right-3.5 text-xs font-mono font-semibold text-slate-400 pointer-events-none bg-slate-200/60 px-2 py-1 rounded">
                {planConfig.extension}
              </span>
            </div>
          </div>
        </div>

        {/* TIP DE RECOMENDACIÓN */}
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 flex items-start gap-2.5 text-xs sm:text-[13px] text-slate-700 leading-relaxed shadow-2xs mt-1">
          <Sparkles size={16} className="text-blue-600 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-900 font-bold mr-1">Recomendación para tu dominio:</strong>
            <span>
              Elegí nombres breves, fáciles de recordar y pronunciar. Evitá guiones medios o caracteres complejos. Si tu opción prioritaria ya fue adquirida por otra firma, nuestro equipo tramitará la alternativa inmediata sin demoras.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StepDomainPreferences;
