'use client'
import { useEffect, useState } from "react"
import { PlayingCard } from "../../components/playingCard"
import { Card } from "../../lib/cards"
import { ChimeConfig, createAttendee } from "../../lib/chime"
import { ChimeProvider } from "../../lib/chimeUtils"
import { getGame, gameState, nextCards, resetCards } from "../../lib/game"
import { Player } from "../../lib/player"

import '../../styles/table.css'
import '../../styles/playingCard.css'
import { PlayerTile } from "@/app/components/playerTile"

export default function Game({ params }: { params: { id: string } }) {
  const [gameId, setGameId] = useState<string>(params.id)
  const [chimeConfig, setChimeConfig] = useState<ChimeConfig>()
  const [meetingSession, setMeetingSession] = useState<ChimeProvider>()
  const [communityCards, setCommunityCards] = useState<Card[]>([])
  const [players, setPlayers] = useState<Player[]>([])

  useEffect(() => {
    getGame(params.id).then((game) => {
      if (!game){
        return
      }
      game.players = game.players.concat(new Player('test'))
      renderGame(game)
    })

  }, [params.id])
  
  async function renderGame(game: gameState){
    console.log('game', game)
    const attendee = await createAttendee(game.chimeConfig)

    if(!attendee){
      alert('Unable to create attendee')
      return
    }

    const meeting = new ChimeProvider(game.chimeConfig, attendee)

    if(meeting) {
      setGameId(game.id)
      setChimeConfig(game.chimeConfig)
      setMeetingSession(meeting)
      setCommunityCards(game.communityCards)
      setPlayers(game.players)
    } else {
      alert('Unable to create call session')
    }
  }

  async function nextAction() {
    if(!gameId){return}
    
    const cards = await nextCards(gameId)
    console.log(cards)

    if(cards){
      setCommunityCards(cards)
    }
  }

  async function nextRound() {
    if(!gameId){return}
    
    await resetCards(gameId)

    setCommunityCards([])
  }

  return (
  <main className="flex min-h-screen flex-col items-center justify-between p-10">
    <audio id="chime-audio" />
    <div className="z-10 w-full items-start justify-between font-mono text-sm lg:flex">
        <div className="fixed lg:static w-full flex card-deck card-back"></div>
        <form action={nextAction}><button>Next</button></form>
        <form action={nextRound}><button>Redeal</button></form>
        <div>    <video id='local'></video>

      </div>


    </div>
    <div className="players">
      {players.map((player, i) =>
        <PlayerTile key={i} id={player.id} name={player.name} cards={player.cards}></PlayerTile>
      )}
    </div>
    <div className="community-cards">
      {communityCards.map((item, i) =>
          <PlayingCard key={i} value={item.value} suit={item.suit}></PlayingCard>
      )}
    </div>
    <p className="fixed left-0 top-0 flex w-full justify border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-2 pt-2 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-2 lg:dark:bg-zinc-800/30">
        You are in game: {gameId}
      </p>

  </main>
  )
}