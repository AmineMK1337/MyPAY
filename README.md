# MyPay — Automated Payment Management Platform

MyPay is a web application for managing automatic payments (insurance, loans, leasing) with a unified dashboard, automatic payment scheduling, smart reminders, spending forecasts, and payment history.

**Tech Stack:** Angular 21 | Spring Boot 3.4 | MongoDB | JWT Auth

---

## Prerequisites

Ensure you have installed:
- **Java 17+** (tested with Java 25 LTS)
- **Maven 3.9+** 
- **Node.js 24+** and **npm 11+**
- **MongoDB** (running locally on port 27017)
- **Angular CLI 21+**

### Check Installations
```bash
java -version
mvn -version
node -v
npm -v
```

---

## Quick Start (Both Services)

Open **two separate terminals** and run:

### Terminal 1: Backend (Spring Boot on port 8088)
```bash
cd "c:\Users\Speeker\OneDrive - SUPCOM\Desktop\MyPAY\backend"
mvn spring-boot:run
```

### Terminal 2: Frontend (Angular on port 4200)
```bash
cd "c:\Users\Speeker\OneDrive - SUPCOM\Desktop\MyPAY\frontend"
npm install
ng serve --open
```

The frontend will open automatically at **http://localhost:4200**.

---

## Backend (Spring Boot)

### Commands

```bash
cd backend

# Compile only
mvn clean compile

# Run dev server (with hot reload)
mvn spring-boot:run

# Build JAR package
mvn clean package -DskipTests

# Run from JAR
java -jar target/mypay-backend-0.0.1-SNAPSHOT.jar

# Run tests
mvn test
```

### Server Details
- **URL:** http://localhost:8088
- **Database:** MongoDB (localhost:27017, database: `mypay`)
- **Config:** `backend/src/main/resources/application.yml`

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/health` | GET | Health check |
| `/api/auth/signup` | POST | Register new user |
| `/api/auth/login` | POST | Login & get JWT token |

### Example Requests

**Sign Up:**
```bash
curl -X POST http://localhost:8088/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jean",
    "lastName": "Dupont",
    "email": "jean@mypay.com",
    "password": "password123",
    "phone": "+216 12345678"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:8088/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean@mypay.com",
    "password": "password123"
  }'
```

**Health Check:**
```bash
curl http://localhost:8088/api/auth/health
```

---

## Frontend (Angular)

### Commands

```bash
cd frontend

# Install dependencies
npm install

# Run dev server (opens browser)
ng serve --open

# Run without opening browser
ng serve

# Build for production
ng build

# Run tests
ng test

# Lint code
ng lint
```

### Pages

| Route | Purpose |
|-------|---------|
| `/` | Landing page with features overview |
| `/signup` | User registration form |
| `/login` | User login form |
| `/dashboard` | Main dashboard (after login) |

### Features Implemented
- ✅ Landing page with hero section & features
- ✅ Sign up form with validation
- ✅ Login form with JWT storage
- ✅ Dashboard shell with stat cards
- ✅ Responsive design (dark mode, SCSS)
- ✅ CORS configured for backend

---

## Database (MongoDB)

### Connection
- **URI:** `mongodb://localhost:27017/mypay`
- **Database:** `mypay`

### Collections
- `users` — Registered users with encrypted passwords
- `contracts` — Payment contracts (insurance, loans, leasing)
- `payments` — Payment records

### Verify with MongoDB Compass
1. Open MongoDB Compass
2. Connection string: `mongodb://localhost:27017`
3. Connect and browse the `mypay` database

### Verify with Terminal
```bash
mongosh
use mypay
db.users.find()
```

---

## Project Structure

```
MyPAY/
├── backend/                              # Spring Boot Backend
│   ├── src/main/java/com/mypay/
│   │   ├── model/                        # Entities (User, Contract, Payment)
│   │   ├── repository/                   # MongoDB repositories
│   │   ├── service/                      # Business logic (AuthService)
│   │   ├── controller/                   # REST endpoints (AuthController)
│   │   ├── security/                     # JWT + Spring Security
│   │   ├── config/                       # SecurityConfig + CORS
│   │   └── MyPayApplication.java         # Main app class
│   ├── src/main/resources/
│   │   └── application.yml               # Configuration (DB, JWT, CORS)
│   └── pom.xml                           # Maven dependencies
│
├── frontend/                             # Angular Frontend
│   ├── src/app/
│   │   ├── pages/                        # Components (landing, login, signup, dashboard)
│   │   ├── services/                     # AuthService (HTTP calls)
│   │   ├── app.routes.ts                 # Routing
│   │   ├── app.ts                        # Root component
│   │   └── app.config.ts                 # App config
│   ├── src/styles.scss                   # Global styles
│   ├── package.json                      # npm dependencies
│   └── angular.json                      # Angular config
│
├── .gitignore                            # Git ignore rules
└── README.md                             # This file
```

---

## Features (Current)

### Done ✅
- User registration with validation
- User login with JWT authentication
- Password hashing (BCrypt)
- Landing page with hero section & features
- Sign up & login forms
- Dashboard shell
- MongoDB integration
- CORS configuration
- Health check endpoint

### ToDo 🔲
- Contract CRUD (add/edit/delete insurance, loans, leasing)
- Payment management (manual & automatic)
- Scheduler for automatic payments
- Email/SMS reminders (J-3, J-1 before deadline)
- Expense forecasting (monthly predictions)
- Payment history & analytics
- User profile management
- Auth guards & interceptors

---

## Environment Variables

Create `.env` file in backend (optional for future use):
```
MONGO_URI=mongodb://localhost:27017/mypay
JWT_SECRET=MyPaySuperSecretKeyForJWTTokenGeneration2026SecureEnough256Bits!!
JWT_EXPIRATION=86400000
```

---

## Troubleshooting

### Backend won't start
```bash
# Check if port 8088 is in use
netstat -an | findstr 8088

# Check if MongoDB is running
sc query MongoDB

# Rebuild from scratch
mvn clean install
mvn spring-boot:run
```

### Frontend shows blank page
```bash
# Clear cache & reinstall
rm -r node_modules package-lock.json
npm install
ng serve
```

### MongoDB connection fails
```bash
# Start MongoDB service
net start MongoDB

# Verify connection
mongosh
```

### CORS errors
- Backend CORS is configured for `http://localhost:4200`
- If you change the frontend port, update `application.yml`

---

## Git Workflow

```bash
# Check status
git status

# Stage changes
git add .

# Commit
git commit -m "Your message"

# Push to GitHub
git push origin main

# Pull latest
git pull origin main
```

---

## Useful Links

- **Project:** http://localhost:4200
- **Backend API:** http://localhost:8088
- **MongoDB:** mongodb://localhost:27017/mypay
- **GitHub:** https://github.com/AmineMK1337/MyPAY

---

## License

MIT License — feel free to use for personal projects.

---

**Last Updated:** February 19, 2026  
**Author:** MyPay Development Team
