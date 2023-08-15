import { couldStartTrivia } from "typescript";
import { Card } from "./cards";
import { Stream } from "stream";

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
  const sortedCards = cards.sort((a, b) => b.value - a.value);

  const kinds = evaluateKinds(sortedCards);
  const straight = hasStraight(sortedCards);
  const flush = hasFlush(sortedCards);

  const sortedResult = [
    {
      rank: Rank.HighCard,
      cards: [sortedCards[0]],
    },
    kinds,
    straight,
    flush,
  ].sort((a, b) => b.rank - a.rank);

  return sortedResult[0];
}

export function evaluateKinds(cards: Card[]): Result {
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

  return { rank: 0, cards: [] };
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

export function organiseCardSuits(cards: Card[]): { [key: string]: Card[] } {
  const counts: { [key: string]: Card[] } = {};
  cards.forEach((card) => {
    if (counts[card.suit]) {
      counts[card.suit] = counts[card.suit].concat(card);
    } else {
      counts[card.suit] = [card];
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

function hasStraight(cards: Card[]): Result {
  let newCards: Card[] = [cards[0]];
  for (let i = 1; i < cards.length; i++) {
    if (cards[i].value === newCards[newCards.length - 1].value) continue;

    if (cards[i].value === newCards[newCards.length - 1].value - 1) {
      newCards.push(cards[i]);
      if (newCards.length > 4) {
        if (newCards[0].value === 13) {
          return {
            rank: Rank.RoyalFlush,
            cards: newCards,
          };
        }
        return {
          rank: Rank.Straight,
          cards: newCards,
        };
      }
    } else {
      newCards = [cards[i]];
    }
  }

  return { rank: 0, cards: [] };
}

function hasFlush(cards: Card[]): Result {
  const suitTally = organiseCardSuits(cards);
  for (const key in suitTally) {
    if (suitTally[key].length > 4 && hasStraight(suitTally[key]).rank > 3) {
      return {
        cards: suitTally[key],
        rank: Rank.StraightFlush,
      };
    }
    if (suitTally[key].length > 4) {
      return {
        cards: suitTally[key],
        rank: Rank.Flush,
      };
    }
  }
  return { rank: 0, cards: [] };
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
