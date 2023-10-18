import { describe, expect, test } from "@jest/globals";
import {
  getNewGame,
  GameState,
  GamePhase,
  dealNextCards,
  processResetCards,
  dealDeck,
  countActivePlayers,
  processNewBet,
} from "../src/lib/game";
import { BettingStatus, Player } from "../src/lib/player";
import { Deck } from "../src/lib/cards";
import { getPlayers } from "./helpers";

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
    const game: GameState = {
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
      currentMinimumBet: 0,
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

describe("new bet raised", () => {
  test("new bet resets must bets", async () => {
    const game = await getNewGame("abc", {});
    const players = getPlayers();
    players[0].bettingStatus = 3;
    players[2].bettingStatus = 3;
    players[2].folded = true;
    await processNewBet(game, players, 20);

    expect(game.currentMinimumBet).toBe(20);
    expect(players[0].bettingStatus).toBe(BettingStatus.MUSTBET);
    expect(players[2].bettingStatus).not.toBe(BettingStatus.MUSTBET);
  });
});

describe("first deal", () => {
  test("deal deck", async () => {
    const game: GameState = {
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
      currentMinimumBet: 0,
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
    const game: GameState = {
      id: "123",
      chimeConfig: {},
      cardDeck: new Deck().cards,
      communityCards: [],
      results: [],
      phase: GamePhase.DEAL,
      prizePot: 0,
      blind: 0,
      currentMinimumBet: 0,
    };
    const players = [new Player("123", "ABC"), new Player("123", "XYZ")];
    players[0].cards = [
      { value: 1, suit: "♥️" },
      { value: 2, suit: "♥️" },
    ];
    players[1].cards = [
      { value: 3, suit: "♥️" },
      { value: 4, suit: "♥️" },
    ];
    await dealNextCards(game, players);
    expect(game.communityCards.length).toBe(3);
    expect(game.cardDeck.length).toBe(49);
    expect(game.cardDeck).not.toContain(game.communityCards[0]);
    expect(game.cardDeck).not.toContain(game.communityCards[1]);
    expect(game.cardDeck).not.toContain(game.communityCards[2]);
    expect(game.phase).toBe(GamePhase.TURN);
    expect(game.results.length).toBe(0);

    await dealNextCards(game, players);
    expect(game.communityCards.length).toBe(4);
    expect(game.cardDeck.length).toBe(48);
    expect(game.cardDeck).not.toContain(game.communityCards[0]);
    expect(game.cardDeck).not.toContain(game.communityCards[1]);
    expect(game.cardDeck).not.toContain(game.communityCards[2]);
    expect(game.cardDeck).not.toContain(game.communityCards[3]);
    expect(game.phase).toBe(GamePhase.FLOP);

    await dealNextCards(game, players);
    expect(game.communityCards.length).toBe(5);
    expect(game.cardDeck.length).toBe(47);
    expect(game.cardDeck).not.toContain(game.communityCards[0]);
    expect(game.cardDeck).not.toContain(game.communityCards[1]);
    expect(game.cardDeck).not.toContain(game.communityCards[2]);
    expect(game.cardDeck).not.toContain(game.communityCards[3]);
    expect(game.cardDeck).not.toContain(game.communityCards[4]);
    expect(game.phase).toBe(GamePhase.RIVER);
    expect(game.results).toBeFalsy;

    await dealNextCards(game, players);

    expect(game.phase).toBe(GamePhase.RESULTS);
    expect(game.results.length).not.toBe(0);

    expect(game.communityCards.length).toBe(5);
    expect(game.cardDeck.length).toBe(47);
  });

  test("odd result", async () => {
    const p1 = new Player("123", "P1");
    const p2 = new Player("123", "P2");
    p2.cards = [
      { value: 2, suit: "♥️" },
      { value: 7, suit: "♠️" },
    ];
    p1.cards = [
      { value: 4, suit: "♦️" },
      { value: 8, suit: "♦️" },
    ];

    const game: GameState = {
      id: "123",
      chimeConfig: {},
      cardDeck: new Deck().cards,
      communityCards: [
        { value: 4, suit: "♠️" },
        { value: 6, suit: "♠️" },
        { value: 6, suit: "♥️" },
        { value: 10, suit: "♦️" },
        { value: 13, suit: "♠️" },
      ],
      results: [],
      phase: GamePhase.RIVER,
      prizePot: 1000,
      blind: 0,
      currentMinimumBet: 0,
    };

    await dealNextCards(game, [p1, p2]);
  });
});
