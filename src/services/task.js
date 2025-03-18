import { getFromStorage } from "../utils";
import { Task } from "../models/Task";

// TODO
import { renderTasks, appState } from "../app";

// Получить все задачи
export const getTasks = () => {
  // id (статик id)
  //console.log('Task new',Task(taskData.title, taskData.status,taskData.userId,taskData.userLogin,taskData.id) );

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

  //localStorage.setItem("tasks", JSON.stringify(tasks.map((t) => ({ id: t.id, title: t.title, status: t.status }))));
  console.log("Added task. Updated tasks in localStorage:", tasks);
};


export function updateTask(id, updatedFields) {
  const tasks = getTasks(); // Получаем текущие задачи

  const updatedTasks = tasks.map((task) => {
    if (task.id === id) {

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

  console.log("Updated tasks in localStorage:", tasksForStorage);
}


// Удаление задачи
export function deleteTask(id) {
  let tasks = getFromStorage("tasks"); // Загружаем все задачи
  if (!tasks || tasks.length === 0) return false; // Если задач нет, ничего не делаем

  console.log("Deleting task with ID:", id);

  // Фильтруем задачи, исключая ту, которую нужно удалить
  const updatedTasks = tasks.filter(task => task.id !== id);

  // Сохраняем обновленный массив задач в localStorage
  localStorage.setItem("tasks", JSON.stringify(updatedTasks));

  console.log("Updated tasks in localStorage:", updatedTasks);

  // Обновляем глобальное состояние
  appState.tasks = updatedTasks; // Обновляем appState.tasks
  renderTasks();
  return true;
};

// изменить титл
export function editTask(id) {
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
    //listElement.removeChild(formContainer); // Удаляем форму
    taskItem.style.display = "block"; // Возвращаем задачу
});

input.focus(); // Фокусируем на поле ввода
}