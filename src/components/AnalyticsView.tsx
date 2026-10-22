import React from 'react';
import { Task, TaskStats } from '../types/task';
import { CheckCircle2, Clock, AlertTriangle, UserCheck, Tag, BarChart3 } from 'lucide-react';

interface AnalyticsViewProps {
  tasks: Task[];
  stats: TaskStats;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ tasks, stats }) => {
  // Compute workload per assignee
  const assigneeWorkload: Record<string, { total: number; completed: number; avatarUrl?: string }> = {};
  tasks.forEach((t) => {
    const name = t.assignee?.name || 'Unassigned';
    if (!assigneeWorkload[name]) {
      assigneeWorkload[name] = { total: 0, completed: 0, avatarUrl: t.assignee?.avatarUrl };
    }
    assigneeWorkload[name].total += 1;
    if (t.status === 'completed') {
      assigneeWorkload[name].completed += 1;
    }
  });

  // Compute tag breakdown
  const tagCounts: Record<string, number> = {};
  tasks.forEach((t) => {
    t.tags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Velocity & Health Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-neutral-500">Overall Completion Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900">
            {stats.completionRate}%
          </div>
          <div className="w-full bg-neutral-100 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, stats.completionRate)}%` }}
            />
          </div>
          <p className="text-[11px] text-neutral-500 mt-2">
            {stats.completed} of {stats.total} total sprint items finished
          </p>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-neutral-500">Active Work-in-Progress</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900">
            {stats.inProgress + stats.inReview}
          </div>
          <p className="text-[11px] text-neutral-500 mt-3">
            {stats.inProgress} currently coding · {stats.inReview} awaiting code review
          </p>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-neutral-500">Urgent & Overdue Attention</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-rose-600">
            {stats.urgent}
          </div>
          <p className="text-[11px] text-neutral-500 mt-3">
            {stats.overdueCount} tasks past targeted delivery date
          </p>
        </div>
      </div>

      {/* Priority & Workload Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority distribution */}
        <div className="bg-white rounded-lg border border-neutral-200 p-5">
          <h3 className="text-sm font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-neutral-500" />
            <span>Priority Distribution</span>
          </h3>

          <div className="space-y-3">
            {[
              { label: 'Urgent', count: stats.urgent, color: 'bg-rose-500', text: 'text-rose-600' },
              { label: 'High', count: stats.high, color: 'bg-amber-500', text: 'text-amber-600' },
              { label: 'Medium', count: stats.medium, color: 'bg-neutral-600', text: 'text-neutral-700' },
              { label: 'Low', count: stats.low, color: 'bg-neutral-400', text: 'text-neutral-500' },
            ].map((p) => {
              const pct = stats.total > 0 ? Math.round((p.count / stats.total) * 100) : 0;
              return (
                <div key={p.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className={`font-medium ${p.text}`}>{p.label}</span>
                    <span className="font-mono tabular-nums text-neutral-500">
                      {p.count} tasks ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`${p.color} h-2 rounded-full transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Workload */}
        <div className="bg-white rounded-lg border border-neutral-200 p-5">
          <h3 className="text-sm font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-neutral-500" />
            <span>Team Workload & Capacity</span>
          </h3>

          <div className="space-y-4">
            {Object.entries(assigneeWorkload).map(([name, data]) => {
              const pct = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
              return (
                <div key={name} className="flex items-center gap-3">
                  {data.avatarUrl ? (
                    <img
                      src={data.avatarUrl}
                      alt={name}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full object-cover border border-neutral-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-neutral-200 text-neutral-700 flex items-center justify-center text-xs font-bold">
                      {name.charAt(0)}
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-neutral-900">{name}</span>
                      <span className="font-mono tabular-nums text-neutral-500">
                        {data.completed}/{data.total} completed ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-neutral-800 h-1.5 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tags frequency */}
      {sortedTags.length > 0 && (
        <div className="bg-white rounded-lg border border-neutral-200 p-5">
          <h3 className="text-sm font-bold text-neutral-900 mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4 text-neutral-500" />
            <span>Domain Tags Coverage</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {sortedTags.map(([tag, count]) => (
              <div
                key={tag}
                className="px-2.5 py-1 bg-neutral-100 text-neutral-700 rounded text-xs font-medium flex items-center gap-1.5"
              >
                <span>{tag}</span>
                <span className="font-mono tabular-nums text-neutral-400">({count})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
