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
    results: [],
    prizePot: 0,
    phase: GamePhase.START,
    blind: 20,
  };

  writeGameData(state);

  return state;
}

export async function nextCommunityCards(gameId: string) {
  const game = await getGame(gameId);
  if (!game || game.phase === GamePhase.RESULTS) {
    return;
  }
  if (!game.communityCards) {
    game.communityCards = [];
  }
  const players = await loadAllPlayers(gameId);
  players.forEach((player) => {
    if (player.currentBet > 0) {
      game.prizePot = game.prizePot + player.currentBet;
      player.currentBet = 0;
      writePlayerData(player);
    }
  });
  await dealNextCards(game);
}

export async function dealNextCards(gameState: gameState) {
  switch (gameState.phase) {
    case GamePhase.START: {
      await dealDeck(gameState);
      gameState.phase = GamePhase.DEAL;
      break;
    }
    case GamePhase.DEAL: {
      gameState.communityCards = gameState.cardDeck.slice(0, 3);
      gameState.cardDeck = gameState.cardDeck.slice(
        0 - gameState.cardDeck.length + 3
      );

      gameState.phase = GamePhase.TURN;
      break;
    }
    case GamePhase.TURN: {
      gameState.communityCards = gameState.communityCards.concat(
        gameState.cardDeck.slice(0, 1)
      );
      gameState.cardDeck = gameState.cardDeck.slice(1);
      gameState.phase = GamePhase.FLOP;
      break;
    }
    case GamePhase.FLOP: {
      gameState.communityCards = gameState.communityCards.concat(
        gameState.cardDeck.slice(0, 1)
      );
      gameState.cardDeck = gameState.cardDeck.slice(1);
      gameState.phase = GamePhase.RIVER;
      break;
    }
    case GamePhase.RIVER: {
      await findWinner(gameState);
      gameState.phase = GamePhase.RESULTS;
      break;
    }

    default: {
      break;
    }
  }
  writeGameData(gameState);
}

export async function resetCards(gameId: string) {
  const game = await getGame(gameId);
  if (!game) {
    return;
  }

  const players = await loadAllPlayers(gameId);

  await nextRoundTurn(players);

  players.forEach((player) => {
    player.cards = [];
    writePlayerData(player);
  });

  game.cardDeck = new Deck().cards;
  game.communityCards = [];
  game.results = [];
  game.phase = GamePhase.START;
  game.prizePot = 0;

  writeGameData(game);
}

export async function dealDeck(game: gameState) {
  const deckLength = game.cardDeck.length;
  const loadedPlayers = await loadAllPlayers(game.id);

  const activePlayers: Player[] = [];
  loadedPlayers.forEach((player) => {
    if (player.cash > 0 && player.active) {
      activePlayers.push(player);
    }
    if (player.cash <= 0) {
      player.blindButton = null;
      player.isDealer = false;
      writePlayerData(player);
    }
  });
  const playerCount = activePlayers.length;

  activePlayers.forEach((player, i) => {
    if (player.blindButton === BlindButtons.BIGBLIND) {
      player.cash = player.cash - game.blind;
      player.currentBet = game.blind;
    }
    if (player.blindButton === BlindButtons.LITTLEBLIND) {
      player.cash = player.cash - game.blind / 2;
      player.currentBet = game.blind / 2;
    }

    newCardsForPlayer(player, [
      game.cardDeck[i],
      game.cardDeck[i + playerCount],
    ]);
  });
  game.cardDeck = game.cardDeck.slice(
    0 - deckLength + activePlayers.length * 2
  );
  return game;
}

export async function findWinner(game: gameState) {
  const players = await loadAllPlayers(game.id);
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
    writePlayerData(player);
  });

  game.results = results.sort((a, b) => b.rank - a.rank);
  return game.results;
}
