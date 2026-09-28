# Finances

Sistema web de gerenciamento financeiro pessoal. A aplicação permite que cada usuário organize contas, categorias, transações e orçamentos, acompanhe o saldo consolidado e visualize resumos das despesas.

O projeto é dividido em dois aplicativos:

- `api`: backend REST desenvolvido com NestJS, TypeScript, Prisma e PostgreSQL.
- `web`: frontend desenvolvido com Next.js, React, TypeScript e Material UI/Tailwind CSS.

## Funcionalidades

- Cadastro de usuário e autenticação por e-mail e senha.
- Sessão autenticada por JWT armazenado em cookie HTTP-only.
- Isolamento dos dados por usuário autenticado.
- Cadastro, consulta, atualização e exclusão de contas.
- Tipos de conta: `CORRENTE`, `POUPANCA` e `CARTEIRA`.
- Controle de conta ativa/inativa.
- Cadastro, consulta, atualização e exclusão de categorias.
- Regra de categoria única por usuário.
- Cadastro, consulta, atualização e exclusão de transações.
- Tipos de transação: `ENTRADA` e `SAIDA`.
- Atualização automática do saldo da conta ao criar, editar ou remover uma transação.
- Bloqueio de saída maior que o saldo disponível.
- Associação opcional de uma transação a uma categoria.
- Resumo por período, resumo total e despesas agrupadas por categoria.
- Cadastro, consulta, atualização e exclusão de orçamentos por categoria.
- Dashboard com saldo, contas, gráficos/resumos e transações recentes.
- Histórico de transações com filtros por período.
- Exportação de transações para XLSX.
- Documentação interativa da API com Swagger.

## Stack

### Backend

- Node.js
- NestJS 11
- TypeScript
- Prisma 7
- PostgreSQL
- Passport e JWT
- bcrypt
- class-validator e class-transformer
- Swagger/OpenAPI
- Jest e Supertest

### Frontend

- Next.js 16 com App Router
- React 19
- TypeScript
- Material UI e MUI X Charts
- Tailwind CSS
- Axios
- Zustand
- React Hook Form e Zod
- Lucide React
- XLSX

## Pré-requisitos

- Node.js 20 ou superior.
- npm.
- PostgreSQL em execução.
- Uma base de dados PostgreSQL criada para o projeto.

## Configuração

### Variáveis de ambiente

A API utiliza as seguintes variáveis:

| Variável       | Obrigatória | Descrição                                             |
| -------------- | ----------- | ----------------------------------------------------- |
| `DATABASE_URL` | Sim         | String de conexão com o PostgreSQL usada pelo Prisma. |
| `JWT_SECRET`   | Sim         | Chave usada para assinar e validar os tokens JWT.     |
| `PORT`         | Não         | Porta da API. O padrão é `3001`.                      |

Crie `api/.env` com os valores do seu ambiente:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/finances?schema=public"
JWT_SECRET="uma-chave-secreta-forte"
PORT=3001
```

O arquivo `.env` não deve ser versionado. Nunca compartilhe o valor de `DATABASE_URL` ou `JWT_SECRET`.

O frontend lê a URL da API de `NEXT_PUBLIC_API_URL` e envia cookies com `withCredentials`. O backend permite CORS para `http://localhost:3000`.

### Docker Compose

O Compose carrega as variáveis do arquivo `.env` na raiz do repositório. Crie-o a partir do exemplo e substitua os valores de exemplo por segredos próprios:

```powershell
Copy-Item .env.example .env
```

Mantenha `.env` apenas na máquina local. Ele é ignorado pelo Git e arquivos `.env*` da API também são excluídos do contexto de build. A `DATABASE_URL` do Compose deve usar o host `postgres` (nome do serviço), não `localhost`.

Suba os serviços com:

```bash
docker compose up --build -d
docker compose ps
```

O Compose aguarda o Postgres ficar saudável, aplica as migrações versionadas e aguarda a API responder antes de iniciar o frontend. A aplicação web fica disponível em `http://localhost:3000`, a API em `http://localhost:3002` e o Swagger em `http://localhost:3002/api`.

O volume `postgres_data` mantém as credenciais iniciais do banco. Alterar `POSTGRES_USER` ou `POSTGRES_PASSWORD` no `.env` não altera uma base já criada. Se a API mostrar erro Prisma `P1000` após mudar essas variáveis, não apague o volume. Para alinhar a senha da role `postgres` sem expô-la na linha de comando:

