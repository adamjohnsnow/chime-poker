// todo
import { Player } from "../src/app/lib/player";
import { describe, expect, test, beforeEach } from "@jest/globals";

describe("class functions", () => {
  test("isEligibleForBetting", () => {
    const player = new Player("123", "acb");
    expect(player.isEligibleForBetting()).toBe(false);

    player.bettingStatus = 1;
    expect(player.isEligibleForBetting()).toBe(true);

    player.bettingStatus = 2;
    expect(player.isEligibleForBetting()).toBe(false);

    player.cash = 0;
    player.bettingStatus = 1;
    expect(player.isEligibleForBetting()).toBe(false);

    player.cash = 10;
    player.active = false;
    expect(player.isEligibleForBetting()).toBe(false);

    player.active = true;
    player.folded = true;
    expect(player.isEligibleForBetting()).toBe(false);
  });
  test("canPlay", () => {
    const player = new Player("123", "acb");

    expect(player.canPlay()).toBe(true);

    player.cash = 0;
    expect(player.isEligibleForBetting()).toBe(false);

    player.cash = 10;
    player.active = false;
    expect(player.isEligibleForBetting()).toBe(false);
  });
});
