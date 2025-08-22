/**
 * To-Do List Application
 * Manages task CRUD operations via AJAX
 */
document.addEventListener('DOMContentLoaded', function () {
    // DOM elements
    const taskList = document.getElementById('task-list');
    const taskForm = document.getElementById('task-form');
    const taskTitle = document.getElementById('task-title');

    // API endpoint base
    const API_BASE = '/tasks';

    /**
     * Fetch all tasks from the API and render them
     */
    function fetchTasks() {
        showLoading();
        fetch(API_BASE)
            .then(handleApiResponse)
            .then(tasks => {
                taskList.innerHTML = '';
                tasks.forEach(task => addTaskToDOM(task));
            })
            .catch(handleError)
            .finally(hideLoading);
    }

    /**
     * Handle API response errors
     * @param {Response} response 
     */
    function handleApiResponse(response) {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    }

    /**
     * Handle and display errors
     * @param {Error} error 
     */
    function handleError(error) {
        console.error('Error:', error);
        showNotification('Error al procesar la solicitud', 'error');
    }

    /**
     * Show loading indicator
     */
    function showLoading() {
        // Add loading class or spinner
        taskList.classList.add('loading');
    }

    /**
     * Hide loading indicator
     */
    function hideLoading() {
        taskList.classList.remove('loading');
    }

    /**
     * Show notification to user
     * @param {string} message 
     * @param {string} type 
     */
    function showNotification(message, type = 'info') {
        // Simple notification system
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    /**
     * Check if task is completed based on various possible values
     * @param {*} completed 
     * @returns {boolean}
     */
    function isTaskCompleted(completed) {
        return completed === true || completed === 1 || completed === '1';
    }

    /**
     * Add a task to the DOM
     * @param {Object} task - Task object with id, title, completed properties
     */
    function addTaskToDOM(task) {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.dataset.id = task.id;

        // Create task elements
        const elements = createTaskElements(task);
        
        // Append all elements to list item
        Object.values(elements).forEach(element => {
            li.appendChild(element);
        });

        // Setup event handlers
        setupTaskEventHandlers(task, elements);

        taskList.appendChild(li);
    }

    /**
     * Create all task DOM elements
     * @param {Object} task 
     * @returns {Object} Object containing all task elements
     */
    function createTaskElements(task) {
        const isCompleted = isTaskCompleted(task.completed);

        // Checkbox for completion
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = isCompleted;
        checkbox.className = 'complete-checkbox';

        // Task title span
        const span = document.createElement('span');
        span.className = 'task-title' + (isCompleted ? ' completed' : '');
        span.textContent = task.title;

        // Edit input (hidden by default)
        const editInput = document.createElement('input');
        editInput.className = 'edit-input';
        editInput.value = task.title;
        editInput.style.display = 'none';

        // Buttons
        const editBtn = createButton('Editar', 'edit-btn');
        const saveBtn = createButton('Guardar', 'save-btn', 'none');
        const deleteBtn = createButton('Eliminar', 'delete-btn');

        return {
            checkbox,
            span,
            editInput,
            editBtn,
            saveBtn,
            deleteBtn
        };
    }

    /**
     * Create a button element
     * @param {string} text 
     * @param {string} className 
     * @param {string} display 
     * @returns {HTMLButtonElement}
     */
    function createButton(text, className, display = 'inline-block') {
        const button = document.createElement('button');
        button.className = className;
        button.textContent = text;
        button.style.display = display;
        return button;
    }

    /**
     * Setup event handlers for task elements
     * @param {Object} task 
     * @param {Object} elements 
     */
    function setupTaskEventHandlers(task, elements) {
        const { checkbox, span, editInput, editBtn, saveBtn, deleteBtn } = elements;
        let editing = false;

        // Edit button handler
        editBtn.onclick = () => startEditing();
        
        // Save button handler
        saveBtn.onclick = () => saveTask();
        
        // Delete button handler
        deleteBtn.onclick = () => confirmDelete();
        
        // Checkbox handler
        checkbox.onclick = () => toggleTaskCompletion();

        // Enter key handler for edit input
        editInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveTask();
            }
        });

        function startEditing() {
            if (editing) return;
            editing = true;
            span.style.display = 'none';
            editBtn.style.display = 'none';
            saveBtn.style.display = 'inline-block';
            editInput.style.display = 'inline-block';
            editInput.focus();
            editInput.select();
            checkbox.disabled = true;
        }

        function saveTask() {
            const newTitle = editInput.value.trim();
            if (!newTitle) {
                showNotification('El título no puede estar vacío', 'error');
                return;
            }

            updateTaskTitle(task, newTitle)
                .then(() => {
                    editing = false;
                    span.style.display = '';
                    editBtn.style.display = '';
                    saveBtn.style.display = 'none';
                    editInput.style.display = 'none';
                    checkbox.disabled = false;
                })
                .catch(() => {
                    showNotification('Error al actualizar la tarea', 'error');
                });
        }

        function confirmDelete() {
            if (confirm('¿Estás seguro de eliminar esta tarea?')) {
                deleteTask(task.id);
            }
        }

        function toggleTaskCompletion() {
            if (editing) return;
            toggleComplete(task, checkbox);
        }
    }

    /**
     * Update task title via API
     * @param {Object} task 
     * @param {string} newTitle 
     * @returns {Promise}
     */
    function updateTaskTitle(task, newTitle) {
        if (!newTitle || newTitle === task.title) {
            fetchTasks();
            return Promise.resolve();
        }

        return fetch(`${API_BASE}/${task.id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ title: newTitle })
        })
        .then(handleApiResponse)
        .then(() => {
            showNotification('Tarea actualizada correctamente', 'success');
            fetchTasks();
        });
    }

    /**
     * Toggle task completion status
     * @param {Object} task 
     * @param {HTMLInputElement} checkbox 
     */
    function toggleComplete(task, checkbox) {
        fetch(`${API_BASE}/${task.id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ completed: checkbox.checked })
        })
        .then(handleApiResponse)
        .then(() => {
            const message = checkbox.checked ? 'Tarea completada' : 'Tarea marcada como pendiente';
            showNotification(message, 'success');
            fetchTasks();
        })
        .catch(error => {
            // Revert checkbox state on error
            checkbox.checked = !checkbox.checked;
            handleError(error);
        });
    }

    /**
     * Delete task via API
     * @param {number} id 
     */
    function deleteTask(id) {
        fetch(`${API_BASE}/${id}`, { 
            method: 'DELETE',
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(handleApiResponse)
        .then(() => {
            showNotification('Tarea eliminada correctamente', 'success');
            fetchTasks();
        })
        .catch(handleError);
    }

    /**
     * Create new task via form submission
     * @param {Event} e 
     */
    function handleFormSubmit(e) {
        e.preventDefault();
        
        const title = taskTitle.value.trim();
        if (!title) {
            showNotification('Por favor ingresa un título para la tarea', 'error');
            return;
        }

        fetch(API_BASE, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ title })
        })
        .then(handleApiResponse)
        .then(() => {
            taskTitle.value = '';
            showNotification('Tarea creada correctamente', 'success');
            fetchTasks();
        })
        .catch(handleError);
    }

    // Event listeners
    taskForm.addEventListener('submit', handleFormSubmit);

    // Initialize app
    fetchTasks();
});
