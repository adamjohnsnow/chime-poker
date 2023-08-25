"use client";

import { Card } from "./cards";
import { loadFromDb, saveToDb } from "./dynamoDb";
import { getGame, saveGame } from "./game";
import * as uuid from "uuid";

export class Player {
  constructor(
    public cards: Card[],
    public id: string,
    public name: string,
    public cash: number,
    public folded: boolean
  ) {}
}

export async function loadPlayer(gameId: string, playerId: string) {
  const player = await loadFromDb(gameId, ":" + playerId);
  if (!player?.S) {
    return;
  }
  return JSON.parse(player?.S) as Player;
}

export async function updatePlayer(gameId: string, player: Player) {
  saveToDb(gameId, player.id, JSON.stringify(player));
}

export async function addNewPlayer(gameId: string, name: string) {
  const game = await getGame(gameId);
  if (!game) {
    return;
  }
  const player = new Player([], uuid.v4(), name, 10000, false);
  game.players = game?.players.concat(player.id);
  await saveToDb(gameId, player.id, JSON.stringify(player));
  await saveGame(game);
  return player.id;
}
