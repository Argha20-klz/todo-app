const draggables = document.querySelectorAll(".task");
const droppables = document.querySelectorAll(".list-container");

// Add drag events to each task
draggables.forEach((task) => {
  task.addEventListener("dragstart", () => {
    task.classList.add("is-dragging");
  });
  task.addEventListener("dragend", () => {
    task.classList.remove("is-dragging");
  });
});

// Update local storage after a task is dropped in a new container
droppables.forEach((zone) => {
  zone.addEventListener("drop", (e) => {
    e.preventDefault();
    const curTask = document.querySelector(".is-dragging");
    if (!curTask) return;

    const taskText = curTask.querySelector(".task-text").textContent.trim();

    // Determine the current status of the task
    const currentStatus = getCurrentStatus(taskText);

    // Prevent drop if task is being moved from "inProgress" or "completed" to "deleted"
    if (
      (currentStatus === "inProgress" || currentStatus === "completed") &&
      zone.id === "deleted"
    ) {
      window.location.reload();
      window.alert("Cannot delete a task that is in progress or completed.");
      return; // Do nothing and prevent the drop
    }

    // Determine the new status based on the drop zone's ID
    let newStatus;
    if (zone.id === "todo") newStatus = "todo";
    if (zone.id === "in-progress") newStatus = "inProgress";
    if (zone.id === "completed") newStatus = "completed";
    if (zone.id === "deleted") newStatus = "deleted";

    // Get tasks from local storage
    const tasks = JSON.parse(localStorage.getItem("tasks")) || {
      todo: [],
      inProgress: [],
      completed: [],
      deleted: [],
    };

    // Remove the task from its old status
    for (const status in tasks) {
      tasks[status] = tasks[status].filter((task) => task.text !== taskText);
    }

    // Add the task to the new status
    const timestamp = Date.now(); // Update timestamp for the new status
    tasks[newStatus].push({ text: taskText, timestamp });

    // Save the updated tasks back to local storage
    localStorage.setItem("tasks", JSON.stringify(tasks));

    // Visually move the task to the new container
    zone.appendChild(curTask);
  });
});

// Helper function to find the task below the mouse position
const insertAboveTask = (zone, mouseY) => {
  const els = zone.querySelectorAll(".task:not(.is-dragging)");

  let closestTask = null;
  let closestOffset = Number.NEGATIVE_INFINITY;

  els.forEach((task) => {
    const { top } = task.getBoundingClientRect();

    const offset = mouseY - top;

    if (offset < 0 && offset > closestOffset) {
      closestOffset = offset;
      closestTask = task;
    }
  });

  return closestTask;
};

// Helper function to get the current status of a task from local storage
const getCurrentStatus = (taskText) => {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || {
    todo: [],
    inProgress: [],
    completed: [],
    deleted: [],
  };

  for (const status in tasks) {
    const task = tasks[status].find((task) => task.text === taskText);
    if (task) {
      return status;
    }
  }

  return null;
};
