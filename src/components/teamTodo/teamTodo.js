import './teamTodo.scss';

export default class teamTodo {
  constructor(element) {
    this.element = element;
  }

  async init() {
    if (process.env.NODE_ENV !== 'production') {
      const response = await fetch('components/teamTodo/teamTodo.html');
      const teamTodoHtml = await response.text();
      this.element.innerHTML = teamTodoHtml;
    }

    this.initializeTeamTodoComponent();
  }

  async initializeTeamTodoComponent() {
    const todoForm = document.getElementById('team-todo-form');
    const todoInput = document.getElementById('team-todo-input');
    const todoList = document.getElementById('team-todo-list');
    const tasksDoneList = document.getElementById('team-tasks-done-list');
    const addButton = document.getElementById('team-todo-button');

    await loadTodos();

    addButton.addEventListener('click', async function (event) {
      event.preventDefault();
      await addTodo();
    });

    todoForm.addEventListener('submit', async function (event) {
      event.preventDefault();
      await addTodo();
    });

    async function addTodo() {
      const todoText = todoInput.value.trim();
      if (todoText.length > 0) {
        const task = await createTask(todoText);
        const todoItem = createTodoItem(task);
        todoList.appendChild(todoItem);
        todoInput.value = '';
      }
    }

    function createTodoItem(task) {
      const li = document.createElement('li');
      li.textContent = task.text;
      li.setAttribute('data-id', task._id);
      li.addEventListener('click', async function () {
        await updateTask(task._id);
        todoList.removeChild(li);
        const doneItem = createDoneItem(task);
        tasksDoneList.appendChild(doneItem);
      });
      return li;
    }

    function createDoneItem(task) {
      const li = document.createElement('li');
      li.textContent = task.text;
      li.setAttribute('data-id', task._id);
      li.addEventListener('click', async function () {
        await deleteTask(task._id);
        tasksDoneList.removeChild(li);
      });
      return li;
    }

    async function createTask(text) {
      const response = await fetch('http://localhost:3000/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      return await response.json();
    }

    async function updateTask(id) {
      await fetch(`http://localhost:3000/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ done: true }),
      });
    }

    async function deleteTask(id) {
      await fetch(`http://localhost:3000/tasks/${id}`, {
        method: 'DELETE',
      });
    }

    async function loadTodos() {
      const tasks = await fetchTasks();
      tasks.forEach((task) => {
        const todoItem = createTodoItem(task);
        if (task.done) {
          tasksDoneList.appendChild(todoItem);
        } else {
          todoList.appendChild(todoItem);
        }
      });
    }

    async function fetchTasks() {
      const response = await fetch('http://localhost:3000/tasks');
      return await response.json();
    }
  }
}
