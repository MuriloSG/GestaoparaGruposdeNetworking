# Gestão para Grupos de Networking
Plataforma de gestão para grupos de networking, focada em digitalizar e otimizar o controle de membros e suas interações. Substitui planilhas e registros manuais por um sistema centralizado, eficiente e escalável, permitindo maior organização e acompanhamento das atividades do grupo.

## Diagrama da arquitetura(Cliente - Servidor):
![Diagrama da arquitetura](public/images/diagramaSimplesSistema.drawio.png)

## Modelo de dados

### Justificativa da escolha do banco de dados

A escolha do PostgreSQL foi feita por ser um banco de dados relacional, robusto e confiável, com excelente suporte a consultas complexas, integridade de dados e transações seguras. Ele é altamente escalável, flexível e compatível com diversos ORMs, o que facilita o desenvolvimento e manutenção da aplicação. Além disso, possui uma grande comunidade e documentação sólida, garantindo suporte e evolução constante.

### Modelagem (diagrama)

Abaixo está a representação da modelagem de dados proposta.


### Tabelas:

As tabelas abaixo descrevem a modelagem inicial do banco de dados. Os tipos seguem as regras do PostgreSQL.


#### Tabela: users

| Campo         | Tipo                                | Descrição |
|---------------|-------------------------------------|-----------|
| id            | SERIAL PRIMARY KEY                  | Identificador único do usuário |
| full_name     | VARCHAR(255) NOT NULL               | Nome completo do usuário |
| email         | VARCHAR(255) NOT NULL UNIQUE        | E-mail/login do usuário (armazenar em minúsculas) |
| password_hash | VARCHAR(255) NOT NULL               | Hash da senha (recomenda-se bcrypt ou argon2) |
| is_admin      | BOOLEAN NOT NULL DEFAULT FALSE      | Indica se o usuário é administrador |
| is_member     | BOOLEAN NOT NULL DEFAULT FALSE      | Indica se a associação do usuário foi aprovada |
| created_at    | TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now() | Data/hora de registro do usuário |

Observações:

Finalidade: Tabela central do sistema para autenticação e controle de acesso

Funcionalidade: Armazena credenciais e permissões de todos os usuários do sistema

Relacionamentos: Base para todas as outras entidades do sistema

#### Tabela: membership_requests

| Campo         | Tipo                                | Descrição |
|---------------|-------------------------------------|-----------|
| id            | SERIAL PRIMARY KEY                  | Identificador único da solicitação |
| user_id       | INTEGER NOT NULL REFERENCES users(id)| Referência ao usuário solicitante |
| reason        | TEXT NOT NULL                       | Motivo/interesse em participar do grupo |
| status        | VARCHAR(20) NOT NULL DEFAULT 'pending' | Status da solicitação (pending/approved/rejected) |
| reviewed_by   | INTEGER REFERENCES users(id)        | Administrador que revisou a solicitação |
| reviewed_at   | TIMESTAMP WITH TIME ZONE            | Data/hora da revisão |
| created_at    | TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now() | Data/hora da solicitação |

Observações:
- Finalidade: Gerenciar solicitações de participação no grupo
- Funcionalidade: Registra e controla o processo de aprovação de novos membros
- Relacionamentos: Vinculada à tabela users

#### Tabela: member_profiles

| Campo         | Tipo                                | Descrição |
|---------------|-------------------------------------|-----------|
| id            | SERIAL PRIMARY KEY                  | Identificador único do perfil |
| user_id       | INTEGER NOT NULL REFERENCES users(id)| Referência ao usuário membro |
| company       | VARCHAR(255)                        | Empresa atual |
| position      | VARCHAR(255)                        | Cargo atual |
| bio           | TEXT                                | Biografia/descrição profissional |
| phone         | VARCHAR(20)                         | Telefone de contato |
| linkedin_url  | VARCHAR(255)                        | URL do perfil do LinkedIn |
| created_at    | TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now() | Data de criação do perfil |
| updated_at    | TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now() | Data da última atualização |

Observações:
- Finalidade: Armazenar informações detalhadas dos membros aprovados
- Funcionalidade: Mantém dados complementares dos membros ativos
- Relacionamentos: Vinculada à tabela users, um para um

#### Tabela: announcements

| Campo         | Tipo                                | Descrição |
|---------------|-------------------------------------|-----------|
| id            | SERIAL PRIMARY KEY                  | Identificador único do comunicado |
| title         | VARCHAR(255) NOT NULL               | Título do comunicado |
| content       | TEXT NOT NULL                       | Conteúdo do comunicado |
| author_id     | INTEGER NOT NULL REFERENCES users(id)| Administrador que criou o comunicado |
| priority      | VARCHAR(20) NOT NULL DEFAULT 'normal'| Prioridade do comunicado (low/normal/high) |
| published_at  | TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now() | Data/hora de publicação |
| expires_at    | TIMESTAMP WITH TIME ZONE            | Data/hora de expiração (opcional) |

