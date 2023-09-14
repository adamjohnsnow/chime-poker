"use client";

import "../styles/table.css";

import { PlayingCard } from "../components/playingCard";

export default function Test() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-10 font-mono">
      <PlayingCard
        card={{
          value: 1,
          suit: "♦️",
        }}
      />
    </main>
  );
}
