# Ndima API — Módulo de Planeamento

Documento de integração frontend para os módulos: **Culturas · Planos · Solo · Meteorologia · IA**

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Fluxo da Página de Planeamento](#2-fluxo-da-página-de-planeamento)
3. [Culturas — `GET /crops`](#3-culturas--get-crops)
4. [Solo da Fazenda — `GET /farm/soil`](#4-solo-da-fazenda--get-farmsoil)
5. [IA — `POST /ai/soil-verdict`](#5-ia--post-aisoil-verdict)
6. [Meteorologia](#6-meteorologia)
   - [Clima actual](#61-clima-actual--get-weatherprovince)
   - [Histórico de chuvas](#62-histórico-de-chuvas--get-weatherprovincerainfall-history)
   - [Previsão 7 dias](#63-previsão-7-dias--get-weatherprovinceforecast)
   - [Lista de províncias](#64-lista-de-províncias--get-weatherprovinces)
7. [Planos](#7-planos)
   - [Criar plano](#71-criar-plano--post-plans)
   - [Listar planos](#72-listar-planos--get-plans)
   - [Plano activo](#73-plano-activo--get-plansactive)
   - [Detalhe do plano](#74-detalhe-do-plano--get-plansid)
   - [Cancelar plano](#75-cancelar-plano--delete-plansid)
8. [Guia por Ecrã](#8-guia-por-ecrã)
9. [Referência Rápida](#9-referência-rápida)

---

## 1. Visão Geral

Todos os endpoints (excepto `GET /crops` e `GET /weather/*`) requerem o header:

```
Authorization: Bearer <jwt_token>
```

**Base URL (desenvolvimento):** `http://localhost:3000`  
**Base URL (produção):** `https://<render-slug>.onrender.com`

---

## 2. Fluxo da Página de Planeamento

```
PlanningPage.tsx monta
        │
        ├── GET /auth/me              → nome e província do utilizador
        ├── GET /farm/soil            → dados de solo (Secção "Diagnóstico")
        ├── GET /plans/active         → plano activo (Cronograma + Logística)
        └── GET /weather/province
              ?q={province}           → temperatura no cabeçalho

        │ (após dados de solo chegarem)
        └── POST /ai/soil-verdict     → veredito + culturas recomendadas

        │ (utilizador abre simulador)
        └── GET /crops                → lista de todas as culturas

        │ (utilizador confirma plano no simulador)
        └── POST /plans               → cria plano e redireciona para /planning
```

---

## 3. Culturas — `GET /crops`

Retorna o catálogo completo de culturas. **Não requer autenticação.**

### Request

```http
GET /crops
```

### Response `200 OK`

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
    "idealPhMin": 5.5,
    "idealPhMax": 7.0,
    "compatibleSoilTypes": ["franco-argiloso", "argiloso", "franco-arenoso", "franco"],
    "minMonthlyRainfallMm": 80,
    "idealPlantingMonths": [10, 11, 12, 1],
    "description": "Cereal de alto rendimento, base alimentar em Angola. Ciclo de 4 meses."
  },
  {
    "id": "feijao",
    "name": "Feijão",
    "icon": "🫘",
    "color": "#FEF3C7",
    "costPerHa": 320000,
    "yieldPerHaKg": 1800,
    "growWeeks": 12,
    "seedsPerHaKg": 80,
    "fertilizerPerHaKg": 80,
    "fuelPerHaL": 30,
    "idealPhMin": 6.0,
    "idealPhMax": 7.5,
    "compatibleSoilTypes": ["franco", "franco-argiloso", "franco-arenoso"],
    "minMonthlyRainfallMm": 60,
    "idealPlantingMonths": [10, 11, 3, 4],
    "description": "Leguminosa de ciclo curto, fixa azoto no solo."
  }
  // ... 6 culturas adicionais (mandioca, batata-doce, soja, arroz, sorgo, girassol)
]
```

### Notas de integração

- Usar para preencher os separadores do simulador de planos.
- `color` — cor de fundo do card da cultura (hex).
- `icon` — emoji para o avatar da cultura.
- `growWeeks` — usado para mostrar o calendário estimado antes de criar o plano.

---

## 4. Solo da Fazenda — `GET /farm/soil`

Retorna os dados de solo do utilizador autenticado (recolhidos pelo SoilGrids no onboarding fase 1).

### Request

```http
GET /farm/soil
Authorization: Bearer <token>
```

### Response `200 OK` — solo disponível

```json
{
  "available": true,
  "ph": 6.2,
  "phLabel": "Ácido (Subnormal)",
  "organicCarbon": 12.4,
  "nitrogen": 0.6,
  "texture": {
    "clay": 30,
    "sand": 45,
    "silt": 25,
    "classification": "franco"
  },
  "nutrients": {
    "nitrogen": {
      "value": 30,
      "label": "Médio"
    },
    "organicMatter": {
      "value": 41,
      "label": "Médio"
    }
  },
  "qualityScore": 72,
  "qualityLabel": "Bom",
  "fetchedAt": "2026-01-10T08:30:00.000Z"
}
```

### Response `200 OK` — solo ainda não disponível

```json
{
  "available": false,
  "message": "Dados de solo ainda não disponíveis. Complete o onboarding fase 1.",
  "ph": null,
  "phLabel": null,
  "organicCarbon": null,
  "nitrogen": null,
  "texture": null,
  "nutrients": null,
  "qualityScore": null,
  "qualityLabel": null,
  "fetchedAt": null
}
```

### Notas de integração

- Se `available === false`, mostrar mensagem a pedir que complete o onboarding.
- `phLabel` — texto pronto para exibir: `"Neutro (Ideal)"`, `"Ácido (Subnormal)"`, etc.
- `nutrients.nitrogen.value` e `nutrients.organicMatter.value` são percentagens (0–100) para barras de progresso.
- `qualityScore` — usar para o gauge circular da secção "Diagnóstico do Solo".
- Passar os campos `ph`, `clay`, `sand`, `silt`, `nitrogen`, `organicCarbon` e `qualityScore` directamente para `POST /ai/soil-verdict`.

---

## 5. IA — `POST /ai/soil-verdict`

Motor de recomendação de culturas com LangChain + Groq. Cruza os dados de solo com o histórico de chuvas dos últimos 5 anos (Open-Meteo) e devolve as 4 culturas mais compatíveis com datas de plantio sugeridas.

Resultado em cache durante 24h por utilizador — chamadas repetidas são instantâneas.

### Request

```http
POST /ai/soil-verdict
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "ph": 6.2,
  "clay": 30,
  "sand": 45,
  "silt": 25,
  "nitrogen": 0.6,
  "organicCarbon": 12.4,
  "province": "Huíla",
  "qualityScore": 72
}
```

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `ph` | number | ✅ | pH do solo (ex: 6.2) |
| `clay` | number | ✅ | % de argila |
| `sand` | number | ✅ | % de areia |
| `silt` | number | ✅ | % de silte |
| `nitrogen` | number | ✅ | Azoto em g/kg |
| `organicCarbon` | number | ✅ | Carbono orgânico em g/kg |
| `province` | string | ✅ | Província angolana (nome em português) |
| `qualityScore` | number | ❌ | Score 0–100 do onboarding |

### Response `200 OK`

```json
{
  "verdict": "O solo franco de Huíla com pH 6.2 apresenta condições favoráveis para culturas da época chuvosa. Recomenda-se adubação azotada antes do plantio para maximizar a produtividade.",
  "recommendedCrops": [
    {
      "cropId": "milho",
      "cropName": "Milho",
      "cropIcon": "🌽",
      "compatibilityScore": 85,
      "reason": "pH 6.2 dentro do intervalo ideal (5.5–7.0). textura franco compatível. precipitação adequada em Novembro",
      "suggestedStartDate": "2026-11-15",
      "suggestedStartMonth": "Novembro"
    },
    {
      "cropId": "feijao",
      "cropName": "Feijão",
      "cropIcon": "🫘",
      "compatibilityScore": 80,
      "reason": "pH 6.2 dentro do intervalo ideal (6.0–7.5). textura franco compatível. precipitação adequada em Novembro",
      "suggestedStartDate": "2026-11-15",
      "suggestedStartMonth": "Novembro"
    },
    {
      "cropId": "girassol",
      "cropName": "Girassol",
      "cropIcon": "🌻",
      "compatibilityScore": 70,
      "reason": "pH 6.2 dentro do intervalo ideal. precipitação adequada em Março",
      "suggestedStartDate": "2027-03-15",
      "suggestedStartMonth": "Março"
    },
    {
      "cropId": "soja",
      "cropName": "Soja",
      "cropIcon": "🌿",
      "compatibilityScore": 65,
      "reason": "pH 6.2 dentro do intervalo ideal. chuvas insuficientes na janela ideal",
      "suggestedStartDate": "2026-11-15",
      "suggestedStartMonth": "Novembro"
    }
  ],
  "warnings": [
    "Azoto baixo — aplicar adubação azotada antes do plantio"
  ],
  "soilTextureClass": "franco",
  "generatedAt": "2026-02-25T10:30:00.000Z",
  "source": "ai",
  "rainfallSummary": {
    "province": "Huíla",
    "wetSeasonMonths": [1, 2, 3, 11, 12],
    "drySeason": false
  }
}
```

### Campos da resposta

| Campo | Descrição |
|---|---|
| `verdict` | Texto pronto para exibir — máximo 2 frases |
| `recommendedCrops` | Array ordenado por `compatibilityScore` (desc) — máximo 4 |
| `recommendedCrops[].compatibilityScore` | 0–100 — usar para barra de compatibilidade |
| `recommendedCrops[].suggestedStartDate` | `YYYY-MM-DD` — pré-preencher o campo `startDate` do plano |
| `recommendedCrops[].suggestedStartMonth` | Nome em português — exibir no card |
| `warnings` | Lista de avisos agronómicos — mostrar em chips laranja/vermelho |
| `soilTextureClass` | Classificação textual: `arenoso`, `franco`, `argiloso`, etc. |
| `source` | `"ai"` se Groq foi usado · `"rule-based"` se chave não configurada |
| `rainfallSummary.wetSeasonMonths` | Meses com ≥60mm — útil para colorir calendário |
| `rainfallSummary.drySeason` | `true` se o mês actual é seco — exibir aviso de época |

### Notas de integração

- Chamada pesada (~2–3s em frio, instantânea em cache). Mostrar skeleton/spinner enquanto carrega.
- Se `source === "rule-based"`, pode mostrar um disclaimer subtil: `"Análise baseada em regras agronómicas"`.
- `suggestedStartDate` de cada cultura — pré-preencher directamente no wizard de criação de plano quando o utilizador selecciona essa cultura.
- Se `rainfallSummary.drySeason === true` e o utilizador tentar criar um plano para o mês actual, mostrar aviso de confirmação.

---

## 6. Meteorologia

Todos os endpoints de meteorologia são públicos (sem autenticação). O parâmetro `?q=` aceita qualquer nome de província angolana, com ou sem acentos (ex: `Huila`, `huíla`, `HUÍLA` — todos funcionam).

### 6.1 Clima actual — `GET /weather/province`

```http
GET /weather/province?q=Luanda
```

#### Response `200 OK`

```json
{
  "province": "Luanda",
  "lat": -8.84,
  "lon": 13.23,
  "temperatureCelsius": 28,
  "condition": "Parcialmente nublado",
  "windSpeedKmh": 18,
  "precipitationMm": 0,
  "humidity": 75,
  "fetchedAt": "2026-02-25T11:00:00.000Z"
}
```

**Valores de `condition`:** `Sol` · `Parcialmente nublado` · `Encoberto` · `Nevoeiro` · `Chuviscos` · `Chuva` · `Aguaceiros` · `Trovoada`

**Uso:** Temperatura no cabeçalho da página de planeamento.

---

### 6.2 Histórico de chuvas — `GET /weather/province/rainfall-history`

Médias mensais dos últimos 5 anos (Open-Meteo Archive). Usado internamente pela IA — exposta também para o frontend poder exibir gráficos.

```http
GET /weather/province/rainfall-history?q=Huíla
```

#### Response `200 OK`

```json
[
  { "month": 1,  "monthName": "Jan", "avgPrecipMm": 77  },
  { "month": 2,  "monthName": "Fev", "avgPrecipMm": 105 },
  { "month": 3,  "monthName": "Mar", "avgPrecipMm": 150 },
  { "month": 4,  "monthName": "Abr", "avgPrecipMm": 44  },
  { "month": 5,  "monthName": "Mai", "avgPrecipMm": 9   },
  { "month": 6,  "monthName": "Jun", "avgPrecipMm": 0   },
  { "month": 7,  "monthName": "Jul", "avgPrecipMm": 0   },
  { "month": 8,  "monthName": "Ago", "avgPrecipMm": 0   },
  { "month": 9,  "monthName": "Set", "avgPrecipMm": 1   },
  { "month": 10, "monthName": "Out", "avgPrecipMm": 26  },
  { "month": 11, "monthName": "Nov", "avgPrecipMm": 107 },
  { "month": 12, "monthName": "Dez", "avgPrecipMm": 118 }
]
```

**Uso:** Gráfico de barras mensal na secção de planeamento.

---

### 6.3 Previsão 7 dias — `GET /weather/province/forecast`

```http
GET /weather/province/forecast?q=Benguela
```

#### Response `200 OK`

```json
[
  {
    "date": "2026-02-25",
    "maxTempC": 31,
    "minTempC": 23,
    "precipMm": 0,
    "condition": "Sol"
  },
  {
    "date": "2026-02-26",
    "maxTempC": 29,
    "minTempC": 22,
    "precipMm": 5.2,
    "condition": "Aguaceiros"
  }
  // ... 5 dias adicionais
]
```

---

### 6.4 Lista de províncias — `GET /weather/provinces`

```http
GET /weather/provinces
```

#### Response `200 OK`

```json
{
  "Bengo":          { "lat": -9.10,  "lon": 13.73 },
  "Benguela":       { "lat": -12.58, "lon": 13.41 },
  "Bié":            { "lat": -12.35, "lon": 17.40 },
  "Cabinda":        { "lat": -5.55,  "lon": 12.19 },
  "Cuando Cubango": { "lat": -16.80, "lon": 19.00 },
  "Cuanza Norte":   { "lat": -9.30,  "lon": 14.90 },
  "Cuanza Sul":     { "lat": -10.90, "lon": 14.50 },
  "Cunene":         { "lat": -16.50, "lon": 15.50 },
  "Huambo":         { "lat": -12.78, "lon": 15.74 },
  "Huíla":          { "lat": -14.92, "lon": 13.55 },
  "Luanda":         { "lat": -8.84,  "lon": 13.23 },
  "Lunda Norte":    { "lat": -8.50,  "lon": 19.00 },
  "Lunda Sul":      { "lat": -10.00, "lon": 20.50 },
  "Malanje":        { "lat": -9.54,  "lon": 16.34 },
  "Moxico":         { "lat": -11.83, "lon": 19.84 },
  "Namibe":         { "lat": -15.19, "lon": 12.15 },
  "Uíge":           { "lat": -7.61,  "lon": 15.05 },
  "Zaire":          { "lat": -6.73,  "lon": 14.17 }
}
```

**Uso:** Popular dropdowns/pickers de província no frontend.

---

## 7. Planos

### 7.1 Criar plano — `POST /plans`

```http
POST /plans
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "cropId": "milho",
  "hectares": 2.5,
  "startDate": "2026-11-15",
  "pricePerKgAoa": 200,
  "province": "Huíla",
  "notes": "Campo norte, perto do rio.",
  "aiVerdictUsed": "Solo franco com pH 6.2, condições favoráveis para milho."
}
```

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `cropId` | string | ✅ | Slug da cultura — vem de `GET /crops` (ex: `"milho"`) |
| `hectares` | number | ✅ | Área em hectares (> 0) |
| `startDate` | string | ✅ | Data ISO 8601 (ex: `"2026-11-15"`) |
| `pricePerKgAoa` | number | ✅ | Preço de venda estimado em AOA/kg (> 0) |
| `province` | string | ✅ | Província (mínimo 3 caracteres) |
| `notes` | string | ❌ | Notas livres do agricultor |
| `aiVerdictUsed` | string | ❌ | Texto do veredito da IA — para guardar junto ao plano |

#### Response `201 Created`

```json
{
  "_id": "65f1a2b3c4d5e6f7a8b9c0d1",
  "userId": "65f1a2b3c4d5e6f7a8b9c0d0",
  "cropId": "milho",
  "cropName": "Milho",
  "cropIcon": "🌽",
  "hectares": 2.5,
  "startDate": "2026-11-15T00:00:00.000Z",
  "pricePerKgAoa": 200,
  "province": "Huíla",
  "notes": "Campo norte, perto do rio.",
  "status": "ACTIVO",
  "financials": {
    "totalCostAoa": 1125000,
    "expectedYieldKg": 12500,
    "grossRevenueAoa": 2500000,
    "estimatedProfitAoa": 1375000,
    "profitMarginPct": 55
  },
  "timeline": [
    { "week": 1,  "phase": "Preparação do solo",           "date": "2026-11-15T00:00:00.000Z" },
    { "week": 2,  "phase": "Plantio",                      "date": "2026-11-22T00:00:00.000Z" },
    { "week": 5,  "phase": "1ª Adubação / Tratamentos",    "date": "2026-12-13T00:00:00.000Z" },
    { "week": 10, "phase": "Monitorização / Crescimento",  "date": "2027-01-24T00:00:00.000Z" },
    { "week": 16, "phase": "Colheita",                     "date": "2027-03-07T00:00:00.000Z" }
  ],
  "logistics": {
    "seedsKg": 50,
    "fertilizerKg": 375,
    "fuelLiters": 113
  },
  "aiVerdictUsed": "Solo franco com pH 6.2, condições favoráveis para milho.",
  "createdAt": "2026-02-25T10:00:00.000Z"
}
```

#### Notas de integração

- `financials.totalCostAoa` = `crop.costPerHa × hectares` (calculado pelo backend).
- `financials.profitMarginPct` — usar no gauge da secção financeira.
- `timeline` — renderizar como linha de tempo com as fases ordenadas por `week`.
- `logistics` — quantidades exactas de sementes, fertilizante e combustível a encomendar.
- Ao criar com sucesso, uma **notificação automática** é disparada para o utilizador — o frontend pode chamar `GET /notifications/unread-count` para actualizar o badge.

---

### 7.2 Listar planos — `GET /plans`

```http
GET /plans
GET /plans?status=ACTIVO
GET /plans?status=CONCLUIDO
GET /plans?status=CANCELADO
Authorization: Bearer <token>
```

#### Response `200 OK`

```json
[
  {
    "_id": "65f1a2b3c4d5e6f7a8b9c0d1",
    "cropId": "milho",
    "cropName": "Milho",
    "cropIcon": "🌽",
    "hectares": 2.5,
    "startDate": "2026-11-15T00:00:00.000Z",
    "status": "ACTIVO",
    "financials": { "estimatedProfitAoa": 1375000, "profitMarginPct": 55 },
    "createdAt": "2026-02-25T10:00:00.000Z"
  }
]
```

---

### 7.3 Plano activo — `GET /plans/active`

Retorna o plano com `status: "ACTIVO"` mais recente. Retorna `null` se não houver nenhum.

```http
GET /plans/active
Authorization: Bearer <token>
```

#### Response `200 OK` — com plano activo

Mesma estrutura que `POST /plans` (resposta completa).

#### Response `200 OK` — sem plano activo

```json
null
```

#### Notas de integração

- Chamar no mount da `PlanningPage`.
- Se `null`, mostrar o CTA "Criar primeiro plano".
- Se existir, renderizar o **Cronograma** e a secção de **Logística** com os dados deste plano.

---

### 7.4 Detalhe do plano — `GET /plans/:id`

```http
GET /plans/65f1a2b3c4d5e6f7a8b9c0d1
Authorization: Bearer <token>
```

Retorna a estrutura completa do plano (igual ao `POST /plans`).

**Erros possíveis:**
- `404 Not Found` — plano não existe.
- `403 Forbidden` — plano pertence a outro utilizador.

---

### 7.5 Cancelar plano — `DELETE /plans/:id`

```http
DELETE /plans/65f1a2b3c4d5e6f7a8b9c0d1
Authorization: Bearer <token>
```

#### Response `200 OK`

```json
{ "message": "Plano cancelado com sucesso." }
```

**Erros possíveis:**
- `400 Bad Request` — plano já estava cancelado.
- `403 Forbidden` — sem permissão.
- `404 Not Found` — plano não encontrado.

---

## 8. Guia por Ecrã

### `PlanningPage` (ecrã principal)

```
mount:
  1. GET /auth/me              → user.name, user.farm.province
  2. GET /weather/province
       ?q={province}           → temperatureCelsius (header)
  3. GET /farm/soil            → secção "Diagnóstico do Solo"
  4. GET /plans/active         → cronograma + logística

  após farm/soil carregar:
  5. POST /ai/soil-verdict     → "Veredito NDIMA IA" + culturas recomendadas
```

---

### `PlanningWizard` / Simulador

```
step 1: GET /crops             → tabs de culturas
step 2: utilizador selecciona cultura + hectares + preço
        → calcular preview financeiro com dados de GET /crops
step 3: utilizador confirma
        → POST /plans          → redirecionar para PlanningPage
```

**Preview financeiro antes de confirmar** (calcular no frontend):
```
totalCostAoa       = crop.costPerHa × hectares
expectedYieldKg    = crop.yieldPerHaKg × hectares
grossRevenueAoa    = expectedYieldKg × pricePerKgAoa
estimatedProfitAoa = grossRevenueAoa - totalCostAoa
profitMarginPct    = (estimatedProfitAoa / grossRevenueAoa) × 100
```

---

### `PlanDetailPage`

```
mount:
  GET /plans/:id      → todos os campos do plano

botão "Cancelar Plano":
  DELETE /plans/:id   → confirmar com modal → atualizar lista
```

---

### `WeatherWidget`

```
GET /weather/province?q={province}
  → actualizar a cada 30 min (ou no mount)

GET /weather/province/forecast?q={province}
  → previsão dos próximos 7 dias (opcional, para ecrã detalhado)
```

---

## 9. Referência Rápida

| Método | Endpoint | Auth | Descrição |
|---|---|---|---|
| `GET` | `/crops` | ❌ | Catálogo de culturas |
| `GET` | `/farm/soil` | ✅ | Dados de solo do utilizador |
| `POST` | `/ai/soil-verdict` | ✅ | Veredito IA + culturas recomendadas |
| `GET` | `/weather/province?q=` | ❌ | Clima actual da província |
| `GET` | `/weather/province/rainfall-history?q=` | ❌ | Histórico mensal de chuvas (5 anos) |
| `GET` | `/weather/province/forecast?q=` | ❌ | Previsão 7 dias |
| `GET` | `/weather/provinces` | ❌ | Mapa de coordenadas das 18 províncias |
| `POST` | `/plans` | ✅ | Criar plano |
| `GET` | `/plans` | ✅ | Listar planos (opcional: `?status=`) |
| `GET` | `/plans/active` | ✅ | Plano activo mais recente |
| `GET` | `/plans/:id` | ✅ | Detalhe de um plano |
| `DELETE` | `/plans/:id` | ✅ | Cancelar plano |

### Status dos planos

| Valor | Descrição |
|---|---|
| `ACTIVO` | Plano em curso |
| `CONCLUIDO` | Colheita realizada |
| `CANCELADO` | Plano cancelado pelo utilizador |

### Variáveis de ambiente necessárias no servidor

| Variável | Obrigatório | Descrição |
|---|---|---|
| `GROQ_API_KEY` | ✅ | Chave Groq para o LLM. Sem ela, IA usa sistema de regras local. |
| `OPENWEATHER_API_KEY` | ❌ | Previsão OpenWeather. Sem ela, usa Open-Meteo gratuito. |

> **Open-Meteo** — não requer chave API. Todos os endpoints de chuvas e clima actual funcionam sem configuração adicional.
