import { describe, expect, test } from "@jest/globals";
import {
  findNextBettingPlayerIndex,
  getEligiblePlayers,
  isEligibleForBetting,
  nextBettingTurn,
  nextRoundTurn,
} from "../src/lib/turns";
import { BettingStatus, BlindButtons, Player } from "../src/lib/player";
import { getPlayers } from "./helpers";

describe("button turns", () => {
  test("initial state", async () => {
    const players: Player[] = [
      {
        id: "1",
        cash: 10,
        currentBet: 0,
        cards: [],
        name: "1",
        cardsShown: false,
        active: true,
        folded: false,
        isDealer: false,
        gameId: "123",
        sortIndex: 0,
        blindButton: null,
        bettingStatus: BettingStatus.MUSTBET,
      },
      {
        id: "2",
        cash: 10,
        currentBet: 0,
        cards: [],
        name: "2",
        active: true,
        cardsShown: false,
        folded: false,
        isDealer: false,
        gameId: "123",
        sortIndex: 0,
        blindButton: null,
        bettingStatus: BettingStatus.MUSTBET,
      },
      {
        id: "3",
        cash: 10,
        currentBet: 0,
        cards: [],
        cardsShown: false,
        name: "3",
        active: true,
        folded: false,
        isDealer: false,
        gameId: "123",
        sortIndex: 0,
        blindButton: null,
        bettingStatus: BettingStatus.MUSTBET,
      },
    ];

    nextRoundTurn(players);

    expect(players[0].isDealer).toBeTruthy;
    expect(players[1].isDealer).toBeFalsy;
    expect(players[2].isDealer).toBeFalsy;

    expect(players[0].blindButton).toBeNull;
    expect(players[1].blindButton).toBe(BlindButtons.SMALLBLIND);
    expect(players[2].blindButton).toBe(BlindButtons.BIGBLIND);
  });

  test("round turn", async () => {
    const players: Player[] = [
      {
        id: "1",
        cash: 10,
        currentBet: 0,
        cards: [],
        name: "1",
        cardsShown: false,
        active: true,
        folded: false,
        isDealer: false,
        blindButton: BlindButtons.SMALLBLIND,
        gameId: "123",
        sortIndex: 0,
        bettingStatus: BettingStatus.MUSTBET,
      },
      {
        id: "2",
        cash: 10,
        currentBet: 0,
        cards: [],
        name: "2",
        active: true,
        cardsShown: false,
        folded: false,
        isDealer: false,
        blindButton: BlindButtons.BIGBLIND,
        gameId: "123",
        sortIndex: 0,
        bettingStatus: BettingStatus.MUSTBET,
      },
      {
        id: "3",
        cash: 10,
        currentBet: 0,
        cards: [],
        cardsShown: false,
        name: "3",
        active: true,
        folded: false,
        isDealer: true,
        gameId: "123",
        sortIndex: 0,
        blindButton: null,
        bettingStatus: BettingStatus.MUSTBET,
      },
    ];

    nextRoundTurn(players);
    expect(players[0].isDealer).toBeTruthy;
    expect(players[1].isDealer).toBeFalsy;
    expect(players[2].isDealer).toBeFalsy;

    expect(players[0].blindButton).toBeNull;
    expect(players[1].blindButton).toBe(BlindButtons.SMALLBLIND);
    expect(players[2].blindButton).toBe(BlindButtons.BIGBLIND);

    nextRoundTurn(players);
    expect(players[1].isDealer).toBeTruthy;
    expect(players[0].isDealer).toBeFalsy;
    expect(players[2].isDealer).toBeFalsy;

    expect(players[1].blindButton).toBeNull;
    expect(players[2].blindButton).toBe(BlindButtons.SMALLBLIND);
    expect(players[0].blindButton).toBe(BlindButtons.BIGBLIND);
  });
  test("2 players round turn", async () => {
    const players: Player[] = [
      {
        id: "1",
        cash: 10,
        currentBet: 0,
        cards: [],
        name: "1",
        cardsShown: false,
        active: true,
        folded: false,
        isDealer: false,
        blindButton: BlindButtons.SMALLBLIND,
        gameId: "123",
        sortIndex: 0,
        bettingStatus: BettingStatus.MUSTBET,
      },
      {
        id: "2",
        cash: 10,
        currentBet: 0,
        cards: [],
        name: "2",
        active: true,
        cardsShown: false,
        folded: false,
        isDealer: true,
        blindButton: BlindButtons.BIGBLIND,
        gameId: "123",
        sortIndex: 0,
        bettingStatus: BettingStatus.MUSTBET,
      },
    ];

    nextRoundTurn(players);

    expect(players[0].isDealer).toBeTruthy;
    expect(players[1].isDealer).toBeFalsy;

    expect(players[1].blindButton).toBe(BlindButtons.SMALLBLIND);
    expect(players[0].blindButton).toBe(BlindButtons.BIGBLIND);

    nextRoundTurn(players);
    expect(players[1].isDealer).toBeTruthy;
    expect(players[0].isDealer).toBeFalsy;

    expect(players[0].blindButton).toBe(BlindButtons.SMALLBLIND);
    expect(players[1].blindButton).toBe(BlindButtons.BIGBLIND);
  });

  test("dont give to busted or inactive", async () => {
    const players: Player[] = [
      {
        id: "1",
        cash: 0,
        currentBet: 0,
        cards: [],
        name: "1",
        cardsShown: false,
        active: true,
        folded: false,
        isDealer: false,
        blindButton: BlindButtons.SMALLBLIND,
        gameId: "123",
        sortIndex: 0,
        bettingStatus: BettingStatus.MUSTBET,
      },
      {
        id: "2",
        cash: 10,
        currentBet: 0,
        cards: [],
        name: "2",
        active: false,
        cardsShown: false,
        folded: false,
        isDealer: false,
        blindButton: BlindButtons.BIGBLIND,
        gameId: "123",
        sortIndex: 0,
        bettingStatus: BettingStatus.MUSTBET,
      },
      {
        id: "3",
        cash: 10,
        currentBet: 0,
        cards: [],
        cardsShown: false,
        name: "3",
        active: true,
        folded: false,
        isDealer: false,
        gameId: "123",
        sortIndex: 0,
        blindButton: null,
        bettingStatus: BettingStatus.MUSTBET,
      },
      {
        id: "4",
        cash: 10,
        currentBet: 0,
        cards: [],
        cardsShown: false,
        name: "3",
        active: true,
        folded: false,
        isDealer: true,
        gameId: "123",
        sortIndex: 0,
        blindButton: null,
        bettingStatus: BettingStatus.MUSTBET,
      },
    ];

    nextRoundTurn(players);
    expect(players[0].isDealer).toBeFalsy;
    expect(players[1].isDealer).toBeFalsy;
    expect(players[2].isDealer).toBeTruthy;
    expect(players[3].isDealer).toBeFalsy;

    expect(players[0].blindButton).toBeNull;
    expect(players[1].blindButton).toBeNull;
    expect(players[2].blindButton).toBe(BlindButtons.SMALLBLIND);
    expect(players[3].blindButton).toBe(BlindButtons.BIGBLIND);
  });
  test("dont give to busted or inactive 2", async () => {
    const players: Player[] = [
      {
        id: "1",
        cash: 0,
        currentBet: 0,
        cards: [],
        name: "1",
        cardsShown: false,
        active: true,
        folded: false,
        isDealer: false,
        blindButton: BlindButtons.SMALLBLIND,
        gameId: "123",
        sortIndex: 0,
        bettingStatus: BettingStatus.MUSTBET,
      },
      {
        id: "2",
        cash: 10,
        currentBet: 0,
        cards: [],
        name: "2",
        active: true,
        cardsShown: false,
        folded: false,
        isDealer: false,
        blindButton: BlindButtons.BIGBLIND,
        gameId: "123",
        sortIndex: 0,
        bettingStatus: BettingStatus.MUSTBET,
      },
      {
        id: "3",
        cash: 10,
        currentBet: 0,
        cards: [],
        cardsShown: false,
        name: "3",
        active: true,
        folded: false,
        isDealer: true,
        gameId: "123",
        sortIndex: 0,
        blindButton: null,
        bettingStatus: BettingStatus.MUSTBET,
      },
      {
        id: "4",
        cash: 0,
        currentBet: 0,
        cards: [],
        cardsShown: false,
        name: "3",
        active: true,
        folded: false,
        isDealer: false,
        gameId: "123",
        sortIndex: 0,
        blindButton: null,
        bettingStatus: BettingStatus.MUSTBET,
      },
    ];

    nextRoundTurn(players);
    expect(players[0].isDealer).toBeFalsy;
    expect(players[1].isDealer).toBeTruthy;
    expect(players[2].isDealer).toBeFalsy;
    expect(players[3].isDealer).toBeFalsy;

    expect(players[0].blindButton).toBeNull;
    expect(players[3].blindButton).toBeNull;
    expect(players[1].blindButton).toBe(BlindButtons.SMALLBLIND);
    expect(players[2].blindButton).toBe(BlindButtons.BIGBLIND);
  });
});

