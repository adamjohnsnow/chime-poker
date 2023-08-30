"use client";

import { PlayerTile } from "../components/playerTile";
import { Card } from "../lib/cards";
import "../styles/table.css";

export default function Test() {
  const cards: Card[] = [
    { value: 1, suit: "♠️" },
    { value: 1, suit: "♦️" },
  ];
  return (
    <main className="flex min-h-screen items-center justify-between p-24 font-mono">
      <div className="players">
        <PlayerTile
          cards={cards}
          id={"abc"}
          name={"Player Name"}
          cash={1000}
          currentBet={null}
          folded={false}
          active={true}
        ></PlayerTile>
        <PlayerTile
          cards={cards}
          id={"abc"}
          name={"Player TWO"}
          cash={3418}
          currentBet={null}
          folded={false}
          active={true}
        ></PlayerTile>
      </div>
    </main>
  );
}
