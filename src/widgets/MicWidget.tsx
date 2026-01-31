import { useState, useEffect } from 'react';
import '@/index.css';
import '@/styles/terminal.css';

type MicState = 'idle' | 'listening' | 'processing';

export default function MicWidget() {
  const [state, setState] = useState<MicState>('idle');
  const [audioLevels, setAudioLevels] = useState<number[]>([0.3, 0.5, 0.7, 0.5, 0.3]);

  // Cycle through states for demo
  useEffect(() => {
    const states: MicState[] = ['idle', 'listening', 'processing'];
    let currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % states.length;
      setState(states[currentIndex]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Animate audio levels when listening
  useEffect(() => {
    if (state !== 'listening') return;

    const interval = setInterval(() => {
      setAudioLevels(prev => 
        prev.map(() => 0.2 + Math.random() * 0.8)
      );
    }, 100);

    return () => clearInterval(interval);
  }, [state]);

  return (
    <div data-widget="mic" className={`widget-root terminal-widget w-full h-full flex flex-col items-center justify-center noise-overlay ${state === 'listening' ? 'glow-border' : ''}`}>
      {/* Central visualizer */}
      <div className="relative flex items-center justify-center">
        {/* Outer rings */}
        {state === 'listening' && (
          <>
            <div 
              className="absolute w-20 h-20 audio-ring"
              style={{ animationDelay: '0s' }}
            />
            <div 
              className="absolute w-16 h-16 audio-ring"
              style={{ animationDelay: '0.3s' }}
            />
          </>
        )}

        {/* Core shape */}
        <div 
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
            state === 'idle' 
              ? 'bg-[var(--terminal-border)]' 
              : state === 'listening'
              ? 'bg-[var(--terminal-primary)]'
              : 'bg-[var(--terminal-accent)]'
          }`}
          style={{
            boxShadow: state !== 'idle' 
              ? `0 0 20px var(--terminal-glow), 0 0 40px var(--terminal-glow)` 
              : 'none',
            transform: state === 'processing' ? 'scale(0.9)' : 'scale(1)',
          }}
        >
          {/* Inner icon */}
          <MicIcon state={state} />
        </div>
      </div>

      {/* Audio bars */}
      {state === 'listening' && (
        <div className="flex items-end gap-1 mt-4 h-6">
          {audioLevels.map((level, i) => (
            <div
              key={i}
              className="w-1.5 bg-[var(--terminal-primary)] rounded-sm transition-all duration-75"
              style={{
                height: `${level * 24}px`,
                boxShadow: '0 0 5px var(--terminal-glow)',
              }}
            />
          ))}
        </div>
      )}

      {/* Processing spinner */}
      {state === 'processing' && (
        <div className="mt-4 flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-[var(--terminal-accent)] border-t-transparent rounded-full animate-spin" />
          <span className="text-[10px] terminal-text-accent">ANALYZING</span>
        </div>
      )}

      {/* State label */}
      <div className={`mt-3 text-[10px] uppercase tracking-wider ${
        state === 'idle' 
          ? 'terminal-text-dim' 
          : state === 'listening'
          ? 'terminal-text'
          : 'terminal-text-accent'
      }`}>
        {state === 'idle' ? '◇ TAP TO SPEAK' : state === 'listening' ? '◈ LISTENING' : '◈ PROCESSING'}
      </div>
    </div>
  );
}

function MicIcon({ state }: { state: MicState }) {
  const color = state === 'idle' 
    ? 'var(--terminal-text-dim)' 
    : state === 'listening'
    ? 'var(--terminal-bg)'
    : 'var(--terminal-bg)';

  return (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  );
}
