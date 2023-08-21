"use server";
import { Deck, Card } from "./cards";
import { saveGame, loadGame } from "./dynamoDb";
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

  saveGame(id, "game", JSON.stringify(state));

  return JSON.stringify(state);
}

export async function getGame(gameId: string) {
  const gameRecord = await loadGame(gameId);
  return gameRecord?.S;
}

export async function nextCards(gameId: string) {
  const gameRecord = await loadGame(gameId);
  if (!gameRecord?.S) {
    return;
  }
  const gameState = JSON.parse(gameRecord.S) as gameState;

  switch (gameState.communityCards.length) {
    case 5: {
      break;
    }
    case 0: {
      gameState.communityCards = gameState.cardDeck.slice(0, 3);
      gameState.cardDeck = gameState.cardDeck.slice(3, 52);
      break;
    }
    default: {
      gameState.communityCards = gameState.communityCards.concat(
        gameState.cardDeck.slice(0, 1)
      );
      gameState.cardDeck = gameState.cardDeck.slice(1);
      break;
    }
  }

  saveGame(gameId, "game", JSON.stringify(gameState));

  return gameState.communityCards;
}

export async function redealDeck(gameId: string) {
  const gameRecord = await getGame(gameId);
  if (!gameRecord) {
    return;
  }
  const gameState = JSON.parse(gameRecord) as gameState;
  gameState.cardDeck = new Deck().cards;
  gameState.communityCards = [];

  saveGame(gameId, "game", JSON.stringify(gameState));
}
