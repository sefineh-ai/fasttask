import React, { useState } from 'react';
import { Task, TaskPriority, TaskStatus } from '../types/task';
import { Edit3, Trash2, CheckCircle2, ArrowUpDown, Calendar, CheckSquare } from 'lucide-react';

interface TaskListViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onStatusChange: (id: string, newStatus: TaskStatus) => void;
  onBatchAction: (taskIds: string[], action: { type: 'complete' | 'delete' | 'set_priority' | 'set_status'; value?: any }) => void;
}

export const TaskListView: React.FC<TaskListViewProps> = ({
  tasks,
  onEditTask,
  onDeleteTask,
  onStatusChange,
  onBatchAction,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'id' | 'title' | 'status' | 'priority' | 'dueDate'>('dueDate');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const toggleSelectAll = () => {
    if (selectedIds.length === tasks.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(tasks.map((t) => t.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(field);
      setSortAsc(true);
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    let comp = 0;
    if (sortBy === 'id') comp = a.id.localeCompare(b.id);
    else if (sortBy === 'title') comp = a.title.localeCompare(b.title);
    else if (sortBy === 'status') comp = a.status.localeCompare(b.status);
    else if (sortBy === 'dueDate') comp = (a.dueDate || '').localeCompare(b.dueDate || '');
    else if (sortBy === 'priority') {
      const order: Record<TaskPriority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
      comp = order[a.priority] - order[b.priority];
    }
    return sortAsc ? comp : -comp;
  });

  const getPriorityStyle = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return 'text-rose-600 font-semibold';
      case 'high':
        return 'text-amber-600 font-medium';
      case 'medium':
        return 'text-neutral-700';
      case 'low':
        return 'text-neutral-500';
    }
  };

  const getStatusText = (status: TaskStatus) => {
    switch (status) {
      case 'backlog':
        return 'Backlog';
      case 'in_progress':
        return 'In Progress';
      case 'in_review':
        return 'In Review';
      case 'completed':
        return 'Completed';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden shadow-xs mb-8">
      {/* Batch Actions Bar (visible when items selected) */}
      {selectedIds.length > 0 && (
        <div className="bg-neutral-900 text-white px-4 py-2.5 flex items-center justify-between text-xs transition-all">
          <div className="flex items-center gap-3">
            <span className="font-mono tabular-nums font-medium">
              {selectedIds.length} of {tasks.length} selected
            </span>
            <div className="h-4 w-px bg-neutral-700" />
            <button
              onClick={() => {
                onBatchAction(selectedIds, { type: 'complete' });
                setSelectedIds([]);
              }}
              className="hover:text-emerald-300 font-medium transition-colors"
            >
              Mark Completed
            </button>
            <div className="h-4 w-px bg-neutral-700" />
            <div className="flex items-center gap-1.5">
              <span>Set Priority:</span>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    onBatchAction(selectedIds, { type: 'set_priority', value: e.target.value });
                    setSelectedIds([]);
                  }
                }}
                defaultValue=""
                className="bg-neutral-800 text-white border border-neutral-700 rounded px-2 py-0.5 text-xs focus:outline-none"
              >
                <option value="" disabled>Choose...</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onBatchAction(selectedIds, { type: 'delete' });
                setSelectedIds([]);
              }}
              className="text-rose-400 hover:text-rose-300 font-medium transition-colors"
            >
              Delete Selected
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="text-neutral-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* High-Density Data Grid Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-500 font-medium">
              <th className="py-2.5 px-3 w-10">
                <input
                  type="checkbox"
                  checked={tasks.length > 0 && selectedIds.length === tasks.length}
                  onChange={toggleSelectAll}
                  className="rounded border-neutral-300 text-neutral-900 focus:ring-0 cursor-pointer"
                />
              </th>
              <th
                onClick={() => handleSort('id')}
                className="py-2.5 px-3 cursor-pointer hover:text-neutral-900 font-mono"
              >
                <div className="flex items-center gap-1">
                  <span>ID</span>
                  <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('title')}
                className="py-2.5 px-3 cursor-pointer hover:text-neutral-900 min-w-[240px]"
              >
                <div className="flex items-center gap-1">
                  <span>Task Title</span>
                  <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('status')}
                className="py-2.5 px-3 cursor-pointer hover:text-neutral-900 w-32"
              >
                <div className="flex items-center gap-1">
                  <span>Status</span>
                  <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('priority')}
                className="py-2.5 px-3 cursor-pointer hover:text-neutral-900 w-24"
              >
                <div className="flex items-center gap-1">
                  <span>Priority</span>
                  <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('dueDate')}
                className="py-2.5 px-3 cursor-pointer hover:text-neutral-900 w-28"
              >
                <div className="flex items-center gap-1">
                  <span>Due Date</span>
                  <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                </div>
              </th>
              <th className="py-2.5 px-3 w-32">Assignee</th>
              <th className="py-2.5 px-3 w-24 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {sortedTasks.length > 0 ? (
              sortedTasks.map((task) => {
                const isSelected = selectedIds.includes(task.id);
                const isCompleted = task.status === 'completed';
                const completedSubs = task.subtasks.filter((s) => s.completed).length;

                return (
                  <tr
                    key={task.id}
                    className={`hover:bg-neutral-50/70 transition-colors h-11 ${
                      isSelected ? 'bg-neutral-50' : ''
                    }`}
                  >
                    <td className="py-2 px-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(task.id)}
                        className="rounded border-neutral-300 text-neutral-900 focus:ring-0 cursor-pointer"
                      />
                    </td>
                    <td className="py-2 px-3 font-mono tabular-nums text-neutral-500 font-medium">
                      {task.id}
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <span
                          onClick={() => onEditTask(task)}
                          className={`font-medium cursor-pointer hover:underline underline-offset-2 ${
                            isCompleted ? 'line-through text-neutral-400' : 'text-neutral-900'
                          }`}
                        >
                          {task.title}
                        </span>
                        {task.subtasks.length > 0 && (
                          <span className="text-[11px] font-mono tabular-nums text-neutral-400 flex items-center gap-0.5">
                            <CheckSquare className="w-3 h-3" />
                            {completedSubs}/{task.subtasks.length}
                          </span>
                        )}
                        {task.tags.length > 0 && (
                          <span className="text-[11px] text-neutral-400">
                            · {task.tags.join(', ')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <select
                        value={task.status}
                        onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
                        className="bg-transparent text-xs text-neutral-700 hover:text-neutral-900 font-medium focus:outline-none cursor-pointer"
                      >
                        <option value="backlog">Backlog</option>
                        <option value="in_progress">In Progress</option>
                        <option value="in_review">In Review</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                    <td className={`py-2 px-3 ${getPriorityStyle(task.priority)}`}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </td>
                    <td className="py-2 px-3 font-mono tabular-nums text-neutral-600">
                      {task.dueDate || '—'}
                    </td>
                    <td className="py-2 px-3">
                      {task.assignee ? (
                        <div className="flex items-center gap-1.5">
                          {task.assignee.avatarUrl ? (
                            <img
                              src={task.assignee.avatarUrl}
                              alt={task.assignee.name}
                              referrerPolicy="no-referrer"
                              className="w-5 h-5 rounded-full object-cover border border-neutral-200"
                            />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-neutral-200 text-[10px] flex items-center justify-center font-bold">
                              {task.assignee.name.charAt(0)}
                            </div>
                          )}
                          <span className="truncate max-w-[100px] text-neutral-700">
                            {task.assignee.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-neutral-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onEditTask(task)}
                          title="Edit"
                          className="p-1 text-neutral-500 hover:text-neutral-900 rounded hover:bg-neutral-100"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteTask(task.id)}
                          title="Delete"
                          className="p-1 text-neutral-500 hover:text-rose-600 rounded hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="py-8 text-center text-neutral-500">
                  No tasks found matching your filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
