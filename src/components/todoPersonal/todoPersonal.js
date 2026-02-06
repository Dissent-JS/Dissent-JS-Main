import './todoPersonal.scss';

export default class todoPersonal {
  constructor(element) {
    this.element = element;
  }

  async init() {
    if (process.env.NODE_ENV !== 'production') {
      try {
        const response = await fetch('components/todoPersonal/todoPersonal.html');
        const todoPersonalhtml = await response.text();
        this.element.innerHTML = todoPersonalhtml;
      } catch (error) {
        console.error('Failed to load todoPersonal component:', error);
        return;
      }
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
      try {
        const todos = localStorage.getItem('todos');
        if (!todos) return [];
        const parsed = JSON.parse(todos);
        // Validate that parsed data is an array of strings
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(item => typeof item === 'string');
      } catch (error) {
        console.error('Failed to parse todos from localStorage:', error);
        return [];
      }
    }
  }
}
