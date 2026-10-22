import React from 'react';
import { Task, TaskPriority, TaskStatus } from '../types/task';
import { Calendar, CheckSquare, Trash2, Edit3, ArrowRight, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, newStatus: TaskStatus) => void;
  onToggleComplete: (id: string) => void;
  onDragStart?: (e: React.DragEvent, id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  onToggleComplete,
  onDragStart,
}) => {
  const isCompleted = task.status === 'completed';
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;

  const today = new Date().toISOString().split('T')[0];
  const isOverdue = !isCompleted && task.dueDate && task.dueDate < today;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isCompleted) {
      confetti({
        particleCount: 35,
        spread: 45,
        origin: { y: 0.8 },
      });
    }
    onToggleComplete(task.id);
  };

  const getPriorityLabel = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return 'Urgent';
      case 'high':
        return 'High';
      case 'medium':
        return 'Medium';
      case 'low':
        return 'Low';
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
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

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart?.(e, task.id)}
      onClick={() => onEdit(task)}
      className="group relative bg-white border border-neutral-200 rounded-lg p-3.5 hover:border-neutral-300 hover:shadow-xs transition-all cursor-pointer select-none"
    >
      {/* Top line: Task ID and Action Buttons */}
      <div className="flex items-center justify-between gap-2 text-xs text-neutral-500 mb-2">
        <div className="flex items-center gap-2">
          <span className="font-mono tabular-nums text-neutral-500 font-medium">{task.id}</span>
          <span aria-hidden="true" className="text-neutral-300">·</span>
          <span className={getPriorityColor(task.priority)}>
            {getPriorityLabel(task.priority)}
          </span>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            title="Edit task"
            className="p-1 hover:bg-neutral-100 rounded text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            title="Delete task"
            className="p-1 hover:bg-rose-50 rounded text-neutral-500 hover:text-rose-600 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Task Title & Completion Checkbox */}
      <div className="flex items-start gap-2.5 mb-2">
        <button
          onClick={handleToggle}
          title={isCompleted ? 'Mark as in progress' : 'Mark as completed'}
          className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
            isCompleted
              ? 'bg-emerald-600 border-emerald-600 text-white'
              : 'border-neutral-300 hover:border-neutral-500 text-transparent'
          }`}
        >
          <Check className="w-3 h-3 stroke-[3]" />
        </button>

        <h4
          className={`text-sm font-semibold text-neutral-900 leading-snug ${
            isCompleted ? 'line-through text-neutral-400' : ''
          }`}
        >
          {task.title}
        </h4>
      </div>

      {/* Description Preview if present */}
      {task.description && (
        <p className="text-xs text-neutral-600 line-clamp-2 mb-3 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Unboxed Metadata Line with typographic separators */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-500 mb-3 pt-2 border-t border-neutral-100">
        {task.dueDate && (
          <div
            className={`flex items-center gap-1 font-mono tabular-nums ${
              isOverdue ? 'text-rose-600 font-medium' : 'text-neutral-500'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
            <span>{task.dueDate}</span>
            {isOverdue && <span className="text-[10px]"> (overdue)</span>}
          </div>
        )}

        {totalSubtasks > 0 && (
          <>
            <span aria-hidden="true" className="text-neutral-300">·</span>
            <div className="flex items-center gap-1 font-mono tabular-nums text-neutral-500">
              <CheckSquare className="w-3.5 h-3.5 text-neutral-400" />
              <span>
                {completedSubtasks}/{totalSubtasks}
              </span>
            </div>
          </>
        )}

        {task.tags.length > 0 && (
          <>
            <span aria-hidden="true" className="text-neutral-300">·</span>
            <span className="text-neutral-600">{task.tags.slice(0, 2).join(', ')}</span>
            {task.tags.length > 2 && (
              <span className="text-neutral-400">+{task.tags.length - 2}</span>
            )}
          </>
        )}
      </div>

      {/* Footer: Assignee & Quick Move Stage */}
      <div className="flex items-center justify-between pt-1">
        {task.assignee ? (
          <div className="flex items-center gap-2">
            {task.assignee.avatarUrl ? (
              <img
                src={task.assignee.avatarUrl}
                alt={task.assignee.name}
                referrerPolicy="no-referrer"
                className="w-5 h-5 rounded-full object-cover border border-neutral-200"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-neutral-200 text-neutral-700 flex items-center justify-center text-[10px] font-semibold">
                {task.assignee.name.charAt(0)}
              </div>
            )}
            <span className="text-xs text-neutral-600 font-medium truncate max-w-[120px]">
              {task.assignee.name}
            </span>
          </div>
        ) : (
          <span className="text-xs text-neutral-400 italic">Unassigned</span>
        )}

        {/* Quick status transition dropdown */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1"
        >
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
            className="text-[11px] bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded px-1.5 py-0.5 text-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-900 cursor-pointer"
          >
            <option value="backlog">Backlog</option>
            <option value="in_progress">In Progress</option>
            <option value="in_review">In Review</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>
    </div>
  );
};
