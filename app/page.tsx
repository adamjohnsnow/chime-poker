/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useRouter } from "next/navigation";
import { startGame } from "./lib/game";
import "./styles/table.css";
import { TitleCard } from "./components/titleCards";
import { LoadingSpinner } from "./components/loadingSpinner";
import { useEffect, useState } from "react";

export default function Home() {
  const [showSpinner, setShowSpinner] = useState<Boolean>(false);
  const router = useRouter();

  useEffect(() => {
    if (showSpinner) {
      startNewGame();
    }
  }, [showSpinner]);

  function triggerNewGame() {
    setShowSpinner(true);
  }

  async function startNewGame() {
    const game = await startGame();
    if (!game) {
      return;
    }
    router.push("/game/" + game.id);
  }

  function joinGame() {
    const input = document.getElementById("game-id-input") as HTMLInputElement;
    if (!input) {
      return;
    }
    router.push("/game/" + input.value);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-32">
      <div>
        <div className="community-cards">
          <TitleCard suit="♥️" letter="P" red={true}></TitleCard>
          <TitleCard suit="♠️" letter="O" red={false}></TitleCard>
          <TitleCard suit="♦️" letter="K" red={true}></TitleCard>
          <TitleCard suit="♣️" letter="E" red={false}></TitleCard>
          <TitleCard suit="♥️" letter="R" red={true}></TitleCard>
        </div>
        <div className="community-cards">
          <TitleCard suit="♥️" letter="F" red={true}></TitleCard>
          <TitleCard suit="♠️" letter="A" red={false}></TitleCard>
          <TitleCard suit="♦️" letter="C" red={true}></TitleCard>
          <TitleCard suit="♣️" letter="E" red={false}></TitleCard>
          <div className="start-card">
            {showSpinner ? (
              <LoadingSpinner show={true} />
            ) : (
              <form action={triggerNewGame}>
                <button className="start-button">START NEW GAME</button>{" "}
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:text-left font-mono justify-center">
        A multi-player, single-page poker game with video chat.
        <br />
        Next,js, React, AWS Chime, Firebase Realtime Database
      </div>
    </main>
  );
}
