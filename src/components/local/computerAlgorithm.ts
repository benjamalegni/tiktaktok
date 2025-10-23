import { type TurnValue, TURNS } from "../../lib/types";
import { checkWinner } from "../../logic/board";

function minimax(board: (TurnValue | null)[], depth: number, isMaximizing: boolean): number {
    const winner = checkWinner(board as (string | null)[]);
    
    // Check for terminal states
    if (winner === TURNS.X) return 1;
    if (winner === TURNS.O) return -1;
    
    if (depth === 0) return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === null) {
                board[i] = TURNS.X;
                const score = minimax(board, depth - 1, false);
                board[i] = null;
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === null) {
                board[i] = TURNS.O;
                const score = minimax(board, depth - 1, true);
                board[i] = null;
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

export function getBestMove(board: (TurnValue | null)[], isMaximizing: boolean = false): number {
    let bestScore = isMaximizing ? -Infinity : Infinity;
    let bestMove = -1;
    
    for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
            board[i] = isMaximizing ? TURNS.X : TURNS.O;
            const score = minimax(board, 0, !isMaximizing);
            board[i] = null;
            
            if ((isMaximizing && score > bestScore) || (!isMaximizing && score < bestScore)) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    
    return bestMove;
}