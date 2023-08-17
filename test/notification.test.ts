import { createTopic, deleteTopic } from "../src/app/lib/notifications";
import { beforeEach, describe, expect, test } from "@jest/globals";
import { mockClient } from "aws-sdk-client-mock";
import { SNSClient, CreateTopicCommand } from "@aws-sdk/client-sns";

//@ts-ignore
const snsMock = mockClient(SNSClient);

beforeEach(() => {
  snsMock.reset();
});

describe("notification test", () => {
  test("creates a topic", async () => {
    //@ts-ignore
    snsMock.resolves({ TopicArn: "abc:arn" });
    const topic = await createTopic("abc");
    expect(topic).toBe("abc:arn");
  });

  test("deletes a topic", async () => {
    //@ts-ignore
    snsMock.resolves({ $metadata: { httpStatusCode: 200 } });
    const result = await deleteTopic("arn:aws:sns:eu-west-2:790625822239:abc");
    expect(result).toBe(200);
  });
});
