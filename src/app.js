import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/style.css";
import taskFieldTemplate from "./templates/taskField.html";
import noAccessTemplate from "./templates/noAccess.html";
import { User } from "./models/User";
import { generateTestUser } from "./utils";
import { State } from "./state";
import { authUser } from "./services/auth";

import { getTasks, addTask, updateTask, deleteTask, editTask, disableAllColumns, enableAllColumns } from "./services/task";
import { Task } from "./models/Task";
import { setupUserMenuActions, isAdmin } from "./services/userMenu"

export const appState = new State();
let draggedTaskId = null;

const loginForm = document.querySelector("#app-login-form");

generateTestUser(User);


loginForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const formData = new FormData(loginForm);
  const login = formData.get("login");
  const password = formData.get("password");


  if (authUser(login, password)) {


    document.querySelector("#content").innerHTML = taskFieldTemplate;
    const userLogin = document.getElementById("user-welcome");
    userLogin.textContent = `Добро пожаловать ${appState.currentUser.login}`;

    console.log('Добро пожаловать', appState.currentUser.login);

    // // Скрываем форму авторизации
    const loginForm = document.getElementById("app-login-form");
    if (loginForm) loginForm.classList.add("d-none"); // Добавляем класс d-none

    // // // Показываем панель пользователя
    const userMenuContainer = document.getElementById("user-menu-container");
    if (userMenuContainer) userMenuContainer.style.display = "block";

    setupUserMenuActions(); // меню
    workingButtons(); // кнопки к задачам 

    appState.tasks = getTasks(); // Загружаем задачи из localStorage
    renderTasks(); // Рендерим задачи

  } else {
    alert("Доступ запрещен! Проверьте логин и пароль.");
    document.querySelector("#content").innerHTML = noAccessTemplate;
  }


});

// TODO подумать для нового рендера (перенести в таск?)
export function workingButtons() {
  document.getElementById("add-backlog-card").addEventListener("click", () => addNewTask("backlog"));
  document.getElementById("add-ready-card").addEventListener("click", () => moveTaskFromList("backlog", "ready"));
  document.getElementById("add-in-progress-card").addEventListener("click", () => moveTaskFromList("ready", "in-progress"));
  document.getElementById("add-finished-card").addEventListener("click", () => moveTaskFromList("in-progress", "finished"));
}


// Добавление новой задачи
function addNewTask(status) {
  disableAllColumns(); // Отключаем все колонки

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Enter task title";
  input.classList.add("form-control", "mb-2");

  const submitButton = document.createElement("button");
  submitButton.textContent = "Submit";
  submitButton.classList.add("btn", "btn-primary", "w-100");

  // Скрыть Add
  hideButtonAll(status);

  const list = document.querySelector(`#${status}-list`);
  list.appendChild(input);
  list.appendChild(submitButton);


  // Обработчик потери фокуса (blur)
  function offFocusBlur() {
    saveTask(input.value.trim(), status);
  }

  function onFocusSubmitButton() {
    saveTask(input.value.trim(), status);
  }


  function saveTask(title, status) {
    if (title) {

      const newTask = new Task(title, status, appState.currentUser.storageKey, appState.currentUser.login); // Создаем новую задачу

      console.log('newTask- ', newTask, 'appState.currentUser.login- ', appState.currentUser.login);
      addTask(newTask); // Сохраняем её в localStorage
      appState.tasks.push(newTask); // Добавляем в глобальное состояние

      renderTasks(); // Перерисовываем Kanban-доску

    }

    // Проверить есть элемент 
    if (input.parentNode === list) list.removeChild(input);
    if (submitButton.parentNode === list) list.removeChild(submitButton);

    enableAllColumns(); // Включаем все колонки обратно
    // Показать Add
    hideButtonAll(status);
  }

  submitButton.addEventListener("click", onFocusSubmitButton);
  input.addEventListener("blur", offFocusBlur); // Обработка потери фокуса не рабоатет 

  input.focus();
}

