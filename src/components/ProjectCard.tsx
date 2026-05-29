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
      <div className="aspect-[4/5] bg-[#161b22] border border-[#30363d] rounded-3xl mb-6 flex items-center justify-center group-hover:border-[#58a6ff]/50 hover:shadow-[0_0_20px_rgba(88,166,255,0.15)] transition-all overflow-hidden relative">
        {project.link ? (
          <div className="absolute inset-0 z-0 overflow-hidden bg-[#0d1117]">
            {shouldLoadIframe ? (
              <iframe 
                src={project.link} 
                className="w-[100%] h-[100%] border-none opacity-40 group-hover:opacity-100 transition-all duration-1000 pointer-events-none scale-[1.1] group-hover:scale-100 bg-[#0d1117]"
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
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-[#0d1117]/50 to-transparent group-hover:opacity-20 transition-opacity duration-500"></div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-[#58a6ff]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        )}
        
        <div className="absolute bottom-8 left-8 right-8 z-20 transform group-hover:-translate-y-2 transition-transform duration-500">
          <div className="text-[9px] font-bold text-[#58a6ff] uppercase tracking-widest mb-2">{project.category}</div>
          <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight leading-tight">{project.title}</h3>
          <div className="w-10 h-0.5 bg-[#58a6ff] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
        </div>

        {/* Desktop Hover Icon Accent */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-20 transition-all duration-1000 transform group-hover:scale-[2] pointer-events-none">
          {getProjectIcon(project.iconType, 120)}
        </div>
      </div>
    </motion.div>
  );
};
