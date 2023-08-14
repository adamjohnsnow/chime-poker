import { Card } from "./cards";

export enum Rank {
  HighCard,
  OnePair,
  TwoPair,
  ThreeOfAKind,
  Straight,
  Flush,
  FullHouse,
  FourOfAKind,
  StraightFlush,
  RoyalFlush,
}

export type Result = {
  rank: Rank;
  cards: Card[];
};

export function handEvaluator(cards: Card[]): Result {
  const result: Result = {
    rank: Rank.HighCard,
    cards: [cards[0]],
  };
  return result;
}
