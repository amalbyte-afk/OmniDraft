import LandingNavbar from '../components/landing/LandingNavbar';
import HeroSection from '../components/landing/HeroSection';
import SupportedContentTypes from '../components/landing/SupportedContentTypes';
import WhyOmniDraft from '../components/landing/WhyOmniDraft';
import HowItWorks from '../components/landing/HowItWorks';
import FaqSection from '../components/landing/FaqSection';
import FinalCtaSection from '../components/landing/FinalCtaSection';
import LandingFooter from '../components/landing/LandingFooter';

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <LandingNavbar />
      <HeroSection />
      <SupportedContentTypes />
      <WhyOmniDraft />
      <HowItWorks />
      <FaqSection />
      <FinalCtaSection />
      <LandingFooter />
    </div>
  );
}
