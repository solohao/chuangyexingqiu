# Multi-stage build for startup-planet

# Stage 1: Build frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build backend
FROM openjdk:17-jdk-slim AS backend-builder
WORKDIR /app/backend
COPY backend/ ./
RUN ./mvnw clean package -DskipTests

# Stage 3: Production image
FROM openjdk:17-jre-slim
WORKDIR /app

# Copy backend jar
COPY --from=backend-builder /app/backend/target/*.jar app.jar

# Copy frontend build
COPY --from=frontend-builder /app/frontend/dist /app/static

# Expose ports
EXPOSE 8080

# Run application
CMD ["java", "-jar", "app.jar"]