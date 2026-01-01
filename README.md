![Next.js 16](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Mantine](https://img.shields.io/badge/Mantine-UI-4B4F6D?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-Container-blue?style=for-the-badge&logo=docker)

# AIX Dance — Sistema ERP para Escolas e Estúdios de Dança

Projeto SaaS moderno baseado em Next.js 16 (App Router) e TypeScript, voltado para gestão de escolas e estúdios de dança. O repositório segue uma arquitetura enxuta com Separation of Concerns: UI, regras de negócio e infra estão claramente separadas para facilitar manutenção, testes e evolução.

Sumário rápido
- Framework: Next.js 16 (App Router)
- Linguagem: TypeScript
- UI: Mantine
- Mutations: Server Actions (Server Components)
- Data fetching: Server Components híbridos + SWR (client-side cache)
- Validação: Zod
- Infra: Docker (opcional)

Principais características
- Arquitetura refatorada com foco em SoC (Separation of Concerns).
- Server Actions para mutações (POST/PUT/DELETE) com validação Zod e wrappers de ação para tratamento de erros.
- `src/services` contém a lógica de domínio e contratos de API — UI não possui lógica de negócio.
- `serverFetch` centralizado para chamadas HTTP e uniformização de headers, timeouts e tratamento de erros.

Requisitos
- Node.js >= 20
- pnpm (recomendado)

Instalação (rápido)
1. Clone o repositório:

	 git clone <repo-url>
	 cd aix-dance

2. Instale dependências (pnpm):

	 pnpm install

3. Copie o arquivo de variáveis de ambiente de exemplo (não adicione chaves sensíveis ao README):

	 cp .env.example .env.local

	 (No Windows PowerShell você pode usar `Copy-Item .env.example .env.local`)

4. Rodar em modo desenvolvimento:

	 pnpm dev

Variáveis de ambiente
Por segurança, não incluir chaves sensíveis neste arquivo. Copie o `.env.example` para `.env.local` e preencha as chaves necessárias no seu ambiente local. Exemplos de variáveis podem incluir URLs de backend e credenciais de serviços opcionais (S3, etc.).

Arquitetura (guia para novos devs)

Estrutura principal (pasta `src/`)

- `src/actions/` — Server Actions
	- Implementa Server Actions responsáveis por receber dados da UI, validar com Zod e orquestrar chamadas aos serviços.
	- Só deve conter lógica de orquestração e validação; não contenha regras de negócio complexas.

- `src/services/` — Camada de Domínio
	- Contém regras de negócio, transformações, contratos para a API externa e adaptação de respostas.
	- Serviços são testáveis e independentes da camada de apresentação.

- `src/lib/` — Infraestrutura e utilitários de runtime
	- Ex.: `serverFetch` (cliente HTTP central), auth-guards, helpers de sessão e wrappers para Actions (tratamento de erros, retries, logging).

- `src/components/` — Componentes React (Server/Client)
	- Componentes puros de UI; preferir componentes stateless e delegar comportamento para hooks e actions.

- `src/schemas/` — Schemas Zod e tipos compartilhados
	- Todos os schemas usados para validação em `actions` e para validação de payloads vindos do backend.

- Outras pastas relevantes:
	- `src/hooks/` — hooks reutilizáveis (ex.: `useCrud`, integração SWR)
	- `src/utils/` — utilitários genéricos
	- `src/services/*.service.ts` — cada serviço encapsula contrato e regras relacionadas ao domínio específico

Padrões e convenções
- Mutações devem ser implementadas via Server Actions em `src/actions/`.
- Regras de negócio e integração com APIs externas ficam em `src/services/`.
- Validação com Zod é obrigatória em pontos de entrada (Server Actions) e usada como contrato entre camadas.
- Use `serverFetch` para chamadas externas (centraliza headers, retry e parsing de erros).

Data fetching
- Estratégia híbrida: Server Components para renderização inicial (onde aplicável) e SWR no cliente para cache, revalidação e interatividade.

Docker e deploy
- O repositório inclui `Dockerfile` e `docker-compose.yml` para facilitar deploy local e CI/CD.
- Build de produção (exemplo):

	docker build -t aix-dance .

	# ou com compose
	docker compose up --build

Boas práticas para contribuidores
- Não comitar segredos ou `.env.local`.
- Mantenha `services` testáveis; extraia lógica complexa para funções puras.
- Escreva schemas Zod para qualquer payload que entrar no sistema.

Contato e contribuição
- Abra issues para bugs e features.
- Envie PRs com descrição clara e referências à issue correspondente.

Licença
- (Adicionar informação de licença aqui, se aplicável)
