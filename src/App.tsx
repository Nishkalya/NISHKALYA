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
  Quote,
  Search,
  Share2,
  ChevronRight,
  ChevronDown,
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
  Maximize2,
  Minimize2,
  Square,
  Columns2,
  Monitor,
  Smartphone,
  PanelLeftClose,
  List,
  FileJson,
  Compass,
  ExternalLink,
  Award,
  Trophy,
  Palette,
  Youtube,
  Link as LinkIcon,
  Moon,
  Sun,
  Sparkles,
  Users
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
  createUserWithEmailAndPassword,
  onAuthStateChanged, 
  signOut,
  User 
} from 'firebase/auth';
import { db, auth } from './lib/firebase';
import { Project, projectService } from './services/projectService';
import { DEFAULT_CONFIG, DEFAULT_PROJECTS } from './constants';
import { testimonialService, Testimonial } from './services/testimonialService';
import { TestimonialSection } from './components/TestimonialSection';
import { MotionHeading } from './components/MotionHeading';
import firebaseConfig from '../firebase-applet-config.json';
import { usePerformanceMonitor } from './hooks/usePerformanceMonitor';
import AdminPerformanceDashboard from './components/AdminPerformanceDashboard';
import { ProjectCard } from './components/ProjectCard';
import { PLATFORMS } from './data/platformsData';
import { updateDynamicProjectSEO, clearDynamicProjectSEO } from './utils/seoHelper';
import { AdminContentEditor } from './components/AdminContentEditor';
import { marketingUserService } from './services/marketingUserService';
import MarketingPage from './components/MarketingPage';
import AdminUserManagement from './components/AdminUserManagement';




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

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [adminMessages, setAdminMessages] = useState<any[]>([]);
  const [isAdminView, setIsAdminView] = useState(false);
  const [isActionPending, setIsActionPending] = useState(false);
  const [selectedAdminMessage, setSelectedAdminMessage] = useState<any | null>(null);

  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem('contact_form_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            name: parsed.name ?? '',
            email: parsed.email ?? '',
            company: parsed.company ?? '',
            service: parsed.service ?? 'Select a service',
            message: parsed.message ?? ''
          };
        }
      }
    } catch (e) {
      console.error("Failed to parse contact form draft", e);
    }
    return {
      name: '',
      email: '',
      company: '',
      service: 'Select a service',
      message: ''
    };
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [activePreviewUrl, setActivePreviewUrl] = useState<string | null>(null);
  const [selectedProjectForPreview, setSelectedProjectForPreview] = useState<Project | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'mobile' | 'full'>('desktop');
  const [isLiveViewExpanded, setIsLiveViewExpanded] = useState(false);
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null);
  const [failedProjectScreenshots, setFailedProjectScreenshots] = useState<Set<string>>(new Set());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [detailsTab, setDetailsTab] = useState<'details' | 'browse'>('details');
  const [currentView, setCurrentView] = useState<'home' | 'projects' | 'admin' | 'marketing'>('home');
  const [websiteConfig, setWebsiteConfig] = useState<any>(DEFAULT_CONFIG);
  const [isConfigLoading, setIsConfigLoading] = useState(true);
  const [localConfig, setLocalConfig] = useState<any>(null);
  const [isConfigDirty, setIsConfigDirty] = useState(false);
  const [adminTab, setAdminTab] = useState<'messages' | 'content' | 'performance' | 'users'>('messages');
  const [isEditorDropdownOpen, setIsEditorDropdownOpen] = useState(true);
  const [marketingUser, setMarketingUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('marketing_user_session');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Failed to parse marketing user session", e);
      return null;
    }
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [isProjectsLoading, setIsProjectsLoading] = useState(true);
  const [activeProfilePlatform, setActiveProfilePlatform] = useState<string>('github');
  const [adminSelectedPlatformId, setAdminSelectedPlatformId] = useState<string>('github');

  // Custom Platform states to avoid iframe window.prompt / window.confirm issues:
  const [showAddPlatformForm, setShowAddPlatformForm] = useState(false);
  const [newPlatformName, setNewPlatformName] = useState('');
  const [newPlatformDesc, setNewPlatformDesc] = useState('');
  const [newPlatformIcon, setNewPlatformIcon] = useState('link');
  const [platformIdToDelete, setPlatformIdToDelete] = useState<string | null>(null);
  const [itemIdToDelete, setItemIdToDelete] = useState<string | null>(null);
  const [activeTagInputItemId, setActiveTagInputItemId] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const [serviceIndexToDelete, setServiceIndexToDelete] = useState<number | null>(null);
  const [themeMode, setThemeMode] = useState<'dark' | 'white' | 'personal'>('white');
  const [activeContentSection, setActiveContentSection] = useState<'hero' | 'theme' | 'about' | 'services' | 'platforms' | 'projects' | 'testimonials' | 'process' | 'techStack'>('hero');

  useEffect(() => {
    document.body.classList.remove('theme-dark', 'theme-white', 'theme-personal');
    document.body.classList.add(`theme-${themeMode}`);
  }, [themeMode, currentView]);

  // Activate page load and spa route transition performance telemetry
  usePerformanceMonitor(currentView === 'marketing' ? 'home' : currentView);

  const displayPlatforms = websiteConfig.platforms || PLATFORMS;

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
    // Dynamic meta elements updates for rich SEO compliance
    try {
      const origin = window.location.origin || "https://nishkalya.studio";
      
      if (selectedProjectForPreview) {
        // Delegate indexing, keyword matching, and JSON-LD schema generation
        updateDynamicProjectSEO(selectedProjectForPreview, origin);
      } else {
        // Clear project-specific active keywords or JSON-LD scripts
        clearDynamicProjectSEO();

        if (currentView === 'home') {
          document.title = "Nishkalya";
          const descMeta = document.querySelector('meta[name="description"]');
          if (descMeta) {
            descMeta.setAttribute('content', "Nishkalya: Delivering pure creation and precise craftsmanship in AI product development and UI/UX design.");
          }
          
          // Update Open Graph tags for social crawlers dynamically
          const ogTitle = document.querySelector('meta[property="og:title"]');
          if (ogTitle) ogTitle.setAttribute('content', "Nishkalya");
          const ogDesc = document.querySelector('meta[property="og:description"]');
          if (ogDesc) ogDesc.setAttribute('content', "Pure creation, precise craftsmanship. Discover our next-generation digital products and services.");
          const ogUrl = document.querySelector('meta[property="og:url"]');
          if (ogUrl) ogUrl.setAttribute('content', origin + "/");
          
          // Canonical Link updates
          let canonicalLink = document.querySelector('link[rel="canonical"]');
          if (!canonicalLink) {
            canonicalLink = document.createElement('link');
            canonicalLink.setAttribute('rel', 'canonical');
            document.head.appendChild(canonicalLink);
          }
          canonicalLink.setAttribute('href', origin + "/");
          
        } else if (currentView === 'projects') {
          document.title = "Explore Our Works | Nishkalya";
          const descMeta = document.querySelector('meta[name="description"]');
          if (descMeta) {
            descMeta.setAttribute('content', "Curated elite portfolio of specialized applications, SaaS, and custom LLM / UI solutions by Nishkalya.");
          }
          
          const ogTitle = document.querySelector('meta[property="og:title"]');
          if (ogTitle) ogTitle.setAttribute('content', "Elite Portfolio — Curated Works of Nishkalya");
          const ogDesc = document.querySelector('meta[property="og:description"]');
          if (ogDesc) ogDesc.setAttribute('content', "Explore our live production showcase of custom AI models, SaaS ecosystems, and pixel-perfect design interfaces.");
          const ogUrl = document.querySelector('meta[property="og:url"]');
          if (ogUrl) ogUrl.setAttribute('content', origin + "?view=projects");
          
          let canonicalLink = document.querySelector('link[rel="canonical"]');
          if (!canonicalLink) {
            canonicalLink = document.createElement('link');
            canonicalLink.setAttribute('rel', 'canonical');
            document.head.appendChild(canonicalLink);
          }
          canonicalLink.setAttribute('href', origin + "?view=projects");
          
        } else if (currentView === 'marketing') {
          document.title = "Marketing Strategy Matrix | Nishkalya";
        } else if (currentView === 'admin') {
          document.title = "Management Console | Nishkalya";
        }
      }
    } catch (e) {
      console.warn("Meta updates bypassed (probably SSG style execution).", e);
    }
  }, [currentView, websiteConfig, selectedProjectForPreview]);

  useEffect(() => {
    // Real-time config listener
    const unsubConfig = onSnapshot(doc(db, 'config', 'website'), (snapshot) => {
      if (snapshot.exists()) {
        setWebsiteConfig(snapshot.data());
      } else {
        // Only try to seed if we have a user and they are admin
        if (isAdmin && currentUser?.email === 'nishkalya@gmail.com') {
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
        if (isAdmin && currentUser?.email === 'nishkalya@gmail.com') {
          DEFAULT_PROJECTS.forEach(async (p: any, idx: number) => {
            const { id, ...rest } = p;
            // Use provided ID if available, otherwise it's just a seed
            await setDoc(doc(db, 'projects', id || String(idx)), { ...rest, order: idx }).catch(err => handleFirestoreError(err, 'write', 'projects/' + (id || idx)));
          });
        } else {
          // If genuinely empty and we are not seeding, fallback to DEFAULT_PROJECTS to make sure standard portfolio loads smoothly
          setProjects(DEFAULT_PROJECTS.map((p: any, idx) => ({ id: p.id || String(idx), ...p })) as any);
        }
      }
      setIsProjectsLoading(false);
    }, (error) => {
      handleFirestoreError(error, 'list', 'projects');
      setIsProjectsLoading(false);
    });

    return () => {
      unsubConfig();
      unsubProjects();
    };
  }, [isAdmin, currentUser]);

  // Handle local draft config synchronization reactive to content tab state
  useEffect(() => {
    if (adminTab === 'content' && websiteConfig) {
      setLocalConfig(JSON.parse(JSON.stringify(websiteConfig)));
      setIsConfigDirty(false);
    }
  }, [adminTab, websiteConfig]);

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

  useEffect(() => {
    const handleOpenProject = (e: Event) => {
      const customEvent = e as CustomEvent<{ projectId: string }>;
      if (customEvent.detail && customEvent.detail.projectId) {
        const match = projects.find(p => p.id === customEvent.detail.projectId);
        if (match) {
          setSelectedProjectForPreview(match);
          setIsFlipped(true);
          if (match.link) {
            setActivePreviewUrl(match.link);
          }
          setCurrentView('projects');
        }
      }
    };
    window.addEventListener('open-project-preview', handleOpenProject);
    return () => window.removeEventListener('open-project-preview', handleOpenProject);
  }, [projects]);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      let changed = false;
      
      if (selectedProjectForPreview) {
        if (params.get('project') !== selectedProjectForPreview.id) {
          params.set('project', selectedProjectForPreview.id);
          changed = true;
        }
        if (params.get('view') !== 'projects') {
          params.set('view', 'projects');
          changed = true;
        }
      } else {
        if (params.has('project')) {
          params.delete('project');
          changed = true;
        }
        // Sync general view parameter as well if relevant
        if (currentView !== 'home') {
          if (params.get('view') !== currentView) {
            params.set('view', currentView);
            changed = true;
          }
        } else {
          if (params.has('view')) {
            params.delete('view');
            changed = true;
          }
        }
      }
      
      if (changed) {
        const queryStr = params.toString();
        const newUrl = queryStr ? `${window.location.pathname}?${queryStr}` : window.location.pathname;
        window.history.replaceState({ path: newUrl }, '', newUrl);
      }
    } catch (e) {
      console.warn("URL query param synchronization bypassed.", e);
    }
  }, [selectedProjectForPreview, currentView]);

  useEffect(() => {
    if (projects.length > 0 && !selectedProjectForPreview) {
      try {
        const params = new URLSearchParams(window.location.search);
        const projectId = params.get('project');
        const viewOverride = params.get('view');
        
        if (projectId) {
          const match = projects.find(p => p.id === projectId);
          if (match) {
            setSelectedProjectForPreview(match);
            setIsFlipped(true);
            if (match.link) {
              setActivePreviewUrl(match.link);
            }
          }
        }
        
        if (viewOverride === 'projects' && currentView !== 'projects') {
          setCurrentView('projects');
        } else if (viewOverride === 'admin' && currentView !== 'admin') {
          setCurrentView('admin');
        }
      } catch (e) {
        console.error("Failed to parse initial deep links", e);
      }
    }
  }, [projects, isProjectsLoading]);

  useEffect(() => {
    marketingUserService.seedDefaultUser().catch(err => {
      console.warn("Marketing user seeding bypassed or already initialized.", err);
    });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('contact_form_draft', JSON.stringify(formData));
    } catch (e) {
      console.error("Failed to save contact form draft", e);
    }
  }, [formData.name, formData.email, formData.company, formData.service, formData.message]);

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
    setIsMobileMenuOpen(false);
    if (currentView !== 'home') {
      setCurrentView('home');
      // Home view enters with animation. Poll until the target element is mounted in DOM
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          clearInterval(interval);
        } else if (attempts > 35) {
          clearInterval(interval);
        }
      }, 40);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };


  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [showFullAbout, setShowFullAbout] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [adminBanner, setAdminBanner] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const adminDoc = await projectService.checkIsAdmin(user.uid);
          setIsAdmin(adminDoc);
          // If the user is our bootstrap email but not in admins yet, we'll auto-boot if they hit it or allow them to self-promote
          if (!adminDoc && user.email === 'nishkalya@gmail.com') {
             // For now, we'll treat them as admin in the UI but they might need to 'Verify' to write if rules are strict
             setIsAdmin(true); 
          }
        } catch (err) {
          console.error("Admin check failed", err);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setIsAuthLoading(false);
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
      setCurrentView('admin');
    } catch (error: any) {
      console.error("Login failed:", error);
      
      // Provide actionable feedback for the common "domain not authorized" error
      if (error.code === 'auth/popup-blocked') {
        setLoginError("Pop-up blocked! Please allow pop-ups for this site or use the email/password login below.");
      } else if (error.message?.includes('The requested action is invalid') || error.code === 'auth/unauthorized-domain') {
        const domain = window.location.hostname;
        setLoginError(`Domain (${domain}) is not authorized in Firebase Console > Authentication > Settings. Please use email/password login below.`);
      } else {
        setLoginError("Login failed: " + (error.message || "Unknown error"));
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAdminLogout = async () => {
    setIsLoggingIn(true);
    try {
      await signOut(auth);
      setCurrentView('home');
    } catch (error) {
      console.error("Sign out failed", error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      setLoginError(null);
      console.log("Attempting Email/Password Login for:", loginEmail);
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      console.log("Email login successful");
      setCurrentView('admin'); // Ensure we switch to admin view on success
    } catch (error: any) {
      console.error("Email login failed, trying seamless signUp fallback:", error);
      
      // If the email is the admin bootstrap email, try to auto-create their account if auth fails
      if (loginEmail === 'nishkalya@gmail.com') {
        try {
          console.log("Attempting seamless account creation / auth setup for admin...");
          await createUserWithEmailAndPassword(auth, loginEmail, loginPassword);
          console.log("Seamless admin account created & signed in successfully");
          setCurrentView('admin');
          return;
        } catch (createErr: any) {
          console.error("Seamless registration failed:", createErr);
          if (createErr.code === 'auth/email-already-in-use') {
             // email is already in use, which means password was actually incorrect
             setLoginError("Incorrect password for admin account. Please enter the correct password.");
             return;
          } else if (createErr.code === 'auth/operation-not-allowed') {
             setLoginError('setup-required');
             return;
          }
        }
      }

      if (error.code === 'auth/operation-not-allowed') {
        setLoginError('setup-required');
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setLoginError("Invalid Email or Password. Please check your credentials or ensure the user exists in Firebase Console.");
      } else {
        setLoginError("Login failed: " + (error.message || "Unknown error"));
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const AdminDashboard = () => {
    if (!currentUser) {
      return (
        <div className="h-screen w-full overflow-hidden flex items-center justify-center p-6 bg-slate-50">
          <div className="max-w-md w-full text-center space-y-8 p-10 bg-white border border-slate-200 rounded-2xl shadow-2xl relative z-10">
            <div className="w-14 h-14 bg-[#58a6ff]/10 border border-slate-200 rounded-2xl flex items-center justify-center text-blue-600 mx-auto transform rotate-12">
              <Lock size={26} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-900 font-sans">Admin Access</h2>
              <p className="text-slate-500 text-xs font-light">Please log in with the authorized account to access the dashboard and manage inquiries.</p>
            </div>
            
            {loginError === 'setup-required' && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-xl text-left space-y-3"
              >
                <div className="flex items-center gap-2 text-amber-500 font-bold text-[9px] uppercase tracking-widest font-mono">
                  <div className="w-5 h-5 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500 ring-4 ring-amber-500/5">!</div>
                  Setup Required
                </div>
                <div className="text-[11px] text-slate-700 space-y-2 leading-relaxed">
                  <p>Email/Password login is currently <span className="font-bold underline">disabled</span> in your Firebase Console.</p>
                  <ol className="list-decimal list-inside space-y-1 font-normal text-xs text-slate-500">
                    <li>Open <a href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/providers`} target="_blank" rel="noopener noreferrer" className="underline text-amber-500 font-semibold hover:text-amber-400">Firebase Auth Console</a></li>
                    <li>Click <strong>Add new provider</strong> → <strong>Email/Password</strong> → <strong>Enable</strong>.</li>
                    <li>Go to the <strong>Users</strong> tab and <strong>Add user</strong> manually with these credentials.</li>
                  </ol>
                  <button 
                    onClick={() => setLoginError(null)}
                    className="text-amber-500 font-bold hover:underline text-xs mt-1"
                  >
                    Got it, I've enabled it. Try again.
                  </button>
                </div>
              </motion.div>
            )}

            {loginError && loginError !== 'setup-required' && (
              <motion.div 
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 bg-red-950/40 border border-red-900/60 rounded-xl text-left text-red-400 text-xs font-mono flex items-center justify-between gap-3"
              >
                <span>{loginError}</span>
                <button 
                  type="button" 
                  onClick={() => setLoginError(null)} 
                  className="text-red-400 hover:text-slate-900 shrink-0 cursor-pointer p-1"
                >
                  <X size={14} />
                </button>
              </motion.div>
            )}

            <form onSubmit={handleEmailLogin} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 px-1 font-mono">Email Address</label>
                <input 
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none admin-glow placeholder-[#8b949e] font-light"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 px-1 font-mono">Password</label>
                <input 
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none admin-glow placeholder-[#8b949e] font-light"
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 bg-[#238636] border border-[#2ea44f] text-slate-900 font-bold rounded-xl hover:bg-[#2eaa44] admin-glow flex items-center justify-center gap-2 uppercase tracking-widest text-[9px] font-mono shadow-md"
              >
                {isLoggingIn ? "Verifying..." : "Login with Password"}
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
              <div className="relative flex justify-center text-[9px] uppercase tracking-widest font-mono"><span className="bg-white px-4 text-slate-500 font-semibold">Or</span></div>
            </div>

            <button 
              onClick={handleAdminLogin}
              disabled={isLoggingIn}
              className="w-full py-3 bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-200 hover:border-[#8b949e] admin-glow flex items-center justify-center gap-2 uppercase tracking-widest text-[9px] font-mono"
            >
              <LogIn size={14} /> {isLoggingIn ? "Authenticating..." : "Continue with Google"}
            </button>

            <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs">
              <button 
                type="button"
                onClick={() => { setCurrentView('marketing'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="text-slate-500 hover:text-blue-600 transition-colors text-[11px] font-mono cursor-pointer flex items-center gap-1.5"
              >
                ← Back to Marketing Portal
              </button>
              <button 
                type="button"
                onClick={() => { setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="text-slate-500 hover:text-slate-900 transition-colors text-[11px] font-mono cursor-pointer"
              >
                Home
              </button>
            </div>
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
            <button 
              onClick={handleAdminLogout} 
              disabled={isLoggingIn}
              className="text-zinc-600 hover:text-zinc-900 text-xs font-bold uppercase tracking-widest disabled:opacity-50"
            >
              {isLoggingIn ? "Signing Out..." : "Sign Out"}
            </button>
          </div>
        </div>
      );
    }

    const updateConfig = async (newConfig: any) => {
      setIsActionPending(true);
      try {
        const sanitizedConfig = { ...newConfig };
        if (sanitizedConfig.platforms) {
          sanitizedConfig.platforms = sanitizedConfig.platforms.map((platform: any) => {
            const { icon, ...rest } = platform;
            return rest;
          });
        }
        await setDoc(doc(db, 'config', 'website'), sanitizedConfig);
      } catch (err) {
        console.error("Failed to update config", err);
      } finally {
        setIsActionPending(false);
      }
    };

    // Fast, responsive, focus-safe content editor draft states
    const editorConfig = localConfig || websiteConfig || DEFAULT_CONFIG;

    const updateConfigLocal = async (newConfig: any) => {
      setLocalConfig(newConfig); // Keep it snappy for UI
      setIsActionPending(true);
      try {
        const sanitizedConfig = JSON.parse(JSON.stringify(newConfig));
        if (sanitizedConfig.platforms) {
          sanitizedConfig.platforms = sanitizedConfig.platforms.map((platform: any) => {
            const { icon, ...rest } = platform;
            return rest;
          });
        }
        await setDoc(doc(db, 'config', 'website'), sanitizedConfig);
        setIsConfigDirty(false); // No draft changes anymore, it's live
      } catch (err) {
        console.error("Failed to update config in real-time", err);
      } finally {
        setIsActionPending(false);
      }
    };

    const handlePublishConfig = async () => {
      if (!localConfig) return;
      setIsActionPending(true);
      try {
        const sanitizedConfig = JSON.parse(JSON.stringify(localConfig));
        if (sanitizedConfig.platforms) {
          sanitizedConfig.platforms = sanitizedConfig.platforms.map((platform: any) => {
            const { icon, ...rest } = platform;
            return rest;
          });
        }
        await setDoc(doc(db, 'config', 'website'), sanitizedConfig);
        setIsConfigDirty(false);
      } catch (err) {
        console.error("Failed to update config", err);
      } finally {
        setIsActionPending(false);
      }
    };

    const editorSectionTabs = [
      { id: 'hero', name: 'Hero Header', icon: <Zap size={13} />, count: editorConfig?.hero?.stats?.length || 0 },
      { id: 'theme', name: 'Theme & Style', icon: <Palette size={13} /> },
      { id: 'about', name: 'Biography / About', icon: <UserIcon size={13} />, count: editorConfig?.about?.skills?.length || 0 },
      { id: 'services', name: 'Core Services', icon: <Globe size={13} />, count: editorConfig?.services?.length || 0 },
      { id: 'platforms', name: 'Connected Streams', icon: <Compass size={13} />, count: (editorConfig?.platforms || []).reduce((acc: number, p: any) => acc + (p.items?.length || 0), 0) },
      { id: 'projects', name: 'Portfolio Cases', icon: <Shield size={13} />, count: projects.length },
      { id: 'testimonials', name: 'Client Feedback', icon: <MessageSquare size={13} />, count: adminTestimonials.length },
      { id: 'process', name: 'Business Process', icon: <ArrowRight size={13} />, count: editorConfig?.process?.steps?.length || 0 },
      { id: 'techStack', name: 'Tools & Stack', icon: <Cpu size={13} />, count: editorConfig?.techStack?.items?.length || 0 }
    ];

    return (
      <div className="h-screen w-full overflow-hidden flex bg-slate-50 text-slate-900 select-none">
        {/* Left Vertical Navigation Sidebar (ERP Rail ~260px) */}
        <aside className="w-64 min-w-[260px] max-w-[260px] h-full bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 z-20 overflow-hidden">
          {/* Header & Brand */}
          <div className="p-4 border-slate-400 border-slate-200 flex items-center justify-between shrink-0 bg-white">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shadow-inner shrink-0">
                <span className="text-blue-600 font-mono font-black text-sm">N</span>
              </div>
              <div className="min-w-0">
                <div className="text-xs font-extrabold tracking-wider text-slate-900 font-sans uppercase truncate">Command Center</div>
                <div className="flex items-center gap-1.5 text-[9px] text-emerald-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  ERP v2.4 • Online
                </div>
              </div>
            </div>
          </div>

          {/* Vertical Navigation Sections */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
            {/* Main Tabs Group */}
            <div className="pt-1">
              <div className="px-2.5 mb-2.5 text-[9px] font-bold text-slate-500 uppercase tracking-[0.25em] font-mono flex items-center justify-between">
                <span>Modules</span>
                <span className="text-[8px] text-slate-500 font-normal">CORE</span>
              </div>
              <div className="space-y-1">
                <button 
                  onClick={() => setAdminTab('messages')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                    adminTab === 'messages' 
                      ? 'bg-slate-100 text-blue-600 border border-slate-200 shadow-sm font-semibold' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-[#1c2128] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Mail size={15} className={adminTab === 'messages' ? 'text-blue-600' : 'text-slate-500'} />
                    <span>Inquiries</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {adminMessages.filter(m => m.status === 'unread').length > 0 && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-[#58a6ff]/20 text-blue-600 border border-[#58a6ff]/30 font-mono">
                        {adminMessages.filter(m => m.status === 'unread').length}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-500 font-mono">{adminMessages.length}</span>
                  </div>
                </button>

                {/* Website Editor Module with Collapsible Dropdown Submenu */}
                <div className="space-y-1">
                  <button 
                    onClick={() => {
                      if (adminTab !== 'content') {
                        setAdminTab('content');
                        setIsEditorDropdownOpen(true);
                      } else {
                        setIsEditorDropdownOpen(!isEditorDropdownOpen);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                      adminTab === 'content' 
                        ? 'bg-slate-100 text-blue-600 border border-slate-200 shadow-sm font-semibold' 
                        : 'text-slate-500 hover:text-slate-900 hover:bg-[#1c2128] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Edit2 size={15} className={adminTab === 'content' ? 'text-blue-600' : 'text-slate-500'} />
                      <span>Website Editor</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isConfigDirty && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Unpublished changes"></span>
                      )}
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-500">
                        9
                      </span>
                      <ChevronDown 
                        size={13} 
                        className={`transition-transform duration-200 text-slate-500 ${
                          isEditorDropdownOpen ? 'rotate-180 text-blue-600' : ''
                        }`} 
                      />
                    </div>
                  </button>

                  {/* Dropdown Menu Tree */}
                  <AnimatePresence initial={false}>
                    {isEditorDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden pl-3 pr-1 py-1 space-y-1 border-l-2 border-slate-200 ml-3.5 my-1"
                      >
                        {/* Interactive Dropdown Selector */}
                        <div className="px-1 pb-1">
                          <div className="relative">
                            <select
                              value={activeContentSection || 'hero'}
                              onChange={(e) => {
                                setAdminTab('content');
                                setActiveContentSection(e.target.value as any);
                              }}
                              className="w-full bg-slate-50 border border-slate-200 hover:border-[#58a6ff]/50 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-slate-700 focus:outline-none focus:border-[#58a6ff] cursor-pointer appearance-none pr-6 transition-colors"
                            >
                              {editorSectionTabs.map(sec => (
                                <option key={sec.id} value={sec.id} className="bg-white text-slate-900">
                                  {sec.name} {sec.count !== undefined && sec.count > 0 ? `(${sec.count})` : ''}
                                </option>
                              ))}
                            </select>
                            <ChevronDown size={11} className="absolute right-2 top-2.5 text-slate-500 pointer-events-none" />
                          </div>
                        </div>

                        {/* Sub-item Buttons */}
                        {editorSectionTabs.map((sec) => {
                          const isSecActive = adminTab === 'content' && (activeContentSection || 'hero') === sec.id;
                          return (
                            <button
                              key={sec.id}
                              onClick={() => {
                                setAdminTab('content');
                                setActiveContentSection(sec.id as any);
                              }}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] transition-all text-left cursor-pointer ${
                                isSecActive
                                  ? 'bg-[#58a6ff]/15 text-blue-600 border border-[#58a6ff]/30 font-semibold shadow-sm'
                                  : 'text-slate-500 hover:text-slate-900 hover:bg-[#1c2128] border border-transparent'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className={isSecActive ? 'text-blue-600' : 'text-slate-500'}>
                                  {sec.icon}
                                </span>
                                <span className="truncate">{sec.name}</span>
                              </div>
                              {sec.count !== undefined && sec.count > 0 && (
                                <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-slate-200/60 text-slate-500 shrink-0">
                                  {sec.count}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button 
                  onClick={() => setAdminTab('users')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                    adminTab === 'users' 
                      ? 'bg-slate-100 text-blue-600 border border-slate-200 shadow-sm font-semibold' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-[#1c2128] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Users size={15} className={adminTab === 'users' ? 'text-blue-600' : 'text-slate-500'} />
                    <span>User Accounts</span>
                  </div>
                </button>

                <button 
                  onClick={() => setAdminTab('performance')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                    adminTab === 'performance' 
                      ? 'bg-slate-100 text-blue-600 border border-slate-200 shadow-sm font-semibold' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-[#1c2128] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Activity size={15} className={adminTab === 'performance' ? 'text-blue-600' : 'text-slate-500'} />
                    <span>Performance</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-slate-200 bg-white shrink-0 space-y-2">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-blue-600 shrink-0">
                  <Shield size={13} />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold text-slate-900 truncate">{currentUser?.email || 'Admin'}</div>
                  <div className="text-[9px] text-slate-500 uppercase tracking-wider font-mono">Super Admin</div>
                </div>
              </div>
              <button
                onClick={handleAdminLogout}
                disabled={isLoggingIn}
                className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut size={14} className={isLoggingIn ? "animate-pulse" : ""} />
              </button>
            </div>

            <button
              onClick={() => {
                setCurrentView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer font-mono"
            >
              <Globe size={12} />
              <span>Exit to Public Site</span>
            </button>
          </div>
        </aside>

        {/* Right Independent Content Workspace */}
        <section className="flex-1 h-full overflow-hidden flex flex-col bg-slate-50">
          {/* Fixed ERP Top Bar */}
          <header className="h-14 shrink-0 px-6 border-slate-400 border-slate-200 bg-white/70 backdrop-blur-md flex items-center justify-between z-10">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                <span>Admin</span>
                <span>/</span>
                <span className="text-slate-900 font-semibold">
                  {adminTab === 'messages' ? 'Inquiry Dashboard' : adminTab === 'content' ? 'Website Editor' : adminTab === 'performance' ? 'Performance Analytics' : 'User Accounts'}
                </span>
                {adminTab === 'content' && (
                  <>
                    <span>/</span>
                    <span className="text-blue-600 font-semibold">
                      {editorSectionTabs.find(s => s.id === (activeContentSection || 'hero'))?.name || 'Section'}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {isActionPending && (
                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-blue-600 text-[10px] font-bold uppercase tracking-widest font-mono"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#58a6ff] animate-pulse"></div>
                  Syncing...
                </motion.div>
              )}

              {adminTab === 'content' && isConfigDirty && (
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                    Unpublished Draft
                  </span>
                  <button
                    onClick={() => setLocalConfig(JSON.parse(JSON.stringify(websiteConfig)))}
                    className="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handlePublishConfig}
                    className="px-3.5 py-1.5 bg-[#238636] hover:bg-[#2eaa44] border border-[#2ea44f] text-slate-900 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check size={12} /> Publish Live
                  </button>
                </div>
              )}

              {!isAdmin && currentUser?.email === 'nishkalya@gmail.com' && (
                <button 
                  onClick={async () => {
                    if (currentUser) {
                      setIsActionPending(true);
                      try {
                        await setDoc(doc(db, 'admins', currentUser.uid), {
                          email: currentUser.email,
                          promotedBy: 'system_bootstrap',
                          createdAt: serverTimestamp()
                        });
                        setIsAdmin(true);
                        setAdminBanner({ type: 'success', message: 'Admin status verified. Full administrative permissions active.' });
                      } catch (err) {
                        console.error("Self-promotion failed", err);
                        setAdminBanner({ type: 'error', message: 'Verification failed. Please check Firestore security rules.' });
                      } finally {
                        setIsActionPending(false);
                      }
                    }
                  }}
                  className="px-3 py-1.5 bg-[#A67C00] text-slate-900 font-bold rounded-lg hover:bg-[#8A6600] transition-all text-[10px] uppercase tracking-widest shadow-md flex items-center gap-1.5 cursor-pointer font-mono"
                >
                  <Shield size={13} /> Verify
                </button>
              )}
            </div>
          </header>

          {/* Independent Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
            <div className="max-w-7xl mx-auto space-y-6">
              {adminBanner && (
                <div className={`p-4 rounded-xl border text-xs font-mono flex items-center justify-between transition-all ${
                  adminBanner.type === 'success' 
                    ? 'bg-emerald-950/40 border-slate-400merald-800/60 text-emerald-400' 
                    : 'bg-red-950/40 border-red-800/60 text-red-400'
                }`}>
                  <span>{adminBanner.message}</span>
                  <button onClick={() => setAdminBanner(null)} className="p-1 hover:text-slate-900 cursor-pointer">
                    <X size={14} />
                  </button>
                </div>
              )}

              {adminTab === 'messages' ? (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  <div className="lg:col-span-1 flex flex-row lg:flex-col gap-4 w-full">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex-1 lg:flex-none">
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-mono">Total Inquiries</div>
                      <div className="text-2xl md:text-3xl font-extrabold text-slate-900">{adminMessages.length}</div>
                    </div>
                    <div className="bg-[#58a6ff]/5 p-5 rounded-xl border border-[#58a6ff]/20 shadow-sm flex-1 lg:flex-none">
                      <div className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mb-1.5 font-mono">New Messages</div>
                      <div className="text-2xl md:text-3xl font-extrabold text-slate-900">{adminMessages.filter(m => m.status === 'unread').length}</div>
                    </div>
                  </div>

                  <div className="lg:col-span-3 space-y-4">
                    {adminMessages.length === 0 ? (
                      <div className="bg-white/50 border border-slate-200 border-dashed rounded-2xl p-12 md:p-20 text-center">
                        <div className="w-14 h-14 bg-white border border-slate-200 text-slate-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Mail size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1.5">No messages yet</h3>
                        <p className="text-slate-500 text-xs font-light max-w-sm mx-auto leading-relaxed">Submissions from the contact form will appear here.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {adminMessages.map((msg) => (
                          <motion.div 
                            key={msg.id}
                            layoutId={msg.id}
                            onClick={() => setSelectedAdminMessage(msg)}
                            className={`group relative bg-white border rounded-xl p-5 md:px-6 cursor-pointer admin-glow overflow-hidden ${msg.status === 'unread' ? 'border-[#58a6ff]/40 shadow-md bg-[#58a6ff]/2' : 'border-slate-200'}`}
                          >
                            {msg.status === 'unread' && (
                              <div className="absolute top-0 left-0 w-1 h-full bg-[#58a6ff]" />
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                              <div className="md:col-span-3">
                                <div className="flex flex-col">
                                  <span className="text-[7px] font-black text-blue-600 uppercase tracking-[0.3em] mb-1 opacity-80 group-hover:opacity-100 transition-opacity font-mono">
                                    {msg.service || 'General'}
                                  </span>
                                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-300 truncate">
                                    {msg.name}
                                  </h4>
                                  <span className="text-[9px] text-slate-500 font-medium uppercase tracking-widest mt-0.5 font-mono truncate">
                                    {msg.company || 'Private'}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="md:col-span-6 lg:col-span-7">
                                <div className="border-l border-slate-200 pl-4 md:pl-6">
                                  <p className="text-slate-500 text-[11px] font-light leading-relaxed line-clamp-1 italic opacity-80 group-hover:opacity-100 transition-opacity">
                                    {msg.message}
                                  </p>
                                </div>
                              </div>

                              <div className="md:col-span-3 lg:col-span-2 flex items-center justify-between md:justify-end gap-5">
                                <div className="flex flex-col items-end shrink-0 font-mono">
                                  <span className="text-[9px] font-bold text-slate-700 tabular-nums tracking-tighter">
                                    {msg.createdAt?.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </span>
                                  <span className="text-[8px] text-slate-500 font-semibold uppercase tracking-tighter">
                                    {msg.createdAt?.toDate().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                  </span>
                                </div>
                                <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center transition-all duration-300 group-hover:bg-[#58a6ff] group-hover:text-slate-900 group-hover:border-transparent shrink-0">
                                  <ArrowRight size={10} />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : adminTab === 'content' ? (
                <AdminContentEditor 
                  websiteConfig={editorConfig}
                  updateConfig={updateConfigLocal}
                  isConfigDirty={isConfigDirty}
                  handlePublishConfig={handlePublishConfig}
                  setLocalConfig={setLocalConfig}
                  projects={projects}
                  adminTestimonials={adminTestimonials}
                  handleEditProject={handleEditProject}
                  handleDeleteProject={handleDeleteProject}
                  handleAddTestimonial={handleAddTestimonial}
                  handleEditTestimonial={handleEditTestimonial}
                  handleDeleteTestimonial={handleDeleteTestimonial}
                  activeContentSection={activeContentSection as any || 'hero'}
                  setActiveContentSection={setActiveContentSection}
                  hideSidebar={true}
                />
              ) : adminTab === 'users' ? (
                <AdminUserManagement />
              ) : (
                <AdminPerformanceDashboard />
              )}
            </div>
          </div>
        </section>
      </div>
    );
  };

  const AdminMessageModal = ({ message, onClose }: { message: any, onClose: () => void }) => {
    if (!message) return null;
    const [confirmDeleteMessage, setConfirmDeleteMessage] = useState(false);

    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-100/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white border border-slate-200 w-full max-w-2xl rounded-[2rem] overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[90vh]"
          >
            <div className="p-6 md:p-10 overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="text-blue-600 text-[10px] font-bold uppercase tracking-[0.3em] mb-3 font-mono">Inquiry Details</div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">From <span className="italic text-blue-600">{message.name}</span></h2>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2.5 bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 rounded-xl transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div>
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-mono">Email Address</div>
                    <div className="flex items-center gap-3 text-slate-900 font-medium text-sm">
                      <Mail size={14} className="text-slate-500" />
                      {message.email}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-mono">Company / Organization</div>
                    <div className="flex items-center gap-3 text-slate-900 font-medium text-sm">
                      <Globe size={14} className="text-slate-500" />
                      {message.company || 'Not provided'}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-mono">Selected Service</div>
                    <div className="flex items-center gap-3 text-slate-900 font-medium text-sm">
                      <Settings size={14} className="text-slate-500" />
                      {message.service}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-mono">Date Received</div>
                    <div className="flex items-center gap-3 text-slate-700 font-medium text-sm">
                      <Clock size={14} className="text-slate-500" />
                      {message.createdAt?.toDate().toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Full Message</div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-slate-700 leading-relaxed text-sm font-light whitespace-pre-wrap">
                  {message.message}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap gap-4">
                {message.status === 'unread' && (
                  <button 
                    disabled={isActionPending}
                    onClick={async () => {
                      setIsActionPending(true);
                      try {
                        await updateDoc(doc(db, 'messages', message.id), { status: 'read' });
                        onClose();
                      } finally {
                        setIsActionPending(false);
                      }
                    }}
                    className="px-6 py-3 bg-[#238636] border border-[#2ea44f] text-slate-900 rounded-lg hover:bg-[#2eaa44] transition-all text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 disabled:opacity-70"
                  >
                    <Check size={12} className={isActionPending ? "animate-pulse" : ""} /> {isActionPending ? "Updating..." : "Mark as Read"}
                  </button>
                )}
                {!confirmDeleteMessage ? (
                  <button 
                    disabled={isActionPending}
                    onClick={() => setConfirmDeleteMessage(true)}
                    className="px-6 py-3 bg-transparent border border-red-500/20 text-red-500 rounded-lg hover:bg-red-500/10 transition-all text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 disabled:opacity-75 cursor-pointer"
                  >
                    <Trash size={12} /> Delete Inquiry
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      disabled={isActionPending}
                      onClick={async () => {
                        setIsActionPending(true);
                        try {
                          await deleteDoc(doc(db, 'messages', message.id));
                          onClose();
                        } finally {
                          setIsActionPending(false);
                        }
                      }}
                      className="px-5 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-all text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 disabled:opacity-75 cursor-pointer shadow-lg shadow-red-600/30"
                    >
                      <Trash size={12} className={isActionPending ? "animate-pulse" : ""} /> {isActionPending ? "Deleting..." : "Confirm Delete"}
                    </button>
                    <button
                      disabled={isActionPending}
                      onClick={() => setConfirmDeleteMessage(false)}
                      className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 rounded-lg transition-all text-[10px] font-bold uppercase tracking-widest cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
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
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12 backdrop-blur-xl bg-black/60"
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="w-[95vw] sm:w-[90vw] md:w-full md:max-w-4xl max-h-[92vh] bg-white border border-slate-200 rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden relative flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-200 transition-colors z-20 bg-slate-100 border border-slate-200"
            >
              <X size={18} className="text-slate-500 hover:text-slate-900" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] h-full overflow-hidden">
              <div className="p-6 sm:p-10 md:p-14 bg-slate-50 flex flex-col items-center justify-center border-slate-400 md:border-slate-400-0 md:border-r border-slate-200 shrink-0">
                <div className="text-center w-full">
                  <div className="mb-6 md:mb-10 w-16 h-16 md:w-28 md:h-28 mx-auto flex items-center justify-center bg-white rounded-2xl shadow-md border border-slate-200">
                    {React.cloneElement(service.icon, { size: 36, className: "md:w-14 md:h-14 text-blue-600", strokeWidth: 1.2 })}
                  </div>
                  <h3 className="text-xl md:text-3xl font-extrabold text-slate-900 mb-3 md:mb-4 tracking-tight uppercase font-sans">{service.title}</h3>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-500 text-[10px] md:text-[11px] font-bold uppercase tracking-widest shadow-sm">
                    <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Ready for deployment
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-10 md:p-16 bg-white overflow-y-auto custom-scrollbar">
                <div className="space-y-10 md:space-y-12">
                  <div className="relative">
                    <div className="flex items-center gap-3 text-blue-600 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] mb-4 md:mb-6">
                       <div className="w-4 md:w-6 h-[1px] bg-slate-200"></div>
                       The Strategy
                    </div>
                    <p className="text-slate-900 text-lg md:text-2xl leading-tight font-medium tracking-tight">
                      {service.why}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 text-blue-600 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] mb-4 md:mb-6">
                       <div className="w-4 md:w-6 h-[1px] bg-slate-200"></div>
                       Actionable Items
                    </div>
                    <p className="text-slate-500 text-sm md:text-base leading-relaxed mb-8 md:mb-10 font-light">
                      {service.desc}
                    </p>
                    <ul className="grid grid-cols-1 gap-3 md:gap-4">
                      {service.details?.map((detail: string, i: number) => (
                        <li key={i} className="flex gap-4 md:gap-5 items-start p-4 md:p-5 rounded-xl border border-slate-200 hover:border-[#58a6ff]/50 hover:bg-white transition-all group">
                          <CheckCircle size={16} className="text-[#238636] mt-1 shrink-0 group-hover:scale-110 transition-transform" />
                          <span className="text-slate-700 text-sm md:text-[15px] font-medium leading-relaxed">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-8 md:pt-10 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 md:gap-8">
                    <div className="flex items-center gap-4 self-start sm:self-center">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-[#58a6ff]/10 border border-[#58a6ff]/20 flex items-center justify-center text-blue-600 font-bold text-xs md:text-sm shadow-sm font-mono">NK</div>
                      <div>
                        <div className="text-slate-500 text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] leading-none mb-1.5">Final Delivery</div>
                        <div className="text-slate-900 text-xs md:text-sm font-bold tracking-tight uppercase font-sans">{service.outcome || "Optimized efficiency."}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        onClose();
                        const element = document.getElementById('contact');
                        if (element) element.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full sm:w-auto px-6 md:px-8 py-3 bg-[#238636] hover:bg-[#2eaa44] border border-[#2ea44f] text-slate-900 text-[11px] md:text-xs font-bold rounded-lg transition-all uppercase tracking-wide"
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
          <div className="absolute inset-0 [backface-visibility:hidden] p-8 md:p-10 bg-white border border-slate-200 rounded-3xl flex flex-col items-center justify-center text-center hover:border-blue-300 hover:shadow-xl transition-all shadow-sm">
            <div className="mb-6 w-14 h-14 flex items-center justify-center bg-blue-50/50 rounded-2xl group-hover:bg-blue-100 transition-all border border-blue-100">
              {React.cloneElement(service.icon, { className: "text-blue-600" })}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">{service.title}</h3>
            <p className="text-slate-500 text-xs leading-relaxed font-light">{service.desc}</p>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
              className="mt-8 flex items-center gap-2 text-[9px] font-bold text-blue-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity bg-transparent"
            >
              Why / What <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Back */}
          <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] p-8 md:p-10 bg-slate-50 border border-slate-200 rounded-3xl flex flex-col justify-center shadow-lg">
             <div className="mb-6">
               <div className="text-blue-600 text-[9px] font-bold uppercase tracking-[0.2em] mb-2 font-sans">Why It Matters</div>
               <p className="text-slate-600 text-xs leading-relaxed font-light">{service.why}</p>
             </div>
             <div className="mb-6">
               <div className="text-blue-600 text-[9px] font-bold uppercase tracking-[0.2em] mb-2 font-sans">What We Do</div>
               <p className="text-slate-800 text-xs leading-relaxed font-medium line-clamp-2">{service.what}</p>
             </div>
             <button 
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
              className="mt-2 text-[9px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2 hover:text-blue-700 transition-colors"
            >
              View Full Detail <ChevronRight size={10} />
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  const [projectModal, setProjectModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    project: Project | null;
  }>({
    isOpen: false,
    mode: 'add',
    project: null
  });

  const [adminTestimonials, setAdminTestimonials] = useState<Testimonial[]>([]);
  const [testimonialModal, setTestimonialModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    testimonial: Testimonial | null;
  }>({
    isOpen: false,
    mode: 'add',
    testimonial: null
  });
  const [testimonialToDelete, setTestimonialToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    const unsubscribe = testimonialService.subscribeToTestimonials((items) => {
      setAdminTestimonials(items);
      if (items.length === 0 && currentUser?.email === 'nishkalya@gmail.com') {
        testimonialService.seedDefaultTestimonials();
      }
    });
    return () => {
      unsubscribe();
    };
  }, [isAdmin, currentUser]);

  const handleAddTestimonial = () => {
    setTestimonialModal({
      isOpen: true,
      mode: 'add',
      testimonial: {
        id: '',
        quote: '',
        author: '',
        title: '',
        company: '',
        avatarUrl: '',
        rating: 5,
        isActive: true
      }
    });
  };

  const handleEditTestimonial = (item: Testimonial) => {
    setTestimonialModal({
      isOpen: true,
      mode: 'edit',
      testimonial: { ...item }
    });
  };

  const handleDeleteTestimonial = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setTestimonialToDelete(id);
  };

  const getProjectIcon = (type: string, size = 40) => {
    switch (type) {
      case 'message': return <MessageSquare size={size} className="text-blue-600/30" />;
      case 'eye': return <Eye size={size} className="text-blue-600/30" />;
      case 'layout': return <Layout size={size} className="text-blue-600/30" />;
      case 'chart': return <BarChart3 size={size} className="text-blue-600/30" />;
      default: return <Zap size={size} className="text-blue-600/30" />;
    }
  };

  const getReadingTime = (text: string) => {
    if (!text) return 0;
    const cleanText = text.replace(/[#*`>_\-]/g, '').trim();
    const wordCount = cleanText.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(wordCount / 200));
  };

  const getPlatformIcon = (iconType: string, size = 18) => {
    switch (iconType?.toLowerCase()) {
      case 'github': return <Github size={size} />;
      case 'linkedin': return <Linkedin size={size} />;
      case 'website':
      case 'globe': return <Globe size={size} />;
      case 'hackerrank':
      case 'trophy': return <Trophy size={size} />;
      case 'leetcode':
      case 'code':
      case 'code2': return <Code2 size={size} />;
      case 'behance':
      case 'palette': return <Palette size={size} />;
      case 'dribbble': return <Dribbble size={size} />;
      case 'youtube': return <Youtube size={size} />;
      case 'certificates':
      case 'award': return <Award size={size} />;
      case 'other':
      case 'other links':
      case 'link': return <LinkIcon size={size} />;
      default: return <LinkIcon size={size} />;
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

  if (isAuthLoading || isConfigLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
         <div className="flex flex-col items-center gap-4">
           <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 border-2 border-slate-200 border-t-blue-500 rounded-full shadow-sm"
            />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400 font-mono animate-pulse">Initializing Studio</span>
         </div>
      </div>
    );
  }

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
      setIsActionPending(true);
      try {
        await deleteDoc(doc(db, 'projects', projectToDelete));
        setProjectToDelete(null);
      } catch (err) {
        console.error("Failed to delete project", err);
      } finally {
        setIsActionPending(false);
      }
    }
  };

  const saveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectModal.project) return;

    setIsActionPending(true);
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
    } finally {
      setIsActionPending(false);
    }
  };

  const confirmDeleteTestimonial = async () => {
    if (testimonialToDelete) {
      setIsActionPending(true);
      try {
        await testimonialService.deleteTestimonial(testimonialToDelete);
        setTestimonialToDelete(null);
      } catch (err) {
        console.error("Failed to delete testimonial", err);
      } finally {
        setIsActionPending(false);
      }
    }
  };

  const saveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testimonialModal.testimonial) return;

    setIsActionPending(true);
    try {
      const { id, createdAt, updatedAt, ...rest } = testimonialModal.testimonial;
      if (testimonialModal.mode === 'add') {
        await testimonialService.addTestimonial(rest);
      } else {
        await testimonialService.updateTestimonial(id, rest);
      }
      setTestimonialModal({ isOpen: false, mode: 'add', testimonial: null });
    } catch (err) {
      console.error("Failed to save testimonial", err);
    } finally {
      setIsActionPending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
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
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div 
      className={`bg-transparent text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden ${(currentView === 'admin' || (currentView === 'marketing' && Boolean(marketingUser))) ? 'h-screen overflow-hidden' : 'min-h-screen'}`}
      style={{ 
        '--color-primary': themeMode === 'white' 
          ? '#0969da' 
          : themeMode === 'personal'
            ? '#a05bff'
            : (websiteConfig?.colors?.primary || '#58a6ff'),
        '--color-secondary': themeMode === 'white' 
          ? '#1a7f37' 
          : themeMode === 'personal'
            ? '#00f2fe'
            : (websiteConfig?.colors?.secondary || '#2f81f7')
      } as any}
    >
      {/* Clean compiled theme integration handled by index.css variables */}
      {currentUser?.email === 'nishkalya@gmail.com' && currentView !== 'admin' && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-white text-slate-900 text-[9px] font-bold uppercase tracking-[0.3em] h-8 flex items-center justify-center gap-6 border-slate-400 border-slate-200">
          <div className="flex items-center gap-2 text-blue-600">
            <div className="w-1.5 h-1.5 rounded-full bg-[#58a6ff] animate-pulse"></div>
            Admin View
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setCurrentView('admin')} 
              className="hover:text-blue-600 text-slate-500 transition-colors"
            >
              Management Console
            </button>
            <div className="w-px h-3 bg-slate-200"></div>
            <button 
              onClick={() => { setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
              className={`hover:text-blue-600 transition-colors ${currentView === 'home' ? 'text-blue-600' : 'text-slate-500'}`}
            >
              Public Preview
            </button>
            <div className="w-px h-3 bg-slate-200"></div>
            <button 
              onClick={handleAdminLogout} 
              className="hover:text-red-400 text-slate-500 transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
      <ServiceModal service={selectedService} onClose={() => setSelectedService(null)} />
      <AdminMessageModal message={selectedAdminMessage} onClose={() => setSelectedAdminMessage(null)} />
      
      {/* Ambient Background Accents */}
      <div className={`fixed top-[-10%] right-[-10%] w-[800px] h-[800px] bg-[#58a6ff]/3 rounded-full blur-[140px] pointer-events-none z-0 ${currentUser?.email === 'nishkalya@gmail.com' && currentView !== 'admin' ? 'translate-y-8' : ''}`}></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#238636]/2 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* Navigation (hidden after admin login or in marketing ERP dashboard per user request) */}
      <nav className={`fixed left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-slate-400 border-slate-200 transition-all duration-300 top-0 ${(currentView === 'admin' || (currentView === 'marketing' && Boolean(marketingUser)) || currentUser?.email === 'nishkalya@gmail.com' || isAdmin) ? 'hidden' : ''}`}>
        <div className={`flex items-center justify-between px-6 md:px-12 py-4 w-full max-w-7xl mx-auto ${(currentView === 'admin' || (currentView === 'marketing' && Boolean(marketingUser)) || currentUser?.email === 'nishkalya@gmail.com' || isAdmin) ? 'hidden' : ''}`}>
          <div 
            className="flex items-center space-x-2 group cursor-pointer" 
            onClick={() => { setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            role="button"
            aria-label="Go to home"
          >
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center transform rotate-12 group-hover:rotate-0 transition-transform duration-500 shadow-sm border border-slate-200"
              style={{ backgroundColor: '#ffffff' }}
            >
              <span className="text-blue-600 font-extrabold text-sm font-mono">N</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 uppercase font-sans">Nishkalya</span>
          </div>
          <div className="hidden sm:flex space-x-8 text-[11px] font-semibold tracking-[0.05em] text-slate-500 uppercase flex-wrap justify-center">
            <button aria-label="Home" onClick={() => { setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`hover:text-blue-600 transition-colors ${currentView === 'home' ? 'text-blue-600 border-slate-400-2 border-blue-500 pb-1' : ''}`}>Home</button>
            <button aria-label="About" onClick={() => scrollToSection('about')} className="hover:text-blue-600 transition-colors pb-1">About</button>
            <button aria-label="Services" onClick={() => scrollToSection('services')} className="hover:text-blue-600 transition-colors pb-1">Services</button>
            <button aria-label="Projects" onClick={() => { setCurrentView('projects'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`hover:text-blue-600 transition-colors ${currentView === 'projects' ? 'text-blue-600 border-slate-400-2 border-blue-500 pb-1' : ''}`}>Projects</button>
            <button aria-label="Development" onClick={() => { setCurrentView('marketing'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`hover:text-blue-600 transition-colors ${currentView === 'marketing' ? 'text-blue-600 border-slate-400-2 border-blue-500 pb-1' : ''}`}>Development</button>
            <button aria-label="Contact" onClick={() => scrollToSection('contact')} className="hover:text-blue-600 transition-colors pb-1">Contact</button>
          </div>
          <div className="flex items-center gap-4">


            <button 
              onClick={() => scrollToSection('contact')}
              className="hidden sm:block px-4 py-1.5 bg-blue-600 border border-blue-500 hover:bg-blue-700 hover:border-blue-600 transition-all text-xs font-semibold rounded-lg text-white shadow-sm"
            >
              Get Started
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 text-slate-600 hover:text-blue-600 transition-colors"
              aria-label="Toggle mobile navigation menu"
              aria-expanded={isMobileMenuOpen}
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
              className="sm:hidden bg-white border-slate-400 border-slate-200 overflow-hidden"
            >
              <div className="p-8 flex flex-col gap-6 text-xs font-medium uppercase text-slate-500 text-center">
                <button onClick={() => { setCurrentView('home'); setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-blue-600 py-2">Home</button>
                <button onClick={() => scrollToSection('about')} className="hover:text-blue-600 py-2">About</button>
                <button onClick={() => scrollToSection('services')} className="hover:text-blue-600 py-2">Services</button>
                <button onClick={() => { setCurrentView('projects'); setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-blue-600 py-2">Projects</button>
                <button onClick={() => { setCurrentView('marketing'); setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-blue-600 py-2">Development</button>
                <button onClick={() => scrollToSection('contact')} className="hover:text-blue-600 py-2">Contact</button>
                <button 
                  onClick={() => scrollToSection('contact')}
                  className="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white border border-blue-500 rounded-lg text-xs tracking-wide font-bold shadow-sm"
                >
                  Start a Project
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content Area */}
      <main id="main-content" className={`flex-grow ${(currentView === 'admin' || (currentView === 'marketing' && Boolean(marketingUser))) ? 'h-screen w-full overflow-hidden flex flex-col' : ''}`}>
        <AnimatePresence mode="wait">
        {currentView === 'admin' ? (
          <motion.div
            key="admin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full overflow-hidden flex flex-col"
          >
            {AdminDashboard()}
          </motion.div>
        ) : currentView === 'marketing' ? (
          <motion.div
            key="marketing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full overflow-hidden flex flex-col"
          >
            <MarketingPage 
              marketingUser={marketingUser} 
              setMarketingUser={setMarketingUser} 
              onOpenAdmin={() => {
                setCurrentView('admin');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onExitPortal={() => {
                setCurrentView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
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
            <section className="relative min-h-[90vh] md:min-h-screen flex flex-col items-center justify-center pt-32 pb-20 px-6 md:px-12 z-10 w-full text-center bg-gradient-to-b from-white via-slate-50 to-slate-100">
              <div className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center">
                <motion.div 
                  initial="hidden"
                  animate="visible"
                  variants={containerVariants}
                  className="max-w-4xl"
                >
                  <motion.div 
                    variants={itemVariants} 
                    className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full mb-6 md:mb-8 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors duration-300"
                  >
                    <span 
                      className="w-2 h-2 rounded-full animate-pulse bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                    ></span>
                    <span 
                      className="text-[9px] md:text-[10px] font-semibold text-slate-500 uppercase tracking-[0.2em]"
                    >
                      {websiteConfig?.hero?.badge}
                    </span>
                  </motion.div>
                  
                  <h1 
                    className="text-3xl sm:text-6xl md:text-8xl font-extrabold leading-[1.2] md:leading-[1.1] text-slate-900 mb-6 md:mb-8 tracking-tight px-4 md:px-0" 
                  >
                    <MotionHeading html={websiteConfig?.hero?.heading} />
                  </h1>
                  
                  <motion.p 
                    variants={itemVariants}
                    className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-light mb-10 md:mb-12 px-2 md:px-0"
                  >
                    {websiteConfig?.hero?.subheading}
                  </motion.p>
        
                  <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center gap-4 md:gap-5 px-6 sm:px-0">
                    <button 
                      onClick={() => setCurrentView('projects')}
                      className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-700 border border-blue-600 text-white font-semibold rounded-lg transition-all duration-300 text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg group"
                      aria-label="View our portfolio projects and work showcase"
                    >
                      View Our Work <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button 
                      onClick={() => scrollToSection('contact')}
                      className="w-full sm:w-auto px-6 py-3.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all duration-300 text-xs shadow-sm hover:shadow-md"
                      aria-label="Scroll to the contact section to submit a project inquiry"
                    >
                      Start a Project
                    </button>
                  </motion.div>
        
                  {/* Stats Bar */}
                  <motion.div 
                    variants={itemVariants}
                    className="grid grid-cols-2 md:grid-cols-4 gap-y-10 md:gap-16 mt-20 md:mt-24 py-10 border-y border-slate-200 bg-white/50 rounded-3xl backdrop-blur-sm"
                  >
                    {websiteConfig?.hero?.stats?.map((stat: any, i: number) => (
                      <div key={i} className="flex flex-col items-center hover:scale-105 transition-transform duration-300">
                        <div className="text-2xl md:text-3xl font-semibold text-slate-800 tracking-tighter mb-1 font-mono drop-shadow-sm">{stat.value}</div>
                        <div className="text-[9px] text-blue-600 uppercase tracking-[0.2em] font-medium whitespace-nowrap">{stat.label}</div>
                      </div>
                    ))}
                  </motion.div>
                </motion.div>
              </div>
            </section>
      
            {/* About Section */}
            <section id="about" className="py-20 md:py-32 px-6 md:px-12 z-10 w-full bg-gradient-to-tr from-slate-50 to-white border-t border-slate-200">
              <div className="w-full max-w-7xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="order-2 md:order-1"
                  >
                    <div 
                      className="text-[9px] md:text-[10px] font-bold text-blue-600 uppercase tracking-[0.3em] mb-4"
                    >
                      {websiteConfig?.about?.badge}
                    </div>
                    <h2 className="text-4xl md:text-5xl font-extrabold leading-tight text-slate-900 mb-6 md:mb-8 tracking-tight">
                      <MotionHeading html={websiteConfig?.about?.heading} delay={0.1} whileInView={true} />
                    </h2>
                    
                    <div className="space-y-6 mb-10">
                      {websiteConfig?.about?.paragraphs?.slice(0, 2).map((p: string, i: number) => (
                        <p key={i} className="text-slate-600 text-base md:text-lg leading-relaxed font-light">
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
                              <p key={i} className="text-slate-600 text-base md:text-lg leading-relaxed font-light">
                                <span dangerouslySetInnerHTML={{ __html: p }} />
                              </p>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      <button 
                        onClick={() => setShowFullAbout(!showFullAbout)}
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-500 transition-colors flex items-center gap-1.5 group/btn"
                        aria-label={showFullAbout ? "Read less about our corporate history and profile" : "Read more about our corporate history and profile"}
                        aria-expanded={showFullAbout}
                      >
                        {showFullAbout ? 'Read Less' : 'Read More'}
                        <motion.span
                          animate={{ rotate: showFullAbout ? 180 : 0 }}
                          className="inline-block"
                        >
                          <ChevronRight size={14} className="rotate-90 group-hover/btn:translate-y-0.5 transition-transform" />
                        </motion.span>
                      </button>
                    </div>
  
                    <div className="flex flex-wrap gap-2 md:gap-3">
                      {websiteConfig?.about?.skills?.map((tag: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-white/80 backdrop-blur-sm border border-slate-200 text-[11px] font-medium text-slate-700 rounded-md transition-all hover:bg-slate-50 hover:border-blue-200 hover:text-blue-700 cursor-default shadow-sm">
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
                    <div className="aspect-square bg-gradient-to-br from-white to-slate-50 rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center relative hover:border-blue-200 hover:shadow-lg transition-all duration-500 shadow-md group">
                       <Cpu size={80} className="md:size-[120px] text-blue-600/5 absolute group-hover:scale-110 group-hover:text-blue-600/10 transition-all duration-700" />
                       <div className="text-center p-8 md:p-12 relative z-10">
                          <div className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-2 font-mono tracking-tighter drop-shadow-sm">01</div>
                          <div className="text-[10px] md:text-xs text-blue-600 tracking-[0.3em] uppercase font-semibold">Innovation first</div>
                       </div>
                    </div>
                    <div className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 p-5 md:p-6 bg-white/90 backdrop-blur-md border border-slate-200 rounded-xl shadow-lg z-20 hover:border-blue-200 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                       <div className="text-xl md:text-2xl font-semibold text-slate-900 mb-1 font-mono">2025</div>
                       <div className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">Future Ready</div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </section>
      
            <section id="services" className="py-20 md:py-32 px-6 md:px-12 bg-gradient-to-b from-white via-slate-50 to-slate-100 border-y border-slate-200 relative">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 md:mb-20">
                  <div className="text-blue-600 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] mb-4">What We Do</div>
                  <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
                    <MotionHeading html="Services Built for <span class='italic text-blue-600'>Tomorrow</span>" whileInView={true} />
                  </h2>
                  <p className="text-slate-600 max-w-2xl mx-auto text-sm md:text-base font-light">From AI strategy to shipped product, we cover every layer of the modern digital stack.</p>
                </div>
      
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                  {websiteConfig?.services?.map((service: any, i: number) => {
                    const icons: any = {
                      "AI Product Development": <Zap className="text-blue-500" />,
                      "UI/UX Design Systems": <Layout className="text-blue-500" />,
                      "LLM Integration": <MessageSquare className="text-blue-500" />,
                      "Computer Vision": <Eye className="text-blue-500" />,
                      "Data Intelligence": <BarChart3 className="text-blue-500" />,
                      "Web & App Development": <Globe className="text-blue-500" />
                    };
                    return (
                      <ServiceCard key={i} service={{ ...service, icon: icons[service.title] || <Zap className="text-blue-500" /> }} index={i} onSelect={() => setSelectedService({ ...service, icon: icons[service.title] || <Zap className="text-blue-500" /> })} />
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
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-20 gap-6 md:gap-8 pb-8 md:pb-12 border-slate-400 border-slate-200/50">
              <div>
                <div className="inline-flex items-center gap-2 text-blue-600 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] mb-4 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#58a6ff] animate-pulse" />
                  Curated Portfolio
                </div>
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight"
                >
                  Pure <span className="italic text-blue-600">Innovation.</span>
                </motion.h1>
              </div>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6"
              >
                <p className="text-slate-500 max-w-md text-sm leading-relaxed">
                  A specialized gallery of our most impactful work in AI, Design, and Engineering. Click any project to open detailed architecture notes and interactive live previews.
                </p>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:border-[#58a6ff]/50 text-slate-900 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer shrink-0 shadow-sm flex items-center gap-2"
                >
                  Start a Project <ArrowRight size={13} className="text-blue-600" />
                </button>
              </motion.div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {isProjectsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div 
                    key={`project-skeleton-${i}`}
                    className="aspect-[4/5] bg-white/40 border border-slate-200/50 rounded-3xl p-8 flex flex-col justify-end relative overflow-hidden animate-pulse"
                  >
                    {/* Subtle decorative placeholder background */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-100/90 to-transparent z-0"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-slate-200/40 rounded-2xl flex items-center justify-center border border-slate-200/30 text-zinc-700">
                      <Activity size={24} />
                    </div>
                    
                    <div className="relative z-10 space-y-3">
                      {/* Category banner */}
                      <div className="h-3 w-1/3 bg-slate-200/60 rounded-md" />
                      {/* Title banner */}
                      <div className="h-6 w-3/4 bg-slate-200/60 rounded-md" />
                    </div>
                  </div>
                ))
              ) : projects.length === 0 ? (
                <div className="col-span-full py-20 text-center">
                  <Activity className="text-zinc-600 mx-auto mb-4" size={32} />
                  <p className="text-slate-500 text-sm">No innovative showcase items recorded yet.</p>
                </div>
              ) : (
                projects.map((project, i) => (
                  <ProjectCard 
                    key={project.id}
                    project={project}
                    index={i}
                    setHoveredProject={setHoveredProject}
                    onClick={() => {
                      setSelectedProjectForPreview(project);
                      if (project.link) {
                        setIsFlipped(false);
                        setActivePreviewUrl(project.link);
                        setIsIframeLoading(true);
                      } else {
                        setIsFlipped(true);
                        setActivePreviewUrl(null);
                        setIsIframeLoading(false);
                      }
                      setShowFullPreview(false);
                    }}
                  />
                ))
              )}
            </div>

            {/* SECTION 2: PLATFORMS & PROFILES FILTERABLE SHOWCASE */}
            <div className="mt-32 pt-20 border-t border-slate-200/40" id="platforms-profiles-section">
              <div className="mb-14">
                <div className="text-blue-600 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] mb-4">
                  External Channels
                </div>
                <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 uppercase tracking-tight">
                  Platforms & <span className="italic text-blue-600">Profiles</span>
                </h2>
                <p className="text-slate-500 max-w-2xl mt-4 text-sm md:text-base font-light">
                  Explore verified repositories, industry achievements, media hubs, and professional credentials loaded across international developer ecosystems.
                </p>
              </div>

              {/* Navigation Grid of Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 mb-12">
                {displayPlatforms.map((platform: any) => {
                  const isActive = activeProfilePlatform === platform.id;
                  return (
                    <button
                      key={platform.id}
                      onClick={() => setActiveProfilePlatform(platform.id)}
                      id={`platform-tab-${platform.id}`}
                      className={`relative flex flex-col items-start p-4 rounded-xl border transition-all duration-300 text-left overflow-hidden group cursor-pointer ${
                        isActive
                          ? 'bg-[#0f1524]/60 border-[#58a6ff]/70 shadow-[0_0_20px_rgba(88,166,255,0.15)] text-slate-900'
                          : 'bg-slate-50/30 border-slate-200/50 hover:border-[#58a6ff]/40 text-slate-500 hover:text-slate-900 backdrop-blur-sm'
                      }`}
                    >
                      {/* Active glow flare inside tab */}
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#58a6ff]/5 to-transparent pointer-events-none" />
                      )}
                      
                      <div className="flex items-center justify-between w-full mb-3 z-10">
                        <div className={`p-2 rounded-lg transition-transform duration-300 group-hover:scale-110 ${
                          isActive ? 'bg-[#58a6ff]/10 text-blue-600' : 'bg-white/50 text-slate-500 group-hover:text-slate-700'
                        }`}>
                          {getPlatformIcon(platform.iconType || platform.id, 18)}
                        </div>
                        {/* Counters representation */}
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border transition-colors ${
                          isActive 
                            ? 'bg-[#58a6ff]/20 text-blue-600 border-[#58a6ff]/30' 
                            : 'bg-white text-slate-500/60 border-transparent group-hover:text-slate-500 group-hover:border-slate-200'
                        }`}>
                          {platform.items?.length || 0}
                        </span>
                      </div>

                      <div className="z-10 mt-1">
                        <span className="text-[12px] font-bold uppercase tracking-wider block font-sans">
                          {platform.name}
                        </span>
                      </div>

                      {/* Cyberpunk HUD style corner bracket on active tab */}
                      {isActive && (
                        <>
                          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#58a6ff]" />
                          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#58a6ff]" />
                          <div className="absolute bottom-0 left-0 w-2 h-2 border-slate-400 border-l border-[#58a6ff]" />
                          <div className="absolute bottom-0 right-0 w-2 h-2 border-slate-400 border-r border-[#58a6ff]" />
                        </>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Selected Platform Context Detail banner */}
              <div className="mb-8 p-5 bg-slate-50/45 border border-slate-200/40 rounded-2xl flex items-center gap-4">
                <div className="w-1.5 h-8 bg-[#58a6ff] rounded-r-md" />
                <p className="text-slate-500 text-xs font-mono tracking-wide leading-relaxed uppercase">
                  ACTIVE MATRIX // {displayPlatforms.find((p: any) => p.id === activeProfilePlatform)?.name || ''}: {displayPlatforms.find((p: any) => p.id === activeProfilePlatform)?.description || ''}
                </p>
              </div>

              {/* Items Grid */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeProfilePlatform}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="grid md:grid-cols-2 gap-6"
                >
                  {(displayPlatforms.find((p: any) => p.id === activeProfilePlatform)?.items || []).map((item: any, idx: number) => (
                    <div
                      key={item.id}
                      id={`platform-item-${item.id}`}
                      className="group relative bg-[#0c1017]/45 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-6 hover:border-[#58a6ff]/40 hover:shadow-[0_0_20px_rgba(88,166,255,0.08)] transition-all duration-300 flex flex-col justify-between overflow-hidden"
                    >
                      {/* Interactive live-vignette frames inside active item */}
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_60%,rgba(13,17,23,0.3)_90%,rgba(13,17,23,0.85)_100%)] pointer-events-none z-10 transition-opacity duration-300 group-hover:opacity-75" />

                      {/* Decors */}
                      <div className="absolute top-0 right-0 w-32 h-12 bg-gradient-to-bl from-[#58a6ff]/5 to-transparent pointer-events-none" />

                      <div>
                        {/* Header of Item card */}
                        <div className="flex items-start justify-between mb-3 z-20 relative">
                          <div className="space-y-1">
                            <h4 className="text-[15px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-300 tracking-tight font-sans uppercase">
                              {item.title}
                            </h4>
                            {item.subtitle && (
                              <p className="text-[10px] font-mono text-slate-500 font-medium">
                                {item.subtitle}
                              </p>
                            )}
                          </div>
                          {item.date && (
                            <span className="text-[9px] font-mono text-slate-500 font-bold px-2 py-0.5 rounded bg-slate-100/40 border border-slate-200/30">
                              {item.date}
                            </span>
                          )}
                        </div>

                        {/* Description content */}
                        <p className="text-slate-500 text-xs font-light leading-relaxed mb-5 z-20 relative">
                          {item.description}
                        </p>
                      </div>

                      {/* Footer containing badges, stats, and active real link */}
                      <div className="border-t border-slate-200/40 pt-4 mt-auto flex flex-wrap items-center justify-between gap-3 z-20 relative">
                        {/* Badges representation for high structural organization (Sthira) */}
                        <div className="flex flex-wrap gap-1.5">
                          {item.badges?.map((badge, bIdx) => (
                            <span
                              key={bIdx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100/50 text-[9px] font-mono text-slate-500 tracking-tight uppercase border border-slate-200/60"
                            >
                              <span className="w-1 h-1 rounded-full bg-slate-200" />
                              {badge}
                            </span>
                          ))}
                        </div>

                        {/* Stats counters (e.g. Stars, Forks, Uptime, Rating, Solved) */}
                        <div className="flex items-center gap-4">
                          {item.stats?.map((stat, sIdx) => (
                            <div key={sIdx} className="flex flex-col items-start">
                              <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest leading-none">
                                {stat.label}
                              </span>
                              <span className="text-[11px] font-bold text-slate-900 font-mono mt-0.5">
                                {stat.value}
                              </span>
                            </div>
                          ))}

                          {/* Outer Link */}
                          {item.link && (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 p-2 rounded-lg bg-[#58a6ff]/5 hover:bg-[#58a6ff]/15 text-blue-600 border border-[#58a6ff]/10 hover:border-[#58a6ff]/35 transition-all duration-200 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                              aria-label={`View ${item.title}`}
                            >
                              <span className="hidden sm:inline">Explore</span>
                              <ExternalLink size={11} />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Active indicator dot */}
                      <div className="absolute top-2.5 left-2.5 w-1 h-1 rounded-full bg-zinc-700/60 group-hover:bg-[#58a6ff] transition-colors duration-300" />
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
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
              className="relative w-full max-w-2xl bg-[#0a0a0c] border border-slate-200 rounded-3xl p-6 md:p-10 shadow-2xl overflow-y-auto max-h-[85vh] lg:max-h-[90vh] scrollbar-hide"
            >
              <button 
                onClick={() => setProjectModal({ ...projectModal, isOpen: false })}
                className="absolute top-6 right-6 text-slate-500 hover:text-slate-900 transition-colors"
              >
                <X size={20} />
              </button>

              <h3 className="text-2xl font-light text-slate-900 mb-8" style={{ fontFamily: "'Georgia', serif" }}>
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none admin-glow"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Category (Tags)</label>
                  <input 
                    required
                    value={projectModal.project?.category || ''}
                    onChange={(e) => setProjectModal({ ...projectModal, project: { ...projectModal.project!, category: e.target.value }})}
                    placeholder="E.g. AI · NLP · SaaS"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none admin-glow"
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
                        className={`flex items-center justify-center p-4 rounded-xl border admin-glow ${projectModal.project?.iconType === type ? 'border-[#58a6ff] bg-[#58a6ff]/10 text-slate-900 shadow-xl' : 'border-slate-200 bg-slate-100/50 text-zinc-600 hover:border-slate-200'}`}
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none admin-glow resize-none mb-4"
                  />
                </div>
                
                {/* Advanced Project Details */}
                <div className="space-y-6 pt-4 border-t border-slate-200">
                  <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest font-mono">Full Project Details</h4>
                  
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
                              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none admin-glow"
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
                         className="w-full py-2 border border-dashed border-slate-200 rounded-lg text-[10px] text-slate-500 hover:text-slate-900 admin-glow"
                       >+ Add Feature</button>
                    </div>
                  </div>

                  {/* Tech Stack Editor */}
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3">Tech Stack</label>
                    <div className="space-y-3">
                       {(projectModal.project?.fullDetails?.techStack || []).map((tech, tIdx) => (
                         <div key={tIdx} className="grid grid-cols-2 gap-2 p-3 bg-slate-100/50 border border-slate-200 rounded-xl relative group admin-glow">
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
                              className="bg-transparent border-none text-[11px] font-bold text-slate-900 outline-none"
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
                              className="bg-transparent border-none text-[10px] text-slate-500 outline-none"
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
                         className="w-full py-2 border border-dashed border-slate-200 rounded-lg text-[10px] text-slate-500 hover:text-slate-900"
                       >+ Add Tech</button>
                    </div>
                  </div>

                  {/* Structure Editor */}
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3">Project Structure (File Tree)</label>
                    <div className="space-y-3">
                       {(projectModal.project?.fullDetails?.structure || []).map((item, sIdx) => (
                         <div key={sIdx} className="grid grid-cols-2 gap-2 p-3 bg-slate-100/50 border border-slate-200 rounded-xl relative group admin-glow">
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
                              className="bg-transparent border-none text-[11px] font-bold text-slate-900 outline-none"
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
                              className="bg-transparent border-none text-[10px] text-slate-500 outline-none"
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
                         className="w-full py-2 border border-dashed border-slate-200 rounded-lg text-[10px] text-slate-500 hover:text-slate-900"
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none admin-glow"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none admin-glow resize-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Live Link (Optional)</label>
                  <input 
                    value={projectModal.project?.link || ''}
                    onChange={(e) => setProjectModal({ ...projectModal, project: { ...projectModal.project!, link: e.target.value }})}
                    placeholder="https://example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none admin-glow"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Screenshots (Comma separated URLs)</label>
                    <textarea 
                      rows={3}
                      value={projectModal.project?.screenshots?.join(', ') || ''}
                      onChange={(e) => setProjectModal({ 
                        ...projectModal, 
                        project: { 
                          ...projectModal.project!, 
                          screenshots: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '') 
                        }
                      })}
                      placeholder="https://img1.com, https://img2.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[11px] text-slate-900 outline-none admin-glow resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Video URL (Direct link or YouTube/Vimeo)</label>
                    <input 
                      value={projectModal.project?.videoUrl || ''}
                      onChange={(e) => setProjectModal({ ...projectModal, project: { ...projectModal.project!, videoUrl: e.target.value }})}
                      placeholder="https://video-link.mp4"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[11px] text-slate-900 outline-none admin-glow"
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  disabled={isActionPending}
                  className="w-full py-4 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 text-xs uppercase tracking-widest shadow-lg shadow-violet-600/20 disabled:opacity-70 flex items-center justify-center gap-2 admin-glow"
                >
                  {isActionPending && <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full" />}
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
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-8 shadow-2xl text-center z-10"
            >
              <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mx-auto mb-6 border border-red-500/20">
                <Trash2 size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 font-sans">Delete Project?</h3>
              <p className="text-slate-500 text-xs font-light leading-relaxed mb-6">
                This action cannot be undone. Are you sure you want to remove this project from your portfolio?
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setProjectToDelete(null)}
                  disabled={isActionPending}
                  className="flex-1 py-2.5 bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-lg hover:text-slate-900 hover:bg-slate-200 transition-all text-[9px] uppercase tracking-widest disabled:opacity-50 font-mono"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  disabled={isActionPending}
                  className="flex-1 py-2.5 bg-red-600 border border-red-500 text-white font-bold rounded-lg hover:bg-red-500 transition-all text-[9px] uppercase tracking-widest shadow-lg shadow-red-600/10 disabled:opacity-70 flex items-center justify-center gap-2 font-mono"
                >
                  {isActionPending && <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full" />}
                  {isActionPending ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Testimonial Management Modal */}
      <AnimatePresence>
        {testimonialModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setTestimonialModal({ ...testimonialModal, isOpen: false })}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-[#0a0a0c] border border-slate-200 rounded-3xl p-6 md:p-10 shadow-2xl overflow-y-auto max-h-[85vh] scrollbar-hide text-left"
            >
              <button 
                onClick={() => setTestimonialModal({ ...testimonialModal, isOpen: false })}
                className="absolute top-6 right-6 text-slate-500 hover:text-slate-900 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-[#58a6ff]/10 border border-slate-200 flex items-center justify-center text-blue-600">
                  <Quote size={18} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 font-sans">
                    {testimonialModal.mode === 'add' ? 'Add Testimonial' : 'Edit Testimonial'}
                  </h3>
                  <p className="text-xs text-slate-500">Record customized reviews and feedback elements.</p>
                </div>
              </div>

              <form onSubmit={saveTestimonial} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Quote / Content *</label>
                  <textarea 
                    rows={4}
                    required
                    value={testimonialModal.testimonial?.quote || ''}
                    onChange={(e) => setTestimonialModal({ 
                      ...testimonialModal, 
                      testimonial: { ...testimonialModal.testimonial!, quote: e.target.value } 
                    })}
                    placeholder="Enter the client's quote..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none admin-glow resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Author Name *</label>
                    <input 
                      type="text"
                      required
                      value={testimonialModal.testimonial?.author || ''}
                      onChange={(e) => setTestimonialModal({ 
                        ...testimonialModal, 
                        testimonial: { ...testimonialModal.testimonial!, author: e.target.value } 
                      })}
                      placeholder="e.g. John Doe"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none admin-glow"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Job Title / Role *</label>
                    <input 
                      type="text"
                      required
                      value={testimonialModal.testimonial?.title || ''}
                      onChange={(e) => setTestimonialModal({ 
                        ...testimonialModal, 
                        testimonial: { ...testimonialModal.testimonial!, title: e.target.value } 
                      })}
                      placeholder="e.g. CEO"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none admin-glow"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Company Name</label>
                    <input 
                      type="text"
                      value={testimonialModal.testimonial?.company || ''}
                      onChange={(e) => setTestimonialModal({ 
                        ...testimonialModal, 
                        testimonial: { ...testimonialModal.testimonial!, company: e.target.value } 
                      })}
                      placeholder="e.g. Tech Corp"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none admin-glow"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Rating Level (1 - 5 stars)</label>
                    <div className="flex gap-2.5 pt-1.5">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setTestimonialModal({
                            ...testimonialModal,
                            testimonial: { ...testimonialModal.testimonial!, rating: num }
                          })}
                          className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-all ${
                            (testimonialModal.testimonial?.rating || 5) === num
                              ? 'border-[#58a6ff] bg-[#58a6ff]/10 text-blue-600'
                              : 'border-slate-200 bg-slate-100/40 text-slate-500 hover:border-slate-200'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Client Avatar Image URL</label>
                  <input 
                    type="text"
                    value={testimonialModal.testimonial?.avatarUrl || ''}
                    onChange={(e) => setTestimonialModal({ 
                      ...testimonialModal, 
                      testimonial: { ...testimonialModal.testimonial!, avatarUrl: e.target.value } 
                    })}
                    placeholder="https://images.unsplash.com/... or blank"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none admin-glow"
                  />
                </div>

                <div className="flex items-center gap-3 py-2">
                  <input 
                    type="checkbox"
                    id="isTestimonialActive"
                    checked={testimonialModal.testimonial?.isActive !== false}
                    onChange={(e) => setTestimonialModal({ 
                      ...testimonialModal, 
                      testimonial: { ...testimonialModal.testimonial!, isActive: e.target.checked } 
                    })}
                    className="w-4 h-4 rounded text-blue-600 accent-[#58a6ff] bg-slate-50 border border-slate-200 outline-none"
                  />
                  <label htmlFor="isTestimonialActive" className="text-xs text-slate-700 select-none font-medium">Verify and show active on landing page slider</label>
                </div>

                <div className="pt-4 border-t border-zinc-900 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setTestimonialModal({ ...testimonialModal, isOpen: false })}
                    className="flex-1 py-4 bg-slate-100 border border-slate-200 text-slate-500 font-bold rounded-xl hover:text-slate-900 hover:bg-slate-200 transition-all text-xs uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isActionPending}
                    className="flex-1 py-4 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 text-xs uppercase tracking-widest shadow-lg shadow-violet-600/20 disabled:opacity-70 flex items-center justify-center gap-2 admin-glow"
                  >
                    {isActionPending && <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full" />}
                    {testimonialModal.mode === 'add' ? 'Create' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Testimonial Delete Confirmation Modal */}
      <AnimatePresence>
        {testimonialToDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
              onClick={() => setTestimonialToDelete(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-8 shadow-2xl text-center z-10"
            >
              <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mx-auto mb-6 border border-red-500/20">
                <Trash2 size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 font-sans">Delete Testimonial?</h3>
              <p className="text-slate-500 text-xs font-light leading-relaxed mb-6">
                Are you sure you want to remove this testimonial? This action is irreversible.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setTestimonialToDelete(null)}
                  disabled={isActionPending}
                  className="flex-1 py-2.5 bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-lg hover:text-slate-900 hover:bg-slate-200 transition-all text-[9px] uppercase tracking-widest disabled:opacity-50 font-mono"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDeleteTestimonial}
                  disabled={isActionPending}
                  className="flex-1 py-2.5 bg-red-600 border border-red-500 text-white font-bold rounded-lg hover:bg-red-500 transition-all text-[9px] uppercase tracking-widest shadow-lg shadow-red-600/10 disabled:opacity-70 flex items-center justify-center gap-2 font-mono"
                >
                  {isActionPending && <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full" />}
                  {isActionPending ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Terminal / VS Code Style Project Preview */}
      {/* Project Hover Preview Pane */}
      <AnimatePresence>
        {hoveredProject && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            className="fixed top-24 right-8 bottom-24 w-[400px] z-[50] hidden xl:flex flex-col bg-white/90 backdrop-blur-2xl border border-slate-200 rounded-[2rem] shadow-2xl overflow-hidden pointer-events-none"
          >
            <div className="relative h-64 bg-slate-50 overflow-hidden">
              {hoveredProject.videoUrl ? (
                <video 
                  src={hoveredProject.videoUrl} 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (hoveredProject.screenshots && hoveredProject.screenshots.length > 0 && !failedProjectScreenshots.has(hoveredProject.screenshots[0])) ? (
                <img 
                  src={hoveredProject.screenshots[0]} 
                  alt={hoveredProject.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                  onError={() => {
                    setFailedProjectScreenshots(prev => {
                      const updated = new Set(prev);
                      updated.add(hoveredProject.screenshots[0]);
                      return updated;
                    });
                  }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-4">
                  <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm">
                    {getProjectIcon(hoveredProject.iconType, 32)}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 font-mono">Visual Preview Unavailable</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#161b22] via-transparent to-transparent"></div>
            </div>

            <div className="p-10 flex-1 flex flex-col">
              <div className="mb-8">
                <div className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.4em] mb-3 font-mono">{hoveredProject.category}</div>
                <h3 className="text-2xl font-extrabold text-slate-900 leading-tight mb-4 font-sans">{hoveredProject.title}</h3>
                <div className="w-12 h-0.5 bg-[#58a6ff]"></div>
              </div>

              <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-1 font-light">{hoveredProject.desc}</p>

              {hoveredProject.screenshots && hoveredProject.screenshots.slice(1, 3).filter(shot => !failedProjectScreenshots.has(shot)).length > 0 && (
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {hoveredProject.screenshots.slice(1, 3).filter(shot => !failedProjectScreenshots.has(shot)).map((shot, idx) => (
                    <img 
                      key={idx} 
                      src={shot} 
                      alt="Thumbnail" 
                      className="w-full aspect-video object-cover rounded-xl border border-slate-200"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                      onError={() => {
                        setFailedProjectScreenshots(prev => {
                          const updated = new Set(prev);
                          updated.add(shot);
                          return updated;
                        });
                      }}
                    />
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-blue-600 font-mono">
                <ArrowRight size={14} /> Click to explore full details
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedProjectForPreview && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-0 sm:p-4 md:p-8 overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
              onClick={() => { setActivePreviewUrl(null); setSelectedProjectForPreview(null); }}
            />
            
            <div className={`relative w-full transition-all duration-500 ${showFullPreview ? 'max-w-full h-full p-0' : 'max-w-5xl h-[70vh] sm:h-[85vh] p-4'} perspective-2000 z-10`}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  rotateX: 0,
                  rotateY: isFlipped ? 180 : 0 
                }}
                exit={{ opacity: 0, scale: 0.9, rotateX: -20 }}
                transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                className={`relative w-full h-full preserve-3d ${showFullPreview ? 'rounded-none' : ''}`}
              >
                {/* Close Button - Outside Card for better UX */}
                <button 
                  onClick={() => { setActivePreviewUrl(null); setSelectedProjectForPreview(null); }}
                  className={`absolute ${showFullPreview ? 'top-4 right-4 bg-black/40' : '-top-12 right-0'} p-2 text-slate-900/50 hover:text-slate-900 transition-colors z-[100] rounded-full`}
                  aria-label="Close project preview overlay"
                >
                  <X size={showFullPreview ? 20 : 28} />
                </button>

                {/* FRONT SIDE: LIVE PREVIEW */}
                <div 
                  className={`absolute inset-0 backface-hidden bg-slate-50 ${showFullPreview ? 'rounded-none' : 'rounded-3xl border border-white/10 shadow-2xl'} overflow-hidden flex flex-col`}
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  {/* Card Header */}
                  <div className="h-14 bg-white border-slate-400 border-white/5 flex items-center justify-between px-6 shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                      </div>
                      <div className="h-4 w-[1px] bg-white/10 mx-2" />
                      <div className="flex items-center gap-2 text-slate-500 font-mono text-[10px] uppercase tracking-widest">
                        <Activity size={12} className="text-amber-500" />
                        <span>Live_Instance.sh</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setShowFullPreview(!showFullPreview)}
                        className="p-2 text-slate-500 hover:text-slate-900 transition-colors"
                        title={showFullPreview ? "Minimize" : "Full Screen"}
                        aria-label={showFullPreview ? "Minimize preview window" : "Maximize preview window to full screen"}
                      >
                        {showFullPreview ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                      </button>
                      <button 
                        onClick={() => setIsFlipped(true)}
                        className="px-4 py-1.5 bg-white/5 hover:bg-white/10 text-slate-900 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border border-white/5 flex items-center gap-2"
                      >
                        <Settings size={12} /> View Details
                      </button>
                    </div>
                  </div>

                  {/* Canvas Viewport */}
                  <div className="flex-1 relative bg-black">
                    <AnimatePresence>
                      {isIframeLoading && (
                        <motion.div 
                          initial={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 z-20 bg-slate-50 flex flex-col items-center justify-center p-6 text-center"
                        >
                          <div className="w-10 h-10 border-2 border-white/5 border-t-amber-500 rounded-full animate-spin mb-4"></div>
                          <div className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.4em]">Booting_System...</div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <iframe 
                      key={activePreviewUrl}
                      src={activePreviewUrl || ''} 
                      onLoad={() => setIsIframeLoading(false)}
                      className="w-full h-full border-none pointer-events-auto bg-white"
                      title="Project Live View"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    />
                    
                    {/* Perspective Label Overlay */}
                    <div className="absolute bottom-6 left-6 p-4 bg-black/40 backdrop-blur-md rounded-2xl border border-white/5 pointer-events-none">
                       <div className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1">Visual Architecture</div>
                       <div className="text-[11px] text-slate-900/70 font-mono italic">Rendering stable stream at 60fps</div>
                    </div>
                  </div>
                </div>

                {/* BACK SIDE: PROJECT DETAILS */}
                <div 
                  className="absolute inset-0 backface-hidden bg-white rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col"
                  style={{ 
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}
                >
                  <div className="h-14 bg-[#1c2128] border-slate-400 border-white/5 flex items-center justify-between px-6 shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-500">
                         {getProjectIcon(selectedProjectForPreview.iconType, 16)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest leading-none">Manifest v2.4.0</span>
                        <span className="text-xs font-bold text-slate-900 leading-tight">{selectedProjectForPreview.title}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => setIsFlipped(false)}
                      className="px-4 py-1.5 bg-amber-500 text-black font-bold rounded-lg text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
                    >
                      <Activity size={12} /> Return to Live
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-8 md:p-12 scrollbar-hide">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                      <div className="lg:col-span-7 space-y-10">
                        <section className="space-y-4">
                          <div className="flex items-center justify-between border-slate-400 border-white/5 pb-2">
                            <div className="text-amber-500 font-mono text-[9px] uppercase tracking-[0.4em]">Overview</div>
                            <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[9px] uppercase tracking-widest">
                              <Clock size={11} className="text-amber-500" />
                              <span>{getReadingTime(selectedProjectForPreview.fullDetails?.overview || '')} min read</span>
                            </div>
                          </div>
                          <h3 className="text-2xl md:text-4xl font-light text-slate-900 leading-tight" style={{ fontFamily: "'Georgia', serif" }}>
                            Mechanical & <span className="italic">Architectural</span> Vision
                          </h3>
                          <div className="markdown-body text-slate-500 text-sm md:text-base leading-relaxed font-light">
                            <ReactMarkdown>{selectedProjectForPreview.fullDetails?.overview || ''}</ReactMarkdown>
                          </div>
                        </section>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                           <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                             <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Key Attributes</div>
                             <ul className="space-y-3">
                               {selectedProjectForPreview.fullDetails?.features?.slice(0, 4).map((f, i) => (
                                 <li key={i} className="text-xs text-slate-500 flex gap-3">
                                   <div className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                                   {f}
                                 </li>
                               ))}
                             </ul>
                           </div>
                           <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                             <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Deployment Stack</div>
                             <div className="flex flex-wrap gap-2">
                               {selectedProjectForPreview.fullDetails?.techStack?.map((tech, i) => (
                                 <span key={i} className="px-2.5 py-1 bg-black/20 text-[10px] font-mono text-slate-500 rounded-md border border-white/5">
                                   {tech.name}
                                 </span>
                               ))}
                             </div>
                           </div>
                        </div>
                      </div>

                      <div className="lg:col-span-5 space-y-8">
                         <div className="bg-black/20 rounded-2xl p-6 border border-white/5 space-y-6">
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-slate-400 border-white/5 pb-4">Specifications</div>
                            <div className="space-y-4">
                              {[
                                { l: 'Project Category', v: selectedProjectForPreview.category },
                                { l: 'License Type', v: selectedProjectForPreview.fullDetails?.license || 'Proprietary' },
                                { l: 'Reading Time', v: `${getReadingTime(selectedProjectForPreview.fullDetails?.overview || '')} min read` },
                                { l: 'Current Status', v: 'Active Node', c: 'text-emerald-500' },
                                { l: 'Engine Version', v: 'v4.2.1-stable' }
                              ].map((spec, i) => (
                                <div key={i} className="flex justify-between items-center text-[11px] font-mono">
                                   <span className="text-slate-500">{spec.l}</span>
                                   <span className={spec.c || "text-slate-700"}>{spec.v}</span>
                                </div>
                              ))}
                            </div>
                         </div>

                         <div className="bg-amber-500/5 rounded-2xl p-6 border border-amber-500/10">
                            <div className="flex items-center gap-3 mb-4">
                              <Shield size={16} className="text-amber-500" />
                              <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Integrity Protocol</span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed italic">
                              "Every solution we deliver is sthira (stable), śubhra (clean), and samanvita (well-integrated)."
                            </p>
                         </div>

                         <div className="flex flex-col gap-3">
                            <a 
                              href={selectedProjectForPreview.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full py-4 bg-white/5 hover:bg-white/10 text-slate-900 font-bold rounded-xl text-[10px] uppercase tracking-[0.2em] transition-all border border-white/10 flex items-center justify-center gap-3"
                            >
                              <Maximize2 size={14} /> Global Node Access
                            </a>
                            <button 
                              onClick={() => { setActivePreviewUrl(null); setSelectedProjectForPreview(null); }}
                              className="w-full py-4 text-slate-500 hover:text-slate-900 text-[9px] font-bold uppercase tracking-widest transition-colors"
                            >
                              Terminate Session
                            </button>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Legacy/Other Components Placeholder if needed */}
      <div id="project-portal" />

      {/* Process Section */}
      {currentView === 'home' && (
        <section id="process" className="py-20 md:py-32 px-6 md:px-12 bg-gradient-to-tr from-white to-slate-50 relative border-t border-slate-200">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 md:mb-20">
              <div className="text-blue-600 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] mb-4">
                {websiteConfig.process?.badge || "How we work"}
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
                <MotionHeading html={websiteConfig.process?.heading || "Simple approach. <span class='italic text-blue-600'>Dependable results.</span>"} whileInView={true} />
              </h2>
              <p className="text-slate-600 text-sm md:text-base font-light max-w-2xl mx-auto">
                {websiteConfig.process?.subheading || "Four focused phases to take you from idea to impact."}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-12 relative">
               {/* Connector line for desktop */}
              <div className="hidden md:block absolute top-[28px] left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-slate-300 to-transparent z-0"></div>
              
              {(websiteConfig.process?.steps || [
                { step: "01", title: "Understand your vision", desc: "Whether you are beginning your first digital journey or expanding an existing one, we start by listening deeply." },
                { step: "02", title: "Design with intention", desc: "Every interface decision is deliberate. We merge modern technology with a refined, user-centered philosophy." },
                { step: "03", title: "Engineer with precision", desc: "Swift execution without shortcuts. Hands-on development across the full stack — reliable, tested, documented." },
                { step: "04", title: "Sustain and grow", desc: "The relationship doesn't end at launch. We provide long-term maintenance and continued strategic support." }
              ]).map((p, i) => (
                <div key={i} className="relative z-10 text-center md:text-left group">
                  <div className="w-14 h-14 bg-white border border-slate-200 text-blue-600 flex items-center justify-center rounded-2xl mb-6 md:mb-8 mx-auto md:mx-0 shadow-sm font-bold text-lg font-mono group-hover:scale-110 group-hover:border-blue-300 group-hover:shadow-lg transition-all duration-300">
                    {p.step}
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-3 md:mb-4 group-hover:text-blue-600 transition-colors">{p.title}</h3>
                  <p className="text-slate-500 text-xs md:text-sm font-light leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Tech Stack Section */}
      {currentView === 'home' && (
        <section className="py-20 md:py-32 px-6 md:px-12 border-t border-slate-200 bg-gradient-to-bl from-slate-50 to-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <div className="text-blue-600 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] mb-4">
                  {websiteConfig.techStack?.badge || "The Ecosystem"}
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-8">
                  <MotionHeading html={websiteConfig.techStack?.heading || "Built on a Foundation of <span class='italic text-blue-600'>World-Class</span> Technology"} whileInView={true} />
                </h2>
                <p className="text-slate-600 mb-10 max-w-md text-sm md:text-base font-light leading-relaxed">
                  {websiteConfig.techStack?.subheading || "We leverage the most advanced frameworks and AI models to ensure your product is scalable, secure, and future-proof from day one."}
                </p>
                <div className="grid grid-cols-2 gap-8">
                  {(websiteConfig.techStack?.items || [
                    { label: "Frontend", value: "React / Next.js / Tailwind" },
                    { label: "Intelligence", value: "OpenAI / Anthropic / PyTorch" },
                    { label: "Infrastructure", value: "Vercel / AWS / GCP" },
                    { label: "Interface", value: "Figma / Framer / Spline" }
                  ]).map((item, i) => (
                    <div key={i} className="animate-fadeIn group">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 font-mono group-hover:text-blue-600 transition-colors">{item.label}</div>
                      <div className="text-slate-900 text-sm font-light leading-relaxed">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="relative">
                <div className="aspect-square bg-gradient-to-tr from-blue-50/50 to-transparent rounded-3xl border border-slate-200 flex items-center justify-center relative overflow-hidden group hover:border-blue-300 transition-all duration-500 shadow-md">
                  {/* Visual Representation of Stack (Abstract) */}
                  <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 relative z-10">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                        className="w-16 h-16 md:w-20 md:h-20 bg-white/50 border border-slate-200 rounded-2xl flex items-center justify-center text-blue-500 hover:border-blue-300 hover:bg-white hover:text-blue-600 hover:-translate-y-1 hover:shadow-lg transition-all duration-500 shadow-sm"
                      >
                        {[<Zap />, <Cpu />, <Globe />, <BarChart3 />, <Layout />, <Eye />, <MessageSquare />, <Share2 />, <Search />][i]}
                      </motion.div>
                    ))}
                  </div>

                  {/* Floating Glow */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#58a6ff]/5 rounded-full blur-[80px] pointer-events-none"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      {currentView === 'home' && <TestimonialSection />}

      {/* Contact Section */}
      {currentView === 'home' && (
        <section id="contact" className="py-20 md:py-32 px-6 md:px-12 w-full bg-white border-t border-slate-200">
          <div className="w-full max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 md:gap-20">
              <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
              >
              <div className="text-blue-600 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Begin your project</div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 md:mb-8 leading-tight">
                <MotionHeading html="Ready to build something <span class='italic text-blue-600'>remarkable?</span>" whileInView={true} />
              </h2>
              <p className="text-slate-600 mb-10 md:mb-12 max-w-md text-sm md:text-base font-light">From your first digital step to a fully realized intelligent product — Nishkalya delivers reliable development, swift execution, and sustained growth.</p>
              
              <div className="space-y-6 md:space-y-8">
                {[
                  { icon: <Mail size={16} />, label: "Email", value: "nishkalya@gmail.com" },
                  { icon: <Phone size={16} />, label: "Phone", value: "+91 9608339846" },
                  { icon: <MapPin size={16} />, label: "Location", value: "World Wide Web (Remote)" }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 md:gap-6 group">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-blue-500 group-hover:bg-blue-50 transition-all duration-300 group-hover:text-blue-700 group-hover:border-blue-200 shadow-sm">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-[8px] md:text-[9px] text-slate-500 uppercase tracking-widest mb-1">{item.label}</div>
                      <div className="text-slate-800 font-medium text-sm md:text-base">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 sm:gap-6 mt-12 md:mt-16">
                 <a href="https://github.com/Nishkalya" target="_blank" rel="noreferrer" className="w-10 h-10 border border-slate-200 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm"><Github size={16} /></a>
                 <a href="#" className="w-10 h-10 border border-slate-200 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm"><Linkedin size={16} /></a>
                 <a href="#" className="w-10 h-10 border border-slate-200 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm"><Twitter size={16} /></a>
                 <a href="#" className="w-10 h-10 border border-slate-200 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm"><Dribbble size={16} /></a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-6 md:p-10 bg-white border border-slate-200 rounded-3xl backdrop-blur-sm mt-12 md:mt-0 min-h-[400px] flex flex-col shadow-lg"
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
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-6 shadow-sm border border-green-100">
                      <CheckCircle size={40} className="animate-in zoom-in duration-500" />
                    </div>
                    <h3 className="text-3xl font-extrabold text-slate-900 mb-3">Message Received</h3>
                    <p className="text-slate-600 max-w-[280px] mx-auto text-sm font-light leading-relaxed mb-8">
                      We've received your inquiry and our team will get back to you within 24 hours.
                    </p>
                    <button 
                      onClick={() => setIsSubmitted(false)}
                      className="px-6 py-2.5 bg-white border border-slate-200 text-[10px] font-bold text-slate-600 rounded-lg hover:text-blue-600 hover:bg-slate-50 hover:border-blue-200 transition-all uppercase tracking-wider"
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
                       <label className="block text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1 font-mono">Full Name</label>
                       <input 
                         name="name"
                         value={formData.name}
                         onChange={handleChange}
                         type="text" 
                         placeholder="Ravi Sharma" 
                         className={`w-full bg-white border ${errors.name ? 'border-red-500' : 'border-slate-200'} rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-slate-900 placeholder-slate-400 font-light`} 
                       />
                       {errors.name && (
                         <p className="text-[10px] text-red-500 mt-1.5 px-1 flex items-center gap-1.5 font-medium">
                           <AlertCircle size={10} /> {errors.name}
                         </p>
                       )}
                     </div>
                     <div>
                       <label className="block text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1 font-mono">Email Address</label>
                       <input 
                         name="email"
                         value={formData.email}
                         onChange={handleChange}
                         type="email" 
                         placeholder="ravi@company.com" 
                         className={`w-full bg-white border ${errors.email ? 'border-red-500' : 'border-slate-200'} rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-slate-900 placeholder-slate-400 font-light`} 
                       />
                       {errors.email && (
                         <p className="text-[10px] text-red-500 mt-1.5 px-1 flex items-center gap-1.5 font-medium">
                           <AlertCircle size={10} /> {errors.email}
                         </p>
                       )}
                     </div>
                   </div>
                   <div>
                     <label className="block text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1 font-mono">Company</label>
                     <input 
                       name="company"
                       value={formData.company}
                       onChange={handleChange}
                       type="text" 
                       placeholder="Your Company" 
                       className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-slate-900 placeholder-slate-400 font-light" 
                     />
                   </div>
                   <div>
                     <label className="block text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1 font-mono">Service Needed</label>
                     <div className="relative">
                       <select 
                          name="service"
                          value={formData.service}
                          onChange={handleChange}
                          className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-slate-900 font-light appearance-none"
                        >
                          <option value="" className="bg-white text-slate-500">Select a service</option>
                          {websiteConfig?.services?.map((service: any, index: number) => (
                            <option key={index} value={service.title} className="bg-white text-slate-900">
                              {service.title}
                            </option>
                          ))}
                        </select>
                       <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none rotate-90" />
                     </div>
                   </div>
                   <div>
                     <label className="block text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1 font-mono">Your Message</label>
                     <textarea 
                       name="message"
                       value={formData.message}
                       onChange={handleChange}
                       rows={4} 
                       placeholder="Tell us about your project..." 
                       className={`w-full bg-white border ${errors.message ? 'border-red-500' : 'border-slate-200'} rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-slate-900 placeholder-slate-400 font-light resize-none`}
                     ></textarea>
                     {errors.message && (
                       <p className="text-[10px] text-red-500 mt-1.5 px-1 flex items-center gap-1.5 font-medium">
                         <AlertCircle size={10} /> {errors.message}
                       </p>
                     )}
                   </div>
                   <button 
                     type="submit"
                     className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg border border-blue-500 hover:bg-blue-700 transition-all duration-300 text-[10px] md:text-xs uppercase tracking-wider flex items-center justify-center gap-3 shadow-md hover:shadow-lg"
                   >
                     {isSubmitting ? "Sending..." : "Send Message"} <ArrowRight size={14} className={isSubmitting ? "animate-pulse" : ""} />
                   </button>
                   </motion.form>
                 )}
               </AnimatePresence>
            </motion.div>
          </div>
          </div>
        </section>
      )}
      </main>

      {/* Footer (hidden on Admin console and after logging into Development per user request) */}
      <footer className={`pt-20 md:pt-24 pb-10 md:pb-12 px-6 md:px-12 bg-gradient-to-t from-slate-100 to-white border-t border-slate-200 ${(currentView === 'admin' || (currentView === 'marketing' && Boolean(marketingUser))) ? 'hidden' : ''}`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 md:gap-10 mb-16 md:mb-20">
            <div className="max-w-xs">
              <div className="flex items-center space-x-2 mb-6 cursor-pointer group" onClick={() => { setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center transform rotate-12 group-hover:rotate-0 transition-all duration-500 shadow-md shadow-blue-500/20">
                  <span className="text-slate-900 font-black text-xs font-mono">N</span>
                </div>
                <span className="text-lg font-black tracking-tight text-slate-900 font-sans">NISHKALYA</span>
              </div>
              <p className="text-slate-500 text-sm font-light leading-relaxed mb-6">We craft next-generation products at the intersection of AI and stunning design. Built for impact, designed for the future.</p>
              <div className="flex flex-wrap gap-4">
                <a href="https://github.com/Nishkalya" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-600 transition-colors text-[9px] font-bold uppercase tracking-widest font-mono">GitHub</a>
                <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors text-[9px] font-bold uppercase tracking-widest font-mono">𝕏 (Twitter)</a>
                <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors text-[9px] font-bold uppercase tracking-widest font-mono">LinkedIn</a>
                <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors text-[9px] font-bold uppercase tracking-widest font-mono">Dribbble</a>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-12 sm:gap-20">
              <div className="space-y-3 md:space-y-4">
                <div className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 font-mono">Links</div>
                <button onClick={() => { setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="block text-slate-500 hover:text-blue-600 text-xs md:text-sm transition-colors font-light text-left w-full">Home</button>
                <button onClick={() => scrollToSection('about')} className="block text-slate-500 hover:text-blue-600 text-xs md:text-sm transition-colors font-light text-left w-full">About</button>
                <button onClick={() => scrollToSection('services')} className="block text-slate-500 hover:text-blue-600 text-xs md:text-sm transition-colors font-light text-left w-full">Services</button>
                <button onClick={() => { setCurrentView('projects'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="block text-slate-500 hover:text-blue-600 text-xs md:text-sm transition-colors font-light text-left w-full">Projects</button>
                <button onClick={() => { setCurrentView('marketing'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="block text-slate-500 hover:text-blue-600 text-xs md:text-sm transition-colors font-light text-left w-full">Development</button>
                <button onClick={() => scrollToSection('contact')} className="block text-slate-500 hover:text-blue-600 text-xs md:text-sm transition-colors font-light text-left w-full">Contact</button>
              </div>
              <div className="space-y-3 md:space-y-4">
                <div className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 font-mono">Social</div>
                <a href="https://github.com/Nishkalya" target="_blank" rel="noreferrer" className="block text-slate-500 hover:text-blue-600 text-xs md:text-sm transition-colors font-light">GitHub</a>
                <a href="#" className="block text-slate-500 hover:text-blue-600 text-xs md:text-sm transition-colors font-light">LinkedIn</a>
                <a href="#" className="block text-slate-500 hover:text-blue-600 text-xs md:text-sm transition-colors font-light">Dribbble</a>
                <a href="#" className="block text-slate-500 hover:text-blue-600 text-xs md:text-sm transition-colors font-light">Instagram</a>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-slate-200 gap-4 text-center sm:text-left">
            <div className="text-[8px] md:text-[9px] text-slate-400 uppercase tracking-[0.3em] md:tracking-[0.4em] font-mono">© 2025 Nishkalya. All rights reserved.</div>
            <div className="text-[8px] md:text-[9px] text-slate-400 uppercase tracking-[0.25em] md:tracking-[0.3em] font-mono">Built with ♥ for the World Wide Web.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}


