import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import {
  ChimeSDKMeetings,
  CreateMeetingCommand,
} from "@aws-sdk/client-chime-sdk-meetings";

import { describe, expect, test, beforeEach } from "@jest/globals";
import {
  createNewGame,
  startGame,
  gameState,
  redealDeck,
  dealNextCards,
  dealCardToEachPlayer,
} from "../src/app/lib/game";
import { Deck } from "../src/app/lib/cards";
import { Player } from "../src/app/lib/player";
import exp from "constants";

const ddbMock = mockClient(DynamoDBClient);
const chimeMock = mockClient(ChimeSDKMeetings);

describe("new game", () => {
  beforeEach(() => {
    ddbMock.reset();
    chimeMock.reset();
  });

  test("generates a new game", async () => {
    ddbMock.on(GetItemCommand).resolves({ Item: { id: { S: "123-123" } } });
    chimeMock
      .on(CreateMeetingCommand)
      .resolves({ Meeting: { MediaPlacement: { AudioFallbackUrl: "test" } } });

    const game = await startGame();
    expect(game).toBeTruthy;
    expect(game?.cardDeck.length).toBe(52);
    expect(game?.chimeConfig.MediaPlacement?.AudioFallbackUrl).toBe("test");
    expect(game?.players).toBeFalsy;
  });

  test("creates game as string", async () => {
    ddbMock.on(GetItemCommand).resolves({ Item: { id: { S: "123-123" } } });
    chimeMock
      .on(CreateMeetingCommand)
      .resolves({ Meeting: { MediaPlacement: { AudioFallbackUrl: "test" } } });

    const game = await createNewGame();
    const state = JSON.parse(game);

    expect(state?.cardDeck.length).toBe(52);
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
      players: [],
    };

    redealDeck(game);

    expect(game?.cardDeck.length).toBe(52);
    expect(game?.communityCards.length).toBe(0);
  });
});

describe("deals next community cards", () => {
  test("deals the cards", async () => {
    const game: gameState = {
      id: "123",
      chimeConfig: {},
      cardDeck: new Deck().cards,
      communityCards: [],
      players: [],
    };

    dealNextCards(game);

    expect(game.communityCards.length).toBe(3);
    expect(game.cardDeck.length).toBe(49);
    expect(game.cardDeck).not.toContain(game.communityCards[0]);
    expect(game.cardDeck).not.toContain(game.communityCards[1]);
    expect(game.cardDeck).not.toContain(game.communityCards[2]);

    dealNextCards(game);

    expect(game.communityCards.length).toBe(4);
    expect(game.cardDeck.length).toBe(48);
    expect(game.cardDeck).not.toContain(game.communityCards[0]);
    expect(game.cardDeck).not.toContain(game.communityCards[1]);
    expect(game.cardDeck).not.toContain(game.communityCards[2]);
    expect(game.cardDeck).not.toContain(game.communityCards[3]);

    dealNextCards(game);

    expect(game.communityCards.length).toBe(5);
    expect(game.cardDeck.length).toBe(47);
    expect(game.cardDeck).not.toContain(game.communityCards[0]);
    expect(game.cardDeck).not.toContain(game.communityCards[1]);
    expect(game.cardDeck).not.toContain(game.communityCards[2]);
    expect(game.cardDeck).not.toContain(game.communityCards[3]);
    expect(game.cardDeck).not.toContain(game.communityCards[4]);

    dealNextCards(game);

    expect(game.communityCards.length).toBe(5);
    expect(game.cardDeck.length).toBe(47);
  });
});

describe("deals to players", () => {
  test("deals one card to one player", () => {
    const game: gameState = {
      id: "123",
      chimeConfig: {},
      cardDeck: [
        { suit: "a", value: 2 },
        { suit: "b", value: 3 },
      ],
      communityCards: [],
      players: [new Player()],
    };

    dealCardToEachPlayer(game);

    expect(game.cardDeck.length).toBe(1);
    expect(game.players[0].cards?.length).toBe(1);
    expect(game.cardDeck).not.toContain(game.players[0].cards[0]);
  });

  test("deals one card to two players", () => {
    const game: gameState = {
      id: "123",
      chimeConfig: {},
      cardDeck: [
        { suit: "a", value: 2 },
        { suit: "b", value: 3 },
        { suit: "c", value: 4 },
        { suit: "d", value: 5 },
      ],
      communityCards: [],
      players: [new Player(), new Player()],
    };

    dealCardToEachPlayer(game);

    expect(game.cardDeck.length).toBe(2);
    expect(game.players[0].cards?.length).toBe(1);
    expect(game.players[1].cards?.length).toBe(1);
    expect(game.cardDeck).not.toContain(game.players[0].cards[0]);
    expect(game.cardDeck).not.toContain(game.players[1].cards[0]);
  });
});

describe("play a game", () => {
  test("run a full round", async () => {
    const game = await startGame();
    expect(game).toBeTruthy;
    if (!game) {
      return;
    }

    game.players = [new Player(), new Player()];
    redealDeck(game);

    expect(game.cardDeck.length).toBe(48);
    expect(game.communityCards.length).toBe(0);
    expect(game.players[0].cards.length).toBe(2);
    expect(game.players[1].cards.length).toBe(2);

    dealNextCards(game);

    expect(game.communityCards.length).toBe(3);
    expect(game.cardDeck.length).toBe(45);
    expect(game.cardDeck).not.toContain(game.communityCards[0]);
    expect(game.cardDeck).not.toContain(game.communityCards[1]);
    expect(game.cardDeck).not.toContain(game.communityCards[2]);
    expect(game.players[0].cards.length).toBe(2);
    expect(game.players[1].cards.length).toBe(2);

    dealNextCards(game);

    expect(game.communityCards.length).toBe(4);
    expect(game.cardDeck.length).toBe(44);
    expect(game.cardDeck).not.toContain(game.communityCards[0]);
    expect(game.cardDeck).not.toContain(game.communityCards[1]);
    expect(game.cardDeck).not.toContain(game.communityCards[2]);
    expect(game.cardDeck).not.toContain(game.communityCards[3]);
    expect(game.players[0].cards.length).toBe(2);
    expect(game.players[1].cards.length).toBe(2);

    dealNextCards(game);

    expect(game.communityCards.length).toBe(5);
    expect(game.cardDeck.length).toBe(43);
    expect(game.cardDeck).not.toContain(game.communityCards[0]);
    expect(game.cardDeck).not.toContain(game.communityCards[1]);
    expect(game.cardDeck).not.toContain(game.communityCards[2]);
    expect(game.cardDeck).not.toContain(game.communityCards[3]);
    expect(game.cardDeck).not.toContain(game.communityCards[4]);

    redealDeck(game);

    expect(game.cardDeck.length).toBe(48);
    expect(game.communityCards.length).toBe(0);
    expect(game.players[0].cards.length).toBe(2);
    expect(game.players[1].cards.length).toBe(2);
  });
});
