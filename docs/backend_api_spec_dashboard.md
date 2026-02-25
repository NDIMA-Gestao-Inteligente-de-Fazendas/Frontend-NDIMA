# NDIMA — Especificação de API para o Dashboard (Backend → Frontend)

> **Destinatário:** Agente de código do Backend  
> **Contexto:** O frontend (React + Vite + TypeScript) já tem a estrutura da página de Dashboard construída com dados estáticos (mock). O objetivo desta tarefa é substituir esses dados por chamadas reais à API. Este documento descreve **o que o backend deve expor** e **como o frontend irá consumir**.

---

## 1. Estado atual (dados mock identificados)

| Secção no Dashboard | Dado mock | Fonte atual |
|---|---|---|
| Saudação (`Bom dia, [Nome]`) | Nome do utilizador | ❌ Não existe — apenas a fazenda é buscada |
| Card "Área Cultivada" | `cultivableArea` da fazenda | ✅ Parcial — vem de `/onboarding/status` |
| Card "Operações Hoje" | Valor fixo `"3"` | ❌ Mock estático |
| Card "Tarefas Pendentes" | Valor fixo `"5"` / `"2 em atraso"` | ❌ Mock estático |
| Card "Saúde da Fazenda" | Valor fixo `"78%"` / `"↑ +4%"` | ❌ Mock estático |
| Notificações (4 cards) | Array estático `NOTIFICATIONS` | ❌ Mock estático |
| Gráfico "Saúde da Fazenda" | SVG com pontos fixos | ❌ Mock estático |
| Badge "alertas" no header | Contagem do array mock | ❌ Mock estático |

---

## 2. Rotas a criar no Backend

### 2.1 — `GET /auth/me` — Perfil do utilizador autenticado

**Descrição:** Retorna os dados do utilizador que fez login. É a rota mais importante — os dados são reutilizáveis em **todas as páginas autenticadas** (Dashboard, Perfil, Sidebar).

**Autenticação:** Bearer Token (JWT obrigatório)

**Response `200 OK`:**
```json
{
  "id": "uuid",
  "firstName": "João",
  "lastName": "Silva",
  "phone": "+244923000000",
  "email": "joao@fazenda.ao",
  "avatarUrl": "https://...",
  "role": "farmer",
  "onboardingCompleted": true,
  "farm": {
    "id": "uuid",
    "name": "Fazenda Boa Vista",
    "province": "Huambo",
    "cultivableArea": 12.5
  }
}
```

> **Nota:** O campo `farm` pode ser `null` se o onboarding ainda não foi concluído.

---

### 2.2 — `GET /dashboard/stats` — KPIs da fazenda

**Descrição:** Retorna os 4 indicadores numéricos exibidos nos cards do Dashboard.

**Autenticação:** Bearer Token (JWT obrigatório)

**Response `200 OK`:**
```json
{
  "operacoesHoje": 3,
  "tarefasPendentes": {
    "total": 5,
    "emAtraso": 2
  },
  "saudeFazenda": {
    "percentual": 78,
    "variacaoMensal": 4
  }
}
```

> **Notas de implementação:**
> - `operacoesHoje` = count de operações/tarefas agendadas para a data de hoje
> - `tarefasPendentes.total` = count de tarefas com status `PENDENTE` ou `EM_PROGRESSO`
> - `tarefasPendentes.emAtraso` = count de tarefas com `dataPrevista < hoje` AND status ≠ `CONCLUIDA`
> - `saudeFazenda.percentual` = índice calculado pelo backend (pode ser baseado em tarefas cumpridas, irrigação, etc.)
> - `saudeFazenda.variacaoMensal` = diferença de percentual em relação ao mês anterior (positivo = ↑, negativo = ↓)

---

### 2.3 — `GET /notifications` — Notificações/alertas do utilizador

**Descrição:** Retorna a lista de notificações ativas do utilizador.

**Autenticação:** Bearer Token (JWT obrigatório)

