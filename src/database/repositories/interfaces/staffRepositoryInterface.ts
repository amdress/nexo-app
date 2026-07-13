import { BaseRepository } from "./baseRepository";
import { StaffEntity } from "../../models/staff";

export interface StaffRepositoryInterface extends BaseRepository<StaffEntity> {
  
  findByCpf(cpf: string): Promise<StaffEntity | null>;
  findAllByStatus(status?: 'active' | 'inactive' | 'suspended'): Promise<StaffEntity[] | null >;
}


    
