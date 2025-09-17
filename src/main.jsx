import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
// import SignIn from './components/SignIn/signin.jsx';
import { BrowserRouter, createBrowserRouter } from 'react-router-dom';
import './firebase.js'
import './global.css';
import SignIn from './components/SignIn/signin.jsx';
import SignUp from './components/signup/SignUp.jsx'
import Dashboard from './pages/Dashboard';

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
      <SignIn />
    </BrowserRouter>
  </StrictMode>
);