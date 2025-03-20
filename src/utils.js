import { User } from "./models/User";

export const getFromStorage = function (key) {
  //localStorage.setItem(key, JSON.stringify(storageData));
  return JSON.parse(localStorage.getItem(key) || "[]");
};

export const addToStorage = function (obj, key = "users") {
  const storageData = getFromStorage(key); // Загружаем всех пользователей
  storageData.push(obj);

  localStorage.setItem(key, JSON.stringify(storageData));
};

export const generateTestUser = function (User) {
  localStorage.clear();

  const users = [
    new User("admin", "admin123", "admin"), // Администратор
    new User("test2", "qwerty123", "user"), // Обычный пользователь
    new User("test", "qwerty123", "user") // Обычный пользователь
  ];

  users.forEach(user => User.save(user)); // Сохраняем всех пользователей
};

// создание под админом
//TODO всегда убирать пробелы?
export const addUser = function (login, password, role = "user") {
  const users = getFromStorage("users");

  //TODO
  if (users.find(user => user.login === login)) {
    alert(`Пользователь "${login}" уже существует!`);
    return false;
  }

  const newUser = new User(login, password, role); // Создаем нового пользователя
  users.push(newUser); // Добавляем его в массив
  localStorage.setItem("users", JSON.stringify(users)); // Сохраняем обновленный массив
  return newUser; // Возвращаем созданного пользователя
};