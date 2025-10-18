import { type TurnValue } from "../../lib/types";

export function Winner({winner, setBoard, setMovesHistory, setWinner}: {winner: TurnValue | null, setBoard: (board: (TurnValue | null)[]) => void, setMovesHistory: (movesHistory: number[]) => void, setWinner: (winner: TurnValue | null) => void}) {
    
    return (
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
    )
}