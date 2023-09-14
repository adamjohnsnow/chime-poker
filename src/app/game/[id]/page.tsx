/* eslint-disable react-hooks/exhaustive-deps */
"use client";
// packages
import { Key, useEffect, useState } from "react";

// lib
import { createAttendee } from "@/app/lib/chime";
import { ChimeProvider } from "@/app/lib/chimeUtils";
import { GamePhase, GameState, nextPhase, resetCards } from "@/app/lib/game";
import { Player, addNewPlayer, loadPlayer } from "@/app/lib/player";
import { saveLocalPlayer, loadLocalPlayer } from "@/app/lib/localCache";
import { getAllPlayersStream, getGameStream } from "@/app/lib/firebase";

// components
import { PlayerTile } from "@/app/components/playerTile";
import { LoadingSpinner } from "@/app/components/loadingSpinner";
import { SmallTitle } from "@/app/components/titleCards";
import { ActivityMonitor } from "@/app/components/activityMonitor";
import { CommunityCards } from "@/app/components/communityCards";
import { PlayerWrapper } from "@/app/components/player";

// styles
import "@/app/styles/table.css";
import "@/app/styles/playingCard.css";

import { Rank } from "@/app/lib/hands";
import { Menu } from "@/app/components/menu";

export default function Game({ params }: { params: { id: string } }) {
  const [gameId, setGameId] = useState<string>(params.id);
  const [game, setGame] = useState<GameState>();
  const [chime, setChime] = useState<ChimeProvider>();
  const [player, setPlayer] = useState<Player>();
  const [players, setPlayers] = useState<Player[]>([]);
  const [showNameInput, setShowNameInput] = useState<boolean>(false);

  useEffect(() => {
    setGameId(params.id);
    getGameStream(params.id, gameEventHandler);
    getAllPlayersStream(params.id, playersEventHandler);

    const savedPlayer = loadLocalPlayer(params.id);
    if (savedPlayer) {
      loadPlayer(params.id, savedPlayer.id).then((recalledPlayer) => {
        if (recalledPlayer) {
          setPlayer(recalledPlayer);
        }
      });
    } else {
      setShowNameInput(true);
    }
  }, [params.id]);

  useEffect(() => {
    if (player) {
      saveLocalPlayer(gameId, player);
    }
    if (!process.env.NEXT_PUBLIC_BLOCK_CHIME) {
      initialiseGame();
    }
  }, [player]);

  useEffect(() => {
    if (game && game.results) {
      highlightWinningCards();
    }
    if (!game?.results || game.results.length === 0) {
      resetHighlights();
    }
  }, [game]);

  useEffect(() => {}, [players]);

  function gameEventHandler(gameData: GameState): void {
    if (gameData && !gameData.communityCards) {
      gameData.communityCards = [];
    }

    setGame(gameData);
  }

  function playersEventHandler(playersData: Player[]) {
    setPlayers(playersData);
  }

  async function playerJoin() {
    const playerInput = document.getElementById(
      "new-player-name"
    ) as HTMLInputElement;
    if (!playerInput) {
      return;
    }

    const myPlayer = await addNewPlayer(gameId, playerInput.value);

    if (!myPlayer) {
      return;
    }
    saveLocalPlayer(params.id, myPlayer);
    setPlayer(myPlayer);
  }

  async function initialiseGame() {
    console.log("INIT GAME");
    if (!game || !player) {
      return;
    }
    const attendee = await createAttendee(
      game.chimeConfig,
      player?.id as string
    );

    if (!attendee) {
      alert("Unable to create attendee");
      return;
    }

    const meeting = new ChimeProvider(game.chimeConfig, attendee);

    if (meeting) {
      setChime(meeting);
      setGameId(game.id);
    } else {
      alert("Unable to create call session");
    }
  }

  async function nextAction() {
    if (!gameId) {
      return;
    }
    await nextPhase(gameId);
  }

  async function nextRound() {
    if (!gameId) {
      return;
    }
    await resetCards(gameId);
  }

  function highlightWinningCards() {
    game?.results.forEach((result) => {
      const resultElement = document.getElementById(
        "result-" + result.playerId
      );
      if (resultElement) {
        resultElement.innerHTML = Rank[result.result.rank];
      }
      if (result.prize > 0) {
        const prizeElement = document.getElementById(
          "prize-" + result.playerId
        );
        if (prizeElement) {
          prizeElement.innerHTML = "+£" + result.prize;
        }
      }
    });
    const winningHand = game?.results[0].result.cards;
    winningHand?.forEach((card) => {
      const cardElement = document.getElementById(
        "card-" + card.value + "-" + card.suit
      );
      if (cardElement) {
        cardElement.classList.add("highlighted");
      }
    });
    const kickers = game?.results[0].result.kickers;
    kickers?.forEach((card) => {
      const cardElement = document.getElementById(
        "card-" + card.value + "-" + card.suit
      );
      if (cardElement) {
        cardElement.classList.add("lowlighted");
      }
    });
  }

  function resetHighlights() {
    const highlightedCards = document.getElementsByClassName("highlighted");
    for (let i = 0; i < highlightedCards.length; i++) {
      highlightedCards[i].classList.remove("highlighted");
    }
    const results = document.querySelectorAll('div[id^="result-"]');
    results.forEach((element) => {
      element.innerHTML = "";
    });
    const prizes = document.querySelectorAll('div[id^="prize-"]');
    prizes.forEach((element) => {
      element.innerHTML = "";
    });
  }

  function countActivePlayers(): number {
    const activePlayers = players.filter((player) => player.active);
    return activePlayers.length;
  }

  return (
    <>
      {chime ? <ActivityMonitor chime={chime} /> : null}

      <main className="flex min-h-screen flex-col items-center justify-start p-10 font-mono">
        {player ? (
          <>
            <PlayerWrapper playerId={player.id} gameId={gameId} />
            <div className="prize-pot">POT: £{game?.prizePot}</div>

            <div className="players">
              {players.map((playerTile: Player, i: Key | null | undefined) =>
                playerTile.id != player?.id ? (
                  <PlayerTile key={i} player={playerTile}></PlayerTile>
                ) : null
              )}
            </div>

            {game && game.phase === GamePhase.NOTSTARTED ? (
              <div className="p-8">
                {countActivePlayers() < 2 ? (
                  <div>Waiting for another player...</div>
                ) : (
                  <form action={nextRound}>
                    <button>
                      Start the game with {countActivePlayers()} players
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <>
                <CommunityCards
                  chime={chime as ChimeProvider}
                  cards={game ? game.communityCards : []}
                />
                <form action={nextAction}>
                  <button>next</button>
                </form>
                <form action={nextRound}>
                  <button>reset</button>
                </form>
              </>
            )}
            <Menu controls={chime} />
          </>
        ) : (
          <>
            {showNameInput && game?.phase === GamePhase.NOTSTARTED ? (
              <div className="flex flex-col items-center">
                <SmallTitle />
                <div className="flex flex-col items-center">
                  <div>New Player</div>

                  <form
                    className="flex flex-col items-center"
                    action={playerJoin}
                  >
                    <input
                      type="text"
                      id="new-player-name"
                      placeholder="Enter your name"
                    />
                    <button>Take a seat</button>
                  </form>
                </div>
              </div>
            ) : (
              <div>
                <div>LOADING</div>
                <LoadingSpinner show={true} />
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
