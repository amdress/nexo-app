// src/features/clients/services/clientService.ts
import { clientRepository } from "@/database/repositories/clientRepository";
import { ClientWithShifts } from "@/database/repositories/interfaces/clientRepositoryInterface";
import { ClientEntity } from "@/database/models/client";
import { ClientShiftEntity } from "@/database/models/clientShitf";
import { ClientCreateDto, ClientShiftDraft } from "../dto/ClientCreateDto";
import { ClientUI, ClientShiftUI } from "../interfacesUI/clientUI";

// Mapeador de Turno Entity -> UI
function mapShiftEntityToUI(item: ClientShiftEntity): ClientShiftUI {
  return {
    id: item.id,
    clientId: item.client_id,
    name: item.name,
    startTime: item.start_time,
    endTime: item.end_time,
    breakDuration: item.break_duration,
    demandInfo: item.demand_info,
    defaultStaffCount: item.default_staff_count,
  };
}

// Mapeador de Cliente Com Turnos Entity -> UI
function mapClientWithShiftsToUI(item: ClientWithShifts): ClientUI {
  return {
    id: item.id,
    name: item.name,
    logoUri: item.logo_uri,
    accountLabel: item.account_label,
    site: item.site,
    address: item.address,
    cityState: item.city_state,
    shifts: (item.shifts || []).map(mapShiftEntityToUI),
  };
}

export const clientService = {
  /** Busca todas as empresas contratantes cadastradas com seus turnos */
  async getAllClients(): Promise<ClientUI[]> {
    try {
      const clientsWithShifts = await clientRepository.findAllWithShifts();
      console.log(
        "[CLIENT_SERVICE GET] Clientes obtidos com turnos:",
        clientsWithShifts.length,
      );
      return clientsWithShifts.map(mapClientWithShiftsToUI);
    } catch (error: any) {
      console.error("[CLIENT_SERVICE] Erro ao buscar clientes:", error);
      throw new Error(
        error?.message || "Não foi possível carregar a lista de empresas.",
      );
    }
  },

  /** Busca uma empresa contratante específica pelo ID com seus turnos */
  async getClientById(id: string): Promise<ClientUI | null> {
    try {
      const clientWithShifts = await clientRepository.findByIdWithShifts(id);
      if (!clientWithShifts) return null;
       console.log(
        "[CLIENT_SERVICE GET PROFILE] Empresa e turnos obtenida com sucesso:",
        clientWithShifts,
      );
      return mapClientWithShiftsToUI(clientWithShifts);
    } catch (error: any) {
      console.error(
        "[CLIENT_SERVICE GET] Erro ao buscar cliente por ID:",
        error,
      );
      throw new Error(
        error?.message || "Não foi possível carregar os dados da empresa.",
      );
    }
  },

  /** Cria uma nova empresa contratante junto com seus turnos iniciais */
  async createClient(dto: ClientCreateDto): Promise<ClientUI> {
    try {
      const trimmedName = dto.name.trim();
      if (!trimmedName) {
        throw new Error("O nome da empresa é obrigatório.");
      }

      // Preparar payload do cliente (omitimos ID pois o repo gera)
      const clientData: Omit<ClientEntity, "id"> = {
        name: trimmedName,
        logo_uri: dto.logoUri || null,
        account_label: dto.accountLabel?.trim() || null,
        site: dto.site?.trim() || null,
        address: dto.address?.trim() || null,
        city_state: dto.cityState?.trim() || null,
        created_at: dto.createdAt || new Date().toISOString(),
      };

      // Mapear os borradores de turnos do DTO para snake_case
      const shiftsData: Omit<ClientShiftEntity, "id" | "client_id">[] = (
        dto.shifts || []
      ).map((shiftDraft: ClientShiftDraft) => ({
        name: shiftDraft.name.trim(),
        start_time: shiftDraft.startTime,
        end_time: shiftDraft.endTime,
        break_duration: shiftDraft.breakDuration || "1h",
        demand_info: shiftDraft.demandInfo.trim(),
        default_staff_count: shiftDraft.defaultStaffCount || 1,
        created_at: new Date().toISOString(),
      }));

      // Executa inserção atômica no banco
      const createdClient = await clientRepository.insertWithShifts(
        clientData,
        shiftsData,
      );

      console.log(
        "[CLIENT_SERVICE CREATE] Empresa e turnos criados com sucesso:",
        createdClient.id,
      );

      return mapClientWithShiftsToUI(createdClient);
    } catch (error: any) {
      console.error("[CLIENT_SERVICE CREATE] Erro ao criar empresa:", error);
      throw new Error(error?.message || "Não foi possível criar a empresa.");
    }
  },

  /** Atualiza os dados cadastrais de uma empresa */
  async updateClient(
    id: string,
    data: Partial<ClientCreateDto>,
  ): Promise<void> {
    try {
      const updatedData: Partial<ClientEntity> = {};

      if (data.name !== undefined) updatedData.name = data.name.trim();
      if (data.logoUri !== undefined) updatedData.logo_uri = data.logoUri;
      if (data.accountLabel !== undefined)
        updatedData.account_label = data.accountLabel?.trim() || null;
      if (data.site !== undefined) updatedData.site = data.site?.trim() || null;
      if (data.address !== undefined)
        updatedData.address = data.address?.trim() || null;
      if (data.cityState !== undefined)
        updatedData.city_state = data.cityState?.trim() || null;

      await clientRepository.update(id, updatedData);
      console.log("[CLIENT_SERVICE  UPDATE] Empresa atualizada:", id);
    } catch (error: any) {
      console.error(
        "[CLIENT_SERVICE UPDATE] Erro ao atualizar empresa:",
        error,
      );
      throw new Error(
        error?.message || "Não foi possível atualizar a empresa.",
      );
    }
  },

  /** Remove uma empresa contratante (os turnos são removidos em cascata pela FK) */
  async deleteClient(id: string): Promise<void> {
    try {
      await clientRepository.delete(id);
      console.log("[CLIENT_SERVICE dELETE] Empresa removida:", id);
    } catch (error: any) {
      console.error("[CLIENT_SERVICE dELETE] Erro ao remover empresa:", error);
      throw new Error(error?.message || "Não foi possível remover a empresa.");
    }
  },

  // =========================================================================
  // OPERACIONES DIRECTAS SOBRE CLIENT_SHIFTS
  // =========================================================================


async createShift(clientId: string, shiftData: ClientShiftDraft): Promise<void> {
  await clientRepository.insertShift(clientId, {
    name: shiftData.name.trim(),
    start_time: shiftData.startTime,
    end_time: shiftData.endTime,
    break_duration: shiftData.breakDuration.trim() || "1h",
    demand_info: shiftData.demandInfo.trim(),
    default_staff_count: shiftData.defaultStaffCount || 1,
    created_at: new Date().toISOString(), // <--- Agregado aquí
  });
},

  async updateShift(
    shiftId: string,
    shiftData: ClientShiftDraft,
  ): Promise<void> {
    await clientRepository.updateShift(shiftId, {
      name: shiftData.name.trim(),
      start_time: shiftData.startTime,
      end_time: shiftData.endTime,
      break_duration: shiftData.breakDuration.trim() || "1h",
      demand_info: shiftData.demandInfo.trim(),
      default_staff_count: shiftData.defaultStaffCount || 1,
    });
  },

  async deleteShift(shiftId: string): Promise<void> {
    await clientRepository.deleteShift(shiftId);
  },
};
