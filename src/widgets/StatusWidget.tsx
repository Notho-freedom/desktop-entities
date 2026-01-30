import { useState, useEffect } from 'react';
import '@/styles/terminal.css';

interface SystemStats {
  cpu: number;
  memory: number;
  network: number;
  uptime: string;
}

export default function StatusWidget() {
  const [stats, setStats] = useState<SystemStats>({
    cpu: 42,
    memory: 67,
    network: 23,
    uptime: '04:23:17',
  });

  const [dataStream, setDataStream] = useState<string[]>([]);

  // Simulate stats updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        cpu: Math.min(100, Math.max(10, prev.cpu + (Math.random() - 0.5) * 20)),
        memory: Math.min(100, Math.max(30, prev.memory + (Math.random() - 0.5) * 10)),
        network: Math.min(100, Math.max(0, prev.network + (Math.random() - 0.5) * 30)),
        uptime: formatUptime(Date.now()),
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Generate data stream
  useEffect(() => {
    const chars = '0123456789ABCDEF';
    const generateLine = () => {
      return Array.from({ length: 32 }, () => 
        chars[Math.floor(Math.random() * chars.length)]
      ).join('');
    };

    const interval = setInterval(() => {
      setDataStream(prev => {
        const newStream = [...prev, generateLine()];
        return newStream.slice(-5);
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="terminal-widget w-full h-full flex flex-col noise-overlay">
      {/* Header */}
      <div className="terminal-header drag-handle">
        <span className="terminal-header-title">◈ SYS_STATUS</span>
        <div className="terminal-header-status">
          <div className="pulse-indicator" />
          <span className="terminal-text-dim">ACTIVE</span>
        </div>
      </div>

      {/* Content */}
      <div className="terminal-content flex-1 flex flex-col gap-3">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2">
          <StatBar label="CPU" value={stats.cpu} />
          <StatBar label="MEM" value={stats.memory} />
          <StatBar label="NET" value={stats.network} />
          <div className="flex flex-col">
            <span className="text-[10px] terminal-text-dim uppercase">Uptime</span>
            <span className="terminal-text text-sm font-mono">{stats.uptime}</span>
          </div>
        </div>

        {/* Data Stream */}
        <div className="flex-1 overflow-hidden">
          <div className="text-[8px] terminal-text-dim mb-1">DATA_STREAM</div>
          <div className="data-stream h-full">
            {dataStream.map((line, i) => (
              <div 
                key={i} 
                className="data-stream-line"
                style={{ animationDelay: `${i * 0.1}s`, opacity: 0.3 + (i * 0.15) }}
              >
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-[10px]">
        <span className="terminal-text-dim">{label}</span>
        <span className="terminal-text">{Math.round(value)}%</span>
      </div>
      <div className="terminal-progress">
        <div 
          className="terminal-progress-bar" 
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function formatUptime(timestamp: number): string {
  const hours = Math.floor((timestamp / 1000 / 60 / 60) % 24);
  const minutes = Math.floor((timestamp / 1000 / 60) % 60);
  const seconds = Math.floor((timestamp / 1000) % 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
