
const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");
const formError = document.querySelector("#form-error");

const totalCount = document.querySelector("#total-count");
const completedCount = document.querySelector("#completed-count");
const remainingCount = document.querySelector("#remaining-count");
const tasksLeft = document.querySelector("#tasks-left");

const progressLabel = document.querySelector("#progress-label");
const progressBar = document.querySelector("#progress-bar");
const progressFill = document.querySelector("#progress-fill");

const filterContainer = document.querySelector("#task-filters");
const clearCompletedButton = document.querySelector("#clear-completed");
const themeToggle = document.querySelector("#theme-toggle");

let tasks = [];

try {
  tasks = JSON.parse(localStorage.getItem("studyflow-tasks")) || [];
  if (!Array.isArray(tasks)) tasks = [];
} catch {
  tasks = [];
}

let currentFilter = "all";

function saveTasks() {
  localStorage.setItem("studyflow-tasks", JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = "";

  const visibleTasks = tasks.filter((task) => {
    if (currentFilter === "active") return !task.completed;
    if (currentFilter === "completed") return task.completed;
    return true;
  });

  visibleTasks.forEach((task) => {
    const item = document.createElement("li");
    item.className = `task-item${task.completed ? " task-completed" : ""}`;

    const label = document.createElement("label");
    label.className = "task-label";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Complete ${task.title}`);

    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = task.title;

    label.append(checkbox, title);

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-task";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", `Delete ${task.title}`);

    deleteButton.addEventListener("click", () => {
      tasks = tasks.filter((item) => item.id !== task.id);
      saveTasks();
      renderTasks();
    });

    item.append(label, deleteButton);
    taskList.append(item);
  });

  const completed = tasks.filter((task) => task.completed).length;
  const remaining = tasks.length - completed;
  const percentage = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;

  totalCount.textContent = tasks.length;
  completedCount.textContent = completed;
  remainingCount.textContent = remaining;
  tasksLeft.textContent = `${remaining} ${remaining === 1 ? "task" : "tasks"} left`;

  progressLabel.textContent = `${percentage}% complete`;
  progressBar.setAttribute("aria-valuenow", percentage);
  progressFill.style.width = `${percentage}%`;

  emptyState.hidden = visibleTasks.length > 0;
  clearCompletedButton.disabled = completed === 0;
}

function updateFilterButtons() {
  filterContainer.querySelectorAll("[data-filter]").forEach((button) => {
    const selected = button.dataset.filter === currentFilter;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = taskInput.value.trim();

  if (!title) {
    formError.textContent = "Please enter a task before adding it.";
    taskInput.focus();
    return;
  }

  tasks.push({
    id: crypto.randomUUID(),
    title,
    completed: false,
  });

  saveTasks();
  currentFilter = "all";
  updateFilterButtons();

  formError.textContent = "";
  taskForm.reset();
  renderTasks();
  taskInput.focus();
});

filterContainer.addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;

  currentFilter = button.dataset.filter;
  updateFilterButtons();
  renderTasks();
});

clearCompletedButton.addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
});

themeToggle.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark-mode");
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggle.textContent = isDark ? "☀ Light mode" : "☾ Dark mode";
  localStorage.setItem("studyflow-theme", isDark ? "dark" : "light");
});

if (localStorage.getItem("studyflow-theme") === "dark") {
  document.body.classList.add("dark-mode");
  themeToggle.setAttribute("aria-pressed", "true");
  themeToggle.textContent = "☀ Light mode";
} else {
  themeToggle.setAttribute("aria-pressed", "false");
}

renderTasks();

