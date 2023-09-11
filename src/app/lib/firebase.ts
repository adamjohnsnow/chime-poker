import { FirebaseApp, initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  set,
  onValue,
  child,
  get,
  Database,
} from "firebase/database";
import { Player } from "./player";
import { GamePhase, GameState } from "./game";
import { ChimeConfig } from "./chime";

let app: FirebaseApp;
let db: Database;

if (
  process.env.NEXT_PUBLIC_FIREBASE_URL &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECTID
) {
  const firebaseConfig = {
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_URL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECTID,
  };

  app = initializeApp(firebaseConfig);
  db = getDatabase(app);
}

export function writeChimeData(gameId: string, chimeConfig: ChimeConfig) {
  set(ref(db, "poker/" + gameId + "/chime"), chimeConfig);
}

export function writePlayerData(player: Player) {
  console.log("WRITE", player);
  set(ref(db, "poker/" + player.gameId + "/players/" + player.id), player);
}

export async function writeAllPlayers(players: Player[]) {
  players.forEach((player) => writePlayerData(player));
}

export function writeGameData(game: GameState) {
  set(ref(db, "poker/" + game.id + "/game"), game);
}

export function getPlayerStream(
  gameId: string,
  playerId: string,
  callback: any
) {
  const player = ref(db, "poker/" + gameId + "/players/" + playerId);
  onValue(player, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
}

export function getGameStream(gameId: string, callback: any) {
  const game = ref(db, "poker/" + gameId + "/game");
  onValue(game, (snapshot) => {
    const data = snapshot.val() as GameState;

    callback(data);
  });
}
export function getGamePhaseStream(gameId: string, callback: any) {
  const game = ref(db, "poker/" + gameId + "/game/phase");
  onValue(game, (snapshot) => {
    const data = snapshot.val() as GamePhase;

    callback(data);
  });
}
export function getAllPlayersStream(gameId: string, callback: any) {
  const player = ref(db, "poker/" + gameId + "/players");
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
    child(dbRef, "poker/" + gameId + "/players/" + playerId)
  );
  if (snapshot.exists()) {
    const player = snapshot.val();
    return player;
  } else {
    console.log("No player data available");
    return null;
  }
}

export async function getAllPlayers(gameId: string): Promise<Player[]> {
  const dbRef = ref(getDatabase());
  const snapshot = await get(child(dbRef, "poker/" + gameId + "/players"));
  if (snapshot.exists()) {
    const players = convertPlayers(snapshot.val());
    return players;
  } else {
    console.log("No players data available");
    return [];
  }
}

export async function getGame(gameId: string): Promise<GameState | null> {
  const dbRef = ref(getDatabase());
  const snapshot = await get(child(dbRef, "poker/" + gameId + "/game"));
  if (snapshot.exists()) {
    const game = snapshot.val() as GameState;
    return game;
  } else {
    console.log("No data available");
    return null;
  }
}

export async function getChimeConfig(
  gameId: string
): Promise<ChimeConfig | null> {
  const dbRef = ref(getDatabase());
  const snapshot = await get(child(dbRef, "poker/" + gameId + "/chime"));
  if (snapshot.exists()) {
    const chime = snapshot.val() as ChimeConfig;
    return chime;
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
