import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { testimonialService, Testimonial } from '../services/testimonialService';

export const TestimonialSection: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [isHovered, setIsHovered] = useState(false);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Subscribe to testimonials collection
  useEffect(() => {
    const unsubscribe = testimonialService.subscribeToTestimonials((items) => {
      // Filter active testimonials for landing page
      const activeItems = items.filter(t => t.isActive !== false);
      setTestimonials(activeItems);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Autoplay effect
  useEffect(() => {
    if (testimonials.length <= 1) return;

    if (!isHovered) {
      autoplayTimerRef.current = setInterval(() => {
        handleNext();
      }, 6000);
    } else if (autoplayTimerRef.current) {
      clearInterval(autoplayTimerRef.current);
    }

    return () => {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
      }
    };
  }, [testimonials.length, currentIndex, isHovered]);

  const handlePrev = () => {
    if (testimonials.length === 0) return;
    setDirection('left');
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (testimonials.length === 0) return;
    setDirection('right');
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (index: number) => {
    if (index === currentIndex) return;
    setDirection(index > currentIndex ? 'right' : 'left');
    setCurrentIndex(index);
  };

  if (!isLoading && testimonials.length === 0) {
    return null; // Return empty if genuinely no testimonials and done loading
  }

  const currentTestimonial = testimonials[currentIndex] || {
    id: 'skeleton',
    quote: '',
    author: '',
    title: '',
    company: '',
    avatarUrl: '',
    rating: 5
  };

  // Framer Motion slide variants for beautiful organic carousel motion
  const slideVariants: any = {
    enter: (dir: 'left' | 'right') => ({
      x: dir === 'right' ? 100 : -100,
      opacity: 0,
      scale: 0.96,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring', stiffness: 260, damping: 28 },
        opacity: { duration: 0.35 },
        scale: { duration: 0.4 }
      }
    },
    exit: (dir: 'left' | 'right') => ({
      x: dir === 'right' ? -100 : 100,
      opacity: 0,
      scale: 0.96,
      transition: {
        x: { type: 'spring', stiffness: 260, damping: 28 },
        opacity: { duration: 0.25 }
      }
    })
  };

  return (
    <section 
      id="testimonials" 
      className="py-20 md:py-32 px-6 md:px-12 border-t border-[#30363d] relative overflow-hidden bg-transparent"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <div className="text-[#58a6ff] text-[9px] md:text-[10px] uppercase font-bold tracking-[0.3em] mb-4">
            Voice of our Partners
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Client <span className="italic text-[#58a6ff]">Testimonials</span>
          </h2>
          <p className="text-[#8b949e] max-w-xl mx-auto text-sm md:text-base font-light mt-4">
            Real feedback from dynamic enterprises shifting boundaries with our customized AI and interface frameworks.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative min-h-[380px] md:min-h-[300px] flex items-center justify-center">
          
          {/* Subtle Decorative Background Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-[#58a6ff]/5 to-transparent rounded-full blur-[100px] pointer-events-none -z-10" />
          
          {isLoading ? (
            <div className="w-full max-w-4xl text-center flex flex-col items-center justify-center p-6 md:p-10 border border-[#30363d]/50 bg-[#161b22]/20 rounded-3xl relative backdrop-blur-md animate-pulse">
              {/* Giant Elegant Quote Icon skeleton */}
              <div className="absolute -top-6 left-12 p-3 bg-[#0d1117] border border-[#30363d]/45 rounded-full text-zinc-700 shadow-xl">
                <Quote size={24} className="fill-current text-[#21262d]" />
              </div>

              {/* Ratings pulse */}
              <div className="flex gap-1 mb-8">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="w-3.5 h-3.5 rounded bg-[#30363d]/60" />
                ))}
              </div>

              {/* Main Quote blocks */}
              <div className="w-full max-w-3xl space-y-3 mb-10 flex flex-col items-center">
                <div className="h-6 w-11/12 bg-[#30363d]/60 rounded-md" />
                <div className="h-6 w-9/12 bg-[#30363d]/60 rounded-md" />
                <div className="h-6 w-10/12 bg-[#30363d]/60 rounded-md" />
              </div>

              {/* Author Profile */}
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 rounded-full bg-[#30363d]/60 border border-[#30363d]" />
                <div className="text-left space-y-2">
                  <div className="h-4 w-28 bg-[#30363d]/60 rounded" />
                  <div className="h-3 w-40 bg-[#30363d]/40 rounded" />
                </div>
              </div>
            </div>
          ) : (
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentTestimonial.id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full max-w-4xl text-center flex flex-col items-center justify-center p-6 md:p-10 border border-[#30363d] bg-[#161b22]/40 rounded-3xl relative backdrop-blur-md"
              >
                {/* Giant Elegant Quote Icon */}
                <div className="absolute -top-6 left-12 p-3 bg-[#0d1117] border border-[#30363d] rounded-full text-[#58a6ff] shadow-xl">
                  <Quote size={24} className="fill-current" />
                </div>

                {/* Gold Ratings */}
                <div className="flex gap-1 mb-8" aria-label={`Rated ${currentTestimonial.rating || 5} out of 5 stars`}>
                  {Array.from({ length: currentTestimonial.rating || 5 }).map((_, i) => (
                    <Star key={i} size={15} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>

                {/* Main Testimonial Test in Gorgeous Editorial Sans Heading */}
                <blockquote className="text-lg sm:text-2xl font-normal text-white leading-relaxed tracking-tight max-w-3xl mb-10 font-sans">
                  &ldquo;{currentTestimonial.quote}&rdquo;
                </blockquote>

                {/* Author & Profile Meta */}
                <div className="flex items-center gap-4 mt-auto">
                  {currentTestimonial.avatarUrl ? (
                    <img 
                      src={currentTestimonial.avatarUrl} 
                      alt={currentTestimonial.author}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full border border-[#30363d] object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full border border-[#30363d] bg-[#21262d] flex items-center justify-center text-white font-mono text-sm">
                      {currentTestimonial.author.charAt(0)}
                    </div>
                  )}
                  <div className="text-left">
                    <cite className="not-italic text-sm font-semibold text-white block">
                      {currentTestimonial.author}
                    </cite>
                    <span className="text-xs text-[#8b949e]">
                      {currentTestimonial.title}
                      {currentTestimonial.company && ` · ${currentTestimonial.company}`}
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* Carousel Controls Container */}
        {isLoading ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-12 px-6 animate-pulse">
            <div className="h-4 w-12 bg-[#30363d]/50 rounded font-mono text-transparent">00 / 00</div>
            <div className="flex gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#30363d]/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#30363d]/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#30363d]/50" />
            </div>
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#161b22] border border-[#30363d]/50" />
              <div className="w-10 h-10 rounded-xl bg-[#161b22] border border-[#30363d]/50" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-12 px-6">
            
            {/* Active Status Sequence Text */}
            <div className="text-xs font-mono text-[#8b949e] tracking-widest uppercase">
              {String(currentIndex + 1).padStart(2, '0')} <span className="mx-2 text-zinc-700">/</span> {String(testimonials.length).padStart(2, '0')}
            </div>

            {/* Dots Indicators Navigation */}
            {testimonials.length > 1 && (
              <div className="flex gap-2.5">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleDotClick(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 relative ${
                      index === currentIndex 
                        ? 'bg-[#58a6ff] w-8' 
                        : 'bg-[#30363d] hover:bg-zinc-600'
                    }`}
                    aria-label={`Go to testimonial slide ${index + 1}`}
                  >
                    <span className="absolute -inset-2 rounded-full cursor-pointer" />
                  </button>
                ))}
              </div>
            )}

            {/* Directional Button Triggers */}
            <div className="flex gap-3">
              <button
                onClick={handlePrev}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#161b22] border border-[#30363d] text-[#8b949e] hover:text-white hover:border-[#58a6ff]/50 transition-all cursor-pointer"
                aria-label="Previous testimonial"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleNext}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#161b22] border border-[#30363d] text-[#8b949e] hover:text-white hover:border-[#58a6ff]/50 transition-all cursor-pointer"
                aria-label="Next testimonial"
              >
                <ChevronRight size={16} />
              </button>
            </div>

          </div>
        )}

      </div>
    </section>
  );
};
