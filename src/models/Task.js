import { BaseModel } from "./BaseModel";

export class Task extends BaseModel {
    constructor(title, status, userId, userLogin, id = null,) {
        super(id);
        this.title = title;
        this.status = status;
        this.userId = userId; // задача принадлежит  
        this.userLogin = userLogin;
    }

}