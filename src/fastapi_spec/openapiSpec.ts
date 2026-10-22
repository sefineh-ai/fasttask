export const OPENAPI_SPEC = {
  openapi: "3.1.0",
  info: {
    title: "FastTask API",
    summary: "Production-grade Task Management REST API with FastAPI & React",
    description: "High-performance asynchronous API for task management, kanban workflows, subtask tracking, and team collaboration. Complies with OpenAPI 3.1 and Pydantic V2 schema validations.",
    version: "1.0.0",
    contact: {
      name: "FastTask Engineering",
      email: "api@fasttask.dev"
    }
  },
  servers: [
    {
      url: "/api",
      description: "Live Applet API Server"
    },
    {
      url: "http://localhost:8000",
      description: "Local Python Uvicorn Server"
    }
  ],
  tags: [
    {
      name: "Tasks",
      description: "CRUD operations and status workflow transitions for project tasks"
    },
    {
      name: "Subtasks",
      description: "Nested checklist items and subtask completion toggles"
    },
    {
      name: "Metrics",
      description: "Task analytics, velocity metrics, and system health"
    }
  ],
  paths: {
    "/tasks": {
      get: {
        tags: ["Tasks"],
        summary: "List tasks",
        description: "Retrieve a filtered and sorted list of tasks with pagination.",
        operationId: "list_tasks",
        parameters: [
          {
            name: "status",
            in: "query",
            required: false,
            schema: {
              type: "string",
              enum: ["backlog", "in_progress", "in_review", "completed"]
            },
            description: "Filter tasks by status"
          },
          {
            name: "priority",
            in: "query",
            required: false,
            schema: {
              type: "string",
              enum: ["urgent", "high", "medium", "low"]
            },
            description: "Filter tasks by priority level"
          },
          {
            name: "search",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "Search keyword matching title, description, or tags"
          },
          {
            name: "tag",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "Filter by specific tag"
          },
          {
            name: "sort_by",
            in: "query",
            required: false,
            schema: {
              type: "string",
              enum: ["due_date", "priority", "created_at", "updated_at"],
              default: "created_at"
            },
            description: "Field to sort results by"
          }
        ],
        responses: {
          "200": {
            description: "Successful response with list of tasks",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/TaskResponse" }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ["Tasks"],
        summary: "Create task",
        description: "Create a new task with validated title, priority, status, and subtasks.",
        operationId: "create_task",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TaskCreate" },
              example: {
                title: "Refactor database query optimization",
                description: "Implement composite indexes on task status and due_date columns.",
                status: "backlog",
                priority: "high",
                dueDate: "2026-10-31",
                tags: ["Database", "SQL", "Performance"],
                subtasks: [
                  { title: "Run EXPLAIN ANALYZE on slow queries", completed: false },
                  { title: "Benchmark query latency delta", completed: false }
                ]
              }
            }
          }
        },
        responses: {
          "201": {
            description: "Task created successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TaskResponse" }
              }
            }
          },
          "422": {
            description: "Validation Error (e.g., missing required fields or invalid enum)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/HTTPValidationError" }
              }
            }
          }
        }
      }
    },
    "/tasks/{task_id}": {
      get: {
        tags: ["Tasks"],
        summary: "Get task by ID",
        description: "Retrieve complete task details including subtasks and history.",
        operationId: "get_task",
        parameters: [
          {
            name: "task_id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "The unique task identifier (e.g. TSK-101)"
          }
        ],
        responses: {
          "200": {
            description: "Task found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TaskResponse" }
              }
            }
          },
          "404": {
            description: "Task not found"
          }
        }
      },
      put: {
        tags: ["Tasks"],
        summary: "Update task",
        description: "Replace all editable fields of an existing task.",
        operationId: "update_task",
        parameters: [
          {
            name: "task_id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TaskUpdate" }
            }
          }
        },
        responses: {
          "200": {
            description: "Task updated successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TaskResponse" }
              }
            }
          },
          "404": { description: "Task not found" }
        }
      },
      patch: {
        tags: ["Tasks"],
        summary: "Patch task",
        description: "Partially update specific task fields (e.g. status transition or priority bump).",
        operationId: "patch_task",
        parameters: [
          {
            name: "task_id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TaskUpdate" },
              example: {
                status: "completed"
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Task patched successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TaskResponse" }
              }
            }
          },
          "404": { description: "Task not found" }
        }
      },
      delete: {
        tags: ["Tasks"],
        summary: "Delete task",
        description: "Permanently delete a task by ID.",
        operationId: "delete_task",
        parameters: [
          {
            name: "task_id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          "200": {
            description: "Task deleted",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" }
                  }
                }
              }
            }
          },
          "404": { description: "Task not found" }
        }
      }
    },
    "/tasks/{task_id}/toggle": {
      patch: {
        tags: ["Tasks"],
        summary: "Toggle task completion",
        description: "Convenience endpoint to toggle status between completed and in_progress.",
        operationId: "toggle_task_completion",
        parameters: [
          {
            name: "task_id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          "200": {
            description: "Status toggled",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TaskResponse" }
              }
            }
          }
        }
      }
    },
    "/tasks/{task_id}/subtasks": {
      post: {
        tags: ["Subtasks"],
        summary: "Add subtask",
        description: "Append a checklist subtask to the specified task.",
        operationId: "add_subtask",
        parameters: [
          {
            name: "task_id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title"],
                properties: {
                  title: { type: "string", minLength: 1 }
                }
              },
              example: { title: "Draft API documentation guide" }
            }
          }
        },
        responses: {
          "201": {
            description: "Subtask created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TaskResponse" }
              }
            }
          }
        }
      }
    },
    "/stats": {
      get: {
        tags: ["Metrics"],
        summary: "Get task statistics",
        description: "Compute total counts, completion rates, priority breakdown, and overdue metrics.",
        operationId: "get_task_stats",
        responses: {
          "200": {
            description: "Aggregate task statistics",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StatsResponse" }
              }
            }
          }
        }
      }
    },
    "/health": {
      get: {
        tags: ["Metrics"],
        summary: "Health probe",
        description: "Returns application operational status and server timestamp.",
        operationId: "health_check",
        responses: {
          "200": {
            description: "Service is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "healthy" },
                    timestamp: { type: "string", example: "2026-10-21T23:59:00Z" },
                    engine: { type: "string", example: "FastAPI / Uvicorn (Emulated + Exportable)" }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      TaskPriority: {
        type: "string",
        enum: ["urgent", "high", "medium", "low"],
        description: "Task urgency classification"
      },
      TaskStatus: {
        type: "string",
        enum: ["backlog", "in_progress", "in_review", "completed"],
        description: "Current stage in task delivery pipeline"
      },
      Subtask: {
        type: "object",
        required: ["id", "title", "completed"],
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          completed: { type: "boolean" }
        }
      },
      Assignee: {
        type: "object",
        required: ["name", "email"],
        properties: {
          name: { type: "string" },
          email: { type: "string", format: "email" },
          avatarUrl: { type: "string" },
          role: { type: "string" }
        }
      },
      TaskResponse: {
        type: "object",
        required: ["id", "title", "status", "priority", "dueDate", "tags", "subtasks", "createdAt", "updatedAt"],
        properties: {
          id: { type: "string", example: "TSK-101" },
          title: { type: "string", example: "Migrate REST endpoints to FastAPI async routers" },
          description: { type: "string", example: "Transition synchronous handlers to async def." },
          status: { $ref: "#/components/schemas/TaskStatus" },
          priority: { $ref: "#/components/schemas/TaskPriority" },
          dueDate: { type: "string", format: "date", example: "2026-10-24" },
          tags: {
            type: "array",
            items: { type: "string" },
            example: ["Backend", "FastAPI"]
          },
          subtasks: {
            type: "array",
            items: { $ref: "#/components/schemas/Subtask" }
          },
          assignee: { $ref: "#/components/schemas/Assignee" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        }
      },
      TaskCreate: {
        type: "object",
        required: ["title"],
        properties: {
          title: { type: "string", minLength: 1, maxLength: 255 },
          description: { type: "string", default: "" },
          status: { $ref: "#/components/schemas/TaskStatus", default: "backlog" },
          priority: { $ref: "#/components/schemas/TaskPriority", default: "medium" },
          dueDate: { type: "string", format: "date" },
          tags: {
            type: "array",
            items: { type: "string" },
            default: []
          },
          subtasks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                completed: { type: "boolean", default: false }
              }
            },
            default: []
          }
        }
      },
      TaskUpdate: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          status: { $ref: "#/components/schemas/TaskStatus" },
          priority: { $ref: "#/components/schemas/TaskPriority" },
          dueDate: { type: "string" },
          tags: {
            type: "array",
            items: { type: "string" }
          },
          subtasks: {
            type: "array",
            items: { $ref: "#/components/schemas/Subtask" }
          }
        }
      },
      StatsResponse: {
        type: "object",
        required: ["total", "completed", "inProgress", "inReview", "backlog", "urgent", "high", "medium", "low", "completionRate", "overdueCount"],
        properties: {
          total: { type: "integer", example: 6 },
          completed: { type: "integer", example: 2 },
          inProgress: { type: "integer", example: 2 },
          inReview: { type: "integer", example: 1 },
          backlog: { type: "integer", example: 1 },
          urgent: { type: "integer", example: 1 },
          high: { type: "integer", example: 2 },
          medium: { type: "integer", example: 2 },
          low: { type: "integer", example: 1 },
          completionRate: { type: "number", example: 33.3 },
          overdueCount: { type: "integer", example: 0 }
        }
      },
      HTTPValidationError: {
        type: "object",
        properties: {
          detail: {
            type: "array",
            items: {
              type: "object",
              properties: {
                loc: { type: "array", items: { type: "string" } },
                msg: { type: "string" },
                type: { type: "string" }
              }
            }
          }
        }
      }
    }
  }
};
