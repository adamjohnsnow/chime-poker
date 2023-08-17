"use server";
import { MediaPlacement } from "@aws-sdk/client-chime-sdk-meetings";
import { Deck, Card } from "./cards";
import { createRecord, getGame } from "./dynamoDb";
import { newChime } from "./chime";
import * as uuid from "uuid";
import { Player } from "./player";
import { createTopic } from "./notifications";

export type gameState = {
  id: string;
  chimeConfig: MediaPlacement;
  cardDeck: Card[];
  communityCards: Card[];
  players: Player[];
  topicArn: string;
};

export async function startGame(): Promise<string> {
  const id = uuid.v4();

  const call = await newChime(id);
  const deck = new Deck();
  const topic = await createTopic(id + "_game");

  if (!call) {
    return "";
  }

  const state: gameState = {
    id: id,
    chimeConfig: call,
    cardDeck: deck.cards,
    communityCards: [],
    players: [],
    topicArn: topic,
  };

  createRecord(id, "game", JSON.stringify(state));

  return JSON.stringify(state);
}

export async function GetGame() {
  const gameId = "5da7a7f3-079e-4301-8c31-477dde15abed";
  console.log(await getGame(gameId));
}
