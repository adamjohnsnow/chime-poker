"use server";
import { createRecord, getGame } from "./dynamoDb";
import { newChime } from "./initiateChime";
import * as uuid from "uuid";

export async function StartGame() {
  const id = uuid.v4();

  const call = await newChime(id);
  createRecord(id, "game", JSON.stringify(call));
}

export async function GetGame() {
  const gameId = "652c2625-1aa2-4a4a-a272-d08c1620f473";
  console.log(await getGame(gameId));
}
