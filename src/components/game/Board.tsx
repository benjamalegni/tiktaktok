import { useState, useEffect } from 'react'
import { TURNS, WINNER_COMBINATIONS } from '../../lib/types'
import TurnComp from './TurnComp';

const MAX_MOVES = 6;

export function Square({children, handleClick, index, isSelected}: {children?: React.ReactNode, handleClick?: (index: number) => void, index?: number, isSelected: boolean}) {
    return (
            <div onClick={()=>handleClick?.(index!)} className={`w-20 h-20 bg-white text-black text-8xl font-bold flex items-center justify-center border-2 cursor-pointer ${isSelected ? `bg-lime-400 border-lime-500 border-4` : ``}`}>
                {children}
            </div>
    )
}

export default function Board() {

    const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
    const [turn, setTurn] = useState<string>(TURNS.X);

    const [movesHistory, setMovesHistory] = useState<number[]>([]);
    const [winner, setWinner] = useState<string | null>(null);

    // log movements history
    useEffect(() =>{
        console.log(movesHistory);
    }, [movesHistory]);


    const checkWinner = (board: (string | null)[]) =>{
        for(const combination of WINNER_COMBINATIONS){
            const [a, b, c] = combination;
            if(board[a] && board[a] === board[b] && board[a] === board[c]){
                return board[a];
            }
        }
        return null;
    }


    const handleClick = (index: number) => {
        if(board[index] !== null){
            return;
        }

        if(winner){
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


        setMovesHistory(newMovesHistory);
        setBoard(newBoard);

        if(checkWinner(newBoard)){
            console.log('winner', checkWinner(newBoard));
            setWinner(checkWinner(newBoard));
        }

        setTurn(turn === TURNS.X ? TURNS.O : TURNS.X);
    }

    return (
        <div className="flex flex-col items-center justify-center">
            <section className="grid grid-cols-3 grid-rows-3 gap-10">
                {board.map((_, index) => (
                    <Square 
                    index={index}
                    key={index}
                    handleClick={handleClick}
                    isSelected={false}
                    >
                        {board[index]}
                    </Square>
                ))}
            </section>


            <section>
                <TurnComp turn={turn} />
            </section>


            {winner && (
                <>
                    <section>
                        <h2>Winner: {winner}</h2>
                    </section>
                    <button className="flex flex-row gap-10 mt-20" onClick={() => {
                        setBoard(Array(9).fill(null));
                        setMovesHistory([]);
                        setWinner(null);
                    }}>
                        Clear
                    </button>
                </>
            )}

        </div>
    )
}