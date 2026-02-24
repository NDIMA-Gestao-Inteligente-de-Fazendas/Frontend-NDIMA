import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 bg-[#1A4D2E] text-white shadow-md">
            <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <img
                        src="img/logotipofinal-04.png"
                        alt="NDIMA Logo"
                        className="h-10 md:h-14 w-auto object-contain"
                    />
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex gap-8 items-center">
                    <a href="#inicio" className="font-medium hover:text-[#F7C04A] transition-colors">Início</a>
                    <a href="#funcionalidades" className="font-medium hover:text-[#F7C04A] transition-colors">Funcionalidades</a>
                    <a href="#tecnologia" className="font-medium hover:text-[#F7C04A] transition-colors">Tecnologia</a>
                    <a href="#precos" className="font-medium hover:text-[#F7C04A] transition-colors">Preços</a>
                </nav>

                {/* Desktop Actions */}
                <div className="hidden md:flex gap-4">
                    <button className="px-5 py-2.5 text-sm font-semibold text-white border border-white/40 hover:border-white hover:bg-white hover:text-[#1A4D2E] rounded-xl transition-all">
                        Entrar
                    </button>
                    <button className="px-5 py-2.5 text-sm font-semibold bg-[#F7C04A] text-[#123520] hover:bg-[#F9DA8B] rounded-xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
                        Começar Agora
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-white hover:text-[#F7C04A] transition-colors p-1"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-[#1A4D2E] border-t border-white/10 shadow-xl p-6 flex flex-col gap-6">
                    <a href="#inicio" className="text-center text-lg font-medium hover:text-[#F7C04A] transition-colors" onClick={() => setIsMenuOpen(false)}>Início</a>
                    <a href="#funcionalidades" className="text-center text-lg font-medium hover:text-[#F7C04A] transition-colors" onClick={() => setIsMenuOpen(false)}>Funcionalidades</a>
                    <a href="#tecnologia" className="text-center text-lg font-medium hover:text-[#F7C04A] transition-colors" onClick={() => setIsMenuOpen(false)}>Tecnologia</a>
                    <a href="#precos" className="text-center text-lg font-medium hover:text-[#F7C04A] transition-colors" onClick={() => setIsMenuOpen(false)}>Preços</a>

                    <div className="flex flex-col gap-4 mt-4">
                        <button className="w-full px-5 py-3 font-semibold text-white border border-white/40 hover:border-white hover:bg-white hover:text-[#1A4D2E] rounded-xl transition-all">
                            Entrar
                        </button>
                        <button className="w-full px-5 py-3 font-semibold bg-[#F7C04A] text-[#123520] hover:bg-[#F9DA8B] rounded-xl transition-all">
                            Começar Agora
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
}
