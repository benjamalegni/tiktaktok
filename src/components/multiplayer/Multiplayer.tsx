import { supabase } from '../../utils/supabase.ts'
import { useEffect, useState } from 'react';
import { TURNS, type TurnValue } from '../../lib/types';
import Board from '../game/Board.tsx';
import { handleJoinRoom, handleCreateRoom, handleMultiplayerMove } from './multiplayer_logic.ts';
import { Routes, Route, Navigate } from 'react-router-dom';

export default function Multiplayer() {
    const [roomCode, setRoomCode] = useState<string>('');
    const [name, setName] = useState<string>('');
    const [matchId, setMatchId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    // multiplayer states
    const [board, setBoard] = useState<(TurnValue | null)[]>(Array(9).fill(null));
    const [turn, setTurn] = useState<TurnValue>(TURNS.X);
    const [movesHistory, setMovesHistory] = useState<number[]>([]);
    const [winner, setWinner] = useState<TurnValue | null>(null);
    const [playerSign, setPlayerSign] = useState<string | null>(null);

    const [gameStarted, setGameStarted] = useState<boolean>(false);

    useEffect(() => {
        if (!matchId) return;

        const subscription = supabase
            .channel(`match-${matchId}`)
            .on('postgres_changes', 
                { 
                    event: 'UPDATE', 
                    schema: 'public', 
                    table: 'match',
                    filter: `id=eq.${matchId}`
                },
                (payload) => {
                    // update states if the change comes from another player
                    if (payload.new.board) {
                        if(error) setError(null);                       
                        
                        // convert board from string to TurnValue
                        const convertedBoard = payload.new.board.map((cell: string | null) => {
                            if (cell === 'X') return TURNS.X;
                            if (cell === 'O') return TURNS.O;
                            return null;
                        });
                        
                        setBoard(convertedBoard);
                    }
                    if(payload.new.moves_history) {
                        setMovesHistory(payload.new.moves_history);
                    }
                    
                    if (payload.new.winner) {
                        setWinner(payload.new.winner);
                    }

                    if (payload.new.turn) {
                        setTurn(payload.new.turn === 'X' ? TURNS.X : TURNS.O);
                    }

                    if (payload.new.status === 'active') {
                        setGameStarted(true);
                    }
                }
            )
            .subscribe((status) => {
                console.log('Subscription status:', status);
            });

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [matchId]);

    const FormView = (
        <div
            style={{
                minHeight: '100dvh',
                width: '100%',
                backgroundImage: "url('/monkeys-bg.png')",
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <form
                className="border-rounded-lg"
                style={{
                    fontFamily: 'Bungee, cursive',
                    borderRadius: '10px',
                    boxShadow: '0 0 20px 0 rgba(0, 0, 0, 0.9)'
                }}
            > 
                <div style={{ background: 'rgba(0, 0, 0, 0.9)', borderRadius: '10px'}} className="flex flex-col gap-8 p-10">
                    <span style={{fontFamily: 'Neuland, cursive', color: 'rgb(251, 255, 9)' }} className="text-8xl font-bold">
                        Multiplayer
                    </span>

                    <input className=" p-2 text-lg bg-black/30" style={{fontFamily: 'Neuland, cursive'}} type="text" placeholder="Name" name="name" onChange={(e) => {setName(e.target.value)}} />
                    <input className="p-2 text-lg bg-black/30" style={{fontFamily: 'Neuland, cursive'}} type="text" placeholder="Code" name="roomCode" onChange={(e) => {setRoomCode(e.target.value)}} />

                    <div className="flex flex-row gap-10">
                        <button type="button" style={{fontFamily: 'Neuland, cursive', backgroundColor: 'rgb(251, 255, 9)', color: 'black'}} onClick={(e) => {handleJoinRoom(e, roomCode, name, setError, setPlayerSign, setMatchId, setBoard, setMovesHistory, setTurn)}}>Join Game</button>
                        <button type="button" style={{fontFamily: 'Neuland, cursive', backgroundColor: 'rgb(17, 124, 0)', color: 'black'}} onClick={(e) => {handleCreateRoom(e, name, setError, setPlayerSign, setMatchId)}}>Create Room</button>
                    </div>

                    {matchId && <p style={{fontFamily: 'Neuland, cursive'}}>Match ID: {matchId}</p>}
                    {error && <p className="text-red-500" style={{fontFamily: 'Neuland, cursive'}}>{error}</p>}
                </div>
            </form>
        </div>
    );

    const GameView = matchId ? (
        <div className="mt-30">
        <Board 
            isMultiplayer={true} 
            onMultiplayerMove={(index) => {handleMultiplayerMove(index, matchId, playerSign, turn, board, movesHistory, setError, setBoard, setMovesHistory, setTurn, setWinner)}}
            board={board}
            turn={turn}
            movesHistory={movesHistory}
            winner={winner}
        />
        </div>
    ) : (
        <Navigate to="/multiplayer" replace />
    );

    return (
        <Routes>
            <Route index element={gameStarted ? GameView : FormView} />
            <Route path="game" element={gameStarted ? GameView : FormView} />
        </Routes>
    )
}