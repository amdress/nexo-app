// src/features/staff/services/__tests__/staffService.test.ts
import { staffService } from "./staffService";
import { staffRepository } from "../../../database/repositories/staffRepository";
import { sanitizers } from "../../../shared/utils/sanitizers";
import { StaffEntity } from "../../../database/models/staff";
import { CreateStaffDTO } from "../interacesUI/staff.dto";

jest.mock("../../../database/repositories/staffRepository", () => ({
  staffRepository: {
    findAll: jest.fn(),
    findAllByStatus: jest.fn(),
    findById: jest.fn(),
    findByCpf: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("../../../shared/utils/sanitizers", () => ({
  sanitizers: {
    sanitizeDocument: jest.fn((doc: string) => doc.replace(/\D/g, "")),
  },
}));

jest.mock("expo-crypto", () => ({
  randomUUID: jest.fn(() => "mocked-uuid-1234"),
}));

describe("staffService", () => {
  const validUUID = "af7a7a88-b75b-4fac-9e52-4c13e4d08e87";

  const mockStaffEntity: StaffEntity = {
    id: validUUID,
    name: "John Doe",
    cpf: "12345678900",
    phone: "41999999999",
    email: "john@nexo.com",
    role: "operator",
    status: "active",
    avatar_uri: "https://avatar.url",
    created_at: "2026-07-24T17:26:10.270Z",
  };

  const mockCreateDTO: CreateStaffDTO = {
    name: "John Doe",
    cpf: "123.456.789-00",
    phone: "(41) 99999-9999",
    email: "john@nexo.com",
    role: "operator",
    status: "active",
    avatarUri: "https://avatar.url",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("getAllStaff", () => {
    it("deve retornar uma lista de funcionários formatados para a UI", async () => {
      (staffRepository.findAll as jest.Mock).mockResolvedValue([mockStaffEntity]);

      const result = await staffService.getAllStaff();

      expect(staffRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([
        {
          id: validUUID,
          name: "John Doe",
          email: "john@nexo.com",
          role: "operator",
          phone: "41999999999",
          status: "active",
          avatarUri: "https://avatar.url",
        },
      ]);
    });
  });

  describe("getStaffByStatus", () => {
    it("deve retornar funcionários filtrados por status com o mapeamento correto", async () => {
      (staffRepository.findAllByStatus as jest.Mock).mockResolvedValue([mockStaffEntity]);

      const result = await staffService.getStaffByStatus("active");

      expect(staffRepository.findAllByStatus).toHaveBeenCalledWith("active");
      expect(result).toHaveLength(1);
      expect(result[0].avatarUri).toBe(mockStaffEntity.avatar_uri);
    });

    it("deve lançar um erro encapsulado caso o repositório falhe", async () => {
      (staffRepository.findAllByStatus as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      await expect(staffService.getStaffByStatus("active")).rejects.toThrow(
        "Falha ao listar funcionários com status 'active' do banco local."
      );
    });
  });

  describe("getStaffById", () => {
    it("deve retornar o funcionário formatado para UI quando encontrado", async () => {
      (staffRepository.findById as jest.Mock).mockResolvedValue(mockStaffEntity);

      const result = await staffService.getStaffById(validUUID);

      expect(staffRepository.findById).toHaveBeenCalledWith(validUUID);
      expect(result.id).toBe(validUUID);
      expect(result.avatarUri).toBe("https://avatar.url");
    });

    it("deve lançar erro se o funcionário não for encontrado", async () => {
      (staffRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(staffService.getStaffById(validUUID)).rejects.toThrow(
        "Funcionário não encontrado no sistema."
      );
    });
  });

  describe("createStaff", () => {
    it("deve sanear os dados e inserir um novo funcionário com sucesso", async () => {
      (staffRepository.findByCpf as jest.Mock).mockResolvedValue(null);
      (staffRepository.insert as jest.Mock).mockResolvedValue(undefined);

      await staffService.createStaff(mockCreateDTO);

      expect(sanitizers.sanitizeDocument).toHaveBeenCalledWith(mockCreateDTO.cpf);
      expect(sanitizers.sanitizeDocument).toHaveBeenCalledWith(mockCreateDTO.phone);
      expect(staffRepository.findByCpf).toHaveBeenCalledWith("12345678900");
      expect(staffRepository.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "mocked-uuid-1234",
          name: "John Doe",
          cpf: "12345678900",
          phone: "41999999999",
          email: "john@nexo.com",
          role: "operator",
          status: "active",
          avatar_uri: "https://avatar.url",
        })
      );
    });

    it("deve lançar erro se o CPF saneado não tiver 11 dígitos", async () => {
      (sanitizers.sanitizeDocument as jest.Mock).mockReturnValueOnce("123");

      await expect(
        staffService.createStaff({ ...mockCreateDTO, cpf: "123" })
      ).rejects.toThrow("O CPF deve conter exatamente 11 dígitos.");
    });

    it("deve lançar erro se o CPF já estiver cadastrado", async () => {
      (staffRepository.findByCpf as jest.Mock).mockResolvedValue(mockStaffEntity);

      await expect(staffService.createStaff(mockCreateDTO)).rejects.toThrow(
        "Este CPF já está cadastrado no sistema."
      );
    });
  });

  describe("updateStaff", () => {
    it("deve atualizar os campos informados com sucesso", async () => {
      (staffRepository.findById as jest.Mock).mockResolvedValue(mockStaffEntity);

      await staffService.updateStaff(validUUID, {
        name: "Jane Doe ",
        role: "admin",
      });

      expect(staffRepository.update).toHaveBeenCalledWith(validUUID, {
        name: "Jane Doe",
        role: "admin",
      });
    });

    it("deve atualizar o CPF se for válido e não houver conflito", async () => {
      (staffRepository.findById as jest.Mock).mockResolvedValue(mockStaffEntity);
      (staffRepository.findByCpf as jest.Mock).mockResolvedValue(null);

      await staffService.updateStaff(validUUID, {
        cpf: "987.654.321-11",
      });

      expect(staffRepository.update).toHaveBeenCalledWith(validUUID, {
        cpf: "98765432111",
      });
    });

    it("deve lançar erro se o funcionário a ser atualizado não existir", async () => {
      (staffRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        staffService.updateStaff(validUUID, { name: "New Name" })
      ).rejects.toThrow("Funcionário não encontrado para atualização.");
    });

    it("deve lançar erro se o novo CPF for inválido (< 11 dígitos)", async () => {
      (staffRepository.findById as jest.Mock).mockResolvedValue(mockStaffEntity);
      (sanitizers.sanitizeDocument as jest.Mock).mockReturnValueOnce("123");

      await expect(
        staffService.updateStaff(validUUID, { cpf: "123" })
      ).rejects.toThrow("O novo CPF deve conter exatamente 11 dígitos.");
    });

    it("deve lançar erro se o novo CPF já estiver em uso por outro funcionário", async () => {
      (staffRepository.findById as jest.Mock).mockResolvedValue(mockStaffEntity);
      (staffRepository.findByCpf as jest.Mock).mockResolvedValue({
        ...mockStaffEntity,
        id: "other-user-uuid",
      });

      await expect(
        staffService.updateStaff(validUUID, { cpf: "987.654.321-11" })
      ).rejects.toThrow("Este CPF já está associado a outro funcionário.");
    });

    it("não deve chamar update se o DTO não trouxer alterações reais", async () => {
      (staffRepository.findById as jest.Mock).mockResolvedValue(mockStaffEntity);

      await staffService.updateStaff(validUUID, {});

      expect(staffRepository.update).not.toHaveBeenCalled();
    });
  });

  describe("toggleStaffStatus", () => {
    it("deve alterar de 'active' para 'inactive'", async () => {
      (staffRepository.findById as jest.Mock).mockResolvedValue({
        ...mockStaffEntity,
        status: "active",
      });

      const nextStatus = await staffService.toggleStaffStatus(validUUID);

      expect(nextStatus).toBe("inactive");
      expect(staffRepository.update).toHaveBeenCalledWith(validUUID, {
        status: "inactive",
      });
    });

    it("deve alterar de 'inactive' para 'suspended'", async () => {
      (staffRepository.findById as jest.Mock).mockResolvedValue({
        ...mockStaffEntity,
        status: "inactive",
      });

      const nextStatus = await staffService.toggleStaffStatus(validUUID);

      expect(nextStatus).toBe("suspended");
      expect(staffRepository.update).toHaveBeenCalledWith(validUUID, {
        status: "suspended",
      });
    });

    it("deve alterar de 'suspended' para 'active'", async () => {
      (staffRepository.findById as jest.Mock).mockResolvedValue({
        ...mockStaffEntity,
        status: "suspended",
      });

      const nextStatus = await staffService.toggleStaffStatus(validUUID);

      expect(nextStatus).toBe("active");
      expect(staffRepository.update).toHaveBeenCalledWith(validUUID, {
        status: "active",
      });
    });

    it("deve lançar erro se o funcionário não for encontrado", async () => {
      (staffRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(staffService.toggleStaffStatus(validUUID)).rejects.toThrow(
        "Funcionário não encontrado."
      );
    });
  });

  describe("deleteStaff", () => {
    it("deve excluir o funcionário com sucesso", async () => {
      (staffRepository.findById as jest.Mock).mockResolvedValue(mockStaffEntity);

      await staffService.deleteStaff(validUUID);

      expect(staffRepository.delete).toHaveBeenCalledWith(validUUID);
    });

    it("deve lançar erro ao tentar excluir funcionário inexistente", async () => {
      (staffRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(staffService.deleteStaff(validUUID)).rejects.toThrow(
        "Funcionário não encontrado para exclusão."
      );
    });
  });
});