import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppProvider } from './context/AppContext';
import { queryClient } from './lib/queryClient';
import App from './App';
import { ToastProvider } from './components/ToastSystem'; 

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppProvider>
  <ToastProvider>
    <App />
  </ToastProvider>
</AppProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
