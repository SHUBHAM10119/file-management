# Backend - File Management System API

This directory contains the FastAPI backend for the File Management System.

## Technology Stack

- **FastAPI**: Modern, high-performance Python web framework
- **SQLAlchemy**: SQL toolkit and ORM
- **SQLite**: Database engine (can be swapped for PostgreSQL/MySQL in production)
- **Pydantic**: Data validation and settings management
- **JWT**: Token-based authentication with Python-Jose

## Project Structure

```
backend/
├── app/
│   ├── models/      # SQLAlchemy models
│   ├── routes/      # API endpoints
│   ├── schemas/     # Pydantic schemas for request/response validation
│   └── utils/       # Utility functions and helpers
├── uploads/         # Directory for stored files
├── main.py          # Application entry point
└── requirements.txt # Python dependencies
```

## Setup Instructions

1. Create a virtual environment:
   ```
   python -m venv venv
   ```

2. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Run the development server:
   ```
   uvicorn app.main:app --reload
   ```

5. The API will be available at `http://localhost:8000/api`
   - API documentation: `http://localhost:8000/docs`
   - Alternative docs: `http://localhost:8000/redoc`

## Key Features

- **User Authentication**: JWT-based authentication system
- **File Management**: Upload, download, and delete files
- **User Profile**: Manage user information and addresses
- **Dashboard Statistics**: Get summary statistics about files and users 