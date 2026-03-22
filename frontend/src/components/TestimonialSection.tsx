import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    location: "Delhi, India",
    rating: 5,
    text: "The Rose Quartz bracelet I received was absolutely stunning! I could feel the positive energy immediately. The quality exceeded my expectations.",
    product: "Rose Quartz Bracelet",
  },
  {
    id: 2,
    name: "Rahul Mehta",
    location: "Mumbai, India",
    rating: 5,
    text: "Crystara's Citrine pyramid has been a game-changer for my home office. I've noticed increased focus and positive vibes since placing it on my desk.",
    product: "Citrine Pyramid",
  },
  {
    id: 3,
    name: "Ananya Reddy",
    location: "Bangalore, India",
    rating: 5,
    text: "I've purchased from many crystal shops, but Crystara stands out for their authentic, high-quality crystals and beautiful packaging. Highly recommend!",
    product: "Amethyst Tree",
  },
  {
    id: 4,
    name: "Sarah Chen",
    location: "Singapore",
    rating: 5,
    text: "Fast international shipping and the crystals arrived perfectly packaged. The Seven Chakra bracelet is my daily companion now!",
    product: "Seven Chakra Bracelet",
  },
  {
    id: 5,
    name: "Michael Roberts",
    location: "London, UK",
    rating: 5,
    text: "Exceptional quality and beautiful craftsmanship. The Tiger Eye ring has brought me confidence and clarity in my decisions.",
    product: "Tiger Eye Ring",
  },
  {
    id: 6,
    name: "Aisha Patel",
    location: "Dubai, UAE",
    rating: 5,
    text: "The crystal locket I ordered is absolutely gorgeous! It's become my favorite piece of jewelry and I can feel its calming energy.",
    product: "Crystal Locket",
  },
];

const TestimonialSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <section className="py-20 bg-secondary/30 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            What Our Customers Say
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join thousands of happy customers who've experienced the magic of our healing crystals
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          {/* Navigation Buttons */}
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-card border border-border flex items-center justify-center hover:bg-primary/10 hover:border-primary/50 transition-all"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-card border border-border flex items-center justify-center hover:bg-primary/10 hover:border-primary/50 transition-all"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          {/* Testimonial Cards */}
          <div className="relative h-[320px] md:h-[280px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                }}
                exit={{ opacity: 0, y: -50, scale: 0.9 }}
                transition={{ 
                  duration: 0.5,
                  ease: "easeOut"
                }}
                className="absolute inset-0"
              >
                <motion.div
                  animate={{ 
                    y: [0, -8, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="bg-card p-8 md:p-10 rounded-2xl shadow-crystal border border-border relative"
                >
                  <Quote className="absolute top-6 right-6 w-12 h-12 text-primary/10" />
                  
                  <div className="flex gap-1 mb-6">
                    {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                    ))}
                  </div>
                  
                  <p className="text-lg md:text-xl text-foreground/90 mb-6 italic leading-relaxed">
                    "{testimonials[currentIndex].text}"
                  </p>
                  
                  <div className="pt-6 border-t border-border flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground text-lg">
                        {testimonials[currentIndex].name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {testimonials[currentIndex].location}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-primary font-medium">
                        {testimonials[currentIndex].product}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsAutoPlaying(false);
                  setCurrentIndex(index);
                }}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "w-8 bg-primary"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
