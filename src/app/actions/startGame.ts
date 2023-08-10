"use server";
import { createRecord, getGame } from "./dynamoDb";

export async function StartGame() {
  const gameId = await createRecord("game", "");
  console.log(gameId);
}

export async function GetGame() {
  const gameId = "32e34c4e-264b-40f9-916b-c3fccefacac8";
  getGame(gameId);
}
