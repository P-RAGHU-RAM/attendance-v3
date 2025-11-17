# Attendance System V2 - Docker & Jenkins Setup

## Quick Start

### Prerequisites
- Docker
- Docker Compose
- Git

### Run the Application

```bash
# Start the full stack (app + MongoDB)
docker-compose up -d

# Seed the database with initial data
docker-compose exec app npm run seed

# View logs
docker-compose logs -f

# Stop the stack
docker-compose down
```

### Available Endpoints

- **Health Check**: `GET http://localhost:3000/health`
- **Auth Routes**: `POST http://localhost:3000/api/auth/send-otp`
- **Auth Routes**: `POST http://localhost:3000/api/auth/verify-otp`
- **Subject Routes**: `GET http://localhost:3000/api/subjects`
- **Attendance Routes**: `POST http://localhost:3000/api/attendance/start`
- **Attendance Routes**: `POST http://localhost:3000/api/attendance/submit`

### MongoDB Access

```bash
# Connect to MongoDB directly
docker-compose exec db mongosh -u root -p password

# Or via connection string
mongodb://root:password@localhost:27017/attendance_db_v2?authSource=admin
```

## Jenkins CI/CD Setup

### Start Jenkins

```bash
# Using separate Jenkins compose file
docker-compose -f docker-compose.jenkins.yml up -d

# Or add Jenkins to main compose file and run
docker-compose up -d
```

### Access Jenkins

1. Navigate to `http://localhost:8080`
2. Default credentials:
   - Username: `admin`
   - Password: `admin123`
3. Install recommended plugins
4. Create a new Pipeline job
5. Point it to this repository with Jenkinsfile

### Jenkins Pipeline Stages

1. **Checkout** - Pulls code from repository
2. **Install Dependencies** - Runs `npm install`
3. **Lint** - Code quality checks
4. **Test** - Unit and integration tests
5. **Build Docker Image** - Creates Docker image
6. **Push Docker Image** - Pushes to registry (requires authentication)
7. **Deploy with Docker Compose** - Deploys the stack
8. **Verify Deployment** - Health checks

### Configure Jenkins with GitHub

1. Install GitHub plugin in Jenkins
2. Go to Credentials → System → Global credentials
3. Add credentials for GitHub (Personal Access Token)
4. Create new Pipeline job
5. Under "Pipeline script from SCM":
   - SCM: Git
   - Repository URL: `https://github.com/P-RAGHU-RAM/attendance-v3.git`
   - Branches to build: `*/master`
   - Script path: `Jenkinsfile`

## Docker Commands

```bash
# Build backend image
docker build -t attendance-backend:latest ./backend

# Run container directly
docker run -p 3000:3000 --env-file ./backend/.env attendance-backend:latest

# View running containers
docker ps

# View logs
docker logs <container-id>

# Stop all containers
docker stop $(docker ps -q)

# Remove all containers
docker rm $(docker ps -aq)
```

## Environment Variables

Configure `.env` file in `backend/` directory:

```env
DB_URL=mongodb://root:password@db:27017/attendance_db_v2?authSource=admin
JWT_SECRET=YOUR_V2_SECRET_KEY_HERE
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

## Troubleshooting

### MongoDB Connection Failed
- Ensure `db` service is healthy: `docker-compose ps`
- Check MongoDB logs: `docker-compose logs db`

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Find process using port 27017
lsof -i :27017

# Kill process (if necessary)
kill -9 <PID>
```

### Docker Compose Build Issues
```bash
# Rebuild without cache
docker-compose build --no-cache

# Remove all unused volumes
docker volume prune

# Full cleanup
docker-compose down -v
```

## Production Deployment

For production, consider:
1. Using environment-specific compose files
2. Setting up Docker registry (Docker Hub, ECR, GCR)
3. Implementing reverse proxy (Nginx)
4. Adding SSL/TLS certificates
5. Setting resource limits in docker-compose.yml
6. Using secrets management for sensitive data
7. Monitoring with ELK or similar stack
