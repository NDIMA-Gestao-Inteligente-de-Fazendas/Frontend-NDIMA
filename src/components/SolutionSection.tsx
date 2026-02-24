import { BrainCircuit, ShieldCheck, LineChart } from 'lucide-react';

type Module = {
    icon: React.ReactNode;
    tag: string;
    title: string;
    subtitle: string;
    description: string;
    highlight?: boolean;
};

const modules: Module[] = [
    {
        icon: <BrainCircuit size={40} />,
        tag: 'Módulo 1',
        title: 'Planeamento Inteligente',
        subtitle: 'Não adivinhe, saiba.',
        description: 'Use inteligência de dados e satélite para saber exatamente o que, quando e quanto plantar.',
    },
    {
        icon: <ShieldCheck size={40} />,
        tag: 'Módulo 2',
        title: 'Operações e Rastreabilidade',
        subtitle: 'O seu selo de qualidade digital.',
        description: 'Registre cada tarefa e gere relatórios de conformidade para exportação e mercados premium.',
        highlight: true,
    },
    {
        icon: <LineChart size={40} />,
        tag: 'Módulo 3',
        title: 'Monitoramento de Performance',
        subtitle: 'Finanças sob controle.',
        description: 'Visualize lucros, perdas e produtividade em tempo real. Prepare-se para o crédito agrícola.',
    }
];

function ModuleCard({ mod }: { mod: Module }) {
    if (mod.highlight) {
        return (
            <div
                className="relative flex flex-col rounded-3xl p-8 md:p-12 transition-all duration-300 border overflow-hidden bg-[#1A4D2E] text-white border-[#2A6A42] shadow-lg md:scale-105 z-10 hover:-translate-y-2 hover:shadow-xl"
                style={{ transform: undefined }}
            >
                <div className="absolute top-6 right-6 text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full bg-white/20 text-white">
                    {mod.tag}
                </div>
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-8 text-[#F7C04A] bg-white/10">
                    {mod.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 font-['Outfit'] text-white">
                    {mod.title}
                </h3>
                <p className="font-semibold italic mb-3 text-[#F9DA8B]">
                    "{mod.subtitle}"
                </p>
                <p className="leading-relaxed text-white/90">
                    {mod.description}
                </p>
            </div>
        );
    }

    return (
        <div className="relative flex flex-col rounded-3xl p-8 md:p-12 transition-all duration-300 border overflow-hidden bg-white text-[#111827] border-[#E5E7EB] shadow-sm z-0 hover:-translate-y-2 hover:shadow-lg">
            <div className="absolute top-6 right-6 text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full bg-[#F9FAFB] text-[#4B5563]">
                {mod.tag}
            </div>
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-8 text-[#1A4D2E]" style={{ backgroundColor: 'rgba(26,77,46,0.05)' }}>
                {mod.icon}
            </div>
            <h3 className="text-2xl font-bold mb-4 font-['Outfit'] text-[#111827]">
                {mod.title}
            </h3>
            <p className="font-semibold italic mb-3 text-[#D4A030]">
                "{mod.subtitle}"
            </p>
            <p className="leading-relaxed text-[#4B5563]">
                {mod.description}
            </p>
        </div>
    );
}

export default function SolutionSection() {
    return (
        <section className="py-24 bg-[#F9FAFB]" id="funcionalidades">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-5 text-[#111827] font-['Outfit'] tracking-tight">A Plataforma Completa</h2>
                    <p className="text-xl text-[#4B5563] max-w-[600px] mx-auto leading-relaxed">
                        Tudo o que você precisa para gerenciar do plantio à venda, num único lugar.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-center">
                    {modules.map((mod, index) => (
                        <ModuleCard key={index} mod={mod} />
                    ))}
                </div>
            </div>
        </section>
    );
}
