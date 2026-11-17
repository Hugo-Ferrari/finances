import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsuarioService } from './usuario.service';
import { UsuarioRepository } from './usuario.repository';

describe('UsuarioService.excluirConta', () => {
  const repository = {
    buscarSenha: jest.fn(),
    removerComDados: jest.fn(),
  };
  const service = new UsuarioService(
    repository as unknown as UsuarioRepository,
  );

  beforeEach(() => jest.clearAllMocks());

  it('apaga a conta quando a senha confere', async () => {
    repository.buscarSenha.mockResolvedValue({
      senha: await bcrypt.hash('segredo123', 4),
    });

    await expect(service.excluirConta(7, 'segredo123')).resolves.toEqual({
      mensagem: 'Conta excluída',
    });
    expect(repository.removerComDados).toHaveBeenCalledWith(7);
  });

  it('não apaga com a senha errada (403, não desloga no front)', async () => {
    repository.buscarSenha.mockResolvedValue({
      senha: await bcrypt.hash('segredo123', 4),
    });

    await expect(service.excluirConta(7, 'outra')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(repository.removerComDados).not.toHaveBeenCalled();
  });

  it('usuário que não existe mais vira sessão inválida', async () => {
    repository.buscarSenha.mockResolvedValue(null);

    await expect(service.excluirConta(7, 'x')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(repository.removerComDados).not.toHaveBeenCalled();
  });
});
