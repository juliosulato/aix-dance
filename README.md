# AIX Dance — Sistema ERP
## Projeto web de um sistema ERP de gestão de escolas/estúdios de dança.

**Visão geral**
- Aplicação Next.js (app router) com TypeScript, Prisma, integração S3 e UI baseada em Mantine.
- Estrutura modular com rotas de autenticação, contratos, financeiro, inventário e painel administrativo.

**Destaques**
- UI responsiva com componentes reutilizáveis.
- Upload/armazenamento em S3 e presigned URLs.
- Validações com Zod e formulários com react-hook-form.
- ORM com Prisma para acesso ao banco de dados.

**Tecnologias principais**
- Runtime: Node.js (recomendado >= 18)
- Framework: Next.js 16 (app router)
- Linguagem: TypeScript
- ORM: Prisma
- UI: Mantine
- State/data fetching: SWR
- Validação: Zod

**Requisitos**
- Node.js >= 18
- pnpm / npm / yarn (uso recomendado: pnpm)
- Um banco de dados compatível com Prisma (Postgres, MySQL, etc.)
- Conta S3 (opcional para upload de ativos)

## Começando (rápido)

1. Clone o repositório:

```bash
git clone <repo-url>
cd aix-dance
```

2. Instale dependências:

```bash
pnpm install
# ou
npm install
```

3. Crie o arquivo de variáveis de ambiente (`.env`): veja a seção "Variáveis de ambiente" abaixo.

4. Rodar em modo desenvolvimento:

```bash
pnpm dev
# ou
npm run dev
```

O servidor ficará disponível em http://localhost:3000 por padrão.

## Scripts úteis

- **Desenvolvimento:** `pnpm dev` ou `npm run dev`
- **Build (produção):** `pnpm build` ou `npm run build`
- **Start (produção):** `pnpm start` ou `npm run start`
- **Lint:** `pnpm lint` ou `npm run lint`

Esses scripts são os definidos em `package.json`.

## Variáveis de ambiente (exemplo)

Crie um `.env` ou `.env.local` com as chaves abaixo (ajuste conforme infra):

- `DATABASE_URL` — string de conexão do Prisma
- `NEXT_PUBLIC_S3_BUCKET` — nome do bucket S3 (se aplicável)
- `AWS_ACCESS_KEY_ID` e `AWS_SECRET_ACCESS_KEY` — credenciais S3
- `NEXTAUTH_URL` — URL pública da aplicação
- `NEXTAUTH_SECRET` — segredo para NextAuth (ou equivalente)
- `NODE_ENV` — `development` | `production`

Observação: mantenha segredos fora do controle de versão.

## Arquitetura / Organização

- `app/` — rotas e layouts do Next.js (app router)
- `src/components/` — componentes reutilizáveis (UI)
- `src/lib/` — utilitários e integrações (auth, clients)
- `src/hooks/` — hooks personalizados
- `src/schemas/` — validações Zod
- `src/types/` — tipos TypeScript compartilhados
- `prisma/` — esquemas e migrations do Prisma (se presentes)

Essa estrutura prioriza modularidade e separação por domínio.

## Banco de dados & Prisma

- Configure `DATABASE_URL` e execute:

```bash
pnpm prisma generate
pnpm prisma migrate dev --name init
```

Ajuste migrations conforme necessário no fluxo de desenvolvimento.

## Deploy / Docker

O repositório inclui um `Dockerfile`. Um exemplo breve de build/run:

```bash
docker build -t aix-dance:latest .
docker run -e DATABASE_URL="..." -e NEXTAUTH_SECRET="..." -p 3000:3000 aix-dance:latest
```

Para plataformas como Vercel/Cloud Run/EC2, ajuste as variáveis de ambiente e o processo de build.

## Qualidade de código

- ESLint está configurado (`npm run lint`).
- Formatação (opcional): configure Prettier se desejar.

## Segurança e operação

- Nunca comite arquivos `.env` ou segredos.
- Revise permissões S3 e políticas IAM para uploads.
- Use variáveis de ambiente para chaves e segredos.

## Contribuição

1. Fork e branch com nome claro (`feat/<descrição>`, `fix/<descrição>`).
2. Abra PR com descrição das mudanças e screenshots quando aplicável.
3. Execute `pnpm lint` antes de submeter.

## Licença

Defina a licença do projeto (ex.: MIT) adicionando um arquivo `LICENSE`.

## Contato

Para dúvidas ou suporte interno, abra issue no repositório ou contate os mantenedores do projeto.