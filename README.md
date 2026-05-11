# Movie Watchlist Management System (MERN)

## Tech stack
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), REST APIs
- **Frontend**: React (Create React App)
- **Testing**: Postman collection included

## Project structure
- `backend/` — Express REST API + MongoDB
- `frontend/` — React UI
- `postman/` — Postman collection/environment

## Prerequisites
- Node.js + npm installed
- MongoDB running locally on `mongodb://127.0.0.1:27017`

## Backend setup (Express + MongoDB)
1. Create your env file:
   - Copy `backend/.env.example` to `backend/.env`
2. Install and run:

```bash
cd backend
npm install
npm run dev
```

The API will run at `http://localhost:5000`.

### API endpoints
- `GET /api/health`
- `GET /api/movies`
- `POST /api/movies`
- `GET /api/movies/:id`
- `PATCH /api/movies/:id`
- `DELETE /api/movies/:id`

## Frontend setup (React)

```bash
cd frontend
npm install
npm start
```

The UI will run at `http://localhost:3000`.

Notes:
- The frontend uses CRA’s `proxy` so requests to `/api/*` are forwarded to `http://localhost:5000`.

## Postman
- Import the collection: `postman/MovieWatchlist.postman_collection.json`
- (Optional) Import the environment: `postman/MovieWatchlist.postman_environment.json`
- Start by running **Health**, then **Movies - Create** (it will store `movieId` for the ID-based requests).
