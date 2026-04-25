import { Route, Routes } from 'react-router-dom';
import './App.css';

function Home() {
  return (
    <div className="container">
      <h1>HR Management Tracker</h1>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  );
}
