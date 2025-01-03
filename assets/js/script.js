const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const todoList = document.getElementById("todo"); // "To-Do" list container
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
    alert("Cannot add an empty task!");
    return;
  }
  // new add
  // Fetch existing tasks from local storage
  const tasks = JSON.parse(localStorage.getItem("tasks")) || {
    todo: [],
    inProgress: [],
    completed: [],
    deleted: [],
  };

  // Check if the task already exists in any swim lane
  const isDuplicate = Object.values(tasks).some((taskList) =>
    taskList.some((task) => task.text.toLowerCase() === value.toLowerCase())
  );

  if (isDuplicate) {
    alert("This task already exists!");
    return;
  }
  // new add

  const newTask = createTaskElement(value, "todo");
  todoList.appendChild(newTask);

  saveTaskToLocalStorage(value, "todo");
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
    input.name = "edited-task";

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

  // Drag events for reordering tasks within the same container
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
  tasks[status].push({
    text: task,
    timestamp: status === "completed" ? new Date().getTime() : null,
  }); // Save task with timestamp if it's in completed
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
  const index = tasks[status].findIndex((task) => task.text === oldText);
  if (index !== -1) {
    tasks[status][index].text = newText; // Update task text
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

  // Load tasks into the containers
  tasks.todo.forEach((task) =>
    todoList.appendChild(createTaskElement(task.text, "todo"))
  );
  tasks.inProgress.forEach((task) =>
    inProgressList.appendChild(createTaskElement(task.text, "inProgress"))
  );
  tasks.completed.forEach((task) => {
    // Check if the task has been in "completed" for more than 12 hours
    if (new Date().getTime() - task.timestamp > 12 * 60 * 60 * 1000) {
      // Remove task if it's older than 12 hours
      removeTaskFromLocalStorage(task.text, "completed");
    } else {
      completedList.appendChild(createTaskElement(task.text, "completed"));
    }
  });
  tasks.deleted.forEach((task) =>
    deletedList.appendChild(createTaskElement(task.text, "deleted"))
  );
}

// Function to remove task from local storage
function removeTaskFromLocalStorage(taskText, status) {
  const tasks = JSON.parse(localStorage.getItem("tasks"));
  tasks[status] = tasks[status].filter((task) => task.text !== taskText);
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Update local storage when task is moved between containers
function updateTaskStatus(taskText, oldStatus, newStatus) {
  const tasks = JSON.parse(localStorage.getItem("tasks"));

  // Find and remove the task from the old status (before moving to new status)
  const taskIndex = tasks[oldStatus].findIndex(
    (task) => task.text === taskText
  );

  if (taskIndex !== -1) {
    const task = tasks[oldStatus].splice(taskIndex, 1)[0]; // Remove the task from the old status

    // If the task is moving to "completed", add the timestamp
    if (newStatus === "completed") {
      task.timestamp = new Date().getTime();
    }

    // Add the task to the new status (swim lane)
    tasks[newStatus].push(task);

    // Update the local storage with the updated tasks object
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
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
    if (currentContainerId === "todo") oldStatus = "todo";
    if (currentContainerId === "in-progress") oldStatus = "inProgress";
    if (currentContainerId === "completed") oldStatus = "completed";
    // if (currentContainerId === "deleted") oldStatus = "deleted";

    if (container.id === "todo") newStatus = "todo";
    if (container.id === "in-progress") newStatus = "inProgress";
    if (container.id === "completed") newStatus = "completed";
    // if (container.id === "deleted") newStatus = "deleted";

    // Update local storage if the task moved to a new container
    if (oldStatus !== newStatus) {
      updateTaskStatus(taskText, oldStatus, newStatus);
    }
  });
});
