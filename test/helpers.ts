import { Player } from "../src/lib/player";

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
  players[0].cards = [
    { value: 4, suit: "club" },
    { value: 4, suit: "club" },
  ];
  players[1].cards = [
    { value: 4, suit: "club" },
    { value: 4, suit: "club" },
  ];
  players[2].cards = [
    { value: 4, suit: "club" },
    { value: 4, suit: "club" },
  ];
  players[3].cards = [
    { value: 4, suit: "club" },
    { value: 4, suit: "club" },
  ];

  return players;
}
