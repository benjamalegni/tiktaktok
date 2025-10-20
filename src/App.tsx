import './App.css'
import { Routes, Route } from 'react-router-dom'
import Multiplayer from './components/multiplayer/Multiplayer'
import StartButton from './components/StartButton'

function App() {

  return (
    <Routes>
      <Route path="/" element={
        <main className="flex flex-col items-center justify-center h-screen gap-10">      
          {/* then allow local and multiplayer, right now only multiplayer */}
          <img className="size-[2000px] mt-20" src={"title.png"} alt="logo" />
          <StartButton />
        </main>
      } />
      <Route path="/multiplayer" element={<Multiplayer />} />
    </Routes>
  )
}

export default App
