import { describe, expect, test, beforeEach } from "@jest/globals";
import { nextRoundTurn } from "../src/app/lib/turns";
import { BlindButtons, Player } from "../src/app/lib/player";
import exp from "constants";

describe("turns", () => {
  test("round turn", async () => {
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
        blindButton: BlindButtons["Big Blind"],
        gameId: "123",
      },
      {
        id: "2",
        cash: 0,
        currentBet: 0,
        cards: [],
        name: "2",
        active: true,
        cardsShown: false,
        folded: false,
        isDealer: false,
        blindButton: BlindButtons["Little Blind"],
        gameId: "123",
      },
      {
        id: "3",
        cash: 0,
        currentBet: 0,
        cards: [],
        cardsShown: false,
        name: "3",
        active: true,
        folded: false,
        isDealer: true,
        gameId: "123",
      },
    ];

    nextRoundTurn(players);

    expect(players[0].isDealer).toBeTruthy;
    expect(players[1].isDealer).toBeFalsy;
    expect(players[2].isDealer).toBeFalsy;

    expect(players[0].blindButton).toBeUndefined;
    expect(players[1].blindButton).toBe(BlindButtons["Big Blind"]);
    expect(players[2].blindButton).toBe(BlindButtons["Little Blind"]);

    nextRoundTurn(players);
    expect(players[1].isDealer).toBeTruthy;
    expect(players[0].isDealer).toBeFalsy;
    expect(players[2].isDealer).toBeFalsy;

    expect(players[1].blindButton).toBeUndefined;
    expect(players[2].blindButton).toBe(BlindButtons["Big Blind"]);
    expect(players[0].blindButton).toBe(BlindButtons["Little Blind"]);
  });
});
