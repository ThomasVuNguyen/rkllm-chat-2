import React, { useEffect, useState } from 'react';
import { loadConfig, saveConfig } from '../utils/config';
interface ConfigModalProps {
  onClose: () => void;
  onSave: () => void;
}
export function ConfigModal({
  onClose,
  onSave
}: ConfigModalProps) {
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [apiKey, setApiKey] = useState('');
  useEffect(() => {
    const config = loadConfig();
    setApiEndpoint(config.apiEndpoint || '');
    setApiKey(config.apiKey || '');
  }, []);
  const handleSave = () => {
    saveConfig({
      apiEndpoint,
      apiKey
    });
    onSave();
    onClose();
  };
  return <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full p-6">
        <h2 className="text-xl font-semibold mb-4">API Configuration</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="apiEndpoint" className="block text-sm font-medium mb-1">
              API Endpoint
            </label>
            <input id="apiEndpoint" type="text" value={apiEndpoint} onChange={e => setApiEndpoint(e.target.value)} placeholder="https://api.openai.com/v1/chat/completions" className="w-full p-2 border rounded-md" />
          </div>
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium mb-1">
              API Key
            </label>
            <input id="apiKey" type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="sk-..." className="w-full p-2 border rounded-md" />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 border rounded-md hover:bg-secondary transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={!apiEndpoint.trim()} className={`px-4 py-2 bg-primary text-primary-foreground rounded-md transition-colors ${!apiEndpoint.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90'}`}>
            Save
          </button>
        </div>
      </div>
    </div>;
}