import React, { useState } from 'react';
import { Task, TaskStatus } from '../types/task';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';

interface KanbanBoardProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onStatusChange: (id: string, newStatus: TaskStatus) => void;
  onToggleComplete: (id: string) => void;
  onQuickAddTask: (status: TaskStatus) => void;
}

interface ColumnConfig {
  id: TaskStatus;
  title: string;
  subtitle: string;
}

const COLUMNS: ColumnConfig[] = [
  { id: 'backlog', title: 'Backlog', subtitle: 'Queued sprint items' },
  { id: 'in_progress', title: 'In Progress', subtitle: 'Actively in development' },
  { id: 'in_review', title: 'In Review', subtitle: 'Code review & verification' },
  { id: 'completed', title: 'Completed', subtitle: 'Deployed & verified' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onEditTask,
  onDeleteTask,
  onStatusChange,
  onToggleComplete,
  onQuickAddTask,
}) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [activeDropColumn, setActiveDropColumn] = useState<TaskStatus | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (activeDropColumn !== status) {
      setActiveDropColumn(status);
    }
  };

  const handleDragLeave = () => {
    setActiveDropColumn(null);
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    setActiveDropColumn(null);
    const id = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (id) {
      onStatusChange(id, status);
    }
    setDraggedTaskId(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start pb-8">
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.id);
        const isDropTarget = activeDropColumn === col.id;

        return (
          <div
            key={col.id}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.id)}
            className={`flex flex-col bg-neutral-100/70 rounded-xl p-3 border transition-colors min-h-[500px] ${
              isDropTarget ? 'border-neutral-900 bg-neutral-100' : 'border-neutral-200'
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between gap-2 mb-3 px-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                  {col.title}
                </h3>
                <span className="text-xs font-mono tabular-nums text-neutral-500 font-medium">
                  {columnTasks.length}
                </span>
              </div>

              <button
                onClick={() => onQuickAddTask(col.id)}
                title={`Add task to ${col.title}`}
                className="p-1 hover:bg-neutral-200 rounded text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Task Cards Container */}
            <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[calc(100vh-280px)] pr-0.5">
              {columnTasks.length > 0 ? (
                columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                    onStatusChange={onStatusChange}
                    onToggleComplete={onToggleComplete}
                    onDragStart={handleDragStart}
                  />
                ))
              ) : (
                <div className="h-32 border border-dashed border-neutral-300 rounded-lg flex flex-col items-center justify-center text-center p-4">
                  <p className="text-xs text-neutral-400">No tasks in this lane</p>
                  <button
                    onClick={() => onQuickAddTask(col.id)}
                    className="mt-2 text-xs font-medium text-neutral-700 hover:text-neutral-950 underline underline-offset-2"
                  >
                    + Add first task
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
