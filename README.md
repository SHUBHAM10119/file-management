# File Management System

A full-stack web application that provides secure file upload, storage, and management capabilities with user authentication, built with FastAPI and React.

## Features

- **Secure User Authentication**: Register, login, and JWT-based authentication
- **File Management**:
  - Upload and store various file types (PDF, Word, Excel, Text)
  - Download and delete files
  - Duplicate file detection with replace option
  - Proper upload date/time displayed in user's timezone
- **User Profile Management**:
  - View and update user profile information
  - Add, edit, and delete addresses
- **Interactive Dashboard**:
  - View file statistics
  - Progress tracking for file uploads
  - Visual feedback for all operations

## Technology Stack

### Backend
- **FastAPI**: Modern, high-performance Python web framework
- **SQLAlchemy**: SQL toolkit and ORM
- **SQLite**: Database engine
- **Pydantic**: Data validation
- **JWT**: Authentication mechanism

### Frontend
- **React**: JS library for building user interfaces
- **Material-UI**: Component library with modern design
- **Axios**: Promise-based HTTP client
- **React Router**: Navigation and routing

## Recent Updates

- Added upload date/time display according to user's local timezone
- Implemented duplicate file detection with options to:
  - Replace existing file
  - Cancel upload and rename file
- Enhanced error handling with contextual error messages
- Improved visual feedback during file operations
- Fixed authentication token handling

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Set up a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Unix/MacOS: `source venv/bin/activate`

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Start the backend server:
   ```
   uvicorn app.main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. The application will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/token`: Login and get access token
- `POST /api/users/`: Register new user

### Files
- `GET /api/files/`: List all user files
- `POST /api/upload/`: Upload a new file
- `GET /api/files/{file_id}/download`: Download a file
- `DELETE /api/files/{file_id}`: Delete a file
- `GET /api/dashboard/stats`: Get file statistics

### User Management
- `GET /api/users/me/`: Get current user profile
- `PUT /api/users/me/`: Update user profile
- `GET /api/users/me/addresses/`: Get user addresses
- `POST /api/users/me/addresses/`: Add a new address

## Usage

1. Register a new account or login with existing credentials
2. Use the dashboard to upload, view, and manage files
3. Access the profile page to update personal information
4. ![addr](https://github.com/user-attachments/assets/7b50130e-08ad-4172-a35f-8353d3b05197)
5. 
![identicatl](https://github.com/user-attachments/assets/130a4d12-a29a-4f55-9c59-cbd310e52334)
![dasb](https://github.com/user-attachments/assets/ec90ee2e-a944-409a-850f-86bd01f67eed)