```powershell
docker exec -it finlogic-postgres psql -U postgres -d finances
```

No prompt do `psql`, execute `\password postgres` e digite a nova senha nos prompts ocultos. Depois, configure no `.env` `POSTGRES_USER=postgres`, `POSTGRES_PASSWORD` com essa mesma senha e `DATABASE_URL` com o usuário e a mesma senha URL-safe. Saia com `\q` e rode `docker compose up --build -d` novamente. Isso preserva os dados existentes.

Para encerrar os contêineres sem apagar os dados do banco:

```bash
docker compose down
```

## Instalação e execução

Abra dois terminais na raiz do projeto.

### API

```bash
cd api
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

A API ficará disponível em:

- Aplicação: http://localhost:3001
- Swagger: http://localhost:3001/api

### Frontend

```bash
cd web
npm install
npm run dev
```

A aplicação web ficará disponível em http://localhost:3000.

Fluxo inicial recomendado:

1. Acesse `/cadastro` e crie um usuário.
2. Faça login em `/login`.
3. Crie uma conta em `/contas`.
4. Crie categorias em `/novaCategoria`.
5. Registre entradas e saídas em `/novaTransacao`.
6. Consulte os indicadores em `/dashboard`.

## Scripts disponíveis

### API

Execute os comandos dentro de `api`:

| Comando               | Finalidade                                 |
| --------------------- | ------------------------------------------ |
| `npm run start`       | Inicia a API sem watch.                    |
| `npm run start:dev`   | Inicia a API em desenvolvimento com watch. |
| `npm run start:debug` | Inicia a API em modo debug com watch.      |
| `npm run start:prod`  | Executa a versão compilada.                |
| `npm run build`       | Compila o backend.                         |
| `npm run lint`        | Executa o ESLint com correção automática.  |
| `npm run format`      | Formata os arquivos TypeScript.            |
| `npm run test`        | Executa os testes unitários.               |
| `npm run test:watch`  | Executa os testes em modo watch.           |
| `npm run test:cov`    | Executa os testes com cobertura.           |
| `npm run test:e2e`    | Executa os testes end-to-end.              |

### Prisma

Execute os comandos dentro de `api`:

```bash
npx prisma generate
npx prisma migrate dev
npx prisma migrate deploy
npx prisma migrate status
```

- `migrate dev` deve ser usado durante o desenvolvimento.
- `migrate deploy` deve ser usado para aplicar migrações já versionadas em ambientes de implantação.
- O cliente gerado fica em `api/src/generated/prisma`.

### Frontend

Execute os comandos dentro de `web`:

| Comando         | Finalidade                            |
| --------------- | ------------------------------------- |
| `npm run dev`   | Inicia o servidor de desenvolvimento. |
| `npm run build` | Gera o build de produção.             |
| `npm run start` | Executa o build de produção.          |
| `npm run lint`  | Executa o ESLint.                     |

## Arquitetura

### API

A API segue uma organização modular do NestJS:

- `auth`: login, JWT, estratégia Passport e guard global.
- `usuario`: cadastro, consulta, atualização e exclusão do usuário.
- `conta`: contas financeiras e saldo.
- `categoria`: categorias pessoais.
- `transacao`: lançamentos, filtros e indicadores.
- `orcamento`: limites por categoria.
- `prisma`: conexão e ciclo de vida do Prisma Client.
- `common`: decorators compartilhados, incluindo rotas públicas.

Cada domínio possui, em geral, controller, service, repository e DTOs. O `JwtGuard` é registrado como guard global; por isso, novas rotas são protegidas por padrão. Cadastro e login são explicitamente públicos.

### Frontend

A interface utiliza o App Router do Next.js:

- `app/(auth)`: telas públicas de login e cadastro.
- `app/(dashboard)`: área autenticada e layout com navegação.
- `app/components`: componentes reutilizáveis.
- `app/services`: comunicação HTTP com a API.
- `app/store`: estado global, incluindo autenticação.
- `app/types`: tipos compartilhados da aplicação web.

O cliente Axios usa `http://localhost:3001` como base URL, envia credenciais e redireciona para `/login` quando recebe resposta `401`.

## Rotas da aplicação web

