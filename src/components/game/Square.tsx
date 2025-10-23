export function Square({children, handleClick, index, isSelected}: {children?: React.ReactNode, handleClick?: (index: number) => void, index?: number, isSelected: boolean}) {
    const handleSquareClick = () => {
        handleClick?.(index!);
    };

    return (
            <div onClick={handleSquareClick} className={`font-family-space-mono w-30 h-30 bg-white text-black text-9xl font-bold flex items-center justify-center cursor-pointer ${isSelected ? `bg-white border-6 border-cyan-500` : ``}`} style={{fontFamily: 'system-ui'}}>
                {children}
            </div>
    )
}