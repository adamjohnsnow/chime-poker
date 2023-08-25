import { ChimeProvider } from "../lib/chimeUtils";
import { Player, updatePlayer } from "../lib/player";

export function TurnControl({
  gameId,
  player,
  chime,
}: {
  gameId: string;
  player: Player;
  chime: ChimeProvider;
}) {
  async function fold() {
    if (player) {
      player.folded = true;
      updatePlayer(gameId, player);
      chime?.sendMessage(
        JSON.stringify({ message: "playerFolded", player: player.id })
      );
    }
  }

  async function placeBet() {
    const input = document.getElementById("bet-amount") as HTMLInputElement;
    if (!input) {
      return;
    }
    chime.sendMessage(
      JSON.stringify({
        message: "betPlaced",
        playerId: player.id,
        amount: input.value,
      })
    );
  }

  return (
    <>
      <div>
        <div>YOUR TURN</div>
        <form action={fold}>
          <button>FOLD</button>
        </form>
        <form action={placeBet}>
          <input id="bet-amount" type="number"></input>
          <button>PLACE BET</button>
        </form>
      </div>
    </>
  );
}
