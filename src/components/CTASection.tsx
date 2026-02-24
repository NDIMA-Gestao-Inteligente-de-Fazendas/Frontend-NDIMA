import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CTASection() {
    return (
        <section className="py-32 bg-[#F9FAFB] border-t border-[#E5E7EB]">
            <div className="flex flex-col items-center text-center px-6">

                {/* Badge */}
                <div
                    className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8 text-sm font-semibold tracking-wide uppercase"
                    style={{ backgroundColor: 'rgba(26,77,46,0.08)', color: '#1A4D2E' }}
                >
                    Comece Hoje
                </div>

                {/* Heading */}
                <h2 className="text-3xl md:text-5xl font-bold mb-6 text-[#111827] font-['Outfit'] tracking-tight max-w-3xl">
                    Pronto para levar a sua fazenda para o{' '}
                    <span className="relative inline-block" style={{ color: '#1A4D2E' }}>
                        próximo nível?
                        <span
                            className="absolute bottom-1 left-0 w-full h-2 rounded opacity-50"
                            style={{ backgroundColor: '#F7C04A', zIndex: -1 }}
                        />
                    </span>
                </h2>

                {/* Subtitle */}
                <p className="text-xl mb-12 leading-relaxed max-w-[480px]" style={{ color: '#4B5563' }}>
                    Sem necessidade de pagamento
                </p>
                <p className="text-xl mb-12 leading-relaxed max-w-[480px]" style={{ color: '#4B5563' }}>
                    Configure tudo em menos de 1 minuto e comece já
                </p>
                <br />
                {/* CTA Button */}
                <Link
                    to="/cadastro"
                    className="inline-flex items-center gap-3 px-10 py-5 text-lg font-bold rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl mb-4"
                    style={{ backgroundColor: '#F7C04A', color: '#123520' }}
                >
                    Criar Minha Conta Grátis
                    <ArrowRight size={20} />
                </Link>

                {/* Reassurance text — below the button, centered */}
                <p className="text-sm" style={{ color: '#9CA3AF' }}>
                    Grátis por 30 dias
                </p>
            </div>
        </section>
    );
}
