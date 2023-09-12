import { Player } from "../src/app/lib/player";

export function getPlayers() {
  const players = [
    new Player("123", "abc"),
    new Player("123", "def"),
    new Player("123", "ghi"),
    new Player("123", "jlk"),
  ];
  players[0].bettingStatus = 1;
  players[1].bettingStatus = 1;
  players[2].bettingStatus = 1;
  players[3].bettingStatus = 1;
  return players;
}
