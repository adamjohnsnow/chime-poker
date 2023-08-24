"use client";
// packages
import { useEffect, useState } from "react";

// lib
import { Card } from "../../lib/cards";
import { createAttendee } from "../../lib/chime";
import { ChimeProvider } from "../../lib/chimeUtils";
import { getGame, gameState, nextCards, resetCards } from "../../lib/game";
import { Player, addNewPlayer } from "../../lib/player";
import { savePlayer, loadPlayer } from "../../lib/localCache";

// components
import { PlayerTile } from "../../components/playerTile";
import { PlayingCard } from "../../components/playingCard";

// styles
import "../../styles/table.css";
import "../../styles/playingCard.css";

export default function Game({ params }: { params: { id: string } }) {
  const [gameId, setGameId] = useState<string>(params.id);
  const [communityCards, setCommunityCards] = useState<Card[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [chime, setChime] = useState<ChimeProvider>();
  const [player, setPlayer] = useState<Player>();

  useEffect(() => {
    const savedPlayer = loadPlayer(params.id);
    if (savedPlayer) {
      setPlayer(savedPlayer);
    }
  }, [params.id]);

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

  useEffect(() => {
    console.log("c", players);
  }, [players]);

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
    savePlayer(params.id, myPlayer);
    setPlayer(myPlayer);
  }

  async function renderGame(game: gameState) {
    console.log("game", game);
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
      setPlayers(game.players);
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
      case "playerUpdate": {
        console.log("NEW PLAYER JOINED", data.player);
        break;
      }
      default: {
        console.log("UNKNOWN MESSAGE TYPE");
      }
    }
  }

  function addPlayer(newPlayer: Player) {
    setPlayers([...players, newPlayer]);
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
      <p className="">You are in game: {gameId}</p>
    </main>
  );
}
