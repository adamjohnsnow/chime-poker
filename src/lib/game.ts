import { Deck, Card } from "./cards";
import { ChimeConfig, newChime } from "./chime";
import * as uuid from "uuid";
import { BettingStatus, BlindButtons, Player, loadAllPlayers } from "./player";
import {
  getGame,
  writeChimeData,
  writeGameData,
  writePlayerData,
} from "./firebase";
import { nextBettingTurn, nextRoundTurn } from "./turns";
import { findWinner, handResult } from "./findWinner";
import { Rank } from "./hands";
import { ShedGame } from "./shed";

export type GameState = {
  id: string;
  chimeConfig: ChimeConfig;
  cardDeck: Card[];
  communityCards: Card[];
  results: handResult[];
  phase: GamePhase;
  prizePot: number;
  blind: number;
  currentMinimumBet: number;
};

export enum GamePhase {
  NOTSTARTED,
  START,
  DEAL,
  TURN,
  FLOP,
  RIVER,
  RESULTS,
}

export async function startPokerGame(): Promise<GameState> {
  const id = uuid.v4();

  const call = await newChime(id);
  if (!call) {
    return Promise.reject();
  }
  writeChimeData("poker", id, call);
  const newGame = await getNewGame(id, call);
  writeGameData(newGame);
  return newGame;
}

export async function startShedGame(): Promise<ShedGame> {
  const id = uuid.v4();

  const call = await newChime(id);
  if (!call) {
    return Promise.reject();
  }
  writeChimeData("shed", id, call);
  const shedGame = new ShedGame(id);
  return shedGame;
}

export async function getNewGame(
  id: string,
  chimeConfig: ChimeConfig
): Promise<GameState> {
  const deck = new Deck();

  const state: GameState = {
    id: id,
    chimeConfig: chimeConfig,
    cardDeck: deck.cards,
    communityCards: [],
    results: [],
    prizePot: 0,
    phase: GamePhase.NOTSTARTED,
    blind: 20,
    currentMinimumBet: 0,
  };

  return state;
}

export async function loadGameAndPlayers(
  gameId: string
): Promise<{ game: GameState; players: Player[] }> {
  const game = await getGame(gameId);
  const players = await loadAllPlayers(gameId);

  if (!game || !players) {
    return Promise.reject();
  }
  return { game, players };
}

export async function saveGameAndPlayers(game: GameState, players: Player[]) {
  writeGameData(game);
  players.forEach((player) => {
    writePlayerData(player);
  });
}

export async function triggerNextRound(gameId: string) {
  const players = await loadAllPlayers(gameId);
  await nextRoundTurn(players);
}

export async function triggerNextBetting(gameId: string) {
  const players = await loadAllPlayers(gameId);
  const game = await getGame(gameId);
  if (!game) {
    return;
  }

  const nonFoldedPlayers = players.filter(
    (player) => !player.folded && player.active
  );

  if (nonFoldedPlayers.length < 2) {
    await awardLastStanding(game, players, nonFoldedPlayers[0].id);
    return;
  }

  game.currentMinimumBet = await nextBettingTurn(players);

  const playersYetToBet = players.filter(
    (player) =>
      player.active &&
      (player.bettingStatus === BettingStatus.MUSTBET ||
        player.bettingStatus === BettingStatus.BETTING)
  );

  if (playersYetToBet.length === 0) {
    await dealNextCards(game, players);
  }
  await saveGameAndPlayers(game, players);
}

export async function nextPhase(gameId: string) {
  const gameData = await loadGameAndPlayers(gameId);
  await dealNextCards(gameData.game, gameData.players);
  await saveGameAndPlayers(gameData.game, gameData.players);
}

export async function resetCards(gameId: string) {
  const gameData = await loadGameAndPlayers(gameId);
  await processResetCards(gameData.game, gameData.players);
  await nextRoundTurn(gameData.players);
  await saveGameAndPlayers(gameData.game, gameData.players);
}

export async function processResetCards(
  game: GameState,
  players: Player[]
): Promise<{ game: GameState; players: Player[] }> {
  players.forEach((player) => {
    player.cards = [];
    player.folded = false;
    player.currentBet = 0;
    player.cardsShown = false;
    player.bettingStatus = BettingStatus.MUSTBET;

    if (game.results) {
      const prize = game.results.find(
        (result) => result.playerId === player.id
      )?.prize;
      if (prize) {
        player.cash += prize;
      }
    }
  });

  game.cardDeck = new Deck().cards;
  game.communityCards = [];
  game.results = [];
  game.phase = GamePhase.START;
  game.prizePot = 0;
  game.currentMinimumBet = 0;
  return { game, players };
}

