import { CheckCircle2 } from 'lucide-react';

const values = [
    "Aumente a sua margem de lucro com rastreabilidade.",
    "Reduza o desperdício de insumos em até 20%.",
    "Crie um histórico de crédito para financiamentos bancários."
];

export default function ValueSection() {
    return (
        <section className="py-8 pb-32 bg-white">
            <div className="container mx-auto px-6">
                <div className="bg-gradient-to-br from-[#1A4D2E] to-[#123520] rounded-[2rem] p-8 md:p-16 shadow-[0_20px_40px_-10px_rgba(26,77,46,0.4)] relative overflow-hidden">
                    <div className="absolute -top-[50%] -left-[10%] w-[50%] h-[200%] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)] rotate-[30deg]"></div>

                    <h2
                        className="text-3xl md:text-5xl font-bold text-center mb-12 font-['Outfit'] tracking-tight relative z-10"
                        style={{ color: 'white' }}
                    >
                        Muito além de um software de gestão.
                    </h2>

                    <ul className="flex flex-col gap-6 max-w-[600px] mx-auto relative z-10">
                        {values.map((v, i) => (
                            <li key={i} className="flex items-center gap-5 bg-white/10 p-5 md:p-6 rounded-xl backdrop-blur-md border border-white/10 transition-transform duration-300 hover:scale-[1.02] hover:bg-white/15">
                                <CheckCircle2 size={28} className="text-[#F7C04A] min-w-[28px]" />
                                <span className="text-white text-lg md:text-xl font-medium">{v}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}
