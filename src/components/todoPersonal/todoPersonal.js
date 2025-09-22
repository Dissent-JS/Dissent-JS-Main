import './todoPersonal.scss';

export default class todoPersonal {
  constructor(element) {
    this.element = element;
  }

  async init() {
    if (process.env.NODE_ENV !== 'production') {
      const response = await fetch('components/todoPersonal/todoPersonal.html');
      const todoPersonalhtml = await response.text();
      this.element.innerHTML = todoPersonalhtml;
    }

    // Initialize the component directly
    this.initializeTodoComponent();
  }

  initializeTodoComponent() {
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');
    const addButton = document.getElementById('todo-button');

    // Load existing todos from local storage
    loadTodos();

    addButton.addEventListener('click', function (event) {
      event.preventDefault();
      console.log('click');
      addTodo();
    });

    todoForm.addEventListener('submit', function (event) {
      event.preventDefault();
      console.log('submit');
      addTodo();
    });

    function addTodo() {
      const todoText = todoInput.value.trim();
      console.log(todoText);
      if (todoText.length > 0) {
        const todoItem = createTodoItem(todoText);
        todoList.appendChild(todoItem);
        console.log(todoItem);
        saveTodo(todoText);
        todoInput.value = '';
      }
    }

    function createTodoItem(text) {
      const li = document.createElement('li');
      li.textContent = text;
      li.addEventListener('click', function () {
        todoList.removeChild(li);
        removeTodo(text);
      });
      return li;
    }

    function saveTodo(todoText) {
      const todos = getTodos();
      todos.push(todoText);
      localStorage.setItem('todos', JSON.stringify(todos));
    }

    function removeTodo(todoText) {
      const todos = getTodos();
      const index = todos.indexOf(todoText);
      if (index !== -1) {
        todos.splice(index, 1);
        localStorage.setItem('todos', JSON.stringify(todos));
      }
    }

    function loadTodos() {
      const todos = getTodos();
      todos.forEach(todoText => {
        const todoItem = createTodoItem(todoText);
        todoList.appendChild(todoItem);
      });
    }

    function getTodos() {
      const todos = localStorage.getItem('todos');
      return todos ? JSON.parse(todos) : [];
    }
  }
}
