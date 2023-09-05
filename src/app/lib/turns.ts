import { BlindButtons, Player } from "./player";

export async function nextRoundTurn(players: Player[]) {
  if (players.length < 2) {
    return;
  }
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

export async function nextBettingTurn(players: Player[]): Promise<number> {
  const betLevel = players
    .slice()
    .sort((a, b) => b.currentBet - a.currentBet)[0].currentBet;

  const inTurnPlayer = players.filter((player) => player.isBettingTurn)[0];

  if (!inTurnPlayer) {
    players[1].isBettingTurn = true;
    return betLevel;
  }
  inTurnPlayer.isBettingTurn = false;

  if (betLevel === 0) {
    if (inTurnPlayer.isDealer) {
      return betLevel;
    }
  } else {
    const activePlayers = players.filter(
      (player) => player.active && !player.folded && player.cash > 0
    );
    const paidUpPlayers = activePlayers.filter(
      (player) => player.currentBet === betLevel
    );

    if (activePlayers.length === paidUpPlayers.length) {
      return betLevel;
    }
  }

  const i = players.indexOf(inTurnPlayer);
  players[nextPlayerIndex(i)].isBettingTurn = true;

  function nextPlayerIndex(startNumber: number): number {
    let n: number;
    startNumber === players.length - 1 ? (n = 0) : (n = startNumber + 1);
    for (n; n < players.length; n++) {
      if (
        !players[n].folded &&
        players[n].active &&
        players[n].cash > 0 &&
        (players[n].currentBet < betLevel || betLevel === 0)
      ) {
        return n;
      }
    }

    n = 0;
    for (n; n < startNumber; n++) {
      if (
        !players[n].folded &&
        players[n].active &&
        players[n].cash > 0 &&
        (players[n].currentBet < betLevel || betLevel === 0)
      ) {
        return n;
      }
    }
    return n;
  }

  return betLevel;
}
