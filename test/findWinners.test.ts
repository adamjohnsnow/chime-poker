import { findWinner } from "../src/app/lib/findWinner";
import { gameState, GamePhase } from "../src/app/lib/game";
import { Player } from "../src/app/lib/player";
import { describe, expect, test } from "@jest/globals";

describe("finding winners", () => {
  test("find winner, flush vs 1 pair", async () => {
    const game: gameState = {
      id: "123",
      chimeConfig: {},
      cardDeck: [],
      communityCards: [
        { value: 7, suit: "♣️" },
        { value: 10, suit: "♣️" },
        { value: 2, suit: "♣️" },
        { value: 5, suit: "♦️" },
        { value: 7, suit: "♥️" },
      ],
      results: [],
      prizePot: 1000,
      phase: GamePhase.START,
      blind: 0,
    };
    const players = [new Player("123", "A"), new Player("123", "B")];
    players[0].cards = [
      { value: 1, suit: "♣️" },
      { value: 3, suit: "♣️" },
    ];
    players[1].cards = [
      { value: 1, suit: "♥️" },
      { value: 6, suit: "♥️" },
    ];

    await findWinner(game, players);

    expect(game.results[0].result).toBe("Flush");
    expect(game.results[1].result).toBe("OnePair");
    expect(game.results[0].cards.length).toBe(5);
    expect(game.results[1].cards.length).toBe(2);
  });
});
