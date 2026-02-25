const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
import { getAuthHeaders } from '../utils/auth';

// ── Helpers ──────────────────────────────────────────────────────────────────

async function apiGet<T>(path: string, auth = true): Promise<T> {
    const headers = auth
        ? getAuthHeaders()
        : { 'Content-Type': 'application/json' };
    const res = await fetch(`${API_BASE}${path}`, { headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? 'Erro inesperado.');
    return data as T;
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(Array.isArray(data.message) ? data.message.join(' | ') : data.message);
    return data as T;
}

async function apiDelete<T>(path: string): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, { method: 'DELETE', headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? 'Erro inesperado.');
    return data as T;
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface Crop {
    id: string;
    name: string;
    icon: string;
    color: string;
    costPerHa: number;
    yieldPerHaKg: number;
    growWeeks: number;
    seedsPerHaKg: number;
    fertilizerPerHaKg: number;
    fuelPerHaL: number;
    idealPhMin: number;
    idealPhMax: number;
    compatibleSoilTypes: string[];
    minMonthlyRainfallMm?: number;
    idealPlantingMonths?: number[];
    description?: string;
}

export interface SoilData {
    available: boolean;
    ph: number | null;
    phLabel: string | null;
    organicCarbon: number | null;
    nitrogen: number | null;
    texture: { clay: number; sand: number; silt: number; classification: string; } | null;
    nutrients: {
        nitrogen: { value: number; label: string };
        organicMatter: { value: number; label: string };
    } | null;
    qualityScore: number | null;
    qualityLabel: string | null;
    fetchedAt: string | null;
}

export interface SoilVerdictPayload {
    ph: number; clay: number; sand: number; silt: number;
    nitrogen: number; organicCarbon: number; province: string; qualityScore?: number;
}

export interface RecommendedCrop {
    cropId: string; cropName: string; cropIcon: string;
    compatibilityScore: number; reason: string;
    suggestedStartDate: string; suggestedStartMonth: string;
}

export interface SoilVerdict {
    verdict: string;
    recommendedCrops: RecommendedCrop[];
    warnings: string[];
    soilTextureClass: string;
    generatedAt: string;
    source: 'ai' | 'rule-based';
    rainfallSummary?: { province: string; wetSeasonMonths: number[]; drySeason: boolean; };
}

export interface WeatherData {
    province: string; lat: number; lon: number;
    temperatureCelsius: number; condition: string;
    windSpeedKmh: number; precipitationMm: number;
    humidity: number; fetchedAt: string;
}

export interface PlanTimeline { week: number; phase: string; date: string; }

export interface Plan {
    _id: string; userId: string;
    cropId: string; cropName: string; cropIcon: string;
    hectares: number; startDate: string; pricePerKgAoa: number;
    province: string; notes?: string;
    status: 'ACTIVO' | 'CONCLUIDO' | 'CANCELADO';
    financials: {
        totalCostAoa: number; expectedYieldKg: number;
        grossRevenueAoa: number; estimatedProfitAoa: number; profitMarginPct: number;
    };
    timeline: PlanTimeline[];
    logistics: { seedsKg: number; fertilizerKg: number; fuelLiters: number; };
    aiVerdictUsed?: string;
    createdAt: string;
}

export interface CreatePlanPayload {
    cropId: string; hectares: number; startDate: string;
    pricePerKgAoa: number; province: string; notes?: string; aiVerdictUsed?: string;
}

// ── Crops ────────────────────────────────────────────────────────────────────

export async function getCrops() {
    return apiGet<Crop[]>('/crops', false);
}

// ── Soil ─────────────────────────────────────────────────────────────────────

export async function getFarmSoil() {
    return apiGet<SoilData>('/farm/soil');
}

// ── AI ───────────────────────────────────────────────────────────────────────

export async function getSoilVerdict(payload: SoilVerdictPayload) {
    return apiPost<SoilVerdict>('/ai/soil-verdict', payload);
}

// ── Weather ──────────────────────────────────────────────────────────────────

export async function getWeather(province: string) {
    return apiGet<WeatherData>(`/weather/province?q=${encodeURIComponent(province)}`, false);
}

// ── Plans ────────────────────────────────────────────────────────────────────

export async function createPlan(payload: CreatePlanPayload) {
    return apiPost<Plan>('/plans', payload);
}

export async function getPlans(status?: string) {
    const q = status ? `?status=${status}` : '';
    return apiGet<Plan[]>(`/plans${q}`);
}

export async function getActivePlan() {
    return apiGet<Plan | null>('/plans/active');
}

export async function getPlan(id: string) {
    return apiGet<Plan>(`/plans/${id}`);
}

export async function cancelPlan(id: string) {
    return apiDelete<{ message: string }>(`/plans/${id}`);
}
