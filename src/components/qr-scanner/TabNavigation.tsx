import { Clock, Brain } from "lucide-react";

interface TabNavigationProps {
  activeTab: 'visits' | 'analyses';
  onTabChange: (tab: 'visits' | 'analyses') => void;
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="mb-6">
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg w-fit">
        <button
          onClick={() => onTabChange('visits')}
          className={`px-4 py-2 rounded-md text-sm cursor-pointer font-medium transition-colors ${
            activeTab === 'visits'
              ? 'bg-white dark:bg-gray-800 dark:text-white text-[#1B365D] shadow-sm'
              : 'text-gray-600 dark:text-white dark:hover:text-white  hover:text-gray-900'
          }`}
        >
          <Clock className="mr-2 h-4 w-4 inline" />
          Recent Visits
        </button>
        <button
          onClick={() => onTabChange('analyses')}
          className={`px-4 py-2 rounded-md cursor-pointer text-sm font-medium transition-colors ${
            activeTab === 'analyses'
              ? 'bg-white dark:bg-gray-800 dark:text-white text-[#1B365D] shadow-sm'
              : 'text-gray-600 dark:text-white dark:hover:text-white  hover:text-gray-900'
          }`}
        >
          <Brain className="mr-2 h-4 w-4 inline" />
          Saved Analyses
        </button>
      </div>
    </div>
  );
}