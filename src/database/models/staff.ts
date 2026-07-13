export interface StaffEntity {
  id: string;
  name: string;
  email: string;        
  cpf: string;
  phone: string;        
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  avatar_uri: string | null; 
  created_at: string;
}