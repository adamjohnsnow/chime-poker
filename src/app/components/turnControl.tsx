import { Player, updatePlayer } from "../lib/player";
import { triggerNextBetting } from "../lib/turns";

export function TurnControl({ player }: { player: Player }) {
  async function fold() {
    if (player) {
      player.folded = true;
      updatePlayer(player);
      triggerNextBetting(player.gameId);
    }
  }

  async function placeBet() {
    const input = document.getElementById("bet-amount") as HTMLInputElement;
    let newBet = 0;
    if (input.value) {
      newBet = parseInt(input.value);
    }
    player.currentBet += newBet;
    input.value = "";
    updatePlayer(player);
    triggerNextBetting(player.gameId);
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
