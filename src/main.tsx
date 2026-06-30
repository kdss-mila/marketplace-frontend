import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/App'
import '@/index.css'

async function enableMocking() {
  const useMocks =
    import.meta.env.DEV || import.meta.env.VITE_USE_MOCKS === 'true'
  if (!useMocks) return

  const { worker } = await import('@/lib/mocks/browser')
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
    },
  })
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
})
