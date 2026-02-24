export default function SocialProof() {
    return (
        <section className="py-12 border-b border-[#E5E7EB] bg-white">
            <p className="text-[#4B5563] text-sm mb-8 font-medium uppercase tracking-wider text-center">
                Apoiado por iniciativas globais de inovação
            </p>

            {/* Equal-width halves so the | sits exactly at the page center */}
            <div className="flex items-center justify-center">
                {/* Left half — right-aligned */}
                <div className="flex justify-end pr-10 flex-1">
                    <div className="flex flex-col items-end opacity-50 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0 cursor-default">
                        <span className="font-['Outfit'] font-extrabold text-3xl text-[#1A4D2E] tracking-tight">
                            TIMBUKTOO
                        </span>
                    </div>
                </div>

                {/* Center separator */}
                <div className="w-px h-10 bg-[#E5E7EB] shrink-0" />

                {/* Right half — left-aligned */}
                <div className="flex justify-start pl-10 flex-1">
                    <div className="group relative flex flex-col items-start opacity-50 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0 cursor-default">
                        <span className="font-['Outfit'] font-extrabold text-3xl text-[#1A4D2E] tracking-tight">
                            PNUD ANGOLA
                        </span>
                        {/* Truncated subtitle — full text appears as tooltip on hover */}
                        <span className="text-xs uppercase tracking-wider text-[#2A6A42] font-semibold truncate max-w-[160px]">
                            Prog. das Nações Unidas p/ o Des.
                        </span>
                        {/* Full-text tooltip */}
                        <span className="pointer-events-none absolute bottom-full left-0 mb-2 whitespace-nowrap rounded-lg bg-[#1A4D2E] px-3 py-1.5 text-[11px] uppercase tracking-wider text-white font-semibold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            Programa das Nações Unidas para o Desenvolvimento
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
