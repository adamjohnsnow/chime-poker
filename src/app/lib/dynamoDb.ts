"use server";
import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});

export async function saveToDb(id: string, sk: string, state: string) {
  const Item = {
    id: { S: id },
    sk: { S: `${id}:${sk}` },
    content: { S: state },
  };
  client.send(
    new PutItemCommand({
      TableName: process.env.TABLE_NAME,
      Item,
    })
  );
}

export async function loadFromDb(gameId: string, sk: string) {
  const item = await client.send(
    new GetItemCommand({
      TableName: process.env.TABLE_NAME,
      Key: {
        id: { S: gameId },
        sk: { S: gameId + sk },
      },
    })
  );
  return item.Item?.content;
}
