# -------------------------------------------------------------------
# Stage 1: Build JAR using Maven
# -------------------------------------------------------------------
FROM maven:3.9.8-eclipse-temurin-17-alpine AS builder

WORKDIR /build

# Cache dependencies first
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build
COPY src ./src
RUN mvn clean package -DskipTests

# -------------------------------------------------------------------
# Stage 2: Minimal Runtime Container
# -------------------------------------------------------------------
FROM eclipse-temurin:17-jre-alpine

LABEL maintainer="Hospital Management System Team"
LABEL description="Hospital Management System Spring Boot REST API"

WORKDIR /app

# Install curl/wget for healthchecks and security updates
RUN apk --no-cache add curl tzdata && \
    addgroup -S hmsgroup && adduser -S hmsuser -G hmsgroup

# Set timezone
ENV TZ=UTC

# Copy jar from builder stage
COPY --from=builder /build/target/hospital-management-system-*.jar app.jar

# Run as non-privileged user for container security
USER hmsuser:hmsgroup

EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
