import { Satellite, CloudLightning, WifiOff } from 'lucide-react';

const features = [
    {
        icon: <Satellite size={22} />,
        title: 'Imagens de Satélite (NDVI)',
        description: 'Monitore o vigor das plantas sem sair de casa.',
    },
    {
        icon: <CloudLightning size={22} />,
        title: 'Previsão Hiper-local',
        description: 'Dados meteorológicos precisos para as coordenadas exatas da sua fazenda.',
    },
    {
        icon: <WifiOff size={22} />,
        title: 'Offline First',
        description: 'Funciona no campo, mesmo sem internet. Sincroniza quando você volta à cidade.',
    },
];

export default function TechnologySection() {
    return (
        <section className="py-24 bg-white overflow-hidden" id="tecnologia">
            <style>{`
                @keyframes float-sat {
                    0%   { transform: translateY(0px) rotate(-4deg); }
                    50%  { transform: translateY(-18px) rotate(4deg); }
                    100% { transform: translateY(0px) rotate(-4deg); }
                }
                @keyframes pulse-beam {
                    0%   { opacity: 0.25; transform: scaleX(1); }
                    100% { opacity: 0.55; transform: scaleX(1.05); }
                }
                @keyframes twinkle-point {
                    0%, 100% { opacity: 0.2; transform: scale(0.7); }
                    50%      { opacity: 1;   transform: scale(1.3); }
                }
            `}</style>

            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

                    {/* ── Left column ── */}
                    <div className="flex flex-col">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-[#111827] font-['Outfit'] tracking-tight leading-tight">
                            Tecnologia Espacial <br />
                            no seu{' '}
                            <span className="relative inline-block" style={{ color: '#1A4D2E' }}>
                                Bolso.
                                <span
                                    className="absolute bottom-1 left-0 w-full h-2 rounded opacity-50"
                                    style={{ backgroundColor: '#F7C04A', zIndex: -1 }}
                                />
                            </span>
                        </h2>

                        <p className="text-lg text-[#4B5563] leading-relaxed mb-12 max-w-lg">
                            Utilizamos o que há de mais avançado em ciência de dados para que você foque no que importa: cultivar e lucrar.
                        </p>

                        <div className="flex flex-col gap-7">
                            {features.map((f, i) => (
                                <div key={i} className="flex items-start gap-5">
                                    <div
                                        className="w-11 h-11 min-w-[2.75rem] rounded-xl flex items-center justify-center"
                                        style={{ backgroundColor: 'rgba(26,77,46,0.08)', color: '#1A4D2E' }}
                                    >
                                        {f.icon}
                                    </div>
                                    <div>
                                        <h4 className="text-base font-bold mb-1 text-[#111827] font-['Outfit']">
                                            {f.title}
                                        </h4>
                                        <p className="text-[#4B5563] leading-relaxed text-sm">
                                            {f.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Right column — visual ── */}
                    <div className="relative h-[420px] flex justify-center items-center">
                        {/* Subtle radial glow */}
                        <div
                            className="absolute inset-0 rounded-3xl"
                            style={{ background: 'radial-gradient(circle at 50% 60%, rgba(26,77,46,0.06) 0%, transparent 70%)' }}
                        />

                        {/* Earth arc */}
                        <div
                            className="absolute bottom-[-120px] left-1/2 -translate-x-1/2 w-[520px] h-[260px] rounded-[50%] opacity-10"
                            style={{ backgroundColor: '#2A6A42' }}
                        />

                        {/* Beam */}
                        <div
                            className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[90px] h-[220px]"
                            style={{
                                background: 'linear-gradient(to bottom, rgba(247,192,74,0.4), transparent)',
                                clipPath: 'polygon(35% 0, 65% 0, 100% 100%, 0% 100%)',
                                animation: 'pulse-beam 3.5s infinite alternate',
                            }}
                        />

                        {/* Satellite icon + label */}
                        <div
                            className="absolute top-[18%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                            style={{ animation: 'float-sat 6s ease-in-out infinite' }}
                        >
                            <Satellite size={90} color="#1A4D2E" strokeWidth={1.5} />
                            <span
                                className="text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full"
                                style={{ backgroundColor: 'rgba(26,77,46,0.1)', color: '#1A4D2E' }}
                            >
                                AngoSat-2
                            </span>
                        </div>

                        {/* Ground signal dots */}
                        {[
                            { left: '28%', delay: '0s', dur: '2.2s' },
                            { left: '50%', delay: '0.8s', dur: '2.8s' },
                            { left: '72%', delay: '0.4s', dur: '2.4s' },
                        ].map((dot, i) => (
                            <div
                                key={i}
                                className="absolute w-3 h-3 rounded-full"
                                style={{
                                    bottom: '28%',
                                    left: dot.left,
                                    backgroundColor: '#F7C04A',
                                    boxShadow: '0 0 14px #F7C04A',
                                    animation: `twinkle-point ${dot.dur} infinite ${dot.delay}`,
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
