import './App.css';
import { useState } from 'react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';

function App() {
  const [user, setUser] = useState(null);

  if (!user) {
    return <Auth onLogin={(u) => setUser(u)} />;
  }

  return <Dashboard wsUrl="ws://localhost:4000/logs" user={user} />;
}

export default App;