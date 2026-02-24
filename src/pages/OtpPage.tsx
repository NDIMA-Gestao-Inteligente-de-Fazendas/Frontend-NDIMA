import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, RotateCcw } from 'lucide-react';

const OTP_LENGTH = 6;

export default function OtpPage() {
    const navigate = useNavigate();
    const location = useLocation();
    // Phone number passed via navigation state from RegisterPage
    const telefone = (location.state as { telefone?: string })?.telefone ?? '';

    const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const [error, setError] = useState('');
    const [resendCooldown, setResendCooldown] = useState(30);
    const inputs = useRef<(HTMLInputElement | null)[]>([]);

    // Countdown timer for resend
    useEffect(() => {
        if (resendCooldown <= 0) return;
        const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [resendCooldown]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return; // only digits
        const newDigits = [...digits];
        newDigits[index] = value.slice(-1); // single digit
        setDigits(newDigits);
        setError('');
        // Auto-advance
        if (value && index < OTP_LENGTH - 1) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
        const newDigits = [...digits];
        pasted.split('').forEach((ch, i) => { newDigits[i] = ch; });
        setDigits(newDigits);
        inputs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const code = digits.join('');
        if (code.length < OTP_LENGTH) {
            setError('Por favor, insira os 6 dígitos do código.');
            return;
        }
        // TODO: call API to verify OTP
        navigate('/login');
    };

    const handleResend = () => {
        if (resendCooldown > 0) return;
        setResendCooldown(30);
        setDigits(Array(OTP_LENGTH).fill(''));
        // TODO: trigger API resend
    };

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
                        Quase lá! Verifique o seu número.
                    </h2>
                    <p className="text-white/60 text-lg leading-relaxed">
                        Enviámos um código de 6 dígitos para o seu telemóvel. Insira-o para confirmar a sua conta.
                    </p>
                </div>

                <p className="text-white/30 text-sm">© {new Date().getFullYear()} NDIMA. Todos os direitos reservados.</p>
            </div>

            {/* ── Right panel ── */}
            <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#F9FAFB]">
                <div className="w-full max-w-[400px]">

                    {/* Mobile logo */}
                    <div className="flex justify-center mb-8 md:hidden">
                        <img src="/img/logotipofinal-04.png" alt="NDIMA" className="h-12 w-auto" />
                    </div>

                    {/* Icon */}
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0"
                        style={{ backgroundColor: 'rgba(26,77,46,0.08)' }}
                    >
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1A4D2E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.72 12 19.79 19.79 0 0 1 1.65 3.18 2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z" />
                        </svg>
                    </div>

                    <h1 className="text-3xl font-bold text-[#111827] font-['Outfit'] mb-2">
                        Verificar Telefone
                    </h1>
                    <p className="text-[#6B7280] mb-8">
                        Código enviado para{' '}
                        <span className="font-semibold text-[#111827]">
                            {telefone ? `+244 ${telefone}` : 'o seu número'}
                        </span>
                    </p>

                    <form onSubmit={handleSubmit}>
                        {/* OTP input boxes */}
                        <div className="flex gap-3 justify-center md:justify-start mb-6" onPaste={handlePaste}>
                            {digits.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={el => { inputs.current[i] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={e => handleChange(i, e.target.value)}
                                    onKeyDown={e => handleKeyDown(i, e)}
                                    className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 bg-white text-[#111827] focus:outline-none transition-all"
                                    style={{
                                        borderColor: digit ? '#1A4D2E' : '#E5E7EB',
                                        boxShadow: digit ? '0 0 0 3px rgba(26,77,46,0.08)' : 'none',
                                    }}
                                    onFocus={e => { e.currentTarget.style.borderColor = '#1A4D2E'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(26,77,46,0.12)'; }}
                                    onBlur={e => { if (!digit) { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.boxShadow = 'none'; } }}
                                />
                            ))}
                        </div>

                        {error && (
                            <p className="text-sm font-medium mb-4" style={{ color: '#DC2626' }}>{error}</p>
                        )}
                        <br />
                        <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-base transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                            style={{ backgroundColor: '#F7C04A', color: '#123520' }}
                        >
                            Confirmar Código <ArrowRight size={18} />
                        </button>
                    </form>

                    {/* Resend */}
                    <div className="flex items-center gap-2 mt-6 justify-center md:justify-start">
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={resendCooldown > 0}
                            className="flex items-center gap-1.5 text-sm font-semibold transition-all"
                            style={{ color: resendCooldown > 0 ? '#9CA3AF' : '#1A4D2E', cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer' }}
                        >
                            <RotateCcw size={14} />
                            Reenviar código
                        </button>
                        {resendCooldown > 0 && (
                            <span className="text-sm text-[#9CA3AF]">em {resendCooldown}s</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
