import './App.css'
import Board from './components/game/Board'

function App() {

  return (
    <main className="flex flex-col items-center justify-center h-screen gap-10">      
      <h1>Tik Tak Tok</h1>
      <Board />
    </main>
  )
}

export default App
