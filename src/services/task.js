import { getFromStorage, addToStorage } from "../utils";
import { Task } from "../models/Task";

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
// Удалить задачу
export const deleteTask = (id) => {
  const tasks = getTasks();
  const updatedTasks = tasks.filter((t) => t.id !== id);
  localStorage.setItem("tasks", JSON.stringify(updatedTasks.map((t) => ({ id: t.id, title: t.title, status: t.status }))));
};