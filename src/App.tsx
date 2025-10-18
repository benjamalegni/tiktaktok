import './App.css'
import Multiplayer from './components/multiplayer/Multiplayer'
import Board from './components/game/Board'

function App() {

  return (
    <main className="flex flex-col items-center justify-center h-screen gap-10">      
    {/* then allow local and multiplayer, right now only multiplayer */}
      <Multiplayer />
    </main>
  )
}

export default App
