import { Satellite, CloudLightning, WifiOff } from 'lucide-react';

export default function TechnologySection() {
    return (
        <section className="py-24 bg-white overflow-hidden" id="tecnologia">
            <style>{`
                @keyframes float-sat {
                    0% { transform: translate(-50%, 0px) rotate(-5deg); }
                    50% { transform: translate(-50%, -20px) rotate(5deg); }
                    100% { transform: translate(-50%, 0px) rotate(-5deg); }
                }
                @keyframes pulse-beam {
                    0% { opacity: 0.3; }
                    100% { opacity: 0.7; }
                }
                @keyframes twinkle-point {
                    0%, 100% { opacity: 0.2; transform: scale(0.8); }
                    50% { opacity: 1; transform: scale(1.2); }
                }
                .animate-float-sat { animation: float-sat 6s ease-in-out infinite; }
                .animate-pulse-beam { animation: pulse-beam 4s infinite alternate; }
            `}</style>

            <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                <div className="flex flex-col">
                    <h2 className="text-3xl md:text-5xl font-bold mb-5 text-[#111827] font-['Outfit'] tracking-tight">
                        Tecnologia Espacial no seu <span className="text-[#1A4D2E] relative inline-block after:content-[''] after:absolute after:bottom-1 after:left-0 after:w-full after:h-2 after:bg-[#F7C04A] after:-z-10 after:opacity-50 after:rounded">Bolso.</span>
                    </h2>
                    <p className="text-xl text-[#4B5563] ml-0 leading-relaxed mb-10">
                        Utilizamos o que há de mais avançado em ciência de dados para que você foque no que importa: cultivar e lucrar.
                    </p>

                    <div className="flex flex-col gap-8">
                        <div className="flex items-start gap-6">
                            <div className="w-12 h-12 min-w-[3rem] rounded-xl bg-[#1A4D2E]/10 text-[#1A4D2E] flex items-center justify-center">
                                <Satellite size={24} />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold mb-2 text-[#111827] font-['Outfit']">Imagens de Satélite (NDVI)</h4>
                                <p className="text-[#4B5563] leading-relaxed">Monitore o vigor das plantas sem sair de casa.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-6">
                            <div className="w-12 h-12 min-w-[3rem] rounded-xl bg-[#1A4D2E]/10 text-[#1A4D2E] flex items-center justify-center">
                                <CloudLightning size={24} />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold mb-2 text-[#111827] font-['Outfit']">Previsão Hiper-local</h4>
                                <p className="text-[#4B5563] leading-relaxed">Dados meteorológicos precisos para as coordenadas da sua fazenda.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-6">
                            <div className="w-12 h-12 min-w-[3rem] rounded-xl bg-[#1A4D2E]/10 text-[#1A4D2E] flex items-center justify-center">
                                <WifiOff size={24} />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold mb-2 text-[#111827] font-['Outfit']">Offline First</h4>
                                <p className="text-[#4B5563] leading-relaxed">Funciona no campo, mesmo sem internet. Sincroniza quando você volta à cidade.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative h-[350px] md:h-[500px] flex justify-center items-center">
                    <div className="relative w-full h-full bg-[radial-gradient(circle_at_center,rgba(26,77,46,0.05)_0%,transparent_70%)]">
                        <div className="absolute bottom-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#2A6A42] rounded-[50%] opacity-5"></div>

                        <div className="absolute top-[35%] left-1/2 -translate-x-1/2 w-[100px] h-[300px] bg-gradient-to-b from-[#F7C04A]/30 to-transparent [clip-path:polygon(40%_0,60%_0,100%_100%,0_100%)] animate-pulse-beam"></div>

                        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 animate-float-sat">
                            <Satellite size={80} color="#1A4D2E" />
                        </div>

                        <div className="absolute bottom-[25%] left-[30%] w-3 h-3 rounded-full bg-[#F7C04A] shadow-[0_0_15px_#F7C04A]" style={{ animation: 'twinkle-point 2s infinite' }}></div>
                        <div className="absolute bottom-[25%] left-[50%] w-3 h-3 rounded-full bg-[#F7C04A] shadow-[0_0_15px_#F7C04A]" style={{ animation: 'twinkle-point 3s infinite 1s' }}></div>
                        <div className="absolute bottom-[25%] left-[70%] w-3 h-3 rounded-full bg-[#F7C04A] shadow-[0_0_15px_#F7C04A]" style={{ animation: 'twinkle-point 2.5s infinite 0.5s' }}></div>
                    </div>
                </div>
            </div>
        </section>
    );
}
