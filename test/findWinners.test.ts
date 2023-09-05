import { Rank } from "../src/app/lib/hands";
import { allotPrizes, findWinner, handResult } from "../src/app/lib/findWinner";
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
      currentMinimimBet: 0,
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

    expect(game.results[0].result.rank).toBe(Rank.Flush);
    expect(game.results[1].result.rank).toBe(Rank.OnePair);
    expect(game.results[0].result.cards.length).toBe(5);
    expect(game.results[1].result.cards.length).toBe(2);
  });

  test("find winner, 7 pair vs 4 pair", async () => {
    const game: gameState = {
      id: "123",
      chimeConfig: {},
      cardDeck: [],
      communityCards: [
        { value: 7, suit: "♣️" },
        { value: 10, suit: "♣️" },
        { value: 2, suit: "♣️" },
        { value: 5, suit: "♦️" },
        { value: 4, suit: "♥️" },
      ],
      results: [],
      prizePot: 1000,
      phase: GamePhase.START,
      blind: 0,
      currentMinimimBet: 0,
    };
    const players = [new Player("123", "A"), new Player("123", "B")];
    players[0].cards = [
      { value: 4, suit: "♣️" },
      { value: 3, suit: "♦️" },
    ];
    players[1].cards = [
      { value: 7, suit: "♥️" },
      { value: 6, suit: "♥️" },
    ];

    await findWinner(game, players);

    expect(game.results[0].result.rank).toBe(Rank.OnePair);
    expect(game.results[1].result.rank).toBe(Rank.OnePair);
    expect(game.results[0].result.cards[0].value).toBe(7);
    expect(game.results[1].result.cards[0].value).toBe(4);
  });

  test("find winner, two-pair", async () => {
    const game: gameState = {
      id: "123",
      chimeConfig: {},
      cardDeck: [],
      communityCards: [
        { value: 7, suit: "♣️" },
        { value: 2, suit: "♣️" },
        { value: 2, suit: "♣️" },
        { value: 5, suit: "♦️" },
        { value: 4, suit: "♥️" },
      ],
      results: [],
      prizePot: 1000,
      phase: GamePhase.START,
      blind: 0,
      currentMinimimBet: 0,
    };
    const players = [new Player("123", "A"), new Player("123", "B")];
    players[0].cards = [
      { value: 4, suit: "♣️" },
      { value: 3, suit: "♦️" },
    ];
    players[1].cards = [
      { value: 7, suit: "♥️" },
      { value: 6, suit: "♥️" },
    ];

    await findWinner(game, players);
    expect(game.results[0].result.rank).toBe(Rank.TwoPair);
    expect(game.results[1].result.rank).toBe(Rank.TwoPair);
    expect(game.results[0].playerId).toBe(players[1].id);
    expect(game.results[0].prize).toBe(1000);
    expect(game.results[1].prize).toBe(0);
    expect(game.results[0].result.cards[0].value).toBe(7);
    expect(game.results[1].result.cards[0].value).toBe(4);
  });

  test("find winner, two-pair tie-break", async () => {
    const game: gameState = {
      id: "123",
      chimeConfig: {},
      cardDeck: [],
      communityCards: [
        { value: 7, suit: "♣️" },
        { value: 2, suit: "♣️" },
        { value: 2, suit: "♣️" },
        { value: 5, suit: "♦️" },
        { value: 4, suit: "♥️" },
      ],
      results: [],
      prizePot: 1000,
      phase: GamePhase.START,
      blind: 0,
      currentMinimimBet: 0,
    };
    const players = [new Player("123", "A"), new Player("123", "B")];
    players[0].cards = [
      { value: 7, suit: "♣️" },
      { value: 3, suit: "♦️" },
    ];
    players[1].cards = [
      { value: 7, suit: "♥️" },
      { value: 6, suit: "♥️" },
    ];

    await findWinner(game, players);
    expect(game.results[0].playerId).toBe(players[1].id);
    expect(game.results[0].result.rank).toBe(Rank.TwoPair);
    expect(game.results[1].result.rank).toBe(Rank.TwoPair);
    expect(game.results[0].prize).toBe(1000);
    expect(game.results[1].prize).toBe(0);
    expect(game.results[0].result.cards[0].value).toBe(7);
    expect(game.results[0].result.cards[1].value).toBe(7);
    expect(game.results[1].result.cards[0].value).toBe(7);
    expect(game.results[1].result.cards[1].value).toBe(7);
    expect(game.results[0].result.cards[2].value).toBe(2);
    expect(game.results[0].result.cards[3].value).toBe(2);
    expect(game.results[1].result.cards[2].value).toBe(2);
    expect(game.results[1].result.cards[3].value).toBe(2);

    expect(game.results[0].result.kickers[0].value).toBe(6);
  });

  test("find winner, flush tie-break", async () => {
    const game: gameState = {
      id: "123",
      chimeConfig: {},
      cardDeck: [],
      communityCards: [
        { value: 7, suit: "♣️" },
        { value: 2, suit: "♣️" },
        { value: 9, suit: "♣️" },
        { value: 5, suit: "♦️" },
        { value: 4, suit: "♥️" },
      ],
      results: [],
      prizePot: 1000,
      phase: GamePhase.START,
      blind: 0,
      currentMinimimBet: 0,
    };
    const players = [new Player("123", "A"), new Player("123", "B")];
    players[0].cards = [
      { value: 4, suit: "♣️" },
      { value: 3, suit: "♣️" },
    ];
    players[1].cards = [
      { value: 1, suit: "♣️" },
      { value: 14, suit: "♣️" },
    ];

    await findWinner(game, players);

    expect(game.results[0].result.rank).toBe(Rank.Flush);
    expect(game.results[1].result.rank).toBe(Rank.Flush);
    expect(game.results[0].prize).toBe(1000);
    expect(game.results[1].prize).toBe(0);
    expect(game.results[0].result.cards[0].value).toBe(14);
    expect(game.results[1].result.cards[0].value).toBe(9);
  });
});

