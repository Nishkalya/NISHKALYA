/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { 
  User as UserIcon,
  Cpu, 
  Layout, 
  Lightbulb, 
  Linkedin, 
  Twitter, 
  Dribbble, 
  ArrowRight, 
  Zap, 
  Eye, 
  BarChart3, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  MessageSquare,
  Search,
  Share2,
  ChevronRight,
  Star,
  Github,
  AlertCircle,
  CheckCircle,
  X,
  Menu,
  Edit2,
  Trash2,
  Plus,
  Shield,
  Code,
  Settings,
  LogIn,
  LogOut,
  Lock,
  MoreVertical,
  Clock,
  Check,
  Archive,
  Trash,
  Terminal,
  Code2,
  FileCode,
  Package,
  Box,
  Activity,
  Maximize2
} from 'lucide-react';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  doc, 
  deleteDoc,
  setDoc,
  getDoc 
} from 'firebase/firestore';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword,
  onAuthStateChanged, 
  signOut,
  User 
} from 'firebase/auth';
import { db, auth } from './lib/firebase';

interface Project {
  id: string;
  title: string;
  category: string;
  desc: string;
  iconType: 'message' | 'eye' | 'layout' | 'chart';
  link?: string;
  fullDetails?: {
    overview?: string;
    features: string[];
    techStack: { name: string, role?: string }[];
    structure: { name: string, desc: string }[];
    license: string;
    acknowledgements?: string;
    howItWorks?: string[];
    runLocally?: string[];
    improvements?: string[];
  };
}

const DEFAULT_PROJECTS: Project[] = [
  {
    id: '1',
    title: "Orion — AI Customer Intelligence",
    category: "AI · NLP · SaaS",
    desc: "An LLM-powered platform that analyzes customer conversations in real-time, surfacing insights and automating support workflows at scale.",
    iconType: 'message',
    link: "https://vishal291137.github.io/TIME-LIGHT/",
    fullDetails: {
      overview: "# Orion Intelligence\n\nOrion is a state-of-the-art **LLM-powered platform** designed to bridge the gap between customer voices and actionable business intelligence. It processes thousands of conversations simultaneously to extract sentiment, detect urgent issues, and recommend responses.\n\n### ⚡ Strategic Impact\nBy implementing Orion, support teams see a **40% reduction in response times** and a significantly higher NPS due to more accurate and personalized interactions.",
      features: [
        "Real-time sentiment analysis using customized LLMs",
        "Automated support ticket categorization & prioritization",
        "Integration with popular CRM systems (Salesforce, Zendesk)",
        "Interactive dashboard with trend prediction & volume forecasting"
      ],
      techStack: [
        { name: "Python / FastAPI", role: "Scalable backend & AI orchestration" },
        { name: "OpenAI GPT-4", role: "Primary LLM for NLP tasks" },
        { name: "Pinecone", role: "Vector storage for semantic search" },
        { name: "React", role: "Dynamic analytics frontend" }
      ],
      structure: [
        { name: "api/sentiment.py", desc: "Core NLP inference engine logic" },
        { name: "db/vectors.py", desc: "Semantic embedding management" },
        { name: "ui/dashboard/", desc: "Real-time stats & visualization" },
        { name: "config/prompts.yaml", desc: "Optimized LLM prompt templates" }
      ],
      license: "Proprietary License — All Rights Reserved.",
      howItWorks: [
        "Captures incoming webhooks from communication channels",
        "Generates vector embeddings for semantic understanding",
        "Queries long-term memory for contextual relevance",
        "Outputs direct actions or suggested responses to human agents"
      ],
      runLocally: [
        "export OPENAI_API_KEY='your_key_here'",
        "docker-compose build",
        "docker-compose up -d",
        "open http://localhost:8000/docs"
      ],
      improvements: [
        "Multi-lingual agentic support",
        "On-premise deployment options",
        "Fine-grained role-based access control",
        "Advanced voice-to-text integration"
      ]
    }
  },
  {
    id: '2',
    title: "Flux — Smart City Dashboard",
    category: "Computer Vision · IoT",
    desc: "A real-time urban monitoring system using computer vision to manage traffic, energy, and public safety across a network of smart sensors.",
    iconType: 'eye',
    link: "https://vishal291137.github.io/TIME-LIGHT/",
    fullDetails: {
      overview: "# Flux Urban Monitoring\n\nFlux transforms urban management into a **data-driven science**. By leveraging advanced computer vision at the edge, Flux monitors traffic flow, detects safety incidents, and optimizes street lighting to reduce energy consumption by up to 30%.\n\n### 🌐 Vision\nTo build cities that breathe and respond in real-time, creating safer and more efficient environments for millions.",
      features: [
        "Real-time object detection for traffic flow optimization",
        "Emergency incident detection (accidents, fires) using CNNs",
        "Adaptive energy management for smart street lighting",
        "Public safety alerts via real-time edge processing"
      ],
      techStack: [
        { name: "TensorRT", role: "High-performance edge inference" },
        { name: "NVIDIA Jetson", role: "Hardware for edge computer vision" },
        { name: "Mqtt", role: "Low-latency IoT communication protocol" },
        { name: "D3.js", role: "Complex spatial data visualization" }
      ],
      structure: [
        { name: "inference/yolo_v8.py", desc: "Optimized object detection model" },
        { name: "iot/bridge.py", desc: "Edge-to-cloud notification layer" },
        { name: "viz/map.tsx", desc: "Real-time geographic visualization" }
      ],
      license: "Open Source Apache 2.0 — Free for public municipal use.",
      howItWorks: [
        "Captures 4K video streams from city cameras",
        "Processes frames locally to detect traffic patterns",
        "Aggregates data via secure MQTT channels",
        "Visualizes city-wide status in the Flux Dashboard"
      ],
      runLocally: [
        "pip install flux-cv-toolkit",
        "flux init --city-config default",
        "flux run --vision-only",
        "Visit http://localhost:3000/flux"
      ],
      improvements: [
        "Predictive traffic jam avoidance modules",
        "Privacy-first anonymization at source",
        "Solar-powered sensor integration",
        "Public transit ETA synchronization"
      ]
    }
  },
  {
    id: '3',
    title: "Aura — Creative Design Engine",
    category: "Generative AI · Creative",
    desc: "A generative AI platform for brand teams to create consistent, on-brand visual assets at 100× speed, trained on proprietary brand guidelines.",
    iconType: 'layout',
    link: "https://vishal291137.github.io/TIME-LIGHT/",
    fullDetails: {
      overview: "# Aura Generative Creative\n\nAura is where **Brand Integrity meets Generative Power**. Aura allows designers to train custom adapters on their own brand assets, ensuring that every AI-generated image or layout adheres strictly to brand colors, styles, and philosophy.\n\n### ✨ Creative Freedom\nDesigners no longer spend hours on repetitive tasks. Aura handles the grunt work, allowing the team to focus on pure strategy and creative direction.",
      features: [
        "Custom LoRA training on proprietary brand assets",
        "Multi-platform asset generation (Social, Web, Print)",
        "Vector-compatible SVG generation from text prompts",
        "Integrated collaborative workspace for creative reviews"
      ],
      techStack: [
        { name: "Stable Diffusion XL", role: "Foundation image generation model" },
        { name: "PyTorch", role: "Deep learning framework for LoRA training" },
        { name: "React + Tailwind", role: "Seamless creative studio UI" },
        { name: "AWS S3 / CloudFront", role: "High-speed asset delivery" }
      ],
      structure: [
        { name: "training/lora_trainer.py", desc: "Custom brand adapter logic" },
        { name: "generation/pipeline.py", desc: "Multi-modal generation stack" },
        { name: "studio/editor.tsx", desc: "Canvas-based creative workspace" }
      ],
      license: "Commercial SaaS License — Enterprise-only.",
      howItWorks: [
        "Accepts text-to-image or image-to-image prompts",
        "Applies brand-specific LoRA adapters at inference",
        "Up-scales images using neural super-resolution",
        "Exports ready-to-use marketing assets"
      ],
      runLocally: [
        "npm install aura-studio-client",
        "aura-dev login --api-key=test",
        "aura-dev start-workspace",
        "Accessible at http://localhost:5173"
      ],
      improvements: [
        "Video-to-Video style transfer",
        "Integrated font generation",
        "Automated AD copy generation",
        "One-click social media scheduling"
      ]
    }
  },
  {
    id: '4',
    title: "Sage — Predictive Finance AI",
    category: "ML · Analytics · FinTech",
    desc: "A machine learning suite for financial advisors that predicts market trends, profiles risk appetite, and auto-generates investment strategies.",
    iconType: 'chart',
    link: "https://vishal291137.github.io/TIME-LIGHT/",
    fullDetails: {
      overview: "# Sage Predictive Analytics\n\nSage is a **financial co-pilot** that uses ensemble machine learning to forecast market shifts. It analyzes technical indicators, social sentiment, and macro-economic factors to give financial advisors a 72-hour window of predictive foresight.\n\n### 📈 Strategic Precision\nWith Sage, firms can make data-validated decisions in high-volatility environments, protecting client assets and identifying alpha opportunities early.",
      features: [
        "Multi-variable time-series forecasting (Prophet/XGBoost)",
        "Real-time social sentiment analysis from financial news",
        "Automated portfolio rebalancing recommendations",
        "Advanced risk heatmaps for global assets"
      ],
      techStack: [
        { name: "XGBoost / LightGBM", role: "Primary forecasting models" },
        { name: "Redis", role: "High-speed live data caching" },
        { name: "PostgreSQL", role: "Relational storage for historical data" },
        { name: "Recharts", role: "Interactive financial charting" }
      ],
      structure: [
        { name: "models/forecaster.py", desc: "XGBoost predictive logic" },
        { name: "ingestion/live_feed.py", desc: "Market data websocket handler" },
        { name: "analytics/metrics.ts", desc: "Financial KPI calculations" }
      ],
      license: "B2B Enterprise License — Compliance-ready.",
      howItWorks: [
        "Ingests millions of data points every minute",
        "Normalizes data across global timezones",
        "Runs parallel simulations for risk profiling",
        "Generates PDF strategies for end-clients"
      ],
      runLocally: [
        "source venv/bin/activate",
        "pip install -r requirements.txt",
        "sage run-simulation --asset=BTC",
        "View logs in terminal"
      ],
      improvements: [
        "Explainable AI (XAI) for regulatory reports",
        "Crypto-native liquidity modeling",
        "Automated tax-harvesting logic",
        "Collaborative advisor dashboards"
      ]
    }
  },
  {
    id: '5',
    title: "Time Light — Aesthetic Chronometry",
    category: "Web · Creative · Experience",
    desc: "A high-performance web experience exploring the intersection of light, shadow, and the temporal dimensions of digital space.",
    iconType: 'layout',
    link: "https://vishal291137.github.io/TIME-LIGHT/",
    fullDetails: {
      overview: "# Website License\n\nA sleek and modern web-based digital clock interface with dynamic lighting and time display.\n\n### 🔥 Key Attributes\nThis project explores the intersection of **temporal precision** and **aesthetic luminosity**. Designed for high-end digital environments where time is not just data, but a visual anchor.\n\n### 🚀 Vision\nTo create a time-telling experience that feels alive—responding to the rhythm of the day through subtle shifts in glow and shadow.",
      features: [
        "Real-time clock interface with high precision",
        "Smooth visual transitions with modern UI patterns",
        "Fully responsive design optimized for mobile and desktop",
        "Light/Dark mode aesthetics with dynamic glowing motifs"
      ],
      techStack: [
        { name: "HTML", role: "Page structure & semantic layout" },
        { name: "CSS", role: "Styling, animations & glow effects" },
        { name: "JavaScript", role: "Real-time clock logic & DOM updates" }
      ],
      structure: [
        { name: "index.html", desc: "Main entry point and HTML skeleton" },
        { name: "main.css", desc: "Global visual styling and transitions" },
        { name: "main.js", desc: "Live temporal logic and clock updates" },
        { name: "assets/", desc: "Optimized media and visual assets" }
      ],
      license: "MIT License — Free to use and modify with attribution.",
      acknowledgements: "Inspired by minimal design concepts for clock UIs. Created with ❤️ by Vishal291137",
      howItWorks: [
        "Uses setInterval() in JS to update every second",
        "Real-time clock pads zeros for hours/minutes/seconds",
        "Glowing text effect using CSS text-shadow properties",
        "Deep navy/black backgrounds for maximum visual contrast"
      ],
      runLocally: [
        "git clone https://github.com/VISHAL291137/TIME-LIGHT.git",
        "cd TIME-LIGHT",
        "Open index.html in any modern browser"
      ],
      improvements: [
        "AM/PM toggle logic",
        "Global Timezone selector",
        "Customizable Alarm features",
        "Analog clock visual overlay"
      ]
    }
  }
];

