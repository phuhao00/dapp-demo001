import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { WagmiProviderComponent } from './lib/wagmi'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WagmiProviderComponent>
      <App />
    </WagmiProviderComponent>
  </StrictMode>,
)
