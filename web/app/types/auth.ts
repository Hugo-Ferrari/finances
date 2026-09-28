export interface AuthLogin {
  email: string;
  senha: string;
  lembrarDeMim?: boolean;
}
export interface Usuario {
  id: number;
  email: string;
}

export interface CreateUsuario {
  nome: string;
  email: string;
  senha: string;
}

export interface UpdateUsuario {
  nome: string;
  email: string;
}