export async function dealNextCards(game: GameState, players: Player[]) {
  if (!game || game.phase === GamePhase.RESULTS) {
    return;
  }
  if (!game.communityCards) {
    game.communityCards = [];
  }
  game.currentMinimumBet = 0;

  players.forEach((player) => {
    game.prizePot += player.currentBet;
    player.currentBet = 0;
    player.bettingStatus = BettingStatus.MUSTBET;
  });

  switch (game.phase) {
    case GamePhase.START: {
      await dealDeck(game, players);
      await nextBettingTurn(players);
      game.currentMinimumBet = game.blind;
      game.phase = GamePhase.DEAL;
      break;
    }
    case GamePhase.DEAL: {
      game.communityCards = game.cardDeck.slice(0, 3);
      game.cardDeck = game.cardDeck.slice(0 - game.cardDeck.length + 3);

      game.phase = GamePhase.TURN;
      await nextBettingTurn(players);

      break;
    }
    case GamePhase.TURN: {
      game.communityCards = game.communityCards.concat(
        game.cardDeck.slice(0, 1)
      );
      game.cardDeck = game.cardDeck.slice(1);
      game.phase = GamePhase.FLOP;
      await nextBettingTurn(players);

      break;
    }
    case GamePhase.FLOP: {
      game.communityCards = game.communityCards.concat(
        game.cardDeck.slice(0, 1)
      );
      game.cardDeck = game.cardDeck.slice(1);
      game.phase = GamePhase.RIVER;
      await nextBettingTurn(players);

      break;
    }
    case GamePhase.RIVER: {
      await findWinner(game, players);
      game.phase = GamePhase.RESULTS;
      break;
    }
  }
}

export async function dealDeck(game: GameState, players: Player[]) {
  const deckLength = game.cardDeck.length;
  const playerCount = countActivePlayers(players);
  let i = 0;

  players.forEach((player) => {
    player.cardsShown = false;
    if (player.cash > 0 && player.active) {
      player.cards = [game.cardDeck[i], game.cardDeck[i + playerCount]];
      if (player.blindButton === BlindButtons.BIGBLIND) {
        player.cash = player.cash - game.blind;
        player.currentBet = game.blind;
      }
      if (player.blindButton === BlindButtons.SMALLBLIND) {
        player.cash = player.cash - game.blind / 2;
        player.currentBet = game.blind / 2;
      }
      i++;
    }
  });

  game.cardDeck = game.cardDeck.slice(0 - (deckLength - i * 2));
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

export async function getBets(gameId: string) {
  const game = (await getGame(gameId)) as GameState;
  return { bet: game.currentMinimumBet, blind: game.blind };
}

export async function newBet(gameId: string, value: number) {
  const gameData = await loadGameAndPlayers(gameId);
  await processNewBet(gameData.game, gameData.players, value);
  saveGameAndPlayers(gameData.game, gameData.players);
}

export async function processNewBet(
  game: GameState,
  players: Player[],
  betValue: number
) {
  game.currentMinimumBet = betValue;
  players.forEach((player) => {
    if (
      player.active &&
      player.cash > 0 &&
      !player.folded &&
      player.currentBet < betValue
    ) {
      player.bettingStatus = BettingStatus.MUSTBET;
    }
  });
}

export async function foldPlayer(player: Player) {
  const game = await getGame(player.gameId);
  if (!game) {
    return;
  }
  game.prizePot += player.currentBet;
  player.folded = true;
  player.currentBet = 0;
  player.bettingStatus = BettingStatus.HASBET;
  await writeGameData(game);
  await writePlayerData(player);
  triggerNextBetting(game.id);
}

async function awardLastStanding(
  game: GameState,
  players: Player[],
  winnerId: string
) {
  players.forEach((player) => {
    game.prizePot += player.currentBet;
    player.currentBet = 0;
    writePlayerData(player);
  });
  game.results = [
    {
      playerId: winnerId,
      result: {
        rank: Rank.LastStanding,
        cards: [],
        cardsScore: 0,
        kickers: [],
        kickersScore: 0,
      },
      prize: game.prizePot,
    },
  ];
  game.phase = GamePhase.RESULTS;
  await writeGameData(game);
}
