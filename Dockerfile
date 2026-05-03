# Build Stage
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn clean package -DskipTests

# Run Stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
EXPOSE 8080

COPY --from=build /app/target/team-task-manager-1.0.0.jar app.jar

CMD ["java", "-jar", "app.jar"]