"use client";

import { useState } from "react";
import { CommunityCards } from "../components/communityCards";
import { PlayerWrapper } from "../components/player";
import { Card } from "../lib/cards";
import { Player } from "../lib/player";
import "../styles/table.css";
import { getPlayerStream } from "../lib/firebase";

export default function Test() {
  const [player, setPlayer] = useState<Player>({
    cards: [
      { value: 1, suit: "♥️" },
      { value: 3, suit: "♥️" },
    ],
    id: "",
    name: "",
    cash: 0,
    cardsShown: false,
    currentBet: 0,
    folded: false,
    active: false,
    gameId: "123",
    sortIndex: 0,
    blindButton: null,
    isBettingTurn: false,
  });

  getPlayerStream("123", "123", (data: any) => console.log(data));
  const commCards: Card[] = [
    { value: 1, suit: "♥️" },
    { value: 3, suit: "♥️" },
  ];

  return (
    <main className="flex flex-col min-h-screen items-center justify-between p-24 font-mono">
      <div>
        <PlayerWrapper playerId={player.id} gameId={player.gameId} />
      </div>
      <div>
        <CommunityCards cards={commCards} />
      </div>
    </main>
  );
}
