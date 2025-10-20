import { supabase } from '../../utils/supabase.ts'
import { useEffect, useState } from 'react';
import { TURNS, type TurnValue, MAX_MOVES } from '../../lib/types';
import Board from '../game/Board.tsx';
import { handleJoinRoom, handleCreateRoom, handleMultiplayerMove } from './multiplayer_logic.ts';

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
                }
            )
            .subscribe((status) => {
                console.log('Subscription status:', status);
            });

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [matchId]);


    return (
        <>

            <form className="flex flex-col gap-2 border-2  border-gray-300 rounded-md p-10 backdrop-blur-sm" style={{fontFamily: 'Bungee, cursive'}}> 
                <span className="text-2xl font-bold"></span>

                <input className="border-2 border-gray-300 rounded-md p-2" style={{fontFamily: 'Bungee, cursive'}} type="text" placeholder="your name" name="name" onChange={(e) => {setName(e.target.value)}} />
                <input className="border-2 border-gray-300 rounded-md p-2" style={{fontFamily: 'Bungee, cursive'}} type="text" placeholder="room code" name="roomCode" onChange={(e) => {setRoomCode(e.target.value)}} />

                <div className="flex flex-row gap-10">
                    <button type="button" style={{fontFamily: 'Bungee, cursive'}} onClick={(e) => {handleJoinRoom(e, roomCode, name, setError, setPlayerSign, setMatchId, setBoard, setMovesHistory, setTurn)}}>Join Game</button>
                    <button type="button" style={{fontFamily: 'Bungee, cursive'}} onClick={(e) => {handleCreateRoom(e, name, setError, setPlayerSign, setMatchId)}}>Create Room</button>
                </div>

                {matchId && <p style={{fontFamily: 'Bungee, cursive'}}>Match ID: {matchId}</p>}
                {error && <p className="text-red-500" style={{fontFamily: 'Bungee, cursive'}}>{error}</p>}
            </form>

            
            {matchId && <Board 
                isMultiplayer={true} 
                onMultiplayerMove={(index) => {handleMultiplayerMove(index, matchId, playerSign, turn, board, movesHistory, setError, setBoard, setMovesHistory, setTurn, setWinner)}}
                board={board}
                turn={turn}
                movesHistory={movesHistory}
                winner={winner}
            />}
        </>
    )
}