# Taskify

A full-stack MERN task manager demonstrating REST API development with Express.js, API testing with Postman, and a React interface that reads and writes data through the API.

## Features

- Create an account and sign in with JWT bearer-token authentication.
- Store users and tasks in MongoDB; passwords are hashed with bcrypt.
- Create, view, edit, complete, and delete personal tasks.
- Organize tasks by to-do, in-progress, and completed status.
- Set low, medium, or high priority, a due date, description, and comma-separated tags.
- Search tasks and see completion progress.
- Enforce per-user task ownership on every task endpoint.
- Responsive React dashboard, loading and empty states, and clear API error feedback.
- Helmet security headers, authentication rate limiting, request validation, and centralized API errors.

## Project structure

```text
Exp9/
├── client/
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── api/client.js
│       ├── components/TaskCard.jsx
│       ├── components/TaskModal.jsx
│       ├── context/AuthContext.jsx
│       ├── pages/AuthPage.jsx
│       ├── pages/Dashboard.jsx
│       ├── App.jsx
│       ├── main.jsx
│       └── styles.css
├── postman/Taskify.postman_collection.json
├── server/
│   ├── .env.example
│   └── src/
│       ├── config/db.js
│       ├── controllers/authController.js
│       ├── controllers/taskController.js
│       ├── middleware/auth.js
│       ├── middleware/errorHandler.js
│       ├── models/Task.js
│       ├── models/User.js
│       ├── routes/authRoutes.js
│       ├── routes/taskRoutes.js
│       ├── utils/asyncHandler.js
│       ├── app.js
│       └── server.js
├── package.json
└── README.md
```

## Requirements

- Node.js 18 or newer and npm.
- MongoDB running locally, or a MongoDB Atlas connection string.

## Run locally

1. Create `server/.env` by copying `server/.env.example`. Set `MONGODB_URI` to your MongoDB connection string and replace `JWT_SECRET` with a long, private random value.
2. Install dependencies from the project root:

   ```bash
   npm install
   ```

3. Start MongoDB if using a local database.
4. Start both the API (`http://localhost:5000`) and React app (`http://localhost:5173`):

   ```bash
   npm run dev
   ```

5. Open `http://localhost:5173` and create an account. Each account sees only its own tasks.

The client development server proxies `/api` requests to the Express API. For a different frontend origin, update `CLIENT_ORIGIN` in `server/.env`.

## Deploy (Firebase Hosting + Render)

### 1. Deploy the API to Render

1. Create or select a Firebase project first so you know its project ID for the API's allowed origins.
2. Push this repository to GitHub and create a Render **Blueprint** from it. Render will use [`render.yaml`](./render.yaml) to create the API service from the `server` directory.
3. When prompted, provide:
   - `MONGODB_URI`: your MongoDB Atlas connection string.
   - `CLIENT_ORIGIN`: the Firebase Hosting origin(s), comma-separated, for example `https://your-project-id.web.app,https://your-project-id.firebaseapp.com`. Add any custom domain origins here too.
   - Render generates `JWT_SECRET` for the service. Keep it private.
4. Configure MongoDB Atlas Network Access to allow connections from your Render service, preferably by allowlisting the service's outbound IP addresses when available.
5. Wait for the service deploy to finish and verify `https://your-render-service.onrender.com/api/health` returns a JSON status of `ok`.

### 2. Deploy the client to Firebase Hosting

1. Install and sign in to the Firebase CLI, then select the Firebase project:

   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use --add
   ```

2. Copy `client/.env.production.example` to `client/.env.production` and set `VITE_API_URL` to your Render API URL, including `/api`, for example `https://your-render-service.onrender.com/api`.
3. Build and deploy Firebase Hosting from the repository root:

   ```bash
   npm --prefix client run build
   firebase deploy --only hosting
   ```

   [`firebase.json`](./firebase.json) publishes `client/dist` and routes client-side paths such as `/login` and `/register` to the React app.
4. Open your Firebase Hosting URL and test registration, login, and task operations. If you add a custom domain, add its exact origin to the Render `CLIENT_ORIGIN` environment variable and redeploy the API.

## REST API

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Auth | Purpose |
|---|---|---:|---|
| GET | `/health` | No | API health check |
| POST | `/auth/register` | No | Create account; returns user and JWT (201) |
| POST | `/auth/login` | No | Authenticate; returns user and JWT |
| GET | `/auth/me` | Yes | Get the signed-in user |
| GET | `/tasks` | Yes | List the signed-in user's tasks |
| POST | `/tasks` | Yes | Create a task (201) |
| PATCH | `/tasks/:id` | Yes | Update task fields |
| DELETE | `/tasks/:id` | Yes | Delete a task |

Send protected requests with `Authorization: Bearer <token>`. Task list filters are optional query parameters: `status` (`todo`, `in-progress`, `completed`), `priority` (`low`, `medium`, `high`), and `search`.

Example task JSON:

```json
{
  "title": "Finish Experiment 09 report",
  "description": "Test the API and connect the React frontend.",
  "status": "todo",
  "priority": "high",
  "dueDate": "2026-12-31",
  "tags": ["college", "web development"]
}
```

Errors are returned as JSON with a descriptive `message` and an appropriate HTTP status (for example 400 invalid input, 401 unauthenticated, 404 missing task, 409 duplicate account).

## Test with Postman

1. Start the API and MongoDB using the setup instructions.
2. In Postman, choose **Import** and select `postman/Taskify.postman_collection.json`.
3. Run **Health**, then **Register** (use an email not already registered) or **Login**.
4. The collection saves the returned JWT automatically. Run **Create task**, **List tasks**, **Update task**, and **Delete task** in order; Create task saves the task ID for later requests.
5. For another test account, change `testEmail` and `testPassword` in the collection variables.

## Build the frontend

```bash
npm run build
```

## Experiment record

**Aim:** Develop a full-stack web application by creating REST APIs using Express.js, testing endpoints using Postman, and integrating the backend with a React application that fetches and displays data dynamically.

**Program:** Taskify implements a React task-management client, an Express REST API, MongoDB persistence, and JWT-protected user accounts. The Postman collection demonstrates health, registration/login, current-user, task list/create/update/delete requests.

**Output:** A responsive personal task dashboard with account registration and login; task records persist in MongoDB and update dynamically through the REST API.

**Conclusion:** The experiment demonstrates the complete MERN request cycle: React sends HTTP requests to Express, Express validates/authenticates them and reads or writes MongoDB records, and JSON responses update the interface. Postman can independently verify the API endpoints and status codes.
