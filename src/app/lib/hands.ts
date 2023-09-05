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

export interface Result {
  rank: Rank;
  cards: Card[];
  cardsScore: number;
  kickers: Card[];
  kickersScore: number;
}

export class HandEvaluator {
  public evaluate(hand: Card[]) {
    const sortedCards = hand.sort((a, b) => b.value - a.value);

    const kinds = this.evaluateKinds(sortedCards);
    const straight = this.hasStraight(sortedCards);
    const flush = this.hasFlush(sortedCards);
    const scoredResults = this.scoreResults([kinds, straight, flush]);
    const sortedResult = scoredResults.sort(
      (a, b) =>
        b.rank - a.rank ||
        b.cardsScore - a.cardsScore ||
        b.kickersScore - a.kickersScore
    );

    return sortedResult[0];
  }

  private blankResult(): Result {
    return {
      rank: Rank.HighCard,
      cards: [],
      cardsScore: 0,
      kickers: [],
      kickersScore: 0,
    };
  }

  private evaluateKinds(cards: Card[]): Result {
    const result = this.blankResult();

    const counts = this.organiseCardValues(cards);

    const fourOfAKindValue = this.hasKind(counts, 4);
    if (fourOfAKindValue !== 0) {
      const winningCards = cards.filter(
        (card) => card.value === fourOfAKindValue
      );
      result.rank = Rank.FourOfAKind;
      result.cards = winningCards;
      result.kickers = [
        cards.find((card) => card.value != fourOfAKindValue) as Card,
      ];
      return result;
    }

    const threeOfAKindValue = this.hasKind(counts, 3);
    if (threeOfAKindValue !== 0) {
      const fullHouse = this.findFullHouse(counts);
      if (fullHouse.length === 5) {
        result.rank = Rank.FullHouse;
        result.cards = fullHouse;
        result.kickers = [];
        return result;
      } else {
        const winningCards = cards.filter(
          (card) => card.value === threeOfAKindValue
        );
        const kickers = cards
          .filter((card) => card.value != threeOfAKindValue)
          .slice(0, 2);

        result.rank = Rank.ThreeOfAKind;
        result.cards = winningCards;
        result.kickers = kickers;
        return result;
      }
    }
    const pairCards = this.findTwoPair(counts);

    if (pairCards.length > 0) {
      if (pairCards.length === 4) {
        const kicker = [
          cards.find(
            (card) =>
              card.value != pairCards[0].value &&
              card.value != pairCards[3].value
          ) as Card,
        ];
        result.rank = Rank.TwoPair;
        result.cards = pairCards;
        result.kickers = kicker;
        return result;
      } else {
        const kickers = cards
          .filter((card) => card.value != pairCards[0].value)
          .slice(0, 3);
        result.rank = Rank.OnePair;
        result.cards = pairCards;
        result.kickers = kickers;
        return result;
      }
    }

    result.rank = Rank.HighCard;
    result.cards = [cards[0]];
    result.kickers = cards.slice(1, 5);
    return result;
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
    const result = this.blankResult();
    let newCards: Card[] = [cards[0]];
    for (let i = 1; i < cards.length; i++) {
      if (cards[i].value === newCards[newCards.length - 1].value) continue;

      if (cards[i].value === newCards[newCards.length - 1].value - 1) {
        newCards.push(cards[i]);
        if (newCards.length > 4) {
          if (newCards[0].value === 13) {
            result.rank = Rank.RoyalFlush;
            result.cards = newCards;

            return result;
          }

          result.rank = Rank.Straight;
          result.cards = newCards;
          return result;
        }
      } else {
        newCards = [cards[i]];
      }
    }

    result.cards = [cards[0]];
    result.kickers = cards.slice(1, 5);
    return result;
  }

  private hasFlush(cards: Card[]): Result {
    const result = this.blankResult();

    const suitTally = this.organiseCardSuits(cards);
    for (const key in suitTally) {
      if (
        suitTally[key].length > 4 &&
        this.hasStraight(suitTally[key]).rank > 3
      ) {
        result.rank = Rank.StraightFlush;

        result.cards = suitTally[key];
        return result;
      }

      if (suitTally[key].length > 4) {
        result.rank = Rank.Flush;
        result.cards = suitTally[key];

        return result;
      }
    }

    result.cards = [cards[0]];
    result.kickers = cards.slice(1, 5);

    return result;
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
    cards.sort((a, b) => b.value - a.value);
    return cards.slice(-4);
  }

  private scoreResults(hands: Result[]): Result[] {
    hands.forEach((hand) => {
      hand.cardsScore = this.scoreCards(hand.cards);
      hand.kickersScore = this.scoreCards(hand.kickers);
    });
    return hands;
  }

  private scoreCards(cards: Card[]): number {
    if (cards.length === 0) {
      return 0;
    }
    cards.sort((a, b) => b.value - a.value);
    const values: string[] = [];
    let valueString: string;
    cards.forEach((card) => {
      card.value > 9
        ? (valueString = card.value.toString())
        : (valueString = "0" + card.value.toString());
      values.push(valueString);
    });
    return parseInt(values.join(""), 10);
  }
}
