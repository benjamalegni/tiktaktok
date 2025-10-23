import { type TurnValue, TURNS, MAX_MOVES } from "../../lib/types";
import { checkWinner } from "../../logic/board";

function minimax(
    board: (TurnValue | null)[], 
    movesHistory: number[], 
    depth: number, 
    isMaximizing: boolean
): number {
    const winner = checkWinner(board as (string | null)[]);
    
    // Check for terminal states
    if (winner === TURNS.X) return 10;
    if (winner === TURNS.O) return -10;
    
    // Limit search depth to prevent infinite recursion
    // TODO: Adjust this value for difficulty levels in the future
    if (depth >= 8) return 0; // Reasonable depth for this game

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === null) {
                // Simulate the move
                const newBoard = [...board];
                const newHistory = [...movesHistory, i];
                
                newBoard[i] = TURNS.X;
                
                // Remove oldest piece if history exceeds MAX_MOVES
                if (newHistory.length > MAX_MOVES) {
                    const oldIndex = newHistory[0];
                    newBoard[oldIndex] = null;
                    newHistory.shift();
                }
                
                const score = minimax(newBoard, newHistory, depth + 1, false);
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === null) {
                // Simulate the move
                const newBoard = [...board];
                const newHistory = [...movesHistory, i];
                
                newBoard[i] = TURNS.O;
                
                // Remove oldest piece if history exceeds MAX_MOVES
                if (newHistory.length > MAX_MOVES) {
                    const oldIndex = newHistory[0];
                    newBoard[oldIndex] = null;
                    newHistory.shift();
                }
                
                const score = minimax(newBoard, newHistory, depth + 1, true);
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

export function getBestMove(
    board: (TurnValue | null)[], 
    movesHistory: number[],
    isMaximizing: boolean = false
): number {
    let bestScore = isMaximizing ? -Infinity : Infinity;
    let bestMove = -1;
    
    for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
            // Simulate the move
            const newBoard = [...board];
            const newHistory = [...movesHistory, i];
            
            newBoard[i] = isMaximizing ? TURNS.X : TURNS.O;
            
            // Remove oldest piece if history exceeds MAX_MOVES
            if (newHistory.length > MAX_MOVES) {
                const oldIndex = newHistory[0];
                newBoard[oldIndex] = null;
                newHistory.shift();
            }
            
            const score = minimax(newBoard, newHistory, 0, !isMaximizing);
            
            if ((isMaximizing && score > bestScore) || (!isMaximizing && score < bestScore)) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    
    return bestMove;
}