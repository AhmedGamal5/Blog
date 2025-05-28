import React from 'react';
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './context/AuthContext';
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
   <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
)
