import React, { useState } from 'react';
import { VolumeX, Volume2, Play } from 'lucide-react';

interface VolumeControlProps {
  volume: number;
  hasPlayed: boolean;
  onVolumeChange: (volume: number) => void;
  onPlay: () => void;
  onPause: () => void;
}

export const VolumeControl: React.FC<VolumeControlProps> = ({
  volume,
  hasPlayed,
  onVolumeChange,
  onPlay,
  onPause
}) => {
  const [previousVolume, setPreviousVolume] = useState(0.5);

  const handleVolumeIconClick = () => {
    
    if (!hasPlayed) {
      onVolumeChange(0.5);
      setPreviousVolume(0.5);
      onPlay();
    } else if (volume === 0) {
      onVolumeChange(previousVolume);
      onPlay();
    } else {
      setPreviousVolume(volume);
      onVolumeChange(0);
      onPause();
    }
  };

  const getVolumeIcon = () => {
    if (!hasPlayed) {
      return <Play size={24} />;
    } else if (volume === 0) {
      return <VolumeX size={24} />;
    } else {
      return <Volume2 size={24} />;
    }
  };

  const getVolumeColor = () => {
    if (!hasPlayed) {
      return '#10b981';
    } else if (volume === 0) {
      return '#6b7280';
    } else {
      return '#10b981';
    }
  };

  return (
    <button
      onClick={handleVolumeIconClick}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: 'rgba(0,0,0,0.8)',
        border: 'none',
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        color: getVolumeColor(),
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        zIndex: 1000
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
        e.currentTarget.style.background = 'rgba(0,0,0,0.9)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.background = 'rgba(0,0,0,0.8)';
      }}
    >
      {getVolumeIcon()}
    </button>
  );
};
