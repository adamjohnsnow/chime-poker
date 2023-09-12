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

// components
import { PlayerTile } from "@/app/components/playerTile";

// styles
import "@/app/styles/table.css";
import "@/app/styles/playingCard.css";
import { ActivityMonitor } from "@/app/components/activityMonitor";
import { CommunityCards } from "@/app/components/communityCards";
import { PlayerWrapper } from "@/app/components/player";
import { getAllPlayersStream, getGameStream } from "@/app/lib/firebase";
import { LoadingSpinner } from "@/app/components/loadingSpinner";
import { TitleCard } from "@/app/components/titleCard";

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
  }

  return (
    <>
      {chime ? <ActivityMonitor chime={chime} /> : null}

      <main className="flex min-h-screen flex-col items-center justify-start p-10 font-mono">
        {player ? (
          <>
            <PlayerWrapper playerId={player.id} gameId={gameId} />
            <div className="players">
              {players.map((playerTile: Player, i: Key | null | undefined) =>
                playerTile.active && playerTile.id != player?.id ? (
                  <PlayerTile key={i} player={playerTile}></PlayerTile>
                ) : null
              )}
            </div>

            {game && game.phase === GamePhase.NOTSTARTED ? (
              <div className="p-8">
                {players.length < 2 ? (
                  <div>Waiting for another player...</div>
                ) : (
                  <form action={nextRound}>
                    <button>
                      Start the game with {players.length} players
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <>
                <div>{game?.prizePot}</div>
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
          </>
        ) : (
          <>
            {showNameInput && game?.phase === GamePhase.NOTSTARTED ? (
              <div className="flex flex-col items-center">
                <div
                  style={{ width: 400, margin: 40 }}
                  className="opponent-cards"
                >
                  <TitleCard suit={"P"} letter={"P"} red={false} />
                  <TitleCard suit={"O"} letter={"O"} red={true} />
                  <TitleCard suit={"K"} letter={"O"} red={false} />
                  <TitleCard suit={"E"} letter={"O"} red={true} />
                  <TitleCard suit={"R"} letter={"O"} red={false} />
                </div>

                <div style={{ width: 400 }} className="opponent-cards">
                  <TitleCard suit={"F"} letter={"P"} red={false} />
                  <TitleCard suit={"A"} letter={"O"} red={true} />
                  <TitleCard suit={"C"} letter={"O"} red={false} />
                  <TitleCard suit={"E"} letter={"O"} red={true} />
                </div>
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
