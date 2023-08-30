import {
  DynamoDBClient,
  GetItemCommand,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { describe, expect, test, beforeEach } from "@jest/globals";
import { player, query } from "./fixtures/playerQuery";
import { loadAllPlayers, loadPlayer } from "../src/app/lib/player";

const ddbMock = mockClient(DynamoDBClient);

describe("new game", () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  test("loads a player from db", async () => {
    ddbMock.on(GetItemCommand).resolves({ Item: player });

    const loadedPlayer = await loadPlayer("x", "y", true);

    expect(loadedPlayer?.name).toBe("Player 1");
    expect(loadedPlayer?.cards[0].value).toBe(7);
  });

  test("loads all players without cards", async () => {
    ddbMock.on(QueryCommand).resolves(query);

    const players = await loadAllPlayers("x", false);

    expect(players?.length).toBe(2);
    expect(players[0].name).toBe("Player 1");
    expect(players[0].cards.length).toBe(0);
  });
});
