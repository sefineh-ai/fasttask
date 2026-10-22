import React from 'react';
import { TaskStats } from '../types/task';
import { CheckCircle2, Clock, AlertTriangle, Layers, TrendingUp } from 'lucide-react';

interface StatsBarProps {
  stats: TaskStats;
  onFilterStatus?: (status: any) => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({ stats, onFilterStatus }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      <button
        onClick={() => onFilterStatus?.('all')}
        className="text-left p-3.5 bg-white rounded-lg border border-neutral-200 hover:border-neutral-300 transition-colors cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-neutral-500">Total Tasks</span>
          <Layers className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-700 transition-colors" />
        </div>
        <div className="text-xl font-bold text-neutral-900 font-mono tabular-nums tracking-tight">
          {stats.total}
        </div>
        <div className="text-[11px] text-neutral-500 mt-1">Across all sprints</div>
      </button>

      <button
        onClick={() => onFilterStatus?.('in_progress')}
        className="text-left p-3.5 bg-white rounded-lg border border-neutral-200 hover:border-neutral-300 transition-colors cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-neutral-500">In Progress</span>
          <Clock className="w-3.5 h-3.5 text-blue-500 group-hover:text-blue-600 transition-colors" />
        </div>
        <div className="text-xl font-bold text-neutral-900 font-mono tabular-nums tracking-tight">
          {stats.inProgress}
        </div>
        <div className="text-[11px] text-neutral-500 mt-1">Actively building</div>
      </button>

      <button
        onClick={() => onFilterStatus?.('in_review')}
        className="text-left p-3.5 bg-white rounded-lg border border-neutral-200 hover:border-neutral-300 transition-colors cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-neutral-500">In Review</span>
          <TrendingUp className="w-3.5 h-3.5 text-amber-500 group-hover:text-amber-600 transition-colors" />
        </div>
        <div className="text-xl font-bold text-neutral-900 font-mono tabular-nums tracking-tight">
          {stats.inReview}
        </div>
        <div className="text-[11px] text-neutral-500 mt-1">PRs & validation</div>
      </button>

      <button
        onClick={() => onFilterStatus?.('completed')}
        className="text-left p-3.5 bg-white rounded-lg border border-neutral-200 hover:border-neutral-300 transition-colors cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-neutral-500">Completed</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 group-hover:text-emerald-700 transition-colors" />
        </div>
        <div className="text-xl font-bold text-neutral-900 font-mono tabular-nums tracking-tight">
          {stats.completed}
        </div>
        <div className="text-[11px] text-neutral-500 mt-1">Ready for deploy</div>
      </button>

      <button
        onClick={() => onFilterStatus?.('urgent')}
        className="text-left p-3.5 bg-white rounded-lg border border-neutral-200 hover:border-neutral-300 transition-colors cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-neutral-500">Urgent</span>
          <AlertTriangle className="w-3.5 h-3.5 text-rose-500 group-hover:text-rose-600 transition-colors" />
        </div>
        <div className="text-xl font-bold text-neutral-900 font-mono tabular-nums tracking-tight">
          {stats.urgent}
        </div>
        <div className="text-[11px] text-neutral-500 mt-1">
          {stats.overdueCount > 0 ? `${stats.overdueCount} overdue` : 'On schedule'}
        </div>
      </button>

      <div className="p-3.5 bg-white rounded-lg border border-neutral-200">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-neutral-500">Completion</span>
          <span className="text-[11px] font-mono tabular-nums text-neutral-600">
            {stats.completionRate}%
          </span>
        </div>
        <div className="text-xl font-bold text-neutral-900 font-mono tabular-nums tracking-tight">
          {stats.completionRate}%
        </div>
        <div className="w-full bg-neutral-100 rounded-full h-1.5 mt-2 overflow-hidden">
          <div
            className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, stats.completionRate)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
