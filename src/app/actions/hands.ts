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
  const kinds = evaluateKinds(sorted);

  if (kinds) {
    return kinds;
  }

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
    const fullHouse = findFullHouse(counts);
    if (fullHouse.length === 5) {
      return {
        rank: Rank.FullHouse,
        cards: fullHouse,
      };
    } else {
      return {
        rank: Rank.ThreeOfAKind,
        cards: cards.filter((card) => card.value === hasKind(counts, 3)),
      };
    }
  }

  if (hasKind(counts, 2)) {
    const pairCards = findTwoPair(counts);
    return {
      rank: pairCards.length === 4 ? Rank.TwoPair : Rank.OnePair,
      cards: pairCards,
    };
  }

  return null;
}

export function organiseCardValues(cards: Card[]): { [key: string]: Card[] } {
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

function hasKind(
  tally: { [key: string]: Card[] },
  targetValue: number
): number {
  for (const key in tally) {
    if (tally.hasOwnProperty(key) && tally[key].length === targetValue) {
      return parseInt(key);
    }
  }
  return 0;
}

function findFullHouse(tally: { [key: string]: Card[] }): Card[] {
  let cards: Card[] = [];
  for (const key in tally) {
    if (tally[key].length === 3 || tally[key].length === 2)
      cards = cards.concat(tally[key]);
  }
  return cards;
}

function findTwoPair(tally: { [key: string]: Card[] }): Card[] {
  let cards: Card[] = [];
  for (const key in tally) {
    if (tally[key].length === 2) cards = cards.concat(tally[key]);
  }
  return cards;
}
