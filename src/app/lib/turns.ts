import { BlindButtons, Player } from "./player";

export async function nextRoundTurn(players: Player[]) {
  function nextPlayerIndex(i: number): number {
    if (i === players.length - 1) {
      return 0;
    }
    return i + 1;
  }

  for (let i = 0; i < players.length; i++) {
    if (players[i].blindButton === BlindButtons["Big Blind"]) {
      players[nextPlayerIndex(i)].blindButton = BlindButtons["Big Blind"];
      players[nextPlayerIndex(nextPlayerIndex(i))].blindButton =
        BlindButtons["Little Blind"];
      players[i].blindButton = undefined;
      i++;
    }
    if (players[i].isDealer) {
      players[nextPlayerIndex(i)].isDealer = true;
      players[i].isDealer = false;
    }
  }
}
