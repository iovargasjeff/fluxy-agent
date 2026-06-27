'use client';

import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorks from "@/components/landing/HowItWorks";
import FeaturesSection from "@/components/landing/FeaturesSection";
import BottomCTA from "@/components/landing/BottomCTA";
import Footer from "@/components/landing/Footer";
import { useScroll, useTransform, motion } from "framer-motion";

export default function HomePage() {
  const { scrollY } = useScroll();
  
  // Transform scale and border radius of the hero wrapper based on scroll
  const scale = useTransform(scrollY, [0, 400], [1, 0.96]);
  const borderRadius = useTransform(scrollY, [0, 400], ["0rem", "3rem"]);
  const y = useTransform(scrollY, [0, 400], [0, 20]); // Slight parallax push down to maintain center visual

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 relative">
      {/* Background glow for the gray canvas */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#1A6CF6]/5 rounded-full blur-[150px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* White Card Wrapper for Navbar + Hero */}
        <motion.div 
          style={{ 
            scale, 
            borderBottomLeftRadius: borderRadius,
            borderBottomRightRadius: borderRadius,
            y,
            transformOrigin: "top center"
          }}
          className="bg-white w-full z-20 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] flex flex-col border-b border-slate-200/50"
        >
          <Navbar />
          <HeroSection />
        </motion.div>

        {/* Rest of the page over gray background */}
        <div className="relative z-10 w-full pt-10">
          <HowItWorks />
          <FeaturesSection />
          <BottomCTA />
          <Footer />
        </div>
      </div>
    </main>
  );
}
