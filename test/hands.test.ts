import { Card } from "../src/app/lib/cards";
import { Rank, HandEvaluator } from "../src/app/lib/hands";
import { describe, expect, test } from "@jest/globals";

describe("hand evaluator", () => {
  test("returns high card", () => {
    const cards: Card[] = [
      { value: 7, suit: "♥️" },
      { value: 8, suit: "♥️" },
      { value: 4, suit: "♦️" },
      { value: 1, suit: "♦️" },
    ];
    const hand = new HandEvaluator(cards);

    expect(hand.result.rank).toBe(Rank.HighCard);
    expect(hand.result.cards[0].value).toEqual(8);
  });

  test("returns a pair", () => {
    const card1 = { value: 7, suit: "♥️" };
    const card2 = { value: 7, suit: "♦️" };
    const cards: Card[] = [card1, card2, { value: 4, suit: "♦️" }];

    const hand = new HandEvaluator(cards);

    expect(hand.result.rank).toBe(Rank.OnePair);
    expect(hand.result.cards.length).toEqual(2);
    expect(hand.result.cards.includes(card1)).toBeTruthy;
    expect(hand.result.cards.includes(card2)).toBeTruthy;
  });

  test("finds two pair", () => {
    const card1 = { value: 7, suit: "♥️" };
    const card2 = { value: 7, suit: "♦️" };
    const card3 = { value: 8, suit: "♥️" };
    const card4 = { value: 8, suit: "♦️" };
    const cards: Card[] = [
      card1,
      card2,
      { value: 4, suit: "♦️" },
      card3,
      card4,
    ];

    const hand = new HandEvaluator(cards);

    expect(hand.result.rank).toBe(Rank.TwoPair);
    expect(hand.result.cards.length).toEqual(4);
  });

  test("returns three of a kind", () => {
    const card1 = { value: 7, suit: "♥️" };
    const card2 = { value: 7, suit: "♦️" };
    const card3 = { value: 7, suit: "♣️" };
    const cards: Card[] = [card1, card2, { value: 4, suit: "♦️" }, card3];

    const hand = new HandEvaluator(cards);

    expect(hand.result.rank).toBe(Rank.ThreeOfAKind);
    expect(hand.result.cards.length).toEqual(3);
    expect(hand.result.cards.includes(card1)).toBeTruthy;
    expect(hand.result.cards.includes(card2)).toBeTruthy;
    expect(hand.result.cards.includes(card3)).toBeTruthy;
  });

  test("returns straight", () => {
    const cards: Card[] = [
      { value: 13, suit: "♥️" },
      { value: 1, suit: "♣️" },
      { value: 7, suit: "♠️" },
      { value: 8, suit: "♦️" },
      { value: 9, suit: "♥️" },
      { value: 10, suit: "♦️" },
      { value: 6, suit: "♦️" },
    ];

    const hand = new HandEvaluator(cards);

    expect(hand.result.rank).toBe(Rank.Straight);
  });

  test("returns not straight", () => {
    const cards: Card[] = [
      { value: 11, suit: "♥️" },
      { value: 1, suit: "♣️" },
      { value: 7, suit: "♠️" },
      { value: 8, suit: "♦️" },
      { value: 2, suit: "♥️" },
      { value: 10, suit: "♦️" },
      { value: 6, suit: "♦️" },
    ];

    const hand = new HandEvaluator(cards);

    expect(hand.result.rank).not.toBe(Rank.Straight);
  });

  test("returns straight over three of a kind", () => {
    const cards: Card[] = [
      { value: 7, suit: "♥️" },
      { value: 7, suit: "♣️" },
      { value: 7, suit: "♠️" },
      { value: 8, suit: "♦️" },
      { value: 9, suit: "♥️" },
      { value: 10, suit: "♦️" },
      { value: 6, suit: "♦️" },
    ];

    const hand = new HandEvaluator(cards);

    expect(hand.result.rank).toBe(Rank.Straight);
  });

  test("returns flush", () => {
    const cards: Card[] = [
      { value: 1, suit: "♣️" },
      { value: 7, suit: "♣️" },
      { value: 3, suit: "♣️" },
      { value: 8, suit: "♣️" },
      { value: 8, suit: "♥️" },
      { value: 10, suit: "♦️" },
      { value: 6, suit: "♣️" },
    ];

    const hand = new HandEvaluator(cards);

    expect(hand.result.rank).toBe(Rank.Flush);
  });

  test("finds full house", () => {
    const card1 = { value: 7, suit: "♥️" };
    const card2 = { value: 7, suit: "♦️" };
    const card3 = { value: 7, suit: "♣️" };
    const card4 = { value: 8, suit: "♥️" };
    const card5 = { value: 8, suit: "♦️" };
    const cards: Card[] = [
      card1,
      card2,
      { value: 4, suit: "♦️" },
      card3,
      card4,
      card5,
    ];

    const hand = new HandEvaluator(cards);

    expect(hand.result.rank).toBe(Rank.FullHouse);
    expect(hand.result.cards.length).toEqual(5);
  });

  test("returns four of a kind", () => {
    const card1 = { value: 7, suit: "♥️" };
    const card2 = { value: 7, suit: "♦️" };
    const card3 = { value: 7, suit: "♣️" };
    const card4 = { value: 7, suit: "♠️" };
    const cards: Card[] = [
      card1,
      card2,
      { value: 4, suit: "♦️" },
      card3,
      card4,
    ];

    const hand = new HandEvaluator(cards);

    expect(hand.result.rank).toBe(Rank.FourOfAKind);
    expect(hand.result.cards.length).toEqual(4);
    expect(hand.result.cards.includes(card1)).toBeTruthy;
    expect(hand.result.cards.includes(card2)).toBeTruthy;
    expect(hand.result.cards.includes(card3)).toBeTruthy;
    expect(hand.result.cards.includes(card4)).toBeTruthy;
  });

  test("returns straight flush", () => {
    const cards: Card[] = [
      { value: 5, suit: "♣️" },
      { value: 2, suit: "♣️" },
      { value: 3, suit: "♣️" },
      { value: 4, suit: "♣️" },
      { value: 8, suit: "♥️" },
      { value: 10, suit: "♦️" },
      { value: 6, suit: "♣️" },
    ];

    const hand = new HandEvaluator(cards);

    expect(hand.result.rank).toBe(Rank.StraightFlush);
  });

  test("returns royal flush", () => {
    const cards: Card[] = [
      { value: 13, suit: "♣️" },
      { value: 12, suit: "♣️" },
      { value: 10, suit: "♣️" },
      { value: 9, suit: "♣️" },
      { value: 8, suit: "♥️" },
      { value: 10, suit: "♦️" },
      { value: 11, suit: "♣️" },
    ];

    const hand = new HandEvaluator(cards);

    expect(hand.result.rank).toBe(Rank.RoyalFlush);
  });

  test("doesnt return 3 pairs...", () => {
    const cards: Card[] = [
      {
        suit: "♦️",
        value: 10,
      },
      {
        suit: "♠️",
        value: 7,
      },
      {
        suit: "♠️",
        value: 8,
      },
      {
        suit: "♣️",
        value: 8,
      },
      {
        suit: "♣️",
        value: 10,
      },
      {
        suit: "♠️",
        value: 7,
      },
    ];
    const hand = new HandEvaluator(cards);
    expect(hand.result.rank).toBe(Rank.TwoPair);
    expect(hand.result.cards.length).toBe(4);
    expect(hand.result.cards[0].value).not.toBe(7);
  });
});
