import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { router } from './app/router'
import useAuth from './store/useAuth'
import './styles/index.css'

const qc = new QueryClient()

function App() {
  const loadFromStorage = useAuth(s => s.loadFromStorage)
  useEffect(() => { loadFromStorage() }, [loadFromStorage])
  return <RouterProvider router={router} />
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
)