Observações:
- Finalidade: Gerenciar comunicados e avisos do grupo
- Funcionalidade: Permite a divulgação de informações importantes
- Relacionamentos: Vinculada à tabela users (autor)

#### Tabela: meetings

| Campo         | Tipo                                | Descrição |
|---------------|-------------------------------------|-----------|
| id            | SERIAL PRIMARY KEY                  | Identificador único da reunião |
| title         | VARCHAR(255) NOT NULL               | Título/tema da reunião |
| description   | TEXT                                | Descrição ou pauta da reunião |
| date          | DATE NOT NULL                       | Data da reunião |
| start_time    | TIMESTAMP WITH TIME ZONE NOT NULL   | Data/hora de início |
| end_time      | TIMESTAMP WITH TIME ZONE NOT NULL   | Data/hora de término |
| location      | VARCHAR(255) NOT NULL               | Local da reunião (físico ou virtual) |
| created_by    | INTEGER NOT NULL REFERENCES users(id)| Administrador que criou a reunião |
| created_at    | TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now() | Data/hora de criação |
| status        | VARCHAR(20) NOT NULL DEFAULT 'scheduled' | Status da reunião (scheduled/in_progress/completed/canceled) |

Observações:
- Finalidade: Registrar informações sobre as reuniões do grupo
- Funcionalidade: Gerencia o agendamento e status das reuniões
- Relacionamentos: Vinculada à tabela users e meeting_attendances

#### Tabela: meeting_attendances

| Campo         | Tipo                                | Descrição |
|---------------|-------------------------------------|-----------|
| id            | SERIAL PRIMARY KEY                  | Identificador único do registro de presença |
| meeting_id    | INTEGER NOT NULL REFERENCES meetings(id) | Referência à reunião |
| user_id       | INTEGER NOT NULL REFERENCES users(id)| Membro presente na reunião |
| check_in_time | TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now() | Horário do check-in |
| check_in_type | VARCHAR(20) NOT NULL DEFAULT 'presential' | Tipo de presença (presential/remote) |
| notes         | TEXT                                | Observações sobre a participação (opcional) |

Observações:
- Finalidade: Controlar presenças nas reuniões
- Funcionalidade: Registra check-in dos membros em cada reunião
- Relacionamentos: Vinculada às tabelas meetings e users

#### Tabela: business_referrals

| Campo         | Tipo                                | Descrição |
|---------------|-------------------------------------|-----------|
| id            | SERIAL PRIMARY KEY                  | Identificador único da indicação |
| referrer_id   | INTEGER NOT NULL REFERENCES users(id)| Membro que fez a indicação |
| receiver_id   | INTEGER NOT NULL REFERENCES users(id)| Membro que recebeu a indicação |
| client_name   | VARCHAR(255) NOT NULL               | Nome do cliente/empresa indicado |
| description   | TEXT NOT NULL                       | Descrição da oportunidade de negócio |
| potential_value| DECIMAL(12,2)                      | Valor potencial do negócio |
| status        | VARCHAR(20) NOT NULL DEFAULT 'new'  | Status da indicação (new/contacted/in_progress/closed_won/closed_lost) |
| feedback      | TEXT                                | Feedback sobre o andamento/resultado |
| created_at    | TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now() | Data/hora do registro |
| updated_at    | TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now() | Data da última atualização |
| closed_at     | TIMESTAMP WITH TIME ZONE            | Data de fechamento (ganho ou perdido) |

Observações:
- Finalidade: Gerenciar indicações de negócios entre membros
- Funcionalidade: Controla todo o ciclo de vida das indicações
- Relacionamentos: Vinculada à tabela users (referrer e receiver)

#### Tabela: business_thanks

| Campo         | Tipo                                | Descrição |
|---------------|-------------------------------------|-----------|
| id            | SERIAL PRIMARY KEY                  | Identificador único do agradecimento |
| referral_id   | INTEGER NOT NULL REFERENCES business_referrals(id) | Referência à indicação |
| from_user_id  | INTEGER NOT NULL REFERENCES users(id)| Membro que está agradecendo |
| to_user_id    | INTEGER NOT NULL REFERENCES users(id)| Membro que está recebendo o agradecimento |
| message       | TEXT NOT NULL                       | Mensagem de agradecimento |
| deal_value    | DECIMAL(12,2)                       | Valor do negócio fechado |
| is_public     | BOOLEAN NOT NULL DEFAULT true       | Indica se o agradecimento é público |
| created_at    | TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now() | Data/hora do registro |

Observações:
- Finalidade: Registrar agradecimentos por negócios fechados
- Funcionalidade: Permite reconhecimento público das indicações bem-sucedidas
- Relacionamentos: Vinculada às tabelas business_referrals e users

