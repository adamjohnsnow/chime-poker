import { Card, Deck } from "./cards";

const SPECIAL_CARDS = [2, 10];

export class ShedPlayer {
  public handCards: Card[];
  public upCards: Card[];
  public downCards: Card[];

  constructor() {
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
  public drawPile: Card[];
  public playedPile: Card[];
  constructor(players: ShedPlayer[]) {
    this.playedPile = [];
    this.drawPile = [];

    const deck = new Deck();
    this.playedPile = deck.cards.slice(
      players.length * 9,
      players.length * 9 + 1
    );
    this.drawPile = deck.cards.slice(players.length * 9 + 1);

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
