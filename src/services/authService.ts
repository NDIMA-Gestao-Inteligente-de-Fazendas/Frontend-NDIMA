const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export interface RegisterPayload {
    firstName: string;
    lastName: string;
    phone: string;
    password: string;
}

export interface RegisterResponse {
    message: string;
    phone: string;
}

export interface VerifyOtpPayload {
    phone: string;
    otp: string;
}

export interface VerifyOtpResponse {
    message: string;
}

export async function registerUser(payload: RegisterPayload): Promise<RegisterResponse> {
    const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
        // 409 → phone already registered; 400 → validation error
        throw new Error(data.message ?? 'Erro ao criar conta.');
    }
    return data as RegisterResponse;
}

export async function verifyOtp(payload: VerifyOtpPayload): Promise<VerifyOtpResponse> {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message ?? 'Código inválido. Tente novamente.');
    }
    return data as VerifyOtpResponse;
}
