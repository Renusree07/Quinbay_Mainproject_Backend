const todoInput = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');
const completedCounter = document.getElementById('completed-counter');
const totalCounter = document.getElementById('total-counter');
const progressBar = document.getElementById('progress-bar');

// Backend API base URL
const API_URL = "http://localhost:8080/tasks";

let tasks = [];

// Fetch tasks from the backend and render them
function fetchTasks() {
  fetch(API_URL)
    .then(response => response.json())
    .then(data => {
      tasks = data;
      renderTasks();
    })
    .catch(error => console.error('Error fetching tasks:', error));
}

// Update counters and progress bar
function updateCountersAndBar() {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;

  completedCounter.textContent = completedTasks;
  totalCounter.textContent = totalTasks;

  const progress = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;
  progressBar.style.width = `${progress}%`;
  progressBar.textContent = `${Math.round(progress)}% Completed`;
}

// Add a new task to the backend
function addTask() {
  const todoText = todoInput.value.trim();
  if (!todoText) {
    alert('Please enter a valid task.');
    return;
  }

  const task = { title: todoText, completed: false };
  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  })
    .then(response => response.json())
    .then(newTask => {
      tasks.push(newTask);
      todoInput.value = '';
      renderTasks();
    })
    .catch(error => console.error('Error adding task:', error));
}

// Render tasks on the screen
function renderTasks() {
  todoList.innerHTML = '';

  tasks.forEach(task => {
    const taskItem = document.createElement('div');
    taskItem.classList.add('task-item');

    const taskText = document.createElement('span');
    taskText.textContent = task.title;
    if (task.completed) {
      taskText.classList.add('completed');
    }
    taskItem.appendChild(taskText);

    // Complete button
    const completeBtn = document.createElement('button');
    completeBtn.textContent = '✔';
    completeBtn.classList.add('complete-btn');
    completeBtn.addEventListener('click', () => {
      toggleTaskCompletion(task.id);
    });
    taskItem.appendChild(completeBtn);

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.textContent = '✎';
    editBtn.classList.add('edit-btn');
    editBtn.addEventListener('click', () => {
      const newText = prompt('Edit your task:', task.title);
      if (newText !== null && newText.trim()) {
        editTask(task.id, newText.trim());
      }
    });
    taskItem.appendChild(editBtn);

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '✖';
    deleteBtn.classList.add('delete-btn');
    deleteBtn.addEventListener('click', () => {
      deleteTask(task.id);
    });
    taskItem.appendChild(deleteBtn);

    todoList.appendChild(taskItem);
  });

  updateCountersAndBar();
}

// Toggle task completion status
function toggleTaskCompletion(taskId) {
  fetch(`${API_URL}/${taskId}/complete`, {
    method: "PATCH",
  })
    .then(response => response.json())
    .then(updatedTask => {
      const task = tasks.find(t => t.id === taskId);
      if (task) task.completed = updatedTask.completed;
      renderTasks();
    })
    .catch(error => console.error('Error toggling task completion:', error));
}

// Edit a task
function editTask(taskId, newText) {
  fetch(`${API_URL}/${taskId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: newText }),
  })
    .then(response => response.json())
    .then(updatedTask => {
      const task = tasks.find(t => t.id === taskId);
      if (task) task.title = updatedTask.title;
      renderTasks();
    })
    .catch(error => console.error('Error editing task:', error));
}

// Delete a task
function deleteTask(taskId) {
  fetch(`${API_URL}/${taskId}`, {
    method: "DELETE",
  })
    .then(() => {
      tasks = tasks.filter(task => task.id !== taskId);
      renderTasks();
    })
    .catch(error => console.error('Error deleting task:', error));
}

// Event listener for adding tasks
addBtn.addEventListener('click', addTask);

// Initial fetch of tasks
fetchTasks();
