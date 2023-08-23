import { Player } from "../lib/player";

export function PlayerTile(player: Player){
  return (
    <>
      <video id={player.id}></video>
      <div>{player.name}</div>
    </>
  )
}