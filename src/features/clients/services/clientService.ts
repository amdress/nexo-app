// src/features/clients/services/clientService.ts
import { clientRepository } from "../../../database/repositories/clientRepository";
import { ClientEntity } from "../../../database/models/client";
import { ClientUI } from "../interfacesUI/clientUI";
import * as Crypto from "expo-crypto";

function mapClientEntityToUI(item: ClientEntity): ClientUI {
  return {
    id: item.id,
    name: item.name,
    logoUri: item.logo_uri,
  };
}

export const clientService = {
  /** Busca todas as empresas contratantes cadastradas */
  async getAllClients(): Promise<ClientUI[]> {
    try {
      const clients = await clientRepository.findAll();
      return clients.map(mapClientEntityToUI);
    } catch (error: any) {
      console.error("[CLIENT_SERVICE] Erro ao buscar clientes:", error);
      throw new Error(error?.message || "Não foi possível carregar a lista de empresas.");
    }
  },

  /** Cria uma nova empresa contratante */
  async createClient(name: string, logoUri: string | null = null): Promise<ClientUI> {
    try {
      const trimmedName = name.trim();
      if (!trimmedName) {
        throw new Error("O nome da empresa é obrigatório.");
      }

      const newClient: ClientEntity = {
        id: Crypto.randomUUID(),
        name: trimmedName,
        logo_uri: logoUri,
        created_at: new Date().toISOString(),
      };

      await clientRepository.insert(newClient);
      console.log("[CLIENT_SERVICE] Empresa criada:", newClient.id);

      return mapClientEntityToUI(newClient);
    } catch (error: any) {
      console.error("[CLIENT_SERVICE] Erro ao criar empresa:", error);
      throw new Error(error?.message || "Não foi possível criar a empresa.");
    }
  },

  /** Remove uma empresa contratante do catálogo */
  async deleteClient(id: string): Promise<void> {
    try {
      await clientRepository.delete(id);
      console.log("[CLIENT_SERVICE] Empresa removida:", id);
    } catch (error: any) {
      console.error("[CLIENT_SERVICE] Erro ao remover empresa:", error);
      throw new Error(error?.message || "Não foi possível remover a empresa.");
    }
  },
};