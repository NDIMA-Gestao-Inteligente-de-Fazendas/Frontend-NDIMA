import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Phone, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { registerUser } from '../services/authService';

export default function RegisterPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [form, setForm] = useState({
        primeiroNome: '',
        ultimoNome: '',
        telefone: '',
        senha: '',
        confirmarSenha: '',
    });
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.senha !== form.confirmarSenha) {
            setError('As senhas não coincidem.');
            return;
        }
        const passwordValid =
            form.senha.length > 6 &&
            /[A-Z]/.test(form.senha) &&
            /[a-z]/.test(form.senha) &&
            /[^A-Za-z0-9]/.test(form.senha);
        if (!passwordValid) {
            setError('A senha não cumpre todos os requisitos.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const phone = `+244${form.telefone.replace(/\s/g, '')}`;
            await registerUser({
                firstName: form.primeiroNome,
                lastName: form.ultimoNome,
                phone,
                password: form.senha,
            });
            navigate('/verificar', { state: { telefone: phone } });
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erro ao criar conta. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        'w-full py-3.5 rounded-xl border border-[#E5E7EB] bg-white text-[#111827] placeholder-[#9CA3AF] focus:outline-none transition-all';

    return (
        <div className="min-h-screen flex font-['Inter']">

            {/* ── Left image panel ── */}
            <div className="hidden md:block w-[45%] relative overflow-hidden">
                <img
                    src="/img/cadastro.png"
                    alt="NDIMA Cadastro"
                    className="absolute inset-0 w-full h-full object-cover object-center"
                />
            </div>

            {/* ── Right form panel ── */}
            <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#F9FAFB] overflow-y-auto">
                <div className="w-full max-w-[420px]">

                    {/* Mobile logo */}
                    <div className="flex justify-center mb-8 md:hidden">
                        <img src="/img/logotipofinal-04.png" alt="NDIMA" className="h-12 w-auto" />
                    </div>

                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-[#111827] font-['Outfit'] mb-2">Criar conta</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {/* Nome row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="relative">
                                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                                <input
                                    name="primeiroNome"
                                    type="text"
                                    placeholder="Primeiro Nome"
                                    value={form.primeiroNome}
                                    onChange={handleChange}
                                    required
                                    className={`${inputClass} pl-10 pr-3`}
                                    onFocus={e => e.currentTarget.style.borderColor = '#1A4D2E'}
                                    onBlur={e => e.currentTarget.style.borderColor = '#E5E7EB'}
                                />
                            </div>
                            <div className="relative">
                                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                                <input
                                    name="ultimoNome"
                                    type="text"
                                    placeholder="Último Nome"
                                    value={form.ultimoNome}
                                    onChange={handleChange}
                                    required
                                    className={`${inputClass} pl-10 pr-3`}
                                    onFocus={e => e.currentTarget.style.borderColor = '#1A4D2E'}
                                    onBlur={e => e.currentTarget.style.borderColor = '#E5E7EB'}
                                />
                            </div>
                        </div>

                        {/* Telefone */}
                        <div className="relative">
                            <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                            <input
                                name="telefone"
                                type="tel"
                                placeholder="Telefone"
                                value={form.telefone}
                                onChange={handleChange}
                                required
                                className={`${inputClass} pl-11 pr-4`}
                                onFocus={e => e.currentTarget.style.borderColor = '#1A4D2E'}
                                onBlur={e => e.currentTarget.style.borderColor = '#E5E7EB'}
                            />
                        </div>

                        {/* Senha */}
                        <div>
                            <div className="relative">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                                <input
                                    name="senha"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Senha"
                                    value={form.senha}
                                    onChange={handleChange}
                                    required
                                    className={`${inputClass} pl-11 pr-12`}
                                    onFocus={e => e.currentTarget.style.borderColor = '#1A4D2E'}
                                    onBlur={e => e.currentTarget.style.borderColor = '#E5E7EB'}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#374151]">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {/* Real-time password rules — only shown when user has started typing */}
                            {form.senha.length > 0 && (() => {
                                const rules = [
                                    { ok: form.senha.length > 6, label: 'Mais de 6 caracteres' },
                                    { ok: /[A-Z]/.test(form.senha), label: 'Uma letra maiúscula' },
                                    { ok: /[a-z]/.test(form.senha), label: 'Uma letra minúscula' },
                                    { ok: /[^A-Za-z0-9]/.test(form.senha), label: 'Um caractere especial (!@#...)' },
                                ];
                                return (
                                    <ul className="mt-2.5 flex flex-col gap-1.5 pl-1">
                                        {rules.map((r, i) => (
                                            <li key={i} className="flex items-center gap-2 text-xs transition-colors duration-200"
                                                style={{ color: r.ok ? '#1A4D2E' : '#9CA3AF' }}>
                                                <span
                                                    className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200"
                                                    style={{ backgroundColor: r.ok ? '#1A4D2E' : '#E5E7EB' }}
                                                >
                                                    {r.ok && (
                                                        <svg width="8" height="7" viewBox="0 0 8 7" fill="none">
                                                            <path d="M1 3.5L3 5.5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    )}
                                                </span>
                                                {r.label}
                                            </li>
                                        ))}
                                    </ul>
                                );
                            })()}
                        </div>

                        {/* Confirmar Senha */}
                        <div className="relative">
                            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                            <input
                                name="confirmarSenha"
                                type={showConfirm ? 'text' : 'password'}
                                placeholder="Confirmar Senha"
                                value={form.confirmarSenha}
                                onChange={handleChange}
                                required
                                className={`${inputClass} pl-11 pr-12`}
                                onFocus={e => e.currentTarget.style.borderColor = '#1A4D2E'}
                                onBlur={e => e.currentTarget.style.borderColor = '#E5E7EB'}
                            />
                            <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#374151]">
                                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {error && (
                            <p className="text-sm font-medium" style={{ color: '#DC2626' }}>{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-base transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
                            style={{ backgroundColor: '#F7C04A', color: '#123520' }}
                        >
                            {loading
                                ? <><Loader2 size={18} className="animate-spin" /> A criar conta...</>
                                : <>Criar Minha Conta <ArrowRight size={18} /></>
                            }
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-[#E5E7EB]" />
                        <span className="text-sm text-[#9CA3AF]">ou</span>
                        <div className="flex-1 h-px bg-[#E5E7EB]" />
                    </div>

                    {/* Google Button */}
                    <button
                        type="button"
                        className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border border-[#E5E7EB] bg-white font-semibold text-[#374151] shadow-sm hover:bg-gray-50 hover:shadow-md transition-all duration-200"
                    >
                        <svg width="20" height="20" viewBox="0 0 48 48">
                            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.5 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z" />
                            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.5 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.3 0-9.7-3.1-11.3-7.5l-6.6 5.1C9.5 39.5 16.3 44 24 44z" />
                            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.3 4.1-4.1 5.4l6.2 5.2C37 39.2 44 34 44 24c0-1.2-.1-2.4-.4-3.5z" />
                        </svg>
                        Continuar com Google
                    </button>

                    <p className="text-center text-[#6B7280] mt-6">
                        Já tem conta?{' '}
                        <Link to="/login" className="font-semibold hover:underline" style={{ color: '#1A4D2E' }}>
                            Entrar
                        </Link>
                    </p>

                    <p className="text-center text-xs text-[#9CA3AF] mt-4 leading-relaxed">
                        Ao criar a conta, concorda com os nossos{' '}
                        <a href="#" className="underline hover:text-[#1A4D2E]">Termos de uso</a>
                        {' '}e{' '}
                        <a href="#" className="underline hover:text-[#1A4D2E]">Política de privacidade</a>.
                    </p>
                </div>
            </div>
        </div>
    );
}
