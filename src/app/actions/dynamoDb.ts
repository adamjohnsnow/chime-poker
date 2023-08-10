"use server";
import * as uuid from "uuid";
import {
  AttributeValue,
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});

export async function createRecord(sk: string, content: string) {
  const id = uuid.v4();
  const Item = {
    id: { S: id },
    sk: { S: `${id}:${sk}` },
    content: { S: content },
  };
  await client.send(
    new PutItemCommand({
      TableName: process.env.TABLE_NAME,
      Item,
    })
  );

  return id;
}

export async function getGame(gameId: string) {
  const item = await client.send(
    new GetItemCommand({
      TableName: process.env.TABLE_NAME,
      Key: {
        id: { S: gameId },
        sk: { S: gameId + ":game" },
      },
    })
  );

  return item;
}
