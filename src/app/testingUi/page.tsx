"use client";

import { useState } from "react";
import { CommunityCards } from "../components/communityCards";
import { PlayerWrapper } from "../components/player";
import { Card } from "../lib/cards";
import { Player } from "../lib/player";
import "../styles/table.css";
import { getPlayerStream } from "../lib/firebase";

export default function Test() {
  return (
    <main className="flex flex-col min-h-screen items-center justify-between p-24 font-mono">
      <div></div>
    </main>
  );
}
