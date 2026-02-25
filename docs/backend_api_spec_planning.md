# NDIMA — Especificação de API: Página de Planeamento

> **Destinatário:** Agente de código do Backend  
> **Contexto:** A página de Planeamento (`/dashboard/planeamento`) e o seu Wizard de Safra (`PlanningWizard`) estão completamente estáticos. Este documento descreve em profundidade **todas as funcionalidades que precisam de suporte real no backend**, os dados que devem ser persistidos, as rotas a criar, e como a IA deve ser integrada.

---

## 1. Mapa de funcionalidades e dados identificados

| Secção | Dados reais necessários | Estado actual |
|---|---|---|
| Header – nome/província da fazenda | `GET /auth/me` (já especificado) | ✅ Coberto pelo Dashboard |
| Header – temperatura e clima | API meteorológica em tempo real | ❌ Hardcoded: `25°C · Encoberto` |
| **Diagnóstico do Solo** – pH, textura, nutrientes | `soilQuality` da fazenda (da API SoilGrids) | ❌ Todos hardcoded |
| **Veredito MNDIMA IA** | Gerado por IA (Gemini/OpenAI) com input do solo | ❌ Texto fixo |
| **Simulador de Safra** – culturas disponíveis | Lista de culturas com custo/rendimento por ha | ❌ Array estático no frontend |
| **Simulador** – botão "Confirmar este Plano" | `POST /plans` para persistir o plano | ❌ Botão sem ação |
| **Wizard – 5 passos** | `POST /plans` com todos os dados do plano | ❌ Sem persistência |
| **Cronograma da Safra** | Plano ativo do utilizador com fases e datas | ❌ Hardcoded |
| **Necessidades Logísticas** | Calculadas com base no plano ativo | ✅ Calculado (mas sem plano real) |
| **Exportar PDF** | Geração de PDF (backend ou frontend) | ❌ Botão sem ação |

---

## 2. Rotas a criar

---

### 2.1 — `GET /crops` — Catálogo de Culturas

**Descrição:** Retorna a lista master de culturas disponíveis no sistema, com dados agroeconómicos para o simulador.

**Autenticação:** Pública ou JWT (sugerido: pública para evitar dependência)

**Response `200 OK`:**
```json
[
  {
    "id": "milho",
    "name": "Milho",
    "icon": "🌽",
    "color": "#FEF9C3",
    "costPerHa": 450000,
    "yieldPerHaKg": 5000,
    "growWeeks": 16,
    "seedsPerHaKg": 20,
    "fertilizerPerHaKg": 150,
    "fuelPerHaL": 45,
    "compatibleSoilTypes": ["franco-argiloso", "argiloso", "franco-arenoso"],
    "idealPhMin": 5.5,
    "idealPhMax": 7.0
  }
]
```

> **Nota:** Inicialmente pode ser uma tabela seed na base de dados. O `seedsPerHaKg`, `fertilizerPerHaKg` e `fuelPerHaL` são usados para calcular a secção "Necessidades Logísticas" de forma dinâmica.

---

### 2.2 — `POST /plans` — Criar Plano de Safra

**Descrição:** Persiste um plano de safra completo criado pelo utilizador via Wizard ou Simulador.

**Autenticação:** Bearer Token (JWT obrigatório)

**Request body:**
```json
{
  "cropId": "milho",
  "hectares": 12.5,
  "startDate": "2026-03-15",
  "pricePerKgAoa": 150,
  "province": "Huíla",
  "notes": "Bloco Norte da fazenda"
}
```

| Campo | Tipo | Regras |
|---|---|---|
| `cropId` | string | Obrigatório — deve existir na tabela de culturas |
| `hectares` | number | Obrigatório, > 0 |
| `startDate` | string (ISO 8601) | Obrigatório |
| `pricePerKgAoa` | number | Obrigatório, > 0 |
| `province` | string | Obrigatório — usado para dados climáticos |
| `notes` | string | Opcional |

**Response `201 Created`:**
```json
{
  "_id": "uuid",
  "userId": "uuid",
  "cropId": "milho",
  "cropName": "Milho",
  "cropIcon": "🌽",
  "hectares": 12.5,
  "startDate": "2026-03-15T00:00:00.000Z",
  "pricePerKgAoa": 150,
  "province": "Huíla",
  "notes": "Bloco Norte da fazenda",
  "status": "ACTIVO",
  "financials": {
    "totalCostAoa": 5625000,
    "expectedYieldKg": 62500,
    "grossRevenueAoa": 9375000,
    "estimatedProfitAoa": 3750000,
    "profitMarginPct": 40.0
  },
  "timeline": [
    { "week": 1, "phase": "Preparação", "date": "2026-03-15" },
    { "week": 2, "phase": "Plantio", "date": "2026-03-22" },
    { "week": 6, "phase": "1ª Adubação", "date": "2026-04-19" },
    { "week": 10, "phase": "Monitorização", "date": "2026-05-17" },
    { "week": 16, "phase": "Colheita", "date": "2026-06-28" }
  ],
  "logistics": {
    "seedsKg": 250,
    "fertilizerKg": 1875,
    "fuelLiters": 562.5
  },
  "createdAt": "2026-02-25T10:00:00.000Z"
}
```

