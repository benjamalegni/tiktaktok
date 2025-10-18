import { useState, useEffect } from 'react'
import { TURNS, type TurnValue } from '../../lib/types'
import TurnComp from './TurnComp';
import { Square } from './Square';
import { referee, checkWinner } from '../../logic/board';
import { Winner } from './Winner';

export const MAX_MOVES = 6;


interface BoardProps{
        isMultiplayer: boolean;
        matchId: string | null;
        onMultiplayerMove: (board: (TurnValue | null)[]) => void;
    }

export default function Board({ isMultiplayer, matchId, onMultiplayerMove }: BoardProps) {

    const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
    const [turn, setTurn] = useState<string>(TURNS.X);

    const [movesHistory, setMovesHistory] = useState<number[]>([]);
    const [winner, setWinner] = useState<TurnValue | null>(null);

    // log movements history
    useEffect(() =>{
        console.log(movesHistory);
    }, [movesHistory]);


    const handleClick = (index: number) => {
        if (winner) {
            return;
        }

        if(isMultiplayer){
            // Crear una copia del board para simular el movimiento
            const newBoard = [...board];
            const newMovesHistory = [...movesHistory];
            
            // Verificar si la casilla está ocupada
            if (newBoard[index] !== null) {
                return;
            }
            
            // Aplicar el movimiento
            if (newMovesHistory.length >= MAX_MOVES) {
                const oldIndex = newMovesHistory[0];
                newBoard[oldIndex] = null;
                newMovesHistory.shift();
            }
            
            newBoard[index] = turn as TurnValue;
            newMovesHistory.push(index);
            
            // Actualizar el estado local
            setMovesHistory(newMovesHistory);
            setBoard(newBoard);
            
            // Verificar ganador
            const winner = checkWinner(newBoard);
            if (winner) {
                setWinner(winner as TurnValue | null);
            } else {
                setTurn(turn === TURNS.X ? TURNS.O : TURNS.X);
            }
            
            // Sincronizar con la base de datos
            onMultiplayerMove(newBoard as (TurnValue | null)[]);

        } else{
            referee(
                board as (TurnValue | null)[], 
                index, 
                movesHistory, 
                setMovesHistory, 
                setBoard, 
                setWinner, 
                setTurn, 
                turn as TurnValue
            ); 
        }
    }

    return (
        <div className="flex flex-col items-center justify-center">
            <section className="grid grid-cols-3 grid-rows-3 gap-10 border-10 border-white">
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
            
            {winner && 
                <Winner winner={winner} setBoard={setBoard} setMovesHistory={setMovesHistory} setWinner={setWinner}/>
            }
        </div>
    )
}