const DEFAULT_CONFIG = {
  colors: {
    primary: "#D8B45C",
    secondary: "#A67C00"
  },
  hero: {
    badge: "śuddha-kalpanā · sūkṣma-karma",
    heading: "Ready to build something Remarkable?",
    subheading: "From your first digital step to a fully realized intelligent product — Nishkalya delivers reliable development, swift execution, and sustained growth.",
    stats: [
      { label: 'Projects Delivered', value: '120+' },
      { label: 'Client Satisfaction', value: '98%' },
      { label: 'AI Models Deployed', value: '40+' },
      { label: 'Average Rating', value: '5★' },
    ]
  },
  about: {
    badge: "About Us",
    heading: "Where Imagination Meets Intelligence",
    paragraphs: [
      "Nishkalya is an AI-first digital studio and full-stack solution hub — built on the Sanskrit principles of śuddha-kalpanā (pure creation) and sūkṣma-karma (precise craftsmanship).",
      "We don't just build software. We shape the future of how humans and machines interact. Founded on the belief that great technology must be both powerful and beautiful, our team of engineers, designers, and AI researchers work together to create products that genuinely move people.",
      "Every solution we deliver is sthira (stable), śubhra (clean), and samanvita (well-integrated). Our approach is simple: engineer experiences that feel balanced, intentional, and dependable.",
      "With hands-on expertise in machine learning, LLM integration, computer vision, UI/UX design, full-stack development, Python automation, and system optimization, Nishkalya merges modern technology with a refined, user-centered philosophy inspired by timeless design values.",
      "Whether you are beginning your first digital journey or expanding an existing vision — Nishkalya delivers reliable development, swift execution, and sustained long-term support."
    ],
    skills: ["Machine Learning", "UI/UX Design", "LLM Integration", "Computer Vision", "Full-Stack Dev", "AI Strategy"]
  },
  services: [
    {
      title: "AI Product Development",
      desc: "End-to-end development of AI-powered products from model selection to production deployment.",
      why: "Static software is legacy. AI-first products adapt, learn, and scale your impact exponentially.",
      what: "We engineer custom model layers, RAG systems, and deployment pipelines that turn raw data into autonomous value.",
      details: [
        "Custom LLM fine-tuning for proprietary data",
        "Scalable vector database implementation (RAG)",
        "Autonomous agent development (LangGraph/AutoGPT)",
        "Production-ready API orchestration"
      ],
      outcome: "Intelligent systems that automate complex decision making."
    },
    {
      title: "UI/UX Design Systems",
      desc: "Bespoke design systems that fuse aesthetic brilliance with intelligent UX patterns.",
      why: "Beauty is not an ornament; it is the bridge of trust between complex technology and the human user.",
      what: "We build scalable component libraries, high-fidelity prototypes, and motion systems.",
      details: [
        "Atomic design system architecture",
        "High-fidelity interactive prototyping",
        "Accessibility (A11y) & Usability audits",
        "Motion & Interaction language design"
      ],
      outcome: "Cohesive, stunning, and user-centered digital identities."
    },
    {
      title: "LLM Integration",
      desc: "Seamlessly weave large language models into your existing workflows and automated pipelines.",
      why: "Knowledge is only powerful when accessible. LLMs turn silent data into conversational intelligence.",
      what: "We implement RAG architectures, prompt engineering, and intelligent agentic workflows.",
      details: [
        "Advanced Prompt Engineering techniques",
        "Token usage optimization & Cost management",
        "Multi-modal model integration (Text/Image/Audio)",
        "Real-time streaming response handling"
      ],
      outcome: "Reduced operational overhead through natural language automation."
    },
    {
      title: "Computer Vision",
      desc: "Real-time object detection and visual search systems that transform how products see.",
      why: "For a machine to serve the world, it must first be able to see and understand its environment.",
      what: "We specialize in edge inference, real-time spatial analysis, and neural image processing.",
      details: [
        "Real-time object detection and tracking",
        "Image segmentation & Pattern recognition",
        "Edge deployment (TensorRT/CoreML)",
        "Automated visual quality control"
      ],
      outcome: "Enhanced visual intelligence for physical and digital spaces."
    },
    {
      title: "Data Intelligence",
      desc: "Turn raw data into strategic advantage with custom analytics and predictive models.",
      why: "Decisions made in the dark are gambles. Data intelligence turns uncertainty into strategic foresight.",
      what: "We develop predictive modeling, interactive dashboards, and automated reporting systems.",
      details: [
        "Predictive analytics & Time-series forecasting",
        "Interactive D3.js/Recharts dashboards",
        "Data cleanup & ETL pipeline engineering",
        "Statistical modeling & insight generation"
      ],
      outcome: "Actionable foresight that drives revenue and efficiency."
    },
    {
      title: "Web & App Development",
      desc: "High-performance, scalable applications built with modern frameworks and pixel-perfect design.",
      why: "Your digital presence is your most valuable asset. It should be as resilient as it is beautiful.",
      what: "We create full-stack architectures, API orchestrations, and high-performance frontend engineering.",
      details: [
        "React/Next.js/Node.js ecosystem mastery",
        "Low-latency API architecture & WebSockets",
        "Cloud-native deployment (GCP/AWS/Azure)",
        "Microservices & Serverless integration"
      ],
      outcome: "Scalable foundations tailored for the modern web."
    }
  ]
};

