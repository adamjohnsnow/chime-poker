/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { BettingStatus, Player, updatePlayer } from "../lib/player";
import { PlayingCard } from "./playingCard";
import { getGamePhaseStream, getPlayerStream } from "../lib/firebase";
import "../styles/player.css";
import { ButtonsWrapper } from "./buttons";
import { GamePhase, getBets, nextPhase, triggerNextBetting } from "../lib/game";

export function PlayerWrapper({
  gameId,
  playerId,
}: {
  gameId: string;
  playerId: string;
}) {
  const [player, setPlayer] = useState<Player>();
  const [minBet, setMinBet] = useState<number>(0);
  const [betIncrement, setBetIncrement] = useState<number>(0);
  const [gamePhase, setGamePhase] = useState<GamePhase>(0);
  const [bet, setBet] = useState<number>(0);

  useEffect(() => {
    getPlayerStream(gameId, playerId, playerEventHandler);
    getGamePhaseStream(gameId, gamePhaseEventHandler);
  }, [gameId, playerId]);

  function playerEventHandler(data: any): void {
    if (!data) {
      return;
    }
    getBets(gameId).then((result: { bet: number; blind: number }) => {
      setMinBet(result.bet);
      setBet(result.bet);
      setBetIncrement(result.blind);
    });

    setPlayer(data);
  }

  function gamePhaseEventHandler(phase: GamePhase) {
    setGamePhase(phase);
  }

  function increaseBet() {
    setBet(bet + betIncrement);
  }
  function decreaseBet() {
    setBet(bet - betIncrement);
  }
  function betCall() {
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
    if (!player) {
      return;
    }
    player.currentBet += bet;
    player.cash -= bet;
    await updatePlayer(player);
    await triggerNextBetting(player.gameId);
  }

  async function nextAction() {
    if (player?.gameId) {
      await nextPhase(player?.gameId);
    }
  }

  function showBetAction() {
    return player?.bettingStatus === BettingStatus.BETTING;
  }
  return player ? (
    <div className="flex flex-row w-full m-5">
      <audio id="chime-audio" />
      <div className="z-10 w-full items-start text-sm flex ">
        {player.name}: £{player.cash}
        <div
          className={
            player.bettingStatus === BettingStatus.BETTING
              ? "flex items-end highlighted"
              : "flex items-end"
          }
        >
          <video className="video-tile m-1 " id="local"></video>
          <ButtonsWrapper player={player} />
        </div>
        <div className="flex flex-row w-60">
          {player.cards && player.cards.length != 0 ? (
            <>
              <PlayingCard card={player.cards[0]}></PlayingCard>
              <PlayingCard card={player.cards[1]}></PlayingCard>
            </>
          ) : null}
        </div>
        <div>Bet: £{player.currentBet}</div>
      </div>
      {player?.isDealer && gamePhase === GamePhase.START ? (
        <>
          <div>You are now the dealer</div>{" "}
          <form action={nextAction}>
            <button>Deal</button>
          </form>
        </>
      ) : null}
      {showBetAction() ? (
        <div className="flex flex-col w-48">
          <div>YOUR TURN</div>
          <form className="flex w-full text-red-700" action={fold}>
            <button className="w-full">FOLD</button>
          </form>
          <form className="flex w-full" action={betCall}>
            {minBet - player.currentBet === 0 && bet === 0 ? (
              <button className="w-full">Check</button>
            ) : (
              <button className="w-full">
                {bet > minBet ? "RAISE" : "CALL"} +£{bet}
              </button>
            )}
          </form>
          <div className="text-xs flex flex-row">
            <form action={decreaseBet}>
              <button disabled={bet < betIncrement || bet <= minBet}>
                -£{betIncrement}
              </button>
            </form>

            <form action={increaseBet}>
              <button>+£{betIncrement}</button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  ) : null;
}
