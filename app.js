const express = require('express');

// Initialize the Express application
const app = express();

// Set the port from environment variables or default to 3000
const PORT = process.env.PORT || 3000;

// Middleware: Parse incoming JSON request bodies into JavaScript objects (req.body)
app.use(express.json());

// Middleware: Serve static frontend files from the 'public' folder
app.use(express.static('public'));

// In-memory data store (array of task objects)
let tasks = [];

// Counter for auto-incrementing task IDs
let nextId = 1;

/**
 * GET /health
 * Returns server status for container/service health checks.
 */
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

/**
 * GET /tasks
 * Returns all tasks in memory as a JSON array.
 */
app.get('/tasks', (req, res) => {
  res.status(200).json(tasks);
});

/**
 * POST /tasks
 * Creates a new task.
 * Request Body: { "title": "Task description" }
 */
app.post('/tasks', (req, res) => {
  const { title } = req.body;

  // Input Validation: Check if title is missing, not a string, or empty
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required and must be a non-empty string.' });
  }

  // Create new task with incrementing ID and default completed status of false
  const newTask = {
    id: nextId++,
    title: title.trim(),
    completed: false
  };

  // Store task in memory
  tasks.push(newTask);

  // Return the newly created task with a 201 Created status
  res.status(201).json(newTask);
});

/**
 * PATCH /tasks/:id
 * Toggles completion status or sets 'completed' to the boolean provided in the request body.
 * Request Body (optional): { "completed": boolean }
 */
app.patch('/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id, 10);

  // Validation: Check if ID path parameter is a valid integer
  if (isNaN(taskId)) {
    return res.status(400).json({ error: 'Task ID must be a valid integer.' });
  }

  // Find task by ID
  const task = tasks.find(t => t.id === taskId);
  if (!task) {
    return res.status(404).json({ error: `Task with ID ${taskId} not found.` });
  }

  // If 'completed' boolean is explicitly provided in body, use it; otherwise toggle current state
  if (req.body.completed !== undefined) {
    if (typeof req.body.completed !== 'boolean') {
      return res.status(400).json({ error: 'Field "completed" must be a boolean value.' });
    }
    task.completed = req.body.completed;
  } else {
    task.completed = !task.completed;
  }

  // Return the updated task object
  res.status(200).json(task);
});

/**
 * DELETE /tasks/:id
 * Removes a task with the given ID from memory.
 */
app.delete('/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id, 10);

  // Validation: Check if ID path parameter is a valid integer
  if (isNaN(taskId)) {
    return res.status(400).json({ error: 'Task ID must be a valid integer.' });
  }

  // Find index of the task to delete
  const index = tasks.findIndex(t => t.id === taskId);
  if (index === -1) {
    return res.status(404).json({ error: `Task with ID ${taskId} not found.` });
  }

  // Remove task from array
  const deletedTask = tasks.splice(index, 1)[0];

  // Return confirmation message and deleted task object
  res.status(200).json({ message: 'Task deleted successfully', task: deletedTask });
});

// Start the Express server and log the listening port
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
