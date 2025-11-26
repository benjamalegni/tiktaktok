import './App.css'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { usePlaylistMusic } from './hooks/usePlaylistMusic'
import { VolumeControl } from './components/menu/VolumeControl'
import { musicPlaylist } from './lib/types'
import { useAnimation, AnimatePresence, motion } from 'framer-motion'
import ChooseGameMode from './components/menu/ChooseGameMode'
import { Canvas } from '@react-three/fiber'
import MainButton from './components/MainButton'
import ParallaxBackground from './components/ParallaxBackground'

function App() {
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleNavigate = () => {
    // Navigation will be triggered after button animation
    navigate('/menu');
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <>
            {/* Parallax Background */}
            <ParallaxBackground
              backgroundImage="/vintage-background.png"
              depthMap="/vintage-background-depth.png"
              intensity={100}
            />

            {/* Volume Control - Completely separate from Canvas */}
            <VolumeControl
              volume={volume}
              hasPlayed={hasPlayed}
              onVolumeChange={setVolume}
              onPlay={play}
              onPause={pause}
            />

            {/* Three.js Scene - Background only */}
            <div
              className="absolute inset-0 w-full h-full"
              onWheel={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
              }}
            >

              <Canvas
                camera={{ position: [0, 0, 5], fov: 75 }}
                style={{
                  cursor: 'pointer',
                  width: '100%',
                  height: '100%',
                  display: 'block',
                  pointerEvents: 'auto',
                }}
                gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
              >
                {/* Ambient light for base illumination */}
                <ambientLight intensity={0.4} />

                {/* Main directional light from front-right */}
                <directionalLight
                  position={[50, 30, 5]}
                  intensity={15}
                  castShadow
                />

                {/* Secondary directional light from front-left */}
                <directionalLight
                  position={[-5, 5, 5]}
                  intensity={1}
                />

                {/* Fill light from behind */}
                <pointLight
                  position={[0, 0, -5]}
                  intensity={0.5}
                />

                {/* Rim light for edge definition */}
                <pointLight
                  position={[-3, 3, 2]}
                  intensity={100}
                  color="#fbff09"
                />

                <MainButton position={[0, 0, 3]} onNavigate={handleNavigate} />
              </Canvas>

            </div>

            <div className="relative z-10">
            </div>
          </>
        } />

        <Route path="/menu/*" element={
          <ChooseGameMode />
        } />
      </Routes>
    </AnimatePresence>
  )
}

export default App
