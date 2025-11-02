import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { SorobanProvider } from './providers/SorobanProvider.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SorobanProvider>
      <App />
    </SorobanProvider>
  </React.StrictMode>,
)
