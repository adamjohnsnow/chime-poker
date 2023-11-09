import { Card, Deck } from "./cards";
import * as uuid from "uuid";

const SPECIAL_CARDS = [2, 10];

export class ShedPlayer {
  public id: string;
  public handCards: Card[];
  public upCards: Card[];
  public downCards: Card[];

  constructor() {
    this.id = uuid.v4();
    this.handCards = [];
    this.downCards = [];
    this.upCards = [];
  }
}

export function canPlay(targetCard: Card, playerCard: Card) {
  if (
    targetCard.value <= playerCard.value ||
    SPECIAL_CARDS.some((val) => playerCard.value === val)
  ) {
    return true;
  }
  return false;
}

export class ShedGame {
  public id: string;
  public drawPile: Card[];
  public playedPile: Card[];
  constructor(id: string) {
    this.id = id;
    this.playedPile = [];
    this.drawPile = [];
  }

  public deal(players: ShedPlayer[]) {
    const deck = new Deck();
    const cardCount = players.length * 9;
    this.playedPile = deck.cards.slice(cardCount, cardCount + 1);
    this.drawPile = deck.cards.slice(cardCount + 1);

    let cardIndex = 0;

    for (let i = 0; i < 3; i++) {
      for (let playerIndex = 0; playerIndex < players.length; playerIndex++) {
        players[playerIndex].downCards.push(deck.cards[cardIndex]);
        cardIndex++;
      }
    }

    for (let i = 0; i < 6; i++) {
      for (let playerIndex = 0; playerIndex < players.length; playerIndex++) {
        players[playerIndex].handCards.push(deck.cards[cardIndex]);
        cardIndex++;
      }
    }
  }
}
