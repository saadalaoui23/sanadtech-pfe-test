import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// 🔧 TEMPORAIRE : Sans StrictMode pour déboguer
createRoot(document.getElementById('root')!).render(
  <App />
);

// ℹ️ Version normale avec StrictMode (à réactiver après tests) :
// import { StrictMode } from 'react';
// createRoot(document.getElementById('root')!).render(
//   <StrictMode>
//     <App />
//   </StrictMode>
// );