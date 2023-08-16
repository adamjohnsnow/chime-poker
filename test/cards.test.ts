import { Deck, Card } from "../src/app/lib/cards";
import { describe, expect, test } from "@jest/globals";

describe("deck class", () => {
  test("the deck has 52 unique cards", () => {
    const deck = new Deck();
    expect(deck.cards[0]).toBeInstanceOf(Card);
    expect(deck.cards.length).toBe(52);

    let unique = true;
    const seenCards = new Set();
    deck.cards.forEach((card) => {
      const cardString = JSON.stringify(card);
      if (seenCards.has(cardString)) {
        unique = false;
      }
      seenCards.add(cardString);
    });

    expect(unique).toBeTruthy;
  });
});
