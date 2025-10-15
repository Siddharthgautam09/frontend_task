# 🚀 Enterprise Task Management - Setup & Deployment Guide

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Development Server](#development-server)
- [Production Deployment](#production-deployment)
- [Docker Deployment](#docker-deployment)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

### System Requirements
- **Node.js**: Version 18.x or higher
- **npm**: Version 8.x or higher  
- **MongoDB**: Version 5.x or higher
- **Git**: Latest version
- **Operating System**: Windows 10+, macOS 10.15+, or Linux

### Required Tools
```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check MongoDB version
mongod --version

# Check Git version
git --version
```

## 🏗️ Local Development Setup

### 1. Clone the Repository
```bash
# Clone the repository
git clone https://github.com/yourusername/enterprise-task-management.git

# Navigate to project directory
cd enterprise-task-management
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Build TypeScript files
npm run build
```

### 3. Frontend Setup
```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Build the project
npm run build
```

## ⚙️ Environment Configuration

### Backend Environment Variables

Create `.env` file in the `backend` directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
API_PREFIX=/api

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/enterprise-task-management
DB_NAME=enterprise-task-management

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_EXPIRE=1h
JWT_REFRESH_EXPIRE=7d

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Logging
LOG_LEVEL=info
```

### Frontend Environment Variables

Create `.env.local` file in the `frontend` directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# App Configuration
NEXT_PUBLIC_APP_NAME=Enterprise Task Management
NEXT_PUBLIC_APP_VERSION=1.0.0

# Development
NEXT_PUBLIC_ENVIRONMENT=development
```

### Production Environment Variables

**Backend Production (.env.production):**
```env
NODE_ENV=production
PORT=5000
API_PREFIX=/api

# Production Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/enterprise-task-management

# Strong JWT Secrets (Generate using: openssl rand -base64 64)
JWT_SECRET=your-production-jwt-secret-64-chars-minimum
JWT_REFRESH_SECRET=your-production-refresh-secret-64-chars-minimum

# Production CORS
FRONTEND_URL=https://your-domain.com

# Logging
LOG_LEVEL=error
```

**Frontend Production (.env.production):**
```env
NEXT_PUBLIC_API_URL=https://api.your-domain.com/api
NEXT_PUBLIC_APP_NAME=Enterprise Task Management
NEXT_PUBLIC_ENVIRONMENT=production
```

## 🗄️ Database Setup

### Local MongoDB Setup

#### Option 1: MongoDB Local Installation
```bash
# Install MongoDB Community Edition
# Follow official MongoDB installation guide for your OS

# Start MongoDB service
# Windows: net start MongoDB
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod

# Create database and user
mongosh
use enterprise-task-management
db.createUser({
  user: "admin",
  pwd: "password",
  roles: ["readWrite", "dbAdmin"]
})
```

#### Option 2: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Add your IP to whitelist
4. Create database user
5. Get connection string
6. Update `MONGODB_URI` in `.env`

### Database Initialization
```bash
# Navigate to backend directory
cd backend

# Run database initialization scripts (if any)
npm run db:init

# Seed initial data (optional)
npm run db:seed
```

## 🖥️ Development Server

### Start Backend Server
```bash
cd backend

# Development mode with hot reload
npm run dev

# Or build and start
npm run build
npm start
```

Backend will be available at: `http://localhost:5000`
API Documentation: `http://localhost:5000/api/docs`

### Start Frontend Server
```bash
cd frontend

# Development mode with hot reload
npm run dev

# Or build and start
npm run build
npm start
```

Frontend will be available at: `http://localhost:3000`

### Full Stack Development
```bash
# Terminal 1: Start Backend
cd backend && npm run dev

# Terminal 2: Start Frontend  
cd frontend && npm run dev

# Terminal 3: Monitor logs (optional)
cd backend && tail -f logs/app.log
```

## 🌐 Production Deployment

### Vercel Deployment (Recommended)

#### Backend Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to backend directory
cd backend

# Deploy to Vercel
vercel --prod

# Set environment variables in Vercel dashboard
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add JWT_REFRESH_SECRET
```

#### Frontend Deployment
```bash
# Navigate to frontend directory
cd frontend

# Deploy to Vercel
vercel --prod

# Environment variables are automatically detected from .env.production
```

### Alternative Deployment Options

#### AWS EC2 Deployment
```bash
# 1. Launch EC2 instance with Ubuntu 20.04
# 2. Connect via SSH
ssh -i your-key.pem ubuntu@your-ec2-ip

# 3. Install Node.js and MongoDB
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Clone and setup project
git clone https://github.com/yourusername/enterprise-task-management.git
cd enterprise-task-management

# 5. Setup backend
cd backend
npm install
npm run build

# 6. Setup frontend
cd ../frontend
npm install
npm run build

# 7. Use PM2 for process management
npm install -g pm2
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

#### DigitalOcean App Platform
```bash
# 1. Connect your GitHub repository
# 2. Configure build settings:
#    - Backend: npm run build && npm start
#    - Frontend: npm run build && npm start
# 3. Set environment variables
# 4. Deploy
```

## 🐳 Docker Deployment

### Dockerfile for Backend
Create `Dockerfile` in backend directory:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

### Dockerfile for Frontend
Create `Dockerfile` in frontend directory:
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]
```

### Docker Compose
Create `docker-compose.yml` in project root:
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:5.0
    container_name: task-management-db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  backend:
    build: ./backend
    container_name: task-management-backend
    environment:
      NODE_ENV: production
      MONGODB_URI: mongodb://admin:password@mongodb:27017/enterprise-task-management?authSource=admin
      JWT_SECRET: your-jwt-secret
      JWT_REFRESH_SECRET: your-refresh-secret
    ports:
      - "5000:5000"
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    container_name: task-management-frontend
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:5000/api
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

### Run with Docker
```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🛠️ Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

#### Database Connection Issues
```bash
# Check MongoDB status
mongosh --eval "db.adminCommand('ismaster')"

# Check connection string
echo $MONGODB_URI

# Test database connection
cd backend && npm run test:db
```

#### Build Errors
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
cd frontend && rm -rf .next
```

#### CORS Issues
```bash
# Check CORS configuration in backend
grep -r "FRONTEND_URL" backend/

# Verify frontend URL in environment
echo $FRONTEND_URL
```

### Performance Optimization

#### Backend Optimization
```bash
# Enable gzip compression
# Already configured in app.ts

# Database indexing
mongosh
use enterprise-task-management
db.users.createIndex({ email: 1 })
db.projects.createIndex({ managerId: 1 })
db.tasks.createIndex({ projectId: 1, assignedTo: 1 })
```

#### Frontend Optimization
```bash
# Analyze bundle size
cd frontend
npm run analyze

# Optimize images
npm install next-optimized-images

# Enable service worker (PWA)
npm install next-pwa
```

### Security Checklist

- [ ] Strong JWT secrets in production
- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] Authentication required for all protected routes
- [ ] Logs configured for security monitoring

### Monitoring & Maintenance

#### Health Checks
```bash
# Backend health
curl http://localhost:5000/health

# Frontend health
curl http://localhost:3000

# Database health
mongosh --eval "db.stats()"
```

#### Log Monitoring
```bash
# Backend logs
tail -f backend/logs/app.log

# System logs
journalctl -u your-service-name -f
```

#### Backup Strategy
```bash
# Database backup
mongodump --db enterprise-task-management --out /backup/$(date +%Y%m%d)

# Automated backup script
crontab -e
# Add: 0 2 * * * /path/to/backup-script.sh
```

## 📞 Support

### Getting Help
- **Documentation**: Check this guide first
- **API Docs**: Visit `/api/docs` endpoint
- **GitHub Issues**: Report bugs and feature requests
- **Community**: Join our Discord/Slack channel

### Useful Commands
```bash
# Check application status
npm run status

# Run tests
npm run test

# Lint code
npm run lint

# Format code
npm run format

# Generate API documentation
npm run docs:generate
```

---

**🎉 Congratulations!** Your Enterprise Task Management System is now ready for deployment. Remember to secure your environment variables and follow security best practices for production deployments.