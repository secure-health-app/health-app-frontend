FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /workspace/health-app-backend
COPY health-app-backend/pom.xml .
RUN mvn dependency:go-offline
COPY health-app-backend .
RUN mvn package -DskipTests

FROM eclipse-temurin:17-jdk
WORKDIR /workspace/health-app-backend
COPY --from=build /workspace/health-app-backend/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