export default function App() {
  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants: any = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      }
    }
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    service: 'Select a service',
    message: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [activePreviewUrl, setActivePreviewUrl] = useState<string | null>(null);
  const [selectedProjectForPreview, setSelectedProjectForPreview] = useState<Project | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'projects' | 'admin'>('home');
  const [websiteConfig, setWebsiteConfig] = useState<any>(DEFAULT_CONFIG);
  const [isConfigLoading, setIsConfigLoading] = useState(true);
  const [adminTab, setAdminTab] = useState<'messages' | 'content'>('messages');

  const handleFirestoreError = (error: any, operationType: string, path: string) => {
    const errInfo = {
      error: error.message || String(error),
      operationType,
      path,
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
      }
    };
    console.error('Firestore Error:', JSON.stringify(errInfo));
    // We don't necessarily want to throw and crash the UI, but we log it for the AI to see in logs
  };

  useEffect(() => {
    // Real-time config listener
    const unsubConfig = onSnapshot(doc(db, 'config', 'website'), (snapshot) => {
      if (snapshot.exists()) {
        setWebsiteConfig(snapshot.data());
      } else {
        // Only try to seed if we have a user and they are admin
        if (auth.currentUser?.email === 'nishkalya@gmail.com') {
          setDoc(doc(db, 'config', 'website'), DEFAULT_CONFIG).catch(err => handleFirestoreError(err, 'write', 'config/website'));
        }
      }
      setIsConfigLoading(false);
    }, (error) => {
      handleFirestoreError(error, 'get', 'config/website');
      setIsConfigLoading(false);
    });

    // Real-time projects listener
    const q = query(collection(db, 'projects'), orderBy('order', 'asc'));
    const unsubProjects = onSnapshot(q, (snapshot) => {
      const projs = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Project[];
      if (projs.length > 0) {
        setProjects(projs);
      } else {
        // Only try to seed if we have a user and they are admin
        if (auth.currentUser?.email === 'nishkalya@gmail.com') {
          DEFAULT_PROJECTS.forEach(async (p, idx) => {
            const { id, ...rest } = p;
            await setDoc(doc(db, 'projects', id), { ...rest, order: idx }).catch(err => handleFirestoreError(err, 'write', 'projects/' + id));
          });
        }
      }
    }, (error) => {
      handleFirestoreError(error, 'list', 'projects');
    });

    return () => {
      unsubConfig();
      unsubProjects();
    };
  }, []);

  useEffect(() => {
    if (activePreviewUrl) {
      document.body.style.overflow = 'hidden';
      setIsIframeLoading(true);
      setShowFullPreview(false);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [activePreviewUrl]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActivePreviewUrl(null);
        setSelectedProjectForPreview(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrs = { ...prev };
        delete newErrs[name];
        return newErrs;
      });
    }
  };

  const scrollToSection = (sectionId: string) => {
    setCurrentView('home');
    setIsMobileMenuOpen(false);
    
    // Smooth scroll after a tiny delay to allow home view to render if we were on projects view
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [showFullAbout, setShowFullAbout] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [adminMessages, setAdminMessages] = useState<any[]>([]);
  const [isAdminView, setIsAdminView] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [selectedAdminMessage, setSelectedAdminMessage] = useState<any | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser?.email === 'nishkalya@gmail.com' && currentView === 'admin') {
      const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAdminMessages(msgs);
      }, (error) => {
        handleFirestoreError(error, 'list', 'messages');
      });
      return () => unsubscribe();
    }
  }, [currentUser, currentView]);

  const handleAdminLogin = async () => {
    setIsLoggingIn(true);
    try {
      console.log("Attempting Google Login (Popup)...");
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      console.log("Login successful:", result.user.email);
    } catch (error: any) {
      console.error("Login failed:", error);
      
      // Provide actionable feedback for the common "domain not authorized" error
      if (error.code === 'auth/popup-blocked') {
        alert("Pop-up blocked! Please allow pop-ups for this site or try again.");
      } else if (error.message?.includes('The requested action is invalid') || error.code === 'auth/unauthorized-domain') {
        const domain = window.location.hostname;
        alert(
          `Domain Not Authorized!\n\n` +
          `Firebase is blocking the login because this domain (${domain}) is not authorized.\n\n` +
          `If you are the developer:\n` +
          `1. Go to Firebase Console > Authentication > Settings\n` +
          `2. Add "${domain}" to Authorized Domains.\n\n` +
          `If you are using the AI Studio preview, this may be a temporary environment issue.`
        );
      } else {
        alert("Login failed: " + (error.message || "Unknown error"));
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAdminLogout = async () => {
    await signOut(auth);
    setCurrentView('home');
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      console.log("Email login successful");
    } catch (error: any) {
      console.error("Email login failed:", error);
      alert("Login failed: " + (error.message || "Invalid credentials"));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const AdminDashboard = () => {
    if (!currentUser) {
      return (
        <div className="min-h-screen flex items-center justify-center pt-32 pb-20 px-6">
          <div className="max-w-md w-full text-center space-y-8 p-12 bg-white rounded-3xl border border-zinc-200 shadow-xl">
            <div className="w-16 h-16 bg-[#D8B45C]/10 rounded-2xl flex items-center justify-center text-[#A67C00] mx-auto transform rotate-12">
              <Lock size={32} />
            </div>
            <h2 className="text-3xl font-light text-zinc-900" style={{ fontFamily: "'Georgia', serif" }}>Admin Access</h2>
            <p className="text-zinc-600 text-sm font-light">Please log in with the authorized account to access the dashboard and manage inquiries.</p>
            
            <form onSubmit={handleEmailLogin} className="space-y-4 text-left">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-1">Email Address</label>
                <input 
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:border-[#D8B45C] outline-none transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-1">Password</label>
                <input 
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:border-[#D8B45C] outline-none transition-all"
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-4 bg-[#D8B45C] text-white font-bold rounded-2xl hover:bg-[#A67C00] transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-[10px] shadow-lg shadow-[#D8B45C]/20"
              >
                {isLoggingIn ? "Verifying..." : "Login with Password"}
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-100"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest"><span className="bg-white px-4 text-zinc-400 font-bold">Or</span></div>
            </div>

            <button 
              onClick={handleAdminLogin}
              disabled={isLoggingIn}
              className="w-full py-4 bg-zinc-50 border border-zinc-200 text-zinc-700 font-bold rounded-2xl hover:bg-zinc-100 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-[10px]"
            >
              <LogIn size={16} /> {isLoggingIn ? "Authenticating..." : "Continue with Google"}
            </button>
          </div>
        </div>
      );
    }

    if (currentUser.email !== 'nishkalya@gmail.com') {
      return (
        <div className="min-h-screen flex items-center justify-center pt-32 pb-20 px-6">
          <div className="max-w-md w-full text-center space-y-6 p-10 bg-red-50 border border-red-100 rounded-3xl">
            <h2 className="text-xl font-bold text-red-800">Access Denied</h2>
            <p className="text-red-600 text-sm">Your account ({currentUser.email}) is not authorized to access the admin panel.</p>
            <button onClick={handleAdminLogout} className="text-zinc-600 hover:text-zinc-900 text-xs font-bold uppercase tracking-widest">Sign Out</button>
          </div>
        </div>
      );
    }

    const updateConfig = async (newConfig: any) => {
      try {
        await setDoc(doc(db, 'config', 'website'), newConfig);
      } catch (err) {
        console.error("Failed to update config", err);
      }
    };

    return (
      <div className="pt-32 pb-20 px-6 md:px-12 w-full max-w-7xl mx-auto min-h-screen">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <div className="text-[#A67C00] text-[10px] font-bold uppercase tracking-[0.4em] mb-4">Command Center</div>
            <h1 className="text-4xl md:text-5xl font-light text-zinc-900" style={{ fontFamily: "'Georgia', serif" }}>
              {adminTab === 'messages' ? 'Inquiry Dashboard' : 'Website Editor'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-zinc-100 p-1 rounded-xl">
              <button 
                onClick={() => setAdminTab('messages')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${adminTab === 'messages' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
              >
                <Mail size={12} /> Messages
              </button>
              <button 
                onClick={() => setAdminTab('content')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${adminTab === 'content' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
              >
                <Edit2 size={12} /> Content
              </button>
            </div>
            <button onClick={handleAdminLogout} className="p-3 bg-white border border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 rounded-xl transition-all"><LogOut size={18} /></button>
          </div>
        </div>

        {adminTab === 'messages' ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Total Inquiries</div>
                <div className="text-3xl font-bold text-zinc-900">{adminMessages.length}</div>
              </div>
              <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 shadow-sm">
                <div className="text-[9px] font-bold text-amber-600 uppercase tracking-widest mb-2">New Messages</div>
                <div className="text-3xl font-bold text-amber-700">{adminMessages.filter(m => m.status === 'unread').length}</div>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-6">
              {adminMessages.length === 0 ? (
                <div className="bg-white/40 border border-zinc-200 border-dashed rounded-3xl p-20 text-center">
                  <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400 mx-auto mb-6">
                    <Mail size={32} />
                  </div>
                  <h3 className="text-xl font-medium text-zinc-900 mb-2">No messages yet</h3>
                  <p className="text-zinc-500 text-sm font-light">Submissions from the contact form will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {adminMessages.map((msg) => (
                    <motion.div 
                      key={msg.id}
                      layoutId={msg.id}
                      onClick={() => setSelectedAdminMessage(msg)}
                      className={`group relative bg-white border rounded-[1.25rem] p-5 md:px-8 md:py-6 cursor-pointer transition-all duration-500 hover:border-[#D8B45C]/40 hover:shadow-[0_20px_40px_-15px_rgba(216,180,92,0.08)] overflow-hidden ${msg.status === 'unread' ? 'border-[#D8B45C]/20 shadow-sm' : 'border-zinc-100'}`}
                    >
                      {msg.status === 'unread' && (
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#D8B45C]" />
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-3">
                          <div className="flex flex-col">
                            <span className="text-[7px] font-black text-[#A67C00] uppercase tracking-[0.4em] mb-1 opacity-60 group-hover:opacity-100 transition-opacity">
                              {msg.service || 'General'}
                            </span>
                            <h4 className="text-sm font-bold text-zinc-900 group-hover:text-[#A67C00] transition-colors duration-300">
                              {msg.name}
                            </h4>
                            <span className="text-[9px] text-zinc-400 font-medium uppercase tracking-widest mt-0.5">
                              {msg.company || 'Private'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="md:col-span-6 lg:col-span-7">
                          <div className="border-l border-zinc-100 pl-6">
                            <p className="text-zinc-500 text-[11px] font-light leading-relaxed line-clamp-1 italic opacity-80 group-hover:opacity-100 transition-opacity">
                              {msg.message}
                            </p>
                          </div>
                        </div>

                        <div className="md:col-span-3 lg:col-span-2 flex items-center justify-between md:justify-end gap-5">
                          <div className="flex flex-col items-end">
                            <span className="text-[9px] font-bold text-zinc-900 tabular-nums tracking-tighter">
                              {msg.createdAt?.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                            <span className="text-[8px] text-zinc-400 font-bold uppercase tracking-tighter">
                              {msg.createdAt?.toDate().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                            </span>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-zinc-50 text-zinc-300 flex items-center justify-center transition-all duration-500 group-hover:bg-[#D8B45C] group-hover:text-white">
                            <ArrowRight size={12} />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Website Content Management */}
            <div className="bg-white border border-zinc-200 rounded-[2rem] p-8 md:p-12 shadow-sm">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-[#D8B45C]/10 rounded-2xl flex items-center justify-center text-[#A67C00]">
                  <Globe size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-zinc-900">Website Content</h3>
                  <p className="text-xs text-zinc-500 font-light">Update text across the entire public site.</p>
                </div>
              </div>

              <div className="space-y-12">
                {/* Hero Section Editor */}
                <div className="p-8 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#A67C00] mb-6 flex items-center gap-2">
                    <Zap size={14} /> Hero Section
                  </h4>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-400 px-1">Badge Text</label>
                      <input 
                        value={websiteConfig.hero.badge}
                        onChange={(e) => updateConfig({ ...websiteConfig, hero: { ...websiteConfig.hero, badge: e.target.value }})}
                        className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:border-[#D8B45C] outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-400 px-1">Main Heading (HTML allowed)</label>
                      <input 
                        value={websiteConfig.hero.heading}
                        onChange={(e) => updateConfig({ ...websiteConfig, hero: { ...websiteConfig.hero, heading: e.target.value }})}
                        className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:border-[#D8B45C] outline-none transition-all"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-4">
                      <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-400 px-1">Subheading</label>
                      <textarea 
                        rows={3}
                        value={websiteConfig.hero.subheading}
                        onChange={(e) => updateConfig({ ...websiteConfig, hero: { ...websiteConfig.hero, subheading: e.target.value }})}
                        className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:border-[#D8B45C] outline-none transition-all resize-none"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-4">
                      <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-400 px-1">Hero Statistics</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {websiteConfig.hero.stats?.map((stat: any, i: number) => (
                          <div key={i} className="space-y-2 p-3 bg-white border border-zinc-200 rounded-xl relative group">
                            <input 
                              value={stat.label}
                              onChange={(e) => {
                                const newStats = [...websiteConfig.hero.stats];
                                newStats[i] = { ...stat, label: e.target.value };
                                updateConfig({ ...websiteConfig, hero: { ...websiteConfig.hero, stats: newStats }});
                              }}
                              placeholder="Label"
                              className="w-full text-[10px] font-bold uppercase tracking-wider outline-none text-[#A67C00] bg-transparent"
                            />
                            <input 
                              value={stat.value}
                              onChange={(e) => {
                                const newStats = [...websiteConfig.hero.stats];
                                newStats[i] = { ...stat, value: e.target.value };
                                updateConfig({ ...websiteConfig, hero: { ...websiteConfig.hero, stats: newStats }});
                              }}
                              placeholder="Value"
                              className="w-full text-xl font-light outline-none text-zinc-900 bg-transparent"
                            />
                            <button 
                              onClick={() => {
                                const newStats = websiteConfig.hero.stats.filter((_: any, idx: number) => idx !== i);
                                updateConfig({ ...websiteConfig, hero: { ...websiteConfig.hero, stats: newStats }});
                              }}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                        <button 
                          onClick={() => {
                            const newStats = [...(websiteConfig.hero.stats || []), { label: "New Stat", value: "0" }];
                            updateConfig({ ...websiteConfig, hero: { ...websiteConfig.hero, stats: newStats }});
                          }}
                          className="border-2 border-dashed border-zinc-200 rounded-xl flex items-center justify-center text-zinc-400 hover:border-[#A67C00] hover:text-[#A67C00] transition-all p-4"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Theme Configuration */}
                <div className="p-8 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#A67C00] mb-6 flex items-center gap-2">
                    <Settings size={14} /> Theme & Colors
                  </h4>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-400 px-1">Primary Color (Hex)</label>
                      <div className="flex gap-4">
                        <input 
                          type="color"
                          value={websiteConfig.colors?.primary || '#D8B45C'}
                          onChange={(e) => updateConfig({ ...websiteConfig, colors: { ...websiteConfig.colors, primary: e.target.value }})}
                          className="w-12 h-12 rounded-lg border-none cursor-pointer"
                        />
                        <input 
                          value={websiteConfig.colors?.primary || '#D8B45C'}
                          onChange={(e) => updateConfig({ ...websiteConfig, colors: { ...websiteConfig.colors, primary: e.target.value }})}
                          className="flex-1 bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:border-[#D8B45C] outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-400 px-1">Secondary Color (Hex)</label>
                      <div className="flex gap-4">
                        <input 
                          type="color"
                          value={websiteConfig.colors?.secondary || '#A67C00'}
                          onChange={(e) => updateConfig({ ...websiteConfig, colors: { ...websiteConfig.colors, secondary: e.target.value }})}
                          className="w-12 h-12 rounded-lg border-none cursor-pointer"
                        />
                        <input 
                          value={websiteConfig.colors?.secondary || '#A67C00'}
                          onChange={(e) => updateConfig({ ...websiteConfig, colors: { ...websiteConfig.colors, secondary: e.target.value }})}
                          className="flex-1 bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:border-[#D8B45C] outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* About Section Editor */}
                <div className="p-8 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#A67C00] mb-6 flex items-center gap-2">
                    <UserIcon size={14} /> About Section
                  </h4>
                  <div className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-400 px-1">Badge Text</label>
                        <input 
                          value={websiteConfig.about.badge}
                          onChange={(e) => updateConfig({ ...websiteConfig, about: { ...websiteConfig.about, badge: e.target.value }})}
                          className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:border-[#D8B45C] outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-400 px-1">Heading (HTML allowed)</label>
                        <input 
                          value={websiteConfig.about.heading}
                          onChange={(e) => updateConfig({ ...websiteConfig, about: { ...websiteConfig.about, heading: e.target.value }})}
                          className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:border-[#D8B45C] outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-400 px-1">Core Skills (Tags)</label>
                      <div className="flex flex-wrap gap-2">
                        {websiteConfig.about.skills?.map((skill: string, i: number) => (
                          <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-zinc-200 rounded-full text-[10px] font-bold text-[#A67C00] group">
                            <span>{skill}</span>
                            <button 
                              onClick={() => {
                                const newSkills = websiteConfig.about.skills.filter((_: any, idx: number) => idx !== i);
                                updateConfig({ ...websiteConfig, about: { ...websiteConfig.about, skills: newSkills }});
                              }}
                              className="text-zinc-300 hover:text-red-500 transition-colors"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                        <button 
                          onClick={() => {
                            const skill = prompt("Enter new skill:");
                            if (skill) {
                              const newSkills = [...(websiteConfig.about.skills || []), skill];
                              updateConfig({ ...websiteConfig, about: { ...websiteConfig.about, skills: newSkills }});
                            }
                          }}
                          className="px-3 py-1.5 border border-dashed border-zinc-300 rounded-full text-[10px] text-zinc-400 hover:border-[#A67C00] hover:text-[#A67C00]"
                        >
                          + Add Skill
                        </button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-400 px-1">Content Paragraphs (HTML allowed)</label>
                      <div className="space-y-3">
                        {websiteConfig.about.paragraphs.map((p: string, i: number) => (
                          <div key={i} className="relative group">
                            <textarea 
                              rows={3}
                              value={p}
                              onChange={(e) => {
                                const newParas = [...websiteConfig.about.paragraphs];
                                newParas[i] = e.target.value;
                                updateConfig({ ...websiteConfig, about: { ...websiteConfig.about, paragraphs: newParas }});
                              }}
                              className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:border-[#D8B45C] outline-none transition-all resize-none"
                            />
                            <button 
                              onClick={() => {
                                const newParas = websiteConfig.about.paragraphs.filter((_: any, idx: number) => idx !== i);
                                updateConfig({ ...websiteConfig, about: { ...websiteConfig.about, paragraphs: newParas }});
                              }}
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:text-red-700 transition-opacity"
                            >
                              <Trash size={14} />
                            </button>
                          </div>
                        ))}
                        <button 
                          onClick={() => {
                            updateConfig({ ...websiteConfig, about: { ...websiteConfig.about, paragraphs: [...websiteConfig.about.paragraphs, "New paragraph content..."] }});
                          }}
                          className="w-full py-3 bg-white border border-dashed border-zinc-300 text-zinc-400 hover:text-[#A67C00] hover:border-[#D8B45C] rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all"
                        >
                          + Add Paragraph
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Services Editor */}
                <div className="p-8 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#A67C00] mb-6 flex items-center gap-2">
                    <Layout size={14} /> Services Management
                  </h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    {websiteConfig.services.map((service: any, i: number) => (
                      <div key={i} className="p-6 bg-white border border-zinc-200 rounded-xl space-y-4">
                        <div className="flex justify-between items-start">
                          <h5 className="text-xs font-bold text-zinc-900">{service.title}</h5>
                          <button 
                            onClick={() => {
                              const newServices = websiteConfig.services.filter((_: any, idx: number) => idx !== i);
                              updateConfig({ ...websiteConfig, services: newServices });
                            }}
                            className="p-1.5 text-red-400 hover:text-red-600 transition-colors"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                        <input 
                          value={service.title}
                          onChange={(e) => {
                            const newServices = [...websiteConfig.services];
                            newServices[i] = { ...service, title: e.target.value };
                            updateConfig({ ...websiteConfig, services: newServices });
                          }}
                          className="w-full px-3 py-2 bg-zinc-50 border border-zinc-100 rounded-lg text-xs"
                          placeholder="Service Title"
                        />
                        <textarea 
                          rows={2}
                          value={service.desc}
                          onChange={(e) => {
                            const newServices = [...websiteConfig.services];
                            newServices[i] = { ...service, desc: e.target.value };
                            updateConfig({ ...websiteConfig, services: newServices });
                          }}
                          className="w-full px-3 py-2 bg-zinc-50 border border-zinc-100 rounded-lg text-xs resize-none"
                          placeholder="Brief description"
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Why It Matters</label>
                            <textarea 
                              rows={2}
                              value={service.why || ''}
                              onChange={(e) => {
                                const newServices = [...websiteConfig.services];
                                newServices[i] = { ...service, why: e.target.value };
                                updateConfig({ ...websiteConfig, services: newServices });
                              }}
                              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-100 rounded-lg text-xs resize-none"
                              placeholder="Strategic reason..."
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">What We Do</label>
                            <textarea 
                              rows={2}
                              value={service.what || ''}
                              onChange={(e) => {
                                const newServices = [...websiteConfig.services];
                                newServices[i] = { ...service, what: e.target.value };
                                updateConfig({ ...websiteConfig, services: newServices });
                              }}
                              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-100 rounded-lg text-xs resize-none"
                              placeholder="Action statement..."
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Outcome Statement</label>
                          <input 
                            value={service.outcome || ''}
                            onChange={(e) => {
                              const newServices = [...websiteConfig.services];
                              newServices[i] = { ...service, outcome: e.target.value };
                              updateConfig({ ...websiteConfig, services: newServices });
                            }}
                            className="w-full px-3 py-2 bg-zinc-50 border border-zinc-100 rounded-lg text-xs"
                            placeholder="Final result statement..."
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Actionable Items (Details)</label>
                          <div className="space-y-2">
                            {service.details?.map((detail: string, dIdx: number) => (
                              <div key={dIdx} className="flex gap-2">
                                <input 
                                  value={detail}
                                  onChange={(e) => {
                                    const newDetails = [...service.details];
                                    newDetails[dIdx] = e.target.value;
                                    const newServices = [...websiteConfig.services];
                                    newServices[i] = { ...service, details: newDetails };
                                    updateConfig({ ...websiteConfig, services: newServices });
                                  }}
                                  className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-100 rounded-lg text-xs"
                                />
                                <button 
                                  onClick={() => {
                                    const newDetails = service.details.filter((_: any, idx: number) => idx !== dIdx);
                                    const newServices = [...websiteConfig.services];
                                    newServices[i] = { ...service, details: newDetails };
                                    updateConfig({ ...websiteConfig, services: newServices });
                                  }}
                                  className="p-2 text-red-500"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ))}
                            <button 
                              onClick={() => {
                                const newDetails = [...(service.details || []), "New detail item..."];
                                const newServices = [...websiteConfig.services];
                                newServices[i] = { ...service, details: newDetails };
                                updateConfig({ ...websiteConfig, services: newServices });
                              }}
                              className="w-full py-2 border border-dashed border-zinc-200 rounded-lg text-[9px] text-zinc-400 hover:text-[#A67C00]"
                            >
                              + Add Detail
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button 
                      onClick={() => {
                        const newService = { title: "New Service", desc: "Service description here", details: [], outcome: "" };
                        updateConfig({ ...websiteConfig, services: [...websiteConfig.services, newService] });
                      }}
                      className="md:col-span-2 py-6 border-2 border-dashed border-zinc-200 text-zinc-400 hover:text-[#A67C00] hover:border-[#D8B45C] rounded-2xl flex flex-col items-center justify-center gap-2 transition-all"
                    >
                      <Plus size={24} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Add New Service</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Portfolio Projects Management */}
            <div className="bg-white border border-zinc-200 rounded-[2rem] p-8 md:p-12 shadow-sm">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-[#A67C00]">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900">Portfolio Inventory</h3>
                    <p className="text-xs text-zinc-500 font-light">Manage your highlight cases and live demos.</p>
                  </div>
                </div>
                <button 
                  onClick={handleAddProject}
                  className="flex items-center gap-2 px-6 py-3 bg-[#1f2328] hover:bg-black text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg"
                >
                  <Plus size={16} /> New project
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {projects.map((project, i) => (
                  <div key={project.id} className="group flex items-center gap-6 p-6 bg-zinc-50 rounded-2xl border border-zinc-100 hover:border-[#D8B45C]/30 transition-all">
                    <div className="w-14 h-14 bg-white border border-zinc-200 rounded-xl flex items-center justify-center text-[#A67C00] shrink-0">
                      {getProjectIcon(project.iconType, 24)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[7.5px] font-black text-[#A67C00] uppercase tracking-[0.3em] mb-1">{project.category}</div>
                      <h4 className="text-sm font-bold text-zinc-900 truncate">{project.title}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                       <button onClick={() => handleEditProject(project)} className="p-2 text-zinc-400 hover:text-[#A67C00] hover:bg-white rounded-lg transition-all"><Edit2 size={16} /></button>
                       <button onClick={(e) => handleDeleteProject(e, project.id)} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-white rounded-lg transition-all"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const AdminMessageModal = ({ message, onClose }: { message: any, onClose: () => void }) => {
    if (!message) return null;

    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[90vh]"
          >
            <div className="p-8 md:p-12 overflow-y-auto">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <div className="text-[#A67C00] text-[10px] font-bold uppercase tracking-[0.4em] mb-4">Inquiry Details</div>
                  <h2 className="text-3xl font-light text-zinc-900" style={{ fontFamily: "'Georgia', serif" }}>From <span className="italic">{message.name}</span></h2>
                </div>
                <button 
                  onClick={onClose}
                  className="p-3 bg-zinc-100 text-zinc-400 hover:text-zinc-900 rounded-2xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-6">
                  <div>
                    <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Email Address</div>
                    <div className="flex items-center gap-3 text-zinc-900 font-medium">
                      <Mail size={16} className="text-zinc-400" />
                      {message.email}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Company / Organization</div>
                    <div className="flex items-center gap-3 text-zinc-900 font-medium">
                      <Globe size={16} className="text-zinc-400" />
                      {message.company || 'Not provided'}
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Selected Service</div>
                    <div className="flex items-center gap-3 text-zinc-900 font-medium">
                      <Settings size={16} className="text-zinc-400" />
                      {message.service}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Date Received</div>
                    <div className="flex items-center gap-3 text-zinc-900 font-medium">
                      <Clock size={16} className="text-zinc-400" />
                      {message.createdAt?.toDate().toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Full Message</div>
                <div className="bg-zinc-50 rounded-3xl p-6 md:p-8 text-zinc-700 leading-relaxed font-light whitespace-pre-wrap border border-zinc-100">
                  {message.message}
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-zinc-100 flex flex-wrap gap-4">
                {message.status === 'unread' && (
                  <button 
                    onClick={async () => {
                      await updateDoc(doc(db, 'messages', message.id), { status: 'read' });
                      onClose();
                    }}
                    className="px-8 py-4 bg-[#D8B45C] text-white rounded-2xl hover:bg-[#C49B3C] transition-all text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-amber-600/20 flex items-center gap-2"
                  >
                    <Check size={14} /> Mark as Read
                  </button>
                )}
                <button 
                  onClick={async () => {
                    if (window.confirm("Are you sure you want to delete this message?")) {
                      await deleteDoc(doc(db, 'messages', message.id));
                      onClose();
                    }
                  }}
                  className="px-8 py-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl hover:bg-red-100 transition-all text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
                >
                  <Trash size={14} /> Delete Inquiry
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  };

  const ServiceModal = ({ service, onClose }: { service: any, onClose: () => void }) => {
    if (!service) return null;

    return (
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12 backdrop-blur-xl bg-white/60"
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="w-[95vw] sm:w-[90vw] md:w-full md:max-w-4xl max-h-[92vh] bg-white border border-zinc-200 rounded-2xl md:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden relative flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2.5 rounded-full hover:bg-zinc-100 transition-colors z-20 bg-white/80 backdrop-blur-sm sm:bg-zinc-50/50"
            >
              <X size={20} className="text-zinc-500" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] h-full overflow-hidden">
              <div className="p-6 sm:p-10 md:p-14 bg-[#f6f8fa] flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-zinc-200 shrink-0">
                <div className="text-center w-full">
                  <div className="mb-6 md:mb-10 w-16 h-16 md:w-28 md:h-28 mx-auto flex items-center justify-center bg-white rounded-2xl shadow-[0_1px_3px_rgba(31,35,40,0.12)] border border-[#d0d7de]">
                    {React.cloneElement(service.icon, { size: 36, className: "md:w-14 md:h-14", strokeWidth: 1.2 })}
                  </div>
                  <h3 className="text-xl md:text-3xl font-bold text-[#1f2328] mb-3 md:mb-4 tracking-tighter uppercase">{service.title}</h3>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#d0d7de] text-[#636c76] text-[10px] md:text-[11px] font-bold uppercase tracking-widest shadow-sm">
                    <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Ready for deployment
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-10 md:p-16 bg-white overflow-y-auto custom-scrollbar">
                <div className="space-y-10 md:space-y-12">
                  <div className="relative">
                    <div className="flex items-center gap-3 text-[#636c76] text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] mb-4 md:mb-6">
                       <div className="w-4 md:w-6 h-[1px] bg-[#d0d7de]"></div>
                       The Strategy
                    </div>
                    <p className="text-[#1f2328] text-lg md:text-2xl leading-tight font-medium tracking-tight">
                      {service.why}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 text-[#636c76] text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] mb-4 md:mb-6">
                       <div className="w-4 md:w-6 h-[1px] bg-[#d0d7de]"></div>
                       Actionable Items
                    </div>
                    <p className="text-[#636c76] text-sm md:text-base leading-relaxed mb-8 md:mb-10 font-light">
                      {service.desc}
                    </p>
                    <ul className="grid grid-cols-1 gap-3 md:gap-4">
                      {service.details?.map((detail: string, i: number) => (
                        <li key={i} className="flex gap-4 md:gap-5 items-start p-4 md:p-5 rounded-xl border border-[#d0d7de] hover:border-amber-500/30 hover:bg-[#f6f8fa] transition-all group">
                          <CheckCircle size={16} className="text-green-600 mt-1 shrink-0 group-hover:scale-110 transition-transform" />
                          <span className="text-[#1f2328] text-sm md:text-[15px] font-medium leading-relaxed">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-8 md:pt-10 border-t border-[#d0d7de] flex flex-col sm:flex-row items-center justify-between gap-6 md:gap-8">
                    <div className="flex items-center gap-4 self-start sm:self-center">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#A67C00] font-bold text-xs md:text-sm shadow-sm transform -rotate-3">NK</div>
                      <div>
                        <div className="text-[#636c76] text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] leading-none mb-1.5">Final Delivery</div>
                        <div className="text-[#1f2328] text-xs md:text-sm font-bold tracking-tight uppercase">{service.outcome || "Optimized efficiency."}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        onClose();
                        const element = document.getElementById('contact');
                        if (element) element.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-3.5 bg-[#1f2328] text-white text-[11px] md:text-[12px] font-bold rounded-xl hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 uppercase tracking-widest"
                    >
                      Start building this
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  const ServiceCard = ({ service, index, onSelect }: { service: any, index: number, onSelect: () => void }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1 }}
        className="relative h-[340px] w-full [perspective:1000px] group cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
        onMouseEnter={() => setIsFlipped(true)}
        onMouseLeave={() => setIsFlipped(false)}
      >
        <motion.div
          className="relative w-full h-full transition-all duration-700 [transform-style:preserve-3d]"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
        >
          {/* Front */}
          <div className="absolute inset-0 [backface-visibility:hidden] p-8 md:p-10 bg-white/40 border border-zinc-200 rounded-3xl flex flex-col items-center justify-center text-center backdrop-blur-sm group-hover:border-amber-500/30 transition-colors">
            <div className="mb-6 w-14 h-14 flex items-center justify-center bg-amber-500/5 rounded-2xl group-hover:bg-amber-500/10 transition-colors">
              {service.icon}
            </div>
            <h3 className="text-xl font-medium text-zinc-900 mb-2 tracking-tight">{service.title}</h3>
            <p className="text-zinc-600 text-xs leading-relaxed font-light">{service.desc}</p>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
              className="mt-8 flex items-center gap-2 text-[9px] font-bold text-amber-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity bg-transparent"
            >
              Why / What <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Back */}
          <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] p-8 md:p-10 bg-white/80 border border-amber-500/20 rounded-3xl flex flex-col justify-center backdrop-blur-md">
             <div className="mb-6">
               <div className="text-[#A67C00] text-[9px] font-bold uppercase tracking-[0.2em] mb-2">Why It Matters</div>
               <p className="text-zinc-700 text-xs leading-relaxed font-light">{service.why}</p>
             </div>
             <div className="mb-6">
               <div className="text-[#A67C00] text-[9px] font-bold uppercase tracking-[0.2em] mb-2">What We Do</div>
               <p className="text-zinc-900 text-xs leading-relaxed font-medium line-clamp-2">{service.what}</p>
             </div>
             <button 
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
              className="mt-2 text-[9px] font-bold text-amber-600 uppercase tracking-widest flex items-center gap-2"
            >
              View Full Detail <ChevronRight size={10} />
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  const [projects, setProjects] = useState<Project[]>([]);

  const [projectModal, setProjectModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    project: Project | null;
  }>({
    isOpen: false,
    mode: 'add',
    project: null
  });

  const getProjectIcon = (type: string, size = 40) => {
    switch (type) {
      case 'message': return <MessageSquare size={size} className="text-violet-500/30" />;
      case 'eye': return <Eye size={size} className="text-violet-500/30" />;
      case 'layout': return <Layout size={size} className="text-violet-500/30" />;
      case 'chart': return <BarChart3 size={size} className="text-violet-500/30" />;
      default: return <Zap size={size} className="text-violet-500/30" />;
    }
  };

  const handleAddProject = () => {
    setProjectModal({
      isOpen: true,
      mode: 'add',
      project: {
        id: Math.random().toString(36).substr(2, 9),
        title: '',
        category: '',
        desc: '',
        iconType: 'layout',
        link: ''
      }
    });
  };

  const handleEditProject = (project: Project) => {
    setProjectModal({
      isOpen: true,
      mode: 'edit',
      project: { ...project }
    });
  };

  const handleDeleteProject = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setProjectToDelete(id);
  };

  const confirmDelete = async () => {
    if (projectToDelete) {
      try {
        await deleteDoc(doc(db, 'projects', projectToDelete));
        setProjectToDelete(null);
      } catch (err) {
        console.error("Failed to delete project", err);
      }
    }
  };

  const saveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectModal.project) return;

    try {
      const { id, ...rest } = projectModal.project;
      if (projectModal.mode === 'add') {
        const order = projects.length;
        await setDoc(doc(db, 'projects', id), { ...rest, order });
      } else {
        await updateDoc(doc(db, 'projects', id), rest);
      }
      setProjectModal({ isOpen: false, mode: 'add', project: null });
    } catch (err) {
      console.error("Failed to save project", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length === 0) {
      try {
        await addDoc(collection(db, 'messages'), {
          ...formData,
          createdAt: serverTimestamp(),
          status: 'unread'
        });
        setIsSubmitted(true);
        setFormData({
          name: '',
          email: '',
          company: '',
          service: 'Select a service',
          message: ''
        });
        // Auto-reset success state after 10 seconds
        setTimeout(() => setIsSubmitted(false), 10000);
      } catch (error) {
        console.error("Error submitting form", error);
        setErrors({ submit: "Failed to send message. Please try again." });
      }
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div 
      className="min-h-screen bg-transparent text-zinc-900 font-sans selection:bg-amber-200 selection:text-amber-900 overflow-x-hidden"
      style={{ 
        '--color-primary': websiteConfig?.colors?.primary || '#D8B45C',
        '--color-secondary': websiteConfig?.colors?.secondary || '#A67C00'
      } as any}
    >
      {currentUser?.email === 'nishkalya@gmail.com' && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-zinc-900 text-white text-[9px] font-bold uppercase tracking-[0.3em] h-8 flex items-center justify-center gap-6 border-b border-white/5">
          <div className="flex items-center gap-2 text-amber-500">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
            Admin View
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setCurrentView('admin')} 
              className={`hover:text-amber-500 transition-colors ${currentView === 'admin' ? 'text-amber-500' : 'text-zinc-400'}`}
            >
              Management Console
            </button>
            <div className="w-px h-3 bg-zinc-800"></div>
            <button 
              onClick={() => { setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
              className={`hover:text-amber-500 transition-colors ${currentView === 'home' ? 'text-amber-500' : 'text-zinc-400'}`}
            >
              Public Preview
            </button>
          </div>
        </div>
      )}
      <ServiceModal service={selectedService} onClose={() => setSelectedService(null)} />
      <AdminMessageModal message={selectedAdminMessage} onClose={() => setSelectedAdminMessage(null)} />
      
      {/* Ambient Background Accents */}
      <div className={`fixed top-[-10%] right-[-10%] w-[800px] h-[800px] bg-amber-400/10 rounded-full blur-[140px] pointer-events-none z-0 ${currentUser?.email === 'nishkalya@gmail.com' ? 'translate-y-8' : ''}`}></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-amber-600/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* Navigation */}
      <nav className={`fixed left-0 right-0 z-50 bg-white/40 backdrop-blur-md border-b border-zinc-200/50 transition-all duration-300 ${currentUser?.email === 'nishkalya@gmail.com' ? 'top-8' : 'top-0'}`}>
        <div className="flex items-center justify-between px-6 md:px-12 py-5 w-full max-w-7xl mx-auto">
          <div 
            className="flex items-center space-x-2 group cursor-pointer" 
            onClick={() => { setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            role="button"
            aria-label="Go to home"
          >
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center transform rotate-12 group-hover:rotate-0 transition-transform duration-500 shadow-lg"
              style={{ backgroundColor: 'var(--color-primary)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
            >
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900 uppercase">Nishkalya</span>
          </div>
          <div className="hidden sm:flex space-x-8 text-[11px] font-bold tracking-[0.2em] text-zinc-500 uppercase flex-wrap justify-center">
            <button aria-label="Home" onClick={() => { setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`hover:text-zinc-900 transition-colors ${currentView === 'home' ? 'text-zinc-900' : ''}`}>Home</button>
            <button aria-label="About" onClick={() => scrollToSection('about')} className="hover:text-zinc-900 transition-colors">About</button>
            <button aria-label="Services" onClick={() => scrollToSection('services')} className="hover:text-zinc-900 transition-colors">Services</button>
            <button aria-label="Projects" onClick={() => { setCurrentView('projects'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`hover:text-zinc-900 transition-colors ${currentView === 'projects' ? 'text-zinc-900' : ''}`}>Projects</button>
            <button aria-label="Contact" onClick={() => scrollToSection('contact')} className="hover:text-zinc-900 transition-colors">Contact</button>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => scrollToSection('contact')}
              className="hidden sm:block px-6 py-2.5 bg-[#D8B45C]/10 border border-[#D8B45C]/20 hover:bg-[#D8B45C] hover:text-white transition-all duration-300 text-[10px] font-bold rounded-full uppercase tracking-widest text-[#A67C00]"
            >
              Get Started
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              <div className={`w-6 h-0.5 bg-current transition-all ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></div>
              <div className={`w-6 h-0.5 bg-current transition-all ${isMobileMenuOpen ? 'opacity-0' : ''}`}></div>
              <div className={`w-6 h-0.5 bg-current transition-all ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></div>
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="sm:hidden bg-[#0a0a0c] border-b border-zinc-800 overflow-hidden"
            >
              <div className="p-8 flex flex-col gap-6 text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-500 text-center">
                <button onClick={() => { setCurrentView('home'); setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-violet-500 py-2">Home</button>
                <button onClick={() => scrollToSection('about')} className="hover:text-violet-500 py-2">About</button>
                <button onClick={() => scrollToSection('services')} className="hover:text-violet-500 py-2">Services</button>
                <button onClick={() => { setCurrentView('projects'); setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-violet-500 py-2">Projects</button>
                <button onClick={() => scrollToSection('contact')} className="hover:text-violet-500 py-2">Contact</button>
                <button 
                  onClick={() => scrollToSection('contact')}
                  className="mt-4 w-full py-4 bg-[#D8B45C] text-white rounded-xl shadow-lg shadow-amber-600/20 text-[10px] uppercase tracking-widest font-bold"
                >
                  Start a Project
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {currentView === 'admin' ? (
          <motion.div
            key="admin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AdminDashboard />
          </motion.div>
        ) : currentView === 'home' ? (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Hero Section */}
            <section className="relative min-h-[90vh] md:min-h-screen flex flex-col items-center justify-center pt-32 pb-20 px-6 md:px-12 z-10 w-full max-w-7xl mx-auto text-center">
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="max-w-4xl"
              >
                <motion.div 
                  variants={itemVariants} 
                  className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full mb-6 md:mb-8"
                  style={{ backgroundColor: `var(--color-primary)1A`, border: `1px solid var(--color-primary)33` }}
                >
                  <span 
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  ></span>
                  <span 
                    className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.25em]"
                    style={{ color: 'var(--color-secondary)' }}
                  >
                    {websiteConfig?.hero?.badge}
                  </span>
                </motion.div>
                
                <motion.h1 
                  variants={itemVariants}
                  className="text-3xl sm:text-6xl md:text-8xl font-light leading-[1.2] md:leading-[1.1] text-zinc-900 mb-6 md:mb-8 tracking-tight px-4 md:px-0" 
                  style={{ fontFamily: "'Georgia', serif" }}
                >
                  <span dangerouslySetInnerHTML={{ __html: websiteConfig?.hero?.heading }} />
                </motion.h1>
                
                <motion.p 
                  variants={itemVariants}
                  className="text-base md:text-xl text-zinc-700 max-w-2xl mx-auto leading-relaxed font-light mb-10 md:mb-12 px-2 md:px-0"
                >
                  {websiteConfig?.hero?.subheading}
                </motion.p>
      
                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center gap-4 md:gap-5 px-6 sm:px-0">
                  <button 
                    onClick={() => setCurrentView('projects')}
                    className="w-full sm:w-auto px-8 py-4 text-white font-bold rounded-full hover:scale-105 transition-all duration-300 text-[10px] md:text-xs uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 group"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    View Our Work <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button 
                    onClick={() => scrollToSection('contact')}
                    className="w-full sm:w-auto px-8 py-4 bg-transparent border border-zinc-300 text-zinc-900 font-bold rounded-full hover:bg-white/30 transition-all duration-300 text-[10px] md:text-xs uppercase tracking-[0.2em]"
                  >
                    Start a Project
                  </button>
                </motion.div>
      
                {/* Stats Bar */}
                <motion.div 
                  variants={itemVariants}
                  className="grid grid-cols-2 md:grid-cols-4 gap-y-10 md:gap-16 mt-20 md:mt-24 py-10 border-y border-zinc-200/50"
                >
                  {websiteConfig?.hero?.stats?.map((stat: any, i: number) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className="text-2xl md:text-3xl font-light text-zinc-900 tracking-tighter mb-1">{stat.value}</div>
                      <div className="text-[8px] md:text-[9px] text-zinc-600 uppercase tracking-[0.25em] md:tracking-[0.35em] font-medium whitespace-nowrap">{stat.label}</div>
                    </div>
                  ))}
                </motion.div>
              </motion.div>
            </section>
      
            {/* About Section */}
            <section id="about" className="py-20 md:py-32 px-6 md:px-12 z-10 w-full max-w-7xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="order-2 md:order-1"
                >
                  <div 
                    className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em] mb-4"
                    style={{ color: 'var(--color-secondary)' }}
                  >
                    {websiteConfig?.about?.badge}
                  </div>
                  <h2 className="text-4xl md:text-5xl font-light leading-tight text-zinc-900 mb-6 md:mb-8" style={{ fontFamily: "'Georgia', serif" }}>
                    <span dangerouslySetInnerHTML={{ __html: websiteConfig?.about?.heading }} />
                  </h2>
                  
                  <div className="space-y-6 mb-10">
                    {websiteConfig?.about?.paragraphs?.slice(0, 2).map((p: string, i: number) => (
                      <p key={i} className="text-zinc-700 text-base md:text-lg leading-relaxed font-light">
                        <span dangerouslySetInnerHTML={{ __html: p }} />
                      </p>
                    ))}
                    
                    <AnimatePresence>
                      {showFullAbout && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-6 overflow-hidden"
                        >
                          {websiteConfig?.about?.paragraphs?.slice(2).map((p: string, i: number) => (
                            <p key={i} className="text-zinc-700 text-base md:text-lg leading-relaxed font-light">
                              <span dangerouslySetInnerHTML={{ __html: p }} />
                            </p>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <button 
                      onClick={() => setShowFullAbout(!showFullAbout)}
                      className="text-[10px] font-bold uppercase tracking-widest text-[#A67C00] hover:text-[#C49B3C] transition-colors flex items-center gap-2 group/btn"
                    >
                      {showFullAbout ? 'Read Less' : 'Read More'}
                      <motion.span
                        animate={{ rotate: showFullAbout ? 180 : 0 }}
                        className="inline-block"
                      >
                        <ChevronRight size={14} className="rotate-90" />
                      </motion.span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 md:gap-3">
                    {websiteConfig?.about?.skills?.map((tag: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 md:px-4 md:py-1.5 rounded-full bg-white/40 border border-zinc-200 text-[9px] md:text-[10px] text-zinc-600 uppercase tracking-widest">
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1 }}
                  className="relative order-1 md:order-2 mb-12 md:mb-0"
                >
                  <div className="aspect-square bg-gradient-to-br from-amber-400/20 to-amber-900/10 rounded-2xl overflow-hidden border border-zinc-200 flex items-center justify-center">
                     <Cpu size={80} className="md:size-[120px] text-amber-500/20 absolute animate-pulse" />
                     <div className="text-center p-8 md:p-12 relative z-10">
                        <div className="text-5xl md:text-6xl font-light text-zinc-900 mb-2" style={{ fontFamily: "'Georgia', serif" }}>01</div>
                        <div className="text-[10px] md:text-xs text-amber-600 tracking-[0.4em] md:tracking-[0.5em] uppercase font-bold">Innovation first</div>
                     </div>
                  </div>
                  <div className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 p-6 md:p-8 bg-white/60 backdrop-blur-md border border-zinc-200 rounded-xl shadow-2xl z-20">
                     <div className="text-xl md:text-2xl font-light text-zinc-900 mb-1">2025</div>
                     <div className="text-[8px] md:text-[9px] text-zinc-600 uppercase tracking-widest">Future Ready</div>
                  </div>
                </motion.div>
              </div>
            </section>
      
            <section id="services" className="py-20 md:py-32 px-6 md:px-12 bg-amber-500/5 relative">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 md:mb-20">
                  <div className="text-[#A67C00] text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em] mb-4">What We Do</div>
                  <h2 className="text-4xl md:text-5xl font-light text-zinc-900 mb-6" style={{ fontFamily: "'Georgia', serif" }}>
                    Services Built for <span className="italic text-[#A67C00]">Tomorrow</span>
                  </h2>
                  <p className="text-zinc-600 max-w-2xl mx-auto text-sm md:text-base">From AI strategy to shipped product, we cover every layer of the modern digital stack.</p>
                </div>
      
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                  {websiteConfig?.services?.map((service: any, i: number) => {
                    const icons: any = {
                      "AI Product Development": <Zap className="text-[#A67C00]" />,
                      "UI/UX Design Systems": <Layout className="text-[#A67C00]" />,
                      "LLM Integration": <MessageSquare className="text-[#A67C00]" />,
                      "Computer Vision": <Eye className="text-[#A67C00]" />,
                      "Data Intelligence": <BarChart3 className="text-[#A67C00]" />,
                      "Web & App Development": <Globe className="text-[#A67C00]" />
                    };
                    return (
                      <ServiceCard key={i} service={{ ...service, icon: icons[service.title] || <Zap className="text-[#A67C00]" /> }} index={i} onSelect={() => setSelectedService({ ...service, icon: icons[service.title] || <Zap className="text-[#A67C00]" /> })} />
                    );
                  })}
                </div>
              </div>
            </section>
          </motion.div>
        ) : (
          <motion.div
            key="projects"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="pt-32 pb-32 px-6 md:px-12 w-full max-w-7xl mx-auto min-h-screen"
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-20 gap-6 md:gap-8">
              <div>
                <div className="text-[#A67C00] text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em] mb-4">
                  Begin your project
                </div>
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-5xl md:text-7xl font-light text-zinc-900" 
                  style={{ fontFamily: "'Georgia', serif" }}
                >
                  Pure <span className="italic text-[#A67C00]">Innovation.</span>
                </motion.h2>
              </div>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-6"
              >
                <p className="text-zinc-600 max-w-md text-sm md:text-base leading-relaxed">A specialized gallery of our most impactful work in AI, Design, and Engineering.</p>
              </motion.div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {projects.map((project, i) => (
                <motion.div 
                  key={project.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group cursor-pointer relative"
                  onClick={() => {
                    if (project.link) {
                      setSelectedProjectForPreview(project);
                      setActivePreviewUrl(project.link);
                      setIsIframeLoading(true);
                      setShowFullPreview(false);
                    }
                  }}
                >
                  <div className="aspect-[4/5] bg-white/40 border border-zinc-200 rounded-3xl mb-6 flex items-center justify-center group-hover:border-amber-500/30 transition-all overflow-hidden relative">
                    {project.link ? (
                      <div className="absolute inset-0 z-0 overflow-hidden">
                        <iframe 
                          src={project.link} 
                          className="w-[100%] h-[100%] border-none opacity-40 group-hover:opacity-100 transition-all duration-1000 pointer-events-none scale-[1.1] group-hover:scale-100 bg-white"
                          title={project.title}
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent group-hover:opacity-20 transition-opacity duration-500"></div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-amber-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    )}
                    
                    <div className="absolute bottom-8 left-8 right-8 z-20 transform group-hover:-translate-y-2 transition-transform duration-500">
                      <div className="text-[9px] font-bold text-[#A67C00] uppercase tracking-widest mb-2">{project.category}</div>
                      <h3 className="text-xl font-light text-zinc-900 mb-2 uppercase tracking-tight leading-tight">{project.title}</h3>
                      <div className="w-10 h-0.5 bg-[#D8B45C] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                    </div>

                    {/* Desktop Hover Icon */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-20 transition-all duration-1000 transform group-hover:scale-[2] pointer-events-none">
                      {getProjectIcon(project.iconType, 120)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Project Management Modal */}
      <AnimatePresence>
        {projectModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setProjectModal({ ...projectModal, isOpen: false })}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0a0a0c] border border-zinc-800 rounded-3xl p-6 md:p-10 shadow-2xl overflow-y-auto max-h-[85vh] lg:max-h-[90vh] scrollbar-hide"
            >
              <button 
                onClick={() => setProjectModal({ ...projectModal, isOpen: false })}
                className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <h3 className="text-2xl font-light text-white mb-8" style={{ fontFamily: "'Georgia', serif" }}>
                {projectModal.mode === 'add' ? 'Add New Project' : 'Edit Project'}
              </h3>

              <form onSubmit={saveProject} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Project Title</label>
                  <input 
                    required
                    value={projectModal.project?.title || ''}
                    onChange={(e) => setProjectModal({ ...projectModal, project: { ...projectModal.project!, title: e.target.value }})}
                    placeholder="E.g. Orion — AI Customer Intelligence"
                    className="w-full bg-[#050507] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Category (Tags)</label>
                  <input 
                    required
                    value={projectModal.project?.category || ''}
                    onChange={(e) => setProjectModal({ ...projectModal, project: { ...projectModal.project!, category: e.target.value }})}
                    placeholder="E.g. AI · NLP · SaaS"
                    className="w-full bg-[#050507] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Icon Type</label>
                  <div className="grid grid-cols-4 gap-3">
                    {['message', 'eye', 'layout', 'chart'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setProjectModal({ ...projectModal, project: { ...projectModal.project!, iconType: type as any }})}
                        className={`flex items-center justify-center p-4 rounded-xl border transition-all ${projectModal.project?.iconType === type ? 'border-violet-500 bg-violet-500/10 text-violet-400' : 'border-zinc-800 bg-zinc-900/50 text-zinc-600 hover:border-zinc-700'}`}
                      >
                        {getProjectIcon(type, 20)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Detailed Overview (Markdown)</label>
                  <textarea 
                    rows={6}
                    value={projectModal.project?.fullDetails?.overview || ''}
                    onChange={(e) => setProjectModal({ 
                      ...projectModal, 
                      project: { 
                        ...projectModal.project!, 
                        fullDetails: { 
                          ...(projectModal.project!.fullDetails || { features: [], techStack: [], structure: [], license: 'Proprietary License — All Rights Reserved.' }), 
                          overview: e.target.value 
                        } 
                      }
                    })}
                    placeholder="# Project Header\n\nWrite your detailed project story here..."
                    className="w-full bg-[#050507] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors resize-none mb-4"
                  />
                </div>
                
                {/* Advanced Project Details */}
                <div className="space-y-6 pt-4 border-t border-zinc-800">
                  <h4 className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Full Project Details</h4>
                  
                  {/* Features Editor */}
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3">Key Features</label>
                    <div className="space-y-2">
                       {(projectModal.project?.fullDetails?.features || []).map((feature, fIdx) => (
                         <div key={fIdx} className="flex gap-2">
                           <input 
                              value={feature}
                              onChange={(e) => {
                                const newFeatures = [...(projectModal.project!.fullDetails!.features)];
                                newFeatures[fIdx] = e.target.value;
                                setProjectModal({
                                  ...projectModal,
                                  project: {
                                    ...projectModal.project!,
                                    fullDetails: { ...projectModal.project!.fullDetails!, features: newFeatures }
                                  }
                                });
                              }}
                              className="flex-1 bg-[#050507] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white"
                           />
                           <button 
                             type="button"
                             onClick={() => {
                               const newFeatures = projectModal.project!.fullDetails!.features.filter((_, idx) => idx !== fIdx);
                               setProjectModal({
                                  ...projectModal,
                                  project: {
                                    ...projectModal.project!,
                                    fullDetails: { ...projectModal.project!.fullDetails!, features: newFeatures }
                                  }
                               });
                             }}
                             className="text-red-500 p-2"
                           ><X size={14} /></button>
                         </div>
                       ))}
                       <button 
                         type="button"
                         onClick={() => {
                           const newFeatures = [...(projectModal.project?.fullDetails?.features || []), 'New feature'];
                           setProjectModal({
                              ...projectModal,
                              project: {
                                ...projectModal.project!,
                                fullDetails: { 
                                  ...(projectModal.project?.fullDetails || { features: [], techStack: [], structure: [], license: 'Proprietary' }), 
                                  features: newFeatures 
                                }
                              }
                           });
                         }}
                         className="w-full py-2 border border-dashed border-zinc-800 rounded-lg text-[10px] text-zinc-500 hover:text-white"
                       >+ Add Feature</button>
                    </div>
                  </div>

                  {/* Tech Stack Editor */}
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3">Tech Stack</label>
                    <div className="space-y-3">
                       {(projectModal.project?.fullDetails?.techStack || []).map((tech, tIdx) => (
                         <div key={tIdx} className="grid grid-cols-2 gap-2 p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl relative group">
                           <input 
                              placeholder="Language/Tool"
                              value={tech.name}
                              onChange={(e) => {
                                const newStack = [...(projectModal.project!.fullDetails!.techStack)];
                                newStack[tIdx] = { ...tech, name: e.target.value };
                                setProjectModal({
                                  ...projectModal,
                                  project: {
                                    ...projectModal.project!,
                                    fullDetails: { ...projectModal.project!.fullDetails!, techStack: newStack }
                                  }
                                });
                              }}
                              className="bg-transparent border-none text-[11px] font-bold text-white outline-none"
                           />
                           <input 
                              placeholder="Role / Use Case"
                              value={tech.role}
                              onChange={(e) => {
                                const newStack = [...(projectModal.project!.fullDetails!.techStack)];
                                newStack[tIdx] = { ...tech, role: e.target.value };
                                setProjectModal({
                                  ...projectModal,
                                  project: {
                                    ...projectModal.project!,
                                    fullDetails: { ...projectModal.project!.fullDetails!, techStack: newStack }
                                  }
                                });
                              }}
                              className="bg-transparent border-none text-[10px] text-zinc-400 outline-none"
                           />
                           <button 
                             type="button"
                             onClick={() => {
                               const newStack = projectModal.project!.fullDetails!.techStack.filter((_, idx) => idx !== tIdx);
                               setProjectModal({
                                  ...projectModal,
                                  project: {
                                    ...projectModal.project!,
                                    fullDetails: { ...projectModal.project!.fullDetails!, techStack: newStack }
                                  }
                               });
                             }}
                             className="absolute -top-2 -right-2 w-6 h-6 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                           ><X size={10} /></button>
                         </div>
                       ))}
                       <button 
                         type="button"
                         onClick={() => {
                           const newStack = [...(projectModal.project?.fullDetails?.techStack || []), { name: 'Tech', role: 'Usage' }];
                           setProjectModal({
                              ...projectModal,
                              project: {
                                ...projectModal.project!,
                                fullDetails: { 
                                  ...(projectModal.project?.fullDetails || { features: [], techStack: [], structure: [], license: 'Proprietary' }), 
                                  techStack: newStack 
                                }
                              }
                           });
                         }}
                         className="w-full py-2 border border-dashed border-zinc-800 rounded-lg text-[10px] text-zinc-500 hover:text-white"
                       >+ Add Tech</button>
                    </div>
                  </div>

                  {/* Structure Editor */}
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3">Project Structure (File Tree)</label>
                    <div className="space-y-3">
                       {(projectModal.project?.fullDetails?.structure || []).map((item, sIdx) => (
                         <div key={sIdx} className="grid grid-cols-2 gap-2 p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl relative group">
                           <input 
                              placeholder="File/Folder"
                              value={item.name}
                              onChange={(e) => {
                                const newStruct = [...(projectModal.project!.fullDetails!.structure)];
                                newStruct[sIdx] = { ...item, name: e.target.value };
                                setProjectModal({
                                  ...projectModal,
                                  project: {
                                    ...projectModal.project!,
                                    fullDetails: { ...projectModal.project!.fullDetails!, structure: newStruct }
                                  }
                                });
                              }}
                              className="bg-transparent border-none text-[11px] font-bold text-white outline-none"
                           />
                           <input 
                              placeholder="Description"
                              value={item.desc}
                              onChange={(e) => {
                                const newStruct = [...(projectModal.project!.fullDetails!.structure)];
                                newStruct[sIdx] = { ...item, desc: e.target.value };
                                setProjectModal({
                                  ...projectModal,
                                  project: {
                                    ...projectModal.project!,
                                    fullDetails: { ...projectModal.project!.fullDetails!, structure: newStruct }
                                  }
                                });
                              }}
                              className="bg-transparent border-none text-[10px] text-zinc-400 outline-none"
                           />
                           <button 
                             type="button"
                             onClick={() => {
                               const newStruct = projectModal.project!.fullDetails!.structure.filter((_, idx) => idx !== sIdx);
                               setProjectModal({
                                  ...projectModal,
                                  project: {
                                    ...projectModal.project!,
                                    fullDetails: { ...projectModal.project!.fullDetails!, structure: newStruct }
                                  }
                               });
                             }}
                             className="absolute -top-2 -right-2 w-6 h-6 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                           ><X size={10} /></button>
                         </div>
                       ))}
                       <button 
                         type="button"
                         onClick={() => {
                           const newStruct = [...(projectModal.project?.fullDetails?.structure || []), { name: 'src/', desc: 'Logic' }];
                           setProjectModal({
                              ...projectModal,
                              project: {
                                ...projectModal.project!,
                                fullDetails: { 
                                  ...(projectModal.project?.fullDetails || { features: [], techStack: [], structure: [], license: 'Proprietary' }), 
                                  structure: newStruct 
                                }
                              }
                           });
                         }}
                         className="w-full py-2 border border-dashed border-zinc-800 rounded-lg text-[10px] text-zinc-500 hover:text-white"
                       >+ Add Structure Item</button>
                    </div>
                  </div>

                  {/* License Input */}
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">License (e.g. MIT, Proprietary)</label>
                    <input 
                      value={projectModal.project?.fullDetails?.license || ''}
                      onChange={(e) => setProjectModal({ 
                        ...projectModal, 
                        project: { 
                          ...projectModal.project!, 
                          fullDetails: { 
                            ...(projectModal.project!.fullDetails || { features: [], techStack: [], structure: [], license: 'Proprietary' }), 
                            license: e.target.value 
                          } 
                        }
                      })}
                      className="w-full bg-[#050507] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Description (Short)</label>
                  <textarea 
                    required
                    rows={4}
                    value={projectModal.project?.desc || ''}
                    onChange={(e) => setProjectModal({ ...projectModal, project: { ...projectModal.project!, desc: e.target.value }})}
                    placeholder="Describe the project impact and technology..."
                    className="w-full bg-[#050507] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors resize-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Live Link (Optional)</label>
                  <input 
                    value={projectModal.project?.link || ''}
                    onChange={(e) => setProjectModal({ ...projectModal, project: { ...projectModal.project!, link: e.target.value }})}
                    placeholder="https://example.com"
                    className="w-full bg-[#050507] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-4 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition-all text-xs uppercase tracking-widest shadow-lg shadow-violet-600/20"
                >
                  {projectModal.mode === 'add' ? 'Create Project' : 'Save Changes'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {projectToDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
              onClick={() => setProjectToDelete(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white/80 backdrop-blur-md border border-zinc-200 rounded-3xl p-8 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mx-auto mb-6">
                <Trash2 size={32} />
              </div>
              <h3 className="text-2xl font-light text-zinc-900 mb-3" style={{ fontFamily: "'Georgia', serif" }}>Delete Project?</h3>
              <p className="text-zinc-500 text-sm font-light leading-relaxed mb-8">
                This action cannot be undone. Are you sure you want to remove this project from your portfolio?
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setProjectToDelete(null)}
                  className="flex-1 py-3 bg-white border border-zinc-200 text-zinc-600 font-bold rounded-xl hover:text-zinc-900 transition-all text-[10px] uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all text-[10px] uppercase tracking-widest shadow-lg shadow-red-600/20"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Terminal / VS Code Style Project Preview */}
      <AnimatePresence>
        {activePreviewUrl && selectedProjectForPreview && (
          <div className="fixed inset-0 z-[201] flex items-center justify-center overflow-hidden p-0 sm:p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
              onClick={() => { setActivePreviewUrl(null); setSelectedProjectForPreview(null); }}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.98, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 20 }}
              className="relative w-full h-full max-h-full sm:max-h-[94vh] max-w-full sm:max-w-7xl bg-[#0d1117] sm:rounded-2xl border-t sm:border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
            >
              {/* VS Code Style Header */}
              <div className="h-12 md:h-14 bg-[#161b22] border-b border-white/5 flex items-center justify-between px-4 shrink-0 select-none">
                <div className="flex items-center gap-4 md:gap-6">
                  {/* Window Controls - Hidden on tiny mobile */}
                  <div className="hidden xs:flex gap-2">
                    <button onClick={() => { setActivePreviewUrl(null); setSelectedProjectForPreview(null); }} className="w-3 h-3 rounded-full bg-[#ff5f56] border border-black/10 hover:opacity-80 transition-opacity" />
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-black/10" />
                    <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-black/10" />
                  </div>
                  
                  {/* File/Tab Name */}
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Terminal size={14} className="text-amber-500 shrink-0" />
                    <span className="text-[10px] md:text-[11px] font-medium tracking-wide uppercase opacity-60 truncate max-w-[120px] md:max-w-none">
                      {showFullPreview ? 'Live_Instance.sh' : 'README.md'}
                    </span>
                  </div>
                </div>

                <div className="hidden lg:flex items-center gap-3 bg-[#0d1117] px-4 py-1.5 rounded-md border border-white/5 mx-auto">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                   <span className="text-[10px] font-mono text-green-500/80 uppercase tracking-widest truncate max-w-[300px]">{selectedProjectForPreview.title}</span>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                  <a 
                    href={selectedProjectForPreview.link} 
                    target="_blank" 
                    referrerPolicy="no-referrer"
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-md text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all border border-white/5"
                  >
                    <Maximize2 size={12} className="shrink-0" /> <span className="hidden xs:inline">Visit</span>
                  </a>
                  <button 
                    onClick={() => { setActivePreviewUrl(null); setSelectedProjectForPreview(null); }}
                    className="p-1.5 text-zinc-500 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Main Content Pane */}
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
                {/* Desktop Sidebar / Mobile Tab Bar Container */}
                <div className="w-full md:w-64 bg-[#161b22] border-t md:border-t-0 md:border-r border-white/5 flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto shrink-0 py-2 md:py-4 order-2 md:order-1 scrollbar-hide">
                  <div className="px-4 md:px-6 md:mb-6 flex flex-row md:flex-col gap-1 w-full">
                    <div className="hidden md:block text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 opacity-50">Exploration</div>
                    {[
                      { id: 'live', name: 'Live_stream.exe', mobileName: 'Live Preview', icon: <Activity size={14} className="text-red-400" /> },
                      { id: 'details', name: 'README.md', mobileName: 'Documentation', icon: <FileCode size={14} className="text-blue-400" /> },
                      { id: 'stack', name: 'package.json', mobileName: 'Tech Stack', icon: <Package size={14} className="text-amber-400" /> },
                    ].map((tab) => (
                      <button 
                        aria-label="View Project"
                        key={tab.id}
                        onClick={() => {
                          if (tab.id === 'live') setShowFullPreview(true);
                          else setShowFullPreview(false);
                        }}
                        className={`flex items-center gap-2 md:gap-3 px-3 py-2 md:py-2 rounded-lg text-[10px] md:text-xs font-mono transition-all group whitespace-nowrap shrink-0 ${
                          (showFullPreview && tab.id === 'live') || (!showFullPreview && tab.id === 'details')
                            ? 'bg-white/10 text-white md:bg-white/5' 
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        <span className="opacity-70 group-hover:opacity-100 shrink-0">{tab.icon}</span>
                        <span className="hidden md:inline">{tab.name}</span>
                        <span className="md:hidden">{tab.mobileName}</span>
                      </button>
                    ))}
                  </div>

                  <div className="hidden md:flex px-6 mt-auto py-6 border-t border-white/5 flex-col">
                    <div className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3 opacity-50">Deployed State</div>
                    <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      Production stable
                    </div>
                    <div className="mt-4 p-3 bg-black/40 rounded-lg border border-white/5 shadow-inner">
                      <div className="text-[8px] font-mono text-amber-500/60 mb-2 whitespace-nowrap overflow-hidden">
                        <span className="animate-pulse">{'>'}</span> status_check
                      </div>
                      <div className="text-[9px] font-mono text-zinc-500 italic uppercase leading-tight">All systems operative. Neural paths clear.</div>
                    </div>
                  </div>
                </div>

                {/* Main Viewport */}
                <div className="flex-1 flex flex-col bg-[#0d1117] overflow-hidden order-1 md:order-2">
                  <div className="flex-1 relative flex flex-col overflow-hidden">
                    {/* Live Iframe View */}
                    <div className={`relative flex-1 bg-black overflow-hidden transition-all duration-700 ${showFullPreview ? 'opacity-100 z-10' : 'opacity-0 z-0 absolute inset-0 pointer-events-none'}`}>
                      <AnimatePresence>
                        {isIframeLoading && (
                          <motion.div 
                            initial={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-20 bg-[#0d1117] flex flex-col items-center justify-center p-6 text-center"
                          >
                            <div className="relative mb-8">
                              <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-white/5 border-t-amber-500 rounded-full animate-spin"></div>
                              <Terminal size={28} className="text-amber-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                            </div>
                            <div className="space-y-3">
                              <div className="text-[10px] md:text-[12px] font-mono text-white/80 uppercase tracking-[0.4em] font-bold">Mounting Remote Partition...</div>
                              <div className="text-[9px] font-mono text-[#A67C00]/60 uppercase tracking-widest break-all max-w-xs mx-auto">{selectedProjectForPreview.link}</div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      <iframe 
                        src={activePreviewUrl} 
                        onLoad={() => setIsIframeLoading(false)}
                        loading="lazy"
                        className="w-full h-full border-none pointer-events-auto"
                        title="Project Terminal"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                      />

                      {/* View Switcher Overlay for Mobile Live View */}
                      <button 
                        onClick={() => setShowFullPreview(false)}
                        className="md:hidden absolute bottom-6 left-1/2 -translate-x-1/2 z-30 px-6 py-3 bg-black/60 backdrop-blur-xl border border-white/20 text-white rounded-full text-[10px] font-bold uppercase tracking-widest shadow-2xl flex items-center gap-2"
                      >
                        <FileCode size={14} /> View Documentation
                      </button>

                      {/* Neon Border Glow */}
                      <div className="absolute inset-0 border border-amber-500/10 pointer-events-none shadow-[inset_0_0_80px_rgba(216,180,92,0.08)]"></div>
                    </div>

                    {/* README / Details View */}
                    <div className={`flex-1 overflow-y-auto scrollbar-hide bg-[#0d1117] p-6 sm:p-10 md:p-16 transition-all duration-700 ${!showFullPreview ? 'opacity-100 translate-y-0 z-10' : 'opacity-0 translate-y-20 z-0 absolute inset-0 pointer-events-none'}`}>
                      <div className="max-w-4xl mx-auto space-y-12 md:space-y-20">
                        {/* Title & Category Area */}
                        <div className="border-b border-white/5 pb-10 md:pb-12 pt-4 md:pt-0">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                             <div className="w-12 h-12 md:w-14 md:h-14 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 border border-amber-500/20 shrink-0">
                                {getProjectIcon(selectedProjectForPreview.iconType, 28)}
                             </div>
                             <div>
                                <div className="text-[10px] font-black text-amber-500/80 uppercase tracking-[0.3em] font-mono mb-1">{selectedProjectForPreview.category}</div>
                                <h2 className="text-2xl md:text-5xl font-light text-white leading-tight" style={{ fontFamily: "'Georgia', serif" }}>{selectedProjectForPreview.title}</h2>
                             </div>
                          </div>
                          <p className="text-zinc-400 text-base md:text-lg font-light leading-relaxed max-w-3xl">{selectedProjectForPreview.desc}</p>
                          
                          <div className="mt-8 flex flex-wrap gap-4">
                            <button 
                              onClick={() => setShowFullPreview(true)}
                              className="px-6 py-3 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-all text-[10px] uppercase tracking-widest flex items-center gap-2"
                            >
                              <Activity size={14} /> Launch Live Demo
                            </button>
                            <a 
                              href={selectedProjectForPreview.link}
                              target="_blank"
                              referrerPolicy="no-referrer"
                              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all text-[10px] font-bold uppercase tracking-widest border border-white/5 flex items-center gap-2"
                            >
                              <Maximize2 size={14} /> Remote Link
                            </a>
                          </div>
                        </div>

                        {/* Project Details Content */}
                        {selectedProjectForPreview.fullDetails && (
                          <div className="space-y-12 md:space-y-20">
                            {/* Detailed Markdown Section */}
                            {selectedProjectForPreview.fullDetails.overview && (
                              <section className="prose prose-sm md:prose-base prose-invert prose-amber max-w-none prose-p:font-light prose-headings:font-light">
                                <ReactMarkdown>
                                  {selectedProjectForPreview.fullDetails.overview}
                                </ReactMarkdown>
                              </section>
                            )}

                            {/* Technical Specs Bento Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                              <div className="group p-6 md:p-8 bg-[#161b22] border border-white/5 rounded-2xl md:rounded-3xl hover:border-amber-500/30 transition-all duration-500 shadow-xl">
                                <h4 className="flex items-center gap-3 text-[10px] font-bold text-white uppercase tracking-[0.3em] mb-6">
                                  <Zap size={14} className="text-amber-500" /> Core Features
                                </h4>
                                <ul className="space-y-4">
                                  {selectedProjectForPreview.fullDetails.features.map((f, idx) => (
                                    <li key={idx} className="flex gap-4 text-xs text-zinc-400 font-light group-hover:text-zinc-300">
                                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500/40 mt-1.5 shrink-0" />
                                      {f}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="group p-6 md:p-8 bg-[#161b22] border border-white/5 rounded-2xl md:rounded-3xl hover:border-blue-500/30 transition-all duration-500 shadow-xl">
                                <h4 className="flex items-center gap-3 text-[10px] font-bold text-white uppercase tracking-[0.3em] mb-6">
                                  <Package size={14} className="text-blue-500" /> Tech Stack
                                </h4>
                                <div className="space-y-5">
                                  {selectedProjectForPreview.fullDetails.techStack.map((tech, idx) => (
                                    <div key={idx} className="space-y-1">
                                      <div className="text-xs font-bold text-zinc-300">{tech.name}</div>
                                      <div className="text-[10px] text-zinc-500 font-light uppercase tracking-wider">{tech.role}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="sm:col-span-2 group p-6 md:p-8 bg-[#161b22] border border-white/5 rounded-2xl md:rounded-3xl hover:border-purple-500/30 transition-all duration-500 shadow-xl">
                                <h4 className="flex items-center gap-3 text-[10px] font-bold text-white uppercase tracking-[0.3em] mb-6">
                                  <Code2 size={14} className="text-purple-500" /> Project Structure
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                                  {selectedProjectForPreview.fullDetails.structure.map((item, idx) => (
                                    <div key={idx} className="flex gap-4">
                                      <div className="w-8 h-8 bg-black/40 rounded-lg flex items-center justify-center text-zinc-500 shrink-0 border border-white/5">
                                        <Code size={14} />
                                      </div>
                                      <div>
                                        <div className="text-xs font-mono text-zinc-300 mb-1">{item.name}</div>
                                        <div className="text-[10px] text-zinc-500 font-light italic truncate max-w-[200px] sm:max-w-none">{item.desc}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* License Info */}
                            <div className="p-6 md:p-10 bg-black/30 border border-white/5 rounded-2xl md:rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8 md:gap-6 shadow-2xl">
                              <div className="flex items-center gap-5">
                                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center shrink-0">
                                  <Shield size={22} className="text-zinc-500" />
                                </div>
                                <div>
                                  <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1 font-mono">Distribution License</div>
                                  <div className="text-xs text-white/50">{selectedProjectForPreview.fullDetails.license}</div>
                                </div>
                              </div>
                              <button 
                                onClick={() => setShowFullPreview(true)}
                                className="w-full md:w-auto px-10 py-5 bg-white text-black font-bold rounded-2xl hover:bg-amber-100 transition-all text-[11px] uppercase tracking-widest shadow-[0_20px_40px_-15px_rgba(255,255,255,0.1)] active:scale-95"
                              >
                                Launch Experience
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {/* Footer Spacer */}
                        <div className="h-20" />
                      </div>
                    </div>
                  </div>

                  {/* Terminal Footer Indicator */}
                  <div className="h-10 bg-[#0d1117] border-t border-white/5 px-4 md:px-6 flex items-center justify-between shrink-0 select-none">
                    <div className="flex items-center gap-3 md:gap-4 text-[9px] font-mono text-zinc-600 uppercase tracking-widest overflow-hidden">
                       <div className="flex items-center gap-1.5 shrink-0">
                         <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                         master*
                       </div>
                       <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                         <span className="opacity-40">UTF-8</span>
                       </div>
                       <div className="flex items-center gap-1.5 shrink-0">
                         <Activity size={10} />
                         <span className="animate-pulse">Active</span>
                       </div>
                    </div>
                    <div className="text-[9px] font-mono text-zinc-700 whitespace-nowrap">
                       UTC+{new Date().getTimezoneOffset() / -60} — Terminal v2.0
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Legacy/Other Components Placeholder if needed */}
      <div id="project-portal" />

      {/* Process Section */}
      {currentView === 'home' && (
        <section id="process" className="py-20 md:py-32 px-6 md:px-12 bg-transparent">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 md:mb-20">
              <div className="text-[#A67C00] text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em] mb-4">How we work</div>
              <h2 className="text-4xl md:text-5xl font-light text-zinc-900 mb-6" style={{ fontFamily: "'Georgia', serif" }}>
                Simple approach. <span className="italic text-[#A67C00]">Dependable results.</span>
              </h2>
              <p className="text-zinc-600 text-sm md:text-base font-light max-w-2xl mx-auto">Four focused phases to take you from idea to impact.</p>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-12 relative">
               {/* Connector line for desktop */}
              <div className="hidden md:block absolute top-[60px] left-[10%] right-[10%] h-[1px] bg-zinc-200 z-0"></div>
              
              {[
                { step: "01", title: "Understand your vision", desc: "Whether you are beginning your first digital journey or expanding an existing one, we start by listening deeply." },
                { step: "02", title: "Design with intention", desc: "Every interface decision is deliberate. We merge modern technology with a refined, user-centered philosophy." },
                { step: "03", title: "Engineer with precision", desc: "Swift execution without shortcuts. Hands-on development across the full stack — reliable, tested, documented." },
                { step: "04", title: "Sustain and grow", desc: "The relationship doesn't end at launch. We provide long-term maintenance and continued strategic support." }
              ].map((p, i) => (
                <div key={i} className="relative z-10 text-center md:text-left">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-white/40 border border-zinc-200 text-zinc-900 flex items-center justify-center rounded-full mb-6 md:mb-8 mx-auto md:mx-0 shadow-sm font-light text-base md:text-lg">
                    {p.step}
                  </div>
                  <h3 className="text-lg md:text-xl font-medium text-zinc-900 mb-3 md:mb-4">{p.title}</h3>
                  <p className="text-zinc-600 text-xs md:text-sm font-light leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Tech Stack Section */}
      {currentView === 'home' && (
        <section className="py-20 md:py-32 px-6 md:px-12 border-t border-zinc-200/50">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <div className="text-[#A67C00] text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em] mb-4">The Ecosystem</div>
                <h2 className="text-4xl md:text-5xl font-light text-zinc-900 mb-8" style={{ fontFamily: "'Georgia', serif" }}>
                  Built on a Foundation of <span className="italic text-[#A67C00]">World-Class</span> Technology
                </h2>
                <p className="text-zinc-600 mb-10 max-w-md text-sm md:text-base font-light leading-relaxed">
                  We leverage the most advanced frameworks and AI models to ensure your product is scalable, secure, and future-proof from day one.
                </p>
                <div className="grid grid-cols-2 gap-8">
                  {[
                    { label: "Frontend", value: "React / Next.js / Tailwind" },
                    { label: "Intelligence", value: "OpenAI / Anthropic / PyTorch" },
                    { label: "Infrastructure", value: "Vercel / AWS / GCP" },
                    { label: "Interface", value: "Figma / Framer / Spline" }
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">{item.label}</div>
                      <div className="text-zinc-900 text-sm font-light">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="relative">
                <div className="aspect-square bg-gradient-to-tr from-amber-600/10 to-transparent rounded-3xl border border-zinc-200/50 flex items-center justify-center relative overflow-hidden group">
                  {/* Visual Representation of Stack (Abstract) */}
                  <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 relative z-10">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                        className="w-16 h-16 md:w-20 md:h-20 bg-white/40 border border-zinc-200 rounded-2xl flex items-center justify-center text-[#A67C00] hover:border-amber-500/50 hover:bg-white transition-all duration-500 shadow-sm"
                      >
                        {[<Zap />, <Cpu />, <Globe />, <BarChart3 />, <Layout />, <Eye />, <MessageSquare />, <Share2 />, <Search />][i]}
                      </motion.div>
                    ))}
                  </div>

                  {/* Floating Glow */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-600/10 rounded-full blur-[80px] pointer-events-none"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      {currentView === 'home' && (
        <section id="contact" className="py-20 md:py-32 px-6 md:px-12 w-full max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 md:gap-20">
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
            >
              <div className="text-[#A67C00] text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em] mb-4">Begin your project</div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-light text-zinc-900 mb-6 md:mb-8 leading-tight" style={{ fontFamily: "'Georgia', serif" }}>
                Ready to build something <span className="italic text-[#A67C00]">remarkable?</span>
              </h2>
              <p className="text-zinc-600 mb-10 md:mb-12 max-w-md text-sm md:text-base font-light">From your first digital step to a fully realized intelligent product — Nishkalya delivers reliable development, swift execution, and sustained growth.</p>
              
              <div className="space-y-6 md:space-y-8">
                {[
                  { icon: <Mail size={16} />, label: "Email", value: "nishkalya@gmail.com" },
                  { icon: <Phone size={16} />, label: "Phone", value: "+91 9608339846" },
                  { icon: <MapPin size={16} />, label: "Location", value: "World Wide Web (Remote)" }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 md:gap-6 group">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white/40 border border-zinc-200 rounded-xl flex items-center justify-center text-[#A67C00] group-hover:bg-[#D8B45C] transition-all duration-300 group-hover:text-white shadow-sm">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-[8px] md:text-[9px] text-zinc-500 uppercase tracking-widest mb-1">{item.label}</div>
                      <div className="text-zinc-900 font-light text-sm md:text-base">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 sm:gap-6 mt-12 md:mt-16">
                 <a href="https://github.com/Nishkalya" target="_blank" rel="noreferrer" className="w-10 h-10 border border-zinc-200 bg-white/40 rounded-lg flex items-center justify-center text-zinc-500 hover:border-[#D8B45C] hover:text-[#A67C00] transition-all shadow-sm"><Github size={16} /></a>
                 <a href="#" className="w-10 h-10 border border-zinc-200 bg-white/40 rounded-lg flex items-center justify-center text-zinc-500 hover:border-[#D8B45C] hover:text-[#A67C00] transition-all shadow-sm"><Linkedin size={16} /></a>
                 <a href="#" className="w-10 h-10 border border-zinc-200 bg-white/40 rounded-lg flex items-center justify-center text-zinc-500 hover:border-[#D8B45C] hover:text-[#A67C00] transition-all shadow-sm"><Twitter size={16} /></a>
                 <a href="#" className="w-10 h-10 border border-zinc-200 bg-white/40 rounded-lg flex items-center justify-center text-zinc-500 hover:border-[#D8B45C] hover:text-[#A67C00] transition-all shadow-sm"><Dribbble size={16} /></a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-6 md:p-10 bg-white/40 border border-zinc-200 rounded-3xl backdrop-blur-sm mt-12 md:mt-0 min-h-[400px] flex flex-col shadow-xl"
            >
              <AnimatePresence mode="wait">
                {isSubmitted ? (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex-1 flex flex-col items-center justify-center text-center px-4"
                  >
                    <div className="w-20 h-20 bg-amber-600/10 rounded-full flex items-center justify-center text-[#A67C00] mb-6 shadow-sm">
                      <CheckCircle size={40} className="animate-in zoom-in duration-500" />
                    </div>
                    <h3 className="text-3xl font-light text-zinc-900 mb-3" style={{ fontFamily: "'Georgia', serif" }}>Message Received</h3>
                    <p className="text-zinc-600 max-w-[280px] mx-auto text-sm font-light leading-relaxed mb-8">
                      We've received your inquiry and our team will get back to you within 24 hours.
                    </p>
                    <button 
                      onClick={() => setIsSubmitted(false)}
                      className="px-8 py-3.5 bg-white border border-zinc-200 text-[10px] font-bold text-zinc-600 rounded-xl hover:text-zinc-900 hover:border-zinc-300 transition-all uppercase tracking-[0.2em]"
                    >
                      Send Another Message
                    </button>
                  </motion.div>
                ) : (
                  <motion.form 
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit} 
                    className="space-y-5 md:space-y-6"
                   >
                   <div className="grid sm:grid-cols-2 gap-5 md:gap-6">
                     <div>
                       <label className="block text-[9px] md:text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">Full Name</label>
                       <input 
                         name="name"
                         value={formData.name}
                         onChange={handleChange}
                         type="text" 
                         placeholder="Ravi Sharma" 
                         className={`w-full bg-white/60 border ${errors.name ? 'border-red-500' : 'border-zinc-200'} rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D8B45C] transition-colors text-zinc-900 placeholder:text-zinc-400 font-light`} 
                       />
                       {errors.name && (
                         <p className="text-[10px] text-red-500 mt-1.5 px-1 flex items-center gap-1.5 font-medium">
                           <AlertCircle size={10} /> {errors.name}
                         </p>
                       )}
                     </div>
                     <div>
                       <label className="block text-[9px] md:text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">Email Address</label>
                       <input 
                         name="email"
                         value={formData.email}
                         onChange={handleChange}
                         type="email" 
                         placeholder="ravi@company.com" 
                         className={`w-full bg-white/60 border ${errors.email ? 'border-red-500' : 'border-zinc-200'} rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D8B45C] transition-colors text-zinc-900 placeholder:text-zinc-400 font-light`} 
                       />
                       {errors.email && (
                         <p className="text-[10px] text-red-500 mt-1.5 px-1 flex items-center gap-1.5 font-medium">
                           <AlertCircle size={10} /> {errors.email}
                         </p>
                       )}
                     </div>
                   </div>
                   <div>
                     <label className="block text-[9px] md:text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">Company</label>
                     <input 
                       name="company"
                       value={formData.company}
                       onChange={handleChange}
                       type="text" 
                       placeholder="Your Company" 
                       className="w-full bg-white/60 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D8B45C] transition-colors text-zinc-900 placeholder:text-zinc-400 font-light" 
                     />
                   </div>
                   <div>
                     <label className="block text-[9px] md:text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">Service Needed</label>
                     <div className="relative">
                       <select 
                         name="service"
                         value={formData.service}
                         onChange={handleChange}
                         className="w-full bg-white/60 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D8B45C] transition-colors text-zinc-900 font-light appearance-none"
                       >
                         <option>Select a service</option>
                         <option>AI Product Development</option>
                         <option>UI/UX Design Systems</option>
                         <option>LLM Integration</option>
                         <option>Custom Strategy</option>
                       </select>
                       <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none rotate-90" />
                     </div>
                   </div>
                   <div>
                     <label className="block text-[9px] md:text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">Your Message</label>
                     <textarea 
                       name="message"
                       value={formData.message}
                       onChange={handleChange}
                       rows={4} 
                       placeholder="Tell us about your project..." 
                       className={`w-full bg-white/60 border ${errors.message ? 'border-red-500' : 'border-zinc-200'} rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D8B45C] transition-colors text-zinc-900 placeholder:text-zinc-400 font-light resize-none`}
                     ></textarea>
                     {errors.message && (
                       <p className="text-[10px] text-red-500 mt-1.5 px-1 flex items-center gap-1.5 font-medium">
                         <AlertCircle size={10} /> {errors.message}
                       </p>
                     )}
                   </div>
                   <button 
                     type="submit"
                     className="w-full py-4 bg-[#D8B45C] text-white font-bold rounded-xl hover:bg-[#C49B3C] transition-all duration-300 text-[10px] md:text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-lg shadow-amber-600/20"
                   >
                     Send Message <ArrowRight size={14} />
                   </button>
                   </motion.form>
                 )}
               </AnimatePresence>
            </motion.div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="pt-20 md:pt-24 pb-10 md:pb-12 px-6 md:px-12 border-t border-zinc-200/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 md:gap-10 mb-16 md:mb-20">
            <div className="max-w-xs">
              <div className="flex items-center space-x-2 mb-6 cursor-pointer group" onClick={() => { setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                <div className="w-6 h-6 bg-[#D8B45C] rounded flex items-center justify-center transform rotate-12 group-hover:rotate-0 transition-transform duration-500 shadow-lg shadow-amber-600/20">
                  <span className="text-white font-bold text-xs">N</span>
                </div>
                <span className="text-lg font-bold tracking-tight text-zinc-900">NISHKALYA</span>
              </div>
              <p className="text-zinc-600 text-sm font-light leading-relaxed mb-6">We craft next-generation products at the intersection of AI and stunning design. Built for impact, designed for the future.</p>
              <div className="flex flex-wrap gap-4">
                <a href="https://github.com/Nishkalya" target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-zinc-900 transition-colors text-[9px] font-bold uppercase tracking-widest">GitHub</a>
                <a href="#" className="text-zinc-500 hover:text-zinc-900 transition-colors text-[9px] font-bold uppercase tracking-widest">𝕏 (Twitter)</a>
                <a href="#" className="text-zinc-500 hover:text-zinc-900 transition-colors text-[9px] font-bold uppercase tracking-widest">LinkedIn</a>
                <a href="#" className="text-zinc-500 hover:text-zinc-900 transition-colors text-[9px] font-bold uppercase tracking-widest">Dribbble</a>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-12 sm:gap-20">
              <div className="space-y-3 md:space-y-4">
                <div className="text-[9px] md:text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-6">Links</div>
                <button onClick={() => { setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="block text-zinc-600 hover:text-zinc-900 text-xs md:text-sm transition-colors font-light text-left w-full">Home</button>
                <button onClick={() => scrollToSection('about')} className="block text-zinc-600 hover:text-zinc-900 text-xs md:text-sm transition-colors font-light text-left w-full">About</button>
                <button onClick={() => scrollToSection('services')} className="block text-zinc-600 hover:text-zinc-900 text-xs md:text-sm transition-colors font-light text-left w-full">Services</button>
                <button onClick={() => { setCurrentView('projects'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="block text-zinc-600 hover:text-zinc-900 text-xs md:text-sm transition-colors font-light text-left w-full">Projects</button>
                <button onClick={() => scrollToSection('contact')} className="block text-zinc-600 hover:text-zinc-900 text-xs md:text-sm transition-colors font-light text-left w-full">Contact</button>
                <button onClick={() => setCurrentView('admin')} className="block text-zinc-200 hover:text-zinc-400 text-[8px] transition-colors font-light text-left w-full pt-4">Admin Login</button>
              </div>
              <div className="space-y-3 md:space-y-4">
                <div className="text-[9px] md:text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-6">Social</div>
                <a href="https://github.com/Nishkalya" target="_blank" rel="noreferrer" className="block text-zinc-600 hover:text-zinc-900 text-xs md:text-sm transition-colors font-light">GitHub</a>
                <a href="#" className="block text-zinc-600 hover:text-zinc-900 text-xs md:text-sm transition-colors font-light">LinkedIn</a>
                <a href="#" className="block text-zinc-600 hover:text-zinc-900 text-xs md:text-sm transition-colors font-light">Dribbble</a>
                <a href="#" className="block text-zinc-600 hover:text-zinc-900 text-xs md:text-sm transition-colors font-light">Instagram</a>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-zinc-200/50 gap-4 text-center sm:text-left">
            <div className="text-[8px] md:text-[9px] text-zinc-500 uppercase tracking-[0.3em] md:tracking-[0.4em]">© 2025 Nishkalya. All rights reserved.</div>
            <div className="text-[8px] md:text-[9px] text-zinc-500 uppercase tracking-[0.25em] md:tracking-[0.3em]">Built with ♥ for the World Wide Web.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}


