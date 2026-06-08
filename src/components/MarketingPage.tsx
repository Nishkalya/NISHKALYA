import React, { useState, useEffect } from 'react';
import { 
  Inbox as InboxIcon, 
  MessageSquare, 
  Search, 
  Filter, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Edit2, 
  Trash2, 
  X, 
  Plus, 
  LogOut, 
  Lock, 
  User as UserIcon, 
  AlertCircle, 
  Sparkles, 
  Check, 
  CheckCircle, 
  ShieldAlert,
  Clock,
  AlertTriangle,
  Info,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { marketingUserService } from '../services/marketingUserService';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// Interface Definitions
interface InboxTicket {
  id: string;
  name: string;
  email: string;
  company?: string;
  service?: string;
  subject: string;
  message: string;
  date: string;
  status: 'New Query' | 'In Process' | 'Won' | 'Lost';
  notes?: string;
}

interface QueryRecord {
  id: string;
  customerName: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assignedTo: string;
  createdDate: string;
  status: 'New Query' | 'In Process' | 'Won' | 'Lost';
  description: string;
  notes?: string;
}

interface MarketingPageProps {
  marketingUser: any;
  setMarketingUser: (user: any) => void;
}

// Default Seed Datasets (to populate localStorage on first load)
const DEFAULT_INBOX_TICKETS: InboxTicket[] = [
  {
    id: 'TCK-8421',
    name: 'Julian Vester',
    email: 'jvester@quantum-core.dev',
    subject: 'Custom AI Agent Integration request',
    date: '2026-06-08',
    status: 'New Query',
    message: 'We are looking to implement a custom AI triage agent for our internal developer ticketing platform. The agent should parse stack traces and match them with past resolution Git commits. Is this something Nishkalya Studio could build within our 4-week timeline?'
  },
  {
    id: 'TCK-8419',
    name: 'Amara Sterling',
    email: 'amara@aurora-labs.io',
    subject: 'Partnership & White-Label SaaS Platform',
    date: '2026-06-07',
    status: 'In Process',
    message: 'We represent Aurora Labs. We want to white-label your custom analytics engine and bundle it into our upcoming SaaS suite. Let us discuss enterprise licensing and API throttling tolerances.'
  },
  {
    id: 'TCK-8412',
    name: 'René Dupont',
    email: 'dupont@cybersec.fr',
    subject: 'GDPR Compliance Questionnaire',
    date: '2026-06-06',
    status: 'Won',
    message: 'Thank you for sending the security checklist. All privacy standards look solid. We are happy to proceed with signing the MSA.'
  },
  {
    id: 'TCK-8409',
    name: 'Kenji Takahashi',
    email: 'takahashi@neo-tokyo.jp',
    subject: 'Vite + Express Custom Routing Question',
    date: '2026-06-05',
    status: 'New Query',
    message: 'Hello! We saw your Vite + Express middleware boilerplates in your portfolio projects. Are they optimized for low-spec serverless instances, or do they require continuous warm container runtimes?'
  },
  {
    id: 'TCK-8404',
    name: 'Evelyn Thorne',
    email: 'evelyn@thorn-fintech.com',
    subject: 'Fintech Dashboard Layout Design',
    date: '2026-06-04',
    status: 'In Process',
    message: 'Our team needs a high-density, high-contrast dashboard with instant websocket-based stock price feeds. Please let us know your standard consulting rate for premium Figma mockups and React codebases.'
  },
  {
    id: 'TCK-8398',
    name: 'Marcus Vance',
    email: 'marcus.vance@solarpixel.net',
    subject: 'Urgent Security Patch Check',
    date: '2026-06-02',
    status: 'Won',
    message: 'Just confirming that the credentials for our test databases were rotated. Everything is secure and ready for your staging environment run.'
  },
  {
    id: 'TCK-8385',
    name: 'Sofia Gatti',
    email: 's.gatti@milano-design.it',
    subject: 'Client Website Revamp Consultation',
    date: '2026-06-01',
    status: 'New Query',
    message: 'Ciao! We wish to hire a studio with elite typography aesthetics like yours to design our biannual fashion magazine digital hub. What are your slots for late 25/early 26?'
  },
  {
    id: 'TCK-8370',
    name: 'Leo Sterling',
    email: 'lsterling@apex-finance.co.uk',
    subject: 'Lead Follow-up Closed (No Budget)',
    date: '2026-05-28',
    status: 'Lost',
    message: 'Client team decided to postpone custom dashboard migrations until Q4. Lead marked as closed-lost due to current year budget freezes.'
  }
];

const DEFAULT_QUERY_RECORDS: QueryRecord[] = [
  {
    id: 'QRY-1204',
    customerName: 'Robert Chen',
    category: 'Enterprise AI',
    priority: 'High',
    assignedTo: 'Vishal',
    createdDate: '2026-06-08',
    status: 'New Query',
    description: 'Customer reports Gemini model latency spikes when sending large context payloads containing structured system tables. Check if chunking optimizer is enabled.'
  },
  {
    id: 'QRY-1201',
    customerName: 'Sarah Jenkins',
    category: 'SaaS Platform',
    priority: 'Critical',
    assignedTo: 'Nishkalya Support',
    createdDate: '2026-06-08',
    status: 'In Process',
    description: 'Our webhook events for Stripe stripe-billing are occasionally failing with 502 Bad Gateway under peak loads. We need to check if Node process memory limits are hit.'
  },
  {
    id: 'QRY-1195',
    customerName: 'Devon Brooks',
    category: 'Technical Support',
    priority: 'Low',
    assignedTo: 'AI Agent',
    createdDate: '2026-06-07',
    status: 'Won',
    description: 'Issue with mobile navbar collapsing too early on 820px tablets is resolved. Applied md:flex change to main navigation container.'
  },
  {
    id: 'QRY-1188',
    customerName: 'Elena Rostova',
    category: 'API Integration',
    priority: 'Medium',
    assignedTo: 'Vishal',
    createdDate: '2026-06-06',
    status: 'In Process',
    description: 'OAuth client state param validation is failing when initiated from third-party mobile webviews. Requires deep investigation into session cookie persistence across iframe sandboxes.'
  },
  {
    id: 'QRY-1182',
    customerName: 'Lukas Weber',
    category: 'Enterprise AI',
    priority: 'Medium',
    assignedTo: 'AI Agent',
    createdDate: '2026-06-05',
    status: 'Won',
    description: 'Added rate limiter configuration file with reasonable 100 requests per minute ceiling to prevent endpoint abuse.'
  },
  {
    id: 'QRY-1175',
    customerName: 'Chloe Patel',
    category: 'SaaS Platform',
    priority: 'Low',
    assignedTo: 'Nishkalya Support',
    createdDate: '2026-06-03',
    status: 'New Query',
    description: 'Requested dashboard CSV download feature to compile monthly telemetry records into Excel-ready sheets.'
  },
  {
    id: 'QRY-1170',
    customerName: 'Mateo Silva',
    category: 'API Integration',
    priority: 'High',
    assignedTo: 'Vishal',
    createdDate: '2026-06-02',
    status: 'In Process',
    description: 'Integration with external shipping API occasionally throws 401 Unauthorized during session token expiration window. Needs token-refresh interceptor.'
  },
  {
    id: 'QRY-1162',
    customerName: 'Zoe Bell',
    category: 'Technical Support',
    priority: 'Critical',
    assignedTo: 'Nishkalya Support',
    createdDate: '2026-06-01',
    status: 'Won',
    description: 'The contact form validation error when receiving emojis in the username field was fixed. Updated text encoding schemas to UTF-8 in database parameters.'
  },
  {
    id: 'QRY-1145',
    customerName: 'Jack Snyder',
    category: 'Enterprise AI',
    priority: 'Low',
    assignedTo: 'Vishal',
    createdDate: '2026-05-25',
    status: 'Lost',
    description: 'Client chose to run with built-in open-source model frameworks rather than customized corporate APIs. Project archived under inactive lead pipeline.'
  }
];

export default function MarketingPage({ marketingUser, setMarketingUser }: MarketingPageProps) {
  // Login states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active module ('inbox' or 'queries') - Default to Open Inbox module automatically!
  const [activeModule, setActiveModule] = useState<'inbox' | 'queries'>('inbox');

  // Datasets synchronized with localStorage
  const [inboxTickets, setInboxTickets] = useState<InboxTicket[]>([]);
  const [queryRecords, setQueryRecords] = useState<QueryRecord[]>([]);

  // Search, filter, and sort states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pipelineTab, setPipelineTab] = useState<'NEW_QUERY' | 'INPROCESS' | 'WON' | 'LOST'>('NEW_QUERY');
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handlePipelineTabChange = (tab: 'NEW_QUERY' | 'INPROCESS' | 'WON' | 'LOST') => {
    setPipelineTab(tab);
    setStatusFilter('all');
    setCurrentPage(1);
    setSelectedTicket(null);
    setSelectedQuery(null);
  };

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // Selected row state for Detail Views and Edit Modals
  const [selectedTicket, setSelectedTicket] = useState<InboxTicket | null>(null);
  const [selectedQuery, setSelectedQuery] = useState<QueryRecord | null>(null);

  // Modal active states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states for creating or editing entries
  const [editFormValues, setEditFormValues] = useState<any>({});
  const [addFormValues, setAddFormValues] = useState<any>({});
  const [queryNotesText, setQueryNotesText] = useState<Record<string, string>>({});

  // Initialize and synchronize localStorage
  useEffect(() => {
    if (marketingUser) {
      const storedQueries = localStorage.getItem('nishkalya_marketing_queries');

      if (storedQueries) {
        const parsed = JSON.parse(storedQueries);
        const mapped = parsed.map((q: any) => {
          let s: 'New Query' | 'In Process' | 'Won' | 'Lost' = 'New Query';
          if (q.status === 'New' || q.status === 'New Query' || q.status === 'Open') s = 'New Query';
          else if (q.status === 'In Progress' || q.status === 'In Process' || q.status === 'Investigating' || q.status === 'Escalated') s = 'In Process';
          else if (q.status === 'Won' || q.status === 'Closed' || q.status === 'Resolved') s = 'Won';
          else if (q.status === 'Lost') s = 'Lost';
          return { ...q, status: s };
        });
        setQueryRecords(mapped);
      } else {
        const mapped = DEFAULT_QUERY_RECORDS.map((q: any) => {
          let s: 'New Query' | 'In Process' | 'Won' | 'Lost' = 'New Query';
          if (q.status === 'New' || q.status === 'New Query' || q.status === 'Open') s = 'New Query';
          else if (q.status === 'In Progress' || q.status === 'In Process' || q.status === 'Investigating' || q.status === 'Escalated') s = 'In Process';
          else if (q.status === 'Won' || q.status === 'Closed' || q.status === 'Resolved') s = 'Won';
          else if (q.status === 'Lost') s = 'Lost';
          return { ...q, status: s };
        });
        setQueryRecords(mapped);
        localStorage.setItem('nishkalya_marketing_queries', JSON.stringify(mapped));
      }
    }
  }, [marketingUser]);

  // Real-time Firestore synchronization for Marketing Inbox (Inquiry Dashboard Data Integration)
  useEffect(() => {
    if (marketingUser) {
      const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(doc => {
          const data = doc.data();
          
          let currentStatus: 'New Query' | 'In Process' | 'Won' | 'Lost' = 'New Query';
          if (data.status === 'unread' || data.status === 'Open' || data.status === 'New') {
            currentStatus = 'New Query';
          } else if (data.status === 'read' || data.status === 'In Progress' || data.status === 'In Process' || data.status === 'Investigating' || data.status === 'Escalated') {
            currentStatus = 'In Process';
          } else if (data.status === 'Closed' || data.status === 'Resolved' || data.status === 'Won') {
            currentStatus = 'Won';
          } else if (data.status === 'Lost') {
            currentStatus = 'Lost';
          }

          const createdDate = data.createdAt 
            ? (data.createdAt.toDate ? data.createdAt.toDate().toISOString().split('T')[0] : new Date(data.createdAt.seconds * 1000).toISOString().split('T')[0]) 
            : new Date().toISOString().split('T')[0];

          return {
            id: doc.id,
            name: data.name || 'Anonymous',
            email: data.email || 'No Email',
            company: data.company || 'N/A',
            service: data.service && data.service !== 'Select a service' ? data.service : 'General Inquiry',
            subject: data.service && data.service !== 'Select a service' 
              ? data.service 
              : (data.company ? `Inquiry from ${data.company}` : 'Direct Contact'),
            message: data.message || '',
            date: createdDate,
            status: currentStatus,
            notes: data.notes || ''
          } as InboxTicket;
        });
        setInboxTickets(msgs);
      }, (error) => {
        console.error('Firestore messages subscribe error:', error);
      });
      return () => unsubscribe();
    }
  }, [marketingUser]);

  // Set selected query default to the first entry if Query Management is selected & no query is active
  useEffect(() => {
    if (activeModule === 'queries' && queryRecords.length > 0 && !selectedQuery) {
      setSelectedQuery(queryRecords[0]);
    }
    // Reset search, filters, sorting, and pagination when switching modules
    setSearchTerm('');
    setStatusFilter('all');
    setSortField('');
    setSortDirection('asc');
    setCurrentPage(1);
  }, [activeModule, queryRecords]);

  // Save updates helper
  const saveInboxTickets = (updated: InboxTicket[]) => {
    setInboxTickets(updated);
    localStorage.setItem('nishkalya_marketing_inbox', JSON.stringify(updated));
  };

  const saveQueryRecords = (updated: QueryRecord[]) => {
    setQueryRecords(updated);
    localStorage.setItem('nishkalya_marketing_queries', JSON.stringify(updated));

    // Update active selection if its data changed
    if (selectedQuery) {
      const stillExists = updated.find(q => q.id === selectedQuery.id);
      if (stillExists) {
        setSelectedQuery(stillExists);
      } else if (updated.length > 0) {
        setSelectedQuery(updated[0]);
      } else {
        setSelectedQuery(null);
      }
    }
  };

  // Auth Functions
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);

    try {
      const res = await marketingUserService.login(username, password);
      if (res.success && res.user) {
        setMarketingUser(res.user);
        localStorage.setItem('marketing_user_session', JSON.stringify(res.user));
      } else {
        setLoginError(res.error || 'Authentication failed.');
      }
    } catch (err: any) {
      setLoginError(err?.message || 'Something went wrong during login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    setMarketingUser(null);
    localStorage.removeItem('marketing_user_session');
    setUsername('');
    setPassword('');
  };

  // Sort helper
  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Process and Filter Data
  const getProcessedData = () => {
    if (activeModule === 'inbox') {
      let filtered = [...inboxTickets];

      // Pipeline Filter (Primary Selection)
      if (pipelineTab === 'NEW_QUERY') {
        filtered = filtered.filter(ticket => ticket.status === 'New Query');
      } else if (pipelineTab === 'INPROCESS') {
        filtered = filtered.filter(ticket => ticket.status === 'In Process');
      } else if (pipelineTab === 'WON') {
        filtered = filtered.filter(ticket => ticket.status === 'Won');
      } else if (pipelineTab === 'LOST') {
        filtered = filtered.filter(ticket => ticket.status === 'Lost');
      }

      // Search Box matcher
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        filtered = filtered.filter(ticket => 
          (ticket.id || '').toLowerCase().includes(query) ||
          ticket.name.toLowerCase().includes(query) ||
          ticket.email.toLowerCase().includes(query) ||
          (ticket.company || '').toLowerCase().includes(query) ||
          (ticket.service || '').toLowerCase().includes(query) ||
          ticket.subject.toLowerCase().includes(query) ||
          ticket.message.toLowerCase().includes(query)
        );
      }

      // Status Filter matching
      if (statusFilter !== 'all') {
        filtered = filtered.filter(ticket => ticket.status === statusFilter);
      }

      // Column Sorting
      if (sortField) {
        filtered.sort((a: any, b: any) => {
          let valA = a[sortField]?.toString().toLowerCase() || '';
          let valB = b[sortField]?.toString().toLowerCase() || '';
          
          if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
          if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
          return 0;
        });
      }

      return filtered;
    } else {
      let filtered = [...queryRecords];

      // Pipeline Filter (Primary Selection)
      if (pipelineTab === 'NEW_QUERY') {
        filtered = filtered.filter(record => record.status === 'New Query');
      } else if (pipelineTab === 'INPROCESS') {
        filtered = filtered.filter(record => record.status === 'In Process');
      } else if (pipelineTab === 'WON') {
        filtered = filtered.filter(record => record.status === 'Won');
      } else if (pipelineTab === 'LOST') {
        filtered = filtered.filter(record => record.status === 'Lost');
      }

      // Search Box matcher
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        filtered = filtered.filter(record => 
          record.id.toLowerCase().includes(query) ||
          record.customerName.toLowerCase().includes(query) ||
          record.category.toLowerCase().includes(query) ||
          record.assignedTo.toLowerCase().includes(query) ||
          record.description.toLowerCase().includes(query)
        );
      }

      // Dropdown Status Filter sub-matching
      if (statusFilter !== 'all') {
        filtered = filtered.filter(record => record.status === statusFilter);
      }

      // Column Sorting
      if (sortField) {
        filtered.sort((a: any, b: any) => {
          let valA = a[sortField]?.toString().toLowerCase() || '';
          let valB = b[sortField]?.toString().toLowerCase() || '';
          
          if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
          if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
          return 0;
        });
      }

      return filtered;
    }
  };

  const processedData = getProcessedData();

  // Paginated Results
  const totalPages = Math.max(1, Math.ceil(processedData.length / itemsPerPage));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = processedData.slice(indexOfFirstItem, indexOfLastItem);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  // Actions: View
  const handleOpenView = (item: any) => {
    if (activeModule === 'inbox') {
      setSelectedTicket(item);
    } else {
      setSelectedQuery(item);
    }
    setShowViewModal(true);
  };

  // Actions: Edit
  const handleOpenEdit = (item: any) => {
    if (activeModule === 'inbox') {
      setSelectedTicket(item);
      setEditFormValues({ ...item });
    } else {
      setSelectedQuery(item);
      setEditFormValues({ ...item });
    }
    setShowEditModal(true);
  };

  const handleApplyEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeModule === 'inbox' && selectedTicket) {
      try {
        const docRef = doc(db, 'messages', selectedTicket.id);
        
        let dbStatus = editFormValues.status || 'New Query';
        if (dbStatus === 'New Query') {
          dbStatus = 'unread';
        } else if (dbStatus === 'In Process') {
          dbStatus = 'read';
        }

        await updateDoc(docRef, {
          name: editFormValues.name || '',
          email: editFormValues.email || '',
          service: editFormValues.subject || '',
          message: editFormValues.message || '',
          status: dbStatus
        });
      } catch (err) {
        console.error("Failed to update message in Firestore:", err);
      }
    } else if (activeModule === 'queries' && selectedQuery) {
      const updated = queryRecords.map(q => q.id === selectedQuery.id ? { ...q, ...editFormValues } : q);
      saveQueryRecords(updated);
    }
    setShowEditModal(false);
  };

  // Actions: Delete
  const handleDeleteItem = async (id: string) => {
    if (window.confirm(`Are you sure you want to permanently delete record ${id}?`)) {
      if (activeModule === 'inbox') {
        try {
          await deleteDoc(doc(db, 'messages', id));
          if (selectedTicket?.id === id) setSelectedTicket(null);
        } catch (err) {
          console.error("Failed to delete message from Firestore:", err);
        }
      } else {
        const updated = queryRecords.filter(q => q.id !== id);
        saveQueryRecords(updated);
        if (selectedQuery?.id === id) setSelectedQuery(null);
      }
      // Readjust current page if it's out of bounds
      const nextMaxPage = Math.ceil(Math.max(1, getProcessedData().length - 1) / itemsPerPage);
      if (currentPage > nextMaxPage) {
        setCurrentPage(nextMaxPage);
      }
    }
  };

  // Helper to update status directly (for Won/Lost buttons)
  const handleUpdateStatus = async (statusVal: 'New Query' | 'In Process' | 'Won' | 'Lost') => {
    if (activeModule === 'inbox' && selectedTicket) {
      try {
        const docRef = doc(db, 'messages', selectedTicket.id);
        let dbStatus = statusVal as string;
        if (dbStatus === 'New Query') dbStatus = 'unread';
        else if (dbStatus === 'In Process') dbStatus = 'read';

        await updateDoc(docRef, { status: dbStatus });
        setSelectedTicket({
          ...selectedTicket,
          status: statusVal
        });
      } catch (err) {
        console.error("Failed to update status in Firestore:", err);
      }
    } else if (activeModule === 'queries' && selectedQuery) {
      const updated = queryRecords.map(q => q.id === selectedQuery.id ? { ...q, status: statusVal } : q);
      saveQueryRecords(updated);
      setSelectedQuery({
        ...selectedQuery,
        status: statusVal
      });
    }
  };

  // Save notes handler
  const handleSaveNotes = async (id: string, notesText: string, isInbox: boolean) => {
    if (isInbox) {
      try {
        const docRef = doc(db, 'messages', id);
        await updateDoc(docRef, { notes: notesText });
        if (selectedTicket && selectedTicket.id === id) {
          setSelectedTicket({ ...selectedTicket, notes: notesText });
        }
      } catch (err) {
        console.error("Failed to save note in Firestore:", err);
      }
    } else {
      const updated = queryRecords.map(q => q.id === id ? { ...q, notes: notesText } : q);
      saveQueryRecords(updated);
      if (selectedQuery && selectedQuery.id === id) {
        setSelectedQuery({ ...selectedQuery, notes: notesText });
      }
    }
  };

  // Convert/Move inbox message to query management
  const handleMoveInboxToQuery = async (ticket: InboxTicket, statusVal: 'New Query' | 'Lost') => {
    const newId = `QRY-${Math.floor(1000 + Math.random() * 9000)}`;
    const newQuery: QueryRecord = {
      id: newId,
      customerName: ticket.name,
      category: ticket.service && ticket.service !== 'Select a service' ? ticket.service : 'General Inquiry',
      priority: 'Medium',
      assignedTo: 'Vishal',
      createdDate: ticket.date,
      status: statusVal,
      description: `[Moved from Security Inbox ID: ${ticket.id}]\n\nSubject: ${ticket.subject}\n\nMessage: ${ticket.message}`,
      notes: ticket.notes || ''
    };

    const updatedQueries = [newQuery, ...queryRecords];
    saveQueryRecords(updatedQueries);
    setSelectedQuery(newQuery);

    try {
      const docRef = doc(db, 'messages', ticket.id);
      let dbStatus = 'read'; // 'read' is 'In Process'
      if (statusVal === 'Lost') {
        dbStatus = 'lost';
      }
      await updateDoc(docRef, { status: dbStatus });
    } catch (err) {
      console.error("Failed to update message status during conversion:", err);
    }

    setActiveModule('queries');
    setShowViewModal(false);
  };

  // Actions: Create (Add)
  const handleOpenAdd = () => {
    if (activeModule === 'inbox') {
      const nextId = `TCK-${Math.floor(1000 + Math.random() * 9000)}`;
      setAddFormValues({
        id: nextId,
        name: '',
        email: '',
        subject: '',
        message: '',
        date: new Date().toISOString().split('T')[0],
        status: 'New Query'
      });
    } else {
      const nextId = `QRY-${Math.floor(1000 + Math.random() * 9000)}`;
      setAddFormValues({
        id: nextId,
        customerName: '',
        category: 'Enterprise AI',
        priority: 'Medium',
        assignedTo: 'Vishal',
        createdDate: new Date().toISOString().split('T')[0],
        status: 'New Query',
        description: ''
      });
    }
    setShowAddModal(true);
  };

  const handleApplyAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeModule === 'inbox') {
      try {
        let dbStatus = addFormValues.status || 'New Query';
        if (dbStatus === 'New Query') {
          dbStatus = 'unread';
        } else if (dbStatus === 'In Process') {
          dbStatus = 'read';
        }

        const docRef = await addDoc(collection(db, 'messages'), {
          name: addFormValues.name || '',
          email: addFormValues.email || '',
          service: addFormValues.subject || '',
          message: addFormValues.message || '',
          status: dbStatus,
          createdAt: serverTimestamp()
        });

        // Setup temporary view select
        const newTicket: InboxTicket = {
          id: docRef.id,
          name: addFormValues.name || 'Anonymous',
          email: addFormValues.email || 'No Email',
          subject: addFormValues.subject || 'Direct Contact',
          message: addFormValues.message || '',
          date: new Date().toISOString().split('T')[0],
          status: addFormValues.status || 'New Query'
        };
        setSelectedTicket(newTicket);
      } catch (err) {
        console.error("Failed to add message to Firestore:", err);
      }
    } else {
      const newQuery: QueryRecord = {
        ...addFormValues,
        status: addFormValues.status || 'New Query',
        priority: addFormValues.priority || 'Medium'
      };
      saveQueryRecords([newQuery, ...queryRecords]);
      setSelectedQuery(newQuery);
    }
    setShowAddModal(false);
  };

  return (
    <div className="pt-32 pb-32 px-4 sm:px-6 md:px-12 w-full max-w-7xl mx-auto min-h-[85vh] flex flex-col justify-start">
      {!marketingUser ? (
        /* Secure Login Card */
        <div className="w-full max-w-md mx-auto my-auto relative z-10">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#58a6ff]/10 to-transparent blur-3xl -z-10 rounded-full w-72 h-72 mx-auto"></div>
          
          <div className="bg-[#161b22]/90 border border-[#30363d] p-8 md:p-10 rounded-3xl shadow-2xl backdrop-blur-md">
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-[#58a6ff]/10 border border-[#30363d] rounded-2xl flex items-center justify-center text-[#58a6ff] mx-auto mb-4 shadow-xl">
                <Lock size={22} />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Marketing Portal</h2>
              <p className="text-xs text-[#8b949e] mt-1 font-mono uppercase tracking-wider">Secure Access Authorization</p>
            </div>

            {loginError && (
              <div className="flex items-start gap-3 bg-red-950/40 border border-red-900/60 p-4 rounded-xl text-xs text-red-400 mb-6 font-sans">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold uppercase tracking-wider block mb-0.5">Access Denied</span>
                  {loginError}
                </div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 font-mono">
                  User ID
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-zinc-600">
                    <UserIcon size={16} />
                  </span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter unique ID"
                    className="w-full bg-[#0d1117] border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white outline-none focus:border-[#58a6ff]/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 font-mono">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-zinc-600">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#0d1117] border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white outline-none focus:border-[#58a6ff]/50 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 bg-[#1f6feb] hover:bg-[#238636] text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-emerald-950/20"
              >
                {isSubmitting ? (
                  <span className="inline-block animate-pulse">Authenticating...</span>
                ) : (
                  <>
                    <span>Enter Portal</span>
                    <ChevronRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Redesigned Portal Workspace */
        <div className="space-y-8 w-full">
          {/* Header Dashboard panel */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#30363d]/85 pb-6 gap-4">
            <div>
              <div className="text-[#58a6ff] text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] mb-1.5 font-mono">
                Corporate Core — Verified Session
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
                Marketing <span className="italic text-[#58a6ff] font-serif font-medium">Matrix</span>
              </h1>
              <p className="text-xs text-[#8b949e] mt-1.5 leading-relaxed tracking-wide font-light">
                Secure Marketer ID: <span className="font-mono text-white font-bold bg-[#161b22] border border-[#30363d] px-2 py-0.5 rounded text-[11px]">{marketingUser.username}</span>
              </p>
            </div>
            
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 bg-red-950/30 text-red-400 hover:text-white hover:bg-red-800/80 border border-red-900/40 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer"
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          </div>

          {/* New Portal Layout Grid: Sidebar on left, Content Area on right */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* LEFT SIDEBAR MENU PANEL */}
            <div className="md:col-span-3 space-y-4">
              <div className="bg-[#161b22]/70 border border-[#30363d]/80 rounded-2xl p-4 space-y-3 shadow-xl">
                <div className="text-[10px] font-mono font-extrabold text-[#8b949e] uppercase tracking-[0.2em] px-3 pb-1 border-b border-[#30363d]/40">
                  Matrix Workspace
                </div>
                
                <nav className="space-y-1.5">
                  <button
                    onClick={() => {
                      setActiveModule('inbox');
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      activeModule === 'inbox' 
                        ? 'bg-[#1f6feb]/15 text-[#58a6ff] border border-[#1f6feb]/35 shadow-md shadow-[#58a6ff]/5' 
                        : 'text-zinc-400 hover:text-white hover:bg-[#161b22]/80 border border-transparent'
                    }`}
                  >
                    <InboxIcon size={16} />
                    <span>Inbox</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveModule('queries');
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      activeModule === 'queries' 
                        ? 'bg-[#1f6feb]/15 text-[#58a6ff] border border-[#1f6feb]/35 shadow-md shadow-[#58a6ff]/5'
                        : 'text-zinc-400 hover:text-white hover:bg-[#161b22]/80 border border-transparent'
                    }`}
                  >
                    <MessageSquare size={16} />
                    <span>Query Management</span>
                  </button>
                </nav>
              </div>

              {/* Extra context help block */}
              <div className="hidden md:block bg-[#161b22]/20 border border-[#30363d]/40 rounded-2xl p-4 text-[11px] text-zinc-500 font-light leading-relaxed font-sans">
                <p className="flex items-center gap-1.5 text-[#58a6ff] font-mono font-semibold text-[10px] uppercase mb-1.5">
                  <Sparkles size={12} /> Live telemetry
                </p>
                This terminal displays cached corporate inquiries, request threads, and status monitors. Custom updates persist in persistent local registries.
              </div>
            </div>

            {/* RIGHT CONTENT AREA PANEL */}
            <div className="md:col-span-9 space-y-6">
              
              {activeModule === 'queries' && (
                <>
                  {/* Table search, actions, and filters header */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-5 bg-[#161b22]/40 border border-[#30363d]/60 rounded-2xl">
                    
                    {/* Search field */}
                    <div className="relative flex-1">
                      <span className="absolute left-3.5 top-3 text-zinc-500">
                        <Search size={14} />
                      </span>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setCurrentPage(1);
                        }}
                        placeholder="Search queries by customer name, category, ID..."
                        className="w-full bg-[#0d1117] border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white outline-none focus:border-[#58a6ff]/50 transition-colors"
                      />
                    </div>

                    {/* Status Filter dropdown */}
                    <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                      <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-mono font-bold uppercase">
                        <Filter size={12} className="text-zinc-500" />
                        <span>Filter:</span>
                      </div>
                      <select
                        value={statusFilter}
                        onChange={(e) => {
                          setStatusFilter(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="bg-[#0d1117] border border-zinc-850 rounded-xl px-3 py-1.5 text-xs text-zinc-300 outline-none focus:border-[#58a6ff]/40 font-mono cursor-pointer"
                      >
                        <option value="all">All States</option>
                        <option value="New Query">New Query</option>
                        <option value="In Process">In Process</option>
                        <option value="Won">Won</option>
                        <option value="Lost">Lost</option>
                      </select>

                      {/* Add record button */}
                      <button
                        onClick={handleOpenAdd}
                        className="bg-emerald-900/60 hover:bg-emerald-700 font-mono text-emerald-300 hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border border-emerald-800/60 flex items-center gap-1.5 cursor-pointer ml-auto transition-colors"
                      >
                        <Plus size={14} />
                        <span>Create Mock</span>
                      </button>
                    </div>

                  </div>

                  {/* Pipeline progression monitor section */}
                  <div id="pipeline-filter-bar" className="bg-[#161b22]/40 border border-[#30363d]/60 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#1f6feb] animate-pulse"></div>
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">Lead Pipeline Monitor:</span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:flex md:items-center gap-2.5 flex-grow md:justify-end">
                      {/* NEW QUERY BUTTON */}
                      <button
                        id="pipeline-btn-new-query"
                        onClick={() => handlePipelineTabChange('NEW_QUERY')}
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer border ${
                          pipelineTab === 'NEW_QUERY'
                            ? 'bg-[#1f6feb]/15 text-[#58a6ff] border-[#1f6feb]/65 shadow-md shadow-[#58a6ff]/5 font-extrabold scale-[1.02]'
                            : 'bg-[#161b22]/30 text-zinc-400 hover:text-[#58a6ff] border-[#30363d]/40'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#58a6ff]"></span>
                        <span>New Query</span>
                      </button>

                      {/* INPROCESS BUTTON */}
                      <button
                        id="pipeline-btn-inprocess"
                        onClick={() => handlePipelineTabChange('INPROCESS')}
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer border ${
                          pipelineTab === 'INPROCESS'
                            ? 'bg-amber-500/15 text-amber-500 border-amber-500/65 shadow-md shadow-amber-500/5 font-extrabold scale-[1.02]'
                            : 'bg-[#161b22]/30 text-zinc-400 hover:text-amber-500 border-[#30363d]/40'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        <span>In-Process</span>
                      </button>

                      {/* WON BUTTON */}
                      <button
                        id="pipeline-btn-won"
                        onClick={() => handlePipelineTabChange('WON')}
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer border ${
                          pipelineTab === 'WON'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/65 shadow-md shadow-emerald-500/5 font-extrabold scale-[1.02]'
                            : 'bg-[#161b22]/30 text-zinc-400 hover:text-[#2ea44f] border-[#30363d]/40'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        <span>Won</span>
                      </button>

                      {/* LOST BUTTON */}
                      <button
                        id="pipeline-btn-lost"
                        onClick={() => handlePipelineTabChange('LOST')}
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer border ${
                          pipelineTab === 'LOST'
                            ? 'bg-red-500/15 text-red-100 border-red-500/65 shadow-md shadow-red-500/5 font-extrabold scale-[1.02]'
                            : 'bg-[#161b22]/30 text-zinc-400 hover:text-[#cf222e] border-[#30363d]/40'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                        <span>Lost</span>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* ACTIVE TAB: INBOX DATA TABLE */}
              {activeModule === 'inbox' && (
                <div className="bg-[#161b22]/40 border border-[#30363d]/60 rounded-2xl overflow-hidden shadow-xl">
                  {/* Table Header block */}
                  <div className="p-4 border-b border-[#30363d] flex items-center justify-between bg-[#161b22]/60">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <InboxIcon size={16} className="text-[#58a6ff]" />
                      <span>Security Inbox System</span>
                    </h3>
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded border border-zinc-800 text-zinc-400 bg-zinc-950 font-bold">
                      {processedData.length} Matches
                    </span>
                  </div>

                  {currentItems.length === 0 ? (
                    inboxTickets.length === 0 ? (
                      <div className="py-24 px-6 text-center flex flex-col items-center justify-center max-w-md mx-auto">
                        <div className="relative mb-6">
                          <div className="absolute inset-0 bg-[#58a6ff]/5 w-16 h-16 rounded-full blur-xl mx-auto -translate-y-2"></div>
                          <div className="w-14 h-14 bg-[#161b22] border border-[#30363d]/80 rounded-2xl flex items-center justify-center text-[#58a6ff]/80 shadow-xl mx-auto relative transition-all hover:scale-105 duration-300">
                            <InboxIcon size={24} className="animate-pulse" />
                          </div>
                        </div>
                        <h4 className="text-sm font-bold text-white mb-2 tracking-wide font-mono uppercase">No Inquiries Found</h4>
                        <p className="text-xs text-[#8b949e] font-sans font-light leading-relaxed">
                          Your corporate portal has no customer inquiries or routing messages saved in the database right now.
                        </p>
                      </div>
                    ) : (
                      <div className="py-20 text-center text-xs text-[#8b949e] flex flex-col items-center justify-center">
                        <AlertCircle size={28} className="mx-auto mb-3 text-zinc-600" />
                        <p className="font-semibold text-zinc-200 text-sm">No matching search entries found</p>
                        <p className="text-zinc-500 mt-1.5 font-light max-w-xs leading-relaxed">
                          No tickets match the search query "<span className="text-white font-mono">{searchTerm}</span>" under the selected filters.
                        </p>
                        <button
                          onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
                          className="mt-4 text-xs font-semibold text-[#58a6ff] hover:underline cursor-pointer transition-colors"
                        >
                          Reset search filters
                        </button>
                      </div>
                    )
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-sans">
                        <thead className="bg-[#0c1017] text-zinc-500 border-b border-[#30363d] text-[10px] font-bold uppercase tracking-wider font-mono">
                          <tr>
                            <th className="p-4 pl-6 cursor-pointer hover:text-white select-none" onClick={() => toggleSort('name')}>
                              <div className="flex items-center gap-1">
                                <span>Name</span>
                                <ArrowUpDown size={10} className="text-zinc-650" />
                              </div>
                            </th>
                            <th className="p-4 cursor-pointer hover:text-white select-none" onClick={() => toggleSort('email')}>
                              <div className="flex items-center gap-1">
                                <span>Email</span>
                                <ArrowUpDown size={10} className="text-zinc-650" />
                              </div>
                            </th>
                            <th className="p-4 cursor-pointer hover:text-white select-none" onClick={() => toggleSort('company')}>
                              <div className="flex items-center gap-1">
                                <span>Company</span>
                                <ArrowUpDown size={10} className="text-zinc-650" />
                              </div>
                            </th>
                            <th className="p-4 cursor-pointer hover:text-white select-none" onClick={() => toggleSort('service')}>
                              <div className="flex items-center gap-1">
                                <span>Service</span>
                                <ArrowUpDown size={10} className="text-zinc-650" />
                              </div>
                            </th>
                            <th className="p-4 cursor-pointer hover:text-white select-none" onClick={() => toggleSort('message')}>
                              <div className="flex items-center gap-1">
                                <span>Message</span>
                                <ArrowUpDown size={10} className="text-zinc-650" />
                              </div>
                            </th>
                            <th className="p-4 cursor-pointer hover:text-white select-none" onClick={() => toggleSort('date')}>
                              <div className="flex items-center gap-1">
                                <span>Date</span>
                                <ArrowUpDown size={10} className="text-zinc-650" />
                              </div>
                            </th>
                            <th className="p-4 cursor-pointer hover:text-white select-none pr-6" onClick={() => toggleSort('status')}>
                              <div className="flex items-center gap-1">
                                <span>Status</span>
                                <ArrowUpDown size={10} className="text-zinc-650" />
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#30363d]/45">
                          {currentItems.map((ticket) => (
                            <tr 
                              key={ticket.id} 
                              onClick={() => handleOpenView(ticket)}
                              className="hover:bg-[#161b22]/60 transition-all duration-150 cursor-pointer group"
                              title="Click to view details"
                            >
                              <td className="p-4 pl-6 font-semibold text-white">{ticket.name}</td>
                              <td className="p-4 text-zinc-400 font-mono text-[11px]">{ticket.email}</td>
                              <td className="p-4 text-zinc-300 font-medium font-mono text-[11px]">{ticket.company || 'N/A'}</td>
                              <td className="p-4 text-zinc-450 font-bold font-mono text-[10px] text-[#58a6ff]">{ticket.service || 'General Inquiry'}</td>
                              <td className="p-4 text-zinc-350 font-light truncate max-w-[200px]" title={ticket.message}>
                                {ticket.message}
                              </td>
                              <td className="p-4 text-zinc-450 font-mono text-[10px] whitespace-nowrap">{ticket.date}</td>
                              <td className="p-4 pr-6">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
                                  ticket.status === 'New Query' ? 'bg-blue-950/20 text-blue-400 border-blue-900/40' :
                                  ticket.status === 'In Process' ? 'bg-amber-950/20 text-amber-500 border-amber-900/40' :
                                  ticket.status === 'Won' ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/40' :
                                  'bg-red-950/20 text-red-450 border-red-900/40'
                                }`}>
                                  <span className={`w-1 h-1 rounded-full ${
                                    ticket.status === 'New Query' ? 'bg-blue-400' :
                                    ticket.status === 'In Process' ? 'bg-amber-500' :
                                    ticket.status === 'Won' ? 'bg-emerald-400' :
                                    'bg-red-500'
                                  }`} />
                                  {ticket.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Pagination control footer block */}
                  <div className="p-4 border-t border-[#30363d] flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#161b22]/30">
                    <div className="text-[11px] font-mono text-zinc-500">
                      Showing <span className="text-zinc-300 font-bold">{processedData.length > 0 ? indexOfFirstItem + 1 : 0}</span> to <span className="text-zinc-300 font-bold">{Math.min(indexOfLastItem, processedData.length)}</span> of <span className="text-zinc-300 font-bold">{processedData.length}</span> records
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className="p-2 bg-[#21262d] border border-[#30363d] text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 rounded-xl transition-all cursor-pointer flex items-center justify-center"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <span className="text-xs font-mono font-bold text-white bg-[#161b22] px-3.5 py-1.5 border border-[#30363d] rounded-xl select-none">
                        Page {currentPage} / {totalPages}
                      </span>
                      <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="p-2 bg-[#21262d] border border-[#30363d] text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 rounded-xl transition-all cursor-pointer flex items-center justify-center"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ACTIVE TAB: QUERY MANAGEMENT SPLIT-LAYOUT PANEL */}
              {activeModule === 'queries' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  
                  {/* Left Column of Splitting: Queries List and Table */}
                  <div className="lg:col-span-7 flex flex-col justify-between bg-[#161b22]/40 border border-[#30363d]/60 rounded-2xl overflow-hidden shadow-xl min-h-[460px]">
                    
                    <div>
                      <div className="p-4 border-b border-[#30363d] flex items-center justify-between bg-[#161b22]/60">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <MessageSquare size={16} className="text-[#58a6ff]" />
                          <span>Direct Support Queries</span>
                        </h3>
                        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded border border-zinc-800 text-zinc-400 bg-zinc-950 font-bold">
                          {processedData.length} Found
                        </span>
                      </div>

                      {currentItems.length === 0 ? (
                        queryRecords.length === 0 ? (
                          <div className="py-20 px-6 text-center flex flex-col items-center justify-center max-w-sm mx-auto">
                            <div className="relative mb-5">
                              <div className="absolute inset-0 bg-[#58a6ff]/5 w-14 h-14 rounded-full blur-xl mx-auto -translate-y-2"></div>
                              <div className="w-12 h-12 bg-[#161b22] border border-[#30363d]/80 rounded-2xl flex items-center justify-center text-purple-400 shadow-xl mx-auto relative transition-all hover:scale-105 duration-300">
                                <MessageSquare size={20} className="animate-pulse" />
                              </div>
                            </div>
                            <h4 className="text-xs font-extrabold text-white mb-2 tracking-wide font-mono uppercase">No Active Queries</h4>
                            <p className="text-[11px] text-[#8b949e] font-sans font-light leading-relaxed mb-5">
                              No service tickets or technical support logs are cached inside the current router partition.
                            </p>
                            <button
                              onClick={() => saveQueryRecords(DEFAULT_QUERY_RECORDS)}
                              className="px-4 py-2 bg-purple-950/40 hover:bg-purple-800/80 text-purple-300 hover:text-white border border-purple-800/40 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              Reset support queries
                            </button>
                          </div>
                        ) : (
                          <div className="py-16 text-center text-xs text-[#8b949e] flex flex-col items-center justify-center">
                            <ShieldAlert size={24} className="mx-auto mb-2 text-zinc-500" />
                            <p className="font-semibold text-zinc-200">No matching search queries</p>
                            <p className="text-zinc-500 text-[11px] font-mono mt-1 max-w-[200px]">"{searchTerm}"</p>
                            <button
                              onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
                              className="mt-3 text-[11px] font-semibold text-[#58a6ff] hover:underline cursor-pointer transition-colors"
                            >
                              Reset filters
                            </button>
                          </div>
                        )
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs font-sans">
                            <thead className="bg-[#0c1017] text-zinc-500 border-b border-[#30363d] text-[10px] font-bold uppercase tracking-wider font-mono">
                              <tr>
                                <th className="p-3 pl-4 cursor-pointer hover:text-white select-none whitespace-nowrap" onClick={() => toggleSort('id')}>
                                  <div className="flex items-center gap-1">
                                    <span>Query ID</span>
                                    <ArrowUpDown size={9} className="text-zinc-650" />
                                  </div>
                                </th>
                                <th className="p-3 cursor-pointer hover:text-white select-none whitespace-nowrap" onClick={() => toggleSort('customerName')}>
                                  <div className="flex items-center gap-1">
                                    <span>Client</span>
                                    <ArrowUpDown size={9} className="text-zinc-650" />
                                  </div>
                                </th>
                                <th className="p-3 cursor-pointer hover:text-white select-none whitespace-nowrap" onClick={() => toggleSort('priority')}>
                                  <div className="flex items-center gap-1">
                                    <span>Priority</span>
                                    <ArrowUpDown size={9} className="text-zinc-650" />
                                  </div>
                                </th>
                                <th className="p-3 cursor-pointer hover:text-white select-none whitespace-nowrap" onClick={() => toggleSort('status')}>
                                  <div className="flex items-center gap-1">
                                    <span>Status</span>
                                    <ArrowUpDown size={9} className="text-zinc-650" />
                                  </div>
                                </th>
                                <th className="p-3 text-center pr-4">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#30363d]/40">
                              {currentItems.map((record) => (
                                <tr 
                                  key={record.id} 
                                  onClick={() => setSelectedQuery(record)}
                                  className={`hover:bg-[#161b22]/35 transition-colors cursor-pointer ${selectedQuery?.id === record.id ? 'bg-[#58a6ff]/5 border-l-2 border-[#58a6ff]' : ''}`}
                                >
                                  <td className="p-3 pl-4 font-mono font-bold text-[#58a6ff] whitespace-nowrap">{record.id}</td>
                                  <td className="p-3 font-semibold text-zinc-100 truncate max-w-[100px]">{record.customerName}</td>
                                  <td className="p-3 whitespace-nowrap">
                                    <span className={`inline-block px-1.5 py-0.5 rounded font-mono text-[8.5px] font-extrabold uppercase border ${
                                      record.priority === 'Critical' ? 'bg-red-950/20 text-red-400 border-red-900/40' :
                                      record.priority === 'High' ? 'bg-amber-950/20 text-amber-500 border-amber-900/40' :
                                      record.priority === 'Medium' ? 'bg-blue-950/20 text-blue-400 border-blue-900/40' :
                                      'bg-zinc-900 text-zinc-400 border-zinc-800'
                                    }`}>
                                      {record.priority}
                                    </span>
                                  </td>
                                  <td className="p-3 whitespace-nowrap">
                                    <span className={`inline-block px-1.5 py-0.5 rounded font-mono text-[8.5px] font-bold uppercase border ${
                                      record.status === 'New Query' ? 'bg-blue-950/20 text-blue-400 border-blue-900/40' :
                                      record.status === 'In Process' ? 'bg-amber-950/20 text-amber-550 border-amber-900/40' :
                                      record.status === 'Won' ? 'bg-emerald-950/20 text-emerald-400 border-emerald-950/40' :
                                      'bg-red-950/20 text-red-500 border-red-900/40'
                                    }`}>
                                      {record.status}
                                    </span>
                                  </td>
                                  <td className="p-3 pr-4" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center justify-center gap-1.5">
                                      <button
                                        onClick={() => handleOpenEdit(record)}
                                        className="p-1 text-amber-500/85 hover:text-amber-400 border border-[#30363d]/45 bg-[#161b22] rounded transition-colors cursor-pointer"
                                        title="Quick Edit"
                                      >
                                        <Edit2 size={11} />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteItem(record.id)}
                                        className="p-1 text-red-400 hover:text-white border border-[#30363d]/45 bg-[#161b22] rounded transition-colors cursor-pointer hover:bg-red-950"
                                        title="Remove Query"
                                      >
                                        <Trash2 size={11} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Pagination in kompakten list footer */}
                    <div className="p-3 border-t border-[#30363d] flex flex-col sm:flex-row items-center justify-between gap-2.5 bg-[#161b22]/30">
                      <div className="text-[10px] font-mono text-zinc-500 text-center sm:text-left">
                        Showing <span className="text-zinc-300 font-bold">{processedData.length > 0 ? indexOfFirstItem + 1 : 0}</span>-{Math.min(indexOfLastItem, processedData.length)} of {processedData.length}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={handlePrevPage}
                          disabled={currentPage === 1}
                          className="p-1 px-1.5 bg-[#21262d] border border-[#30363d] text-zinc-400 hover:text-white disabled:opacity-20 rounded transition-all cursor-pointer"
                        >
                          <ChevronLeft size={11} />
                        </button>
                        <span className="text-[10px] font-mono font-bold text-white select-none">
                          {currentPage}/{totalPages}
                        </span>
                        <button
                          onClick={handleNextPage}
                          disabled={currentPage === totalPages}
                          className="p-1 px-1.5 bg-[#21262d] border border-[#30363d] text-zinc-400 hover:text-white disabled:opacity-20 rounded transition-all cursor-pointer"
                        >
                          <ChevronRight size={11} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Column of Splitting: Query Details Panel */}
                  <div className="lg:col-span-5 bg-[#161b22]/70 border border-[#30363d] rounded-2xl p-5 shadow-2xl flex flex-col min-h-[460px] justify-between">
                    
                    {selectedQuery ? (
                      <div className="space-y-5 h-full flex flex-col justify-between">
                        
                        <div className="space-y-4">
                          {/* ID + Priority top indicators */}
                          <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
                            <div>
                              <span className="text-[#58a6ff] font-mono font-black text-xs block">{selectedQuery.id}</span>
                              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">{selectedQuery.category}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                                selectedQuery.priority === 'Critical' ? 'bg-red-950/30 text-red-400 border-red-900/40' :
                                selectedQuery.priority === 'High' ? 'bg-amber-950/30 text-amber-500 border-amber-900/40' :
                                selectedQuery.priority === 'Medium' ? 'bg-blue-950/30 text-blue-400 border-blue-900/40' :
                                'bg-zinc-900 text-zinc-400 border-zinc-800'
                              }`}>
                                {selectedQuery.priority}
                              </span>
                            </div>
                          </div>

                          {/* Client Detail Block */}
                          <div className="grid grid-cols-2 gap-3 pt-1">
                            <div>
                              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Client Name</span>
                              <span className="text-xs font-semibold text-white block mt-0.5">{selectedQuery.customerName}</span>
                            </div>
                            <div>
                              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Assigned Staff</span>
                              <span className="text-xs font-mono font-bold text-[#58a6ff] block mt-0.5">{selectedQuery.assignedTo}</span>
                            </div>
                          </div>

                          {/* Dates and status row */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Created Date</span>
                              <span className="text-xs font-mono text-zinc-300 block mt-0.5">{selectedQuery.createdDate}</span>
                            </div>
                            <div>
                              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Current Status</span>
                              <span className="inline-block mt-0.5">
                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
                                  selectedQuery.status === 'New Query' ? 'bg-blue-950/20 text-blue-400 border-blue-900/40' :
                                  selectedQuery.status === 'In Process' ? 'bg-amber-950/20 text-amber-500 border-amber-900/40' :
                                  selectedQuery.status === 'Won' ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/40' :
                                  'bg-red-950/20 text-red-500 border-red-900/40'
                                }`}>
                                  <span className={`w-1 h-1 rounded-full ${
                                    selectedQuery.status === 'New Query' ? 'bg-blue-400' :
                                    selectedQuery.status === 'In Process' ? 'bg-amber-500' :
                                    selectedQuery.status === 'Won' ? 'bg-emerald-400' :
                                    'bg-red-500'
                                  }`} />
                                  {selectedQuery.status}
                                </span>
                              </span>
                            </div>
                          </div>

                          {/* Query Description Area */}
                          <div className="pt-2">
                            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold mb-1.5">Query Summary Description</span>
                            <div className="bg-[#0d1117] border border-[#30363d]/50 p-3.5 rounded-xl text-xs text-zinc-300 font-light leading-relaxed font-sans max-h-[120px] overflow-y-auto">
                              {selectedQuery.description}
                            </div>
                          </div>

                          {/* Administrative Notes / Comments Section */}
                          <div className="pt-3 border-t border-[#30363d]/40">
                            <span className="text-[9px] font-mono text-amber-500 uppercase tracking-widest block font-bold mb-1.5 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                              Administrative Notes / Internal Comments
                            </span>
                            <div className="space-y-2">
                              <textarea
                                value={queryNotesText[selectedQuery.id] !== undefined ? queryNotesText[selectedQuery.id] : (selectedQuery.notes || '')}
                                onChange={(e) => setQueryNotesText({ ...queryNotesText, [selectedQuery.id]: e.target.value })}
                                placeholder="Add administrative notes, audit comments, or next action steps for this client query..."
                                className="w-full bg-[#0d1117] border border-[#30363d]/70 rounded-xl p-2.5 text-xs text-zinc-200 outline-none focus:border-amber-500/50 min-h-[70px] font-sans resize-none transition-all duration-200"
                              />
                              <div className="flex justify-end">
                                <button
                                  onClick={() => handleSaveNotes(selectedQuery.id, queryNotesText[selectedQuery.id] !== undefined ? queryNotesText[selectedQuery.id] : (selectedQuery.notes || ''), false)}
                                  className="px-3 py-1 bg-amber-950/20 hover:bg-amber-800/80 text-amber-400 hover:text-white border border-amber-900/40 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-1 shadow-sm hover:shadow-md"
                                >
                                  <span>Save Note Comment</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Interactive edit and helper dispatch panel */}
                        <div className="pt-4 border-t border-[#30363d]/70 flex items-center justify-end gap-3.5 mt-4">
                          <button
                            onClick={() => handleOpenEdit(selectedQuery)}
                            className="px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-white border border-[#30363d] rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Edit2 size={12} />
                            <span>Edit Query</span>
                          </button>
                          
                          <button
                            onClick={() => handleDeleteItem(selectedQuery.id)}
                            className="px-4 py-2 bg-red-950/30 text-red-400 hover:text-white hover:bg-red-800/80 border border-red-900/30 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Trash2 size={12} />
                            <span>Remove</span>
                          </button>
                        </div>

                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-center h-full text-[#8b949e]">
                        <Info size={32} className="text-zinc-600 mb-3" />
                        <h4 className="text-sm font-bold text-white mb-1">Details Panel Clear</h4>
                        <p className="text-xs font-light max-w-xs leading-relaxed">No Query is currently active. Select any query record from the directory list on the left to display its full parameters.</p>
                      </div>
                    )}

                  </div>

                </div>
              )}

            </div>

          </div>

          {/* VIEW OVERLAY MODAL */}
          <AnimatePresence>
            {showViewModal && (activeModule === 'inbox' ? selectedTicket : selectedQuery) && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowViewModal(false)}
                  className="absolute inset-0 bg-black/80 backdrop-blur-md" 
                />
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative w-full max-w-lg bg-[#0d1117] border border-[#30363d] rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 overflow-hidden max-h-[90vh] overflow-y-auto"
                >
                  <button 
                    onClick={() => setShowViewModal(false)}
                    className="absolute top-5 right-5 text-zinc-500 hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>

                  {/* Header Title with ID */}
                  <div>
                    <span className="text-[10px] font-mono uppercase bg-[#161b22] border border-[#30363d] text-[#58a6ff] font-bold px-2 py-0.5 rounded">
                      Document Details: {activeModule === 'inbox' ? selectedTicket?.id : selectedQuery?.id}
                    </span>
                    <h3 className="text-xl font-bold text-white mt-3 leading-snug font-sans">
                      {activeModule === 'inbox' ? selectedTicket?.subject : `Customer Query File`}
                    </h3>
                  </div>

                  {activeModule === 'inbox' ? (
                    /* INBOX SPECIFIC DETAIL LAYOUT */
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 border-b border-[#30363d]/40 pb-4">
                        <div>
                          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Contact Name</span>
                          <span className="text-xs font-semibold text-white block mt-0.5">{selectedTicket?.name}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Email Address</span>
                          <span className="text-xs font-mono text-[#58a6ff] block mt-0.5 truncate">{selectedTicket?.email}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 border-b border-[#30363d]/40 pb-4">
                        <div>
                          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Receipt Date</span>
                          <span className="text-xs font-mono text-zinc-300 block mt-0.5">{selectedTicket?.date}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Action Status</span>
                          <span className="inline-block mt-0.5">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
                              selectedTicket?.status === 'New Query' ? 'bg-blue-950/20 text-blue-400 border-blue-900/40' :
                              selectedTicket?.status === 'In Process' ? 'bg-amber-950/20 text-amber-500 border-amber-900/40' :
                              selectedTicket?.status === 'Won' ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/40' :
                              'bg-red-950/20 text-red-500 border-red-900/40'
                            }`}>
                              {selectedTicket?.status}
                            </span>
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold mb-1.5">Full Message Text</span>
                        <div className="bg-[#161b22]/80 border border-[#30363d]/40 p-4 rounded-xl text-xs text-zinc-300 font-light leading-relaxed whitespace-pre-wrap font-sans max-h-[160px] overflow-y-auto">
                          {selectedTicket?.message}
                        </div>
                      </div>

                      {/* Action Routing Options (Convert to Query / Mark as Lost) */}
                      <div className="pt-3 border-t border-[#30363d]/40">
                        <span className="text-[9px] font-mono text-[#58a6ff] uppercase tracking-widest block font-bold mb-2 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#58a6ff]"></span>
                          Routing Operations
                        </span>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => selectedTicket && handleMoveInboxToQuery(selectedTicket, 'New Query')}
                            className="px-4 py-2 bg-[#2ea44f] hover:bg-[#2c974b] text-white border border-[#2ea44f]/35 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer shadow-lg flex items-center justify-center gap-1.5"
                          >
                            <span>✓ Convert to Query</span>
                          </button>
                          <button
                            onClick={() => selectedTicket && handleMoveInboxToQuery(selectedTicket, 'Lost')}
                            className="px-4 py-2 bg-[#cf222e] hover:bg-[#b91c1c] text-white border border-[#cf222e]/35 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer shadow-lg flex items-center justify-center gap-1.5"
                          >
                            <span>✗ Mark as Lost</span>
                          </button>
                        </div>
                      </div>

                      {/* Administrative Notes / Comments Section */}
                      <div className="pt-3 border-t border-[#30363d]/40">
                        <span className="text-[9px] font-mono text-amber-500 uppercase tracking-widest block font-bold mb-1.5 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                          Administrative Notes
                        </span>
                        <div className="space-y-2">
                          <textarea
                            value={selectedTicket ? (queryNotesText[selectedTicket.id] !== undefined ? queryNotesText[selectedTicket.id] : (selectedTicket.notes || '')) : ''}
                            onChange={(e) => selectedTicket && setQueryNotesText({ ...queryNotesText, [selectedTicket.id]: e.target.value })}
                            placeholder="Add administrative notes or next contact steps for this message..."
                            className="w-full bg-[#161b22]/80 border border-[#30363d]/70 rounded-xl p-2.5 text-xs text-zinc-200 outline-none focus:border-amber-500/50 min-h-[70px] font-sans resize-none transition-all duration-200"
                          />
                          <div className="flex justify-end">
                            <button
                              onClick={() => selectedTicket && handleSaveNotes(selectedTicket.id, queryNotesText[selectedTicket.id] !== undefined ? queryNotesText[selectedTicket.id] : (selectedTicket.notes || ''), true)}
                              className="px-3 py-1 bg-amber-950/20 hover:bg-amber-800/80 text-amber-400 hover:text-white border border-amber-900/40 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-1"
                            >
                              <span>Update Comments</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* QUERY SPECIFIC DETAIL LAYOUT */
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 border-b border-[#30363d]/40 pb-4">
                        <div>
                          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Customer Client</span>
                          <span className="text-xs font-semibold text-white block mt-0.5">{selectedQuery?.customerName}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Category</span>
                          <span className="text-xs font-mono text-[#58a6ff] block mt-0.5">{selectedQuery?.category}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 border-b border-[#30363d]/40 pb-4">
                        <div>
                          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Priority Status</span>
                          <span className="block mt-0.5">
                            <span className={`inline-flex px-1.5 py-0.5 rounded font-mono text-[9px] font-extrabold uppercase border ${
                              selectedQuery?.priority === 'Critical' ? 'bg-red-950/30 text-red-400 border-red-900/40' :
                              selectedQuery?.priority === 'High' ? 'bg-amber-950/30 text-amber-500 border-amber-900/40' :
                              selectedQuery?.priority === 'Medium' ? 'bg-blue-950/30 text-blue-400 border-blue-900/40' :
                              'bg-zinc-900 text-zinc-400 border-zinc-800'
                            }`}>
                              {selectedQuery?.priority}
                            </span>
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Assigned Support Staff</span>
                          <span className="text-xs font-semibold text-zinc-300 block mt-0.5">{selectedQuery?.assignedTo}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 border-b border-[#30363d]/40 pb-4">
                        <div>
                          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Created Date</span>
                          <span className="text-xs font-mono text-zinc-300 block mt-0.5">{selectedQuery?.createdDate}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Query Lifecycle State</span>
                          <span className="block mt-0.5">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
                              selectedQuery?.status === 'New Query' ? 'bg-blue-950/20 text-blue-400 border-blue-900/40' :
                              selectedQuery?.status === 'In Process' ? 'bg-amber-950/20 text-amber-500 border-amber-900/40' :
                              selectedQuery?.status === 'Won' ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/40' :
                              'bg-red-950/20 text-red-500 border-red-900/40'
                            }`}>
                              {selectedQuery?.status}
                            </span>
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold mb-1.5">Issue Description / Diagnostics</span>
                        <div className="bg-[#161b22]/80 border border-[#30363d]/40 p-4 rounded-xl text-xs text-zinc-300 font-light leading-relaxed whitespace-pre-wrap font-sans max-h-[160px] overflow-y-auto font-sans">
                          {selectedQuery?.description}
                        </div>
                      </div>

                      {/* Administrative Notes / Comments Section */}
                      <div className="pt-3 border-t border-[#30363d]/40">
                        <span className="text-[9px] font-mono text-amber-500 uppercase tracking-widest block font-bold mb-1.5 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                          Administrative Notes
                        </span>
                        <div className="space-y-2">
                          <textarea
                            value={selectedQuery ? (queryNotesText[selectedQuery.id] !== undefined ? queryNotesText[selectedQuery.id] : (selectedQuery.notes || '')) : ''}
                            onChange={(e) => selectedQuery && setQueryNotesText({ ...queryNotesText, [selectedQuery.id]: e.target.value })}
                            placeholder="Add administrative summary or audit comments..."
                            className="w-full bg-[#161b22]/80 border border-[#30363d]/70 rounded-xl p-2.5 text-xs text-zinc-200 outline-none focus:border-amber-500/50 min-h-[70px] font-sans resize-none transition-all duration-200"
                          />
                          <div className="flex justify-end">
                            <button
                              onClick={() => selectedQuery && handleSaveNotes(selectedQuery.id, queryNotesText[selectedQuery.id] !== undefined ? queryNotesText[selectedQuery.id] : (selectedQuery.notes || ''), false)}
                              className="px-3 py-1 bg-amber-950/20 hover:bg-amber-800/80 text-amber-400 hover:text-white border border-amber-900/40 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all duration-200"
                            >
                              <span>Update Comments</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Close dialogue button bottom */}
                  <div className="pt-4 border-t border-[#30363d] flex justify-end">
                    <button
                      onClick={() => setShowViewModal(false)}
                      className="px-5 py-2 bg-[#21262d] hover:bg-[#30363d] text-white border border-[#30363d] rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Dismiss View
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* EDIT DIALOGUE MODAL */}
          <AnimatePresence>
            {showEditModal && (activeModule === 'inbox' ? selectedTicket : selectedQuery) && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowEditModal(false)}
                  className="absolute inset-0 bg-black/80 backdrop-blur-md" 
                />
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative w-full max-w-lg bg-[#0d1117] border border-[#30363d] rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 overflow-hidden max-h-[90vh] overflow-y-auto"
                >
                  <button 
                    onClick={() => setShowEditModal(false)}
                    className="absolute top-5 right-5 text-zinc-500 hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>

                  {/* Icon and title header */}
                  <div className="flex items-center gap-3 border-b border-[#30363d]/50 pb-4">
                    <div className="w-10 h-10 bg-amber-950/10 border border-amber-900/60 text-amber-500 rounded-xl flex items-center justify-center">
                      <Edit2 size={16} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight">Modify Parameters</h3>
                      <p className="text-[10px] uppercase font-mono tracking-widest text-[#8b949e] mt-0.5">Record ID: {activeModule === 'inbox' ? selectedTicket?.id : selectedQuery?.id}</p>
                    </div>
                  </div>

                  <form onSubmit={handleApplyEdit} className="space-y-4">
                    
                    {activeModule === 'inbox' ? (
                      /* INBOX FORM FIELDS */
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[8.5px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">Contact Name</label>
                            <input
                              type="text"
                              required
                              value={editFormValues.name || ''}
                              onChange={(e) => setEditFormValues({ ...editFormValues, name: e.target.value })}
                              className="w-full bg-[#161b22] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#58a6ff]/50"
                            />
                          </div>
                          <div>
                            <label className="block text-[8.5px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">Email Address</label>
                            <input
                              type="email"
                              required
                              value={editFormValues.email || ''}
                              onChange={(e) => setEditFormValues({ ...editFormValues, email: e.target.value })}
                              className="w-full bg-[#161b22] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#58a6ff]/50 font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[8.5px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">Subject Header</label>
                          <input
                            type="text"
                            required
                            value={editFormValues.subject || ''}
                            onChange={(e) => setEditFormValues({ ...editFormValues, subject: e.target.value })}
                            className="w-full bg-[#161b22] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#58a6ff]/50"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[8.5px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">Creation Date</label>
                            <input
                              type="date"
                              required
                              value={editFormValues.date || ''}
                              onChange={(e) => setEditFormValues({ ...editFormValues, date: e.target.value })}
                              className="w-full bg-[#161b22] border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-[#58a6ff]/50 font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[8.5px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">Status State</label>
                            <select
                              value={editFormValues.status || 'New Query'}
                              onChange={(e) => setEditFormValues({ ...editFormValues, status: e.target.value })}
                              className="w-full bg-[#161b22] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#58a6ff]/50 font-mono text-zinc-300"
                            >
                              <option value="New Query">New Query</option>
                              <option value="In Process">In Process</option>
                              <option value="Won">Won</option>
                              <option value="Lost">Lost</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[8.5px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">Inquiry Message</label>
                          <textarea
                            rows={4}
                            required
                            value={editFormValues.message || ''}
                            onChange={(e) => setEditFormValues({ ...editFormValues, message: e.target.value })}
                            className="w-full bg-[#161b22] border border-zinc-800 rounded-xl p-4 text-xs text-white outline-none focus:border-[#58a6ff]/50"
                          />
                        </div>
                      </>
                    ) : (
                      /* QUERY MANAGEMENT FORM FIELDS */
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[8.5px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">Customer Name</label>
                            <input
                              type="text"
                              required
                              value={editFormValues.customerName || ''}
                              onChange={(e) => setEditFormValues({ ...editFormValues, customerName: e.target.value })}
                              className="w-full bg-[#161b22] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#58a6ff]/50"
                            />
                          </div>
                          <div>
                            <label className="block text-[8.5px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">Classification Category</label>
                            <input
                              type="text"
                              required
                              value={editFormValues.category || ''}
                              onChange={(e) => setEditFormValues({ ...editFormValues, category: e.target.value })}
                              className="w-full bg-[#161b22] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#58a6ff]/50 font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[8.5px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">Priority Urgency</label>
                            <select
                              value={editFormValues.priority || 'Medium'}
                              onChange={(e) => setEditFormValues({ ...editFormValues, priority: e.target.value })}
                              className="w-full bg-[#161b22] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#58a6ff]/50 font-mono text-zinc-300"
                            >
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                              <option value="Critical">Critical</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[8.5px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">Assigned Engineer</label>
                            <input
                              type="text"
                              required
                              value={editFormValues.assignedTo || ''}
                              onChange={(e) => setEditFormValues({ ...editFormValues, assignedTo: e.target.value })}
                              className="w-full bg-[#161b22] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#58a6ff]/50 font-sans font-bold"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[8.5px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">Created Date</label>
                            <input
                              type="date"
                              required
                              value={editFormValues.createdDate || ''}
                              onChange={(e) => setEditFormValues({ ...editFormValues, createdDate: e.target.value })}
                              className="w-full bg-[#161b22] border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-[#58a6ff]/50 font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[8.5px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">Query Status State</label>
                            <select
                              value={editFormValues.status || 'New Query'}
                              onChange={(e) => setEditFormValues({ ...editFormValues, status: e.target.value })}
                              className="w-full bg-[#161b22] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-[#8b949e] outline-none focus:border-[#58a6ff]/50 font-mono"
                            >
                              <option value="New Query">New Query</option>
                              <option value="In Process">In Process</option>
                              <option value="Won">Won</option>
                              <option value="Lost">Lost</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[8.5px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">Diagnostic Report / Description</label>
                          <textarea
                            rows={4}
                            required
                            value={editFormValues.description || ''}
                            onChange={(e) => setEditFormValues({ ...editFormValues, description: e.target.value })}
                            className="w-full bg-[#161b22] border border-zinc-800 rounded-xl p-4 text-xs text-white outline-none focus:border-[#58a6ff]/50"
                          />
                        </div>
                      </>
                    )}

                    <div className="pt-4 border-t border-[#30363d] flex justify-end gap-3.5">
                      <button
                        type="button"
                        onClick={() => setShowEditModal(false)}
                        className="px-5 py-2.5 bg-[#21262d] border border-[#30363d] text-zinc-400 hover:text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
                      >
                        <Check size={14} />
                        <span>Update Parameters</span>
                      </button>
                    </div>

                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* ADD MOCK DIALOGUE MODAL */}
          <AnimatePresence>
            {showAddModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowAddModal(false)}
                  className="absolute inset-0 bg-black/80 backdrop-blur-md" 
                />
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative w-full max-w-lg bg-[#0d1117] border border-[#30363d] rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 overflow-hidden max-h-[90vh] overflow-y-auto"
                >
                  <button 
                    onClick={() => setShowAddModal(false)}
                    className="absolute top-5 right-5 text-zinc-500 hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>

                  {/* Icon and title header */}
                  <div className="flex items-center gap-3 border-b border-[#30363d]/50 pb-4">
                    <div className="w-10 h-10 bg-emerald-950/20 border border-emerald-900/60 text-emerald-400 rounded-xl flex items-center justify-center">
                      <Plus size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight">Create Mock Record</h3>
                      <p className="text-[10px] uppercase font-mono tracking-widest text-[#8b949e] mt-0.5">Assigned ID: {addFormValues.id}</p>
                    </div>
                  </div>

                  <form onSubmit={handleApplyAdd} className="space-y-4">
                    
                    {activeModule === 'inbox' ? (
                      /* INBOX FORM FIELDS FOR ADDING */
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[8.5px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">Contact Name</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Liam Sterling"
                              value={addFormValues.name || ''}
                              onChange={(e) => setAddFormValues({ ...addFormValues, name: e.target.value })}
                              className="w-full bg-[#161b22] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#58a6ff]/50"
                            />
                          </div>
                          <div>
                            <label className="block text-[8.5px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">Email Address</label>
                            <input
                              type="email"
                              required
                              placeholder="l.sterling@corp.com"
                              value={addFormValues.email || ''}
                              onChange={(e) => setAddFormValues({ ...addFormValues, email: e.target.value })}
                              className="w-full bg-[#161b22] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#58a6ff]/50 font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[8.5px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">Subject Header</label>
                          <input
                            type="text"
                            required
                            placeholder="Inquiring about White-Label SaaS models"
                            value={addFormValues.subject || ''}
                            onChange={(e) => setAddFormValues({ ...addFormValues, subject: e.target.value })}
                            className="w-full bg-[#161b22] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#58a6ff]/50"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[8.5px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">Creation Date</label>
                            <input
                              type="date"
                              required
                              value={addFormValues.date || ''}
                              onChange={(e) => setAddFormValues({ ...addFormValues, date: e.target.value })}
                              className="w-full bg-[#161b22] border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-[#58a6ff]/50 font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[8.5px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">Status State</label>
                            <select
                              value={addFormValues.status || 'New Query'}
                              onChange={(e) => setAddFormValues({ ...addFormValues, status: e.target.value })}
                              className="w-full bg-[#161b22] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#58a6ff]/50 font-mono text-zinc-300"
                            >
                              <option value="New Query">New Query</option>
                              <option value="In Process">In Process</option>
                              <option value="Won">Won</option>
                              <option value="Lost">Lost</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[8.5px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">Inquiry Message</label>
                          <textarea
                            rows={3}
                            required
                            placeholder="Type simulated query message here..."
                            value={addFormValues.message || ''}
                            onChange={(e) => setAddFormValues({ ...addFormValues, message: e.target.value })}
                            className="w-full bg-[#161b22] border border-zinc-800 rounded-xl p-4 text-xs text-white outline-none focus:border-[#58a6ff]/50"
                          />
                        </div>
                      </>
                    ) : (
                      /* QUERY MANAGEMENT FORM FIELDS FOR ADDING */
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[8.5px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">Customer Name</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Diana Prince"
                              value={addFormValues.customerName || ''}
                              onChange={(e) => setAddFormValues({ ...addFormValues, customerName: e.target.value })}
                              className="w-full bg-[#161b22] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#58a6ff]/50"
                            />
                          </div>
                          <div>
                            <label className="block text-[8.5px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">Classification Category</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Enterprise AI"
                              value={addFormValues.category || ''}
                              onChange={(e) => setAddFormValues({ ...addFormValues, category: e.target.value })}
                              className="w-full bg-[#161b22] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#58a6ff]/50 font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[8.5px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">Priority Urgency</label>
                            <select
                              value={addFormValues.priority || 'Medium'}
                              onChange={(e) => setAddFormValues({ ...addFormValues, priority: e.target.value })}
                              className="w-full bg-[#161b22] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#58a6ff]/50 font-mono text-zinc-350"
                            >
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                              <option value="Critical">Critical</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[8.5px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">Assigned Engineer</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Vishal"
                              value={addFormValues.assignedTo || ''}
                              onChange={(e) => setAddFormValues({ ...addFormValues, assignedTo: e.target.value })}
                              className="w-full bg-[#161b22] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#58a6ff]/50"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[8.5px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">Created Date</label>
                            <input
                              type="date"
                              required
                              value={addFormValues.createdDate || ''}
                              onChange={(e) => setAddFormValues({ ...addFormValues, createdDate: e.target.value })}
                              className="w-full bg-[#161b22] border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-[#58a6ff]/50 font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[8.5px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">Query Status State</label>
                            <select
                              value={addFormValues.status || 'New Query'}
                              onChange={(e) => setAddFormValues({ ...addFormValues, status: e.target.value })}
                              className="w-full bg-[#161b22] border border-[#30363d]/60 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#58a6ff]/50 font-mono text-zinc-350"
                            >
                              <option value="New Query">New Query</option>
                              <option value="In Process">In Process</option>
                              <option value="Won">Won</option>
                              <option value="Lost">Lost</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[8.5px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">Diagnostic Report / Description</label>
                          <textarea
                            rows={3}
                            required
                            placeholder="Type query documentation / logs summary here..."
                            value={addFormValues.description || ''}
                            onChange={(e) => setAddFormValues({ ...addFormValues, description: e.target.value })}
                            className="w-full bg-[#161b22] border border-zinc-800 rounded-xl p-4 text-xs text-white outline-none focus:border-[#58a6ff]/50"
                          />
                        </div>
                      </>
                    )}

                    <div className="pt-4 border-t border-[#30363d] flex justify-end gap-3.5">
                      <button
                        type="button"
                        onClick={() => setShowAddModal(false)}
                        className="px-5 py-2.5 bg-[#21262d] border border-[#30363d] text-zinc-400 hover:text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-emerald-650 hover:bg-emerald-600 border border-emerald-800 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
                      >
                        <CheckCircle size={14} />
                        <span>Provision Mock</span>
                      </button>
                    </div>

                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

        </div>
      )}
    </div>
  );
}
