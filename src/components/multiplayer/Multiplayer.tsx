import { supabase } from '../../utils/supabase.ts'
import { useEffect, useState } from 'react';
import { TURNS, type TurnValue } from '../../lib/types';
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
            <form className="flex flex-col gap-10"> 
                <input type="text" placeholder="your name" name="name" onChange={(e) => {setName(e.target.value)}} />
                <input type="text" placeholder="room code" name="roomCode" onChange={(e) => {setRoomCode(e.target.value)}} />

                <div className="flex flex-row gap-10">
                    <button type="button" onClick={(e) => {handleJoinRoom(e, roomCode, name, setError, setPlayerSign, setMatchId)}}>Join Game</button>
                    <button type="button" onClick={(e) => {handleCreateRoom(e, name, setError, setPlayerSign, setMatchId)}}>Create Room</button>
                </div>

                {matchId && <p>Match ID: {matchId}</p>}
                {error && <p className="text-red-500">{error}</p>}
            </form>

            <Board 
                isMultiplayer={true} 
                onMultiplayerMove={(index) => {handleMultiplayerMove(index, matchId, playerSign, turn, board, movesHistory, setError, setBoard, setMovesHistory, setTurn, setWinner)}}
                board={board}
                turn={turn}
                movesHistory={movesHistory}
                winner={winner}
            />
        </>
    )
}