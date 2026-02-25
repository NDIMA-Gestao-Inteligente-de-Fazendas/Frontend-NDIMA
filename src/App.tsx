import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Landing page components
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import SocialProof from './components/SocialProof';
import ProblemSection from './components/ProblemSection';
import SolutionSection from './components/SolutionSection';
import TechnologySection from './components/TechnologySection';
import ValueSection from './components/ValueSection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';

// Route guards
import PublicRoute from './components/PublicRoute';
import PrivateRoute from './components/PrivateRoute';

// Auth pages (public)
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OtpPage from './pages/OtpPage';

// Onboarding pages (private)
import OnboardingPage from './pages/OnboardingPage';
import OnboardingProductsPage from './pages/OnboardingProductsPage';
import OnboardingGoalsPage from './pages/OnboardingGoalsPage';

// Dashboard (private)
import DashboardLayout from './layouts/DashboardLayout';
import DashboardHomePage from './pages/DashboardHomePage';

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

        {/* ── Public routes (redirect to /dashboard if already authenticated) ── */}
        <Route element={<PublicRoute />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<RegisterPage />} />
          <Route path="/verificar" element={<OtpPage />} />
        </Route>

        {/* ── Private routes (redirect to /login if not authenticated) ── */}
        <Route element={<PrivateRoute />}>
          {/* Onboarding */}
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/onboarding/produtos" element={<OnboardingProductsPage />} />
          <Route path="/onboarding/objetivos" element={<OnboardingGoalsPage />} />

          {/* Dashboard shell + sub-pages */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHomePage />} />
            {/* Sub-pages added here as they are built */}
            <Route path="planeamento" element={<ComingSoon label="Planeamento" />} />
            <Route path="operacoes" element={<ComingSoon label="Operações" />} />
            <Route path="monitoramento" element={<ComingSoon label="Monitoramento" />} />
            <Route path="perfil" element={<ComingSoon label="Perfil" />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

/** Temporary placeholder for pages not yet implemented */
function ComingSoon({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="text-5xl mb-4">🚧</div>
      <h2 className="text-2xl font-bold text-[#111827] font-['Outfit'] mb-2">{label}</h2>
      <p className="text-[#6B7280]">Esta página está a ser construída.</p>
    </div>
  );
}

export default App;
