import { Dumbbell, BarChart3 } from 'lucide-react';

interface NavigationProps {
  activeTab: 'routines' | 'history';
  onTabChange: (tab: 'routines' | 'history') => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="flex">
        <button
          onClick={() => onTabChange('routines')}
          className={`flex-1 flex flex-col items-center py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'routines'
            ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
        >
          <Dumbbell className="w-6 h-6 mb-1" />
          RUTINAS
        </button>
        <button
          onClick={() => onTabChange('history')}
          className={`flex-1 flex flex-col items-center py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'history'
            ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
        >
          <BarChart3 className="w-6 h-6 mb-1" />
          INFORME
        </button>
      </div>
    </div>
  );
}