import { Card } from "../lib/cards";
import { ChimeProvider } from "../lib/chimeUtils";
import { Player } from "../lib/player";
import { PlayingCard } from "./playingCard";
import { TurnControl } from "./turnControl";

export function PlayerWrapper({
  player,
  playerCards,
}: {
  player: Player;
  playerCards: Card[];
}) {
  return (
    <div>
      <audio id="chime-audio" />
      <div className="z-10 w-full items-start justify-between  text-sm flex">
        {player.name}: £{player.cash}
        <div className="flex">
          <video className="video-tile m-1" id="local"></video>
          {playerCards.length != 0 ? (
            <>
              <PlayingCard card={playerCards[0]}></PlayingCard>
              <PlayingCard card={playerCards[1]}></PlayingCard>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
