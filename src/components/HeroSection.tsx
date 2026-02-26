import { ArrowRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HeroSection() {
    return (
        <section className="relative pt-28 pb-20 overflow-hidden" style={{ backgroundColor: '#F9FAFB' }} id="inicio">

            {/* Background blobs */}
            <div
                className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[100px] opacity-20 pointer-events-none"
                style={{ backgroundColor: '#2A6A42', transform: 'translate(30%, -40%)' }}
            />
            <div
                className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[100px] opacity-10 pointer-events-none"
                style={{ backgroundColor: '#F7C04A', transform: 'translate(-30%, 40%)' }}
            />

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

                    {/* Left: Copy */}
                    <div className="text-center md:text-left">
                        <h1 className="text-4xl lg:text-6xl font-bold leading-[1.1] mb-6 text-[#111827] font-['Outfit'] tracking-tight text-left">
                            Transforme a sua fazenda numa{' '}
                            <span className="relative inline-block" style={{ color: '#1A4D2E' }}>
                                empresa lucrativa
                                <span
                                    className="absolute bottom-1 left-0 w-full h-2 rounded opacity-50"
                                    style={{ backgroundColor: '#F7C04A', zIndex: -1 }}
                                />
                            </span>
                            {' '}e certificada.
                        </h1>

                        <p className="text-xl text-[#4B5563] mb-10 max-w-xl leading-relaxed mx-auto md:mx-0 text-left">
                            Gerencie as suas operações, monitore a saúde da sua plantação via satélite e comprove a qualidade da sua colheita para vender até 30% mais caro.
                        </p>

                        <div className="flex flex-wrap gap-4 mb-8 justify-center md:justify-start">
                            <Link
                                to="/cadastro"
                                className="inline-flex items-center gap-2 px-8 py-4 text-base font-bold rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                                style={{ backgroundColor: '#F7C04A', color: '#123520' }}
                            >
                                Começar Grátis Agora <ArrowRight size={18} />
                            </Link>
                            <button
                                className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold rounded-xl border transition-all duration-300 hover:bg-white hover:shadow-md"
                                style={{ backgroundColor: 'transparent', color: '#1A4D2E', borderColor: '#E5E7EB' }}
                            >
                                <Play size={18} /> Ver Demonstração
                            </button>
                        </div>
                    </div>

                    {/* Right: Farmer + tilted phone — hidden on mobile */}
                    <div className="hidden md:flex justify-center items-end">
                        {/* ── Desktop: overlapping composition ── */}
                        <div className="relative" style={{ width: 420, height: 560 }}>

                            {/* Glow blob */}
                            <div
                                className="absolute inset-0 rounded-full blur-[60px] opacity-20 pointer-events-none"
                                style={{ backgroundColor: '#1A4D2E', transform: 'scale(0.85)' }}
                            />

                            {/* Phone — tilted 10°, right side */}
                            <div className="absolute" style={{ right: 0, bottom: 0, zIndex: 5, transform: 'rotate(10deg)', transformOrigin: 'bottom right' }}>
                                <div className="w-[230px] h-[480px] rounded-[44px] border-[8px] border-white shadow-2xl overflow-hidden" style={{ backgroundColor: '#1a1a1a' }}>
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-white rounded-b-2xl z-20" />
                                    <div className="w-full h-full pt-8 px-3 pb-3 flex flex-col gap-3" style={{ backgroundColor: '#f3f4f6' }}>
                                        <div className="flex items-center gap-2 px-1">
                                            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: '#2A6A42' }} />
                                            <div className="h-2 flex-1 rounded-md bg-gray-300" />
                                        </div>
                                        <div className="rounded-xl p-4 shadow text-white" style={{ backgroundColor: '#1A4D2E' }}>
                                            <div className="text-[10px] opacity-60 mb-1">Receita este mês</div>
                                            <div className="text-2xl font-bold">AOA 1.24M</div>
                                            <div className="text-xs mt-1" style={{ color: '#F7C04A' }}>↑ 18% vs mês anterior</div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="bg-white rounded-xl p-3 shadow-sm">
                                                <div className="text-[9px] text-gray-400 mb-1">Parcelas</div>
                                                <div className="text-lg font-bold text-[#111827]">12</div>
                                            </div>
                                            <div className="bg-white rounded-xl p-3 shadow-sm">
                                                <div className="text-[9px] text-gray-400 mb-1">Alertas</div>
                                                <div className="text-lg font-bold" style={{ color: '#D4A030' }}>2</div>
                                            </div>
                                        </div>
                                        <div className="bg-white rounded-xl p-3 h-24 flex items-end gap-1.5 shadow-sm">
                                            {[40, 65, 48, 85, 55, 90, 70].map((h, i) => (
                                                <div key={i} className="flex-1 rounded-t transition-all"
                                                    style={{ height: `${h}%`, backgroundColor: i === 5 ? '#F7C04A' : i % 2 === 0 ? '#d1fae5' : '#2A6A42' }} />
                                            ))}
                                        </div>
                                        <div className="bg-white rounded-xl p-3 shadow-sm">
                                            <div className="text-[9px] text-gray-400 mb-2">Saúde NDVI – Campo A</div>
                                            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                                                <div className="h-full rounded-full" style={{ width: '78%', backgroundColor: '#1A4D2E' }} />
                                            </div>
                                            <div className="text-right text-[9px] mt-1 font-bold" style={{ color: '#1A4D2E' }}>78% Ótimo</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Agricultor — left side, in front */}
                            <img
                                src="/img/agricultor.png"
                                alt="Agricultor NDIMA"
                                className="absolute pointer-events-none select-none"
                                style={{ bottom: 0, left: -10, height: '640px', width: 'auto', zIndex: 15, objectFit: 'contain', objectPosition: 'bottom', filter: 'drop-shadow(0 16px 40px rgba(0,0,0,0.18))' }}
                            />
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
