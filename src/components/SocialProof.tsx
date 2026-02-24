export default function SocialProof() {
    return (
        <section className="py-12 border-b border-[#E5E7EB] bg-white">
            <div className="container mx-auto px-6">
                <p className="text-center text-[#4B5563] text-sm mb-6 font-medium uppercase tracking-wider">Apoiado por iniciativas globais de inovação:</p>
                <div className="flex justify-center items-center gap-8 sm:gap-16 flex-col sm:flex-row flex-wrap">
                    <div className="flex flex-col items-center opacity-50 grayscale transition-all duration-400 hover:opacity-100 hover:grayscale-0 cursor-default">
                        <span className="font-['Outfit'] font-extrabold text-3xl text-[#1A4D2E] tracking-tight">Timbuktoo</span>
                    </div>
                    <div className="hidden sm:block w-0.5 h-10 bg-[#E5E7EB] rounded-sm"></div>
                    <div className="flex flex-col items-center opacity-50 grayscale transition-all duration-400 hover:opacity-100 hover:grayscale-0 cursor-default">
                        <span className="font-['Outfit'] font-extrabold text-3xl text-[#1A4D2E] tracking-tight">PNUD</span>
                        <span className="text-xs uppercase tracking-wider text-[#2A6A42] font-semibold">Programa de Desenvolvimento</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
