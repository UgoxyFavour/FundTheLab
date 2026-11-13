import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { PollarProvider } from './context/PollarContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PollarProvider>
      <App />
    </PollarProvider>
  </React.StrictMode>
);
