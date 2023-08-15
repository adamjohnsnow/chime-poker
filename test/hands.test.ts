import { Card } from "../src/app/actions/cards";
import { Rank, handEvaluator } from "../src/app/actions/hands";
import { describe, expect, test } from "@jest/globals";

describe("hand evaluator", () => {
  test("returns high card", () => {
    const cards: Card[] = [
      new Card(7, "♥️"),
      new Card(8, "♥️"),
      new Card(4, "♦️"),
      new Card(1, "♦️"),
    ];
    const result = handEvaluator(cards);

    expect(result.rank).toBe(Rank.HighCard);
    expect(result.cards[0].value).toEqual(8);
  });

  test("returns a pair", () => {
    const card1 = new Card(7, "♥️");
    const card2 = new Card(7, "♦️");
    const cards: Card[] = [card1, card2, new Card(4, "♦️")];

    const result = handEvaluator(cards);

    expect(result?.rank).toBe(Rank.OnePair);
    expect(result?.cards.length).toEqual(2);
    expect(result?.cards.includes(card1)).toBeTruthy;
    expect(result?.cards.includes(card2)).toBeTruthy;
  });

  test("finds two pair", () => {
    const card1 = new Card(7, "♥️");
    const card2 = new Card(7, "♦️");
    const card3 = new Card(8, "♥️");
    const card4 = new Card(8, "♦️");
    const cards: Card[] = [card1, card2, new Card(4, "♦️"), card3, card4];

    const result = handEvaluator(cards);

    expect(result.rank).toBe(Rank.TwoPair);
    expect(result.cards.length).toEqual(4);
  });

  test("returns three of a kind", () => {
    const card1 = new Card(7, "♥️");
    const card2 = new Card(7, "♦️");
    const card3 = new Card(7, "♣️");
    const cards: Card[] = [card1, card2, new Card(4, "♦️"), card3];

    const result = handEvaluator(cards);

    expect(result?.rank).toBe(Rank.ThreeOfAKind);
    expect(result?.cards.length).toEqual(3);
    expect(result?.cards.includes(card1)).toBeTruthy;
    expect(result?.cards.includes(card2)).toBeTruthy;
    expect(result?.cards.includes(card3)).toBeTruthy;
  });

  test("returns straight", () => {
    const cards: Card[] = [
      new Card(13, "♥️"),
      new Card(1, "♣️"),
      new Card(7, "♠️"),
      new Card(8, "♦️"),
      new Card(9, "♥️"),
      new Card(10, "♦️"),
      new Card(6, "♦️"),
    ];

    const result = handEvaluator(cards);

    expect(result.rank).toBe(Rank.Straight);
  });

  test("returns not straight", () => {
    const cards: Card[] = [
      new Card(11, "♥️"),
      new Card(1, "♣️"),
      new Card(7, "♠️"),
      new Card(8, "♦️"),
      new Card(2, "♥️"),
      new Card(10, "♦️"),
      new Card(6, "♦️"),
    ];

    const result = handEvaluator(cards);

    expect(result.rank).not.toBe(Rank.Straight);
  });

  test("returns straight over three of a kind", () => {
    const cards: Card[] = [
      new Card(7, "♥️"),
      new Card(7, "♣️"),
      new Card(7, "♠️"),
      new Card(8, "♦️"),
      new Card(9, "♥️"),
      new Card(10, "♦️"),
      new Card(6, "♦️"),
    ];

    const result = handEvaluator(cards);

    expect(result.rank).toBe(Rank.Straight);
  });

  test("returns flush", () => {
    const cards: Card[] = [
      new Card(1, "♣️"),
      new Card(7, "♣️"),
      new Card(3, "♣️"),
      new Card(8, "♣️"),
      new Card(8, "♥️"),
      new Card(10, "♦️"),
      new Card(6, "♣️"),
    ];

    const result = handEvaluator(cards);
    expect(result.rank).toBe(Rank.Flush);
  });

  test("finds full house", () => {
    const card1 = new Card(7, "♥️");
    const card2 = new Card(7, "♦️");
    const card3 = new Card(7, "♣️");
    const card4 = new Card(8, "♥️");
    const card5 = new Card(8, "♦️");
    const cards: Card[] = [
      card1,
      card2,
      new Card(4, "♦️"),
      card3,
      card4,
      card5,
    ];

    const result = handEvaluator(cards);

    expect(result.rank).toBe(Rank.FullHouse);
    expect(result.cards.length).toEqual(5);
  });

  test("returns four of a kind", () => {
    const card1 = new Card(7, "♥️");
    const card2 = new Card(7, "♦️");
    const card3 = new Card(7, "♣️");
    const card4 = new Card(7, "♠️");
    const cards: Card[] = [card1, card2, new Card(4, "♦️"), card3, card4];

    const result = handEvaluator(cards);

    expect(result?.rank).toBe(Rank.FourOfAKind);
    expect(result?.cards.length).toEqual(4);
    expect(result?.cards.includes(card1)).toBeTruthy;
    expect(result?.cards.includes(card2)).toBeTruthy;
    expect(result?.cards.includes(card3)).toBeTruthy;
    expect(result?.cards.includes(card4)).toBeTruthy;
  });

  test("returns straight flush", () => {
    const cards: Card[] = [
      new Card(5, "♣️"),
      new Card(2, "♣️"),
      new Card(3, "♣️"),
      new Card(4, "♣️"),
      new Card(8, "♥️"),
      new Card(10, "♦️"),
      new Card(6, "♣️"),
    ];

    const result = handEvaluator(cards);
    expect(result.rank).toBe(Rank.StraightFlush);
  });

  test("returns royal flush", () => {
    const cards: Card[] = [
      new Card(13, "♣️"),
      new Card(12, "♣️"),
      new Card(10, "♣️"),
      new Card(9, "♣️"),
      new Card(8, "♥️"),
      new Card(10, "♦️"),
      new Card(11, "♣️"),
    ];

    const result = handEvaluator(cards);
    expect(result.rank).toBe(Rank.RoyalFlush);
  });
});
