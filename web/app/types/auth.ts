export interface AuthLogin{
    email:string
    senha: string
}
export interface Usuario {
  id: number;
  email: string;
}

export interface CreateUsuario{
    nome:string
    email:string
    senha:string
}