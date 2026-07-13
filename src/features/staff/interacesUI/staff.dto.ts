export interface CreateStaffDTO {
  name: string;
  cpf: string;
  phone: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  avatarUri: string | null;
}