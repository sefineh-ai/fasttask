import React, { useState, useEffect } from 'react';
import { Task, TaskPriority, TaskStatus, Subtask, Assignee } from '../types/task';
import { TEAM_MEMBERS } from '../data/initialTasks';
import { X, Plus, Trash2, Calendar, User, Tag, CheckSquare, Layers } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: any) => void;
  taskToEdit?: Task | null;
  defaultStatus?: TaskStatus;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  taskToEdit,
  defaultStatus = 'backlog',
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState<Assignee>(TEAM_MEMBERS[0]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [subtasks, setSubtasks] = useState<Array<{ id?: string; title: string; completed: boolean }>>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setStatus(taskToEdit.status);
      setPriority(taskToEdit.priority);
      setDueDate(taskToEdit.dueDate || '');
      setSelectedAssignee(taskToEdit.assignee || TEAM_MEMBERS[0]);
      setTags([...taskToEdit.tags]);
      setSubtasks([...taskToEdit.subtasks]);
    } else {
      setTitle('');
      setDescription('');
      setStatus(defaultStatus);
      setPriority('medium');
      setDueDate(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
      setSelectedAssignee(TEAM_MEMBERS[0]);
      setTags(['FastAPI']);
      setSubtasks([]);
    }
  }, [taskToEdit, defaultStatus, isOpen]);

  if (!isOpen) return null;

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddSubtask = () => {
    const trimmed = newSubtaskTitle.trim();
    if (trimmed) {
      setSubtasks([
        ...subtasks,
        { id: `sub-${Date.now()}`, title: trimmed, completed: false },
      ]);
      setNewSubtaskTitle('');
    }
  };

  const handleToggleSubtask = (index: number) => {
    setSubtasks((prev) =>
      prev.map((s, i) => (i === index ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      dueDate,
      assignee: selectedAssignee,
      tags,
      subtasks,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs">
      <div
        className="bg-white rounded-xl border border-neutral-200 shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50/50">
          <div>
            <h2 className="text-base font-bold text-neutral-900">
              {taskToEdit ? `Edit Task ${taskToEdit.id}` : 'Create New Task'}
            </h2>
            <p className="text-xs text-neutral-500">
              Validated against FastAPI Pydantic V2 schema
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* Title */}
          <div>
            <label className="block font-medium text-neutral-700 mb-1">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement Pydantic V2 response serializers"
              className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-md text-sm text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 placeholder:text-neutral-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium text-neutral-700 mb-1">
              Description & Implementation Details
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add technical context, API route links, acceptance criteria..."
              className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-md text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 placeholder:text-neutral-400 leading-relaxed"
            />
          </div>

          {/* Status, Priority, Due Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 mb-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-neutral-400" />
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-2.5 py-1.5 bg-white border border-neutral-200 rounded-md text-xs text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                <option value="backlog">Backlog</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-2.5 py-1.5 bg-white border border-neutral-200 rounded-md text-xs text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-neutral-200 rounded-md text-xs text-neutral-800 font-mono tabular-nums focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>
          </div>

          {/* Assignee */}
          <div>
            <label className="block font-medium text-neutral-700 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-neutral-400" />
              Assignee
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {TEAM_MEMBERS.map((member) => {
                const isSelected = selectedAssignee.name === member.name;
                return (
                  <button
                    type="button"
                    key={member.email}
                    onClick={() => setSelectedAssignee(member)}
                    className={`flex items-center gap-2.5 p-2 rounded-lg border text-left transition-colors ${
                      isSelected
                        ? 'border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    {member.avatarUrl ? (
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 rounded-full object-cover border border-neutral-200"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-neutral-200 text-neutral-700 font-bold flex items-center justify-center text-xs">
                        {member.name.charAt(0)}
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <div className="font-semibold text-neutral-900 truncate">
                        {member.name}
                      </div>
                      <div className="text-[10px] text-neutral-500 truncate">{member.role}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block font-medium text-neutral-700 mb-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-neutral-400" />
              Tags
            </label>
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-100 text-neutral-800 rounded text-xs font-medium"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Type tag name and press Enter..."
                className="flex-1 px-2.5 py-1.5 bg-white border border-neutral-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium rounded-md transition-colors"
              >
                Add Tag
              </button>
            </div>
          </div>

          {/* Subtasks Checklist */}
          <div>
            <label className="block font-medium text-neutral-700 mb-1 flex items-center gap-1">
              <CheckSquare className="w-3.5 h-3.5 text-neutral-400" />
              Subtasks Checklist
            </label>
            <div className="space-y-1.5 mb-2 max-h-36 overflow-y-auto pr-1">
              {subtasks.map((st, idx) => (
                <div
                  key={st.id || idx}
                  className="flex items-center justify-between gap-2 p-1.5 bg-neutral-50 rounded border border-neutral-100"
                >
                  <label className="flex items-center gap-2 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => handleToggleSubtask(idx)}
                      className="rounded border-neutral-300 text-neutral-900 focus:ring-0 cursor-pointer"
                    />
                    <span
                      className={`text-xs ${
                        st.completed ? 'line-through text-neutral-400' : 'text-neutral-800'
                      }`}
                    >
                      {st.title}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(idx)}
                    className="text-neutral-400 hover:text-rose-600 p-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Add subtask checklist item..."
                className="flex-1 px-2.5 py-1.5 bg-white border border-neutral-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium rounded-md transition-colors"
              >
                Add Subtask
              </button>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-neutral-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-xs transition-colors"
            >
              {taskToEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
