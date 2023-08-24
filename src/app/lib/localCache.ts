"use client";

import { Player } from "./player";

export function savePlayer(gameId: string, player: Player): boolean {
  try {
    localStorage.setItem(gameId, JSON.stringify(player));
    return true;
  } catch {
    return false;
  }
}

export function loadPlayer(gameId: string): Player | null {
  try {
    const player = localStorage.getItem(gameId);
    if (!player) {
      return null;
    }
    return JSON.parse(player) as Player;
  } catch {
    return null;
  }
}
