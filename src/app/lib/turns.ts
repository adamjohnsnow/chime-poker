import { writeAllPlayers } from "./firebase";
import { BlindButtons, Player, loadAllPlayers } from "./player";

export async function triggerNextRound(gameId: string) {
  const players = await loadAllPlayers(gameId);
  await nextRoundTurn(players);
}

export async function triggerNextBetting(gameId: string) {
  const players = await loadAllPlayers(gameId);
  await nextBettingTurn(players);
  await writeAllPlayers(players);
}

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

  if (!players.find((player) => player.isDealer)) {
    players[0].isDealer = true;
    players[1].blindButton = BlindButtons.BIGBLIND;
    players[nextPlayerIndex(1)].blindButton = BlindButtons.SMALLBLIND;
    return;
  }
  let dealerMoved = false;
  let buttonsMoved = false;

  for (let i = 0; i < players.length; i++) {
    if (!buttonsMoved && players[i].blindButton === BlindButtons.BIGBLIND) {
      players[i].blindButton = null;
      players[nextPlayerIndex(i)].blindButton = BlindButtons.BIGBLIND;
      players[nextPlayerIndex(nextPlayerIndex(i))].blindButton =
        BlindButtons.SMALLBLIND;
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

  const inTurnPlayer = players.find((player) => player.isBettingTurn);
  if (!inTurnPlayer) {
    const small = players.find(
      (player) => player.blindButton === BlindButtons.SMALLBLIND
    );

    if (small) {
      players[nextPlayerIndex(players.indexOf(small))].isBettingTurn = true;
    } else {
      players[1].isBettingTurn = true;
    }
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
