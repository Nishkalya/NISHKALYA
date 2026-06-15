import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Github, ExternalLink, Cpu } from 'lucide-react';
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
  const cardRef = useRef<HTMLDivElement>(null);
  
  // States for interactive 3D Tilt and custom holographic glint reflection
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glintX, setGlintX] = useState(50);
  const [glintY, setGlintY] = useState(50);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert positions to percentages for custom glint style
    const glintPercentX = (x / rect.width) * 100;
    const glintPercentY = (y / rect.height) * 100;
    setGlintX(glintPercentX);
    setGlintY(glintPercentY);

    // Subtle 3D tilt: max 10 degrees to keep it professional but responsive
    const tiltX = -((y / rect.height) - 0.5) * 12;
    const tiltY = ((x / rect.width) - 0.5) * 12;
    setRotateX(tiltX);
    setRotateY(tiltY);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    setHoveredProject(project);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
    setGlintX(50);
    setGlintY(50);
    setHoveredProject(null);
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
  const displayTags = tags.slice(0, 3); // 3 clear premium chips

  // Compute a highly realistic and smart GitHub link related to project if none exists directly
  const getGithubUrl = () => {
    if (project.link?.includes('github.io')) {
      const match = project.link.match(/https?:\/\/([^.]+)\.github\.io\/([^/]+)/);
      if (match) {
        return `https://github.com/${match[1]}/${match[2]}`;
      }
    }
    return 'https://github.com/Nishkalya/' + project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  };
  const githubUrl = getGithubUrl();

  // Project credit card number generation (elegant futuristic ATM formatting)
  const cardNo = `4128  7034  8911  00${(index + 1).toString().padStart(2, '0')}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="perspective-[1200px]"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        id={`project-card-${project.id}`}
        style={{
          transform: `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(${isHovered ? '-8px' : '0px'})`,
          transition: isHovered ? 'none' : 'transform 300ms cubic-bezier(0.25, 1, 0.5, 1)',
        }}
        className="relative overflow-hidden cursor-pointer select-none rounded-[24px] bg-gradient-to-br from-[#0a0f1d] via-[#070b13] to-[#04060b] border border-[#1f293d] hover:border-[#58a6ff]/50 shadow-[0_4px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_0_35px_rgba(88,166,255,0.25)] flex flex-col justify-between p-6 h-[460px] md:h-[480px] w-full max-w-sm mx-auto group duration-300"
      >
        {/* Holographic light sweep / moving reflection overlay */}
        <div 
          className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
          style={{
            background: `radial-gradient(circle at ${glintX}% ${glintY}%, rgba(88, 166, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 35%, transparent 70%)`
          }}
        />

        {/* Diagonal high-end metallic/holographic reflection line sweep */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 rounded-[24px]">
          <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[linear-gradient(110deg,transparent_45%,rgba(255,255,255,0.04)_48%,rgba(255,255,255,0.12)_50%,rgba(255,255,255,0.04)_52%,transparent_55%)] transform rotate-[15deg] group-hover:animate-shine pointer-events-none" />
        </div>

        {/* Fine inner border guide simulating high-end card margins */}
        <div className="absolute inset-3.5 border border-white/[0.03] group-hover:border-[#58a6ff]/10 rounded-[18px] pointer-events-none transition-colors duration-300" />

        {/* ================= HEADER SECTION ================= */}
        <div className="flex items-center justify-between z-20 relative">
          {/* Card Branding or Credit Type */}
          <div className="flex items-center gap-2">
            <Cpu size={14} className="text-[#58a6ff] opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
            <span className="text-[10px] font-bold text-[#8b949e] uppercase tracking-[0.25em] font-sans">
              CYBER PLATINUM
            </span>
          </div>

          {/* Golden EMV Chip & Contactless sign */}
          <div className="flex items-center gap-3">
            {/* Contactless waves symbol */}
            <svg className="w-4 h-4 text-white/20 group-hover:text-[#58a6ff]/40 rotate-90 transition-colors pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h.01" />
              <path d="M12 12a5 5 0 0 0-5-5" />
              <path d="M19 12a10 10 0 0 0-10-10" />
            </svg>
            
            {/* Premium Gold Chip */}
            <div className="w-9 h-7 rounded-md bg-gradient-to-br from-[#f2cc81] via-[#ffffff] to-[#cfa151] border border-amber-300/20 p-1 flex flex-col justify-between overflow-hidden shadow-sm">
              <div className="flex justify-between h-full w-full opacity-90">
                <div className="w-[30%] border-r border-black/10 h-full"></div>
                <div className="w-[40%] flex flex-col justify-between h-full">
                  <div className="h-[30%] border-b border-black/10 w-full"></div>
                  <div className="h-[30%] border-b border-black/10 w-full"></div>
                </div>
                <div className="w-[30%] border-l border-black/10 h-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= MIDDLE SECTION ================= */}
        <div className="flex-1 flex flex-col justify-center py-6 z-20 relative text-left">
          {/* [ Project Category ] Bracketed Style */}
          <div className="mb-2 text-[#58a6ff] text-[10px] font-bold uppercase tracking-[0.2em] font-mono flex items-center gap-1">
            <span>[</span>
            <span>{project.category || "DEVELOPMENT"}</span>
            <span>]</span>
          </div>

          {/* PROJECT NAME (Large bold heading) */}
          <h3 className="text-xl md:text-2xl font-extrabold text-white uppercase tracking-tight leading-tight group-hover:text-[#58a6ff] transition-colors duration-300 font-sans mb-3">
            {project.title}
          </h3>

          {/* Short 2-line description */}
          <p className="text-[#8b949e] text-xs font-light tracking-wide leading-relaxed line-clamp-2 mb-4 h-10">
            {project.desc}
          </p>

          {/* ATM Style Card Monospace Project Number at the top-right of information block */}
          <div className="mt-2 pt-2 border-t border-white/[0.04] group-hover:border-[#58a6ff]/10">
            <span className="text-[11px] font-mono tracking-[0.22em] text-white/50 group-hover:text-white/80 transition-colors">
              {cardNo}
            </span>
          </div>
        </div>

        {/* ================= FOOTER SECTION ================= */}
        <div className="z-20 relative space-y-4">
          {/* Bottom-left/Middle Technology Chips */}
          <div className="flex flex-wrap gap-1.5 justify-start">
            {displayTags.map((tag, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2 py-0.5 rounded bg-[#0d121f]/90 border border-white/[0.06] group-hover:border-[#58a6ff]/20 text-[9px] font-mono tracking-wider text-white/50 group-hover:text-[#58a6ff] transition-all uppercase"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Action Buttons: [ View Project ] and [ GitHub ] */}
          <div className="flex items-center gap-2.5 pt-1">
            {/* View Project Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
              className="flex-1 py-2 px-3 bg-gradient-to-r from-[#162235] to-[#111a28] hover:from-[#58a6ff] hover:to-[#1a73e8] border border-[#303d52] hover:border-[#58a6ff] text-[10px] font-bold tracking-widest uppercase text-white hover:text-black rounded-lg transition-all duration-300 flex items-center justify-center gap-1.5 hover:shadow-[0_0_15px_rgba(88,166,255,0.4)]"
            >
              <ExternalLink size={11} className="shrink-0" />
              View Project
            </button>

            {/* GitHub Link Button */}
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="py-2 px-3 bg-[#0d1117] hover:bg-[#161b22] border border-[#21262d] hover:border-white/40 text-[10px] font-bold tracking-widest uppercase text-[#8b949e] hover:text-white rounded-lg transition-all duration-300 flex items-center justify-center gap-1.5 shrink-0"
            >
              <Github size={11} className="shrink-0" />
              GitHub
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
