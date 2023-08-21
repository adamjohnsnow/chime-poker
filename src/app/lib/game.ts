"use server";
import { Deck, Card } from "./cards";
import { createRecord, getGame } from "./dynamoDb";
import { ChimeConfig, newChime } from "./chime";
import * as uuid from "uuid";
import { Player } from "./player";

export type gameState = {
  id: string;
  chimeConfig: ChimeConfig;
  cardDeck: Card[];
  communityCards: Card[];
  players: Player[];
};

export async function startGame(): Promise<string> {
  const id = uuid.v4();

  const call = await newChime(id);
  const deck = new Deck();

  if (!call) {
    return "";
  }

  const state: gameState = {
    id: id,
    chimeConfig: call,
    cardDeck: deck.cards,
    communityCards: [],
    players: [],
  };

  createRecord(id, "game", JSON.stringify(state));

  return JSON.stringify(state);
}

export async function GetGame(gameId: string) {
  const gameRecord = await getGame(gameId);
  return gameRecord?.S;
}