describe("tie breakers", () => {
  test("flush tie, higher card 1", () => {
    const hands: handResult[] = [
      {
        playerId: "ABC",
        result: {
          cards: [],
          kickers: [],
          rank: 5,
          cardsScore: 1310040201,
          kickersScore: 0,
        },
        prize: 0,
      },
      {
        playerId: "123",
        result: {
          cards: [],
          kickers: [],
          rank: 5,
          cardsScore: 1210040201,
          kickersScore: 0,
        },
        prize: 0,
      },
    ];

    allotPrizes(hands, 1000);

    expect(hands[0].prize).toBe(1000);
    expect(hands[1].prize).toBe(0);
  });

  test("flush tie, split pot", () => {
    const hands: handResult[] = [
      {
        playerId: "ABC",
        result: {
          cards: [],
          kickers: [],
          rank: 5,
          cardsScore: 1210050201,
          kickersScore: 0,
        },
        prize: 0,
      },
      {
        playerId: "123",
        result: {
          cards: [],
          kickers: [],
          rank: 5,
          cardsScore: 1210050201,
          kickersScore: 0,
        },
        prize: 0,
      },
    ];

    allotPrizes(hands, 1000);

    expect(hands[0].prize).toBe(500);
    expect(hands[1].prize).toBe(500);
  });

  test("two pair tie, kicker win", () => {
    const hands: handResult[] = [
      {
        playerId: "ABC",
        result: {
          cards: [],
          kickers: [],
          rank: 5,
          cardsScore: 12121010,
          kickersScore: 9,
        },
        prize: 0,
      },
      {
        playerId: "123",
        result: {
          cards: [],
          kickers: [],
          rank: 5,
          cardsScore: 12121010,
          kickersScore: 8,
        },
        prize: 0,
      },
    ];

    allotPrizes(hands, 1000);

    expect(hands[0].prize).toBe(1000);
    expect(hands[1].prize).toBe(0);
  });

  test("two pair tie, split pot", () => {
    const hands: handResult[] = [
      {
        playerId: "ABC",
        result: {
          cards: [],
          kickers: [],
          rank: 5,
          cardsScore: 12121010,
          kickersScore: 9,
        },
        prize: 0,
      },
      {
        playerId: "123",
        result: {
          cards: [],
          kickers: [],
          rank: 5,
          cardsScore: 12121010,
          kickersScore: 9,
        },
        prize: 0,
      },
    ];

    allotPrizes(hands, 1000);

    expect(hands[0].prize).toBe(500);
    expect(hands[1].prize).toBe(500);
  });

  test("high card tie, 4th string kicker win", () => {
    const hands: handResult[] = [
      {
        playerId: "ABC",
        result: {
          cards: [],
          kickers: [],
          rank: 5,
          cardsScore: 12,
          kickersScore: 10050302,
        },
        prize: 0,
      },
      {
        playerId: "123",
        result: {
          cards: [],
          kickers: [],
          rank: 5,
          cardsScore: 12,
          kickersScore: 10050301,
        },
        prize: 0,
      },
    ];

    allotPrizes(hands, 1000);

    expect(hands[0].prize).toBe(1000);
    expect(hands[1].prize).toBe(0);
  });
});
