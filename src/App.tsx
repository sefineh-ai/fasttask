import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Task, TaskStats, TaskStatus, TaskPriority } from './types/task';
import { apiClient } from './services/apiClient';
import { Header, ActiveTab } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { FilterToolbar } from './components/FilterToolbar';
import { KanbanBoard } from './components/KanbanBoard';
import { TaskListView } from './components/TaskListView';
import { TimelineView } from './components/TimelineView';
import { AnalyticsView } from './components/AnalyticsView';
import { TaskModal } from './components/TaskModal';
import { SwaggerExplorer } from './components/SwaggerExplorer';
import { FastAPICodeViewer } from './components/FastAPICodeViewer';
import { Terminal, Code2, LayoutDashboard, ListFilter, Calendar, Activity, Database } from 'lucide-react';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    completed: 0,
    inProgress: 0,
    inReview: 0,
    backlog: 0,
    urgent: 0,
    high: 0,
    medium: 0,
    low: 0,
    completionRate: 0,
    overdueCount: 0,
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [selectedTag, setSelectedTag] = useState<string | 'all'>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [defaultModalStatus, setDefaultModalStatus] = useState<TaskStatus>('backlog');

  const loadData = useCallback(async () => {
    try {
      const allTasks = await apiClient.getTasks();
      const currentStats = await apiClient.getStats();
      setTasks(allTasks);
      setStats(currentStats);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derive all unique tags from tasks
  const availableTags = useMemo(() => {
    const tagsSet = new Set<string>();
    tasks.forEach((t) => t.tags.forEach((tag) => tagsSet.add(tag)));
    return Array.from(tagsSet).sort();
  }, [tasks]);

  // Filter tasks client-side for immediate responsive UX
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    if (statusFilter !== 'all') {
      result = result.filter((t) => t.status === statusFilter);
    }
    if (priorityFilter !== 'all') {
      result = result.filter((t) => t.priority === priorityFilter);
    }
    if (selectedTag !== 'all') {
      const q = selectedTag.toLowerCase();
      result = result.filter((t) => t.tags.some((tag) => tag.toLowerCase() === q));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    return result;
  }, [tasks, statusFilter, priorityFilter, selectedTag, searchQuery]);

  // Handlers
  const handleOpenCreateModal = (status: TaskStatus = 'backlog') => {
    setTaskToEdit(null);
    setDefaultModalStatus(status);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (taskData: any) => {
    if (taskToEdit) {
      await apiClient.updateTask(taskToEdit.id, taskData);
    } else {
      await apiClient.createTask(taskData);
    }
    await loadData();
  };

  const handleDeleteTask = async (id: string) => {
    await apiClient.deleteTask(id);
    await loadData();
  };

  const handleStatusChange = async (id: string, newStatus: TaskStatus) => {
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
    await apiClient.updateTask(id, { status: newStatus });
    await loadData();
  };

  const handleToggleComplete = async (id: string) => {
    await apiClient.toggleTaskCompletion(id);
    await loadData();
  };

  const handleBatchAction = async (
    taskIds: string[],
    action: { type: 'complete' | 'delete' | 'set_priority' | 'set_status'; value?: any }
  ) => {
    await apiClient.batchUpdate(taskIds, action);
    await loadData();
  };

  const handleResetData = async () => {
    await apiClient.resetSampleData();
    await loadData();
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans">
      {/* 3-zone Top Bar Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNewTaskClick={() => handleOpenCreateModal('backlog')}
        totalTasks={stats.total}
      />

      {/* Main Workspace Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Workspace Sub-header with Tab navigation and fast state indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">
              Sprint Workspace
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Connected to FastAPI async endpoints & Pydantic V2 schema validations
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1 p-1 bg-neutral-200/60 rounded-lg self-start sm:self-auto overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('kanban')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'kanban'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'list'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'timeline'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Timeline</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'analytics'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Metrics</span>
            </button>
            <div className="h-4 w-px bg-neutral-300 mx-0.5" />
            <button
              onClick={() => setActiveTab('swagger')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'swagger'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-emerald-700 hover:text-emerald-900'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Swagger API</span>
            </button>
            <button
              onClick={() => setActiveTab('python_code')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'python_code'
                  ? 'bg-indigo-700 text-white shadow-xs'
                  : 'text-indigo-700 hover:text-indigo-900'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>FastAPI Code</span>
            </button>
          </div>
        </div>

        {/* Global Statistics Bar (visible in task management tabs) */}
        {['kanban', 'list', 'timeline'].includes(activeTab) && (
          <>
            <StatsBar
              stats={stats}
              onFilterStatus={(st) => {
                if (st === 'urgent') {
                  setPriorityFilter('urgent');
                  setStatusFilter('all');
                } else {
                  setStatusFilter(st);
                }
              }}
            />

            {/* Filter toolbar */}
            <FilterToolbar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              priorityFilter={priorityFilter}
              onPriorityFilterChange={setPriorityFilter}
              selectedTag={selectedTag}
              onTagChange={setSelectedTag}
              availableTags={availableTags}
              onResetData={handleResetData}
            />
          </>
        )}

        {/* Tab Viewport Routing */}
        {activeTab === 'kanban' && (
          <KanbanBoard
            tasks={filteredTasks}
            onEditTask={handleOpenEditModal}
            onDeleteTask={handleDeleteTask}
            onStatusChange={handleStatusChange}
            onToggleComplete={handleToggleComplete}
            onQuickAddTask={(st) => handleOpenCreateModal(st)}
          />
        )}

        {activeTab === 'list' && (
          <TaskListView
            tasks={filteredTasks}
            onEditTask={handleOpenEditModal}
            onDeleteTask={handleDeleteTask}
            onStatusChange={handleStatusChange}
            onBatchAction={handleBatchAction}
          />
        )}

        {activeTab === 'timeline' && (
          <TimelineView
            tasks={filteredTasks}
            onEditTask={handleOpenEditModal}
            onDeleteTask={handleDeleteTask}
            onStatusChange={handleStatusChange}
            onToggleComplete={handleToggleComplete}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView tasks={tasks} stats={stats} />
        )}

        {activeTab === 'swagger' && (
          <SwaggerExplorer onDataModified={loadData} />
        )}

        {activeTab === 'python_code' && <FastAPICodeViewer />}
      </main>

      {/* Task Create / Edit Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        defaultStatus={defaultModalStatus}
      />

      {/* Quiet Footer */}
      <footer className="border-t border-neutral-200 bg-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-800">FastTask</span>
            <span aria-hidden="true">·</span>
            <span>FastAPI & React Task Management Suite</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('swagger')}
              className="hover:text-neutral-900 transition-colors"
            >
              OpenAPI 3.1 Spec
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setActiveTab('python_code')}
              className="hover:text-neutral-900 transition-colors"
            >
              Python Sources
            </button>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums text-neutral-400">v1.0.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
