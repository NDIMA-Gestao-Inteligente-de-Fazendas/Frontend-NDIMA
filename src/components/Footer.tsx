import { Instagram, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-[#E5E7EB] pt-16 pb-8">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-8 md:gap-12 mb-12 text-center md:text-left">
                    <div className="flex flex-col items-center md:items-start">
                        <div className="mb-4">
                            <img
                                src="img/logotipofinal-04.png"
                                alt="NDIMA Logo"
                                className="h-16 w-auto object-contain"
                                style={{ filter: 'brightness(0) saturate(100%) invert(22%) sepia(40%) saturate(800%) hue-rotate(100deg) brightness(80%)' }}
                            />
                        </div>
                        <p className="text-[#4B5563] leading-relaxed max-w-[300px]">
                            A plataforma que está a digitalizar o futuro da agricultura em África.
                        </p>
                    </div>

                    <div className="flex flex-col items-center md:items-start">
                        <h4 className="text-lg font-bold mb-6 text-[#111827]">Links Rápidos</h4>
                        <a href="#" className="block text-[#4B5563] mb-3 hover:text-[#1A4D2E] transition-colors">Termos de Uso</a>
                        <a href="#" className="block text-[#4B5563] mb-3 hover:text-[#1A4D2E] transition-colors">Política de Privacidade</a>
                        <a href="#" className="block text-[#4B5563] mb-3 hover:text-[#1A4D2E] transition-colors">FAQ</a>
                    </div>

                    <div className="flex flex-col items-center md:items-start">
                        <h4 className="text-lg font-bold mb-6 text-[#111827]">Contacto</h4>
                        <a href="mailto:suporte@ndima.co" className="block text-[#4B5563] mb-3 hover:text-[#1A4D2E] transition-colors">suporte@ndima.co</a>
                        <div className="flex gap-4 mt-4 justify-center md:justify-start">
                            <a href="#" className="flex items-center justify-center w-10 h-10 rounded-full bg-[#F9FAFB] text-[#4B5563] hover:bg-[#1A4D2E] hover:text-white hover:-translate-y-1 transition-all">
                                <Instagram size={20} />
                            </a>
                            <a href="#" className="flex items-center justify-center w-10 h-10 rounded-full bg-[#F9FAFB] text-[#4B5563] hover:bg-[#1A4D2E] hover:text-white hover:-translate-y-1 transition-all">
                                <Twitter size={20} />
                            </a>
                            <a href="#" className="flex items-center justify-center w-10 h-10 rounded-full bg-[#F9FAFB] text-[#4B5563] hover:bg-[#1A4D2E] hover:text-white hover:-translate-y-1 transition-all">
                                <Linkedin size={20} />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="text-center pt-8 border-t border-[#E5E7EB] text-[#4B5563] text-sm">
                    <p>© {year} NDIMA. Todos os direitos reservados.</p>
                </div>
            </div>
        </footer>
    );
}

