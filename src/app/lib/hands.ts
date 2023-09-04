import { Card, Deck } from "./cards";

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

export interface Result {
  rank: Rank;
  cards: Card[];
  kickers: Card[];
}

export class HandEvaluator {
  public result: Result;

  constructor(hand: Card[]) {
    const sortedCards = hand.sort((a, b) => b.value - a.value);

    const kinds = this.evaluateKinds(sortedCards);
    const straight = this.hasStraight(sortedCards);
    const flush = this.hasFlush(sortedCards);

    const sortedResult = [kinds, straight, flush].sort(
      (a, b) => b.rank - a.rank
    );

    this.result = sortedResult[0];
  }

  private evaluateKinds(cards: Card[]): Result {
    const counts = this.organiseCardValues(cards);

    const fourOfAKindValue = this.hasKind(counts, 4);
    if (fourOfAKindValue !== 0) {
      return {
        rank: Rank.FourOfAKind,
        cards: cards.filter((card) => card.value === fourOfAKindValue),
        kickers: [cards.filter((card) => card.value != fourOfAKindValue)[0]],
      };
    }

    const threeOfAKindValue = this.hasKind(counts, 3);
    if (threeOfAKindValue !== 0) {
      const fullHouse = this.findFullHouse(counts);
      if (fullHouse.length === 5) {
        return {
          rank: Rank.FullHouse,
          cards: fullHouse,
          kickers: [],
        };
      } else {
        return {
          rank: Rank.ThreeOfAKind,
          cards: cards.filter((card) => card.value === threeOfAKindValue),
          kickers: cards
            .filter((card) => card.value != threeOfAKindValue)
            .slice(0, 2),
        };
      }
    }

    const pairCards = this.findTwoPair(counts);

    if (pairCards.length > 0) {
      if (pairCards.length === 4) {
        return {
          rank: Rank.TwoPair,
          cards: pairCards,
          kickers: [
            cards.filter(
              (card) =>
                card.value != pairCards[0].value &&
                card.value != pairCards[3].value
            )[0],
          ],
        };
      } else {
        return {
          rank: Rank.OnePair,
          cards: pairCards,
          kickers: cards
            .filter((card) => card.value != pairCards[0].value)
            .slice(0, 3),
        };
      }
    }

    return {
      rank: Rank.HighCard,
      cards: [cards[0]],
      kickers: cards.slice(1, 5),
    };
  }

  private organiseCardValues(cards: Card[]): { [key: string]: Card[] } {
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

  private organiseCardSuits(cards: Card[]): { [key: string]: Card[] } {
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

  private hasKind(
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

  private hasStraight(cards: Card[]): Result {
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
              kickers: [],
            };
          }
          return {
            rank: Rank.Straight,
            cards: newCards,
            kickers: [],
          };
        }
      } else {
        newCards = [cards[i]];
      }
    }

    return {
      rank: Rank.HighCard,
      cards: [cards[0]],
      kickers: cards.slice(1, 5),
    };
  }

  private hasFlush(cards: Card[]): Result {
    const suitTally = this.organiseCardSuits(cards);
    for (const key in suitTally) {
      if (
        suitTally[key].length > 4 &&
        this.hasStraight(suitTally[key]).rank > 3
      ) {
        return {
          cards: suitTally[key],
          rank: Rank.StraightFlush,
          kickers: [],
        };
      }
      if (suitTally[key].length > 4) {
        return {
          cards: suitTally[key],
          rank: Rank.Flush,
          kickers: [],
        };
      }
    }
    return {
      rank: Rank.HighCard,
      cards: [cards[0]],
      kickers: cards.slice(1, 5),
    };
  }

  private findFullHouse(tally: { [key: string]: Card[] }): Card[] {
    let cards: Card[] = [];
    for (const key in tally) {
      if (tally[key].length === 3 || tally[key].length === 2)
        cards = cards.concat(tally[key]);
    }
    return cards;
  }

  private findTwoPair(tally: { [key: string]: Card[] }): Card[] {
    let cards: Card[] = [];
    for (const key in tally) {
      if (tally[key].length === 2) cards = cards.concat(tally[key]);
    }
    return cards.slice(-4);
  }
}
