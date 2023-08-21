"use client"

import { useEffect, useState } from "react";
import { startGame, GetGame, gameState }from "../lib/game";
import { ChimeConfig, createAttendee } from "../lib/chime";
import { Attendee, ConsoleLogger, DefaultDeviceController, DefaultMeetingSession, MeetingSessionConfiguration } from "amazon-chime-sdk-js";
import { ChimeProvider } from "../lib/chimeUtils";
import { renderIntoDocument } from "react-dom/test-utils";

export default function Game() {
  const [gameId, setGameId] = useState<string>()
  const [chimeConfig, setChimeConfig] = useState<ChimeConfig>()
  const [meetingSession, setMeetingSession] = useState<ChimeProvider>()

  useEffect(()=> {
    if(chimeConfig) { console.log('chime config updated') }
  }, [chimeConfig])

  useEffect(()=> {
    if(meetingSession){ console.log('meeting session updated') }
  }, [meetingSession])

  async function startNewGame() {
    const game = await startGame()
    renderGame(game)
  }

  async function joinGame(){
    const input = document.getElementById('game-id-input') as HTMLInputElement
    setGameId(input?.value)

    const game = await GetGame(input?.value)
    if (!game){
      return
    }
    renderGame(game)
  }

  async function renderGame(game: string){
    const gameDetails = JSON.parse(game) as gameState
    console.log('game', gameDetails)
    const attendee = await createAttendee(gameDetails.chimeConfig)

    if(!attendee){
      alert('Unable to create attendee')
      return
    }

    const meeting = new ChimeProvider(gameDetails.chimeConfig, attendee)

    if(meeting) {
      setGameId(gameDetails.id)
      setChimeConfig(gameDetails.chimeConfig)
      setMeetingSession(meeting)
    } else {
      alert('Unable to create call session')
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <audio id="chime-audio" />
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Chime Poker
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            By{' '}
            Adam Snow
          </a>
        </div>
      </div>


      { gameId ?
        <div>You are in game: {gameId}</div> : 
        <>
          <div><form action={startNewGame}><button>Start new game</button></form></div>
          <div>Or</div>
          <div><form action={joinGame}><input type='text' placeholder="Enter game id" id='game-id-input'></input><br /><button>Join game</button></form></div></>
         }
      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:text-left font-mono">
        A multi-player poker game with video chat. Next,js, React, AWS Chime
      </div>
    </main>
  )
}

