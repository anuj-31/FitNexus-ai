# 🚀 FitNexus AI

> **AI-powered fitness tracking platform built using Microservices, Spring Boot, Kafka, Keycloak, React, and Google Gemini AI.**

FitNexus AI is a full-stack, microservices-based fitness platform that allows users to securely authenticate, track fitness activities, view their activity history, and receive AI-powered fitness recommendations.

The project is designed using a **distributed microservices architecture** where each service has a specific responsibility. Communication between services is handled through **REST APIs, service discovery, and event-driven communication using Apache Kafka**.

---

## 📌 Features

- 🔐 Secure authentication using **Keycloak**
- 🔑 OAuth 2.0 + OpenID Connect authentication
- 🛡️ JWT-based API authorization
- 🌐 Centralized API Gateway
- 🔎 Service discovery using **Netflix Eureka**
- ⚙️ Centralized configuration using **Spring Cloud Config**
- 🏃 Create and track fitness activities
- 📊 View activity history
- 🔍 View individual activity details
- ⚡ Event-driven communication using **Apache Kafka**
- 🤖 AI-powered fitness recommendations using **Google Gemini**
- 🗄️ PostgreSQL for user-related data
- 🍃 MongoDB for activity and AI-related data
- ⚛️ React-based frontend
- 📡 RESTful APIs
- 🔄 Asynchronous AI processing
- 🧩 Independent and loosely coupled microservices

---

# 🏗️ System Architecture

