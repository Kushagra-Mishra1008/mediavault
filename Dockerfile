# Stage 1: build. eclipse-temurin gives us a real JDK - no need for a
# separate "maven" base image, since your project already ships its own
# Maven wrapper (mvnw) that downloads the exact Maven version it needs.
FROM eclipse-temurin:25-jdk AS build
WORKDIR /app

# Copy just the wrapper + pom.xml first, not the whole source tree yet.
# Docker caches each layer - as long as pom.xml doesn't change, this
# dependency-download layer gets reused on future builds instead of
# re-downloading every dependency from scratch every single deploy.
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline

# NOW copy the actual source and build - this layer invalidates on every
# code change, but the dependency layer above stays cached.
COPY src ./src
RUN ./mvnw clean package -DskipTests

# Stage 2: runtime. jre, not jdk - we don't need a compiler in the final
# image, just enough to RUN an already-compiled jar. Meaningfully smaller
# image as a result.
FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=build /app/target/mediavault-0.0.1-SNAPSHOT.jar app.jar

# Render sets its own PORT env var at runtime - your application.properties
# already reads server.port=${PORT:8080}, so nothing extra needed here,
# Spring Boot picks it up automatically once the container starts.
ENTRYPOINT ["java", "-jar", "app.jar"]