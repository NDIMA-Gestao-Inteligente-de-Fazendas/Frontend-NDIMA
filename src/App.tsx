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
import OtpPage from './pages/OtpPage';
import OnboardingPage from './pages/OnboardingPage';
import OnboardingProductsPage from './pages/OnboardingProductsPage';
import OnboardingGoalsPage from './pages/OnboardingGoalsPage';

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
        <Route path="/verificar" element={<OtpPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/onboarding/produtos" element={<OnboardingProductsPage />} />
        <Route path="/onboarding/objetivos" element={<OnboardingGoalsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
