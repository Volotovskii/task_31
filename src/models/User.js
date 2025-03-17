import { BaseModel } from "./BaseModel";
import { getFromStorage, addToStorage } from "../utils";

export class User extends BaseModel {
  constructor(login, password, role = "user") {
    super();
    this.login = login;
    this.password = password;
    this.storageKey = role;
  }
  get hasAccess() {

    const users = getFromStorage("users"); // Загружаем всех пользователей
    if (users.length == 0) return false;
    for (let user of users) {
      if (user.login == this.login && user.password == this.password)
        return true;
    }
    return false;
  }

  static save(user) {
    try {
      //addToStorage(user, user.storageKey);
      addToStorage(user);
      return true;
    } catch (e) {
      throw new Error(e);
    }
  }
}
