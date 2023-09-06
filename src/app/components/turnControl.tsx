/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Player, updatePlayer } from "../lib/player";
import { triggerNextBetting } from "../lib/turns";
import { getBets } from "../lib/game";

export function TurnControl({ player }: { player: Player }) {
  const [minBet, setMinBet] = useState<number>(0);
  const [bet, setBet] = useState<number>(0);
  const [blind, setBlind] = useState<number>(0);

  useEffect(() => {
    getBets(player.gameId).then((result: { bet: number; blind: number }) => {
      setMinBet(result.bet === 0 ? result.blind : result.bet);
      setBlind(result.blind);
    });
  }, []);

  function increaseBet() {
    setBet(bet + minBet);
  }

  function betCall() {
    setBet(minBet);
    placeBet();
  }

  async function fold() {
    if (player) {
      player.folded = true;
      updatePlayer(player);
      triggerNextBetting(player.gameId);
    }
  }

  async function placeBet() {
    player.currentBet += bet;
    player.cash -= bet;
    updatePlayer(player);
    triggerNextBetting(player.gameId);
  }

  return (
    <>
      <div className="flex flex-row">
        <div>YOUR TURN</div>
        <form action={fold}>
          <button>FOLD</button>
        </form>
        <form action={betCall}>
          <button>{minBet === 0 ? "CHECK" : "CALL"}</button>
        </form>
        <form action={increaseBet}>
          <button>RAISE {minBet}</button>
        </form>
        <form action={placeBet}>
          <button>Place</button>
        </form>
        <div>{bet}</div>
      </div>
    </>
  );
}
