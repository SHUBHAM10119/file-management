# Frontend - File Management System

This directory contains the React frontend for the File Management System.

## Technology Stack

- **React**: JavaScript library for building user interfaces
- **Material-UI**: Component library with modern design
- **Axios**: Promise-based HTTP client for API requests
- **React Router**: Navigation and routing
- **Recharts**: Composable charting library for statistics

## Project Structure

```
frontend/
├── public/             # Static files
│   ├── images/         # Images including logo
│   └── index.html      # Main HTML file
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── services/       # API services
│   ├── App.js          # Main App component with routing
│   └── index.js        # Application entry point
└── package.json        # NPM dependencies
```

## Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm start
   ```

3. The application will be available at `http://localhost:3000`

## Key Features

- **Authentication Screens**: Login and Registration
- **Dashboard**: File statistics and management
- **File Upload**: Drag and drop interface with progress
- **File Management**: Download and delete operations
- **User Profile**: Update profile information and manage addresses
- **Responsive Design**: Works on desktop and mobile devices

## Building for Production

To create a production build:

```
npm run build
```

This creates optimized files in the `build` folder that can be deployed to any static hosting service. 