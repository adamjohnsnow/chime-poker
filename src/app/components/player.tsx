import { useEffect, useState } from "react";
import { BettingStatus, Player } from "../lib/player";
import { PlayingCard } from "./playingCard";
import { getPlayerStream } from "../lib/firebase";
import "../styles/player.css";
import { ButtonsWrapper } from "./buttons";

export function PlayerWrapper({
  gameId,
  playerId,
}: {
  gameId: string;
  playerId: string;
}) {
  const [player, setPlayer] = useState<Player>();
  useEffect(() => {
    getPlayerStream(gameId, playerId, playerEventHandler);
  }, [gameId, playerId]);

  function playerEventHandler(data: any): void {
    console.log("THIS PLAYER MESSAGE:", data);
    if (!data) {
      return;
    }
    setPlayer(data);
  }

  return player ? (
    <div className="flex flex-row w-full m-5">
      <audio id="chime-audio" />
      <div className="z-10 w-full items-start text-sm flex ">
        {player.name}: £{player.cash}
        <div
          className={
            player.bettingStatus === BettingStatus.BETTING
              ? "flex items-end highlighted"
              : "flex items-end"
          }
        >
          <video className="video-tile m-1 " id="local"></video>
          <ButtonsWrapper player={player} />
        </div>
        <div className="flex flex-row w-60">
          {player.cards && player.cards.length != 0 ? (
            <>
              <PlayingCard card={player.cards[0]}></PlayingCard>
              <PlayingCard card={player.cards[1]}></PlayingCard>
            </>
          ) : null}
        </div>
        <div>{player.currentBet}</div>
      </div>
    </div>
  ) : null;
}