```text
                         ┌─────────────────────────┐
                         │      React Frontend      │
                         │       Vite + MUI         │
                         │       :5173              │
                         └────────────┬────────────┘
                                      │
                                      │ OAuth 2.0 / OIDC
                                      ▼
                         ┌─────────────────────────┐
                         │        Keycloak          │
                         │         :8181            │
                         │ Authentication / JWT     │
                         └────────────┬────────────┘
                                      │
                                      │ JWT Access Token
                                      ▼
                         ┌─────────────────────────┐
                         │       API Gateway        │
                         │         :8080            │
                         │  Spring Cloud Gateway    │
                         └────────────┬────────────┘
                                      │
                  ┌───────────────────┼───────────────────┐
                  │                   │                   │
                  ▼                   ▼                   ▼
        ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
        │   User Service  │ │ Activity Service│ │   AI Service    │
        │      :8081      │ │      :8082      │ │      :8083      │
        │                 │ │                 │ │                 │
        │   Spring Boot   │ │   Spring Boot   │ │   Spring Boot   │
        │   PostgreSQL    │ │    MongoDB      │ │    MongoDB      │
        └────────┬────────┘ └────────┬────────┘ └────────┬────────┘
                 │                   │                   │
                 ▼                   │                   │
          ┌──────────────┐           │                   │
          │ PostgreSQL   │           │                   │
          └──────────────┘           │                   │
                                     │
                                     │ Activity Event
                                     ▼
                              ┌───────────────┐
                              │ Apache Kafka  │
                              │               │
                              │activity-events│
                              └───────┬───────┘
                                      │
                                      ▼
                              ┌───────────────┐
                              │   AI Service  │
                              │ Kafka Consumer │
                              └───────┬───────┘
                                      │
                                      ▼
                              ┌───────────────┐
                              │ Google Gemini │
                              │      AI       │
                              └───────┬───────┘
                                      │
                                      ▼
                              ┌───────────────┐
                              │    MongoDB    │
                              │ AI Recommendation│
                              └───────────────┘


              ┌─────────────────────────────┐
              │       Eureka Server        │
              │      Service Discovery     │
              │          :8761             │
              └──────────────┬──────────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
           Gateway         User          Activity
                             │              │
                             └──────┬───────┘
                                    ▼
                                  AI


              ┌─────────────────────────────┐
              │      Config Server :8888   │
              │  Centralized Configuration │
              └──────────────┬──────────────┘
                             │
                 ┌───────────┼───────────┐
                 ▼           ▼           ▼
              Gateway       User      Activity
                                         │
                                         ▼
                                      AI Service


| Service          |   Port | Responsibility                   | Database          |
| ---------------- | -----: | -------------------------------- | ----------------- |
| API Gateway      | `8080` | Routing, security and CORS       | —                 |
| User Service     | `8081` | User management and validation   | PostgreSQL        |
| Activity Service | `8082` | Fitness activity management      | MongoDB           |
| AI Service       | `8083` | AI recommendation generation     | MongoDB           |
| Eureka Server    | `8761` | Service discovery                | —                 |
| Config Server    | `8888` | Centralized configuration        | Config Repository |
| Keycloak         | `8181` | Authentication and authorization | Keycloak DB       |




Authentication & Authorization

FitNexus AI uses Keycloak as the centralized identity provider.

The application follows:

OAuth 2.0
OpenID Connect
Authorization Code Flow
PKCE
JWT access tokens
Authentication Flow
User
 │
 │ Click Login
 ▼
React Frontend
 │
 │ Authorization Request
 ▼
Keycloak
 │
 │ User Authentication
 ▼
Keycloak
 │
 │ Authorization Code
 ▼
React Frontend
 │
 │ Code + PKCE Verifier
 ▼
Keycloak Token Endpoint
 │
 │ Access Token
 ▼
React Frontend
 │
 │ Authorization: Bearer <JWT>
 ▼
API Gateway
 │
 │ JWT Validation
 ▼
Microservice

The frontend does not directly authenticate against the application services.

Instead, Keycloak handles authentication, while the API Gateway validates the JWT before forwarding requests to protected microservices.

🛡️ API Gateway

The API Gateway acts as the single entry point for frontend requests.

Example:

Frontend
   │
   ▼
localhost:8080
   │
   ├── /api/users/**
   │        ↓
   │    User Service
   │
   ├── /api/activities/**
   │        ↓
   │    Activity Service
   │
   └── /api/recommendations/**
            ↓
        AI Service

Responsibilities include:

Request routing
JWT validation
CORS configuration
Authentication enforcement
Service discovery integration
Hiding internal service endpoints from the frontend
🔎 Service Discovery

The project uses Netflix Eureka for service discovery.

Instead of hardcoding every service's host and port, services register themselves with Eureka.

                    Eureka Server
                       :8761
                          │
          ┌───────────────┼────────────────┐
          ▼               ▼                ▼
    User Service    Activity Service    AI Service
       :8081             :8082             :8083

This makes the architecture more flexible because services can discover each other dynamically.

⚡ Event-Driven Architecture

One of the main features of FitNexus AI is asynchronous communication between the Activity Service and AI Service.

When a user creates an activity:

                    POST Activity
                         │
                         ▼
                 Activity Service
                         │
                  Save Activity
                         │
                         ▼
                      MongoDB
                         │
                         │ Publish Event
                         ▼
                    Apache Kafka
                         │
                   activity-events
                         │
                         ▼
                    AI Service
                         │
                  Consume Event
                         │
                         ▼
                  Google Gemini
                         │
                         ▼
               AI Recommendation
                         │
                         ▼
                      MongoDB

The Activity Service does not need to wait for the AI Service to generate a recommendation.

This provides:

Loose coupling
Asynchronous processing
Better scalability
Improved fault isolation
Independent service processing
📡 Kafka Producer & Consumer
Activity Service

Acts as a Kafka producer.

After successfully saving an activity:

Activity
   ↓
MongoDB
   ↓
Kafka Producer
   ↓
activity-events
AI Service

Acts as a Kafka consumer.

activity-events
      ↓
Kafka Consumer
      ↓
AI Processing
      ↓
Gemini API
      ↓
Recommendation
      ↓
MongoDB
🤖 AI Recommendation System

FitNexus AI integrates Google Gemini to generate personalized fitness recommendations.

For example:

Activity Data

Type       : RUNNING
Duration   : 45 minutes
Calories   : 420

             ↓

        Google Gemini

             ↓

AI Recommendation

• Maintain proper hydration
• Include sufficient recovery
• Gradually increase workout intensity
• Maintain adequate rest

The recommendation is generated asynchronously after the activity event is consumed by the AI Service.

🗄️ Database Architecture

The project follows a service-oriented database architecture.

PostgreSQL

Used by the User Service.

User Service
     │
     ▼
PostgreSQL
     │
     └── User/Profile Data
MongoDB

Used by the Activity and AI services.

Activity Service ──────► MongoDB
                            │
                            │
AI Service ────────────────►│

Using different databases allows each service to choose a persistence technology appropriate to its requirements.

🔄 Complete Request Flow

When a user adds a fitness activity:

React Frontend
      │
      │ POST /api/activities
      │ + JWT
      ▼
API Gateway
      │
      │ Validate JWT
      ▼
Activity Service
      │
      ├── Validate User
      │
      ├── Save Activity
      │
      └── Publish Kafka Event
                    │
                    ▼
                 Kafka
                    │
                    ▼
               AI Service
                    │
                    ▼
              Gemini API
                    │
                    ▼
          AI Recommendation
                    │
                    ▼
                MongoDB
🛠️ Technology Stack
Frontend
React.js
Vite
Material UI
Redux
Axios
React Router
react-oauth2-code-pkce
Backend
Java 17
Spring Boot
Spring Security
Spring Cloud Gateway
Spring Cloud Config
Spring Cloud Netflix Eureka
Spring Data MongoDB
Spring Data JPA
Maven
Lombok
Authentication
Keycloak
OAuth 2.0
OpenID Connect
JWT
PKCE
Messaging
Apache Kafka
Kafka Producer
Kafka Consumer
Event-driven architecture
Databases
PostgreSQL
MongoDB
AI
Google Gemini API
📂 Project Structure
FitNexus-ai/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── store/
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
├── gateway-service/
│   ├── src/
│   └── pom.xml
│
├── user-service/
│   ├── src/
│   └── pom.xml
│
├── activity-service/
│   ├── src/
│   └── pom.xml
│
├── ai-service/
│   ├── src/
│   └── pom.xml
│
├── eureka-server/
│   ├── src/
│   └── pom.xml
│
├── config-server/
│   ├── src/
│   └── pom.xml
│
└── README.md
📡 API Endpoints

All protected APIs are accessed through the API Gateway.

Activity APIs
Create Activity
POST /api/activities

Creates a new fitness activity.

Get Activities
GET /api/activities

Returns activities belonging to the authenticated user.

Get Activity
GET /api/activities/{activityId}

Returns details of a specific activity.

📋 Example Activity Request
{
  "type": "RUNNING",
  "duration": 45,
  "caloriesBurned": 420,
  "additionalMetrics": {
    "distance": 5.2,
    "pace": 8.6
  }
}
⚙️ Configuration

Sensitive configuration values should be provided using environment variables or external configuration.

Example:

# PostgreSQL
spring.datasource.url=${DATABASE_URL}
spring.datasource.username=${DATABASE_USERNAME}
spring.datasource.password=${DATABASE_PASSWORD}

# MongoDB
spring.data.mongodb.uri=${MONGODB_URI}

# Kafka
spring.kafka.bootstrap-servers=${KAFKA_BOOTSTRAP_SERVERS}

# Keycloak
spring.security.oauth2.resourceserver.jwt.jwk-set-uri=${KEYCLOAK_JWK_URI}

# Gemini
gemini.api.key=${GEMINI_API_KEY}

⚠️ Never commit API keys, passwords, database credentials, or other secrets to GitHub.

🔑 Keycloak Setup

Create a realm:

fitness-app

Create a client:

fitness-app

Configure the frontend redirect URI:

http://localhost:5173/*

Configure Web Origins:

http://localhost:5173

The frontend uses:

Authorization Endpoint
Token Endpoint
Client ID
Redirect URI
Scopes
PKCE
🚀 Local Setup
Prerequisites

Make sure the following are installed:

Java 17+
Node.js
npm
Maven
PostgreSQL
MongoDB
Apache Kafka
Keycloak
1️⃣ Start PostgreSQL

Start PostgreSQL and make sure the configured database is available.

2️⃣ Start MongoDB

Start MongoDB locally.

3️⃣ Start Kafka

Start the Kafka broker and make sure the configured topic is available:

activity-events
4️⃣ Start Keycloak

Start Keycloak on:

http://localhost:8181

Configure:

Realm      : fitness-app
Client     : fitness-app
Frontend   : http://localhost:5173
5️⃣ Start Config Server
cd config-server
mvn spring-boot:run

Config Server:

http://localhost:8888
6️⃣ Start Eureka Server
cd eureka-server
mvn spring-boot:run

Eureka Dashboard:

http://localhost:8761
7️⃣ Start User Service
cd user-service
mvn spring-boot:run

Runs on:

http://localhost:8081
8️⃣ Start Activity Service
cd activity-service
mvn spring-boot:run

Runs on:

http://localhost:8082
9️⃣ Start AI Service
cd ai-service
mvn spring-boot:run

Runs on:

http://localhost:8083
🔟 Start API Gateway
cd gateway-service
mvn spring-boot:run

Gateway:

http://localhost:8080
1️⃣1️⃣ Start Frontend
cd frontend
npm install
npm run dev

Frontend:

http://localhost:5173
🧪 Testing

The APIs can be tested using:

Postman
Browser
React Frontend

Example request:

POST http://localhost:8080/api/activities
Authorization: Bearer <JWT>
Content-Type: application/json

Example body:

{
  "type": "RUNNING",
  "duration": 30,
  "caloriesBurned": 300
}
🔒 Security Considerations

The project implements several security mechanisms:

Authentication

Keycloak handles user authentication.

Authorization

The API Gateway validates JWT access tokens.

Protected APIs

Microservice APIs require authentication.

Secret Management

Sensitive values are loaded from environment variables/configuration rather than hardcoded.

CORS

The gateway manages cross-origin requests from the React frontend.

📈 Scalability

The architecture is designed so that services can be scaled independently.

For example:

                 API Gateway
                      │
             ┌────────┼────────┐
             ▼        ▼        ▼
          Activity Activity Activity
          Service   Service   Service
             │
             ▼
           Kafka
             │
       ┌─────┼─────┐
       ▼     ▼     ▼
      AI    AI    AI
   Service Service Service

Kafka allows multiple AI Service consumers to process events as the workload increases.

💡 Why Kafka Instead of Direct REST Communication?

A direct approach would be:

Activity Service
       │
       │ REST
       ▼
   AI Service

This creates stronger coupling.

FitNexus AI uses:

Activity Service
       │
       ▼
     Kafka
       │
       ▼
   AI Service

Benefits:

Asynchronous processing
Loose coupling
Better fault isolation
Independent scaling
Event replay capability
Better handling of temporary AI-service failures
🧠 Key Engineering Concepts

This project demonstrates practical implementation of:

Microservices Architecture
API Gateway Pattern
Service Discovery
Centralized Configuration
OAuth 2.0
OpenID Connect
JWT Authentication
PKCE
REST API Design
Event-Driven Architecture
Kafka Producer/Consumer
Asynchronous Processing
Database-per-Service approach
PostgreSQL
MongoDB
AI/LLM Integration
React + Spring Boot integration
CORS handling
Environment-based configuration
🔮 Future Improvements
📱 Mobile application
📊 Advanced fitness analytics
🏆 Achievement and leaderboard system
🔔 Real-time notifications
🧠 Improved AI recommendation engine
🐳 Docker and Docker Compose setup
☁️ Cloud deployment
📊 Prometheus + Grafana monitoring
🔍 Distributed tracing using OpenTelemetry
🔄 Kafka retry mechanism and Dead Letter Topic
🚀 CI/CD pipeline
📈 Centralized logging
👨‍💻 Author
Anuj Kumar

B.Tech — Metallurgical & Materials Engineering
National Institute of Technology, Jamshedpur

⭐ Project Overview

FitNexus AI brings together modern backend and frontend technologies into a distributed fitness platform.

The overall architecture can be summarized as:

                    ┌─────────────┐
                    │    React    │
                    │  Frontend   │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Keycloak   │
                    │ OAuth / OIDC│
                    └──────┬──────┘
                           │ JWT
                           ▼
                    ┌─────────────┐
                    │ API Gateway │
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
     User Service    Activity Service    AI Service
          │                │                ▲
          ▼                ▼                │
     PostgreSQL         MongoDB             │
                           │                │
                           ▼                │
                        Kafka ──────────────┘
                           │
                           ▼
                      Gemini AI
                           │
                           ▼
                       MongoDB

FitNexus AI demonstrates how authentication, microservices, API gateways, service discovery, event-driven communication, multiple databases, and generative AI can be integrated into a production-style full-stack application.
