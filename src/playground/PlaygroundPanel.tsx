import { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Play, RotateCcw, ChevronDown, Zap } from 'lucide-react';
import { usePlaygroundStore } from '@/stores/usePlaygroundStore';
import { runJavaScript } from './JavaScriptRunner';
import ConsoleOutput from './ConsoleOutput';

export default function PlaygroundPanel() {
  const { activeLanguage, code, setCode, history, addHistory, clearHistory } = usePlaygroundStore();
  const [isRunning, setIsRunning] = useState(false);
  const editorRef = useRef<any>(null);

  const handleRun = async () => {
    if (isRunning) return;
    setIsRunning(true);
    
    try {
      await runJavaScript(code[activeLanguage] || '', (log) => {
        addHistory(log);
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Add Cmd+Enter shortcut
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleRun();
    });

    // Add Cmd+L shortcut to clear console
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyL, () => {
      clearHistory();
    });
  };


  const handleReset = () => {
    if (confirm('Are you sure you want to reset the code?')) {
      setCode(activeLanguage, '// Write your JavaScript here\nconsole.log("Hello, World!");');
      clearHistory();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1e1e1e] border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg text-sm font-medium text-white/80 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            {activeLanguage === 'javascript' ? 'JavaScript' : activeLanguage}
            <ChevronDown size={14} className="opacity-50" />
          </div>
          
          <button
            onClick={handleRun}
            disabled={isRunning}
            className={`flex items-center gap-2 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-semibold rounded-lg transition-all active:scale-95 shadow-lg shadow-amber-500/20`}
          >
            {isRunning ? (
              <Zap size={16} className="animate-spin" />
            ) : (
              <Play size={16} fill="currentColor" />
            )}
            Run
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 text-white/40 hover:text-white/80 rounded-lg transition-colors text-sm"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        <div className="flex-1 min-w-0 h-full relative group">
          <Editor
            height="100%"
            language={activeLanguage}
            value={code[activeLanguage] || ''}
            onChange={(val) => setCode(activeLanguage, val || '')}
            onMount={handleEditorDidMount}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: 'JetBrains Mono, monospace',
              lineNumbers: 'on',
              roundedSelection: true,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 20, bottom: 20 },
              cursorSmoothCaretAnimation: 'on',
              cursorBlinking: 'smooth',
            }}
          />
        </div>

        {/* Console */}
        <div className="w-[400px] flex-shrink-0 h-full">
          <ConsoleOutput history={history} onClear={clearHistory} />
        </div>
      </div>
    </div>
  );
}
