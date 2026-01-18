import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// Import cái này
import { SettingsProvider } from './contexts/SettingsContext'; 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Bọc SettingsProvider ở ngoài cùng */}
    <SettingsProvider>
       <App />
    </SettingsProvider>
  </StrictMode>,
);