import { ShedGame, ShedPlayer, canPlay } from "../src/lib/shed";
import { describe, expect, test } from "@jest/globals";

describe("New Shed game", () => {
  test("cards are dealt, 1 player", () => {
    const players = [new ShedPlayer()];
    const game = new ShedGame("123");
    game.deal(players);

    expect(game.drawPile.length).toEqual(42);
    expect(game.playedPile.length).toEqual(1);
    expect(players[0].downCards.length).toEqual(3);
    expect(players[0].handCards.length).toEqual(6);
  });

  test("cards are dealt, 2 player", () => {
    const players = [new ShedPlayer(), new ShedPlayer()];
    const game = new ShedGame("123");
    game.deal(players);
    expect(game.drawPile.length).toEqual(33);
    expect(game.playedPile.length).toEqual(1);
    expect(players[0].downCards.length).toEqual(3);
    expect(players[0].handCards.length).toEqual(6);
    expect(players[1].downCards.length).toEqual(3);
    expect(players[1].handCards.length).toEqual(6);
  });

  test("cards are dealt, no lost cards", () => {
    const players = [
      new ShedPlayer(),
      new ShedPlayer(),
      new ShedPlayer(),
      new ShedPlayer(),
    ];
    const game = new ShedGame("123");
    game.deal(players);

    let allCards = game.drawPile.length + game.playedPile.length;
    players.forEach((player) => {
      allCards = allCards + player.downCards.length + player.handCards.length;
    });

    expect(allCards).toEqual(52);
  });
});

describe("Can play", () => {
  test("basics", () => {
    expect(
      canPlay({ value: 3, suit: "club" }, { value: 3, suit: "club" })
    ).toBeTruthy();

    expect(
      canPlay({ value: 3, suit: "club" }, { value: 4, suit: "club" })
    ).toBeTruthy();

    expect(
      canPlay({ value: 4, suit: "club" }, { value: 3, suit: "club" })
    ).not.toBeTruthy();
  });

  test("special cards", () => {
    expect(
      canPlay({ value: 4, suit: "club" }, { value: 2, suit: "club" })
    ).toBeTruthy();

    expect(
      canPlay({ value: 14, suit: "club" }, { value: 10, suit: "club" })
    ).toBeTruthy();
  });
});
