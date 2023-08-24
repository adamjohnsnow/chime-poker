/* eslint-disable react-hooks/exhaustive-deps */
"use client";
// packages
import { useEffect, useState } from "react";

// lib
import { Card } from "../../lib/cards";
import { createAttendee } from "../../lib/chime";
import { ChimeProvider } from "../../lib/chimeUtils";
import { getGame, gameState, nextCards, resetCards } from "../../lib/game";
import { Player, addNewPlayer, loadPlayer } from "../../lib/player";
import { saveLocalPlayer, loadLocalPlayer } from "../../lib/localCache";

// components
import { PlayerTile } from "../../components/playerTile";
import { PlayingCard } from "../../components/playingCard";

// styles
import "../../styles/table.css";
import "../../styles/playingCard.css";

export default function Game({ params }: { params: { id: string } }) {
  const [loadingPlayer, setLoadingPlayer] = useState<boolean>(true);
  const [gameId, setGameId] = useState<string>(params.id);
  const [communityCards, setCommunityCards] = useState<Card[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [chime, setChime] = useState<ChimeProvider>();
  const [player, setPlayer] = useState<Player>();
  const [newPlayerId, setNewPlayerId] = useState<string | null>();

  useEffect(() => {
    const savedPlayer = loadLocalPlayer(params.id);
    if (savedPlayer) {
      setPlayer(savedPlayer);
    }
    setLoadingPlayer(false);
  }, [params.id]);

  useEffect(() => {
    if (
      newPlayerId &&
      newPlayerId != player?.id &&
      !players.some((player) => player.id === newPlayerId)
    ) {
      loadPlayer(gameId, newPlayerId).then((newPlayer) => {
        console.log("NP", newPlayer, players);
        if (newPlayer) {
          setPlayers([...players, newPlayer]);
        }
        setNewPlayerId(null);
      });
    }
  }, [newPlayerId]);

  useEffect(() => {
    getGame(params.id).then((game) => {
      if (!game || !player) {
        return;
      }
      renderGame(game);
    });

    chime?.sendMessage(
      JSON.stringify({ message: "playerUpdate", player: player })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player]);

  async function playerJoin() {
    const playerInput = document.getElementById(
      "new-player-name"
    ) as HTMLInputElement;
    if (!playerInput) {
      return;
    }
    const playerId = await addNewPlayer(gameId, playerInput.value);
    const myPlayer = new Player(
      [],
      playerId as string,
      playerInput.value,
      10000
    );
    saveLocalPlayer(params.id, myPlayer);
    setPlayer(myPlayer);
  }

  async function renderGame(game: gameState) {
    const attendee = await createAttendee(
      game.chimeConfig,
      player?.id as string
    );

    if (!attendee) {
      alert("Unable to create attendee");
      return;
    }

    const meeting = new ChimeProvider(game.chimeConfig, attendee, eventHandler);

    if (meeting) {
      setChime(meeting);
      setGameId(game.id);
      setCommunityCards(game.communityCards);
    } else {
      alert("Unable to create call session");
    }
  }

  async function nextAction() {
    if (!gameId) {
      return;
    }

    const cards = await nextCards(gameId);
    console.log(cards);

    if (cards) {
      chime?.sendMessage(
        JSON.stringify({ message: "communityCards", cards: cards })
      );
      setCommunityCards(cards);
    }
  }

  async function nextRound() {
    if (!gameId) {
      return;
    }

    await resetCards(gameId);
    chime?.sendMessage(JSON.stringify({ message: "reset" }));
    setCommunityCards([]);
  }

  async function test() {
    eventHandler({ message: "playerUpdate", player: [] });
  }

  function eventHandler(data: any): void {
    console.log("client recieved", data);
    if (!data.message) {
      return;
    }

    switch (data.message) {
      case "communityCards": {
        console.log("NEW COMMUNITY CARDS", data.cards);
        setCommunityCards(data.cards);
        break;
      }
      case "reset": {
        setCommunityCards([]);
        break;
      }
      case "newPlayer": {
        // const player = load;
        console.log("NEW PLAYER JOINED", data.playerId);
        if (data.playerId) {
          setNewPlayerId(data.playerId);
        }
        break;
      }
      case "playerDropped": {
        console.log("PLAYER LEFT", data.player);
      }
      default: {
        console.log("UNKNOWN MESSAGE TYPE");
      }
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-10">
      {player ? (
        <>
          <audio id="chime-audio" />
          <div className="z-10 w-full items-start justify-between font-mono text-sm flex">
            <div>
              {player.name}: £{player.cash}
              <video id="local"></video>
            </div>
            <form action={nextAction}>
              <button>Next</button>
            </form>
            <form action={nextRound}>
              <button>Redeal</button>
            </form>
            <form action={test}>
              <button>Test</button>
            </form>
          </div>
          <div className="players">
            {players.map((player, i) => (
              <PlayerTile
                key={i}
                id={player.id}
                name={player.name}
                cards={player.cards}
                cash={player.cash}
              ></PlayerTile>
            ))}
          </div>
          <div className="community-cards">
            {communityCards.map((item, i) => (
              <PlayingCard
                key={i}
                value={item.value}
                suit={item.suit}
              ></PlayingCard>
            ))}
          </div>
        </>
      ) : (
        <>
          {loadingPlayer ? null : (
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
          )}
        </>
      )}
      <p className="">You are in game: {gameId}</p>
    </main>
  );
}
