export type TaskStatus = 'backlog' | 'in_progress' | 'in_review' | 'completed';
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Assignee {
  name: string;
  email: string;
  avatarUrl: string;
  role: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string; // YYYY-MM-DD
  tags: string[];
  subtasks: Subtask[];
  assignee: Assignee;
  createdAt: string;
  updatedAt: string;
}

export interface TaskCreateInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  tags?: string[];
  subtasks?: Array<{ title: string; completed?: boolean }>;
  assignee?: Assignee;
}

export interface TaskUpdateInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  tags?: string[];
  subtasks?: Subtask[];
  assignee?: Assignee;
}

export interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  inReview: number;
  backlog: number;
  urgent: number;
  high: number;
  medium: number;
  low: number;
  completionRate: number; // 0 - 100
  overdueCount: number;
}
