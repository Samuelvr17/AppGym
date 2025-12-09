import { ArrowLeft } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  title: string;
  onBack?: () => void;
}

export function Header({ title, onBack }: HeaderProps) {
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
        <h1 className="text-xl font-bold flex-1">{title}</h1>
        <ThemeToggle />
      </div>
    </div>
  );
}