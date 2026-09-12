import React, { useState } from 'react';
import { 
  MessageSquare, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  Edit2, 
  Eye, 
  Trash2, 
  ShieldAlert, 
  Info 
} from 'lucide-react';
import NotesAndDetailsWidget from './NotesAndDetailsWidget';

export interface QueryRecord {
  id: string;
  customerName: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'New Query' | 'In Process' | 'Won' | 'Lost';
  assignedTo: string;
  createdDate: string;
  description: string;
  notes?: string;
}

interface MarketingQueriesViewProps {
  pipelineTab: 'NEW_QUERY' | 'INPROCESS' | 'WON' | 'LOST';
  handlePipelineTabChange: (tab: 'NEW_QUERY' | 'INPROCESS' | 'WON' | 'LOST') => void;
  newQueryCount: number;
  inProcessCount: number;
  wonCount: number;
  lostCount: number;
  currentItems: QueryRecord[];
  processedData: QueryRecord[];
  totalQueriesCount: number;
  selectedQuery: QueryRecord | null;
  setSelectedQuery: (q: QueryRecord | null) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setStatusFilter: (filter: string) => void;
  toggleSort: (field: string) => void;
  handleOpenAdd: () => void;
  handleOpenEdit: (record: QueryRecord) => void;
  handleOpenView: (record: QueryRecord) => void;
  handleDeleteItem: (id: string) => void;
  handleUpdateStatus: (status: 'New Query' | 'In Process' | 'Won' | 'Lost') => void;
  handleUpdatePriority?: (priority: 'Low' | 'Medium' | 'High' | 'Critical') => void;
  isChangingStatus: boolean;
  setIsChangingStatus: (val: boolean) => void;
  onSaveNotes: (id: string, notesText: string, isInbox: boolean) => Promise<void>;
  marketingUser: any;
  handlePrevPage: () => void;
  handleNextPage: () => void;
  currentPage: number;
  totalPages: number;
  indexOfFirstItem: number;
  indexOfLastItem: number;
  portalTheme?: 'white' | 'dark';
}

