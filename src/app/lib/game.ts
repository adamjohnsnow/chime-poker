"use server";
import { Deck, Card } from "./cards";
import { saveToDb, loadFromDb } from "./dynamoDb";
import { ChimeConfig, newChime } from "./chime";
import * as uuid from "uuid";
import { Player } from "./player";

export type gameState = {
  id: string;
  chimeConfig: ChimeConfig;
  cardDeck: Card[];
  communityCards: Card[];
  players: string[];
};

type newHand = {
  playerId: string;
  cards: Card[];
};

export async function startGame(): Promise<gameState | null> {
  const id = uuid.v4();

  const call = await newChime(id);
  const deck = new Deck();

  if (!call) {
    return null;
  }

  const state: gameState = {
    id: id,
    chimeConfig: call,
    cardDeck: deck.cards,
    communityCards: [],
    players: [],
  };

  saveGame(state);

  return state;
}

export async function createNewGame(): Promise<string> {
  const newGame = await startGame();
  return JSON.stringify(newGame);
}

export async function saveGame(game: gameState) {
  saveToDb(game.id, "game", JSON.stringify(game));
}

export async function getGame(gameId: string) {
  const gameRecord = await loadFromDb(gameId, ":game");
  if (!gameRecord?.S) {
    return;
  }
  return JSON.parse(gameRecord.S) as gameState;
}

export async function nextCards(gameId: string) {
  const gameRecord = await loadFromDb(gameId, ":game");
  if (!gameRecord?.S) {
    return;
  }
  const gameState = JSON.parse(gameRecord.S) as gameState;
  return dealNextCards(gameState);
}

export async function dealNextCards(gameState: gameState) {
  switch (gameState.communityCards.length) {
    case 5: {
      break;
    }
    case 0: {
      gameState.communityCards = gameState.cardDeck.slice(0, 3);
      gameState.cardDeck = gameState.cardDeck.slice(
        0 - gameState.cardDeck.length + 3
      );
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

  saveGame(gameState);

  return gameState.communityCards;
}

export async function resetCards(gameId: string) {
  const gameRecord = await getGame(gameId);
  if (!gameRecord) {
    return;
  }
  const redeal = await redealDeck(gameRecord);
  saveGame(redeal.game);

  return redeal.hands;
}

export async function redealDeck(game: gameState) {
  game.cardDeck = new Deck().cards;
  game.communityCards = [];

  const deckLength = game.cardDeck.length;

  const newHands: newHand[] = [];
  const playerCount = game.players.length;
  game.players.forEach((playerId, i) => {
    newHands.push({
      playerId: playerId,
      cards: [game.cardDeck[i], game.cardDeck[i + playerCount]],
    });
  });

  game.cardDeck = game.cardDeck.slice(0 - deckLength + game.players.length * 2);
  return { game: game, hands: newHands };
}