#### Tabela: one_on_one_meetings

| Campo         | Tipo                                | Descrição |
|---------------|-------------------------------------|-----------|
| id            | SERIAL PRIMARY KEY                  | Identificador único da reunião 1:1 |
| member_a_id   | INTEGER NOT NULL REFERENCES users(id)| Primeiro membro da reunião |
| member_b_id   | INTEGER NOT NULL REFERENCES users(id)| Segundo membro da reunião |
| date          | DATE NOT NULL                       | Data da reunião |
| start_time    | TIMESTAMP WITH TIME ZONE NOT NULL   | Data/hora de início |
| end_time      | TIMESTAMP WITH TIME ZONE NOT NULL   | Data/hora de término |
| location      | VARCHAR(255) NOT NULL               | Local da reunião (físico ou virtual) |
| status        | VARCHAR(20) NOT NULL DEFAULT 'scheduled' | Status (scheduled/completed/canceled) |
| notes         | TEXT                                | Anotações sobre a reunião |
| outcomes      | TEXT                                | Resultados e encaminhamentos |
| created_at    | TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now() | Data/hora do agendamento |
| updated_at    | TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now() | Data da última atualização |

Observações:
- Finalidade: Gerenciar reuniões individuais entre membros
- Funcionalidade: Controla agendamento e resultados de encontros 1:1
- Relacionamentos: Vinculada à tabela users (ambos os membros)

#### Tabela: membership_plans

| Campo         | Tipo                                | Descrição |
|---------------|-------------------------------------|-----------|
| id            | SERIAL PRIMARY KEY                  | Identificador único do plano |
| name          | VARCHAR(100) NOT NULL               | Nome do plano |
| description   | TEXT                                | Descrição detalhada do plano |
| amount        | DECIMAL(10,2) NOT NULL              | Valor da mensalidade |
| billing_cycle | VARCHAR(20) NOT NULL DEFAULT 'monthly'| Ciclo de cobrança (monthly/quarterly/yearly) |
| is_active     | BOOLEAN NOT NULL DEFAULT true       | Indica se o plano está ativo |
| created_at    | TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now() | Data/hora de criação |
| updated_at    | TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now() | Data da última atualização |

Observações:
- Finalidade: Definir os planos de mensalidade disponíveis
- Funcionalidade: Gerencia diferentes opções de planos e valores
- Relacionamentos: Base para a tabela membership_payments

#### Tabela: membership_payments

| Campo         | Tipo                                | Descrição |
|---------------|-------------------------------------|-----------|
| id            | SERIAL PRIMARY KEY                  | Identificador único do pagamento |
| user_id       | INTEGER NOT NULL REFERENCES users(id)| Membro responsável pelo pagamento |
| plan_id       | INTEGER NOT NULL REFERENCES membership_plans(id) | Plano associado |
| reference_month| DATE NOT NULL                      | Mês/ano de referência do pagamento |
| amount        | DECIMAL(10,2) NOT NULL              | Valor do pagamento |
| due_date      | DATE NOT NULL                       | Data de vencimento |
| payment_date  | DATE                                | Data efetiva do pagamento |
| status        | VARCHAR(20) NOT NULL DEFAULT 'pending'| Status (pending/paid/overdue/canceled) |
| payment_method| VARCHAR(50)                         | Método de pagamento utilizado |
| invoice_number| VARCHAR(50)                         | Número da fatura/recibo |
| notes         | TEXT                                | Observações sobre o pagamento |
| created_at    | TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now() | Data/hora de criação |
| updated_at    | TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now() | Data da última atualização |

Observações:
- Finalidade: Controlar pagamentos de mensalidades
- Funcionalidade: Gerencia todo o ciclo de cobrança e pagamentos
- Relacionamentos: Vinculada às tabelas users e membership_plans
  
## Estrutura de Componentes (Frontend)

O frontend será desenvolvido em Next.js, aproveitando seu roteamento nativo, renderização híbrida (SSR, SSG e ISR) e recursos modernos como layouts aninhados e Server Components. Isso garante melhor SEO, carregamento rápido e uma experiência de usuário fluida e responsiva.

Adotaremos o padrão de componentização Atomic Design (átomos, moléculas, organismos, templates e páginas) para promover alta reutilização, consistência visual e facilidade de manutenção.

- Átomos: elementos atômicos e sem estado — botões, ícones, inputs, labels, badges. Devem ser puros, pequenos e reusáveis.
- Moléculas: combinações simples de átomos que formam blocos funcionais — um campo de pesquisa com botão, um avatar com nome, um card mínimo.
- Organismos: composições maiores de moléculas e átomos — navbar, card de membro completo, lista de reuniões.
- Templates: layouts que organizam organismos e definem a hierarquia visual — dashboard, página de detalhe de reunião.
- Páginas: nível final que mistura templates, organismos e integração com o roteamento do Next.js (páginas ligadas às rotas).

