import { Player } from "../lib/player";
import { PlayingCard } from "./playingCard";
import "../styles/player.css";

export function PlayerTile(player: Player) {
  return (
    <>
      <div className="flex flex-col items-center align-middle w-48 h-60">
        <div>
          <strong>{player.name}</strong>
        </div>
        <div>£{player.cash}</div>
        <div className="video-tile">
          <video
            className={player.folded ? "video-tile folded" : "video-tile"}
            id={player.id}
          ></video>
        </div>
        <div>
          {player.cards.length === 2 ? (
            <div className="opponent-cards">
              <PlayingCard card={player.cards[0]}></PlayingCard>
              <PlayingCard card={player.cards[1]}></PlayingCard>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
