import React from 'react';
import { 
  Inbox as InboxIcon, 
  MessageSquare, 
  Search, 
  X, 
  LogOut, 
  Shield, 
  ChevronRight,
  ArrowLeft,
  Database
} from 'lucide-react';

interface MarketingSidebarProps {
  marketingUser: any;
  activeModule: 'inbox' | 'queries';
  setActiveModule: (module: 'inbox' | 'queries') => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter?: string;
  setStatusFilter?: (filter: string) => void;
  pipelineTab: 'NEW_QUERY' | 'INPROCESS' | 'WON' | 'LOST';
  handlePipelineTabChange: (tab: 'NEW_QUERY' | 'INPROCESS' | 'WON' | 'LOST') => void;
  inboxCount: number;
  queryCount: number;
  newQueryCount: number;
  inProcessCount: number;
  wonCount: number;
  lostCount: number;
  onOpenAdmin?: () => void;
  onOpenAdd?: () => void;
  onExitPortal?: () => void;
  handleLogout: () => void;
  setCurrentPage: (page: number) => void;
  isMobileDrawer?: boolean;
  onCloseMobileDrawer?: () => void;
  portalTheme?: 'white' | 'dark';
  setPortalTheme?: (theme: 'white' | 'dark') => void;
}

export default function MarketingSidebar({
  marketingUser,
  activeModule,
  setActiveModule,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  pipelineTab,
  handlePipelineTabChange,
  inboxCount,
  queryCount,
  newQueryCount,
  inProcessCount,
  wonCount,
  lostCount,
  onOpenAdmin,
  onOpenAdd,
  onExitPortal,
  handleLogout,
  setCurrentPage,
  isMobileDrawer = false,
  onCloseMobileDrawer,
  portalTheme = 'white',
  setPortalTheme
}: MarketingSidebarProps) {
  const isWhite = portalTheme === 'white';

  return (
    <div className={`flex flex-col h-full select-none transition-colors ${
      isWhite 
        ? 'bg-white border-r border-slate-200 text-slate-800' 
        : 'bg-[#0c1017] border-r border-slate-800 text-slate-100'
    } ${isMobileDrawer ? 'w-full' : 'w-64 shrink-0'}`}>
      
      {/* 1. Portal Identity Header */}
      <div className={`p-4 border-b transition-colors ${
        isWhite ? 'border-slate-200 bg-white' : 'border-slate-800 bg-[#0c1017]'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className={`text-[10px] font-mono uppercase tracking-[0.2em] font-bold ${
              isWhite ? 'text-slate-500' : 'text-slate-400'
            }`}>ERP Core</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold border ${
              isWhite 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                : 'bg-emerald-950/40 text-emerald-400 border-emerald-800/50'
            }`}>LIVE</span>
            {isMobileDrawer && onCloseMobileDrawer && (
              <button 
                onClick={onCloseMobileDrawer}
                className={`p-1 rounded ${
                  isWhite ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
        <h1 className={`text-sm font-extrabold tracking-tight ${
          isWhite ? 'text-slate-900' : 'text-white'
        }`}>Marketing Portal</h1>
        <div className={`flex items-center gap-1.5 mt-2.5 px-2.5 py-1.5 rounded-lg border ${
          isWhite 
            ? 'bg-slate-50 border-slate-200' 
            : 'bg-[#161b22] border-slate-800'
        }`}>
          <span className={`text-[10px] font-mono uppercase font-semibold ${
            isWhite ? 'text-slate-500' : 'text-slate-400'
          }`}>Access ID:</span>
          <span className={`text-[10px] font-mono font-bold truncate ${
            isWhite ? 'text-sky-600' : 'text-sky-400'
          }`}>
            {marketingUser?.username || 'Authenticated'}
          </span>
        </div>
      </div>

      {/* 2. Global Portal Search */}
      <div className={`p-3 border-b transition-colors ${
        isWhite ? 'border-slate-200 bg-slate-50/70' : 'border-slate-800 bg-[#0d1117]'
      }`}>
        <div className="relative">
          <Search size={13} className={`absolute left-2.5 top-2.5 ${
            isWhite ? 'text-slate-400' : 'text-slate-500'
          }`} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={activeModule === 'inbox' ? "Search inbox..." : "Search queries..."}
            className={`w-full rounded-lg pl-8 pr-7 py-1.5 text-xs outline-none transition-colors font-sans border ${
              isWhite
                ? 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-500'
                : 'bg-[#161b22] border-slate-800 text-white placeholder-slate-500 focus:border-sky-500'
            }`}
          />
          {searchTerm && (
            <button 
              onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
              className={`absolute right-2 top-2 ${
                isWhite ? 'text-slate-400 hover:text-slate-700' : 'text-slate-500 hover:text-white'
              }`}
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* 3. Vertical Navigation Tabs */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className={`px-2 py-1 text-[9px] font-mono uppercase tracking-widest font-bold ${
          isWhite ? 'text-slate-400' : 'text-slate-500'
        }`}>
          Workspaces
        </div>

        {/* Inbox Tab */}
        <button
          onClick={() => {
            setActiveModule('inbox');
            setCurrentPage(1);
            if (onCloseMobileDrawer) onCloseMobileDrawer();
          }}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
            activeModule === 'inbox'
              ? isWhite
                ? 'bg-sky-50 text-sky-700 border border-sky-300 shadow-xs'
                : 'bg-sky-500/10 text-sky-400 border border-sky-500/40 shadow-sm'
              : isWhite
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#161b22] border border-transparent'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <InboxIcon size={14} className={
              activeModule === 'inbox' 
                ? (isWhite ? 'text-sky-600' : 'text-sky-400') 
                : (isWhite ? 'text-slate-400' : 'text-slate-500')
            } />
            <span>Inbox</span>
          </div>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
            activeModule === 'inbox'
              ? isWhite ? 'bg-sky-100 text-sky-800' : 'bg-sky-500/20 text-sky-300'
              : isWhite ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-400'
          }`}>
            {inboxCount}
          </span>
        </button>

        {/* Query Metrics & Hub Tab */}
        <button
          onClick={() => {
            setActiveModule('queries');
            setCurrentPage(1);
            if (onCloseMobileDrawer) onCloseMobileDrawer();
          }}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
            activeModule === 'queries'
              ? isWhite
                ? 'bg-sky-50 text-sky-700 border border-sky-300 shadow-xs'
                : 'bg-sky-500/10 text-sky-400 border border-sky-500/40 shadow-sm'
              : isWhite
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#161b22] border border-transparent'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <MessageSquare size={14} className={
              activeModule === 'queries' 
                ? (isWhite ? 'text-sky-600' : 'text-sky-400') 
                : (isWhite ? 'text-slate-400' : 'text-slate-500')
            } />
            <span>Query Metrics</span>
          </div>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
            activeModule === 'queries'
              ? isWhite ? 'bg-sky-100 text-sky-800' : 'bg-sky-500/20 text-sky-300'
              : isWhite ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-400'
          }`}>
            {queryCount}
          </span>
        </button>

        {/* Sub-stages for Query Pipeline */}
        {activeModule === 'queries' && (
          <div className={`pl-4 pr-1 py-2 space-y-1 border-l ml-3 mt-1 ${
            isWhite ? 'border-slate-200' : 'border-slate-800'
          }`}>
            <button
              onClick={() => {
                handlePipelineTabChange('NEW_QUERY');
                if (onCloseMobileDrawer) onCloseMobileDrawer();
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px] font-mono transition-all cursor-pointer ${
                pipelineTab === 'NEW_QUERY'
                  ? isWhite ? 'bg-sky-100 text-sky-800 font-bold' : 'bg-sky-950/40 text-sky-300 font-bold'
                  : isWhite ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                <span>New Query</span>
              </div>
              <span className={`text-[10px] font-mono ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>{newQueryCount}</span>
            </button>

            <button
              onClick={() => {
                handlePipelineTabChange('INPROCESS');
                if (onCloseMobileDrawer) onCloseMobileDrawer();
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px] font-mono transition-all cursor-pointer ${
                pipelineTab === 'INPROCESS'
                  ? isWhite ? 'bg-amber-100 text-amber-800 font-bold' : 'bg-amber-950/40 text-amber-300 font-bold'
                  : isWhite ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>In Process</span>
              </div>
              <span className={`text-[10px] font-mono ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>{inProcessCount}</span>
            </button>

            <button
              onClick={() => {
                handlePipelineTabChange('WON');
                if (onCloseMobileDrawer) onCloseMobileDrawer();
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px] font-mono transition-all cursor-pointer ${
                pipelineTab === 'WON'
                  ? isWhite ? 'bg-emerald-100 text-emerald-800 font-bold' : 'bg-emerald-950/40 text-emerald-300 font-bold'
                  : isWhite ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Won</span>
              </div>
              <span className={`text-[10px] font-mono ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>{wonCount}</span>
            </button>

            <button
              onClick={() => {
                handlePipelineTabChange('LOST');
                if (onCloseMobileDrawer) onCloseMobileDrawer();
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px] font-mono transition-all cursor-pointer ${
                pipelineTab === 'LOST'
                  ? isWhite ? 'bg-red-100 text-red-800 font-bold' : 'bg-red-950/40 text-red-300 font-bold'
                  : isWhite ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                <span>Lost</span>
              </div>
              <span className={`text-[10px] font-mono ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>{lostCount}</span>
            </button>
          </div>
        )}
      </div>

      {/* Data Controls & System Session (Bottom) */}
      <div className={`p-3 border-t space-y-2 transition-colors ${
        isWhite ? 'border-slate-200 bg-slate-50/80' : 'border-slate-800 bg-[#0c1017]'
      }`}>
        <div className={`flex items-center justify-between px-2 py-1 text-[9px] font-mono ${
          isWhite ? 'text-slate-500' : 'text-slate-500'
        }`}>
          <span className="flex items-center gap-1.5">
            <Database size={10} className="text-emerald-500" />
            <span>DB: FIRESTORE SYNCED</span>
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        </div>

        {/* Admin Login Shortcut */}
        {onOpenAdmin && (
          <button
            onClick={() => {
              if (onCloseMobileDrawer) onCloseMobileDrawer();
              onOpenAdmin();
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer border shadow-xs ${
              isWhite
                ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800 hover:text-slate-950'
                : 'bg-[#161b22] hover:bg-[#21262d] border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Shield size={13} className={isWhite ? 'text-sky-600' : 'text-sky-400'} />
              <span>Admin Login</span>
            </div>
            <ChevronRight size={12} className={isWhite ? 'text-slate-400' : 'text-slate-500'} />
          </button>
        )}

        {onExitPortal && (
          <button
            onClick={() => {
              if (onCloseMobileDrawer) onCloseMobileDrawer();
              onExitPortal();
            }}
            className={`w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer border ${
              isWhite
                ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-900'
                : 'bg-[#161b22] hover:bg-[#21262d] border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <ArrowLeft size={13} />
            <span>Return to Site</span>
          </button>
        )}

        <button
          onClick={() => {
            if (onCloseMobileDrawer) onCloseMobileDrawer();
            handleLogout();
          }}
          className={`w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
            isWhite
              ? 'bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-800'
              : 'bg-red-950/30 hover:bg-red-900/50 border-red-900/40 text-red-400 hover:text-red-200'
          }`}
        >
          <LogOut size={13} />
          <span>Sign Out</span>
        </button>
      </div>

    </div>
  );
}
