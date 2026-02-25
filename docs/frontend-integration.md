# Ndima API — Documentação de Integração Frontend

## Índice

1. [Visão Geral do Fluxo](#1-visão-geral-do-fluxo)
2. [Autenticação](#2-autenticação)
   - [Cadastro](#21-cadastro)
   - [Verificação OTP](#22-verificação-otp)
   - [Login](#23-login)
   - [Perfil do utilizador](#24-perfil-do-utilizador)
3. [Onboarding](#3-onboarding)
   - [Como usar o token](#31-como-usar-o-token)
   - [Verificar estado do onboarding](#32-verificar-estado-do-onboarding)
   - [Fase 1 — Dados da fazenda](#33-fase-1--dados-da-fazenda)
   - [Fase 2 — Produtos cultivados](#34-fase-2--produtos-cultivados)
   - [Fase 3 — Objectivos](#35-fase-3--objectivos)
4. [Dashboard](#4-dashboard)
   - [KPIs](#41-kpis)
   - [Histórico de saúde](#42-histórico-de-saúde)
   - [Registar snapshot de saúde](#43-registar-snapshot-de-saúde)
5. [Notificações](#5-notificações)
   - [Listar notificações](#51-listar-notificações)
   - [Contagem de não lidas](#52-contagem-de-não-lidas)
   - [Marcar uma como lida](#53-marcar-uma-como-lida)
   - [Marcar todas como lidas](#54-marcar-todas-como-lidas)
6. [Tarefas / Operações](#6-tarefas--operações)
   - [Criar tarefa](#61-criar-tarefa)
   - [Listar tarefas](#62-listar-tarefas)
   - [Obter tarefa por ID](#63-obter-tarefa-por-id)
   - [Actualizar tarefa](#64-actualizar-tarefa)
   - [Eliminar tarefa](#65-eliminar-tarefa)
7. [Lógica de Navegação no Frontend](#7-lógica-de-navegação-no-frontend)
8. [Tratamento de Erros](#8-tratamento-de-erros)
9. [Referência Rápida](#9-referência-rápida)

---

## 1. Visão Geral do Fluxo

```
┌─────────────┐     ┌──────────────┐     ┌───────────┐
│  CADASTRO   │────▶│  VERIFY OTP  │────▶│   LOGIN   │
│POST/register│     │POST/verify-  │     │POST/login │
│             │     │otp           │     │           │
└─────────────┘     └──────────────┘     └─────┬─────┘
                                               │
                                     Retorna JWT token
                                               │
                              ┌────────────────▼────────────────┐
                              │     VERIFICAR ONBOARDING         │
                              │  GET /onboarding/status          │
                              │  onboardingCompleted === true?   │
                              └────────────┬────────┬────────────┘
                                           │        │
                                          NÃO      SIM
                                           │        │
                                           ▼        ▼
                                      ONBOARDING   HOME
                                      (3 fases)
```

**Regra principal:**
Após o login, o frontend deve verificar o campo `onboardingCompleted` da resposta:
- `false` → mostrar o ecrã de onboarding no passo correcto (`onboardingStep`)
- `true` → ir directamente para a home

---

## 2. Autenticação

> Base URL: `http://<servidor>/`

### 2.1 Cadastro

**`POST /auth/register`**

Cria uma nova conta. O sistema envia um código OTP para o número de telefone.

> ⚠️ Com `BILLING=0` (ambiente de teste) o OTP é sempre **123456** e nenhum SMS é enviado.

#### Request body

```json
{
  "firstName": "João",
  "lastName": "Silva",
  "phone": "923456789",
  "password": "minhaPass123"
}
```

| Campo | Tipo | Regras |
|---|---|---|
| `firstName` | string | Obrigatório |
| `lastName` | string | Obrigatório |
| `phone` | string | 9 dígitos começando com 9. Aceita com ou sem `+244` |
| `password` | string | Mínimo 6 caracteres |

> O número é normalizado automaticamente: `923456789` → `+244923456789`

#### Response `201`

```json
{
  "message": "Cadastro iniciado. [MODO TESTE] Use o código 123456 para verificar.",
  "phone": "+244923456789"
}
```

| Campo | Descrição |
|---|---|
| `message` | Mensagem informativa. Em produção indica que o SMS foi enviado |
| `phone` | Número normalizado que deve ser usado nos passos seguintes |

#### Erros

| Status | Motivo |
|---|---|
| `400` | Campos inválidos (phone com formato errado, password curta, etc.) |
| `409` | Número de telefone já registado |

---

### 2.2 Verificação OTP

**`POST /auth/verify-otp`**

Confirma o número de telefone com o código recebido por SMS.

#### Request body

```json
{
  "phone": "+244923456789",
  "otp": "123456"
}
```

| Campo | Tipo | Regras |
|---|---|---|
| `phone` | string | Número retornado pelo cadastro |
| `otp` | string | Exactamente 6 dígitos |

#### Response `200`

```json
{
  "message": "Telefone verificado com sucesso! Cadastro concluído."
}
```

#### Erros

| Status | Motivo |
|---|---|
| `400` | Código OTP inválido ou formato errado |
| `404` | Utilizador não encontrado |

---

### 2.3 Login

**`POST /auth/login`**

Autentica o utilizador e retorna o token JWT + informação sobre o onboarding.

> O número de telefone tem de estar verificado (OTP) antes do login ser permitido.

#### Request body

```json
{
  "phone": "+244923456789",
  "password": "minhaPass123"
}
```

#### Response `200`

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65f1a2b3c4d5e6f7a8b9c0d1",
    "firstName": "João",
    "lastName": "Silva",
    "phone": "+244923456789",
    "onboardingStep": 0,
    "onboardingCompleted": false
  }
}
```

| Campo | Tipo | Descrição |
|---|---|---|
| `accessToken` | string | Token JWT — guardar em storage seguro |
| `user.id` | string | ID único do utilizador na base de dados |
| `user.onboardingStep` | number | Passo actual: `0`, `1`, `2` ou `3` |
| `user.onboardingCompleted` | boolean | `true` quando `onboardingStep === 3` |

> **Ação esperada do frontend:**
> - Guardar `accessToken` (ex: AsyncStorage, SecureStore)
> - Se `onboardingCompleted === false` → navegar para o ecrã de onboarding
> - Se `onboardingCompleted === true` → navegar directamente para a home

#### Erros

| Status | Motivo |
|---|---|
| `401` | Credenciais inválidas ou OTP ainda não verificado |

---

### 2.4 Perfil do utilizador

**`GET /auth/me`** *(requer JWT)*

Retorna o perfil completo do utilizador autenticado, incluindo dados da fazenda e resultados do solo.

#### Response `200`

```json
{
  "id": "65f1a2b3c4d5e6f7a8b9c0d1",
  "firstName": "João",
  "lastName": "Silva",
  "phone": "+244923456789",
  "onboardingStep": 3,
  "onboardingCompleted": true,
  "farm": {
    "name": "Fazenda Esperança",
    "province": "Huíla",
    "cultivableArea": 25.5,
    "location": { "lat": -14.9205, "lon": 13.5477 },
    "soilQuality": {
      "ph": 5.7,
      "soc": 14.3,
      "nitrogen": 1.05,
      "clay": 22.4,
      "qualityScore": 81,
      "qualityLabel": "Muito Bom",
      "fetchedAt": "2026-02-25T08:00:00.000Z"
    }
  },
  "products": ["Milho", "Feijão"],
  "objectives": ["Aumentar produção", "Reduzir desperdício"]
}
```

> `password` e `otp` nunca são incluídos na resposta.

#### Erros

| Status | Motivo |
|---|---|
| `401` | Token ausente ou inválido |
| `404` | Utilizador não encontrado |

---

## 3. Onboarding

Todas as rotas de onboarding requerem o token JWT no header.

### 3.1 Como usar o token

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Exemplo em JavaScript/TypeScript:

```typescript
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${accessToken}`,
};
```

---

### 3.2 Verificar estado do onboarding

**`GET /onboarding/status`** *(requer JWT)*

Útil para retomar o onboarding após o utilizador fechar e reabrir a app.

#### Response `200`

```json
{
  "onboardingStep": 1,
  "onboardingCompleted": false,
  "farm": {
    "name": "Fazenda Esperança",
    "province": "Huíla",
    "cultivableArea": 25.5
  },
  "products": [],
  "objectives": []
}
```

| `onboardingStep` | Significado | Próximo ecrã |
|---|---|---|
| `0` | Nenhuma fase concluída | Fase 1 |
| `1` | Fazenda registada | Fase 2 |
| `2` | Produtos registados | Fase 3 |
| `3` | Concluído | Home |

---

### 3.3 Fase 1 — Dados da fazenda

**`POST /onboarding/phase-1`** *(requer JWT)*

#### Request body

```json
{
  "farmName": "Fazenda Esperança",
  "province": "Huíla",
  "cultivableArea": 25.5
}
```

| Campo | Tipo | Regras |
|---|---|---|
| `farmName` | string | Obrigatório |
| `province` | string | Deve ser uma das 18 províncias de Angola (ver lista abaixo) |
| `cultivableArea` | number | Maior que zero, em hectares |

**Províncias válidas:**
```
Bengo, Benguela, Bié, Cabinda, Cuando Cubango, Cuanza Norte, Cuanza Sul,
Cunene, Huambo, Huíla, Luanda, Lunda Norte, Lunda Sul, Malanje,
Moxico, Namibe, Uíge, Zaire
```

#### Response `200`

```json
{
  "message": "Fase 1 concluída! Dados da fazenda guardados.",
  "onboardingStep": 1,
  "nextStep": "Indique os produtos que cultiva na sua fazenda."
}
```

| Campo | Descrição |
|---|---|
| `onboardingStep` | Agora é `1` — guardar no estado local |
| `nextStep` | Mensagem sugerida para mostrar ao utilizador |

#### Erros

| Status | Motivo |
|---|---|
| `400` | Fase já concluída, província inválida ou dados em falta |
| `401` | Token ausente ou inválido |

---

### 3.4 Fase 2 — Produtos cultivados

**`POST /onboarding/phase-2`** *(requer JWT)*

> Requer fase 1 concluída (`onboardingStep >= 1`)

#### Request body

```json
{
  "products": ["Milho", "Feijão", "Mandioca", "Batata-doce"]
}
```

| Campo | Tipo | Regras |
|---|---|---|
| `products` | string[] | Mínimo 1 produto, máximo 20 |

#### Response `200`

```json
{
  "message": "Fase 2 concluída! Produtos cultivados guardados.",
  "onboardingStep": 2,
  "nextStep": "Indique os objectivos que pretende alcançar com a sua fazenda."
}
```

#### Erros

| Status | Motivo |
|---|---|
| `400` | Fase 1 não concluída, fase já concluída ou lista vazia |
| `401` | Token ausente ou inválido |

---

### 3.5 Fase 3 — Objectivos (conclui o onboarding)

**`POST /onboarding/phase-3`** *(requer JWT)*

> Requer fases 1 e 2 concluídas (`onboardingStep >= 2`)

#### Request body

```json
{
  "objectives": [
    "Aumentar a produção de milho em 30%",
    "Expandir área cultivada",
    "Reduzir desperdício de água"
  ]
}
```

| Campo | Tipo | Regras |
|---|---|---|
| `objectives` | string[] | Mínimo 1 objectivo, máximo 10 |

#### Response `200`

```json
{
  "message": "Onboarding concluído com sucesso! Bem-vindo ao Ndima.",
  "onboardingStep": 3,
  "onboardingCompleted": true
}
```

> **Ação esperada do frontend:**
> Ao receber `onboardingCompleted: true` navegar para a home e nunca mais mostrar o ecrã de onboarding para este utilizador.

#### Erros

| Status | Motivo |
|---|---|
| `400` | Fases anteriores não concluídas ou onboarding já completo |
| `401` | Token ausente ou inválido |

---

## 4. Dashboard

Todas as rotas do dashboard requerem o token JWT no header.

### 4.1 KPIs

**`GET /dashboard/stats`** *(requer JWT)*

Retorna os 4 indicadores dos cards do Dashboard. Todos os valores são calculados em tempo real a partir da base de dados.

#### Response `200`

```json
{
  "operacoesHoje": 3,
  "tarefasPendentes": {
    "total": 8,
    "emAtraso": 2
  },
  "saudeFazenda": {
    "percentual": 78,
    "variacaoMensal": 4
  }
}
```

| Campo | Tipo | Descrição |
|---|---|---|
| `operacoesHoje` | number | Tarefas agendadas para hoje com status `PENDENTE` ou `EM_PROGRESSO` |
| `tarefasPendentes.total` | number | Total de tarefas com status `PENDENTE` ou `EM_PROGRESSO` |
| `tarefasPendentes.emAtraso` | number | Tarefas cuja `dataPrevista` já passou e ainda não foram concluídas |
| `saudeFazenda.percentual` | number | Índice 0-100 (último snapshot mensal, ou score do solo, ou 50 como padrão) |
| `saudeFazenda.variacaoMensal` | number | Diferença face ao mês anterior (positivo = melhoria, negativo = queda, 0 = sem dados históricos) |

---

### 4.2 Histórico de saúde

**`GET /dashboard/farm-health-history`** *(requer JWT)*

Série temporal mensal para o gráfico sparkline. Retorna os meses já transcorridos no ano actual.

#### Response `200`

```json
{
  "period": "2026",
  "data": [
    { "month": "Jan", "value": 65 },
    { "month": "Fev", "value": 70 }
  ]
}
```

| Campo | Descrição |
|---|---|
| `period` | Ano a que os dados se referem |
| `data` | Array com no máximo 12 entradas (meses de Jan ao mês actual) |
| `data[].month` | Nome abreviado em português: `Jan`, `Fev`, `Mar`, ..., `Dez` |
| `data[].value` | Índice de saúde 0-100 para esse mês |

> Se não houver snapshots reais gravados, o sistema usa interpolação baseada no score do solo do onboarding.

---

### 4.3 Registar snapshot de saúde

**`POST /dashboard/farm-health-snapshot`** *(requer JWT)*

Grava manualmente o índice de saúde actual da fazenda para o mês corrente. Se já existe um registo para o mês/ano actual, actualiza-o (upsert).

> Este endpoint é também chamado **automaticamente** pelo sistema após o onboarding fase 1, quando o SoilGrids devolve o score do solo.

#### Request body

```json
{
  "value": 78
}
```

| Campo | Tipo | Regras |
|---|---|---|
| `value` | number | Obrigatório, entre 0 e 100 |

#### Response `201`

```json
{
  "userId": "65f1a2b3c4d5e6f7a8b9c0d1",
  "year": 2026,
  "month": 2,
  "value": 78
}
```

---

## 5. Notificações

Todas as rotas de notificações requerem o token JWT no header.

### 5.1 Listar notificações

**`GET /notifications`** *(requer JWT)*

Retorna todas as notificações do utilizador, ordenadas da mais recente para a mais antiga.

#### Response `200`

```json
[
  {
    "_id": "65f1a2b3c4d5e6f7a8b9c0d2",
    "userId": "65f1a2b3c4d5e6f7a8b9c0d1",
    "type": "SYSTEM",
    "title": "Bem-vindo ao NDIMA!",
    "description": "A sua fazenda foi registada com sucesso.",
    "severity": "success",
    "read": false,
    "createdAt": "2026-02-25T08:00:00.000Z"
  }
]
```

| Campo `type` | Significado |
|---|---|
| `SYSTEM` | Mensagem do sistema (boas-vindas, onboarding, etc.) |
| `STOCK_ALERT` | Alerta de stock |
| `WATER_ALERT` | Alerta de rega/água |
| `TASK_OVERDUE` | Tarefa em atraso |
| `AGRO_TIP` | Dica agronómica |

| Campo `severity` | Cor sugerida |
|---|---|
| `info` | Azul |
| `warning` | Laranja |
| `error` | Vermelho |
| `success` | Verde |

---

### 5.2 Contagem de não lidas

**`GET /notifications/unread-count`** *(requer JWT)*

Retorna o número de notificações não lidas — usar para o badge do ícone de sino.

#### Response `200`

```json
{ "unread": 3 }
```

---

### 5.3 Marcar uma como lida

**`PATCH /notifications/:id/read`** *(requer JWT)*

Marca uma notificação específica como `read: true`.

#### Parâmetro

| Param | Descrição |
|---|---|
| `:id` | ID da notificação (MongoDB ObjectId) |

#### Response `200`

```json
{ "message": "Notificação marcada como lida." }
```

#### Erros

| Status | Motivo |
|---|---|
| `404` | Notificação não encontrada |
| `403` | A notificação não pertence ao utilizador |

---

### 5.4 Marcar todas como lidas

**`PATCH /notifications/read-all`** *(requer JWT)*

Marca todas as notificações do utilizador como lidas de uma só vez.

#### Response `200`

```json
{
  "message": "Todas as notificações marcadas como lidas.",
  "updated": 4
}
```

---

## 6. Tarefas / Operações

Todas as rotas de tarefas requerem o token JWT no header.

**Tipos disponíveis** (`type`): `OPERACAO` | `TAREFA` | `IRRIGACAO` | `COLHEITA` | `ADUBAGEM` | `OUTRO`

**Estados disponíveis** (`status`): `PENDENTE` | `EM_PROGRESSO` | `CONCLUIDA` | `CANCELADA`

### 6.1 Criar tarefa

**`POST /tasks`** *(requer JWT)*

#### Request body

```json
{
  "title": "Irrigar bloco norte",
  "description": "Usar sistema de gotejamento por 2h",
  "type": "IRRIGACAO",
  "dataPrevista": "2026-03-15T00:00:00.000Z"
}
```

| Campo | Tipo | Regras |
|---|---|---|
| `title` | string | Obrigatório |
| `description` | string | Opcional |
| `type` | string | Opcional, padrão `TAREFA` |
| `dataPrevista` | string (ISO 8601) | Obrigatório |

#### Response `201`

```json
{
  "_id": "65f1a2b3c4d5e6f7a8b9c0d1",
  "userId": "65f1a2b3c4d5e6f7a8b9c0d0",
  "title": "Irrigar bloco norte",
  "description": "Usar sistema de gotejamento por 2h",
  "type": "IRRIGACAO",
  "status": "PENDENTE",
  "dataPrevista": "2026-03-15T00:00:00.000Z",
  "dataConclusao": null,
  "createdAt": "2026-02-25T10:00:00.000Z",
  "updatedAt": "2026-02-25T10:00:00.000Z"
}
```

---

### 6.2 Listar tarefas

**`GET /tasks`** *(requer JWT)*

Retorna todas as tarefas do utilizador, ordenadas por `dataPrevista` ascendente.

#### Response `200`

```json
[
  {
    "_id": "65f1a2b3c4d5e6f7a8b9c0d1",
    "title": "Irrigar bloco norte",
    "type": "IRRIGACAO",
    "status": "PENDENTE",
    "dataPrevista": "2026-03-15T00:00:00.000Z",
    "dataConclusao": null
  }
]
```

---

### 6.3 Obter tarefa por ID

**`GET /tasks/:id`** *(requer JWT)*

#### Parâmetro

| Param | Descrição |
|---|---|
| `:id` | ID da tarefa (MongoDB ObjectId) |

#### Erros

| Status | Motivo |
|---|---|
| `404` | Tarefa não encontrada |
| `403` | A tarefa não pertence ao utilizador |

---

### 6.4 Actualizar tarefa

**`PATCH /tasks/:id`** *(requer JWT)*

Actualiza qualquer campo. Ao definir `status: "CONCLUIDA"`, o campo `dataConclusao` é preenchido automaticamente. Se o estado for revertido de `CONCLUIDA`, `dataConclusao` é limpa.

#### Request body (todos os campos são opcionais)

```json
{
  "status": "CONCLUIDA"
}
```

#### Response `200`

```json
{
  "_id": "65f1a2b3c4d5e6f7a8b9c0d1",
  "title": "Irrigar bloco norte",
  "status": "CONCLUIDA",
  "dataConclusao": "2026-03-15T14:30:00.000Z"
}
```

---

### 6.5 Eliminar tarefa

**`DELETE /tasks/:id`** *(requer JWT)*

#### Response `200`

```json
{ "message": "Tarefa eliminada com sucesso." }
```

---

## 7. Lógica de Navegação no Frontend

### Fluxo de decisão após login

```typescript
async function handleAfterLogin(loginResponse) {
  const { accessToken, user } = loginResponse;

  // 1. Guardar token
  await saveToken(accessToken);

  // 2. Decidir para onde navegar
  if (user.onboardingCompleted) {
    navigate('Home');
    return;
  }

  // 3. Retomar onboarding no passo correcto
  switch (user.onboardingStep) {
    case 0: navigate('Onboarding/Phase1'); break;
    case 1: navigate('Onboarding/Phase2'); break;
    case 2: navigate('Onboarding/Phase3'); break;
  }
}
```

### Re-abertura da app (utilizador já autenticado)

```typescript
async function handleAppStart() {
  const token = await getToken();
  if (!token) {
    navigate('Login');
    return;
  }

  // Verificar estado actual do onboarding
  const status = await fetch('/onboarding/status', {
    headers: { Authorization: `Bearer ${token}` }
  }).then(r => r.json());

  if (status.onboardingCompleted) {
    navigate('Home');
  } else {
    // Retomar no passo correcto
    navigate(`Onboarding/Phase${status.onboardingStep + 1}`);
  }
}
```

### Progressão entre fases

```typescript
// Após resposta bem-sucedida de cada fase:
function handlePhaseSuccess(response) {
  const { onboardingStep } = response;

  if (onboardingStep === 3) {
    // Onboarding concluído
    navigate('Home');
  } else {
    // Avançar para próxima fase
    navigate(`Onboarding/Phase${onboardingStep + 1}`);
  }
}
```

---

## 8. Tratamento de Erros

### Estrutura de erro padrão

```json
{
  "statusCode": 400,
  "message": ["Telefone inválido. Deve ter 9 dígitos e começar com 9"],
  "error": "Bad Request"
}
```

> O campo `message` pode ser uma `string` ou um `array de strings` (quando há múltiplos erros de validação).

### Tratamento recomendado

```typescript
async function apiCall(url, options) {
  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    const message = Array.isArray(data.message)
      ? data.message.join('\n')
      : data.message;

    throw new Error(message);
  }

  return data;
}
```

### Erros por status HTTP

| Status | Significado | Acção sugerida |
|---|---|---|
| `400` | Dados inválidos | Mostrar mensagem de erro ao utilizador |
| `401` | Não autenticado / token expirado | Redirigir para login |
| `404` | Recurso não encontrado | Mostrar erro genérico |
| `409` | Conflito (ex: telefone já existe) | Informar utilizador |
| `500` | Erro interno do servidor | Mostrar erro genérico e registar |

---

## 9. Referência Rápida

| Rota | Método | Auth | Descrição |
|---|---|---|---|
| `/auth/register` | POST | ❌ | Criar conta |
| `/auth/verify-otp` | POST | ❌ | Verificar OTP |
| `/auth/login` | POST | ❌ | Login → recebe JWT |
| `/auth/me` | GET | ✅ JWT | Perfil completo do utilizador |
| `/onboarding/status` | GET | ✅ JWT | Estado do onboarding |
| `/onboarding/phase-1` | POST | ✅ JWT | Dados da fazenda |
| `/onboarding/phase-2` | POST | ✅ JWT | Produtos cultivados |
| `/onboarding/phase-3` | POST | ✅ JWT | Objectivos + conclui |
| `/dashboard/stats` | GET | ✅ JWT | KPIs em tempo real |
| `/dashboard/farm-health-history` | GET | ✅ JWT | Histórico mensal de saúde |
| `/dashboard/farm-health-snapshot` | POST | ✅ JWT | Registar snapshot de saúde |
| `/notifications` | GET | ✅ JWT | Listar notificações |
| `/notifications/unread-count` | GET | ✅ JWT | Badge de não lidas |
| `/notifications/:id/read` | PATCH | ✅ JWT | Marcar uma como lida |
| `/notifications/read-all` | PATCH | ✅ JWT | Marcar todas como lidas |
| `/tasks` | POST | ✅ JWT | Criar tarefa |
| `/tasks` | GET | ✅ JWT | Listar tarefas |
| `/tasks/:id` | GET | ✅ JWT | Obter uma tarefa |
| `/tasks/:id` | PATCH | ✅ JWT | Actualizar tarefa |
| `/tasks/:id` | DELETE | ✅ JWT | Eliminar tarefa |

### Criação automática de notificações

| Evento | Título da notificação | Tipo |
|---|---|---|
| Cadastro concluído (`POST /auth/register`) | "Bem-vindo ao NDIMA!" | `SYSTEM` / `success` |
| Onboarding concluído (`POST /onboarding/phase-3`) | "Onboarding concluído!" | `SYSTEM` / `success` |

### Valores do campo `onboardingStep`

| Valor | Estado | Ecrã a mostrar |
|---|---|---|
| `0` | Não iniciado | Fase 1 |
| `1` | Fazenda guardada | Fase 2 |
| `2` | Produtos guardados | Fase 3 |
| `3` | **Concluído** | **Home** |
