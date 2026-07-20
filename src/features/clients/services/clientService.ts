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
    accountLabel: item.account_label,
    site: item.site,
    address: item.address,
    cityState: item.city_state,
  };
}

export interface ClientFormData {
  name: string;
  logoUri?: string | null;
  accountLabel?: string | null;
  site?: string | null;
  address?: string | null;
  cityState?: string | null;
}

export const clientService = {
  /** Busca todas as empresas contratantes cadastradas */
  async getAllClients(): Promise<ClientUI[]> {
    try {
      const clients = await clientRepository.findAll();
      console.log("[Client_Services] Clientes obtenidos")
      return clients.map(mapClientEntityToUI);
    } catch (error: any) {
      console.error("[CLIENT_SERVICE] Erro ao buscar clientes:", error);
      throw new Error(error?.message || "Não foi possível carregar a lista de empresas.");
    }
  },

  /** Cria uma nova empresa contratante */
  async createClient(data: ClientFormData): Promise<ClientUI> {
    try {
      const trimmedName = data.name.trim();
      if (!trimmedName) {
        throw new Error("O nome da empresa é obrigatório.");
      }

      const newClient: ClientEntity = {
        id: Crypto.randomUUID(),
        name: trimmedName,
        logo_uri: data.logoUri || null,
        account_label: data.accountLabel?.trim() || null,
        site: data.site?.trim() || null,
        address: data.address?.trim() || null,
        city_state: data.cityState?.trim() || null,
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

  /** Atualiza os dados de uma empresa contratante */
  async updateClient(id: string, data: Partial<ClientFormData>): Promise<void> {
    try {
      const updatedData: Partial<ClientEntity> = {};

      if (data.name !== undefined) updatedData.name = data.name.trim();
      if (data.logoUri !== undefined) updatedData.logo_uri = data.logoUri;
      if (data.accountLabel !== undefined) updatedData.account_label = data.accountLabel?.trim() || null;
      if (data.site !== undefined) updatedData.site = data.site?.trim() || null;
      if (data.address !== undefined) updatedData.address = data.address?.trim() || null;
      if (data.cityState !== undefined) updatedData.city_state = data.cityState?.trim() || null;

      await clientRepository.update(id, updatedData);
      console.log("[CLIENT_SERVICE] Empresa atualizada:", id);
    } catch (error: any) {
      console.error("[CLIENT_SERVICE] Erro ao atualizar empresa:", error);
      throw new Error(error?.message || "Não foi possível atualizar a empresa.");
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