![Next.js 16](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Mantine](https://img.shields.io/badge/Mantine-UI-4B4F6D?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-Container-blue?style=for-the-badge&logo=docker)

# AIX Dance — SaaS de Gestão para Escolas e Estúdios de Dança

O **AIX Dance** é um SaaS em desenvolvimento ativo voltado para a gestão completa de escolas e estúdios de dança. A plataforma centraliza operações administrativas, financeiras e de relacionamento com alunos em fluxos integrados e automatizados em uma única interface.

O projeto resolve dores críticas do setor, como controle financeiro, gestão de contratos, organização de eventos e acompanhamento pedagógico, oferecendo uma solução moderna, escalável e com foco total em usabilidade.

---

## 🚧 Status do Projeto e Refatoração

O sistema possui uma arquitetura consolidada e está em constante evolução técnica. Atualmente, o foco está em uma **refatoração profunda** para elevar os padrões de engenharia:

*   **Arquitetura Híbrida:** Migração de componentes de negócio para a estrutura `src/modules/`, isolando a lógica de domínio da UI atômica.
*   **Server Actions:** Transição gradual de fluxos para mutações nativas do Next.js, garantindo maior segurança e performance.
*   **Padronização CRUD:** Uso de hooks reutilizáveis (ex: `useCrud`) para uniformizar operações em todos os módulos.
*   **Qualidade de Código:** Melhoria contínua de legibilidade e manutenibilidade baseada em princípios de Clean Code.

---

## 👨‍💻 Meu Papel no Projeto

Como **Desenvolvedor Full-Cycle**, sou responsável por todo o ciclo de vida do produto:
*   Definição da **Arquitetura da Aplicação** e escolha da Stack.
*   Implementação de ponta a ponta (**Front-end e Back-end**).
*   Estabelecimento de **Padrões de Código** e organização modular.
*   Evolução técnica, manutenção e garantia de escalabilidade.

---

## 🏗️ Arquitetura e Padrões de Engenharia

O AIX Dance aplica padrões de desenvolvimento modernos para garantir um sistema robusto e de fácil manutenção.

### Princípios Fundamentais:
*   **SRP (Single Responsibility Principle):** Cada módulo ou componente possui uma única responsabilidade bem definida.
*   **DRY (Don't Repeat Yourself):** Abstrações inteligentes (como o `useCrud`) evitam duplicidade de lógica.
*   **Separation of Concerns (SoC):** Divisão clara entre UI, orquestração de ações, lógica de domínio e infraestrutura.

### Estrutura Híbrida de Componentes:
Para suportar o crescimento do SaaS, adotamos uma separação estratégica na camada de visão:
1.  **`src/components/` (UI Atômica):** Componentes puros e reutilizáveis (Design System local). São "stateless" e independentes de negócio (ex: `DataView`, `Buttons`).
2.  **`src/modules/` (Módulos de Negócio):** Organizados por domínio (ex: `financial`, `academic`). Centralizam componentes que possuem conhecimento das regras e fluxos específicos do sistema.

---

## 📂 Guia de Estrutura (`src/`)

*   **`actions/` — Server Actions:** Orquestração de mutações, recebimento de dados da UI e validação com Zod. Não contém regras de negócio complexas.
*   **`modules/` — Componentes de Negócio:** UI especializada por domínio (ex: `financial/BankForm.tsx`).
*   **`components/` — UI Reutilizável:** Componentes puros que poderiam ser usados em qualquer outro sistema.
*   **`services/` — Camada de Domínio:** Contém regras de negócio, transformações e contratos de API. Independente da UI e altamente testável.
*   **`lib/` — Infraestrutura:** Utilitários de runtime como `serverFetch`, auth-guards e wrappers para Actions.
*   **`schemas/` — Schemas Zod:** Contratos de dados usados para validação em `actions` e payloads de API.
*   **`hooks/`:** Lógica reutilizável (ex: `useCrud`, integração SWR).
*   **`utils/`:** Funções utilitárias genéricas e helpers auxiliares.
*   **`types/`:** Definições de tipos TypeScript globais e interfaces compartilhadas.
*   **`assets/`:** Recursos estáticos como imagens, ícones e estilos globais.

---

## 🛠️ Tech Stack

*   **Framework:** Next.js 16 (App Router)
*   **Linguagem:** TypeScript
*   **UI Library:** Mantine
*   **Mutations:** Server Actions (Server Components)
*   **Data Fetching:** Estratégia híbrida (Server Components + SWR para cache no cliente)
*   **Validação:** Zod
*   **Infra:** Docker & Docker Compose

---

## 🚀 Instalação e Requisitos

### Requisitos:
*   Node.js >= 20
*   pnpm (recomendado)

### Instalação Rápida:
1.  **Clone o repositório:**
    ```bash
    git clone <repo-url>
    cd aix-dance
    ```
2.  **Instale as dependências:**
    ```bash
    pnpm install
    ```
3.  **Configure o ambiente:**
    ```bash
    cp .env.example .env.local
    ```
4.  **Inicie o desenvolvimento:**
    ```bash
    pnpm dev
    ```

---

## 🤝 Boas Práticas e Contribuição

*   **Segurança:** Nunca comite segredos ou arquivos `.env.local`.
*   **Qualidade:** Mantenha os `services` testáveis e extraia lógica complexa para funções puras.
*   **Contratos:** Escreva schemas Zod para qualquer payload que entre no sistema.
*   **Fluxo:** Abra issues para bugs/features e envie PRs com descrições claras.

---

## 📄 Licença

Copyright (c) 2026 Julio Cesar Sulato Filho.
*Permissão concedida apenas para visualização e fins educacionais/avaliação técnica. Reprodução ou exploração comercial são proibidas sem autorização prévia.*
