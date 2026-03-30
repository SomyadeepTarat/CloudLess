import './App.css';
import { useContext, useEffect } from 'react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import AppContext, { AppProvider } from './context/AppContext';
import * as api from './services/api';

function AppContent() {
  const { user, login } = useContext(AppContext);

  useEffect(() => {
    api.healthCheck().catch((err) => {
      console.error('Server is not available:', err);
    });
  }, []);

  if (!user) {
    return <Auth onLogin={login} />;
  }

  return <Dashboard user={user} />;
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
