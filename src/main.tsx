import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Global styles first, so per-screen CSS can override the shared classes.
import './styles/global.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
