import { getAuthHeaders } from '../utils/auth';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

// ── Helpers ──────────────────────────────────────────────────────────────────

async function apiGet<T>(path: string): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, { headers: getAuthHeaders() });
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
    if (!res.ok) throw new Error(Array.isArray(data.message) ? data.message.join('\n') : data.message);
    return data as T;
}

async function apiPatch<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(Array.isArray(data.message) ? data.message.join('\n') : data.message);
    return data as T;
}

async function apiDelete<T>(path: string): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? 'Erro inesperado.');
    return data as T;
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface APITask {
    _id: string;
    userId?: string;
    title: string;
    description?: string;
    type: 'OPERACAO' | 'TAREFA' | 'IRRIGACAO' | 'COLHEITA' | 'ADUBAGEM' | 'OUTRO';
    status: 'PENDENTE' | 'EM_PROGRESSO' | 'CONCLUIDA' | 'CANCELADA';
    dataPrevista: string;
    dataConclusao?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateTaskPayload {
    title: string;
    description?: string;
    type?: 'OPERACAO' | 'TAREFA' | 'IRRIGACAO' | 'COLHEITA' | 'ADUBAGEM' | 'OUTRO';
    dataPrevista: string;
}

export interface UpdateTaskPayload {
    status?: 'PENDENTE' | 'EM_PROGRESSO' | 'CONCLUIDA' | 'CANCELADA';
    title?: string;
    description?: string;
    type?: 'OPERACAO' | 'TAREFA' | 'IRRIGACAO' | 'COLHEITA' | 'ADUBAGEM' | 'OUTRO';
    dataPrevista?: string;
}

// ── API Methods ──────────────────────────────────────────────────────────────

export async function getTasks() {
    return apiGet<APITask[]>('/tasks');
}

export async function getTask(id: string) {
    return apiGet<APITask>(`/tasks/${id}`);
}

export async function createTask(payload: CreateTaskPayload) {
    return apiPost<APITask>('/tasks', payload);
}

export async function updateTask(id: string, payload: UpdateTaskPayload) {
    return apiPatch<APITask>(`/tasks/${id}`, payload);
}

export async function deleteTask(id: string) {
    return apiDelete<{ message: string }>(`/tasks/${id}`);
}