> **Lógica de negócio do backend ao criar um plano:**
> 1. Buscar dados da cultura (`cropId`) na tabela de culturas
> 2. Calcular `financials` com base em `hectares` e `pricePerKgAoa`
> 3. Gerar `timeline` com base em `startDate` e `growWeeks` da cultura
> 4. Calcular `logistics` com base em `hectares` e constantes da cultura
> 5. Criar notificação: `"Plano de ${cropName} criado com sucesso!"` (tipo `SYSTEM`)

---

### 2.3 — `GET /plans` — Listar Planos do Utilizador

**Descrição:** Retorna todos os planos de safra do utilizador, do mais recente para o mais antigo.

**Autenticação:** Bearer Token (JWT obrigatório)

**Query params opcionais:**
- `status` → `ACTIVO` | `CONCLUIDO` | `CANCELADO`

**Response `200 OK`:**
```json
[
  {
    "_id": "uuid",
    "cropName": "Milho",
    "cropIcon": "🌽",
    "hectares": 12.5,
    "startDate": "2026-03-15T00:00:00.000Z",
    "status": "ACTIVO",
    "financials": {
      "estimatedProfitAoa": 3750000,
      "profitMarginPct": 40.0
    }
  }
]
```

---

### 2.4 — `GET /plans/:id` — Obter Plano Completo

**Descrição:** Retorna todos os detalhes de um plano específico, incluindo timeline, logística e diagnóstico.

**Autenticação:** Bearer Token (JWT obrigatório)

**Response `200 OK`:** Mesmo schema do `POST /plans` response.

---

### 2.5 — `DELETE /plans/:id` — Cancelar/Eliminar Plano

**Autenticação:** Bearer Token (JWT obrigatório)

**Response `200`:**
```json
{ "message": "Plano cancelado com sucesso." }
```

---

### 2.6 — `GET /plans/active` — Plano Activo da Fazenda

**Descrição:** Retorna o plano com `status: "ACTIVO"` mais recente do utilizador. Usado para popular o Cronograma da Safra e a secção de Necessidades Logísticas automaticamente quando o utilizador entra na página.

**Autenticação:** Bearer Token (JWT obrigatório)

**Response `200 OK`:** Schema completo do plano (igual ao `GET /plans/:id`), ou `null` se não houver plano ativo.

```json
null
```

ou (se existir):

```json
{ ... plano completo ... }
```

---

### 2.7 — `GET /farm/soil` — Dados do Solo da Fazenda

**Descrição:** Retorna os dados de solo da fazenda do utilizador, obtidos da API SoilGrids durante o onboarding. Estes dados populam a secção "Diagnóstico do Solo".

**Autenticação:** Bearer Token (JWT obrigatório)

**Response `200 OK`:**
```json
{
  "ph": 6.5,
  "phLabel": "Neutro (Ideal)",
  "organicCarbon": 14.3,
  "nitrogen": 1.05,
  "texture": {
    "clay": 40,
    "sand": 35,
    "silt": 25,
    "classification": "franco-argiloso"
  },
  "nutrients": {
    "nitrogen": { "value": 80, "label": "Alto" },
    "organicMatter": { "value": 55, "label": "Médio" }
  },
  "qualityScore": 81,
  "qualityLabel": "Muito Bom",
  "fetchedAt": "2026-02-25T08:00:00.000Z"
}
```

> **Nota:** Estes dados já existem no modelo `User.farm.soilQuality` (criados durante a Fase 1 do onboarding). Esta rota é um atalho dedicado para o frontend não ter de chamar `/auth/me` só para dados de solo.

---

### 2.8 — `POST /ai/soil-verdict` — Veredito IA sobre o Solo *(funcionalidade central)*

**Descrição:** Endpoint que recebe os dados do solo e chama a IA (Gemini / OpenAI GPT) para gerar um diagnóstico agronómico personalizado em português.

**Autenticação:** Bearer Token (JWT obrigatório)

