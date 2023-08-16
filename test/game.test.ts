import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import {
  ChimeSDKMeetings,
  CreateMeetingCommand,
} from "@aws-sdk/client-chime-sdk-meetings";

import { describe, expect, test, beforeEach } from "@jest/globals";
import { startGame } from "../src/app/lib/game";

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
    const gameResponse = await startGame();

    if (gameResponse) {
      const game = JSON.parse(gameResponse);
      expect(game.cardDeck.length).toBe(52);
      expect(game.chimeConfig.AudioFallbackUrl).toBe("test");
      expect(game.players).toBeFalsy;
    }
  });
});
