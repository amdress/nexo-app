import { staffService } from "../../staff/services/staffService";
import { dailyRepository } from "../../../database/repositories/dailyRepository";
import { dailyStaffRepository } from "../../../database/repositories/dailyStaffRepository";
import { DailyCreateDto } from "../dto/DailyCreateDto";
import { saveSignatureFile, savePhotoFile } from "@/shared/utils/fileStorage";
import {
  DailyItem,
  DailyWithStaffUI,
  StaffAttendance,
} from "../interfacesUI/daily";
import { DailyEntity } from "../../../database/models/daily";
import {
  getDayName,
  formatTimeRange,
} from "../../../shared/utils/dateFormatter";

import * as Crypto from "expo-crypto";
import { DailyStaffEntity } from "@/database/models/dailyStaff";
import { StaffUI } from "@/features/staff/interacesUI/staffUI";

/** Traduz uma DailyEntity crua (snake_case, vinda do banco) para o formato de UI */
function mapDailyEntityToItem(
  daily: DailyEntity,
  confirmedStaffCount: number,
): DailyItem {
  return {
    id: daily.id,
    dateLabel: daily.date,
    dayName: getDayName(daily.date),
    timeRange: formatTimeRange(daily.start_time, daily.end_time),
    description: daily.description || "",
    requiredStaffCount: daily.required_staff_count,
    confirmedStaffCount,
    status: daily.status,
  };
}

