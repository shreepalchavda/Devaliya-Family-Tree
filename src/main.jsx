import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import AppPublic from './AppPublic.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppPublic />
  </StrictMode>
);
