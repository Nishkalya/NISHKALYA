import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { testimonialService, Testimonial, DEFAULT_TESTIMONIALS } from '../services/testimonialService';
import { projectService } from '../services/projectService';

export const TestimonialSection: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [isHovered, setIsHovered] = useState(false);
  const [failedAvatars, setFailedAvatars] = useState<Set<string>>(new Set());
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Subscribe to testimonials collection
  useEffect(() => {
    const unsubscribe = testimonialService.subscribeToTestimonials((items) => {
      // Filter active testimonials for landing page
      const activeItems = items.filter(t => t.isActive !== false);
      if (activeItems.length === 0) {
        setTestimonials(DEFAULT_TESTIMONIALS.map((t, idx) => ({ id: `default-${idx}`, ...t })) as Testimonial[]);
      } else {
        setTestimonials(activeItems);
      }
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Subscribe to project data to dynamically sync case study tags
  useEffect(() => {
    const unsubscribe = projectService.subscribeToProjects((items) => {
      setProjectsList(items);
    }, true);
    return () => unsubscribe();
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

  const findMatchingProject = (t: Testimonial) => {
    if (!t || !projectsList.length) return null;
    const companyLower = (t.company || '').toLowerCase();
    const quoteLower = t.quote.toLowerCase();
    const authorLower = t.author.toLowerCase();
    
    return projectsList.find(proj => {
      const titleLower = proj.title.toLowerCase();
      
      if (companyLower && (titleLower.includes(companyLower) || companyLower.includes(titleLower))) return true;
      if (authorLower.includes('rostova') && titleLower.includes('orion')) return true;
      if (authorLower.includes('thorne') && titleLower.includes('orion')) return true;
      if (authorLower.includes('sterling') && titleLower.includes('flux')) return true;
      if (quoteLower.includes('nlp') || quoteLower.includes('llm')) {
        if (titleLower.includes('orion')) return true;
      }
      if (quoteLower.includes('vision') || quoteLower.includes('city') || quoteLower.includes('dashboard')) {
        if (titleLower.includes('flux')) return true;
      }
      return false;
    }) || null;
  };

  const matchingProject = findMatchingProject(currentTestimonial);

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
      className="py-20 md:py-32 px-6 md:px-12 border-t border-slate-200 relative overflow-hidden bg-gradient-to-tr from-white to-slate-50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <div className="text-blue-600 text-[9px] md:text-[10px] uppercase font-bold tracking-[0.3em] mb-4">
            Voice of our Partners
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Client <span className="italic text-blue-600">Testimonials</span>
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto text-sm md:text-base font-light mt-4">
            Real feedback from dynamic enterprises shifting boundaries with our customized AI and interface frameworks.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative min-h-[380px] md:min-h-[300px] flex items-center justify-center">
          
          {/* Subtle Decorative Background Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-blue-50 to-transparent rounded-full blur-[100px] pointer-events-none -z-10" />
          
          {isLoading ? (
            <div className="w-full max-w-4xl text-center flex flex-col items-center justify-center p-6 md:p-10 border border-slate-200 bg-white/50 rounded-3xl relative backdrop-blur-md animate-pulse">
              {/* Giant Elegant Quote Icon skeleton */}
              <div className="absolute -top-6 left-12 p-3 bg-white border border-slate-200 rounded-full text-slate-300 shadow-xl">
                <Quote size={24} className="fill-current text-slate-200" />
              </div>

              {/* Ratings pulse */}
              <div className="flex gap-1 mb-8">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="w-3.5 h-3.5 rounded bg-slate-200" />
                ))}
              </div>

              {/* Main Quote blocks */}
              <div className="w-full max-w-3xl space-y-3 mb-10 flex flex-col items-center">
                <div className="h-6 w-11/12 bg-slate-200 rounded-md" />
                <div className="h-6 w-9/12 bg-slate-200 rounded-md" />
                <div className="h-6 w-10/12 bg-slate-200 rounded-md" />
              </div>

              {/* Author Profile */}
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 rounded-full bg-slate-200 border border-slate-200" />
                <div className="text-left space-y-2">
                  <div className="h-4 w-28 bg-slate-200 rounded" />
                  <div className="h-3 w-40 bg-slate-100 rounded" />
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
                className="w-full max-w-4xl text-center flex flex-col items-center justify-center p-8 md:p-14 border border-slate-200 bg-gradient-to-b from-white to-slate-50 hover:border-blue-300 hover:shadow-xl rounded-[2.5rem] relative backdrop-blur-xl transition-all duration-500 ease-out group/testimonial shadow-lg"
              >
                {/* Giant Elegant Quote Icon */}
                <div className="absolute -top-6 left-12 p-3 bg-white border border-slate-200 rounded-full text-blue-500 shadow-lg">
                  <Quote size={24} className="fill-current" />
                </div>

                {/* Dynamic Project/Case Study Match Integration */}
                {matchingProject && (
                  <button
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('open-project-preview', {
                        detail: { projectId: matchingProject.id }
                      }));
                    }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-400 text-blue-700 text-[10px] font-bold font-mono uppercase tracking-wider transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-sm hover:shadow-md z-20 group/badge"
                    title={`Click to preview case study: ${matchingProject.title}`}
                    id={`testimonial-project-badge-${matchingProject.id}`}
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    <span>Interactive Case Study:</span>
                    <span className="text-slate-800 underline decoration-dotted underline-offset-2 decoration-blue-300 group-hover/badge:decoration-blue-600 transition-colors">
                      {matchingProject.title.split(' — ')[0]}
                    </span>
                  </button>
                )}

                {/* Gold Ratings */}
                <div className="flex gap-1 mb-8" aria-label={`Rated ${currentTestimonial.rating || 5} out of 5 stars`}>
                  {Array.from({ length: currentTestimonial.rating || 5 }).map((_, i) => (
                    <Star key={i} size={15} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>

                {/* Main Testimonial Test in Gorgeous Editorial Sans Heading */}
                <blockquote className="text-xl sm:text-2xl md:text-3xl font-light text-slate-800 leading-relaxed tracking-tight max-w-4xl mb-10 font-sans">
                  &ldquo;{currentTestimonial.quote}&rdquo;
                </blockquote>

                {/* Author & Profile Meta */}
                <div className="flex items-center gap-4 mt-auto">
                  {currentTestimonial.avatarUrl && !failedAvatars.has(currentTestimonial.avatarUrl) ? (
                    <img 
                      src={currentTestimonial.avatarUrl} 
                      alt={currentTestimonial.author}
                      referrerPolicy="no-referrer"
                      onError={() => {
                        setFailedAvatars(prev => {
                          const updated = new Set(prev);
                          updated.add(currentTestimonial.avatarUrl);
                          return updated;
                        });
                      }}
                      className="w-12 h-12 rounded-full border border-slate-200 object-cover transition-transform duration-500 group-hover/testimonial:scale-110"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-900 font-mono text-sm transition-transform duration-500 group-hover/testimonial:scale-110">
                      {currentTestimonial.author ? currentTestimonial.author.charAt(0) : '?'}
                    </div>
                  )}
                  <div className="text-left">
                    <cite className="not-italic text-sm font-semibold text-slate-900 block">
                      {currentTestimonial.author}
                    </cite>
                    <span className="text-xs text-slate-500">
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
            <div className="h-4 w-12 bg-slate-200 rounded font-mono text-transparent">00 / 00</div>
            <div className="flex gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
            </div>
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200" />
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-12 px-6">
            
            {/* Active Status Sequence Text */}
            <div className="text-xs font-mono text-slate-400 tracking-widest uppercase">
              {String(currentIndex + 1).padStart(2, '0')} <span className="mx-2 text-slate-300">/</span> {String(testimonials.length).padStart(2, '0')}
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
                        ? 'bg-blue-500 w-8' 
                        : 'bg-slate-200 hover:bg-slate-300'
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
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
                aria-label="Previous testimonial"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleNext}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
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