**Request body:**
```json
{
  "ph": 6.5,
  "clay": 40,
  "sand": 35,
  "silt": 25,
  "nitrogen": 1.05,
  "organicCarbon": 14.3,
  "province": "Huíla"
}
```

**Response `200 OK`:**
```json
{
  "verdict": "O seu solo franco-argiloso com pH 6.5 é excelente para Cereais (Milho, Sorgo). Recomendamos ligeira aplicação de composto orgânico antes do plantio para elevar os níveis de Matéria Orgânica.",
  "recommendedCrops": ["milho", "feijao", "soja"],
  "warnings": ["Matéria orgânica média — aplicar composto antes do plantio"],
  "generatedAt": "2026-02-25T10:00:00.000Z"
}
```

---

## 3. Fluxo de execução detalhado por funcionalidade

---

### 3.1 — Fluxo: Carregar a página de Planeamento

```
Frontend (mount)
   │
   ├── GET /auth/me           → nome e provinica da fazenda (header)
   ├── GET /farm/soil         → dados para o Diagnóstico do Solo
   ├── POST /ai/soil-verdict  → veredito MNDIMA IA (com dados do solo)
   ├── GET /crops             → lista de culturas para o Simulador
   └── GET /plans/active      → plano ativo → popula Cronograma + Logística
```

> **Optimização:** O `GET /auth/me` deve vir de um contexto global (já recomendado no doc do Dashboard) — não chamar novamente aqui.

---

### 3.2 — Fluxo: Wizard de Safra (5 passos)

```
Passo 1: Selecionar Cultura
   → Lista de culturas vem do GET /crops (já carregado na montagem da página)

Passo 2: Configurar Área, Preço e Data
   → Apenas estado local no frontend

Passo 3: Loading (simulado)
   → Frontend simula 3s de "análise"
   → Em paralelo, pode chamar: GET /weather/province?q={province} (ver 3.5)

Passo 4: Resultado de Viabilidade
   → Cálculos financeiros feitos localmente no frontend
   → Dados de solo para confirmar compatibilidade vêm do GET /farm/soil (já carregado)

Passo 5: Cronograma Final
   → Utilizador clica "Confirmar e Gerar Cronograma"
   → Frontend chama POST /plans com os dados do wizard
   → Backend devolve plano com timeline calculada
   → Frontend exibe cronograma e botões de exportar/partilhar
```

---

### 3.3 — Fluxo: Simulador Rápido na Página Principal

```
Utilizador seleciona cultura + ajusta hectares + preço
   │
   └── Cálculos em tempo real no frontend (sem chamada ao backend)
       Custo = culture.costPerHa × hectares
       Receita = hectares × yieldPerHaKg × pricePerKg
       Lucro = Receita - Custo

Utilizador clica "Confirmar este Plano"
   │
   └── POST /plans → persiste o plano e recebe de volta o plano completo
       → Frontend atualiza a secção de Cronograma e Logística com o plano novo
```

---

### 3.4 — Fluxo: Veredito MNDIMA IA

```
Backend recebe POST /ai/soil-verdict
   │
   ├── Formata um prompt para a IA com os dados:
   │     "Analisa este solo para agricultores angolanos:
   │      pH: 6.5, Argila: 40%, Areia: 35%, Silte: 25%,
   │      Nitrogénio: Alto, Matéria Orgânica: Médio.
   │      Província: Huíla. Responde em português europeu.
   │      Dá um veredito conciso (máx. 2 frases) e lista 2-3 culturas recomendadas."
   │
   ├── Chama Gemini API (ou OpenAI)
   │
   └── Devolve: { verdict, recommendedCrops, warnings }
```

> **Optimização recomendada:** Guardar (cache) o resultado durante 24h por utilizador, pois os dados de solo não mudam. Adicionar `updatedAt` na resposta para que o frontend mostre quando foi gerado.

---

### 3.5 — Fluxo: Dados Meteorológicos no Header e Cronograma

```
Backend (GET /weather/province?q=Huíla)

   ├── Chama API externa Open-Meteo (gratuita, sem chave)
   │     URL: https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true
   │
   ├── Converte provincie → coordenadas (tabela interna)
   │
   └── Devolve:
         { temperatureCelsius: 25, condition: "Encoberto", windSpeedKmh: 12 }
```

> **Alternativa simples:** Reutilizar a chamada já existente no `WeatherCard` componente do Dashboard — se o componente já chama uma API meteorológica, expor o mesmo endpoint.

---

### 3.6 — Fluxo: Exportar PDF das Necessidades Logísticas