// TODO переносить в отдельный файл move \ render
// Рендеринг задач
export function renderTasks() {

  console.log("Rendering tasks. Current state:", appState.tasks);
  //let draggedTaskId = null;  // перенести глобально , но отрисовываю пока полностью 
  console.log('после начала перестаскивания ')

  const columns = document.querySelectorAll(".kanban-column"); // все колонки 
  columns.forEach(column => {

    const status = column.dataset.status; // Статус колонки (backlog, ready и т.д.)

    const listElement = column.querySelector(`#${status}-list`);

    if (!listElement) {
      console.error(`Список для статуса ${status} не найден!`);
      return;
    }

    listElement.innerHTML = ""; // Очищаем список

    console.log(`Rendering tasks for status: ${status}`);

    // TODO Фильтруем по id логина ? 
    // Фильтруем задачи по userId, если пользователь не администратор userId(задача) => storageKey (пользователь)
    const tasksForList = isAdmin(appState.currentUser) ? appState.tasks.filter(task => task.status === status)
      : appState.tasks.filter(task => task.status === status && task.userId === appState.currentUser.storageKey && task.userLogin === appState.currentUser.login);

    console.log(`Tasks for ${status}:`, tasksForList);

    //TODO вынести в отдельную функцию создание карточек и Модификация их 
    tasksForList.forEach((task) => {
      const item = document.createElement("div");
      item.classList.add("list-group-item", "mb-2", "draggable");
      item.dataset.taskId = task.id;
      //item.textContent = task.title;
      item.draggable = true; // Делаем элемент draggable
      //item.textContent = `${task.title} ${isAdmin(appState.currentUser) ? `(User: ${task.userId})` : ""}`;
      //item.textContent = task.title;

      // Заголовок задачи
      const taskTitle = document.createElement("span");
      taskTitle.textContent = task.title;

      // Информация об авторе
      const taskAuthor = document.createElement("span");
      taskAuthor.textContent = `Автор: ${task.userLogin}`;
      console.log('task', task);
      taskAuthor.style.display = "block"; //отдельной строкой
      taskAuthor.style.fontSize = "smaller"; // размер шрифта автора
      taskAuthor.style.borderTop = "1px solid #ccc";
      taskAuthor.style.paddingTop = "4px";

      // Добавить кнопки удаления и ред.
      const editingTask = document.createElement("button");
      editingTask.classList.add("btn", "btn-sm", "btn-secondary", "me-2", "quick-edit");
      editingTask.title = "Редактировать";
      editingTask.innerHTML = '<i class="bi bi-pencil-fill"></i>'; // Иконка редактирования
      editingTask.addEventListener("click", () => editTask(task.id));

      // const imgEdit = document.createElement("img");
      // imgEdit.src = "./assets/avatar.png";
      // imgEdit.alt = "Описание изображения"; // Важно для доступности
      // editingTask.appendChild(imgEdit);

      // Кнопка удаления
      const deleteButton = document.createElement("button");
      deleteButton.classList.add("btn", "btn-sm", "btn-danger", "quick-delete");
      deleteButton.title = "Удалить";
      deleteButton.innerHTML = '<i class="bi bi-trash-fill"></i>'; // Иконка удаления
      deleteButton.addEventListener("click", () => deleteTask(task.id));

      // Добавляем элементы в div
      item.appendChild(taskTitle);
      item.appendChild(taskAuthor);
      item.appendChild(editingTask);
      item.appendChild(deleteButton);


      // Обработчик dragstart
      item.addEventListener("dragstart", handleDragStart);
      item.addEventListener("dragend", handleDragEnd);

      listElement.appendChild(item);


      // Настройка drag&drop
      // item.addEventListener("dragstart", handleDragStart);
      // item.addEventListener("dragend", handleDragEnd);
      // Настройка drag&drop
      // item.addEventListener("dragstart", handleDragStart);
      // item.addEventListener("dragover", handleDragOver);
      // item.addEventListener("drop", handleDrop);
    });
    // Добавляем обработчики событий к колонке

    //column.addEventListener("drop",(e) => 


    column.addEventListener("dragenter", handleDragEnter); // Обработчик входа в зону
    column.addEventListener("dragleave", handleDragLeave); // Обработчик выхода из зоны
    column.addEventListener("dragover", handleDragOver); // Обработчик события dragover
    column.addEventListener("drop", handleDrop);
  });

  updateFooter(); // Обновляем футер
}

