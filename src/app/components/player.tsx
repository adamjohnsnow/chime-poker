/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { BettingStatus, Player, updatePlayer } from "../lib/player";
import { PlayingCard } from "./playingCard";
import { getGamePhaseStream, getPlayerStream } from "../lib/firebase";
import "../styles/player.css";
import { ButtonsWrapper } from "./buttons";
import {
  GamePhase,
  foldPlayer,
  getBets,
  newBet,
  nextPhase,
  resetCards,
  triggerNextBetting,
} from "../lib/game";

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

  async function betCall() {
    if (!player) {
      return;
    }
    player.cash -= bet - player.currentBet;
    player.currentBet = bet;
    await updatePlayer(player);
    if (bet > minBet) {
      await newBet(player.gameId, player.currentBet);
    }
    await triggerNextBetting(player.gameId);
  }

  async function fold() {
    if (player) {
      await foldPlayer(player);
    }
  }

  async function nextAction() {
    if (player?.gameId) {
      await nextPhase(player?.gameId);
    }
  }

  async function nextRound() {
    if (!gameId) {
      return;
    }
    await resetCards(gameId);
  }

  function showBetAction() {
    return player?.bettingStatus === BettingStatus.BETTING;
  }

  return player ? (
    <div className="flex flex-row w-full max-w-3xl m-5">
      <audio id="chime-audio" />
      <div className="w-full items-start text-sm flex ">
        <div
          className={
            player.bettingStatus === BettingStatus.BETTING
              ? "video-tile flex items-end highlighted"
              : "video-tile flex items-end"
          }
        >
          <video className="video absolute" id="local"></video>
          <ButtonsWrapper player={player} />
        </div>
        <div className="flex flex-col m-2">
          <div>
            <strong>{player.name}</strong>
          </div>
          <div>£{player.cash}</div>
          <div>Bet: £{player.currentBet}</div>
          <div className="flex m-1" id={"result-" + player.id}></div>
          <div className="flex m-1" id={"prize-" + player.id}></div>
        </div>
      </div>

      <div>
        {player?.isDealer && gamePhase === GamePhase.START ? (
          <>
            <div>You are now the dealer</div>{" "}
            <form action={nextAction}>
              <button>Deal</button>
            </form>
          </>
        ) : null}

        {player?.isDealer && gamePhase === GamePhase.RESULTS ? (
          <div className="flex flex-col">
            <div className="flex justify-center">The round is over</div>{" "}
            <form action={nextRound}>
              <button>Next round</button>
            </form>
          </div>
        ) : null}
        <div className="flex flex-col w-36 mx-2">
          {showBetAction() ? (
            <div>
              <form className="flex w-full text-red-700" action={fold}>
                <button className="w-full">Fold</button>
              </form>
              <form className="flex w-full" action={betCall}>
                {minBet - player.currentBet === 0 &&
                bet - player.currentBet === 0 ? (
                  <button className="w-full">Check</button>
                ) : (
                  <button className="w-full">
                    {bet > minBet ? "RAISE" : "CALL"} +£
                    {bet - player.currentBet}
                  </button>
                )}
              </form>
              <div className="text-xs flex w-full flex-row justify-between">
                <form action={decreaseBet}>
                  <button
                    className="w-14"
                    disabled={bet < betIncrement || bet <= minBet}
                  >
                    -£{betIncrement}
                  </button>
                </form>

                <form action={increaseBet}>
                  <button className="w-14">+£{betIncrement}</button>
                </form>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <div className="flex flex-row w-60">
        {player.cards && player.cards.length != 0 ? (
          <>
            <PlayingCard card={player.cards[0]}></PlayingCard>
            <PlayingCard card={player.cards[1]}></PlayingCard>
          </>
        ) : null}{" "}
      </div>
    </div>
  ) : null;
}
