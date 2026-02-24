import Header from './components/Header'
import HeroSection from './components/HeroSection'
import SocialProof from './components/SocialProof'
import ProblemSection from './components/ProblemSection'
import SolutionSection from './components/SolutionSection'
import TechnologySection from './components/TechnologySection'
import ValueSection from './components/ValueSection'
import CTASection from './components/CTASection'
import Footer from './components/Footer'

function App() {
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
  )
}

export default App

