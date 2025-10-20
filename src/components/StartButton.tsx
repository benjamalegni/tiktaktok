import { useNavigate } from 'react-router-dom';

export default function StartButton(){
    const navigate = useNavigate();

    return(    
        <button 
            aria-label="Start Adventure" 
            onClick={() => navigate('/multiplayer')}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
            Start
        </button>
    );
}
