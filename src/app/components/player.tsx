/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { BettingStatus, Player, updatePlayer } from "../lib/player";
import { PlayingCard } from "./playingCard";
import { getGamePhaseStream, getPlayerStream } from "../lib/firebase";
import "../styles/player.css";
import { ButtonsWrapper } from "./buttons";
import { GamePhase, getBets, nextPhase } from "../lib/game";
import { triggerNextBetting } from "../lib/turns";

export function PlayerWrapper({
  gameId,
  playerId,
}: {
  gameId: string;
  playerId: string;
}) {
  const [player, setPlayer] = useState<Player>();
  const [minBet, setMinBet] = useState<number>(0);
  const [gamePhase, setGamePhase] = useState<GamePhase>(0);
  const [bet, setBet] = useState<number>(0);

  useEffect(() => {
    getBets(gameId).then((result: { bet: number; blind: number }) => {
      setMinBet(result.bet === 0 ? result.blind : result.bet);
    });
  }, []);

  useEffect(() => {
    getPlayerStream(gameId, playerId, playerEventHandler);
    getGamePhaseStream(gameId, gamePhaseEventHandler);
  }, [gameId, playerId]);

  function playerEventHandler(data: any): void {
    console.log("THIS PLAYER MESSAGE:", data);
    if (!data) {
      return;
    }
    setPlayer(data);
  }

  function gamePhaseEventHandler(phase: GamePhase) {
    setGamePhase(phase);
  }

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
    if (!player) {
      return;
    }
    player.currentBet += bet;
    player.cash -= bet;
    updatePlayer(player);
    triggerNextBetting(player.gameId);
  }

  async function nextAction() {
    if (player?.gameId) {
      await nextPhase(player?.gameId);
    }
  }

  function showDealAction() {
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
      {showDealAction() ? (
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
  ) : null;
}
