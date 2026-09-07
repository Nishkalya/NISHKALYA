import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';

export interface CommentItem {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface NotesData {
  comments: CommentItem[];
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
        comments: parsed.comments || [],
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
    } catch (e) {
      // JSON parse error, fallback
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
  const [draft, setDraft] = useState('');

  const updateNotesField = async (updatedData: NotesData) => {
    const serialized = serializeNotesData(updatedData);
    await onSave(itemId, serialized, isInbox);
  };

  const handleAddComment = async () => {
    if (!draft.trim()) return;
    const now = new Date();
    const formattedDate = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newComment: CommentItem = {
      id: `CMT-${Math.floor(100000 + Math.random() * 900000)}`,
      author: author || 'System Representative',
      text: draft.trim(),
      timestamp: formattedDate
    };
    const updatedData: NotesData = {
      ...data,
      comments: [newComment, ...data.comments]
    };
    setDraft('');
    await updateNotesField(updatedData);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="space-y-3">
        <label className={`text-[10px] font-mono uppercase tracking-widest block font-bold flex items-center gap-1.5 ${
          isWhite ? 'text-slate-500' : 'text-slate-400'
        }`}>
          <MessageSquare size={12} className={isWhite ? 'text-amber-500' : 'text-amber-400'} />
          Comments Thread ({data.comments.length})
        </label>

        <div className="relative">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type comment... (Press Enter to log)"
            className={`w-full border rounded-xl p-3 pb-10 text-xs outline-none focus:border-amber-400 min-h-[72px] font-sans resize-none transition-colors shadow-sm ${
              isWhite
                ? 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
                : 'bg-[#161b22] border-slate-800 text-white placeholder-slate-500'
            }`}
          />
          <div className="absolute right-2 bottom-2 flex items-center gap-2">
            <span className={`text-[9px] font-mono tracking-wider ${isWhite ? 'text-slate-400' : 'text-slate-600'}`}>
              ENTER TO SEND
            </span>
            <button
              onClick={handleAddComment}
              className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer border ${
                isWhite
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-200'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800'
              }`}
            >
              Add
            </button>
          </div>
        </div>

        <div className={`max-h-[160px] overflow-y-auto space-y-2 pr-2 divide-y ${
          isWhite ? 'divide-slate-100' : 'divide-slate-800/50'
        }`}>
          {data.comments.length === 0 ? (
            <div className={`italic font-sans text-xs text-center py-4 ${
              isWhite ? 'text-slate-400' : 'text-slate-500'
            }`}>
              No comments logged yet.
            </div>
          ) : (
            data.comments.map((comment) => (
              <div key={comment.id} className="pt-3 pb-1 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full font-bold font-mono text-[9px] flex items-center justify-center border shadow-sm ${
                      isWhite
                        ? 'bg-sky-50 text-sky-700 border-sky-200'
                        : 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                    }`}>
                      {comment.author.charAt(0).toUpperCase()}
                    </div>
                    <span className={`font-semibold ${isWhite ? 'text-slate-800' : 'text-slate-300'}`}>{comment.author}</span>
                  </div>
                  <span className={`text-[10px] font-mono ${isWhite ? 'text-slate-400' : 'text-slate-500'}`}>{comment.timestamp}</span>
                </div>
                <p className={`font-sans pl-7 whitespace-pre-wrap leading-relaxed ${
                  isWhite ? 'text-slate-600' : 'text-slate-400'
                }`}>{comment.text}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
