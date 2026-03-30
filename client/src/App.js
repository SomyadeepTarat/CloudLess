import './App.css';
import Dashboard from "./components/Dashboard";

function App() {
  return (
    <div className="App">
      <Dashboard wsUrl="ws://localhost:4000/logs" />
    </div>
  );
}

export default App;