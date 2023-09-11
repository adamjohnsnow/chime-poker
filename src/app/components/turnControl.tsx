/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { BettingStatus, Player, updatePlayer } from "../lib/player";
import { triggerNextBetting } from "../lib/turns";
import { GamePhase, GameState, getBets, nextPhase } from "../lib/game";

export function TurnControl({
  player,
  game,
}: {
  player: Player;
  game: GameState;
}) {
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
  function decreaseBet() {
    setBet(bet - minBet);
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

  async function nextAction() {
    if (!game) {
      return;
    }
    await nextPhase(game.id);
  }

  if (player.isDealer && game.phase === GamePhase.START) {
    return (
      <>
        <div>You are now the dealer</div>{" "}
        <form action={nextAction}>
          <button>Deal</button>
        </form>
      </>
    );
  }
  return (
    <>
      <div className="flex flex-row">
        {player.bettingStatus === BettingStatus.BETTING ? (
          <>
            <div>YOUR TURN</div>
            <form action={fold}>
              <button>FOLD</button>
            </form>
            <form action={betCall}>
              <button>{minBet === 0 ? "CHECK" : "CALL £" + minBet}</button>
            </form>
            <form action={decreaseBet}>
              <button>-£{minBet}</button>
            </form>

            <form action={increaseBet}>
              <button>+£{minBet}</button>
            </form>
            <div>This bet: £{bet}</div>
          </>
        ) : null}
      </div>
    </>
  );
}
