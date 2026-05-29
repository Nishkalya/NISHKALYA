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
  Compass
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
import { updateDynamicProjectSEO, clearDynamicProjectSEO } from './utils/seoHelper';




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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [detailsTab, setDetailsTab] = useState<'details' | 'browse'>('details');
  const [currentView, setCurrentView] = useState<'home' | 'projects' | 'admin'>('home');
  const [websiteConfig, setWebsiteConfig] = useState<any>(DEFAULT_CONFIG);
  const [isConfigLoading, setIsConfigLoading] = useState(true);
  const [adminTab, setAdminTab] = useState<'messages' | 'content' | 'performance'>('messages');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isProjectsLoading, setIsProjectsLoading] = useState(true);

  // Activate page load and spa route transition performance telemetry
  usePerformanceMonitor(currentView);

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
          document.title = "Nishkalya Studio — AI-First Digital Excellence";
          const descMeta = document.querySelector('meta[name="description"]');
          if (descMeta) {
            descMeta.setAttribute('content', "Nishkalya Studio: Delivering pure creation and precise craftsmanship in AI product development and UI/UX design.");
          }
          
          // Update Open Graph tags for social crawlers dynamically
          const ogTitle = document.querySelector('meta[property="og:title"]');
          if (ogTitle) ogTitle.setAttribute('content', "Nishkalya Studio — AI-First Digital Excellence");
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
          document.title = "Explore Our Works | Nishkalya Studio";
          const descMeta = document.querySelector('meta[name="description"]');
          if (descMeta) {
            descMeta.setAttribute('content', "Curated elite portfolio of specialized applications, SaaS, and custom LLM / UI solutions by Nishkalya Studio.");
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
          
        } else if (currentView === 'admin') {
          document.title = "Management Console | Nishkalya Studio";
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
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

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
             alert("Incorrect password for admin account. Please enter the correct password.");
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
        alert("Invalid Email or Password. Please check your credentials or ensure the user exists in Firebase Console.");
      } else {
        alert("Login failed: " + (error.message || "Unknown error"));
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const AdminDashboard = () => {
    if (!currentUser) {
      return (
        <div className="min-h-screen flex items-center justify-center pt-32 pb-20 px-6 bg-transparent">
          <div className="max-w-md w-full text-center space-y-8 p-10 bg-[#161b22]/90 border border-[#30363d] rounded-2xl shadow-2xl relative z-10">
            <div className="w-14 h-14 bg-[#58a6ff]/10 border border-[#30363d] rounded-2xl flex items-center justify-center text-[#58a6ff] mx-auto transform rotate-12">
              <Lock size={26} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-white font-sans">Admin Access</h2>
              <p className="text-[#8b949e] text-xs font-light">Please log in with the authorized account to access the dashboard and manage inquiries.</p>
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
                <div className="text-[11px] text-[#c9d1d9] space-y-2 leading-relaxed">
                  <p>Email/Password login is currently <span className="font-bold underline">disabled</span> in your Firebase Console.</p>
                  <ol className="list-decimal list-inside space-y-1 font-normal text-xs text-[#8b949e]">
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

            <form onSubmit={handleEmailLogin} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-widest text-[#8b949e] px-1 font-mono">Email Address</label>
                <input 
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-sm text-white outline-none admin-glow placeholder-[#8b949e] font-light"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-widest text-[#8b949e] px-1 font-mono">Password</label>
                <input 
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-sm text-white outline-none admin-glow placeholder-[#8b949e] font-light"
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 bg-[#238636] border border-[#2ea44f] text-white font-bold rounded-xl hover:bg-[#2eaa44] admin-glow flex items-center justify-center gap-2 uppercase tracking-widest text-[9px] font-mono shadow-md"
              >
                {isLoggingIn ? "Verifying..." : "Login with Password"}
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#30363d]"></div></div>
              <div className="relative flex justify-center text-[9px] uppercase tracking-widest font-mono"><span className="bg-[#161b22] px-4 text-[#8b949e] font-semibold">Or</span></div>
            </div>

            <button 
              onClick={handleAdminLogin}
              disabled={isLoggingIn}
              className="w-full py-3 bg-[#21262d] border border-[#30363d] text-[#c9d1d9] font-bold rounded-xl hover:bg-[#30363d] hover:border-[#8b949e] admin-glow flex items-center justify-center gap-2 uppercase tracking-widest text-[9px] font-mono"
            >
              <LogIn size={14} /> {isLoggingIn ? "Authenticating..." : "Continue with Google"}
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
        await setDoc(doc(db, 'config', 'website'), newConfig);
      } catch (err) {
        console.error("Failed to update config", err);
      } finally {
        setIsActionPending(false);
      }
    };

    return (
      <div className="pt-32 pb-20 px-6 md:px-12 w-full max-w-7xl mx-auto min-h-screen">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <div className="text-[#58a6ff] text-[10px] font-bold uppercase tracking-[0.4em] mb-4 font-mono">Command Center</div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white font-sans">
              {adminTab === 'messages' ? 'Inquiry Dashboard' : adminTab === 'content' ? 'Website Editor' : 'Performance Analytics'}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {isActionPending && (
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-[#58a6ff] text-[10px] font-bold uppercase tracking-widest mr-4 font-mono"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#58a6ff] animate-pulse"></div>
                Syncing...
              </motion.div>
            )}
            <div className="flex bg-[#161b22] border border-[#30363d] p-1 rounded-xl">
              <button 
                onClick={() => setAdminTab('messages')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest admin-glow ${adminTab === 'messages' ? 'bg-[#21262d] text-white border border-[#30363d]' : 'text-[#8b949e] hover:text-white border border-transparent'}`}
              >
                <Mail size={12} /> Messages
              </button>
              <button 
                onClick={() => setAdminTab('content')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest admin-glow ${adminTab === 'content' ? 'bg-[#21262d] text-white border border-[#30363d]' : 'text-[#8b949e] hover:text-white border border-transparent'}`}
              >
                <Edit2 size={12} /> Content
              </button>
              <button 
                onClick={() => setAdminTab('performance')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest admin-glow ${adminTab === 'performance' ? 'bg-[#21262d] text-white border border-[#30363d]' : 'text-[#8b949e] hover:text-white border border-transparent'}`}
              >
                <Activity size={12} /> Performance
              </button>
            </div>
            <button 
              onClick={handleAdminLogout} 
              disabled={isLoggingIn}
              className="p-3 bg-[#21262d] border border-[#30363d] text-[#8b949e] hover:text-white hover:border-[#8b949e] rounded-xl admin-glow disabled:opacity-50"
            >
              <LogOut size={18} className={isLoggingIn ? "animate-pulse" : ""} />
            </button>
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
                      alert("Admin status verified. Refreshing permissions.");
                    } catch (err) {
                      console.error("Self-promotion failed", err);
                      alert("Verification failed. Check Firestore rules.");
                    } finally {
                      setIsActionPending(false);
                    }
                  }
                }}
                className="px-6 py-3 bg-[#A67C00] text-white font-bold rounded-xl hover:bg-[#8A6600] transition-all text-[10px] uppercase tracking-widest shadow-lg shadow-amber-600/20 flex items-center gap-2"
              >
                <Shield size={16} /> Verify
              </button>
            )}
          </div>
        </div>

        {adminTab === 'messages' ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 flex flex-row lg:flex-col gap-4 w-full">
              <div className="bg-[#161b22] p-5 rounded-xl border border-[#30363d] shadow-sm flex-1 lg:flex-none">
                <div className="text-[9px] font-bold text-[#8b949e] uppercase tracking-widest mb-1.5 font-mono">Total Inquiries</div>
                <div className="text-2xl md:text-3xl font-extrabold text-white">{adminMessages.length}</div>
              </div>
              <div className="bg-[#58a6ff]/5 p-5 rounded-xl border border-[#58a6ff]/20 shadow-sm flex-1 lg:flex-none">
                <div className="text-[9px] font-bold text-[#58a6ff] uppercase tracking-widest mb-1.5 font-mono">New Messages</div>
                <div className="text-2xl md:text-3xl font-extrabold text-white">{adminMessages.filter(m => m.status === 'unread').length}</div>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-4">
              {adminMessages.length === 0 ? (
                <div className="bg-[#161b22]/50 border border-[#30363d] border-dashed rounded-2xl p-12 md:p-20 text-center">
                  <div className="w-14 h-14 bg-[#161b22] border border-[#30363d] text-[#8b949e] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1.5">No messages yet</h3>
                  <p className="text-[#8b949e] text-xs font-light max-w-sm mx-auto leading-relaxed">Submissions from the contact form will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {adminMessages.map((msg) => (
                    <motion.div 
                      key={msg.id}
                      layoutId={msg.id}
                      onClick={() => setSelectedAdminMessage(msg)}
                      className={`group relative bg-[#161b22] border rounded-xl p-5 md:px-6 cursor-pointer admin-glow overflow-hidden ${msg.status === 'unread' ? 'border-[#58a6ff]/40 shadow-md bg-[#58a6ff]/2' : 'border-[#30363d]'}`}
                    >
                      {msg.status === 'unread' && (
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#58a6ff]" />
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-3">
                          <div className="flex flex-col">
                            <span className="text-[7px] font-black text-[#58a6ff] uppercase tracking-[0.3em] mb-1 opacity-80 group-hover:opacity-100 transition-opacity font-mono">
                              {msg.service || 'General'}
                            </span>
                            <h4 className="text-sm font-bold text-white group-hover:text-[#58a6ff] transition-colors duration-300 truncate">
                              {msg.name}
                            </h4>
                            <span className="text-[9px] text-[#8b949e] font-medium uppercase tracking-widest mt-0.5 font-mono truncate">
                              {msg.company || 'Private'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="md:col-span-6 lg:col-span-7">
                          <div className="border-l border-[#30363d] pl-4 md:pl-6">
                            <p className="text-[#8b949e] text-[11px] font-light leading-relaxed line-clamp-1 italic opacity-80 group-hover:opacity-100 transition-opacity">
                              {msg.message}
                            </p>
                          </div>
                        </div>

                        <div className="md:col-span-3 lg:col-span-2 flex items-center justify-between md:justify-end gap-5">
                          <div className="flex flex-col items-end shrink-0 font-mono">
                            <span className="text-[9px] font-bold text-[#c9d1d9] tabular-nums tracking-tighter">
                              {msg.createdAt?.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                            <span className="text-[8px] text-[#8b949e] font-semibold uppercase tracking-tighter">
                              {msg.createdAt?.toDate().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                            </span>
                          </div>
                          <div className="w-7 h-7 rounded-full bg-[#21262d] border border-[#30363d] text-[#8b949e] flex items-center justify-center transition-all duration-300 group-hover:bg-[#58a6ff] group-hover:text-white group-hover:border-transparent shrink-0">
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
          <div className="space-y-8">
            {/* Website Content Management */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-[#58a6ff]/10 border border-[#30363d] rounded-xl flex items-center justify-center text-[#58a6ff]">
                  <Globe size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Website Content</h3>
                  <p className="text-xs text-[#8b949e] font-light">Update text across the entire public site.</p>
                </div>
              </div>

              <div className="space-y-8">
                {/* Hero Section Editor */}
                <div className="p-6 md:p-8 bg-[#0d1117] rounded-xl border border-[#30363d]">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#58a6ff] mb-6 flex items-center gap-2 font-mono">
                    <Zap size={14} /> Hero Section
                  </h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-[8px] font-extrabold uppercase tracking-widest text-[#8b949e] px-1 font-mono">Badge Text</label>
                      <input 
                        value={websiteConfig.hero.badge}
                        onChange={(e) => updateConfig({ ...websiteConfig, hero: { ...websiteConfig.hero, badge: e.target.value }})}
                        className="w-full bg-[#161b22] border border-[#30363d] rounded-xl px-4 py-3 text-sm text-white outline-none admin-glow placeholder-[#8b949e]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[8px] font-extrabold uppercase tracking-widest text-[#8b949e] px-1 font-mono">Main Heading (HTML allowed)</label>
                      <input 
                        value={websiteConfig.hero.heading}
                        onChange={(e) => updateConfig({ ...websiteConfig, hero: { ...websiteConfig.hero, heading: e.target.value }})}
                        className="w-full bg-[#161b22] border border-[#30363d] rounded-xl px-4 py-3 text-sm text-white outline-none admin-glow placeholder-[#8b949e]"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="block text-[8px] font-extrabold uppercase tracking-widest text-[#8b949e] px-1 font-mono">Subheading</label>
                      <textarea 
                        rows={3}
                        value={websiteConfig.hero.subheading}
                        onChange={(e) => updateConfig({ ...websiteConfig, hero: { ...websiteConfig.hero, subheading: e.target.value }})}
                        className="w-full bg-[#161b22] border border-[#30363d] rounded-xl px-4 py-3 text-sm text-white outline-none admin-glow resize-none placeholder-[#8b949e]"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-3">
                      <label className="block text-[8px] font-extrabold uppercase tracking-widest text-[#8b949e] px-1 font-mono">Hero Statistics</label>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {websiteConfig.hero.stats?.map((stat: any, i: number) => (
                           <div key={i} className="space-y-2 p-3 bg-[#161b22] border border-[#30363d] rounded-xl relative group admin-glow">
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
                              className="w-full text-lg font-extrabold outline-none text-white bg-transparent font-sans"
                            />
                            <button 
                              onClick={() => {
                                const newStats = websiteConfig.hero.stats.filter((_: any, idx: number) => idx !== i);
                                updateConfig({ ...websiteConfig, hero: { ...websiteConfig.hero, stats: newStats }});
                              }}
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#21262d] text-[#8b949e] hover:text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-[#30363d]"
                            >
                              <X size={8} />
                            </button>
                          </div>
                        ))}
                        <button 
                          onClick={() => {
                            const newStats = [...(websiteConfig.hero.stats || []), { label: "New Stat", value: "0" }];
                            updateConfig({ ...websiteConfig, hero: { ...websiteConfig.hero, stats: newStats }});
                          }}
                          className="border border-dashed border-[#30363d] rounded-xl flex items-center justify-center text-[#8b949e] hover:text-white p-4 bg-transparent admin-glow"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Theme Configuration */}
                <div className="p-6 md:p-8 bg-[#0d1117] rounded-xl border border-[#30363d]">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#58a6ff] mb-6 flex items-center gap-2 font-mono">
                    <Settings size={14} /> Theme & Colors
                  </h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-[8px] font-extrabold uppercase tracking-widest text-[#8b949e] px-1 font-mono">Primary Color (Hex)</label>
                      <div className="flex gap-4">
                        <input 
                          type="color"
                          value={websiteConfig.colors?.primary || '#58a6ff'}
                          onChange={(e) => updateConfig({ ...websiteConfig, colors: { ...websiteConfig.colors, primary: e.target.value }})}
                          className="w-12 h-12 rounded-lg border-none cursor-pointer bg-transparent admin-glow"
                        />
                        <input 
                          value={websiteConfig.colors?.primary || '#58a6ff'}
                          onChange={(e) => updateConfig({ ...websiteConfig, colors: { ...websiteConfig.colors, primary: e.target.value }})}
                          className="flex-1 bg-[#161b22] border border-[#30363d] rounded-xl px-4 py-3 text-sm text-white outline-none admin-glow"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[8px] font-extrabold uppercase tracking-widest text-[#8b949e] px-1 font-mono">Secondary Color (Hex)</label>
                      <div className="flex gap-4">
                        <input 
                          type="color"
                          value={websiteConfig.colors?.secondary || '#238636'}
                          onChange={(e) => updateConfig({ ...websiteConfig, colors: { ...websiteConfig.colors, secondary: e.target.value }})}
                          className="w-12 h-12 rounded-lg border-none cursor-pointer bg-transparent admin-glow"
                        />
                        <input 
                          value={websiteConfig.colors?.secondary || '#238636'}
                          onChange={(e) => updateConfig({ ...websiteConfig, colors: { ...websiteConfig.colors, secondary: e.target.value }})}
                          className="flex-1 bg-[#161b22] border border-[#30363d] rounded-xl px-4 py-3 text-sm text-white outline-none admin-glow"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* About Section Editor */}
                <div className="p-6 md:p-8 bg-[#0d1117] rounded-xl border border-[#30363d]">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#58a6ff] mb-6 flex items-center gap-2 font-mono">
                    <UserIcon size={14} /> About Section
                  </h4>
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-[8px] font-extrabold uppercase tracking-widest text-[#8b949e] px-1 font-mono">Badge Text</label>
                        <input 
                          value={websiteConfig.about.badge}
                          onChange={(e) => updateConfig({ ...websiteConfig, about: { ...websiteConfig.about, badge: e.target.value }})}
                          className="w-full bg-[#161b22] border border-[#30363d] rounded-xl px-4 py-3 text-sm text-white outline-none admin-glow placeholder-[#8b949e]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[8px] font-extrabold uppercase tracking-widest text-[#8b949e] px-1 font-mono">Heading (HTML allowed)</label>
                        <input 
                          value={websiteConfig.about.heading}
                          onChange={(e) => updateConfig({ ...websiteConfig, about: { ...websiteConfig.about, heading: e.target.value }})}
                          className="w-full bg-[#161b22] border border-[#30363d] rounded-xl px-4 py-3 text-sm text-white outline-none admin-glow placeholder-[#8b949e]"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[8px] font-extrabold uppercase tracking-widest text-[#8b949e] px-1 font-mono">Core Skills (Tags)</label>
                      <div className="flex flex-wrap gap-2">
                        {websiteConfig.about.skills?.map((skill: string, i: number) => (
                          <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-[#161b22] border border-[#30363d] rounded-full text-[10px] font-bold text-[#58a6ff] group font-mono admin-glow">
                            <span>{skill}</span>
                            <button 
                              onClick={() => {
                                const newSkills = websiteConfig.about.skills.filter((_: any, idx: number) => idx !== i);
                                updateConfig({ ...websiteConfig, about: { ...websiteConfig.about, skills: newSkills }});
                              }}
                              className="text-[#8b949e] hover:text-red-500 transition-colors"
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
                          className="px-3 py-1.5 border border-dashed border-[#30363d] rounded-full text-[10px] text-[#8b949e] hover:text-white font-mono admin-glow bg-transparent"
                        >
                          + Add Skill
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[8px] font-extrabold uppercase tracking-widest text-[#8b949e] px-1 font-mono">Content Paragraphs (HTML allowed)</label>
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
                              className="w-full bg-[#161b22] border border-[#30363d] rounded-xl px-4 py-3 text-sm text-white outline-none admin-glow resize-none placeholder-[#8b949e]"
                            />
                            <button 
                              onClick={() => {
                                const newParas = websiteConfig.about.paragraphs.filter((_: any, idx: number) => idx !== i);
                                updateConfig({ ...websiteConfig, about: { ...websiteConfig.about, paragraphs: newParas }});
                              }}
                              className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:text-red-400 transition-opacity bg-[#21262d] border border-[#30363d] rounded-md"
                            >
                              <Trash size={12} />
                            </button>
                          </div>
                        ))}
                        <button 
                          onClick={() => {
                            updateConfig({ ...websiteConfig, about: { ...websiteConfig.about, paragraphs: [...websiteConfig.about.paragraphs, "New paragraph content..."] }});
                          }}
                          className="w-full py-3 bg-transparent border border-dashed border-[#30363d] text-[#8b949e] hover:text-white rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all font-mono admin-glow"
                        >
                          + Add Paragraph
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Services Editor */}
                <div className="p-6 md:p-8 bg-[#0d1117] rounded-xl border border-[#30363d]">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#58a6ff] mb-6 flex items-center gap-2 font-mono">
                    <Layout size={14} /> Services Management
                  </h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    {websiteConfig.services.map((service: any, i: number) => (
                      <div key={i} className="p-6 bg-[#161b22] border border-[#30363d] rounded-xl space-y-4 admin-glow">
                        <div className="flex justify-between items-start">
                          <h5 className="text-xs font-bold text-white group-hover:text-[#58a6ff] transition-colors">{service.title}</h5>
                          <button 
                            onClick={() => {
                              const newServices = websiteConfig.services.filter((_: any, idx: number) => idx !== i);
                              updateConfig({ ...websiteConfig, services: newServices });
                            }}
                            className="p-1.5 text-red-500 hover:text-red-400 transition-colors bg-[#21262d] border border-[#30363d] rounded-md admin-glow"
                          >
                            <Trash size={12} />
                          </button>
                        </div>
                        <input 
                          value={service.title}
                          onChange={(e) => {
                            const newServices = [...websiteConfig.services];
                            newServices[i] = { ...service, title: e.target.value };
                            updateConfig({ ...websiteConfig, services: newServices });
                          }}
                          className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] text-white rounded-lg text-xs outline-none admin-glow"
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
                          className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] text-white rounded-lg text-xs resize-none outline-none admin-glow placeholder-[#8b949e]"
                          placeholder="Brief description"
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[8px] font-bold text-[#8b949e] uppercase tracking-widest font-mono">Why It Matters</label>
                            <textarea 
                              rows={2}
                              value={service.why || ''}
                              onChange={(e) => {
                                const newServices = [...websiteConfig.services];
                                newServices[i] = { ...service, why: e.target.value };
                                updateConfig({ ...websiteConfig, services: newServices });
                              }}
                              className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] text-white rounded-lg text-xs resize-none outline-none admin-glow placeholder-[#8b949e]"
                              placeholder="Strategic reason..."
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[8px] font-bold text-[#8b949e] uppercase tracking-widest font-mono">What We Do</label>
                            <textarea 
                              rows={2}
                              value={service.what || ''}
                              onChange={(e) => {
                                const newServices = [...websiteConfig.services];
                                newServices[i] = { ...service, what: e.target.value };
                                updateConfig({ ...websiteConfig, services: newServices });
                              }}
                              className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] text-white rounded-lg text-xs resize-none outline-none admin-glow placeholder-[#8b949e]"
                              placeholder="Action statement..."
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[8px] font-bold text-[#8b949e] uppercase tracking-widest font-mono">Outcome Statement</label>
                          <input 
                            value={service.outcome || ''}
                            onChange={(e) => {
                              const newServices = [...websiteConfig.services];
                              newServices[i] = { ...service, outcome: e.target.value };
                              updateConfig({ ...websiteConfig, services: newServices });
                            }}
                            className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] text-white rounded-lg text-xs outline-none admin-glow placeholder-[#8b949e]"
                            placeholder="Final result statement..."
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[8px] font-bold text-[#8b949e] uppercase tracking-widest font-mono">Actionable Items (Details)</label>
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
                                  className="flex-1 px-3 py-2 bg-[#0d1117] border border-[#30363d] text-white rounded-lg text-xs outline-none admin-glow"
                                />
                                <button 
                                  onClick={() => {
                                    const newDetails = service.details.filter((_: any, idx: number) => idx !== dIdx);
                                    const newServices = [...service.details];
                                    const updatedServices = [...websiteConfig.services];
                                    updatedServices[i] = { ...service, details: newDetails };
                                    updateConfig({ ...websiteConfig, services: updatedServices });
                                  }}
                                  className="p-1 px-2.5 text-red-500 hover:text-red-400 bg-[#21262d] border border-[#30363d] rounded-md transition-colors admin-glow"
                                >
                                  <X size={10} />
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
                              className="w-full py-2 border border-dashed border-[#30363d] rounded-lg text-[9px] text-[#8b949e] hover:text-white transition-colors bg-transparent font-mono admin-glow"
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
                      className="md:col-span-2 py-6 border border-dashed border-[#30363d] text-[#8b949e] hover:text-white hover:bg-[#161b22]/45 rounded-xl flex flex-col items-center justify-center gap-2 transition-all admin-glow"
                    >
                      <Plus size={20} />
                      <span className="text-[9px] font-bold uppercase tracking-widest font-mono">Add New Service</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Portfolio Projects Management */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 md:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#58a6ff]/10 border border-[#30363d] rounded-xl flex items-center justify-center text-[#58a6ff]">
                    <Shield size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Portfolio Inventory</h3>
                    <p className="text-xs text-[#8b949e] font-light">Manage your highlight cases and live demos.</p>
                  </div>
                </div>
                <button 
                  onClick={handleAddProject}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-[#238636] border border-[#2ea44f] text-white rounded-lg text-xs font-semibold hover:bg-[#2eaa44] admin-glow justify-center shrink-0"
                >
                  <Plus size={14} /> New Project
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {isProjectsLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={`admin-project-skeleton-${i}`} className="flex items-center gap-4 p-4 bg-[#0d1117]/50 border border-[#30363d]/50 rounded-xl animate-pulse">
                      <div className="w-12 h-12 bg-[#21262d] border border-[#30363d]/40 rounded-lg shrink-0" />
                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="h-2 w-16 bg-[#30363d]/60 rounded" />
                        <div className="h-4 w-32 bg-[#30363d]/60 rounded" />
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <div className="w-8 h-8 rounded-lg bg-[#21262d]" />
                        <div className="w-8 h-8 rounded-lg bg-[#21262d]" />
                      </div>
                    </div>
                  ))
                ) : projects.length === 0 ? (
                  <div className="col-span-2 py-8 text-center text-xs text-[#8b949e]">
                    No projects found in collection.
                  </div>
                ) : (
                  projects.map((project, i) => (
                    <div key={project.id} className="group flex items-center gap-4 p-4 bg-[#0d1117] border border-[#30363d] rounded-xl admin-glow">
                      <div className="w-12 h-12 bg-[#21262d] border border-[#30363d] rounded-lg flex items-center justify-center text-[#58a6ff] shrink-0">
                        {getProjectIcon(project.iconType, 20)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[8px] font-bold text-[#8b949e] uppercase tracking-[0.2em] mb-0.5 font-mono">{project.category}</div>
                        <h4 className="text-sm font-bold text-white truncate">{project.title}</h4>
                      </div>
                      <div className="flex items-center gap-1.5">
                         <button onClick={() => handleEditProject(project)} className="p-1.5 text-[#8b949e] hover:text-[#58a6ff] hover:bg-[#21262d] border border-[#30363d] rounded-lg admin-glow"><Edit2 size={14} /></button>
                         <button onClick={(e) => handleDeleteProject(e, project.id)} className="p-1.5 text-[#8b949e] hover:text-red-400 hover:bg-[#21262d] border border-[#30363d] rounded-lg admin-glow"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Client Testimonials Management */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 md:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#58a6ff]/10 border border-[#30363d] rounded-xl flex items-center justify-center text-[#58a6ff]">
                    <MessageSquare size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Client Testimonials</h3>
                    <p className="text-xs text-[#8b949e] font-light">Manage customer quotes and reviews shown on the landing page.</p>
                  </div>
                </div>
                <button 
                  onClick={handleAddTestimonial}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-[#238636] border border-[#2ea44f] text-white rounded-lg text-xs font-semibold hover:bg-[#2eaa44] admin-glow justify-center shrink-0"
                >
                  <Plus size={14} /> New Testimonial
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {adminTestimonials.map((item) => (
                  <div key={item.id} className="group flex items-start gap-4 p-4 bg-[#0d1117] border border-[#30363d] rounded-xl admin-glow">
                    {item.avatarUrl ? (
                      <img 
                        src={item.avatarUrl} 
                        alt={item.author}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full border border-[#30363d] object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full border border-[#30363d] bg-[#21262d] flex items-center justify-center text-[#58a6ff] shrink-0 font-mono text-xs">
                        {item.author.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <cite className="not-italic text-xs font-bold text-white">{item.author}</cite>
                        <span className="text-[10px] text-[#8b949e] font-light">· {item.company || item.title}</span>
                      </div>
                      <p className="text-[#8b949e] text-xs line-clamp-2 leading-relaxed mb-2">"{item.quote}"</p>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: item.rating || 5 }).map((_, rIdx) => (
                          <Star key={rIdx} size={10} className="text-amber-400 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 self-center">
                       <button onClick={() => handleEditTestimonial(item)} className="p-1.5 text-[#8b949e] hover:text-[#58a6ff] hover:bg-[#21262d] border border-[#30363d] rounded-lg admin-glow"><Edit2 size={12} /></button>
                       <button onClick={(e) => handleDeleteTestimonial(e, item.id)} className="p-1.5 text-[#8b949e] hover:text-red-400 hover:bg-[#21262d] border border-[#30363d] rounded-lg admin-glow"><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
                {adminTestimonials.length === 0 && (
                  <div className="md:col-span-2 py-8 text-center text-xs text-[#8b949e] border border-dashed border-[#30363d] rounded-xl">
                    No testimonials found. Click "New Testimonial" or wait for default seeding.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <AdminPerformanceDashboard />
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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-[#161b22] border border-[#30363d] w-full max-w-2xl rounded-[2rem] overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[90vh]"
          >
            <div className="p-6 md:p-10 overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="text-[#58a6ff] text-[10px] font-bold uppercase tracking-[0.3em] mb-3 font-mono">Inquiry Details</div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">From <span className="italic text-[#58a6ff]">{message.name}</span></h2>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2.5 bg-[#21262d] border border-[#30363d] text-[#8b949e] hover:text-white rounded-xl transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div>
                    <div className="text-[9px] font-bold text-[#8b949e] uppercase tracking-widest mb-1.5 font-mono">Email Address</div>
                    <div className="flex items-center gap-3 text-white font-medium text-sm">
                      <Mail size={14} className="text-[#8b949e]" />
                      {message.email}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-[#8b949e] uppercase tracking-widest mb-1.5 font-mono">Company / Organization</div>
                    <div className="flex items-center gap-3 text-white font-medium text-sm">
                      <Globe size={14} className="text-[#8b949e]" />
                      {message.company || 'Not provided'}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-[9px] font-bold text-[#8b949e] uppercase tracking-widest mb-1.5 font-mono">Selected Service</div>
                    <div className="flex items-center gap-3 text-white font-medium text-sm">
                      <Settings size={14} className="text-[#8b949e]" />
                      {message.service}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-[#8b949e] uppercase tracking-widest mb-1.5 font-mono">Date Received</div>
                    <div className="flex items-center gap-3 text-[#c9d1d9] font-medium text-sm">
                      <Clock size={14} className="text-[#8b949e]" />
                      {message.createdAt?.toDate().toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-[9px] font-bold text-[#8b949e] uppercase tracking-widest mb-1 font-mono">Full Message</div>
                <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-5 text-[#c9d1d9] leading-relaxed text-sm font-light whitespace-pre-wrap">
                  {message.message}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[#30363d] flex flex-wrap gap-4">
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
                    className="px-6 py-3 bg-[#238636] border border-[#2ea44f] text-white rounded-lg hover:bg-[#2eaa44] transition-all text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 disabled:opacity-70"
                  >
                    <Check size={12} className={isActionPending ? "animate-pulse" : ""} /> {isActionPending ? "Updating..." : "Mark as Read"}
                  </button>
                )}
                <button 
                  disabled={isActionPending}
                  onClick={async () => {
                    if (window.confirm("Are you sure you want to delete this message?")) {
                      setIsActionPending(true);
                      try {
                        await deleteDoc(doc(db, 'messages', message.id));
                        onClose();
                      } finally {
                        setIsActionPending(false);
                      }
                    }
                  }}
                  className="px-6 py-3 bg-transparent border border-red-500/20 text-red-500 rounded-lg hover:bg-red-500/10 transition-all text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 disabled:opacity-75"
                >
                  <Trash size={12} className={isActionPending ? "animate-pulse" : ""} /> {isActionPending ? "Deleting..." : "Delete Inquiry"}
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
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12 backdrop-blur-xl bg-black/60"
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="w-[95vw] sm:w-[90vw] md:w-full md:max-w-4xl max-h-[92vh] bg-[#161b22] border border-[#30363d] rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden relative flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-[#30363d] transition-colors z-20 bg-[#21262d] border border-[#30363d]"
            >
              <X size={18} className="text-[#8b949e] hover:text-white" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] h-full overflow-hidden">
              <div className="p-6 sm:p-10 md:p-14 bg-[#0d1117] flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-[#30363d] shrink-0">
                <div className="text-center w-full">
                  <div className="mb-6 md:mb-10 w-16 h-16 md:w-28 md:h-28 mx-auto flex items-center justify-center bg-[#161b22] rounded-2xl shadow-md border border-[#30363d]">
                    {React.cloneElement(service.icon, { size: 36, className: "md:w-14 md:h-14 text-[#58a6ff]", strokeWidth: 1.2 })}
                  </div>
                  <h3 className="text-xl md:text-3xl font-extrabold text-white mb-3 md:mb-4 tracking-tight uppercase font-sans">{service.title}</h3>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#161b22] border border-[#30363d] text-[#8b949e] text-[10px] md:text-[11px] font-bold uppercase tracking-widest shadow-sm">
                    <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Ready for deployment
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-10 md:p-16 bg-[#161b22] overflow-y-auto custom-scrollbar">
                <div className="space-y-10 md:space-y-12">
                  <div className="relative">
                    <div className="flex items-center gap-3 text-[#58a6ff] text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] mb-4 md:mb-6">
                       <div className="w-4 md:w-6 h-[1px] bg-[#30363d]"></div>
                       The Strategy
                    </div>
                    <p className="text-white text-lg md:text-2xl leading-tight font-medium tracking-tight">
                      {service.why}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 text-[#58a6ff] text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] mb-4 md:mb-6">
                       <div className="w-4 md:w-6 h-[1px] bg-[#30363d]"></div>
                       Actionable Items
                    </div>
                    <p className="text-[#8b949e] text-sm md:text-base leading-relaxed mb-8 md:mb-10 font-light">
                      {service.desc}
                    </p>
                    <ul className="grid grid-cols-1 gap-3 md:gap-4">
                      {service.details?.map((detail: string, i: number) => (
                        <li key={i} className="flex gap-4 md:gap-5 items-start p-4 md:p-5 rounded-xl border border-[#30363d] hover:border-[#58a6ff]/50 hover:bg-[#161b22] transition-all group">
                          <CheckCircle size={16} className="text-[#238636] mt-1 shrink-0 group-hover:scale-110 transition-transform" />
                          <span className="text-[#c9d1d9] text-sm md:text-[15px] font-medium leading-relaxed">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-8 md:pt-10 border-t border-[#30363d] flex flex-col sm:flex-row items-center justify-between gap-6 md:gap-8">
                    <div className="flex items-center gap-4 self-start sm:self-center">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-[#58a6ff]/10 border border-[#58a6ff]/20 flex items-center justify-center text-[#58a6ff] font-bold text-xs md:text-sm shadow-sm font-mono">NK</div>
                      <div>
                        <div className="text-[#8b949e] text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] leading-none mb-1.5">Final Delivery</div>
                        <div className="text-white text-xs md:text-sm font-bold tracking-tight uppercase font-sans">{service.outcome || "Optimized efficiency."}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        onClose();
                        const element = document.getElementById('contact');
                        if (element) element.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full sm:w-auto px-6 md:px-8 py-3 bg-[#238636] hover:bg-[#2eaa44] border border-[#2ea44f] text-white text-[11px] md:text-xs font-bold rounded-lg transition-all uppercase tracking-wide"
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
          <div className="absolute inset-0 [backface-visibility:hidden] p-8 md:p-10 bg-[#161b22]/50 border border-[#30363d] rounded-3xl flex flex-col items-center justify-center text-center backdrop-blur-sm hover:border-[#58a6ff]/50 hover:shadow-[0_0_15px_rgba(88,166,255,0.1)] transition-all">
            <div className="mb-6 w-14 h-14 flex items-center justify-center bg-[#58a6ff]/5 rounded-2xl group-hover:bg-[#58a6ff]/10 transition-all border border-[#30363d]/50">
              {React.cloneElement(service.icon, { className: "text-[#58a6ff]" })}
            </div>
            <h3 className="text-xl font-bold text-white mb-2 tracking-tight">{service.title}</h3>
            <p className="text-[#8b949e] text-xs leading-relaxed font-light">{service.desc}</p>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
              className="mt-8 flex items-center gap-2 text-[9px] font-bold text-[#58a6ff] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity bg-transparent"
            >
              Why / What <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Back */}
          <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] p-8 md:p-10 bg-[#161b22] border border-[#30363d] rounded-3xl flex flex-col justify-center backdrop-blur-md">
             <div className="mb-6">
               <div className="text-[#58a6ff] text-[9px] font-bold uppercase tracking-[0.2em] mb-2 font-sans">Why It Matters</div>
               <p className="text-[#8b949e] text-xs leading-relaxed font-light">{service.why}</p>
             </div>
             <div className="mb-6">
               <div className="text-[#58a6ff] text-[9px] font-bold uppercase tracking-[0.2em] mb-2 font-sans">What We Do</div>
               <p className="text-[#c9d1d9] text-xs leading-relaxed font-medium line-clamp-2">{service.what}</p>
             </div>
             <button 
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
              className="mt-2 text-[9px] font-bold text-[#58a6ff] uppercase tracking-widest flex items-center gap-2 hover:text-[#79c0ff] transition-colors"
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
      case 'message': return <MessageSquare size={size} className="text-[#58a6ff]/30" />;
      case 'eye': return <Eye size={size} className="text-[#58a6ff]/30" />;
      case 'layout': return <Layout size={size} className="text-[#58a6ff]/30" />;
      case 'chart': return <BarChart3 size={size} className="text-[#58a6ff]/30" />;
      default: return <Zap size={size} className="text-[#58a6ff]/30" />;
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
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
         <div className="flex flex-col items-center gap-4">
           <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 border-2 border-[#30363d] border-t-[#58a6ff] rounded-full shadow-sm"
            />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#8b949e] font-mono animate-pulse">Initializing Studio</span>
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
      className="min-h-screen bg-transparent text-[#c9d1d9] font-sans selection:bg-[#58a6ff]/30 selection:text-white overflow-x-hidden"
      style={{ 
        '--color-primary': websiteConfig?.colors?.primary || '#58a6ff',
        '--color-secondary': websiteConfig?.colors?.secondary || '#2f81f7'
      } as any}
    >
      {currentUser?.email === 'nishkalya@gmail.com' && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-[#161b22] text-white text-[9px] font-bold uppercase tracking-[0.3em] h-8 flex items-center justify-center gap-6 border-b border-[#30363d]">
          <div className="flex items-center gap-2 text-[#58a6ff]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#58a6ff] animate-pulse"></div>
            Admin View
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setCurrentView('admin')} 
              className={`hover:text-[#58a6ff] transition-colors ${currentView === 'admin' ? 'text-[#58a6ff]' : 'text-zinc-400'}`}
            >
              Management Console
            </button>
            <div className="w-px h-3 bg-zinc-800"></div>
            <button 
              onClick={() => { setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
              className={`hover:text-[#58a6ff] transition-colors ${currentView === 'home' ? 'text-[#58a6ff]' : 'text-zinc-400'}`}
            >
              Public Preview
            </button>
          </div>
        </div>
      )}
      <ServiceModal service={selectedService} onClose={() => setSelectedService(null)} />
      <AdminMessageModal message={selectedAdminMessage} onClose={() => setSelectedAdminMessage(null)} />
      
      {/* Ambient Background Accents */}
      <div className={`fixed top-[-10%] right-[-10%] w-[800px] h-[800px] bg-[#58a6ff]/3 rounded-full blur-[140px] pointer-events-none z-0 ${currentUser?.email === 'nishkalya@gmail.com' ? 'translate-y-8' : ''}`}></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#238636]/2 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* Navigation */}
      <nav className={`fixed left-0 right-0 z-50 bg-[#0d1117]/80 backdrop-blur-md border-b border-[#30363d] transition-all duration-300 ${currentUser?.email === 'nishkalya@gmail.com' ? 'top-8' : 'top-0'}`}>
        <div className="flex items-center justify-between px-6 md:px-12 py-4 w-full max-w-7xl mx-auto">
          <div 
            className="flex items-center space-x-2 group cursor-pointer" 
            onClick={() => { setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            role="button"
            aria-label="Go to home"
          >
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center transform rotate-12 group-hover:rotate-0 transition-transform duration-500 shadow-md border border-[#30363d]"
              style={{ backgroundColor: '#161b22' }}
            >
              <span className="text-[#58a6ff] font-extrabold text-sm font-mono">N</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-white uppercase font-sans">Nishkalya</span>
          </div>
          <div className="hidden sm:flex space-x-8 text-[11px] font-semibold tracking-[0.05em] text-[#8b949e] uppercase flex-wrap justify-center">
            <button aria-label="Home" onClick={() => { setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`hover:text-white transition-colors ${currentView === 'home' ? 'text-white border-b-2 border-[#58a6ff] pb-1' : ''}`}>Home</button>
            <button aria-label="About" onClick={() => scrollToSection('about')} className="hover:text-white transition-colors pb-1">About</button>
            <button aria-label="Services" onClick={() => scrollToSection('services')} className="hover:text-white transition-colors pb-1">Services</button>
            <button aria-label="Projects" onClick={() => { setCurrentView('projects'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`hover:text-white transition-colors ${currentView === 'projects' ? 'text-white border-b-2 border-[#58a6ff] pb-1' : ''}`}>Projects</button>
            <button aria-label="Contact" onClick={() => scrollToSection('contact')} className="hover:text-white transition-colors pb-1">Contact</button>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => scrollToSection('contact')}
              className="hidden sm:block px-4 py-1.5 bg-[#21262d] border border-[#30363d] hover:bg-[#30363d] hover:border-[#8b949e] transition-all text-xs font-semibold rounded-lg text-[#c9d1d9]"
            >
              Get Started
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 text-[#8b949e] hover:text-white transition-colors"
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
              className="sm:hidden bg-[#161b22] border-b border-[#30363d] overflow-hidden"
            >
              <div className="p-8 flex flex-col gap-6 text-xs font-medium uppercase text-[#8b949e] text-center">
                <button onClick={() => { setCurrentView('home'); setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white py-2">Home</button>
                <button onClick={() => scrollToSection('about')} className="hover:text-[#58a6ff] py-2">About</button>
                <button onClick={() => scrollToSection('services')} className="hover:text-[#58a6ff] py-2">Services</button>
                <button onClick={() => { setCurrentView('projects'); setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white py-2">Projects</button>
                <button onClick={() => scrollToSection('contact')} className="hover:text-[#58a6ff] py-2">Contact</button>
                <button 
                  onClick={() => scrollToSection('contact')}
                  className="mt-4 w-full py-3 bg-[#238636] hover:bg-[#2eaa44] text-white border border-[#2ea44f] rounded-lg text-xs tracking-wide font-bold"
                >
                  Start a Project
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content Area */}
      <main id="main-content" className="flex-grow">
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
                  className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full mb-6 md:mb-8 bg-[#161b22] border border-[#30363d]"
                >
                  <span 
                    className="w-2 h-2 rounded-full animate-pulse bg-[#58a6ff]"
                  ></span>
                  <span 
                    className="text-[9px] md:text-[10px] font-semibold text-[#8b949e] uppercase tracking-[0.2em]"
                  >
                    {websiteConfig?.hero?.badge}
                  </span>
                </motion.div>
                
                <h1 
                  className="text-3xl sm:text-6xl md:text-8xl font-extrabold leading-[1.2] md:leading-[1.1] text-white mb-6 md:mb-8 tracking-tight px-4 md:px-0" 
                >
                  <MotionHeading html={websiteConfig?.hero?.heading} />
                </h1>
                
                <motion.p 
                  variants={itemVariants}
                  className="text-base md:text-lg text-[#8b949e] max-w-2xl mx-auto leading-relaxed font-light mb-10 md:mb-12 px-2 md:px-0"
                >
                  {websiteConfig?.hero?.subheading}
                </motion.p>
      
                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center gap-4 md:gap-5 px-6 sm:px-0">
                  <button 
                    onClick={() => setCurrentView('projects')}
                    className="w-full sm:w-auto px-6 py-3.5 bg-[#238636] hover:bg-[#2eaa44] border border-[#2ea44f] text-white font-semibold rounded-lg transition-all duration-300 text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#238636]/10 group"
                    aria-label="View our portfolio projects and work showcase"
                  >
                    View Our Work <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button 
                    onClick={() => scrollToSection('contact')}
                    className="w-full sm:w-auto px-6 py-3.5 bg-[#21262d] border border-[#30363d] text-[#c9d1d9] font-semibold rounded-lg hover:bg-[#30363d] hover:border-[#8b949e] transition-all duration-300 text-xs"
                    aria-label="Scroll to the contact section to submit a project inquiry"
                  >
                    Start a Project
                  </button>
                </motion.div>
      
                {/* Stats Bar */}
                <motion.div 
                  variants={itemVariants}
                  className="grid grid-cols-2 md:grid-cols-4 gap-y-10 md:gap-16 mt-20 md:mt-24 py-10 border-y border-[#30363d]/50"
                >
                  {websiteConfig?.hero?.stats?.map((stat: any, i: number) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className="text-2xl md:text-3xl font-semibold text-white tracking-tighter mb-1 font-mono">{stat.value}</div>
                      <div className="text-[9px] text-[#8b949e] uppercase tracking-[0.2em] font-medium whitespace-nowrap">{stat.label}</div>
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
                    className="text-[9px] md:text-[10px] font-bold text-[#58a6ff] uppercase tracking-[0.3em] mb-4"
                  >
                    {websiteConfig?.about?.badge}
                  </div>
                  <h2 className="text-4xl md:text-5xl font-extrabold leading-tight text-white mb-6 md:mb-8">
                    <MotionHeading html={websiteConfig?.about?.heading} delay={0.1} whileInView={true} />
                  </h2>
                  
                  <div className="space-y-6 mb-10">
                    {websiteConfig?.about?.paragraphs?.slice(0, 2).map((p: string, i: number) => (
                      <p key={i} className="text-[#8b949e] text-base md:text-lg leading-relaxed font-light">
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
                            <p key={i} className="text-[#8b949e] text-base md:text-lg leading-relaxed font-light">
                              <span dangerouslySetInnerHTML={{ __html: p }} />
                            </p>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <button 
                      onClick={() => setShowFullAbout(!showFullAbout)}
                      className="text-[11px] font-semibold text-[#58a6ff] hover:text-[#79c0ff] transition-colors flex items-center gap-1.5 group/btn"
                      aria-label={showFullAbout ? "Read less about our corporate history and profile" : "Read more about our corporate history and profile"}
                      aria-expanded={showFullAbout}
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
                      <span key={i} className="px-3 py-1 bg-[#161b22] border border-[#30363d] text-[11px] font-medium text-[#c9d1d9] rounded-md transition-all hover:border-[#58a6ff]/50">
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
                  <div className="aspect-square bg-[#161b22]/55 rounded-2xl overflow-hidden border border-[#30363d] flex items-center justify-center relative hover:border-[#58a6ff]/30 transition-all shadow-xl group">
                     <Cpu size={80} className="md:size-[120px] text-[#58a6ff]/10 absolute animate-pulse" />
                     <div className="text-center p-8 md:p-12 relative z-10">
                        <div className="text-5xl md:text-6xl font-extrabold text-white mb-2 font-mono tracking-tighter">01</div>
                        <div className="text-[10px] md:text-xs text-[#58a6ff] tracking-[0.3em] uppercase font-semibold">Innovation first</div>
                     </div>
                  </div>
                  <div className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 p-5 md:p-6 bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl z-20 hover:border-[#58a6ff]/20 transition-all">
                     <div className="text-xl md:text-2xl font-semibold text-white mb-1 font-mono">2025</div>
                     <div className="text-[9px] text-[#8b949e] uppercase tracking-wider font-semibold">Future Ready</div>
                  </div>
                </motion.div>
              </div>
            </section>
      
            <section id="services" className="py-20 md:py-32 px-6 md:px-12 bg-[#161b22]/30 border-y border-[#30363d] relative">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 md:mb-20">
                  <div className="text-[#58a6ff] text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] mb-4">What We Do</div>
                  <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
                    <MotionHeading html="Services Built for <span class='italic text-[#58a6ff]'>Tomorrow</span>" whileInView={true} />
                  </h2>
                  <p className="text-[#8b949e] max-w-2xl mx-auto text-sm md:text-base font-light">From AI strategy to shipped product, we cover every layer of the modern digital stack.</p>
                </div>
      
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                  {websiteConfig?.services?.map((service: any, i: number) => {
                    const icons: any = {
                      "AI Product Development": <Zap className="text-[#58a6ff]" />,
                      "UI/UX Design Systems": <Layout className="text-[#58a6ff]" />,
                      "LLM Integration": <MessageSquare className="text-[#58a6ff]" />,
                      "Computer Vision": <Eye className="text-[#58a6ff]" />,
                      "Data Intelligence": <BarChart3 className="text-[#58a6ff]" />,
                      "Web & App Development": <Globe className="text-[#58a6ff]" />
                    };
                    return (
                      <ServiceCard key={i} service={{ ...service, icon: icons[service.title] || <Zap className="text-[#58a6ff]" /> }} index={i} onSelect={() => setSelectedService({ ...service, icon: icons[service.title] || <Zap className="text-[#58a6ff]" /> })} />
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
                <div className="text-[#58a6ff] text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] mb-4">
                  Begin your project
                </div>
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl md:text-6xl font-extrabold text-white"
                >
                  Pure <span className="italic text-[#58a6ff]">Innovation.</span>
                </motion.h1>
              </div>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-6"
              >
                <p className="text-[#8b949e] max-w-md text-sm leading-relaxed">A specialized gallery of our most impactful work in AI, Design, and Engineering.</p>
              </motion.div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {isProjectsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div 
                    key={`project-skeleton-${i}`}
                    className="aspect-[4/5] bg-[#161b22]/40 border border-[#30363d]/50 rounded-3xl p-8 flex flex-col justify-end relative overflow-hidden animate-pulse"
                  >
                    {/* Subtle decorative placeholder background */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117]/85 to-transparent z-0"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#30363d]/40 rounded-2xl flex items-center justify-center border border-[#30363d]/30 text-zinc-700">
                      <Activity size={24} />
                    </div>
                    
                    <div className="relative z-10 space-y-3">
                      {/* Category banner */}
                      <div className="h-3 w-1/3 bg-[#30363d]/60 rounded-md" />
                      {/* Title banner */}
                      <div className="h-6 w-3/4 bg-[#30363d]/60 rounded-md" />
                    </div>
                  </div>
                ))
              ) : projects.length === 0 ? (
                <div className="col-span-full py-20 text-center">
                  <Activity className="text-zinc-600 mx-auto mb-4" size={32} />
                  <p className="text-[#8b949e] text-sm">No innovative showcase items recorded yet.</p>
                </div>
              ) : (
                projects.map((project, i) => (
                  <ProjectCard 
                    key={project.id}
                    project={project}
                    index={i}
                    setHoveredProject={setHoveredProject}
                    onClick={() => {
                      if (project.link) {
                        setSelectedProjectForPreview(project);
                        setIsFlipped(false);
                        setActivePreviewUrl(project.link);
                        setIsIframeLoading(true);
                        setShowFullPreview(false);
                      }
                    }}
                  />
                ))
              )}
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
                    className="w-full bg-[#050507] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white outline-none admin-glow"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Category (Tags)</label>
                  <input 
                    required
                    value={projectModal.project?.category || ''}
                    onChange={(e) => setProjectModal({ ...projectModal, project: { ...projectModal.project!, category: e.target.value }})}
                    placeholder="E.g. AI · NLP · SaaS"
                    className="w-full bg-[#050507] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white outline-none admin-glow"
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
                        className={`flex items-center justify-center p-4 rounded-xl border admin-glow ${projectModal.project?.iconType === type ? 'border-[#58a6ff] bg-[#58a6ff]/10 text-white shadow-xl' : 'border-zinc-800 bg-zinc-900/50 text-zinc-600 hover:border-zinc-700'}`}
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
                    className="w-full bg-[#050507] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white outline-none admin-glow resize-none mb-4"
                  />
                </div>
                
                {/* Advanced Project Details */}
                <div className="space-y-6 pt-4 border-t border-zinc-800">
                  <h4 className="text-[10px] font-bold text-[#58a6ff] uppercase tracking-widest font-mono">Full Project Details</h4>
                  
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
                              className="flex-1 bg-[#050507] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white outline-none admin-glow"
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
                         className="w-full py-2 border border-dashed border-zinc-800 rounded-lg text-[10px] text-zinc-500 hover:text-white admin-glow"
                       >+ Add Feature</button>
                    </div>
                  </div>

                  {/* Tech Stack Editor */}
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3">Tech Stack</label>
                    <div className="space-y-3">
                       {(projectModal.project?.fullDetails?.techStack || []).map((tech, tIdx) => (
                         <div key={tIdx} className="grid grid-cols-2 gap-2 p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl relative group admin-glow">
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
                         <div key={sIdx} className="grid grid-cols-2 gap-2 p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl relative group admin-glow">
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
                      className="w-full bg-[#050507] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white outline-none admin-glow"
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
                    className="w-full bg-[#050507] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white outline-none admin-glow resize-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Live Link (Optional)</label>
                  <input 
                    value={projectModal.project?.link || ''}
                    onChange={(e) => setProjectModal({ ...projectModal, project: { ...projectModal.project!, link: e.target.value }})}
                    placeholder="https://example.com"
                    className="w-full bg-[#050507] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white outline-none admin-glow"
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
                      className="w-full bg-[#050507] border border-zinc-800 rounded-xl px-4 py-3 text-[11px] text-white outline-none admin-glow resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Video URL (Direct link or YouTube/Vimeo)</label>
                    <input 
                      value={projectModal.project?.videoUrl || ''}
                      onChange={(e) => setProjectModal({ ...projectModal, project: { ...projectModal.project!, videoUrl: e.target.value }})}
                      placeholder="https://video-link.mp4"
                      className="w-full bg-[#050507] border border-zinc-800 rounded-xl px-4 py-3 text-[11px] text-white outline-none admin-glow"
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
              className="relative w-full max-w-sm bg-[#161b22]/95 backdrop-blur-md border border-[#30363d] rounded-2xl p-8 shadow-2xl text-center z-10"
            >
              <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mx-auto mb-6 border border-red-500/20">
                <Trash2 size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 font-sans">Delete Project?</h3>
              <p className="text-[#8b949e] text-xs font-light leading-relaxed mb-6">
                This action cannot be undone. Are you sure you want to remove this project from your portfolio?
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setProjectToDelete(null)}
                  disabled={isActionPending}
                  className="flex-1 py-2.5 bg-[#21262d] border border-[#30363d] text-[#c9d1d9] font-bold rounded-lg hover:text-white hover:bg-[#30363d] transition-all text-[9px] uppercase tracking-widest disabled:opacity-50 font-mono"
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
              className="relative w-full max-w-xl bg-[#0a0a0c] border border-zinc-800 rounded-3xl p-6 md:p-10 shadow-2xl overflow-y-auto max-h-[85vh] scrollbar-hide text-left"
            >
              <button 
                onClick={() => setTestimonialModal({ ...testimonialModal, isOpen: false })}
                className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-[#58a6ff]/10 border border-[#30363d] flex items-center justify-center text-[#58a6ff]">
                  <Quote size={18} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white font-sans">
                    {testimonialModal.mode === 'add' ? 'Add Testimonial' : 'Edit Testimonial'}
                  </h3>
                  <p className="text-xs text-[#8b949e]">Record customized reviews and feedback elements.</p>
                </div>
              </div>

              <form onSubmit={saveTestimonial} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Quote / Content *</label>
                  <textarea 
                    rows={4}
                    required
                    value={testimonialModal.testimonial?.quote || ''}
                    onChange={(e) => setTestimonialModal({ 
                      ...testimonialModal, 
                      testimonial: { ...testimonialModal.testimonial!, quote: e.target.value } 
                    })}
                    placeholder="Enter the client's quote..."
                    className="w-full bg-[#050507] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white outline-none admin-glow resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Author Name *</label>
                    <input 
                      type="text"
                      required
                      value={testimonialModal.testimonial?.author || ''}
                      onChange={(e) => setTestimonialModal({ 
                        ...testimonialModal, 
                        testimonial: { ...testimonialModal.testimonial!, author: e.target.value } 
                      })}
                      placeholder="e.g. John Doe"
                      className="w-full bg-[#050507] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white outline-none admin-glow"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Job Title / Role *</label>
                    <input 
                      type="text"
                      required
                      value={testimonialModal.testimonial?.title || ''}
                      onChange={(e) => setTestimonialModal({ 
                        ...testimonialModal, 
                        testimonial: { ...testimonialModal.testimonial!, title: e.target.value } 
                      })}
                      placeholder="e.g. CEO"
                      className="w-full bg-[#050507] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white outline-none admin-glow"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Company Name</label>
                    <input 
                      type="text"
                      value={testimonialModal.testimonial?.company || ''}
                      onChange={(e) => setTestimonialModal({ 
                        ...testimonialModal, 
                        testimonial: { ...testimonialModal.testimonial!, company: e.target.value } 
                      })}
                      placeholder="e.g. Tech Corp"
                      className="w-full bg-[#050507] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white outline-none admin-glow"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Rating Level (1 - 5 stars)</label>
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
                              ? 'border-[#58a6ff] bg-[#58a6ff]/10 text-[#58a6ff]'
                              : 'border-zinc-800 bg-zinc-900/40 text-zinc-500 hover:border-zinc-700'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Client Avatar Image URL</label>
                  <input 
                    type="text"
                    value={testimonialModal.testimonial?.avatarUrl || ''}
                    onChange={(e) => setTestimonialModal({ 
                      ...testimonialModal, 
                      testimonial: { ...testimonialModal.testimonial!, avatarUrl: e.target.value } 
                    })}
                    placeholder="https://images.unsplash.com/... or blank"
                    className="w-full bg-[#050507] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white outline-none admin-glow"
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
                    className="w-4 h-4 rounded text-[#58a6ff] accent-[#58a6ff] bg-[#050507] border border-zinc-800 outline-none"
                  />
                  <label htmlFor="isTestimonialActive" className="text-xs text-[#c9d1d9] select-none font-medium">Verify and show active on landing page slider</label>
                </div>

                <div className="pt-4 border-t border-zinc-900 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setTestimonialModal({ ...testimonialModal, isOpen: false })}
                    className="flex-1 py-4 bg-[#21262d] border border-zinc-800 text-zinc-400 font-bold rounded-xl hover:text-white hover:bg-zinc-805 transition-all text-xs uppercase tracking-widest"
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
              className="relative w-full max-w-sm bg-[#161b22]/95 backdrop-blur-md border border-[#30363d] rounded-2xl p-8 shadow-2xl text-center z-10"
            >
              <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mx-auto mb-6 border border-red-500/20">
                <Trash2 size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 font-sans">Delete Testimonial?</h3>
              <p className="text-[#8b949e] text-xs font-light leading-relaxed mb-6">
                Are you sure you want to remove this testimonial? This action is irreversible.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setTestimonialToDelete(null)}
                  disabled={isActionPending}
                  className="flex-1 py-2.5 bg-[#21262d] border border-[#30363d] text-[#c9d1d9] font-bold rounded-lg hover:text-white hover:bg-[#30363d] transition-all text-[9px] uppercase tracking-widest disabled:opacity-50 font-mono"
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
            className="fixed top-24 right-8 bottom-24 w-[400px] z-[50] hidden xl:flex flex-col bg-[#161b22]/90 backdrop-blur-2xl border border-[#30363d] rounded-[2rem] shadow-2xl overflow-hidden pointer-events-none"
          >
            <div className="relative h-64 bg-[#0d1117] overflow-hidden">
              {hoveredProject.videoUrl ? (
                <video 
                  src={hoveredProject.videoUrl} 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : hoveredProject.screenshots && hoveredProject.screenshots.length > 0 ? (
                <img 
                  src={hoveredProject.screenshots[0]} 
                  alt={hoveredProject.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-[#8b949e] gap-4">
                  <div className="w-16 h-16 bg-[#161b22] border border-[#30363d] rounded-2xl flex items-center justify-center shadow-sm">
                    {getProjectIcon(hoveredProject.iconType, 32)}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 font-mono">Visual Preview Unavailable</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#161b22] via-transparent to-transparent"></div>
            </div>

            <div className="p-10 flex-1 flex flex-col">
              <div className="mb-8">
                <div className="text-[10px] font-bold text-[#58a6ff] uppercase tracking-[0.4em] mb-3 font-mono">{hoveredProject.category}</div>
                <h3 className="text-2xl font-extrabold text-white leading-tight mb-4 font-sans">{hoveredProject.title}</h3>
                <div className="w-12 h-0.5 bg-[#58a6ff]"></div>
              </div>

              <p className="text-[#8b949e] text-sm leading-relaxed mb-8 flex-1 font-light">{hoveredProject.desc}</p>

              {hoveredProject.screenshots && hoveredProject.screenshots.length > 1 && (
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {hoveredProject.screenshots.slice(1, 3).map((shot, idx) => (
                    <img 
                      key={idx} 
                      src={shot} 
                      alt="Thumbnail" 
                      className="w-full aspect-video object-cover rounded-xl border border-[#30363d]"
                      referrerPolicy="no-referrer"
                    />
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#58a6ff] font-mono">
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
                  className={`absolute ${showFullPreview ? 'top-4 right-4 bg-black/40' : '-top-12 right-0'} p-2 text-white/50 hover:text-white transition-colors z-[100] rounded-full`}
                  aria-label="Close project preview overlay"
                >
                  <X size={showFullPreview ? 20 : 28} />
                </button>

                {/* FRONT SIDE: LIVE PREVIEW */}
                <div 
                  className={`absolute inset-0 backface-hidden bg-[#0d1117] ${showFullPreview ? 'rounded-none' : 'rounded-3xl border border-white/10 shadow-2xl'} overflow-hidden flex flex-col`}
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  {/* Card Header */}
                  <div className="h-14 bg-[#161b22] border-b border-white/5 flex items-center justify-between px-6 shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                      </div>
                      <div className="h-4 w-[1px] bg-white/10 mx-2" />
                      <div className="flex items-center gap-2 text-zinc-400 font-mono text-[10px] uppercase tracking-widest">
                        <Activity size={12} className="text-amber-500" />
                        <span>Live_Instance.sh</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setShowFullPreview(!showFullPreview)}
                        className="p-2 text-zinc-400 hover:text-white transition-colors"
                        title={showFullPreview ? "Minimize" : "Full Screen"}
                        aria-label={showFullPreview ? "Minimize preview window" : "Maximize preview window to full screen"}
                      >
                        {showFullPreview ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                      </button>
                      <button 
                        onClick={() => setIsFlipped(true)}
                        className="px-4 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border border-white/5 flex items-center gap-2"
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
                          className="absolute inset-0 z-20 bg-[#0d1117] flex flex-col items-center justify-center p-6 text-center"
                        >
                          <div className="w-10 h-10 border-2 border-white/5 border-t-amber-500 rounded-full animate-spin mb-4"></div>
                          <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-[0.4em]">Booting_System...</div>
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
                       <div className="text-[11px] text-white/70 font-mono italic">Rendering stable stream at 60fps</div>
                    </div>
                  </div>
                </div>

                {/* BACK SIDE: PROJECT DETAILS */}
                <div 
                  className="absolute inset-0 backface-hidden bg-[#161b22] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col"
                  style={{ 
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}
                >
                  <div className="h-14 bg-[#1c2128] border-b border-white/5 flex items-center justify-between px-6 shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-500">
                         {getProjectIcon(selectedProjectForPreview.iconType, 16)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest leading-none">Manifest v2.4.0</span>
                        <span className="text-xs font-bold text-white leading-tight">{selectedProjectForPreview.title}</span>
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
                          <div className="text-amber-500 font-mono text-[9px] uppercase tracking-[0.4em]">Overview</div>
                          <h3 className="text-2xl md:text-4xl font-light text-white leading-tight" style={{ fontFamily: "'Georgia', serif" }}>
                            Mechanical & <span className="italic">Architectural</span> Vision
                          </h3>
                          <div className="markdown-body text-zinc-400 text-sm md:text-base leading-relaxed font-light">
                            <ReactMarkdown>{selectedProjectForPreview.fullDetails?.overview || ''}</ReactMarkdown>
                          </div>
                        </section>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                           <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                             <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Key Attributes</div>
                             <ul className="space-y-3">
                               {selectedProjectForPreview.fullDetails?.features?.slice(0, 4).map((f, i) => (
                                 <li key={i} className="text-xs text-zinc-400 flex gap-3">
                                   <div className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                                   {f}
                                 </li>
                               ))}
                             </ul>
                           </div>
                           <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                             <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Deployment Stack</div>
                             <div className="flex flex-wrap gap-2">
                               {selectedProjectForPreview.fullDetails?.techStack?.map((tech, i) => (
                                 <span key={i} className="px-2.5 py-1 bg-black/20 text-[10px] font-mono text-zinc-400 rounded-md border border-white/5">
                                   {tech.name}
                                 </span>
                               ))}
                             </div>
                           </div>
                        </div>
                      </div>

                      <div className="lg:col-span-5 space-y-8">
                         <div className="bg-black/20 rounded-2xl p-6 border border-white/5 space-y-6">
                            <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5 pb-4">Specifications</div>
                            <div className="space-y-4">
                              {[
                                { l: 'Project Category', v: selectedProjectForPreview.category },
                                { l: 'License Type', v: selectedProjectForPreview.fullDetails?.license || 'Proprietary' },
                                { l: 'Current Status', v: 'Active Node', c: 'text-emerald-500' },
                                { l: 'Engine Version', v: 'v4.2.1-stable' }
                              ].map((spec, i) => (
                                <div key={i} className="flex justify-between items-center text-[11px] font-mono">
                                   <span className="text-zinc-500">{spec.l}</span>
                                   <span className={spec.c || "text-zinc-300"}>{spec.v}</span>
                                </div>
                              ))}
                            </div>
                         </div>

                         <div className="bg-amber-500/5 rounded-2xl p-6 border border-amber-500/10">
                            <div className="flex items-center gap-3 mb-4">
                              <Shield size={16} className="text-amber-500" />
                              <span className="text-[10px] font-bold text-white uppercase tracking-widest">Integrity Protocol</span>
                            </div>
                            <p className="text-[11px] text-zinc-400 leading-relaxed italic">
                              "Every solution we deliver is sthira (stable), śubhra (clean), and samanvita (well-integrated)."
                            </p>
                         </div>

                         <div className="flex flex-col gap-3">
                            <a 
                              href={selectedProjectForPreview.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl text-[10px] uppercase tracking-[0.2em] transition-all border border-white/10 flex items-center justify-center gap-3"
                            >
                              <Maximize2 size={14} /> Global Node Access
                            </a>
                            <button 
                              onClick={() => { setActivePreviewUrl(null); setSelectedProjectForPreview(null); }}
                              className="w-full py-4 text-zinc-500 hover:text-white text-[9px] font-bold uppercase tracking-widest transition-colors"
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
        <section id="process" className="py-20 md:py-32 px-6 md:px-12 bg-transparent">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 md:mb-20">
              <div className="text-[#58a6ff] text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] mb-4">How we work</div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
                <MotionHeading html="Simple approach. <span class='italic text-[#58a6ff]'>Dependable results.</span>" whileInView={true} />
              </h2>
              <p className="text-[#8b949e] text-sm md:text-base font-light max-w-2xl mx-auto">Four focused phases to take you from idea to impact.</p>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-12 relative">
               {/* Connector line for desktop */}
              <div className="hidden md:block absolute top-[60px] left-[10%] right-[10%] h-[1px] bg-[#30363d] z-0"></div>
              
              {[
                { step: "01", title: "Understand your vision", desc: "Whether you are beginning your first digital journey or expanding an existing one, we start by listening deeply." },
                { step: "02", title: "Design with intention", desc: "Every interface decision is deliberate. We merge modern technology with a refined, user-centered philosophy." },
                { step: "03", title: "Engineer with precision", desc: "Swift execution without shortcuts. Hands-on development across the full stack — reliable, tested, documented." },
                { step: "04", title: "Sustain and grow", desc: "The relationship doesn't end at launch. We provide long-term maintenance and continued strategic support." }
              ].map((p, i) => (
                <div key={i} className="relative z-10 text-center md:text-left">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-[#161b22] border border-[#30363d] text-white flex items-center justify-center rounded-full mb-6 md:mb-8 mx-auto md:mx-0 shadow-sm font-semibold text-base font-mono">
                    {p.step}
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4">{p.title}</h3>
                  <p className="text-[#8b949e] text-xs md:text-sm font-light leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Tech Stack Section */}
      {currentView === 'home' && (
        <section className="py-20 md:py-32 px-6 md:px-12 border-t border-[#30363d]">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <div className="text-[#58a6ff] text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] mb-4">The Ecosystem</div>
                <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-8">
                  <MotionHeading html="Built on a Foundation of <span class='italic text-[#58a6ff]'>World-Class</span> Technology" whileInView={true} />
                </h2>
                <p className="text-[#8b949e] mb-10 max-w-md text-sm md:text-base font-light leading-relaxed">
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
                      <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 font-mono">{item.label}</div>
                      <div className="text-[#c9d1d9] text-sm font-light">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="relative">
                <div className="aspect-square bg-gradient-to-tr from-[#58a6ff]/5 to-transparent rounded-3xl border border-[#30363d] flex items-center justify-center relative overflow-hidden group hover:border-[#58a6ff]/35 transition-all duration-500 shadow-xl">
                  {/* Visual Representation of Stack (Abstract) */}
                  <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 relative z-10">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                        className="w-16 h-16 md:w-20 md:h-20 bg-[#161b22]/50 border border-[#30363d] rounded-2xl flex items-center justify-center text-[#58a6ff] hover:border-[#58a6ff]/50 hover:bg-[#161b22] transition-all duration-500 shadow-sm"
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
        <section id="contact" className="py-20 md:py-32 px-6 md:px-12 w-full max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 md:gap-20">
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
            >
              <div className="text-[#58a6ff] text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Begin your project</div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 md:mb-8 leading-tight">
                <MotionHeading html="Ready to build something <span class='italic text-[#58a6ff]'>remarkable?</span>" whileInView={true} />
              </h2>
              <p className="text-[#8b949e] mb-10 md:mb-12 max-w-md text-sm md:text-base font-light">From your first digital step to a fully realized intelligent product — Nishkalya delivers reliable development, swift execution, and sustained growth.</p>
              
              <div className="space-y-6 md:space-y-8">
                {[
                  { icon: <Mail size={16} />, label: "Email", value: "nishkalya@gmail.com" },
                  { icon: <Phone size={16} />, label: "Phone", value: "+91 9608339846" },
                  { icon: <MapPin size={16} />, label: "Location", value: "World Wide Web (Remote)" }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 md:gap-6 group">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-[#161b22] border border-[#30363d] rounded-xl flex items-center justify-center text-[#58a6ff] group-hover:bg-[#58a6ff] transition-all duration-300 group-hover:text-white shadow-sm">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-[8px] md:text-[9px] text-[#8b949e] uppercase tracking-widest mb-1">{item.label}</div>
                      <div className="text-[#c9d1d9] font-light text-sm md:text-base">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 sm:gap-6 mt-12 md:mt-16">
                 <a href="https://github.com/Nishkalya" target="_blank" rel="noreferrer" className="w-10 h-10 border border-[#30363d] bg-[#161b22]/50 rounded-lg flex items-center justify-center text-[#8b949e] hover:border-[#58a6ff]/50 hover:text-[#58a6ff] transition-all shadow-sm"><Github size={16} /></a>
                 <a href="#" className="w-10 h-10 border border-[#30363d] bg-[#161b22]/50 rounded-lg flex items-center justify-center text-[#8b949e] hover:border-[#58a6ff]/50 hover:text-[#58a6ff] transition-all shadow-sm"><Linkedin size={16} /></a>
                 <a href="#" className="w-10 h-10 border border-[#30363d] bg-[#161b22]/50 rounded-lg flex items-center justify-center text-[#8b949e] hover:border-[#58a6ff]/50 hover:text-[#58a6ff] transition-all shadow-sm"><Twitter size={16} /></a>
                 <a href="#" className="w-10 h-10 border border-[#30363d] bg-[#161b22]/50 rounded-lg flex items-center justify-center text-[#8b949e] hover:border-[#58a6ff]/50 hover:text-[#58a6ff] transition-all shadow-sm"><Dribbble size={16} /></a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-6 md:p-10 bg-[#161b22] border border-[#30363d] rounded-3xl backdrop-blur-sm mt-12 md:mt-0 min-h-[400px] flex flex-col shadow-2xl"
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
                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-[#238636] mb-6 shadow-sm">
                      <CheckCircle size={40} className="animate-in zoom-in duration-500" />
                    </div>
                    <h3 className="text-3xl font-extrabold text-white mb-3">Message Received</h3>
                    <p className="text-[#8b949e] max-w-[280px] mx-auto text-sm font-light leading-relaxed mb-8">
                      We've received your inquiry and our team will get back to you within 24 hours.
                    </p>
                    <button 
                      onClick={() => setIsSubmitted(false)}
                      className="px-6 py-2.5 bg-[#21262d] border border-[#30363d] text-[10px] font-bold text-[#c9d1d9] rounded-lg hover:text-white hover:bg-[#30363d] hover:border-[#8b949e] transition-all uppercase tracking-wider"
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
                       <label className="block text-[9px] md:text-[10px] font-bold text-[#8b949e] uppercase tracking-widest mb-2 px-1 font-mono">Full Name</label>
                       <input 
                         name="name"
                         value={formData.name}
                         onChange={handleChange}
                         type="text" 
                         placeholder="Ravi Sharma" 
                         className={`w-full bg-[#0d1117] border ${errors.name ? 'border-red-500' : 'border-[#30363d]'} rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#58a6ff] transition-all text-white placeholder-[#8b949e] font-light`} 
                       />
                       {errors.name && (
                         <p className="text-[10px] text-red-500 mt-1.5 px-1 flex items-center gap-1.5 font-medium">
                           <AlertCircle size={10} /> {errors.name}
                         </p>
                       )}
                     </div>
                     <div>
                       <label className="block text-[9px] md:text-[10px] font-bold text-[#8b949e] uppercase tracking-widest mb-2 px-1 font-mono">Email Address</label>
                       <input 
                         name="email"
                         value={formData.email}
                         onChange={handleChange}
                         type="email" 
                         placeholder="ravi@company.com" 
                         className={`w-full bg-[#0d1117] border ${errors.email ? 'border-red-500' : 'border-[#30363d]'} rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#58a6ff] transition-all text-white placeholder-[#8b949e] font-light`} 
                       />
                       {errors.email && (
                         <p className="text-[10px] text-red-500 mt-1.5 px-1 flex items-center gap-1.5 font-medium">
                           <AlertCircle size={10} /> {errors.email}
                         </p>
                       )}
                     </div>
                   </div>
                   <div>
                     <label className="block text-[9px] md:text-[10px] font-bold text-[#8b949e] uppercase tracking-widest mb-2 px-1 font-mono">Company</label>
                     <input 
                       name="company"
                       value={formData.company}
                       onChange={handleChange}
                       type="text" 
                       placeholder="Your Company" 
                       className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#58a6ff] transition-all text-white placeholder-[#8b949e] font-light" 
                     />
                   </div>
                   <div>
                     <label className="block text-[9px] md:text-[10px] font-bold text-[#8b949e] uppercase tracking-widest mb-2 px-1 font-mono">Service Needed</label>
                     <div className="relative">
                       <select 
                         name="service"
                         value={formData.service}
                         onChange={handleChange}
                         className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#58a6ff] transition-all text-white font-light appearance-none text-[#c9d1d9]"
                       >
                         <option className="bg-[#161b22] text-[#c9d1d9]">Select a service</option>
                         <option className="bg-[#161b22] text-white">AI Product Development</option>
                         <option className="bg-[#161b22] text-white">UI/UX Design Systems</option>
                         <option className="bg-[#161b22] text-white">LLM Integration</option>
                         <option className="bg-[#161b22] text-white">Custom Strategy</option>
                       </select>
                       <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8b949e] pointer-events-none rotate-90" />
                     </div>
                   </div>
                   <div>
                     <label className="block text-[9px] md:text-[10px] font-bold text-[#8b949e] uppercase tracking-widest mb-2 px-1 font-mono">Your Message</label>
                     <textarea 
                       name="message"
                       value={formData.message}
                       onChange={handleChange}
                       rows={4} 
                       placeholder="Tell us about your project..." 
                       className={`w-full bg-[#0d1117] border ${errors.message ? 'border-red-500' : 'border-[#30363d]'} rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#58a6ff] transition-all text-white placeholder-[#8b949e] font-light resize-none`}
                     ></textarea>
                     {errors.message && (
                       <p className="text-[10px] text-red-500 mt-1.5 px-1 flex items-center gap-1.5 font-medium">
                         <AlertCircle size={10} /> {errors.message}
                       </p>
                     )}
                   </div>
                   <button 
                     type="submit"
                     className="w-full py-3 bg-[#238636] text-white font-bold rounded-lg border border-[#2ea44f] hover:bg-[#2eaa44] transition-all duration-300 text-[10px] md:text-xs uppercase tracking-wider flex items-center justify-center gap-3 shadow-md"
                   >
                     {isSubmitting ? "Sending..." : "Send Message"} <ArrowRight size={14} className={isSubmitting ? "animate-pulse" : ""} />
                   </button>
                   </motion.form>
                 )}
               </AnimatePresence>
            </motion.div>
          </div>
        </section>
      )}
      </main>

      {/* Footer */}
      <footer className="pt-20 md:pt-24 pb-10 md:pb-12 px-6 md:px-12 border-t border-[#30363d] bg-[#0d1117]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 md:gap-10 mb-16 md:mb-20">
            <div className="max-w-xs">
              <div className="flex items-center space-x-2 mb-6 cursor-pointer group" onClick={() => { setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                <div className="w-6 h-6 bg-[#58a6ff] rounded flex items-center justify-center transform rotate-12 group-hover:rotate-0 transition-all duration-500 shadow-md shadow-[#58a6ff]/20">
                  <span className="text-[#0d1117] font-black text-xs font-mono">N</span>
                </div>
                <span className="text-lg font-black tracking-tight text-white font-sans">NISHKALYA</span>
              </div>
              <p className="text-[#8b949e] text-sm font-light leading-relaxed mb-6">We craft next-generation products at the intersection of AI and stunning design. Built for impact, designed for the future.</p>
              <div className="flex flex-wrap gap-4">
                <a href="https://github.com/Nishkalya" target="_blank" rel="noreferrer" className="text-[#8b949e] hover:text-white transition-colors text-[9px] font-bold uppercase tracking-widest font-mono">GitHub</a>
                <a href="#" className="text-[#8b949e] hover:text-white transition-colors text-[9px] font-bold uppercase tracking-widest font-mono">𝕏 (Twitter)</a>
                <a href="#" className="text-[#8b949e] hover:text-white transition-colors text-[9px] font-bold uppercase tracking-widest font-mono">LinkedIn</a>
                <a href="#" className="text-[#8b949e] hover:text-white transition-colors text-[9px] font-bold uppercase tracking-widest font-mono">Dribbble</a>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-12 sm:gap-20">
              <div className="space-y-3 md:space-y-4">
                <div className="text-[9px] md:text-[10px] font-bold text-[#8b949e] uppercase tracking-widest mb-6 font-mono">Links</div>
                <button onClick={() => { setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="block text-[#8b949e] hover:text-white text-xs md:text-sm transition-colors font-light text-left w-full">Home</button>
                <button onClick={() => scrollToSection('about')} className="block text-[#8b949e] hover:text-white text-xs md:text-sm transition-colors font-light text-left w-full">About</button>
                <button onClick={() => scrollToSection('services')} className="block text-[#8b949e] hover:text-white text-xs md:text-sm transition-colors font-light text-left w-full">Services</button>
                <button onClick={() => { setCurrentView('projects'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="block text-[#8b949e] hover:text-white text-xs md:text-sm transition-colors font-light text-left w-full">Projects</button>
                <button onClick={() => scrollToSection('contact')} className="block text-[#8b949e] hover:text-white text-xs md:text-sm transition-colors font-light text-left w-full">Contact</button>
                <button onClick={() => setCurrentView('admin')} className="block text-[#8b949e] hover:text-white text-[8px] transition-colors font-light text-left w-full pt-4">Admin Login</button>
              </div>
              <div className="space-y-3 md:space-y-4">
                <div className="text-[9px] md:text-[10px] font-bold text-[#8b949e] uppercase tracking-widest mb-6 font-mono">Social</div>
                <a href="https://github.com/Nishkalya" target="_blank" rel="noreferrer" className="block text-[#8b949e] hover:text-white text-xs md:text-sm transition-colors font-light">GitHub</a>
                <a href="#" className="block text-[#8b949e] hover:text-white text-xs md:text-sm transition-colors font-light">LinkedIn</a>
                <a href="#" className="block text-[#8b949e] hover:text-white text-xs md:text-sm transition-colors font-light">Dribbble</a>
                <a href="#" className="block text-[#8b949e] hover:text-white text-xs md:text-sm transition-colors font-light">Instagram</a>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-[#30363d] gap-4 text-center sm:text-left">
            <div className="text-[8px] md:text-[9px] text-[#8b949e] uppercase tracking-[0.3em] md:tracking-[0.4em] font-mono">© 2025 Nishkalya. All rights reserved.</div>
            <div className="text-[8px] md:text-[9px] text-[#8b949e] uppercase tracking-[0.25em] md:tracking-[0.3em] font-mono">Built with ♥ for the World Wide Web.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}


