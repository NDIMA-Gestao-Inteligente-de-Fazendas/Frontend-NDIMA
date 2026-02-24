import { CheckCircle2 } from 'lucide-react';

const values = [
    "Aumente a sua margem de lucro com rastreabilidade.",
    "Reduza o desperdício de insumos em até 20%.",
    "Crie um histórico de crédito para financiamentos bancários."
];

export default function ValueSection() {
    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-6">
                <div
                    className="relative rounded-[2rem] p-10 md:p-20 overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg, #1A4D2E 0%, #123520 100%)',
                        boxShadow: '0 20px 40px -10px rgba(26,77,46,0.4)',
                    }}
                >
                    {/* Decorative glow */}
                    <div
                        className="absolute -top-1/2 -left-[10%] w-1/2 h-[200%] pointer-events-none"
                        style={{
                            background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.08) 0%, transparent 70%)',
                            transform: 'rotate(30deg)',
                        }}
                    />

                    {/* Heading */}
                    <h2
                        className="relative z-10 text-3xl md:text-5xl font-bold text-center mb-16 font-['Outfit'] tracking-tight"
                        style={{ color: 'white' }}
                    >
                        Muito além de um software de gestão.
                    </h2>
                    <br />
                    {/* Value list — wider and centred */}
                    <ul className="relative  z-10 flex flex-col gap-5 max-w-[760px] mx-auto">
                        {values.map((v, i) => (
                            <li
                                key={i}
                                className="flex items-center gap-5 rounded-xl p-5 md:p-6 transition-transform duration-300 hover:scale-[1.02]"
                                style={{
                                    backgroundColor: 'rgba(255,255,255,0.08)',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    backdropFilter: 'blur(8px)',
                                }}
                            >
                                <CheckCircle2
                                    size={28}
                                    style={{ color: '#F7C04A', minWidth: '28px' }}
                                />
                                <span
                                    className="text-lg md:text-xl font-medium"
                                    style={{ color: 'white' }}
                                >
                                    {v}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}
