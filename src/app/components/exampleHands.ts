import { Card } from "../lib/cards";

export const royalFlush: Card[] = [
  { value: 13, suit: "♥️" },
  { value: 12, suit: "♥️" },
  { value: 11, suit: "♥️" },
  { value: 10, suit: "♥️" },
  { value: 9, suit: "♥️" },
];

export const straightFlush: Card[] = [
  { value: 3, suit: "♣️" },
  { value: 4, suit: "♣️" },
  { value: 5, suit: "♣️" },
  { value: 6, suit: "♣️" },
  { value: 7, suit: "♣️" },
];

export const fourOfAKind: Card[] = [
  { value: 7, suit: "♥️" },
  { value: 7, suit: "♦️" },
  { value: 7, suit: "♣️" },
  { value: 7, suit: "♠️" },
  { value: 0, suit: "" },
];

export const fullHouse: Card[] = [
  { value: 4, suit: "♥️" },
  { value: 4, suit: "♦️" },
  { value: 4, suit: "♣️" },
  { value: 11, suit: "♠️" },
  { value: 11, suit: "♦️" },
];

export const flush: Card[] = [
  { value: 1, suit: "♣️" },
  { value: 5, suit: "♣️" },
  { value: 8, suit: "♣️" },
  { value: 10, suit: "♣️" },
  { value: 11, suit: "♣️" },
];

export const straight: Card[] = [
  { value: 4, suit: "♣️" },
  { value: 5, suit: "♦️" },
  { value: 6, suit: "♥️" },
  { value: 7, suit: "♣️" },
  { value: 8, suit: "♦️" },
];

export const threeOfAKind: Card[] = [
  { value: 6, suit: "♥️" },
  { value: 6, suit: "♦️" },
  { value: 6, suit: "♣️" },
  { value: 0, suit: "" },
  { value: 0, suit: "" },
];

export const twoPair: Card[] = [
  { value: 12, suit: "♣️" },
  { value: 12, suit: "♦️" },
  { value: 9, suit: "♥️" },
  { value: 9, suit: "♣️" },
  { value: 0, suit: "" },
];

export const onePair: Card[] = [
  { value: 11, suit: "♣️" },
  { value: 11, suit: "♦️" },
  { value: 0, suit: "" },
  { value: 0, suit: "" },
  { value: 0, suit: "" },
];
