import { StatusBadgeStyle } from '../interfacesUI/daily';

/**
 * Traduce el estado de la jornada proveniente de la base de datos
 * a estilos visuales (colores y etiquetas) para la interfaz de usuario.
 * 
 * 🌟 Recibe COLORS desde el componente que la invoca para respetar el tema actual.
 */
export const getStatusBadgeStyles = (status: string, COLORS: any): StatusBadgeStyle => {
  switch (status) {
    case 'scheduled':
      return { 
        bg: '#1A242A', 
        text: '#88D8FF', 
        border: '#203E5A', 
        label: 'Agendada' 
      };
    case 'in_progress':
      return { 
        bg: '#2A2415', 
        text: '#E6AD12', 
        border: '#5A4A20', 
        label: 'Em Andamento' // Mantido em português conforme a regra do projeto
      };
    case 'completed':
      return { 
        bg: '#1A2A1A', 
        text: COLORS.success, // 🌟 Usa el color del tema dinámicamente
        border: '#205A20', 
        label: 'Finalizada' 
      };
    default:
      return { 
        bg: '#1A242A', 
        text: '#88D8FF', 
        border: '#203E5A', 
        label: 'Ativa' 
      };
  }
};