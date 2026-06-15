import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, 
  Zap, 
  Check, 
  X, 
  Plus, 
  Edit2, 
  Trash2, 
  Shield, 
  Settings, 
  Trash, 
  User as UserIcon, 
  Compass, 
  MessageSquare, 
  Star, 
  Clock, 
  ArrowRight, 
  Cpu, 
  Palette, 
  Activity,
  Smile,
  Sparkles,
  Award
} from 'lucide-react';

interface AdminContentEditorProps {
  websiteConfig: any;
  updateConfig: (config: any) => void;
  isConfigDirty: boolean;
  handlePublishConfig: () => Promise<void>;
  setLocalConfig: (config: any) => void;
  projects: any[];
  adminTestimonials: any[];
  handleEditProject: (project: any) => void;
  handleDeleteProject: (e: any, id: string) => void;
  handleAddTestimonial: () => void;
  handleEditTestimonial: (item: any) => void;
  handleDeleteTestimonial: (e: any, id: string) => void;
  activeContentSection: 'hero' | 'theme' | 'about' | 'services' | 'platforms' | 'projects' | 'testimonials' | 'process' | 'techStack';
  setActiveContentSection: (section: any) => void;
}

export function AdminContentEditor({
  websiteConfig,
  updateConfig,
  isConfigDirty,
  handlePublishConfig,
  setLocalConfig,
  projects,
  adminTestimonials,
  handleEditProject,
  handleDeleteProject,
  handleAddTestimonial,
  handleEditTestimonial,
  handleDeleteTestimonial,
  activeContentSection,
  setActiveContentSection
}: AdminContentEditorProps) {
  // Localized state for dynamic platforms category actions
  const [showAddPlatformForm, setShowAddPlatformForm] = useState(false);
  const [newPlatformName, setNewPlatformName] = useState('');
  const [newPlatformDesc, setNewPlatformDesc] = useState('');
  const [newPlatformIcon, setNewPlatformIcon] = useState('link');
  const [adminSelectedPlatformId, setAdminSelectedPlatformId] = useState<string>('github');
  
  // Tag Inputs & Inline editing to replace standard browser prompt/confirms
  const [activeTagInputItemId, setActiveTagInputItemId] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState('');
  
  // Deletion pending flags
  const [serviceIndexToDelete, setServiceIndexToDelete] = useState<number | null>(null);
  const [platformIdToDelete, setPlatformIdToDelete] = useState<string | null>(null);
  const [itemIdToDelete, setItemIdToDelete] = useState<string | null>(null);

  // Skill inline-add input states
  const [showSkillInput, setShowSkillInput] = useState(false);
  const [newSkillText, setNewSkillText] = useState('');

  const displayPlatforms = websiteConfig.platforms || [];

  interface ContentTabItem {
    id: 'hero' | 'theme' | 'about' | 'services' | 'platforms' | 'projects' | 'testimonials' | 'process' | 'techStack';
    name: string;
    icon: React.ReactNode;
    desc: string;
    count?: number;
  }

  // Content Category definition
  const contentTabs: ContentTabItem[] = [
    { id: 'hero', name: 'Hero Header', icon: <Zap size={13} />, desc: 'Control the search card main fields, metrics, and tags.', count: websiteConfig.hero?.stats?.length || 0 },
    { id: 'theme', name: 'Theme & Style', icon: <Palette size={13} />, desc: 'Modify site branding highlight colors.' },
    { id: 'about', name: 'Biography / About', icon: <UserIcon size={13} />, desc: 'Configure bio paragraphs and professional skill tags.', count: websiteConfig.about?.skills?.length || 0 },
    { id: 'services', name: 'Core Services', icon: <Globe size={13} />, desc: 'Configure core services, benefits, and results cards.', count: websiteConfig.services?.length || 0 },
    { id: 'platforms', name: 'Connected Streams', icon: <Compass size={13} />, desc: 'Configure active code links and metric credentials.', count: displayPlatforms?.reduce((acc: number, p: any) => acc + (p.items?.length || 0), 0) },
    { id: 'projects', name: 'Portfolio Cases', icon: <Shield size={13} />, desc: 'Configure detailed project screens and demo cards.', count: projects.length },
    { id: 'testimonials', name: 'Client Feedback', icon: <MessageSquare size={13} />, desc: 'Manage recommendation ratings, quotes, names, and logos.', count: adminTestimonials.length },
    { id: 'process', name: 'Business Process', icon: <ArrowRight size={13} />, desc: 'Configure step workflows and codes.', count: websiteConfig.process?.steps?.length || 0 },
    { id: 'techStack', name: 'Tools & Stack', icon: <Cpu size={13} />, desc: 'Modify system categories and tool layers.', count: websiteConfig.techStack?.items?.length || 0 }
  ];

  // Aesthetic Preset Helpers
  const suggestHelper = (field: string, text: string) => {
    if (field === 'hero_heading') {
      updateConfig({ ...websiteConfig, hero: { ...websiteConfig.hero, heading: text } });
    } else if (field === 'hero_subheading') {
      updateConfig({ ...websiteConfig, hero: { ...websiteConfig.hero, subheading: text } });
    } else if (field === 'hero_badge') {
      updateConfig({ ...websiteConfig, hero: { ...websiteConfig.hero, badge: text } });
    } else if (field === 'about_badge') {
      updateConfig({ ...websiteConfig, about: { ...websiteConfig.about, badge: text } });
    } else if (field === 'about_heading') {
      updateConfig({ ...websiteConfig, about: { ...websiteConfig.about, heading: text } });
    }
  };

  return (
    <div className="space-y-8">
      {/* Alert Banner */}
      {isConfigDirty && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg border-dashed"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs ring-4 ring-amber-500/5 shrink-0">!</div>
            <div className="text-left">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Unpublished Layout Changes</h4>
              <p className="text-[11px] text-[#8b949e] font-light">You have local edits in your draft. Publish them to make them live on the public website.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={() => {
                setLocalConfig(JSON.parse(JSON.stringify(websiteConfig)));
              }}
              className="px-3.5 py-1.5 bg-transparent border border-[#30363d] text-xs text-[#8b949e] hover:text-white rounded-lg hover:bg-[#21262d] font-semibold transition-all cursor-pointer"
            >
              Reset Draft
            </button>
            <button 
              onClick={handlePublishConfig}
              className="px-4 py-1.5 bg-[#238636] border border-[#2ea44f] text-xs text-white rounded-lg hover:bg-[#2eaa44] admin-glow font-bold transition-all cursor-pointer"
            >
              Publish Live
            </button>
          </div>
        </motion.div>
      )}

      {/* Grid Layout containing Sidebar and Active Editor panel */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
        {/* Navigation Rail */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-4 space-y-2 lg:sticky lg:top-36">
          <div className="px-3 py-2 text-[10px] font-bold text-[#8b949e] uppercase tracking-[0.2em] font-mono border-b border-[#30363d]/60 pb-3 mb-3">
            Editor Sections
          </div>
          
          <div className="space-y-1 max-h-[50vh] lg:max-h-none overflow-y-auto custom-scrollbar">
            {contentTabs.map((tab) => {
              const isActive = activeContentSection === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveContentSection(tab.id)}
                  className={`relative w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                    isActive 
                      ? 'bg-[#21262d] text-[#58a6ff] border-[#30363d] shadow-[0_0_15px_rgba(88,166,255,0.06)] font-semibold' 
                      : 'text-[#8b949e] border-transparent hover:text-white hover:bg-[#161b22]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-[#58a6ff]' : 'text-[#8b949e]'}>
                      {tab.icon}
                    </span>
                    <span className="text-xs">{tab.name}</span>
                  </div>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-[#30363d]/60 text-zinc-300 font-mono">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Content Editor Viewport */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeContentSection}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 md:p-8 shadow-sm space-y-6"
            >
              {/* Active Section Banner */}
              <div className="border-b border-[#30363d]/50 pb-5 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    {contentTabs.find(t => t.id === activeContentSection)?.icon}
                    {contentTabs.find(t => t.id === activeContentSection)?.name}
                  </h3>
                  <p className="text-xs text-[#8b949e] font-light mt-1">
                    {contentTabs.find(t => t.id === activeContentSection)?.desc}
                  </p>
                </div>
                {isConfigDirty && (
                  <button 
                    onClick={handlePublishConfig}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#238636] border border-[#2ea44f] text-white rounded-lg text-xs font-bold hover:bg-[#2eaa44] admin-glow transition-all cursor-pointer text-center"
                  >
                    <Check size={12} /> Publish Live
                  </button>
                )}
              </div>

              {/* 1. HERO SECTION EDITOR */}
              {activeContentSection === 'hero' && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Badge */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <label className="block text-[8px] font-extrabold uppercase tracking-widest text-[#8b949e] font-mono">Badge Text</label>
                        <div className="flex gap-1.5">
                          <button onClick={() => suggestHelper('hero_badge', 'SYSTEM_CORE')} className="text-[7.5px] font-mono text-[#58a6ff] hover:underline">preset 1</button>
                          <button onClick={() => suggestHelper('hero_badge', 'STABLE_BUILD_2026')} className="text-[7.5px] font-mono text-[#58a6ff] hover:underline">preset 2</button>
                        </div>
                      </div>
                      <input 
                        value={websiteConfig.hero?.badge || ''}
                        onChange={(e) => updateConfig({ ...websiteConfig, hero: { ...websiteConfig.hero, badge: e.target.value }})}
                        className="w-full bg-[#0d1117] border border-[#30363d]/80 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#58a6ff]/70 transition-all focus:ring-1 focus:ring-[#58a6ff]/70 focus:shadow-[0_0_15px_rgba(88,166,255,0.08)]"
                      />
                    </div>

                    {/* Heading */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <label className="block text-[8px] font-extrabold uppercase tracking-widest text-[#8b949e] font-mono">Main Heading</label>
                        <div className="flex gap-1.5">
                          <button onClick={() => suggestHelper('hero_heading', 'Architecting robust <span className="text-[#58a6ff]">digital ecosystems</span>')} className="text-[7.5px] font-mono text-[#58a6ff] hover:underline">ideas</button>
                        </div>
                      </div>
                      <input 
                        value={websiteConfig.hero?.heading || ''}
                        onChange={(e) => updateConfig({ ...websiteConfig, hero: { ...websiteConfig.hero, heading: e.target.value }})}
                        className="w-full bg-[#0d1117] border border-[#30363d]/80 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#58a6ff]/70 transition-all focus:ring-1 focus:ring-[#58a6ff]/70 focus:shadow-[0_0_15px_rgba(88,166,255,0.08)]"
                      />
                    </div>

                    {/* Subheading */}
                    <div className="md:col-span-2 space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <label className="block text-[8px] font-extrabold uppercase tracking-widest text-[#8b949e] font-mono">Subheading Summary</label>
                        <div className="flex gap-1.5">
                          <button onClick={() => suggestHelper('hero_subheading', 'Precision web engineering. Helping high-growth corporate networks establish robust, low-latency cloud systems with modern responsive interfaces.')} className="text-[7.5px] font-mono text-[#58a6ff] hover:underline">preset 1</button>
                        </div>
                      </div>
                      <textarea 
                        rows={3}
                        value={websiteConfig.hero?.subheading || ''}
                        onChange={(e) => updateConfig({ ...websiteConfig, hero: { ...websiteConfig.hero, subheading: e.target.value }})}
                        className="w-full bg-[#0d1117] border border-[#30363d]/80 rounded-xl px-4 py-3 text-xs text-white outline-none resize-none focus:border-[#58a6ff]/70 transition-all focus:ring-1 focus:ring-[#58a6ff]/70 focus:shadow-[0_0_15px_rgba(88,166,255,0.08)]"
                      />
                    </div>

                    {/* Hero Stats */}
                    <div className="md:col-span-2 space-y-3 pt-2">
                      <label className="block text-[8px] font-extrabold uppercase tracking-widest text-[#8b949e] px-1 font-mono">Metrics Indicators</label>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {websiteConfig.hero?.stats?.map((stat: any, i: number) => (
                          <div key={i} className="space-y-2 p-3 bg-[#0d1117] border border-[#30363d]/80 rounded-xl relative group">
                            <input 
                              value={stat.label}
                              onChange={(e) => {
                                const newStats = [...websiteConfig.hero.stats];
                                newStats[i] = { ...stat, label: e.target.value };
                                updateConfig({ ...websiteConfig, hero: { ...websiteConfig.hero, stats: newStats }});
                              }}
                              placeholder="Label"
                              className="w-full text-[9px] font-bold uppercase tracking-wider outline-none text-[#58a6ff] bg-transparent font-mono"
                            />
                            <input 
                              value={stat.value}
                              onChange={(e) => {
                                const newStats = [...websiteConfig.hero.stats];
                                newStats[i] = { ...stat, value: e.target.value };
                                updateConfig({ ...websiteConfig, hero: { ...websiteConfig.hero, stats: newStats }});
                              }}
                              placeholder="Value"
                              className="w-full text-base font-extrabold outline-none text-white bg-transparent font-sans"
                            />
                            <button 
                              onClick={() => {
                                const newStats = websiteConfig.hero.stats.filter((_: any, idx: number) => idx !== i);
                                updateConfig({ ...websiteConfig, hero: { ...websiteConfig.hero, stats: newStats }});
                              }}
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#21262d] text-[#8b949e] hover:text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-[#30363d] cursor-pointer"
                            >
                              <X size={8} />
                            </button>
                          </div>
                        ))}
                        <button 
                          onClick={() => {
                            const newStats = [...(websiteConfig.hero?.stats || []), { label: "NEW RATIO", value: "99%" }];
                            updateConfig({ ...websiteConfig, hero: { ...websiteConfig.hero, stats: newStats }});
                          }}
                          className="border border-dashed border-[#30363d] hover:border-[#58a6ff]/50 rounded-xl flex flex-col items-center justify-center text-[#8b949e] hover:text-white p-4 bg-transparent font-mono text-[9px] gap-1 cursor-pointer transition-colors"
                        >
                          <Plus size={12} /> ADD
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. THEME CONFIGURATION */}
              {activeContentSection === 'theme' && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Primary Color */}
                    <div className="space-y-2">
                      <label className="block text-[8px] font-extrabold uppercase tracking-widest text-[#8b949e] px-1 font-mono">Primary Neon Highlight Color</label>
                      <div className="flex gap-4">
                        <input 
                          type="color"
                          value={websiteConfig.colors?.primary || '#58a6ff'}
                          onChange={(e) => updateConfig({ ...websiteConfig, colors: { ...websiteConfig.colors, primary: e.target.value }})}
                          className="w-12 h-12 rounded-xl border border-[#30363d] cursor-pointer bg-transparent p-1"
                        />
                        <input 
                          value={websiteConfig.colors?.primary || '#58a6ff'}
                          onChange={(e) => updateConfig({ ...websiteConfig, colors: { ...websiteConfig.colors, primary: e.target.value }})}
                          className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#58a6ff]/70 transition-all font-mono"
                        />
                      </div>
                    </div>

                    {/* Secondary Color */}
                    <div className="space-y-2">
                      <label className="block text-[8px] font-extrabold uppercase tracking-widest text-[#8b949e] px-1 font-mono">Secondary Accent Color</label>
                      <div className="flex gap-4">
                        <input 
                          type="color"
                          value={websiteConfig.colors?.secondary || '#238636'}
                          onChange={(e) => updateConfig({ ...websiteConfig, colors: { ...websiteConfig.colors, secondary: e.target.value }})}
                          className="w-12 h-12 rounded-xl border border-[#30363d] cursor-pointer bg-transparent p-1"
                        />
                        <input 
                          value={websiteConfig.colors?.secondary || '#238636'}
                          onChange={(e) => updateConfig({ ...websiteConfig, colors: { ...websiteConfig.colors, secondary: e.target.value }})}
                          className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#58a6ff]/70 transition-all font-mono"
                        />
                      </div>
                    </div>

                    {/* Theme Presets */}
                    <div className="md:col-span-2 pt-2 space-y-2">
                      <label className="block text-[8px] font-extrabold uppercase tracking-widest text-[#8b949e] px-1 font-mono">Quick Brand Preset Combos</label>
                      <div className="flex flex-wrap gap-2.5">
                        <button 
                          onClick={() => updateConfig({ ...websiteConfig, colors: { primary: '#58a6ff', secondary: '#238636' } })}
                          className="px-3 py-1.5 rounded-full border border-[#30363d] hover:border-white bg-[#0d1117] text-[10px] text-zinc-300 font-mono transition-colors cursor-pointer"
                        >
                          🔵 Cosmic Slate (Blue/Green)
                        </button>
                        <button 
                          onClick={() => updateConfig({ ...websiteConfig, colors: { primary: '#3fb950', secondary: '#1f6feb' } })}
                          className="px-3 py-1.5 rounded-full border border-[#30363d] hover:border-white bg-[#0d1117] text-[10px] text-zinc-300 font-mono transition-colors cursor-pointer"
                        >
                          🟢 Orion Emerald (Emerald/Blue)
                        </button>
                        <button 
                          onClick={() => updateConfig({ ...websiteConfig, colors: { primary: '#f0883e', secondary: '#bc8cff' } })}
                          className="px-3 py-1.5 rounded-full border border-[#30363d] hover:border-white bg-[#0d1117] text-[10px] text-zinc-300 font-mono transition-colors cursor-pointer"
                        >
                          🟠 Solar Violet (Amber/Amethyst)
                        </button>
                        <button 
                          onClick={() => updateConfig({ ...websiteConfig, colors: { primary: '#ff7b72', secondary: '#8a63d2' } })}
                          className="px-3 py-1.5 rounded-full border border-[#30363d] hover:border-white bg-[#0d1117] text-[10px] text-zinc-300 font-mono transition-colors cursor-pointer"
                        >
                          🔴 Crimson Spark (Rose/Purple)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. ABOUT SECTION EDITOR */}
              {activeContentSection === 'about' && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Badge */}
                    <div className="space-y-2">
                      <label className="block text-[8px] font-extrabold uppercase tracking-widest text-[#8b949e] px-1 font-mono">Badge Text</label>
                      <input 
                        value={websiteConfig.about?.badge || ''}
                        onChange={(e) => updateConfig({ ...websiteConfig, about: { ...websiteConfig.about, badge: e.target.value }})}
                        className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#58a6ff]/70 transition-all"
                      />
                    </div>
                    {/* Heading */}
                    <div className="space-y-2">
                      <label className="block text-[8px] font-extrabold uppercase tracking-widest text-[#8b949e] px-1 font-mono">Heading</label>
                      <input 
                        value={websiteConfig.about?.heading || ''}
                        onChange={(e) => updateConfig({ ...websiteConfig, about: { ...websiteConfig.about, heading: e.target.value }})}
                        className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#58a6ff]/70 transition-all"
                      />
                    </div>

                    {/* Skill Badges (Tags) */}
                    <div className="md:col-span-2 space-y-2.5">
                      <label className="block text-[8px] font-extrabold uppercase tracking-widest text-[#8b949e] px-1 font-mono">Core Skills (Tags)</label>
                      <div className="flex flex-wrap gap-2 p-4 bg-[#0d1117] border border-[#30363d] rounded-xl">
                        {websiteConfig.about?.skills?.map((skill: string, i: number) => (
                          <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 bg-[#161b22] border border-[#30363d] rounded-full text-[10px] font-bold text-[#58a6ff] font-mono">
                            <span>{skill}</span>
                            <button 
                              onClick={() => {
                                const newSkills = websiteConfig.about.skills.filter((_: any, idx: number) => idx !== i);
                                updateConfig({ ...websiteConfig, about: { ...websiteConfig.about, skills: newSkills }});
                              }}
                              className="text-[#8b949e] hover:text-red-500 transition-colors ml-1 cursor-pointer"
                            >
                              <X size={8} />
                            </button>
                          </div>
                        ))}
                        
                        {/* Inline Non-Prompt Skill Input Field */}
                        {showSkillInput ? (
                          <div className="flex items-center gap-1">
                            <input 
                              type="text"
                              value={newSkillText}
                              onChange={(e) => setNewSkillText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && newSkillText.trim()) {
                                  const newSkills = [...(websiteConfig.about.skills || []), newSkillText.trim()];
                                  updateConfig({ ...websiteConfig, about: { ...websiteConfig.about, skills: newSkills }});
                                  setNewSkillText('');
                                  setShowSkillInput(false);
                                } else if (e.key === 'Escape') {
                                  setShowSkillInput(false);
                                }
                              }}
                              className="bg-[#161b22] border border-[#58a6ff]/50 px-2 py-0.5 text-[9px] font-mono text-white rounded outline-none w-20"
                              placeholder="e.g. AWS"
                              autoFocus
                            />
                            <button 
                              onClick={() => {
                                if (newSkillText.trim()) {
                                  const newSkills = [...(websiteConfig.about.skills || []), newSkillText.trim()];
                                  updateConfig({ ...websiteConfig, about: { ...websiteConfig.about, skills: newSkills }});
                                }
                                setNewSkillText('');
                                setShowSkillInput(false);
                              }}
                              className="text-emerald-500 text-xs font-bold font-mono px-1 hover:text-emerald-400"
                            >
                              ✓
                            </button>
                            <button 
                              onClick={() => {
                                setShowSkillInput(false);
                                setNewSkillText('');
                              }}
                              className="text-red-500 text-xs font-bold font-mono px-1 hover:text-red-400"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setShowSkillInput(true)}
                            className="px-2.5 py-1 border border-dashed border-[#30363d] rounded-full text-[10px] text-[#8b949e] hover:text-white font-mono bg-transparent cursor-pointer"
                          >
                            + Tag
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Paragraphs */}
                    <div className="md:col-span-2 space-y-3">
                      <label className="block text-[8px] font-extrabold uppercase tracking-widest text-[#8b949e] px-1 font-mono">Detailed Bio Paragraphs</label>
                      <div className="space-y-3">
                        {websiteConfig.about?.paragraphs?.map((p: string, i: number) => (
                          <div key={i} className="relative group">
                            <textarea 
                              rows={3}
                              value={p}
                              onChange={(e) => {
                                const newParas = [...websiteConfig.about.paragraphs];
                                newParas[i] = e.target.value;
                                updateConfig({ ...websiteConfig, about: { ...websiteConfig.about, paragraphs: newParas }});
                              }}
                              className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-xs text-zinc-200 outline-none focus:border-[#58a6ff]/70 transition-all resize-none"
                            />
                            <button 
                              onClick={() => {
                                const newParas = websiteConfig.about.paragraphs.filter((_: any, idx: number) => idx !== i);
                                updateConfig({ ...websiteConfig, about: { ...websiteConfig.about, paragraphs: newParas }});
                              }}
                              className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:text-red-400 transition-opacity bg-[#21262d] border border-[#30363d] rounded-md cursor-pointer"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                        <button 
                          onClick={() => {
                            updateConfig({ ...websiteConfig, about: { ...websiteConfig.about, paragraphs: [...(websiteConfig.about?.paragraphs || []), "New paragraph content..."] }});
                          }}
                          className="w-full py-2.5 bg-transparent border border-dashed border-[#30363d] text-[#8b949e] hover:text-white rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all font-mono cursor-pointer"
                        >
                          + Add Paragraph
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. SERVICES EDITOR */}
              {activeContentSection === 'services' && (
                <div className="space-y-6">
                  {/* Services Grid list */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {websiteConfig.services?.map((service: any, i: number) => (
                      <div key={i} className="p-5 bg-[#0d1117] border border-[#30363d] rounded-xl space-y-4 relative group">
                        <div className="flex justify-between items-start gap-4 pb-2 border-b border-[#30363d]/10">
                          <cite className="not-italic text-[9px] font-bold uppercase tracking-widest text-[#58a6ff] font-mono">Service ID: #{i+1}</cite>
                          {serviceIndexToDelete === i ? (
                            <div className="flex items-center gap-1 bg-[#21262d] border border-red-500/40 rounded-lg p-1 animate-pulse shrink-0">
                              <button
                                onClick={() => {
                                  const newServices = websiteConfig.services.filter((_: any, idx: number) => idx !== i);
                                  updateConfig({ ...websiteConfig, services: newServices });
                                  setServiceIndexToDelete(null);
                                }}
                                className="px-2 py-0.5 text-[8px] bg-red-600 hover:bg-red-500 text-white rounded font-mono font-bold uppercase cursor-pointer"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => setServiceIndexToDelete(null)}
                                className="px-2 py-0.5 text-[8px] bg-[#30363d] text-zinc-300 rounded font-mono font-bold uppercase cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => setServiceIndexToDelete(i)}
                              className="p-1.5 text-[#8b949e] hover:text-red-500 bg-[#21262d] border border-[#30363d] rounded-md transition-colors cursor-pointer"
                            >
                              <Trash2 size={11} />
                            </button>
                          )}
                        </div>

                        {/* Basic inputs */}
                        <div className="space-y-2">
                          <label className="block text-[8px] font-extrabold uppercase tracking-widest text-[#8b949e] font-mono">Service Name</label>
                          <input 
                            value={service.title}
                            onChange={(e) => {
                              const newServices = [...websiteConfig.services];
                              newServices[i] = { ...service, title: e.target.value };
                              updateConfig({ ...websiteConfig, services: newServices });
                            }}
                            className="w-full px-3 py-2 bg-[#161b22] border border-[#30363d] text-white rounded-lg text-xs outline-none"
                            placeholder="Service Title"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-[8px] font-extrabold uppercase tracking-widest text-[#8b949e] font-mono">Brief Description</label>
                          <textarea 
                            rows={2}
                            value={service.desc}
                            onChange={(e) => {
                              const newServices = [...websiteConfig.services];
                              newServices[i] = { ...service, desc: e.target.value };
                              updateConfig({ ...websiteConfig, services: newServices });
                            }}
                            className="w-full px-3 py-2 bg-[#161b22] border border-[#30363d] text-white rounded-lg text-xs resize-none outline-none"
                            placeholder="Service description summary..."
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-[8px] font-bold text-[#8b949e] uppercase tracking-widest font-mono">Why Core Matters</label>
                            <textarea 
                              rows={2}
                              value={service.why || ''}
                              onChange={(e) => {
                                const newServices = [...websiteConfig.services];
                                newServices[i] = { ...service, why: e.target.value };
                                updateConfig({ ...websiteConfig, services: newServices });
                              }}
                              className="w-full px-3 py-2 bg-[#161b22] border border-[#30363d] text-white rounded-lg text-[10px] resize-none outline-none leading-relaxed"
                              placeholder="Strategic why..."
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[8px] font-bold text-[#8b949e] uppercase tracking-widest font-mono">What We Deliver</label>
                            <textarea 
                              rows={2}
                              value={service.what || ''}
                              onChange={(e) => {
                                const newServices = [...websiteConfig.services];
                                newServices[i] = { ...service, what: e.target.value };
                                updateConfig({ ...websiteConfig, services: newServices });
                              }}
                              className="w-full px-3 py-2 bg-[#161b22] border border-[#30363d] text-white rounded-lg text-[10px] resize-none outline-none leading-relaxed"
                              placeholder="Action statement..."
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-[8px] font-extrabold uppercase tracking-widest text-[#8b949e] font-mono">Service Outcome Statement</label>
                          <input 
                            value={service.outcome || ''}
                            onChange={(e) => {
                              const newServices = [...websiteConfig.services];
                              newServices[i] = { ...service, outcome: e.target.value };
                              updateConfig({ ...websiteConfig, services: newServices });
                            }}
                            className="w-full px-3 py-2 bg-[#161b22] border border-[#30363d] text-white rounded-lg text-xs outline-none"
                            placeholder="Outcome lines..."
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-[8px] font-extrabold uppercase tracking-widest text-[#8b949e] font-mono">Detailed Action Bullets</label>
                          <div className="space-y-1.5">
                            {service.details?.map((detail: string, dIdx: number) => (
                              <div key={dIdx} className="flex gap-1.5">
                                <input 
                                  value={detail}
                                  onChange={(e) => {
                                    const newDetails = [...service.details];
                                    newDetails[dIdx] = e.target.value;
                                    const newServices = [...websiteConfig.services];
                                    newServices[i] = { ...service, details: newDetails };
                                    updateConfig({ ...websiteConfig, services: newServices });
                                  }}
                                  className="flex-1 px-2 py-1.5 bg-[#161b22] border border-[#30363d] text-[10px] text-[#c9d1d9] rounded-md outline-none"
                                />
                                <button 
                                  onClick={() => {
                                    const newDetails = service.details.filter((_: any, idx: number) => idx !== dIdx);
                                    const updatedServices = [...websiteConfig.services];
                                    updatedServices[i] = { ...service, details: newDetails };
                                    updateConfig({ ...websiteConfig, services: updatedServices });
                                  }}
                                  className="p-1 px-2 text-red-500 hover:text-red-400 bg-transparent"
                                >
                                  <X size={10} />
                                </button>
                              </div>
                            ))}
                            <button 
                              onClick={() => {
                                const newDetails = [...(service.details || []), "Custom workflow standard..."];
                                const newServices = [...websiteConfig.services];
                                newServices[i] = { ...service, details: newDetails };
                                updateConfig({ ...websiteConfig, services: newServices });
                              }}
                              className="w-full py-1.5 border border-dashed border-[#30363d] text-[#8b949e] hover:text-white rounded-lg text-[9px] font-mono cursor-pointer"
                            >
                              + Add Bullet Detail
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <button 
                      onClick={() => {
                        const newService = { 
                          title: "Next-gen Digital Strategy", 
                          desc: "Strategic advisory across modular digital platforms.", 
                          details: ["Agile deployment workflows", "Cloud Native operations"], 
                          outcome: "100% cloud resilience verified",
                          why: "Empowers start-up initiatives",
                          what: "Interactive infrastructure blueprint diagrams"
                        };
                        updateConfig({ ...websiteConfig, services: [...(websiteConfig.services || []), newService] });
                      }}
                      className="md:col-span-2 py-8 border border-dashed border-[#30363d] text-[#8b949e] hover:text-white hover:bg-[#0d1117]/30 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <Plus size={22} className="text-[#8b949e]" />
                      <span className="text-[10px] font-bold uppercase tracking-widest font-mono">Add New Service Card</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 5. PLATFORMS & PROFILES EDITOR */}
              {activeContentSection === 'platforms' && (
                <div className="space-y-6">
                  {/* Actions Bar */}
                  <div className="flex justify-between items-center bg-[#0d1117] p-4 rounded-xl border border-[#30363d] gap-4">
                    <cite className="not-italic text-xs font-mono text-zinc-300">Category list & Credentials editor</cite>
                    {!showAddPlatformForm && (
                      <button 
                        onClick={() => setShowAddPlatformForm(true)}
                        className="px-3.5 py-1.5 bg-[#238636] border border-[#2ea44f] rounded-lg text-[10px] font-bold text-white uppercase tracking-wider cursor-pointer font-mono"
                      >
                        + Add Category
                      </button>
                    )}
                  </div>

                  {/* Add Platform Form Box */}
                  {showAddPlatformForm && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-[#0d1117] border border-[#30363d]/80 rounded-xl space-y-4"
                    >
                      <div className="text-xs font-bold text-white font-mono uppercase tracking-widest">Create Platform Stream</div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[8px] font-extrabold uppercase text-[#8b949e] font-mono">Stream Name</label>
                          <input 
                            value={newPlatformName}
                            onChange={(e) => setNewPlatformName(e.target.value)}
                            placeholder="e.g. My GitLab, Cloud Certs..."
                            className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-xs outline-none text-white"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[8px] font-extrabold uppercase text-[#8b949e] font-mono">Icon Class</label>
                          <select 
                            value={newPlatformIcon}
                            onChange={(e) => setNewPlatformIcon(e.target.value)}
                            className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-xs outline-none text-white font-mono"
                          >
                            <option value="github">GitHub</option>
                            <option value="linkedin">LinkedIn</option>
                            <option value="website">Globe / Live Website</option>
                            <option value="hackerrank">HackerRank / Trophy</option>
                            <option value="leetcode">LeetCode / Terminal</option>
                            <option value="behance">Behance / Palette</option>
                            <option value="dribbble">Dribbble / Basketball</option>
                            <option value="youtube">YouTube / Video</option>
                            <option value="certificates">Certificates / Award Badge</option>
                            <option value="other">General Chain / Link</option>
                          </select>
                        </div>
                        <div className="flex items-end gap-2">
                          <button 
                            onClick={() => {
                              if (newPlatformName) {
                                const id = newPlatformName.toLowerCase().replace(/[^a-z0-9]/g, '-');
                                const newP = {
                                  id,
                                  name: newPlatformName,
                                  iconType: newPlatformIcon,
                                  description: newPlatformDesc || 'External stream portfolio connection.',
                                  items: []
                                };
                                updateConfig({ ...websiteConfig, platforms: [...displayPlatforms, newP] });
                                setAdminSelectedPlatformId(id);
                                setNewPlatformName('');
                                setNewPlatformDesc('');
                                setShowAddPlatformForm(false);
                              }
                            }}
                            className="px-4 py-2 bg-[#238636] border border-[#2ea44f] rounded-lg text-xs text-white font-bold cursor-pointer"
                          >
                            Save
                          </button>
                          <button 
                            onClick={() => {
                              setShowAddPlatformForm(false);
                              setNewPlatformName('');
                            }}
                            className="px-4 py-2 bg-transparent border border-[#30363d] rounded-lg text-xs text-[#8b949e] hover:text-white cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Platforms subtabs selector */}
                  <div className="flex flex-wrap gap-2 border-b border-[#30363d]/50 pb-3">
                    {displayPlatforms.map((p: any) => {
                      const isActive = adminSelectedPlatformId === p.id;
                      return (
                        <div key={p.id} className="flex items-center gap-1 bg-[#0d1117] rounded-lg border border-[#30363d] p-1">
                          <button 
                            onClick={() => setAdminSelectedPlatformId(p.id)}
                            className={`px-3 py-1 text-xs rounded transition-all cursor-pointer ${
                              isActive ? 'bg-[#21262d] text-white font-bold' : 'text-[#8b949e] hover:text-zinc-200'
                            }`}
                          >
                            {p.name} ({p.items?.length || 0})
                          </button>
                          
                          {/* Non-Prompt category removal */}
                          {platformIdToDelete === p.id ? (
                            <div className="flex gap-1 animate-pulse px-1 border-l border-[#30363d]">
                              <button 
                                onClick={() => {
                                  const updated = displayPlatforms.filter((item: any) => item.id !== p.id);
                                  updateConfig({ ...websiteConfig, platforms: updated });
                                  if (updated.length > 0) setAdminSelectedPlatformId(updated[0].id);
                                  setPlatformIdToDelete(null);
                                }}
                                className="text-red-500 text-[10px] font-bold hover:underline"
                              >
                                YES
                              </button>
                              <button 
                                onClick={() => setPlatformIdToDelete(null)}
                                className="text-zinc-400 text-[10px] font-bold hover:underline"
                              >
                                NO
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => setPlatformIdToDelete(p.id)}
                              className="text-[#8b949e] hover:text-red-500 p-1"
                              title="Delete platform category"
                            >
                              <X size={10} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Selected platform items list */}
                  {(() => {
                    const activeP = displayPlatforms.find((item: any) => item.id === adminSelectedPlatformId);
                    if (!activeP) return <div className="text-xs text-[#8b949e]">Select a system platforms stream.</div>;
                    const activePlatformIdx = displayPlatforms.findIndex((item: any) => item.id === adminSelectedPlatformId);

                    return (
                      <div className="space-y-6">
                        <div className="flex justify-between items-center bg-[#0d1117] p-3 rounded-lg border border-[#30363d]">
                          <div className="text-[11px] text-[#8b949e]">Editing contents of: <span className="font-bold text-white uppercase font-mono">{activeP.name}</span></div>
                          <button 
                            onClick={() => {
                              const newItem = {
                                id: Date.now().toString(),
                                title: "New Resource Link",
                                code: "VERIFIED_NODE",
                                link: "https://github.com",
                                description: "Detailed portfolio item node details.",
                                badges: ["Web", "Systems"],
                                stats: [{ label: "Metric", value: "Alpha" }]
                              };
                              const updatedItems = [...(activeP.items || []), newItem];
                              const updatedPlatforms = [...displayPlatforms];
                              updatedPlatforms[activePlatformIdx] = { ...activeP, items: updatedItems };
                              updateConfig({ ...websiteConfig, platforms: updatedPlatforms });
                            }}
                            className="px-3 py-1 bg-[#238636] border border-[#2ea44f] rounded text-[10px] font-bold text-white uppercase font-mono cursor-pointer"
                          >
                            + Add Link Item
                          </button>
                        </div>

                        {/* Items Grid */}
                        <div className="grid md:grid-cols-2 gap-6">
                          {activeP.items?.map((item: any, i: number) => (
                            <div key={item.id || i} className="p-4 bg-[#0d1117] border border-[#30363d] rounded-xl space-y-4 relative group">
                              <div className="flex justify-between items-center border-b border-[#30363d]/30 pb-2">
                                <cite className="not-italic text-[9px] font-mono font-bold text-[#58a6ff]">#{i+1}: {item.code || 'SHOWCASE'}</cite>
                                {itemIdToDelete === item.id ? (
                                  <div className="flex gap-1 animate-pulse text-[9px] font-bold">
                                    <span className="text-[#8b949e]">Confirm?</span>
                                    <button 
                                      onClick={() => {
                                        const updatedItems = activeP.items.filter((x: any) => x.id !== item.id);
                                        const updated = [...displayPlatforms];
                                        updated[activePlatformIdx] = { ...activeP, items: updatedItems };
                                        updateConfig({ ...websiteConfig, platforms: updated });
                                        setItemIdToDelete(null);
                                      }}
                                      className="text-red-500 hover:underline"
                                    >
                                      YES
                                    </button>
                                    <button 
                                      onClick={() => setItemIdToDelete(null)}
                                      className="text-zinc-400 hover:underline"
                                    >
                                      NO
                                    </button>
                                  </div>
                                ) : (
                                  <button 
                                    onClick={() => setItemIdToDelete(item.id)}
                                    className="text-[#8b949e] hover:text-red-500"
                                  >
                                    <X size={11} />
                                  </button>
                                )}
                              </div>

                              {/* Title and Code */}
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[8px] font-extrabold uppercase text-[#8b949e] font-mono">Ref Title</label>
                                  <input 
                                    value={item.title}
                                    onChange={(e) => {
                                      const updatedItems = [...activeP.items];
                                      updatedItems[i] = { ...item, title: e.target.value };
                                      const updated = [...displayPlatforms];
                                      updated[activePlatformIdx] = { ...activeP, items: updatedItems };
                                      updateConfig({ ...websiteConfig, platforms: updated });
                                    }}
                                    className="w-full px-2.5 py-1.5 bg-[#161b22] border border-[#30363d] rounded-lg text-xs outline-none text-white"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[8px] font-extrabold uppercase text-[#8b949e] font-mono">Internal Code</label>
                                  <input 
                                    value={item.code}
                                    onChange={(e) => {
                                      const updatedItems = [...activeP.items];
                                      updatedItems[i] = { ...item, code: e.target.value };
                                      const updated = [...displayPlatforms];
                                      updated[activePlatformIdx] = { ...activeP, items: updatedItems };
                                      updateConfig({ ...websiteConfig, platforms: updated });
                                    }}
                                    className="w-full px-2.5 py-1.5 bg-[#161b22] border border-[#30363d] rounded-lg text-xs outline-none text-white font-mono"
                                  />
                                </div>
                              </div>

                              {/* Link and Date */}
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[8px] font-extrabold uppercase text-[#8b949e] font-mono">Url Link</label>
                                  <input 
                                    value={item.link || ''}
                                    onChange={(e) => {
                                      const updatedItems = [...activeP.items];
                                      updatedItems[i] = { ...item, link: e.target.value };
                                      const updated = [...displayPlatforms];
                                      updated[activePlatformIdx] = { ...activeP, items: updatedItems };
                                      updateConfig({ ...websiteConfig, platforms: updated });
                                    }}
                                    className="w-full px-2.5 py-1.5 bg-[#161b22] border border-[#30363d] rounded-lg text-xs outline-none text-white"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[8px] font-extrabold uppercase text-[#8b949e] font-mono">Date Range</label>
                                  <input 
                                    value={item.date || ''}
                                    onChange={(e) => {
                                      const updatedItems = [...activeP.items];
                                      updatedItems[i] = { ...item, date: e.target.value };
                                      const updated = [...displayPlatforms];
                                      updated[activePlatformIdx] = { ...activeP, items: updatedItems };
                                      updateConfig({ ...websiteConfig, platforms: updated });
                                    }}
                                    className="w-full px-2.5 py-1.5 bg-[#161b22] border border-[#30363d] rounded-lg text-xs outline-none text-white"
                                  />
                                </div>
                              </div>

                              {/* Description */}
                              <div className="space-y-1">
                                <label className="text-[8px] font-extrabold uppercase text-[#8b949e] font-mono">Detailed summary description</label>
                                <textarea 
                                  rows={2}
                                  value={item.description}
                                  onChange={(e) => {
                                    const updatedItems = [...activeP.items];
                                    updatedItems[i] = { ...item, description: e.target.value };
                                    const updated = [...displayPlatforms];
                                    updated[activePlatformIdx] = { ...activeP, items: updatedItems };
                                    updateConfig({ ...websiteConfig, platforms: updated });
                                  }}
                                  className="w-full px-2.5 py-1.5 bg-[#161b22] border border-[#30363d] rounded-lg text-xs resize-none text-white outline-none"
                                />
                              </div>

                              {/* System Badge Tags editing */}
                              <div className="space-y-1.5">
                                <label className="text-[8px] font-extrabold uppercase text-[#8b949e] font-mono">System Badge Tags</label>
                                <div className="flex flex-wrap gap-1.5">
                                  {item.badges?.map((badge: string, bIdx: number) => (
                                    <div key={bIdx} className="flex items-center gap-1 px-2 py-0.5 bg-[#161b22] border border-[#30363d] rounded-full text-[9px] font-bold text-[#58a6ff] font-mono">
                                      <span>{badge}</span>
                                      <button 
                                        onClick={() => {
                                          const newBadges = item.badges.filter((_: any, idx: number) => idx !== bIdx);
                                          const updatedItems = [...activeP.items];
                                          updatedItems[i] = { ...item, badges: newBadges };
                                          const updated = [...displayPlatforms];
                                          updated[activePlatformIdx] = { ...activeP, items: updatedItems };
                                          updateConfig({ ...websiteConfig, platforms: updated });
                                        }}
                                        className="text-[#8b949e] hover:text-red-500 ml-1 cursor-pointer"
                                      >
                                        <X size={8} />
                                      </button>
                                    </div>
                                  ))}
                                  {activeTagInputItemId === item.id ? (
                                    <div className="flex items-center gap-1">
                                      <input 
                                        type="text"
                                        value={newTagName}
                                        onChange={(e) => setNewTagName(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter' && newTagName.trim()) {
                                            const newBadges = [...(item.badges || []), newTagName.trim()];
                                            const updatedItems = [...activeP.items];
                                            updatedItems[i] = { ...item, badges: newBadges };
                                            const updated = [...displayPlatforms];
                                            updated[activePlatformIdx] = { ...activeP, items: updatedItems };
                                            updateConfig({ ...websiteConfig, platforms: updated });
                                            setNewTagName('');
                                            setActiveTagInputItemId(null);
                                          } else if (e.key === 'Escape') {
                                            setActiveTagInputItemId(null);
                                            setNewTagName('');
                                          }
                                        }}
                                        className="bg-[#161b22] border border-[#58a6ff]/40 px-1 py-0.5 text-[9px] font-mono text-white rounded outline-none w-16"
                                        autoFocus
                                      />
                                      <button 
                                        onClick={() => {
                                          if (newTagName.trim()) {
                                            const newBadges = [...(item.badges || []), newTagName.trim()];
                                            const updatedItems = [...activeP.items];
                                            updatedItems[i] = { ...item, badges: newBadges };
                                            const updated = [...displayPlatforms];
                                            updated[activePlatformIdx] = { ...activeP, items: updatedItems };
                                            updateConfig({ ...websiteConfig, platforms: updated });
                                          }
                                          setNewTagName('');
                                          setActiveTagInputItemId(null);
                                        }}
                                        className="text-emerald-500 font-bold font-mono text-[9px]"
                                      >
                                        ✓
                                      </button>
                                      <button 
                                        onClick={() => {
                                          setActiveTagInputItemId(null);
                                          setNewTagName('');
                                        }}
                                        className="text-red-500 font-bold font-mono text-[9px]"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ) : (
                                    <button 
                                      onClick={() => setActiveTagInputItemId(item.id)}
                                      className="px-2 py-0.5 border border-dashed border-[#30363d] rounded-full text-[9px] text-[#8b949e] hover:text-white font-mono bg-transparent cursor-pointer"
                                    >
                                      + Tag
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Custom Stats Badges (Key value fields) */}
                              <div className="space-y-1.5 pt-1">
                                <label className="text-[8px] font-extrabold uppercase text-[#8b949e] font-mono">Operational Metrics (Key-Values)</label>
                                <div className="space-y-1.5">
                                  {item.stats?.map((stat: any, sIdx: number) => (
                                    <div key={sIdx} className="flex gap-1.5">
                                      <input 
                                        value={stat.label}
                                        onChange={(e) => {
                                          const newStats = [...item.stats];
                                          newStats[sIdx] = { ...stat, label: e.target.value };
                                          const updatedItems = [...activeP.items];
                                          updatedItems[i] = { ...item, stats: newStats };
                                          const updated = [...displayPlatforms];
                                          updated[activePlatformIdx] = { ...activeP, items: updatedItems };
                                          updateConfig({ ...websiteConfig, platforms: updated });
                                        }}
                                        placeholder="Stat Label"
                                        className="flex-1 px-2 py-1 text-[10px] bg-[#161b22] border border-[#30363d] text-zinc-300 rounded outline-none"
                                      />
                                      <input 
                                        value={stat.value}
                                        onChange={(e) => {
                                          const newStats = [...item.stats];
                                          newStats[sIdx] = { ...stat, value: e.target.value };
                                          const updatedItems = [...activeP.items];
                                          updatedItems[i] = { ...item, stats: newStats };
                                          const updated = [...displayPlatforms];
                                          updated[activePlatformIdx] = { ...activeP, items: updatedItems };
                                          updateConfig({ ...websiteConfig, platforms: updated });
                                        }}
                                        placeholder="Value"
                                        className="flex-1 px-2 py-1 text-[10px] bg-[#161b22] border border-[#30363d] text-white rounded outline-none font-bold"
                                      />
                                      <button 
                                        onClick={() => {
                                          const newStats = item.stats.filter((_: any, idx: number) => idx !== sIdx);
                                          const updatedItems = [...activeP.items];
                                          updatedItems[i] = { ...item, stats: newStats };
                                          const updated = [...displayPlatforms];
                                          updated[activePlatformIdx] = { ...activeP, items: updatedItems };
                                          updateConfig({ ...websiteConfig, platforms: updated });
                                        }}
                                        className="text-red-500 hover:text-red-400 p-1"
                                      >
                                        <X size={10} />
                                      </button>
                                    </div>
                                  ))}
                                  <button 
                                    onClick={() => {
                                      const newStats = [...(item.stats || []), { label: "NEW METRIC", value: "0" }];
                                      const updatedItems = [...activeP.items];
                                      updatedItems[i] = { ...item, stats: newStats };
                                      const updated = [...displayPlatforms];
                                      updated[activePlatformIdx] = { ...activeP, items: updatedItems };
                                      updateConfig({ ...websiteConfig, platforms: updated });
                                    }}
                                    className="w-full py-1 border border-dashed border-[#30363d]/70 text-[#8b949e] hover:text-white rounded text-[8px] font-mono"
                                  >
                                    + Add Stat Metric
                                  </button>
                                </div>
                              </div>

                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* 6. PORTFOLIO PROJECTS */}
              {activeContentSection === 'projects' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#30363d]/20 pb-4 mb-4">
                    <div>
                      <cite className="not-italic text-xs font-mono text-[#8b949e]">Interactive case list</cite>
                    </div>
                    <button 
                      onClick={() => handleEditProject({})} 
                      className="flex items-center gap-1 px-3 py-1.5 bg-[#238636] hover:bg-[#2eaa44] border border-[#2ea44f] rounded text-white text-xs font-semibold uppercase tracking-wider font-mono cursor-pointer shadow"
                    >
                      <Plus size={12} /> New Project Case
                    </button>
                  </div>

                  {/* List of Projects styled beautifully for content page */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {projects.map((p) => (
                      <div 
                        key={p.id} 
                        onClick={() => handleEditProject(p)}
                        className="p-4 bg-[#0d1117] hover:border-[#58a6ff]/40 border border-[#30363d] rounded-xl flex flex-col justify-between transition-all duration-300 relative group cursor-pointer"
                      >
                        <div className="flex gap-4 items-start mb-3">
                          {p.thumbnailUrl ? (
                            <img src={p.thumbnailUrl} alt={p.title} referrerPolicy="no-referrer" className="w-12 h-12 rounded-lg object-cover border border-[#30363d]/50 shrink-0" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-[#161b22] border border-[#30363d] flex items-center justify-center text-[#58a6ff] shrink-0 font-bold font-mono text-sm">
                              {p.title?.charAt(0) || 'P'}
                            </div>
                          )}
                          <div className="min-w-0 flex-grow">
                            <cite className="not-italic text-sm font-bold text-white group-hover:text-[#58a6ff] transition-colors truncate block">{p.title}</cite>
                            <span className="text-[10px] text-[#8b949e] font-mono truncate block">{p.category}</span>
                          </div>
                        </div>

                        <p className="text-zinc-400 text-xs line-clamp-2 italic mb-4 font-light">"{p.description || 'No summary configured'}"</p>

                        <div className="flex items-center justify-between border-t border-[#30363d]/30 pt-3 self-stretch" onClick={e=>e.stopPropagation()}>
                          <div className="flex gap-1.5 flex-wrap">
                            {p.tags?.slice(0, 2).map((t: string, idx: number) => (
                              <span key={idx} className="bg-[#161b22] border border-[#30363d] text-[8px] font-bold text-zinc-300 px-1.5 py-0.5 rounded font-mono uppercase">{t}</span>
                            ))}
                          </div>
                          
                          <div className="flex gap-1">
                            <button 
                              onClick={() => handleEditProject(p)}
                              className="p-1 px-2 border border-[#30363d] text-[#8b949e] hover:text-white rounded bg-transparent"
                            >
                              <Edit2 size={11} />
                            </button>
                            <button 
                              onClick={(e) => handleDeleteProject(e, p.id)}
                              className="p-1 px-2 border border-[#30363d] text-red-400 hover:text-red-500 rounded bg-transparent"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {projects.length === 0 && (
                      <div className="md:col-span-2 py-8 text-center text-xs text-[#8b949e] border border-dashed border-[#30363d] rounded-xl font-mono">
                        No portfolio cases registered yet.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 7. CLIENT TESTIMONIALS */}
              {activeContentSection === 'testimonials' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#30363d]/20 pb-4 mb-4">
                    <div>
                      <cite className="not-italic text-xs font-mono text-[#8b949e]">Client quote cards</cite>
                    </div>
                    <button 
                      onClick={handleAddTestimonial}
                      className="flex items-center gap-1 px-3 py-1.5 bg-[#238636] hover:bg-[#2eaa44] border border-[#2ea44f] rounded text-white text-xs font-semibold uppercase tracking-wider font-mono cursor-pointer shadow"
                    >
                      <Plus size={12} /> New Testimonial
                    </button>
                  </div>

                  {/* List of Quotes */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {adminTestimonials.map((item) => (
                      <div 
                        key={item.id} 
                        onClick={() => handleEditTestimonial(item)}
                        className="p-4 bg-[#0d1117] hover:border-[#58a6ff]/40 border border-[#30363d] rounded-xl flex flex-col justify-between transition-all duration-300 relative group cursor-pointer"
                      >
                        <div className="flex gap-3 items-start mb-3">
                          {item.avatarUrl ? (
                            <img src={item.avatarUrl} alt={item.author} referrerPolicy="no-referrer" className="w-10 h-10 rounded-full object-cover border border-[#30363d] shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-[#161b22] border border-[#30363d] flex items-center justify-center text-[#58a6ff] shrink-0 font-bold font-mono text-sm">
                              {item.author?.charAt(0) || 'U'}
                            </div>
                          )}
                          <div className="min-w-0 flex-grow">
                            <cite className="not-italic text-xs font-bold text-white group-hover:text-[#58a6ff] transition-colors block">{item.author}</cite>
                            <span className="text-[10px] text-[#8b949e] truncate block">{item.company || item.title}</span>
                          </div>
                        </div>

                        <p className="text-zinc-400 text-xs italic line-clamp-2 mb-4 font-light leading-relaxed">"{item.quote}"</p>

                        <div className="flex items-center justify-between border-t border-[#30363d]/30 pt-2.5 self-stretch" onClick={e=>e.stopPropagation()}>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: item.rating || 5 }).map((_, rIdx) => (
                              <Star key={rIdx} size={10} className="text-amber-400 fill-amber-400" />
                            ))}
                          </div>
                          <div className="flex gap-1">
                            <button 
                              onClick={() => handleEditTestimonial(item)}
                              className="p-1 px-2 border border-[#30363d] text-[#8b949e] hover:text-white rounded bg-transparent"
                            >
                              <Edit2 size={11} />
                            </button>
                            <button 
                              onClick={(e) => handleDeleteTestimonial(e, item.id)}
                              className="p-1 px-2 border border-[#30363d] text-red-400 hover:text-red-500 rounded bg-transparent font-sans"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {adminTestimonials.length === 0 && (
                      <div className="md:col-span-2 py-8 text-center text-xs text-[#8b949e] border border-dashed border-[#30363d] rounded-xl font-mono">
                        No client quotes found.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 8. BUSINESS PROCESS STEPS */}
              {activeContentSection === 'process' && (
                <div className="space-y-6">
                  {/* Basic settings headings */}
                  <div className="grid md:grid-cols-2 gap-6 p-4 bg-[#0d1117] rounded-xl border border-[#30363d]">
                    <div className="space-y-2">
                      <label className="block text-[8px] font-extrabold uppercase tracking-widest text-[#8b949e] px-1 font-mono">Badge Text</label>
                      <input 
                        value={websiteConfig.process?.badge || "How we work"}
                        onChange={(e) => updateConfig({ 
                          ...websiteConfig, 
                          process: { ...(websiteConfig.process || {}), badge: e.target.value } 
                        })}
                        className="w-full bg-[#161b22] border border-[#30363d] rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[8px] font-extrabold uppercase tracking-widest text-[#8b949e] px-1 font-mono">Section Heading</label>
                      <input 
                        value={websiteConfig.process?.heading || ""}
                        onChange={(e) => updateConfig({ 
                          ...websiteConfig, 
                          process: { ...(websiteConfig.process || {}), heading: e.target.value } 
                        })}
                        className="w-full bg-[#161b22] border border-[#30363d] rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="block text-[8px] font-extrabold uppercase tracking-widest text-[#8b949e] px-1 font-mono">Process Subheading</label>
                      <textarea 
                        rows={2}
                        value={websiteConfig.process?.subheading || ""}
                        onChange={(e) => updateConfig({ 
                          ...websiteConfig, 
                          process: { ...(websiteConfig.process || {}), subheading: e.target.value } 
                        })}
                        className="w-full bg-[#161b22] border border-[#30363d] rounded-xl px-3 py-2 text-xs text-white outline-none resize-none"
                      />
                    </div>
                  </div>

                  {/* Steps List */}
                  <div className="space-y-3 pt-2">
                    <label className="block text-[8px] font-extrabold uppercase tracking-widest text-[#8b949e] px-1 font-mono">Flow List Timeline</label>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {((websiteConfig.process?.steps || [])).map((step: any, sIdx: number) => (
                        <div key={sIdx} className="p-4 bg-[#0d1117] border border-[#30363d] rounded-xl space-y-3 relative group">
                          <div className="grid grid-cols-4 gap-2">
                            <input 
                              value={step.step}
                              onChange={(e) => {
                                const newSteps = [...(websiteConfig.process?.steps || [])];
                                newSteps[sIdx] = { ...step, step: e.target.value };
                                updateConfig({ ...websiteConfig, process: { ...websiteConfig.process, steps: newSteps } });
                              }}
                              className="bg-[#161b22] border border-[#30363d] rounded-lg px-2 py-1 text-xs text-white outline-none font-mono font-bold text-center"
                              placeholder="01"
                            />
                            <input 
                              value={step.title}
                              onChange={(e) => {
                                const newSteps = [...(websiteConfig.process?.steps || [])];
                                newSteps[sIdx] = { ...step, title: e.target.value };
                                updateConfig({ ...websiteConfig, process: { ...websiteConfig.process, steps: newSteps } });
                              }}
                              className="col-span-3 bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-1 text-xs text-white outline-none font-bold"
                              placeholder="Identify challenges"
                            />
                          </div>
                          <textarea 
                            rows={2}
                            value={step.desc}
                            onChange={(e) => {
                              const newSteps = [...(websiteConfig.process?.steps || [])];
                              newSteps[sIdx] = { ...step, desc: e.target.value };
                              updateConfig({ ...websiteConfig, process: { ...websiteConfig.process, steps: newSteps } });
                            }}
                            className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-1.5 text-xs text-[#8b949e] outline-none resize-none leading-relaxed"
                            placeholder="Detail steps..."
                          />
                          <button 
                            onClick={() => {
                              const newSteps = (websiteConfig.process?.steps || []).filter((_: any, idx: number) => idx !== sIdx);
                              updateConfig({ ...websiteConfig, process: { ...websiteConfig.process, steps: newSteps } });
                            }}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#21262d] text-[#8b949e] hover:text-red-500 rounded-full flex items-center justify-center border border-[#30363d] cursor-pointer"
                          >
                            <X size={8} />
                          </button>
                        </div>
                      ))}
                      <button 
                        onClick={() => {
                          const newSteps = [...(websiteConfig.process?.steps || []), { step: String((websiteConfig.process?.steps || []).length + 1).padStart(2, '0'), title: "Production rollout", desc: "Sailing securely behind reverse network layers." }];
                          updateConfig({ ...websiteConfig, process: { ...(websiteConfig.process || {}), steps: newSteps } });
                        }}
                        className="border border-dashed border-[#30363d] rounded-xl flex flex-col items-center justify-center text-[#8b949e] hover:text-white p-6 bg-transparent gap-1.5 cursor-pointer hover:border-[#58a6ff]/40 transition-colors"
                      >
                        <Plus size={16} />
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider">Add Process Card</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 9. TECHNOLOGY STACK */}
              {activeContentSection === 'techStack' && (
                <div className="space-y-6">
                  {/* Technology labels headings override */}
                  <div className="grid md:grid-cols-2 gap-6 p-4 bg-[#0d1117] rounded-xl border border-[#30363d]">
                    <div className="space-y-2">
                      <label className="block text-[8px] font-extrabold uppercase tracking-widest text-[#8b949e] px-1 font-mono">Badge Text</label>
                      <input 
                        value={websiteConfig.techStack?.badge || "The Ecosystem"}
                        onChange={(e) => updateConfig({ 
                          ...websiteConfig, 
                          techStack: { ...(websiteConfig.techStack || {}), badge: e.target.value } 
                        })}
                        className="w-full bg-[#161b22] border border-[#30363d] rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[8px] font-extrabold uppercase tracking-widest text-[#8b949e] px-1 font-mono">Heading</label>
                      <input 
                        value={websiteConfig.techStack?.heading || ""}
                        onChange={(e) => updateConfig({ 
                          ...websiteConfig, 
                          techStack: { ...(websiteConfig.techStack || {}), heading: e.target.value } 
                        })}
                        className="w-full bg-[#161b22] border border-[#30363d] rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="block text-[8px] font-extrabold uppercase tracking-widest text-[#8b949e] px-1 font-mono">Tech Subheading</label>
                      <textarea 
                        rows={2}
                        value={websiteConfig.techStack?.subheading || ""}
                        onChange={(e) => updateConfig({ 
                          ...websiteConfig, 
                          techStack: { ...(websiteConfig.techStack || {}), subheading: e.target.value } 
                        })}
                        className="w-full bg-[#161b22] border border-[#30363d] rounded-xl px-3 py-2 text-xs text-white outline-none resize-none"
                      />
                    </div>
                  </div>

                  {/* Stack items list representation */}
                  <div className="space-y-3 pt-2">
                    <label className="block text-[8px] font-extrabold uppercase tracking-widest text-[#8b949e] px-1 font-mono">Ecosystem layers and tools</label>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {((websiteConfig.techStack?.items || [])).map((item: any, iIdx: number) => (
                        <div key={iIdx} className="p-4 bg-[#0d1117] border border-[#30363d] rounded-xl space-y-3 relative group">
                          <div className="space-y-2">
                            <input 
                              value={item.label}
                              onChange={(e) => {
                                const newItems = [...(websiteConfig.techStack?.items || [])];
                                newItems[iIdx] = { ...item, label: e.target.value };
                                updateConfig({ ...websiteConfig, techStack: { ...websiteConfig.techStack, items: newItems } });
                              }}
                              className="bg-[#161b22] border border-[#30363d] rounded-lg px-2.5 py-1 text-[9px] text-[#58a6ff] outline-none font-mono font-bold uppercase tracking-wider w-full"
                              placeholder="e.g. Infrastructure"
                            />
                            <input 
                              value={item.value}
                              onChange={(e) => {
                                const newItems = [...(websiteConfig.techStack?.items || [])];
                                newItems[iIdx] = { ...item, value: e.target.value };
                                updateConfig({ ...websiteConfig, techStack: { ...websiteConfig.techStack, items: newItems } });
                              }}
                              className="bg-[#161b22] border border-[#30363d] rounded-lg px-2.5 py-1 text-xs text-white outline-none w-full"
                              placeholder="e.g. AWS / GCP / Terraform"
                            />
                          </div>
                          <button 
                            onClick={() => {
                              const newItems = (websiteConfig.techStack?.items || []).filter((_: any, idx: number) => idx !== iIdx);
                              updateConfig({ ...websiteConfig, techStack: { ...websiteConfig.techStack, items: newItems } });
                            }}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#21262d] text-[#8b949e] hover:text-red-500 rounded-full flex items-center justify-center border border-[#30363d] cursor-pointer"
                          >
                            <X size={8} />
                          </button>
                        </div>
                      ))}
                      <button 
                        onClick={() => {
                          const newItems = [...(websiteConfig.techStack?.items || []), { label: "NEW LAYER", value: "React Native / Swift / Kotlin" }];
                          updateConfig({ ...websiteConfig, techStack: { ...(websiteConfig.techStack || {}), items: newItems } });
                        }}
                        className="border border-dashed border-[#30363d] rounded-xl flex flex-col items-center justify-center text-[#8b949e] hover:text-white p-6 bg-transparent gap-1.5 cursor-pointer hover:border-[#58a6ff]/40 transition-colors"
                      >
                        <Plus size={16} />
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider">Add Tech Layer</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
