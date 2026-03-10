# MyPay

This README contains only the essentials: how to run the project and how to configure MongoDB.

## 1) Run Commands

## Prerequisites
- Java 17+
- Maven 3.9+
- Node.js + npm
- MongoDB running locally

## First time only

### Backend
```bash
cd backend
mvn clean install
```

### Frontend
```bash
cd frontend
npm install
```

## Start the app (every time)

### Step 1: Start MongoDB
Windows service:
```bash
net start MongoDB
```

### Step 2: Start backend (port 8088)
```bash
cd backend
mvn spring-boot:run
```

### Step 3: Start frontend (port 4200)
```bash
cd frontend
npx ng serve --open
```

## URLs
- Frontend: `http://localhost:4200`
- Backend: `http://localhost:8088`
- Health check: `http://localhost:8088/api/auth/health`

## 2) Database Configuration (MongoDB)

Backend config file:
- `backend/src/main/resources/application.yml`

Use these values:
```yaml
spring:
  data:
    mongodb:
      uri: mongodb://localhost:27017/mypay
```

Database used by the app:
- Database name: `mypay`

Quick verification:
```bash
mongosh
use mypay
show collections
```

## 3) Folder Architecture

```text
MyPAY/
├── backend/
│   ├── pom.xml
│   ├── start-backend.ps1
│   └── src/
│       └── main/
│           ├── java/com/mypay/
│           │   ├── MyPayApplication.java
│           │   ├── config/
│           │   ├── controller/
│           │   ├── dto/
│           │   ├── model/
│           │   ├── repository/
│           │   ├── security/
│           │   └── service/
│           └── resources/
│               └── application.yml
└── frontend/
  ├── angular.json
  ├── package.json
  ├── tsconfig.json
  ├── public/
  └── src/
    ├── index.html
    ├── main.ts
    ├── styles.scss
    └── app/
      ├── app.config.ts
      ├── app.routes.ts
      ├── pages/
      │   ├── add-contract/
      │   ├── dashboard/
      │   ├── landing/
      │   ├── login/
      │   ├── payment/
      │   ├── profile/
      │   └── signup/
      └── services/
```