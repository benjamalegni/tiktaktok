import { MAX_MOVES } from "../components/game/Board";
import { WINNER_COMBINATIONS, TURNS, type TurnValue } from "../lib/types";

export const checkWinner = (board: (string | null)[]) =>{
        for(const combination of WINNER_COMBINATIONS){
            const [a, b, c] = combination;
            if(board[a] && board[a] === board[b] && board[a] === board[c]){
                return board[a];
            }
        }
        return null;
    }

export const referee = (
    board: (TurnValue | null)[],
    index: number,
    movesHistory: number[],
    turn: TurnValue,
    ) => {
        if (board[index] !== null) {
            return;
        }

        let newBoard = [...board];
        let newMovesHistory = [...movesHistory];       

        if (movesHistory.length >= MAX_MOVES) {
            const oldIndex = newMovesHistory[0];
            newBoard[oldIndex] = null;
            newMovesHistory = newMovesHistory.slice(1);
        }

        newBoard[index] = turn;
        newMovesHistory.push(index);



        if(checkWinner(newBoard)){
            console.log('winner', checkWinner(newBoard));
            return;
        }

}