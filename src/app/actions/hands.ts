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
  rank?: Rank;
  cards: Card[];
};

export function handEvaluator(cards: Card[]): Result {
  const sorted = cards.sort((a, b) => b.value - a.value);

  const result: Result = {
    rank: Rank.HighCard,
    cards: [sorted[0]],
  };
  return result;
}

export function evaluateKinds(cards: Card[]): Result | null {
  const counts = organiseCardValues(cards);

  if (hasKind(counts, 4)) {
    return {
      rank: Rank.FourOfAKind,
      cards: cards.filter((card) => card.value === hasKind(counts, 4)),
    };
  }

  if (hasKind(counts, 3)) {
    return {
      rank: Rank.ThreeOfAKind,
      cards: cards.filter((card) => card.value === hasKind(counts, 3)),
    };
  }

  if (hasKind(counts, 2)) {
    return {
      rank: Rank.OnePair,
      cards: cards.filter((card) => card.value === hasKind(counts, 2)),
    };
  }

  return null;
}

function organiseCardValues(cards: Card[]): { [key: string]: Card[] } {
  const counts: { [key: string]: Card[] } = {};
  cards.forEach((card) => {
    if (counts[card.value]) {
      counts[card.value] = counts[card.value].concat(card);
    } else {
      counts[card.value] = [card];
    }
  });

  return counts;
}

function hasKind(obj: { [key: string]: Card[] }, targetValue: number): number {
  for (const key in obj) {
    if (obj.hasOwnProperty(key) && obj[key].length === targetValue) {
      return parseInt(key);
    }
  }
  return 0;
}
