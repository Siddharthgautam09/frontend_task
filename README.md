# 🏢 Enterprise Task Management System

> A comprehensive, role-based task and project management solution for enterprise teams.

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.x-black.svg)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5.x-green.svg)](https://www.mongodb.com/)

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [User Roles](#user-roles)
- [API Documentation](#api-documentation)
- [Security](#security)
- [Contributing](#contributing)
- [Support](#support)

## 🎯 Overview

The Enterprise Task Management System is a full-stack web application designed to streamline project management and task tracking for enterprise teams. Built with modern technologies and best practices, it provides role-based access control, real-time collaboration, and comprehensive analytics.

### Key Benefits
- **🚀 Improved Productivity**: Streamlined task management and project tracking
- **👥 Enhanced Collaboration**: Real-time updates and team communication
- **📊 Data-Driven Insights**: Comprehensive analytics and reporting
- **🔒 Enterprise Security**: Role-based access control and secure authentication
- **📱 Modern Interface**: Responsive design for desktop and mobile devices

## ✨ Features

### 🔐 Authentication & Authorization
- **JWT-based Security**: Secure token-based authentication
- **Role-Based Access**: Admin and Team Member roles with appropriate permissions
- **Profile Management**: User profile updates and password management
- **Session Management**: Secure login/logout with token refresh

### 📊 Project Management
- **Project Creation**: Comprehensive project setup with team assignment
- **Project Tracking**: Real-time progress monitoring and status updates
- **Resource Management**: Team member allocation and workload balancing
- **Project Analytics**: Performance metrics and completion tracking

### ✅ Task Management
- **Task Lifecycle**: Complete task workflow from creation to completion
- **Priority Management**: Task prioritization with urgency levels
- **Assignment System**: Flexible task assignment to team members
- **Status Tracking**: Real-time status updates and progress monitoring
- **Comments & Collaboration**: Task-specific communication and updates
- **Dependencies**: Task dependency management and workflow optimization

### 📈 Analytics & Reporting
- **Dashboard Metrics**: Real-time performance indicators
- **Team Analytics**: Individual and team performance insights
- **Project Insights**: Project-specific metrics and trends
- **Custom Reports**: Filtered analytics for specific time periods
- **Export Capabilities**: Data export for external analysis

### 🛠️ System Features
- **RESTful API**: Comprehensive API with OpenAPI documentation
- **Real-time Updates**: Live data synchronization across users
- **Responsive Design**: Mobile-friendly interface
- **Search & Filtering**: Advanced search and filtering capabilities
- **Data Validation**: Comprehensive input validation and error handling

## 🏗️ Architecture

### Technology Stack

#### Backend
- **Runtime**: Node.js 18.x with TypeScript
- **Framework**: Express.js with comprehensive middleware
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with refresh token strategy
- **Documentation**: Swagger/OpenAPI 3.0.3
- **Security**: Helmet, CORS, rate limiting, input validation
- **Logging**: Winston with structured logging

#### Frontend
- **Framework**: Next.js 14.x with React 18.x
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React hooks and context
- **HTTP Client**: Axios with interceptors
- **UI Components**: Custom components with Lucide icons

#### Infrastructure
- **Development**: Local development with hot reload
- **Production**: Vercel deployment (recommended)
- **Database**: MongoDB Atlas or local MongoDB
- **File Storage**: Local storage (expandable to cloud)

### Project Structure
```
enterprise-task-management/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Authentication, validation
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── utils/          # Helper functions
│   ├── api/                # Vercel serverless functions
│   └── dist/               # Compiled JavaScript
├── frontend/               # Next.js React application
│   ├── src/
│   │   ├── app/            # Next.js app router
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility libraries
│   │   └── types/          # TypeScript type definitions
│   └── public/             # Static assets
├── docs/                   # Documentation files
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or higher
- MongoDB 5.x or higher
- npm or yarn package manager

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/enterprise-task-management.git
   cd enterprise-task-management
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   npm run build
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   npm run build
   ```

4. **Environment Configuration**
   
   Create `.env` in backend directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/enterprise-task-management
   JWT_SECRET=your-super-secret-jwt-key
   JWT_REFRESH_SECRET=your-super-secret-refresh-key
   FRONTEND_URL=http://localhost:3000
   ```

   Create `.env.local` in frontend directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

5. **Start Development Servers**
   ```bash
   # Terminal 1: Backend
   cd backend && npm run dev
   
   # Terminal 2: Frontend
   cd frontend && npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api
   - API Documentation: http://localhost:5000/api/docs

## 📚 Documentation

### Setup & Deployment
- **[Setup & Deployment Guide](./SETUP_DEPLOYMENT_GUIDE.md)**: Comprehensive installation and deployment instructions
- **[API Documentation Guide](./backend/API_DOCUMENTATION_GUIDE.md)**: Complete API documentation overview
- **[Testing Guide](./backend/TESTING_GUIDE.md)**: How to test the API documentation

### User Guides
- **[Admin User Guide](./ADMIN_USER_GUIDE.md)**: Complete guide for administrators
- **[Team Member User Guide](./TEAM_MEMBER_USER_GUIDE.md)**: Guide for team members

### Technical Documentation
- **[API Reference](http://localhost:5000/api/docs)**: Interactive Swagger API documentation
- **[Backend Architecture](./backend/README.md)**: Backend implementation details
- **[Frontend Architecture](./frontend/README.md)**: Frontend implementation details

## 👥 User Roles

### 👑 Administrator
**Full system access and management capabilities**

**Key Responsibilities:**
- User management and access control
- Project creation and oversight
- System-wide analytics and reporting
- Resource allocation and planning
- System configuration and maintenance

**Permissions:**
- ✅ Create, read, update, delete all projects
- ✅ Manage all users and their roles
- ✅ Access system-wide analytics
- ✅ Perform administrative functions
- ✅ View and manage all tasks across projects

### 👥 Team Member
**Project-based access with task management focus**

**Key Responsibilities:**
- Task completion and status updates
- Project collaboration and communication
- Personal productivity and time management
- Quality deliverable creation
- Team communication and support

**Permissions:**
- ✅ View assigned projects and their details
- ✅ Create, update, and manage own tasks
- ✅ Comment on tasks and collaborate with team
- ✅ Update profile and personal settings
- ✅ View personal analytics and performance metrics

## 🔧 API Documentation

### Interactive Documentation
Access the full API documentation at: **http://localhost:5000/api/docs**

### API Endpoints Overview
```
🔐 Authentication (/api/auth)
├── POST /register        # User registration
├── POST /login          # User authentication
├── POST /refresh        # Token refresh
├── GET  /profile        # Get user profile
├── PUT  /profile        # Update profile
├── PUT  /change-password # Change password
└── POST /logout         # User logout

📊 Projects (/api/projects)
├── POST /               # Create project (Admin)
├── GET  /               # List projects
├── GET  /:id            # Get project details
├── PUT  /:id            # Update project
├── DELETE /:id          # Delete project (Admin)
└── GET  /:id/stats      # Project statistics

✅ Tasks (/api/tasks)
├── POST /               # Create task
├── GET  /               # List all tasks
├── GET  /my-tasks       # My assigned tasks
├── GET  /:id            # Get task details
├── PUT  /:id            # Update task
├── DELETE /:id          # Delete task
└── POST /:id/comments   # Add task comment

📈 Analytics (/api/analytics)
├── GET  /dashboard      # Dashboard metrics
├── GET  /projects       # Project analytics
└── GET  /team          # Team analytics (Admin)

👥 Users (/api/users)
└── GET  /               # List active users
```

### Authentication
All protected endpoints require JWT authentication:
```bash
Authorization: Bearer <your-jwt-token>
```

## 🔒 Security

### Security Features
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Granular permissions based on user roles
- **Input Validation**: Comprehensive server-side validation
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Protection**: Configurable CORS policies
- **Security Headers**: Helmet.js for security headers
- **Password Security**: Bcrypt password hashing

### Security Best Practices
- Strong password requirements
- Regular token refresh
- Secure environment variable management
- Input sanitization and validation
- Audit logging for security events

## 🤝 Contributing

### Development Workflow
1. **Fork the Repository**: Create your own fork
2. **Create Feature Branch**: `git checkout -b feature/your-feature-name`
3. **Make Changes**: Implement your feature or fix
4. **Test Changes**: Ensure all tests pass
5. **Commit Changes**: Use conventional commit messages
6. **Push to Fork**: `git push origin feature/your-feature-name`
7. **Create Pull Request**: Submit for review

### Coding Standards
- **TypeScript**: Use TypeScript for type safety
- **ESLint**: Follow configured linting rules
- **Prettier**: Use for code formatting
- **Comments**: Document complex logic
- **Testing**: Write tests for new features
  
### Admin Credentials-
Email-admin@example.com
password-Admin@1234

User Credentials-
Email-user@example.com
password-User@1234

### Development Setup
```bash
# Install dependencies
npm install

# Run linting
npm run lint

# Run type checking
npm run type-check

# Run tests
npm run test





# Build for production

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Node.js Community**: For the excellent runtime and ecosystem
- **React Team**: For the powerful frontend framework
- **MongoDB**: For the flexible database solution
- **TypeScript Team**: For enhanced development experience
- **Open Source Community**: For the amazing tools and libraries

---

**Built with ❤️ for Enterprise Teams**

*Transform your team's productivity with modern task management*
