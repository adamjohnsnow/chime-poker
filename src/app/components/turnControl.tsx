import { ChimeProvider } from "../lib/chimeUtils";
import { Player, updatePlayer } from "../lib/player";

export function TurnControl({ player }: { player: Player }) {
  async function fold() {
    if (player) {
      player.folded = true;
      updatePlayer(player);
    }
  }

  async function placeBet() {
    const input = document.getElementById("bet-amount") as HTMLInputElement;
    if (!input) {
      return;
    }
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
