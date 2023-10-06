import { BettingStatus, BlindButtons, Player } from "./player";

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
    players[nextPlayerIndex(0)].blindButton = BlindButtons.SMALLBLIND;
    players[nextPlayerIndex(nextPlayerIndex(0))].blindButton =
      BlindButtons.BIGBLIND;
    return;
  }
  let dealerMoved = false;
  let buttonsMoved = false;

  for (let i = 0; i < players.length; i++) {
    if (!buttonsMoved && players[i].blindButton === BlindButtons.SMALLBLIND) {
      players[i].blindButton = null;
      players[nextPlayerIndex(i)].blindButton = BlindButtons.SMALLBLIND;
      players[nextPlayerIndex(nextPlayerIndex(i))].blindButton =
        BlindButtons.BIGBLIND;
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
  const betLevel = getMaxCurrentBet(players);
  const inTurnPlayer = getInTurnPlayer(players);

  if (!inTurnPlayer) {
    const bigBlind = players.find(
      (player) => player.blindButton === BlindButtons.BIGBLIND
    );
    if (bigBlind) {
      setNextBettingTurn(players, players.indexOf(bigBlind as Player));
    }
    return betLevel;
  }

  inTurnPlayer.bettingStatus = BettingStatus.HASBET;
  const activePlayers = getEligiblePlayers(players);

  if (activePlayers.length > 0) {
    setNextBettingTurn(players, players.indexOf(inTurnPlayer));
  }
  return betLevel;
}

export function getMaxCurrentBet(players: Player[]): number {
  return Math.max(...players.map((player) => player.currentBet));
}

export function getInTurnPlayer(players: Player[]): Player | undefined {
  return players.find(
    (player) => player.bettingStatus === BettingStatus.BETTING
  );
}

export function setNextBettingTurn(
  players: Player[],
  startIndex: number
): void {
  const nextIndex = findNextBettingPlayerIndex(players, startIndex);
  players[nextIndex].bettingStatus = BettingStatus.BETTING;
}

export function findNextBettingPlayerIndex(
  players: Player[],
  startIndex: number
): number {
  for (let i = startIndex + 1; i < players.length; i++) {
    if (isEligibleForBetting(players[i])) {
      return i;
    }
  }

  for (let i = 0; i < startIndex; i++) {
    if (isEligibleForBetting(players[i])) {
      return i;
    }
  }

  return startIndex;
}

export function isEligibleForBetting(player: Player): boolean {
  return (
    !player.folded &&
    player.active &&
    player.cash > 0 &&
    player.cards.length === 2 &&
    player.bettingStatus === BettingStatus.MUSTBET
  );
}

export function getEligiblePlayers(players: Player[]): Player[] {
  return players.filter((player) => isEligibleForBetting(player));
}
