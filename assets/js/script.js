const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const todoList = document.getElementById("drag-box"); // "To-Do" list container
const inProgressList = document.getElementById("in-progress"); // "In-Progress" list container
const completedList = document.getElementById("completed"); // "Completed" list container
const deletedList = document.getElementById("deleted"); // "Deleted" list container
const deleteAllIcon = document.querySelector(".delete-icon .fa-trash-can");

// Load tasks from local storage on page load
document.addEventListener("DOMContentLoaded", loadTasks);

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const value = input.value.trim();

  if (!value) {
    alert("Cannot add an empty task!"); // Optional: provide user feedback
    return;
  }

  const newTask = createTaskElement(value, "todo");
  todoList.appendChild(newTask);

  saveTaskToLocalStorage(value, "todo"); // Save the task to "todo" status
  input.value = "";
});

// Function to create a task element with drag events
function createTaskElement(taskText, status) {
  const newTask = document.createElement("li");
  newTask.classList.add("task");
  newTask.setAttribute("draggable", "true");

  // Create a span to display the task text
  const taskTextSpan = document.createElement("span");
  taskTextSpan.classList.add("task-text");
  taskTextSpan.textContent = taskText;

  // Create the edit icon
  const editIcon = document.createElement("i");
  editIcon.classList.add("fa-regular", "fa-pen-to-square");

  // Append the task text and edit icon to the task element
  newTask.appendChild(taskTextSpan);
  newTask.appendChild(editIcon);

  // Edit functionality
  editIcon.addEventListener("click", () => {
    // Create an input to edit the text
    const input = document.createElement("input");
    input.type = "text";
    input.value = taskTextSpan.textContent;
    input.classList.add("form-control");

    // Replace the span with the input field
    newTask.replaceChild(input, taskTextSpan);
    input.focus();

    // Save changes when pressing "Enter" or clicking outside the input
    input.addEventListener("blur", saveEdit);
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        saveEdit();
      }
    });

    function saveEdit() {
      const updatedText = input.value.trim();
      if (updatedText) {
        taskTextSpan.textContent = updatedText;
        updateTaskInLocalStorage(taskText, updatedText, status); // Update local storage
      }
      // Replace the input field back with the span
      newTask.replaceChild(taskTextSpan, input);
    }
  });

  // Drag events
  newTask.addEventListener("dragstart", () => {
    newTask.classList.add("is-dragging");
  });

  newTask.addEventListener("dragend", () => {
    newTask.classList.remove("is-dragging");
  });

  return newTask;
}

// Function to save a task to local storage under a specific status
function saveTaskToLocalStorage(task, status) {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || {
    todo: [],
    inProgress: [],
    completed: [],
    deleted: [],
  };
  tasks[status].push(task);
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function updateTaskInLocalStorage(oldText, newText, status) {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || {
    todo: [],
    inProgress: [],
    completed: [],
    deleted: [],
  };

  // Find and replace the old task text with the new one in the correct status
  const index = tasks[status].indexOf(oldText);
  if (index !== -1) {
    tasks[status][index] = newText;
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
}

// Function to load tasks from local storage into the respective containers
function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || {
    todo: [],
    inProgress: [],
    completed: [],
    deleted: [],
  };

  tasks.todo.forEach((task) =>
    todoList.appendChild(createTaskElement(task, "todo"))
  );
  tasks.inProgress.forEach((task) =>
    inProgressList.appendChild(createTaskElement(task, "inProgress"))
  );
  tasks.completed.forEach((task) =>
    completedList.appendChild(createTaskElement(task, "completed"))
  );
  tasks.deleted.forEach((task) =>
    deletedList.appendChild(createTaskElement(task, "deleted"))
  );
}

// Update local storage when task is moved between containers
function updateTaskStatus(taskText, oldStatus, newStatus) {
  const tasks = JSON.parse(localStorage.getItem("tasks"));
  tasks[oldStatus] = tasks[oldStatus].filter((task) => task !== taskText);
  tasks[newStatus].push(taskText);
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Add a click event listener to delete all tasks in the "deleted" container
deleteAllIcon.addEventListener("click", () => {
  const deletedContainer = document.getElementById("deleted");

  // Select all task elements inside the "deleted" container and remove them
  const tasks = deletedContainer.querySelectorAll(".task");
  tasks.forEach((task) => task.remove());

  // Update local storage to clear only the tasks in the "deleted" container
  const storedTasks = JSON.parse(localStorage.getItem("tasks")) || {
    todo: [],
    inProgress: [],
    completed: [],
    deleted: [],
  };

  // Clear only the 'deleted' tasks array
  storedTasks.deleted = [];

  // Save the updated tasks object back to local storage
  localStorage.setItem("tasks", JSON.stringify(storedTasks));

  console.log(
    "All tasks in the deleted container have been removed from local storage."
  );
});

function updateOrder() {
  // Get current tasks from local storage or initialize empty arrays
  const tasks = JSON.parse(localStorage.getItem("tasks")) || {
    todo: [],
    inProgress: [],
    completed: [],
    deleted: [],
  };

  // For each container, get the task order and save to local storage
  document.querySelectorAll(".list-container").forEach((zone) => {
    const status = zone.id; // get container ID (status)
    const taskElements = zone.querySelectorAll(".task"); // get tasks in the container

    // Clear the current list in local storage for this status before updating
    tasks[status] = [];

    // Loop through tasks and push them to the corresponding status in local storage
    taskElements.forEach((task) => {
      const taskText = task.innerText.trim();
      tasks[status].push(taskText); // store task in correct order
    });
  });

  // Save the updated tasks back to local storage
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Add drag-and-drop event listeners to each container
[todoList, inProgressList, completedList, deletedList].forEach((container) => {
  container.addEventListener("dragover", (e) => {
    e.preventDefault();
    const draggingTask = document.querySelector(".is-dragging");
    container.appendChild(draggingTask);
  });

  container.addEventListener("drop", (e) => {
    e.preventDefault();
    const draggingTask = document.querySelector(".is-dragging");
    const taskText = draggingTask.innerText.trim();
    const currentContainerId = draggingTask.parentElement.id;

    // Determine the old and new statuses based on container IDs
    let oldStatus, newStatus;
    if (currentContainerId === "drag-box") oldStatus = "todo";
    if (currentContainerId === "in-progress") oldStatus = "inProgress";
    if (currentContainerId === "completed") oldStatus = "completed";
    if (currentContainerId === "deleted") oldStatus = "deleted";

    if (container.id === "drag-box") newStatus = "todo";
    if (container.id === "in-progress") newStatus = "inProgress";
    if (container.id === "completed") newStatus = "completed";
    if (container.id === "deleted") newStatus = "deleted";

    // Update local storage if the task moved to a new container
    if (oldStatus !== newStatus) {
      updateTaskStatus(taskText, oldStatus, newStatus);
    }
  });
});
