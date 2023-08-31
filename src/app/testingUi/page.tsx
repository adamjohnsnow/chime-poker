"use client";

import { CommunityCards } from "../components/communityCards";
import { PlayerWrapper } from "../components/player";
import { Card } from "../lib/cards";
import { Player } from "../lib/player";
import "../styles/table.css";

export default function Test() {
  const player: Player = {
    cards: [
      { value: 1, suit: "♥️" },
      { value: 3, suit: "♥️" },
    ],
    id: "",
    name: "",
    cash: 0,
    currentBet: null,
    folded: false,
    active: false,
  };

  const commCards: Card[] = [
    { value: 1, suit: "♥️" },
    { value: 3, suit: "♥️" },
  ];

  return (
    <main className="flex flex-col min-h-screen items-center justify-between p-24 font-mono">
      <div>
        <PlayerWrapper player={player} playerCards={player.cards} />
      </div>
      <div>
        <CommunityCards cards={commCards} />
      </div>
    </main>
  );
}
