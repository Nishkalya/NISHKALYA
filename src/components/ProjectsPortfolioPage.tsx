import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  ExternalLink, 
  ArrowLeft, 
  Sparkles, 
  Cpu, 
  Database, 
  Smartphone, 
  Globe, 
  Building2, 
  ShoppingBag, 
  Users, 
  Bot, 
  Zap, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Coins, 
  Clock4, 
  Award, 
  ShieldCheck, 
  MessageSquare,
  HelpCircle,
  Briefcase,
  Layers,
  FileText,
  DollarSign,
  Maximize2
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  category: string;
  shortDesc: string;
  image: string;
  technologies: string[];
  keyFeatures: string[];
  overview: string;
  problem: string;
  solution: string;
  screenshots: string[];
  timeline: string;
  results: string;
  roi: string;
  timeSaved: string;
  costReduction: string;
  clientFeedback: {
    quote: string;
    clientName: string;
    role: string;
    company: string;
    avatar: string;
    rating: number;
  };
  liveDemoUrl?: string;
}

const SAMPLE_PROJECTS: Project[] = [
  {
    id: 'nishkalya-directory',
    name: "NISHKALYA Business Directory",
    category: "Business Directories",
    shortDesc: "High-performance national business networking and B2B discovery directory designed for seamless vendor onboarding, verified badges, and smart matching.",
    overview: "NISHKALYA Business Directory is a state-of-the-art catalog connecting certified enterprises and local services in India. Built with speed and local search optimization, it bridges the gap between buyers and trustworthy suppliers, empowering businesses with digital discovery channels.",
    problem: "Fragile verification mechanisms, slow search indexing page-loads, and unverified reviews led to high bounce rates and low trust transactions in traditional B2B directories.",
    solution: "We developed a real-time indexing database using Elasticsearch, integrated a strict multi-tiered KYC verification engine, and added AI-assisted product listing categorization which reduced onboarding cycle times.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop",
    screenshots: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=800&auto=format&fit=crop"
    ],
    technologies: ["React", "Next.js", "Node.js", "PostgreSQL", "Tailwind CSS", "AWS", "Elasticsearch"],
    keyFeatures: [
      "Smart Instant Search (< 100ms)",
      "Multi-factor Vendor Verification & KYC",
      "Interactive Location Mapping & Discovery",
      "Direct WhatsApp Lead Routing System",
      "AI-Generated Autocomplete Business Profiles"
    ],
    timeline: "8 Weeks",
    results: "Sub-100ms search latency across 100k+ records. Successfully grew active vendor onboarding by 40% with zero hardware scaling overhead.",
    roi: "310% increase in paid premium directory subscriptions within 6 months.",
    timeSaved: "12 hours per week per vendor team via automated profile generation.",
    costReduction: "30% reduction in customer support verification overhead.",
    clientFeedback: {
      quote: "Nishkalya transformed our directory into an incredibly fast lead machine! The verified badge system became our core USP overnight.",
      clientName: "Rajesh Mehta",
      role: "Managing Director",
      company: "IndiaTrade Connect",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120&auto=format&fit=crop",
      rating: 5
    },
    liveDemoUrl: "https://example.com/demo/directory"
  },
  {
    id: 'erp-system',
    name: "ERP Management System",
    category: "ERP Systems",
    shortDesc: "A comprehensive core ERP suite consolidating automated accounting, supply chain logistics, vendor billing, and multi-warehouse operations.",
    overview: "A custom cloud ERP designed to centralize production metrics, track procurement lifecycles, and unify corporate processes across distributed geographic locations with zero information silos.",
    problem: "The client operated with fragmented legacy spreadsheets, causing high error rates in resource planning, duplicated procurement requests, and delayed month-end financial closing.",
    solution: "A centralized cloud software hub with double-entry accounting ledger API integration, secure warehouse log sheets, and live transaction ledger auditing.",
    image: "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?q=80&w=800&auto=format&fit=crop",
    screenshots: [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800&auto=format&fit=crop"
    ],
    technologies: ["React", "Node.js", "PostgreSQL", "Docker", "AWS", "Tailwind CSS"],
    keyFeatures: [
      "Double-entry General Ledger Engine",
      "Multi-warehouse Inventory Synchronization",
      "Automated Multi-party Vendor Billing",
      "Granular Role-based Access Security",
      "Real-time Balance Sheet Autogenerators"
    ],
    timeline: "16 Weeks",
    results: "Maintained 99.9% resource allocation accuracy, eliminated manual accounting reconciliation tasks, and shortened financial month-ends enormously.",
    roi: "Saved over $120,000 in operational waste within the first 9 months of active deployment.",
    timeSaved: "Financial month-end reporting cycles compressed from 10 business days to just 2 hours.",
    costReduction: "45% reduction in manual data entry billing errors.",
    clientFeedback: {
      quote: "The ERP console is our company's nervous system now. We cannot imagine running our operations without this custom-tailored product. Accurate, clear, and perfectly stable.",
      clientName: "Ananya Sen",
      role: "Chief Operating Officer",
      company: "Vanguard Manufacturing",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=120&auto=format&fit=crop",
      rating: 5
    },
    liveDemoUrl: "https://example.com/demo/erp"
  },
  {
    id: 'inventory-gst',
    name: "Inventory & GST Software",
    category: "Web Applications",
    shortDesc: "Highly optimized billing, inventory control, and tax compliance software with automatic GST invoice generation, GSTR Gledg logs, and live stock tracking.",
    overview: "A lightweight, super-fast retail/wholesale sales platform built to automatically structure tax ledgers, process complex GST rules, and manage real-time inventory levels dynamically.",
    problem: "Small & medium enterprises struggle with complex, slow government tax billing tools, manual inventory counts, and incorrect HSN codes yielding auditing errors during annual accounting cycles.",
    solution: "An offline-capable sleek billing interface with instant GST calculation, a high-speed local cache, and an auto-populated HSN code catalog database.",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=800&auto=format&fit=crop",
    screenshots: [
      "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=800&auto=format&fit=crop"
    ],
    technologies: ["React", "Python", "MySQL", "Tailwind CSS", "Docker", "Next.js"],
    keyFeatures: [
      "Instant GST-compliant Invoicing (< 2s)",
      "Real-time Low Inventory Smart Warnings",
      "Automated HSN/SAC Code Intelligent Searcher",
      "One-click GSTR-1 & GSTR-3B Report Exporters",
      "Multi-terminal Local Sync and Offline Mode"
    ],
    timeline: "10 Weeks",
    results: "Achieved 100% compliant tax audit trail. Average counter invoice creation time dropped from 3 minutes to under 12 seconds with perfect accuracy.",
    roi: "Over 200% acceleration in checkout and retail billing processing capacity.",
    timeSaved: "4 hours daily spent on manual stocktaking and tax calculations.",
    costReduction: "Eliminated tax filing mistake penalties entirely, saving thousands annually.",
    clientFeedback: {
      quote: "Billing takes seconds now, and the GST reports are generated perfectly. The auto-inventory checks saved us from major stock shortages during peak seasons.",
      clientName: "Sanjay Gupta",
      role: "Founder & Director",
      company: "Apex Distributors",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=120&auto=format&fit=crop",
      rating: 5
    },
    liveDemoUrl: "https://example.com/demo/billing"
  },
  {
    id: 'ai-customer-agent',
    name: "AI Customer Support Agent",
    category: "AI Automation",
    shortDesc: "Advanced conversational support model connected dynamically to company knowledge bases, processing context-aware tickets, and routing anomalies.",
    overview: "We implemented custom neural search grounding and integrated Claude & Gemini models to autonomously answer multi-lingual client questions with extreme factual accuracy.",
    problem: "High volume of repetitive queries clogged user channels, inflating customer support response times to 24+ hours and escalating team anxiety.",
    solution: "A secure server-side proxy querying internal company docs using Vector Embeddings to serve instantaneous, safe, contextual guidelines and complete automated actions.",
    image: "https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?q=80&w=800&auto=format&fit=crop",
    screenshots: [
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop"
    ],
    technologies: ["React", "Python", "OpenAI", "Claude AI", "Supabase", "Node.js"],
    keyFeatures: [
      "Fully Autonomous 24/7 Multi-channel Dialogue Support",
      "Semantic Vector Document Grounding (No Hallucinations)",
      "Automatic Multi-lingual Sentiment Analysis",
      "Intelligent CRM Escalation & Ticket Routing",
      "Continuous Model Fine-tuning Analytics Interface"
    ],
    timeline: "6 Weeks",
    results: "78% conversations fully resolved by AI. Response wait times dropped to 0 seconds, with an ultra-clean CSAT elevation.",
    roi: "Over $8,500 monthly saved on outsourced contact center expenses.",
    timeSaved: "80% reduction in first-response time backlog.",
    costReduction: "70% customer operations support cost compression.",
    clientFeedback: {
      quote: "The AI agent has completely changed our business strategy. It answers with perfect accuracy in 3 languages, and scales without adding human overhead.",
      clientName: "David Vance",
      role: "VP of Global Support",
      company: "Logix Software Group",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=120&auto=format&fit=crop",
      rating: 5
    },
    liveDemoUrl: "https://example.com/demo/support-ai"
  },
  {
    id: 'hr-management',
    name: "HR Management System",
    category: "ERP Systems",
    shortDesc: "A modern human capital platform containing shift planning, automated payroll calculation, cloud document storage, and biometric clock integrations.",
    overview: "An inclusive enterprise platform designed to coordinate contractor and full-time employee lifetimes, manage multi-tier leave queries, and generate payroll stubs automatically.",
    problem: "Biometric systems were isolated from payroll software, leading to payroll calculation errors, missing leaves, and endless dispute tickets each month.",
    solution: "A unified custom web hub pulling real-time biometric terminal SDK logs and feeding them into a customizable payroll rules engine.",
    image: "https://images.unsplash.com/photo-1521791136364-728647526959?q=80&w=800&auto=format&fit=crop",
    screenshots: [
      "https://images.unsplash.com/photo-1542744094-3a31f103e35f?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop"
    ],
    technologies: ["React", "Node.js", "MySQL", "Tailwind CSS", "AWS", "Express"],
    keyFeatures: [
      "Biometric Terminal Hardware SDK Integration",
      "Dynamic Multi-level Leave Approval Workflows",
      "Automated Payroll and Local Benefit Formula Engine",
      "Integrated Employee Performance Goal Evaluator",
      "Encrypted Cloud Documents Vault"
    ],
    timeline: "12 Weeks",
    results: "Perfect payroll accuracy across 800+ employees. Absolute clarity on leave metrics and reduced employee processing payroll disputes to zero.",
    roi: "Saved 200+ HR manager hours every single fiscal quarter.",
    timeSaved: "95% faster payroll finalization processes.",
    costReduction: "Saved $5,000 monthly due to automated shift check-in fraud prevention.",
    clientFeedback: {
      quote: "HR used to spend days on attendance sheets each month. Now, the entire payroll processes in just 10 minutes with absolute zero errors.",
      clientName: "Meera Nair",
      role: "Head of HR",
      company: "Dynasty Retail Logistics",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop",
      rating: 5
    },
    liveDemoUrl: "https://example.com/demo/hrms"
  },
  {
    id: 'purchase-order-automation',
    name: "Purchase Order Automation",
    category: "AI Automation",
    shortDesc: "Intelligent PDF parser extracting line items, matching catalog prices, approving budget thresholds, and integrating into accounting systems.",
    overview: "An automated workflow engine parsing vendor bids and receipts using computer vision, and standardizing database orders without any manual entry.",
    problem: "Purchase coordinators manually entered thousands of line items from unstructured PDF receipts daily, leading to typing errors and pricing updates being missed.",
    solution: "An automated pipeline built on n8n and Claude AI extracting semantic data from documents with high-performance spatial parsing.",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800&auto=format&fit=crop",
    screenshots: [
      "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop"
    ],
    technologies: ["Claude AI", "n8n", "Node.js", "Python", "Docker", "PostgreSQL"],
    keyFeatures: [
      "Claude Document OCR Intelligent Extraction",
      "Smart Budget and Tiered level Threshold Approvers",
      "Automated n8n Webhook Router Architecture",
      "Duplicate Order Preventer Verification Engine",
      "Direct ERP Accounting Connector API Integration"
    ],
    timeline: "8 Weeks",
    results: "Processed over 40,000 PO documents with 99.4% accuracy, completely eliminating administrative backlog.",
    roi: "Over 500% speed increase in procurement business cycles.",
    timeSaved: "Saved 30 hours per week of manual data entering tasks.",
    costReduction: "Reduced vendor invoice processing validation costs by 65%.",
    clientFeedback: {
      quote: "Orders flow straight from our emails into the system within 30 seconds. This is pure digital magic. Highly professional engineering.",
      clientName: "Vikram Malhotra",
      role: "Procurement Director",
      company: "Horizon Infrastructure",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=120&auto=format&fit=crop",
      rating: 5
    },
    liveDemoUrl: "https://example.com/demo/po-automation"
  },
  {
    id: 'crm-solution',
    name: "CRM Solution",
    category: "CRM Systems",
    shortDesc: "An interactive, visual lead generation funnel featuring kanban pipeline, multi-channel email campaigns, integrated dialers, and automated lead scoring.",
    overview: "A custom lead monitoring application tracking customer touchpoints, optimizing conversion rates, and predicting customer lifespan values.",
    problem: "The sales team lost prospective leads due to manual email follow-up schedules, poor tracking notes, and lack of visual pipeline metrics.",
    solution: "A stunning visual Kanban dashboard with deep CRM APIs, tracking pixels, and automated action cues for outstanding prospect conversion.",
    image: "https://images.unsplash.com/photo-1552581230-c01374138857?q=80&w=800&auto=format&fit=crop",
    screenshots: [
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop"
    ],
    technologies: ["React", "Next.js", "Node.js", "PostgreSQL", "Tailwind CSS", "AWS"],
    keyFeatures: [
      "Smooth Drag-and-Drop Kanban Leads Board",
      "Email and SMS Automation Sequences",
      "Built-in SIP VoIP Soft-Dialing Engine",
      "Custom Lead Priority Scoring Algorithms",
      "Predictive Revenue Pipeline Charts & Diagnostics"
    ],
    timeline: "14 Weeks",
    results: "35% surge in client query conversion rates. Achieved 100% visible team accountability. Sales onboarding time dropped substantially.",
    roi: "Average sales revenues increased by 28% within standard 4 months.",
    timeSaved: "Sales managers save 10 hours of research tracking time per teammate weekly.",
    costReduction: "30% cheaper lead acquisition overhead via hyper-targeted re-engagement rules.",
    clientFeedback: {
      quote: "Our sales velocity skyrocketed. The visual Kanban and automated alerts mean no lead ever slips through the cracks again.",
      clientName: "Sophia Zhang",
      role: "VP of Business Development",
      company: "Altis Global",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=120&auto=format&fit=crop",
      rating: 5
    },
    liveDemoUrl: "https://example.com/demo/crm"
  },
  {
    id: 'ecommerce-platform',
    name: "E-Commerce Platform",
    category: "E-Commerce",
    shortDesc: "High-conversions digital storefront built with localized payment gateways, instant loading catalogs, smart checkout, and robust inventory management.",
    overview: "We created a premium headless shop optimized for maximum performance, multi-currency support, and instantaneous checkout workflows.",
    problem: "Traditional e-commerce templates were heavy and slow, leading to high cart abandonment rates and slow checkouts on rural mobile connections.",
    solution: "A Next.js headless frontend using high-performance edge content delivery, paired with dynamic cloud databases for fast checkouts.",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=800&auto=format&fit=crop",
    screenshots: [
      "https://images.unsplash.com/photo-1472851294608-062f824d296e?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop"
    ],
    technologies: ["React", "Next.js", "Node.js", "PostgreSQL", "Supabase", "Docker", "Tailwind CSS"],
    keyFeatures: [
      "Sub-second Headless Page Speeds (100% PageSpeed Score)",
      "Unified Localized UPI / Card Payment API Gateway",
      "Dynamic Real-time Discount Code Router Engine",
      "Direct Back-office Inventory Sync Gateways",
      "AI-driven product recommendations widget"
    ],
    timeline: "10 Weeks",
    results: "Cart abandonment dropped by 52%, page speed scores rose to 99/100, and checkout processing load speeds improved by 400%.",
    roi: "60% increase in checkout completions within 45 days post-migration.",
    timeSaved: "Warehouse packing operations accelerated by 18 hours per week via batch label printing.",
    costReduction: "35% lower server hosting fees compared to bloated previous templates.",
    clientFeedback: {
      quote: "The store is insanely fast on mobile grids. Sales soared immediately because checked items load without waiting spinners.",
      clientName: "David Miller",
      role: "E-commerce Director",
      company: "Luxe Apparel India",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=120&auto=format&fit=crop",
      rating: 5
    },
    liveDemoUrl: "https://example.com/demo/ecommerce"
  }
];

