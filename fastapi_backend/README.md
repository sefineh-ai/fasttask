# FastTask FastAPI Backend

High-performance asynchronous task management backend powered by FastAPI, Pydantic V2, and SQLAlchemy.

## 🚀 Quickstart

1. Create and activate a Python virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run development server with auto-reload:
```bash
uvicorn main:app --reload --port 8000
```

4. Explore interactive API documentation:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **OpenAPI Schema**: [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)
