import { useState, useEffect } from 'react'
import { TURNS, type TurnValue } from '../../lib/types'
import TurnComp from './TurnComp';
import { Square } from './Square';
import { referee, checkWinner } from '../../logic/board';
import { Winner } from './Winner';

export const MAX_MOVES = 6;

interface BoardProps{
        isMultiplayer: boolean;
        onMultiplayerMove: (index: number) => void;
        board?: (TurnValue | null)[];
        turn?: TurnValue;
        movesHistory?: number[];
        winner?: TurnValue | null;
    }

export default function Board({ 
    isMultiplayer, 
    onMultiplayerMove,
    board: propBoard,
    turn: propTurn,
    movesHistory: propMovesHistory,
    winner: propWinner
}: BoardProps) {

    const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
    const [turn, setTurn] = useState<TurnValue>(TURNS.X);
    const [movesHistory, setMovesHistory] = useState<number[]>([]);
    const [winner, setWinner] = useState<TurnValue | null>(null);

    // multiplayer uses props, single player uses states
    const currentBoard = isMultiplayer ? (propBoard || board) : board;
    const currentTurn = isMultiplayer ? (propTurn || turn) : turn;
    const currentMovesHistory = isMultiplayer ? (propMovesHistory || movesHistory) : movesHistory;
    const currentWinner = isMultiplayer ? (propWinner !== undefined ? propWinner : winner) : winner;

    // log movements history
    useEffect(() =>{
        console.log(currentMovesHistory);
    }, [currentMovesHistory]);


    const handleClick = (index: number) => {
        if (currentWinner) {
            return;
        }

        if(isMultiplayer){
            // multiplayer delegates the logic to the parent component
            onMultiplayerMove(index);
        } else{
            referee(
                currentBoard as (TurnValue | null)[], 
                index, 
                currentMovesHistory, 
                currentTurn as TurnValue
            ); 
            const winner = checkWinner(currentBoard as (TurnValue | null)[]);
            setMovesHistory (currentMovesHistory)
            setBoard (currentBoard)
            setWinner (winner as typeof TURNS[keyof typeof TURNS])
            setTurn (currentTurn as TurnValue)
        }
    }

    return (
        <div className="flex flex-col items-center justify-center" >
            <section className="grid grid-cols-3 grid-rows-3 gap-10 border-10 border-white"style={{backgroundImage: 'url(/dark-bg.png)', backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center center', boxShadow: '0 0 20px 0 rgba(0, 0, 0, 0.9)'}}>
                {currentBoard.map((_, index) => (
                    <Square 
                    index={index}
                    key={index}
                    handleClick={handleClick}
                    isSelected={false}
                    >
                        {currentBoard[index]}
                    </Square>
                ))}
            </section>

            <section>
                <TurnComp turn={currentTurn} />
            </section>
            
            {currentWinner && 
                <Winner winner={currentWinner} setBoard={setBoard} setMovesHistory={setMovesHistory} setWinner={setWinner}/>
            }

        </div>
    )
}