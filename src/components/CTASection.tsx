import { ArrowRight } from 'lucide-react';

export default function CTASection() {
    return (
        <section className="py-32 bg-[#F9FAFB] border-t border-[#E5E7EB]">
            <div className="container mx-auto px-6 text-center">
                <div
                    className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8 text-sm font-semibold tracking-wide uppercase"
                    style={{ backgroundColor: 'rgba(26,77,46,0.08)', color: '#1A4D2E' }}
                >
                    Comece Hoje
                </div>
                <h2 className="text-3xl md:text-5xl font-bold mb-6 text-[#111827] font-['Outfit'] tracking-tight">
                    Pronto para levar a sua fazenda para o{' '}
                    <span
                        className="relative inline-block"
                        style={{ color: '#1A4D2E' }}
                    >
                        próximo nível?
                        <span
                            className="absolute bottom-1 left-0 w-full h-2 rounded opacity-50"
                            style={{ backgroundColor: '#F7C04A', zIndex: -1 }}
                        />
                    </span>
                </h2>
                <p className="text-xl text-[#4B5563] mb-12 leading-relaxed max-w-[520px] mx-auto">
                    Sem necessidade de cartão de crédito. Configure em menos de 1 minuto e comece já.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button
                        className="inline-flex items-center gap-3 px-10 py-5 text-lg font-bold rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                        style={{ backgroundColor: '#F7C04A', color: '#123520' }}
                    >
                        Criar Minha Conta Grátis
                        <ArrowRight size={20} />
                    </button>
                    <p className="text-sm text-[#4B5563]">
                        Grátis por 30 dias · Sem compromisso
                    </p>
                </div>
            </div>
        </section>
    );
}