// Перемещение задачи из одного списка в другой
// Разместить тут закрытие кнопок add ?? под 3 состояния ? TODO
function moveTaskFromList(fromStatus, toStatus) {
  disableAllColumns(); // Отключаем все колонки

  const dropdown = document.createElement("select");
  dropdown.classList.add("form-select", "mb-2");



  const tasks = appState.tasks.filter((t) => t.status === fromStatus);
  tasks.forEach((task) => {
    const option = document.createElement("option");
    option.value = task.id;
    option.textContent = task.title;
    dropdown.appendChild(option);
  });

  // перемещение задач
  const buttonMovingTask = document.createElement("button");
  buttonMovingTask.textContent = "Add";
  buttonMovingTask.classList.add("btn", "btn-primary", "w-100");

  const buttonCancelTask = document.createElement("button");
  buttonCancelTask.textContent = "cancel";
  buttonCancelTask.classList.add("btn", "btn-danger", "w-100");

  const list = document.querySelector(`#${toStatus}-list`);
  list.appendChild(dropdown);
  list.appendChild(buttonMovingTask);
  list.appendChild(buttonCancelTask);

  // Скрыть Add
  hideButtonAll(toStatus);

  // Обработчик потери фокуса (blur)
  function offFocusBlur() {
    console.log('moveTaskFromList tasks');
    muveTaskButton(dropdown.value, toStatus);
  }

  function onFocusSubmitButton() {
    muveTaskButton(dropdown.value, toStatus);
  }

  // Кнопка отметы при move
  function onFocusCancelButton() {
    if (dropdown.parentNode === list) list.removeChild(dropdown);
    if (buttonMovingTask.parentNode === list) list.removeChild(buttonMovingTask);
    if (buttonCancelTask.parentNode === list) list.removeChild(buttonCancelTask);
  
    enableAllColumns(); // Включаем все колонки обратно
    // Показать Add
    hideButtonAll(toStatus);
  }

  function muveTaskButton(selectedTaskId, toStatus) {

    if (selectedTaskId) {

      console.log("Moving task:", selectedTaskId, "to status:", toStatus);
      moveTask(selectedTaskId, toStatus);

    }
    console.log("Removing dropdown and button...");

    // list.removeChild(dropdown);
    // list.removeChild(button);

    if (dropdown.parentNode === list) list.removeChild(dropdown);
    if (buttonMovingTask.parentNode === list) list.removeChild(buttonMovingTask);
    if (buttonCancelTask.parentNode === list) list.removeChild(buttonCancelTask);

    enableAllColumns(); // Включаем все колонки обратно
    // Показать Add
    hideButtonAll(toStatus);
  }

  const fg12 = document.getElementById("ready-list");

  fg12.addEventListener("blur", offFocusBlur);

  buttonMovingTask.addEventListener("click", onFocusSubmitButton);
  buttonCancelTask.addEventListener("click", onFocusCancelButton);
  dropdown.addEventListener("blur", offFocusBlur); // Обработка потери фокуса не рабоатет 

  //dropdown.focus();
  // button.addEventListener("click", () => {

  //   const selectedTaskId = dropdown.value;

  //   if (selectedTaskId) {
  //     console.log("Moving task:", selectedTaskId, "to status:", toStatus);
  //     moveTask(selectedTaskId, toStatus);
  //     hideButtonAll(toStatus);
  //   }
  //   console.log("Removing dropdown and button...");

  //   list.removeChild(dropdown);
  //   list.removeChild(button);

  // });

}


function moveTask(id, newStatus) {
  // Находим задачу в appState.tasks
  const taskIndex = appState.tasks.findIndex((task) => task.id === id);

  if (taskIndex !== -1) {
    // Обновляем статус задачи в localStorage
    console.log("Updating task in localStorage:", id, newStatus);
    updateTask(id, { status: newStatus });

    // Обновляем статус задачи в appState.tasks
    appState.tasks[taskIndex].status = newStatus;

    // Перерисовываем Kanban-доску
    renderTasks();
    console.log("Updated task in memory:", appState.tasks.find((t) => t.id === id));

    checkLocalStorage();
  } else {
    console.error("Task not found with ID:", id);
  }
}

