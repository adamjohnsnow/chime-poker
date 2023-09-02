import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue, child, get } from "firebase/database";
import { Player } from "./player";
import { gameState } from "./game";

const firebaseConfig = {
  databaseURL: "https://chime-poker-default-rtdb.firebaseio.com/",
  projectId: "chime-poker",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export function writePlayerData(player: Player) {
  set(ref(db, "games/" + player.gameId + "/players/" + player.id), player);
}

export function writeGameData(game: gameState) {
  console.log("writing game");
  set(ref(db, "games/" + game.id + "/game"), game);
}

export function getPlayerStream(
  gameId: string,
  playerId: string,
  callback: any
) {
  const player = ref(db, "games/" + gameId + "/players/" + playerId);
  onValue(player, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
}

export function getGameStream(gameId: string, callback: any) {
  const game = ref(db, "games/" + gameId + "/game");
  onValue(game, (snapshot) => {
    const data = snapshot.val() as gameState;

    callback(data);
  });
}

export function getAllPlayersStream(gameId: string, callback: any) {
  const player = ref(db, "games/" + gameId + "/players");
  onValue(player, (snapshot) => {
    const data = convertPlayers(snapshot.val());

    callback(data);
  });
}

export async function getPlayer(
  gameId: string,
  playerId: string
): Promise<Player | null> {
  const dbRef = ref(getDatabase());
  const snapshot = await get(
    child(dbRef, "games/" + gameId + "/players/" + playerId)
  );
  if (snapshot.exists()) {
    const player = snapshot.val();
    console.log("GOT PLAYER", player);
    return player;
  } else {
    console.log("No player data available");
    return null;
  }
}

export async function getAllPlayers(gameId: string): Promise<Player[]> {
  const dbRef = ref(getDatabase());
  const snapshot = await get(child(dbRef, "games/" + gameId + "/players"));
  console.log(snapshot.exists());
  if (snapshot.exists()) {
    const players = convertPlayers(snapshot.val());
    console.log("GOT ALL PLAYERS", players);
    return players;
  } else {
    console.log("No players data available");
    return [];
  }
}

export async function getGame(gameId: string): Promise<gameState | null> {
  const dbRef = ref(getDatabase());
  const snapshot = await get(child(dbRef, `games/${gameId}/game`));
  if (snapshot.exists()) {
    const game = snapshot.val() as gameState;
    console.log("GOT GAME", game);
    return game;
  } else {
    console.log("No data available");
    return null;
  }
}

function convertPlayers(playersObject: Object): Player[] {
  const players: Player[] = [];

  if (!playersObject) {
    return players;
  }
  const split = Object.entries(playersObject);

  split.forEach((entry) => {
    players.push(entry[1] as Player);
  });
  return players.sort((a, b) => a.sortIndex - b.sortIndex);
}
