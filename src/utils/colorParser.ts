// Diccionario enriquecido de nombres de colores en español para diseño corporativo
export const SPANISH_COLOR_MAP: Record<string, string> = {
  // Azules
  'azul': '#1D4ED8',
  'azul oscuro': '#0F2744',
  'azul marino': '#0A192F',
  'azul noche': '#0B132B',
  'azul petroleo': '#0F4C5C',
  'azul petróleo': '#0F4C5C',
  'azul francia': '#0055A5',
  'azul cobalto': '#0047AB',
  'azul electrico': '#2563EB',
  'azul rey': '#1E40AF',
  'celeste': '#38BDF8',
  'celeste cielo': '#7DD3FC',
  'cian': '#06B6D4',
  'turquesa': '#0D9488',
  'aquamarina': '#14B8A6',

  // Verdes
  'verde': '#16A34A',
  'verde oscuro': '#064E3B',
  'verde bosque': '#14532D',
  'verde esmeralda': '#059669',
  'esmeralda': '#10B981',
  'verde oliva': '#65A30D',
  'oliva': '#65A30D',
  'verde militar': '#3F4E34',
  'verde menta': '#34D399',
  'menta': '#34D399',
  'verde manzana': '#84CC16',
  'verde lima': '#84CC16',
  'lima': '#84CC16',

  // Rojos y Vinos
  'rojo': '#DC2626',
  'rojo oscuro': '#7F1D1D',
  'rojo carmesi': '#991B1B',
  'rojo fuego': '#EF4444',
  'bordo': '#6B1D2F',
  'bordó': '#6B1D2F',
  'vino': '#4A044E',
  'vino tinto': '#581845',
  'borgoña': '#67001A',
  'granate': '#800020',
  'carmesi': '#A21CAF',

  // Amarillos y Dorados
  'dorado': '#D4AF37',
  'oro': '#D4AF37',
  'oro brillante': '#F59E0B',
  'amarillo': '#EAB308',
  'amarillo oro': '#F59E0B',
  'amarillo mostaza': '#CA8A04',
  'mostaza': '#CA8A04',
  'ocre': '#C27803',

  // Naranjas y Cobres
  'naranja': '#EA580C',
  'naranja oscuro': '#C2410C',
  'terracota': '#C05621',
  'cobre': '#B87333',
  'bronce': '#CD7F32',
  'coral': '#F43F5E',
  'salmon': '#FB7185',
  'salmón': '#FB7185',

  // Violetas y Púrpuras
  'violeta': '#7C3AED',
  'morado': '#6D28D9',
  'purpura': '#581C87',
  'púrpura': '#581C87',
  'lila': '#C084FC',
  'lavanda': '#A78BFA',
  'magenta': '#D946EF',

  // Rosas
  'rosa': '#EC4899',
  'rosado': '#F472B6',
  'fucsia': '#D946EF',
  'palo de rosa': '#DDA7A5',

  // Negros, Grises y Blancos
  'negro': '#0F172A',
  'negro mate': '#121212',
  'negro carbon': '#18181B',
  'carbon': '#27272A',
  'carbón': '#27272A',
  'onix': '#0F172A',
  'ónix': '#0F172A',
  'gris': '#64748B',
  'gris oscuro': '#334155',
  'gris grafito': '#1E293B',
  'grafito': '#1E293B',
  'antracita': '#27272A',
  'gris claro': '#E2E8F0',
  'gris plata': '#94A3B8',
  'plata': '#CBD5E1',
  'acero': '#475569',
  'gris acero': '#475569',
  'gris titanio': '#3F3F46',
  'titanio': '#3F3F46',
  'blanco': '#FFFFFF',
  'marfil': '#FFFFF0',
  'crema': '#FFFDD0',
  'hueso': '#F5F5DC',
  'beige': '#F5F5DC',
  'arena': '#E5D3B3',

  // Marrones
  'marron': '#78350F',
  'marrón': '#78350F',
  'chocolate': '#451A03',
  'cafe': '#6F4E37',
  'café': '#6F4E37',
  'tierra': '#7C2D12'
};

/**
 * Convierte un input de color (HEX, RGB, HSL o nombres en español como "Azul oscuro", "Verde esmeralda", etc.)
 * a un código CSS válido (HEX).
 */
export function parseColorToCss(input: string, fallback: string = '#0F172A'): string {
  if (!input) return fallback;
  const raw = input.trim();
  if (!raw) return fallback;

  // 1. Si es formato hexadecimal directo (#FFF o #FFFFFF)
  if (/^#([0-9A-F]{3}){1,2}$/i.test(raw)) {
    return raw;
  }

  // 2. Si es rgb(...) o hsl(...)
  if (/^(rgb|hsl)/i.test(raw)) {
    return raw;
  }

  // 3. Normalizar texto: minúsculas, sin acentos
  const lower = raw.toLowerCase();
  const normalized = lower
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  // Búsqueda directa exacta
  if (SPANISH_COLOR_MAP[lower]) return SPANISH_COLOR_MAP[lower];
  if (SPANISH_COLOR_MAP[normalized]) return SPANISH_COLOR_MAP[normalized];

  // Búsqueda por subcadena / palabras clave compuestas (ej: "un azul oscuro elegante")
  for (const [key, hex] of Object.entries(SPANISH_COLOR_MAP)) {
    const normKey = key.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (normalized.includes(normKey)) {
      return hex;
    }
  }

  return fallback;
}
