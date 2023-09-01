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
  set(ref(db, "players/" + player.id), {
    player,
  });
}

export function writeGameData(game: gameState) {
  set(ref(db, "games/" + game.id), {
    game,
  });
}

export function getPlayerStream(playerId: string, callback: any) {
  const player = ref(db, "players/" + playerId);
  onValue(player, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
}

export function getGameStream(gameId: string, callback: any) {
  const player = ref(db, "games/" + gameId);
  onValue(player, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
}

export async function getPlayer(playerId: string): Promise<Player | null> {
  const dbRef = ref(getDatabase());
  const snapshot = await get(child(dbRef, `players/${playerId}`));
  console.log(playerId, snapshot, snapshot.exists());
  if (snapshot.exists()) {
    const player = snapshot.val().player as Player;
    console.log("GETPLAYER", player);
    return player;
  } else {
    console.log("No data available");
    return null;
  }
}

export async function getGame(gameId: string): Promise<gameState | null> {
  console.log("HERE");
  const dbRef = ref(getDatabase());
  const snapshot = await get(child(dbRef, `games/${gameId}`));
  if (snapshot.exists()) {
    const game = snapshot.val().game as gameState;
    console.log("GETGAME", game);
    return game;
  } else {
    console.log("No data available");
    return null;
  }
}
