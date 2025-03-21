import { getFromStorage } from "../utils";
import { Task } from "../models/Task";

// TODO
import { renderTasks, appState } from "../app";

let activeEditTaskId = null; // Редактирование только 1 задачи

// Получить все задачи
export const getTasks = () => {
  return getFromStorage("tasks").map((taskData) => new Task(taskData.title, taskData.status, taskData.userId, taskData.userLogin, taskData.id));
  //return JSON.parse(localStorage.getItem("tasks") || "[]").map((taskData) => new Task(taskData.title, taskData.status));
};

// Добавить новую задачу
export const addTask = (task) => {
  const tasks = getTasks();
  tasks.push(task);

  // Преобразуем задачи в простые объекты перед записью в localStorage
  const tasksForStorage = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    status: t.status,
    userId: t.userId,
    userLogin: t.userLogin
  }));
  localStorage.setItem("tasks", JSON.stringify(tasksForStorage)); // Сохраняем обновленные задачи
};

// обновляем при переносе
export function updateTask(id, updatedFields) {
  const tasks = getTasks(); // Получаем текущие задачи

  const updatedTasks = tasks.map((task) => {
    if (task.id === id) {

      console.log('-------------------------------------------------');
      console.log("Updating task in localStorage:", task, "with fields:", updatedFields);
      return { ...task, ...updatedFields }; // Обновляем задачу с указанными полями
    }
    return task; // Оставляем остальные задачи без изменений
  });

  const tasksForStorage = updatedTasks.map((task) => ({
    id: task.id,
    title: task.title,
    status: task.status,
    userId: task.userId,
    userLogin: task.userLogin
  }));

  // Сохраняем обновленный массив задач в localStorage
  localStorage.setItem("tasks", JSON.stringify(tasksForStorage));
}


// Удаление задачи
export function deleteTask(id) {
  let tasks = getFromStorage("tasks"); // Загружаем все задачи
  if (!tasks || tasks.length === 0) return false; // Если задач нет, ничего не делаем

  // Фильтруем задачи, исключая ту, которую нужно удалить
  const updatedTasks = tasks.filter(task => task.id !== id);

  // Сохраняем обновленный массив задач в localStorage
  localStorage.setItem("tasks", JSON.stringify(updatedTasks));

  console.log('-------------------------------------------------');
  console.log("Updated tasks in localStorage:", updatedTasks);

  // Обновляем глобальное состояние
  appState.tasks = updatedTasks; // Обновляем appState.tasks
  renderTasks();
  return true;
};


// изменить текст в задаче
// TODO Модальное окно?  убрать можно будет activeEditTaskId
export function editTask(id) {

  if (activeEditTaskId) {
    alert("Вы уже редактируете другую задачу!");
    return;
  }

  disableAllColumns();
  activeEditTaskId = id; // Устанавливаем ID активной задачи

  const task = appState.tasks.find(task => task.id === id);

  const input = document.createElement("input");
  input.type = "text";
  input.value = task.title;
  input.classList.add("form-control", "mb-2");

  const saveButton = document.createElement("button");
  saveButton.textContent = "Save";
  saveButton.classList.add("btn", "btn-primary", "w-100");

  const listElement = document.querySelector(`#${task.status}-list`);
  const taskItem = listElement.querySelector(`[data-task-id="${id}"]`);

  taskItem.style.display = "none";

  const formContainer = document.createElement("div");
  formContainer.classList.add("task-edit-form");
  formContainer.appendChild(input);
  formContainer.appendChild(saveButton);

  listElement.insertBefore(formContainer, taskItem.nextSibling);

  // Сохраняем изменения
  saveButton.addEventListener("click", () => {
    const newTitle = input.value.trim();
    if (newTitle) {

      task.title = newTitle;
      localStorage.setItem("tasks", JSON.stringify(appState.tasks));
      renderTasks();
    } else {
      alert("Название задачи не может быть пустым!");
    }

    enableAllColumns();

    activeEditTaskId = null; // Устанавливаем ID активной задачи
    taskItem.style.display = "block"; // Возвращаем задачу
  });

  input.focus(); // Фокусируем на поле ввода
}

// отключаем все кнопки .btn-block (добавление-перемещение задачи)
//////
export function disableAllColumns() {
  const columns = document.querySelectorAll(".kanban-column");
  columns.forEach(column => column.classList.add("disabled-state"));

  console.log('-------------------------------------------------');
}

export function enableAllColumns() {
  const columns = document.querySelectorAll(".kanban-column");
  columns.forEach(column => column.classList.remove("disabled-state"));
}
//////

// Отключаем Drag'n'Drop
export function enbleDragDrop() {
  const columns = document.querySelectorAll(".kanban-column");
  columns.forEach(column => column.classList.add("disabled-state"));
}
