import { Card } from "./cards";
import { loadFromDb, queryDb, saveToDb } from "./dynamoDb";
import { getGame, saveGame } from "./game";
import * as uuid from "uuid";

export class Player {
  constructor(
    public cards: Card[],
    public id: string,
    public name: string,
    public cash: number,
    public currentBet: number | null,
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

export async function loadAllPlayers(gameId: string): Promise<Player[]> {
  const players: Player[] = [];

  const query = await queryDb(gameId);

  if (!query) {
    return players;
  }

  query.forEach((record) => {
    if (record.content.S && record.sk.S?.substring(36) != ":game") {
      players.push(JSON.parse(record.content.S));
    }
  });

  return players;
}

export async function updatePlayer(gameId: string, player: Player) {
  saveToDb(gameId, player.id, JSON.stringify(player));
}

export async function addNewPlayer(gameId: string, name: string) {
  const game = await getGame(gameId);
  if (!game) {
    return;
  }
  const player = new Player([], uuid.v4(), name, 10000, 0, false);
  game.players = game?.players.concat(player.id);
  await saveToDb(gameId, player.id, JSON.stringify(player));
  await saveGame(game);
  return player.id;
}

export async function newCardsForPlayer(
  gameId: string,
  playerId: string,
  cards: Card[]
) {
  const player = await loadPlayer(gameId, playerId);

  if (!player || player.cash <= 0) {
    return;
  }
  player.folded = false;
  player.cards = cards;

  updatePlayer(gameId, player);
}
