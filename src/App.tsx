import React, { useEffect, useState } from 'react';
import { Chat } from './components/Chat';
import { ConfigModal } from './components/ConfigModal';
import { loadConfig } from './utils/config';
export function App() {
  const [showConfig, setShowConfig] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  useEffect(() => {
    const config = loadConfig();
    setIsConfigured(!!config.apiEndpoint);
  }, []);
  return <div className="flex flex-col w-full min-h-screen bg-background">
      <header className="border-b p-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold">AI Chat</h1>
        <button onClick={() => setShowConfig(true)} className="px-3 py-1 text-sm rounded-md bg-secondary hover:bg-secondary/80 transition-colors">
          Settings
        </button>
      </header>
      {isConfigured ? <Chat /> : <div className="flex-1 flex flex-col items-center justify-center p-6">
          <p className="text-center mb-4">
            Welcome to AI Chat! Please configure your API settings to begin.
          </p>
          <button onClick={() => setShowConfig(true)} className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
            Configure API
          </button>
        </div>}
      {showConfig && <ConfigModal onClose={() => setShowConfig(false)} onSave={() => setIsConfigured(true)} />}
    </div>;
}