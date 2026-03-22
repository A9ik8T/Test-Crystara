import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

import heroSlide1 from "@/assets/hero-slide-1.jpg";
import heroSlide2 from "@/assets/hero-slide-2.jpg";
import heroSlide3 from "@/assets/hero-slide-3.jpg";
import heroSlide4 from "@/assets/hero-slide-4.jpg";
import heroSlide5 from "@/assets/hero-slide-5.jpg";

const slides = [heroSlide1, heroSlide2, heroSlide3, heroSlide4, heroSlide5];

/* Emoji icons per category for a clean, minimal look */
const categoryIcons: Record<string, string> = {
  bracelets: "📿",
  rings: "💍",
  lockets: "🔮",
  pyramids: "🔺",
  frames: "🖼️",
};

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  return (
    <section className="relative h-screen flex flex-col overflow-hidden">
      {/* Background — slow crossfade */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentSlide}
            src={slides[currentSlide]}
            alt="Crystara collection"
            className="w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/40" />
        {/* Extra radial darkening behind centre text */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center 60%, rgba(0,0,0,0.55) 0%, transparent 70%)" }} />
      </div>

      {/* ─── Category Cards — top strip ─── */}


      {/* ─── Text content — top ─── */}
      <div className="relative z-10 pt-28 sm:pt-36 px-6">
        <div className="text-center max-w-3xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-xs sm:text-sm tracking-[0.35em] uppercase text-white/70 mb-5 font-light"
            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
          >
            Handpicked · Natural · Energized
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-serif font-bold leading-tight mb-3 sm:mb-6"
          >
            Discover the{" "}
            <span className="text-gradient-mystic">Magic</span> of{" "}
            <br className="hidden md:block" />
            Healing Crystals
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-sm sm:text-base md:text-lg text-white/70 max-w-md mx-auto font-light leading-relaxed"
            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
          >
            Discover our curated collection of healing crystals, designed to
            bring balance and positive energy into your life.
          </motion.p>
        </div>
      </div>

      {/* Spacer — lets the image breathe */}
      <div className="flex-1" />

      {/* ─── CTA button — bottom ─── */}
      <motion.div
        className="relative z-10 pb-20 flex justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.9 }}
      >
        <Link to="/shop">
          <Button
            size="lg"
            className="group rounded-full px-8 py-6 text-sm tracking-wide uppercase bg-white text-black hover:bg-white/90 transition-all duration-300"
          >
            Explore Collection
            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        </Link>
      </motion.div>

      {/* ─── Minimal progress bar ─── */}
      <div className="relative z-10 pb-8 flex justify-center">
        <div className="flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className="group relative h-[2px] w-8 bg-white/20 overflow-hidden rounded-full"
              aria-label={`Go to slide ${index + 1}`}
            >
              <motion.span
                className="absolute inset-y-0 left-0 bg-white rounded-full"
                initial={{ width: "0%" }}
                animate={{
                  width: index === currentSlide ? "100%" : "0%",
                }}
                transition={{
                  duration: index === currentSlide ? 6 : 0.3,
                  ease: "linear",
                }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <motion.div
        className="absolute bottom-14 left-1/2 -translate-x-1/2 z-10"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-[1px] h-8 bg-gradient-to-b from-white/40 to-transparent" />
      </motion.div>
    </section>
  );
};

export default HeroSection;
