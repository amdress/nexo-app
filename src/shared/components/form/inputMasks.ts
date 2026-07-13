
// Formatea: 12345678900 -> 123.456.789-00
export function maskCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

// Formatea: 41999990000 -> (41) 99999-0000 | 4133330000 -> (41) 3333-0000
export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }

  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

export type InputMask = 'cpf' | 'phone';

export function applyMask(mask: InputMask | undefined, value: string): string {
  if (mask === 'cpf') return maskCPF(value);
  if (mask === 'phone') return maskPhone(value);
  return value;
}