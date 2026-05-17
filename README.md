# Movie Watchlist Management System

## Problem Description

Movie enthusiasts frequently struggle to keep track of films they want to watch, are currently watching, or have already completed across scattered streaming platforms. Relying on physical notes or mental lists often leads to forgotten titles, lack of organization, and an inability to track viewing history. There is a clear need for a centralized, private, and structured platform where users can easily curate and manage their personal movie collections.

## Proposed Solution

The Movie Watchlist Management System is a full-stack web application designed to help users streamline their movie-tracking experience. Featuring a secure Node.js and Express REST API backend alongside an interactive React frontend, the platform allows users to create personalized profiles. Once authenticated, users can create multiple independent watchlists, add specific movies to those lists, and perform full CRUD (Create, Read, Update, Delete) operations to customize their viewing lists dynamically.

## Features

- **Secure User Authentication** — JWT-based registration, login, and protected route management
- **Multiple Watchlists** — Create and organize different lists (e.g., "Sci-Fi Favorites", "Weekend Binge", "To Watch")
- **Comprehensive Movie Management** — Add, view, update, and delete movies within specific watchlists
- **Movie Status Tracking** — Mark titles as `planned`, `watching`, or `completed`
- **Search & Filter** — Filter movies by status or search by title within a list
- **System Health Tracking** — Built-in API health check endpoint for monitoring

## Technologies Used

| Layer | Stack |
|-------|-------|
| **Backend** | Node.js, Express.js, REST APIs |
| **Frontend** | React (Create React App) |
| **Database** | MongoDB, Mongoose ODM |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs |
| **Dev Tools** | nodemon, dotenv, cors |

## API Endpoints

Base URL: `http://localhost:5000`

All successful responses wrap data in `{ "data": ... }`. Errors return `{ "error": { "message": "..." } }`.

### Public Endpoints

#### `GET /api/health`

Check that the API is running.

**Example request:**
```bash
curl http://localhost:5000/api/health
```

**Example response:**
```json
{ "ok": true }
```

---

#### `POST /api/auth/register`

Create a new account. Returns a JWT and creates a default watchlist named "My Watchlist".

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "displayName": "Cinephile"
}
```

**Example request:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"user@example.com\",\"password\":\"securePassword123\",\"displayName\":\"Cinephile\"}"
```

**Example response (201):**
```json
{
  "data": {
    "user": {
      "_id": "665f1a2b3c4d5e6f7a8b9c0d",
      "email": "user@example.com",
      "displayName": "Cinephile",
      "createdAt": "2026-05-17T12:00:00.000Z",
      "updatedAt": "2026-05-17T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### `POST /api/auth/login`

Sign in with email and password.

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Example request:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"user@example.com\",\"password\":\"securePassword123\"}"
```

**Example response (200):**
```json
{
  "data": {
    "user": { "_id": "...", "email": "user@example.com", "displayName": "Cinephile" },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Protected Endpoints

Include the JWT in every request:

```
Authorization: Bearer <your-token>
```

#### `GET /api/auth/me`

Return the currently authenticated user.

**Example request:**
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <your-token>"
```

---

#### Watchlists

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/lists` | List all watchlists for the user |
| `POST` | `/api/lists` | Create a new watchlist |
| `GET` | `/api/lists/:listId` | Get one watchlist |
| `PATCH` | `/api/lists/:listId` | Update a watchlist |
| `DELETE` | `/api/lists/:listId` | Delete a watchlist and its movies |

**Create watchlist — request body:**
```json
{
  "name": "Weekend Binge",
  "description": "Movies to watch this weekend"
}
```

**Example request:**
```bash
curl -X POST http://localhost:5000/api/lists \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d "{\"name\":\"Weekend Binge\",\"description\":\"Movies to watch this weekend\"}"
```

**Example response (201):**
```json
{
  "data": {
    "_id": "665f1a2b3c4d5e6f7a8b9c0e",
    "user": "665f1a2b3c4d5e6f7a8b9c0d",
    "name": "Weekend Binge",
    "description": "Movies to watch this weekend",
    "createdAt": "2026-05-17T12:00:00.000Z",
    "updatedAt": "2026-05-17T12:00:00.000Z"
  }
}
```

---

#### Movies (within a watchlist)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/lists/:listId/movies` | List movies (optional query: `?status=planned&q=inception`) |
| `POST` | `/api/lists/:listId/movies` | Add a movie |
| `GET` | `/api/lists/:listId/movies/:id` | Get one movie |
| `PATCH` | `/api/lists/:listId/movies/:id` | Update a movie |
| `DELETE` | `/api/lists/:listId/movies/:id` | Delete a movie |

**Add movie — request body:**
```json
{
  "title": "Inception",
  "year": 2010,
  "genre": "Sci-Fi",
  "rating": 9,
  "status": "planned",
  "notes": "Rewatch with friends"
}
```

`status` must be one of: `planned`, `watching`, `completed` (defaults to `planned`).

**Example request:**
```bash
curl -X POST http://localhost:5000/api/lists/<listId>/movies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d "{\"title\":\"Inception\",\"year\":2010,\"genre\":\"Sci-Fi\",\"rating\":9,\"status\":\"planned\"}"
```

**Example response (201):**
```json
{
  "data": {
    "_id": "665f1a2b3c4d5e6f7a8b9c0f",
    "list": "665f1a2b3c4d5e6f7a8b9c0e",
    "title": "Inception",
    "year": 2010,
    "genre": "Sci-Fi",
    "rating": 9,
    "status": "planned",
    "notes": "",
    "createdAt": "2026-05-17T12:00:00.000Z",
    "updatedAt": "2026-05-17T12:00:00.000Z"
  }
}
```

## Setup Instructions

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended) with npm
- [MongoDB](https://www.mongodb.com/) running locally at `mongodb://127.0.0.1:27017`

### 1. Clone the repository

```bash
git clone <repository-url>
cd Movie_Watchlist_Management_System
```

### 2. Configure the backend environment

Copy the example environment file and edit the values:

```bash
cp backend/.env.example backend/.env
```

Set these variables in `backend/.env`:

| Variable | Description |
|----------|-------------|
| `PORT` | API port (default: `5000`) |
| `MONGODB_URI` | MongoDB connection string |
| `CORS_ORIGIN` | Frontend URL (default: `http://localhost:3000`) |
| `JWT_SECRET` | Long random string for signing tokens |
| `JWT_EXPIRES_IN` | Token lifetime (default: `7d`) |

### 3. Install dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

## How to Run the Project

Start MongoDB, then run the backend and frontend in separate terminals.

### Backend (API)

```bash
cd backend
npm run dev
```

The API runs at **http://localhost:5000**.

For production-style startup without auto-reload:

```bash
npm start
```

### Frontend (React UI)

```bash
cd frontend
npm start
```

The UI runs at **http://localhost:3000** and proxies API requests to the backend via the `proxy` setting in `frontend/package.json`.

### Verify the stack

1. Open **http://localhost:5000/api/health** — you should see `{ "ok": true }`.
2. Register or log in through the UI or via the `/api/auth/register` and `/api/auth/login` endpoints.
3. Use the returned JWT to call protected list and movie endpoints.


