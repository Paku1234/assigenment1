import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import SalesPage from './SalesPage';
import NavBar from './NavBar';

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/HomePage" element={<HomePage />} />
        <Route path="/SalesPage" element={<SalesPage />} />
      </Routes>
    </Router>
  );
}

export default App;
