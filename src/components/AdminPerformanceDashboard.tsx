import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Clock, 
  Activity, 
  Database, 
  Trash2, 
  ShieldAlert, 
  Gauge, 
  RefreshCw, 
  Monitor, 
  Layers, 
  CheckCircle,
  HelpCircle,
  Check,
  X,
  Chrome,
  Compass,
  Flame,
  Globe
} from 'lucide-react';
import { performanceService, PerformanceLog } from '../services/performanceService';

export default function AdminPerformanceDashboard() {
  const [logs, setLogs] = useState<PerformanceLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'pageload' | 'transition'>('all');
  const [selectedLog, setSelectedLog] = useState<PerformanceLog | null>(null);
  const [isConfirmPurgeOpen, setIsConfirmPurgeOpen] = useState(false);
  const [isActionPending, setIsActionPending] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = performanceService.subscribeToLogs((items) => {
      setLogs(items);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Compute stats
  const totalCount = logs.length;
  const pageLoads = logs.filter(l => l.type === 'pageload');
  const transitions = logs.filter(l => l.type === 'transition');

  const avgPageLoad = pageLoads.length > 0 
    ? Math.round(pageLoads.reduce((acc, current) => acc + current.loadTimeMs, 0) / pageLoads.length)
    : 0;

  const avgTransition = transitions.length > 0 
    ? Math.round(transitions.reduce((acc, current) => acc + current.loadTimeMs, 0) / transitions.length)
    : 0;

  const maxLatency = logs.length > 0
    ? Math.max(...logs.map(l => l.loadTimeMs))
    : 0;

  // Latency rating breakdown
  // Excellent: <= 300ms
  // Good: 301 - 1000ms
  // Slow: > 1000ms
  const excellentCount = logs.filter(l => l.loadTimeMs <= 300).length;
  const goodCount = logs.filter(l => l.loadTimeMs > 300 && l.loadTimeMs <= 1000).length;
  const slowCount = logs.filter(l => l.loadTimeMs > 1000).length;

  const excellentPct = totalCount > 0 ? Math.round((excellentCount / totalCount) * 100) : 0;
  const goodPct = totalCount > 0 ? Math.round((goodCount / totalCount) * 100) : 0;
  const slowPct = totalCount > 0 ? Math.round((slowCount / totalCount) * 100) : 0;

  // Render browser details nicely
  const parseUserAgent = (ua: string) => {
    if (!ua) return 'Unknown Device';
    
    let browser = 'Unknown Browser';
    let os = 'Unknown OS';

    // Find browser
    if (ua.includes('Firefox')) {
      browser = 'Firefox';
    } else if (ua.includes('Chrome') && !ua.includes('Chromium')) {
      browser = 'Chrome';
    } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
      browser = 'Safari';
    } else if (ua.includes('Edge')) {
      browser = 'Edge';
    } else if (ua.includes('AppleWebKit')) {
      browser = 'Webkit';
    }

    // Find OS
    if (ua.includes('Windows NT')) {
      os = 'Windows';
    } else if (ua.includes('Macintosh') || ua.includes('Mac OS')) {
      os = 'macOS';
    } else if (ua.includes('Linux')) {
      os = 'Linux';
    } else if (ua.includes('Android')) {
      os = 'Android';
    } else if (ua.includes('iPhone') || ua.includes('iPad')) {
      os = 'iOS';
    }

    return `${browser} on ${os}`;
  };

  const getLatencyColor = (ms: number) => {
    if (ms <= 300) return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
    if (ms <= 1000) return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
    return 'text-rose-400 border-rose-500/20 bg-rose-500/5';
  };

  const getBrowserNameOnly = (ua: string) => {
    if (!ua) return 'Other';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Chrome') && !ua.includes('Chromium')) return 'Chrome';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    if (ua.includes('AppleWebKit')) return 'Webkit';
    return 'Other';
  };

  const getBrowserIcon = (browserName: string) => {
    switch (browserName) {
      case 'Chrome':
        return <Chrome size={14} className="text-amber-400 font-sans" />;
      case 'Safari':
        return <Compass size={14} className="text-sky-400 font-sans" />;
      case 'Firefox':
        return <Flame size={14} className="text-orange-500 font-sans" />;
      case 'Edge':
        return <Globe size={14} className="text-blue-400 font-sans" />;
      default:
        return <Globe size={14} className="text-zinc-400 font-sans" />;
    }
  };

  // Group performance logs by browser
  const browserGrouping: Record<string, { totalMs: number; count: number; pageloadMs: number; pageloadCount: number; transitionMs: number; transitionCount: number }> = {};
  
  logs.forEach(log => {
    const browser = getBrowserNameOnly(log.userAgent);
    if (!browserGrouping[browser]) {
      browserGrouping[browser] = {
        totalMs: 0,
        count: 0,
        pageloadMs: 0,
        pageloadCount: 0,
        transitionMs: 0,
        transitionCount: 0
      };
    }
    const g = browserGrouping[browser];
    g.totalMs += log.loadTimeMs;
    g.count += 1;
    if (log.type === 'pageload') {
      g.pageloadMs += log.loadTimeMs;
      g.pageloadCount += 1;
    } else {
      g.transitionMs += log.loadTimeMs;
      g.transitionCount += 1;
    }
  });

  const browserStats = Object.entries(browserGrouping).map(([browser, data]) => ({
    browser,
    count: data.count,
    avgLatency: Math.round(data.totalMs / data.count),
    pageloadAvg: data.pageloadCount > 0 ? Math.round(data.pageloadMs / data.pageloadCount) : 0,
    transitionAvg: data.transitionCount > 0 ? Math.round(data.transitionMs / data.transitionCount) : 0,
  })).sort((a, b) => b.count - a.count);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await performanceService.deleteLog(id);
    } catch (err) {
      console.error("Failed to delete log entry", err);
    }
  };

  const handlePurge = async () => {
    setIsActionPending(true);
    try {
      await performanceService.clearAllLogs();
      setIsConfirmPurgeOpen(false);
    } catch (err) {
      console.error("Failed to purge logs", err);
    } finally {
      setIsActionPending(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filterType === 'all') return true;
    return log.type === filterType;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Header Metrics block */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-[#8b949e] uppercase tracking-wider font-mono">Avg Initial Load</span>
            <div className="p-1.5 bg-[#238636]/10 border border-[#238636]/20 rounded-lg text-[#2ea44f]"><Gauge size={14} /></div>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl md:text-3xl font-black text-white">{avgPageLoad || 'N/A'} <span className="text-xs font-light text-[#8b949e]">ms</span></div>
          </div>
          <div className="text-[9px] text-[#8b949e] mt-2 flex items-center gap-1">
            <div className={`w-1.5 h-1.5 rounded-full ${avgPageLoad <= 300 ? 'bg-emerald-500' : avgPageLoad <= 1000 ? 'bg-amber-500' : 'bg-red-500'}`} />
            {avgPageLoad <= 300 ? 'Excellent response speed' : avgPageLoad <= 1000 ? 'Moderate network duration' : 'Heavy layout shift / payload'}
          </div>
        </div>

        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-[#8b949e] uppercase tracking-wider font-mono">Avg Transition</span>
            <div className="p-1.5 bg-[#58a6ff]/10 border border-[#58a6ff]/20 rounded-lg text-[#58a6ff]"><Layers size={14} /></div>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl md:text-3xl font-black text-white">{avgTransition || 'N/A'} <span className="text-xs font-light text-[#8b949e]">ms</span></div>
          </div>
          <div className="text-[9px] text-[#8b949e] mt-2 flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Instant client side view routing
          </div>
        </div>

        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-[#8b949e] uppercase tracking-wider font-mono">High Latency Peak</span>
            <div className="p-1.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400"><Clock size={14} /></div>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl md:text-3xl font-black text-white">{maxLatency || 'N/A'} <span className="text-xs font-light text-[#8b949e]">ms</span></div>
          </div>
          <div className="text-[9px] text-[#8b949e] mt-2 flex items-center gap-1">
            <span className="font-mono text-[8px] uppercase font-bold text-[#388bfd]">Worst Performance Marker</span>
          </div>
        </div>

        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-[#8b949e] uppercase tracking-wider font-mono">Telemetry Nodes</span>
            <div className="p-1.5 bg-violet-500/10 border border-violet-500/20 rounded-lg text-violet-400"><Database size={14} /></div>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl md:text-3xl font-black text-white">{totalCount} <span className="text-xs font-light text-[#8b949e]">logs</span></div>
          </div>
          <div className="text-[9px] text-[#8b949e] mt-2">
             Asynchronous diagnostic telemetry
          </div>
        </div>
      </div>

      {/* 2. Visual Distribution breakdown & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6 flex flex-col">
          {/* Latency Distribution Card */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 flex flex-col justify-between flex-1">
            <div>
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <Zap size={16} className="text-amber-400 mb-0.5" /> Latency Distribution
              </h3>
              <p className="text-xs text-[#8b949e] font-light leading-relaxed mb-6">
                Distribution of page mount and server delivery duration from diagnostic reports.
              </p>
            </div>

            <div className="space-y-4">
              {/* Awesome custom pure css bar chart */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-mono">
                  <span className="text-emerald-400 font-bold">Excellent (&lt;300ms)</span>
                  <span className="text-white">{excellentCount} logs ({excellentPct}%)</span>
                </div>
                <div className="w-full bg-[#21262d] h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${excellentPct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5 font-mono">
                  <span className="text-amber-400 font-bold">Fair (300-1000ms)</span>
                  <span className="text-white">{goodCount} logs ({goodPct}%)</span>
                </div>
                <div className="w-full bg-[#21262d] h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full transition-all duration-500" style={{ width: `${goodPct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5 font-mono">
                  <span className="text-rose-400 font-bold">Slow (&gt;1000ms)</span>
                  <span className="text-white">{slowCount} logs ({slowPct}%)</span>
                </div>
                <div className="w-full bg-[#21262d] h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full transition-all duration-500" style={{ width: `${slowPct}%` }} />
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-[#30363d] flex items-center justify-between">
              <span className="text-[10px] text-[#8b949e] font-mono">Admin Control:</span>
              {!isConfirmPurgeOpen ? (
                <button 
                  onClick={() => setIsConfirmPurgeOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-rose-400 hover:text-white border border-rose-500/20 hover:bg-rose-600/10 rounded-lg admin-glow transition-all uppercase tracking-wider"
                >
                  <Trash2 size={12} /> Purge Telemetry
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handlePurge}
                    disabled={isActionPending}
                    className="px-2.5 py-1.5 bg-rose-600 text-white font-bold rounded-lg text-[10px] hover:bg-rose-700 disabled:opacity-50 font-sans"
                  >
                    {isActionPending ? 'Purging...' : 'Confirm'}
                  </button>
                  <button 
                    onClick={() => setIsConfirmPurgeOpen(false)}
                    className="px-2.5 py-1.5 bg-[#21262d] text-zinc-400 font-bold rounded-lg text-[10px] hover:text-white font-sans"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Browser Performance Breakdown Card */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2 font-sans">
              <Monitor size={16} className="text-[#58a6ff]" /> Browser Latency
            </h3>
            <p className="text-xs text-[#8b949e] font-light leading-relaxed mb-5 font-sans">
              Average request latency and routing speed categorized by browser agent.
            </p>

            <div className="space-y-4">
              {isLoading ? (
                <div className="py-8 text-center text-[11px] text-[#8b949e] font-mono animate-pulse">
                  Analyzing user-agents...
                </div>
              ) : browserStats.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-500 font-light font-sans">
                  No browser data reported yet.
                </div>
              ) : (
                browserStats.map((stat) => {
                  const barProgress = Math.min(100, Math.max(10, Math.round((stat.avgLatency / 1500) * 100)));
                  return (
                    <div key={stat.browser} className="p-3 rounded-xl bg-[#0d1117] border border-[#21262d] hover:border-[#30363d] transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getBrowserIcon(stat.browser)}
                          <span className="text-xs font-bold text-white font-mono">{stat.browser}</span>
                          <span className="text-[9px] text-[#8b949e] font-sans">({stat.count} node{stat.count > 1 ? 's' : ''})</span>
                        </div>
                        <div className={`px-2 py-0.5 rounded text-[11px] font-black font-mono border ${getLatencyColor(stat.avgLatency)}`}>
                          {stat.avgLatency} ms
                        </div>
                      </div>

                      {/* Display sub breakdown of page mount vs transition */}
                      <div className="flex items-center justify-between text-[9px] text-[#8b949e] font-mono mb-2.5">
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Load: {stat.pageloadAvg ? `${stat.pageloadAvg}ms` : 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#58a6ff]" />
                          Transit: {stat.transitionAvg ? `${stat.transitionAvg}ms` : 'N/A'}
                        </span>
                      </div>

                      {/* Relative weight visual bar */}
                      <div className="w-full bg-[#161b22] h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            stat.avgLatency <= 300 
                              ? 'bg-emerald-500' 
                              : stat.avgLatency <= 1000 
                              ? 'bg-amber-500' 
                              : 'bg-rose-500'
                          }`} 
                          style={{ width: `${barProgress}%` }} 
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* 3. Detailed Logs Tables */}
        <div className="lg:col-span-2 bg-[#161b22] border border-[#30363d] rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Diagnostic Log Console</h3>
              <p className="text-[10px] text-[#8b949e]">Recent loading and navigation timing signals recorded.</p>
            </div>
            
            <div className="flex bg-[#0d1117] border border-[#30363d] p-1 rounded-xl">
              {(['all', 'pageload', 'transition'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${
                    filterType === type 
                      ? 'bg-[#21262d] text-white border border-[#30363d]' 
                      : 'text-[#8b949e] hover:text-white border border-transparent'
                  }`}
                >
                  {type === 'all' ? 'All Activities' : type === 'pageload' ? 'Loads' : 'Transitions'}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-hidden border border-[#30363d] rounded-xl bg-[#0d1117] relative">
            <div className="max-h-[385px] overflow-y-auto divide-y divide-[#30363d] [scrollbar-width:thin] [scrollbar-color:#30363d_transparent]">
              {isLoading ? (
                <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
                  <RefreshCw size={24} className="text-[#58a6ff] animate-spin" />
                  <span className="text-xs text-[#8b949e] font-mono">Connecting to real-time firestore stream...</span>
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="py-20 text-center">
                  <Activity size={24} className="text-zinc-600 mx-auto mb-3" />
                  <span className="text-xs text-[#8b949e]">Empty stream. No telemetry received yet.</span>
                </div>
              ) : (
                filteredLogs.map((log) => {
                  const relativeTime = log.createdAt?.toDate 
                    ? new Date(log.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                    : 'just now';

                  return (
                    <div 
                      key={log.id} 
                      onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 cursor-pointer hover:bg-[#161b22] transition-colors gap-3 ${selectedLog?.id === log.id ? 'bg-[#1f242c]' : ''}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Event type marker */}
                        {log.type === 'pageload' ? (
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                            <Monitor size={14} />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-[#58a6ff]/10 border border-[#58a6ff]/20 flex items-center justify-center text-[#58a6ff] shrink-0">
                            <Layers size={14} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-bold text-white font-mono break-all leading-none">{log.page === '/' ? 'Home View' : log.page}</span>
                            <span className="text-[8px] text-[#8b949e] bg-[#21262d] px-1.5 py-0.5 rounded font-mono uppercase tracking-wide">
                              {log.type === 'pageload' ? 'Initial' : 'Transition'}
                            </span>
                          </div>
                          <div className="text-[10px] text-[#8b949e] flex items-center gap-2">
                            <span>{relativeTime}</span>
                            <span>•</span>
                            <span className="truncate max-w-[150px] sm:max-w-[200px]" title={log.userAgent}>
                              {parseUserAgent(log.userAgent)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        {/* Latency mark */}
                        <div className={`px-2.5 py-1 rounded-lg border text-xs font-black font-mono tracking-tight ${getLatencyColor(log.loadTimeMs)}`}>
                          {log.loadTimeMs} ms
                        </div>
                        
                        <button 
                          onClick={(e) => handleDelete(e, log.id)}
                          className="p-1.5 text-zinc-500 hover:text-red-400 bg-transparent hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/25"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Log Inspection Terminal Details block */}
      <AnimatePresence>
        {selectedLog && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="p-5 bg-[#0d1117] border border-[#30363d] rounded-2xl relative"
          >
            <button 
              onClick={() => setSelectedLog(null)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
            >
              <X size={16} />
            </button>
            <h4 className="text-xs font-black text-[#58a6ff] uppercase tracking-widest mb-4 font-mono">Performance Event Metadata</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-[#8b949e] font-mono block mb-0.5">Payload ID:</span>
                  <span className="text-white font-mono break-all bg-[#161b22] px-2 py-1 rounded border border-[#30363d] inline-block">{selectedLog.id}</span>
                </div>
                <div>
                  <span className="text-[#8b949e] font-mono block mb-0.5">Measurement Type:</span>
                  <span className="text-white font-serif">{selectedLog.type === 'pageload' ? 'Complete static page download latency' : 'Client-side SPA React view translation'}</span>
                </div>
                <div>
                  <span className="text-[#8b949e] font-mono block">Action Destination:</span>
                  <span className="text-[#58a6ff] font-bold">"{selectedLog.page}"</span>
                </div>
              </div>
              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-[#8b949e] font-mono block mb-0.5">Report Time:</span>
                  <span className="text-white font-mono">{selectedLog.createdAt?.toDate ? selectedLog.createdAt.toDate().toUTCString() : 'Just recorded'}</span>
                </div>
                <div>
                  <span className="text-[#8b949e] font-mono block mb-0.5">Device Fingerprint:</span>
                  <span className="text-[#8b949e] text-[10px] block leading-relaxed max-w-md font-mono select-all bg-[#161b22] px-2 py-1.5 rounded border border-[#30363d] truncate" title={selectedLog.userAgent}>
                    {selectedLog.userAgent}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
