import { v4 as uuid } from "uuid";

export class BaseModel {
  constructor(id = null) {
    this.id = id || uuid();   // если id нету (новый)
  }
}