describe("betting turns", () => {
  test("initial state", async () => {
    const players = getPlayers();
    players[0].blindButton = BlindButtons.SMALLBLIND;
    players[1].blindButton = BlindButtons.BIGBLIND;

    const bet = await nextBettingTurn(players);

    expect(bet).toBe(0);
    expect(players[2].bettingStatus).toBe(2);
    expect(players[0].bettingStatus).toBe(1);
    expect(players[1].bettingStatus).toBe(1);
    expect(players[3].bettingStatus).toBe(1);
  });

  test("next player, 4 player", async () => {
    const players = getPlayers();
    players[1].blindButton = BlindButtons.SMALLBLIND;
    players[2].blindButton = BlindButtons.BIGBLIND;
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
    players[0].blindButton = BlindButtons.SMALLBLIND;
    players[1].blindButton = BlindButtons.BIGBLIND;

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
  test("isEligibleForBetting", () => {
    const player = new Player("123", "acb");
    player.cards = [
      { value: 4, suit: "club" },
      { value: 4, suit: "club" },
    ];
    expect(isEligibleForBetting(player)).toBe(false);

    player.bettingStatus = 1;
    expect(isEligibleForBetting(player)).toBe(true);

    player.bettingStatus = 2;
    expect(isEligibleForBetting(player)).toBe(false);

    player.cash = 0;
    player.bettingStatus = 1;
    expect(isEligibleForBetting(player)).toBe(false);

    player.cash = 10;
    player.active = false;
    expect(isEligibleForBetting(player)).toBe(false);

    player.active = true;
    player.folded = true;
    expect(isEligibleForBetting(player)).toBe(false);
  });

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