const FILTER_CATEGORIES = [
  "All Projects",
  "ERP Systems",
  "AI Automation",
  "Web Applications",
  "Mobile Apps",
  "CRM Systems",
  "E-Commerce",
  "Business Directories"
];

const TECH_BADGES = [
  { name: 'React', category: 'Frontend' },
  { name: 'Next.js', category: 'Frontend' },
  { name: 'Node.js', category: 'Backend' },
  { name: 'Python', category: 'Backend' },
  { name: 'MySQL', category: 'Database' },
  { name: 'PostgreSQL', category: 'Database' },
  { name: 'Supabase', category: 'Database' },
  { name: 'OpenAI', category: 'AI' },
  { name: 'Claude AI', category: 'AI' },
  { name: 'n8n', category: 'Automation' },
  { name: 'Docker', category: 'DevOps' },
  { name: 'AWS', category: 'Cloud' }
];

export default function ProjectsPortfolioPage() {
  const [activeFilter, setActiveFilter] = useState("All Projects");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // Contact / Demo Form State
  const [isDraweOpen, setIsDrawerOpen] = useState(false);
  const [inquiryType, setInquiryType] = useState<"Demo" | "Quote" | "General">("General");
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    projectInterest: 'ERP Management System',
    message: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("Overview");

  // Filter projects based on category
  const filteredProjects = activeFilter === "All Projects"
    ? SAMPLE_PROJECTS
    : SAMPLE_PROJECTS.filter(p => p.category.toLowerCase() === activeFilter.toLowerCase());



  const handleOpenInquiry = (type: "Demo" | "Quote" | "General", defaultProject?: string) => {
    setInquiryType(type);
    if (defaultProject) {
      setFormData(prev => ({ ...prev, projectInterest: defaultProject }));
    }
    setIsDrawerOpen(true);
    setFormSubmitted(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API Submission
    setTimeout(() => {
      setFormSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        projectInterest: 'ERP Management System',
        message: ''
      });
    }, 800);
  };

  return (
    <div className="bg-white text-[#0F172A] selection:bg-[#2563EB]/10 selection:text-[#2563EB] min-h-screen font-sans">
      <AnimatePresence mode="wait">
        {!selectedProject ? (
          <motion.div
            key="grid-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* 1. Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-b from-[#F8FAFC] to-white pt-24 pb-20 md:py-32 border-b border-slate-100">
              <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2563EB]/5 border border-[#2563EB]/10 text-xs font-semibold text-[#2563EB] mb-6"
                  >
                    <Sparkles size={12} />
                    <span>NISHKALYA Portfolio Showcase</span>
                  </motion.div>
                  <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-4xl md:text-6xl font-extrabold tracking-tight text-[#0F172A] mb-6 leading-tight"
                  >
                    Our Projects & <span className="text-[#2563EB]">Solutions</span>
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-lg md:text-xl text-slate-500 font-light leading-relaxed mb-4"
                  >
                    Real business solutions built for real-world challenges.
                  </motion.p>
                </div>

                {/* Statistics Cards */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="grid grid-cols-2 lg:grid-cols-4 gap-6 hover:cursor-default"
                >
                  {[
                    { value: "50+", label: "Projects Completed", icon: <CheckCircle2 className="text-[#2563EB]" size={22} />, desc: "High-integrity deployments" },
                    { value: "30+", label: "Happy Clients", icon: <Users className="text-[#2563EB]" size={22} />, desc: "Across diverse verticals" },
                    { value: "20+", label: "Technologies Used", icon: <Cpu className="text-[#2563EB]" size={22} />, desc: "Modern enterprise stack" },
                    { value: "99.9%", label: "System Reliability", icon: <ShieldCheck className="text-[#14B8A6]" size={22} />, desc: "Guaranteed SLA uptime" }
                  ].map((stat, i) => (
                    <div 
                      key={i} 
                      className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-slate-50 group-hover:bg-[#2563EB]/5 transition-colors duration-300">
                          {stat.icon}
                        </div>
                        <span className="text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight">{stat.value}</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#0F172A] mb-1">{stat.label}</h4>
                        <p className="text-xs text-slate-400 font-light">{stat.desc}</p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#2563EB]/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
            </section>

            {/* 2. Project Filter Section */}
            <section className="py-8 bg-white border-b border-slate-100 sticky top-0 md:top-14 z-20 backdrop-blur-md bg-white/90">
              <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <div className="flex items-center gap-2 overflow-x-auto pb-3 -mb-3 scrollbar-hide">
                  {FILTER_CATEGORIES.map((category) => {
                    const isActive = activeFilter.toLowerCase() === category.toLowerCase();
                    return (
                      <button
                        key={category}
                        onClick={() => setActiveFilter(category)}
                        className={`px-4 py-2 text-xs md:text-sm font-semibold rounded-full duration-300 whitespace-nowrap transition-all ${
                          isActive 
                            ? 'bg-[#2563EB] text-white shadow-lg shadow-[#2563EB]/15 scale-102' 
                            : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-[#0F172A]'
                        }`}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* 3. Project Cards Grid */}
            <section className="py-16 md:py-24 bg-white">
              <div className="max-w-7xl mx-auto px-6 lg:px-12">
                {filteredProjects.length === 0 ? (
                  <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <Database size={40} className="text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-[#0F172A]">No projects found</h3>
                    <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto font-light">We are actively building products under this category. Please check our other specializations.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProjects.map((project, i) => (
                      <motion.div
                        key={project.id}
                        layoutId={`project-card-${project.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.05 }}
                        className="group flex flex-col bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                      >
                        {/* Image Frame */}
                        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                          <img 
                            src={project.image} 
                            alt={project.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transform scale-100 group-hover:scale-105 duration-500 ease-out"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <span className="absolute top-4 left-4 px-3 py-1 bg-white/95 text-[10px] font-bold text-[#0F172A] rounded-full uppercase tracking-wider shadow-sm backdrop-blur-md border border-slate-100">
                            {project.category}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="p-6 flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="text-lg font-extrabold text-[#0F172A] mb-2 group-hover:text-[#2563EB] transition-colors duration-200">{project.name}</h3>
                            <p className="text-xs text-slate-400 font-light leading-relaxed mb-4 line-clamp-2">{project.shortDesc}</p>
                            
                            {/* Key Features Preview */}
                            <div className="space-y-1.5 mb-5 border-t border-slate-50 pt-4">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Key highlights:</span>
                              {project.keyFeatures.slice(0, 2).map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-500">
                                  <CheckCircle2 size={12} className="text-[#14B8A6] shrink-0" />
                                  <span className="truncate">{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            {/* Tech Badges */}
                            <div className="flex flex-wrap gap-1.5 mb-6">
                              {project.technologies.slice(0, 4).map((tech, idx) => (
                                <span key={idx} className="text-[10px] font-medium px-2 py-0.5 bg-slate-50 text-slate-500 rounded-md">
                                  {tech}
                                </span>
                              ))}
                              {project.technologies.length > 4 && (
                                <span className="text-[10px] font-semibold text-[#2563EB] bg-[#2563EB]/5 px-2 py-0.5 rounded-md">
                                  +{project.technologies.length - 4} More
                                </span>
                              )}
                            </div>

                            {/* Buttons */}
                            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-50">
                              <button 
                                onClick={() => setSelectedProject(project)}
                                className="px-3 py-2.5 bg-slate-50 hover:bg-slate-100 text-[#0F172A] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors duration-300"
                              >
                                View Details 
                                <ArrowRight size={12} />
                              </button>
                              <button 
                                onClick={() => handleOpenInquiry("Demo", project.name)}
                                className="px-3 py-2.5 bg-[#2563EB] hover:bg-[#2563EB]/90 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors duration-300 shadow-sm shadow-[#2563EB]/10"
                              >
                                Request Demo
                                <ExternalLink size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* 5. Technology Stack Section */}
            <section className="py-20 md:py-28 bg-[#F8FAFC] border-y border-slate-100">
              <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <div className="text-center max-w-2xl mx-auto mb-16">
                  <span className="text-xs font-bold text-[#2563EB] uppercase tracking-[0.2em]">Our Enterprise Stack</span>
                  <h2 className="text-3xl md:text-5xl font-extrabold text-[#0F172A] mt-3 mb-4">Robust Technologies We Use</h2>
                  <p className="text-slate-400 text-sm md:text-base font-light">We leverage industry-leading systems to build safe, scalable, and beautifully designed digital infrastructures.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {TECH_BADGES.map((tech, idx) => (
                    <div 
                      key={idx} 
                      className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm text-center transform hover:-translate-y-1 hover:shadow-md transition-all duration-300"
                    >
                      <div className="font-mono text-xs text-slate-400 uppercase tracking-widest mb-1.5">{tech.category}</div>
                      <h4 className="text-[#0F172A] font-extrabold text-base">{tech.name}</h4>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 6. Case Studies Section */}
            <section className="py-20 md:py-28 bg-white">
              <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
                  <div>
                    <span className="text-xs font-bold text-[#2563EB] uppercase tracking-[0.2em]">Proven Business Value</span>
                    <h2 className="text-3xl md:text-5xl font-extrabold text-[#0F172A] mt-3">Featured Case Studies</h2>
                  </div>
                  <p className="text-slate-400 text-sm md:text-base font-light max-w-sm">Detailed parameters showcasing actual return on investment and cost savings achieved by our solutions.</p>
                </div>

                <div className="space-y-12">
                  {SAMPLE_PROJECTS.slice(0, 3).map((project, i) => (
                    <div 
                      key={i} 
                      className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
                    >
                      {/* Left: Challenge & Solution */}
                      <div className="lg:col-span-7 space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white border border-slate-100 text-xs text-slate-500 font-semibold uppercase tracking-wider">
                          <Award size={14} className="text-[#2563EB]" />
                          <span>{project.name} Model</span>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Challenge:</h4>
                            <p className="text-[#0F172A] text-sm md:text-base font-light leading-relaxed">{project.problem}</p>
                          </div>
                          <div className="border-t border-slate-100 pt-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[#2563EB] mb-1">Solution Provided:</h4>
                            <p className="text-slate-500 text-sm md:text-base font-light leading-relaxed">{project.solution}</p>
                          </div>
                        </div>
                      </div>

                      {/* Right: Metrics */}
                      <div className="lg:col-span-5 bg-white border border-slate-100 rounded-xl p-6 md:p-8 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="flex flex-col justify-between items-center text-center p-3 rounded-lg hover:bg-slate-50 transition-colors duration-300">
                          <TrendingUp className="text-[#2563EB] mb-2" size={20} />
                          <div className="text-xl md:text-2xl font-extrabold text-[#0F172A] tracking-tight">{project.roi}</div>
                          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">Direct ROI</div>
                        </div>
                        <div className="flex flex-col justify-between items-center text-center p-3 rounded-lg hover:bg-slate-50 transition-colors duration-300 border-l border-slate-100">
                          <Clock4 className="text-[#14B8A6] mb-2" size={20} />
                          <div className="text-xl md:text-2xl font-extrabold text-[#0F172A] tracking-tight">{project.timeSaved}</div>
                          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">Time Saved</div>
                        </div>
                        <div className="flex flex-col justify-between items-center text-center p-3 rounded-lg hover:bg-slate-50 transition-colors duration-300 border-l border-slate-100">
                          <Coins className="text-amber-500 mb-2" size={20} />
                          <div className="text-xl md:text-2xl font-extrabold text-[#0F172A] tracking-tight">{project.costReduction}</div>
                          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">Cost Reduced</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>



            {/* 8. Contact CTA */}
            <section className="py-24 bg-[#0F172A] text-white overflow-hidden relative">
              <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 text-center">
                <span className="text-xs font-bold text-[#14B8A6] uppercase tracking-[0.2em]">Build with us</span>
                <h2 className="text-3xl md:text-5xl font-extrabold text-white mt-4 mb-6">Need a Similar Solution?</h2>
                <p className="text-slate-300 max-w-xl mx-auto text-sm md:text-base font-light leading-relaxed mb-10">
                  Connect with our team today to request custom system demonstrations, schedule scope consultations, or receive professional pricing structures.
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
                  <button 
                    onClick={() => handleOpenInquiry("Demo")}
                    className="px-6 py-3.5 bg-white text-[#0F172A] font-bold text-xs rounded-xl hover:bg-slate-50 transition-all duration-300 shadow-xl"
                  >
                    Request Demo
                  </button>
                  <button 
                    onClick={() => handleOpenInquiry("Quote")}
                    className="px-6 py-3.5 bg-[#2563EB] hover:bg-[#2563EB]/90 text-white font-bold text-xs rounded-xl shadow-xl transition-all duration-300"
                  >
                    Get Quote
                  </button>
                  <button 
                    onClick={() => handleOpenInquiry("General")}
                    className="px-6 py-3.5 bg-transparent border border-slate-700 text-slate-300 hover:text-white hover:border-slate-400 rounded-xl transition-all duration-300 text-xs font-bold"
                  >
                    Contact Us
                  </button>
                </div>
              </div>

              {/* Decorative radial gradients */}
              <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-[#2563EB]/10 rounded-full blur-[100px] pointer-events-none"></div>
              <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-[#14B8A6]/10 rounded-full blur-[100px] pointer-events-none"></div>
            </section>
          </motion.div>
        ) : (
          /* 4. Project Detail View (Integrated inside the portfolio dynamically) */
          <motion.div
            key="detail-view"
            layoutId={`project-card-${selectedProject.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="pt-24 pb-20 md:py-32 bg-white"
          >
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
              {/* Back Button */}
              <button 
                onClick={() => setSelectedProject(null)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-[#0F172A] text-xs font-bold rounded-xl transition-colors duration-200 mb-8 cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Back to All Projects</span>
              </button>

              {/* Main Detail Header Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16">
                
                {/* Left Column: Carousel & Title Info */}
                <div className="lg:col-span-7 space-y-8">
                  <div>
                    <span className="text-xs font-bold text-[#2563EB] uppercase tracking-widest bg-[#2563EB]/5 px-3 py-1 rounded-md">
                      {selectedProject.category}
                    </span>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-[#0F172A] mt-4 mb-4">
                      {selectedProject.name}
                    </h1>
                    <p className="text-slate-400 text-sm md:text-base font-light leading-relaxed">
                      {selectedProject.shortDesc}
                    </p>
                  </div>

                  {/* Screenshots gallery */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Screenshots Gallery</h3>
                    <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 shadow-sm group">
                      <img 
                        src={selectedProject.image}
                        alt={`${selectedProject.name} Dashboard Mockup`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedProject.screenshots.map((scr, idx) => (
                        <div key={idx} className="aspect-[16/10] rounded-xl overflow-hidden bg-slate-50 border border-slate-50">
                          <img 
                            src={scr} 
                            alt={`${selectedProject.name} Interface Screenshot ${idx + 2}`} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Mini manifest sidebar */}
                <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
                  {/* Specifications Card */}
                  <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 space-y-6">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-3">Project Specifications</div>
                    
                    <div className="space-y-3.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-medium">Project Timeline</span>
                        <div className="flex items-center gap-1.5 text-[#0F172A] font-bold">
                          <Clock size={12} className="text-[#2563EB]" />
                          <span>{selectedProject.timeline}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-3.5">
                        <span className="text-slate-400 font-medium">Business Impact</span>
                        <div className="flex items-center gap-1.5 text-[#14B8A6] font-bold">
                          <TrendingUp size={12} />
                          <span>{selectedProject.roi}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-3.5">
                        <span className="text-slate-400 font-medium">Hours Saved</span>
                        <div className="flex items-center gap-1.5 text-[#2563EB] font-bold">
                          <Clock4 size={12} />
                          <span>{selectedProject.timeSaved}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-3.5">
                        <span className="text-slate-400 font-medium">Operating Cost Saved</span>
                        <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                          <Coins size={12} />
                          <span>{selectedProject.costReduction}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Box */}
                  <div className="p-1 space-y-3">
                    {selectedProject.liveDemoUrl && (
                      <a 
                        href="#demo"
                        onClick={(e) => { e.preventDefault(); handleOpenInquiry("Demo", selectedProject.name); }}
                        className="w-full py-3.5 bg-[#2563EB] hover:bg-[#2563EB]/90 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#2563EB]/15 flex items-center justify-center gap-2"
                      >
                        <Maximize2 size={14} /> Request Interactive Session
                      </a>
                    )}
                    <button 
                      onClick={() => handleOpenInquiry("Quote", selectedProject.name)}
                      className="w-full py-3.5 bg-white hover:bg-slate-50 text-[#0F172A] font-bold rounded-xl text-xs uppercase tracking-wider border border-slate-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageSquare size={14} /> Schedule Scope Negotiation
                    </button>
                  </div>

                  {/* Micro slogan */}
                  <div className="bg-[#14B8A6]/5 border border-[#14B8A6]/10 p-5 rounded-2xl flex gap-3.5">
                    <ShieldCheck size={20} className="text-[#14B8A6] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-[#0F172A] mb-1">Integrity Escrow Protocol</h4>
                      <p className="text-xs text-slate-400 font-light leading-relaxed">
                        Every system generated by Nishkalya is completely stable, clear, and perfectly engineered for real performance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detail Content Tabs / Layout */}
              <div className="border-t border-slate-100 pt-12">
                <div className="flex border-b border-slate-100 gap-6 mb-8 overflow-x-auto pb-0.5">
                  {["Overview", "Business Case & Solution", "Impact & Client Quote"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-3 text-sm font-semibold relative transition-all whitespace-nowrap ${
                        activeTab === tab ? 'text-[#2563EB]' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {tab}
                      {activeTab === tab && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563EB]" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="min-h-[200px]">
                  {activeTab === "Overview" && (
                    <div className="space-y-6 max-w-4xl">
                      <div>
                        <h3 className="text-lg font-bold text-[#0F172A] mb-3">Project Overview</h3>
                        <p className="text-slate-500 font-light leading-relaxed text-sm md:text-base">
                          {selectedProject.overview}
                        </p>
                      </div>

                      <div className="pt-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Technologies Built-in</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedProject.technologies.map((tech, idx) => (
                            <span key={idx} className="px-3 py-1 bg-slate-50 text-slate-600 text-xs rounded-lg font-semibold border border-slate-100 shadow-sm">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Project Features Details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {selectedProject.keyFeatures.map((feat, idx) => (
                            <div key={idx} className="flex gap-2 p-3 bg-slate-50/50 rounded-xl border border-slate-100 items-start text-xs text-slate-600 font-medium">
                              <CheckCircle2 size={14} className="text-[#14B8A6] mt-0.5 shrink-0" />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "Business Case & Solution" && (
                    <div className="space-y-6 max-w-4xl">
                      <div className="p-6 bg-amber-500/5 rounded-2xl border border-amber-500/10 mb-6">
                        <h3 className="text-amber-600 font-extrabold text-sm uppercase tracking-wider mb-2">Original Business Problem</h3>
                        <p className="text-slate-600 font-light leading-relaxed text-xs sm:text-sm">
                          {selectedProject.problem}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-[#0F172A] mb-3">System Solution Provided</h3>
                        <p className="text-slate-500 font-light leading-relaxed text-sm md:text-base">
                          {selectedProject.solution}
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === "Impact & Client Quote" && (
                    <div className="space-y-6 max-w-4xl">
                      <div>
                        <h3 className="text-lg font-bold text-[#0F172A] mb-3">Results & Benefits Achieved</h3>
                        <p className="text-slate-500 font-light leading-relaxed text-sm md:text-base">
                          {selectedProject.results}
                        </p>
                      </div>

                      <div className="bg-[#2563EB]/5 p-6 md:p-8 rounded-2xl border border-[#2563EB]/10 relative overflow-hidden mt-8">
                        <div className="relative z-10">
                          <MessageSquare className="text-[#2563EB] mb-4" size={28} />
                          <p className="text-[#0F172A] text-base md:text-lg font-light leading-relaxed italic mb-6">
                            "{selectedProject.clientFeedback.quote}"
                          </p>
                          <div className="flex items-center gap-3">
                            <img 
                              src={selectedProject.clientFeedback.avatar} 
                              alt={selectedProject.clientFeedback.clientName}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-full object-cover shrink-0 border border-white shadow-sm"
                            />
                            <div>
                              <h4 className="text-sm font-extrabold text-[#0F172A]">{selectedProject.clientFeedback.clientName}</h4>
                              <p className="text-xs text-slate-400 font-light">{selectedProject.clientFeedback.role}, {selectedProject.clientFeedback.company}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inquiry Slide-over Drawer Option */}
      <AnimatePresence>
        {isDraweOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            {/* Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="absolute inset-0 bg-black pointer-events-auto"
            />
            
            {/* Drawer */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between pointer-events-auto z-10 border-l border-slate-100"
            >
              <div className="p-6 overflow-y-auto flex-1">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                  <div>
                    <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-widest">
                      Inquiry Escalation Room
                    </span>
                    <h3 className="text-lg font-extrabold text-[#0F172A]">
                      {inquiryType === "Demo" ? "Request Solution Demo" : inquiryType === "Quote" ? "Retrieve Pricing Quote" : "Contact NISHKALYA"}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-1 px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg text-xs"
                  >
                    Close
                  </button>
                </div>

                {formSubmitted ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12 space-y-4"
                  >
                    <div className="w-14 h-14 bg-[#14B8A6]/10 text-[#14B8A6] rounded-full flex items-center justify-center mx-auto shadow-sm">
                      <CheckCircle2 size={30} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-extrabold text-[#0F172A]">Request Sent Successfully</h4>
                      <p className="text-xs text-slate-400 font-light">We will respond on average in under 4 hours with concrete feedback or scheduling options.</p>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-medium">
                    <div className="space-y-1">
                      <label className="text-slate-500">Your Full Name *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="John Doe"
                        className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none text-sm transition-colors duration-200"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-500">Corporate Email Address *</label>
                      <input 
                        type="email" 
                        required
                        placeholder="john@company.com"
                        className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none text-sm transition-colors duration-200"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-500">Direct Telephone Number</label>
                      <input 
                        type="tel" 
                        placeholder="+91 98765 43210"
                        className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none text-sm transition-colors duration-200"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-500">Organization Name *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Apex Enterprise"
                        className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none text-sm transition-colors duration-200"
                        value={formData.company}
                        onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-500">System Interest Portfolio</label>
                      <select 
                        className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none text-sm transition-colors duration-200"
                        value={formData.projectInterest}
                        onChange={(e) => setFormData(prev => ({ ...prev, projectInterest: e.target.value }))}
                      >
                        {SAMPLE_PROJECTS.map(p => (
                          <option key={p.id} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-500">Specific Requirements Description</label>
                      <textarea 
                        rows={3}
                        placeholder="Tell us about your specific workload, deadlines, or tech integration requirements."
                        className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none text-sm transition-colors duration-200"
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-3 bg-[#2563EB] hover:bg-[#2563EB]/90 text-white font-bold rounded-xl transition-all shadow-md shadow-[#2563EB]/15 flex items-center justify-center gap-1.5 text-xs py-3.5"
                    >
                      <span>Submit Inquiry Request</span>
                      <ArrowRight size={14} />
                    </button>
                  </form>
                )}
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-[10px] text-slate-400">
                Authorized encrypted portal. Protected under enterprise SLA.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
