import { Card } from "../src/app/actions/cards";
import { Rank, evaluateKinds, handEvaluator } from "../src/app/actions/hands";
import { describe, expect, test } from "@jest/globals";

describe("hand evaluator", () => {
  test("returns high card", () => {
    const cards: Card[] = [
      new Card(7, "♥️"),
      new Card(8, "♥️"),
      new Card(4, "♦️"),
    ];
    const result = handEvaluator(cards);

    expect(result.rank).toBe(Rank.HighCard);
    expect(result.cards[0].value).toEqual(8);
  });

  test("returns four of a kind", () => {
    const card1 = new Card(7, "♥️");
    const card2 = new Card(7, "♦️");
    const card3 = new Card(7, "♣️");
    const card4 = new Card(7, "♠️");
    const cards: Card[] = [card1, card2, new Card(4, "♦️"), card3, card4];

    const result = evaluateKinds(cards);

    expect(result?.rank).toBe(Rank.FourOfAKind);
    expect(result?.cards.length).toEqual(4);
    expect(result?.cards.includes(card1)).toBeTruthy;
    expect(result?.cards.includes(card2)).toBeTruthy;
    expect(result?.cards.includes(card3)).toBeTruthy;
    expect(result?.cards.includes(card4)).toBeTruthy;
  });

  test("returns a pair", () => {
    const card1 = new Card(7, "♥️");
    const card2 = new Card(7, "♦️");
    const cards: Card[] = [card1, card2, new Card(4, "♦️")];
    const result = evaluateKinds(cards);
    expect(result?.rank).toBe(Rank.OnePair);
    expect(result?.cards.length).toEqual(2);
    expect(result?.cards.includes(card1)).toBeTruthy;
    expect(result?.cards.includes(card2)).toBeTruthy;
  });

  test("returns three of a kind", () => {
    const card1 = new Card(7, "♥️");
    const card2 = new Card(7, "♦️");
    const card3 = new Card(7, "♣️");
    const cards: Card[] = [card1, card2, new Card(4, "♦️"), card3];
    const result = evaluateKinds(cards);
    expect(result?.rank).toBe(Rank.ThreeOfAKind);
    expect(result?.cards.length).toEqual(3);
    expect(result?.cards.includes(card1)).toBeTruthy;
    expect(result?.cards.includes(card2)).toBeTruthy;
    expect(result?.cards.includes(card3)).toBeTruthy;
  });
});
