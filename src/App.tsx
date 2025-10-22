import './App.css'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import Multiplayer from './components/multiplayer/Multiplayer'
import { usePlaylistMusic } from './hooks/usePlaylistMusic'
import { VolumeControl } from './components/menu/VolumeControl'
import { musicPlaylist } from './lib/types'
import { motion, useAnimation } from 'framer-motion'
// import Board from './components/game/Board' // unused here

function App() {
  const navigate = useNavigate();
  
  const { play, pause, setVolume, volume, hasPlayed } = usePlaylistMusic(musicPlaylist, {
    volume: 1,
  });

  const controls = useAnimation();
  useEffect(() => {
    controls.start({
      y: [0, -14, 0],
      transition: { duration: 2.2, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }
    });
  }, [controls]);

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
            animate={controls}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              controls.start({ y: -1000, transition: { type: 'spring', stiffness: 400, damping: 32 } });
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
              willChange: 'transform',
              transform: 'translateZ(0)',
              transition: 'none'
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
