import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Phone, Lock, User, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
    const navigate = useNavigate();
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (form.senha !== form.confirmarSenha) {
            setError('As senhas não coincidem.');
            return;
        }
        // TODO: integrate with auth API
        navigate('/');
    };

    const inputClass =
        'w-full py-3.5 rounded-xl border border-[#E5E7EB] bg-white text-[#111827] placeholder-[#9CA3AF] focus:outline-none transition-all';

    return (
        <div className="min-h-screen flex font-['Inter']">

            {/* ── Left brand panel ── */}
            <div
                className="hidden md:flex flex-col justify-between w-[45%] p-12"
                style={{ background: 'linear-gradient(145deg, #1A4D2E 0%, #0d2a18 100%)' }}
            >
                <img src="/img/logotipofinal-04.png" alt="NDIMA" className="h-14 w-auto object-contain" />

                <div>
                    <h2 className="text-4xl font-bold text-white font-['Outfit'] leading-snug mb-4">
                        Comece hoje a transformar a sua fazenda.
                    </h2>
                    <p className="text-white/60 text-lg leading-relaxed">
                        Crie a sua conta gratuitamente e tenha acesso à plataforma completa por 30 dias.
                    </p>
                    <div className="flex flex-col gap-3 mt-8">
                        {[
                            'Sem cartão de crédito',
                            'Configuração em menos de 1 minuto',
                            'Cancele quando quiser',
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F7C04A' }}>
                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                        <path d="M1 4L3.5 6.5L9 1" stroke="#123520" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <span className="text-white/80 text-sm">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="text-white/30 text-sm">© {new Date().getFullYear()} NDIMA. Todos os direitos reservados.</p>
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
                            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-base transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg mt-1"
                            style={{ backgroundColor: '#F7C04A', color: '#123520' }}
                        >
                            Criar Minha Conta <ArrowRight size={18} />
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
