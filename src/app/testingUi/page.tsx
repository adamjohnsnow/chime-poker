"use client";

import "../styles/table.css";

import { Menu } from "../components/menu";
import { PlayingCard } from "../components/playingCard";

export default function Test() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-10 font-mono">
      <Menu controls={undefined} />
      <PlayingCard
        card={{
          value: 1,
          suit: "♥️",
        }}
      />
      <PlayingCard
        card={{
          value: 13,
          suit: "♦️",
        }}
      />
      <PlayingCard
        card={{
          value: 13,
          suit: "♠️",
        }}
      />
      <PlayingCard
        card={{
          value: 10,
          suit: "♣️",
        }}
      />
    </main>
  );
}
