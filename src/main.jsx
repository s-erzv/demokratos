import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; 
import './firebase.js';
import './global.css';

import Dashboard from './pages/Dashboard';
import PolicyVoting from './pages/PolicyVoting.jsx';

// Hapus kode yang dikomen di bawah ini jika tidak digunakan
// const router = createBrowserRouter ([
//   {path: "/signin", element:
//     <AuthRoute>
//       <SignIn />
//     </AuthRoute>
//   },
// ])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/vote" element={<PolicyVoting />} />
        <Route path="/signin" element={<SignIn />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);