| Rota             | Descrição                                  |
| ---------------- | ------------------------------------------ |
| `/login`         | Login do usuário.                          |
| `/cadastro`      | Cadastro de novo usuário.                  |
| `/dashboard`     | Visão geral financeira.                    |
| `/contas`        | Lista e criação de contas.                 |
| `/categorias`    | Lista de categorias e orçamentos.          |
| `/novaCategoria` | Criação de categoria e orçamento.          |
| `/novaTransacao` | Criação de transação.                      |
| `/transacoes`    | Histórico, filtros e resumo de transações. |
| `/configuracoes` | Configurações e dados do perfil.           |

A rota `/` direciona o usuário para o fluxo de autenticação.

## API REST

Todas as rotas abaixo exigem o cookie `access_token`, exceto cadastro e login. Os IDs são numéricos.

### Autenticação e usuário

| Método   | Endpoint      | Descrição                                      |
| -------- | ------------- | ---------------------------------------------- |
| `POST`   | `/usuario`    | Cadastra um usuário. Público.                  |
| `POST`   | `/auth/login` | Autentica e grava o cookie de sessão. Público. |
| `GET`    | `/usuario`    | Retorna o usuário autenticado.                 |
| `PATCH`  | `/usuario`    | Atualiza o usuário autenticado.                |
| `DELETE` | `/usuario`    | Remove o usuário autenticado.                  |

### Contas

| Método   | Endpoint     | Descrição                   |
| -------- | ------------ | --------------------------- |
| `POST`   | `/conta`     | Cria uma conta.             |
| `GET`    | `/conta`     | Lista as contas do usuário. |
| `GET`    | `/conta/:id` | Busca uma conta.            |
| `PATCH`  | `/conta/:id` | Atualiza uma conta.         |
| `DELETE` | `/conta/:id` | Exclui uma conta.           |

### Categorias

| Método   | Endpoint         | Descrição                       |
| -------- | ---------------- | ------------------------------- |
| `POST`   | `/categoria`     | Cria uma categoria.             |
| `GET`    | `/categoria`     | Lista as categorias do usuário. |
| `GET`    | `/categoria/:id` | Busca uma categoria.            |
| `PATCH`  | `/categoria/:id` | Atualiza uma categoria.         |
| `DELETE` | `/categoria/:id` | Exclui uma categoria.           |

### Transações

| Método   | Endpoint                                | Descrição                             |
| -------- | --------------------------------------- | ------------------------------------- |
| `POST`   | `/transacao`                            | Cria uma entrada ou saída.            |
| `GET`    | `/transacao`                            | Lista todas as transações do usuário. |
| `GET`    | `/transacao/conta/:contaId`             | Lista transações de uma conta.        |
| `GET`    | `/transacao/categoria/:categoriaId`     | Lista transações de uma categoria.    |
| `GET`    | `/transacao/periodo?inicio=...&fim=...` | Lista transações em um período.       |
| `GET`    | `/transacao/resumo?inicio=...&fim=...`  | Retorna resumo de um período.         |
| `GET`    | `/transacao/resumo-total`               | Retorna o resumo total do usuário.    |
| `GET`    | `/transacao/despesas-por-categoria`     | Agrupa despesas por categoria.        |
| `PATCH`  | `/transacao/:id`                        | Atualiza uma transação.               |
| `DELETE` | `/transacao/:id`                        | Remove uma transação.                 |

As datas dos filtros devem ser enviadas em formato aceito pelo construtor `Date`, preferencialmente ISO 8601. O fim do período é ajustado para incluir o dia inteiro.

### Orçamentos

| Método   | Endpoint         | Descrição                        |
| -------- | ---------------- | -------------------------------- |
| `POST`   | `/orcamento`     | Cria um orçamento por categoria. |
| `GET`    | `/orcamento`     | Lista os orçamentos do usuário.  |
| `PATCH`  | `/orcamento/:id` | Atualiza um orçamento.           |
| `DELETE` | `/orcamento/:id` | Exclui um orçamento.             |

## Modelo de dados

O schema está em `api/prisma/schema.prisma` e possui as entidades:

