document.addEventListener('DOMContentLoaded', function () {
    const taskList = document.getElementById('task-list');
    const taskForm = document.getElementById('task-form');
    const taskTitle = document.getElementById('task-title');

    function fetchTasks() {
        fetch('/tasks')
            .then(res => res.json())
            .then(tasks => {
                taskList.innerHTML = '';
                tasks.forEach(task => addTaskToDOM(task));
            });
    }


    function addTaskToDOM(task) {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.dataset.id = task.id;

        // Checkbox para completado
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
    checkbox.checked = (task.completed === true || task.completed === 1 || task.completed === '1');
        checkbox.className = 'complete-checkbox';
        li.appendChild(checkbox);

        // Título de la tarea
        const span = document.createElement('span');
    span.className = 'task-title' + ((task.completed === true || task.completed === 1 || task.completed === '1') ? ' completed' : '');
        span.textContent = task.title;
        li.appendChild(span);

        // Input para edición
        const editInput = document.createElement('input');
        editInput.className = 'edit-input';
        editInput.value = task.title;
        editInput.style.display = 'none';
        li.appendChild(editInput);

        // Botón Editar
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.textContent = 'Editar';
        li.appendChild(editBtn);

        // Botón Guardar
        const saveBtn = document.createElement('button');
        saveBtn.className = 'save-btn';
        saveBtn.textContent = 'Guardar';
        saveBtn.style.display = 'none';
        li.appendChild(saveBtn);

        // Botón Eliminar
        const delBtn = document.createElement('button');
        delBtn.className = 'delete-btn';
        delBtn.textContent = 'Eliminar';
        delBtn.onclick = () => {
            if (confirm('¿Estás seguro de eliminar esta tarea?')) {
                deleteTask(task.id);
            }
        };
        li.appendChild(delBtn);

        // Estado de edición
        let editing = false;

        // Editar
        editBtn.onclick = () => {
            if (editing) return;
            editing = true;
            span.style.display = 'none';
            editBtn.style.display = 'none';
            saveBtn.style.display = 'inline-block';
            editInput.style.display = 'inline-block';
            editInput.focus();
            checkbox.disabled = true;
        };

        // Guardar
        saveBtn.onclick = () => {
            updateTaskTitle(task, editInput.value).then(() => {
                editing = false;
                span.style.display = '';
                editBtn.style.display = '';
                saveBtn.style.display = 'none';
                editInput.style.display = 'none';
                checkbox.disabled = false;
            });
        };

        // Cambiar completado
        checkbox.onclick = () => {
            if (editing) return;
            toggleComplete(task, checkbox);
        };

        taskList.appendChild(li);
    }


    function updateTaskTitle(task, newTitle) {
        if (newTitle && newTitle !== task.title) {
            return fetch(`/tasks/${task.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newTitle })
            }).then(fetchTasks);
        } else {
            fetchTasks();
            return Promise.resolve();
        }
    }


    function toggleComplete(task, checkbox) {
        fetch(`/tasks/${task.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: checkbox.checked })
        }).then(fetchTasks);
    }

    function deleteTask(id) {
        fetch(`/tasks/${id}`, { method: 'DELETE' })
            .then(fetchTasks);
    }

    taskForm.onsubmit = function (e) {
        e.preventDefault();
        const title = taskTitle.value.trim();
        if (!title) return;
        fetch('/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title })
        }).then(() => {
            taskTitle.value = '';
            fetchTasks();
        });
    };

    fetchTasks();
});
