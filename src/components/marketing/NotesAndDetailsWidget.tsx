import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  CheckSquare,
  Square,
  Plus,
  Paperclip,
  Upload,
  Download,
  FileText,
  File,
  FileImage,
  FileSpreadsheet,
  FileCode,
  Trash2,
  Maximize2,
  Minimize2,
  Clock,
  User,
  ListTodo,
  Layers,
  CheckCircle2,
  X,
  ExternalLink,
  Check,
  Tag,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export interface CommentItem {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  tag?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  priority?: 'Normal' | 'High' | 'Urgent';
  assignedTo?: string;
  createdAt: string;
  completedAt?: string;
}

export interface AttachedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  dataUrl?: string;
  uploadedAt: string;
}

export interface PlanningStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface NotesData {
  comments: CommentItem[];
  tasks: TaskItem[];
  planningSteps?: PlanningStep[];
  workflowPlanText?: string;
  attachedFiles: AttachedFile[];
  subtasks: {
    assess: boolean;
    callback: boolean;
    quote: boolean;
    audit: boolean;
  };
  channel: string;
  region: string;
  estimatedHours?: number;
  contactPreference?: string;
}

export const parseNotesData = (notesText: string | undefined): NotesData => {
  const defaultVal: NotesData = {
    comments: [],
    tasks: [],
    planningSteps: [],
    workflowPlanText: '',
    attachedFiles: [],
    subtasks: { assess: false, callback: false, quote: false, audit: false },
    channel: 'Inbound Webhook',
    region: 'North America (US-East)',
    estimatedHours: 8,
    contactPreference: 'Email / Portal'
  };

  if (!notesText) return defaultVal;
  const text = notesText.trim();
  
  if (text.startsWith('{') && text.endsWith('}')) {
    try {
      const parsed = JSON.parse(text);
      return {
        comments: Array.isArray(parsed.comments) ? parsed.comments : [],
        tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
        planningSteps: [],
        workflowPlanText: '',
        attachedFiles: Array.isArray(parsed.attachedFiles) ? parsed.attachedFiles : [],
        subtasks: {
          assess: parsed.subtasks?.assess || false,
          callback: parsed.subtasks?.callback || false,
          quote: parsed.subtasks?.quote || false,
          audit: parsed.subtasks?.audit || false,
        },
        channel: parsed.channel || defaultVal.channel,
        region: parsed.region || defaultVal.region,
        estimatedHours: parsed.estimatedHours || defaultVal.estimatedHours,
        contactPreference: parsed.contactPreference || defaultVal.contactPreference
      };
    } catch {
      // fallback
    }
  } else if (text.startsWith('[') && text.endsWith(']')) {
    try {
      const parsedComments = JSON.parse(text);
      return {
        ...defaultVal,
        comments: parsedComments
      };
    } catch (e) {
      // fallback
    }
  }

  return {
    ...defaultVal,
    comments: [{
      id: 'legacy-init',
      author: 'Audit System',
      text: notesText,
      timestamp: 'Original Entry'
    }]
  };
};

export const serializeNotesData = (data: NotesData): string => {
  return JSON.stringify(data);
};

export interface NotesAndDetailsWidgetProps {
  itemId: string;
  notesText: string | undefined;
  isInbox: boolean;
  onSave: (id: string, notesText: string, isInbox: boolean) => Promise<void>;
  author: string;
  portalTheme?: 'white' | 'dark';
}

