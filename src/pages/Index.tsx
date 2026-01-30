import StatusWidget from "@/widgets/StatusWidget";
import AssistantWidget from "@/widgets/AssistantWidget";
import MicWidget from "@/widgets/MicWidget";
import CommandWidget from "@/widgets/CommandWidget";
import "@/styles/terminal.css";

export default function Index() {
  return (
    <div 
      className="min-h-screen p-8"
      style={{ 
        background: 'var(--terminal-bg, #0a0f0a)',
        fontFamily: "'JetBrains Mono', monospace"
      }}
    >
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 
          className="text-3xl font-bold mb-2 glitch-text" 
          data-text="DESKTOP DOMINATION"
          style={{ color: 'var(--terminal-primary, #00ff41)' }}
        >
          DESKTOP DOMINATION
        </h1>
        <p style={{ color: 'var(--terminal-text-dim, #4a7c4a)' }}>
          Electron Overlay Widget System — Demo Preview
        </p>
      </div>

      {/* Widget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {/* Status Widget */}
        <div className="h-[200px]">
          <StatusWidget />
        </div>

        {/* Assistant Widget */}
        <div className="h-[300px]">
          <AssistantWidget />
        </div>

        {/* Mic Widget */}
        <div className="h-[180px] max-w-[200px] mx-auto md:mx-0">
          <MicWidget />
        </div>

        {/* Command Widget */}
        <div className="h-[60px]">
          <CommandWidget />
        </div>
      </div>

      {/* Instructions */}
      <div 
        className="mt-12 max-w-2xl mx-auto p-6 rounded border"
        style={{ 
          borderColor: 'var(--terminal-border, #1a3a1a)',
          background: 'rgba(0,0,0,0.3)'
        }}
      >
        <h2 
          className="text-lg font-bold mb-4"
          style={{ color: 'var(--terminal-primary, #00ff41)' }}
        >
          ◈ SETUP INSTRUCTIONS
        </h2>
        <ol 
          className="list-decimal list-inside space-y-2 text-sm"
          style={{ color: 'var(--terminal-text, #b5ffb5)' }}
        >
          <li>Copy the project to your local machine</li>
          <li>Run <code className="px-2 py-0.5 rounded" style={{ background: 'rgba(0,255,65,0.1)' }}>npm install electron electron-builder --save-dev</code></li>
          <li>Add scripts to package.json (see electron-builder.json)</li>
          <li>Run <code className="px-2 py-0.5 rounded" style={{ background: 'rgba(0,255,65,0.1)' }}>npm run electron:dev</code></li>
          <li>Widgets will spawn as transparent overlays on your desktop</li>
        </ol>
        
        <div 
          className="mt-4 pt-4 border-t text-xs"
          style={{ 
            borderColor: 'var(--terminal-border, #1a3a1a)',
            color: 'var(--terminal-text-dim, #4a7c4a)'
          }}
        >
          <strong>Hotkeys:</strong> Ctrl+Shift+W (toggle all) | Ctrl+Shift+Q (spawn assistant)
        </div>
      </div>
    </div>
  );
}
