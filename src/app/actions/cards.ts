export class Card {
  constructor(public value: number, public suit: string) {}
}

export type sortableCard = {
  value: number;
  suit: string;
  sort: number;
};

const SUITS = ["♦️", "♠️", "♥️", "♣️"];

export class Deck {
  public cards: Card[];

  constructor() {
    this.cards = [];

    let sortableCards: sortableCard[] = [];
    SUITS.forEach((suit) => {
      sortableCards = sortableCards.concat(this.createSuit(suit));
    });
    sortableCards.sort((a, b) => a.sort - b.sort);

    sortableCards.forEach((card) => {
      this.cards.push(new Card(card.value, card.suit));
    });
  }

  private createSuit(suit: string): sortableCard[] {
    const cards: sortableCard[] = [];
    for (let i = 1; i < 14; i++) {
      const card = { value: i, suit: suit, sort: Math.random() };
      cards.push(card);
    }
    return cards;
  }
}