**Opção A (Backend):**
```
POST /plans/:id/export-pdf
   → Backend gera PDF com puppeteer ou pdfkit
   → Devolve stream PDF ou URL assinada S3
```

**Opção B (Frontend — mais simples):**
```
Frontend usa html2canvas + jsPDF para gerar o PDF diretamente
→ Sem necessidade de rota no backend
→ Recomendado para a fase inicial
```

> **Recomendação:** Usar a Opção B para a primeira versão. Evita complexidade no backend.

---

## 4. Modelo de dados sugerido — `Plan` (MongoDB)

```typescript
{
  _id: ObjectId,
  userId: ObjectId,           // referência ao User
  cropId: string,             // "milho", "feijao", etc.
  cropName: string,
  cropIcon: string,
  hectares: number,
  startDate: Date,
  pricePerKgAoa: number,
  province: string,
  notes?: string,
  status: "ACTIVO" | "CONCLUIDO" | "CANCELADO",

  financials: {
    totalCostAoa: number,
    expectedYieldKg: number,
    grossRevenueAoa: number,
    estimatedProfitAoa: number,
    profitMarginPct: number,
  },

  timeline: [
    { week: number, phase: string, date: Date }
  ],

  logistics: {
    seedsKg: number,
    fertilizerKg: number,
    fuelLiters: number,
  },

  aiVerdictUsed?: string,    // texto do veredito IA no momento da criação

  createdAt: Date,
  updatedAt: Date,
}
```

---

## 5. Modelo de dados sugerido — `Crop` (MongoDB/seed)

```typescript
{
  id: string,                  // "milho" (slug único)
  name: string,                // "Milho"
  icon: string,                // "🌽"
  color: string,               // "#FEF9C3"
  costPerHa: number,           // AOA
  yieldPerHaKg: number,        // kg por hectare
  growWeeks: number,           // semanas até colheita
  seedsPerHaKg: number,        // kg de sementes por ha
  fertilizerPerHaKg: number,   // kg de NPK por ha
  fuelPerHaL: number,          // litros de combustível por ha
  idealPhMin: number,
  idealPhMax: number,
  compatibleSoilTypes: string[],
}
```

---

## 6. Mapa de consumo — Frontend → Backend

```
PlanningPage.tsx (montagem)
  ├── GET /auth/me                 → header (nome/província)
  ├── GET /farm/soil               → "Diagnóstico do Solo"
  ├── POST /ai/soil-verdict        → "Veredito MNDIMA IA"
  ├── GET /crops                   → Simulador (tabs de culturas)
  ├── GET /plans/active            → Cronograma + Necessidades Logísticas
  └── GET /weather/province?q=...  → temperatura no header

PlanningWizard (interação)
  └── POST /plans                  → Confirmar plano (passo 5 do wizard)

PlanningPage — Simulador Rápido
  └── POST /plans                  → "Confirmar este Plano"
```

---

## 7. Referência Rápida — Rotas do Planeamento

| Rota | Método | Auth | Prioridade | Descrição |
|---|---|---|---|---|
| `/crops` | GET | ❌ | 🔴 Alta | Catálogo de culturas |
| `/plans` | POST | ✅ JWT | 🔴 Alta | Criar plano de safra |
| `/plans` | GET | ✅ JWT | 🔴 Alta | Listar planos |
| `/plans/active` | GET | ✅ JWT | 🔴 Alta | Plano ativo atual |
| `/plans/:id` | GET | ✅ JWT | 🟡 Média | Detalhes de um plano |
| `/plans/:id` | DELETE | ✅ JWT | 🟡 Média | Cancelar plano |
| `/farm/soil` | GET | ✅ JWT | 🔴 Alta | Dados do solo |
| `/ai/soil-verdict` | POST | ✅ JWT | 🔴 Alta | Veredito IA agronómico |
| `/weather/province` | GET | ✅ JWT | 🟡 Média | Clima por província |
| `/plans/:id/export-pdf` | POST | ✅ JWT | 🟢 Baixa | Exportar PDF (opcional) |

---

## 8. Ordem de implementação sugerida

1. **`GET /crops`** — Desbloqueará o Simulador e o Wizard com dados reais
2. **`GET /farm/soil`** — Desbloqueará o Diagnóstico do Solo
3. **`POST /ai/soil-verdict`** — Desbloqueará o Veredito MNDIMA IA
4. **`POST /plans`** + **`GET /plans/active`** — Desbloqueará a persistência do Wizard e o Cronograma real
5. **`GET /plans`** + **`GET /plans/:id`** — Histórico de planos (futura aba)
6. **`GET /weather/province`** — Clima no header (última prioridade)
