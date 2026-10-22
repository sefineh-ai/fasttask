import React from 'react';
import { Plus, Terminal, LayoutDashboard, Code2, Activity, Calendar } from 'lucide-react';

export type ActiveTab = 'kanban' | 'list' | 'timeline' | 'swagger' | 'python_code' | 'analytics';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onNewTaskClick: () => void;
  totalTasks: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onNewTaskClick,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center text-white font-mono font-bold text-sm tracking-tighter">
            FT
          </div>
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onTabChange('kanban');
            }}
            className="text-lg font-bold tracking-tight text-neutral-900 whitespace-nowrap shrink-0 hover:text-neutral-700 transition-colors"
          >
            FastTask
          </a>
        </div>

        {/* Zone 2: Concise single-line navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600">
          <button
            onClick={() => onTabChange('kanban')}
            className={`whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-colors ${
              activeTab === 'kanban' ? 'text-neutral-900 font-semibold' : 'hover:text-neutral-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Kanban Board</span>
          </button>
          <button
            onClick={() => onTabChange('list')}
            className={`whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-colors ${
              activeTab === 'list' ? 'text-neutral-900 font-semibold' : 'hover:text-neutral-900'
            }`}
          >
            <span>Task List</span>
          </button>
          <button
            onClick={() => onTabChange('timeline')}
            className={`whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-colors ${
              activeTab === 'timeline' ? 'text-neutral-900 font-semibold' : 'hover:text-neutral-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Timeline</span>
          </button>
          <button
            onClick={() => onTabChange('swagger')}
            className={`whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-colors ${
              activeTab === 'swagger' ? 'text-neutral-900 font-semibold' : 'hover:text-neutral-900'
            }`}
          >
            <Terminal className="w-4 h-4 text-emerald-600" />
            <span>FastAPI Swagger UI</span>
          </button>
          <button
            onClick={() => onTabChange('python_code')}
            className={`whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-colors ${
              activeTab === 'python_code' ? 'text-neutral-900 font-semibold' : 'hover:text-neutral-900'
            }`}
          >
            <Code2 className="w-4 h-4 text-indigo-600" />
            <span>Python Source</span>
          </button>
          <button
            onClick={() => onTabChange('analytics')}
            className={`whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-colors ${
              activeTab === 'analytics' ? 'text-neutral-900 font-semibold' : 'hover:text-neutral-900'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Metrics</span>
          </button>
        </nav>

        {/* Zone 3: Single primary action CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onNewTaskClick}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 active:scale-95 transition-all shadow-xs whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>
    </header>
  );
};
