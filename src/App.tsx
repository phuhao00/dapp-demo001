import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Transfer from './pages/Transfer';
import Admin from './pages/Admin';
import Navigation from './components/Navigation';
import NotificationContainer from './components/NotificationContainer';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/transfer" element={<Transfer />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
        <NotificationContainer />
      </div>
    </Router>
  );
}
