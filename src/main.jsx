import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './global.css';

import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Dashboard/>}/>
        <Route path='/welcome' element={<Landing/>}/>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);