import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import { InsightsDashboard } from './pages/InsightsDashboard'
import { HelpPage } from './pages/HelpPage'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/insights" element={<InsightsDashboard />} />
        <Route path="/help" element={<HelpPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
// Deploy Fri Feb 13 12:36:13 EST 2026
