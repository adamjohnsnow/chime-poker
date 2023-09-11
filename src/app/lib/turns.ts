import { act } from "react-dom/test-utils";
import { writeAllPlayers } from "./firebase";
import { BettingStatus, BlindButtons, Player, loadAllPlayers } from "./player";

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

  if (!players.find((player) => player.isDealer)) {
    players[0].isDealer = true;
    players[1].blindButton = BlindButtons.BIGBLIND;
    players[findNextTurnPlayerIndex(players, 1)].blindButton =
      BlindButtons.SMALLBLIND;
    return;
  }
  let dealerMoved = false;
  let buttonsMoved = false;

  for (let i = 0; i < players.length; i++) {
    if (!buttonsMoved && players[i].blindButton === BlindButtons.BIGBLIND) {
      players[i].blindButton = null;
      players[findNextTurnPlayerIndex(players, i)].blindButton =
        BlindButtons.BIGBLIND;
      players[
        findNextTurnPlayerIndex(players, findNextTurnPlayerIndex(players, i))
      ].blindButton = BlindButtons.SMALLBLIND;
      buttonsMoved = true;
    }
    if (!dealerMoved && players[i].isDealer) {
      players[findNextTurnPlayerIndex(players, i)].isDealer = true;
      players[i].isDealer = false;
      dealerMoved = true;
    }
  }
}

export async function nextBettingTurn(players: Player[]): Promise<number> {
  const betLevel = getMaxCurrentBet(players);
  const inTurnPlayer = getInTurnPlayer(players);

  if (!inTurnPlayer) {
    const smallBlind = players.find(
      (player) => player.blindButton === BlindButtons.SMALLBLIND
    );
    if (smallBlind) {
      setNextBettingTurn(players, players.indexOf(smallBlind as Player));
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

function findNextTurnPlayerIndex(
  players: Player[],
  startIndex: number
): number {
  for (let i = startIndex + 1; i < players.length; i++) {
    if (players[i].canPlay()) {
      return i;
    }
  }

  for (let i = 0; i < startIndex; i++) {
    console.log(players[i].canPlay());
    if (players[i].canPlay()) {
      return i;
    }
  }

  return startIndex;
}

export function findNextBettingPlayerIndex(
  players: Player[],
  startIndex: number
): number {
  for (let i = startIndex + 1; i < players.length; i++) {
    if (players[i].isEligibleForBetting()) {
      return i;
    }
  }

  for (let i = 0; i < startIndex; i++) {
    if (players[i].isEligibleForBetting()) {
      return i;
    }
  }

  return startIndex;
}

export function getEligiblePlayers(players: Player[]): Player[] {
  return players.filter((player) => player.isEligibleForBetting());
}