export default function NotesAndDetailsWidget({
  itemId,
  notesText,
  isInbox,
  onSave,
  author,
  portalTheme = 'white'
}: NotesAndDetailsWidgetProps) {
  const isWhite = portalTheme === 'white';
  const data = parseNotesData(notesText);

  // Active Tab: 'notes' | 'tasks' | 'files' | null (only shows after click)
  const [activeTab, setActiveTab] = useState<'notes' | 'tasks' | 'files' | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Toggle active tab: click to show, click again to hide
  const handleTabToggle = (tab: 'notes' | 'tasks' | 'files') => {
    setActiveTab(prev => prev === tab ? null : tab);
  };

  // Notes state
  const [draftComment, setDraftComment] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('General');
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);

  // Tasks state
  const [taskDraft, setTaskDraft] = useState('');
  const [taskPriority, setTaskPriority] = useState<'Normal' | 'High' | 'Urgent'>('Normal');

  // File upload state
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Escape key to exit full screen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreen]);

  const updateNotesField = async (updatedData: NotesData) => {
    const serialized = serializeNotesData(updatedData);
    await onSave(itemId, serialized, isInbox);
  };

  // 1. NOTES / COMMENTS HANDLERS
  const handleAddComment = async () => {
    if (!draftComment.trim()) return;
    const now = new Date();
    const formattedDate = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newComment: CommentItem = {
      id: `CMT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      author: author || 'Representative',
      text: draftComment.trim(),
      timestamp: formattedDate,
      tag: selectedTag
    };
    const updatedData: NotesData = {
      ...data,
      comments: [newComment, ...data.comments]
    };
    setDraftComment('');
    setIsAddNoteOpen(false);
    await updateNotesField(updatedData);
  };

  const handleDeleteComment = async (commentId: string) => {
    const updatedComments = data.comments.filter(c => c.id !== commentId);
    await updateNotesField({ ...data, comments: updatedComments });
  };

  const handleNotesKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  // 2. TASKS HANDLERS
  const handleAddTask = async () => {
    if (!taskDraft.trim()) return;
    const newTask: TaskItem = {
      id: `TSK-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      title: taskDraft.trim(),
      completed: false,
      priority: taskPriority,
      createdAt: new Date().toLocaleDateString()
    };
    const updatedData: NotesData = {
      ...data,
      tasks: [...data.tasks, newTask]
    };
    setTaskDraft('');
    await updateNotesField(updatedData);
  };

  const handleToggleTask = async (taskId: string) => {
    const updatedTasks = data.tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          completed: !t.completed,
          completedAt: !t.completed ? new Date().toLocaleDateString() : undefined
        };
      }
      return t;
    });
    await updateNotesField({ ...data, tasks: updatedTasks });
  };

  const handleDeleteTask = async (taskId: string) => {
    const updatedTasks = data.tasks.filter(t => t.id !== taskId);
    await updateNotesField({ ...data, tasks: updatedTasks });
  };

  // 3. FILE ATTACHMENT HANDLERS
  const processFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newFiles: AttachedFile[] = [];

    Array.from(files).forEach(file => {
      const sizeStr = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

      // Read small files as dataUrl for preview/download
      if (file.size < 3 * 1024 * 1024) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const attached: AttachedFile = {
            id: `FILE-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
            name: file.name,
            size: sizeStr,
            type: file.type || 'application/octet-stream',
            dataUrl: event.target?.result as string,
            uploadedAt: new Date().toLocaleDateString()
          };
          updateNotesField({
            ...data,
            attachedFiles: [attached, ...data.attachedFiles]
          });
        };
        reader.readAsDataURL(file);
      } else {
        const attached: AttachedFile = {
          id: `FILE-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
          name: file.name,
          size: sizeStr,
          type: file.type || 'application/octet-stream',
          uploadedAt: new Date().toLocaleDateString()
        };
        newFiles.push(attached);
      }
    });

    if (newFiles.length > 0) {
      updateNotesField({
        ...data,
        attachedFiles: [...newFiles, ...data.attachedFiles]
      });
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    processFiles(e.dataTransfer.files);
  };

  const handleDeleteFile = async (fileId: string) => {
    const updatedFiles = data.attachedFiles.filter(f => f.id !== fileId);
    await updateNotesField({ ...data, attachedFiles: updatedFiles });
  };

  const getFileIcon = (fileName: string, fileType: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext || '') || fileType.startsWith('image/')) {
      return <FileImage size={15} className="text-purple-500" />;
    }
    if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(ext || '')) {
      return <FileText size={15} className="text-sky-500" />;
    }
    if (['xls', 'xlsx', 'csv'].includes(ext || '')) {
      return <FileSpreadsheet size={15} className="text-emerald-500" />;
    }
    if (['json', 'js', 'ts', 'html', 'css', 'py'].includes(ext || '')) {
      return <FileCode size={15} className="text-amber-500" />;
    }
    return <File size={15} className="text-slate-400" />;
  };

  // Task statistics
  const completedTasksCount = data.tasks.filter(t => t.completed).length;
  const totalTasksCount = data.tasks.length;
  const taskProgressPercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  // Render Inner Content of the workspace
  const renderWorkspaceContent = (fullscreenMode: boolean) => {
    // If in normal embedded card view, hide the 4 buttons and show the Full Screen launcher
    if (!fullscreenMode) {
      return (
        <div className="space-y-3 font-sans text-xs">
          <button
            onClick={() => {
              setActiveTab(prev => prev || 'notes');
              setIsFullScreen(true);
            }}
            className={`w-full p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer shadow-sm group ${
              isWhite
                ? 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300'
                : 'bg-white hover:bg-slate-100 text-slate-200 border-slate-800 hover:border-slate-200'
            }`}
            title="Open Full Screen Workspace"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl transition-all ${
                isWhite ? 'bg-amber-50 text-amber-600 group-hover:bg-amber-100 group-hover:scale-105' : 'bg-amber-950/40 text-amber-400 group-hover:bg-amber-900/60 group-hover:scale-105'
              }`}>
                <Maximize2 size={16} />
              </div>
              <div className="text-left">
                <div className="text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2">
                  <span>Full Screen Workspace</span>
                  <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md ${
                    isWhite ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-300'
                  }`}>
                    Click to Open
                  </span>
                </div>
                <div className={`text-[11px] font-sans mt-0.5 ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                  Manage Notes, Action Tasks & Attached Files
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                isWhite ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-amber-950/40 text-amber-400 border border-amber-800/60'
              }`}>
                {data.comments.length} Notes
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                isWhite ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-sky-950/40 text-sky-400 border border-sky-800/60'
              }`}>
                {completedTasksCount}/{totalTasksCount} Tasks
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                isWhite ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-purple-950/40 text-purple-400 border border-purple-800/60'
              }`}>
                {data.attachedFiles.length} Files
              </span>
            </div>
          </button>
        </div>
      );
    }

    const currentTab = activeTab || 'notes';

    return (
      <div className="space-y-4 font-sans text-xs">
        {/* Navigation Tabs (Shown in Full Screen) */}
        <div className={`flex flex-wrap items-center justify-between gap-2 border-b pb-3 ${
          isWhite ? 'border-slate-200' : 'border-slate-800'
        }`}>
          <div className="flex flex-wrap items-center gap-2">
            {/* Notes Tab */}
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-2 cursor-pointer border ${
                currentTab === 'notes'
                  ? (isWhite ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-sm' : 'bg-amber-950/40 text-amber-400 border-amber-800/80 shadow-sm')
                  : (isWhite ? 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200' : 'bg-white hover:bg-slate-100 text-slate-400 border-slate-800')
              }`}
            >
              <MessageSquare size={14} className={currentTab === 'notes' ? (isWhite ? 'text-amber-600' : 'text-amber-400') : 'text-slate-400'} />
              <span>Notes</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                currentTab === 'notes' 
                  ? (isWhite ? 'bg-amber-200 text-amber-900' : 'bg-amber-900/60 text-amber-300')
                  : (isWhite ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-400')
              }`}>
                {data.comments.length}
              </span>
            </button>

            {/* Tasks Tab */}
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-2 cursor-pointer border ${
                currentTab === 'tasks'
                  ? (isWhite ? 'bg-sky-50 text-sky-800 border-sky-300 shadow-sm' : 'bg-sky-950/40 text-sky-400 border-sky-800/80 shadow-sm')
                  : (isWhite ? 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200' : 'bg-white hover:bg-slate-100 text-slate-400 border-slate-800')
              }`}
            >
              <CheckSquare size={14} className={currentTab === 'tasks' ? (isWhite ? 'text-sky-600' : 'text-sky-400') : 'text-slate-400'} />
              <span>Tasks</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                currentTab === 'tasks' 
                  ? (isWhite ? 'bg-sky-200 text-sky-900' : 'bg-sky-900/60 text-sky-300')
                  : (isWhite ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-400')
              }`}>
                {completedTasksCount}/{totalTasksCount}
              </span>
            </button>

            {/* Attach Files Tab */}
            <button
              onClick={() => setActiveTab('files')}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-2 cursor-pointer border ${
                currentTab === 'files'
                  ? (isWhite ? 'bg-purple-50 text-purple-800 border-purple-300 shadow-sm' : 'bg-purple-950/40 text-purple-400 border-purple-800/80 shadow-sm')
                  : (isWhite ? 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200' : 'bg-white hover:bg-slate-100 text-slate-400 border-slate-800')
              }`}
            >
              <Paperclip size={14} className={currentTab === 'files' ? (isWhite ? 'text-purple-600' : 'text-purple-400') : 'text-slate-400'} />
              <span>Files</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                currentTab === 'files' 
                  ? (isWhite ? 'bg-purple-200 text-purple-900' : 'bg-purple-900/60 text-purple-300')
                  : (isWhite ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-400')
              }`}>
                {data.attachedFiles.length}
              </span>
            </button>
          </div>
        </div>

        {/* TAB 1: VISIBLE LOOKING NOTES & COMMENTS */}
        {currentTab === 'notes' && (
        <div className="space-y-3">
          {/* Add Note Box - Toggleable to save screen space */}
          {isAddNoteOpen && (
            <div className={`p-3 rounded-xl border shadow-sm space-y-2.5 transition-all ${
              isWhite ? 'bg-white border-slate-200' : 'bg-white border-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <label className={`text-[10px] font-mono uppercase tracking-widest font-bold flex items-center gap-1.5 ${
                  isWhite ? 'text-slate-700' : 'text-slate-300'
                }`}>
                  <MessageSquare size={12} className={isWhite ? 'text-amber-500' : 'text-amber-400'} />
                  <span>Add Note / Log Update</span>
                </label>

                <div className="flex items-center gap-2">
                  {/* Tag Selector */}
                  <div className="flex items-center gap-1">
                    <Tag size={10} className="text-slate-400" />
                    {(['General', 'Call', 'Tech', 'Urgent'] as const).map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setSelectedTag(tag)}
                        type="button"
                        className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase transition-all cursor-pointer border ${
                          selectedTag === tag
                            ? (isWhite ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-amber-950/60 text-amber-300 border-amber-700')
                            : (isWhite ? 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100' : 'bg-slate-50 text-slate-400 border-slate-800 hover:text-slate-200')
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setIsAddNoteOpen(false)}
                    type="button"
                    className={`p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors`}
                    title="Close"
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>

              <div className="relative">
                <textarea
                  value={draftComment}
                  onChange={(e) => setDraftComment(e.target.value)}
                  onKeyDown={handleNotesKeyDown}
                  placeholder="Write a clear note, client discussion summary, or query update... (Press Enter to log)"
                  rows={fullscreenMode ? 4 : 3}
                  className={`w-full border rounded-xl p-3 pb-8 text-xs outline-none focus:border-amber-400 font-sans resize-none transition-all shadow-sm ${
                    isWhite
                      ? 'bg-slate-50/50 border-slate-300 text-slate-800 placeholder-slate-400'
                      : 'bg-slate-50 border-slate-800 text-slate-900 placeholder-slate-500'
                  }`}
                />
                <div className="absolute right-2.5 bottom-2 flex items-center gap-2">
                  <span className={`text-[8.5px] font-mono tracking-wider ${isWhite ? 'text-slate-400' : 'text-slate-500'}`}>
                    ENTER TO SEND
                  </span>
                  <button
                    onClick={handleAddComment}
                    type="button"
                    className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer border flex items-center gap-1 ${
                      isWhite
                        ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-amber-600 hover:bg-amber-500 text-white border-amber-600 shadow-sm'
                    }`}
                  >
                    <Plus size={11} />
                    <span>Add Note</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Visible Looking Notes Feed */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-mono uppercase tracking-widest font-bold ${
                isWhite ? 'text-slate-500' : 'text-slate-400'
              }`}>
                Notes Thread ({data.comments.length} Records)
              </span>
              <button
                onClick={() => setIsAddNoteOpen(!isAddNoteOpen)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1 cursor-pointer border shadow-xs ${
                  isAddNoteOpen
                    ? (isWhite ? 'bg-slate-200 text-slate-800 border-slate-300' : 'bg-slate-800 text-slate-300 border-slate-200')
                    : (isWhite ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300' : 'bg-amber-950/50 hover:bg-amber-900/60 text-amber-300 border-amber-800/80')
                }`}
              >
                {isAddNoteOpen ? <X size={11} /> : <Plus size={11} />}
                <span>{isAddNoteOpen ? 'Cancel' : 'Add Note'}</span>
              </button>
            </div>

            <div className={`space-y-2.5 overflow-y-auto pr-1 ${
              fullscreenMode ? 'max-h-[500px]' : 'max-h-[300px]'
            }`}>
              {data.comments.length === 0 ? (
                <div className={`p-6 text-center rounded-xl border border-dashed text-xs ${
                  isWhite ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-white/50 border-slate-800 text-slate-400'
                }`}>
                  <MessageSquare size={20} className="mx-auto mb-2 opacity-40" />
                  <p className="font-semibold">No notes logged yet.</p>
                  <p className="text-[11px] mt-0.5">Use the box above to log your first update or meeting note.</p>
                </div>
              ) : (
                data.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`p-3.5 rounded-xl border shadow-sm transition-all group ${
                      isWhite
                        ? 'bg-white hover:bg-slate-50/80 border-slate-200'
                        : 'bg-white hover:bg-[#1c2128] border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full font-bold font-mono text-[10px] flex items-center justify-center border shadow-xs ${
                          isWhite
                            ? 'bg-amber-100 text-amber-900 border-amber-200'
                            : 'bg-amber-950/60 text-amber-300 border-amber-700/60'
                        }`}>
                          {comment.author.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className={`font-bold text-xs block leading-tight ${isWhite ? 'text-slate-900' : 'text-slate-100'}`}>
                            {comment.author}
                          </span>
                        </div>
                        {comment.tag && (
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
                            comment.tag === 'Urgent' ? 'bg-red-50 text-red-700 border-red-200' :
                            comment.tag === 'Tech' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                            comment.tag === 'Call' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            (isWhite ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-800 text-slate-300 border-slate-200')
                          }`}>
                            {comment.tag}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono flex items-center gap-1 ${
                          isWhite ? 'text-slate-500' : 'text-slate-400'
                        }`}>
                          <Clock size={10} />
                          {comment.timestamp}
                        </span>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity cursor-pointer rounded"
                          title="Delete Note"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    <p className={`font-sans whitespace-pre-wrap leading-relaxed pl-8 text-xs font-normal ${
                      isWhite ? 'text-slate-700' : 'text-slate-200'
                    }`}>
                      {comment.text}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TASKS & CHECKLIST (ALOS I WILL ADD TASK ALSO) */}
      {currentTab === 'tasks' && (
        <div className="space-y-4">
          {/* Progress Bar Header */}
          <div className={`p-3 rounded-xl border shadow-sm space-y-2 ${
            isWhite ? 'bg-white border-slate-200' : 'bg-white border-slate-800'
          }`}>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className={`font-bold uppercase tracking-wider ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>
                Checklist Progress
              </span>
              <span className="font-bold text-sky-500">
                {completedTasksCount} / {totalTasksCount} Completed ({taskProgressPercent}%)
              </span>
            </div>
            <div className={`w-full h-2 rounded-full overflow-hidden ${
              isWhite ? 'bg-slate-100' : 'bg-slate-800'
            }`}>
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${taskProgressPercent}%` }}
              />
            </div>
          </div>

          {/* Add Task Input Form */}
          <div className={`p-3 rounded-xl border shadow-sm space-y-2.5 ${
            isWhite ? 'bg-white border-slate-200' : 'bg-white border-slate-800'
          }`}>
            <label className={`text-[10px] font-mono uppercase tracking-widest font-bold flex items-center gap-1.5 ${
              isWhite ? 'text-slate-700' : 'text-slate-300'
            }`}>
              <CheckSquare size={12} className="text-sky-500" />
              <span>Create New Task / Action Item</span>
            </label>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                value={taskDraft}
                onChange={(e) => setTaskDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTask();
                  }
                }}
                placeholder="e.g. Schedule discovery call, send revised quotation, review API keys..."
                className={`flex-1 border rounded-xl px-3 py-2 text-xs outline-none focus:border-sky-400 font-sans shadow-sm ${
                  isWhite
                    ? 'bg-slate-50/50 border-slate-300 text-slate-800 placeholder-slate-400'
                    : 'bg-slate-50 border-slate-800 text-slate-900 placeholder-slate-500'
                }`}
              />

              <div className="flex items-center gap-2">
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as any)}
                  className={`border rounded-xl px-2.5 py-2 text-xs font-mono font-bold outline-none cursor-pointer ${
                    isWhite
                      ? 'bg-slate-50 border-slate-300 text-slate-700'
                      : 'bg-slate-50 border-slate-800 text-slate-300'
                  }`}
                >
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>

                <button
                  onClick={handleAddTask}
                  type="button"
                  className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
                >
                  <Plus size={13} />
                  <span>Add Task</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tasks List */}
          <div className="space-y-2">
            <span className={`text-[10px] font-mono uppercase tracking-widest font-bold ${
              isWhite ? 'text-slate-500' : 'text-slate-400'
            }`}>
              Active Tasks ({data.tasks.length})
            </span>

            <div className={`space-y-2 overflow-y-auto pr-1 ${
              fullscreenMode ? 'max-h-[500px]' : 'max-h-[300px]'
            }`}>
              {data.tasks.length === 0 ? (
                <div className={`p-6 text-center rounded-xl border border-dashed text-xs ${
                  isWhite ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-white/50 border-slate-800 text-slate-400'
                }`}>
                  <ListTodo size={20} className="mx-auto mb-2 opacity-40" />
                  <p className="font-semibold">No tasks logged.</p>
                  <p className="text-[11px] mt-0.5">Add task checklists above to track action items for this query.</p>
                </div>
              ) : (
                data.tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-xl border shadow-xs transition-all flex items-center justify-between gap-3 group ${
                      task.completed
                        ? (isWhite ? 'bg-slate-50/70 border-slate-200 opacity-75' : 'bg-white/40 border-slate-800/60 opacity-60')
                        : (isWhite ? 'bg-white border-slate-200 hover:border-sky-300' : 'bg-white border-slate-800 hover:border-slate-200')
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        type="button"
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-all cursor-pointer shrink-0 border ${
                          task.completed
                            ? 'bg-emerald-500 border-emerald-600 text-white'
                            : (isWhite ? 'bg-white border-slate-300 hover:border-sky-500 text-transparent' : 'bg-slate-50 border-slate-200 hover:border-sky-400 text-transparent')
                        }`}
                      >
                        <Check size={12} className={task.completed ? 'block' : 'opacity-0'} />
                      </button>

                      <div className="min-w-0 flex-1">
                        <span className={`text-xs block break-words ${
                          task.completed
                            ? (isWhite ? 'line-through text-slate-500 font-normal' : 'line-through text-slate-400 font-normal')
                            : (isWhite ? 'text-slate-900 font-semibold' : 'text-slate-100 font-semibold')
                        }`}>
                          {task.title}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[9px] font-mono ${isWhite ? 'text-slate-400' : 'text-slate-500'}`}>
                            Created {task.createdAt}
                          </span>
                          {task.completedAt && (
                            <span className="text-[9px] font-mono text-emerald-600 font-semibold">
                              ✓ Done {task.completedAt}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {task.priority && (
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
                          task.priority === 'Urgent'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : task.priority === 'High'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : (isWhite ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-800 text-slate-300 border-slate-200')
                        }`}>
                          {task.priority}
                        </span>
                      )}

                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity cursor-pointer rounded"
                        title="Delete Task"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ATTACH FILE OPTION (ATTAH FILE OPETION) */}
      {currentTab === 'files' && (
        <div className="space-y-4">
          {/* File Dropzone & Selector */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
            onDragLeave={() => setIsDraggingFile(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
              isDraggingFile
                ? 'border-purple-500 bg-purple-50/30'
                : (isWhite ? 'border-slate-300 hover:border-purple-400 bg-slate-50/50 hover:bg-slate-50' : 'border-slate-800 hover:border-purple-500 bg-white/40 hover:bg-white')
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              multiple
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center space-y-1.5">
              <div className="p-2.5 rounded-full bg-purple-500/10 text-purple-600 mb-1">
                <Upload size={18} />
              </div>
              <span className={`text-xs font-bold ${isWhite ? 'text-slate-800' : 'text-slate-200'}`}>
                Click to browse or drag and drop files here
              </span>
              <p className={`text-[11px] ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                Attach PDF documents, contracts, architecture diagrams, images, or specifications
              </p>
            </div>
          </div>

          {/* Attached Files List */}
          <div className="space-y-2">
            <span className={`text-[10px] font-mono uppercase tracking-widest font-bold ${
              isWhite ? 'text-slate-500' : 'text-slate-400'
            }`}>
              Attached Files ({data.attachedFiles.length})
            </span>

            <div className={`space-y-2 overflow-y-auto pr-1 ${
              fullscreenMode ? 'max-h-[500px]' : 'max-h-[300px]'
            }`}>
              {data.attachedFiles.length === 0 ? (
                <div className={`p-6 text-center rounded-xl border border-dashed text-xs ${
                  isWhite ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-white/50 border-slate-800 text-slate-400'
                }`}>
                  <Paperclip size={20} className="mx-auto mb-2 opacity-40" />
                  <p className="font-semibold">No files attached yet.</p>
                  <p className="text-[11px] mt-0.5">Drop files or click the upload area above to attach project documents.</p>
                </div>
              ) : (
                data.attachedFiles.map((file) => (
                  <div
                    key={file.id}
                    className={`p-3 rounded-xl border shadow-xs transition-all flex items-center justify-between gap-3 group ${
                      isWhite ? 'bg-white border-slate-200 hover:border-purple-200' : 'bg-white border-slate-800 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                        {getFileIcon(file.name, file.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className={`text-xs font-bold block truncate ${isWhite ? 'text-slate-900' : 'text-slate-100'}`}>
                          {file.name}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] font-mono mt-0.5 text-slate-400">
                          <span>{file.size}</span>
                          <span>•</span>
                          <span>{file.uploadedAt}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {file.dataUrl && (
                        <a
                          href={file.dataUrl}
                          download={file.name}
                          target="_blank"
                          rel="noreferrer"
                          className={`p-1.5 rounded-lg border text-xs font-mono font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                            isWhite
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-200'
                          }`}
                          title="Download File"
                        >
                          <Download size={12} />
                        </a>
                      )}

                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 transition-colors cursor-pointer rounded"
                        title="Remove File"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    );
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* Embedded View */}
      {renderWorkspaceContent(false)}

      {/* FULL SCREEN MODAL VIEW (ALSO OPTION ABIL CLIK TO FULL SCREEN NOTES) */}
      {isFullScreen && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md p-3 md:p-6 flex items-center justify-center animate-in fade-in duration-150">
          <div className={`w-full max-w-6xl h-[92vh] flex flex-col rounded-2xl shadow-2xl border overflow-hidden ${
            isWhite ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-50 border-slate-800 text-slate-900'
          }`}>
            {/* Fullscreen Workspace Header */}
            <div className={`p-4 md:px-6 border-b flex items-center justify-between shrink-0 ${
              isWhite ? 'bg-white border-slate-200' : 'bg-white border-slate-800'
            }`}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Layers size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold font-sans">Full Screen Notes & Workspace</h2>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded border font-bold bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800">
                      Query ID: {itemId}
                    </span>
                  </div>
                  <p className={`text-xs ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                    Manage notes, action checklist tasks & attached files
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-mono hidden sm:inline-block ${isWhite ? 'text-slate-400' : 'text-slate-500'}`}>
                  ESC to exit
                </span>
                <button
                  onClick={() => setIsFullScreen(false)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                    isWhite
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-200'
                  }`}
                >
                  <Minimize2 size={13} />
                  <span>Exit Full Screen</span>
                </button>
              </div>
            </div>

            {/* Fullscreen Workspace Body */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {renderWorkspaceContent(true)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
