import './App.css'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Multiplayer from './components/multiplayer/Multiplayer'
import { usePlaylistMusic } from './hooks/usePlaylistMusic'
import { VolumeControl } from './components/menu/VolumeControl'
import { musicPlaylist } from './lib/types'
import {motion} from 'framer-motion'
// import Board from './components/game/Board' // unused here

function App() {
  const navigate = useNavigate();
  
  const { play, pause, setVolume, volume, hasPlayed } = usePlaylistMusic(musicPlaylist, {
    volume: 1,
  });

  const [flyUp, setFlyUp] = useState(false);

  return (
    <Routes>
      <Route path="/" element={
        <main className="flex flex-col items-center justify-center h-screen gap-10">      
          {/* volume control */}
          <VolumeControl
            volume={volume}
            hasPlayed={hasPlayed}
            onVolumeChange={setVolume}
            onPlay={play}
            onPause={pause}
          />

          <motion.button 
            initial={false}
            animate={flyUp ? { y: -1000 } : { y: [0, -10, 0] }}
            transition={flyUp ? { type: 'spring', stiffness: 400, damping: 32 } : { duration: 2, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setFlyUp(true);
              setTimeout(() => navigate('/multiplayer'), 650);
            }}
            className="clickable-logo-button"

            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none',
              WebkitTapHighlightColor: 'transparent',
              outline: 'none',
              transform: 'translateZ(0)'
            }}
            
          >
            <img 
              className="full-width mt-15" 
              src={"/title.png"} 
              alt="TikTakTok - Click to Start Adventure" 
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
              style={{
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
                transition: 'filter 0.3s ease',
                userSelect: 'none',
                pointerEvents: 'none'
              }}
            />
          </motion.button>
        </main>
      } />
      
      <Route path="/multiplayer/*" element={<Multiplayer />} />
    </Routes>
  )
}

export default App
