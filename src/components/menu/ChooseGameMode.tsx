import Local from "../local/Local";
import Multiplayer from "../multiplayer/Multiplayer";
import { Route, Routes, useNavigate } from "react-router-dom"

export default function ChooseGameMode() {
    const navigate = useNavigate();
    return (
        <Routes>
            <Route index element={
        <div className="fixed inset-0 w-full h-full">
            {/* Video Background - Full Screen */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
            >
                <source src="/jungle-bg-video.webm" type="video/webm" />
                {/* Fallback for browsers that don't support video */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-800 to-green-600"></div>
            </video>
            
            {/* Content Overlay */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full gap-10 p-10">
                <span style={{fontFamily: 'Neuland, cursive', color: 'rgb(251, 255, 9)' }} className="text-4xl sm:text-5xl lg:text-8xl font-bold text-center">
                    Choose Game Mode
                </span>
                <div className="flex flex-row gap-10">
                    <button type="button" style={{fontFamily: 'Neuland, cursive', backgroundColor: 'rgb(251, 255, 9)', color: 'black'}} onClick={() => navigate('multiplayer')}>Multiplayer</button>
                    <button type="button" style={{fontFamily: 'Neuland, cursive', backgroundColor: 'rgb(17, 124, 0)', color: 'black'}} onClick={() => navigate('local')}>Local</button>
                </div>
            </div>
        </div>
        } />

        <Route path="multiplayer/*" element={<Multiplayer />} />
        <Route path="local/*" element={<Local />} />
        </Routes>
    )
}