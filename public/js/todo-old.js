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
            return response.json().then(errorData => {
                const errorMessage = errorData.error || `Error ${response.status}: ${response.statusText}`;
                throw new Error(errorMessage);
            }).catch(() => {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            });
        }
        return response.json();
    }

    /**
     * Handle and display errors with specific messages
     * @param {Error} error 
     */
    function handleError(error) {
        console.error('Error:', error);
        
        let userMessage = 'Error al procesar la solicitud';
        
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            userMessage = 'Error de conexión. Verifica tu internet e intenta nuevamente.';
        } else if (error.message.includes('422')) {
            userMessage = 'Datos inválidos: ' + error.message.replace('Error 422: ', '');
        } else if (error.message.includes('404')) {
            userMessage = 'La tarea no fue encontrada.';
        } else if (error.message.includes('500')) {
            userMessage = 'Error del servidor. Intenta nuevamente en unos momentos.';
        } else if (error.message !== 'Error al procesar la solicitud') {
            userMessage = error.message;
        }
        
        showNotification(userMessage, 'error');
        hideLoading();
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
        // Client-side validation
        const validation = validateTaskTitle(newTitle);
        if (!validation.isValid) {
            showNotification(validation.message, 'error');
            fetchTasks(); // Revert UI
            return Promise.reject(new Error(validation.message));
        }

        if (validation.title === task.title) {
            fetchTasks(); // Revert UI
            return Promise.resolve();
        }

        const taskElement = document.querySelector(`[data-id="${task.id}"]`);
        const saveBtn = taskElement?.querySelector('.save-btn');
        
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.textContent = 'Guardando...';
        }

        return fetch(`${API_BASE}/${task.id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ title: validation.title })
        })
        .then(handleApiResponse)
        .then(response => {
            const message = response.message || 'Tarea actualizada correctamente';
            showNotification(message, 'success');
            fetchTasks();
        })
        .catch(error => {
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.textContent = 'Guardar';
            }
            handleError(error);
            fetchTasks(); // Revert UI
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
        const taskElement = document.querySelector(`[data-id="${id}"]`);
        const deleteBtn = taskElement?.querySelector('.delete-btn');
        
        if (deleteBtn) {
            deleteBtn.disabled = true;
            deleteBtn.textContent = 'Eliminando...';
        }
        
        showLoading();
        
        fetch(`${API_BASE}/${id}`, { 
            method: 'DELETE',
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(handleApiResponse)
        .then(response => {
            const message = response.message || 'Tarea eliminada correctamente';
            showNotification(message, 'success');
            fetchTasks();
        })
        .catch(error => {
            if (deleteBtn) {
                deleteBtn.disabled = false;
                deleteBtn.textContent = 'Eliminar';
            }
            handleError(error);
        })
        .finally(() => {
            hideLoading();
        });
    }

    /**
     * Validate task title on client side
     * @param {string} title 
     * @returns {object} Validation result with isValid and message
     */
    function validateTaskTitle(title) {
        const trimmed = title.trim();
        
        if (!trimmed) {
            return { isValid: false, message: 'El título es requerido' };
        }
        
        if (trimmed.length < 3) {
            return { isValid: false, message: 'El título debe tener al menos 3 caracteres' };
        }
        
        if (trimmed.length > 255) {
            return { isValid: false, message: 'El título no puede exceder 255 caracteres' };
        }
        
        // Basic HTML/script tag detection
        if (/<[^>]*>/g.test(trimmed)) {
            return { isValid: false, message: 'El título no puede contener etiquetas HTML' };
        }
        
        return { isValid: true, title: trimmed };
    }

    /**
     * Set form loading state
     * @param {boolean} isLoading 
     */
    function setFormLoading(isLoading) {
        const submitButton = taskForm.querySelector('button[type="submit"]');
        const titleInput = taskForm.querySelector('#task-title');
        
        if (isLoading) {
            submitButton.disabled = true;
            submitButton.textContent = 'Creando...';
            titleInput.disabled = true;
            taskForm.classList.add('loading');
        } else {
            submitButton.disabled = false;
            submitButton.textContent = 'Agregar Tarea';
            titleInput.disabled = false;
            taskForm.classList.remove('loading');
        }
    }

    /**
     * Create new task via form submission
     * @param {Event} e 
     */
    function handleFormSubmit(e) {
        e.preventDefault();
        
        const title = taskTitle.value;
        
        // Client-side validation
        const validation = validateTaskTitle(title);
        if (!validation.isValid) {
            showNotification(validation.message, 'error');
            taskTitle.focus();
            return;
        }

        // Set loading state
        setFormLoading(true);

        fetch(API_BASE, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ title: validation.title })
        })
        .then(handleApiResponse)
        .then(response => {
            taskTitle.value = '';
            const message = response.message || 'Tarea creada correctamente';
            showNotification(message, 'success');
            fetchTasks();
        })
        .catch(handleError)
        .finally(() => {
            setFormLoading(false);
        });
    }

    // Event listeners
    taskForm.addEventListener('submit', handleFormSubmit);
    
    // Real-time validation for title input
    taskTitle.addEventListener('input', function() {
        const validation = validateTaskTitle(this.value);
        
        if (this.value.length > 0) {
            if (validation.isValid) {
                this.classList.remove('input-error');
                this.classList.add('form-success');
            } else {
                this.classList.add('input-error');
                this.classList.remove('form-success');
            }
        } else {
            this.classList.remove('input-error', 'form-success');
        }
    });
    
    // Clear validation styles when input is empty
    taskTitle.addEventListener('blur', function() {
        if (!this.value.trim()) {
            this.classList.remove('input-error', 'form-success');
        }
    });

    // Initialize app
    fetchTasks();
});