**Response `200 OK`:**
```json
[
  {
    "id": "uuid",
    "type": "STOCK_ALERT",
    "title": "Alerta de stocks",
    "description": "Fertilizante abaixo do mínimo",
    "severity": "warning",
    "read": false,
    "createdAt": "2026-02-25T08:00:00Z"
  },
  {
    "id": "uuid",
    "type": "WATER_ALERT",
    "title": "Alerta hídrico",
    "description": "Humidade baixa no Bloco 2",
    "severity": "info",
    "read": false,
    "createdAt": "2026-02-25T07:30:00Z"
  }
]
```

**Tipos possíveis para `type`:**

| `type` | Significado |
|---|---|
| `STOCK_ALERT` | Alerta de stock/insumos |
| `WATER_ALERT` | Alerta hídrico/humidade |
| `TASK_OVERDUE` | Tarefa em atraso |
| `AGRO_TIP` | Dica agronómica |
| `SYSTEM` | Mensagem do sistema |

**Severidade (`severity`):** `"info"` \| `"warning"` \| `"error"` \| `"success"`

---

### 2.4 — `GET /dashboard/farm-health-history` — Histórico de saúde da fazenda

**Descrição:** Série temporal para o gráfico de sparkline exibido no Dashboard.

**Autenticação:** Bearer Token (JWT obrigatório)

**Response `200 OK`:**
```json
{
  "period": "2026",
  "data": [
    { "month": "Jan", "value": 65 },
    { "month": "Fev", "value": 70 },
    { "month": "Mar", "value": 68 },
    { "month": "Abr", "value": 74 },
    { "month": "Mai", "value": 78 },
    { "month": "Jun", "value": 80 }
  ]
}
```

> **Nota:** O frontend converterá estes valores em coordenadas SVG dinamicamente. Retornar sempre os meses já transcorridos no ano atual.

---

## 3. Rota existente — Confirmar compatibilidade

### `GET /onboarding/status`

Esta rota **já existe** e o frontend já a chama. O campo `farm` retornado por ela é usado para a Área Cultivada e o nome da fazenda no header.

**Recomendação:** Manter esta rota por enquanto, mas a médio prazo **unificar com `GET /auth/me`**, pois retornam dados sobrepostos do mesmo utilizador. A rota `/auth/me` proposta acima já inclui o objeto `farm`.

---

## 4. Mapa de consumo (Frontend → Backend)

```
DashboardHomePage.tsx
├── GET /auth/me              → Saudação com nome do utilizador + fazenda
├── GET /dashboard/stats      → 4 StatCards (Operações, Tarefas, Saúde)
├── GET /notifications        → Painel de Notificações + badge de alertas
└── GET /dashboard/farm-health-history → Gráfico sparkline
```

---

## 5. Contexto de Autenticação — Como o frontend envia o token

O frontend já usa `Bearer Token` enviado no header `Authorization`. O helper está em `src/utils/auth.ts` via a função `getAuthHeaders()`. Todas as rotas novas devem ser protegidas com o guard JWT do NestJS (`@UseGuards(JwtAuthGuard)`).

---

## 6. Reuso em outras páginas futuras

Os dados das rotas propostas são reutilizáveis:

| Rota | Páginas que reutilizarão |
|---|---|
| `GET /auth/me` | Dashboard, Perfil (`/dashboard/perfil`), Sidebar (nome/avatar) |
| `GET /notifications` | Dashboard, ícone de sino na Sidebar |
| `GET /dashboard/stats` | Dashboard, futura página de Relatórios |
| `GET /dashboard/farm-health-history` | Dashboard, futura página de Monitoramento |

> **Recomendação arquitetural:** O `GET /auth/me` deve ser chamado UMA vez no contexto global do React (ex: `AuthContext` ou `UserProvider`) e o resultado partilhado por toda a aplicação via Context API, evitando chamadas duplicadas em cada página.

---

## 7. Ordem de implementação sugerida

1. **`GET /auth/me`** — Prioridade máxima. Desbloqueia a saudação com nome real e elimina dependência do `/onboarding/status`
2. **`GET /notifications`** — Prioridade alta. Substitui o array `NOTIFICATIONS` estático
3. **`GET /dashboard/stats`** — Prioridade alta. Substitui os 3 valores fixos dos cards
4. **`GET /dashboard/farm-health-history`** — Prioridade média. Substitui o gráfico SVG estático
