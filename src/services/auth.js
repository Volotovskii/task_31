import { appState } from "../app";
import { User } from "../models/User";
import { getFromStorage } from "../utils";

//TODO странный поиск по (login, password
// Авторизация
export const authUser = function (login, password) {
  // const user = new User(login, password);
  const users = getFromStorage("users"); // Загружаем всех пользователей


  const user = users.find((u) => u.login === login && u.password === password);
  if (!user) return false;

  //if (!user.hasAccess) return false;

  appState.currentUser = user;

  return true;

};


