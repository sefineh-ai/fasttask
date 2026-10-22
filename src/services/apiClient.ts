import { Task, TaskCreateInput, TaskUpdateInput, TaskStats, TaskPriority, TaskStatus, Subtask } from '../types/task';
import { INITIAL_TASKS, TEAM_MEMBERS } from '../data/initialTasks';

const STORAGE_KEY = 'fasttask_tasks_v1';

class ApiClient {
  private memoryTasks: Task[] = [];
  private isInitialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.isInitialized) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.memoryTasks = JSON.parse(stored);
      } else {
        this.memoryTasks = [...INITIAL_TASKS];
        this.persist();
      }
    } catch {
      this.memoryTasks = [...INITIAL_TASKS];
    }
    this.isInitialized = true;
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.memoryTasks));
    } catch {
      // Storage unavailable or quota exceeded
    }
  }

  public async getTasks(params?: {
    status?: TaskStatus;
    priority?: TaskPriority;
    search?: string;
    tag?: string;
    assigneeName?: string;
    sortBy?: 'due_date' | 'priority' | 'created_at' | 'updated_at';
  }): Promise<Task[]> {
    this.init();
    let tasks = [...this.memoryTasks];

    if (params?.status) {
      tasks = tasks.filter(t => t.status === params.status);
    }
    if (params?.priority) {
      tasks = tasks.filter(t => t.priority === params.priority);
    }
    if (params?.tag) {
      const q = params.tag.toLowerCase();
      tasks = tasks.filter(t => t.tags.some(tag => tag.toLowerCase() === q));
    }
    if (params?.assigneeName) {
      tasks = tasks.filter(t => t.assignee?.name === params.assigneeName);
    }
    if (params?.search) {
      const query = params.search.toLowerCase().trim();
      tasks = tasks.filter(
        t =>
          t.title.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.id.toLowerCase().includes(query) ||
          t.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sorting
    const priorityWeights: Record<TaskPriority, number> = {
      urgent: 4,
      high: 3,
      medium: 2,
      low: 1,
    };

    if (params?.sortBy === 'priority') {
      tasks.sort((a, b) => priorityWeights[b.priority] - priorityWeights[a.priority]);
    } else if (params?.sortBy === 'due_date') {
      tasks.sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'));
    } else if (params?.sortBy === 'updated_at') {
      tasks.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } else {
      tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return tasks;
  }

  public async getTask(id: string): Promise<Task | null> {
    this.init();
    const task = this.memoryTasks.find(t => t.id === id);
    return task || null;
  }

  public async createTask(input: TaskCreateInput): Promise<Task> {
    this.init();
    const now = new Date().toISOString();
    const idNumber = this.memoryTasks.length + 101;
    const newTask: Task = {
      id: `TSK-${idNumber}`,
      title: input.title.trim(),
      description: input.description?.trim() || '',
      status: input.status || 'backlog',
      priority: input.priority || 'medium',
      dueDate: input.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      tags: input.tags || [],
      subtasks: (input.subtasks || []).map((s, idx) => ({
        id: `sub-${Date.now()}-${idx}`,
        title: s.title.trim(),
        completed: Boolean(s.completed),
      })),
      assignee: input.assignee || TEAM_MEMBERS[0],
      createdAt: now,
      updatedAt: now,
    };

    this.memoryTasks.unshift(newTask);
    this.persist();
    return newTask;
  }

  public async updateTask(id: string, input: TaskUpdateInput): Promise<Task> {
    this.init();
    const index = this.memoryTasks.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error(`Task with ID ${id} not found.`);
    }

    const current = this.memoryTasks[index];
    const updated: Task = {
      ...current,
      title: input.title !== undefined ? input.title.trim() : current.title,
      description: input.description !== undefined ? input.description.trim() : current.description,
      status: input.status !== undefined ? input.status : current.status,
      priority: input.priority !== undefined ? input.priority : current.priority,
      dueDate: input.dueDate !== undefined ? input.dueDate : current.dueDate,
      tags: input.tags !== undefined ? input.tags : current.tags,
      subtasks: input.subtasks !== undefined ? input.subtasks : current.subtasks,
      assignee: input.assignee !== undefined ? input.assignee : current.assignee,
      updatedAt: new Date().toISOString(),
    };

    this.memoryTasks[index] = updated;
    this.persist();
    return updated;
  }

  public async patchTask(id: string, updates: Partial<Task>): Promise<Task> {
    return this.updateTask(id, updates);
  }

  public async deleteTask(id: string): Promise<boolean> {
    this.init();
    const beforeCount = this.memoryTasks.length;
    this.memoryTasks = this.memoryTasks.filter(t => t.id !== id);
    this.persist();
    return this.memoryTasks.length < beforeCount;
  }

  public async toggleTaskCompletion(id: string): Promise<Task> {
    this.init();
    const task = await this.getTask(id);
    if (!task) throw new Error('Task not found');
    const newStatus: TaskStatus = task.status === 'completed' ? 'in_progress' : 'completed';
    return this.updateTask(id, { status: newStatus });
  }

  public async addSubtask(taskId: string, title: string): Promise<Task> {
    this.init();
    const task = await this.getTask(taskId);
    if (!task) throw new Error('Task not found');
    const newSubtask: Subtask = {
      id: `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: title.trim(),
      completed: false,
    };
    const subtasks = [...task.subtasks, newSubtask];
    return this.updateTask(taskId, { subtasks });
  }

  public async toggleSubtask(taskId: string, subtaskId: string): Promise<Task> {
    this.init();
    const task = await this.getTask(taskId);
    if (!task) throw new Error('Task not found');
    const subtasks = task.subtasks.map(s =>
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );
    return this.updateTask(taskId, { subtasks });
  }

  public async batchUpdate(
    taskIds: string[],
    action: { type: 'complete' | 'delete' | 'set_priority' | 'set_status'; value?: any }
  ): Promise<void> {
    this.init();
    if (action.type === 'delete') {
      this.memoryTasks = this.memoryTasks.filter(t => !taskIds.includes(t.id));
    } else {
      this.memoryTasks = this.memoryTasks.map(t => {
        if (!taskIds.includes(t.id)) return t;
        if (action.type === 'complete') {
          return { ...t, status: 'completed' as TaskStatus, updatedAt: new Date().toISOString() };
        }
        if (action.type === 'set_priority') {
          return { ...t, priority: action.value as TaskPriority, updatedAt: new Date().toISOString() };
        }
        if (action.type === 'set_status') {
          return { ...t, status: action.value as TaskStatus, updatedAt: new Date().toISOString() };
        }
        return t;
      });
    }
    this.persist();
  }

  public async getStats(): Promise<TaskStats> {
    this.init();
    const tasks = this.memoryTasks;
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const inReview = tasks.filter(t => t.status === 'in_review').length;
    const backlog = tasks.filter(t => t.status === 'backlog').length;

    const urgent = tasks.filter(t => t.priority === 'urgent').length;
    const high = tasks.filter(t => t.priority === 'high').length;
    const medium = tasks.filter(t => t.priority === 'medium').length;
    const low = tasks.filter(t => t.priority === 'low').length;

    const todayStr = new Date().toISOString().split('T')[0];
    const overdueCount = tasks.filter(
      t => t.status !== 'completed' && t.dueDate && t.dueDate < todayStr
    ).length;

    const completionRate = total > 0 ? Math.round((completed / total) * 1000) / 10 : 0;

    return {
      total,
      completed,
      inProgress,
      inReview,
      backlog,
      urgent,
      high,
      medium,
      low,
      completionRate,
      overdueCount,
    };
  }

  public async resetSampleData(): Promise<Task[]> {
    this.memoryTasks = JSON.parse(JSON.stringify(INITIAL_TASKS));
    this.persist();
    return this.memoryTasks;
  }

  // Interactive Swagger UI / API Testing Direct Engine
  public async executeApiCall(options: {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    path: string;
    queryParams?: Record<string, string>;
    body?: any;
  }): Promise<{
    status: number;
    statusText: string;
    headers: Record<string, string>;
    data: any;
    durationMs: number;
    curl: string;
  }> {
    const start = performance.now();
    const { method, path, queryParams = {}, body } = options;

    // Generate cURL command
    let queryStr = '';
    const validParams = Object.entries(queryParams).filter(([_, v]) => v !== undefined && v !== '');
    if (validParams.length > 0) {
      queryStr = '?' + validParams.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
    }
    const fullUrl = `http://localhost:8000/api${path}${queryStr}`;

    let curl = `curl -X '${method}' \\\n  '${fullUrl}'`;
    if (method !== 'GET') {
      curl += ` \\\n  -H 'accept: application/json' \\\n  -H 'Content-Type: application/json'`;
      if (body) {
        curl += ` \\\n  -d '${JSON.stringify(body, null, 2)}'`;
      }
    }

    // Try executing against server if endpoint matches, or compute deterministically
    try {
      // Simulate real server I/O latency
      await new Promise(r => setTimeout(r, Math.floor(Math.random() * 40) + 30));

      const cleanPath = path.startsWith('/api') ? path.replace('/api', '') : path;

      if (cleanPath === '/tasks' && method === 'GET') {
        const tasks = await this.getTasks({
          status: queryParams.status as TaskStatus,
          priority: queryParams.priority as TaskPriority,
          search: queryParams.search,
          tag: queryParams.tag,
          sortBy: queryParams.sort_by as any,
        });
        const durationMs = Math.round(performance.now() - start);
        return {
          status: 200,
          statusText: 'OK',
          headers: {
            'content-type': 'application/json',
            'server': 'uvicorn / fastapi-async',
            'x-process-time': `${(durationMs / 1000).toFixed(4)}s`,
          },
          data: tasks,
          durationMs,
          curl,
        };
      }

      if (cleanPath === '/tasks' && method === 'POST') {
        if (!body?.title) {
          return {
            status: 422,
            statusText: 'Unprocessable Entity',
            headers: { 'content-type': 'application/json' },
            data: {
              detail: [{ loc: ['body', 'title'], msg: 'Field required', type: 'missing' }],
            },
            durationMs: Math.round(performance.now() - start),
            curl,
          };
        }
        const created = await this.createTask(body);
        return {
          status: 201,
          statusText: 'Created',
          headers: { 'content-type': 'application/json', 'server': 'uvicorn / fastapi' },
          data: created,
          durationMs: Math.round(performance.now() - start),
          curl,
        };
      }

      // Check /tasks/{task_id}/toggle
      const toggleMatch = cleanPath.match(/^\/tasks\/([^/]+)\/toggle$/);
      if (toggleMatch && method === 'PATCH') {
        const taskId = toggleMatch[1];
        const updated = await this.toggleTaskCompletion(taskId);
        return {
          status: 200,
          statusText: 'OK',
          headers: { 'content-type': 'application/json' },
          data: updated,
          durationMs: Math.round(performance.now() - start),
          curl,
        };
      }

      // Check /tasks/{task_id}/subtasks
      const subtaskMatch = cleanPath.match(/^\/tasks\/([^/]+)\/subtasks$/);
      if (subtaskMatch && method === 'POST') {
        const taskId = subtaskMatch[1];
        if (!body?.title) {
          return {
            status: 422,
            statusText: 'Unprocessable Entity',
            headers: { 'content-type': 'application/json' },
            data: { detail: [{ loc: ['body', 'title'], msg: 'Field required', type: 'missing' }] },
            durationMs: Math.round(performance.now() - start),
            curl,
          };
        }
        const updated = await this.addSubtask(taskId, body.title);
        return {
          status: 201,
          statusText: 'Created',
          headers: { 'content-type': 'application/json' },
          data: updated,
          durationMs: Math.round(performance.now() - start),
          curl,
        };
      }

      // Check /tasks/{task_id}
      const singleMatch = cleanPath.match(/^\/tasks\/([^/]+)$/);
      if (singleMatch) {
        const taskId = singleMatch[1];
        if (method === 'GET') {
          const task = await this.getTask(taskId);
          if (!task) {
            return {
              status: 404,
              statusText: 'Not Found',
              headers: { 'content-type': 'application/json' },
              data: { detail: `Task ${taskId} not found` },
              durationMs: Math.round(performance.now() - start),
              curl,
            };
          }
          return {
            status: 200,
            statusText: 'OK',
            headers: { 'content-type': 'application/json' },
            data: task,
            durationMs: Math.round(performance.now() - start),
            curl,
          };
        }
        if (method === 'PUT' || method === 'PATCH') {
          const updated = await this.updateTask(taskId, body);
          return {
            status: 200,
            statusText: 'OK',
            headers: { 'content-type': 'application/json' },
            data: updated,
            durationMs: Math.round(performance.now() - start),
            curl,
          };
        }
        if (method === 'DELETE') {
          const ok = await this.deleteTask(taskId);
          return {
            status: ok ? 200 : 404,
            statusText: ok ? 'OK' : 'Not Found',
            headers: { 'content-type': 'application/json' },
            data: ok ? { success: true, message: `Task ${taskId} deleted` } : { detail: 'Task not found' },
            durationMs: Math.round(performance.now() - start),
            curl,
          };
        }
      }

      if (cleanPath === '/stats') {
        const stats = await this.getStats();
        return {
          status: 200,
          statusText: 'OK',
          headers: { 'content-type': 'application/json' },
          data: stats,
          durationMs: Math.round(performance.now() - start),
          curl,
        };
      }

      if (cleanPath === '/health') {
        return {
          status: 200,
          statusText: 'OK',
          headers: { 'content-type': 'application/json' },
          data: {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            engine: 'FastAPI / Uvicorn + React Client',
          },
          durationMs: Math.round(performance.now() - start),
          curl,
        };
      }

      return {
        status: 404,
        statusText: 'Not Found',
        headers: { 'content-type': 'application/json' },
        data: { detail: `Route ${method} ${path} not registered in FastAPI routers.` },
        durationMs: Math.round(performance.now() - start),
        curl,
      };
    } catch (err: any) {
      return {
        status: 500,
        statusText: 'Internal Server Error',
        headers: { 'content-type': 'application/json' },
        data: { detail: err.message || 'Unknown internal error' },
        durationMs: Math.round(performance.now() - start),
        curl,
      };
    }
  }
}

export const apiClient = new ApiClient();
