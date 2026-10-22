import React from 'react';
import { Search, Filter, RotateCcw, X, SlidersHorizontal } from 'lucide-react';
import { TaskPriority, TaskStatus } from '../types/task';

interface FilterToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: TaskStatus | 'all';
  onStatusFilterChange: (status: TaskStatus | 'all') => void;
  priorityFilter: TaskPriority | 'all';
  onPriorityFilterChange: (priority: TaskPriority | 'all') => void;
  selectedTag: string | 'all';
  onTagChange: (tag: string | 'all') => void;
  availableTags: string[];
  onResetData: () => void;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  selectedTag,
  onTagChange,
  availableTags,
  onResetData,
}) => {
  const hasActiveFilters =
    searchQuery !== '' ||
    statusFilter !== 'all' ||
    priorityFilter !== 'all' ||
    selectedTag !== 'all';

  const clearAllFilters = () => {
    onSearchChange('');
    onStatusFilterChange('all');
    onPriorityFilterChange('all');
    onTagChange('all');
  };

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-3 mb-6 space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by title, description, ID, or tag..."
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition-all text-neutral-900 placeholder:text-neutral-400"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right side controls: Reset / Presets */}
        <div className="flex items-center gap-2 shrink-0">
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear filters</span>
            </button>
          )}
          <button
            onClick={onResetData}
            title="Reset sample data back to initial FastAPI sprint seed"
            className="px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors flex items-center gap-1.5 border border-neutral-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Seed</span>
          </button>
        </div>
      </div>

      {/* Filter rows: Segmented controls for status + selects for priority and tags */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-100 text-xs">
        <span className="text-neutral-500 font-medium flex items-center gap-1 mr-1">
          <SlidersHorizontal className="w-3 h-3" />
          Status:
        </span>
        <div className="flex items-center gap-1 p-0.5 bg-neutral-100 rounded-md">
          <button
            onClick={() => onStatusFilterChange('all')}
            className={`px-2.5 py-1 font-medium rounded transition-colors whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            All
          </button>
          <button
            onClick={() => onStatusFilterChange('backlog')}
            className={`px-2.5 py-1 font-medium rounded transition-colors whitespace-nowrap ${
              statusFilter === 'backlog'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Backlog
          </button>
          <button
            onClick={() => onStatusFilterChange('in_progress')}
            className={`px-2.5 py-1 font-medium rounded transition-colors whitespace-nowrap ${
              statusFilter === 'in_progress'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => onStatusFilterChange('in_review')}
            className={`px-2.5 py-1 font-medium rounded transition-colors whitespace-nowrap ${
              statusFilter === 'in_review'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            In Review
          </button>
          <button
            onClick={() => onStatusFilterChange('completed')}
            className={`px-2.5 py-1 font-medium rounded transition-colors whitespace-nowrap ${
              statusFilter === 'completed'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Completed
          </button>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1.5 ml-2">
          <span className="text-neutral-500 font-medium">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => onPriorityFilterChange(e.target.value as any)}
            className="bg-white border border-neutral-200 text-neutral-800 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Tag Filter */}
        {availableTags.length > 0 && (
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-neutral-500 font-medium">Tag:</span>
            <select
              value={selectedTag}
              onChange={(e) => onTagChange(e.target.value)}
              className="bg-white border border-neutral-200 text-neutral-800 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900"
            >
              <option value="all">All Tags</option>
              {availableTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};
