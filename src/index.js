import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { initWeb3Modal } from './lib/web3modal';

initWeb3Modal();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
