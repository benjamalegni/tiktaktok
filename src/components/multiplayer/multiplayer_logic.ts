import { MAX_MOVES, TURNS, type TurnValue } from "../../lib/types";
import { checkWinner } from "../../logic/board";
import { supabase } from "../../utils/supabase";


export const handleJoinRoom = async (e: React.MouseEvent<HTMLButtonElement>, roomCode: string, name: string, setError: (error: string | null) => void, setPlayerSign: (playerSign: string) => void, setMatchId: (matchId: string) => void, setBoard: (board: (TurnValue | null)[]) => void, setMovesHistory: (movesHistory: number[]) => void, setTurn: (turn: TurnValue) => void) => {
        e.preventDefault();

        if(!name) {
            setError("Your name is required to play");
            return;
        }

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
            setBoard(gameData.board.map((cell) => cell === 'X' ? TURNS.X : cell === 'O' ? TURNS.O : null));
            setMovesHistory(gameData.moves_history);
            setTurn(gameData.turn === 'X' ? TURNS.X : TURNS.O);
            return;
        }
    }



export const handleCreateRoom = async (e: React.MouseEvent<HTMLButtonElement>, name: string, setError: (error: string | null) => void, setPlayerSign: (playerSign: string) => void, setMatchId: (matchId: string) => void) => {
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
                const { data:matchData, error:matchError } = await supabase.from('match').insert({
                    player_x_name: name,
                    status: 'active'
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


export const handleMultiplayerMove = async (index: number, matchId: string | null, playerSign: string | null, turn: TurnValue, board: (TurnValue | null)[], movesHistory: number[], setError: (error: string | null) => void, setBoard: (board: (TurnValue | null)[]) => void, setMovesHistory: (movesHistory: number[]) => void, setTurn: (turn: TurnValue) => void, setWinner: (winner: TurnValue | null) => void) => {
        if(!matchId) return;

        if(playerSign !== (turn === TURNS.X ? 'X' : 'O')) {
            setError('It\'s not your turn');
            return;
        }
        
        setError(null);
        
        // check if it's the current player's turn
        if (board[index] !== null) return;

        const newBoard = [...board];
        let newMovesHistory = [...movesHistory];
        
        newBoard[index] = playerSign === 'X' ? TURNS.X : TURNS.O;
        newMovesHistory.push(index);

        if (newMovesHistory.length > MAX_MOVES) {
            const oldIndex = newMovesHistory[0];
            newBoard[oldIndex] = null;
            newMovesHistory = newMovesHistory.slice(1);
        }
    
        const nextTurn = turn === TURNS.X ? TURNS.O : TURNS.X;
        const formattedBoard = newBoard.map((cell) => cell === TURNS.X ? 'X' : cell === TURNS.O ? 'O' : null);
        
        // update states
        setMovesHistory(newMovesHistory);
        setBoard(newBoard);
        setTurn(nextTurn);
        setWinner(checkWinner(newBoard) as TurnValue);

        // sync to database - the realtime subscription will handle notifying other players
        const { error: matchError } = await supabase.from('match').update({
            board: formattedBoard,
            moves_history: newMovesHistory,
            winner: checkWinner(newBoard) as TurnValue,
            turn: nextTurn === TURNS.X ? 'X' : 'O',
        }).eq('id', matchId).select().single();


        if (matchError) {
            console.error('Database update error:', matchError);
            return;   
        }


    }
