import { mockClient } from "aws-sdk-client-mock";
import {
  ChimeSDKMeetings,
  CreateMeetingCommand,
} from "@aws-sdk/client-chime-sdk-meetings";

import { describe, expect, test, beforeEach, jest } from "@jest/globals";
import { startGame, gameState, GamePhase } from "../src/app/lib/game";
import { Deck } from "../src/app/lib/cards";
import { query } from "./fixtures/playerQuery";
import { MockedComponentClass } from "react-dom/test-utils";
import { Player } from "@/app/lib/player";

const chimeMock = mockClient(ChimeSDKMeetings);

describe("new game", () => {
  beforeEach(() => {
    chimeMock.reset();
  });

  test("generates a new game", async () => {
    chimeMock
      .on(CreateMeetingCommand)
      .resolves({ Meeting: { MediaPlacement: { AudioFallbackUrl: "test" } } });

    const game = await startGame();
    expect(game).toBeTruthy;
    expect(game?.cardDeck.length).toBe(52);
    expect(game?.chimeConfig.MediaPlacement?.AudioFallbackUrl).toBe("test");
  });
});

describe("reset card states", () => {
  test("resets cards", async () => {
    const game: gameState = {
      id: "123",
      chimeConfig: {},
      cardDeck: [
        { suit: "c", value: 4 },
        { suit: "d", value: 5 },
      ],
      communityCards: [
        { suit: "a", value: 2 },
        { suit: "b", value: 3 },
      ],
      results: [],
      prizePot: 0,
      phase: GamePhase.START,
      blind: 0,
    };

    // redealDeck(game);

    // expect(game?.cardDeck.length).toBe(52);
    // expect(game?.communityCards.length).toBe(0);
  });
});

describe("deals next community cards", () => {
  test("deals the cards", async () => {
    // const game: gameState = {
    //   id: "123",
    //   chimeConfig: {},
    //   cardDeck: new Deck().cards,
    //   communityCards: [],
    //   results: [],
    // };
    // redealDeck(game);
    // expect(game.communityCards.length).toBe(3);
    // expect(game.cardDeck.length).toBe(49);
    // expect(game.cardDeck).not.toContain(game.communityCards[0]);
    // expect(game.cardDeck).not.toContain(game.communityCards[1]);
    // expect(game.cardDeck).not.toContain(game.communityCards[2]);
    // redealDeck(game);
    // expect(game.communityCards.length).toBe(4);
    // expect(game.cardDeck.length).toBe(48);
    // expect(game.cardDeck).not.toContain(game.communityCards[0]);
    // expect(game.cardDeck).not.toContain(game.communityCards[1]);
    // expect(game.cardDeck).not.toContain(game.communityCards[2]);
    // expect(game.cardDeck).not.toContain(game.communityCards[3]);
    // redealDeck(game);
    // expect(game.communityCards.length).toBe(5);
    // expect(game.cardDeck.length).toBe(47);
    // expect(game.cardDeck).not.toContain(game.communityCards[0]);
    // expect(game.cardDeck).not.toContain(game.communityCards[1]);
    // expect(game.cardDeck).not.toContain(game.communityCards[2]);
    // expect(game.cardDeck).not.toContain(game.communityCards[3]);
    // expect(game.cardDeck).not.toContain(game.communityCards[4]);
    // redealDeck(game);
    // expect(game.communityCards.length).toBe(5);
    // expect(game.cardDeck.length).toBe(47);
  });
});

describe("deals to players", () => {
  test("deals cards to each player", async () => {
    // const game: gameState = {
    //   id: "123",
    //   chimeConfig: {},
    //   cardDeck: [],
    //   communityCards: [],
    //   players: [new Player("123", "Ad")],
    //   results: [],
    // };
    // const deal = await redealDeck(game);
    // expect(game.cardDeck.length).toBe(50);
    // expect(deal.hands.length).toBe(2);
    // expect(game.cardDeck).not.toContain(deal.hands[0].cards[0]);
  });
});

// describe("finding winners", () => {
//   test("find winner", async () => {
//     const game: gameState = {
//       id: "123",
//       chimeConfig: {},
//       cardDeck: [],
//       communityCards: [
//         { value: 7, suit: "♣️" },
//         { value: 10, suit: "♣️" },
//         { value: 2, suit: "♣️" },
//         { value: 5, suit: "♦️" },
//         { value: 7, suit: "♥️" },
//       ],
//       players: ["A", "B"],
//       results: [],
//     };

//     const results = await findWinner(game);

//     expect(results[0].result).toBe("Flush");
//     expect(results[1].result).toBe("OnePair");
//     expect(results[0].cards.length).toBe(5);
//     expect(results[1].cards.length).toBe(2);
//   });
// });

// describe("play a game", () => {
//   test("run a full round", async () => {
//     const game = await startGame();
//     expect(game).toBeTruthy;
//     if (!game) {
//       return;
//     }

//     game.players = ["A", "B"];
//     await redealDeck(game);

//     expect(game.cardDeck.length).toBe(48);
//     expect(game.communityCards.length).toBe(0);

//     await redealDeck(game);

//     expect(game.communityCards.length).toBe(3);
//     expect(game.cardDeck.length).toBe(45);
//     expect(game.cardDeck).not.toContain(game.communityCards[0]);
//     expect(game.cardDeck).not.toContain(game.communityCards[1]);
//     expect(game.cardDeck).not.toContain(game.communityCards[2]);

//     await redealDeck(game);

//     expect(game.communityCards.length).toBe(4);
//     expect(game.cardDeck.length).toBe(44);
//     expect(game.cardDeck).not.toContain(game.communityCards[0]);
//     expect(game.cardDeck).not.toContain(game.communityCards[1]);
//     expect(game.cardDeck).not.toContain(game.communityCards[2]);
//     expect(game.cardDeck).not.toContain(game.communityCards[3]);

//     await redealDeck(game);

//     expect(game.communityCards.length).toBe(5);
//     expect(game.cardDeck.length).toBe(43);
//     expect(game.cardDeck).not.toContain(game.communityCards[0]);
//     expect(game.cardDeck).not.toContain(game.communityCards[1]);
//     expect(game.cardDeck).not.toContain(game.communityCards[2]);
//     expect(game.cardDeck).not.toContain(game.communityCards[3]);
//     expect(game.cardDeck).not.toContain(game.communityCards[4]);

//     await redealDeck(game);

//     expect(game.results.length).toBe(2);
//     expect(game.results[0].result).not.toBe("");

//     await redealDeck(game);

//     expect(game.results.length).toBe(0);
//     expect(game.cardDeck.length).toBe(48);
//     expect(game.communityCards.length).toBe(0);
//   });
// });
