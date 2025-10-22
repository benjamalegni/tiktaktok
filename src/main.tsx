import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './fonts.css'
import App from './App.tsx'
import { MotionConfig } from 'framer-motion'

createRoot(document.getElementById('root')!).render(
    <MotionConfig reducedMotion="never">
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MotionConfig>
)
