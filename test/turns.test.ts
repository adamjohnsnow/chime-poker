import { describe, expect, test } from "@jest/globals";
import {
  findNextBettingPlayerIndex,
  getEligiblePlayers,
  nextBettingTurn,
  nextRoundTurn,
} from "../src/app/lib/turns";
import { BettingStatus, BlindButtons, Player } from "../src/app/lib/player";
import { getPlayer } from "@/app/lib/firebase";

function getPlayers() {
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

describe("button turns", () => {
  test("initial state", async () => {
    const players = getPlayers();

    nextRoundTurn(players);

    expect(players[0].isDealer).toBe(true);
    expect(players[1].isDealer).toBe(false);
    expect(players[2].isDealer).toBe(false);

    expect(players[0].blindButton).toBe(null);
    expect(players[1].blindButton).toBe(BlindButtons.BIGBLIND);
    expect(players[2].blindButton).toBe(BlindButtons.SMALLBLIND);
  });

  test("round turn", async () => {
    const players = getPlayers().slice(0, 3);

    nextRoundTurn(players);
    expect(players[0].isDealer).toBe(true);
    expect(players[1].isDealer).toBe(false);
    expect(players[2].isDealer).toBe(false);

    expect(players[0].blindButton).toBe(null);
    expect(players[1].blindButton).toBe(BlindButtons.BIGBLIND);
    expect(players[2].blindButton).toBe(BlindButtons.SMALLBLIND);

    nextRoundTurn(players);
    expect(players[1].isDealer).toBe(true);
    expect(players[0].isDealer).toBe(false);
    expect(players[2].isDealer).toBe(false);

    expect(players[1].blindButton).toBe(null);
    expect(players[2].blindButton).toBe(BlindButtons.BIGBLIND);
    expect(players[0].blindButton).toBe(BlindButtons.SMALLBLIND);
  });
  test("2 players round turn", async () => {
    const players = getPlayers().slice(0, 2);

    nextRoundTurn(players);

    expect(players[0].isDealer).toBe(true);
    expect(players[1].isDealer).toBe(false);

    expect(players[1].blindButton).toBe(BlindButtons.BIGBLIND);
    expect(players[0].blindButton).toBe(BlindButtons.SMALLBLIND);

    nextRoundTurn(players);
    expect(players[1].isDealer).toBe(true);
    expect(players[0].isDealer).toBe(false);

    expect(players[0].blindButton).toBe(BlindButtons.BIGBLIND);
    expect(players[1].blindButton).toBe(BlindButtons.SMALLBLIND);
  });

  test("dont give to inactive", async () => {
    const players = getPlayers();
    players[0].active = false;
    players[0].isDealer = true;
    players[1].active = false;
    players[1].blindButton = 1;
    nextRoundTurn(players);

    expect(players[0].isDealer).toBe(false);
    expect(players[1].isDealer).toBe(false);
    expect(players[2].isDealer).toBe(true);
    expect(players[3].isDealer).toBe(false);

    expect(players[0].blindButton).toBe(null);
    expect(players[1].blindButton).toBe(null);
    expect(players[2].blindButton).toBe(BlindButtons.BIGBLIND);
    expect(players[3].blindButton).toBe(BlindButtons.SMALLBLIND);
  });

  test("dont give to busted players", async () => {
    const players = getPlayers();
    players[1].cash = 0;
    players[2].cash = 0;
    players[0].isDealer = true;
    players[1].blindButton = 1;
    nextRoundTurn(players);

    expect(players[0].isDealer).toBe(false);
    expect(players[1].isDealer).toBe(false);
    expect(players[2].isDealer).toBe(false);
    expect(players[3].isDealer).toBe(true);

    expect(players[0].blindButton).toBe(BlindButtons.SMALLBLIND);
    expect(players[1].blindButton).toBe(null);
    expect(players[2].blindButton).toBe(null);
    expect(players[3].blindButton).toBe(BlindButtons.BIGBLIND);
  });
});

describe("betting turns", () => {
  test("initial state", async () => {
    const players = getPlayers();
    players[0].blindButton = BlindButtons.BIGBLIND;
    players[1].blindButton = BlindButtons.SMALLBLIND;

    const bet = await nextBettingTurn(players);

    expect(bet).toBe(0);
    expect(players[2].bettingStatus).toBe(2);
    expect(players[0].bettingStatus).toBe(1);
    expect(players[1].bettingStatus).toBe(1);
    expect(players[3].bettingStatus).toBe(1);
  });

  test("next player, 4 player", async () => {
    const players = getPlayers();
    players[1].blindButton = BlindButtons.BIGBLIND;
    players[2].blindButton = BlindButtons.SMALLBLIND;
    players[3].bettingStatus = BettingStatus.BETTING;

    let bet = await nextBettingTurn(players);

    expect(bet).toBe(0);
    expect(players[0].bettingStatus).toBe(2);
    expect(players[1].bettingStatus).toBe(1);
    expect(players[2].bettingStatus).toBe(1);
    expect(players[3].bettingStatus).toBe(3);

    bet = await nextBettingTurn(players);

    expect(bet).toBe(0);
    expect(players[0].bettingStatus).toBe(3);
    expect(players[1].bettingStatus).toBe(2);
    expect(players[2].bettingStatus).toBe(1);
    expect(players[3].bettingStatus).toBe(3);
  });

  test("next player, 2 player", async () => {
    const players = getPlayers().splice(0, 2);
    players[0].blindButton = BlindButtons.BIGBLIND;
    players[1].blindButton = BlindButtons.SMALLBLIND;

    let bet = await nextBettingTurn(players);

    expect(bet).toBe(0);
    expect(players[0].bettingStatus).toBe(2);
    expect(players[1].bettingStatus).toBe(1);

    bet = await nextBettingTurn(players);

    expect(bet).toBe(0);
    expect(players[0].bettingStatus).toBe(3);
    expect(players[1].bettingStatus).toBe(2);
  });
});

describe("helper functions", () => {
  test("getActiveNonFoldedPlayers", () => {
    const players = getPlayers();
    players[0].bettingStatus = 1;
    players[1].folded = true;
    players[2].cash = 0;
    players[3].active = false;

    const filter = getEligiblePlayers(players);

    expect(filter.length).toBe(1);
    expect(filter[0].name).toBe("abc");
  });

  test("findNextBettingPlayer", () => {
    const players = getPlayers();
    players[0].bettingStatus = 1;
    players[1].bettingStatus = 1;
    players[2].bettingStatus = 1;
    players[3].bettingStatus = 1;

    let i = findNextBettingPlayerIndex(players, 1);
    expect(i).toBe(2);

    players[2].folded = true;
    i = findNextBettingPlayerIndex(players, 1);
    expect(i).toBe(3);

    players[3].cash = 0;
    i = findNextBettingPlayerIndex(players, 1);
    expect(i).toBe(0);
  });
});
