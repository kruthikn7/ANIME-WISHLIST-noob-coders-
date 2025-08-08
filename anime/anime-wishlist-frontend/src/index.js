// Either remove the reportWebVitals import or use it
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

// If you're not using web vitals, remove the import completely
// If you want to use it, add:
// import reportWebVitals from './reportWebVitals';
// reportWebVitals();