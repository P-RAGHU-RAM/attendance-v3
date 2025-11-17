#!/bin/bash

# Attendance System V2 - Complete Docker & Jenkins Setup Script

set -e

echo "🚀 Starting Attendance System V2 Complete Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker found${NC}"

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker Compose found${NC}"

# Start the application stack
echo -e "\n${YELLOW}📦 Starting application stack...${NC}"
docker-compose up -d
echo -e "${GREEN}✅ Application stack started${NC}"

# Wait for MongoDB to be healthy
echo -e "\n${YELLOW}⏳ Waiting for MongoDB to be ready...${NC}"
for i in {1..30}; do
    if docker-compose exec -T db mongosh --eval "db.runCommand('ping')" &> /dev/null; then
        echo -e "${GREEN}✅ MongoDB is ready${NC}"
        break
    fi
    echo "Waiting... ($i/30)"
    sleep 2
done

# Seed the database
echo -e "\n${YELLOW}🌱 Seeding database...${NC}"
docker-compose exec -T app npm run seed
echo -e "${GREEN}✅ Database seeded${NC}"

# Show status
echo -e "\n${YELLOW}📊 Current status:${NC}"
docker-compose ps

# Show useful information
echo -e "\n${GREEN}✅ Setup Complete!${NC}"
echo -e "\n${YELLOW}📋 Useful Information:${NC}"
echo -e "  Application URL: http://localhost:3000"
echo -e "  Health Check: http://localhost:3000/health"
echo -e "  MongoDB: mongodb://root:password@localhost:27017/attendance_db_v2?authSource=admin"
echo -e "\n${YELLOW}To start Jenkins:${NC}"
echo -e "  docker-compose -f docker-compose.jenkins.yml up -d"
echo -e "  Then visit: http://localhost:8080"
echo -e "\n${YELLOW}To view logs:${NC}"
echo -e "  docker-compose logs -f"
echo -e "\n${YELLOW}To stop everything:${NC}"
echo -e "  docker-compose down"
