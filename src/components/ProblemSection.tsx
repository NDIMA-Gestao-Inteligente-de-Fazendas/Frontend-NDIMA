import { CloudRain, ChartColumn, TrendingDown } from 'lucide-react';

const problems = [
    {
        icon: <CloudRain size={32} />,
        title: 'Falta de Dados',
        description: 'Plantar na hora errada por não prever o clima. Sem acesso a dados precisos, cada ciclo é um risco.',
        number: '01',
    },
    {
        icon: <ChartColumn size={32} />,
        title: 'Gestão Cega',
        description: 'Não saber o custo real da produção até o fim da safra. Gestão manual é cara e imprecisa.',
        number: '02',
    },
    {
        icon: <TrendingDown size={32} />,
        title: 'Baixo Preço de Venda',
        description: 'Vender barato por não conseguir provar a origem orgânica ou sustentável da sua colheita.',
        number: '03',
    }
];

export default function ProblemSection() {
    return (
        <section className="py-24 bg-white" id="problemas">
            <div className="container mx-auto px-6">
                <div className="flex flex-col items-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-5 text-[#111827] font-['Outfit'] tracking-tight text-center">
                        Por que muitos agricultores{' '}
                        <span
                            className="relative inline-block"
                            style={{ color: '#1A4D2E' }}
                        >
                            perdem dinheiro?
                            <span
                                className="absolute bottom-1 left-0 w-full h-2 rounded opacity-50"
                                style={{ backgroundColor: '#F7C04A', zIndex: -1 }}
                            />
                        </span>
                    </h2>
                    <p className="text-xl text-[#4B5563] max-w-[600px] leading-relaxed text-center">
                        Identificamos os 3 maiores desafios que impedem os agricultores de lucrar mais.
                    </p>
                </div>
                <br />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {problems.map((problem, index) => (
                        <div
                            key={index}
                            className="group relative p-8 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-[#1A4D2E] overflow-hidden flex flex-col"
                        >
                            {/* Top accent bar */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-[#F7C04A] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl" />

                            {/* Number */}
                            <div
                                className="absolute top-6 right-6 text-6xl font-black leading-none select-none opacity-5"
                                style={{ color: '#1A4D2E' }}
                            >
                                {problem.number}
                            </div>

                            {/* Icon */}
                            <div
                                className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-colors duration-300 group-hover:bg-[#F7C04A]/20"
                                style={{ backgroundColor: 'rgba(247,192,74,0.1)', color: '#D4A030' }}
                            >
                                {problem.icon}
                            </div>

                            <h3 className="text-xl font-bold mb-3 text-[#111827] font-['Outfit']">
                                {problem.title}
                            </h3>
                            <p className="text-[#4B5563] leading-relaxed text-base">
                                {problem.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
