/**
 * TaskTracker Frontend Application Logic
 * Interacts with the Express REST API endpoints (/health, /tasks)
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const healthBadge = document.getElementById('healthBadge');
  const healthStatusText = document.getElementById('healthStatusText');
  const taskTitleInput = document.getElementById('taskTitleInput');
  const addTaskForm = document.getElementById('addTaskForm');
  const taskList = document.getElementById('taskList');
  const emptyState = document.getElementById('emptyState');
  const emptyTitle = document.getElementById('emptyTitle');
  const emptySubtitle = document.getElementById('emptySubtitle');
  const searchInput = document.getElementById('searchInput');
  const tabButtons = document.querySelectorAll('.tab-btn');
  const toastContainer = document.getElementById('toastContainer');

  // Metrics & Stats DOM Elements
  const statTotal = document.getElementById('statTotal');
  const statPending = document.getElementById('statPending');
  const statCompleted = document.getElementById('statCompleted');
  const countAll = document.getElementById('countAll');
  const countPending = document.getElementById('countPending');
  const countCompleted = document.getElementById('countCompleted');
  const progressBarFill = document.getElementById('progressBarFill');
  const progressPercentage = document.getElementById('progressPercentage');

  // Application State
  let tasks = [];
  let currentFilter = 'all';
  let searchQuery = '';

  // Initialize App
  init();

  function init() {
    checkHealth();
    fetchTasks();
    setInterval(checkHealth, 15000); // Check API health every 15s

    // Event Listeners
    addTaskForm.addEventListener('submit', handleAddTask);
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      render();
    });

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        render();
      });
    });
  }

  /**
   * Check Server Health (GET /health)
   */
  async function checkHealth() {
    try {
      const response = await fetch('/health');
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'ok') {
          healthBadge.className = 'health-badge online';
          healthStatusText.textContent = 'API Online (200)';
        } else {
          setHealthOffline();
        }
      } else {
        setHealthOffline();
      }
    } catch (err) {
      setHealthOffline();
    }
  }

  function setHealthOffline() {
    healthBadge.className = 'health-badge offline';
    healthStatusText.textContent = 'API Unreachable';
  }

  /**
   * Fetch All Tasks (GET /tasks)
   */
  async function fetchTasks() {
    try {
      const response = await fetch('/tasks');
      if (!response.ok) throw new Error('Failed to fetch tasks');
      tasks = await response.json();
      render();
    } catch (err) {
      showToast('Error loading tasks from server', 'error');
    }
  }

  /**
   * Add a New Task (POST /tasks)
   */
  async function handleAddTask(e) {
    e.preventDefault();
    const title = taskTitleInput.value.trim();
    if (!title) return;

    try {
      const response = await fetch('/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create task');
      }

      const newTask = await response.json();
      tasks.push(newTask);
      taskTitleInput.value = '';
      showToast(`Task "${newTask.title}" added`, 'success');
      render();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  /**
   * Toggle Task Completion Status (PATCH /tasks/:id)
   */
  async function toggleTask(id) {
    try {
      const response = await fetch(`/tasks/${id}`, {
        method: 'PATCH'
      });

      if (!response.ok) throw new Error('Failed to update task status');

      const updatedTask = await response.json();
      const index = tasks.findIndex(t => t.id === id);
      if (index !== -1) {
        tasks[index] = updatedTask;
        render();
        const statusText = updatedTask.completed ? 'completed' : 'reopened';
        showToast(`Task marked as ${statusText}`, 'success');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  /**
   * Delete Task (DELETE /tasks/:id)
   */
  async function deleteTask(id) {
    try {
      const response = await fetch(`/tasks/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete task');

      tasks = tasks.filter(t => t.id !== id);
      render();
      showToast('Task deleted successfully', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  /**
   * Render UI State (Filters, Metrics, Task List, Empty State)
   */
  function render() {
    // 1. Calculate Statistics
    const totalCount = tasks.length;
    const completedCount = tasks.filter(t => t.completed).length;
    const pendingCount = totalCount - completedCount;
    const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // Update Overview Metrics
    statTotal.textContent = totalCount;
    statPending.textContent = pendingCount;
    statCompleted.textContent = completedCount;

    countAll.textContent = totalCount;
    countPending.textContent = pendingCount;
    countCompleted.textContent = completedCount;

    progressBarFill.style.width = `${percent}%`;
    progressPercentage.textContent = `${percent}% Completed`;

    // 2. Filter Tasks
    let filteredTasks = tasks.filter(task => {
      // Filter tab check
      if (currentFilter === 'pending' && task.completed) return false;
      if (currentFilter === 'completed' && !task.completed) return false;

      // Search query check
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery)) return false;

      return true;
    });

    // 3. Render Task Items or Empty State
    taskList.innerHTML = '';

    if (filteredTasks.length === 0) {
      emptyState.classList.remove('hidden');
      if (tasks.length === 0) {
        emptyTitle.textContent = 'No tasks yet';
        emptySubtitle.textContent = 'Add your first task above to get started!';
      } else if (searchQuery) {
        emptyTitle.textContent = 'No matching tasks found';
        emptySubtitle.textContent = `No results for "${searchQuery}"`;
      } else {
        emptyTitle.textContent = `No ${currentFilter} tasks`;
        emptySubtitle.textContent = `You don't have any ${currentFilter} tasks right now.`;
      }
    } else {
      emptyState.classList.add('hidden');

      filteredTasks.forEach(task => {
        const item = document.createElement('div');
        item.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        item.innerHTML = `
          <div class="task-left">
            <button class="toggle-btn" title="${task.completed ? 'Mark pending' : 'Mark completed'}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </button>
            <div class="task-details">
              <span class="task-title"></span>
              <span class="task-id-badge">Task #${task.id}</span>
            </div>
          </div>
          <button class="delete-btn" title="Delete Task">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
            </svg>
          </button>
        `;

        // Safely set text content to prevent XSS
        item.querySelector('.task-title').textContent = task.title;

        // Toggle handler
        item.querySelector('.toggle-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          toggleTask(task.id);
        });

        // Delete handler
        item.querySelector('.delete-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          deleteTask(task.id);
        });

        taskList.appendChild(item);
      });
    }
  }

  /**
   * Display Toast Notifications
   */
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const iconSvg = type === 'success' 
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

    toast.innerHTML = `${iconSvg}<span>${escapeHtml(message)}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
});
