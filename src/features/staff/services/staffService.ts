import { staffRepository } from "../../../database/repositories/staffRepository";
import { StaffEntity } from "../../../database/models/staff";
import { CreateStaffDTO } from "../interacesUI/staff.dto";
import {
  StaffPerformance,
  StaffHistoryEvent,
  StaffHistoryFilter,
  StaffUI,
} from "../interacesUI/staffUI";
import { sanitizers } from "../../../shared/utils/sanitizers";
import * as Crypto from "expo-crypto";

/** Traduz uma StaffEntity crua (snake_case, vinda do banco) para o formato de UI */
function mapStaffEntityToUI(item: StaffEntity): StaffUI {
  return {
    id: item.id,
    name: item.name,
    email: item.email,
    role: item.role,
    phone: item.phone,
    status: item.status,
    avatarUri: item.avatar_uri,
  };
}

export const staffService = {
  /** Busca todos os funcionários cadastrados */
  async getAllStaff(): Promise<StaffUI[]> {
    const staff = await staffRepository.findAll();
    return staff.map(mapStaffEntityToUI);
  },

  /** Busca todos os funcionários com um status específico */
  async getStaffByStatus(
    status: "active" | "inactive" | "suspended" = "active",
  ): Promise<StaffUI[]> {
    try {
      const staff = await staffRepository.findAllByStatus(status);
      return staff.map(mapStaffEntityToUI);
    } catch (error) {
      throw new Error(`Falha ao listar funcionários com status '${status}' do banco local.`);
    }
  },

  /** Busca um funcionário por ID */
  async getStaffById(id: string): Promise<StaffUI> {
    const staff = await staffRepository.findById(id);
    if (!staff) {
      throw new Error("Funcionário não encontrado no sistema.");
    }
    return mapStaffEntityToUI(staff);
  },

  /** Cria um novo funcionário */
  async createStaff(dto: CreateStaffDTO): Promise<void> {
    const cleanCpf = sanitizers.sanitizeDocument(dto.cpf);
    const cleanPhone = sanitizers.sanitizeDocument(dto.phone);

    if (cleanCpf.length !== 11)
      throw new Error("O CPF deve conter exatamente 11 dígitos.");

    const existingStaff = await staffRepository.findByCpf(cleanCpf);
    if (existingStaff)
      throw new Error("Este CPF já está cadastrado no sistema.");

    const newStaff: StaffEntity = {
      id: Crypto.randomUUID(),
      name: dto.name.trim(),
      cpf: cleanCpf,
      phone: cleanPhone,
      email: dto.email.trim(),
      role: dto.role,
      status: dto.status,
      avatar_uri: dto.avatarUri,
      created_at: new Date().toISOString(),
    };

    await staffRepository.insert(newStaff);
  },

  /** Atualiza os dados de um funcionário existente */
  async updateStaff(id: string, dto: Partial<CreateStaffDTO>): Promise<void> {
    const existingStaff = await staffRepository.findById(id);
    if (!existingStaff)
      throw new Error("Funcionário não encontrado para atualização.");

    const updatedData: Partial<StaffEntity> = {};

    if (dto.name) updatedData.name = dto.name.trim();
    if (dto.role) updatedData.role = dto.role;
    if (dto.status) updatedData.status = dto.status;

    if (dto.avatarUri !== undefined) {
      updatedData.avatar_uri = dto.avatarUri;
    }

    if (dto.email !== undefined) {
      updatedData.email = dto.email.trim();
    }

    if (dto.phone !== undefined) {
      updatedData.phone = sanitizers.sanitizeDocument(dto.phone);
    }

    if (dto.cpf) {
      const cleanCpf = sanitizers.sanitizeDocument(dto.cpf);
      if (cleanCpf.length !== 11)
        throw new Error("O novo CPF deve conter exatamente 11 dígitos.");

      if (cleanCpf !== existingStaff.cpf) {
        const cpfConflict = await staffRepository.findByCpf(cleanCpf);
        if (cpfConflict)
          throw new Error("Este CPF já está associado a outro funcionário.");
        updatedData.cpf = cleanCpf;
      }
    }

    if (Object.keys(updatedData).length === 0) return;

    await staffRepository.update(id, updatedData);
  },

  /** Alterna o status de um funcionário */
  async toggleStaffStatus(
    id: string,
  ): Promise<"active" | "inactive" | "suspended"> {
    const staff = await staffRepository.findById(id);
    if (!staff) {
      throw new Error("Funcionário não encontrado.");
    }

    const newStatus =
      staff.status === "active"
        ? "inactive"
        : staff.status === "inactive"
          ? "suspended"
          : "active";
    await staffRepository.update(id, { status: newStatus });
    return newStatus;
  },

  /** Exclui um funcionário do sistema */
  async deleteStaff(id: string): Promise<void> {
    const staff = await staffRepository.findById(id);
    if (!staff) {
      throw new Error("Funcionário não encontrado para exclusão.");
    }
    await staffRepository.delete(id);
  },

};