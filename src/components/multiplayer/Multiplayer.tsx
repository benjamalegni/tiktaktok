import { supabase } from '../../utils/supabase.ts'
import { useEffect, useState } from 'react';
import { TURNS, type MatchStatus, type TurnValue } from '../../lib/types';
import Board, { MAX_MOVES } from '../game/Board.tsx';
import { checkWinner } from '../../logic/board.ts';

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

    const changeTurn = (turn: TurnValue) => {
        setTurn(turn === TURNS.X ? TURNS.O : TURNS.X);
    }

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
                        const formattedBoard = payload.new.board.map((cell: string) => 
                            cell === 'X' ? TURNS.X : cell === 'O' ? TURNS.O : null
                        );
                        setBoard(formattedBoard);
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


    const handleJoinRoom = async (e: React.MouseEvent<HTMLButtonElement>) => {

        e.preventDefault();
        const { data: gameData, error: gameError } = await supabase.from('match')
        .update({player_o_name: name, status: 'active'})
        .eq('id', roomCode)
        .select()
        .single();

        if (gameError) {
            console.error(gameError);
            setError("The room code is invalid");
            return;
        }

        if (gameData) {
            setPlayerSign('O');
            setMatchId(roomCode);
            return;
        }
    }

    const handleCreateRoom = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if(!name) {
            setError("Your name is required to play");
            return;
        } else{
            setError(null);
        }

        try {
            const {data:authData, error: authError} = await supabase.auth.signInAnonymously();

            if (authError) {
                console.error('Auth error:', authError);
                setError(`Authentication failed: ${authError.message}`);
                return;
            }

            if (authData) {
                console.log(name);
                const { data:matchData, error:matchError } = await supabase.from('match').insert({
                    player_x_name: name,
                })
                .select('id')
                .single();

                if (matchError) {
                    console.error(matchError);
                    setError(`Failed to create room: ${matchError.message}`);
                    return;
                }

                setPlayerSign('X');
                setMatchId(matchData.id);
            }
        } catch (error) {
            console.error('Network error:', error);
            setError('Cannot connect to Supabase. Please check your configuration.');
            return;
        }
    }

    const handleMultiplayerMove = async (index: number) => {
        if(!matchId || winner) return;

        if(playerSign !== (turn === TURNS.X ? 'X' : 'O')) {
            setError('It\'s not your turn');
            return;
        }
        
        setError(null);
        
        // check if it's the current player's turn
        if (board[index] !== null) return;

        const newBoard = [...board];
        const newMovesHistory = [...movesHistory];
        
        if (newMovesHistory.length >= MAX_MOVES) {
            const oldIndex = newMovesHistory[0];
            newBoard[oldIndex] = null;
            newMovesHistory.shift();
        }
        
        newBoard[index] = playerSign === 'X' ? TURNS.X : TURNS.O;
        newMovesHistory.push(index);
        
        // check winner
        const gameWinner = checkWinner(newBoard);
        
        // update states
        setBoard(newBoard);
        setMovesHistory(newMovesHistory);
        setTurn(turn === TURNS.X ? TURNS.O : TURNS.X);

        if (gameWinner) {
            setWinner(gameWinner as TurnValue);
        }

        const formattedBoard = newBoard.map((cell) => cell === TURNS.X ? 'X' : cell === TURNS.O ? 'O' : null);
        
        // sync to database - the realtime subscription will handle notifying other players
        const { error: matchError } = await supabase.from('match').update({
            board: formattedBoard,
            winner: gameWinner,
            turn: turn === TURNS.X ? 'O' : 'X'
        }).eq('id', matchId).select().single();

        if (matchError) {
            console.error('Database update error:', matchError);
            return;   
        }
    }



    return (
        <>
            <form className="flex flex-col gap-10"> 
                <input type="text" placeholder="your name" name="name" onChange={(e) => {setName(e.target.value)}} />
                <input type="text" placeholder="room code" name="roomCode" onChange={(e) => {setRoomCode(e.target.value)}} />

                <div className="flex flex-row gap-10">
                    <button type="button" onClick={(e) => {handleJoinRoom(e)}}>Join Game</button>
                    <button type="button" onClick={(e) => {handleCreateRoom(e)}}>Create Room</button>
                </div>

                {matchId && <p>Match ID: {matchId}</p>}
                {error && <p className="text-red-500">{error}</p>}
            </form>

            <Board 
                isMultiplayer={true} 
                onMultiplayerMove={handleMultiplayerMove}
                board={board}
                turn={turn}
                movesHistory={movesHistory}
                winner={winner}
            />
        </>
    )
}