import { Card } from "../src/app/actions/cards";
import { Rank, handEvaluator } from "../src/app/actions/hands";
import { describe, expect, test } from "@jest/globals";

describe("hand evaluator", () => {
  test("returns high card", () => {
    const cards: Card[] = [];
    const result = handEvaluator(cards);

    expect(result.rank).toBe(Rank.HighCard);
  });
});
