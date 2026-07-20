// src/features/staff/services/staffService.test.ts
import { staffService } from './staffService';
// Cambiado a 4 niveles hacia atrás para llegar a la raíz de src/
import { staffRepository } from '@/database/repositories/staffRepository'; 
import { CreateStaffDTO } from '../interacesUI/staff.dto';

// 1. Interceptamos el repositorio usando la misma ruta corregida de 4 niveles
jest.mock('@/database/repositories/staffRepository', () => ({
  staffRepository: {
    findByCpf: jest.fn(),
    insert: jest.fn(),
  },
}));

describe('Staff Service - createStaff', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('✅ Deve criar um funcionario com sucesso quando os dados são válidos', async () => {
    (staffRepository.findByCpf as jest.Mock).mockResolvedValue(null);

    const dto: CreateStaffDTO = {
      name: '  John Doe  ',
      cpf: '123.456.789-00',
      phone: '(41) 99999-9999',
      email: 'john@nexo.com ',
      role: 'operator',
      status: 'active',
      avatarUri: 'https://avatar.url',
    };

    await expect(staffService.createStaff(dto)).resolves.not.toThrow();

    expect(staffRepository.findByCpf).toHaveBeenCalledWith('12345678900');
    expect(staffRepository.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'John Doe',
        cpf: '12345678900',
        email: 'john@nexo.com',
        role: 'operator',
        status: 'active',
        avatar_uri: 'https://avatar.url',
      })
    );
  });

  test('❌ Deve lançar um erro se o CPF não tiver exatamente 11 dígitos', async () => {
    const dto: CreateStaffDTO = {
      name: 'Jane Doe',
      cpf: '123.456',
      phone: '41999999999',
      email: 'jane@nexo.com',
      role: 'admin',
      status: 'active',
      avatarUri: null,
    };

    await expect(staffService.createStaff(dto)).rejects.toThrow(
      "O CPF deve conter exatamente 11 dígitos."
    );

    expect(staffRepository.findByCpf).not.toHaveBeenCalled();
    expect(staffRepository.insert).not.toHaveBeenCalled();
  });

  test('❌ Deve lançar um erro se o CPF já está registrado', async () => {
    const existingStaffMock = { id: 'uuid-existente', cpf: '12345678900' };
    (staffRepository.findByCpf as jest.Mock).mockResolvedValue(existingStaffMock);

    const dto: CreateStaffDTO = {
      name: 'Duplicate Staff',
      cpf: '123.456.789-00',
      phone: '41999999999',
      email: 'duplicate@nexo.com',
      role: 'operator',
      status: 'active',
      avatarUri: null,
    };

    await expect(staffService.createStaff(dto)).rejects.toThrow(
      "Este CPF já está cadastrado no sistema."
    );

    expect(staffRepository.findByCpf).toHaveBeenCalledWith('12345678900');
    expect(staffRepository.insert).not.toHaveBeenCalled();
  });

});