function updateFooter() {
  const activeTasksCount = appState.tasks.filter((t) => t.status === "backlog").length;
  const finishedTasksCount = appState.tasks.filter((t) => t.status === "finished").length;

  document.getElementById("active-tasks-count").textContent = activeTasksCount;
  document.getElementById("finished-tasks-count").textContent = finishedTasksCount;

  // Отключаем кнопки, если нет задач в предыдущем списке
  document.getElementById("add-ready-card").disabled = !appState.tasks.some((t) => t.status === "backlog");
  document.getElementById("add-finished-card").disabled = !appState.tasks.some((t) => t.status === "in-progress");
  document.getElementById("add-in-progress-card").disabled = !appState.tasks.some((t) => t.status === "ready");

}


// Скрыть\показать кнопку
function hideButtonAll(status) {

  const lists = {
    backlog: document.getElementById("add-backlog-card"),
    ready: document.getElementById("add-ready-card"),
    "in-progress": document.getElementById("add-in-progress-card"),
    finished: document.getElementById("add-finished-card"),
  };

  return lists[status].style.display = lists[status].style.display === 'none' ? 'block' : 'none';
}

// Удалить
// првоерит в консоли localStorage
function checkLocalStorage() {
  const storedTasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  console.log("Current state in localStorage:", storedTasks);
}


//TODO Перенести всё связанное с задачами в другой файл?  services/tasks 
// Drag&drop handlers
// /////////////////////////////////////////////////////////////////

function handleDragStart(event) {
  draggedTaskId = event.target.dataset.taskId;
  event.target.style.opacity = "0.5"; // Визуальный эффект
  setTimeout(() => event.target.style.display = "none", 0); // Скрываем элемент при перетаскивании
}


function handleDragEnd(event) {
  // Сохраняем текущий ID задачи
  const currentDraggedTaskId = draggedTaskId;

  // Сбрасываем ID перетаскиваемой задачи
  draggedTaskId = null;

  // Находим задачу в appState.tasks
  const taskItem = appState.tasks.find(task => task.id === currentDraggedTaskId);

  if (taskItem) {
    console.log('handleDragEnd');
    // Находим элемент задачи в DOM
    const domTaskItem = document.querySelector(`[data-task-id="${currentDraggedTaskId}"]`);

    if (domTaskItem) {
      domTaskItem.style.display = "block"; // Возвращаем видимость задачи
      domTaskItem.style.opacity = "1"; // Возвращаем прозрачность
    }
  }
}

function handleDragEnter(event) {
  event.preventDefault();
  const column = event.currentTarget;

  const targetStatus = column.dataset.status;

  // Получаем текущий статус задачи
  const currentTask = appState.tasks.find(task => task.id === draggedTaskId);
  //опциональная цепочка
  const currentStatus = currentTask?.status;

  if (currentStatus && isValidMove(currentStatus, targetStatus)) {
    column.classList.add("over"); // Подсвечиваем допустимую колонку
  }
}

function handleDragLeave(event) {
  const column = event.currentTarget;

  column.classList.remove("over"); // Убираем класс
}

function handleDragOver(event) {
  event.preventDefault();

  event.dataTransfer.dropEffect = "move"; // Указываем тип операции

  this.classList.add('over'); // без него подсветка не корректно работает
}

function handleDrop(event) {

  event.preventDefault();

  const column = event.currentTarget; // Контейнер колонки
  const targetStatus = column.dataset.status; // Получаем статус колонки

  if (!draggedTaskId || !targetStatus) return;

  const task = appState.tasks.find(task => task.id === draggedTaskId);
  if (task && isValidMove(task.status, targetStatus)) {
    moveTask(draggedTaskId, targetStatus); // Перемещаем задачу
  } else {
    alert("Невозможно переместить задачу!");
    renderTasks(); // TODO рендр всего 
  }

  column.classList.remove("over"); // Убираем выделение
}

// Условия переноса 
function isValidMove(currentStatus, newStatus) {
  const validMoves = {
    backlog: ["ready", "backlog"],
    ready: ["backlog", "in-progress", "ready"],
    "in-progress": ["finished", "ready", "backlog", "in-progress"],
    finished: ["finished"]
  };
  return validMoves[currentStatus]?.includes(newStatus) || false;
}
///////////////////////////////////////////////////////////////////
