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
import { TurnControl } from "@/app/components/turnControl";
import { ActivityMonitor } from "@/app/components/activityMonitor";
import { useRouter } from "next/navigation";

export default function Game({ params }: { params: { id: string } }) {
  const [loadingPlayer, setLoadingPlayer] = useState<boolean>(true);
  const [gameId, setGameId] = useState<string>(params.id);
  const [communityCards, setCommunityCards] = useState<Card[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [chime, setChime] = useState<ChimeProvider>();
  const [player, setPlayer] = useState<Player>();
  const [newPlayerId, setNewPlayerId] = useState<string | null>();
  const [newBet, setNewBet] = useState<any>();
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [playerTurn, setPlayerTurn] = useState<string>();

  const router = useRouter();
  useEffect(() => {
    const savedPlayer = loadLocalPlayer(params.id);
    if (savedPlayer) {
      loadPlayer(gameId, savedPlayer.id).then((recalledPlayer) => {
        setPlayer(recalledPlayer);
        setPlayerCards(recalledPlayer?.cards || []);
      });
    }
    setLoadingPlayer(false);
  }, [params.id]);

  useEffect(() => {
    console.log(newBet);
    if (!newBet || !newBet.playerId) {
      return;
    }
    const updatedPlayers = players.slice();
    updatedPlayers.forEach((player) => {
      if (player.id === newBet.playerId) {
        player.currentBet = newBet.amount;
      }
    });
    setPlayers(updatedPlayers);
  }, [newBet]);

  useEffect(() => {
    if (
      newPlayerId &&
      newPlayerId != player?.id &&
      !players.some((player) => player.id === newPlayerId)
    ) {
      loadPlayer(gameId, newPlayerId).then((newPlayer) => {
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

  useEffect(() => {
    if (!player) {
      return;
    }
    player.cards = playerCards;
    player.folded = false;
  }, [playerCards]);

  useEffect(() => {
    if (communityCards.length === 0) {
      players.forEach((player) => {
        player.currentBet = null;
        document.getElementById(player.id)?.classList.remove("folded");
      });
    }
  }, [communityCards]);

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
      10000,
      0,
      false
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
    setPlayerCards([]);
    const newCards = await resetCards(gameId);
    newCards?.forEach((hand) => {
      if (hand.playerId === player?.id) {
        setPlayerCards(hand.cards);
      } else {
        chime?.sendPlayerMessage(
          hand.playerId,
          JSON.stringify({ message: "newCards", cards: hand.cards })
        );
      }
    });
    chime?.sendMessage(JSON.stringify({ message: "reset" }));
    setCommunityCards([]);
  }

  function eventHandler(data: any): void {
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
        break;
      }
      case "newCards": {
        console.log("NEW CARDS", data);
        setPlayerCards(data.cards);
        break;
      }
      case "playerFolded": {
        console.log("PLAYER FOLDED", data.player);
        document.getElementById(data.player)?.classList.add("folded");
        break;
      }
      case "betPlaced": {
        setNewBet({ playerId: data.playerId, amount: data.amount });
        break;
      }
      default: {
        console.log("UNKNOWN MESSAGE TYPE", data);
      }
    }
  }

  return (
    <>
      {chime ? <ActivityMonitor chime={chime} /> : null}

      <main className="flex min-h-screen flex-col items-center justify-between p-10 font-mono">
        {player ? (
          <>
            <audio id="chime-audio" />
            <div className="z-10 w-full items-start justify-between  text-sm flex">
              {player.name}: £{player.cash}
              <div className="flex">
                <video className="video-tile" id="local"></video>
                {playerCards.length != 0 ? (
                  <>
                    <PlayingCard
                      value={playerCards[0].value}
                      suit={playerCards[0].suit}
                    ></PlayingCard>
                    <PlayingCard
                      value={playerCards[1].value}
                      suit={playerCards[1].suit}
                    ></PlayingCard>
                  </>
                ) : null}
              </div>
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
            </div>
            <div className="players">
              {players.map((player, i) => (
                <PlayerTile
                  key={i}
                  id={player.id}
                  name={player.name}
                  cards={[]}
                  cash={player.cash}
                  folded={player.folded}
                  currentBet={player.currentBet}
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
    </>
  );
}
