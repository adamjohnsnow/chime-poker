import { describe, expect, test } from "@jest/globals";
import {
  getNewGame,
  gameState,
  GamePhase,
  dealNextCards,
  processResetCards,
  dealDeck,
  countActivePlayers,
  findWinner,
} from "../src/app/lib/game";
import { Player } from "../src/app/lib/player";
import { Deck } from "../src/app/lib/cards";
import exp from "constants";

describe("new game", () => {
  test("generates a new game", async () => {
    const game = await getNewGame("abc", {
      MediaPlacement: { AudioFallbackUrl: "test" },
    });
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
      prizePot: 1000,
      phase: GamePhase.START,
      blind: 0,
    };
    const players: Player[] = [
      new Player("123", "abc"),
      new Player("123", "xyz"),
    ];
    await processResetCards(game, players);

    expect(game?.cardDeck.length).toBe(52);
    expect(game?.communityCards.length).toBe(0);
  });
});

describe("count active players", () => {
  test("no inactive players", () => {
    const players: Player[] = [
      new Player("123", "abc"),
      new Player("123", "xyz"),
    ];
    const count = countActivePlayers(players);

    expect(count).toBe(2);
  });
  test("one inactive player", () => {
    const players: Player[] = [
      new Player("123", "abc"),
      new Player("123", "xyz"),
    ];
    players[0].active = false;
    const count = countActivePlayers(players);

    expect(count).toBe(1);
  });
  test("one busted players", () => {
    const players: Player[] = [
      new Player("123", "abc"),
      new Player("123", "xyz"),
    ];
    players[0].cash = 0;
    const count = countActivePlayers(players);

    expect(count).toBe(1);
  });
  test("one busted, one inactive players", () => {
    const players: Player[] = [
      new Player("123", "abc"),
      new Player("123", "xyz"),
    ];
    players[0].cash = 0;
    players[1].active = false;

    const count = countActivePlayers(players);

    expect(count).toBe(0);
  });
});

describe("first deal", () => {
  test("deal deck", async () => {
    const game: gameState = {
      id: "123",
      chimeConfig: {},
      cardDeck: new Deck().cards,
      communityCards: [
        { suit: "a", value: 2 },
        { suit: "b", value: 3 },
      ],
      results: [],
      prizePot: 1000,
      phase: GamePhase.START,
      blind: 0,
    };
    const players: Player[] = [
      new Player("123", "abc"),
      new Player("123", "xyz"),
    ];

    await dealDeck(game, players);
    expect(players[0].cards.length).toBe(2);
    expect(game.cardDeck.length).toBe(48);
  });
});
describe("goes through phases of the game", () => {
  test("deals the cards", async () => {
    const game: gameState = {
      id: "123",
      chimeConfig: {},
      cardDeck: new Deck().cards,
      communityCards: [],
      results: [],
      phase: GamePhase.DEAL,
      prizePot: 0,
      blind: 0,
    };
    await dealNextCards(game, []);
    expect(game.communityCards.length).toBe(3);
    expect(game.cardDeck.length).toBe(49);
    expect(game.cardDeck).not.toContain(game.communityCards[0]);
    expect(game.cardDeck).not.toContain(game.communityCards[1]);
    expect(game.cardDeck).not.toContain(game.communityCards[2]);
    expect(game.phase).toBe(GamePhase.TURN);
    expect(game.results.length).toBe(0);

    await dealNextCards(game, []);
    expect(game.communityCards.length).toBe(4);
    expect(game.cardDeck.length).toBe(48);
    expect(game.cardDeck).not.toContain(game.communityCards[0]);
    expect(game.cardDeck).not.toContain(game.communityCards[1]);
    expect(game.cardDeck).not.toContain(game.communityCards[2]);
    expect(game.cardDeck).not.toContain(game.communityCards[3]);
    expect(game.phase).toBe(GamePhase.FLOP);

    await dealNextCards(game, []);
    expect(game.communityCards.length).toBe(5);
    expect(game.cardDeck.length).toBe(47);
    expect(game.cardDeck).not.toContain(game.communityCards[0]);
    expect(game.cardDeck).not.toContain(game.communityCards[1]);
    expect(game.cardDeck).not.toContain(game.communityCards[2]);
    expect(game.cardDeck).not.toContain(game.communityCards[3]);
    expect(game.cardDeck).not.toContain(game.communityCards[4]);
    expect(game.phase).toBe(GamePhase.RIVER);
    expect(game.results).toBeFalsy;

    const players = [new Player("123", "ABC")];
    players[0].cards = [
      { value: 1, suit: "♥️" },
      { value: 2, suit: "♥️" },
    ];
    await dealNextCards(game, players);

    expect(game.phase).toBe(GamePhase.RESULTS);
    expect(game.results.length).not.toBe(0);

    expect(game.communityCards.length).toBe(5);
    expect(game.cardDeck.length).toBe(47);
  });
});

describe("finding winners", () => {
  test("find winner", async () => {
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
