import { useState, useEffect } from 'react';
import { TURNS, type TurnValue } from '../../lib/types';
import Board, { MAX_MOVES } from '../game/Board';
import { checkWinner } from '../../logic/board';
import { getBestMove } from './computerAlgorithm';
import BackButton from '../BackButton';

export default function Local() {
    const [board, setBoard] = useState<(TurnValue | null)[]>(Array(9).fill(null));
    const [turn, setTurn] = useState<TurnValue>(TURNS.X);
    const [movesHistory, setMovesHistory] = useState<number[]>([]);
    const [winner, setWinner] = useState<TurnValue | null>(null);

    // Handle player moves and AI responses
    const handleMove = (index: number) => {
        // Check if the cell is empty and no winner
        if (board[index] !== null || winner || turn !== TURNS.X) {
            return;
        }

        const newBoard = [...board];
        let newMovesHistory = [...movesHistory];

        newBoard[index] = turn;
        newMovesHistory.push(index);

        if (newMovesHistory.length > MAX_MOVES) {
            const oldIndex = newMovesHistory[0];
            newBoard[oldIndex] = null;
            newMovesHistory = newMovesHistory.slice(1);
        }

        // Check for winner
        const convertedBoard = newBoard.map(cell => cell === TURNS.X ? 'X' : cell === TURNS.O ? 'O' : null);
        const gameWinner = checkWinner(convertedBoard);
        if (gameWinner) {
            const winnerTurn = gameWinner === 'X' ? TURNS.X : TURNS.O;
            setWinner(winnerTurn);
            setBoard(newBoard);
            setMovesHistory(newMovesHistory);
            return;
        }

        setBoard(newBoard);
        setMovesHistory(newMovesHistory);
        setTurn(TURNS.O); // Switch to AI turn
    };

    // AI's turn
    useEffect(() => {
        if (turn === TURNS.O && !winner) {
            const computerMove = getBestMove([...board], [...movesHistory], false); // false = minimizing (playing as O)

            if (computerMove !== -1) {
                const newBoard = [...board];
                let newMovesHistory = [...movesHistory];

                newBoard[computerMove] = TURNS.O;
                newMovesHistory.push(computerMove);

                if (newMovesHistory.length > MAX_MOVES) {
                    const oldIndex = newMovesHistory[0];
                    newBoard[oldIndex] = null;
                    newMovesHistory = newMovesHistory.slice(1);
                }

                // Check for winner after computer move
                const convertedBoard = newBoard.map(cell => cell === TURNS.X ? 'X' : cell === TURNS.O ? 'O' : null);
                const gameWinner = checkWinner(convertedBoard);
                if (gameWinner) {
                    const winnerTurn = gameWinner === 'X' ? TURNS.X : TURNS.O;
                    setWinner(winnerTurn);
                    setBoard(newBoard);
                    setMovesHistory(newMovesHistory);
                    return;
                }

                setBoard(newBoard);
                setMovesHistory(newMovesHistory);
                setTurn(TURNS.X); // Switch back to player turn
            }
        }
    }, [turn, winner]); // Removed board and movesHistory from dependencies

    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setTurn(TURNS.X);
        setMovesHistory([]);
        setWinner(null);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-10">
            <BackButton />
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Neuland, cursive', color: 'rgb(251, 255, 9)' }}>
                    Local Game
                </h1>
                <p className="text-xl mb-2" style={{ fontFamily: 'Neuland, cursive' }}>
                    {winner ? (winner === TURNS.X ? 'You are awesome, winner!' : 'You are a loser!') :
                        turn === TURNS.O ? 'Computer is thinking...' :
                            'Your turn'}
                </p>
                {!winner && (
                    <p className="text-lg" style={{ fontFamily: 'Neuland, cursive' }}>
                        Current turn: {turn}
                    </p>
                )}
            </div>

            <Board
                onMove={handleMove}
                board={board}
                turn={turn}
                movesHistory={movesHistory}
                winner={winner}
            />

            <button
                onClick={resetGame}
                className="px-6 py-3 text-lg font-bold rounded-lg"
                style={{
                    fontFamily: 'Neuland, cursive',
                    backgroundColor: 'rgb(251, 255, 9)',
                    color: 'black'
                }}
            >
                Reset Game
            </button>
        </div>
    );
}