import { useEffect } from "react";
import { Card } from "../lib/cards";
import { Player } from "../lib/player";
import { PlayingCard } from "./playingCard";
import { TurnControl } from "./turnControl";
import { getPlayerStream } from "../lib/firebase";

export function PlayerWrapper({ player }: { player: Player }) {
  useEffect(() => {
    getPlayerStream(player.id, playerEventHandler);
  }, [player]);

  function playerEventHandler(data: any): void {
    console.log("PLAYER MESSAGE:", data);
  }

  return (
    <div>
      <audio id="chime-audio" />
      <div className="z-10 w-full items-start justify-between  text-sm flex">
        {player.name}: £{player.cash}
        <div className="flex">
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
  );
}
