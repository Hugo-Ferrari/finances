export type Conta = {
  id: number;
  nome: string;
  tipo: "CORRENTE" | "POUPANCA" | "CARTEIRA";
  saldo: string;
  ativa: boolean;
};