export default function MarketingQueriesView({
  pipelineTab,
  handlePipelineTabChange,
  newQueryCount,
  inProcessCount,
  wonCount,
  lostCount,
  currentItems,
  processedData,
  totalQueriesCount,
  selectedQuery,
  setSelectedQuery,
  searchTerm,
  setSearchTerm,
  setStatusFilter,
  toggleSort,
  handleOpenAdd,
  handleOpenEdit,
  handleOpenView,
  handleDeleteItem,
  handleUpdateStatus,
  handleUpdatePriority,
  isChangingStatus,
  setIsChangingStatus,
  onSaveNotes,
  marketingUser,
  handlePrevPage,
  handleNextPage,
  currentPage,
  totalPages,
  indexOfFirstItem,
  indexOfLastItem,
  portalTheme = 'white'
}: MarketingQueriesViewProps) {
  const isWhite = portalTheme === 'white';
  const [isChangingPriority, setIsChangingPriority] = useState(false);

  if (selectedQuery) {
    return (
      <div className={`rounded-2xl p-4 sm:p-5 lg:p-6 shadow-xl space-y-4 w-full border flex-1 min-h-0 flex flex-col overflow-y-auto max-h-full ${
        isWhite ? 'bg-white border-slate-200' : 'bg-white border-slate-800'
      }`}>
        {/* Back Button & Header */}
        <div className={`flex items-center justify-between border-b pb-3 shrink-0 ${
          isWhite ? 'border-slate-100' : 'border-slate-800'
        }`}>
          <button
            onClick={() => setSelectedQuery(null)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
              isWhite 
                ? 'bg-slate-200 hover:bg-slate-300 text-slate-800 border-slate-300' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            <ChevronLeft size={14} />
            <span>Back to Queries Directory</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenEdit(selectedQuery)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
                isWhite 
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
              title="Edit Query Record"
            >
              <Edit2 size={12} />
              <span>Edit</span>
            </button>
            <span className={`text-xs font-mono font-bold px-3 py-1 rounded-xl border ${
              isWhite
                ? 'text-sky-700 bg-sky-50 border-sky-200'
                : 'text-sky-400 bg-sky-950/40 border-sky-800/60'
            }`}>
              Query ID: {selectedQuery.id}
            </span>
          </div>
        </div>

        {/* Full Query Detail Content - Structured Top to Bottom (Down Side) */}
        <div className="flex flex-col flex-1 min-h-0 space-y-4">
          {/* Top Section: Query Metadata & Description */}
          <div className="space-y-4 shrink-0">
            {/* Core Details Grid - Full Width Horizontal Layout */}
            <div className={`p-4 rounded-xl border grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 ${
              isWhite ? 'bg-slate-50/60 border-slate-200' : 'bg-slate-50/60 border-slate-800'
            }`}>
              <div>
                <span className={`text-[10px] font-mono uppercase tracking-widest block font-bold mb-1 ${
                  isWhite ? 'text-slate-500' : 'text-slate-400'
                }`}>Client</span>
                <span className={`text-sm font-semibold block truncate ${
                  isWhite ? 'text-slate-900' : 'text-slate-900'
                }`}>{selectedQuery.customerName}</span>
              </div>
              
              <div>
                <span className={`text-[10px] font-mono uppercase tracking-widest block font-bold mb-1 ${
                  isWhite ? 'text-slate-500' : 'text-slate-400'
                }`}>Category</span>
                <span className={`text-sm font-semibold block truncate ${
                  isWhite ? 'text-slate-700' : 'text-slate-200'
                }`}>{selectedQuery.category}</span>
              </div>

              <div>
                <span className={`text-[10px] font-mono uppercase tracking-widest block font-bold mb-1 ${
                  isWhite ? 'text-slate-500' : 'text-slate-400'
                }`}>Assigned Staff</span>
                <span className={`text-sm font-mono font-bold block truncate ${
                  isWhite ? 'text-sky-600' : 'text-sky-400'
                }`}>{selectedQuery.assignedTo}</span>
              </div>

              <div>
                <span className={`text-[10px] font-mono uppercase tracking-widest block font-bold mb-1 ${
                  isWhite ? 'text-slate-500' : 'text-slate-400'
                }`}>Created Date</span>
                <span className={`text-sm font-mono block ${
                  isWhite ? 'text-slate-600' : 'text-slate-300'
                }`}>{selectedQuery.createdDate}</span>
              </div>

              {/* Priority / Urgency Button */}
              <div>
                <span className={`text-[10px] font-mono uppercase tracking-widest block font-bold mb-1 ${
                  isWhite ? 'text-slate-500' : 'text-slate-400'
                }`}>Priority / Urgency</span>
                <div className="relative inline-block w-full">
                  <button
                    onClick={() => {
                      setIsChangingPriority(!isChangingPriority);
                      setIsChangingStatus(false);
                    }}
                    className={`w-full inline-flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold uppercase border cursor-pointer hover:brightness-105 transition-all shadow-sm ${
                      (selectedQuery.priority || 'Medium') === 'Critical' 
                        ? (isWhite ? 'bg-red-50 text-red-700 border-red-200' : 'bg-red-950/40 text-red-400 border-red-800/60') 
                        : (selectedQuery.priority || 'Medium') === 'High'
                        ? (isWhite ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-amber-950/40 text-amber-400 border-amber-800/60')
                        : (selectedQuery.priority || 'Medium') === 'Medium'
                        ? (isWhite ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-sky-950/40 text-sky-400 border-sky-800/60')
                        : (isWhite ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-slate-800 text-slate-300 border-slate-700')
                    }`}
                    title="Change Priority / Urgency"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        (selectedQuery.priority || 'Medium') === 'Critical' ? (isWhite ? 'bg-red-500 animate-pulse' : 'bg-red-400 animate-pulse') :
                        (selectedQuery.priority || 'Medium') === 'High' ? (isWhite ? 'bg-amber-500' : 'bg-amber-400') :
                        (selectedQuery.priority || 'Medium') === 'Medium' ? (isWhite ? 'bg-sky-500' : 'bg-sky-400') :
                        (isWhite ? 'bg-slate-400' : 'bg-slate-500')
                      }`} />
                      <span className="truncate">
                        {(selectedQuery.priority || 'Medium') === 'Critical' ? 'Urgent / Critical' : (selectedQuery.priority || 'Medium')}
                      </span>
                    </div>
                    <ChevronDown size={13} className={`${isWhite ? 'text-slate-500' : 'text-slate-400'} shrink-0`} />
                  </button>

                  {isChangingPriority && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setIsChangingPriority(false)} />
                      <div className={`absolute right-0 mt-1.5 w-44 border rounded-xl shadow-2xl z-40 overflow-hidden font-mono text-xs divide-y ${
                        isWhite ? 'bg-white border-slate-200 divide-slate-100' : 'bg-white border-slate-800 divide-slate-800'
                      }`}>
                        {(['Critical', 'High', 'Medium', 'Low'] as const).map((priorityOption) => (
                          <button
                            key={priorityOption}
                            onClick={() => {
                              if (handleUpdatePriority) {
                                handleUpdatePriority(priorityOption);
                              } else {
                                setSelectedQuery({ ...selectedQuery, priority: priorityOption });
                              }
                              setIsChangingPriority(false);
                            }}
                            className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                              isWhite 
                                ? ((selectedQuery.priority || 'Medium') === priorityOption ? 'bg-slate-100 font-bold text-slate-900' : 'text-slate-700 hover:bg-slate-50')
                                : ((selectedQuery.priority || 'Medium') === priorityOption ? 'bg-slate-100 font-bold text-slate-900' : 'text-slate-300 hover:bg-slate-100/60')
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full shrink-0 ${
                                priorityOption === 'Critical' ? 'bg-red-500' :
                                priorityOption === 'High' ? 'bg-amber-500' :
                                priorityOption === 'Medium' ? 'bg-sky-500' :
                                'bg-slate-400'
                              }`} />
                              <span>{priorityOption === 'Critical' ? 'Critical / Urgent' : priorityOption}</span>
                            </div>
                            {(selectedQuery.priority || 'Medium') === priorityOption && (
                              <span className={`text-[10px] ${isWhite ? 'text-sky-600' : 'text-sky-400'}`}>✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div>
                <span className={`text-[10px] font-mono uppercase tracking-widest block font-bold mb-1 ${
                  isWhite ? 'text-slate-500' : 'text-slate-400'
                }`}>Current Status</span>
                <div className="relative inline-block w-full">
                  <button
                    onClick={() => {
                      setIsChangingStatus(!isChangingStatus);
                      setIsChangingPriority(false);
                    }}
                    className={`w-full inline-flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold uppercase border cursor-pointer hover:brightness-105 transition-all ${
                      selectedQuery.status === 'New Query' ? (isWhite ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-sky-950/40 text-sky-400 border-sky-800/60') :
                      selectedQuery.status === 'In Process' ? (isWhite ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-amber-950/40 text-amber-400 border-amber-800/60') :
                      selectedQuery.status === 'Won' ? (isWhite ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60') :
                      (isWhite ? 'bg-red-50 text-red-700 border-red-200' : 'bg-red-950/40 text-red-400 border-red-800/60')
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        selectedQuery.status === 'New Query' ? (isWhite ? 'bg-sky-500' : 'bg-sky-400') :
                        selectedQuery.status === 'In Process' ? (isWhite ? 'bg-amber-500' : 'bg-amber-400') :
                        selectedQuery.status === 'Won' ? (isWhite ? 'bg-emerald-500' : 'bg-emerald-400') :
                        (isWhite ? 'bg-red-500' : 'bg-red-400')
                      }`} />
                      <span className="truncate">{selectedQuery.status}</span>
                    </div>
                    <ChevronDown size={13} className={`${isWhite ? 'text-slate-500' : 'text-slate-400'} shrink-0`} />
                  </button>

                  {isChangingStatus && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setIsChangingStatus(false)} />
                      <div className={`absolute right-0 mt-1.5 w-48 border rounded-xl shadow-2xl z-40 overflow-hidden font-mono text-xs divide-y ${
                        isWhite ? 'bg-white border-slate-200 divide-slate-100' : 'bg-white border-slate-800 divide-slate-800'
                      }`}>
                        {(['New Query', 'In Process', 'Won', 'Lost'] as const).map((statusOption) => (
                          <button
                            key={statusOption}
                            onClick={() => {
                              handleUpdateStatus(statusOption);
                              setIsChangingStatus(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 flex items-center gap-2.5 transition-colors cursor-pointer ${
                              isWhite 
                                ? (selectedQuery.status === statusOption ? 'text-sky-700 bg-sky-50 font-bold' : 'text-slate-700 hover:bg-slate-50')
                                : (selectedQuery.status === statusOption ? 'text-sky-400 bg-sky-500/10 font-bold' : 'text-slate-300 hover:bg-slate-100')
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${
                              statusOption === 'New Query' ? (isWhite ? 'bg-sky-500' : 'bg-sky-400') :
                              statusOption === 'In Process' ? (isWhite ? 'bg-amber-500' : 'bg-amber-400') :
                              statusOption === 'Won' ? (isWhite ? 'bg-emerald-500' : 'bg-emerald-400') :
                              (isWhite ? 'bg-red-500' : 'bg-red-400')
                            }`} />
                            <span>{statusOption.toUpperCase()}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Description Box */}
            <div>
              <span className={`text-[10px] font-mono uppercase tracking-widest block font-bold mb-1.5 ${
                isWhite ? 'text-slate-500' : 'text-slate-400'
              }`}>Query Description</span>
              <div className={`p-3.5 rounded-xl text-xs font-light leading-relaxed border shadow-sm whitespace-pre-wrap max-h-32 overflow-y-auto ${
                isWhite 
                  ? 'bg-slate-50/50 text-slate-800 border-slate-200' 
                  : 'bg-slate-50 text-slate-200 border-slate-800'
              }`}>
                {selectedQuery.description.replace(/\[Moved from Inbox ID: .*?\]\n*/g, '')}
              </div>
            </div>
          </div>

          {/* Down Side: Full-Width Notes & Workspace Div */}
          <div className={`pt-3 border-t flex-1 min-h-0 flex flex-col ${
            isWhite ? 'border-slate-200' : 'border-slate-800'
          }`}>
            <NotesAndDetailsWidget 
              itemId={selectedQuery.id}
              notesText={selectedQuery.notes}
              isInbox={false}
              onSave={onSaveNotes}
              author={marketingUser?.username || 'Representative'}
              portalTheme={portalTheme}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full space-y-3">
      {/* 3 Pipeline Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 gap-2.5 w-full font-mono shrink-0">
        <button
          onClick={() => handlePipelineTabChange('NEW_QUERY')}
          className={`p-2.5 sm:p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between h-16 ${
            pipelineTab === 'NEW_QUERY'
              ? (isWhite ? 'bg-sky-50 text-sky-700 border-sky-200 shadow-sm' : 'bg-sky-500/10 text-sky-400 border-sky-500/60 shadow-sm')
              : (isWhite ? 'bg-white hover:bg-slate-50 text-slate-500 border-slate-200 shadow-sm' : 'bg-white/70 hover:bg-white text-slate-400 border-slate-800')
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-bold">New Query</span>
            <span className={`w-2 h-2 rounded-full animate-pulse ${isWhite ? 'bg-sky-500' : 'bg-sky-400'}`}></span>
          </div>
          <span className={`text-lg font-bold tracking-tight ${
            pipelineTab === 'NEW_QUERY' ? (isWhite ? 'text-sky-800' : 'text-slate-900') : (isWhite ? 'text-slate-800' : 'text-slate-900')
          }`}>{newQueryCount}</span>
        </button>

        <button
          onClick={() => handlePipelineTabChange('WON')}
          className={`p-2.5 sm:p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between h-16 ${
            pipelineTab === 'WON'
              ? (isWhite ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/60 shadow-sm')
              : (isWhite ? 'bg-white hover:bg-slate-50 text-slate-500 border-slate-200 shadow-sm' : 'bg-white/70 hover:bg-white text-slate-400 border-slate-800')
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-bold">Won</span>
            <span className={`w-2 h-2 rounded-full ${isWhite ? 'bg-emerald-500' : 'bg-emerald-400'}`}></span>
          </div>
          <span className={`text-lg font-bold tracking-tight ${
            pipelineTab === 'WON' ? (isWhite ? 'text-emerald-800' : 'text-slate-900') : (isWhite ? 'text-slate-800' : 'text-slate-900')
          }`}>{wonCount}</span>
        </button>

        <button
          onClick={() => handlePipelineTabChange('LOST')}
          className={`p-2.5 sm:p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between h-16 ${
            pipelineTab === 'LOST'
              ? (isWhite ? 'bg-red-50 text-red-700 border-red-200 shadow-sm' : 'bg-red-500/10 text-red-400 border-red-500/60 shadow-sm')
              : (isWhite ? 'bg-white hover:bg-slate-50 text-slate-500 border-slate-200 shadow-sm' : 'bg-white/70 hover:bg-white text-slate-400 border-slate-800')
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-bold">Lost</span>
            <span className={`w-2 h-2 rounded-full ${isWhite ? 'bg-red-500' : 'bg-red-400'}`}></span>
          </div>
          <span className={`text-lg font-bold tracking-tight ${
            pipelineTab === 'LOST' ? (isWhite ? 'text-red-800' : 'text-slate-900') : (isWhite ? 'text-slate-800' : 'text-slate-900')
          }`}>{lostCount}</span>
        </button>
      </div>

      {/* Direct Support Queries Table (Full Width) */}
      <div className="w-full flex-1 min-h-0 flex flex-col">
        
        {/* Support Queries Table */}
        <div className={`border rounded-xl overflow-hidden flex flex-col justify-between flex-1 min-h-0 w-full ${
          isWhite ? 'bg-white border-slate-200 shadow-sm' : 'bg-white/70 border-slate-800 shadow-xl'
        }`}>
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className={`shrink-0 p-3 sm:p-3.5 border-b flex items-center justify-between ${
              isWhite ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-800'
            }`}>
              <div className="flex items-center gap-2">
                <MessageSquare size={16} className={isWhite ? 'text-sky-600' : 'text-sky-400'} />
                <h3 className={`text-sm font-bold tracking-tight ${isWhite ? 'text-slate-900' : 'text-slate-900'}`}>Direct Support Queries</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${
                  isWhite ? 'bg-white border-slate-300 text-slate-600' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}>
                  {processedData.length} Found
                </span>
                <button
                  onClick={handleOpenAdd}
                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={11} />
                  <span>New</span>
                </button>
              </div>
            </div>

            {currentItems.length === 0 ? (
              totalQueriesCount === 0 ? (
                <div className="py-24 px-6 text-center flex flex-col items-center justify-center max-w-sm mx-auto">
                  <div className={`w-12 h-12 border rounded-2xl flex items-center justify-center shadow-xl mx-auto mb-4 ${isWhite ? 'bg-white border-slate-200 text-sky-600' : 'bg-white border-slate-800 text-sky-400'}`}>
                    <MessageSquare size={20} className="animate-pulse" />
                  </div>
                  <h4 className={`text-xs font-extrabold mb-1.5 tracking-wide font-mono uppercase ${isWhite ? 'text-slate-800' : 'text-slate-900'}`}>No Active Queries</h4>
                  <p className={`text-xs font-light leading-relaxed mb-4 ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                    No service tickets or support logs are cached inside the current partition.
                  </p>
                  <button
                    onClick={handleOpenAdd}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus size={13} />
                    <span>Create First Query</span>
                  </button>
                </div>
              ) : (
                <div className="py-20 text-center text-xs flex flex-col items-center justify-center">
                  <ShieldAlert size={24} className={`mx-auto mb-2 ${isWhite ? 'text-slate-400' : 'text-slate-500'}`} />
                  <p className={`font-semibold ${isWhite ? 'text-slate-700' : 'text-slate-200'}`}>No matching search queries</p>
                  <p className={`text-[11px] font-mono mt-1 max-w-[200px] ${isWhite ? 'text-slate-500' : 'text-slate-500'}`}>"{searchTerm}"</p>
                  <button
                    onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
                    className={`mt-3 text-[11px] font-semibold hover:underline cursor-pointer ${isWhite ? 'text-sky-600' : 'text-sky-400'}`}
                  >
                    Reset filters
                  </button>
                </div>
              )
            ) : (
              <>
                {/* Desktop Query Table */}
                <div className="hidden md:block overflow-x-auto overflow-y-auto flex-1 min-h-0">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className={`border-b text-[10px] font-bold uppercase tracking-wider font-mono sticky top-0 z-10 ${
                      isWhite ? 'bg-slate-50 text-slate-500 border-slate-200' : 'bg-[#0c1017] text-slate-400 border-slate-800'
                    }`}>
                      <tr>
                        <th className={`p-3 pl-4 cursor-pointer select-none whitespace-nowrap ${isWhite ? 'hover:text-slate-800' : 'hover:text-slate-900'}`} onClick={() => toggleSort('id')}>
                          <div className="flex items-center gap-1">
                            <span>ID</span>
                            <ArrowUpDown size={9} className="text-slate-600" />
                          </div>
                        </th>
                        <th className={`p-3 cursor-pointer select-none whitespace-nowrap ${isWhite ? 'hover:text-slate-800' : 'hover:text-slate-900'}`} onClick={() => toggleSort('customerName')}>
                          <div className="flex items-center gap-1">
                            <span>Client</span>
                            <ArrowUpDown size={9} className="text-slate-600" />
                          </div>
                        </th>
                        <th className={`p-3 cursor-pointer select-none whitespace-nowrap ${isWhite ? 'hover:text-slate-800' : 'hover:text-slate-900'}`} onClick={() => toggleSort('category')}>
                          <div className="flex items-center gap-1">
                            <span>Category</span>
                            <ArrowUpDown size={9} className="text-slate-600" />
                          </div>
                        </th>
                        <th className={`p-3 cursor-pointer select-none whitespace-nowrap ${isWhite ? 'hover:text-slate-800' : 'hover:text-slate-900'}`} onClick={() => toggleSort('priority')}>
                          <div className="flex items-center gap-1">
                            <span>Priority</span>
                            <ArrowUpDown size={9} className="text-slate-600" />
                          </div>
                        </th>
                        <th className={`p-3 cursor-pointer select-none whitespace-nowrap ${isWhite ? 'hover:text-slate-800' : 'hover:text-slate-900'}`} onClick={() => toggleSort('assignedTo')}>
                          <div className="flex items-center gap-1">
                            <span>Owner</span>
                            <ArrowUpDown size={9} className="text-slate-600" />
                          </div>
                        </th>
                        <th className={`p-3 pr-4 cursor-pointer select-none whitespace-nowrap ${isWhite ? 'hover:text-slate-800' : 'hover:text-slate-900'}`} onClick={() => toggleSort('status')}>
                          <div className="flex items-center gap-1">
                            <span>Status</span>
                            <ArrowUpDown size={9} className="text-slate-600" />
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isWhite ? 'divide-slate-100' : 'divide-slate-800/80'}`}>
                      {currentItems.map((record) => (
                        <tr 
                          key={record.id} 
                          onClick={() => { setSelectedQuery(record); handleOpenView(record); }}
                          className={`transition-colors cursor-pointer ${
                            selectedQuery?.id === record.id 
                              ? (isWhite ? 'bg-sky-50 border-l-2 border-sky-500' : 'bg-sky-500/10 border-l-2 border-sky-400')
                              : (isWhite ? 'hover:bg-slate-50' : 'hover:bg-white')
                          }`}
                          title="Click to view all details"
                        >
                          <td className={`p-3 pl-4 font-mono font-bold whitespace-nowrap ${isWhite ? 'text-sky-700' : 'text-sky-400'}`}>{record.id}</td>
                          <td className={`p-3 font-semibold truncate max-w-[140px] ${isWhite ? 'text-slate-800' : 'text-slate-900'}`}>{record.customerName}</td>
                          <td className={`p-3 font-mono text-[10px] whitespace-nowrap ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>{record.category}</td>
                          <td className="p-3 whitespace-nowrap">
                            <span className={`inline-block px-1.5 py-0.5 rounded font-mono text-[8.5px] font-extrabold uppercase border ${
                              record.priority === 'Critical' ? (isWhite ? 'bg-red-50 text-red-700 border-red-200' : 'bg-red-950/40 text-red-400 border-red-800/60') :
                              record.priority === 'High' ? (isWhite ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-amber-950/40 text-amber-400 border-amber-800/60') :
                              record.priority === 'Medium' ? (isWhite ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-sky-950/40 text-sky-400 border-sky-800/60') :
                              (isWhite ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-900 text-slate-400 border-slate-800')
                            }`}>
                              {record.priority}
                            </span>
                          </td>
                          <td className={`p-3 font-mono text-[10px] truncate max-w-[100px] ${isWhite ? 'text-slate-600' : 'text-slate-300'}`}>{record.assignedTo}</td>
                          <td className="p-3 pr-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-mono text-[8.5px] font-bold uppercase border ${
                              record.status === 'New Query' ? (isWhite ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-sky-950/40 text-sky-400 border-sky-800/60') :
                              record.status === 'In Process' ? (isWhite ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-amber-950/40 text-amber-400 border-amber-800/60') :
                              record.status === 'Won' ? (isWhite ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60') :
                              (isWhite ? 'bg-red-50 text-red-700 border-red-200' : 'bg-red-950/40 text-red-400 border-red-800/60')
                            }`}>
                              <span className={`w-1 h-1 rounded-full ${
                                record.status === 'New Query' ? (isWhite ? 'bg-sky-500' : 'bg-sky-400') :
                                record.status === 'In Process' ? (isWhite ? 'bg-amber-500' : 'bg-amber-400') :
                                record.status === 'Won' ? (isWhite ? 'bg-emerald-500' : 'bg-emerald-400') :
                                (isWhite ? 'bg-red-500' : 'bg-red-400')
                              }`} />
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View Cards */}
                <div className={`block md:hidden overflow-y-auto flex-1 min-h-0 divide-y ${isWhite ? 'divide-slate-200' : 'divide-slate-800'}`}>
                  {currentItems.map((record) => (
                    <div 
                      key={record.id} 
                      onClick={() => { setSelectedQuery(record); handleOpenView(record); }}
                      className={`p-3 space-y-1.5 transition-colors cursor-pointer ${
                        selectedQuery?.id === record.id 
                          ? (isWhite ? 'bg-sky-50 border-l-2 border-sky-500' : 'bg-sky-500/10 border-l-2 border-sky-400')
                          : (isWhite ? 'hover:bg-slate-50' : 'hover:bg-white')
                      }`}
                      title="Click to view all details"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-mono font-bold text-xs ${isWhite ? 'text-sky-700' : 'text-sky-400'}`}>{record.id}</span>
                        <span className={`px-1.5 py-0.2 rounded font-mono text-[8.5px] font-bold uppercase border ${
                          record.priority === 'Critical' ? (isWhite ? 'bg-red-50 text-red-700 border-red-200' : 'bg-red-950/40 text-red-400 border-red-800/60') :
                          record.priority === 'High' ? (isWhite ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-amber-950/40 text-amber-400 border-amber-800/60') :
                          record.priority === 'Medium' ? (isWhite ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-sky-950/40 text-sky-400 border-sky-800/60') :
                          (isWhite ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-900 text-slate-400 border-slate-800')
                        }`}>
                          {record.priority}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-semibold ${isWhite ? 'text-slate-800' : 'text-slate-900'}`}>{record.customerName}</span>
                        <span className={`font-mono text-[10px] ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>{record.assignedTo}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Pagination Footer */}
          <div className={`shrink-0 p-2.5 sm:p-3 border-t flex flex-col sm:flex-row items-center justify-between gap-2.5 ${
            isWhite ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-800'
          }`}>
            <div className={`text-[11px] font-mono ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
              Showing <span className={`font-bold ${isWhite ? 'text-slate-900' : 'text-slate-900'}`}>{processedData.length > 0 ? indexOfFirstItem + 1 : 0}</span> to <span className={`font-bold ${isWhite ? 'text-slate-900' : 'text-slate-900'}`}>{Math.min(indexOfLastItem, processedData.length)}</span> of <span className={`font-bold ${isWhite ? 'text-slate-900' : 'text-slate-900'}`}>{processedData.length}</span> records
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`p-1.5 border rounded-lg transition-all cursor-pointer flex items-center justify-center disabled:opacity-30 ${
                  isWhite ? 'bg-white border-slate-300 text-slate-600 hover:text-slate-900' : 'bg-slate-100 border-slate-800 text-slate-400 hover:text-slate-900'
                }`}
              >
                <ChevronLeft size={13} />
              </button>
              <span className={`text-xs font-mono font-bold px-3 py-1 border rounded-lg select-none ${
                isWhite ? 'bg-white text-slate-900 border-slate-300' : 'bg-slate-50 text-slate-900 border-slate-800'
              }`}>
                Page {currentPage} / {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`p-1.5 border rounded-lg transition-all cursor-pointer flex items-center justify-center disabled:opacity-30 ${
                  isWhite ? 'bg-white border-slate-300 text-slate-600 hover:text-slate-900' : 'bg-slate-100 border-slate-800 text-slate-400 hover:text-slate-900'
                }`}
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
