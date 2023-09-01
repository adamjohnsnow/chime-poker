/* eslint-disable react-hooks/exhaustive-deps */
"use client";
// packages
import { Key, useEffect, useState } from "react";

// lib
import { createAttendee } from "@/app/lib/chime";
import { ChimeProvider } from "@/app/lib/chimeUtils";
import { gameState, nextCommunityCards, resetCards } from "@/app/lib/game";
import { Player, addNewPlayer, loadPlayer } from "@/app/lib/player";
import { saveLocalPlayer, loadLocalPlayer } from "@/app/lib/localCache";

// components
import { PlayerTile } from "@/app/components/playerTile";

// styles
import "@/app/styles/table.css";
import "@/app/styles/playingCard.css";
import { TurnControl } from "@/app/components/turnControl";
import { ActivityMonitor } from "@/app/components/activityMonitor";
import { CommunityCards } from "@/app/components/communityCards";
import { PlayerWrapper } from "@/app/components/player";
import { getAllPlayersStream, getGameStream } from "@/app/lib/firebase";

export default function Game({ params }: { params: { id: string } }) {
  const [gameId, setGameId] = useState<string>(params.id);
  const [game, setGame] = useState<gameState>();
  const [chime, setChime] = useState<ChimeProvider>();
  const [player, setPlayer] = useState<Player>();
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerTurn, setPlayerTurn] = useState<string>();
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
    console.log("PLAYER UPDATED:", player);
    if (player) {
      saveLocalPlayer(gameId, player);
    }
    renderGame();
  }, [player]);

  function gameEventHandler(gameData: gameState): void {
    if (!gameData.communityCards) {
      gameData.communityCards = [];
    }
    console.log("GAMEDATA UPDATE:", gameData);

    setGame(gameData);
  }

  function playersEventHandler(playersData: Player[]) {
    console.log("PLAYERS UPDATE:", playersData);
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

  async function renderGame() {
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
    nextCommunityCards(gameId);
  }

  async function nextRound() {
    if (!gameId) {
      return;
    }
    resetTable();

    const newCards = await resetCards(gameId);
  }

  function resetTable() {
    updateActivePlayers();
    const highlightedCards = document.getElementsByClassName("highlighted");
    for (let i = 0; i < highlightedCards.length; i++) {
      highlightedCards[i].classList.remove("highlighted");
    }
  }

  async function updateActivePlayers() {}

  function highlightWinningCard() {
    // winningHand.forEach((card) => {
    //   const cardElement = document.getElementById(
    //     "card-" + card.value + "-" + card.suit
    //   );
    //   if (cardElement) {
    //     cardElement.classList.add("highlighted");
    //   }
    // });
  }

  return (
    <>
      {chime ? <ActivityMonitor chime={chime} /> : null}

      <main className="flex min-h-screen flex-col items-center justify-between p-10 font-mono">
        {player ? (
          <>
            <PlayerWrapper playerId={player.id} gameId={gameId} />
            <form action={nextAction}>
              <button>Next</button>
            </form>
            <form action={nextRound}>
              <button>Redeal</button>
            </form>
            <TurnControl
              player={player}
              gameId={gameId}
              chime={chime as ChimeProvider}
            ></TurnControl>
            <div className="players">
              {players ? (
                <>
                  {players.map(
                    (playerTile: Player, i: Key | null | undefined) =>
                      playerTile.active && playerTile.id != player?.id ? (
                        <PlayerTile key={i} player={playerTile}></PlayerTile>
                      ) : null
                  )}
                </>
              ) : null}
            </div>
            <CommunityCards
              chime={chime as ChimeProvider}
              cards={game ? game.communityCards : []}
            />
          </>
        ) : (
          <>
            {showNameInput ? (
              <>
                <div>New Player</div>
                <form action={playerJoin}>
                  <input
                    type="text"
                    id="new-player-name"
                    placeholder="Enter your name"
                  />
                  <button>Take a seat</button>
                </form>
              </>
            ) : (
              <div>LOADING</div>
            )}
          </>
        )}
        <p className="">You are in game: {gameId}</p>
      </main>
    </>
  );
}
