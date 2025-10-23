import { useEffect } from 'react'
import { type TurnValue } from '../../lib/types'
import TurnComp from './TurnComp';
import { Square } from './Square';

export const MAX_MOVES = 6;

interface BoardProps{
        onMove: (index: number) => void;
        board?: (TurnValue | null)[];
        turn?: TurnValue;
        movesHistory?: number[];
        winner?: TurnValue | null;
    }

export default function Board({ 
    onMove,
    board: propBoard,
    turn: propTurn,
    movesHistory: propMovesHistory,
    winner: propWinner
}: BoardProps) {

    const currentBoard = propBoard;
    const currentTurn = propTurn;
    const currentMovesHistory = propMovesHistory
    const currentWinner = propWinner;

    // log movements history
    useEffect(() =>{
        console.log(currentMovesHistory);
    }, [currentMovesHistory]);


    const handleClick = (index: number) => {
        if (currentWinner) {
            return;
        }

        onMove(index);
    }

    return (
        <div className="flex flex-col items-center justify-center" >
            <section className="grid grid-cols-3 grid-rows-3 gap-10 border-10 border-white"style={{backgroundImage: 'url(/dark-bg.png)', backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center center', boxShadow: '0 0 20px 0 rgba(0, 0, 0, 0.9)'}}>
                {currentBoard?.map((_, index) => (
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
                <TurnComp turn={currentTurn ?? ''} />
            </section>
        </div>
    )
}