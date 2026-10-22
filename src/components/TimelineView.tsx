import React from 'react';
import { Task, TaskStatus } from '../types/task';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { TaskCard } from './TaskCard';

interface TimelineViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onStatusChange: (id: string, newStatus: TaskStatus) => void;
  onToggleComplete: (id: string) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  tasks,
  onEditTask,
  onDeleteTask,
  onStatusChange,
  onToggleComplete,
}) => {
  const today = new Date().toISOString().split('T')[0];
  const nextWeekDate = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  const overdue = tasks.filter(
    (t) => t.status !== 'completed' && t.dueDate && t.dueDate < today
  );
  const dueThisWeek = tasks.filter(
    (t) => t.dueDate && t.dueDate >= today && t.dueDate <= nextWeekDate
  );
  const dueLater = tasks.filter((t) => t.dueDate && t.dueDate > nextWeekDate);
  const noDueDate = tasks.filter((t) => !t.dueDate);
  const completed = tasks.filter((t) => t.status === 'completed');

  const groups = [
    { title: 'Overdue Deadlines', items: overdue, icon: AlertCircle, color: 'text-rose-600' },
    { title: 'Due This Week (Active Sprint)', items: dueThisWeek, icon: Clock, color: 'text-blue-600' },
    { title: 'Upcoming Later', items: dueLater, icon: Calendar, color: 'text-neutral-700' },
    { title: 'Backlog / Unscheduled', items: noDueDate, icon: Calendar, color: 'text-neutral-500' },
    { title: 'Completed Milestones', items: completed, icon: Calendar, color: 'text-emerald-600' },
  ].filter((g) => g.items.length > 0);

  return (
    <div className="space-y-6 pb-12">
      {groups.length > 0 ? (
        groups.map((group) => {
          const Icon = group.icon;
          return (
            <div key={group.title} className="bg-white rounded-lg border border-neutral-200 p-4">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neutral-100">
                <Icon className={`w-4 h-4 ${group.color}`} />
                <h3 className="text-sm font-bold text-neutral-900">{group.title}</h3>
                <span className="text-xs font-mono tabular-nums text-neutral-500 font-medium">
                  ({group.items.length})
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {group.items.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                    onStatusChange={onStatusChange}
                    onToggleComplete={onToggleComplete}
                  />
                ))}
              </div>
            </div>
          );
        })
      ) : (
        <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center text-neutral-500">
          No tasks match the active filters for the timeline view.
        </div>
      )}
    </div>
  );
};
