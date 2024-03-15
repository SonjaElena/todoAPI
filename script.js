// Access the list directly by its ID
const todoList = document.getElementById("list-container");
let todos = [];
const inputField = document.getElementById("input-box");
const urlHost = "http://localhost:4730/todos";
const addBtn = document.querySelector("#addTask");
const rmBtn = document.querySelector("#removeTask");
const filterBtns = document.querySelectorAll("[name='filterType']");
let uniqueIdCounter = 0;

// Fetch todos on initial load
fetchTodos();

// Fetch API state
function fetchTodos() {
  fetch(urlHost)
    .then((res) => res.json())
    .then((todosFromApi) => {
      todos = todosFromApi;
      renderTodos();
    })
    .catch((error) => console.error("Error fetching todos:", error));
}

// Render todos from the fetched data
function renderTodos() {
  todoList.innerHTML = "";
  todos.forEach((todo) => {
    const newLi = document.createElement("li");
    newLi.textContent = todo.description;
    if (todo.done) {
      newLi.classList.add("checked");
    }
    newLi.classList.add("liElement");
    newLi.setAttribute("id", "task-" + todo.id);
    todoList.appendChild(newLi);
  });
}

// Add new task
addBtn.addEventListener("click", addTask);

inputField.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    addTask();
  }
});

function addTask() {
  const listItems = Array.from(todoList.getElementsByTagName("li"));
  const double = listItems.some(
    (item) =>
      item.textContent.trim().toLowerCase() ===
      inputField.value.trim().toLowerCase()
  );

  if (inputField.value === "" || double) {
    alert("Write a new to do to add to your list");
    return;
  }

  const newTodo = {
    description: inputField.value,
    done: false,
  };

  fetch(urlHost, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newTodo),
  })
    .then((res) => res.json())
    .then((newTodoFromApi) => {
      todos.push(newTodoFromApi);
      renderTodos();
      inputField.value = "";
    })
    .catch((error) => console.error("Error adding task:", error));
}

// Toggle task status
todoList.addEventListener("click", toggleTaskStatus);

function toggleTaskStatus(e) {
  if (e.target.tagName === "LI") {
    const index = Array.from(todoList.children).indexOf(e.target);
    todos[index].done = !todos[index].done;
    const updatedTodo = todos[index];
    const urlID = urlHost + "/" + updatedTodo.id;

    fetch(urlID, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedTodo),
    })
      .then((res) => res.json())
      .then(() => renderTodos())
      .catch((error) => console.error("Error updating task:", error));
  }
}

// Remove completed tasks
rmBtn.addEventListener("click", removeCompletedTasks);

function removeCompletedTasks() {
  const doneIds = todos.filter((todo) => todo.done).map((todo) => todo.id);
  doneIds.forEach((id) => {
    const index = todos.findIndex((todo) => todo.id === id);
    if (index !== -1) {
      todoList.children[index].remove();
      todos.splice(index, 1);

      const urlID = urlHost + "/" + id;
      fetch(urlID, {
        method: "DELETE",
      })
        .then(() => console.log(`Task with ID ${id} deleted.`))
        .catch((error) =>
          console.error(`Error deleting task with ID ${id}:`, error)
        );
    }
  });
}

// Filter toggle
filterBtns.forEach((btn) => {
  btn.addEventListener("click", function () {
    filterTodos(btn);
  });
});

// Filter
function filterTodos(radio) {
  // Es kann nur ein Button ausgewählt werden.
  filterBtns.forEach((button) => {
    if (button !== radio) {
      button.checked = false;
    }
  });

  // Filterkriterium button
  const filterKrit =
    radio.id === "done" ? "done" : radio.id === "open" ? "open" : "all";
  console.log(filterKrit);

  // Filterkriterium doneStatus
  const indexArraydone = [];
  const todoElements = document.querySelectorAll(".liElement");
  todoElements.forEach((todo) => {
    if (todo.classList.contains("checked")) {
      indexArraydone.push(todo.id);
    }
  });
  console.log(indexArraydone);

  // apply filter criteria
  todoElements.forEach((todo) => {
    if (
      (filterKrit === "open" && indexArraydone.includes(todo.id)) ||
      (filterKrit === "done" && !indexArraydone.includes(todo.id))
    ) {
      todo.style.display = "none";
    } else {
      todo.style.display = "list-item";
    }
  });
}
