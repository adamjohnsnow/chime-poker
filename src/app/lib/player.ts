import { Card } from "./cards";
import { getAllPlayers, getPlayer, writePlayerData } from "./firebase";
import * as uuid from "uuid";

export enum BlindButtons {
  NONE,
  BIGBLIND,
  SMALLBLIND,
}

export enum BettingStatus {
  NONE,
  MUSTBET,
  BETTING,
  HASBET,
}

export class Player {
  public gameId: string;
  public cards: Card[];
  public id: string;
  public name: string;
  public cash: number;
  public currentBet: number;
  public cardsShown: boolean;
  public folded: boolean;
  public active: boolean;
  public isDealer: boolean;
  public blindButton: BlindButtons | null;
  public sortIndex: number;
  public bettingStatus: BettingStatus;
  constructor(gameId: string, name: string) {
    this.id = uuid.v4();
    this.gameId = gameId;
    this.name = name;
    this.cards = [];
    this.cash = 10000;
    this.currentBet = 0;
    this.cardsShown = false;
    this.active = true;
    this.folded = false;
    this.isDealer = false;
    this.blindButton = null;
    this.sortIndex = 0;
    this.bettingStatus = BettingStatus.NONE;
  }

  public isEligibleForBetting(): boolean {
    return (
      !this.folded &&
      this.active &&
      this.cash > 0 &&
      this.bettingStatus === BettingStatus.MUSTBET
    );
  }

  public canPlay(): boolean {
    return this.active && this.cash > 0;
  }
}

export async function loadPlayer(gameId: string, playerId: string) {
  const player = getPlayer(gameId, playerId);
  return player;
}

export async function loadAllPlayers(gameId: string): Promise<Player[]> {
  const players = await getAllPlayers(gameId);
  if (!players) {
    return [];
  }
  return players;
}

export async function updatePlayerStatus(
  gameId: string,
  playerId: string,
  active: boolean
) {
  const player = await loadPlayer(gameId, playerId);
  if (!player) {
    return;
  }
  player.active = active;
  updatePlayer(player);
}

export async function updatePlayer(player: Player) {
  writePlayerData(player);
}

export async function addNewPlayer(gameId: string, name: string) {
  const players = await getAllPlayers(gameId);
  if (!players || players.length > 5) {
    return;
  }

  const player = new Player(gameId, name);
  player.sortIndex = players.length;
  writePlayerData(player);
  return player;
}

export async function newCardsForPlayer(player: Player, cards: Card[]) {
  if (!player || player.cash <= 0) {
    return;
  }
  player.cardsShown = false;
  player.folded = false;
  player.cards = cards;

  updatePlayer(player);
}
