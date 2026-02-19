import { useRef, useEffect } from 'react';
import { Terminal, Trash2, Copy } from 'lucide-react';
import type { RunResult } from '@/types';

interface ConsoleOutputProps {
  history: RunResult[];
  onClear: () => void;
}

export default function ConsoleOutput({ history, onClear }: ConsoleOutputProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const copyToClipboard = () => {
    const text = history
      .map((h) => `[${new Date(h.timestamp).toLocaleTimeString()}] ${h.type.toUpperCase()}: ${JSON.stringify(h.content)}`)
      .join('\n');
    navigator.clipboard.writeText(text);
  };

  const renderContent = (content: any[]) => {
    return content.map((item, idx) => {
      if (typeof item === 'object') {
        return (
          <pre key={idx} className="text-xs opacity-80 overflow-x-auto">
            {JSON.stringify(item, null, 2)}
          </pre>
        );
      }
      return <span key={idx}>{String(item)} </span>;
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] border-l border-white/5">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-2 text-xs font-medium text-white/50 uppercase tracking-wider">
          <Terminal size={14} />
          Console
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            className="p-1.5 hover:bg-white/5 rounded-md text-white/40 hover:text-white/80 transition-colors"
            title="Copy Output"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={onClear}
            className="p-1.5 hover:bg-white/5 rounded-md text-white/40 hover:text-white/80 transition-colors"
            title="Clear Console"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-2">
        {history.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-white/20 italic">
            <p>No output yet.</p>
            <p className="text-xs">Press ⌘+Enter to run code</p>
          </div>
        )}
        {history.map((log, i) => (
          <div key={i} className={`flex gap-3 group animate-in fade-in slide-in-from-left-2 duration-300`}>
            <span className="text-[10px] text-white/20 mt-1 tabular-nums w-14 flex-shrink-0">
              {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <div className={`flex-1 rounded px-2 py-0.5 ${
              log.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
              log.type === 'warn' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
              log.type === 'info' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
              'text-white/90'
            }`}>
              {renderContent(log.content)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
