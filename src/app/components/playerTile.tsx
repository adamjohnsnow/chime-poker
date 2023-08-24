import { Player } from "../lib/player";

export function PlayerTile(player: Player) {
  return (
    <>
      <div>
        <video id={player.id}></video>
        <div>{player.name}</div>
      </div>
    </>
  );
}