Convenções e recomendações práticas

- Estrutura de pastas sugerida:

	- `components/atoms/` — botões, inputs, ícones, tipografia
	- `components/molecules/` — SearchBar, MemberCardPreview
	- `components/organisms/` — Navbar, MeetingList, ReferralFeed
	- `components/templates/` — DashboardTemplate, MeetingTemplate
	- `app/` ou `pages/` — rotas (usar `app/` se optar pelo App Router moderno do Next.js)
	- `styles/` — tokens, variáveis, resets (ou `design-system/` para um pacote de design)
	- `lib/` — lógica compartilhada, helpers de fetch, validações
	- `hooks/` — hooks customizados (useAuth, useMeeting, useForm)
	- `services/` — clientes de API
	- `test/` ou `__tests__/` — testes unitários/integração
  
	## Definição da API (Backend)

	O backend será implementado com NestJS, um framework opinativo em TypeScript que facilita modularização, organização e colaboração em equipes. O NestJS fornece injeção de dependência, decorators e uma arquitetura modular; por padrão roda sobre Express, mas pode ser trocado por Fastify.

	Para acesso a dados usaremos o Prisma ORM. O Prisma gera tipos TypeScript a partir do schema, permite escrever queries em código, oferece boa performance (engine em Rust) e facilita a portabilidade entre diferentes bancos de dados, reduzindo inconsistências entre modelo e consultas.

	Arquitetura e responsabilidades (camadas):

	- Modules: agrupam recursos relacionados (ex.: UsersModule, MeetingsModule, PaymentsModule).
	- Controllers: interface HTTP — expõem endpoints, lidam com autenticação/autorização e delegam a lógica aos services.
	- Services: contêm a lógica de negócio e orquestram operações entre repositories e outros serviços.
	- Repositories: encapsulam o Prisma Client e são responsáveis pela persistência e queries; isolam o restante da aplicação do ORM.

	Boas práticas rápidas:

	- DTOs e validação: usar DTOs tipados com pipes de validação (class-validator / class-transformer).
	- Autenticação: implementar  login com autenticação JWT e centralizar regras de acesso.
	- Testes: unitários para services/controllers e E2E com Jest + Supertest; usar mocks para Prisma nas unidades.

	### Endpoints Principais

	Abaixo estão detalhados três endpoints cruciais do sistema, representando as principais funcionalidades:

	#### 1. Autenticação de Usuário
	
	```typescript
	POST /auth/login
	
	Request body:
	{
	  "email": string,
	  "password": string
	}
	
	Response (200 OK):
	{
	  "accessToken": string,
	  "user": {
	    "id": number,
	    "email": string,
	    "fullName": string,
	    "isAdmin": boolean,
	    "isMember": boolean
	  }
	}
	
	Response (401 Unauthorized):
	{
	  "statusCode": 401,
	  "message": "Credenciais inválidas"
	}
	```

	#### 2. Gestão de Membros - Aprovar Solicitação
	
	```typescript
	PATCH /membership-requests/{requestId}/approve
	
	Headers:
	Authorization: Bearer {token}
	
	Request body:
	{
	  "notes": string,
	  "membershipPlanId": number
	}
	
	Response (200 OK):
	{
	  "id": number,
	  "status": "approved",
	  "reviewedAt": string,
	  "reviewedBy": {
	    "id": number,
	    "fullName": string
	  },
	  "user": {
	    "id": number,
	    "fullName": string,
	    "email": string,
	    "isMember": true
	  }
	}
	
	Response (403 Forbidden):
	{
	  "statusCode": 403,
	  "message": "Apenas administradores podem aprovar solicitações"
	}
	```

	#### 3. Agendamento de Reuniões
	
	```typescript
	POST /meetings
	
	Headers:
	Authorization: Bearer {token}
	
	Request body:
	{
	  "title": string,
	  "description": string,
	  "date": string,
	  "startTime": string,
	  "endTime": string,
	  "location": string,
	  "maxAttendees": number
	}
	
	Response (201 Created):
	{
	  "id": number,
	  "title": string,
	  "description": string,
	  "date": string,
	  "startTime": string,
	  "endTime": string,
	  "location": string,
	  "status": "scheduled",
	  "createdBy": {
	    "id": number,
	    "fullName": string
	  },
	  "maxAttendees": number,
	  "currentAttendees": 0,
	  "createdAt": string
	}
	
	Response (400 Bad Request):
	{
	  "statusCode": 400,
	  "message": "Validation error",
	  "errors": [
	    {
	      "field": "startTime",
	      "message": "Horário de início deve ser anterior ao término"
	    }
	  ]
	}
	```



