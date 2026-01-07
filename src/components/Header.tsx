import { useState, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  title: string;
  onBack?: () => void;
}

export function Header({ title, onBack }: HeaderProps) {
  const [tapCount, setTapCount] = useState(0);
  const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTitleTap = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);

    // Reset tap count after 3 seconds of inactivity
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }
    tapTimeoutRef.current = setTimeout(() => setTapCount(0), 3000);

    // Activate/deactivate tutorial mode after 5 taps
    if (newCount >= 5) {
      const currentMode = localStorage.getItem('gym-tracker-tutorial-mode');
      const newMode = currentMode === 'true' ? 'false' : 'true';
      localStorage.setItem('gym-tracker-tutorial-mode', newMode);

      // Show feedback
      alert(newMode === 'true'
        ? '🎬 Modo tutorial activado - Ahora verás los videos de ejercicios'
        : '🎬 Modo tutorial desactivado');

      setTapCount(0);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg">
      <div className="flex items-center">
        {onBack && (
          <button
            onClick={onBack}
            className="mr-3 p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <h1
          className="text-xl font-bold flex-1 cursor-default select-none"
          onClick={handleTitleTap}
        >
          {title}
        </h1>
        <ThemeToggle />
      </div>
    </div>
  );
}