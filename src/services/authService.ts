const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
import { getAuthHeaders, saveToken } from '../utils/auth';

// ── helpers ──────────────────────────────────────────────────────────────────

async function apiPost<T>(path: string, body: unknown, auth = false): Promise<T> {
    const headers = auth ? getAuthHeaders() : { 'Content-Type': 'application/json' };
    const res = await fetch(`${API_BASE}${path}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
        let msg = Array.isArray(data.message) ? data.message.join(' | ') : data.message;

        // Translate common NestJS class-validator English errors to Portuguese
        if (typeof msg === 'string') {
            msg = msg.replace(/property (.*) should not exist/g, 'O campo "$1" não é suportado pelo servidor atualmente');
            msg = msg.replace(/(.*) must be a number/g, 'O campo "$1" deve ser numérico');
            msg = msg.replace(/(.*) should not be empty/g, 'O campo "$1" não pode estar vazio');
            msg = msg.replace(/(.*) must be an email/g, 'O campo "$1" tem de ser um email válido');
            msg = msg.replace(/(.*) must be a string/g, 'O campo "$1" deve ser texto');
        }

        throw new Error(msg || 'Erro inesperado no servidor.');
    }
    return data as T;
}

async function apiGet<T>(path: string): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? 'Erro inesperado.');
    return data as T;
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export interface RegisterPayload { firstName: string; lastName: string; phone: string; password: string; }
export interface RegisterResponse { message: string; phone: string; }

export async function registerUser(payload: RegisterPayload) {
    return apiPost<RegisterResponse>('/auth/register', payload);
}

export interface VerifyOtpPayload { phone: string; otp: string; }
export interface VerifyOtpResponse { message: string; }

export async function verifyOtp(payload: VerifyOtpPayload) {
    return apiPost<VerifyOtpResponse>('/auth/verify-otp', payload);
}

export interface LoginPayload { phone: string; password: string; }
export interface LoginUser {
    id: string; firstName: string; lastName: string; phone: string;
    onboardingStep: number; onboardingCompleted: boolean;
}
export interface LoginResponse { accessToken: string; user: LoginUser; }

export async function loginUser(payload: LoginPayload): Promise<LoginResponse> {
    const data = await apiPost<LoginResponse>('/auth/login', payload);
    saveToken(data.accessToken);
    return data;
}

// ── Auth/Me ──────────────────────────────────────────────────────────────────

export interface UserProfile {
    id: string; firstName: string; lastName: string; phone: string;
    onboardingStep: number; onboardingCompleted: boolean;
    farm?: {
        name: string; province: string; cultivableArea: number;
        location?: { lat: number; lon: number };
        soilQuality?: { qualityScore: number; qualityLabel: string };
    };
    products?: string[]; objectives?: string[];
}

export async function getMe() {
    return apiGet<UserProfile>('/auth/me');
}

// ── Onboarding ────────────────────────────────────────────────────────────────

export interface OnboardingStatus {
    onboardingStep: number; onboardingCompleted: boolean;
    farm?: { name: string; province: string; cultivableArea: number };
    products?: string[]; objectives?: string[];
}

export async function getOnboardingStatus() {
    return apiGet<OnboardingStatus>('/onboarding/status');
}

export interface Phase1Payload { farmName: string; province: string; cultivableArea: number; location?: { lat: number; lon: number }; }
export async function submitPhase1(payload: Phase1Payload) {
    return apiPost<{ message: string; onboardingStep: number }>('/onboarding/phase-1', payload, true);
}

export async function submitPhase2(products: string[]) {
    return apiPost<{ message: string; onboardingStep: number }>('/onboarding/phase-2', { products }, true);
}

export async function submitPhase3(objectives: string[]) {
    return apiPost<{ message: string; onboardingStep: number; onboardingCompleted: boolean }>(
        '/onboarding/phase-3', { objectives }, true
    );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export interface DashboardStats {
    operacoesHoje: number;
    tarefasPendentes: { total: number; emAtraso: number };
    saudeFazenda: { percentual: number; variacaoMensal: number };
}

export async function getDashboardStats() {
    return apiGet<DashboardStats>('/dashboard/stats');
}

export interface FarmHealthHistory {
    period: string;
    data: { month: string; value: number }[];
}

export async function getFarmHealthHistory() {
    return apiGet<FarmHealthHistory>('/dashboard/farm-health-history');
}

// ── Notifications ─────────────────────────────────────────────────────────────

export interface Notification {
    _id: string;
    type: 'SYSTEM' | 'STOCK_ALERT' | 'WATER_ALERT' | 'TASK_OVERDUE' | 'AGRO_TIP';
    title: string;
    description: string;
    severity: 'info' | 'warning' | 'error' | 'success';
    read: boolean;
    createdAt: string;
}

export async function getNotifications() {
    return apiGet<Notification[]>('/notifications');
}

export async function getUnreadCount() {
    return apiGet<{ unread: number }>('/notifications/unread-count');
}
