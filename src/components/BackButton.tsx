import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function BackButton() {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate('/menu')}
            className="absolute top-4 right-4 z-50 p-2 rounded-full transition-transform hover:scale-110 active:scale-95"
            style={{
                backgroundColor: 'rgb(251, 255, 9)',
                color: 'black',
                boxShadow: '0 0 10px rgba(0,0,0,0.5)'
            }}
            aria-label="Back to Menu"
        >
            <ArrowLeft size={32} />
        </button>
    );
}
