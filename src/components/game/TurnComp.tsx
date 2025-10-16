import { Square } from "./Board";
import { TURNS } from "../../lib/types";

export default function TurnComp({ turn }: { turn: string }) {
    return (
        <div className="flex flex-row gap-10 mt-20">
            <Square isSelected={turn === TURNS.X}>
                {TURNS.X}
            </Square>
            <Square isSelected={turn === TURNS.O}>
                {TURNS.O}
            </Square>
        </div>
    )
}