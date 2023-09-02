import { describe, expect, test, beforeEach } from "@jest/globals";
import { nextRoundTurn } from "../src/app/lib/turns";
import { BlindButtons, Player } from "../src/app/lib/player";
import exp from "constants";

describe("turns", () => {
  test("Initial state", async () => {
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
      },
    ];

    nextRoundTurn(players);

    expect(players[0].isDealer).toBeTruthy;
    expect(players[1].isDealer).toBeFalsy;
    expect(players[2].isDealer).toBeFalsy;

    expect(players[0].blindButton).toBeNull;
    expect(players[1].blindButton).toBe(BlindButtons.BIGBLIND);
    expect(players[2].blindButton).toBe(BlindButtons.LITTLEBLIND);
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
        blindButton: BlindButtons.BIGBLIND,
        gameId: "123",
        sortIndex: 0,
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
        blindButton: BlindButtons.LITTLEBLIND,
        gameId: "123",
        sortIndex: 0,
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
      },
    ];

    nextRoundTurn(players);
    expect(players[0].isDealer).toBeTruthy;
    expect(players[1].isDealer).toBeFalsy;
    expect(players[2].isDealer).toBeFalsy;

    expect(players[0].blindButton).toBeNull;
    expect(players[1].blindButton).toBe(BlindButtons.BIGBLIND);
    expect(players[2].blindButton).toBe(BlindButtons.LITTLEBLIND);

    nextRoundTurn(players);
    expect(players[1].isDealer).toBeTruthy;
    expect(players[0].isDealer).toBeFalsy;
    expect(players[2].isDealer).toBeFalsy;

    expect(players[1].blindButton).toBeNull;
    expect(players[2].blindButton).toBe(BlindButtons.BIGBLIND);
    expect(players[0].blindButton).toBe(BlindButtons.LITTLEBLIND);
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
        blindButton: BlindButtons.BIGBLIND,
        gameId: "123",
        sortIndex: 0,
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
        blindButton: BlindButtons.LITTLEBLIND,
        gameId: "123",
        sortIndex: 0,
      },
    ];

    nextRoundTurn(players);

    expect(players[0].isDealer).toBeTruthy;
    expect(players[1].isDealer).toBeFalsy;

    expect(players[1].blindButton).toBe(BlindButtons.BIGBLIND);
    expect(players[0].blindButton).toBe(BlindButtons.LITTLEBLIND);

    nextRoundTurn(players);
    expect(players[1].isDealer).toBeTruthy;
    expect(players[0].isDealer).toBeFalsy;

    expect(players[0].blindButton).toBe(BlindButtons.BIGBLIND);
    expect(players[1].blindButton).toBe(BlindButtons.LITTLEBLIND);
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
        blindButton: BlindButtons.BIGBLIND,
        gameId: "123",
        sortIndex: 0,
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
        blindButton: BlindButtons.LITTLEBLIND,
        gameId: "123",
        sortIndex: 0,
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
      },
    ];

    nextRoundTurn(players);
    expect(players[0].isDealer).toBeFalsy;
    expect(players[1].isDealer).toBeFalsy;
    expect(players[2].isDealer).toBeTruthy;
    expect(players[3].isDealer).toBeFalsy;

    expect(players[0].blindButton).toBeNull;
    expect(players[1].blindButton).toBeNull;
    expect(players[2].blindButton).toBe(BlindButtons.BIGBLIND);
    expect(players[3].blindButton).toBe(BlindButtons.LITTLEBLIND);
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
        blindButton: BlindButtons.BIGBLIND,
        gameId: "123",
        sortIndex: 0,
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
        blindButton: BlindButtons.LITTLEBLIND,
        gameId: "123",
        sortIndex: 0,
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
      },
    ];

    nextRoundTurn(players);
    expect(players[0].isDealer).toBeFalsy;
    expect(players[1].isDealer).toBeTruthy;
    expect(players[2].isDealer).toBeFalsy;
    expect(players[3].isDealer).toBeFalsy;

    expect(players[0].blindButton).toBeNull;
    expect(players[3].blindButton).toBeNull;
    expect(players[1].blindButton).toBe(BlindButtons.BIGBLIND);
    expect(players[2].blindButton).toBe(BlindButtons.LITTLEBLIND);
  });
});
