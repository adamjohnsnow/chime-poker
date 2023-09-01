import { Card } from "./cards";
import { getPlayer, writePlayerData } from "./firebase";
import { getGame, writeGameData } from "./firebase";
import * as uuid from "uuid";

export enum BlindButtons {
  "Big Blind",
  "Little Blind",
}

export class Player {
  public cards: Card[];
  public id: string;
  public name: string;
  public cash: number;
  public currentBet: number | null;
  public cardsShown: boolean;
  public folded?: boolean;
  public active?: boolean;
  public isDealer?: boolean;
  public blindButton?: BlindButtons;
  constructor(name: string) {
    this.id = uuid.v4();
    this.name = name;
    this.cards = [];
    this.cash = 10000;
    this.currentBet = 0;
    this.cardsShown = false;
    this.active = true;
    this.folded = false;
  }
}

export async function loadPlayer(playerId: string) {
  console.log("loading player");
  const player = getPlayer(playerId);
  return player;
}

export async function loadAllPlayers(gameId: string): Promise<Player[]> {
  const players: Player[] = [];
  const game = await getGame(gameId);
  if (!game || !game.players) {
    return players;
  }
  game.players.forEach(async (playerId: string) => {
    const newPlayer = await getPlayer(playerId);
    if (newPlayer) {
      players.push(newPlayer);
    }
  });

  return players;
}

export async function updatePlayerStatus(
  gameId: string,
  playerId: string,
  active: boolean
) {
  const player = await loadPlayer(playerId);
  if (!player) {
    return;
  }
  player.active = active;
  updatePlayer(gameId, player);
}

export async function updatePlayer(gameId: string, player: Player) {
  writePlayerData(player);
}

export async function addNewPlayer(gameId: string, name: string) {
  // const players = await loadAllPlayers(gameId);

  // if (players.length > 5) {
  //   return;
  // }

  const game = await getGame(gameId);
  console.log("DEBUG 2", game);

  if (!game) {
    console.log("DEBUG 2X");

    return;
  }
  console.log("DEBUG 3");

  const player = new Player(name);
  // switch (players.length) {
  //   case 0: {
  //     player.isDealer = true;
  //     break;
  //   }
  //   case 1: {
  //     player.blindButton = BlindButtons["Big Blind"];
  //     break;
  //   }
  //   case 2: {
  //     player.blindButton = BlindButtons["Little Blind"];
  //     break;
  //   }
  //   default: {
  //     break;
  //   }
  // }
  writePlayerData(player);
  if (game.players) {
    game.players = game?.players.concat(player.id);
  } else {
    game.players = [player.id];
  }
  writeGameData(game);
  return player;
}

export async function newCardsForPlayer(
  gameId: string,
  playerId: string,
  cards: Card[]
) {
  const player = await loadPlayer(playerId);

  if (!player || player.cash <= 0) {
    return;
  }
  player.folded = false;
  player.cards = cards;

  updatePlayer(gameId, player);
}
