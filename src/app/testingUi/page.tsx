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
    currentBet: null,
    folded: false,
    active: false,
  });

  getPlayerStream("123", (data: any) => console.log(data));
  const commCards: Card[] = [
    { value: 1, suit: "♥️" },
    { value: 3, suit: "♥️" },
  ];

  return (
    <main className="flex flex-col min-h-screen items-center justify-between p-24 font-mono">
      <div>
        <PlayerWrapper player={player} />
      </div>
      <div>
        <CommunityCards cards={commCards} />
      </div>
    </main>
  );
}
