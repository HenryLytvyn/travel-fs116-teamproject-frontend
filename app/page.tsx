import Hero from '@/components/Hero/Hero';
import About from '@/components/About/About';
import Popular from '@/components/Popular/Popular';
import OurTravelers from '@/components/OurTravelers/OurTravelers';
import Join from '@/components/Join/Join';

export default function MainPage() {
  const isAuthenticated = false;
  
  return (
    <>
      <Hero />
      <About />
      <Popular isAuthenticated={isAuthenticated} />
      <OurTravelers />
      <Join />
    </>
  );
}
