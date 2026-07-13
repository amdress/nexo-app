// src/constants/theme.ts

// 🌙 Tu paleta actual intacta (Escala Zinc Oscura)
export const DARK_COLORS = {
  primary: '#FACC15',       // Gold / Yellow principal
  primaryDark: '#ca8a04',   // Para estados presionados o bordes oscuros
  
  background: '#09090b',    // Fondo profundo de las pantallas (zinc-950)
  surface: '#18181b',       // Fondo de componentes (zinc-900)
  surfaceCard: '#27272a',   // Tarjetas secundarias o campos de texto (zinc-800)
  
  border: '#27272a',        // Líneas divisorias sutiles
  borderLight: '#3f3f46',   // Bordes más visibles al foco (zinc-700)
  
  text: '#ffffff',          // Texto principal de alta fidelidad
  textMuted: '#a1a1aa',     // Subtítulos (zinc-400)
  textDark: '#09090b',      // Para texto encima del amarillo (alto contraste)
  
  success: '#22c55e',       
  danger: '#ef4444',        
  warning: '#f97316',       
  NEXO_COLORS: ['#235bb1', '#2f71c4', '#398ad9', '#419ce7'],
};

// ☀️ Equivalente en Modo Claro (Inversión limpia a escala Zinc Clara)
export const LIGHT_COLORS: typeof DARK_COLORS = {
  primary: '#EAB308',       // Un tono de amarillo un poco más denso para legibilidad en fondo claro
  primaryDark: '#CA8A04',
  
  background: '#F4F4F5',    // Fondo gris claro limpio (zinc-100)
  surface: '#FFFFFF',       // Componentes en blanco puro
  surfaceCard: '#E4E4E7',   // Tarjetas secundarias o inputs (zinc-200)
  
  border: '#E4E4E7',        // Separadores sutiles (zinc-200)
  borderLight: '#D4D4D8',   // Bordes visibles (zinc-300)
  
  text: '#09090b',          // Texto principal (zinc-950)
  textMuted: '#71717a',     // Subtítulos (zinc-500)
  textDark: '#09090b',      
  
  success: '#16a34a',       
  danger: '#dc2626',        
  warning: '#ea580c',       
  NEXO_COLORS: ['#235bb1', '#2f71c4', '#398ad9', '#419ce7'], // Mismos colores para el splash
};

// 🎨 Opciones de colores principales si el usuario quiere personalizar el color de acento
export const ACCENT_VARIANTS = {
  gold: { primary: '#FACC15', primaryDark: '#ca8a04' },
  green: { primary: '#00B37E', primaryDark: '#00875F' },
  blue: { primary: '#3b82f6', primaryDark: '#1d4ed8' },
  purple: { primary: '#8257E5', primaryDark: '#633BBC' },
};

export type AccentKey = keyof typeof ACCENT_VARIANTS;

// Mantener constantes de diseño estructurales compartidas
export const DESIGN_TOKENS = {
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    full: 9999,
  }
};