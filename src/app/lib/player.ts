import { Card } from "./cards";

export class Player {
  constructor(
    public cards: Card[],
    public id: string,
    public name: string,
    public cash: number
  ) {}
}
