import { useState, useRef, useEffect } from 'react';
import '@/styles/terminal.css';

interface HistoryItem {
  command: string;
  timestamp: Date;
}

export default function CommandWidget() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = [
    'status',
    'spawn assistant',
    'spawn mic',
    'spawn status',
    'destroy all',
    'toggle passthrough',
    'help',
    'clear',
    'exit',
  ];

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Update suggestions
  useEffect(() => {
    if (!input) {
      setSuggestions([]);
      return;
    }
    
    const filtered = commands.filter(cmd => 
      cmd.toLowerCase().startsWith(input.toLowerCase())
    );
    setSuggestions(filtered.slice(0, 3));
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;

    // Add to history
    setHistory(prev => [...prev.slice(-9), { command: input, timestamp: new Date() }]);
    
    // Process command (demo - just log it)
    console.log('[COMMAND]', input);
    
    // Clear input
    setInput('');
    setHistoryIndex(-1);
    setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = historyIndex < history.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex]?.command || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex]?.command || '');
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setInput(suggestions[0]);
        setSuggestions([]);
      }
    } else if (e.key === 'Escape') {
      setInput('');
      setSuggestions([]);
    }
  };

  return (
    <div className="terminal-widget w-full h-full flex items-center noise-overlay glow-border">
      <form onSubmit={handleSubmit} className="flex-1 flex items-center px-3 py-2 gap-2">
        {/* Prompt */}
        <span className="terminal-text font-bold text-lg">{'>'}</span>
        
        {/* Input container */}
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent border-none outline-none terminal-text text-sm"
            placeholder="Enter command..."
            autoComplete="off"
            spellCheck="false"
          />
          
          {/* Ghost suggestion */}
          {suggestions.length > 0 && input && (
            <div className="absolute inset-0 pointer-events-none flex items-center">
              <span className="text-sm opacity-0">{input}</span>
              <span className="terminal-text-dim text-sm">
                {suggestions[0].slice(input.length)}
              </span>
            </div>
          )}
        </div>

        {/* Cursor indicator */}
        <div className="terminal-cursor h-4" />

        {/* Status indicator */}
        <div className="flex items-center gap-1.5 ml-2">
          <div className="pulse-indicator !w-1.5 !h-1.5" />
          <span className="terminal-text-dim text-[10px] uppercase">Ready</span>
        </div>
      </form>

      {/* Suggestions dropdown (positioned above) */}
      {suggestions.length > 1 && (
        <div className="absolute bottom-full left-0 right-0 mb-1 bg-[var(--terminal-bg)] border border-[var(--terminal-border)] rounded">
          {suggestions.map((suggestion, i) => (
            <div 
              key={suggestion}
              className={`px-3 py-1.5 text-sm cursor-pointer ${
                i === 0 
                  ? 'terminal-text bg-[var(--terminal-primary)]/10' 
                  : 'terminal-text-dim hover:bg-[var(--terminal-primary)]/5'
              }`}
              onClick={() => {
                setInput(suggestion);
                setSuggestions([]);
                inputRef.current?.focus();
              }}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
