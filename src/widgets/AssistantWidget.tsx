import { useState, useEffect, useRef } from 'react';
import '@/styles/terminal.css';

type AssistantState = 'idle' | 'thinking' | 'responding';

export default function AssistantWidget() {
  const [state, setState] = useState<AssistantState>('idle');
  const [response, setResponse] = useState('');
  const [displayedText, setDisplayedText] = useState('');
  const responseRef = useRef<HTMLDivElement>(null);

  // Demo responses
  const demoResponses = [
    'Analysing system metrics... All nominal.',
    'Neural pathways synchronized. Ready for input.',
    'Cognitive processes active. Awaiting directives.',
    'Pattern recognition online. Monitoring environment.',
    'Data streams integrated. Processing complete.',
  ];

  // Simulate thinking -> responding cycle
  useEffect(() => {
    const cycle = () => {
      setState('thinking');
      
      setTimeout(() => {
        const newResponse = demoResponses[Math.floor(Math.random() * demoResponses.length)];
        setResponse(newResponse);
        setState('responding');
      }, 2000 + Math.random() * 1500);
    };

    // Initial delay
    const initialTimeout = setTimeout(cycle, 1500);
    
    // Repeat cycle
    const interval = setInterval(cycle, 8000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  // Typing effect
  useEffect(() => {
    if (state !== 'responding') {
      setDisplayedText('');
      return;
    }

    let index = 0;
    const interval = setInterval(() => {
      if (index < response.length) {
        setDisplayedText(response.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setTimeout(() => setState('idle'), 2000);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [state, response]);

  return (
    <div className={`terminal-widget w-full h-full flex flex-col noise-overlay ${state === 'thinking' ? 'glow-border' : ''}`}>
      {/* Header */}
      <div className="terminal-header drag-handle">
        <span className="terminal-header-title">◈ COGNITIVE_CORE</span>
        <div className="terminal-header-status">
          <StateIndicator state={state} />
        </div>
      </div>

      {/* Content */}
      <div className="terminal-content flex-1 flex flex-col">
        {/* Status line */}
        <div className="text-[10px] terminal-text-dim mb-2 flex items-center gap-2">
          <span>STATUS:</span>
          <span className={state === 'idle' ? 'terminal-text' : state === 'thinking' ? 'terminal-text-accent' : 'terminal-text'}>
            {state.toUpperCase()}
          </span>
        </div>

        {/* Response area */}
        <div 
          ref={responseRef}
          className="flex-1 p-3 bg-black/30 rounded border border-[var(--terminal-border)] overflow-y-auto"
        >
          {state === 'thinking' && <ThinkingAnimation />}
          
          {(state === 'responding' || state === 'idle') && displayedText && (
            <div className="terminal-text text-sm leading-relaxed">
              {displayedText}
              {state === 'responding' && <span className="terminal-cursor" />}
            </div>
          )}

          {state === 'idle' && !displayedText && (
            <div className="terminal-text-dim text-sm italic">
              Awaiting input...
            </div>
          )}
        </div>

        {/* Input hint */}
        <div className="mt-2 text-[10px] terminal-text-dim flex items-center gap-2">
          <span className="terminal-text">{'>'}</span>
          <span className="flicker">Neural link established</span>
        </div>
      </div>
    </div>
  );
}

function StateIndicator({ state }: { state: AssistantState }) {
  return (
    <div className="flex items-center gap-2">
      <div 
        className={`w-2 h-2 rounded-full ${
          state === 'idle' 
            ? 'bg-[var(--terminal-text-dim)]' 
            : state === 'thinking'
            ? 'bg-[var(--terminal-accent)] animate-pulse'
            : 'bg-[var(--terminal-primary)]'
        }`}
        style={{
          boxShadow: state !== 'idle' ? '0 0 8px var(--terminal-primary)' : 'none'
        }}
      />
      <span className="terminal-text-dim text-[10px]">
        {state === 'idle' ? 'STANDBY' : state === 'thinking' ? 'PROCESSING' : 'OUTPUT'}
      </span>
    </div>
  );
}

function ThinkingAnimation() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-[var(--terminal-accent)] rounded-full animate-ping" />
        <span className="terminal-text-accent text-sm">Processing neural pathways...</span>
      </div>
      <div className="flex gap-1 mt-2">
        {[0, 1, 2, 3, 4].map(i => (
          <div 
            key={i}
            className="w-1 h-4 bg-[var(--terminal-primary)]"
            style={{
              animation: 'audio-bounce 0.6s ease-in-out infinite alternate',
              animationDelay: `${i * 0.1}s`,
              opacity: 0.5 + i * 0.1
            }}
          />
        ))}
      </div>
    </div>
  );
}
