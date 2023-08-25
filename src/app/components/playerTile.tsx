import { Player } from "../lib/player";

export function PlayerTile(player: Player) {
  return (
    <>
      <div>
        <video
          className={player.folded ? "video-tile folded" : "video-tile"}
          id={player.id}
        ></video>
        <div>
          {player.name}: £{player.cash}
        </div>
        <div className="hand">
          {player.cards.map((card) => (
            <div key="">{card.suit}</div>
          ))}
        </div>
      </div>
    </>
  );
}
