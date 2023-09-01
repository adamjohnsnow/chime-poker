import { Deck, Card } from "./cards";
import { ChimeConfig, newChime } from "./chime";
import * as uuid from "uuid";
import { Player, loadAllPlayers, newCardsForPlayer } from "./player";
import { HandEvaluator, Rank, Result } from "./hands";
import {
  getGame,
  getGameStream,
  writeGameData,
  writePlayerData,
} from "./firebase";

export type gameState = {
  id: string;
  chimeConfig: ChimeConfig;
  cardDeck: Card[];
  communityCards: Card[];
  results: newHand[];
};

export type newHand = {
  playerId: string;
  cards: Card[];
  rank: Rank | 0;
  result?: string;
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
    results: [],
  };

  writeGameData(state);

  return state;
}

export async function nextCommunityCards(
  gameId: string
): Promise<[Card[], newHand[]]> {
  const game = await getGame(gameId);
  if (!game) {
    return [[], []];
  }
  if (!game.communityCards) {
    game.communityCards = [];
  }
  return dealNextCommunityCards(game);
}

export async function dealNextCommunityCards(
  gameState: gameState
): Promise<[Card[], newHand[]]> {
  switch (gameState?.communityCards?.length) {
    case 5: {
      await findWinner(gameState);
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

  writeGameData(gameState);

  return [gameState.communityCards, gameState.results];
}

export async function resetCards(gameId: string) {
  const gameRecord = await getGame(gameId);
  if (!gameRecord) {
    return;
  }
  const redeal = await redealDeck(gameRecord);
  writeGameData(redeal);

  return redeal;
}

export async function redealDeck(game: gameState) {
  game.cardDeck = new Deck().cards;
  game.communityCards = [];
  game.results = [];

  const deckLength = game.cardDeck.length;
  const newHands: newHand[] = [];

  const loadedPlayers = await loadAllPlayers(game.id);
  console.log("LLP:", loadedPlayers);
  const activePlayers = loadedPlayers.filter(
    (player) => player.cash > 0 && player.active
  );
  const playerCount = activePlayers.length;

  activePlayers.forEach((player, i) => {
    const newCards = [game.cardDeck[i], game.cardDeck[i + playerCount]];
    newHands.push({
      playerId: player.id,
      cards: newCards,
      rank: 0,
    });
    newCardsForPlayer(game.id, player.id, newCards);
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

  await players.forEach((player: { cards: any; id: any }) => {
    const cards = [...game.communityCards, ...player.cards];
    const evaluatedHand = new HandEvaluator(cards).result;
    results.push({
      playerId: player.id,
      cards: evaluatedHand.cards,
      rank: evaluatedHand.rank,
      result: Rank[evaluatedHand.rank],
    });
  });

  game.results = results.sort((a, b) => b.rank - a.rank);
  return game.results;
}
