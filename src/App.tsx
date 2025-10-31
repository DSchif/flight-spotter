import { useState, useEffect } from 'react';
import { AppState, ViewConfig } from './types';
import Setup from './components/Setup';
import Dashboard from './components/Dashboard';
import './App.css';

const STORAGE_KEY = 'flight-spotter-config';

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.SETUP);
  const [viewConfig, setViewConfig] = useState<ViewConfig | null>(null);

  // Load saved configuration on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      console.log('Loading saved config:', saved);
      if (saved) {
        const config = JSON.parse(saved) as ViewConfig;
        console.log('Parsed config:', config);
        setViewConfig(config);
        setAppState(AppState.DASHBOARD);
      }
    } catch (error) {
      console.error('Failed to load saved configuration:', error);
    }
  }, []);

  const handleSetupComplete = (config: ViewConfig) => {
    console.log('Saving config:', config);
    setViewConfig(config);
    setAppState(AppState.DASHBOARD);

    // Save to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      console.log('Config saved to localStorage');
    } catch (error) {
      console.error('Failed to save configuration:', error);
    }
  };

  const handleReset = () => {
    setAppState(AppState.SETUP);
    // Don't clear viewConfig - keep it so Setup can use it as initial values
  };

  return (
    <div className="app">
      {appState === AppState.SETUP ? (
        <Setup onComplete={handleSetupComplete} initialConfig={viewConfig} />
      ) : (
        viewConfig && <Dashboard viewConfig={viewConfig} onReset={handleReset} />
      )}
    </div>
  );
}

export default App;
