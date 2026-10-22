import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { OPENAPI_SPEC } from './src/fastapi_spec/openapiSpec';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // FastAPI OpenAPI Spec route
  app.get('/api/openapi.json', (_req, res) => {
    res.json(OPENAPI_SPEC);
  });

  // Health check route
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      engine: 'FastAPI / Uvicorn + Express Middleware Architecture',
      version: '1.0.0',
    });
  });

  // In-memory data store for server-side persistence
  let serverTasks: any[] = [
    {
      id: 'TSK-101',
      title: 'Migrate REST endpoints to FastAPI async routers',
      description: 'Transition synchronous request handlers in the task service to async def route functions with SQLAlchemy 2.0 async sessions.',
      status: 'in_progress',
      priority: 'urgent',
      dueDate: '2026-10-24',
      tags: ['Backend', 'FastAPI', 'Performance'],
      subtasks: [
        { id: 'sub-1', title: 'Audit current blocking I/O calls', completed: true },
        { id: 'sub-2', title: 'Implement async session dependency injection', completed: true },
        { id: 'sub-3', title: 'Write pytest-asyncio integration tests', completed: false },
      ],
      createdAt: '2026-10-18T09:30:00.000Z',
      updatedAt: '2026-10-21T14:15:00.000Z',
    },
    {
      id: 'TSK-102',
      title: 'Design Pydantic V2 request & response schemas',
      description: 'Construct strict Pydantic V2 models with Field validation, example values for Swagger docs, and custom validators for ISO 8601 timestamps.',
      status: 'completed',
      priority: 'high',
      dueDate: '2026-10-22',
      tags: ['FastAPI', 'Pydantic', 'OpenAPI'],
      subtasks: [
        { id: 'sub-4', title: 'Define TaskCreate and TaskUpdate schemas', completed: true },
        { id: 'sub-5', title: 'Configure JSON schema serialization aliases', completed: true },
        { id: 'sub-6', title: 'Verify OpenAPI documentation generation', completed: true },
      ],
      createdAt: '2026-10-15T11:00:00.000Z',
      updatedAt: '2026-10-20T16:45:00.000Z',
    },
  ];

  app.get('/api/tasks', (req, res) => {
    const { status, priority, search, tag } = req.query;
    let list = [...serverTasks];
    if (status) list = list.filter(t => t.status === status);
    if (priority) list = list.filter(t => t.priority === priority);
    if (tag) list = list.filter(t => t.tags.includes(tag));
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    }
    res.json(list);
  });

  app.post('/api/tasks', (req, res) => {
    const body = req.body;
    if (!body || !body.title) {
      return res.status(422).json({
        detail: [{ loc: ['body', 'title'], msg: 'Field required', type: 'missing' }],
      });
    }
    const id = `TSK-${serverTasks.length + 101}`;
    const newTask = {
      id,
      title: body.title,
      description: body.description || '',
      status: body.status || 'backlog',
      priority: body.priority || 'medium',
      dueDate: body.dueDate || new Date().toISOString().split('T')[0],
      tags: body.tags || [],
      subtasks: body.subtasks || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    serverTasks.unshift(newTask);
    res.status(201).json(newTask);
  });

  app.get('/api/tasks/:id', (req, res) => {
    const task = serverTasks.find(t => t.id === req.params.id);
    if (!task) return res.status(404).json({ detail: `Task ${req.params.id} not found` });
    res.json(task);
  });

  app.patch('/api/tasks/:id', (req, res) => {
    const idx = serverTasks.findIndex(t => t.id === req.params.id);
    if (idx === -1) return res.status(404).json({ detail: `Task ${req.params.id} not found` });
    serverTasks[idx] = { ...serverTasks[idx], ...req.body, updatedAt: new Date().toISOString() };
    res.json(serverTasks[idx]);
  });

  app.delete('/api/tasks/:id', (req, res) => {
    const initialLen = serverTasks.length;
    serverTasks = serverTasks.filter(t => t.id !== req.params.id);
    if (serverTasks.length === initialLen) {
      return res.status(404).json({ detail: `Task ${req.params.id} not found` });
    }
    res.json({ success: true, message: `Task ${req.params.id} deleted` });
  });

  app.get('/api/stats', (_req, res) => {
    const total = serverTasks.length;
    const completed = serverTasks.filter(t => t.status === 'completed').length;
    res.json({
      total,
      completed,
      inProgress: serverTasks.filter(t => t.status === 'in_progress').length,
      inReview: serverTasks.filter(t => t.status === 'in_review').length,
      backlog: serverTasks.filter(t => t.status === 'backlog').length,
      urgent: serverTasks.filter(t => t.priority === 'urgent').length,
      high: serverTasks.filter(t => t.priority === 'high').length,
      medium: serverTasks.filter(t => t.priority === 'medium').length,
      low: serverTasks.filter(t => t.priority === 'low').length,
      completionRate: total > 0 ? Math.round((completed / total) * 1000) / 10 : 0,
      overdueCount: 0,
    });
  });

  // Vite middleware in dev or static serving in prod
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
