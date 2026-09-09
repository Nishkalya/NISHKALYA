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
  Shield,
  Clock,
  AlertTriangle,
  Info,
  ChevronDown,
  Menu,
  ArrowLeft,
  Sun,
  Moon
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
import MarketingSidebar from './marketing/MarketingSidebar';
import MarketingInboxTable from './marketing/MarketingInboxTable';
import MarketingQueriesView from './marketing/MarketingQueriesView';
import NotesAndDetailsWidget, {
  CommentItem,
  NotesData,
  parseNotesData,
  serializeNotesData
} from './marketing/NotesAndDetailsWidget';

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
  onOpenAdmin?: () => void;
  onExitPortal?: () => void;
}

// Default Seed Datasets (initialized empty to start from 0 records)
const DEFAULT_INBOX_TICKETS: InboxTicket[] = [];

const DEFAULT_QUERY_RECORDS: QueryRecord[] = [];

export default function MarketingPage({ marketingUser, setMarketingUser, onOpenAdmin, onExitPortal }: MarketingPageProps) {
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
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Form states for creating or editing entries
  const [editFormValues, setEditFormValues] = useState<any>({});
  const [addFormValues, setAddFormValues] = useState<any>({});
  const [queryNotesText, setQueryNotesText] = useState<Record<string, string>>({});

  // Clear all data table records and start from 0
  const handleClearAllData = () => {
    setQueryRecords([]);
    setSelectedQuery(null);
    localStorage.setItem('nishkalya_marketing_queries', JSON.stringify([]));
    if (activeModule === 'inbox') {
      setInboxTickets([]);
      setSelectedTicket(null);
      localStorage.setItem('nishkalya_marketing_inbox', JSON.stringify([]));
    }
    setCurrentPage(1);
  };

  // Initialize and synchronize localStorage starting cleanly from 0
  useEffect(() => {
    if (marketingUser) {
      const hasWipedLegacyMock = localStorage.getItem('nishkalya_marketing_zero_init_v3');
      if (!hasWipedLegacyMock) {
        localStorage.setItem('nishkalya_marketing_queries', JSON.stringify([]));
        localStorage.setItem('nishkalya_marketing_inbox', JSON.stringify([]));
        localStorage.setItem('nishkalya_marketing_zero_init_v3', 'true');
        setQueryRecords([]);
        setSelectedQuery(null);
      } else {
        const storedQueries = localStorage.getItem('nishkalya_marketing_queries');
        if (storedQueries) {
          try {
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
          } catch {
            setQueryRecords([]);
          }
        } else {
          setQueryRecords([]);
          localStorage.setItem('nishkalya_marketing_queries', JSON.stringify([]));
        }
      }
    }
  }, [marketingUser]);

  // Real-time Firestore synchronization for Marketing Inbox (Inquiry Dashboard Data Integration)
  useEffect(() => {
    if (marketingUser) {
      const q = collection(db, 'messages');
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
            notes: data.notes || '',
            _rawCreatedAt: data.createdAt?.seconds || 0
          } as any;
        });

        // Sort in memory by timestamp/date descending
        msgs.sort((a, b) => b._rawCreatedAt - a._rawCreatedAt);

        setInboxTickets(msgs);
      }, (error) => {
        console.error('Firestore messages subscribe error:', error);
        setInboxTickets([]);
      });
      return () => unsubscribe();
    }
  }, [marketingUser]);

  // Set selected query default/active entry on module selection
  useEffect(() => {
    if (activeModule === 'queries') {
      if (queryRecords.length > 0 && !selectedQuery) {
        setSelectedQuery(queryRecords[0]);
      } else if (queryRecords.length === 0) {
        setSelectedQuery(null);
      }
    }
    if (activeModule === 'inbox') {
      if (inboxTickets.length > 0 && !selectedTicket) {
        setSelectedTicket(inboxTickets[0]);
      } else if (inboxTickets.length === 0) {
        setSelectedTicket(null);
      }
    }
    // Reset search, filters, sorting, and pagination when switching modules
    setSearchTerm('');
    setStatusFilter('all');
    setSortField('');
    setSortDirection('asc');
    setCurrentPage(1);
  }, [activeModule, queryRecords, inboxTickets]);

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
  const activeInboxTickets = inboxTickets.filter(ticket => ticket.status !== 'Lost');
  const unreadInboxTickets = inboxTickets.filter(ticket => ticket.status === 'New Query');
  const inboxCount = unreadInboxTickets.length;

  const getProcessedData = () => {
    if (activeModule === 'inbox') {
      let filtered = [...activeInboxTickets];

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
      setShowViewModal(true);
    } else {
      setSelectedQuery(item);
    }
  };

  // Actions: Edit
  const handleOpenEdit = (item: any) => {
    if (activeModule === 'inbox') {
      setSelectedTicket(item);
      setEditFormValues({ ...item });
    } else {
      setSelectedQuery(item);
      setEditFormValues({ 
        ...item, 
        description: item.description ? item.description.replace(/\[Moved from Inbox ID: .*?\]\n*/g, '') : ''
      });
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
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);

  const confirmAndDeleteItem = async (id: string) => {
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
    setDeleteCandidateId(null);
    // Readjust current page if it's out of bounds
    const nextMaxPage = Math.ceil(Math.max(1, getProcessedData().length - 1) / itemsPerPage);
    if (currentPage > nextMaxPage) {
      setCurrentPage(nextMaxPage);
    }
  };

  const handleDeleteItem = (id: string) => {
    setDeleteCandidateId(id);
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

  // Helper to update priority directly from the detail view
  const handleUpdatePriority = (priorityVal: 'Low' | 'Medium' | 'High' | 'Critical') => {
    if (selectedQuery) {
      const updated = queryRecords.map(q => q.id === selectedQuery.id ? { ...q, priority: priorityVal } : q);
      saveQueryRecords(updated);
      setSelectedQuery({
        ...selectedQuery,
        priority: priorityVal
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

  // Convert inbox message to query management (New Query or Lost)
  const handleMoveInboxToQuery = async (ticket: InboxTicket, statusVal: 'New Query' | 'Lost' = 'New Query') => {
    const newId = `QRY-${Math.floor(1000 + Math.random() * 9000)}`;
    const newQuery: QueryRecord = {
      id: newId,
      customerName: ticket.name,
      category: ticket.service && ticket.service !== 'Select a service' ? ticket.service : 'General Inquiry',
      priority: 'Medium',
      assignedTo: 'Vishal',
      createdDate: ticket.date,
      status: statusVal,
      description: `Subject: ${ticket.subject}\n\nMessage: ${ticket.message}`,
      notes: ticket.notes || ''
    };

    const updatedQueries = [newQuery, ...queryRecords];
    saveQueryRecords(updatedQueries);
    setSelectedQuery(newQuery);

    try {
      const docRef = doc(db, 'messages', ticket.id);
      let dbStatus = statusVal === 'Lost' ? 'lost' : 'read';
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

  const newQueryCount = queryRecords.filter(q => q.status === 'New Query').length;
  const inProcessCount = queryRecords.filter(q => q.status === 'In Process').length;
  const wonCount = queryRecords.filter(q => q.status === 'Won').length;
  const lostCount = queryRecords.filter(q => q.status === 'Lost').length;

  const [portalTheme, setPortalTheme] = useState<'white' | 'dark'>('white');

  return (
    <div className={`h-screen w-full overflow-hidden flex flex-col font-sans transition-colors ${portalTheme === 'white' ? 'marketing-portal-white bg-[#F8FAFC] text-slate-800' : 'marketing-portal-dark bg-[#090d13] text-slate-100'}`}>
      {!marketingUser ? (
        /* Secure Login Card */
        <div className="h-full w-full overflow-hidden flex items-center justify-center p-4 relative z-10">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#58a6ff]/10 to-transparent blur-3xl -z-10 rounded-full w-72 h-72 mx-auto"></div>
          
          <div className="bg-[#161b22]/90 border border-[#30363d] p-8 md:p-10 rounded-3xl shadow-2xl backdrop-blur-md flex flex-col">
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

            {onOpenAdmin && (
              <div className="flex flex-col gap-2.5 pt-5 mt-5 border-t border-[#30363d]/60">
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  className="w-full py-3 bg-[#0d1117] hover:bg-[#21262d] text-zinc-300 hover:text-white border border-[#30363d] hover:border-[#58a6ff]/50 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Shield size={14} className="text-[#58a6ff]" />
                  <span>Admin Login</span>
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Redesigned ERP Full-Height Fixed Portal Layout */
        <div className="h-full w-full overflow-hidden flex flex-col relative">
          <div className="h-full w-full overflow-hidden flex flex-1 relative">
            {/* Mobile Collapsible Sidebar Drawer */}
            <AnimatePresence>
              {isSidebarOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsSidebarOpen(false)}
                    className="fixed inset-0 bg-black/60 z-[100] lg:hidden backdrop-blur-sm"
                  />
                  
                  <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                    className="fixed top-0 left-0 bottom-0 w-72 max-w-[85vw] z-[101] lg:hidden shadow-2xl"
                  >
                    <MarketingSidebar 
                      marketingUser={marketingUser}
                      activeModule={activeModule}
                      setActiveModule={setActiveModule}
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                      statusFilter={statusFilter}
                      setStatusFilter={setStatusFilter}
                      pipelineTab={pipelineTab}
                      handlePipelineTabChange={handlePipelineTabChange}
                      inboxCount={inboxCount}
                      queryCount={queryRecords.length}
                      newQueryCount={newQueryCount}
                      inProcessCount={inProcessCount}
                      wonCount={wonCount}
                      lostCount={lostCount}
                      onOpenAdmin={onOpenAdmin}
                      onOpenAdd={handleOpenAdd}
                      onExitPortal={onExitPortal}
                      handleLogout={handleLogout}
                      setCurrentPage={setCurrentPage}
                      isMobileDrawer={true}
                      onCloseMobileDrawer={() => setIsSidebarOpen(false)}
                      portalTheme={portalTheme}
                      setPortalTheme={setPortalTheme}
                    />
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* ERP Left Sidebar Navigation (Fixed width ~260px / w-64) */}
            <aside className={`hidden lg:flex w-64 shrink-0 h-full flex-col select-none border-r transition-colors ${portalTheme === 'white' ? 'bg-white border-slate-200' : 'border-slate-800/80 bg-[#0d1117]'}`}>
              <MarketingSidebar 
                marketingUser={marketingUser}
                activeModule={activeModule}
                setActiveModule={setActiveModule}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                pipelineTab={pipelineTab}
                handlePipelineTabChange={handlePipelineTabChange}
                inboxCount={inboxCount}
                queryCount={queryRecords.length}
                newQueryCount={newQueryCount}
                inProcessCount={inProcessCount}
                wonCount={wonCount}
                lostCount={lostCount}
                onOpenAdmin={onOpenAdmin}
                onOpenAdd={handleOpenAdd}
                onExitPortal={onExitPortal}
                handleLogout={handleLogout}
                setCurrentPage={setCurrentPage}
                portalTheme={portalTheme}
                setPortalTheme={setPortalTheme}
              />
            </aside>

            {/* Right-Side Scrollable Content Area */}
            <main className={`flex-1 h-full overflow-hidden p-3 lg:p-4 flex flex-col space-y-3 min-h-0 transition-colors ${portalTheme === 'white' ? 'bg-[#F8FAFC]' : 'bg-[#090d13]'}`}>
              {/* ERP Breadcrumb & Status Header */}
              <div className={`shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 p-3 rounded-xl border transition-colors ${portalTheme === 'white' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#161b22]/70 border-slate-800'}`}>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className={`lg:hidden p-1.5 rounded-lg border transition-all cursor-pointer flex items-center justify-center ${portalTheme === 'white' ? 'text-slate-600 hover:text-slate-900 bg-slate-100 border-slate-200 hover:bg-slate-200' : 'text-slate-400 hover:text-white bg-[#0d1117] border-slate-800 hover:bg-[#21262d]'}`}
                    title="Open Navigation"
                  >
                    <Menu size={15} />
                  </button>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-slate-500 font-bold uppercase">ERP</span>
                    <span className={portalTheme === 'white' ? 'text-slate-300' : 'text-slate-700'}>/</span>
                    <span className={`font-bold uppercase ${portalTheme === 'white' ? 'text-slate-700' : 'text-slate-400'}`}>Marketing</span>
                    <span className={portalTheme === 'white' ? 'text-slate-300' : 'text-slate-700'}>/</span>
                    <span className="text-sky-600 dark:text-sky-400 font-bold uppercase">
                      {activeModule === 'inbox' ? 'Inbox' : 'Query Hub & Metrics'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono text-[11px]">
                  {/* Theme Switcher in header */}
                  <button
                    onClick={() => setPortalTheme(prev => prev === 'white' ? 'dark' : 'white')}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${portalTheme === 'white' ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200' : 'bg-[#161b22] border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'}`}
                    title="Toggle Portal Theme"
                  >
                    {portalTheme === 'white' ? (
                      <>
                        <Sun size={12} className="text-amber-500" />
                        <span className="font-bold">White Theme</span>
                      </>
                    ) : (
                      <>
                        <Moon size={12} className="text-sky-400" />
                        <span className="font-bold">Dark Theme</span>
                      </>
                    )}
                  </button>

                  {searchTerm && (
                    <span className={`px-2 py-0.5 rounded border font-bold flex items-center gap-1 ${portalTheme === 'white' ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-sky-950/40 text-sky-400 border-sky-800/60'}`}>
                      Search: "{searchTerm}"
                      <button onClick={() => { setSearchTerm(''); setCurrentPage(1); }} className="hover:opacity-80 cursor-pointer"><X size={10} /></button>
                    </span>
                  )}
                  {statusFilter !== 'all' && (
                    <span className={`px-2 py-0.5 rounded border font-bold flex items-center gap-1 ${portalTheme === 'white' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-amber-950/40 text-amber-400 border-amber-800/60'}`}>
                      Status: {statusFilter}
                      <button onClick={() => { setStatusFilter('all'); setCurrentPage(1); }} className="hover:opacity-80 cursor-pointer"><X size={10} /></button>
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded border font-semibold ${portalTheme === 'white' ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                    {processedData.length} records
                  </span>
                </div>
              </div>

              {/* Dynamic Module Workspace */}
              {activeModule === 'inbox' ? (
                <MarketingInboxTable 
                  currentItems={currentItems as InboxTicket[]}
                  processedData={processedData as InboxTicket[]}
                  totalTicketsCount={inboxTickets.length}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  setStatusFilter={setStatusFilter}
                  toggleSort={toggleSort}
                  handleOpenView={handleOpenView}
                  handlePrevPage={handlePrevPage}
                  handleNextPage={handleNextPage}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  indexOfFirstItem={indexOfFirstItem}
                  indexOfLastItem={indexOfLastItem}
                  portalTheme={portalTheme}
                />
              ) : (
                <MarketingQueriesView 
                  pipelineTab={pipelineTab}
                  handlePipelineTabChange={handlePipelineTabChange}
                  newQueryCount={newQueryCount}
                  inProcessCount={inProcessCount}
                  wonCount={wonCount}
                  lostCount={lostCount}
                  currentItems={currentItems as QueryRecord[]}
                  processedData={processedData as QueryRecord[]}
                  totalQueriesCount={queryRecords.length}
                  selectedQuery={selectedQuery}
                  setSelectedQuery={setSelectedQuery}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  setStatusFilter={setStatusFilter}
                  toggleSort={toggleSort}
                  handleOpenAdd={handleOpenAdd}
                  handleOpenEdit={handleOpenEdit}
                  handleOpenView={handleOpenView}
                  handleDeleteItem={handleDeleteItem}
                  handleUpdateStatus={handleUpdateStatus}
                  handleUpdatePriority={handleUpdatePriority}
                  isChangingStatus={isChangingStatus}
                  setIsChangingStatus={setIsChangingStatus}
                  onSaveNotes={handleSaveNotes}
                  marketingUser={marketingUser}
                  handlePrevPage={handlePrevPage}
                  handleNextPage={handleNextPage}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  indexOfFirstItem={indexOfFirstItem}
                  indexOfLastItem={indexOfLastItem}
                  portalTheme={portalTheme}
                />
              )}
            </main>
          </div>

                    {/* VIEW OVERLAY MODAL */}
          <AnimatePresence>
            {showViewModal && activeModule === 'inbox' && selectedTicket && (
              <div className={`fixed inset-0 z-[100] overflow-y-auto p-4 md:p-12 w-full h-full ${portalTheme === 'white' ? 'bg-slate-50' : 'bg-[#0d1117]'}`}>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className={`relative w-full max-w-4xl mx-auto rounded-3xl p-6 md:p-10 shadow-2xl space-y-6 border ${
                    portalTheme === 'white'
                      ? 'bg-white border-slate-200 text-slate-800 shadow-xl'
                      : 'bg-[#161b22] border-[#30363d] text-white shadow-2xl'
                  }`}
                >
                  <button 
                    onClick={() => setShowViewModal(false)}
                    className={`absolute top-5 right-5 transition-colors cursor-pointer ${
                      portalTheme === 'white' ? 'text-slate-400 hover:text-slate-700' : 'text-zinc-500 hover:text-white'
                    }`}
                  >
                    <X size={18} />
                  </button>

                  {/* Header Title with ID */}
                  <div>
                    <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded border ${
                      portalTheme === 'white'
                        ? 'bg-sky-50 border-sky-200 text-sky-700'
                        : 'bg-[#161b22] border-[#30363d] text-[#58a6ff]'
                    }`}>
                      Document Details: {selectedTicket?.id}
                    </span>
                    <h3 className={`text-xl font-bold mt-3 leading-snug font-sans ${
                      portalTheme === 'white' ? 'text-slate-900' : 'text-white'
                    }`}>
                      {selectedTicket?.subject}
                    </h3>
                  </div>
                  {/* INBOX SPECIFIC DETAIL LAYOUT */}
                  <div className="space-y-4">
                      <div className={`grid grid-cols-2 gap-4 pb-4 border-b ${
                        portalTheme === 'white' ? 'border-slate-100' : 'border-[#30363d]/40'
                      }`}>
                        <div>
                          <span className={`text-[9px] font-mono uppercase tracking-widest block font-bold ${
                            portalTheme === 'white' ? 'text-slate-400' : 'text-zinc-500'
                          }`}>Contact Name</span>
                          <span className={`text-xs font-semibold block mt-0.5 ${
                            portalTheme === 'white' ? 'text-slate-800' : 'text-white'
                          }`}>{selectedTicket?.name}</span>
                        </div>
                        <div>
                          <span className={`text-[9px] font-mono uppercase tracking-widest block font-bold ${
                            portalTheme === 'white' ? 'text-slate-400' : 'text-zinc-500'
                          }`}>Email Address</span>
                          <span className={`text-xs font-mono block mt-0.5 truncate ${
                            portalTheme === 'white' ? 'text-sky-700' : 'text-[#58a6ff]'
                          }`}>{selectedTicket?.email}</span>
                        </div>
                      </div>

                      <div className={`grid grid-cols-2 gap-4 pb-4 border-b ${
                        portalTheme === 'white' ? 'border-slate-100' : 'border-[#30363d]/40'
                      }`}>
                        <div>
                          <span className={`text-[9px] font-mono uppercase tracking-widest block font-bold ${
                            portalTheme === 'white' ? 'text-slate-400' : 'text-zinc-500'
                          }`}>Receipt Date</span>
                          <span className={`text-xs font-mono block mt-0.5 ${
                            portalTheme === 'white' ? 'text-slate-600' : 'text-zinc-300'
                          }`}>{selectedTicket?.date}</span>
                        </div>
                        <div>
                          <span className={`text-[9px] font-mono uppercase tracking-widest block font-bold ${
                            portalTheme === 'white' ? 'text-slate-400' : 'text-zinc-500'
                          }`}>Action Status</span>
                          <span className="inline-block mt-0.5">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
                              selectedTicket?.status === 'New Query' ? (portalTheme === 'white' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-blue-950/20 text-blue-400 border-blue-900/40') :
                              selectedTicket?.status === 'In Process' ? (portalTheme === 'white' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-amber-950/20 text-amber-500 border-amber-900/40') :
                              selectedTicket?.status === 'Won' ? (portalTheme === 'white' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-950/20 text-emerald-400 border-emerald-900/40') :
                              (portalTheme === 'white' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-red-950/20 text-red-500 border-red-900/40')
                            }`}>
                              {selectedTicket?.status}
                            </span>
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className={`text-[9px] font-mono uppercase tracking-widest block font-bold mb-1.5 ${
                          portalTheme === 'white' ? 'text-slate-400' : 'text-zinc-500'
                        }`}>Full Message Text</span>
                        <div className={`p-4 rounded-xl text-xs font-light leading-relaxed whitespace-pre-wrap font-sans max-h-[160px] overflow-y-auto border ${
                          portalTheme === 'white'
                            ? 'bg-slate-50 border-slate-200 text-slate-700'
                            : 'bg-[#161b22]/80 border-[#30363d]/40 text-zinc-300'
                        }`}>
                          {selectedTicket?.message}
                        </div>
                      </div>

                      {/* Action Routing Options (Convert to Query / Mark as Lost) */}
                      <div className={`pt-3 border-t ${
                        portalTheme === 'white' ? 'border-slate-100' : 'border-[#30363d]/40'
                      }`}>
                        <span className={`text-[9px] font-mono uppercase tracking-widest block font-bold mb-2 flex items-center gap-1.5 ${
                          portalTheme === 'white' ? 'text-sky-700' : 'text-[#58a6ff]'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${portalTheme === 'white' ? 'bg-sky-600' : 'bg-[#58a6ff]'}`}></span>
                          Routing Operations
                        </span>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => selectedTicket && handleMoveInboxToQuery(selectedTicket)}
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
                      <div className={`pt-3 border-t ${portalTheme === 'white' ? 'border-slate-100' : 'border-[#30363d]/40'}`}>
                        {selectedTicket && (
                          <NotesAndDetailsWidget 
                            itemId={selectedTicket.id}
                            notesText={selectedTicket.notes}
                            isInbox={true}
                            onSave={handleSaveNotes}
                            author={marketingUser?.username || 'Admin Staff'}
                            portalTheme={portalTheme}
                          />
                        )}
                      </div>
                    </div>

                  {/* Close dialogue button bottom */}
                  <div className={`pt-4 border-t flex justify-end ${
                    portalTheme === 'white' ? 'border-slate-200' : 'border-[#30363d]'
                  }`}>
                    <button
                      onClick={() => setShowViewModal(false)}
                      className={`px-5 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
                        portalTheme === 'white'
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                          : 'bg-[#21262d] hover:bg-[#30363d] text-white border-[#30363d]'
                      }`}
                    >
                      Dismiss View
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* DELETE CONFIRMATION MODAL */}
          <AnimatePresence>
            {deleteCandidateId && (
              <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setDeleteCandidateId(null)}
                  className="absolute inset-0 bg-black/80 backdrop-blur-md" 
                />
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`relative w-full max-w-sm border rounded-3xl p-6 shadow-2xl space-y-5 text-center ${
                    portalTheme === 'white' ? 'bg-white border-red-200' : 'bg-[#0d1117] border-red-900/40'
                  }`}
                >
                  <div className={`w-12 h-12 border rounded-2xl flex items-center justify-center mx-auto ${
                    portalTheme === 'white' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-red-950/40 border-red-800/60 text-red-400'
                  }`}>
                    <Trash2 size={20} />
                  </div>
                  <div>
                    <h3 className={`text-base font-bold ${portalTheme === 'white' ? 'text-slate-900' : 'text-white'}`}>Delete Record</h3>
                    <p className={`text-xs mt-1.5 font-light leading-relaxed ${portalTheme === 'white' ? 'text-slate-500' : 'text-[#8b949e]'}`}>
                      Are you sure you want to permanently remove this inquiry record? This action cannot be reversed.
                    </p>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setDeleteCandidateId(null)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                        portalTheme === 'white' ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-[#21262d] hover:bg-[#30363d] text-white'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => confirmAndDeleteItem(deleteCandidateId)}
                      className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-lg shadow-red-600/30 cursor-pointer"
                    >
                      Confirm Delete
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
                  className={`relative w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 overflow-hidden max-h-[90vh] overflow-y-auto border ${portalTheme === 'white' ? 'bg-white border-slate-200' : 'bg-[#0d1117] border-[#30363d]'}`}
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
                      <h3 className={`text-base font-bold tracking-tight ${portalTheme === 'white' ? 'text-slate-900' : 'text-white'}`}>Modify Parameters</h3>
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
                              className={`w-full border rounded-xl px-4 py-2.5 text-xs outline-none focus:border-sky-500/50 transition-colors ${portalTheme === 'white' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#161b22] border-zinc-800 text-white'}`}
                            />
                          </div>
                          <div>
                            <label className="block text-[8.5px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">Email Address</label>
                            <input
                              type="email"
                              required
                              value={editFormValues.email || ''}
                              onChange={(e) => setEditFormValues({ ...editFormValues, email: e.target.value })}
                              className={`w-full border rounded-xl px-4 py-2.5 text-xs outline-none focus:border-sky-500/50 transition-colors font-mono ${portalTheme === 'white' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#161b22] border-zinc-800 text-white'}`}
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
                            className={`w-full border rounded-xl px-4 py-2.5 text-xs outline-none focus:border-sky-500/50 transition-colors ${portalTheme === 'white' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#161b22] border-zinc-800 text-white'}`}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[8.5px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">Creation Date</label>
                            <input
                              type="date"
                              required
                              disabled
                              value={editFormValues.date || ''}
                              className={`w-full border rounded-xl px-4 py-2.5 text-xs outline-none font-mono cursor-not-allowed opacity-70 transition-colors ${portalTheme === 'white' ? 'bg-slate-100 border-slate-200 text-slate-500' : 'bg-[#161b22] border-zinc-800 text-zinc-500'}`}
                            />
                          </div>
                          <div>
                            <label className="block text-[8.5px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">Status State</label>
                            <select
                              value={editFormValues.status || 'New Query'}
                              onChange={(e) => setEditFormValues({ ...editFormValues, status: e.target.value })}
                              className={`w-full border rounded-xl px-4 py-2.5 text-xs outline-none focus:border-sky-500/50 transition-colors font-mono ${portalTheme === 'white' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#161b22] border-zinc-800 text-white'}`}
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
                            className={`w-full border rounded-xl p-4 text-xs outline-none focus:border-sky-500/50 transition-colors ${portalTheme === 'white' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#161b22] border-zinc-800 text-white'}`}
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
                              className={`w-full border rounded-xl px-4 py-2.5 text-xs outline-none focus:border-sky-500/50 transition-colors ${portalTheme === 'white' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#161b22] border-zinc-800 text-white'}`}
                            />
                          </div>
                          <div>
                            <label className="block text-[8.5px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">Classification Category</label>
                            <input
                              type="text"
                              required
                              value={editFormValues.category || ''}
                              onChange={(e) => setEditFormValues({ ...editFormValues, category: e.target.value })}
                              className={`w-full border rounded-xl px-4 py-2.5 text-xs outline-none focus:border-sky-500/50 transition-colors font-mono ${portalTheme === 'white' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#161b22] border-zinc-800 text-white'}`}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[8.5px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">Priority Urgency</label>
                            <select
                              value={editFormValues.priority || 'Medium'}
                              onChange={(e) => setEditFormValues({ ...editFormValues, priority: e.target.value })}
                              className={`w-full border rounded-xl px-4 py-2.5 text-xs outline-none focus:border-sky-500/50 transition-colors font-mono ${portalTheme === 'white' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#161b22] border-zinc-800 text-white'}`}
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
                              className={`w-full border rounded-xl px-4 py-2.5 text-xs outline-none focus:border-sky-500/50 transition-colors font-sans font-bold ${portalTheme === 'white' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#161b22] border-zinc-800 text-white'}`}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[8.5px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">Created Date</label>
                            <input
                              type="date"
                              required
                              disabled
                              value={editFormValues.createdDate || ''}
                              className={`w-full border rounded-xl px-4 py-2.5 text-xs outline-none font-mono cursor-not-allowed opacity-70 transition-colors ${portalTheme === 'white' ? 'bg-slate-100 border-slate-200 text-slate-500' : 'bg-[#161b22] border-zinc-800 text-zinc-500'}`}
                            />
                          </div>
                          <div>
                            <label className="block text-[8.5px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">Query Status State</label>
                            <select
                              value={editFormValues.status || 'New Query'}
                              onChange={(e) => setEditFormValues({ ...editFormValues, status: e.target.value })}
                              className={`w-full border rounded-xl px-4 py-2.5 text-xs outline-none focus:border-sky-500/50 transition-colors font-mono ${portalTheme === 'white' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#161b22] border-zinc-800 text-white'}`}
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
                            className={`w-full border rounded-xl p-4 text-xs outline-none focus:border-sky-500/50 transition-colors ${portalTheme === 'white' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#161b22] border-zinc-800 text-white'}`}
                          />
                        </div>
                      </>
                    )}

                    <div className="pt-4 border-t border-[#30363d] flex justify-end gap-3.5">
                      <button
                        type="button"
                        onClick={() => setShowEditModal(false)}
                        className={`px-5 py-2.5 border rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-colors ${portalTheme === 'white' ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-600' : 'bg-[#21262d] border-[#30363d] text-zinc-400 hover:text-white'}`}
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
                  className={`relative w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 overflow-hidden max-h-[90vh] overflow-y-auto border ${portalTheme === 'white' ? 'bg-white border-slate-200' : 'bg-[#0d1117] border-[#30363d]'}`}
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
                      <h3 className={`text-base font-bold tracking-tight ${portalTheme === 'white' ? 'text-slate-900' : 'text-white'}`}>Create Mock Record</h3>
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
                              className={`w-full border rounded-xl px-4 py-2.5 text-xs outline-none focus:border-sky-500/50 transition-colors ${portalTheme === 'white' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#161b22] border-zinc-800 text-white'}`}
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
                              className={`w-full border rounded-xl px-4 py-2.5 text-xs outline-none focus:border-sky-500/50 transition-colors font-mono ${portalTheme === 'white' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#161b22] border-zinc-800 text-white'}`}
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
                            className={`w-full border rounded-xl px-4 py-2.5 text-xs outline-none focus:border-sky-500/50 transition-colors ${portalTheme === 'white' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#161b22] border-zinc-800 text-white'}`}
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
                              className={`w-full border rounded-xl px-4 py-2.5 text-xs outline-none focus:border-sky-500/50 transition-colors font-mono ${portalTheme === 'white' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#161b22] border-zinc-800 text-white'}`}
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
                            className={`w-full border rounded-xl p-4 text-xs outline-none focus:border-sky-500/50 transition-colors ${portalTheme === 'white' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#161b22] border-zinc-800 text-white'}`}
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
                              className={`w-full border rounded-xl px-4 py-2.5 text-xs outline-none focus:border-sky-500/50 transition-colors ${portalTheme === 'white' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#161b22] border-zinc-800 text-white'}`}
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
                              className={`w-full border rounded-xl px-4 py-2.5 text-xs outline-none focus:border-sky-500/50 transition-colors font-mono ${portalTheme === 'white' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#161b22] border-zinc-800 text-white'}`}
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
                              className={`w-full border rounded-xl px-4 py-2.5 text-xs outline-none focus:border-sky-500/50 transition-colors ${portalTheme === 'white' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#161b22] border-zinc-800 text-white'}`}
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
                            className={`w-full border rounded-xl p-4 text-xs outline-none focus:border-sky-500/50 transition-colors ${portalTheme === 'white' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#161b22] border-zinc-800 text-white'}`}
                          />
                        </div>
                      </>
                    )}

                    <div className="pt-4 border-t border-[#30363d] flex justify-end gap-3.5">
                      <button
                        type="button"
                        onClick={() => setShowAddModal(false)}
                        className={`px-5 py-2.5 border rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-colors ${portalTheme === 'white' ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-600' : 'bg-[#21262d] border-[#30363d] text-zinc-400 hover:text-white'}`}
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
