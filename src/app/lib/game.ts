import { Deck, Card } from "./cards";
import { ChimeConfig, newChime } from "./chime";
import * as uuid from "uuid";
import {
  BlindButtons,
  Player,
  loadAllPlayers,
  newCardsForPlayer,
} from "./player";
import { HandEvaluator, Rank } from "./hands";
import { getGame, writeGameData, writePlayerData } from "./firebase";
import { nextRoundTurn } from "./turns";

export type gameState = {
  id: string;
  chimeConfig: ChimeConfig;
  cardDeck: Card[];
  communityCards: Card[];
  results: newHand[];
  prizePot: number;
  phase: GamePhase;
  blind: number;
};

export type newHand = {
  playerId: string;
  cards: Card[];
  rank: Rank | 0;
  result?: string;
};

export enum GamePhase {
  START,
  DEAL,
  TURN,
  FLOP,
  RIVER,
  RESULTS,
}

export async function startGame(): Promise<gameState> {
  const id = uuid.v4();

  const call = await newChime(id);
  if (!call) {
    return Promise.reject();
  }
  const newGame = await getNewGame(id, call);
  writeGameData(newGame);
  return newGame;
}

export async function getNewGame(
  id: string,
  chimeConfig: ChimeConfig
): Promise<gameState> {
  const deck = new Deck();

  const state: gameState = {
    id: id,
    chimeConfig: chimeConfig,
    cardDeck: deck.cards,
    communityCards: [],
    results: [],
    prizePot: 0,
    phase: GamePhase.START,
    blind: 20,
  };

  return state;
}

export async function loadGameAndPlayers(
  gameId: string
): Promise<{ game: gameState; players: Player[] }> {
  const game = await getGame(gameId);
  const players = await loadAllPlayers(gameId);

  if (!game || !players) {
    return Promise.reject();
  }
  return { game, players };
}

export async function saveGameAndPlayers(game: gameState, players: Player[]) {
  writeGameData(game);
  players.forEach((player) => {
    if (player.currentBet > 0) {
      game.prizePot = game.prizePot + player.currentBet;
      player.currentBet = 0;
    }
    writePlayerData(player);
  });
}

export async function nextPhase(gameId: string) {
  const gameData = await loadGameAndPlayers(gameId);
  await dealNextCards(gameData.game, gameData.players);
  await saveGameAndPlayers(gameData.game, gameData.players);
}

export async function resetCards(gameId: string) {
  const gameData = await loadGameAndPlayers(gameId);
  await processResetCards(gameData.game, gameData.players);
  await saveGameAndPlayers(gameData.game, gameData.players);
}

export async function processResetCards(
  game: gameState,
  players: Player[]
): Promise<{ game: gameState; players: Player[] }> {
  await nextRoundTurn(players);

  players.forEach((player) => {
    player.cards = [];
  });

  game.cardDeck = new Deck().cards;
  game.communityCards = [];
  game.results = [];
  game.phase = GamePhase.START;
  game.prizePot = 0;
  return { game, players };
}

export async function dealNextCards(game: gameState, players: Player[]) {
  if (!game || game.phase === GamePhase.RESULTS) {
    return;
  }
  if (!game.communityCards) {
    game.communityCards = [];
  }
  switch (game.phase) {
    case GamePhase.START: {
      await dealDeck(game, players);
      game.phase = GamePhase.DEAL;
      break;
    }
    case GamePhase.DEAL: {
      game.communityCards = game.cardDeck.slice(0, 3);
      game.cardDeck = game.cardDeck.slice(0 - game.cardDeck.length + 3);

      game.phase = GamePhase.TURN;
      break;
    }
    case GamePhase.TURN: {
      game.communityCards = game.communityCards.concat(
        game.cardDeck.slice(0, 1)
      );
      game.cardDeck = game.cardDeck.slice(1);
      game.phase = GamePhase.FLOP;
      break;
    }
    case GamePhase.FLOP: {
      game.communityCards = game.communityCards.concat(
        game.cardDeck.slice(0, 1)
      );
      game.cardDeck = game.cardDeck.slice(1);
      game.phase = GamePhase.RIVER;
      break;
    }
    case GamePhase.RIVER: {
      await findWinner(game, players);
      game.phase = GamePhase.RESULTS;
      break;
    }
  }
}

export async function dealDeck(game: gameState, players: Player[]) {
  const deckLength = game.cardDeck.length;
  const playerCount = countActivePlayers(players);
  let i = 0;
  players.forEach((player) => {
    if (player.cash > 0 && player.active) {
      player.cards = [game.cardDeck[i], game.cardDeck[i + playerCount]];
      if (player.blindButton === BlindButtons.BIGBLIND) {
        player.cash = player.cash - game.blind;
        player.currentBet = game.blind;
      }
      if (player.blindButton === BlindButtons.LITTLEBLIND) {
        player.cash = player.cash - game.blind / 2;
        player.currentBet = game.blind / 2;
      }
      i++;
    }
    if (player.cash <= 0) {
      player.blindButton = null;
      player.isDealer = false;
    }
  });
  game.cardDeck = game.cardDeck.slice(0 - (deckLength - i * 2));
}

export async function findWinner(game: gameState, players: Player[]) {
  const results: newHand[] = [];

  if (!players) {
    return results;
  }

  await players.forEach((player) => {
    const cards = [...game.communityCards, ...player.cards];
    const evaluatedHand = new HandEvaluator(cards).result;
    results.push({
      playerId: player.id,
      cards: evaluatedHand.cards,
      rank: evaluatedHand.rank,
      result: Rank[evaluatedHand.rank],
    });
    player.cardsShown = true;
  });

  game.results = results.sort((a, b) => b.rank - a.rank);
}

export function countActivePlayers(players: Player[]): number {
  let i = 0;
  players.forEach((player) => {
    if (player.cash > 0 && player.active) {
      i++;
    }
  });
  return i;
}
