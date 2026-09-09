import React from 'react';
import { 
  Inbox as InboxIcon, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  ShieldAlert 
} from 'lucide-react';

export interface InboxTicket {
  id: string;
  name: string;
  email: string;
  company?: string;
  service?: string;
  message: string;
  date: string;
  status: 'New Query' | 'In Process' | 'Won' | 'Lost';
}

interface MarketingInboxTableProps {
  currentItems: InboxTicket[];
  processedData: InboxTicket[];
  totalTicketsCount: number;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setStatusFilter: (filter: string) => void;
  toggleSort: (field: string) => void;
  handleOpenView: (ticket: InboxTicket) => void;
  handlePrevPage: () => void;
  handleNextPage: () => void;
  currentPage: number;
  totalPages: number;
  indexOfFirstItem: number;
  indexOfLastItem: number;
  portalTheme?: 'white' | 'dark';
}

export default function MarketingInboxTable({
  currentItems,
  processedData,
  totalTicketsCount,
  searchTerm,
  setSearchTerm,
  setStatusFilter,
  toggleSort,
  handleOpenView,
  handlePrevPage,
  handleNextPage,
  currentPage,
  totalPages,
  indexOfFirstItem,
  indexOfLastItem,
  portalTheme = 'white'
}: MarketingInboxTableProps) {
  const isWhite = portalTheme === 'white';

  return (
    <div className={`border rounded-xl overflow-hidden shadow-sm flex flex-col justify-between flex-1 min-h-0 w-full transition-colors ${
      isWhite ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#161b22]/70 border-slate-800 text-slate-100'
    }`}>
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Table Title Bar */}
        <div className={`shrink-0 p-3 sm:p-3.5 border-b flex items-center justify-between transition-colors ${
          isWhite ? 'bg-slate-50/80 border-slate-200' : 'bg-[#161b22] border-slate-800'
        }`}>
          <div className="flex items-center gap-2">
            <InboxIcon size={16} className={isWhite ? 'text-sky-600' : 'text-sky-400'} />
            <h3 className={`text-sm font-bold tracking-tight ${isWhite ? 'text-slate-900' : 'text-white'}`}>
              Inbox Records
            </h3>
          </div>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${
            isWhite ? 'border-slate-200 text-slate-700 bg-slate-100' : 'border-slate-800 text-slate-400 bg-slate-900'
          }`}>
            {processedData.length} Found
          </span>
        </div>

        {/* Empty States */}
        {currentItems.length === 0 ? (
          totalTicketsCount === 0 ? (
            <div className="py-24 px-6 text-center flex flex-col items-center justify-center max-w-sm mx-auto">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md mx-auto mb-4 border ${
                isWhite ? 'bg-slate-100 border-slate-200 text-sky-600' : 'bg-[#161b22] border-slate-800 text-sky-400'
              }`}>
                <InboxIcon size={22} className="animate-pulse" />
              </div>
              <h4 className={`text-xs font-extrabold mb-1.5 tracking-wide font-mono uppercase ${
                isWhite ? 'text-slate-900' : 'text-white'
              }`}>Inbox Clear</h4>
              <p className={`text-xs font-light leading-relaxed font-sans ${
                isWhite ? 'text-slate-500' : 'text-slate-400'
              }`}>
                No active contact queries or incoming inquiries are registered in the inbox queue.
              </p>
            </div>
          ) : (
            <div className="py-20 text-center text-xs flex flex-col items-center justify-center">
              <ShieldAlert size={24} className={`mx-auto mb-2 ${isWhite ? 'text-slate-400' : 'text-slate-500'}`} />
              <p className={`font-semibold ${isWhite ? 'text-slate-800' : 'text-slate-200'}`}>No matching tickets found</p>
              <p className={`text-[11px] font-mono mt-1 max-w-[200px] ${isWhite ? 'text-slate-500' : 'text-slate-500'}`}>"{searchTerm}"</p>
              <button
                onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
                className="mt-3 text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          )
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto overflow-y-auto flex-1 min-h-0">
              <table className="w-full text-left text-xs font-sans">
                <thead className={`border-b text-[10px] font-bold uppercase tracking-wider font-mono sticky top-0 z-10 ${
                  isWhite ? 'bg-slate-100/90 text-slate-700 border-slate-200' : 'bg-[#0c1017] text-slate-400 border-slate-800'
                }`}>
                  <tr>
                    <th className={`p-3.5 pl-5 cursor-pointer select-none whitespace-nowrap ${isWhite ? 'hover:text-slate-900' : 'hover:text-white'}`} onClick={() => toggleSort('name')}>
                      <div className="flex items-center gap-1.5">
                        <span>Contact Name</span>
                        <ArrowUpDown size={10} className={isWhite ? 'text-slate-400' : 'text-slate-600'} />
                      </div>
                    </th>
                    <th className={`p-3.5 cursor-pointer select-none whitespace-nowrap ${isWhite ? 'hover:text-slate-900' : 'hover:text-white'}`} onClick={() => toggleSort('email')}>
                      <div className="flex items-center gap-1.5">
                        <span>Email</span>
                        <ArrowUpDown size={10} className={isWhite ? 'text-slate-400' : 'text-slate-600'} />
                      </div>
                    </th>
                    <th className={`p-3.5 cursor-pointer select-none whitespace-nowrap ${isWhite ? 'hover:text-slate-900' : 'hover:text-white'}`} onClick={() => toggleSort('company')}>
                      <div className="flex items-center gap-1.5">
                        <span>Company</span>
                        <ArrowUpDown size={10} className={isWhite ? 'text-slate-400' : 'text-slate-600'} />
                      </div>
                    </th>
                    <th className={`p-3.5 cursor-pointer select-none whitespace-nowrap ${isWhite ? 'hover:text-slate-900' : 'hover:text-white'}`} onClick={() => toggleSort('service')}>
                      <div className="flex items-center gap-1.5">
                        <span>Service</span>
                        <ArrowUpDown size={10} className={isWhite ? 'text-slate-400' : 'text-slate-600'} />
                      </div>
                    </th>
                    <th className="p-3.5 whitespace-nowrap">Message Preview</th>
                    <th className={`p-3.5 cursor-pointer select-none whitespace-nowrap ${isWhite ? 'hover:text-slate-900' : 'hover:text-white'}`} onClick={() => toggleSort('date')}>
                      <div className="flex items-center gap-1.5">
                        <span>Receipt Date</span>
                        <ArrowUpDown size={10} className={isWhite ? 'text-slate-400' : 'text-slate-600'} />
                      </div>
                    </th>
                    <th className={`p-3.5 pr-5 cursor-pointer select-none whitespace-nowrap ${isWhite ? 'hover:text-slate-900' : 'hover:text-white'}`} onClick={() => toggleSort('status')}>
                      <div className="flex items-center gap-1.5">
                        <span>Status</span>
                        <ArrowUpDown size={10} className={isWhite ? 'text-slate-400' : 'text-slate-600'} />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isWhite ? 'divide-slate-200' : 'divide-slate-800/80'}`}>
                  {currentItems.map((ticket) => (
                    <tr 
                      key={ticket.id} 
                      onClick={() => handleOpenView(ticket)}
                      className={`transition-colors cursor-pointer group ${
                        isWhite ? 'hover:bg-slate-50/90' : 'hover:bg-[#161b22]'
                      }`}
                      title="Click to view details"
                    >
                      <td className={`p-3.5 pl-5 font-semibold whitespace-nowrap ${isWhite ? 'text-slate-900' : 'text-white'}`}>{ticket.name}</td>
                      <td className={`p-3.5 font-mono text-[11px] whitespace-nowrap ${isWhite ? 'text-slate-600' : 'text-slate-400'}`}>{ticket.email}</td>
                      <td className={`p-3.5 font-mono text-[11px] whitespace-nowrap ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>{ticket.company || 'N/A'}</td>
                      <td className={`p-3.5 font-bold font-mono text-[10px] whitespace-nowrap ${isWhite ? 'text-sky-600' : 'text-sky-400'}`}>{ticket.service || 'General Inquiry'}</td>
                      <td className={`p-3.5 font-light truncate max-w-[240px] ${isWhite ? 'text-slate-600' : 'text-slate-400'}`} title={ticket.message}>
                        {ticket.message}
                      </td>
                      <td className={`p-3.5 font-mono text-[10px] whitespace-nowrap ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>{ticket.date}</td>
                      <td className="p-3.5 pr-5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
                          ticket.status === 'New Query' ? (isWhite ? 'bg-sky-50 text-sky-700 border-sky-300' : 'bg-sky-950/40 text-sky-400 border-sky-800/60') :
                          ticket.status === 'In Process' ? (isWhite ? 'bg-amber-50 text-amber-700 border-amber-300' : 'bg-amber-950/40 text-amber-400 border-amber-800/60') :
                          ticket.status === 'Won' ? (isWhite ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60') :
                          (isWhite ? 'bg-red-50 text-red-700 border-red-300' : 'bg-red-950/40 text-red-400 border-red-800/60')
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${
                            ticket.status === 'New Query' ? 'bg-sky-500' :
                            ticket.status === 'In Process' ? 'bg-amber-500' :
                            ticket.status === 'Won' ? 'bg-emerald-500' :
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

            {/* Mobile View Cards */}
            <div className={`block md:hidden overflow-y-auto flex-1 min-h-0 divide-y ${isWhite ? 'divide-slate-200' : 'divide-slate-800'}`}>
              {currentItems.map((ticket) => (
                <div 
                  key={ticket.id} 
                  onClick={() => handleOpenView(ticket)}
                  className={`p-3.5 space-y-1.5 select-none transition-colors cursor-pointer ${
                    isWhite ? 'hover:bg-slate-50 active:bg-slate-100' : 'hover:bg-[#161b22] active:bg-[#21262d]'
                  }`}
                  title="Click to view details"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`font-semibold text-xs truncate max-w-[160px] ${isWhite ? 'text-slate-900' : 'text-white'}`}>{ticket.name}</span>
                    <span className={`text-[9px] font-mono shrink-0 ${isWhite ? 'text-slate-500' : 'text-slate-500'}`}>{ticket.date}</span>
                  </div>
                  
                  <div className="flex items-baseline justify-between gap-2">
                    <span className={`text-[10px] font-bold font-mono tracking-tight ${isWhite ? 'text-sky-600' : 'text-sky-400'}`}>{ticket.service || 'General Inquiry'}</span>
                    {ticket.company && (
                      <span className={`text-[10px] font-mono font-medium truncate max-w-[120px] ${isWhite ? 'text-slate-600' : 'text-slate-400'}`} title={ticket.company}>
                        {ticket.company}
                      </span>
                    )}
                  </div>

                  <p className={`text-xs font-light line-clamp-2 ${isWhite ? 'text-slate-600' : 'text-slate-400'}`}>
                    {ticket.message}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className={`text-[10px] font-mono truncate max-w-[180px] ${isWhite ? 'text-slate-500' : 'text-slate-500'}`} title={ticket.email}>
                      {ticket.email}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold uppercase border shrink-0 ${
                      ticket.status === 'New Query' ? (isWhite ? 'bg-sky-50 text-sky-700 border-sky-300' : 'bg-sky-950/40 text-sky-400 border-sky-800/60') :
                      ticket.status === 'In Process' ? (isWhite ? 'bg-amber-50 text-amber-700 border-amber-300' : 'bg-amber-950/40 text-amber-400 border-amber-800/60') :
                      ticket.status === 'Won' ? (isWhite ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60') :
                      (isWhite ? 'bg-red-50 text-red-700 border-red-300' : 'bg-red-950/40 text-red-400 border-red-800/60')
                    }`}>
                      <span className={`w-1 h-1 rounded-full ${
                        ticket.status === 'New Query' ? 'bg-sky-500' :
                        ticket.status === 'In Process' ? 'bg-amber-500' :
                        ticket.status === 'Won' ? 'bg-emerald-500' :
                        'bg-red-500'
                      }`} />
                      {ticket.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination Footer */}
      <div className={`shrink-0 p-2.5 sm:p-3 border-t flex flex-col sm:flex-row items-center justify-between gap-2.5 transition-colors ${
        isWhite ? 'bg-slate-50/90 border-slate-200' : 'bg-[#161b22] border-slate-800'
      }`}>
        <div className={`text-[11px] font-mono ${isWhite ? 'text-slate-600' : 'text-slate-400'}`}>
          Showing <span className={`font-bold ${isWhite ? 'text-slate-900' : 'text-white'}`}>{processedData.length > 0 ? indexOfFirstItem + 1 : 0}</span> to <span className={`font-bold ${isWhite ? 'text-slate-900' : 'text-white'}`}>{Math.min(indexOfLastItem, processedData.length)}</span> of <span className={`font-bold ${isWhite ? 'text-slate-900' : 'text-white'}`}>{processedData.length}</span> records
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={`p-1.5 border rounded-lg transition-all cursor-pointer flex items-center justify-center disabled:opacity-30 ${
              isWhite
                ? 'bg-white border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-100 disabled:hover:text-slate-700'
                : 'bg-[#21262d] border-slate-800 text-slate-400 hover:text-white disabled:hover:text-slate-400'
            }`}
          >
            <ChevronLeft size={13} />
          </button>
          <span className={`text-xs font-mono font-bold px-3 py-1 border rounded-lg select-none ${
            isWhite ? 'text-slate-900 bg-white border-slate-200' : 'text-white bg-[#0d1117] border-slate-800'
          }`}>
            Page {currentPage} / {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`p-1.5 border rounded-lg transition-all cursor-pointer flex items-center justify-center disabled:opacity-30 ${
              isWhite
                ? 'bg-white border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-100 disabled:hover:text-slate-700'
                : 'bg-[#21262d] border-slate-800 text-slate-400 hover:text-white disabled:hover:text-slate-400'
            }`}
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
