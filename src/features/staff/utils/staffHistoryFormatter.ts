// src/features/staff/utils/staffHistoryFormatter.ts
import { StaffHistoryEvent } from '../interacesUI/staffUI';

export const STATUS_STYLES: Record<StaffHistoryEvent['status'], { color: string; bg: string }> = {
  normal: { color: '#4CAF50', bg: 'rgba(76, 175, 80, 0.12)' },
  absence: { color: '#F44336', bg: 'rgba(244, 67, 54, 0.12)' },
  left_early: { color: '#FF7043', bg: 'rgba(255, 112, 67, 0.12)' },
};

// Texto visible por estado — único lugar a tocar cuando llegue i18n
export const STATUS_LABELS: Record<StaffHistoryEvent['status'], string> = {
  normal: 'Presença Regular',
  absence: 'Falta',
  left_early: 'Saída Antecipada',
};

export function formatDate(raw: string): string {
  const parsed = new Date(`${raw}T00:00:00`);
  if (isNaN(parsed.getTime())) return raw;
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${day} ${months[parsed.getMonth()]} ${parsed.getFullYear()}`;
}

// El service devuelve null cuando no hay horario; acá se resuelve el placeholder visual
export function formatTime(value: string | null): string {
  return value ?? '--:--';
}

export function toISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Arma el texto plano del comprobante para compartir por WhatsApp/Email
export function buildReceiptText(event: StaffHistoryEvent, staffName?: string): string {
  const hasBreak = event.breakStart !== null || event.breakEnd !== null;
  const lines = [
    `🗂 *Comprovante de Presença*`,
    `Nº ${event.id.slice(0, 8).toUpperCase()}`,
    ``,
    `👤 Funcionário: ${staffName ?? '—'}`,
    `📅 Data: ${formatDate(event.date)}`,
    `📋 Status: ${STATUS_LABELS[event.status]}`,
    ``,
    `🕐 Entrada:  ${formatTime(event.checkIn)}`,
    hasBreak
      ? `☕ Intervalo: ${formatTime(event.breakStart)} – ${formatTime(event.breakEnd)}`
      : `☕ Intervalo: --:--`,
    `🕔 Saída:    ${formatTime(event.checkOut)}`,
  ];
  return lines.join('\n');
}