import { useEffect, useState } from "react";
import { BlindButtons, Player } from "../lib/player";
import { PlayingCard } from "./playingCard";
import { getPlayerStream } from "../lib/firebase";

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
    <div>
      <audio id="chime-audio" />
      <div className="z-10 w-full items-start justify-between  text-sm flex">
        {player.name}: £{player.cash}
        <div className="flex">
          {" "}
          {player.isDealer ? <div>D</div> : null}
          {player.blindButton === BlindButtons["Big Blind"] ? (
            <div>BIG</div>
          ) : null}
          {player.blindButton === BlindButtons["Little Blind"] ? (
            <div>LITTLE</div>
          ) : null}
          <video className="video-tile m-1" id="local"></video>
          {player.cards && player.cards.length != 0 ? (
            <>
              <PlayingCard card={player.cards[0]}></PlayingCard>
              <PlayingCard card={player.cards[1]}></PlayingCard>
            </>
          ) : null}
        </div>
      </div>
    </div>
  ) : null;
}
