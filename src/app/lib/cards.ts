export type Card = {
  value: number;
  suit: string;
};

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

    sortableCards.forEach((card: sortableCard) => {
      this.cards.push({ value: card.value, suit: card.suit });
    });
  }

  private createSuit(suit: string): sortableCard[] {
    const cards: sortableCard[] = [];
    for (let i = 2; i <= 14; i++) {
      const card = { value: i, suit: suit, sort: Math.random() };
      cards.push(card);
    }
    return cards;
  }
}
