import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import SocialProof from './components/SocialProof';
import ProblemSection from './components/ProblemSection';
import SolutionSection from './components/SolutionSection';
import TechnologySection from './components/TechnologySection';
import ValueSection from './components/ValueSection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] font-['Inter']">
      <Header />
      <main>
        <HeroSection />
        <SocialProof />
        <ProblemSection />
        <SolutionSection />
        <TechnologySection />
        <ValueSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
