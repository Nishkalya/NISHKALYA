import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Eye, Layout, BarChart3, Zap } from 'lucide-react';
import { Project } from '../services/projectService';

interface ProjectCardProps {
  project: Project;
  index: number;
  onClick: () => void;
  setHoveredProject: (p: Project | null) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  index,
  onClick,
  setHoveredProject,
}) => {
  const [shouldLoadIframe, setShouldLoadIframe] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timeout on unmount to prevent leaks
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    setHoveredProject(project);
    // Debounce the iframe load by 200ms to ignore casual pointer sweeps
    hoverTimeoutRef.current = setTimeout(() => {
      setShouldLoadIframe(true);
    }, 200);
  };

  const handleMouseLeave = () => {
    setHoveredProject(null);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  const getProjectIcon = (type: string, size = 40) => {
    switch (type) {
      case 'message': return <MessageSquare size={size} className="text-[#58a6ff]/30 transition-colors duration-300" />;
      case 'eye': return <Eye size={size} className="text-[#58a6ff]/30 transition-colors duration-300" />;
      case 'layout': return <Layout size={size} className="text-[#58a6ff]/30 transition-colors duration-300" />;
      case 'chart': return <BarChart3 size={size} className="text-[#58a6ff]/30 transition-colors duration-300" />;
      default: return <Zap size={size} className="text-[#58a6ff]/30 transition-colors duration-300" />;
    }
  };

  const techStack = project.fullDetails?.techStack || [];
  let tags: string[] = [];
  if (techStack && techStack.length > 0) {
    tags = techStack.map(t => t.name);
  } else if (project.category) {
    tags = project.category.split('·').map(t => t.trim()).filter(Boolean);
  } else {
    tags = ['React', 'TypeScript', 'Tailwind'];
  }
  const displayTags = tags.slice(0, 4);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group cursor-pointer relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      id={`project-card-${project.id}`}
    >
      {/* Outer container with BGMI-Style premium glass profile */}
      <div className="aspect-[4/5] bg-[#0c1017]/45 backdrop-blur-xl border border-[#30363d]/60 rounded-3xl mb-6 flex items-center justify-center group-hover:border-[#58a6ff]/60 hover:shadow-[0_0_30px_rgba(88,166,255,0.22)] transition-all duration-500 overflow-hidden relative">
        
        {/* Background Project Area */}
        {project.link ? (
          <div className="absolute inset-0 z-0 overflow-hidden bg-[#0d1117]/85">
            {shouldLoadIframe ? (
              <iframe 
                src={project.link} 
                className="w-[100%] h-[100%] border-none opacity-40 group-hover:opacity-100 transition-all duration-1000 pointer-events-none scale-[1.1] group-hover:scale-100 bg-[#0d1117]/85"
                title={project.title}
                loading="lazy"
              />
            ) : (
              // Ambient placeholder during cold idle
              <div className="absolute inset-0 bg-gradient-to-b from-[#161b22] to-[#0d1117] flex items-center justify-center">
                <div className="scale-75 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
                  {getProjectIcon(project.iconType, 80)}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="absolute inset-0 bg-[#58a6ff]/5 opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
        )}

        {/* Integrated Live-Vignette Frame */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(13,17,23,0.45)_70%,rgba(13,17,23,0.95)_100%)] pointer-events-none z-10 transition-all duration-500 group-hover:bg-[radial-gradient(circle_at_center,transparent_20%,rgba(13,17,23,0.3)_60%,rgba(13,17,23,0.9)_100%)]" />

        {/* Scanlines layer for Cyberpunk digital monitor vibe */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.015)_50%,rgba(0,0,0,0.12)_50%)] bg-[length:100%_4px] pointer-events-none z-[11] opacity-30 group-hover:opacity-15 transition-opacity duration-500" />

        {/* Premium Frosted Glass Overlay layer (fades/sharpens on hover to clear live iframe) */}
        <div className="absolute inset-0 z-[12] backdrop-blur-md group-hover:backdrop-blur-none bg-gradient-to-b from-transparent via-[#0d1117]/30 to-[#030712]/95 group-hover:bg-gradient-to-b group-hover:from-transparent group-hover:via-black/20 group-hover:to-black/85 transition-all duration-700 pointer-events-none" />

        {/* Structural internal frame guide */}
        <div className="absolute inset-3.5 z-[13] border border-white/5 rounded-[20px] group-hover:border-[#58a6ff]/25 pointer-events-none transition-all duration-500" />

        {/* Cyberpunk HUD Corner Brackets that flare on hover */}
        {/* Top Left */}
        <div className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-[#58a6ff]/30 group-hover:border-[#58a6ff] group-hover:scale-105 group-hover:shadow-[0_0_12px_rgba(88,166,255,0.6)] transition-all duration-300 pointer-events-none z-20" />
        {/* Top Right */}
        <div className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-[#58a6ff]/30 group-hover:border-[#58a6ff] group-hover:scale-105 group-hover:shadow-[0_0_12px_rgba(88,166,255,0.6)] transition-all duration-300 pointer-events-none z-20" />
        {/* Bottom Left */}
        <div className="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 border-[#58a6ff]/30 group-hover:border-[#58a6ff] group-hover:scale-105 group-hover:shadow-[0_0_12px_rgba(88,166,255,0.6)] transition-all duration-300 pointer-events-none z-20" />
        {/* Bottom Right */}
        <div className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-[#58a6ff]/30 group-hover:border-[#58a6ff] group-hover:scale-105 group-hover:shadow-[0_0_12px_rgba(88,166,255,0.6)] transition-all duration-300 pointer-events-none z-20" />

        {/* Foreground Information */}
        <div className="absolute bottom-8 left-8 right-8 z-20 transform group-hover:-translate-y-2 transition-transform duration-500 text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#58a6ff]/80 font-mono tracking-widest uppercase">{project.category}</span>
            <span className="text-[8px] font-mono text-white/20 tracking-tight select-none">ID://{(index + 1).toString().padStart(3, '0')}</span>
          </div>

          <h3 className="text-xl font-bold text-white mb-2.5 uppercase tracking-tight leading-tight group-hover:text-[#58a6ff] transition-colors duration-300">
            {project.title}
          </h3>

          {/* Tech Stack Specification Pills representing high Sthira organization */}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {displayTags.map((tag, i) => (
              <span 
                key={i}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#0d1117]/85 group-hover:bg-[#58a6ff]/10 text-white/60 group-hover:text-[#58a6ff] border border-white/5 group-hover:border-[#58a6ff]/25 text-[9px] font-mono tracking-wider uppercase shadow-sm transition-all duration-300"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#30363d] group-hover:bg-[#58a6ff] transition-colors duration-300" />
                {tag}
              </span>
            ))}
          </div>

          <div className="w-12 h-0.5 bg-[#58a6ff] mt-4 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
        </div>

        {/* Desktop Hover Icon Accent in background layer */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-[0.12] transition-all duration-1000 transform group-hover:scale-[2] pointer-events-none z-10">
          {getProjectIcon(project.iconType, 120)}
        </div>
      </div>
    </motion.div>
  );
};
