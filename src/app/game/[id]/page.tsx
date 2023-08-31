/* eslint-disable react-hooks/exhaustive-deps */
"use client";
// packages
import { useEffect, useState } from "react";

// lib
import { Card } from "@/app/lib/cards";
import { createAttendee } from "@/app/lib/chime";
import { ChimeProvider } from "@/app/lib/chimeUtils";
import {
  getGame,
  gameState,
  nextCards,
  resetCards,
  newHand,
} from "@/app/lib/game";
import {
  Player,
  addNewPlayer,
  loadAllPlayers,
  loadPlayer,
  updatePlayer,
  updatePlayerStatus,
} from "@/app/lib/player";
import { saveLocalPlayer, loadLocalPlayer } from "@/app/lib/localCache";

// components
import { PlayerTile } from "@/app/components/playerTile";
import { PlayingCard } from "@/app/components/playingCard";

// styles
import "@/app/styles/table.css";
import "@/app/styles/playingCard.css";
import { TurnControl } from "@/app/components/turnControl";
import { ActivityMonitor } from "@/app/components/activityMonitor";
import { CommunityCards } from "@/app/components/communityCards";

export default function Game({ params }: { params: { id: string } }) {
  const [gameId, setGameId] = useState<string>(params.id);
  const [players, setPlayers] = useState<Player[]>([]);
  const [chime, setChime] = useState<ChimeProvider>();
  const [player, setPlayer] = useState<Player>();
  const [newPlayerId, setNewPlayerId] = useState<string | null>();
  const [communityCards, setCommunityCards] = useState<Card[]>([]);
  const [newBet, setNewBet] = useState<any>();
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [playerTurn, setPlayerTurn] = useState<string>();
  const [results, setResults] = useState<newHand[]>();
  const [winningHand, setWinningHand] = useState<Card[]>([]);
  const [newCardsShown, setNewCardsShown] = useState<Record<
    string,
    any
  > | null>();

  useEffect(() => {
    const savedPlayer = loadLocalPlayer(params.id);
    if (savedPlayer) {
      loadPlayer(gameId, savedPlayer.id, true).then((recalledPlayer) => {
        updatePlayerStatus(params.id, savedPlayer.id, true);
        setPlayerCards(recalledPlayer?.cards || []);
        setPlayer(recalledPlayer);
      });
    }
  }, [params.id]);

  useEffect(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player]);

  useEffect(() => {
    if (!player) {
      return;
    }
    player.cards = [];
    player.cards = playerCards;
    player.folded = false;
    updatePlayer(gameId, player);
  }, [playerCards]);

  useEffect(() => {
    if (communityCards.length === 0) {
      players.forEach((player) => {
        player.currentBet = null;
        document.getElementById(player.id)?.classList.remove("folded");
      });
    }
  }, [communityCards]);

  useEffect(() => {
    if (results) {
      console.log("RESULTS:", results);
      setWinningHand(results[0].cards);
      chime?.sendMessage({
        message: "showCards",
        cards: playerCards,
        playerId: player?.id,
      });
    }
  }, [results]);

  useEffect(() => {
    if (!newCardsShown) {
      return;
    }
    players.forEach((opponent) => {
      if (opponent.id === newCardsShown?.playerId) {
        opponent.cards = newCardsShown.cards;
      }
    });

    setNewCardsShown(null);
  }, [newCardsShown]);

  useEffect(() => {
    setTimeout(() => highlightWinningCard(), 500);
  }, [winningHand]);

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
      false,
      true
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

    const [cards, results] = await nextCards(gameId);

    if (results.length > 0) {
      setResults(results);
      chime?.sendMessage({ message: "results", results });
      return;
    }

    if (cards) {
      chime?.sendMessage({ message: "communityCards", cards: cards });
      setCommunityCards(cards);
    }
  }

  async function nextRound() {
    if (!gameId) {
      return;
    }
    resetTable();

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
    chime?.sendMessage({ message: "reset" });
  }

  function resetTable() {
    updateActivePlayers();
    const highlightedCards = document.getElementsByClassName("highlighted");
    for (let i = 0; i < highlightedCards.length; i++) {
      highlightedCards[i].classList.remove("highlighted");
    }
    setCommunityCards([]);
    setWinningHand([]);
  }
  async function updateActivePlayers() {
    const playerUpdate = await loadAllPlayers(gameId);
    setPlayers(playerUpdate.filter((opponent) => opponent.id != player?.id));
  }
  function highlightWinningCard() {
    winningHand.forEach((card) => {
      const cardElement = document.getElementById(
        "card-" + card.value + "-" + card.suit
      );
      if (cardElement) {
        cardElement.classList.add("highlighted");
      }
    });
  }

  function eventHandler(data: any): void {
    if (!data.message) {
      return;
    }

    switch (data.message) {
      case "reset": {
        console.log("RESET");
        resetTable();
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
        updateActivePlayers();
        console.log("PLAYER LEFT", data.playerId);
        break;
      }
      case "newCards": {
        console.log("NEW CARDS", data);
        setPlayerCards(data.cards);
        break;
      }
      case "showCards": {
        console.log("CARDS SHOWN", data);
        setNewCardsShown(data);
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
      case "results": {
        setResults(data.results);
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
                <video className="video-tile m-1" id="local"></video>
                {playerCards.length != 0 ? (
                  <>
                    <PlayingCard card={playerCards[0]}></PlayingCard>
                    <PlayingCard card={playerCards[1]}></PlayingCard>
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
                  cards={player.cards}
                  cash={player.cash}
                  folded={player.folded}
                  currentBet={player.currentBet}
                  active={player.active}
                ></PlayerTile>
              ))}
            </div>
            <CommunityCards
              chime={chime as ChimeProvider}
              cards={communityCards}
            />
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
    </>
  );
}
