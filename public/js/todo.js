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

        const span = document.createElement('span');
        span.className = 'task-title' + (task.completed ? ' completed' : '');
        span.textContent = task.title;
        span.onclick = () => toggleComplete(task, span);
        li.appendChild(span);

        const editInput = document.createElement('input');
        editInput.className = 'edit-input';
        editInput.value = task.title;
        editInput.style.display = 'none';
        li.appendChild(editInput);

        span.ondblclick = () => {
            span.style.display = 'none';
            editInput.style.display = 'inline-block';
            editInput.focus();
        };
        editInput.onblur = () => {
            updateTaskTitle(task, editInput.value);
        };
        editInput.onkeydown = (e) => {
            if (e.key === 'Enter') {
                updateTaskTitle(task, editInput.value);
            }
        };

        const delBtn = document.createElement('button');
        delBtn.className = 'delete-btn';
        delBtn.textContent = 'Eliminar';
        delBtn.onclick = () => deleteTask(task.id);
        li.appendChild(delBtn);

        taskList.appendChild(li);
    }

    function updateTaskTitle(task, newTitle) {
        if (newTitle && newTitle !== task.title) {
            fetch(`/tasks/${task.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newTitle })
            }).then(fetchTasks);
        } else {
            fetchTasks();
        }
    }

    function toggleComplete(task, span) {
        fetch(`/tasks/${task.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: !task.completed })
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
