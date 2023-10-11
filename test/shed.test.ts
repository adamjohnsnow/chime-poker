import { ShedGame, ShedPlayer } from "../src/lib/shed";
import { describe, expect, test } from "@jest/globals";

describe("New Shed game", () => {
  test("cards are dealt, 1 player", () => {
    const players = [new ShedPlayer()];
    const game = new ShedGame(players);

    expect(game.drawPile.length).toEqual(42);
    expect(game.playedPile.length).toEqual(1);
    expect(players[0].downCards.length).toEqual(3);
    expect(players[0].handCards.length).toEqual(6);
  });

  test("cards are dealt, 2 player", () => {
    const players = [new ShedPlayer(), new ShedPlayer()];
    const game = new ShedGame(players);

    expect(game.drawPile.length).toEqual(33);
    expect(game.playedPile.length).toEqual(1);
    expect(players[0].downCards.length).toEqual(3);
    expect(players[0].handCards.length).toEqual(6);
    expect(players[1].downCards.length).toEqual(3);
    expect(players[1].handCards.length).toEqual(6);
  });
});
