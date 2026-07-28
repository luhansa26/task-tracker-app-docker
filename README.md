# task-tracker

A lightweight Node.js REST API & Frontend Application built with Express for managing tasks using in-memory storage.

## Features

- 🎨 **Modern Frontend UI**: Sleek dark-mode dashboard with real-time statistics, completion progress bar, filtering (All, Pending, Completed), live search, and toast notifications.
- ⚡ **Express REST API**: Fast in-memory task operations.
- 🩺 **Health Check**: `GET /health` endpoint for container health monitoring.
- 🐳 **Docker Support**: Ready to be containerized using the provided `Dockerfile`.

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher) & [npm](https://www.npmjs.com/) (for local execution)
- [Docker](https://www.docker.com/) (optional, for running in a container)

---

## Getting Started

### Local Setup

#### 1. Installation

Install dependencies by running:

```bash
npm install
```

#### 2. Running the Server

Start the application using:

```bash
npm start
```

By default, the server listens on **port 3000** and logs:
```
Server running on port 3000
```

To run on a custom port, pass the `PORT` environment variable:

```bash
PORT=8080 npm start
```

---

### Docker Setup

#### 1. Build the Docker Image

```bash
docker build -t task-tracker .
```

#### 2. Run the Docker Container

```bash
docker run -d -p 3000:3000 --name task-tracker task-tracker
```

#### 3. Stop & Remove Container

```bash
docker stop task-tracker
docker rm task-tracker
```

---

### Accessing the Web UI

Open your browser and navigate to:
```
http://localhost:3000
```

---

## API Endpoints & Example Requests

### 1. Health Check
- **Method & Path:** `GET /health`
- **Description:** Returns `{ "status": "ok" }` with HTTP status code 200. Ideal for container or load balancer health checks.
- **Example `curl`:**
  ```bash
  curl http://localhost:3000/health
  ```

### 2. Get All Tasks
- **Method & Path:** `GET /tasks`
- **Description:** Returns a JSON list of all stored tasks.
- **Example `curl`:**
  ```bash
  curl http://localhost:3000/tasks
  ```

### 3. Create a Task
- **Method & Path:** `POST /tasks`
- **Description:** Creates a new task. Auto-assigns an incrementing `id` and defaults `completed` to `false`.
- **Request Body:** JSON object with a `title` string field (`{ "title": "string" }`).
- **Validation:** Returns `400 Bad Request` if `title` is missing or empty.
- **Example `curl`:**
  ```bash
  curl -X POST http://localhost:3000/tasks \
    -H "Content-Type: application/json" \
    -d '{"title": "Buy groceries"}'
  ```

### 4. Toggle or Update Task Completion
- **Method & Path:** `PATCH /tasks/:id`
- **Description:** Toggles the `completed` status of a task with the given ID. Optionally accepts `{ "completed": boolean }` in the request body to set it explicitly.
- **Validation:** Returns `404 Not Found` for unknown task IDs, or `400 Bad Request` for non-integer IDs.
- **Example `curl` (Toggle completed):**
  ```bash
  curl -X PATCH http://localhost:3000/tasks/1
  ```
- **Example `curl` (Set completed explicitly):**
  ```bash
  curl -X PATCH http://localhost:3000/tasks/1 \
    -H "Content-Type: application/json" \
    -d '{"completed": true}'
  ```

### 5. Delete a Task
- **Method & Path:** `DELETE /tasks/:id`
- **Description:** Deletes the task matching the provided ID.
- **Validation:** Returns `404 Not Found` for unknown task IDs.
- **Example `curl`:**
  ```bash
  curl -X DELETE http://localhost:3000/tasks/1
  ```
