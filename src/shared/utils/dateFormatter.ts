// src/shared/utils/dateFormatter.ts

const DEFAULT_LOCALE = 'pt-BR';

const parseISODate = (dateString: string): Date =>
  new Date(`${dateString}T00:00:00`);

const parseTimeString = (timeString: string): Date => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

export const formatDate = (
  dateString: string,
  locale = DEFAULT_LOCALE
): string => {
  try {
    const date = parseISODate(dateString);
    if (isNaN(date.getTime())) return 'Data inválida';
    
    return new Intl.DateTimeFormat(locale).format(date);
  } catch (error) {
    console.warn('[DATE_FORMATTER] Fallback en formatDate por error de Intl:', error);
    
    // Fallback manual seguro: 'YYYY-MM-DD' -> 'DD/MM/YYYY'
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    }
    return dateString;
  }
};

export const formatTime = (
  timeString: string,
  locale = DEFAULT_LOCALE
): string => {
  try {
    const parsedDate = parseTimeString(timeString);
    if (isNaN(parsedDate.getTime())) return '00:00';

    return new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
      minute: '2-digit',
    }).format(parsedDate);
  } catch (error) {
    console.warn('[DATE_FORMATTER] Fallback en formatTime por error de Intl:', error);
    
    // Fallback manual seguro: Asegura que devuelva HH:MM plano
    return timeString.substring(0, 5);
  }
};

export const formatTimeRange = (
  start: string,
  end: string,
  locale = DEFAULT_LOCALE
): string =>
  `${formatTime(start, locale)} - ${formatTime(end, locale)}`;

export const getDayName = (
  dateString: string,
  locale = DEFAULT_LOCALE
): string => {
  try {
    const date = parseISODate(dateString);
    if (isNaN(date.getTime())) return '';

    return new Intl.DateTimeFormat(locale, {
      weekday: 'long',
    }).format(date);
  } catch (error) {
    console.warn('[DATE_FORMATTER] Fallback en getDayName por error de Intl:', error);
    
    // Fallback manual: Mapeo básico en portugués si Intl explota
    const date = parseISODate(dateString);
    const days = [
      'domingo', 'segunda-feira', 'terça-feira', 
      'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'
    ];
    return days[date.getDay()] || '';
  }
};

export const toISODate = (date: Date): string =>
  date.toISOString().split('T')[0];

export const toTimeString = (date: Date): string =>
  date.toTimeString().slice(0, 5);