/**
 * To-Do List Application with Enhanced UX
 * Features: Tabs, Filters, Search, Sort, Quick Actions
 */
document.addEventListener('DOMContentLoaded', function () {
    // DOM elements
    const taskForm = document.getElementById('task-form');
    const taskTitle = document.getElementById('task-title');
    const searchInput = document.getElementById('search-input');
    const dateFilter = document.getElementById('date-filter');
    const sortSelect = document.getElementById('sort-select');
    const pendingTaskList = document.getElementById('pending-task-list');
    const completedTaskList = document.getElementById('completed-task-list');
    const pendingCount = document.getElementById('pending-count');
    const completedCount = document.getElementById('completed-count');
    const loadingOverlay = document.getElementById('loading-overlay');
    
    // Quick action buttons
    const markAllCompletedBtn = document.getElementById('mark-all-completed');
    const clearCompletedBtn = document.getElementById('clear-completed');
    
    // Tab elements
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
    // State management
    let allTasks = [];
    let currentTab = 'pending';
    let searchTerm = '';
    let selectedDate = '';
    let sortOrder = 'newest';

    // API endpoint base
    const API_BASE = '/tasks';

    // Initialize the application
    init();

    function init() {
        setupEventListeners();
        fetchTasks();
        showLoading();
    }

    /**
     * Setup all event listeners
     */
    function setupEventListeners() {
        // Form submission
        taskForm.addEventListener('submit', handleTaskSubmission);
        
        // Tab switching
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => switchTab(e.target.dataset.tab));
        });
        
        // Search and filters
        searchInput.addEventListener('input', handleSearch);
        dateFilter.addEventListener('change', handleDateFilter);
        sortSelect.addEventListener('change', handleSort);
        
        // Quick actions
        markAllCompletedBtn.addEventListener('click', markAllCompleted);
        clearCompletedBtn.addEventListener('click', clearCompleted);
        
        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeyboardShortcuts);
    }

    /**
     * Handle keyboard shortcuts
     * @param {KeyboardEvent} e 
     */
    function handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + Enter to add task
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            taskForm.dispatchEvent(new Event('submit'));
        }
        
        // Tab to switch between panels
        if (e.key === 'Tab' && e.shiftKey && e.target === taskTitle) {
            e.preventDefault();
            const activeTab = currentTab === 'pending' ? 'completed' : 'pending';
            switchTab(activeTab);
        }
    }

    /**
     * Fetch all tasks from the API
     */
    async function fetchTasks() {
        try {
            showLoading();
            const response = await fetch(API_BASE);
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
            allTasks = await response.json();
            renderTasks();
            updateCounts();
            
        } catch (error) {
            console.error('Error fetching tasks:', error);
            showNotification('Error al cargar las tareas', 'error');
        } finally {
            hideLoading();
        }
    }

    /**
     * Handle task form submission
     * @param {Event} e 
     */
    async function handleTaskSubmission(e) {
        e.preventDefault();
        
        const title = taskTitle.value.trim();
        if (!title) {
            showNotification('Por favor, ingresa un título para la tarea', 'error');
            return;
        }
        
        try {
            setButtonLoading(e.target.querySelector('button'), true);
            
            const response = await fetch(API_BASE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al crear la tarea');
            }
            
            const newTask = await response.json();
            allTasks.unshift(newTask);
            
            // Clear form and update UI
            taskTitle.value = '';
            renderTasks();
            updateCounts();
            
            // Show success and highlight new task
            showNotification('Tarea agregada exitosamente', 'success');
            highlightTask(newTask.id);
            
        } catch (error) {
            console.error('Error creating task:', error);
            showNotification(error.message, 'error');
        } finally {
            setButtonLoading(e.target.querySelector('button'), false);
        }
    }

    /**
     * Switch between tabs
     * @param {string} tabName 
     */
    function switchTab(tabName) {
        if (tabName === currentTab) return;
        
        currentTab = tabName;
        
        // Update tab buttons
        tabButtons.forEach(button => {
            if (button.dataset.tab === tabName) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        
        // Update tab panels
        tabPanels.forEach(panel => {
            if (panel.id === `${tabName}-panel`) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });
        
        renderTasks();
    }

    /**
     * Handle search input
     * @param {Event} e 
     */
    function handleSearch(e) {
        searchTerm = e.target.value.toLowerCase();
        renderTasks();
    }

    /**
     * Handle date filter
     * @param {Event} e 
     */
    function handleDateFilter(e) {
        selectedDate = e.target.value;
        renderTasks();
    }

    /**
     * Handle sort selection
     * @param {Event} e 
     */
    function handleSort(e) {
        sortOrder = e.target.value;
        renderTasks();
    }

    /**
     * Filter and sort tasks based on current criteria
     * @param {Array} tasks 
     * @returns {Array}
     */
    function filterAndSortTasks(tasks) {
        let filtered = tasks;
        
        // Filter by completion status
        if (currentTab === 'pending') {
            filtered = filtered.filter(task => !task.completed);
        } else {
            filtered = filtered.filter(task => task.completed);
        }
        
        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(task => 
                task.title.toLowerCase().includes(searchTerm)
            );
        }
        
        // Filter by date
        if (selectedDate) {
            filtered = filtered.filter(task => {
                const taskDate = new Date(task.created_at).toISOString().split('T')[0];
                return taskDate === selectedDate;
            });
        }
        
        // Sort tasks
        filtered.sort((a, b) => {
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);
            
            switch (sortOrder) {
                case 'newest':
                    return dateB - dateA;
                case 'oldest':
                    return dateA - dateB;
                case 'alphabetical':
                    return a.title.localeCompare(b.title);
                case 'reverse-alphabetical':
                    return b.title.localeCompare(a.title);
                default:
                    return dateB - dateA;
            }
        });
        
        return filtered;
    }

    /**
     * Render tasks in the appropriate list
     */
    function renderTasks() {
        const filteredTasks = filterAndSortTasks(allTasks);
        const targetList = currentTab === 'pending' ? pendingTaskList : completedTaskList;
        const emptyState = document.getElementById(`${currentTab}-empty`);
        
        // Clear the list
        targetList.innerHTML = '';
        
        if (filteredTasks.length === 0) {
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
            filteredTasks.forEach(task => addTaskToDOM(task, targetList));
        }
    }

    /**
     * Add a task to the DOM
     * @param {Object} task 
     * @param {HTMLElement} container 
     */
    function addTaskToDOM(task, container) {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.dataset.taskId = task.id;
        
        li.innerHTML = `
            <div class="task-checkbox ${task.completed ? 'checked' : ''}" 
                 onclick="toggleTask(${task.id})">
            </div>
            <div class="task-content">${escapeHtml(task.title)}</div>
            <div class="task-date">${formatDate(task.created_at)}</div>
            <div class="task-actions">
                <button onclick="editTask(${task.id})" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteTask(${task.id})" class="delete-btn" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        container.appendChild(li);
    }

    /**
     * Toggle task completion status
     * @param {number} taskId 
     */
    async function toggleTask(taskId) {
        const task = allTasks.find(t => t.id === taskId);
        if (!task) return;
        
        const newStatus = !task.completed;
        
        try {
            const response = await fetch(`${API_BASE}/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ completed: newStatus })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al actualizar la tarea');
            }
            
            // Update local state
            task.completed = newStatus;
            renderTasks();
            updateCounts();
            
            const message = newStatus ? 'Tarea completada' : 'Tarea marcada como pendiente';
            showNotification(message, 'success');
            
        } catch (error) {
            console.error('Error toggling task:', error);
            showNotification(error.message, 'error');
        }
    }

    /**
     * Edit task (inline editing)
     * @param {number} taskId 
     */
    function editTask(taskId) {
        const task = allTasks.find(t => t.id === taskId);
        if (!task) return;
        
        const taskItem = document.querySelector(`[data-task-id="${taskId}"]`);
        const taskContent = taskItem.querySelector('.task-content');
        
        const originalTitle = task.title;
        
        // Create input element
        const input = document.createElement('input');
        input.type = 'text';
        input.value = originalTitle;
        input.className = 'edit-input';
        input.style.cssText = `
            flex: 1;
            padding: 0.5rem;
            border: 2px solid var(--primary-color);
            border-radius: var(--border-radius);
            font-size: 1rem;
            background: white;
        `;
        
        // Replace content with input
        taskContent.innerHTML = '';
        taskContent.appendChild(input);
        input.focus();
        input.select();
        
        // Handle save
        const saveEdit = async () => {
            const newTitle = input.value.trim();
            
            if (!newTitle) {
                showNotification('El título no puede estar vacío', 'error');
                input.focus();
                return;
            }
            
            if (newTitle === originalTitle) {
                cancelEdit();
                return;
            }
            
            try {
                const response = await fetch(`${API_BASE}/${taskId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ title: newTitle })
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Error al actualizar la tarea');
                }
                
                // Update local state
                task.title = newTitle;
                taskContent.innerHTML = escapeHtml(newTitle);
                
                showNotification('Tarea actualizada exitosamente', 'success');
                
            } catch (error) {
                console.error('Error updating task:', error);
                showNotification(error.message, 'error');
                taskContent.innerHTML = escapeHtml(originalTitle);
            }
        };
        
        // Handle cancel
        const cancelEdit = () => {
            taskContent.innerHTML = escapeHtml(originalTitle);
        };
        
        // Event listeners
        input.addEventListener('blur', saveEdit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveEdit();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                cancelEdit();
            }
        });
    }

    /**
     * Delete a task
     * @param {number} taskId 
     */
    async function deleteTask(taskId) {
        if (!confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE}/${taskId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al eliminar la tarea');
            }
            
            // Remove from local state
            allTasks = allTasks.filter(task => task.id !== taskId);
            renderTasks();
            updateCounts();
            
            showNotification('Tarea eliminada exitosamente', 'success');
            
        } catch (error) {
            console.error('Error deleting task:', error);
            showNotification(error.message, 'error');
        }
    }

    /**
     * Mark all pending tasks as completed
     */
    async function markAllCompleted() {
        const pendingTasks = allTasks.filter(task => !task.completed);
        
        if (pendingTasks.length === 0) {
            showNotification('No hay tareas pendientes para marcar', 'info');
            return;
        }
        
        if (!confirm(`¿Marcar todas las ${pendingTasks.length} tareas pendientes como completadas?`)) {
            return;
        }
        
        try {
            setButtonLoading(markAllCompletedBtn, true);
            
            // Process tasks in batches to avoid overwhelming the server
            const promises = pendingTasks.map(task => 
                fetch(`${API_BASE}/${task.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ completed: true })
                })
            );
            
            await Promise.all(promises);
            
            // Update local state
            pendingTasks.forEach(task => task.completed = true);
            renderTasks();
            updateCounts();
            
            showNotification(`${pendingTasks.length} tareas marcadas como completadas`, 'success');
            
        } catch (error) {
            console.error('Error marking all completed:', error);
            showNotification('Error al marcar las tareas como completadas', 'error');
        } finally {
            setButtonLoading(markAllCompletedBtn, false);
        }
    }

    /**
     * Clear all completed tasks
     */
    async function clearCompleted() {
        const completedTasks = allTasks.filter(task => task.completed);
        
        if (completedTasks.length === 0) {
            showNotification('No hay tareas completadas para limpiar', 'info');
            return;
        }
        
        if (!confirm(`¿Eliminar todas las ${completedTasks.length} tareas completadas?`)) {
            return;
        }
        
        try {
            setButtonLoading(clearCompletedBtn, true);
            
            const promises = completedTasks.map(task => 
                fetch(`${API_BASE}/${task.id}`, {
                    method: 'DELETE'
                })
            );
            
            await Promise.all(promises);
            
            // Update local state
            allTasks = allTasks.filter(task => !task.completed);
            renderTasks();
            updateCounts();
            
            showNotification(`${completedTasks.length} tareas eliminadas`, 'success');
            
        } catch (error) {
            console.error('Error clearing completed tasks:', error);
            showNotification('Error al eliminar las tareas completadas', 'error');
        } finally {
            setButtonLoading(clearCompletedBtn, false);
        }
    }

    /**
     * Update task counts in tab badges
     */
    function updateCounts() {
        const pending = allTasks.filter(task => !task.completed).length;
        const completed = allTasks.filter(task => task.completed).length;
        
        pendingCount.textContent = pending;
        completedCount.textContent = completed;
    }

    /**
     * Show loading overlay
     */
    function showLoading() {
        loadingOverlay.style.display = 'flex';
    }

    /**
     * Hide loading overlay
     */
    function hideLoading() {
        loadingOverlay.style.display = 'none';
    }

    /**
     * Set button loading state
     * @param {HTMLElement} button 
     * @param {boolean} loading 
     */
    function setButtonLoading(button, loading) {
        if (loading) {
            button.disabled = true;
            button.classList.add('btn-loading');
        } else {
            button.disabled = false;
            button.classList.remove('btn-loading');
        }
    }

    /**
     * Show notification
     * @param {string} message 
     * @param {string} type - success, error, info
     */
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 4000);
    }

    /**
     * Highlight a specific task
     * @param {number} taskId 
     */
    function highlightTask(taskId) {
        setTimeout(() => {
            const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
            if (taskElement) {
                taskElement.classList.add('highlight');
                setTimeout(() => {
                    taskElement.classList.remove('highlight');
                }, 1000);
            }
        }, 100);
    }

    /**
     * Format date for display
     * @param {string} dateString 
     * @returns {string}
     */
    function formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return 'Hoy ' + date.toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        } else if (diffDays === 1) {
            return 'Ayer';
        } else if (diffDays < 7) {
            return `Hace ${diffDays} días`;
        } else {
            return date.toLocaleDateString('es-ES');
        }
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} text 
     * @returns {string}
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Make functions global for onclick handlers
    window.toggleTask = toggleTask;
    window.editTask = editTask;
    window.deleteTask = deleteTask;

    // Add notification styles
    const notificationStyles = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            max-width: 300px;
            word-wrap: break-word;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transform: translateX(100%);
            animation: slideInNotification 0.3s ease forwards;
        }
        
        @keyframes slideInNotification {
            to { transform: translateX(0); }
        }
        
        .notification-success {
            background: linear-gradient(135deg, #27ae60, #2ecc71);
        }
        
        .notification-error {
            background: linear-gradient(135deg, #e74c3c, #ec7063);
        }
        
        .notification-info {
            background: linear-gradient(135deg, #3498db, #5dade2);
        }
        
        .btn-loading {
            position: relative;
            pointer-events: none;
            opacity: 0.7;
        }
        
        .btn-loading::after {
            content: '';
            position: absolute;
            width: 16px;
            height: 16px;
            top: 50%;
            left: 50%;
            margin-left: -8px;
            margin-top: -8px;
            border: 2px solid transparent;
            border-top-color: currentColor;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    
    const style = document.createElement('style');
    style.textContent = notificationStyles;
    document.head.appendChild(style);
});