- `Usuario`: nome, e-mail e senha criptografada.
- `Conta`: nome, tipo, saldo, status e usuário proprietário.
- `Categoria`: nome e usuário proprietário, com unicidade por usuário e nome.
- `Transacao`: tipo, valor, descrição, data, conta e categoria opcional.
- `Orcamento`: valor definido para uma categoria de um usuário, com unicidade por usuário e categoria.

Relacionamentos principais:

- Um usuário possui várias contas, categorias e orçamentos.
- Uma conta possui várias transações.
- Uma categoria pode estar associada a várias transações e orçamentos.
- Ao excluir uma categoria, a categoria das transações relacionadas é definida como `NULL`.
- Ao excluir um usuário, suas contas, categorias e orçamentos são removidos em cascata conforme o schema.

## Regras de negócio

- Senhas são armazenadas com bcrypt, nunca em texto puro.
- O token JWT expira em 6 horas.
- Rotas protegidas usam o usuário identificado no token; um usuário não deve acessar registros de outro usuário.
- Uma conta inativa não aceita novas transações.
- Saídas não podem ultrapassar o saldo disponível.
- Entradas aumentam o saldo e saídas diminuem o saldo.
- Editar ou excluir uma transação recalcula o saldo da conta dentro de uma transação do Prisma.
- O valor de uma transação deve ser positivo.
- Categorias podem ser omitidas em transações.
- Uma mesma categoria não pode ser criada duas vezes para o mesmo usuário.
- Um usuário não pode possuir dois orçamentos para a mesma categoria.
- O `ValidationPipe` global remove campos não permitidos, rejeita propriedades desconhecidas e transforma os tipos dos DTOs quando aplicável.

## Segurança e sessão

- O JWT é enviado no cookie `access_token` com a flag `httpOnly`.
- A API usa `cookie-parser` e CORS com credenciais.
- O frontend utiliza `withCredentials: true` nas requisições Axios.
- O segredo JWT e a string do banco devem existir somente no ambiente de execução.
- Em produção, configure HTTPS, uma origem CORS explícita e uma política adequada de `secure`/`sameSite` para cookies.

## Testes e qualidade

O backend possui configuração para testes unitários com Jest e testes end-to-end com Supertest. O frontend possui lint configurado com ESLint.

Antes de abrir uma alteração, recomenda-se executar:

```bash
cd api
npm run build
npm run test
npm run test:e2e

cd ../web
npm run lint
npm run build
```

## Migrações versionadas

As migrações atuais ficam em `api/prisma/migrations` e registram a evolução do banco:

1. Criação inicial do schema.
2. Correções do modelo inicial.
3. Inclusão do nome do usuário.
4. Inclusão do saldo da conta.
5. Tornar a categoria da transação opcional.
6. Inclusão de orçamentos.

Não edite uma migração já aplicada em um ambiente compartilhado. Crie uma nova migração para mudanças posteriores.

## Observações do estado atual

- O frontend ainda possui a URL da API fixa em `http://localhost:3001`; para implantação, esse valor deve ser movido para uma variável de ambiente.
- O CORS da API está restrito a `http://localhost:3000`.
- As preferências da tela de configurações são armazenadas localmente no navegador.
- O fluxo de logout ainda não possui um endpoint dedicado; a sessão depende da expiração ou da limpeza do cookie.
- A interface cobre principalmente os fluxos de criação e consulta. Algumas operações de edição e exclusão estão disponíveis na API, mas não necessariamente possuem controles completos na interface.
- A validação de senha do cadastro deve ser mantida alinhada entre frontend e backend.
- O endpoint de atualização de orçamento deve ser revisado caso a categoria também precise ser alterada, pois a implementação atual recebe o orçamento pelo ID e os dados do corpo.

## Estrutura do repositório

```text
finances/
├── api/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── auth/
│   │   ├── categoria/
│   │   ├── conta/
│   │   ├── generated/
│   │   ├── orcamento/
│   │   ├── prisma/
│   │   ├── transacao/
│   │   └── usuario/
│   └── test/
├── web/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── (dashboard)/
│   │   ├── components/
│   │   ├── services/
│   │   ├── store/
│   │   └── types/
│   └── public/
└── README.md
```

## Documentação de referência

- [NestJS](https://docs.nestjs.com/)
- [Next.js](https://nextjs.org/docs)
- [Prisma](https://www.prisma.io/docs)
- [PostgreSQL](https://www.postgresql.org/docs/)
- [Material UI](https://mui.com/material-ui/)
