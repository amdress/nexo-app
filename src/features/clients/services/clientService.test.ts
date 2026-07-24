// src/features/clients/services/__tests__/clientService.test.ts
import { clientService } from "./clientService";
import { clientRepository } from "@/database/repositories/clientRepository";

jest.mock("@/database/repositories/clientRepository", () => ({
  clientRepository: {
    findByIdWithShifts: jest.fn(),
    createShift: jest.fn(),
    updateShift: jest.fn(),
    deleteShift: jest.fn(),
    findById: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("clientService", () => {
  const validUUID = "af7a7a88-b75b-4fac-9e52-4c13e4d08e87";
  const validShiftUUID = "708f8b00-f37e-446e-a35d-fc4b70fc8058";

  beforeEach(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("getClientById", () => {
    it("deve retornar um objeto ClientUI formatado corretamente quando a empresa for encontrada", async () => {
      const mockEntity = {
        id: validUUID,
        name: "DHL Curitiba",
        logo_uri: null,
        account_label: "Meli-DHL",
        site: "Curitiba",
        address: "Rua São Bento",
        city_state: "Curitiba / PR",
        created_at: "2026-07-24T15:38:54.484Z",
        shifts: [
          {
            id: validShiftUUID,
            client_id: validUUID,
            name: "Turno Diário",
            start_time: "08:00",
            end_time: "17:48",
            break_duration: "1h",
            demand_info: "Segunda a sex",
            default_staff_count: 1,
            created_at: "2026-07-24T15:38:54.485Z",
          },
        ],
      };

      (clientRepository.findByIdWithShifts as jest.Mock).mockResolvedValue(mockEntity);

      const result = await clientService.getClientById(validUUID);

      expect(clientRepository.findByIdWithShifts).toHaveBeenCalledWith(validUUID);
      expect(result).toEqual({
        id: validUUID,
        name: "DHL Curitiba",
        logoUri: null,
        accountLabel: "Meli-DHL",
        site: "Curitiba",
        address: "Rua São Bento",
        cityState: "Curitiba / PR",
        shifts: [
          {
            id: validShiftUUID,
            clientId: validUUID,
            name: "Turno Diário",
            startTime: "08:00",
            endTime: "17:48",
            breakDuration: "1h",
            demandInfo: "Segunda a sex",
            defaultStaffCount: 1,
          },
        ],
      });
    });

    it("deve retornar null se o repositório não encontrar a empresa", async () => {
      (clientRepository.findByIdWithShifts as jest.Mock).mockResolvedValue(null);

      const result = await clientService.getClientById(validUUID);

      expect(clientRepository.findByIdWithShifts).toHaveBeenCalledWith(validUUID);
      expect(result).toBeNull();
    });

    it("deve propagar o erro caso o repositório falhe", async () => {
      const dbError = new Error("Erro de conexão com o banco SQLite");
      (clientRepository.findByIdWithShifts as jest.Mock).mockRejectedValue(dbError);

      await expect(clientService.getClientById(validUUID)).rejects.toThrow(
        "Erro de conexão com o banco SQLite"
      );
    });
  });

  describe("deleteClient", () => {
    it("deve chamar o repositório para remover o cliente pelo ID", async () => {
      (clientRepository.delete as jest.Mock).mockResolvedValue(true);

      await clientService.deleteClient(validUUID);

      expect(clientRepository.delete).toHaveBeenCalledWith(validUUID);
    });
  });
});