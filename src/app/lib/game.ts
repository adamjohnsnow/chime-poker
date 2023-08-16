"use server";
import { MediaPlacement } from "@aws-sdk/client-chime-sdk-meetings";
import { Deck, Card } from "./cards";
import { createRecord, getGame } from "./dynamoDb";
import { newChime } from "./chime";
import * as uuid from "uuid";
import { Player } from "./player";

export type gameState = {
  chimeConfig: MediaPlacement;
  cardDeck: Deck;
  communityCards: Card[];
  players: Player[];
};

export async function startGame() {
  const id = uuid.v4();

  const call = await newChime(id);
  const deck = new Deck();

  if (!call) {
    return;
  }

  const state: gameState = {
    chimeConfig: call,
    cardDeck: deck,
    communityCards: [],
    players: [],
  };

  createRecord(id, "game", JSON.stringify(state));
}

export async function GetGame() {
  const gameId = "5da7a7f3-079e-4301-8c31-477dde15abed";
  console.log(await getGame(gameId));
}
