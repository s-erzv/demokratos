import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './firebase.js'
import './global.css';

import Dashboard from './pages/Dashboard';
import PolicyVoting from './pages/PolicyVoting.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
       <Routes> 
        <Route path="/" element={<Dashboard />} /> 
        <Route path="/vote" element={<PolicyVoting />} /> 

      </Routes>
    </BrowserRouter>
  </StrictMode>
);