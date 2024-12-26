const draggables = document.querySelectorAll(".task");
const droppables = document.querySelectorAll(".list-container"); // Each container: todo, inProgress, completed, deleted

// Add drag events to each task
draggables.forEach((task) => {
  task.addEventListener("dragstart", () => {
    task.classList.add("is-dragging");
  });
  task.addEventListener("dragend", () => {
    task.classList.remove("is-dragging");
  });
});

// Add dragover and drop events to each drop zone
droppables.forEach((zone) => {
  zone.addEventListener("dragover", (e) => {
    e.preventDefault();

    const bottomTask = insertAboveTask(zone, e.clientY);
    const curTask = document.querySelector(".is-dragging");

    if (!bottomTask) {
      zone.appendChild(curTask);
    } else {
      zone.insertBefore(curTask, bottomTask);
    }
  });

  zone.addEventListener("drop", () => {
    const curTask = document.querySelector(".is-dragging");
    const taskText = curTask.innerText.trim();

    // Determine the new status based on the zone's ID
    let newStatus;
    if (zone.id === "drag-box") newStatus = "todo";
    if (zone.id === "in-progress") newStatus = "inProgress";
    if (zone.id === "completed") newStatus = "completed";
    if (zone.id === "deleted") newStatus = "deleted";

    // Check if the task is being dragged from "inProgress" or "completed" to "deleted"
    const currentStatus = getCurrentStatus(taskText);
    if (
      currentStatus &&
      (currentStatus === "inProgress" || currentStatus === "completed") &&
      newStatus === "deleted"
    ) {
      alert("Tasks from 'In Progress' or 'Completed' cannot be deleted.");
      return;
    }

    // Update the task status and position in local storage
    const tasks = JSON.parse(localStorage.getItem("tasks")) || {
      todo: [],
      inProgress: [],
      completed: [],
      deleted: [],
    };

    // Remove the task from its old position
    let oldStatus = null;
    for (const status in tasks) {
      const index = tasks[status].indexOf(taskText);
      if (index > -1) {
        oldStatus = status;
        tasks[status].splice(index, 1); // Remove the task from its old position
        break;
      }
    }

    // Add the task to the new status and update its position
    if (newStatus === oldStatus) {
      // Find the new index based on the current order in the DOM
      const tasksInZone = Array.from(zone.querySelectorAll(".task")).map((el) =>
        el.innerText.trim()
      );
      tasks[newStatus] = tasksInZone;
    } else {
      tasks[newStatus].push(taskText);
    }

    // Save updated tasks back to local storage
    localStorage.setItem("tasks", JSON.stringify(tasks));
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
    if (tasks[status].includes(taskText)) {
      return status;
    }
  }

  return null;
};
