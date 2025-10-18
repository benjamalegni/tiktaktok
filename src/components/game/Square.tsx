export function Square({children, handleClick, index, isSelected}: {children?: React.ReactNode, handleClick?: (index: number) => void, index?: number, isSelected: boolean}) {
    return (
            <div onClick={()=>handleClick?.(index!)} className={`w-20 h-20 bg-white text-black text-8xl font-bold flex items-center justify-center cursor-pointer ${isSelected ? `bg-white border-6 border-cyan-500` : ``}`}>
                {children}
            </div>
    )
}