export const dailyService = {
  /** Cria uma nova jornada diária e vincula o staff na tabela pivô */
async createDaily(payload: DailyCreateDto): Promise<DailyItem> {
  try {
    const newDailyId = Crypto.randomUUID();

    const dailyEntity: DailyEntity = {
      id: newDailyId,
      date: payload.date,
      start_time: payload.startTime,
      end_time: payload.endTime,
      required_staff_count: payload.requiredStaffCount,
      description: payload.description || null,
      status: "scheduled",
      created_at: payload.createdAt,
    };

    await dailyRepository.insert(dailyEntity);
    console.log("[DAILY_SERVICE] Jornada criada com ID:", newDailyId);

    let confirmedStaffCount = 0;

    if (payload.selectedStaffIds && payload.selectedStaffIds.length > 0) {
      const staff: DailyStaffEntity[] = payload.selectedStaffIds.map((staffId) => ({
        id: Crypto.randomUUID(),
        daily_id: newDailyId,
        staff_id: staffId,
        status: "confirmed",
        check_in: null,
        break_start: null,
        break_end: null,
        check_out: null,
        justification: null,
        photo_uri: null,
        signature_uri: null,
        signed_at: null,
        created_at: new Date().toISOString(),
        updated_at: null,
      }));

      await Promise.all(
        staff.map((entity) => dailyStaffRepository.insert(entity)),
      );
      confirmedStaffCount = staff.length;
      console.log(`[DAILY_SERVICE] Alocados ${staff.length} funcionários selecionados.`);
    }

    return mapDailyEntityToItem(dailyEntity, confirmedStaffCount);
  } catch (error: any) {
    console.error("[DAILY_SERVICE] Erro ao salvar jornada e tabela pivô:", error);
    throw new Error(error?.message || "Erro interno ao persistir a jornada de trabalho");
  }
},

  /**
   * Busca todas as jornadas que estão ativas (não finalizadas),
   * junto com a quantidade de funcionários confirmados para cada uma.
   */
  async getActiveDailys(): Promise<DailyItem[]> {
    try {
      const dailys = await dailyRepository.findActiveDailys();
      console.log(
        `[DAILY_SERVICE] Jornadas ativas: ${JSON.stringify(dailys, null, 2)}`,
      );

      return dailys.map(({ daily, confirmed_staff_count }) =>
        mapDailyEntityToItem(daily, confirmed_staff_count),
      );
    } catch (error) {
      console.error("[DAILY_SERVICE] Erro ao buscar jornadas ativas:", error);
      throw new Error("Falha ao carregar jornadas ativas.");
    }
  },

  /** Busca os funcionários ativos disponíveis para alocação */
  async getStaffList(): Promise<StaffUI[]> {
    try {
      return await staffService.getStaffByStatus("active");
    } catch (error: any) {
      console.error(
        "[DAILY_SERVICE] Erro ao buscar lista de staff ativo:",
        error,
      );
      throw new Error(
        error?.message || "Não foi possível carregar o staff cadastrado.",
      );
    }
  },

/**
 * Busca uma jornada com seus funcionários já mapeados para o formato de UI
 */
async getDailyWithStaff(dailyId: string): Promise<DailyWithStaffUI | null> {
  try {
    const dailyWithStaff = await dailyStaffRepository.findWithStaffById(dailyId);
    if (!dailyWithStaff) return null;

    const { daily, staff } = dailyWithStaff;

    const confirmedStaffCount = staff.filter(
      (s: any) => s.status === "confirmed" || s.status === "present",
    ).length;

    const mappedDaily = mapDailyEntityToItem(daily, confirmedStaffCount);

    const mappedStaff: StaffAttendance[] = staff.map((s: any) => ({
      id: s.id,
      name: s.name,
      role: s.role,
      avatar: s.avatar_uri || null,
      status: s.status,
      checkIn: s.check_in,
      breakStart: s.break_start,
      breakEnd: s.break_end,
      checkOut: s.check_out,
      photoUri: s.photo_uri || null,
      signatureUri: s.signature_uri || null,
      signedAt: s.signed_at || null,
    }));

    return { daily: mappedDaily, staff: mappedStaff };
  } catch (error: any) {
    console.error("[DAILY_SERVICE] Erro ao buscar jornada com staff mapeada:", error);
    throw new Error(error?.message || "Não foi possível carregar os dados da jornada.");
  }
},

  /** Remove um funcionário de uma jornada específica */
  async removeStaffFromDaily(dailyId: string, staffId: string): Promise<void> {
    try {
      await dailyStaffRepository.removeStaffFromDaily(dailyId, staffId);
      console.log(
        `[DAILY_SERVICE] Staff ${staffId} deletado com sucesso da jornada ${dailyId}`,
      );
    } catch (error: any) {
      console.error(
        "[DAILY_SERVICE] Erro ao remover funcionário da jornada:",
        error,
      );
      throw new Error(
        error?.message || "Não foi possível remover o funcionário.",
      );
    }
  },

  /** Busca funcionários ativos que ainda não estão alocados nesta jornada */
  async getAvailableStaff(dailyId: string): Promise<StaffUI[]> {
    try {
      const activeStaff = await staffService.getStaffByStatus("active");
      const dailyWithStaff =
        await dailyStaffRepository.findWithStaffById(dailyId);
      const allocatedIds = new Set(
        (dailyWithStaff?.staff || []).map((s: any) => s.id),
      );

      const available = activeStaff.filter((s) => !allocatedIds.has(s.id));
      console.log(
        `[DAILY_SERVICE] Staff disponíveis: ${JSON.stringify(available, null, 2)}`,
      );

      return available;
    } catch (error: any) {
      console.error("[DAILY_SERVICE] Erro ao buscar staff disponível:", error);
      throw new Error(
        error?.message || "Não foi possível carregar o staff disponível.",
      );
    }
  },

/** Adiciona um funcionário de emergência diretamente na jornada em andamento */
async addEmergencyStaff(dailyId: string, staffId: string): Promise<void> {
  try {
    const emergencyStaff: DailyStaffEntity = {
      id: Crypto.randomUUID(),
      daily_id: dailyId,
      staff_id: staffId,
      status: "confirmed",
      check_in: null,
      break_start: null,
      break_end: null,
      check_out: null,
      justification: null,
      photo_uri: null,
      signature_uri: null,
      signed_at: null,
      created_at: new Date().toISOString(),
      updated_at: Date.now(),
    };

    await dailyStaffRepository.insert(emergencyStaff);
    console.log(`[DAILY_SERVICE] Staff de emergência ${staffId} adicionado com sucesso à jornada ${dailyId}`);
  } catch (error: any) {
    console.error("[DAILY_SERVICE] Erro ao adicionar staff de emergência:", error);
    throw new Error(error?.message || "Não foi possível adicionar o funcionário.");
  }
},

  /**
   * Atualiza o status geral da jornada aplicando as regras de transição de estado.
   * Retorna a jornada já mapeada para o formato de UI, pronta para setState direto.
   */
  async updateDailyStatus(
    dailyId: string,
    newStatus: "scheduled" | "in_progress" | "completed",
  ): Promise<DailyItem> {
    try {
      const daily = await dailyRepository.findById(dailyId);
      if (!daily) {
        throw new Error("Jornada não encontrada.");
      }

      if (newStatus === "in_progress" && daily.status !== "scheduled") {
        throw new Error("Apenas jornadas agendadas podem ser iniciadas.");
      }

      if (newStatus === "completed" && daily.status !== "in_progress") {
        throw new Error("Apenas jornadas em andamento podem ser finalizadas.");
      }

      if (newStatus !== daily.status) {
        await dailyRepository.update(dailyId, { status: newStatus });
        console.log(
          `[DAILY_SERVICE] Status da jornada ${dailyId} atualizado para: ${newStatus}`,
        );
      }

      // Construimos la entidad actualizada en memoria, ya que update() no la devuelve
      const updatedEntity: DailyEntity = { ...daily, status: newStatus };

      const dailyWithStaff =
        await dailyStaffRepository.findWithStaffById(dailyId);
      const confirmedStaffCount = (dailyWithStaff?.staff || []).filter(
        (s: any) => s.status === "confirmed" || s.status === "present",
      ).length;

      return mapDailyEntityToItem(updatedEntity, confirmedStaffCount);
    } catch (error: any) {
      console.error(
        "[DAILY_SERVICE] Erro ao atualizar status da jornada:",
        error,
      );
      throw new Error(
        error?.message || "Não foi possível atualizar o status da jornada.",
      );
    }
  },

  /** Atualiza um ponto de controle (status ou horário) de um funcionário na jornada */
  async updateStaffStatus(
    dailyId: string,
    staffId: string,
    type: "status" | "check_in" | "break_start" | "break_end" | "check_out",
    value: string,
  ): Promise<void> {
    try {
      const dataToUpdate: any = {};

      if (type === "status") {
        dataToUpdate.status = value;
      } else {
        // Qualquer marca de horário implica presença física confirmada
        dataToUpdate.status = "present";
        dataToUpdate[type] = value;
      }

      await dailyStaffRepository.updateByCompositeId(
        dailyId,
        staffId,
        dataToUpdate,
      );
      console.log(
        `[DAILY_SERVICE] Atualizado — daily: ${dailyId}, staff: ${staffId}`,
        dataToUpdate,
      );
    } catch (error: any) {
      console.error(`[DAILY_SERVICE] Erro ao atualizar:`, error);
      throw new Error("Falha ao registrar alteração.");
    }
  },


/** Persiste a foto e a assinatura capturadas de um staff, vinculando-as à jornada */
async saveStaffSignature(
  dailyId: string,
  staffId: string,
  photoTemporaryUri: string,
  signatureBase64: string,
): Promise<void> {
  try {
    const photoUri = await savePhotoFile(dailyId, staffId, photoTemporaryUri);
    const signatureUri = await saveSignatureFile(dailyId, staffId, signatureBase64);
    const signedAt = new Date().toISOString();

    await dailyStaffRepository.updateByCompositeId(dailyId, staffId, {
      photo_uri: photoUri,
      signature_uri: signatureUri,
      signed_at: signedAt,
    });

    console.log(`[DAILY_SERVICE] Assinatura salva — daily: ${dailyId}, staff: ${staffId}`);
  } catch (error: any) {
    console.error("[DAILY_SERVICE] Erro ao salvar assinatura do staff:", error);
    throw new Error(error?.message || "Não foi possível salvar a assinatura.");
  }
},

};
