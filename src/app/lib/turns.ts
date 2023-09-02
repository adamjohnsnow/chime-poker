import { BlindButtons, Player } from "./player";

export async function nextRoundTurn(players: Player[]) {
  console.log("IN TURN");
  function nextPlayerIndex(startNumber: number): number {
    let n: number;
    startNumber === players.length - 1 ? (n = 0) : (n = startNumber + 1);
    for (n; n < players.length; n++) {
      if (players[n].active && players[n].cash > 0) {
        return n;
      }
    }
    n = 0;
    for (n; n < startNumber; n++) {
      if (players[n].active && players[n].cash > 0) {
        return n;
      }
    }
    return n;
  }

  if (players.filter((player) => player.isDealer).length === 0) {
    players[0].isDealer = true;
    players[1].blindButton = BlindButtons.BIGBLIND;
    players[nextPlayerIndex(1)].blindButton = BlindButtons.LITTLEBLIND;
    return;
  }
  let dealerMoved = false;
  let buttonsMoved = false;

  for (let i = 0; i < players.length; i++) {
    if (!buttonsMoved && players[i].blindButton === BlindButtons.BIGBLIND) {
      players[i].blindButton = null;
      players[nextPlayerIndex(i)].blindButton = BlindButtons.BIGBLIND;
      players[nextPlayerIndex(nextPlayerIndex(i))].blindButton =
        BlindButtons.LITTLEBLIND;
      buttonsMoved = true;
    }
    if (!dealerMoved && players[i].isDealer) {
      players[nextPlayerIndex(i)].isDealer = true;
      players[i].isDealer = false;
      dealerMoved = true;
    }
  }
}
