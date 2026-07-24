/**
 * Entity — espelha 1:1 a tabela `staff` (SQLite).
 */
export type StaffStatus = 'active' | 'inactive' | 'suspended';

export interface StaffEntity {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  role: string;
  status: StaffStatus;
  avatar_uri: string | null;
  created_at: string;
}