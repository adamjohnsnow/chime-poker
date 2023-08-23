import * as uuid from "uuid";
import { Card } from "./cards";

export class Player {
  public cards: Card[];
  public id: string;
  public name: string;

  constructor(name: string) {
    this.id = uuid.v4();

    this.cards = [];
    this.name = name;
  }
}
