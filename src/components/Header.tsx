import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 60);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="sticky top-0 z-50 flex justify-center transition-all duration-500 ease-in-out"
            style={{ padding: isScrolled ? '12px 0' : '0' }}
        >
            <header
                className="w-full transition-all duration-500 ease-in-out"
                style={{
                    maxWidth: isScrolled ? '82%' : '100%',
                    borderRadius: isScrolled ? '1rem' : '0',
                    backgroundColor: isScrolled ? 'rgba(26, 77, 46, 0.82)' : '#1A4D2E',
                    backdropFilter: isScrolled ? 'blur(14px)' : 'none',
                    WebkitBackdropFilter: isScrolled ? 'blur(14px)' : 'none',
                    boxShadow: isScrolled ? '0 8px 32px rgba(26, 77, 46, 0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
                    color: 'white',
                    border: isScrolled ? '1px solid rgba(255,255,255,0.15)' : 'none',
                }}
            >
                <div className="container mx-auto px-7 py-6 flex items-center justify-between"
                    style={{ maxWidth: '100%', minHeight: '72px' }}
                >
                    <div className="flex items-center gap-2">
                        <img
                            src="img/logotipofinal-04.png"
                            alt="NDIMA Logo"
                            className="w-auto object-contain transition-all duration-500"
                            style={{ height: isScrolled ? '44px' : '56px' }}
                        />
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex gap-8 items-center">
                        <a href="#inicio" className="font-medium transition-colors hover:text-yellow-300" style={{ color: 'white' }}>Início</a>
                        <a href="#funcionalidades" className="font-medium transition-colors hover:text-yellow-300" style={{ color: 'white' }}>Funcionalidades</a>
                        <a href="#tecnologia" className="font-medium transition-colors hover:text-yellow-300" style={{ color: 'white' }}>Tecnologia</a>
                    </nav>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex gap-3">
                        <button
                            className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all duration-200 hover:bg-white/20"
                            style={{ border: '1px solid rgba(255,255,255,0.4)' }}
                        >
                            Entrar
                        </button>
                        <button
                            className="px-5 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                            style={{ backgroundColor: '#F7C04A', color: '#123520', boxShadow: '0 2px 8px rgba(247,192,74,0.3)' }}
                        >
                            Começar Agora
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden hover:text-yellow-300 transition-colors p-1"
                        style={{ color: 'white' }}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div
                        className="md:hidden border-t p-6 flex flex-col gap-5"
                        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                    >
                        <a href="#inicio" className="text-center text-base font-medium text-white hover:text-yellow-300 transition-colors" onClick={() => setIsMenuOpen(false)}>Início</a>
                        <a href="#funcionalidades" className="text-center text-base font-medium text-white hover:text-yellow-300 transition-colors" onClick={() => setIsMenuOpen(false)}>Funcionalidades</a>
                        <a href="#tecnologia" className="text-center text-base font-medium text-white hover:text-yellow-300 transition-colors" onClick={() => setIsMenuOpen(false)}>Tecnologia</a>
                        <a href="#precos" className="text-center text-base font-medium text-white hover:text-yellow-300 transition-colors" onClick={() => setIsMenuOpen(false)}>Preços</a>

                        <div className="flex flex-col gap-3 mt-2">
                            <button
                                className="w-full px-5 py-3 font-semibold text-white rounded-xl transition-all hover:bg-white/20"
                                style={{ border: '1px solid rgba(255,255,255,0.4)' }}
                            >
                                Entrar
                            </button>
                            <button
                                className="w-full px-5 py-3 font-bold rounded-xl transition-all"
                                style={{ backgroundColor: '#F7C04A', color: '#123520' }}
                            >
                                Começar Agora
                            </button>
                        </div>
                    </div>
                )}
            </header>
        </div>
    );
}
