// services/userMenu.js


import noAccessTemplate from "../templates/noAccess.html";
import taskFieldTemplate from "../templates/taskField.html";
import { getFromStorage, addUser } from "../utils";


import { renderTasks, workingButtons, appState } from "../app";



let areHandlersAttached = false; // Флаг, указывающий, что обработчики уже установлены

// Настройка действий в меню
export function setupUserMenuActions() {
    const myAccountLink = document.getElementById("my-account");
    const myTasksLink = document.getElementById("my-tasks");
    const logOutLink = document.getElementById("log-out");
    const manageUser = document.getElementById("manage-users");

    if (areHandlersAttached) return; // Если обработчики уже установлены, ничего не делаем

    // удаляем ВСЕ обработчики
    // if (myAccountLink) myAccountLink.removeEventListener("click", null); 
    // if (myTasksLink) myTasksLink.removeEventListener("click", null);
    // if (logOutLink) logOutLink.removeEventListener("click", null);


    if (myAccountLink) {
        myAccountLink.addEventListener("click", function (event) {
            event.preventDefault();
            alert("Вы выбрали My Account!");
        });
    }

    if (myTasksLink) {

        myTasksLink.addEventListener("click", function (event) {
            event.preventDefault();
            console.log('myTasksLink');
            alert("Вы выбрали My Tasks!");
        });
    }

    if (logOutLink) {
        logOutLink.addEventListener("click", function (event) {
            event.preventDefault();
            // Вызов функции выхода
            logOutUser();
        });
    }

    if (manageUser) {
        manageUser.addEventListener("click", function (event) {
            event.preventDefault();

            if (isAdmin(appState.currentUser)) {
                showManageUsersForm(); // Показываем форму для управления пользователями
            } else {
                alert("Вы не администратор");
            }
        });

    }

    areHandlersAttached = true;
}


export function logOutUser() {
    // Очищаем текущего пользователя
    appState.currentUser = null;

    // Скрываем панель пользователя
    const userMenuContainer = document.getElementById("user-menu-container");
    if (userMenuContainer) userMenuContainer.style.display = "none";

    // Возвращаем форму авторизации
    document.querySelector("#content").innerHTML = noAccessTemplate;

    // Показываем форму авторизации
    const loginForm = document.getElementById("app-login-form");
    if (loginForm) loginForm.classList.remove("d-none"); // Убираем класс d-none

    const userLogin = document.getElementById("user-welcome");
    userLogin.textContent = ``;
}

// Показ формы для управления пользователями
function showManageUsersForm() {
    const content = document.querySelector("#content");
    content.innerHTML = `
        <h4>Manage Users</h4>
        <form id="add-user-form">
            <input class="form-control mb-2" name="login" placeholder="Login" required>
            <input class="form-control mb-2" name="password" type="password" placeholder="Password" required>
            <select class="form-select mb-2" name="role">
                <option value="user" selected>User</option>
                <option value="admin">Admin</option>
            </select>
            <button class="btn btn-primary mb-2" type="submit">Add User</button>
        </form>
        <div id="users-list" class="list-group"></div>
        <button id="back-to-tasks-btn" class="btn btn-secondary">Back to Tasks</button>
    `;

    initializeManageUsersForm(); // Инициализация формы
}



function initializeManageUsersForm() {

    const addUserForm = document.getElementById("add-user-form");
    const usersList = document.getElementById("users-list");
    const backToTasksButton = document.getElementById("back-to-tasks-btn");

    if (addUserForm) {
        addUserForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const formData = new FormData(addUserForm);
            const login = formData.get("login");
            const password = formData.get("password");
            const role = formData.get("role");

            if (login && password) {
                const newUser = addUser(login, password, role); // Добавляем нового пользователя
                if (!newUser) return addUserForm.reset();;

                alert(`Пользователь "${newUser.login}" успешно создан.`);
                renderUsers(); // Перерисовываем список пользователей
                addUserForm.reset(); // Очищаем форму
            } else {
                alert("Введите логин и пароль!");
            }
        });
    }

    if (usersList) {
        renderUsers(); // Рендерим список пользователей
    }

    if (backToTasksButton) {
        backToTasksButton.addEventListener("click", function () {
            document.querySelector("#content").innerHTML = taskFieldTemplate; // Возвращаем Kanban-доску
            workingButtons();
            renderTasks();
        });
    }
}

// Рендеринг списка пользователей
function renderUsers() {
    const usersList = document.getElementById("users-list");

    if (!usersList) return;

    usersList.innerHTML = ""; // Очищаем список

    const users = getFromStorage("users"); // Загружаем всех пользователей

    if (!users || users.length === 0) {
        const noUsersItem = document.createElement("div");
        noUsersItem.textContent = "Нет доступных пользователей.";
        noUsersItem.classList.add("list-group-item");
        usersList.appendChild(noUsersItem);

        return;
    }

    users.forEach(user => {
        const userItem = document.createElement("div");
        userItem.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");

        const userText = document.createElement("span");
        userText.textContent = `${user.login} (${user.storageKey})`;

        const deleteUserButton = document.createElement("button");
        deleteUserButton.textContent = "Delete";
        deleteUserButton.classList.add("btn", "btn-danger", "btn-sm");
        deleteUserButton.addEventListener("click", function (event) {
            event.stopPropagation();
            const confirmDelete = window.confirm(`Удалить пользователя "${user.login}"?`);
            if (confirmDelete) {
                removeUser(user.id); // Удаляем пользователя
                alert(`Пользователь "${user.login}" удален.`);
                renderUsers(); // Перерисовываем список
            }
        });

        userItem.appendChild(userText);
        userItem.appendChild(deleteUserButton);
        usersList.appendChild(userItem);
    });
}

// Проверяем админа
export function isAdmin(user) {
    return user && user.storageKey === "admin"; // Администратор имеет роль "admin"
}

// TODO удалил сам себя
// Удаление user
export const removeUser = function (userId) {
    let users = getFromStorage("users"); // Загружаем всех пользователей
    if (!users) return false;

    // Удаляем пользователя по ID
    users = users.filter(user => user.id !== userId);

    // Сохраняем обновленный массив
    localStorage.setItem("users", JSON.stringify(users));
    return true;
};